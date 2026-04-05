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

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const rooms = await sql`
      SELECT r.*,
        (SELECT COUNT(*) FROM room_participants WHERE room_id = r.id) as player_count
      FROM rooms r
      WHERE r.owner_id = ${user.id}
      ORDER BY r.created_at DESC
      LIMIT 20
    `

    return NextResponse.json({
      rooms: rooms.map(r => ({
        id: r.id,
        code: r.code,
        name: r.name,
        ownerId: r.owner_id,
        maxPlayers: r.max_players,
        isPrivate: r.is_private,
        floorType: r.floor_type,
        wallType: r.wall_type,
        playerCount: parseInt(r.player_count, 10),
        createdAt: r.created_at,
      })),
    })
  } catch (error) {
    console.error('My rooms error:', error)
    return NextResponse.json({ error: 'Erro ao buscar salas' }, { status: 500 })
  }
}
