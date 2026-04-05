'use client'

import { useState } from 'react'
import { useGame } from '@/lib/game-context'

interface RoomEditorScreenProps {
  onBack: () => void
}

const floorOptions = [
  { id: 'wood', label: 'Madeira', color: '#8B6914' },
  { id: 'carpet', label: 'Carpete', color: '#6B4C7A' },
  { id: 'tile', label: 'Azulejo', color: '#E0E0E0' },
  { id: 'grass', label: 'Grama', color: '#4CAF50' },
]

const wallOptions = [
  { id: 'brick', label: 'Tijolo', color: '#8B4513' },
  { id: 'wallpaper', label: 'Papel de Parede', color: '#B8860B' },
  { id: 'modern', label: 'Moderno', color: '#37474F' },
  { id: 'pink', label: 'Rosa', color: '#EC407A' },
]

const furnitureOptions = [
  { id: 'sofa', label: 'Sofá', icon: '🛋️' },
  { id: 'table', label: 'Mesa', icon: '🪑' },
  { id: 'plant', label: 'Planta', icon: '🌿' },
  { id: 'lamp', label: 'Luminária', icon: '💡' },
  { id: 'tv', label: 'TV', icon: '📺' },
  { id: 'chair', label: 'Cadeira', icon: '🪑' },
  { id: 'bed', label: 'Cama', icon: '🛏️' },
]

export function RoomEditorScreen({ onBack }: RoomEditorScreenProps) {
  const { state, updateRoomDecor, addFurniture, removeFurniture } = useGame()
  const { currentRoom } = state
  const [activeTab, setActiveTab] = useState<'floor' | 'wall' | 'furniture'>('floor')
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null)

  if (!currentRoom) return null

  const handleFloorChange = (floorStyle: string) => {
    updateRoomDecor(floorStyle, currentRoom.wallStyle)
  }

  const handleWallChange = (wallStyle: string) => {
    updateRoomDecor(currentRoom.floorStyle, wallStyle)
  }

  const handleAddFurniture = (type: string) => {
    addFurniture({
      type,
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 150 },
      rotation: 0,
    })
  }

  const handleRemoveFurniture = (id: string) => {
    removeFurniture(id)
    setSelectedFurniture(null)
  }

  const tabs = [
    { id: 'floor', label: 'Piso', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="12" y1="3" x2="12" y2="21" />
      </svg>
    )},
    { id: 'wall', label: 'Parede', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="9" />
        <line x1="15" y1="3" x2="15" y2="9" />
        <line x1="6" y1="9" x2="6" y2="15" />
        <line x1="12" y1="9" x2="12" y2="15" />
        <line x1="18" y1="9" x2="18" y2="15" />
        <line x1="9" y1="15" x2="9" y2="21" />
        <line x1="15" y1="15" x2="15" y2="21" />
      </svg>
    )},
    { id: 'furniture', label: 'Móveis', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 10c0-4.4-3.6-8-8-8s-8 3.6-8 8h16z" />
        <rect x="4" y="10" width="16" height="6" />
        <line x1="6" y1="16" x2="6" y2="20" />
        <line x1="18" y1="16" x2="18" y2="20" />
      </svg>
    )},
  ] as const

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-4 border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
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
            <div>
              <h1 className="font-mono text-lg text-foreground">Editor da Sala</h1>
              <p className="text-xs text-muted-foreground">{currentRoom.name}</p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="pixel-button bg-primary text-primary-foreground"
          >
            Salvar e Voltar
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Preview da Sala */}
        <div className="flex-1 relative overflow-hidden">
          {/* Parede */}
          <div
            className="absolute top-0 left-0 right-0 h-32"
            style={{
              background: wallOptions.find(w => w.id === currentRoom.wallStyle)?.color || wallOptions[0].color,
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/20" />
          </div>

          {/* Piso */}
          <div
            className="absolute top-32 left-0 right-0 bottom-0"
            style={{
              background: floorOptions.find(f => f.id === currentRoom.floorStyle)?.color || floorOptions[0].color,
            }}
          >
            {/* Grid */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.3) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255,255,255,0.3) 50px)',
              backgroundSize: '50px 50px',
            }} />

            {/* Móveis */}
            {currentRoom.furniture.map((furniture) => (
              <div
                key={furniture.id}
                className={`absolute cursor-pointer transition-all ${
                  selectedFurniture === furniture.id
                    ? 'ring-4 ring-primary ring-offset-2 ring-offset-transparent'
                    : 'hover:ring-2 hover:ring-secondary'
                }`}
                style={{
                  left: furniture.position.x,
                  top: furniture.position.y - 32,
                }}
                onClick={() => setSelectedFurniture(
                  selectedFurniture === furniture.id ? null : furniture.id
                )}
              >
                <div className="w-16 h-16 bg-muted/50 border-2 border-border flex items-center justify-center text-2xl">
                  {furnitureOptions.find(f => f.id === furniture.type)?.icon || '📦'}
                </div>
              </div>
            ))}
          </div>

          {/* Seleção de Móvel */}
          {selectedFurniture && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pixel-panel p-4 flex items-center gap-4">
              <span className="text-sm">
                {furnitureOptions.find(f => f.id === currentRoom.furniture.find(fur => fur.id === selectedFurniture)?.type)?.label || 'Móvel'}
              </span>
              <button
                onClick={() => handleRemoveFurniture(selectedFurniture)}
                className="px-4 py-2 bg-destructive text-destructive-foreground text-sm"
                style={{ boxShadow: '2px 2px 0 0 oklch(0.35 0.15 25)' }}
              >
                Remover
              </button>
            </div>
          )}
        </div>

        {/* Painel de Edição */}
        <div className="w-80 border-l-4 border-border bg-card overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b-2 border-border">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 p-3 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/20 text-primary border-b-2 border-primary -mb-0.5'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* Piso */}
            {activeTab === 'floor' && (
              <div className="space-y-4">
                <h3 className="font-mono text-sm text-muted-foreground">Escolha o Piso</h3>
                <div className="grid grid-cols-2 gap-3">
                  {floorOptions.map(floor => (
                    <button
                      key={floor.id}
                      onClick={() => handleFloorChange(floor.id)}
                      className={`p-4 flex flex-col items-center gap-2 border-2 transition-all ${
                        currentRoom.floorStyle === floor.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div
                        className="w-12 h-12 border border-border"
                        style={{ backgroundColor: floor.color }}
                      />
                      <span className="text-xs">{floor.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Parede */}
            {activeTab === 'wall' && (
              <div className="space-y-4">
                <h3 className="font-mono text-sm text-muted-foreground">Escolha a Parede</h3>
                <div className="grid grid-cols-2 gap-3">
                  {wallOptions.map(wall => (
                    <button
                      key={wall.id}
                      onClick={() => handleWallChange(wall.id)}
                      className={`p-4 flex flex-col items-center gap-2 border-2 transition-all ${
                        currentRoom.wallStyle === wall.id
                          ? 'border-secondary bg-secondary/10'
                          : 'border-border hover:border-secondary/50'
                      }`}
                    >
                      <div
                        className="w-12 h-12 border border-border"
                        style={{ backgroundColor: wall.color }}
                      />
                      <span className="text-xs">{wall.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Móveis */}
            {activeTab === 'furniture' && (
              <div className="space-y-4">
                <h3 className="font-mono text-sm text-muted-foreground">Adicionar Móveis</h3>
                <div className="grid grid-cols-2 gap-3">
                  {furnitureOptions.map(furniture => (
                    <button
                      key={furniture.id}
                      onClick={() => handleAddFurniture(furniture.id)}
                      className="p-4 flex flex-col items-center gap-2 border-2 border-border hover:border-accent transition-all bg-muted/30 hover:bg-accent/10"
                    >
                      <span className="text-2xl">{furniture.icon}</span>
                      <span className="text-xs">{furniture.label}</span>
                    </button>
                  ))}
                </div>

                {/* Lista de móveis na sala */}
                <div className="mt-6 pt-4 border-t-2 border-border">
                  <h4 className="font-mono text-sm text-muted-foreground mb-3">
                    Móveis na Sala ({currentRoom.furniture.length})
                  </h4>
                  {currentRoom.furniture.length === 0 ? (
                    <p className="text-xs text-muted-foreground/70 italic">
                      Nenhum móvel adicionado ainda
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {currentRoom.furniture.map(furniture => (
                        <div
                          key={furniture.id}
                          className={`flex items-center justify-between p-2 border transition-all cursor-pointer ${
                            selectedFurniture === furniture.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedFurniture(
                            selectedFurniture === furniture.id ? null : furniture.id
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {furnitureOptions.find(f => f.id === furniture.type)?.icon}
                            </span>
                            <span className="text-xs">
                              {furnitureOptions.find(f => f.id === furniture.type)?.label}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveFurniture(furniture.id)
                            }}
                            className="p-1 text-destructive hover:bg-destructive/20"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
