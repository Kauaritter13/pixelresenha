'use client'

import { useState } from 'react'
import { useGame } from '@/lib/game-context'

interface LoginScreenProps {
  onRegister: () => void
  onSuccess: () => void
}

export function LoginScreen({ onRegister, onSuccess }: LoginScreenProps) {
  const { login } = useGame()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        onSuccess()
      } else {
        setError('E-mail ou senha incorretos')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background">
        <div className="absolute inset-0 opacity-30">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary animate-pulse"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                animationDelay: `${(i * 0.06) % 3}s`,
                animationDuration: `${2 + (i * 0.04) % 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="pixel-panel p-8">
          <div className="text-center mb-8">
            <h1 className="game-title text-primary mb-2">PixelResenha</h1>
            <p className="text-muted-foreground text-lg">Sua resenha online multiplayer</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm text-muted-foreground mb-2">E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="pixel-input w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-muted-foreground mb-2">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="pixel-input w-full"
                required
                minLength={4}
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/20 border-2 border-destructive text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="pixel-button w-full bg-primary text-primary-foreground disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Ainda não tem conta?{' '}
              <button
                onClick={onRegister}
                className="text-secondary hover:text-secondary/80 underline underline-offset-4"
              >
                Criar conta
              </button>
            </p>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <div className="w-3 h-3 bg-primary animate-pulse" />
            <div className="w-3 h-3 bg-secondary animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 bg-accent animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
        <p className="text-center text-muted-foreground text-sm mt-4">v2.0.0 - Multiplayer Real</p>
      </div>
    </div>
  )
}
