import { useState } from 'react'
import { Bell, Palette, Sliders, User } from 'lucide-react'
import { useToast } from '../components/Toast'

export default function SettingsPage() {
  const { notify } = useToast()
  const [push, setPush] = useState(true)
  const [sound, setSound] = useState(false)
  const [volatility, setVolatility] = useState(60)
  const [refresh, setRefresh] = useState(2500)

  const refreshOptions = [
    { value: 1500, label: '1.5 秒（快速）' },
    { value: 2500, label: '2.5 秒（默认）' },
    { value: 5000, label: '5 秒（省电）' },
  ]

  return (
    <div className="mx-auto w-full max-w-[860px] space-y-5">
      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold">账户</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <User className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium">访客用户</div>
            <div className="text-xs text-muted-foreground">未登录 · 仅模拟数据</div>
          </div>
          <button
            onClick={() => notify('登录功能即将上线', 'info')}
            className="ml-auto rounded-md bg-primary text-primary-foreground bg-primary-hover hover:bg-primary-hover active:bg-primary-active px-4 py-2 text-sm font-medium transition-colors"
          >
            登录
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Bell className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold">通知</h2>
        </div>
        <div className="divide-y divide-border">
          <Toggle
            label="价格推送"
            desc="行情更新时在站内提示"
            checked={push}
            onChange={(v) => {
              setPush(v)
              notify(v ? '已开启价格推送' : '已关闭价格推送', 'info')
            }}
          />
          <Toggle
            label="提示音效"
            desc="买卖信号触发时播放音效"
            checked={sound}
            onChange={(v) => {
              setSound(v)
              notify(v ? '已开启提示音效' : '已关闭提示音效', 'info')
            }}
          />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sliders className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold">行情参数</h2>
        </div>
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>模拟波动率</span>
              <span className="font-mono text-muted-foreground">{volatility}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={120}
              value={volatility}
              onChange={(e) => setVolatility(Number(e.target.value))}
              className="w-full accent-[var(--brand-primary)]"
              aria-label="模拟波动率"
            />
            <p className="mt-1 text-xs text-muted-foreground">数值越大，模拟价格跳动越剧烈</p>
          </div>
          <div>
            <div className="mb-2 text-sm">数据刷新频率</div>
            <div className="flex flex-wrap gap-2">
              {refreshOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setRefresh(opt.value)
                    notify(`刷新频率已设为 ${opt.label}`, 'info')
                  }}
                  className={[
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    refresh === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground border border-border hover:bg-muted hover:text-foreground',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Palette className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold">外观</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: '#D4A853' }} />
            <span className="text-sm">贵金属暗色（当前）</span>
          </div>
          <button
            onClick={() => notify('浅色主题即将上线', 'info')}
            className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            浅色（敬请期待）
          </button>
        </div>
      </section>

      <p className="pb-2 text-center text-xs text-muted-foreground">
        贵金属行情中心 · 演示项目 · 数据均为模拟
      </p>
    </div>
  )
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0 pr-4">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  )
}
