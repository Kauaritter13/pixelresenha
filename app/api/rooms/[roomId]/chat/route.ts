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
    SELECT id, username, display_name FROM users WHERE id = ${sessions[0].user_id}
  `
  return users[0] || null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params

    const messages = await sql`
      SELECT cm.*, u.username, u.display_name
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.room_id = ${roomId}
      ORDER BY cm.created_at DESC
      LIMIT 50
    `

    return NextResponse.json({
      messages: messages.reverse().map(m => ({
        id: m.id,
        userId: m.user_id,
        username: m.username,
        displayName: m.display_name || m.username,
        message: m.message,
        messageType: m.message_type || 'text',
        createdAt: m.created_at,
      })),
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Erro ao buscar mensagens' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { roomId } = await params
    const { message, messageType } = await request.json()

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 })
    }

    const participant = await sql`
      SELECT id FROM room_participants WHERE room_id = ${roomId} AND user_id = ${user.id}
    `

    if (participant.length === 0) {
      return NextResponse.json({ error: 'Você não está nesta sala' }, { status: 403 })
    }

    const newMessage = await sql`
      INSERT INTO chat_messages (room_id, user_id, message, message_type)
      VALUES (${roomId}, ${user.id}, ${message.trim()}, ${messageType || 'text'})
      RETURNING *
    `

    return NextResponse.json({
      message: {
        id: newMessage[0].id,
        userId: user.id,
        username: user.username,
        displayName: user.display_name || user.username,
        message: newMessage[0].message,
        messageType: newMessage[0].message_type || 'text',
        createdAt: newMessage[0].created_at,
      },
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 })
  }
}
