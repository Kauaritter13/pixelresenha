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

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Código da sala é obrigatório' }, { status: 400 })
    }

    const rooms = await sql`
      SELECT r.*, u.username as owner_name, u.display_name as owner_display_name
      FROM rooms r
      JOIN users u ON r.owner_id = u.id
      WHERE r.code = ${code.toUpperCase()}
    `

    if (rooms.length === 0) {
      return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 })
    }

    const room = rooms[0]

    const participantCount = await sql`
      SELECT COUNT(*) as count FROM room_participants WHERE room_id = ${room.id}
    `

    if (parseInt(participantCount[0].count, 10) >= room.max_players) {
      return NextResponse.json({ error: 'Sala cheia' }, { status: 400 })
    }

    const existing = await sql`
      SELECT id FROM room_participants WHERE room_id = ${room.id} AND user_id = ${user.id}
    `

    if (existing.length === 0) {
      await sql`
        INSERT INTO room_participants (room_id, user_id, position_x, position_y, direction)
        VALUES (${room.id}, ${user.id}, 300, 250, 'down')
      `
    }

    // Get all participants with characters
    const participants = await sql`
      SELECT rp.*, u.username, u.display_name, c.*
      FROM room_participants rp
      JOIN users u ON rp.user_id = u.id
      LEFT JOIN characters c ON c.user_id = u.id
      WHERE rp.room_id = ${room.id}
    `

    const furniture = await sql`
      SELECT * FROM room_furniture WHERE room_id = ${room.id}
    `

    return NextResponse.json({
      room: {
        id: room.id,
        code: room.code,
        name: room.name,
        ownerId: room.owner_id,
        ownerName: room.owner_display_name || room.owner_name,
        maxPlayers: room.max_players,
        isPrivate: room.is_private,
        floorType: room.floor_type,
        wallType: room.wall_type,
        createdAt: room.created_at,
        participants: participants.map((p: Record<string, unknown>) => ({
          id: p.user_id,
          username: p.username,
          displayName: (p.display_name as string) || (p.username as string),
          position: { x: p.position_x, y: p.position_y },
          direction: p.direction || 'down',
          character: {
            gender: p.gender || 'other',
            skinTone: (p.skin_tone as string) || (p.skin_color as string) || '#FFD5B5',
            hairStyle: p.hair_style || 'short',
            hairColor: p.hair_color || '#4A3728',
            shirtStyle: p.shirt_style || 'tshirt',
            shirtColor: p.shirt_color || '#3B82F6',
            pantsStyle: p.pants_style || 'jeans',
            pantsColor: p.pants_color || '#1E3A5F',
            hatStyle: (p.hat && p.hat !== 'none') ? p.hat : null,
            accessory: (p.accessory && p.accessory !== 'none') ? p.accessory : null,
          },
        })),
        furniture: furniture.map((f: Record<string, unknown>) => ({
          id: f.id,
          type: f.furniture_type,
          position: { x: f.position_x, y: f.position_y },
          rotation: f.rotation,
        })),
      },
    })
  } catch (error) {
    console.error('Join room error:', error)
    return NextResponse.json({ error: 'Erro ao entrar na sala' }, { status: 500 })
  }
}
