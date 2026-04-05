'use client'

import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    socket = io(url, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    })
  }
  return socket
}

export function connectSocket(userId: number, username: string, displayName: string): Promise<Socket> {
  return new Promise((resolve) => {
    const s = getSocket()

    // If already connected, just update auth and resolve
    if (s.connected) {
      resolve(s)
      return
    }

    s.auth = { userId, username, displayName }

    const onConnect = () => {
      s.off('connect', onConnect)
      console.log('[Socket] Connected:', s.id)
      resolve(s)
    }

    s.on('connect', onConnect)

    // If connection fails, still resolve so the app doesn't hang
    const onError = () => {
      s.off('connect_error', onError)
      console.warn('[Socket] Connection failed, will retry')
      resolve(s)
    }
    s.on('connect_error', onError)

    s.connect()

    // Safety timeout
    setTimeout(() => {
      s.off('connect', onConnect)
      s.off('connect_error', onError)
      resolve(s)
    }, 5000)
  })
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function isSocketConnected(): boolean {
  return socket?.connected || false
}

// Wait for socket to be connected before emitting
export function emitWhenReady(event: string, data: unknown) {
  const s = getSocket()
  if (s.connected) {
    s.emit(event, data)
  } else {
    // Wait for connection then emit
    const handler = () => {
      s.off('connect', handler)
      s.emit(event, data)
    }
    s.on('connect', handler)
    // Timeout after 5s
    setTimeout(() => s.off('connect', handler), 5000)
  }
}

export interface SocketPlayer {
  userId: number
  username: string
  displayName: string
  x: number
  y: number
  direction: string
  isWalking: boolean
  character: {
    gender: string
    skinTone: string
    hairStyle: string
    hairColor: string
    shirtStyle: string
    shirtColor: string
    pantsStyle: string
    pantsColor: string
    hatStyle: string | null
    accessory: string | null
  }
}

export interface SocketChatMessage {
  id: number
  userId: number
  username: string
  displayName: string
  message: string
  messageType: string
  createdAt: string
}
