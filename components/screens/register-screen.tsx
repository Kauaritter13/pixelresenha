'use client'

import { useState } from 'react'
import { useGame, type CharacterCustomization } from '@/lib/game-context'
import { CharacterEditor } from '@/components/game/character-editor'

interface RegisterScreenProps {
  onLogin: () => void
  onSuccess: () => void
}

type Step = 'account' | 'character'

export function RegisterScreen({ onLogin, onSuccess }: RegisterScreenProps) {
  const { register } = useGame()
  const [step, setStep] = useState<Step>('account')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem!')
      return
    }

    if (password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres!')
      return
    }

    if (username.length < 3) {
      setError('O nome de usuário deve ter pelo menos 3 caracteres!')
      return
    }

    setStep('character')
  }

  const handleCharacterSave = async (character: CharacterCustomization) => {
    setIsLoading(true)
    setError('')

    try {
      const success = await register({
        email,
        username,
        password,
        displayName: displayName || username,
        character: {
          ...character,
          name: displayName || username,
        },
      })

      if (success) {
        onSuccess()
      } else {
        setError('Erro ao criar conta. Usuário ou email já existe.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background">
        <div className="absolute inset-0 opacity-20">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-secondary animate-pulse"
              style={{
                left: `${(i * 41) % 100}%`,
                top: `${(i * 59) % 100}%`,
                animationDelay: `${(i * 0.1) % 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-6">
          <h1 className="game-title text-secondary mb-2">Criar Conta</h1>
          <p className="text-muted-foreground text-lg">
            {step === 'account' ? 'Preencha seus dados para começar' : 'Agora crie seu personagem!'}
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 flex items-center justify-center font-mono text-sm ${step === 'account' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}
              style={{ boxShadow: '2px 2px 0 0 oklch(0.1 0.02 260)' }}
            >1</div>
            <span className={step === 'account' ? 'text-secondary' : 'text-muted-foreground'}>Conta</span>
          </div>
          <div className="w-8 h-0.5 bg-border self-center" />
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 flex items-center justify-center font-mono text-sm ${step === 'character' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}
              style={{ boxShadow: '2px 2px 0 0 oklch(0.1 0.02 260)' }}
            >2</div>
            <span className={step === 'character' ? 'text-secondary' : 'text-muted-foreground'}>Personagem</span>
          </div>
        </div>

        {step === 'account' && (
          <div className="pixel-panel p-8 max-w-md mx-auto">
            <form onSubmit={handleAccountSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm text-muted-foreground mb-2">E-mail</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="pixel-input w-full" required />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm text-muted-foreground mb-2">Nome de Usuário</label>
                <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="meu_usuario" className="pixel-input w-full" required minLength={3} maxLength={20} />
                <p className="text-xs text-muted-foreground mt-1">Apenas letras minúsculas, números e underscore</p>
              </div>
              <div>
                <label htmlFor="displayName" className="block text-sm text-muted-foreground mb-2">Nome de Exibição</label>
                <input type="text" id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Como você quer ser chamado" className="pixel-input w-full" maxLength={20} />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm text-muted-foreground mb-2">Senha</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" className="pixel-input w-full" required minLength={4} />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm text-muted-foreground mb-2">Confirmar Senha</label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="********" className="pixel-input w-full" required />
              </div>

              {error && (
                <div className="p-3 bg-destructive/20 border-2 border-destructive text-destructive text-sm">{error}</div>
              )}

              <button type="submit" className="pixel-button w-full bg-secondary text-secondary-foreground">Continuar</button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Já tem uma conta?{' '}
                <button onClick={onLogin} className="text-primary hover:text-primary/80 underline underline-offset-4">Fazer login</button>
              </p>
            </div>
          </div>
        )}

        {step === 'character' && (
          <div className="relative">
            <button onClick={() => setStep('account')} className="absolute -top-12 left-0 text-muted-foreground hover:text-foreground flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>

            {error && (
              <div className="mb-4 p-3 bg-destructive/20 border-2 border-destructive text-destructive text-sm text-center">{error}</div>
            )}

            <CharacterEditor onSave={handleCharacterSave} showNameField={false} />

            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="pixel-panel p-6 flex flex-col items-center gap-4">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-primary animate-pulse" />
                    <div className="w-3 h-3 bg-secondary animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="w-3 h-3 bg-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <p className="text-muted-foreground">Criando sua conta...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
