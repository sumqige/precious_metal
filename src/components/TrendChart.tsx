import { useMemo, useState } from 'react'
import { Chart } from 'react-chartjs-2'
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
import { TrendingUp } from 'lucide-react'
import {
  buySignals,
  dailyKline,
  intradayPrices,
  intradayTimes,
  sellSignals,
  type SignalPoint,
} from '../lib/mockData'

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

type Range = 'intraday' | 'daily' | 'weekly'

const ranges: { key: Range; label: string }[] = [
  { key: 'intraday', label: '分时' },
  { key: 'daily', label: '日K' },
  { key: 'weekly', label: '周K' },
]

function buildLineGradient(ctx: CanvasRenderingContext2D, area: { top: number; bottom: number }) {
  const lineColor = '#D4A853'
  const gradient = ctx.createLinearGradient(0, area.top, 0, area.bottom)
  gradient.addColorStop(0, 'rgba(212, 168, 83, 0.22)')
  gradient.addColorStop(1, 'rgba(212, 168, 83, 0)')
  return { lineColor, gradient }
}

interface DatasetRow {
  labels: string[]
  prices: number[]
  buys: SignalPoint[]
  sells: SignalPoint[]
}

function useRangeData(range: Range): DatasetRow {
  return useMemo(() => {
    if (range === 'daily') {
      const labels = dailyKline.map((k) => k.t)
      const prices = dailyKline.map((k) => k.c)
      // Synthesize a couple of signals on the daily close line.
      const buys: SignalPoint[] = [
        { time: labels[8], price: prices[8], reason: '放量突破 20 日均线，建议买入', side: 'buy' },
      ]
      const sells: SignalPoint[] = [
        { time: labels[17], price: prices[17], reason: '高位长上影，建议卖出', side: 'sell' },
      ]
      return { labels, prices, buys, sells }
    }
    if (range === 'weekly') {
      // Group daily into ~6 weekly buckets (every 5 sessions).
      const buckets: { t: string; c: number }[] = []
      for (let i = 0; i < dailyKline.length; i += 5) {
        const slice = dailyKline.slice(i, i + 5)
        if (slice.length === 0) continue
        buckets.push({ t: `W${i / 5 + 1}`, c: slice[slice.length - 1].c })
      }
      const labels = buckets.map((b) => b.t)
      const prices = buckets.map((b) => b.c)
      const buys: SignalPoint[] = [{ time: labels[1], price: prices[1], reason: '周线企稳回升', side: 'buy' }]
      const sells: SignalPoint[] = [{ time: labels[4], price: prices[4], reason: '周线阻力位', side: 'sell' }]
      return { labels, prices, buys, sells }
    }
    return { labels: intradayTimes, prices: intradayPrices, buys: buySignals, sells: sellSignals }
  }, [range])
}

export default function TrendChart() {
  const [range, setRange] = useState<Range>('intraday')
  const { labels, prices, buys, sells } = useRangeData(range)

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          type: 'line' as const,
          label: 'XAU/USD',
          data: prices,
          borderColor: '#D4A853',
          backgroundColor: (context: { chart: ChartJS }) => {
            const { ctx, chartArea } = context.chart
            if (!chartArea) return undefined
            return buildLineGradient(ctx, chartArea).gradient
          },
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#D4A853',
          order: 2,
        },
        {
          type: 'scatter' as const,
          label: '买入',
          data: buys.map((b) => ({ x: b.time, y: b.price, reason: b.reason })),
          backgroundColor: '#22C55E',
          borderColor: '#22262E',
          borderWidth: 2,
          pointStyle: 'triangle' as const,
          pointRadius: 8,
          pointHoverRadius: 10,
          order: 1,
        },
        {
          type: 'scatter' as const,
          label: '卖出',
          data: sells.map((s) => ({ x: s.time, y: s.price, reason: s.reason })),
          backgroundColor: '#EF4444',
          borderColor: '#22262E',
          borderWidth: 2,
          pointStyle: 'rectRot' as const,
          pointRadius: 8,
          pointHoverRadius: 10,
          order: 1,
        },
      ],
    }),
    [labels, prices, buys, sells],
  )

  const options = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: '#A1A1AA',
            usePointStyle: true,
            pointStyle: 'circle',
            font: { family: 'Inter, sans-serif', size: 12 },
          },
        },
        tooltip: {
          backgroundColor: '#22262E',
          titleColor: '#F5F5F4',
          bodyColor: '#A1A1AA',
          borderColor: '#2F3440',
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              const raw = context.raw as { x?: unknown; y?: number; reason?: string }
              if (raw && raw.reason) {
                return `${context.dataset.label}: ${raw.y} — ${raw.reason}`
              }
              return `${context.dataset.label}: ${context.parsed.y}`
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#2F3440', drawBorder: false },
          ticks: { color: '#A1A1AA', font: { family: 'SF Mono, monospace', size: 11 } },
        },
        y: {
          grid: { color: '#2F3440', drawBorder: false },
          ticks: { color: '#A1A1AA', font: { family: 'SF Mono, monospace', size: 11 } },
        },
      },
    }),
    [],
  )

  return (
    <section className="xl:col-span-8 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold">黄金分时走势</h2>
            <p className="text-xs text-muted-foreground">XAU/USD · 买入/卖出信号标注</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={[
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                range === r.key
                  ? 'bg-primary text-primary-foreground bg-primary-hover hover:bg-primary-hover active:bg-primary-active'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full rounded-md border border-border bg-background p-2">
        <div style={{ height: 320, maxHeight: 360 }}>
          <Chart type="line" data={data as never} options={options} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SignalList title="买入信号" side="buy" signals={buys} />
        <SignalList title="卖出信号" side="sell" signals={sells} />
      </div>
    </section>
  )
}

function SignalList({
  title,
  side,
  signals,
}: {
  title: string
  side: 'buy' | 'sell'
  signals: SignalPoint[]
}) {
  const color = side === 'buy' ? 'var(--brand-state-success)' : 'var(--brand-state-error)'
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium" style={{ color }}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {title}
      </div>
      {signals.length === 0 ? (
        <p className="text-xs text-muted-foreground">暂无信号</p>
      ) : (
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          {signals.map((s, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span className="min-w-0 truncate">
                {s.time} {s.reason}
              </span>
              <span className="font-mono shrink-0">{s.price}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
