import { ArrowDown, ArrowUp } from 'lucide-react'
import type { Product } from '../lib/mockData'

interface LivePriceCardProps {
  product: Product
  tickDir?: 'up' | 'down' | 'flat'
  isOpen?: boolean
}

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function LivePriceCard({
  product,
  tickDir,
  isOpen = true,
}: LivePriceCardProps) {
  const isUp = product.change >= 0
  const stateColor = isUp ? 'var(--brand-state-success)' : 'var(--brand-state-error)'
  const flashClass =
    !isOpen ? '' : tickDir === 'up' ? 'price-flash-up' : tickDir === 'down' ? 'price-flash-down' : ''

  return (
    <article
      className={`rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow ${flashClass}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{product.name}</span>
        <span className="text-xs font-medium text-primary border border-primary/20 rounded px-1.5 py-0.5">
          {product.code}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-semibold font-mono tabular-nums tracking-tight">
          {formatPrice(product.price)}
        </span>
        <span className="text-xs text-muted-foreground">{product.unit}</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span
          className="flex items-center gap-1 font-mono tabular-nums"
          style={{ color: stateColor }}
        >
          {isUp ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          {Math.abs(product.change)}
        </span>
        <span className="font-mono tabular-nums" style={{ color: stateColor }}>
          {isUp ? '+' : ''}
          {product.changePercent}%
        </span>
        {isOpen ? (
          <span
            className="ml-auto h-2 w-2 rounded-full live-dot"
            style={{ backgroundColor: 'var(--brand-state-success)' }}
          />
        ) : (
          <span className="ml-auto text-[10px] text-muted-foreground">收盘</span>
        )}
      </div>
    </article>
  )
}
