'use client'

import { useState } from 'react'
import { useGame } from '@/lib/game-context'

interface CreateRoomScreenProps {
  onBack: () => void
  onSuccess: () => void
}

export function CreateRoomScreen({ onBack, onSuccess }: CreateRoomScreenProps) {
  const { createRoom } = useGame()
  const [name, setName] = useState('')
  const [maxParticipants, setMaxParticipants] = useState(10)
  const [isPublic, setIsPublic] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      await createRoom(name.trim(), maxParticipants, isPublic)
      onSuccess()
    } catch (error) {
      console.error('Erro ao criar sala:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
            <h1 className="game-title text-primary text-xl mb-2">
              Criar Nova Sala
            </h1>
            <p className="text-muted-foreground">
              Configure sua sala e convide seus amigos!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm text-muted-foreground mb-2">
                Nome da Sala
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Minha Sala Incrível"
                className="pixel-input w-full"
                maxLength={30}
                required
              />
            </div>

            <div>
              <label htmlFor="maxParticipants" className="block text-sm text-muted-foreground mb-2">
                Máximo de Participantes: {maxParticipants}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="maxParticipants"
                  min={2}
                  max={20}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="w-8 text-center font-mono">{maxParticipants}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Visibilidade
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex-1 p-4 border-2 transition-all ${
                    isPublic
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-border bg-muted text-muted-foreground'
                  }`}
                  style={{
                    boxShadow: isPublic ? '3px 3px 0 0 oklch(0.5 0.12 145)' : '2px 2px 0 0 oklch(0.2 0.02 260)',
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span className="font-mono text-sm">Pública</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex-1 p-4 border-2 transition-all ${
                    !isPublic
                      ? 'border-secondary bg-secondary/20 text-secondary'
                      : 'border-border bg-muted text-muted-foreground'
                  }`}
                  style={{
                    boxShadow: !isPublic ? '3px 3px 0 0 oklch(0.45 0.14 30)' : '2px 2px 0 0 oklch(0.2 0.02 260)',
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="font-mono text-sm">Privada</span>
                  </div>
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {isPublic
                  ? 'Qualquer pessoa pode encontrar e entrar na sua sala.'
                  : 'Apenas pessoas com o código podem entrar.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="pixel-button w-full bg-primary text-primary-foreground disabled:opacity-50"
            >
              {isLoading ? 'Criando...' : 'Criar Sala'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
