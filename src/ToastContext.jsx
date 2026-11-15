import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

const ToastContext = createContext(null)
const STORAGE_KEY = 'necava_persistent_toasts'
const MAX_TOASTS = 10

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed.slice(0, MAX_TOASTS) : []
    } catch {
      return []
    }
  })
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toasts))
    } catch {
      // Ignore storage quota errors
    }
  }, [toasts])

  useEffect(() => {
    if (toasts.length === 0) {
      setActiveIndex(0)
    } else if (activeIndex >= toasts.length) {
      setActiveIndex(toasts.length - 1)
    }
  }, [toasts.length, activeIndex])

  const addToast = useCallback((type, title, description = '') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const timestamp = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    setToasts((prev) => [{ id, type, title, description, timestamp }, ...prev].slice(0, MAX_TOASTS))
    setActiveIndex(0)
    return id
  }, [])

  const showToast = useCallback(
    ({ type = 'success', title, description = '' }) => addToast(type, title, description),
    [addToast]
  )

  const success = useCallback(
    (title, description = '') => addToast('success', title, description),
    [addToast]
  )

  const error = useCallback(
    (title, description = '') => addToast('error', title, description),
    [addToast]
  )

  const info = useCallback(
    (title, description = '') => addToast('info', title, description),
    [addToast]
  )

  const warning = useCallback(
    (title, description = '') => addToast('warning', title, description),
    [addToast]
  )

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, success, error, info, warning, dismissToast, clearToasts }}
    >
      {children}

      {toasts.length > 0 && (() => {
        const currentToast = toasts[activeIndex] || toasts[0]
        const isSuccess = currentToast.type === 'success'
        const isInfo = currentToast.type === 'info'
        const isWarning = currentToast.type === 'warning'

        return (
          <aside
            aria-label="Notificações do sistema"
            aria-live="polite"
            className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
          >
            <div
              key={currentToast.id}
              role={isSuccess || isInfo ? 'status' : 'alert'}
              className={`pointer-events-auto animate-toast-in rounded-xl border p-3.5 shadow-2xl backdrop-blur-md bg-[var(--bg-toast)] ${
                isSuccess
                  ? 'border-emerald-500/60 ring-1 ring-emerald-500/20'
                  : isInfo
                  ? 'border-sky-500/60 ring-1 ring-sky-500/20'
                  : isWarning
                  ? 'border-amber-500/60 ring-1 ring-amber-500/20'
                  : 'border-red-500/60 ring-1 ring-red-500/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSuccess
                      ? 'bg-emerald-500/15 text-[var(--semantic-success-text)] border border-emerald-500/30'
                      : isInfo
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      : isWarning
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-red-500/15 text-[var(--semantic-danger-text)] border border-red-500/30'
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isInfo ? (
                    <Info className="w-4 h-4" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-bold leading-snug truncate ${
                        isSuccess
                          ? 'text-[var(--semantic-success-text)]'
                          : isInfo
                          ? 'text-sky-400'
                          : isWarning
                          ? 'text-amber-400'
                          : 'text-[var(--semantic-danger-text)]'
                      }`}
                    >
                      {currentToast.title}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)] tabular-nums shrink-0">
                      {currentToast.timestamp}
                    </span>
                  </div>

                  {currentToast.description && (
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed break-words">
                      {currentToast.description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => dismissToast(currentToast.id)}
                  aria-label="Fechar notificação"
                  className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {toasts.length > 1 && (
                <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveIndex((prev) => (prev - 1 + toasts.length) % toasts.length)}
                      aria-label="Notificação anterior"
                      className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[10px] text-[var(--text-muted)] tabular-nums px-1">
                      {activeIndex + 1} / {toasts.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveIndex((prev) => (prev + 1) % toasts.length)}
                      aria-label="Próxima notificação"
                      className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={clearToasts}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Limpar tudo
                  </button>
                </div>
              )}
            </div>
          </aside>
        )
      })()}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast deve ser utilizado dentro de ToastProvider')
  }
  return ctx
}
