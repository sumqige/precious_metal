import { NavLink } from 'react-router-dom'
import { Home, Globe, Activity, Star, Settings } from 'lucide-react'

const items = [
  { to: '/', label: '行情', icon: Home, end: true },
  { to: '/domestic', label: '国内', icon: Globe, end: false },
  { to: '/analysis', label: '分析', icon: Activity, end: false },
  { to: '/watchlist', label: '自选', icon: Star, end: false },
  { to: '/settings', label: '设置', icon: Settings, end: false },
]

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                ].join(' ')
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
