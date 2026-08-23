import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export interface Toast {
  id: number
  message: string
  tone: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  toasts: Toast[]
  notify: (message: string, tone?: Toast['tone']) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, tone: Toast['tone'] = 'info') => {
      const id = Date.now() + Math.random()
      setToasts((list) => [...list, { id, message, tone }])
      window.setTimeout(() => dismiss(id), 3200)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toasts, notify, dismiss }}>{children}</ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
