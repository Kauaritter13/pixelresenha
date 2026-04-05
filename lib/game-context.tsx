'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { apiLogin, apiRegister, apiLogout, apiGetMe, apiListRooms, apiMyRooms, apiCreateRoom, apiJoinRoom, apiLeaveRoom, apiGetMessages, apiUpdateCharacter } from './api'
import { connectSocket, disconnectSocket, getSocket, emitWhenReady } from './socket'
import type { ApiCharacterInput } from './api'
import type { SocketPlayer, SocketChatMessage } from './socket'

// Character customization type (used by UI components)
export interface CharacterCustomization {
  name: string
  gender: 'male' | 'female' | 'other'
  skinTone: string
  hairStyle: string
  hairColor: string
  eyeColor?: string
  shirtStyle: string
  shirtColor: string
  pantsStyle: string
  pantsColor: string
  shoeStyle?: string
  hatStyle: string | null
  accessory: string | null
}

export interface User {
  id: number
  email: string
  username: string
  displayName: string
  character: CharacterCustomization
  status: 'online' | 'away' | 'busy' | 'offline'
  activity: string | null
  customStatus: string | null
}

export interface RoomParticipant {
  id: number
  username: string
  displayName: string
  character: CharacterCustomization
  position: { x: number; y: number }
  isWalking: boolean
  direction: 'left' | 'right' | 'up' | 'down'
  isSpeaking: boolean
  isMuted: boolean
}

export interface RoomFurniture {
  id: string
  type: string
  position: { x: number; y: number }
  rotation: number
}

export interface Room {
  id: number
  code: string
  name: string
  ownerId: number
  ownerName: string
  maxParticipants: number
  participants: RoomParticipant[]
  floorStyle: string
  wallStyle: string
  furniture: RoomFurniture[]
  isPublic: boolean
  createdAt: Date
}

export interface ChatMessage {
  id: number | string
  senderId: number | string
  senderName: string
  content: string
  timestamp: Date
  type: 'text' | 'system' | 'emote'
}

export interface PublicRoom {
  id: number
  code: string
  name: string
  ownerName: string
  playerCount: number
  maxPlayers: number
}

interface GameState {
  user: User | null
  currentRoom: Room | null
  chatMessages: ChatMessage[]
  publicRooms: PublicRoom[]
  myRooms: PublicRoom[]
  isLoading: boolean
  audioSettings: {
    masterVolume: number
    voiceVolume: number
    musicVolume: number
    sfxVolume: number
    micEnabled: boolean
    speakerEnabled: boolean
  }
}

interface GameContextType {
  state: GameState
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  checkSession: () => Promise<boolean>
  updateCharacter: (character: CharacterCustomization) => Promise<void>
  createRoom: (name: string, maxParticipants: number, isPublic: boolean) => Promise<Room | null>
  joinRoom: (code: string) => Promise<Room | null>
  leaveRoom: () => Promise<void>
  sendMessage: (content: string, type?: 'text' | 'emote') => void
  moveCharacter: (x: number, y: number, direction: string, isWalking: boolean) => void
  stopCharacter: () => void
  updateAudioSettings: (settings: Partial<GameState['audioSettings']>) => void
  updateRoomDecor: (floorStyle: string, wallStyle: string) => void
  addFurniture: (furniture: Omit<RoomFurniture, 'id'>) => void
  removeFurniture: (id: string) => void
  fetchPublicRooms: () => Promise<void>
  fetchMyRooms: () => Promise<void>
  setSpeaking: (userId: number, isSpeaking: boolean) => void
  setActivity: (activity: string | null, customStatus: string | null) => void
}

interface RegisterData {
  email: string
  username: string
  password: string
  displayName: string
  character: CharacterCustomization
}

const defaultCharacter: CharacterCustomization = {
  name: '',
  gender: 'other',
  skinTone: '#F5D0C5',
  hairStyle: 'short',
  hairColor: '#4A3728',
  shirtStyle: 'tshirt',
  shirtColor: '#4CAF50',
  pantsStyle: 'jeans',
  pantsColor: '#1E3A5F',
  hatStyle: null,
  accessory: null,
}

const defaultAudioSettings = {
  masterVolume: 80,
  voiceVolume: 100,
  musicVolume: 50,
  sfxVolume: 70,
  micEnabled: true,
  speakerEnabled: true,
}

const GameContext = createContext<GameContextType | undefined>(undefined)

function apiCharToUI(c: ApiCharacterInput | null, name: string = ''): CharacterCustomization {
  if (!c) return { ...defaultCharacter, name }
  return {
    name,
    gender: (c.gender as 'male' | 'female' | 'other') || 'other',
    skinTone: c.skinTone || '#F5D0C5',
    hairStyle: c.hairStyle || 'short',
    hairColor: c.hairColor || '#4A3728',
    shirtStyle: c.shirtStyle || 'tshirt',
    shirtColor: c.shirtColor || '#4CAF50',
    pantsStyle: c.pantsStyle || 'jeans',
    pantsColor: c.pantsColor || '#1E3A5F',
    hatStyle: c.hatStyle || null,
    accessory: c.accessory || null,
  }
}

function uiCharToApi(c: CharacterCustomization): ApiCharacterInput {
  return {
    gender: c.gender,
    skinTone: c.skinTone,
    hairStyle: c.hairStyle,
    hairColor: c.hairColor,
    shirtStyle: c.shirtStyle,
    shirtColor: c.shirtColor,
    pantsStyle: c.pantsStyle,
    pantsColor: c.pantsColor,
    hatStyle: c.hatStyle,
    accessory: c.accessory,
  }
}

function socketPlayerToParticipant(p: SocketPlayer): RoomParticipant {
  return {
    id: p.userId,
    username: p.username,
    displayName: p.displayName || p.username,
    character: {
      name: p.displayName || p.username,
      gender: (p.character.gender as 'male' | 'female' | 'other') || 'other',
      skinTone: p.character.skinTone || '#F5D0C5',
      hairStyle: p.character.hairStyle || 'short',
      hairColor: p.character.hairColor || '#4A3728',
      shirtStyle: p.character.shirtStyle || 'tshirt',
      shirtColor: p.character.shirtColor || '#4CAF50',
      pantsStyle: p.character.pantsStyle || 'jeans',
      pantsColor: p.character.pantsColor || '#1E3A5F',
      hatStyle: p.character.hatStyle || null,
      accessory: p.character.accessory || null,
    },
    position: { x: p.x, y: p.y },
    isWalking: p.isWalking,
    direction: (p.direction as 'left' | 'right' | 'up' | 'down') || 'down',
    isSpeaking: false,
    isMuted: false,
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>({
    user: null,
    currentRoom: null,
    chatMessages: [],
    publicRooms: [],
    myRooms: [],
    isLoading: true,
    audioSettings: defaultAudioSettings,
  })

  const socketSetupRef = useRef(false)
  const currentRoomIdRef = useRef<number | null>(null)

  // Setup socket event listeners when user joins a room
  const setupSocketListeners = useCallback(() => {
    if (socketSetupRef.current) return
    socketSetupRef.current = true

    const socket = getSocket()

    // Handle reconnection - re-join the room automatically
    socket.on('connect', () => {
      console.log('[Socket] Connected/Reconnected')
      if (currentRoomIdRef.current) {
        console.log('[Socket] Re-joining room', currentRoomIdRef.current)
        socket.emit('room:join', { roomId: currentRoomIdRef.current })
      }
    })

    socket.on('player:joined', (data: SocketPlayer) => {
      setState(prev => {
        if (!prev.currentRoom) return prev
        // Update if exists, add if new
        const exists = prev.currentRoom.participants.some(p => p.id === data.userId)
        if (exists) {
          return {
            ...prev,
            currentRoom: {
              ...prev.currentRoom,
              participants: prev.currentRoom.participants.map(p =>
                p.id === data.userId ? socketPlayerToParticipant(data) : p
              ),
            },
          }
        }
        return {
          ...prev,
          currentRoom: {
            ...prev.currentRoom,
            participants: [...prev.currentRoom.participants, socketPlayerToParticipant(data)],
          },
          chatMessages: [...prev.chatMessages, {
            id: `sys-${Date.now()}`,
            senderId: 'system',
            senderName: 'Sistema',
            content: `${data.displayName || data.username} entrou na sala!`,
            timestamp: new Date(),
            type: 'system' as const,
          }],
        }
      })
    })

    socket.on('player:left', ({ userId }: { userId: number }) => {
      setState(prev => {
        if (!prev.currentRoom) return prev
        const leaving = prev.currentRoom.participants.find(p => p.id === userId)
        return {
          ...prev,
          currentRoom: {
            ...prev.currentRoom,
            participants: prev.currentRoom.participants.filter(p => p.id !== userId),
          },
          chatMessages: leaving ? [...prev.chatMessages, {
            id: `sys-${Date.now()}`,
            senderId: 'system',
            senderName: 'Sistema',
            content: `${leaving.displayName} saiu da sala`,
            timestamp: new Date(),
            type: 'system' as const,
          }] : prev.chatMessages,
        }
      })
    })

    socket.on('player:moved', ({ userId, x, y, direction, isWalking }) => {
      setState(prev => {
        if (!prev.currentRoom) return prev
        return {
          ...prev,
          currentRoom: {
            ...prev.currentRoom,
            participants: prev.currentRoom.participants.map(p =>
              p.id === userId
                ? { ...p, position: { x, y }, direction: direction as 'left' | 'right' | 'up' | 'down', isWalking }
                : p
            ),
          },
        }
      })
    })

    socket.on('player:stopped', ({ userId }) => {
      setState(prev => {
        if (!prev.currentRoom) return prev
        return {
          ...prev,
          currentRoom: {
            ...prev.currentRoom,
            participants: prev.currentRoom.participants.map(p =>
              p.id === userId ? { ...p, isWalking: false } : p
            ),
          },
        }
      })
    })

    socket.on('chat:message', (data: SocketChatMessage) => {
      setState(prev => {
        // Prevent duplicate messages
        if (prev.chatMessages.some(m => m.id === data.id)) return prev
        return {
          ...prev,
          chatMessages: [...prev.chatMessages, {
            id: data.id,
            senderId: data.userId,
            senderName: data.displayName || data.username,
            content: data.message,
            timestamp: new Date(data.createdAt),
            type: (data.messageType as 'text' | 'emote') || 'text',
          }],
        }
      })
    })

    // room:state is the authoritative state from server - always trust it
    socket.on('room:state', ({ participants }) => {
      setState(prev => {
        if (!prev.currentRoom) return prev
        return {
          ...prev,
          currentRoom: {
            ...prev.currentRoom,
            participants: participants.map(socketPlayerToParticipant),
          },
        }
      })
    })

    socket.on('voice:speaking', ({ userId, isSpeaking }) => {
      setState(prev => {
        if (!prev.currentRoom) return prev
        return {
          ...prev,
          currentRoom: {
            ...prev.currentRoom,
            participants: prev.currentRoom.participants.map(p =>
              p.id === userId ? { ...p, isSpeaking } : p
            ),
          },
        }
      })
    })
  }, [])

  const cleanupSocketListeners = useCallback(() => {
    socketSetupRef.current = false
    currentRoomIdRef.current = null
    const socket = getSocket()
    socket.off('connect')
    socket.off('player:joined')
    socket.off('player:left')
    socket.off('player:moved')
    socket.off('player:stopped')
    socket.off('chat:message')
    socket.off('room:state')
    socket.off('voice:speaking')
  }, [])

  // Check session on mount
  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const { user: apiUser } = await apiGetMe()
      if (apiUser) {
        const user: User = {
          id: apiUser.id,
          email: apiUser.email,
          username: apiUser.username,
          displayName: apiUser.displayName || apiUser.username,
          character: apiCharToUI(apiUser.character, apiUser.displayName || apiUser.username),
          status: 'online',
          activity: null,
          customStatus: null,
        }
        setState(prev => ({ ...prev, user, isLoading: false }))

        // Connect socket
        await connectSocket(user.id, user.username, user.displayName)
        return true
      }
    } catch {
      // Session invalid
    }
    setState(prev => ({ ...prev, isLoading: false }))
    return false
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: apiUser } = await apiLogin(email, password)
      const user: User = {
        id: apiUser.id,
        email: apiUser.email,
        username: apiUser.username,
        displayName: apiUser.displayName || apiUser.username,
        character: apiCharToUI(apiUser.character, apiUser.displayName || apiUser.username),
        status: 'online',
      }
      setState(prev => ({ ...prev, user }))
      connectSocket(user.id, user.username, user.displayName)
      return true
    } catch {
      return false
    }
  }, [])

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      const { user: apiUser } = await apiRegister({
        username: data.username,
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        character: uiCharToApi(data.character),
      })
      const user: User = {
        id: apiUser.id,
        email: apiUser.email,
        username: apiUser.username,
        displayName: apiUser.displayName || apiUser.username,
        character: apiCharToUI(apiUser.character, apiUser.displayName || apiUser.username),
        status: 'online',
      }
      setState(prev => ({ ...prev, user }))
      connectSocket(user.id, user.username, user.displayName)
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // ignore
    }
    cleanupSocketListeners()
    disconnectSocket()
    setState(prev => ({
      ...prev,
      user: null,
      currentRoom: null,
      chatMessages: [],
    }))
  }, [cleanupSocketListeners])

  const updateCharacter = useCallback(async (character: CharacterCustomization) => {
    try {
      await apiUpdateCharacter(uiCharToApi(character))
    } catch {
      // continue with local update even if API fails
    }
    setState(prev => {
      if (!prev.user) return prev
      return { ...prev, user: { ...prev.user, character } }
    })
  }, [])

  const createRoom = useCallback(async (name: string, maxParticipants: number, isPublic: boolean): Promise<Room | null> => {
    try {
      const { room: apiRoom } = await apiCreateRoom({
        name,
        maxPlayers: maxParticipants,
        isPrivate: !isPublic,
      })

      const room: Room = {
        id: apiRoom.id,
        code: apiRoom.code,
        name: apiRoom.name,
        ownerId: apiRoom.ownerId,
        ownerName: apiRoom.ownerName,
        maxParticipants: apiRoom.maxPlayers,
        participants: state.user ? [{
          id: state.user.id,
          username: state.user.username,
          displayName: state.user.displayName,
          character: state.user.character,
          position: { x: 300, y: 250 },
          isWalking: false,
          direction: 'down',
          isSpeaking: false,
          isMuted: false,
        }] : [],
        floorStyle: apiRoom.floorType || 'wood',
        wallStyle: apiRoom.wallType || 'brick',
        furniture: [],
        isPublic,
        createdAt: new Date(apiRoom.createdAt),
      }

      // Setup listeners BEFORE setting state so events are captured
      setupSocketListeners()
      currentRoomIdRef.current = room.id

      setState(prev => ({
        ...prev,
        currentRoom: room,
        chatMessages: [{
          id: `sys-${Date.now()}`,
          senderId: 'system',
          senderName: 'Sistema',
          content: `Sala "${name}" criada! Código: ${room.code}`,
          timestamp: new Date(),
          type: 'system',
        }],
      }))

      // Use emitWhenReady to handle socket not yet connected
      emitWhenReady('room:join', { roomId: room.id })

      return room
    } catch (err) {
      console.error('Error creating room:', err)
      return null
    }
  }, [state.user, setupSocketListeners])

  const joinRoom = useCallback(async (code: string): Promise<Room | null> => {
    try {
      const { room: apiRoom } = await apiJoinRoom(code)

      // Load chat history
      let messages: ChatMessage[] = []
      try {
        const { messages: apiMsgs } = await apiGetMessages(String(apiRoom.id))
        messages = apiMsgs.map(m => ({
          id: m.id,
          senderId: m.userId,
          senderName: m.displayName || m.username,
          content: m.message,
          timestamp: new Date(m.createdAt),
          type: (m.messageType as 'text' | 'emote') || 'text',
        }))
      } catch {
        // ignore
      }

      const room: Room = {
        id: apiRoom.id,
        code: apiRoom.code,
        name: apiRoom.name,
        ownerId: apiRoom.ownerId,
        ownerName: apiRoom.ownerName,
        maxParticipants: apiRoom.maxPlayers,
        participants: apiRoom.participants.map((p: { id: number; username: string; displayName: string; position: { x: number; y: number }; direction: string; character: ApiCharacterInput }) => ({
          id: p.id,
          username: p.username,
          displayName: p.displayName || p.username,
          character: apiCharToUI(p.character, p.displayName || p.username),
          position: p.position,
          isWalking: false,
          direction: (p.direction as 'left' | 'right' | 'up' | 'down') || 'down',
          isSpeaking: false,
          isMuted: false,
        })),
        floorStyle: apiRoom.floorType || 'wood',
        wallStyle: apiRoom.wallType || 'brick',
        furniture: apiRoom.furniture.map((f: { id: number; type: string; position: { x: number; y: number }; rotation: number }) => ({
          id: String(f.id),
          type: f.type,
          position: f.position,
          rotation: f.rotation,
        })),
        isPublic: !apiRoom.isPrivate,
        createdAt: new Date(apiRoom.createdAt),
      }

      setState(prev => ({
        ...prev,
        currentRoom: room,
        chatMessages: [
          {
            id: `sys-${Date.now()}`,
            senderId: 'system',
            senderName: 'Sistema',
            content: `${prev.user?.displayName} entrou na sala!`,
            timestamp: new Date(),
            type: 'system',
          },
          ...messages,
        ],
      }))

      // Setup listeners BEFORE setting state, then join socket room
      setupSocketListeners()
      currentRoomIdRef.current = room.id
      emitWhenReady('room:join', { roomId: room.id })

      return room
    } catch (err) {
      console.error('Error joining room:', err)
      return null
    }
  }, [setupSocketListeners])

  const leaveRoom = useCallback(async () => {
    const roomId = state.currentRoom?.id
    if (roomId) {
      try {
        await apiLeaveRoom(String(roomId))
      } catch {
        // ignore
      }
      const socket = getSocket()
      socket.emit('room:leave')
    }
    cleanupSocketListeners()
    setState(prev => ({ ...prev, currentRoom: null, chatMessages: [] }))
  }, [state.currentRoom, cleanupSocketListeners])

  const sendMessage = useCallback((content: string, type: 'text' | 'emote' = 'text') => {
    if (!state.user || !state.currentRoom || !content.trim()) return

    emitWhenReady('chat:send', {
      roomId: state.currentRoom.id,
      message: content.trim(),
      messageType: type,
    })
  }, [state.user, state.currentRoom])

  const moveCharacter = useCallback((x: number, y: number, direction: string, isWalking: boolean) => {
    setState(prev => {
      if (!prev.currentRoom || !prev.user) return prev
      return {
        ...prev,
        currentRoom: {
          ...prev.currentRoom,
          participants: prev.currentRoom.participants.map(p =>
            p.id === prev.user?.id
              ? { ...p, position: { x, y }, direction: direction as 'left' | 'right' | 'up' | 'down', isWalking }
              : p
          ),
        },
      }
    })

    // Broadcast via socket (only if connected, don't queue movement)
    try {
      const socket = getSocket()
      if (socket.connected) {
        socket.emit('player:move', { x, y, direction, isWalking })
      }
    } catch { /* ignore */ }
  }, [])

  const stopCharacter = useCallback(() => {
    setState(prev => {
      if (!prev.currentRoom || !prev.user) return prev
      return {
        ...prev,
        currentRoom: {
          ...prev.currentRoom,
          participants: prev.currentRoom.participants.map(p =>
            p.id === prev.user?.id ? { ...p, isWalking: false } : p
          ),
        },
      }
    })

    try {
      const socket = getSocket()
      if (socket.connected) {
        socket.emit('player:stop')
      }
    } catch { /* ignore */ }
  }, [])

  const updateAudioSettings = useCallback((settings: Partial<GameState['audioSettings']>) => {
    setState(prev => ({
      ...prev,
      audioSettings: { ...prev.audioSettings, ...settings },
    }))
  }, [])

  const updateRoomDecor = useCallback((floorStyle: string, wallStyle: string) => {
    setState(prev => {
      if (!prev.currentRoom) return prev
      return {
        ...prev,
        currentRoom: { ...prev.currentRoom, floorStyle, wallStyle },
      }
    })
  }, [])

  const addFurniture = useCallback((furniture: Omit<RoomFurniture, 'id'>) => {
    setState(prev => {
      if (!prev.currentRoom) return prev
      const newFurniture: RoomFurniture = {
        ...furniture,
        id: `furniture-${Date.now()}`,
      }
      return {
        ...prev,
        currentRoom: {
          ...prev.currentRoom,
          furniture: [...prev.currentRoom.furniture, newFurniture],
        },
      }
    })
  }, [])

  const removeFurniture = useCallback((id: string) => {
    setState(prev => {
      if (!prev.currentRoom) return prev
      return {
        ...prev,
        currentRoom: {
          ...prev.currentRoom,
          furniture: prev.currentRoom.furniture.filter(f => f.id !== id),
        },
      }
    })
  }, [])

  const fetchPublicRooms = useCallback(async () => {
    try {
      const { rooms } = await apiListRooms()
      setState(prev => ({
        ...prev,
        publicRooms: rooms.map(r => ({
          id: r.id,
          code: r.code,
          name: r.name,
          ownerName: r.ownerName,
          playerCount: r.playerCount,
          maxPlayers: r.maxPlayers,
        })),
      }))
    } catch {
      // ignore
    }
  }, [])

  const fetchMyRooms = useCallback(async () => {
    try {
      const { rooms } = await apiMyRooms()
      setState(prev => ({
        ...prev,
        myRooms: rooms.map(r => ({
          id: r.id,
          code: r.code,
          name: r.name,
          ownerName: 'Você',
          playerCount: r.playerCount,
          maxPlayers: r.maxPlayers,
        })),
      }))
    } catch {
      // ignore
    }
  }, [])

  const setSpeaking = useCallback((userId: number, isSpeaking: boolean) => {
    setState(prev => {
      if (!prev.currentRoom) return prev
      return {
        ...prev,
        currentRoom: {
          ...prev.currentRoom,
          participants: prev.currentRoom.participants.map(p =>
            p.id === userId ? { ...p, isSpeaking } : p
          ),
        },
      }
    })
  }, [])

  const setActivity = useCallback((activity: string | null, customStatus: string | null) => {
    setState(prev => {
      if (!prev.user) return prev
      return { ...prev, user: { ...prev.user, activity, customStatus } }
    })
  }, [])

  // Auto-check session on mount
  useEffect(() => {
    checkSession()
  }, [checkSession])

  // Detect tab visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setState(prev => {
          if (!prev.user) return prev
          return { ...prev, user: { ...prev.user, status: 'away' } }
        })
      } else {
        setState(prev => {
          if (!prev.user) return prev
          return { ...prev, user: { ...prev.user, status: 'online' } }
        })
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  return (
    <GameContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        checkSession,
        updateCharacter,
        createRoom,
        joinRoom,
        leaveRoom,
        sendMessage,
        moveCharacter,
        stopCharacter,
        updateAudioSettings,
        updateRoomDecor,
        addFurniture,
        removeFurniture,
        fetchPublicRooms,
        fetchMyRooms,
        setSpeaking,
        setActivity,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
