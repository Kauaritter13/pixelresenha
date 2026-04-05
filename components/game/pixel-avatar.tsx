'use client'

import { type CharacterCustomization } from '@/lib/game-context'

interface PixelAvatarProps {
  character: CharacterCustomization
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isWalking?: boolean
  direction?: 'left' | 'right' | 'up' | 'down'
  showName?: boolean
  isSpeaking?: boolean
  className?: string
}

const sizeMap = {
  sm: { width: 32, height: 48, scale: 1 },
  md: { width: 48, height: 72, scale: 1.5 },
  lg: { width: 64, height: 96, scale: 2 },
  xl: { width: 96, height: 144, scale: 3 },
}

// Estilos de cabelo
const hairStyles: Record<string, (color: string, direction: string) => JSX.Element> = {
  short: (color, direction) => (
    <g transform={direction === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="8" y="4" width="16" height="6" fill={color} />
      <rect x="6" y="6" width="4" height="4" fill={color} />
      <rect x="22" y="6" width="4" height="4" fill={color} />
    </g>
  ),
  long: (color, direction) => (
    <g transform={direction === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="4" width="20" height="6" fill={color} />
      <rect x="4" y="6" width="4" height="14" fill={color} />
      <rect x="24" y="6" width="4" height="14" fill={color} />
    </g>
  ),
  spiky: (color, direction) => (
    <g transform={direction === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="8" y="6" width="16" height="4" fill={color} />
      <rect x="10" y="2" width="4" height="4" fill={color} />
      <rect x="18" y="2" width="4" height="4" fill={color} />
      <rect x="14" y="0" width="4" height="4" fill={color} />
    </g>
  ),
  mohawk: (color, direction) => (
    <g transform={direction === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="12" y="0" width="8" height="2" fill={color} />
      <rect x="12" y="2" width="8" height="2" fill={color} />
      <rect x="12" y="4" width="8" height="4" fill={color} />
    </g>
  ),
  curly: (color, direction) => (
    <g transform={direction === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="4" width="20" height="6" fill={color} />
      <rect x="4" y="6" width="4" height="4" fill={color} />
      <rect x="24" y="6" width="4" height="4" fill={color} />
      <rect x="8" y="2" width="4" height="4" fill={color} />
      <rect x="20" y="2" width="4" height="4" fill={color} />
    </g>
  ),
  bald: () => <></>,
}

// Estilos de chapéu
const hatStyles: Record<string, (direction: string) => JSX.Element> = {
  cap: (direction) => (
    <g transform={direction === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="2" width="20" height="6" fill="#E53935" />
      <rect x="22" y="4" width="8" height="4" fill="#E53935" />
      <rect x="6" y="6" width="20" height="2" fill="#B71C1C" />
    </g>
  ),
  crown: (direction) => (
    <g transform={direction === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="4" width="20" height="4" fill="#FFD700" />
      <rect x="8" y="0" width="4" height="4" fill="#FFD700" />
      <rect x="14" y="0" width="4" height="4" fill="#FFD700" />
      <rect x="20" y="0" width="4" height="4" fill="#FFD700" />
      <rect x="10" y="2" width="2" height="2" fill="#E53935" />
      <rect x="16" y="2" width="2" height="2" fill="#4CAF50" />
      <rect x="22" y="2" width="2" height="2" fill="#2196F3" />
    </g>
  ),
  beanie: (direction) => (
    <g transform={direction === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="4" width="20" height="6" fill="#7B1FA2" />
      <rect x="8" y="2" width="16" height="4" fill="#7B1FA2" />
      <rect x="14" y="0" width="4" height="4" fill="#7B1FA2" />
    </g>
  ),
  tophat: (direction) => (
    <g transform={direction === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="4" y="6" width="24" height="2" fill="#1A1A1A" />
      <rect x="8" y="-4" width="16" height="10" fill="#1A1A1A" />
      <rect x="8" y="0" width="16" height="2" fill="#E53935" />
    </g>
  ),
}

// Estilos de acessório
const accessoryStyles: Record<string, (direction: string) => JSX.Element> = {
  glasses: (direction) => (
    <g transform={direction === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="12" width="8" height="4" fill="#1A1A1A" stroke="#333" strokeWidth="1" />
      <rect x="18" y="12" width="8" height="4" fill="#1A1A1A" stroke="#333" strokeWidth="1" />
      <rect x="14" y="13" width="4" height="2" fill="#1A1A1A" />
    </g>
  ),
  sunglasses: (direction) => (
    <g transform={direction === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="12" width="8" height="4" fill="#1A1A1A" />
      <rect x="18" y="12" width="8" height="4" fill="#1A1A1A" />
      <rect x="14" y="13" width="4" height="2" fill="#1A1A1A" />
    </g>
  ),
  earring: (direction) => (
    <g transform={direction === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <circle cx="26" cy="18" r="2" fill="#FFD700" />
    </g>
  ),
  mask: (direction) => (
    <g transform={direction === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="8" y="16" width="16" height="6" fill="#90CAF9" />
      <rect x="6" y="18" width="4" height="2" fill="#64B5F6" />
      <rect x="22" y="18" width="4" height="2" fill="#64B5F6" />
    </g>
  ),
}

export function PixelAvatar({
  character,
  size = 'md',
  isWalking = false,
  direction = 'down',
  showName = false,
  isSpeaking = false,
  className = '',
}: PixelAvatarProps) {
  const { width, height } = sizeMap[size]
  
  const renderHair = () => {
    const HairComponent = hairStyles[character.hairStyle] || hairStyles.short
    return HairComponent(character.hairColor, direction)
  }

  const renderHat = () => {
    if (!character.hatStyle) return null
    const HatComponent = hatStyles[character.hatStyle]
    return HatComponent ? HatComponent(direction) : null
  }

  const renderAccessory = () => {
    if (!character.accessory) return null
    const AccessoryComponent = accessoryStyles[character.accessory]
    return AccessoryComponent ? AccessoryComponent(direction) : null
  }

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Indicador de fala */}
      {isSpeaking && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-2 bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-3 bg-primary animate-pulse" style={{ animationDelay: '100ms' }} />
            <div className="w-1 h-4 bg-primary animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-1 h-3 bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
            <div className="w-1 h-2 bg-primary animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      )}

      {/* Avatar SVG */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 32 48"
        className={`${isWalking ? 'animate-walk' : ''}`}
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Sombra */}
        <ellipse cx="16" cy="46" rx="8" ry="2" fill="rgba(0,0,0,0.3)" />

        {/* Corpo/Camiseta */}
        <rect x="8" y="22" width="16" height="12" fill={character.shirtColor} />
        <rect x="6" y="24" width="4" height="8" fill={character.shirtColor} /> {/* Braço esquerdo */}
        <rect x="22" y="24" width="4" height="8" fill={character.shirtColor} /> {/* Braço direito */}
        {/* Detalhes da camiseta */}
        <rect x="12" y="24" width="8" height="2" fill={`${character.shirtColor}88`} />
        
        {/* Mãos */}
        <rect x="6" y="30" width="4" height="4" fill={character.skinTone} />
        <rect x="22" y="30" width="4" height="4" fill={character.skinTone} />

        {/* Calça */}
        <rect x="8" y="32" width="16" height="8" fill={character.pantsColor} />
        <rect x="8" y="32" width="7" height="10" fill={character.pantsColor} /> {/* Perna esquerda */}
        <rect x="17" y="32" width="7" height="10" fill={character.pantsColor} /> {/* Perna direita */}
        {/* Linha da calça */}
        <rect x="15" y="34" width="2" height="6" fill={`${character.pantsColor}88`} />

        {/* Sapatos */}
        <rect x="6" y="40" width="8" height="4" fill="#2D2D2D" />
        <rect x="18" y="40" width="8" height="4" fill="#2D2D2D" />
        <rect x="6" y="42" width="2" height="2" fill="#1A1A1A" />
        <rect x="24" y="42" width="2" height="2" fill="#1A1A1A" />

        {/* Cabeça */}
        <rect x="8" y="8" width="16" height="16" fill={character.skinTone} />
        
        {/* Cabelo */}
        {renderHair()}
        
        {/* Chapéu (sobrepõe cabelo) */}
        {renderHat()}

        {/* Olhos */}
        {direction !== 'up' && (
          <>
            <rect x="10" y="14" width="4" height="4" fill="white" />
            <rect x="18" y="14" width="4" height="4" fill="white" />
            <rect 
              x={direction === 'left' ? 10 : direction === 'right' ? 12 : 11} 
              y="15" 
              width="2" 
              height="2" 
              fill="#1A1A1A" 
            />
            <rect 
              x={direction === 'left' ? 18 : direction === 'right' ? 20 : 19} 
              y="15" 
              width="2" 
              height="2" 
              fill="#1A1A1A" 
            />
          </>
        )}

        {/* Boca */}
        {direction !== 'up' && (
          <rect x="13" y="20" width="6" height="2" fill="#C4756E" />
        )}

        {/* Acessórios */}
        {renderAccessory()}

        {/* Pescoço */}
        <rect x="12" y="22" width="8" height="4" fill={character.skinTone} />
      </svg>

      {/* Nome do personagem */}
      {showName && character.name && (
        <div className="mt-1 px-2 py-0.5 bg-background/90 rounded text-xs font-mono text-center whitespace-nowrap border border-border">
          {character.name}
        </div>
      )}
    </div>
  )
}

// Componente para preview no editor de personagem
export function CharacterPreviewPanel({
  character,
  className = '',
}: {
  character: CharacterCustomization
  className?: string
}) {
  return (
    <div className={`pixel-panel p-6 flex flex-col items-center ${className}`}>
      <h3 className="font-mono text-lg text-primary mb-4">Preview</h3>
      
      <div className="flex gap-8 items-end">
        {/* Direções */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">Frente</span>
          <PixelAvatar character={character} size="lg" direction="down" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">Lado</span>
          <PixelAvatar character={character} size="lg" direction="right" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">Costas</span>
          <PixelAvatar character={character} size="lg" direction="up" />
        </div>
      </div>

      {/* Animação de andar */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">Andando</span>
        <PixelAvatar character={character} size="lg" direction="right" isWalking />
      </div>
    </div>
  )
}
