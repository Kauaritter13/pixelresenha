'use client'

import { useState, useRef, useEffect } from 'react'
import { useGame } from '@/lib/game-context'

export function GameChat() {
  const { state, sendMessage } = useGame()
  const { chatMessages, user } = state
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    sendMessage(message)
    setMessage('')
    inputRef.current?.focus()
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const quickEmotes = [
    { emoji: 'Oi!', label: 'Cumprimentar' },
    { emoji: 'Haha!', label: 'Rir' },
    { emoji: 'Show!', label: 'Aprovar' },
    { emoji: 'Partiu!', label: 'Chamar' },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-3 border-b-2 border-border">
        <h3 className="font-mono text-sm text-foreground">Chat da Sala</h3>
        <p className="text-xs text-muted-foreground">{chatMessages.length} mensagens</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/50 mb-3">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
            <p className="text-xs text-muted-foreground/70">Seja o primeiro a falar!</p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`${
                msg.type === 'system'
                  ? 'text-center'
                  : String(msg.senderId) === String(user?.id)
                  ? 'text-right'
                  : 'text-left'
              }`}
            >
              {msg.type === 'system' ? (
                <div className="inline-block px-3 py-1 bg-muted/50 text-xs text-muted-foreground border border-border">
                  {msg.content}
                </div>
              ) : (
                <div
                  className={`inline-block max-w-[85%] ${
                    String(msg.senderId) === String(user?.id) ? 'text-left' : ''
                  }`}
                >
                  <div className={`flex items-center gap-2 mb-1 ${
                    String(msg.senderId) === String(user?.id) ? 'justify-end' : ''
                  }`}>
                    <span className={`text-xs font-mono ${
                      String(msg.senderId) === String(user?.id) ? 'text-primary' : 'text-secondary'
                    }`}>
                      {msg.senderName}
                    </span>
                    <span className="text-xs text-muted-foreground/70">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-2 ${
                      String(msg.senderId) === String(user?.id)
                        ? 'bg-primary/20 border-2 border-primary text-foreground'
                        : 'bg-muted border-2 border-border text-foreground'
                    }`}
                    style={{
                      boxShadow: String(msg.senderId) === String(user?.id)
                        ? '2px 2px 0 0 oklch(0.5 0.12 145)'
                        : '2px 2px 0 0 oklch(0.2 0.02 260)',
                    }}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 px-3 py-2 border-t border-border/50">
        <div className="flex gap-2">
          {quickEmotes.map((emote) => (
            <button
              key={emote.emoji}
              onClick={() => sendMessage(emote.emoji)}
              className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 border border-border transition-colors"
              title={emote.label}
            >
              {emote.emoji}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-shrink-0 p-3 border-t-2 border-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="pixel-input flex-1 text-sm py-2"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-4 bg-primary text-primary-foreground disabled:opacity-50 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
            style={{ boxShadow: '2px 2px 0 0 oklch(0.5 0.12 145)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

export function ChatBubble({ message, senderName }: { message: string; senderName: string }) {
  return (
    <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="relative bg-foreground text-background px-3 py-2 text-sm max-w-48 rounded">
        <span className="text-xs opacity-70">{senderName}: </span>
        <span>{message}</span>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-foreground" />
      </div>
    </div>
  )
}
