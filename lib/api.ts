// API client for all REST calls to Next.js API routes

const API_BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`)
  }

  return data
}

// Auth
export async function apiLogin(email: string, password: string) {
  return request<{ user: ApiUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function apiRegister(data: {
  username: string
  email: string
  password: string
  displayName: string
  character: ApiCharacterInput
}) {
  return request<{ user: ApiUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiLogout() {
  return request<{ success: boolean }>('/auth/logout', { method: 'POST' })
}

export async function apiGetMe() {
  return request<{ user: ApiUser | null }>('/auth/me')
}

// Rooms
export async function apiListRooms() {
  return request<{ rooms: ApiRoom[] }>('/rooms')
}

export async function apiMyRooms() {
  return request<{ rooms: ApiRoom[] }>('/rooms/mine')
}

export async function apiCreateRoom(data: {
  name: string
  maxPlayers: number
  isPrivate: boolean
  floorType?: string
  wallType?: string
}) {
  return request<{ room: ApiRoom }>('/rooms', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiJoinRoom(code: string) {
  return request<{ room: ApiRoomFull }>('/rooms/join', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export async function apiLeaveRoom(roomId: string) {
  return request<{ success: boolean }>('/rooms/leave', {
    method: 'POST',
    body: JSON.stringify({ roomId }),
  })
}

// Chat
export async function apiGetMessages(roomId: string) {
  return request<{ messages: ApiMessage[] }>(`/rooms/${roomId}/chat`)
}

export async function apiSendMessage(roomId: string, message: string) {
  return request<{ message: ApiMessage }>(`/rooms/${roomId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

// Character
export async function apiUpdateCharacter(character: ApiCharacterInput) {
  return request<{ character: ApiCharacterInput }>('/auth/character', {
    method: 'PUT',
    body: JSON.stringify({ character }),
  })
}

// Types
export interface ApiCharacterInput {
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

export interface ApiUser {
  id: number
  username: string
  email: string
  displayName: string | null
  character: ApiCharacterInput | null
}

export interface ApiRoom {
  id: number
  code: string
  name: string
  ownerId: number
  ownerName: string
  maxPlayers: number
  isPrivate: boolean
  floorType: string
  wallType: string
  playerCount: number
  createdAt: string
}

export interface ApiRoomFull extends ApiRoom {
  participants: ApiParticipant[]
  furniture: ApiFurniture[]
}

export interface ApiParticipant {
  id: number
  username: string
  displayName: string | null
  position: { x: number; y: number }
  direction: string
  character: ApiCharacterInput
}

export interface ApiFurniture {
  id: number
  type: string
  position: { x: number; y: number }
  rotation: number
}

export interface ApiMessage {
  id: number
  userId: number
  username: string
  displayName: string
  message: string
  messageType: string
  createdAt: string
}
