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
  chatBubble?: string | null
}

const sizeMap = {
  sm: { width: 32, height: 48, scale: 1 },
  md: { width: 48, height: 72, scale: 1.5 },
  lg: { width: 64, height: 96, scale: 2 },
  xl: { width: 96, height: 144, scale: 3 },
}

// ===== HAIR STYLES (Terraria-inspired) =====
const hairStyles: Record<string, (color: string, dir: string) => JSX.Element> = {
  short: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="8" y="4" width="16" height="6" fill={c} />
      <rect x="6" y="6" width="4" height="4" fill={c} />
      <rect x="22" y="6" width="4" height="4" fill={c} />
    </g>
  ),
  long: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="4" width="20" height="6" fill={c} />
      <rect x="4" y="6" width="4" height="14" fill={c} />
      <rect x="24" y="6" width="4" height="14" fill={c} />
    </g>
  ),
  spiky: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="8" y="6" width="16" height="4" fill={c} />
      <rect x="10" y="2" width="4" height="4" fill={c} />
      <rect x="18" y="2" width="4" height="4" fill={c} />
      <rect x="14" y="0" width="4" height="4" fill={c} />
    </g>
  ),
  mohawk: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="12" y="0" width="8" height="2" fill={c} />
      <rect x="12" y="2" width="8" height="2" fill={c} />
      <rect x="12" y="4" width="8" height="4" fill={c} />
    </g>
  ),
  curly: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="4" width="20" height="6" fill={c} />
      <rect x="4" y="6" width="4" height="4" fill={c} />
      <rect x="24" y="6" width="4" height="4" fill={c} />
      <rect x="8" y="2" width="4" height="4" fill={c} />
      <rect x="20" y="2" width="4" height="4" fill={c} />
    </g>
  ),
  bald: () => <></>,
  ponytail: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="8" y="4" width="16" height="6" fill={c} />
      <rect x="22" y="8" width="4" height="4" fill={c} />
      <rect x="24" y="10" width="4" height="8" fill={c} />
      <rect x="26" y="14" width="2" height="6" fill={c} />
    </g>
  ),
  pigtails: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="4" width="20" height="6" fill={c} />
      <rect x="2" y="8" width="4" height="10" fill={c} />
      <rect x="26" y="8" width="4" height="10" fill={c} />
      <rect x="0" y="14" width="4" height="4" fill={c} />
      <rect x="28" y="14" width="4" height="4" fill={c} />
    </g>
  ),
  afro: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="4" y="0" width="24" height="4" fill={c} />
      <rect x="2" y="2" width="28" height="8" fill={c} />
      <rect x="4" y="8" width="24" height="4" fill={c} />
      <rect x="2" y="4" width="4" height="10" fill={c} />
      <rect x="26" y="4" width="4" height="10" fill={c} />
    </g>
  ),
  messy: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="4" width="20" height="6" fill={c} />
      <rect x="8" y="2" width="6" height="4" fill={c} />
      <rect x="18" y="0" width="4" height="4" fill={c} />
      <rect x="4" y="6" width="4" height="6" fill={c} />
      <rect x="24" y="5" width="4" height="5" fill={c} />
      <rect x="12" y="1" width="4" height="3" fill={c} />
    </g>
  ),
  slicked: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="8" y="4" width="16" height="4" fill={c} />
      <rect x="6" y="6" width="20" height="4" fill={c} />
      <rect x="24" y="8" width="4" height="6" fill={c} />
    </g>
  ),
  buzz: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="8" y="6" width="16" height="4" fill={c} opacity="0.7" />
      <rect x="10" y="4" width="12" height="4" fill={c} opacity="0.5" />
    </g>
  ),
  emo: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="4" y="4" width="20" height="6" fill={c} />
      <rect x="2" y="6" width="10" height="10" fill={c} />
      <rect x="24" y="6" width="4" height="4" fill={c} />
    </g>
  ),
  flowing: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="4" width="20" height="6" fill={c} />
      <rect x="4" y="6" width="4" height="18" fill={c} />
      <rect x="24" y="6" width="4" height="18" fill={c} />
      <rect x="6" y="22" width="4" height="4" fill={c} />
      <rect x="22" y="22" width="4" height="4" fill={c} />
    </g>
  ),
  twintail: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="4" width="20" height="6" fill={c} />
      <rect x="4" y="8" width="4" height="4" fill={c} />
      <rect x="24" y="8" width="4" height="4" fill={c} />
      <rect x="2" y="10" width="4" height="12" fill={c} />
      <rect x="26" y="10" width="4" height="12" fill={c} />
    </g>
  ),
  topknot: (c, d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="8" y="6" width="16" height="4" fill={c} />
      <rect x="12" y="0" width="8" height="6" fill={c} />
      <rect x="10" y="2" width="12" height="2" fill={c} />
    </g>
  ),
}

// ===== HAT STYLES =====
const hatStyleRenderers: Record<string, (d: string) => JSX.Element> = {
  cap: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="2" width="20" height="6" fill="#E53935" />
      <rect x="22" y="4" width="8" height="4" fill="#E53935" />
      <rect x="6" y="6" width="20" height="2" fill="#B71C1C" />
    </g>
  ),
  crown: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="4" width="20" height="4" fill="#FFD700" />
      <rect x="8" y="0" width="4" height="4" fill="#FFD700" />
      <rect x="14" y="0" width="4" height="4" fill="#FFD700" />
      <rect x="20" y="0" width="4" height="4" fill="#FFD700" />
      <rect x="10" y="2" width="2" height="2" fill="#E53935" />
      <rect x="16" y="2" width="2" height="2" fill="#4CAF50" />
      <rect x="22" y="2" width="2" height="2" fill="#2196F3" />
    </g>
  ),
  beanie: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="4" width="20" height="6" fill="#7B1FA2" />
      <rect x="8" y="2" width="16" height="4" fill="#7B1FA2" />
      <rect x="14" y="0" width="4" height="4" fill="#7B1FA2" />
    </g>
  ),
  tophat: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="4" y="6" width="24" height="2" fill="#1A1A1A" />
      <rect x="8" y="-4" width="16" height="10" fill="#1A1A1A" />
      <rect x="8" y="0" width="16" height="2" fill="#E53935" />
    </g>
  ),
  wizard: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="4" width="20" height="4" fill="#3F51B5" />
      <rect x="8" y="0" width="16" height="4" fill="#3F51B5" />
      <rect x="10" y="-4" width="12" height="4" fill="#3F51B5" />
      <rect x="14" y="-8" width="4" height="4" fill="#3F51B5" />
      <rect x="14" y="-6" width="4" height="2" fill="#FFD700" />
    </g>
  ),
  pirate: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="4" width="20" height="4" fill="#1A1A1A" />
      <rect x="8" y="2" width="16" height="4" fill="#1A1A1A" />
      <rect x="14" y="0" width="4" height="4" fill="#1A1A1A" />
      <rect x="12" y="2" width="8" height="2" fill="#E8E8E8" />
    </g>
  ),
  bunny: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="8" y="-8" width="4" height="12" fill="#F5F5F5" />
      <rect x="20" y="-8" width="4" height="12" fill="#F5F5F5" />
      <rect x="9" y="-6" width="2" height="8" fill="#FFCDD2" />
      <rect x="21" y="-6" width="2" height="8" fill="#FFCDD2" />
    </g>
  ),
  horns: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="0" width="4" height="8" fill="#B71C1C" />
      <rect x="4" y="-2" width="4" height="4" fill="#D32F2F" />
      <rect x="22" y="0" width="4" height="8" fill="#B71C1C" />
      <rect x="24" y="-2" width="4" height="4" fill="#D32F2F" />
    </g>
  ),
  headband: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="6" width="20" height="3" fill="#E53935" />
      <rect x="22" y="4" width="6" height="4" fill="#E53935" />
    </g>
  ),
  halo: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="8" y="-2" width="16" height="2" fill="#FFD700" opacity="0.9" />
      <rect x="6" y="0" width="4" height="2" fill="#FFD700" opacity="0.9" />
      <rect x="22" y="0" width="4" height="2" fill="#FFD700" opacity="0.9" />
    </g>
  ),
}

// ===== ACCESSORIES =====
const accessoryRenderers: Record<string, (d: string) => JSX.Element> = {
  glasses: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="12" width="8" height="4" fill="transparent" stroke="#333" strokeWidth="1" />
      <rect x="18" y="12" width="8" height="4" fill="transparent" stroke="#333" strokeWidth="1" />
      <rect x="14" y="13" width="4" height="2" fill="#333" />
    </g>
  ),
  sunglasses: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="12" width="8" height="4" fill="#1A1A1A" />
      <rect x="18" y="12" width="8" height="4" fill="#1A1A1A" />
      <rect x="14" y="13" width="4" height="2" fill="#1A1A1A" />
    </g>
  ),
  earring: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <circle cx="26" cy="18" r="2" fill="#FFD700" />
    </g>
  ),
  mask: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="8" y="16" width="16" height="6" fill="#90CAF9" />
      <rect x="6" y="18" width="4" height="2" fill="#64B5F6" />
      <rect x="22" y="18" width="4" height="2" fill="#64B5F6" />
    </g>
  ),
  scarf: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="8" y="22" width="16" height="4" fill="#E53935" />
      <rect x="6" y="22" width="4" height="6" fill="#E53935" />
      <rect x="4" y="26" width="4" height="6" fill="#E53935" />
    </g>
  ),
  cape: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="4" y="22" width="4" height="18" fill="#7B1FA2" opacity="0.8" />
      <rect x="24" y="22" width="4" height="18" fill="#7B1FA2" opacity="0.8" />
      <rect x="2" y="38" width="6" height="4" fill="#7B1FA2" opacity="0.8" />
      <rect x="24" y="38" width="6" height="4" fill="#7B1FA2" opacity="0.8" />
    </g>
  ),
  eyepatch: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="18" y="12" width="6" height="6" fill="#1A1A1A" />
      <rect x="16" y="10" width="2" height="2" fill="#1A1A1A" />
      <rect x="24" y="14" width="2" height="2" fill="#1A1A1A" />
    </g>
  ),
  beard: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="10" y="20" width="12" height="4" fill="#4A3728" />
      <rect x="12" y="22" width="8" height="4" fill="#4A3728" />
      <rect x="14" y="24" width="4" height="2" fill="#4A3728" />
    </g>
  ),
  bandana: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <rect x="6" y="6" width="20" height="4" fill="#E53935" />
      <rect x="24" y="8" width="6" height="3" fill="#E53935" />
      <rect x="26" y="10" width="4" height="3" fill="#E53935" />
    </g>
  ),
  monocle: (d) => (
    <g transform={d === 'left' ? 'scale(-1,1) translate(-32,0)' : ''}>
      <circle cx="21" cy="14" r="4" fill="transparent" stroke="#FFD700" strokeWidth="1" />
      <rect x="21" y="18" width="1" height="8" fill="#FFD700" />
    </g>
  ),
}

// ===== SHIRT STYLE RENDERING =====
function renderShirt(style: string, color: string, skinTone: string) {
  switch (style) {
    case 'tanktop':
      return (
        <>
          <rect x="10" y="22" width="12" height="12" fill={color} />
          <rect x="8" y="24" width="4" height="8" fill={skinTone} />
          <rect x="22" y="24" width="4" height="8" fill={skinTone} />
          <rect x="12" y="24" width="8" height="2" fill={`${color}88`} />
        </>
      )
    case 'polo':
      return (
        <>
          <rect x="8" y="22" width="16" height="12" fill={color} />
          <rect x="6" y="24" width="4" height="8" fill={color} />
          <rect x="22" y="24" width="4" height="8" fill={color} />
          <rect x="12" y="22" width="8" height="4" fill={`${color}AA`} />
          <rect x="14" y="22" width="4" height="3" fill={`${color}CC`} />
        </>
      )
    case 'hoodie':
      return (
        <>
          <rect x="8" y="22" width="16" height="12" fill={color} />
          <rect x="6" y="24" width="4" height="8" fill={color} />
          <rect x="22" y="24" width="4" height="8" fill={color} />
          <rect x="12" y="26" width="8" height="4" fill={`${color}88`} />
          <rect x="10" y="22" width="12" height="2" fill={`${color}BB`} />
        </>
      )
    case 'jacket':
      return (
        <>
          <rect x="8" y="22" width="16" height="12" fill={color} />
          <rect x="6" y="24" width="4" height="8" fill={color} />
          <rect x="22" y="24" width="4" height="8" fill={color} />
          <rect x="15" y="22" width="2" height="12" fill={`${color}66`} />
          <rect x="8" y="22" width="3" height="12" fill={`${color}BB`} />
          <rect x="21" y="22" width="3" height="12" fill={`${color}BB`} />
        </>
      )
    case 'vest':
      return (
        <>
          <rect x="10" y="22" width="12" height="12" fill="#F5F5F5" />
          <rect x="8" y="22" width="4" height="12" fill={color} />
          <rect x="20" y="22" width="4" height="12" fill={color} />
          <rect x="6" y="24" width="4" height="8" fill="#F5F5F5" />
          <rect x="22" y="24" width="4" height="8" fill="#F5F5F5" />
        </>
      )
    case 'robe':
      return (
        <>
          <rect x="6" y="22" width="20" height="16" fill={color} />
          <rect x="4" y="24" width="4" height="10" fill={color} />
          <rect x="24" y="24" width="4" height="10" fill={color} />
          <rect x="14" y="22" width="4" height="16" fill={`${color}88`} />
        </>
      )
    default: // tshirt
      return (
        <>
          <rect x="8" y="22" width="16" height="12" fill={color} />
          <rect x="6" y="24" width="4" height="8" fill={color} />
          <rect x="22" y="24" width="4" height="8" fill={color} />
          <rect x="12" y="24" width="8" height="2" fill={`${color}88`} />
        </>
      )
  }
}

// ===== PANTS STYLE RENDERING =====
function renderPants(style: string, color: string, skinTone: string) {
  switch (style) {
    case 'shorts':
      return (
        <>
          <rect x="8" y="32" width="16" height="6" fill={color} />
          <rect x="8" y="32" width="7" height="6" fill={color} />
          <rect x="17" y="32" width="7" height="6" fill={color} />
          <rect x="15" y="33" width="2" height="4" fill={`${color}88`} />
          {/* Legs showing */}
          <rect x="8" y="38" width="7" height="4" fill={skinTone} />
          <rect x="17" y="38" width="7" height="4" fill={skinTone} />
        </>
      )
    case 'bermuda':
      return (
        <>
          <rect x="8" y="32" width="16" height="8" fill={color} />
          <rect x="8" y="32" width="7" height="8" fill={color} />
          <rect x="17" y="32" width="7" height="8" fill={color} />
          <rect x="15" y="33" width="2" height="6" fill={`${color}88`} />
          {/* Legs showing below bermuda */}
          <rect x="8" y="40" width="7" height="2" fill={skinTone} />
          <rect x="17" y="40" width="7" height="2" fill={skinTone} />
        </>
      )
    case 'skirt':
      return (
        <>
          <rect x="6" y="32" width="20" height="8" fill={color} />
          <rect x="4" y="36" width="24" height="4" fill={color} />
          <rect x="14" y="33" width="4" height="6" fill={`${color}88`} />
          {/* Legs */}
          <rect x="10" y="38" width="5" height="4" fill={skinTone} />
          <rect x="17" y="38" width="5" height="4" fill={skinTone} />
        </>
      )
    case 'formal':
      return (
        <>
          <rect x="8" y="32" width="16" height="10" fill={color} />
          <rect x="8" y="32" width="7" height="10" fill={color} />
          <rect x="17" y="32" width="7" height="10" fill={color} />
          <rect x="15" y="33" width="2" height="8" fill={`${color}66`} />
          <rect x="10" y="32" width="12" height="1" fill={`${color}AA`} />
        </>
      )
    case 'sweatpants':
      return (
        <>
          <rect x="8" y="32" width="16" height="10" fill={color} />
          <rect x="7" y="32" width="8" height="10" fill={color} />
          <rect x="17" y="32" width="8" height="10" fill={color} />
          <rect x="15" y="34" width="2" height="6" fill={`${color}88`} />
        </>
      )
    default: // jeans
      return (
        <>
          <rect x="8" y="32" width="16" height="10" fill={color} />
          <rect x="8" y="32" width="7" height="10" fill={color} />
          <rect x="17" y="32" width="7" height="10" fill={color} />
          <rect x="15" y="34" width="2" height="6" fill={`${color}88`} />
        </>
      )
  }
}

// ===== SHOE RENDERING =====
function renderShoes(style: string) {
  const colors: Record<string, [string, string]> = {
    sneakers: ['#2D2D2D', '#1A1A1A'],
    boots: ['#5D4037', '#4E342E'],
    sandals: ['#8D6E63', '#795548'],
    fancy: ['#1A1A1A', '#333'],
  }
  const [main, accent] = colors[style] || colors.sneakers

  if (style === 'sandals') {
    return (
      <>
        <rect x="6" y="42" width="8" height="2" fill={main} />
        <rect x="18" y="42" width="8" height="2" fill={main} />
        <rect x="10" y="40" width="2" height="2" fill={accent} />
        <rect x="22" y="40" width="2" height="2" fill={accent} />
      </>
    )
  }

  return (
    <>
      <rect x="6" y="40" width="8" height="4" fill={main} />
      <rect x="18" y="40" width="8" height="4" fill={main} />
      <rect x="6" y="42" width="2" height="2" fill={accent} />
      <rect x="24" y="42" width="2" height="2" fill={accent} />
    </>
  )
}

export function PixelAvatar({
  character,
  size = 'md',
  isWalking = false,
  direction = 'down',
  showName = false,
  isSpeaking = false,
  className = '',
  chatBubble = null,
}: PixelAvatarProps) {
  const { width, height } = sizeMap[size]

  const renderHair = () => {
    const fn = hairStyles[character.hairStyle] || hairStyles.short
    return fn(character.hairColor, direction)
  }

  const renderHat = () => {
    if (!character.hatStyle) return null
    const fn = hatStyleRenderers[character.hatStyle]
    return fn ? fn(direction) : null
  }

  const renderAccessory = () => {
    if (!character.accessory) return null
    const fn = accessoryRenderers[character.accessory]
    return fn ? fn(direction) : null
  }

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Chat bubble */}
      {chatBubble && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-200">
          <div className="relative bg-foreground text-background px-2 py-1 text-xs max-w-32 rounded whitespace-nowrap overflow-hidden text-ellipsis">
            {chatBubble}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
          </div>
        </div>
      )}

      {/* Speaking indicator */}
      {isSpeaking && !chatBubble && (
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

      <svg
        width={width}
        height={height}
        viewBox="0 0 32 48"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Shadow */}
        <ellipse cx="16" cy="46" rx="8" ry="2" fill="rgba(0,0,0,0.3)" />

        {/* Shirt */}
        {renderShirt(character.shirtStyle, character.shirtColor, character.skinTone)}

        {/* Female chest indicator */}
        {character.gender === 'female' && (
          <>
            <rect x="10" y="24" width="4" height="3" fill={`${character.shirtColor}CC`} rx="1" />
            <rect x="18" y="24" width="4" height="3" fill={`${character.shirtColor}CC`} rx="1" />
            <rect x="10" y="25" width="4" height="1" fill={`${character.shirtColor}88`} />
            <rect x="18" y="25" width="4" height="1" fill={`${character.shirtColor}88`} />
          </>
        )}

        {/* Hands */}
        <>
          <rect x="6" y="30" width="4" height="4" fill={character.skinTone} />
          <rect x="22" y="30" width="4" height="4" fill={character.skinTone} />
        </>

        {/* Pants */}
        {renderPants(character.pantsStyle, character.pantsColor, character.skinTone)}

        {/* Shoes */}
        {renderShoes(character.shoeStyle || 'sneakers')}

        {/* Head */}
        <rect x="8" y="8" width="16" height="16" fill={character.skinTone} />

        {/* Hair */}
        {renderHair()}

        {/* Hat (over hair) */}
        {renderHat()}

        {/* Eyes */}
        {direction !== 'up' && (
          <>
            <rect x="10" y="14" width="4" height="4" fill="white" />
            <rect x="18" y="14" width="4" height="4" fill="white" />
            <rect
              x={direction === 'left' ? 10 : direction === 'right' ? 12 : 11}
              y="15"
              width="2"
              height="2"
              fill={character.eyeColor || '#1A1A1A'}
            />
            <rect
              x={direction === 'left' ? 18 : direction === 'right' ? 20 : 19}
              y="15"
              width="2"
              height="2"
              fill={character.eyeColor || '#1A1A1A'}
            />
          </>
        )}

        {/* Mouth */}
        {direction !== 'up' && (
          <rect x="13" y="20" width="6" height="2" fill="#C4756E" />
        )}

        {/* Accessory */}
        {renderAccessory()}

        {/* Neck */}
        <rect x="12" y="22" width="8" height="4" fill={character.skinTone} />

        {/* Walking leg animation via CSS is smoother than JS */}
        {isWalking && (
          <g className="animate-walk-legs">
            <rect x="9" y="41" width="5" height="2" fill={character.pantsColor} opacity="0.3" />
            <rect x="18" y="41" width="5" height="2" fill={character.pantsColor} opacity="0.3" />
          </g>
        )}
      </svg>

      {/* Name */}
      {showName && character.name && (
        <div className="mt-1 px-2 py-0.5 bg-background/90 rounded text-xs font-mono text-center whitespace-nowrap border border-border">
          {character.name}
        </div>
      )}
    </div>
  )
}

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
      <div className="mt-6 flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">Andando</span>
        <PixelAvatar character={character} size="lg" direction="right" isWalking />
      </div>
    </div>
  )
}
