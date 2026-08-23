import { useEffect, useRef, useState, useCallback } from 'react'
import type { Product } from '../lib/mockData'

// Simulate a tiny random walk around the open price so the UI "lives".
function jitter(price: number, volatility: number): number {
  const delta = (Math.random() - 0.5) * volatility
  return Math.round((price + delta) * 100) / 100
}

function recalc(product: Product, nextPrice: number): Product {
  const change = Math.round((nextPrice - product.openPrice) * 100) / 100
  const changePercent =
    product.openPrice !== 0
      ? Math.round(((nextPrice - product.openPrice) / product.openPrice) * 10000) / 100
      : 0
  return {
    ...product,
    prevPrice: product.price,
    price: nextPrice,
    change,
    changePercent,
    high: Math.max(product.high, nextPrice),
    low: Math.min(product.low, nextPrice),
  }
}

/**
 * Drives live-price updates for the product list.
 * Returns the latest products and a tick direction map for flash animation.
 * Accepts isOpen flag — when false, stops updating prices and suppresses flash.
 */
export function useLivePrice(initial: Product[], isOpen = true, intervalMs = 2500) {
  const [products, setProducts] = useState<Product[]>(initial)
  const [tickDir, setTickDir] = useState<Record<string, 'up' | 'down' | 'flat'>>({})
  const timer = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (timer.current) {
      window.clearInterval(timer.current)
      timer.current = null
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      stop()
      setTickDir({})
      return
    }

    timer.current = window.setInterval(() => {
      setProducts((prev) => {
        const next = prev.map((p) => {
          // volatility scaled to price magnitude
          const vol = Math.max(p.price * 0.0008, 0.02)
          const nextPrice = jitter(p.price, vol)
          const dir: 'up' | 'down' | 'flat' =
            nextPrice > p.price ? 'up' : nextPrice < p.price ? 'down' : 'flat'
          setTickDir((d) => ({ ...d, [p.id]: dir }))
          return recalc(p, nextPrice)
        })
        return next
      })
    }, intervalMs)
    return stop
  }, [isOpen, intervalMs, stop])

  // Clear flash flag shortly after each tick so animation can re-trigger.
  useEffect(() => {
    if (Object.keys(tickDir).length === 0) return
    const t = window.setTimeout(() => setTickDir({}), 650)
    return () => window.clearTimeout(t)
  }, [tickDir])

  return { products, tickDir, stop }
}
