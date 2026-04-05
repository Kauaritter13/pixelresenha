import { NextResponse } from 'next/server'
import { sql, generateRoomCode } from '@/lib/db'
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

// GET - List public rooms
export async function GET() {
  try {
    const rooms = await sql`
      SELECT r.*, u.username as owner_name, u.display_name as owner_display_name,
        (SELECT COUNT(*) FROM room_participants WHERE room_id = r.id) as player_count
      FROM rooms r
      JOIN users u ON r.owner_id = u.id
      WHERE r.is_private = false
      ORDER BY player_count DESC, r.created_at DESC
      LIMIT 20
    `

    return NextResponse.json({
      rooms: rooms.map(r => ({
        id: r.id,
        code: r.code,
        name: r.name,
        ownerId: r.owner_id,
        ownerName: r.owner_display_name || r.owner_name,
        maxPlayers: r.max_players,
        isPrivate: r.is_private,
        floorType: r.floor_type,
        wallType: r.wall_type,
        playerCount: parseInt(r.player_count, 10),
        createdAt: r.created_at,
      })),
    })
  } catch (error) {
    console.error('List rooms error:', error)
    return NextResponse.json({ error: 'Erro ao listar salas' }, { status: 500 })
  }
}

// POST - Create room
export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { name, maxPlayers, isPrivate, floorType, wallType } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Nome da sala é obrigatório' }, { status: 400 })
    }

    let code = generateRoomCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await sql`SELECT id FROM rooms WHERE code = ${code}`
      if (existing.length === 0) break
      code = generateRoomCode()
      attempts++
    }

    const newRoom = await sql`
      INSERT INTO rooms (code, name, owner_id, max_players, is_private, floor_type, wall_type)
      VALUES (${code}, ${name}, ${user.id}, ${maxPlayers || 10}, ${isPrivate || false}, ${floorType || 'wood'}, ${wallType || 'brick'})
      RETURNING *
    `

    await sql`
      INSERT INTO room_participants (room_id, user_id, position_x, position_y, direction)
      VALUES (${newRoom[0].id}, ${user.id}, 300, 250, 'down')
    `

    return NextResponse.json({
      room: {
        id: newRoom[0].id,
        code: newRoom[0].code,
        name: newRoom[0].name,
        ownerId: newRoom[0].owner_id,
        ownerName: user.display_name || user.username,
        maxPlayers: newRoom[0].max_players,
        isPrivate: newRoom[0].is_private,
        floorType: newRoom[0].floor_type,
        wallType: newRoom[0].wall_type,
        playerCount: 1,
        createdAt: newRoom[0].created_at,
      },
    })
  } catch (error) {
    console.error('Create room error:', error)
    return NextResponse.json({ error: 'Erro ao criar sala' }, { status: 500 })
  }
}
