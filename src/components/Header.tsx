import { useState } from 'react'
import { BarChart2, Search, Bell, User, Menu } from 'lucide-react'
import { useToast } from './Toast'

interface HeaderProps {
  onOpenMobileNav: () => void
}

export default function Header({ onOpenMobileNav }: HeaderProps) {
  const { notify } = useToast()
  const [query, setQuery] = useState('')

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    notify(`已搜索「${query.trim()}」`, 'info')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-5 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden"
          aria-label="菜单"
          onClick={onOpenMobileNav}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary md:hidden shrink-0">
          <BarChart2 className="h-5 w-5" />
        </div>
        <h1 className="text-base sm:text-lg font-semibold tracking-tight truncate">
          贵金属行情中心
        </h1>
        <span className="hidden sm:inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground shrink-0">
          <span
            className="mr-1.5 h-1.5 w-1.5 rounded-full live-dot"
            style={{ backgroundColor: 'var(--brand-state-success)' }}
          />
          交易中
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <form
          onSubmit={submitSearch}
          className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-input px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索品种 / 新闻"
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-[140px] w-32 lg:w-44"
          />
        </form>
        <button
          className="sm:hidden rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="搜索"
          onClick={() => notify('搜索功能即将上线', 'info')}
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="通知"
          onClick={() => notify('暂无新通知', 'info')}
        >
          <Bell className="h-5 w-5" />
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: 'var(--brand-state-error)' }}
          />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="用户"
          onClick={() => notify('请先登录账户', 'info')}
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
