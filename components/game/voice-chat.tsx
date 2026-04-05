'use client'

import { useState, useEffect, useRef } from 'react'
import { useGame } from '@/lib/game-context'
import { getSocket } from '@/lib/socket'
import { VoiceChatManager } from '@/lib/webrtc'

export function VoiceChat() {
  const { state, updateAudioSettings, setSpeaking } = useGame()
  const { currentRoom, user, audioSettings } = state
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const voiceManagerRef = useRef<VoiceChatManager | null>(null)

  const speakingUsers = currentRoom?.participants.filter(p => p.isSpeaking) || []

  // Update proximity volumes
  useEffect(() => {
    if (!voiceManagerRef.current || !currentRoom || !user) return

    const myPos = currentRoom.participants.find(p => p.id === user.id)?.position
    if (!myPos) return

    const positions = new Map<number, { x: number; y: number }>()
    currentRoom.participants.forEach(p => {
      positions.set(p.id, p.position)
    })

    voiceManagerRef.current.updateProximityVolumes(
      myPos,
      positions,
      400,
      audioSettings.voiceVolume / 100,
    )
  }, [currentRoom?.participants, user, audioSettings.voiceVolume])

  // Update mic state
  useEffect(() => {
    voiceManagerRef.current?.setMicEnabled(audioSettings.micEnabled)
  }, [audioSettings.micEnabled])

  const toggleVoice = async () => {
    if (isVoiceActive) {
      voiceManagerRef.current?.leaveVoice()
      voiceManagerRef.current?.destroy()
      voiceManagerRef.current = null
      setIsVoiceActive(false)
      setVoiceError('')
      return
    }

    if (!currentRoom || !user) return

    try {
      const socket = getSocket()
      const manager = new VoiceChatManager(socket, user.id)
      manager.setOnSpeakingChange((userId, isSpeaking) => {
        setSpeaking(userId, isSpeaking)
      })

      const success = await manager.joinVoice(currentRoom.id)
      if (success) {
        voiceManagerRef.current = manager
        setIsVoiceActive(true)
        setVoiceError('')
      } else {
        setVoiceError('Não foi possível acessar o microfone')
        manager.destroy()
      }
    } catch {
      setVoiceError('Erro ao conectar voice chat')
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceManagerRef.current?.leaveVoice()
      voiceManagerRef.current?.destroy()
    }
  }, [])

  const toggleMic = () => {
    updateAudioSettings({ micEnabled: !audioSettings.micEnabled })
  }

  const toggleSpeaker = () => {
    updateAudioSettings({ speakerEnabled: !audioSettings.speakerEnabled })
  }

  return (
    <div className="pixel-panel bg-card/95 backdrop-blur-sm">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isVoiceActive ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
          <span className="font-mono text-sm">Voice Chat</span>
          {isVoiceActive && <span className="text-xs text-primary">ATIVO</span>}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-4 border-t border-border pt-3">
          {/* Join/Leave Voice Button */}
          <button
            onClick={toggleVoice}
            className={`w-full p-3 flex items-center justify-center gap-2 transition-all ${
              isVoiceActive
                ? 'bg-destructive/20 text-destructive border-2 border-destructive hover:bg-destructive/30'
                : 'bg-primary/20 text-primary border-2 border-primary hover:bg-primary/30'
            }`}
          >
            {isVoiceActive ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <span className="text-sm font-mono">Sair do Voice</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
                <span className="text-sm font-mono">Entrar no Voice</span>
              </>
            )}
          </button>

          {voiceError && (
            <div className="p-2 bg-destructive/20 border border-destructive text-xs text-destructive">
              {voiceError}
            </div>
          )}

          {/* Mic/Speaker Controls */}
          {isVoiceActive && (
            <>
              <div className="flex gap-2">
                <button
                  onClick={toggleMic}
                  className={`flex-1 p-3 flex flex-col items-center gap-1 transition-all ${
                    audioSettings.micEnabled
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-destructive/20 text-destructive border-2 border-destructive'
                  }`}
                >
                  {audioSettings.micEnabled ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  )}
                  <span className="text-xs">{audioSettings.micEnabled ? 'Mic Ligado' : 'Mic Desligado'}</span>
                </button>

                <button
                  onClick={toggleSpeaker}
                  className={`flex-1 p-3 flex flex-col items-center gap-1 transition-all ${
                    audioSettings.speakerEnabled
                      ? 'bg-secondary/20 text-secondary border-2 border-secondary'
                      : 'bg-muted text-muted-foreground border-2 border-border'
                  }`}
                >
                  {audioSettings.speakerEnabled ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  )}
                  <span className="text-xs">{audioSettings.speakerEnabled ? 'Som Ligado' : 'Som Desligado'}</span>
                </button>
              </div>

              {/* Voice Volume */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Volume do Voice</span>
                  <span className="text-xs text-foreground">{audioSettings.voiceVolume}%</span>
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

              {/* Speaking Users */}
              <div>
                <span className="text-xs text-muted-foreground mb-2 block">
                  Pessoas Falando ({speakingUsers.length})
                </span>
                {speakingUsers.length > 0 ? (
                  <div className="space-y-1">
                    {speakingUsers.map(u => (
                      <div key={u.id} className="flex items-center gap-2 p-2 bg-secondary/10 border border-secondary/30">
                        <div className="flex gap-0.5">
                          <div className="w-1 h-2 bg-secondary animate-pulse" />
                          <div className="w-1 h-3 bg-secondary animate-pulse" style={{ animationDelay: '100ms' }} />
                          <div className="w-1 h-2 bg-secondary animate-pulse" style={{ animationDelay: '200ms' }} />
                        </div>
                        <span className="text-xs">{u.displayName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/70 italic">Ninguém falando no momento</p>
                )}
              </div>
            </>
          )}

          {/* Proximity Info */}
          <div className="p-2 bg-muted/50 border border-border">
            <div className="flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p className="text-xs text-muted-foreground">
                <strong className="text-accent">Voice por Proximidade:</strong> Quanto mais perto de outro jogador, mais alto você ouve a voz dele!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compact indicator when collapsed */}
      {!isExpanded && (
        <div className="px-3 pb-3 flex items-center gap-2">
          {isVoiceActive ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); toggleMic() }}
                className={`p-2 ${audioSettings.micEnabled ? 'text-primary' : 'text-destructive'}`}
              >
                {audioSettings.micEnabled ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  </svg>
                )}
              </button>
              {speakingUsers.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-secondary">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1.5 bg-secondary animate-pulse" />
                    <div className="w-1 h-2 bg-secondary animate-pulse" style={{ animationDelay: '100ms' }} />
                    <div className="w-1 h-1.5 bg-secondary animate-pulse" style={{ animationDelay: '200ms' }} />
                  </div>
                  <span>{speakingUsers.length}</span>
                </div>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground italic">Clique para ativar</span>
          )}
        </div>
      )}
    </div>
  )
}
