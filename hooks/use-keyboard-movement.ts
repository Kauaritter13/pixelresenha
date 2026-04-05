'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseKeyboardMovementOptions {
  speed?: number
  bounds?: { minX: number; minY: number; maxX: number; maxY: number }
  enabled?: boolean
  onMove: (x: number, y: number, direction: string, isWalking: boolean) => void
  onStop: () => void
}

export function useKeyboardMovement({
  speed = 3,
  bounds = { minX: 30, minY: 10, maxX: 620, maxY: 380 },
  enabled = true,
  onMove,
  onStop,
}: UseKeyboardMovementOptions) {
  const keysPressed = useRef<Set<string>>(new Set())
  const positionRef = useRef({ x: 300, y: 250 })
  const animFrameRef = useRef<number | null>(null)
  const isMovingRef = useRef(false)
  const lastBroadcast = useRef(0)

  const setPosition = useCallback((x: number, y: number) => {
    positionRef.current = { x, y }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault()
        keysPressed.current.add(key)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keysPressed.current.delete(key)
    }

    // Game loop
    const gameLoop = () => {
      const keys = keysPressed.current
      let dx = 0
      let dy = 0

      if (keys.has('w') || keys.has('arrowup')) dy -= speed
      if (keys.has('s') || keys.has('arrowdown')) dy += speed
      if (keys.has('a') || keys.has('arrowleft')) dx -= speed
      if (keys.has('d') || keys.has('arrowright')) dx += speed

      // Diagonal normalization
      if (dx !== 0 && dy !== 0) {
        const factor = Math.SQRT1_2
        dx *= factor
        dy *= factor
      }

      if (dx !== 0 || dy !== 0) {
        const newX = Math.max(bounds.minX, Math.min(bounds.maxX, positionRef.current.x + dx))
        const newY = Math.max(bounds.minY, Math.min(bounds.maxY, positionRef.current.y + dy))

        positionRef.current = { x: newX, y: newY }

        let direction = 'down'
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left'
        } else {
          direction = dy > 0 ? 'down' : 'up'
        }

        // Throttle broadcasts to ~20fps
        const now = Date.now()
        if (now - lastBroadcast.current > 50) {
          lastBroadcast.current = now
          onMove(newX, newY, direction, true)
        }

        if (!isMovingRef.current) {
          isMovingRef.current = true
        }
      } else if (isMovingRef.current) {
        isMovingRef.current = false
        onStop()
      }

      animFrameRef.current = requestAnimationFrame(gameLoop)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    animFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
      keysPressed.current.clear()
    }
  }, [enabled, speed, bounds, onMove, onStop])

  return { setPosition, getPosition: () => positionRef.current }
}
