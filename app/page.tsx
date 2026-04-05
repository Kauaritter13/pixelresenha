'use client'

import { useState, useEffect } from 'react'
import { useGame } from '@/lib/game-context'
import { LoginScreen } from '@/components/screens/login-screen'
import { RegisterScreen } from '@/components/screens/register-screen'
import { LobbyScreen } from '@/components/screens/lobby-screen'
import { CreateRoomScreen } from '@/components/screens/create-room-screen'
import { JoinRoomScreen } from '@/components/screens/join-room-screen'
import { GameRoom } from '@/components/game/game-room'
import { ProfileScreen } from '@/components/screens/profile-screen'
import { SettingsScreen } from '@/components/screens/settings-screen'
import { RoomEditorScreen } from '@/components/screens/room-editor-screen'

type Screen =
  | 'login'
  | 'register'
  | 'lobby'
  | 'create-room'
  | 'join-room'
  | 'game-room'
  | 'profile'
  | 'settings'
  | 'room-editor'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="pixel-panel p-8 flex flex-col items-center gap-4">
        <h1 className="game-title text-primary text-xl">PixelResenha</h1>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-primary animate-pulse" />
          <div className="w-3 h-3 bg-secondary animate-pulse" style={{ animationDelay: '0.1s' }} />
          <div className="w-3 h-3 bg-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
        </div>
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    </div>
  )
}

export default function Home() {
  const { state, logout } = useGame()
  const [screen, setScreen] = useState<Screen>('login')
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Auto-redirect based on auth state (session is checked by GameContext on mount)
  useEffect(() => {
    if (!hasMounted || state.isLoading) return

    if (state.user && (screen === 'login' || screen === 'register')) {
      setScreen('lobby')
    } else if (!state.user && screen !== 'login' && screen !== 'register') {
      setScreen('login')
    }
  }, [hasMounted, state.user, state.isLoading, screen])

  // Redirect when entering a room
  useEffect(() => {
    if (state.currentRoom && screen !== 'game-room' && screen !== 'room-editor') {
      setScreen('game-room')
    }
  }, [state.currentRoom, screen])

  const handleLogout = async () => {
    await logout()
    setScreen('login')
  }

  if (!hasMounted || state.isLoading) {
    return <LoadingScreen />
  }

  switch (screen) {
    case 'login':
      return (
        <LoginScreen
          onRegister={() => setScreen('register')}
          onSuccess={() => setScreen('lobby')}
        />
      )

    case 'register':
      return (
        <RegisterScreen
          onLogin={() => setScreen('login')}
          onSuccess={() => setScreen('lobby')}
        />
      )

    case 'lobby':
      return (
        <LobbyScreen
          onCreateRoom={() => setScreen('create-room')}
          onJoinRoom={() => setScreen('join-room')}
          onProfile={() => setScreen('profile')}
          onSettings={() => setScreen('settings')}
          onEnterRoom={() => setScreen('game-room')}
          onLogout={handleLogout}
        />
      )

    case 'create-room':
      return (
        <CreateRoomScreen
          onBack={() => setScreen('lobby')}
          onSuccess={() => setScreen('game-room')}
        />
      )

    case 'join-room':
      return (
        <JoinRoomScreen
          onBack={() => setScreen('lobby')}
          onSuccess={() => setScreen('game-room')}
        />
      )

    case 'game-room':
      return (
        <GameRoom
          onLeave={() => setScreen('lobby')}
          onEditRoom={() => setScreen('room-editor')}
        />
      )

    case 'room-editor':
      return (
        <RoomEditorScreen
          onBack={() => setScreen('game-room')}
        />
      )

    case 'profile':
      return (
        <ProfileScreen
          onBack={() => setScreen('lobby')}
        />
      )

    case 'settings':
      return (
        <SettingsScreen
          onBack={() => setScreen('lobby')}
          onLogout={handleLogout}
        />
      )

    default:
      return (
        <LoginScreen
          onRegister={() => setScreen('register')}
          onSuccess={() => setScreen('lobby')}
        />
      )
  }
}
