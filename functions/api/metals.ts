// Cloudflare Pages Function - 贵金属实时行情代理
// 从 goldprice.dev 获取真实黄金价格，推算白银/暗金价格
// 2分钟缓存，避免超出免费 API 限制（100次/小时）

interface GoldPriceResponse {
  symbols: Array<{
    symbol: string
    quote_currency: string
    unit: string
    contract_type: string
    price: string
    is_stale: boolean
    computed_at: string
  }>
}

interface MetalsData {
  timestamp: number
  gold: { usd: number; cnyPerGram: number }
  silver: { usd: number; cnyPerGram: number }
  paxg: { usd: number; cnyPerGram: number }
  source: string
}

const TROY_OUNCE_TO_GRAM = 31.1034768
const GOLD_SILVER_RATIO = 67 // 当前市场金银比约 67:1

export async function onRequestGet(context: {
  request: Request
  waitUntil: (promise: Promise<unknown>) => void
}): Promise<Response> {
  const { request, waitUntil } = context

  // 检查边缘缓存（2分钟）
  const cacheKey = new Request('https://cache.local/api/metals', request)
  const cache = caches.default
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  try {
    // 并行获取 USD 和 CNY 计价的黄金价格
    const [usdRes, cnyRes] = await Promise.all([
      fetch('https://api.goldprice.dev/v1/prices?symbol=XAU-USD-SPOT', {
        headers: { Accept: 'application/json' },
      }),
      fetch('https://api.goldprice.dev/v1/prices?symbol=XAU-CNY-SPOT', {
        headers: { Accept: 'application/json' },
      }),
    ])

    if (!usdRes.ok || !cnyRes.ok) {
      throw new Error(`API error: USD=${usdRes.status}, CNY=${cnyRes.status}`)
    }

    const usdData: GoldPriceResponse = await usdRes.json()
    const cnyData: GoldPriceResponse = await cnyRes.json()

    const goldUsd = parseFloat(usdData.symbols[0]?.price || '0')
    const goldCnyPerOz = parseFloat(cnyData.symbols[0]?.price || '0')
    const goldCnyPerGram = goldCnyPerOz / TROY_OUNCE_TO_GRAM

    // 白银：用金银比推算（免费 API 不含白银）
    const silverUsd = goldUsd / GOLD_SILVER_RATIO
    const silverCnyPerGram = goldCnyPerGram / GOLD_SILVER_RATIO

    // 暗金 PAXG：锚定黄金，略微折价
    const paxgUsd = goldUsd * 0.997
    const paxgCnyPerGram = goldCnyPerGram * 0.997

    const data: MetalsData = {
      timestamp: Date.now(),
      gold: {
        usd: Math.round(goldUsd * 100) / 100,
        cnyPerGram: Math.round(goldCnyPerGram * 100) / 100,
      },
      silver: {
        usd: Math.round(silverUsd * 100) / 100,
        cnyPerGram: Math.round(silverCnyPerGram * 100) / 100,
      },
      paxg: {
        usd: Math.round(paxgUsd * 100) / 100,
        cnyPerGram: Math.round(paxgCnyPerGram * 100) / 100,
      },
      source: 'goldprice.dev',
    }

    const response = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=120',
        'Access-Control-Allow-Origin': '*',
      },
    })

    // 写入边缘缓存
    waitUntil(cache.put(cacheKey, response.clone()))

    return response
  } catch (err) {
    // API 失败时返回降级数据（基于最近真实价格）
    const fallback: MetalsData = {
      timestamp: Date.now(),
      gold: { usd: 4602.99, cnyPerGram: 994.95 },
      silver: { usd: 68.7, cnyPerGram: 14.85 },
      paxg: { usd: 4589.18, cnyPerGram: 991.97 },
      source: 'fallback',
    }

    return new Response(JSON.stringify(fallback), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}
