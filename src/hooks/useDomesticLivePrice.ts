import { useEffect, useRef, useState, useCallback } from 'react'
import type { DomesticMetal } from '../lib/mockData'

/**
 * Simulates live price updates for domestic retail metals.
 * Accepts openStatusMap — when a metal's value is false (market closed),
 * that metal stops updating and suppresses tick-direction flash.
 */
export function useDomesticLivePrice(
  initial: DomesticMetal[],
  openStatusMap: Record<string, boolean> = {},
  intervalMs = 3000,
) {
  const [metals, setMetals] = useState<DomesticMetal[]>(initial)
  const [tickDir, setTickDir] = useState<Record<string, 'up' | 'down' | 'flat'>>({})
  const timer = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (timer.current) {
      window.clearInterval(timer.current)
      timer.current = null
    }
  }, [])

  useEffect(() => {
    // If no metal is open, stop the interval entirely
    const anyOpen = Object.values(openStatusMap).some(Boolean)
    if (!anyOpen) {
      stop()
      setTickDir({})
      return
    }

    timer.current = window.setInterval(() => {
      setMetals((prev) =>
        prev.map((m) => {
          // Skip metals whose market is closed
          if (!openStatusMap[m.id]) return m

          const vol = Math.max(m.price * 0.0006, 0.05)
          const delta = (Math.random() - 0.5) * vol * 2
          const nextPrice = Math.round((m.price + delta) * 100) / 100
          const dir: 'up' | 'down' | 'flat' =
            nextPrice > m.price ? 'up' : nextPrice < m.price ? 'down' : 'flat'
          setTickDir((d) => ({ ...d, [m.id]: dir }))
          const change = Math.round((nextPrice - m.openPrice) * 100) / 100
          const changePercent =
            m.openPrice !== 0
              ? Math.round(((nextPrice - m.openPrice) / m.openPrice) * 10000) / 100
              : 0
          return {
            ...m,
            prevPrice: m.price,
            price: nextPrice,
            change,
            changePercent,
            high: Math.max(m.high, nextPrice),
            low: Math.min(m.low, nextPrice),
          }
        }),
      )
    }, intervalMs)
    return stop
  }, [openStatusMap, intervalMs, stop])

  useEffect(() => {
    if (Object.keys(tickDir).length === 0) return
    const t = window.setTimeout(() => setTickDir({}), 700)
    return () => window.clearTimeout(t)
  }, [tickDir])

  return { metals, tickDir, stop }
}
