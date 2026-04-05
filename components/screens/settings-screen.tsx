'use client'

import { useGame } from '@/lib/game-context'

interface SettingsScreenProps {
  onBack: () => void
  onLogout: () => void
}

export function SettingsScreen({ onBack, onLogout }: SettingsScreenProps) {
  const { state, updateAudioSettings } = useGame()
  const { user, audioSettings } = state

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-4 border-border bg-card px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-muted hover:bg-muted/80 transition-colors"
            style={{ boxShadow: '2px 2px 0 0 oklch(0.1 0.02 260)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-mono text-lg text-foreground">Configurações</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Áudio */}
        <section className="pixel-panel p-6">
          <h2 className="font-mono text-lg text-foreground mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            Áudio
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Volume Geral</label>
                <span className="text-sm text-foreground font-mono">{audioSettings.masterVolume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={audioSettings.masterVolume}
                onChange={(e) => updateAudioSettings({ masterVolume: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Volume de Voz</label>
                <span className="text-sm text-foreground font-mono">{audioSettings.voiceVolume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={audioSettings.voiceVolume}
                onChange={(e) => updateAudioSettings({ voiceVolume: Number(e.target.value) })}
                className="w-full accent-secondary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Música de Fundo</label>
                <span className="text-sm text-foreground font-mono">{audioSettings.musicVolume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={audioSettings.musicVolume}
                onChange={(e) => updateAudioSettings({ musicVolume: Number(e.target.value) })}
                className="w-full accent-accent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Efeitos Sonoros</label>
                <span className="text-sm text-foreground font-mono">{audioSettings.sfxVolume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={audioSettings.sfxVolume}
                onChange={(e) => updateAudioSettings({ sfxVolume: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Conta */}
        <section className="pixel-panel p-6">
          <h2 className="font-mono text-lg text-foreground mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Conta
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 border border-border">
              <div>
                <p className="text-sm text-foreground">{user.displayName}</p>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              </div>
              <span className="px-2 py-1 bg-primary/20 text-primary text-xs border border-primary">
                {user.status}
              </span>
            </div>

            <div className="p-3 bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">E-mail</p>
              <p className="text-sm text-foreground">{user.email}</p>
            </div>
          </div>
        </section>

        {/* Sobre */}
        <section className="pixel-panel p-6">
          <h2 className="font-mono text-lg text-foreground mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Sobre
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versão</span>
              <span className="text-foreground font-mono">v1.0.0-beta</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build</span>
              <span className="text-foreground font-mono">2024.04.01</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              PixelResenha - Sua resenha online multiplayer
            </p>
          </div>
        </section>

        {/* Ações */}
        <section className="space-y-3">
          <button
            onClick={onLogout}
            className="w-full p-4 bg-destructive/20 text-destructive border-2 border-destructive hover:bg-destructive/30 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span>Sair da Conta</span>
          </button>
        </section>
      </main>
    </div>
  )
}
