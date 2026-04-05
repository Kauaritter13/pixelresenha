import { NextResponse } from 'next/server'
import { sql, generateSessionToken } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, email, password, displayName, character } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} OR username = ${username}
    `
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Usuário ou email já existe' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const newUser = await sql`
      INSERT INTO users (username, email, password_hash, display_name)
      VALUES (${username}, ${email}, ${passwordHash}, ${displayName || username})
      RETURNING id, username, email, display_name
    `

    const userId = newUser[0].id

    const c = character || {}
    await sql`
      INSERT INTO characters (user_id, gender, skin_color, skin_tone, hair_style, hair_color, shirt_style, shirt_color, pants_style, pants_color, hat, accessory)
      VALUES (
        ${userId},
        ${c.gender || 'other'},
        ${c.skinTone || '#FFD5B5'},
        ${c.skinTone || '#FFD5B5'},
        ${c.hairStyle || 'short'},
        ${c.hairColor || '#4A3728'},
        ${c.shirtStyle || 'tshirt'},
        ${c.shirtColor || '#3B82F6'},
        ${c.pantsStyle || 'jeans'},
        ${c.pantsColor || '#1E3A5F'},
        ${c.hatStyle || 'none'},
        ${c.accessory || 'none'}
      )
    `

    await sql`INSERT INTO user_settings (user_id) VALUES (${userId})`

    const token = generateSessionToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt})
    `

    const response = NextResponse.json({
      user: {
        id: userId,
        username: newUser[0].username,
        email: newUser[0].email,
        displayName: displayName || username,
        character: {
          gender: c.gender || 'other',
          skinTone: c.skinTone || '#FFD5B5',
          hairStyle: c.hairStyle || 'short',
          hairColor: c.hairColor || '#4A3728',
          shirtStyle: c.shirtStyle || 'tshirt',
          shirtColor: c.shirtColor || '#3B82F6',
          pantsStyle: c.pantsStyle || 'jeans',
          pantsColor: c.pantsColor || '#1E3A5F',
          hatStyle: c.hatStyle || null,
          accessory: c.accessory || null,
        },
      },
    })

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 })
  }
}
