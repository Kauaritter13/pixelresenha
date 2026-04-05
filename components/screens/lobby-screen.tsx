'use client'

import { useState, useEffect } from 'react'
import { useGame } from '@/lib/game-context'
import { PixelAvatar } from '@/components/game/pixel-avatar'
import { ActivityStatusPicker } from '@/components/game/activity-status'

interface LobbyScreenProps {
  onCreateRoom: () => void
  onJoinRoom: () => void
  onProfile: () => void
  onSettings: () => void
  onEnterRoom: () => void
  onLogout: () => void
}

export function LobbyScreen({
  onCreateRoom,
  onJoinRoom,
  onProfile,
  onSettings,
  onEnterRoom,
  onLogout,
}: LobbyScreenProps) {
  const { state, joinRoom, fetchPublicRooms, fetchMyRooms, setActivity } = useGame()
  const { user, publicRooms, myRooms } = state
  const [quickJoinCode, setQuickJoinCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState('')

  // Fetch public rooms on mount
  useEffect(() => {
    fetchPublicRooms()
    fetchMyRooms()
    const interval = setInterval(() => { fetchPublicRooms(); fetchMyRooms() }, 10000)
    return () => clearInterval(interval)
  }, [fetchPublicRooms, fetchMyRooms])

  const handleQuickJoin = async () => {
    if (!quickJoinCode.trim()) return
    setIsJoining(true)
    setJoinError('')
    const room = await joinRoom(quickJoinCode)
    setIsJoining(false)
    if (room) {
      onEnterRoom()
    } else {
      setJoinError('Sala não encontrada ou cheia')
    }
  }

  const handleJoinRoom = async (code: string) => {
    setIsJoining(true)
    setJoinError('')
    const room = await joinRoom(code)
    setIsJoining(false)
    if (room) {
      onEnterRoom()
    } else {
      setJoinError('Erro ao entrar na sala')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-4 border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="game-title text-primary text-xl">PixelResenha</h1>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/20 border-2 border-primary">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-primary">Online</span>
            </div>

            <button
              onClick={onProfile}
              className="flex items-center gap-3 px-3 py-2 bg-muted hover:bg-muted/80 transition-colors"
              style={{ boxShadow: '2px 2px 0 0 oklch(0.1 0.02 260)' }}
            >
              {user && <PixelAvatar character={user.character} size="sm" />}
              <span className="hidden sm:block">{user?.displayName}</span>
            </button>

            <button
              onClick={onSettings}
              className="p-2 bg-muted hover:bg-muted/80 transition-colors"
              style={{ boxShadow: '2px 2px 0 0 oklch(0.1 0.02 260)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Hero */}
            <section className="pixel-panel p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-32 h-32 bg-primary/30 animate-pulse" />
                <div className="absolute bottom-4 left-4 w-24 h-24 bg-secondary/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl font-mono text-primary mb-2">
                  Bem-vindo, {user?.displayName}!
                </h2>
                <p className="text-muted-foreground mb-6">O que você quer fazer hoje?</p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={onCreateRoom} className="pixel-button bg-primary text-primary-foreground">
                    Criar Sala
                  </button>
                  <button onClick={onJoinRoom} className="pixel-button bg-secondary text-secondary-foreground">
                    Entrar em Sala
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Join */}
            <section className="pixel-panel p-6">
              <h3 className="font-mono text-lg text-foreground mb-4">Entrar Rapidamente</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={quickJoinCode}
                  onChange={(e) => { setQuickJoinCode(e.target.value.toUpperCase()); setJoinError('') }}
                  placeholder="Digite o código da sala"
                  className="pixel-input flex-1"
                  maxLength={8}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleQuickJoin() }}
                />
                <button
                  onClick={handleQuickJoin}
                  disabled={isJoining || !quickJoinCode.trim()}
                  className="pixel-button bg-accent text-accent-foreground disabled:opacity-50"
                >
                  {isJoining ? '...' : 'Entrar'}
                </button>
              </div>
              {joinError && (
                <p className="text-sm text-destructive mt-2">{joinError}</p>
              )}
            </section>

            {/* My Rooms */}
            {myRooms.length > 0 && (
              <section className="pixel-panel p-6">
                <h3 className="font-mono text-lg text-foreground mb-4">Minhas Salas</h3>
                <div className="space-y-3">
                  {myRooms.map(room => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-4 bg-primary/10 border-2 border-primary/30 hover:border-primary transition-colors cursor-pointer"
                      onClick={() => handleJoinRoom(room.code)}
                    >
                      <div>
                        <h4 className="font-mono text-foreground">{room.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Código: {room.code} | {room.playerCount} online
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary bg-primary/20 px-2 py-1">Dono</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Public Rooms */}
            <section className="pixel-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-lg text-foreground">Salas Públicas</h3>
                <button
                  onClick={fetchPublicRooms}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Atualizar
                </button>
              </div>
              {publicRooms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhuma sala pública no momento</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Crie a primeira!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {publicRooms.map(room => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-4 bg-muted/50 border-2 border-border hover:border-primary transition-colors cursor-pointer"
                      onClick={() => handleJoinRoom(room.code)}
                    >
                      <div>
                        <h4 className="font-mono text-foreground">{room.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Código: {room.code} | Dono: {room.ownerName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                          <span className="text-sm">{room.playerCount}/{room.maxPlayers}</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Character */}
            <section className="pixel-panel p-6">
              <h3 className="font-mono text-lg text-foreground mb-4">Meu Personagem</h3>
              <div className="flex flex-col items-center">
                {user && (
                  <PixelAvatar character={user.character} size="xl" showName />
                )}
                <button
                  onClick={onProfile}
                  className="mt-4 text-sm text-primary hover:text-primary/80 underline underline-offset-4"
                >
                  Editar Personagem
                </button>
              </div>
            </section>

            {/* Activity Status */}
            <section className="pixel-panel p-6">
              <h3 className="font-mono text-lg text-foreground mb-4">Meu Status</h3>
              <ActivityStatusPicker
                currentActivity={user?.activity || null}
                customStatus={user?.customStatus || null}
                onSetActivity={(activity, custom) => setActivity(activity, custom)}
              />
              <p className="text-xs text-muted-foreground mt-3">
                Mostre aos outros o que você está fazendo!
              </p>
            </section>

            {/* Info */}
            <section className="pixel-panel p-6">
              <h3 className="font-mono text-lg text-foreground mb-4">Como Jogar</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-mono">W A S D</span>
                  <span>Mover personagem</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-mono">Chat</span>
                  <span>Converse em tempo real</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-mono">Voice</span>
                  <span>Fale por proximidade</span>
                </div>
              </div>
            </section>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="w-full p-3 bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-2 border-border hover:border-destructive transition-colors"
            >
              Sair da Conta
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
