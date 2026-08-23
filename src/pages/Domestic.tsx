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

type TimeRange = 'intraday' | 'week' | 'month' | 'year'

const timeRangeTabs: { key: TimeRange; label: string }[] = [
  { key: 'intraday', label: '分时' },
  { key: 'week', label: '近一周' },
  { key: 'month', label: '近一月' },
  { key: 'year', label: '近一年' },
]

/**
 * 上海黄金交易所（SGE）交易时间表
 * - 黄金/白银：日盘 + 夜盘
 *   日盘：周一 08:50 开盘，周二至周五 09:00 开盘
 *         上午盘 09:00-11:30，下午盘 13:30-15:30
 *   夜盘：周一至周四 19:50 开盘，持续至次日 02:30（周五无夜盘）
 * - 铂金/钯金：仅日盘（同日盘时间，无夜盘）
 * - 周末：全天休市
 * - 法定节假日：全天休市
 */
type MarketStatus = {
  isOpen: boolean
  openTime: string
  closeTime: string
  nextCloseLabel: string | null
  nextOpenLabel: string | null
  dayLabel: string
}

/** Compute market status based on Shanghai Gold Exchange schedule.
 *  hasNightSession: true for gold/silver, false for platinum/palladium.
 */
function getMarketStatus(hasNightSession = true): MarketStatus {
  const now = new Date()
  const day = now.getDay() // 0=周日, 1=周一, ..., 6=周六
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  // --- 交易时段（分钟数）---
  const morningOpen = day === 1 ? 8 * 60 + 50 : 9 * 60 // 周一08:50, 其余09:00
  const morningClose = 11 * 60 + 30 // 11:30
  const afternoonOpen = 13 * 60 + 30 // 13:30
  const afternoonClose = 15 * 60 + 30 // 15:30
  const nightOpen = 19 * 60 + 50 // 19:50
  const nightContinuationClose = 2 * 60 + 30 // 次日02:30

  // --- 判断当前是否在交易时段 ---
  const inMorning = nowMinutes >= morningOpen && nowMinutes < morningClose
  const inAfternoon = nowMinutes >= afternoonOpen && nowMinutes < afternoonClose
  const inNight = nowMinutes >= nightOpen // 19:50 至午夜
  const inNightContinuation = nowMinutes < nightContinuationClose // 午夜至02:30

  const validNight = hasNightSession && inNight && day >= 1 && day <= 4 // 周一至周四有夜盘
  const validNightContinuation =
    hasNightSession && inNightContinuation && day >= 2 && day <= 5 // 周二至周五凌晨

  // --- 周末全天休市 ---
  if (day === 0 || day === 6) {
    return {
      isOpen: false,
      openTime: '08:50',
      closeTime: '15:30',
      nextCloseLabel: null,
      nextOpenLabel: `周一 08:50 开盘`,
      dayLabel: '周末休市',
    }
  }

  // --- 日盘交易中（所有品种共用） ---
  if (inMorning || inAfternoon) {
    return {
      isOpen: true,
      openTime: day === 1 ? '08:50' : '09:00',
      closeTime: '15:30',
      nextCloseLabel: `今日 ${inMorning ? '11:30' : '15:30'} 收盘`,
      nextOpenLabel: null,
      dayLabel: '日盘交易中',
    }
  }

  // --- 夜盘交易中（仅黄金/白银） ---
  if (validNight) {
    return {
      isOpen: true,
      openTime: '19:50',
      closeTime: '次日 02:30',
      nextCloseLabel: '次日 02:30 收盘',
      nextOpenLabel: null,
      dayLabel: '夜盘交易中',
    }
  }

  if (validNightContinuation) {
    return {
      isOpen: true,
      openTime: '19:50',
      closeTime: '02:30',
      nextCloseLabel: '今日 02:30 收盘',
      nextOpenLabel: null,
      dayLabel: '夜盘交易中',
    }
  }

  // --- 休市中，计算下次开盘 ---
  if (nowMinutes < morningOpen) {
    // 凌晨02:30之后、日盘开盘之前
    return {
      isOpen: false,
      openTime: day === 1 ? '08:50' : '09:00',
      closeTime: '15:30',
      nextCloseLabel: null,
      nextOpenLabel: `今日 ${day === 1 ? '08:50' : '09:00'} 开盘`,
      dayLabel: '休市中',
    }
  }

  if (nowMinutes >= morningClose && nowMinutes < afternoonOpen) {
    // 午间休市 11:30-13:30
    return {
      isOpen: false,
      openTime: day === 1 ? '08:50' : '09:00',
      closeTime: '15:30',
      nextCloseLabel: null,
      nextOpenLabel: '今日 13:30 开盘',
      dayLabel: '午间休市',
    }
  }

  if (nowMinutes >= afternoonClose && nowMinutes < nightOpen) {
    // 日盘收盘后
    if (!hasNightSession || day === 5) {
      // 铂金/钯金无夜盘，或周五无夜盘
      if (day === 5) {
        return {
          isOpen: false,
          openTime: '08:50',
          closeTime: '15:30',
          nextCloseLabel: null,
          nextOpenLabel: '下周一 08:50 开盘',
          dayLabel: '休市中',
        }
      }
      return {
        isOpen: false,
        openTime: '09:00',
        closeTime: '15:30',
        nextCloseLabel: null,
        nextOpenLabel: hasNightSession
          ? '今日 19:50 开盘'
          : '明日 09:00 开盘',
        dayLabel: '休市中',
      }
    }
    // 黄金/白银工作日：等待夜盘开盘
    return {
      isOpen: false,
      openTime: '19:50',
      closeTime: '次日 02:30',
      nextCloseLabel: null,
      nextOpenLabel: '今日 19:50 开盘',
      dayLabel: '休市中',
    }
  }

  // 兜底
  return {
    isOpen: false,
    openTime: '09:00',
    closeTime: '15:30',
    nextCloseLabel: null,
    nextOpenLabel: '下个交易日 09:00 开盘',
    dayLabel: '休市中',
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
  // 黄金/白银有夜盘，铂金/钯金仅日盘
  const goldSilverStatus = useMemo(() => getMarketStatus(true), [])
  const platinumStatus = useMemo(() => getMarketStatus(false), [])

  // 为每种金属构建独立的交易状态
  const openStatusMap = useMemo<Record<string, boolean>>(
    () => ({
      au: goldSilverStatus.isOpen,
      ag: goldSilverStatus.isOpen,
      pt: platinumStatus.isOpen,
      pd: platinumStatus.isOpen,
    }),
    [goldSilverStatus, platinumStatus],
  )

  // 顶部状态以黄金/白银为主（交易时段更长）
  const marketStatus = goldSilverStatus
  const { metals, tickDir } = useDomesticLivePrice(domesticMetals, openStatusMap)
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
              已收盘
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
              tickDir={openStatusMap[m.id] ? tickDir[m.id] : undefined}
              isOpen={openStatusMap[m.id] ?? false}
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
