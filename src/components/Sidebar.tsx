import { NavLink } from 'react-router-dom'
import { BarChart2, Home, Globe, Activity, Star, Settings } from 'lucide-react'

const items = [
  { to: '/', label: '行情', icon: Home, end: true },
  { to: '/domestic', label: '国内', icon: Globe, end: false },
  { to: '/analysis', label: '分析', icon: Activity, end: false },
  { to: '/watchlist', label: '自选', icon: Star, end: false },
  { to: '/settings', label: '设置', icon: Settings, end: false },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-16 flex-col items-center border-r border-border bg-card py-5 gap-6 shrink-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <BarChart2 className="h-5 w-5" />
      </div>
      <nav className="flex flex-col gap-3 w-full px-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-1 rounded-md p-2 transition-colors',
                isActive
                  ? 'text-primary bg-primary/10 hover:bg-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')
            }
            aria-label={label}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] leading-none">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
