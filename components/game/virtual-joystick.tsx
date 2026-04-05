'use client'

import { useRef, useCallback, useEffect } from 'react'

interface VirtualJoystickProps {
  onMove: (dx: number, dy: number, direction: string) => void
  onStop: () => void
  size?: number
}

export function VirtualJoystick({ onMove, onStop, size = 120 }: VirtualJoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const animFrame = useRef<number | null>(null)
  const currentDir = useRef({ dx: 0, dy: 0, dir: 'down' })

  const maxRadius = size / 2 - 15

  const handleStart = useCallback((clientX: number, clientY: number) => {
    isDragging.current = true
    handleMove(clientX, clientY)
  }, [])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging.current || !containerRef.current || !knobRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let dx = clientX - centerX
    let dy = clientY - centerY

    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius
      dy = (dy / distance) * maxRadius
    }

    knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`

    // Normalize to -1..1
    const nx = dx / maxRadius
    const ny = dy / maxRadius

    let dir = 'down'
    if (Math.abs(nx) > Math.abs(ny)) {
      dir = nx > 0 ? 'right' : 'left'
    } else {
      dir = ny > 0 ? 'down' : 'up'
    }

    currentDir.current = { dx: nx, dy: ny, dir }
  }, [maxRadius])

  const handleEnd = useCallback(() => {
    isDragging.current = false
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)'
    }
    currentDir.current = { dx: 0, dy: 0, dir: 'down' }
    onStop()
  }, [onStop])

  // Game loop for continuous movement
  useEffect(() => {
    const loop = () => {
      const { dx, dy, dir } = currentDir.current
      if (isDragging.current && (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1)) {
        onMove(dx * 4, dy * 4, dir)
      }
      animFrame.current = requestAnimationFrame(loop)
    }
    animFrame.current = requestAnimationFrame(loop)
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current)
    }
  }, [onMove])

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const t = e.touches[0]
    handleStart(t.clientX, t.clientY)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    const t = e.touches[0]
    handleMove(t.clientX, t.clientY)
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleEnd()
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-full bg-black/30 backdrop-blur-sm border-2 border-white/20 touch-none select-none"
      style={{ width: size, height: size }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {/* Direction indicators */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 60 60">
          <path d="M30 8 L34 18 L26 18 Z" fill="white" /> {/* Up */}
          <path d="M30 52 L34 42 L26 42 Z" fill="white" /> {/* Down */}
          <path d="M8 30 L18 26 L18 34 Z" fill="white" /> {/* Left */}
          <path d="M52 30 L42 26 L42 34 Z" fill="white" /> {/* Right */}
        </svg>
      </div>

      {/* Knob */}
      <div
        ref={knobRef}
        className="absolute rounded-full bg-white/60 border-2 border-white/80 shadow-lg"
        style={{
          width: 30,
          height: 30,
          top: '50%',
          left: '50%',
          marginTop: -15,
          marginLeft: -15,
          transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
        }}
      />
    </div>
  )
}
