'use client'

import { useState } from 'react'

const ACTIVITY_PRESETS = [
  { id: 'none', label: 'Nenhum', icon: '🟢', category: 'status' },
  { id: 'away', label: 'Ausente', icon: '🟡', category: 'status' },
  { id: 'busy', label: 'Ocupado', icon: '🔴', category: 'status' },
  { id: 'valorant', label: 'Valorant', icon: '🎮', category: 'game' },
  { id: 'fortnite', label: 'Fortnite', icon: '🎮', category: 'game' },
  { id: 'minecraft', label: 'Minecraft', icon: '⛏️', category: 'game' },
  { id: 'lol', label: 'League of Legends', icon: '🎮', category: 'game' },
  { id: 'csgo', label: 'CS2', icon: '🎮', category: 'game' },
  { id: 'gta', label: 'GTA V', icon: '🎮', category: 'game' },
  { id: 'roblox', label: 'Roblox', icon: '🎮', category: 'game' },
  { id: 'terraria', label: 'Terraria', icon: '🎮', category: 'game' },
  { id: 'apex', label: 'Apex Legends', icon: '🎮', category: 'game' },
  { id: 'overwatch', label: 'Overwatch 2', icon: '🎮', category: 'game' },
  { id: 'spotify', label: 'Ouvindo Spotify', icon: '🎵', category: 'app' },
  { id: 'youtube', label: 'Assistindo YouTube', icon: '📺', category: 'app' },
  { id: 'twitch', label: 'Assistindo Twitch', icon: '📺', category: 'app' },
  { id: 'netflix', label: 'Assistindo Netflix', icon: '📺', category: 'app' },
  { id: 'studying', label: 'Estudando', icon: '📚', category: 'activity' },
  { id: 'working', label: 'Trabalhando', icon: '💻', category: 'activity' },
  { id: 'drawing', label: 'Desenhando', icon: '🎨', category: 'activity' },
  { id: 'coding', label: 'Programando', icon: '👨‍💻', category: 'activity' },
  { id: 'eating', label: 'Comendo', icon: '🍕', category: 'activity' },
  { id: 'sleeping', label: 'Dormindo', icon: '😴', category: 'activity' },
]

interface ActivityStatusProps {
  currentActivity: string | null
  customStatus: string | null
  onSetActivity: (activity: string | null, custom: string | null) => void
  compact?: boolean
}

export function ActivityStatusPicker({ currentActivity, customStatus, onSetActivity, compact = false }: ActivityStatusProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customText, setCustomText] = useState(customStatus || '')
  const [activeCategory, setActiveCategory] = useState<string>('game')

  const current = ACTIVITY_PRESETS.find(a => a.id === currentActivity)

  const categories = [
    { id: 'status', label: 'Status' },
    { id: 'game', label: 'Jogos' },
    { id: 'app', label: 'Apps' },
    { id: 'activity', label: 'Atividades' },
  ]

  if (compact) {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 border border-border hover:border-primary/50 transition-colors text-xs"
      >
        <span>{current?.icon || '🟢'}</span>
        <span className="text-muted-foreground truncate max-w-24">
          {customStatus || current?.label || 'Online'}
        </span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-muted/50 border-2 border-border hover:border-primary/50 transition-colors"
      >
        <span className="text-lg">{current?.icon || '🟢'}</span>
        <div className="flex-1 text-left">
          <p className="text-sm">{customStatus || current?.label || 'Online'}</p>
          {current && current.id !== 'none' && !customStatus && (
            <p className="text-xs text-muted-foreground">{current.category === 'game' ? 'Jogando' : current.category === 'app' ? 'Usando' : ''}</p>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 pixel-panel p-4 z-50 max-h-80 overflow-y-auto">
          {/* Custom status input */}
          <div className="mb-3">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Status personalizado..."
              className="pixel-input w-full text-sm"
              maxLength={40}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customText.trim()) {
                  onSetActivity(currentActivity, customText.trim())
                  setIsOpen(false)
                }
              }}
            />
            {customText.trim() && (
              <button
                onClick={() => {
                  onSetActivity(currentActivity, customText.trim())
                  setIsOpen(false)
                }}
                className="mt-1 text-xs text-primary hover:underline"
              >
                Definir status
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 mb-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2 py-1 text-xs transition-colors ${
                  activeCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Activity list */}
          <div className="space-y-1">
            {ACTIVITY_PRESETS.filter(a => a.category === activeCategory).map(activity => (
              <button
                key={activity.id}
                onClick={() => {
                  onSetActivity(activity.id === 'none' ? null : activity.id, null)
                  setCustomText('')
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm transition-colors hover:bg-muted/80 ${
                  currentActivity === activity.id ? 'bg-primary/20 text-primary' : ''
                }`}
              >
                <span>{activity.icon}</span>
                <span>{activity.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Display component for showing someone's activity
export function ActivityBadge({ activity, customStatus, className = '' }: {
  activity: string | null
  customStatus: string | null
  className?: string
}) {
  const preset = ACTIVITY_PRESETS.find(a => a.id === activity)

  if (!activity && !customStatus) return null

  return (
    <div className={`flex items-center gap-1 text-xs ${className}`}>
      <span>{preset?.icon || '🟢'}</span>
      <span className="text-muted-foreground truncate">
        {customStatus || (preset ? `${preset.category === 'game' ? 'Jogando ' : ''}${preset.label}` : 'Online')}
      </span>
    </div>
  )
}
