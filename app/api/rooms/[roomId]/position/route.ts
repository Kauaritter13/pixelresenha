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

// POST - Update position
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
    const { x, y } = await request.json()

    // Update position
    await sql`
      UPDATE room_participants
      SET position_x = ${x}, position_y = ${y}
      WHERE room_id = ${roomId} AND user_id = ${user.id}
    `

    // Get all participants
    const participants = await sql`
      SELECT rp.*, u.username, c.*
      FROM room_participants rp
      JOIN users u ON rp.user_id = u.id
      LEFT JOIN characters c ON c.user_id = u.id
      WHERE rp.room_id = ${roomId}
    `

    return NextResponse.json({
      participants: participants.map(p => ({
        id: p.user_id,
        username: p.username,
        position: { x: p.position_x, y: p.position_y },
        character: {
          skinColor: p.skin_color,
          hairStyle: p.hair_style,
          hairColor: p.hair_color,
          shirtColor: p.shirt_color,
          pantsColor: p.pants_color,
          hat: p.hat,
          accessory: p.accessory
        }
      }))
    })
  } catch (error) {
    console.error('Update position error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar posição' }, { status: 500 })
  }
}
