import { NextResponse } from 'next/server'
import { sql, generateSessionToken } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const users = await sql`
      SELECT id, username, email, password_hash, display_name FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 })
    }

    const user = users[0]
    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 })
    }

    const characters = await sql`SELECT * FROM characters WHERE user_id = ${user.id}`

    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`

    // Delete old sessions and create new
    const token = generateSessionToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await sql`DELETE FROM sessions WHERE user_id = ${user.id}`
    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt})
    `

    const c = characters[0] || null

    const response = NextResponse.json({
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

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 })
  }
}
