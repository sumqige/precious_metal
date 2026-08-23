import { Newspaper } from 'lucide-react'
import { newsItems, prediction, type NewsItem } from '../lib/mockData'

const signalLabel: Record<NewsItem['signal'], string> = {
  bull: '看涨',
  bear: '看跌',
  neutral: '中性',
}

const signalClass: Record<NewsItem['signal'], string> = {
  bull: 'signal-bull',
  bear: 'signal-bear',
  neutral: 'signal-neutral',
}

export default function NewsPanel() {
  const international = newsItems.filter((n) => n.scope === 'international')
  const domestic = newsItems.filter((n) => n.scope === 'domestic')

  return (
    <section className="xl:col-span-4 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Newspaper className="h-4 w-4" />
        </div>
        <h2 className="text-base font-semibold">消息与预测</h2>
      </div>

      <div className="flex flex-col gap-3">
        <NewsGroup title="国际消息" items={international} />
        <NewsGroup title="国内消息" items={domestic} />

        <div className="mt-1 rounded-md border border-primary/20 bg-primary/5 p-3">
          <h3 className="mb-1.5 text-sm font-semibold text-primary">短期走势预测</h3>
          <p className="text-sm leading-relaxed text-foreground">
            {prediction.text.split('震荡偏强').map((part, i, arr) =>
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  <span className="font-semibold text-primary">震荡偏强</span>
                </span>
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="rounded px-1.5 py-0.5 font-medium signal-bull">
              看涨 {prediction.counts.bull}
            </span>
            <span className="rounded px-1.5 py-0.5 font-medium signal-bear">
              看跌 {prediction.counts.bear}
            </span>
            <span className="rounded px-1.5 py-0.5 font-medium signal-neutral">
              中性 {prediction.counts.neutral}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function NewsGroup({ title, items }: { title: string; items: NewsItem[] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((n) => (
          <article
            key={n.id}
            className="rounded-md border border-border bg-background p-3 hover:border-primary/40 transition-colors cursor-default"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm leading-snug">{n.title}</p>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${signalClass[n.signal]}`}
              >
                {signalLabel[n.signal]}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{n.summary}</p>
            <p className="mt-1 text-[10px] text-muted-foreground/70 font-mono">{n.time}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
