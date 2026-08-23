import { useEffect, useRef, useState, useCallback } from 'react'
import type { Product } from '../lib/mockData'

// 真实行情 API 返回格式
interface MetalsApiResponse {
  timestamp: number
  gold: { usd: number; cnyPerGram: number }
  silver: { usd: number; cnyPerGram: number }
  paxg: { usd: number; cnyPerGram: number }
  source: string
}

// 产品 ID → API 字段映射
const PRODUCT_API_MAP: Record<string, { metal: 'gold' | 'silver' | 'paxg'; field: 'usd' | 'cnyPerGram' }> = {
  xaucny: { metal: 'gold', field: 'cnyPerGram' },
  xagcny: { metal: 'silver', field: 'cnyPerGram' },
  paxgcny: { metal: 'paxg', field: 'cnyPerGram' },
  xauusd: { metal: 'gold', field: 'usd' },
  xagusd: { metal: 'silver', field: 'usd' },
  paxgusd: { metal: 'paxg', field: 'usd' },
}

// 模拟微小随机波动（API 调用间隔期间保持"活的"感觉）
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

// 从 API 获取真实价格
async function fetchMetalsData(): Promise<MetalsApiResponse | null> {
  try {
    const res = await fetch('/api/metals')
    if (!res.ok) return null
    const data: MetalsApiResponse = await res.json()
    return data
  } catch {
    return null
  }
}

/**
 * 驱动实时价格更新：
 * 1. 每 2 分钟从 /api/metals 获取真实金价
 * 2. 间隔期间用微小随机波动模拟实时跳动
 * 3. 休市产品停止更新
 */
export function useLivePrice(
  initial: Product[],
  openStatusMap: Record<string, boolean> = {},
  intervalMs = 2500,
) {
  const [products, setProducts] = useState<Product[]>(initial)
  const [tickDir, setTickDir] = useState<Record<string, 'up' | 'down' | 'flat'>>({})
  const timer = useRef<number | null>(null)
  const fetchTimer = useRef<number | null>(null)
  const openPriceRef = useRef<Record<string, number>>({})
  const isFirstFetch = useRef(true)

  // 初始化开盘价
  useEffect(() => {
    initial.forEach((p) => {
      if (!openPriceRef.current[p.id]) {
        openPriceRef.current[p.id] = p.openPrice
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 从 API 同步真实价格，更新开盘价为首次获取的价格
  const syncFromApi = useCallback(async () => {
    const data = await fetchMetalsData()
    if (!data) return

    setProducts((prev) => {
      return prev.map((p) => {
        const mapping = PRODUCT_API_MAP[p.id]
        if (!mapping) return p

        const realPrice = data[mapping.metal][mapping.field]

        // 首次获取：用真实价格作为开盘价
        if (isFirstFetch.current) {
          openPriceRef.current[p.id] = realPrice
        }

        const change = Math.round((realPrice - openPriceRef.current[p.id]) * 100) / 100
        const changePercent =
          openPriceRef.current[p.id] !== 0
            ? Math.round(((realPrice - openPriceRef.current[p.id]) / openPriceRef.current[p.id]) * 10000) / 100
            : 0

        return {
          ...p,
          prevPrice: p.price,
          price: realPrice,
          openPrice: openPriceRef.current[p.id],
          change,
          changePercent,
          high: Math.max(p.high, realPrice),
          low: Math.min(p.low, realPrice),
        }
      })
    })

    if (isFirstFetch.current) {
      isFirstFetch.current = false
    }
  }, [])

  const stop = useCallback(() => {
    if (timer.current) {
      window.clearInterval(timer.current)
      timer.current = null
    }
    if (fetchTimer.current) {
      window.clearInterval(fetchTimer.current)
      fetchTimer.current = null
    }
  }, [])

  // 微小波动定时器（间隔期间模拟实时跳动）
  useEffect(() => {
    const anyOpen = Object.values(openStatusMap).some(Boolean)
    if (!anyOpen) {
      stop()
      setTickDir({})
      return
    }

    timer.current = window.setInterval(() => {
      setProducts((prev) => {
        const next = prev.map((p) => {
          if (!openStatusMap[p.id]) return p

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
  }, [openStatusMap, intervalMs, stop])

  // 定期从 API 获取真实价格（每 2 分钟）
  useEffect(() => {
    // 首次立即获取
    syncFromApi()

    fetchTimer.current = window.setInterval(syncFromApi, 120000)
    return () => {
      if (fetchTimer.current) {
        window.clearInterval(fetchTimer.current)
        fetchTimer.current = null
      }
    }
  }, [syncFromApi])

  // 清除闪烁标记
  useEffect(() => {
    if (Object.keys(tickDir).length === 0) return
    const t = window.setTimeout(() => setTickDir({}), 650)
    return () => window.clearTimeout(t)
  }, [tickDir])

  return { products, tickDir, stop }
}
