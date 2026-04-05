import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'

dotenv.config({ path: '../.env.local' })
dotenv.config({ path: '.env' })

const app = express()
const httpServer = createServer(app)

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

const io = new Server(httpServer, {
  cors: {
    origin: [FRONTEND_URL, 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

app.use(cors({ origin: [FRONTEND_URL, 'http://localhost:3000'], credentials: true }))
app.use(express.json())

const sql = neon(process.env.DATABASE_URL!)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Track connected users: socketId -> { userId, roomId, username, displayName, character, x, y, direction, isWalking }
interface ConnectedUser {
  userId: number
  roomId: number | null
  username: string
  displayName: string
  character: Record<string, unknown>
  x: number
  y: number
  direction: string
  isWalking: boolean
  voiceRoom: number | null
}

const connectedUsers = new Map<string, ConnectedUser>()

// Helper: get all users in a room
function getRoomUsers(roomId: number) {
  const users: Array<ConnectedUser & { socketId: string }> = []
  connectedUsers.forEach((user, socketId) => {
    if (user.roomId === roomId) {
      users.push({ ...user, socketId })
    }
  })
  return users
}

io.on('connection', (socket) => {
  const { userId, username, displayName } = socket.handshake.auth as {
    userId: number
    username: string
    displayName: string
  }

  console.log(`User connected: ${username} (${userId}) [${socket.id}]`)

  connectedUsers.set(socket.id, {
    userId,
    roomId: null,
    username,
    displayName: displayName || username,
    character: {},
    x: 300,
    y: 250,
    direction: 'down',
    isWalking: false,
    voiceRoom: null,
  })

  // Join a room
  socket.on('room:join', async ({ roomId }: { roomId: number }) => {
    const user = connectedUsers.get(socket.id)
    if (!user) return

    // Leave previous room if any
    if (user.roomId) {
      socket.leave(`room:${user.roomId}`)
      io.to(`room:${user.roomId}`).emit('player:left', { userId: user.userId })
    }

    // Load character from DB
    try {
      const chars = await sql`
        SELECT * FROM characters WHERE user_id = ${userId}
      `
      if (chars.length > 0) {
        const c = chars[0]
        user.character = {
          gender: c.gender || 'other',
          skinTone: c.skin_tone || c.skin_color || '#FFD5B5',
          hairStyle: c.hair_style || 'short',
          hairColor: c.hair_color || '#4A3728',
          shirtStyle: c.shirt_style || 'tshirt',
          shirtColor: c.shirt_color || '#3B82F6',
          pantsStyle: c.pants_style || 'jeans',
          pantsColor: c.pants_color || '#1E3A5F',
          hatStyle: (c.hat && c.hat !== 'none') ? c.hat : null,
          accessory: (c.accessory && c.accessory !== 'none') ? c.accessory : null,
        }
      }

      // Load position from DB
      const participants = await sql`
        SELECT position_x, position_y, direction FROM room_participants
        WHERE room_id = ${roomId} AND user_id = ${userId}
      `
      if (participants.length > 0) {
        user.x = participants[0].position_x || 300
        user.y = participants[0].position_y || 250
        user.direction = participants[0].direction || 'down'
      }
    } catch (err) {
      console.error('Error loading character:', err)
    }

    user.roomId = roomId
    socket.join(`room:${roomId}`)

    // Notify others
    io.to(`room:${roomId}`).emit('player:joined', {
      userId: user.userId,
      username: user.username,
      displayName: user.displayName,
      x: user.x,
      y: user.y,
      direction: user.direction,
      isWalking: false,
      character: user.character,
    })

    // Send current room state to the new player
    const roomUsers = getRoomUsers(roomId)
    socket.emit('room:state', {
      participants: roomUsers.map(u => ({
        userId: u.userId,
        username: u.username,
        displayName: u.displayName,
        x: u.x,
        y: u.y,
        direction: u.direction,
        isWalking: u.isWalking,
        character: u.character,
      })),
    })
  })

  // Leave room
  socket.on('room:leave', () => {
    const user = connectedUsers.get(socket.id)
    if (!user || !user.roomId) return

    const roomId = user.roomId
    socket.leave(`room:${roomId}`)
    io.to(`room:${roomId}`).emit('player:left', { userId: user.userId })
    user.roomId = null
  })

  // Player movement
  socket.on('player:move', ({ x, y, direction, isWalking }: { x: number; y: number; direction: string; isWalking: boolean }) => {
    const user = connectedUsers.get(socket.id)
    if (!user || !user.roomId) return

    user.x = x
    user.y = y
    user.direction = direction
    user.isWalking = isWalking

    // Broadcast to others in the room
    socket.to(`room:${user.roomId}`).emit('player:moved', {
      userId: user.userId,
      x, y, direction, isWalking,
    })
  })

  // Player stopped moving
  socket.on('player:stop', () => {
    const user = connectedUsers.get(socket.id)
    if (!user || !user.roomId) return

    user.isWalking = false

    socket.to(`room:${user.roomId}`).emit('player:stopped', {
      userId: user.userId,
    })

    // Persist position to DB (throttled - only on stop)
    sql`
      UPDATE room_participants SET position_x = ${user.x}, position_y = ${user.y}, direction = ${user.direction}
      WHERE room_id = ${user.roomId} AND user_id = ${user.userId}
    `.catch(err => console.error('Error saving position:', err))
  })

  // Chat message
  socket.on('chat:send', async ({ roomId, message, messageType }: { roomId: number; message: string; messageType?: string }) => {
    const user = connectedUsers.get(socket.id)
    if (!user) return

    try {
      // Persist to DB
      const result = await sql`
        INSERT INTO chat_messages (room_id, user_id, message, message_type)
        VALUES (${roomId}, ${user.userId}, ${message}, ${messageType || 'text'})
        RETURNING id, created_at
      `

      const msg = {
        id: result[0].id,
        userId: user.userId,
        username: user.username,
        displayName: user.displayName,
        message,
        messageType: messageType || 'text',
        createdAt: result[0].created_at,
      }

      // Broadcast to everyone in the room (including sender)
      io.to(`room:${roomId}`).emit('chat:message', msg)
    } catch (err) {
      console.error('Error saving message:', err)
    }
  })

  // Voice chat signaling
  socket.on('voice:join', ({ roomId }: { roomId: number }) => {
    const user = connectedUsers.get(socket.id)
    if (!user) return

    user.voiceRoom = roomId
    socket.join(`voice:${roomId}`)

    // Notify others in voice room
    socket.to(`voice:${roomId}`).emit('voice:user-joined', { userId: user.userId })
  })

  socket.on('voice:leave', () => {
    const user = connectedUsers.get(socket.id)
    if (!user || !user.voiceRoom) return

    const voiceRoom = user.voiceRoom
    socket.leave(`voice:${voiceRoom}`)
    socket.to(`voice:${voiceRoom}`).emit('voice:user-left', { userId: user.userId })
    user.voiceRoom = null
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket.on('voice:offer', ({ to, offer }: { to: number; offer: any }) => {
    // Find socket of target user
    connectedUsers.forEach((u, sid) => {
      if (u.userId === to) {
        const user = connectedUsers.get(socket.id)
        io.to(sid).emit('voice:offer', { from: user?.userId || 0, offer })
      }
    })
  })

  socket.on('voice:answer', ({ to, answer }: { to: number; answer: any }) => {
    connectedUsers.forEach((u, sid) => {
      if (u.userId === to) {
        const user = connectedUsers.get(socket.id)
        io.to(sid).emit('voice:answer', { from: user?.userId || 0, answer })
      }
    })
  })

  socket.on('voice:ice-candidate', ({ to, candidate }: { to: number; candidate: any }) => {
    connectedUsers.forEach((u, sid) => {
      if (u.userId === to) {
        const user = connectedUsers.get(socket.id)
        io.to(sid).emit('voice:ice-candidate', { from: user?.userId || 0, candidate })
      }
    })
  })

  socket.on('voice:speaking', ({ isSpeaking }: { isSpeaking: boolean }) => {
    const user = connectedUsers.get(socket.id)
    if (!user || !user.roomId) return

    io.to(`room:${user.roomId}`).emit('voice:speaking', {
      userId: user.userId,
      isSpeaking,
    })
  })

  // Disconnect
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id)
    if (user) {
      console.log(`User disconnected: ${user.username} (${user.userId})`)

      if (user.roomId) {
        io.to(`room:${user.roomId}`).emit('player:left', { userId: user.userId })
      }

      if (user.voiceRoom) {
        io.to(`voice:${user.voiceRoom}`).emit('voice:user-left', { userId: user.userId })
      }

      connectedUsers.delete(socket.id)
    }
  })
})

const PORT = parseInt(process.env.PORT || '3001', 10)
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`PixelResenha WebSocket server running on port ${PORT}`)
})
