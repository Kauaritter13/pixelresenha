'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useGame, type RoomParticipant, type RoomFurniture } from '@/lib/game-context'
import { useKeyboardMovement } from '@/hooks/use-keyboard-movement'
import { PixelAvatar } from './pixel-avatar'
import { GameChat } from './game-chat'
import { VoiceChat } from './voice-chat'

interface GameRoomProps {
  onLeave: () => void
  onEditRoom: () => void
}

const floorStyles: Record<string, { color: string; pattern: string }> = {
  wood: { color: '#8B6914', pattern: 'repeating-linear-gradient(90deg, #8B6914 0px, #A67C00 20px, #8B6914 40px)' },
  carpet: { color: '#6B4C7A', pattern: 'repeating-linear-gradient(45deg, #6B4C7A 0px, #7D5A8F 10px, #6B4C7A 20px)' },
  tile: { color: '#E0E0E0', pattern: 'repeating-conic-gradient(#E0E0E0 0deg 90deg, #BDBDBD 90deg 180deg) 0 0/40px 40px' },
  grass: { color: '#4CAF50', pattern: 'repeating-linear-gradient(90deg, #4CAF50 0px, #66BB6A 15px, #4CAF50 30px)' },
}

const wallStyles: Record<string, { color: string; pattern: string }> = {
  brick: { color: '#8B4513', pattern: 'repeating-linear-gradient(0deg, #8B4513 0px, #A0522D 20px, #8B4513 40px)' },
  wallpaper: { color: '#B8860B', pattern: 'repeating-linear-gradient(135deg, #B8860B 0px, #DAA520 15px, #B8860B 30px)' },
  modern: { color: '#37474F', pattern: 'linear-gradient(180deg, #455A64 0%, #37474F 100%)' },
  pink: { color: '#EC407A', pattern: 'repeating-linear-gradient(90deg, #EC407A 0px, #F48FB1 25px, #EC407A 50px)' },
}

const furnitureSprites: Record<string, { width: number; height: number; render: () => JSX.Element }> = {
  sofa: {
    width: 80, height: 50,
    render: () => (
      <svg width="80" height="50" viewBox="0 0 80 50" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="15" width="80" height="35" fill="#8B4513" />
        <rect x="5" y="20" width="70" height="25" fill="#D2691E" />
        <rect x="0" y="15" width="15" height="35" fill="#A0522D" />
        <rect x="65" y="15" width="15" height="35" fill="#A0522D" />
        <rect x="0" y="0" width="80" height="18" fill="#CD853F" />
        <rect x="5" y="5" width="20" height="10" fill="#DEB887" />
        <rect x="55" y="5" width="20" height="10" fill="#DEB887" />
      </svg>
    ),
  },
  table: {
    width: 60, height: 40,
    render: () => (
      <svg width="60" height="40" viewBox="0 0 60 40" style={{ imageRendering: 'pixelated' }}>
        <rect x="5" y="5" width="50" height="8" fill="#5D4037" />
        <rect x="8" y="0" width="44" height="8" fill="#6D4C41" />
        <rect x="8" y="13" width="6" height="27" fill="#4E342E" />
        <rect x="46" y="13" width="6" height="27" fill="#4E342E" />
      </svg>
    ),
  },
  plant: {
    width: 32, height: 48,
    render: () => (
      <svg width="32" height="48" viewBox="0 0 32 48" style={{ imageRendering: 'pixelated' }}>
        <rect x="10" y="35" width="12" height="13" fill="#8D6E63" />
        <rect x="8" y="38" width="16" height="10" fill="#A1887F" />
        <ellipse cx="16" cy="25" rx="12" ry="15" fill="#4CAF50" />
        <ellipse cx="10" cy="20" rx="6" ry="8" fill="#66BB6A" />
        <ellipse cx="22" cy="22" rx="6" ry="8" fill="#66BB6A" />
        <ellipse cx="16" cy="15" rx="5" ry="6" fill="#81C784" />
      </svg>
    ),
  },
  lamp: {
    width: 24, height: 56,
    render: () => (
      <svg width="24" height="56" viewBox="0 0 24 56" style={{ imageRendering: 'pixelated' }}>
        <rect x="10" y="40" width="4" height="16" fill="#5D4037" />
        <rect x="6" y="52" width="12" height="4" fill="#4E342E" />
        <path d="M4 10 L12 0 L20 10 L20 40 L4 40 Z" fill="#FFEB3B" />
        <path d="M6 12 L12 4 L18 12 L18 38 L6 38 Z" fill="#FFF59D" />
        <ellipse cx="12" cy="25" rx="4" ry="6" fill="#FFFDE7" opacity="0.5" />
      </svg>
    ),
  },
  tv: {
    width: 64, height: 48,
    render: () => (
      <svg width="64" height="48" viewBox="0 0 64 48" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="8" width="64" height="40" fill="#212121" />
        <rect x="4" y="12" width="56" height="32" fill="#1565C0" />
        <rect x="8" y="16" width="48" height="24" fill="#42A5F5" />
        <rect x="12" y="20" width="20" height="16" fill="#90CAF9" />
        <rect x="28" y="40" width="8" height="4" fill="#424242" />
        <rect x="24" y="44" width="16" height="4" fill="#616161" />
      </svg>
    ),
  },
  chair: {
    width: 32, height: 40,
    render: () => (
      <svg width="32" height="40" viewBox="0 0 32 40" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="25" width="24" height="8" fill="#8D6E63" />
        <rect x="8" y="0" width="16" height="25" fill="#A1887F" />
        <rect x="4" y="33" width="6" height="7" fill="#6D4C41" />
        <rect x="22" y="33" width="6" height="7" fill="#6D4C41" />
      </svg>
    ),
  },
  bed: {
    width: 80, height: 60,
    render: () => (
      <svg width="80" height="60" viewBox="0 0 80 60" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="20" width="80" height="40" fill="#5D4037" />
        <rect x="5" y="25" width="70" height="30" fill="#ECEFF1" />
        <rect x="5" y="25" width="25" height="20" fill="#90CAF9" />
        <rect x="35" y="25" width="35" height="30" fill="#B3E5FC" />
        <rect x="0" y="10" width="20" height="50" fill="#4E342E" />
      </svg>
    ),
  },
}

export function GameRoom({ onLeave, onEditRoom }: GameRoomProps) {
  const { state, leaveRoom, moveCharacter, stopCharacter } = useGame()
  const { currentRoom, user } = state
  const roomRef = useRef<HTMLDivElement>(null)
  const [showChat, setShowChat] = useState(true)
  const [showVoice, setShowVoice] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)

  // Get room dimensions for movement bounds
  const [roomBounds, setRoomBounds] = useState({ minX: 30, minY: 10, maxX: 620, maxY: 380 })

  useEffect(() => {
    const updateBounds = () => {
      if (roomRef.current) {
        const rect = roomRef.current.getBoundingClientRect()
        setRoomBounds({
          minX: 30,
          minY: 10,
          maxX: Math.max(300, rect.width - 30),
          maxY: Math.max(200, rect.height - 30),
        })
      }
    }
    updateBounds()
    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [])

  // WASD keyboard movement
  const onMove = useCallback((x: number, y: number, direction: string, isWalking: boolean) => {
    moveCharacter(x, y, direction, isWalking)
  }, [moveCharacter])

  const onStop = useCallback(() => {
    stopCharacter()
  }, [stopCharacter])

  const { setPosition } = useKeyboardMovement({
    speed: 3,
    bounds: roomBounds,
    enabled: !!currentRoom && !!user,
    onMove,
    onStop,
  })

  // Sync position from state to movement hook
  useEffect(() => {
    if (currentRoom && user) {
      const me = currentRoom.participants.find(p => p.id === user.id)
      if (me) {
        setPosition(me.position.x, me.position.y)
      }
    }
  }, [currentRoom?.id, user?.id, setPosition]) // Only on room/user change, not every position update

  const handleLeave = async () => {
    await leaveRoom()
    onLeave()
  }

  const copyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  if (!currentRoom) return null

  const floor = floorStyles[currentRoom.floorStyle] || floorStyles.wood
  const wall = wallStyles[currentRoom.wallStyle] || wallStyles.brick

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b-4 border-border bg-card px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeave}
              className="p-2 bg-muted hover:bg-destructive/20 hover:text-destructive transition-colors"
              style={{ boxShadow: '2px 2px 0 0 oklch(0.1 0.02 260)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
            <div>
              <h1 className="font-mono text-lg text-foreground">{currentRoom.name}</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyRoomCode}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <span>Código: {currentRoom.code}</span>
                  {copiedCode ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
                <span className="text-xs text-muted-foreground/50">|</span>
                <span className="text-xs text-accent">Use W A S D para mover</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-muted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span className="text-sm">{currentRoom.participants.length}/{currentRoom.maxParticipants}</span>
            </div>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 transition-colors ${showChat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              style={{ boxShadow: '2px 2px 0 0 oklch(0.1 0.02 260)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>

            <button
              onClick={() => setShowVoice(!showVoice)}
              className={`p-2 transition-colors ${showVoice ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}
              style={{ boxShadow: '2px 2px 0 0 oklch(0.1 0.02 260)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
            </button>

            {currentRoom.ownerId === user?.id && (
              <button
                onClick={onEditRoom}
                className="p-2 bg-accent text-accent-foreground"
                style={{ boxShadow: '2px 2px 0 0 oklch(0.1 0.02 260)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          {/* Wall */}
          <div
            className="absolute top-0 left-0 right-0 h-24"
            style={{ background: wall.pattern, backgroundColor: wall.color }}
          >
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/20" />
          </div>

          {/* Game Area */}
          <div
            ref={roomRef}
            className="absolute top-24 left-0 right-0 bottom-0"
            style={{ background: floor.pattern, backgroundColor: floor.color }}
          >
            {/* Grid */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0,0,0,.1) 25%, rgba(0,0,0,.1) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.1) 75%, rgba(0,0,0,.1) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(0,0,0,.1) 25%, rgba(0,0,0,.1) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.1) 75%, rgba(0,0,0,.1) 76%, transparent 77%)',
              backgroundSize: '50px 50px',
            }} />

            {/* Furniture */}
            {currentRoom.furniture.map((furniture) => (
              <FurnitureItem key={furniture.id} furniture={furniture} />
            ))}

            {/* Players */}
            {currentRoom.participants.map((participant) => (
              <PlayerCharacter
                key={participant.id}
                participant={participant}
                isCurrentUser={participant.id === user?.id}
                currentUserPosition={currentRoom.participants.find(p => p.id === user?.id)?.position}
              />
            ))}
          </div>

          {/* Voice Chat Overlay */}
          {showVoice && (
            <div className="absolute top-28 left-4 z-10">
              <VoiceChat />
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 flex-shrink-0 border-l-4 border-border bg-card">
            <GameChat />
          </div>
        )}
      </div>
    </div>
  )
}

function PlayerCharacter({
  participant,
  isCurrentUser,
  currentUserPosition,
}: {
  participant: RoomParticipant
  isCurrentUser: boolean
  currentUserPosition?: { x: number; y: number }
}) {
  const getDistanceOpacity = () => {
    if (!currentUserPosition || isCurrentUser) return 1
    const dx = participant.position.x - currentUserPosition.x
    const dy = participant.position.y - currentUserPosition.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return Math.max(0.3, 1 - distance / 500)
  }

  return (
    <div
      className={`absolute ${isCurrentUser ? 'z-20' : 'z-10'}`}
      style={{
        left: participant.position.x - 24,
        top: participant.position.y - 72,
        opacity: getDistanceOpacity(),
        transition: isCurrentUser ? 'none' : 'left 0.1s linear, top 0.1s linear',
      }}
    >
      {/* Speaking indicator */}
      {participant.isSpeaking && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div className="w-1 h-2 bg-secondary animate-pulse" />
          <div className="w-1 h-3 bg-secondary animate-pulse" style={{ animationDelay: '100ms' }} />
          <div className="w-1 h-4 bg-secondary animate-pulse" style={{ animationDelay: '200ms' }} />
          <div className="w-1 h-3 bg-secondary animate-pulse" style={{ animationDelay: '100ms' }} />
          <div className="w-1 h-2 bg-secondary animate-pulse" />
        </div>
      )}

      <PixelAvatar
        character={participant.character}
        size="md"
        isWalking={participant.isWalking}
        direction={participant.direction}
        showName
        isSpeaking={participant.isSpeaking}
      />

      {/* Current user indicator */}
      {isCurrentUser && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="w-2 h-2 bg-primary animate-pulse" />
        </div>
      )}
    </div>
  )
}

function FurnitureItem({ furniture }: { furniture: RoomFurniture }) {
  const sprite = furnitureSprites[furniture.type]
  if (!sprite) return null

  return (
    <div
      className="absolute pointer-events-none z-5"
      style={{
        left: furniture.position.x,
        top: furniture.position.y,
        transform: `rotate(${furniture.rotation}deg)`,
      }}
    >
      {sprite.render()}
    </div>
  )
}
