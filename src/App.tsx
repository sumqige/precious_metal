import { Suspense, useState } from 'react'
import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MobileNav from './components/MobileNav'
import { ToastProvider, useToast } from './components/Toast'
import MarketPage from './pages/Market'
import DomesticPage from './pages/Domestic'
import AnalysisPage from './pages/Analysis'
import WatchlistPage from './pages/Watchlist'
import SettingsPage from './pages/Settings'

function ToastViewport() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[min(92vw,320px)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-2 rounded-md border border-border bg-popover px-3 py-2.5 text-sm shadow-md animate-[livePulse_0.3s_ease]"
          style={{
            borderLeft:
              t.tone === 'success'
                ? '3px solid var(--brand-state-success)'
                : t.tone === 'error'
                  ? '3px solid var(--brand-state-error)'
                  : '3px solid var(--brand-state-info)',
          }}
        >
          <span
            className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
            style={{
              backgroundColor:
                t.tone === 'success'
                  ? 'var(--brand-state-success)'
                  : t.tone === 'error'
                    ? 'var(--brand-state-error)'
                    : 'var(--brand-state-info)',
            }}
          />
          <span className="flex-1 leading-snug text-foreground">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="关闭"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
        <Sidebar />

        {/* Mobile slide-over nav (mirrors sidebar) */}
        {mobileNavOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setMobileNavOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full w-60 border-r border-border bg-card p-5 flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">导航</span>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <MobileNavLinks onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 pb-24 md:pb-5">
            <Suspense fallback={<div className="text-sm text-muted-foreground">加载中…</div>}>
              <Routes>
                <Route path="/" element={<MarketPage />} />
                <Route path="/domestic" element={<DomesticPage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>

        <MobileNav />
      </div>
      <ToastViewport />
    </ToastProvider>
  )
}

function MobileNavLinks({ onNavigate }: { onNavigate: () => void }) {
  const items = [
    { to: '/', label: '行情', end: true },
    { to: '/domestic', label: '国内行情', end: false },
    { to: '/analysis', label: '分析', end: false },
    { to: '/watchlist', label: '自选', end: false },
    { to: '/settings', label: '设置', end: false },
  ]
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'rounded-md px-3 py-2 text-left text-sm transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            ].join(' ')
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
