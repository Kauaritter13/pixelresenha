import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    const sessions = await sql`
      SELECT user_id, expires_at FROM sessions WHERE token = ${token}
    `

    if (sessions.length === 0) {
      return NextResponse.json({ user: null })
    }

    const session = sessions[0]

    if (new Date(session.expires_at) < new Date()) {
      await sql`DELETE FROM sessions WHERE token = ${token}`
      return NextResponse.json({ user: null })
    }

    const users = await sql`
      SELECT id, username, email, display_name FROM users WHERE id = ${session.user_id}
    `

    if (users.length === 0) {
      return NextResponse.json({ user: null })
    }

    const user = users[0]
    const characters = await sql`SELECT * FROM characters WHERE user_id = ${user.id}`
    const c = characters[0] || null

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name || user.username,
        character: c ? {
          gender: c.gender || 'other',
          skinTone: c.skin_tone || c.skin_color || '#FFD5B5',
          hairStyle: c.hair_style || 'short',
          hairColor: c.hair_color || '#4A3728',
          shirtStyle: c.shirt_style || 'tshirt',
          shirtColor: c.shirt_color || '#3B82F6',
          pantsStyle: c.pants_style || 'jeans',
          pantsColor: c.pants_color || '#1E3A5F',
          hatStyle: (c.hat && c.hat !== 'none') ? c.hat : null,
          accessory: (c.accessory && c.accessory !== 'none') ? c.accessory : null,
        } : null,
      },
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ user: null })
  }
}
