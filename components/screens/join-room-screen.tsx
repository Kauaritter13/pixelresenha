'use client'

import { useState } from 'react'
import { useGame } from '@/lib/game-context'

interface JoinRoomScreenProps {
  onBack: () => void
  onSuccess: () => void
}

export function JoinRoomScreen({ onBack, onSuccess }: JoinRoomScreenProps) {
  const { joinRoom } = useGame()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setError('')
    setIsLoading(true)

    try {
      const room = await joinRoom(code.trim())
      if (room) {
        onSuccess()
      } else {
        setError('Sala não encontrada. Verifique o código e tente novamente.')
      }
    } catch {
      setError('Erro ao entrar na sala. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Salas recentes mockadas
  const recentRooms = [
    { code: 'ABC123', name: 'Sala do Pedro', lastVisit: 'Há 2 horas' },
    { code: 'XYZ789', name: 'Festa de Sexta', lastVisit: 'Ontem' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Voltar ao Lobby
        </button>

        <div className="pixel-panel p-8">
          <div className="text-center mb-6">
            <h1 className="game-title text-secondary text-xl mb-2">
              Entrar em Sala
            </h1>
            <p className="text-muted-foreground">
              Digite o código da sala para entrar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm text-muted-foreground mb-2">
                Código da Sala
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="pixel-input w-full text-center text-2xl font-mono tracking-widest"
                maxLength={8}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/20 border-2 border-destructive text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="pixel-button w-full bg-secondary text-secondary-foreground disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar na Sala'}
            </button>
          </form>

          {/* Salas Recentes */}
          {recentRooms.length > 0 && (
            <div className="mt-8 pt-6 border-t-2 border-border">
              <h3 className="text-sm text-muted-foreground mb-4">Salas Recentes</h3>
              <div className="space-y-2">
                {recentRooms.map(room => (
                  <button
                    key={room.code}
                    onClick={async () => {
                      setCode(room.code)
                      const result = await joinRoom(room.code)
                      if (result) onSuccess()
                    }}
                    className="w-full p-3 flex items-center justify-between bg-muted/50 border border-border hover:border-secondary transition-colors text-left"
                  >
                    <div>
                      <p className="font-mono text-sm">{room.name}</p>
                      <p className="text-xs text-muted-foreground">{room.lastVisit}</p>
                    </div>
                    <span className="text-xs text-secondary font-mono">{room.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
