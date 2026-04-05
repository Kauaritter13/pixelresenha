import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cookies } from 'next/headers'

async function getSessionUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  if (!token) return null

  const sessions = await sql`
    SELECT user_id FROM sessions WHERE token = ${token} AND expires_at > NOW()
  `
  if (sessions.length === 0) return null

  const users = await sql`
    SELECT id, username FROM users WHERE id = ${sessions[0].user_id}
  `
  return users[0] || null
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { roomId } = await request.json()

    // Remove user from room
    await sql`
      DELETE FROM room_participants WHERE room_id = ${roomId} AND user_id = ${user.id}
    `

    // Check if room is empty and delete if so (unless owner wants to keep it)
    const remaining = await sql`
      SELECT COUNT(*) as count FROM room_participants WHERE room_id = ${roomId}
    `

    if (remaining[0].count === 0) {
      // Optionally delete empty room after some time
      // For now, we keep it
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Leave room error:', error)
    return NextResponse.json({ error: 'Erro ao sair da sala' }, { status: 500 })
  }
}
