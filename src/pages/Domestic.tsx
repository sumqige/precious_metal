import { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  ScatterController,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { Coins, Clock, Store, TrendingUp } from 'lucide-react'
import {
  domesticMetals,
  domesticIntradayPrices,
  domesticIntradayTimes,
  brandPrices,
  type DomesticMetal,
} from '../lib/mockData'
import { useDomesticLivePrice } from '../hooks/useDomesticLivePrice'
import { useToast } from '../components/Toast'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  ScatterController,
  Filler,
  Tooltip,
  Legend,
)

/** Market session config for domestic retail precious metals */
const MARKET_CONFIG = {
  weekday: { open: '09:00', close: '22:00' },
  weekend: { open: '09:30', close: '21:30' },
  currency: '元/克',
}

type TimeRange = 'intraday' | 'week' | 'month' | 'year'

const timeRangeTabs: { key: TimeRange; label: string }[] = [
  { key: 'intraday', label: '分时' },
  { key: 'week', label: '近一周' },
  { key: 'month', label: '近一月' },
  { key: 'year', label: '近一年' },
]

/** Compute market status based on current time */
function getMarketStatus() {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 6=Sat
  const isWeekend = day === 0 || day === 6
  const session = isWeekend ? MARKET_CONFIG.weekend : MARKET_CONFIG.weekday

  const [openH, openM] = session.open.split(':').map(Number)
  const [closeH, closeM] = session.close.split(':').map(Number)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  const isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes

  // Compute next open
  const nextOpen = new Date(now)
  if (isOpen) {
    // Still open — next close is today
    return {
      isOpen: true,
      openTime: session.open,
      closeTime: session.close,
      nextCloseLabel: `今日 ${session.close} 收盘`,
      nextOpenLabel: null as string | null,
      dayLabel: isWeekend ? '周末行情' : '工作日行情',
    }
  }

  // Closed — find next open
  if (nowMinutes < openMinutes) {
    // Before open today
    nextOpen.setHours(openH, openM, 0, 0)
  } else {
    // After close — next open day
    nextOpen.setDate(nextOpen.getDate() + 1)
    const nextDay = nextOpen.getDay()
    const nextIsWeekend = nextDay === 0 || nextDay === 6
    const nextSession = nextIsWeekend ? MARKET_CONFIG.weekend : MARKET_CONFIG.weekday
    nextOpen.setHours(
      Number(nextSession.open.split(':')[0]),
      Number(nextSession.open.split(':')[1]),
      0,
      0,
    )
  }

  const nextOpenDayLabel =
    nextOpen.toDateString() === now.toDateString()
      ? '今日'
      : nextOpen.toDateString() === new Date(now.getTime() + 86400000).toDateString()
        ? '明日'
        : `${nextOpen.getMonth() + 1}月${nextOpen.getDate()}日`

  const nextOpenSession =
    nextOpen.getDay() === 0 || nextOpen.getDay() === 6
      ? MARKET_CONFIG.weekend
      : MARKET_CONFIG.weekday

  return {
    isOpen: false,
    openTime: session.open,
    closeTime: session.close,
    nextCloseLabel: null as string | null,
    nextOpenLabel: `${nextOpenDayLabel} ${nextOpenSession.open} 开盘`,
    dayLabel: isWeekend ? '周末行情' : '工作日行情',
  }
}

/** Generate time-series data for a given range around a base price */
function generateRangeData(
  range: TimeRange,
  basePrice: number,
  metalId: string,
): { labels: string[]; prices: number[] } {
  const vol = basePrice * 0.012 // ~1.2% max swing
  const seed = metalId.charCodeAt(0) + metalId.charCodeAt(1)

  if (range === 'intraday') {
    const scale = basePrice / 990
    return {
      labels: domesticIntradayTimes,
      prices: domesticIntradayPrices.map((p) => Math.round(p * scale * 100) / 100),
    }
  }

  if (range === 'week') {
    // 7 days, 2 data points per day (open/close)
    const labels: string[] = []
    const prices: number[] = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const weekday = d.getDay()
      const isWeekend = weekday === 0 || weekday === 6
      // Skip weekends for retail? No, include all 7 days
      const dayLabel = `${weekday === 0 ? '周日' : weekday === 1 ? '周一' : weekday === 2 ? '周二' : weekday === 3 ? '周三' : weekday === 4 ? '周四' : weekday === 5 ? '周五' : '周六'}`
      const daysOffset = 6 - i
      const trend =
        Math.sin((seed + daysOffset * 1.3) * 0.8) * vol * 0.6 +
        Math.cos((seed + daysOffset * 2.1) * 1.2) * vol * 0.4
      const open = Math.round((basePrice + trend - vol * 0.3) * 100) / 100
      const close = Math.round((basePrice + trend + (isWeekend ? vol * 0.2 : 0)) * 100) / 100
      labels.push(`${dayLabel}开`)
      prices.push(open)
      labels.push(`${dayLabel}收`)
      prices.push(close)
    }
    return { labels, prices }
  }

  if (range === 'month') {
    // 30 days, one data point per day
    const labels: string[] = []
    const prices: number[] = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const daysOffset = 29 - i
      const trend =
        Math.sin((seed + daysOffset * 0.5) * 0.5) * vol * 0.8 +
        Math.cos((seed + daysOffset * 0.9) * 0.7) * vol * 0.3 +
        daysOffset * (vol * 0.015) // slight drift
      const price = Math.round((basePrice + trend) * 100) / 100
      labels.push(`${mm}-${dd}`)
      prices.push(price)
    }
    return { labels, prices }
  }

  // year: 52 weeks, one data point per week
  const labels: string[] = []
  const prices: number[] = []
  const today = new Date()
  for (let i = 51; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i * 7)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const weeksOffset = 51 - i
    // Annual cycle with stronger trend
    const trend =
      Math.sin((seed + weeksOffset * 0.4) * 0.3) * vol * 1.2 +
      Math.cos((seed + weeksOffset * 0.6) * 0.5) * vol * 0.5 +
      weeksOffset * (vol * 0.03)
    const price = Math.round((basePrice + trend) * 100) / 100
    labels.push(`${mm}-${dd}`)
    prices.push(price)
  }
  return { labels, prices }
}

export default function DomesticPage() {
  const marketStatus = useMemo(() => getMarketStatus(), [])
  const { metals, tickDir } = useDomesticLivePrice(domesticMetals, marketStatus.isOpen)
  const { notify } = useToast()
  const [selectedMetal, setSelectedMetal] = useState<string>('au')
  const [timeRange, setTimeRange] = useState<TimeRange>('intraday')

  const current = metals.find((m) => m.id === selectedMetal) ?? metals[0]
  const activeMetal = metals.find((m) => m.id === selectedMetal) ?? metals[0]

  // --- Chart data ---
  const { labels, prices } = useMemo(
    () => generateRangeData(timeRange, activeMetal.price, activeMetal.id),
    [timeRange, activeMetal],
  )

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          type: 'line' as const,
          label: `${activeMetal.name} ${timeRangeTabs.find((t) => t.key === timeRange)?.label}走势`,
          data: prices,
          borderColor: activeMetal.color,
          backgroundColor: (ctx: { chart: ChartJS }) => {
            const { ctx: c, chartArea } = ctx.chart
            if (!chartArea) return undefined
            const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            g.addColorStop(0, `${activeMetal.color}38`)
            g.addColorStop(1, `${activeMetal.color}00`)
            return g
          },
          borderWidth: 2,
          tension: timeRange === 'intraday' ? 0.35 : 0.3,
          fill: true,
          pointRadius: timeRange === 'year' ? 0 : timeRange === 'month' ? 0 : 2,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: activeMetal.color,
        },
      ],
    }),
    [labels, prices, activeMetal, timeRange],
  )

  const chartOptions: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#22262E',
          titleColor: '#F5F5F4',
          bodyColor: '#A1A1AA',
          borderColor: '#2F3440',
          borderWidth: 1,
          callbacks: {
            label: (ctx) =>
              `${activeMetal.name}: ${(ctx.parsed?.y ?? 0).toFixed(2)} ${activeMetal.unit}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#2F3440', drawBorder: false },
          ticks: {
            color: '#A1A1AA',
            font: { family: 'SF Mono, monospace', size: 10 },
            maxRotation: timeRange === 'year' ? 0 : timeRange === 'month' ? 45 : 0,
            autoSkip: true,
            maxTicksLimit: timeRange === 'year' ? 8 : timeRange === 'month' ? 10 : 16,
          },
        },
        y: {
          grid: { color: '#2F3440', drawBorder: false },
          ticks: { color: '#A1A1AA', font: { family: 'SF Mono, monospace', size: 11 } },
        },
      },
    }),
    [activeMetal, timeRange],
  )

  const changeColor = activeMetal.change >= 0 ? 'var(--brand-state-success)' : 'var(--brand-state-error)'

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      {/* 实时价格 + 市场状态 */}
      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Coins className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold">实时价格（元/克）</h2>

          {/* Live feed indicator */}
          {marketStatus.isOpen ? (
            <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full live-dot"
                style={{ backgroundColor: 'var(--brand-state-success)' }}
              />
              实时推送
            </span>
          ) : (
            <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: 'var(--brand-state-error)' }}
              />
              行情已更新
            </span>
          )}

          {/* Market status badge */}
          <div
            className={[
              'ml-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs',
              marketStatus.isOpen
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-error/30 bg-error/10 text-error',
            ].join(' ')}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${marketStatus.isOpen ? 'live-dot' : ''}`}
              style={{
                backgroundColor: marketStatus.isOpen
                  ? 'var(--brand-state-success)'
                  : 'var(--brand-state-error)',
              }}
            />
            {marketStatus.isOpen ? '交易中' : '已收盘'}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {marketStatus.dayLabel}：{marketStatus.openTime} - {marketStatus.closeTime}
            </span>
            {marketStatus.nextCloseLabel && (
              <span className="text-warning">
                距收盘 {marketStatus.nextCloseLabel}
              </span>
            )}
            {marketStatus.nextOpenLabel && (
              <span className="text-muted-foreground">
                下次开盘 {marketStatus.nextOpenLabel}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metals.map((m) => (
            <MetalPriceRow
              key={m.id}
              metal={m}
              tickDir={marketStatus.isOpen ? tickDir[m.id] : undefined}
              isOpen={marketStatus.isOpen}
            />
          ))}
        </div>
      </section>

      {/* 价格走势 */}
      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <TrendingUp className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold">价格走势</h2>

          {/* Metal tabs */}
          <div className="ml-2 flex items-center gap-1 rounded-md border border-border bg-background p-1">
            {metals.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMetal(m.id)}
                className={[
                  'flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors',
                  selectedMetal === m.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
                {m.name}
              </button>
            ))}
          </div>

          {/* Time range tabs */}
          <div className="ml-auto flex items-center gap-1 rounded-md border border-border bg-background p-1">
            {timeRangeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTimeRange(tab.key)}
                className={[
                  'rounded px-3 py-1 text-xs font-medium transition-colors',
                  timeRange === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Change summary */}
        <div className="mb-2 text-right text-sm">
          {timeRange === 'intraday' ? '今日涨跌幅' : `${timeRangeTabs.find((t) => t.key === timeRange)?.label}涨跌幅`}
          ：
          <span className="ml-1 font-semibold font-mono tabular-nums" style={{ color: changeColor }}>
            {activeMetal.change >= 0 ? '+' : ''}
            {activeMetal.changePercent}%
          </span>
        </div>

        <div className="relative w-full rounded-md border border-border bg-background p-2">
          <div style={{ height: 280, maxHeight: 340 }}>
            <Chart type="line" data={chartData as never} options={chartOptions} />
          </div>
        </div>

        {/* High / Low */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border bg-background p-4 text-center">
            <div
              className="text-2xl font-bold font-mono tabular-nums"
              style={{ color: 'var(--brand-state-success)' }}
            >
              {current.high.toFixed(2)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {timeRange === 'intraday'
                ? '今日最高价格'
                : `${timeRangeTabs.find((t) => t.key === timeRange)?.label}最高`}
              （{current.unit}）
            </div>
          </div>
          <div className="rounded-md border border-border bg-background p-4 text-center">
            <div
              className="text-2xl font-bold font-mono tabular-nums"
              style={{ color: 'var(--brand-state-error)' }}
            >
              {current.low.toFixed(2)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {timeRange === 'intraday'
                ? '今日最低价格'
                : `${timeRangeTabs.find((t) => t.key === timeRange)?.label}最低`}
              （{current.unit}）
            </div>
          </div>
        </div>
      </section>

      {/* 品牌行情 */}
      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Store className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold">品牌行情</h2>
          <span className="ml-auto text-xs text-muted-foreground">回收价 / 零售价 · 实时更新</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(['水贝', '周大福', '金六福'] as const).map((brandName) => {
            const items = brandPrices.filter((b) => b.brand === brandName)
            return (
              <BrandCard
                key={brandName}
                brand={brandName}
                items={items}
                onSelect={(msg) => notify(msg, 'info')}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}

/* -------- Sub-components -------- */

function MetalPriceRow({
  metal,
  tickDir,
  isOpen = true,
}: {
  metal: DomesticMetal
  tickDir?: 'up' | 'down' | 'flat'
  isOpen?: boolean
}) {
  const flashClass =
    !isOpen ? '' : tickDir === 'up' ? 'price-flash-up' : tickDir === 'down' ? 'price-flash-down' : ''
  const isUp = metal.change >= 0
  const arrowColor = isUp ? 'var(--brand-state-success)' : 'var(--brand-state-error)'

  return (
    <div className={`rounded-md border border-border bg-background p-4 ${flashClass}`}>
      <div className="flex items-center gap-3">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
          style={{ backgroundColor: `${metal.color}33`, color: metal.color }}
        >
          {metal.symbol}
        </span>
        <span className="text-sm font-medium">{metal.name}</span>
        {!isOpen && (
          <span className="ml-auto text-[10px] text-muted-foreground">收盘</span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold font-mono tabular-nums">
          {metal.price.toFixed(2)}
        </span>
        <span className="text-xs text-muted-foreground">{metal.unit}</span>
      </div>
      <div
        className="mt-1 flex items-center gap-3 text-xs font-mono tabular-nums"
        style={{ color: arrowColor }}
      >
        <span>
          {isUp ? '▲' : '▼'} {Math.abs(metal.change).toFixed(2)}
        </span>
        <span>
          {isUp ? '+' : ''}
          {metal.changePercent}%
        </span>
      </div>
    </div>
  )
}

function BrandCard({
  brand,
  items,
  onSelect,
}: {
  brand: string
  items: typeof brandPrices
  onSelect: (msg: string) => void
}) {
  const categories = ['黄金', '铂金', '白银'] as const

  return (
    <div className="rounded-md border border-border bg-background overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
        <span className="text-sm font-semibold">{brand}</span>
        <span className="text-[10px] text-muted-foreground">更新 {items[0]?.updated ?? '--:--'}</span>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="text-muted-foreground">
          <tr className="border-b border-border/60">
            <th className="px-4 py-2 font-medium">品类</th>
            <th className="px-3 py-2 text-right font-medium">回收价</th>
            <th className="px-4 py-2 text-right font-medium">零售价</th>
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums">
          {categories.map((cat) => {
            const item = items.find((b) => b.category === cat)
            if (!item) return null
            const chgColor =
              item.change >= 0 ? 'var(--brand-state-success)' : 'var(--brand-state-error)'
            return (
              <tr
                key={cat}
                className="border-b border-border/40 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() =>
                  onSelect(`${brand} ${cat} 回收 ${item.buyPrice.toFixed(2)} / 零售 ${item.sellPrice.toFixed(2)}`)
                }
              >
                <td className="px-4 py-2.5">
                  <div className="font-sans">
                    {cat}
                    <span className="ml-1 text-[10px]" style={{ color: chgColor }}>
                      {item.change >= 0 ? '+' : ''}
                      {item.changePercent}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right" style={{ color: chgColor }}>
                  {item.buyPrice.toFixed(2)}
                </td>
                <td className="px-4 py-2.5 text-right font-sans">
                  {item.sellPrice.toFixed(2)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
