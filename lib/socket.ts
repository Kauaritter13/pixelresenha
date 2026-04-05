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
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })
  }
  return socket
}

export function connectSocket(userId: number, username: string, displayName: string): Socket {
  const s = getSocket()
  if (!s.connected) {
    s.auth = { userId, username, displayName }
    s.connect()
  }
  return s
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Socket event types
export interface ServerToClientEvents {
  'player:joined': (data: SocketPlayer) => void
  'player:left': (data: { userId: number }) => void
  'player:moved': (data: { userId: number; x: number; y: number; direction: string; isWalking: boolean }) => void
  'player:stopped': (data: { userId: number }) => void
  'chat:message': (data: SocketChatMessage) => void
  'room:state': (data: { participants: SocketPlayer[] }) => void
  'voice:offer': (data: { from: number; offer: RTCSessionDescriptionInit }) => void
  'voice:answer': (data: { from: number; answer: RTCSessionDescriptionInit }) => void
  'voice:ice-candidate': (data: { from: number; candidate: RTCIceCandidateInit }) => void
  'voice:speaking': (data: { userId: number; isSpeaking: boolean }) => void
  'voice:user-joined': (data: { userId: number }) => void
  'voice:user-left': (data: { userId: number }) => void
}

export interface ClientToServerEvents {
  'room:join': (data: { roomId: number }) => void
  'room:leave': () => void
  'player:move': (data: { x: number; y: number; direction: string; isWalking: boolean }) => void
  'player:stop': () => void
  'chat:send': (data: { roomId: number; message: string; messageType?: string }) => void
  'voice:join': (data: { roomId: number }) => void
  'voice:leave': () => void
  'voice:offer': (data: { to: number; offer: RTCSessionDescriptionInit }) => void
  'voice:answer': (data: { to: number; answer: RTCSessionDescriptionInit }) => void
  'voice:ice-candidate': (data: { to: number; candidate: RTCIceCandidateInit }) => void
  'voice:speaking': (data: { isSpeaking: boolean }) => void
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
