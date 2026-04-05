import type { Metadata } from 'next'
import { VT323, Press_Start_2P } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { GameProvider } from '@/lib/game-context'

const vt323 = VT323({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-sans'
})

const pressStart = Press_Start_2P({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'PixelResenha - Jogo Social Multiplayer',
  description: 'Um jogo social multiplayer em pixel art. Crie seu personagem, entre em salas e interaja com amigos em tempo real!',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${vt323.variable} ${pressStart.variable} font-sans antialiased`}>
        <GameProvider>
          {children}
        </GameProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
