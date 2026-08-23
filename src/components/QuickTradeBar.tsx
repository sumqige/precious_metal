import { useState } from 'react'
import { BarChart2 } from 'lucide-react'
import { useToast } from './Toast'
import type { Product } from '../lib/mockData'

interface QuickTradeBarProps {
  products: Product[]
}

export default function QuickTradeBar({ products }: QuickTradeBarProps) {
  const { notify } = useToast()
  const [productId, setProductId] = useState(products[0]?.id ?? 'xauusd')
  const [qty, setQty] = useState(1)
  const [orders, setOrders] = useState<
    { id: string; side: 'buy' | 'sell'; product: string; qty: number; price: number; time: string }[]
  >([])

  const current = products.find((p) => p.id === productId) ?? products[0]

  const submit = (side: 'buy' | 'sell') => {
    if (!current) return
    if (qty <= 0) {
      notify('请输入有效数量', 'error')
      return
    }
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    setOrders((prev) => [
      { id: `${Date.now()}`, side, product: current.code, qty, price: current.price, time },
      ...prev,
    ].slice(0, 6))
    notify(
      `${side === 'buy' ? '买入' : '卖出'} ${current.code} ${qty} 手 @ ${current.price.toFixed(2)} 已模拟成交`,
      side === 'buy' ? 'success' : 'error',
    )
  }

  return (
    <section className="mt-5 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BarChart2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">快速操作</h2>
            <p className="text-xs text-muted-foreground">基于当前信号的模拟交易入口</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="rounded-md border border-border bg-input px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
            aria-label="品种"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 rounded-md border border-border bg-input px-3 py-1.5">
            <span className="text-xs text-muted-foreground">数量</span>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 0)}
              className="w-16 bg-transparent text-sm font-mono outline-none"
              aria-label="数量"
            />
            <span className="text-xs text-muted-foreground">手</span>
          </div>
          <button
            onClick={() => submit('buy')}
            className="rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ backgroundColor: 'var(--brand-state-success)' }}
          >
            买入
          </button>
          <button
            onClick={() => submit('sell')}
            className="rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ backgroundColor: 'var(--brand-state-error)' }}
          >
            卖出
          </button>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="mt-4 overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[420px] text-left text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">时间</th>
                <th className="py-2 pr-3 font-medium">方向</th>
                <th className="py-2 pr-3 font-medium">品种</th>
                <th className="py-2 pr-3 font-medium">数量</th>
                <th className="py-2 pr-3 font-medium">价格</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border/60">
                  <td className="py-2 pr-3">{o.time}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={
                        o.side === 'buy'
                          ? 'text-success'
                          : 'text-error'
                      }
                    >
                      {o.side === 'buy' ? '买入' : '卖出'}
                    </span>
                  </td>
                  <td className="py-2 pr-3">{o.product}</td>
                  <td className="py-2 pr-3">{o.qty}</td>
                  <td className="py-2 pr-3">{o.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
