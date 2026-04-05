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

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { character } = await request.json()
    if (!character) {
      return NextResponse.json({ error: 'Dados do personagem são obrigatórios' }, { status: 400 })
    }

    await sql`
      UPDATE characters SET
        gender = ${character.gender || 'other'},
        skin_color = ${character.skinTone || '#FFD5B5'},
        skin_tone = ${character.skinTone || '#FFD5B5'},
        hair_style = ${character.hairStyle || 'short'},
        hair_color = ${character.hairColor || '#4A3728'},
        shirt_style = ${character.shirtStyle || 'tshirt'},
        shirt_color = ${character.shirtColor || '#3B82F6'},
        pants_style = ${character.pantsStyle || 'jeans'},
        pants_color = ${character.pantsColor || '#1E3A5F'},
        hat = ${character.hatStyle || 'none'},
        accessory = ${character.accessory || 'none'},
        updated_at = NOW()
      WHERE user_id = ${user.id}
    `

    return NextResponse.json({ character })
  } catch (error) {
    console.error('Update character error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar personagem' }, { status: 500 })
  }
}
