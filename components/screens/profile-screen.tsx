'use client'

import { useState } from 'react'
import { useGame, type CharacterCustomization } from '@/lib/game-context'
import { CharacterEditor } from '@/components/game/character-editor'
import { PixelAvatar } from '@/components/game/pixel-avatar'

interface ProfileScreenProps {
  onBack: () => void
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { state, updateCharacter, updateAudioSettings } = useGame()
  const { user, audioSettings } = state
  const [isEditing, setIsEditing] = useState(false)

  if (!user) return null

  const handleSaveCharacter = async (character: CharacterCustomization) => {
    await updateCharacter(character)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setIsEditing(false)}
            className="mb-6 text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Cancelar Edição
          </button>

          <h1 className="game-title text-primary text-xl mb-6">Editar Personagem</h1>
          
          <CharacterEditor
            initialCharacter={user.character}
            onSave={handleSaveCharacter}
            showNameField
          />
        </div>
      </div>
    )
  }

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
          <h1 className="font-mono text-lg text-foreground">Meu Perfil</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Card do Perfil */}
        <div className="pixel-panel p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <PixelAvatar character={user.character} size="xl" />
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 text-sm text-primary hover:text-primary/80 underline underline-offset-4"
              >
                Editar Personagem
              </button>
            </div>

            {/* Informações */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-mono text-foreground mb-1">{user.displayName}</h2>
              <p className="text-muted-foreground">@{user.username}</p>
              
              <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="px-3 py-1 bg-primary/20 text-primary text-sm border border-primary">
                  Online
                </span>
              </div>

              <div className="mt-6 p-4 bg-muted/30 border-2 border-border">
                <h3 className="font-mono text-sm text-muted-foreground mb-2">Informações da Conta</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">E-mail:</span>
                    <span className="text-foreground">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Username:</span>
                    <span className="text-foreground">@{user.username}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações de Áudio */}
        <div className="pixel-panel p-6">
          <h3 className="font-mono text-lg text-foreground mb-4">Configurações de Áudio</h3>
          
          <div className="space-y-4">
            {/* Volume Master */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Volume Geral</label>
                <span className="text-sm text-foreground">{audioSettings.masterVolume}%</span>
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

            {/* Volume de Voz */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Volume de Voz</label>
                <span className="text-sm text-foreground">{audioSettings.voiceVolume}%</span>
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

            {/* Volume de Música */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Música</label>
                <span className="text-sm text-foreground">{audioSettings.musicVolume}%</span>
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

            {/* Volume de SFX */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Efeitos Sonoros</label>
                <span className="text-sm text-foreground">{audioSettings.sfxVolume}%</span>
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

            {/* Toggles */}
            <div className="flex gap-4 pt-4 border-t border-border">
              <button
                onClick={() => updateAudioSettings({ micEnabled: !audioSettings.micEnabled })}
                className={`flex-1 p-4 flex items-center justify-center gap-2 transition-all ${
                  audioSettings.micEnabled
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-muted text-muted-foreground border-2 border-border'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
                <span className="text-sm">Microfone</span>
              </button>

              <button
                onClick={() => updateAudioSettings({ speakerEnabled: !audioSettings.speakerEnabled })}
                className={`flex-1 p-4 flex items-center justify-center gap-2 transition-all ${
                  audioSettings.speakerEnabled
                    ? 'bg-secondary/20 text-secondary border-2 border-secondary'
                    : 'bg-muted text-muted-foreground border-2 border-border'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <span className="text-sm">Alto-falante</span>
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="pixel-panel p-6">
          <h3 className="font-mono text-lg text-foreground mb-4">Estatísticas</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/30 border-2 border-border text-center">
              <div className="text-2xl font-mono text-primary">42</div>
              <div className="text-xs text-muted-foreground">Horas jogadas</div>
            </div>
            <div className="p-4 bg-muted/30 border-2 border-border text-center">
              <div className="text-2xl font-mono text-secondary">156</div>
              <div className="text-xs text-muted-foreground">Mensagens</div>
            </div>
            <div className="p-4 bg-muted/30 border-2 border-border text-center">
              <div className="text-2xl font-mono text-accent">12</div>
              <div className="text-xs text-muted-foreground">Salas visitadas</div>
            </div>
            <div className="p-4 bg-muted/30 border-2 border-border text-center">
              <div className="text-2xl font-mono text-foreground">3</div>
              <div className="text-xs text-muted-foreground">Salas criadas</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
