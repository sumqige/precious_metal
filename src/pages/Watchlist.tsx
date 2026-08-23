import { useState } from 'react'
import { Star, ArrowDown, ArrowUp } from 'lucide-react'
import { useLivePrice } from '../hooks/useLivePrice'
import { watchlistSeed } from '../lib/mockData'
import { useToast } from '../components/Toast'

export default function WatchlistPage() {
  // Keep live prices flowing into the watchlist too.
  const { products } = useLivePrice(watchlistSeed)
  const { notify } = useToast()
  const [added, setAdded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(watchlistSeed.map((p) => [p.id, p.added])),
  )

  const toggle = (id: string, name: string) => {
    setAdded((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      notify(next[id] ? `已添加「${name}」到自选` : `已移除「${name}」`, next[id] ? 'success' : 'info')
      return next
    })
  }

  const list = products.filter((p) => added[p.id])
  const all = products

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Star className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold">我的自选</h2>
            <p className="text-xs text-muted-foreground">
              {list.length} 个品种 · 点击星标可添加 / 移除
            </p>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
            暂无自选品种，从下方列表添加吧。
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-medium">品种</th>
                  <th className="py-2 pr-3 font-medium text-right">最新价</th>
                  <th className="py-2 pr-3 font-medium text-right">涨跌</th>
                  <th className="py-2 pr-3 font-medium text-right">涨跌幅</th>
                  <th className="py-2 pr-3 font-medium text-right">最高</th>
                  <th className="py-2 pr-3 font-medium text-right">最低</th>
                  <th className="py-2 pr-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {list.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 hover:bg-muted/40">
                    <td className="py-2.5 pr-3">
                      <div className="font-sans">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.code}</div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-right">{p.price.toFixed(2)}</td>
                    <td className="py-2.5 pr-3 text-right">
                      <span
                        className="inline-flex items-center gap-1"
                        style={{
                          color:
                            p.change >= 0
                              ? 'var(--brand-state-success)'
                              : 'var(--brand-state-error)',
                        }}
                      >
                        {p.change >= 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {Math.abs(p.change)}
                      </span>
                    </td>
                    <td
                      className="py-2.5 pr-3 text-right"
                      style={{
                        color:
                          p.change >= 0 ? 'var(--brand-state-success)' : 'var(--brand-state-error)',
                      }}
                    >
                      {p.change >= 0 ? '+' : ''}
                      {p.changePercent}%
                    </td>
                    <td className="py-2.5 pr-3 text-right text-muted-foreground">{p.high.toFixed(2)}</td>
                    <td className="py-2.5 pr-3 text-right text-muted-foreground">{p.low.toFixed(2)}</td>
                    <td className="py-2.5 pr-3 text-right">
                      <button
                        onClick={() => toggle(p.id, p.name)}
                        className="rounded-md px-2 py-1 text-xs text-primary border border-primary/20 hover:bg-primary/10 transition-colors"
                      >
                        移除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold">全部品种</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((p) => (
            <div
              key={p.id}
              className="rounded-md border border-border bg-background p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.code} · {p.price.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => toggle(p.id, p.name)}
                aria-label={added[p.id] ? '移除自选' : '添加自选'}
                className="shrink-0 rounded-md p-1.5 transition-colors"
                style={{
                  color: added[p.id] ? 'var(--brand-primary)' : 'var(--brand-ink-3)',
                  backgroundColor: added[p.id] ? 'rgba(212,168,83,0.1)' : 'transparent',
                }}
              >
                <Star className="h-4 w-4" fill={added[p.id] ? 'currentColor' : 'none'} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
