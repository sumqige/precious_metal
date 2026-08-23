import { Activity, Gauge, Layers, Percent, TrendingDown, TrendingUp } from 'lucide-react'
import { useLivePrice } from '../hooks/useLivePrice'
import { initialProducts, dailyKline } from '../lib/mockData'

interface Indicator {
  name: string
  value: string
  signal: 'bull' | 'bear' | 'neutral'
  hint: string
}

const indicators: Indicator[] = [
  { name: 'RSI(14)', value: '58.3', signal: 'neutral', hint: '中性区间，未现超买/超卖' },
  { name: 'MACD', value: '+2.4', signal: 'bull', hint: '金叉向上，多头动能增强' },
  { name: 'KDJ', value: 'J 72.1', signal: 'bull', hint: 'J 值拐头向上' },
  { name: '布林带', value: '上轨 2424', signal: 'bear', hint: '贴近上轨，注意回落' },
  { name: 'MA20', value: '2405.6', signal: 'bull', hint: '价格站上 20 日均线' },
  { name: '成交量', value: '1.2x', signal: 'neutral', hint: '量能与近 5 日均值持平' },
]

const signalMap = {
  bull: { label: '看涨', cls: 'signal-bull', color: 'var(--brand-state-success)' },
  bear: { label: '看跌', cls: 'signal-bear', color: 'var(--brand-state-error)' },
  neutral: { label: '中性', cls: 'signal-neutral', color: 'var(--brand-ink-2)' },
} as const

export default function AnalysisPage() {
  const { products } = useLivePrice(initialProducts)
  const gold = products.find((p) => p.id === 'xauusd') ?? products[0]

  // Simple daily return distribution from K-line closes.
  const returns = dailyKline.slice(1).map((k, i) => k.c - dailyKline[i].c)
  const upDays = returns.filter((r) => r > 0).length
  const downDays = returns.filter((r) => r < 0).length
  const maxGain = Math.max(...returns)
  const maxLoss = Math.min(...returns)

  const stats = [
    { label: '近 30 日上涨', value: `${upDays} 天`, icon: TrendingUp, tone: 'success' as const },
    { label: '近 30 日下跌', value: `${downDays} 天`, icon: TrendingDown, tone: 'error' as const },
    {
      label: '最大单日涨幅',
      value: `+${maxGain.toFixed(1)}`,
      icon: Percent,
      tone: 'success' as const,
    },
    {
      label: '最大单日跌幅',
      value: `${maxLoss.toFixed(1)}`,
      icon: Percent,
      tone: 'error' as const,
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold">技术分析</h2>
            <p className="text-xs text-muted-foreground">
              XAU/USD · 当前 {gold?.price.toFixed(2)} {gold?.unit}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-md border border-border bg-background p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </div>
              <div
                className="mt-1 text-lg font-semibold font-mono tabular-nums"
                style={{
                  color:
                    s.tone === 'success'
                      ? 'var(--brand-state-success)'
                      : 'var(--brand-state-error)',
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Gauge className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold">指标信号</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {indicators.map((ind) => {
            const s = signalMap[ind.signal]
            return (
              <div key={ind.name} className="rounded-md border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{ind.name}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${s.cls}`}>
                    {s.label}
                  </span>
                </div>
                <div className="mt-1 text-lg font-semibold font-mono tabular-nums" style={{ color: s.color }}>
                  {ind.value}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{ind.hint}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Layers className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold">支撑 / 阻力位</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: '第一支撑', value: 2395, tone: 'success' as const },
            { label: '第二支撑', value: 2382, tone: 'success' as const },
            { label: '第一阻力', value: 2420, tone: 'error' as const },
            { label: '第二阻力', value: 2434, tone: 'error' as const },
            { label: '枢轴点', value: 2408, tone: 'neutral' as const },
            { label: '当日开盘', value: gold?.openPrice ?? 2400, tone: 'neutral' as const },
          ].map((row) => (
            <div key={row.label} className="rounded-md border border-border bg-background p-3">
              <div className="text-xs text-muted-foreground">{row.label}</div>
              <div
                className="mt-1 text-lg font-semibold font-mono tabular-nums"
                style={{
                  color:
                    row.tone === 'success'
                      ? 'var(--brand-state-success)'
                      : row.tone === 'error'
                        ? 'var(--brand-state-error)'
                        : 'var(--brand-ink)',
                }}
              >
                {row.value.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
