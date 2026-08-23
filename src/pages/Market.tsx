import { useMemo } from 'react'
import LivePriceCard from '../components/LivePriceCard'
import TrendChart from '../components/TrendChart'
import NewsPanel from '../components/NewsPanel'
import QuickTradeBar from '../components/QuickTradeBar'
import { useLivePrice } from '../hooks/useLivePrice'
import { initialProducts } from '../lib/mockData'

/**
 * Forex market hours: Sun 5pm - Fri 5pm ET
 * = Mon 5am - Sat 5am Beijing time (UTC+8)
 * On Saturday, market is closed until next Monday 5am.
 */
function getForexStatus() {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 6=Sat
  const minutes = now.getHours() * 60 + now.getMinutes()

  // Mon-Fri: 5:00 - next day 5:00 (Beijing)
  // Mon morning 5am open, Sat 5am close
  const isWeekend = day === 0 || day === 6
  const isSatBeforeClose = day === 6 && minutes < 5 * 60 // Sat before 5am
  const isSunAfterOpen = day === 0 && minutes >= 5 * 60 // Sun after 5am

  const isOpen = !isWeekend || isSatBeforeClose || isSunAfterOpen

  if (isOpen) {
    const isSaturday = day === 6
    const nextCloseDay = isSaturday ? '今日' : '明日'
    return {
      isOpen: true,
      nextOpenLabel: null as string | null,
      nextCloseLabel: `${nextCloseDay} 05:00 收盘`,
      dayLabel: '国际外汇（24/5）',
    }
  }

  // Closed — next open Mon 5am
  const nextOpen = new Date(now)
  if (day === 6 && minutes >= 5 * 60) {
    // After Saturday close — open Monday
    nextOpen.setDate(nextOpen.getDate() + (1 - day + 7) % 7 + 1)
  } else if (day === 0) {
    // Sunday — open in ~24h
    nextOpen.setDate(nextOpen.getDate() + 1)
  }
  nextOpen.setHours(5, 0, 0, 0)

  return {
    isOpen: false,
    nextOpenLabel: `周一 05:00 开盘`,
    nextCloseLabel: null as string | null,
    dayLabel: '国际外汇（24/5）',
  }
}

export default function MarketPage() {
  const forexStatus = useMemo(() => getForexStatus(), [])
  const { products, tickDir } = useLivePrice(initialProducts, forexStatus.isOpen)

  // 行情页仅展示国际行情（现货黄金/白银），国内零售已拆分至国内行情页
  const visibleProducts = useMemo(
    () => products.filter((p) => p.id === 'xauusd' || p.id === 'xagusd'),
    [products],
  )

  const livePriceRegion = useMemo(
    () => (
      <section className="mb-5">
        <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-semibold text-foreground">实时行情</h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {forexStatus.isOpen ? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full live-dot"
                    style={{ backgroundColor: 'var(--brand-state-success)' }}
                  />
                  实时推送
                </span>
                {forexStatus.nextCloseLabel && (
                  <span className="text-warning">距收盘 {forexStatus.nextCloseLabel}</span>
                )}
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--brand-state-error)' }}
                  />
                  已收盘
                </span>
                <span>下次开盘 {forexStatus.nextOpenLabel}</span>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {visibleProducts.map((p) => (
            <LivePriceCard
              key={p.id}
              product={p}
              tickDir={forexStatus.isOpen ? tickDir[p.id] : undefined}
              isOpen={forexStatus.isOpen}
            />
          ))}
        </div>
      </section>
    ),
    [visibleProducts, tickDir, forexStatus],
  )

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {livePriceRegion}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <TrendChart />
        <NewsPanel />
      </div>

      <QuickTradeBar products={visibleProducts} />
    </div>
  )
}
