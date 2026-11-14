import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CheckCircle2, XCircle, X, Trash2 } from 'lucide-react'

const ToastContext = createContext(null)
const STORAGE_KEY = 'necava_persistent_toasts'
const MAX_TOASTS = 5

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toasts))
    } catch {
      // Ignore storage quota errors
    }
  }, [toasts])

  const addToast = useCallback((type, title, description = '') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const timestamp = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    setToasts((prev) => [{ id, type, title, description, timestamp }, ...prev].slice(0, MAX_TOASTS))
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

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, dismissToast, clearToasts }}>
      {children}

      {toasts.length > 0 && (
        <aside
          aria-label="Notificações do sistema"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm flex flex-col gap-2.5 pointer-events-none"
        >
          {toasts.length > 1 && (
            <div className="flex justify-end pointer-events-auto animate-toast-in">
              <button
                type="button"
                onClick={clearToasts}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer shadow-lg backdrop-blur-md transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Limpar notificações ({toasts.length})
              </button>
            </div>
          )}

          {toasts.map((t) => {
            const isSuccess = t.type === 'success'
            return (
              <div
                key={t.id}
                role={isSuccess ? 'status' : 'alert'}
                className={`pointer-events-auto animate-toast-in rounded-xl border p-3.5 shadow-2xl backdrop-blur-md bg-[var(--bg-toast)] ${
                  isSuccess
                    ? 'border-emerald-500/60 ring-1 ring-emerald-500/20'
                    : 'border-red-500/60 ring-1 ring-red-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSuccess
                        ? 'bg-emerald-500/15 text-[var(--semantic-success-text)] border border-emerald-500/30'
                        : 'bg-red-500/15 text-[var(--semantic-danger-text)] border border-red-500/30'
                    }`}
                  >
                    {isSuccess ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-bold leading-snug ${
                          isSuccess
                            ? 'text-[var(--semantic-success-text)]'
                            : 'text-[var(--semantic-danger-text)]'
                        }`}
                      >
                        {t.title}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--text-muted)] tabular-nums shrink-0">
                        {t.timestamp}
                      </span>
                    </div>

                    {t.description && (
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed break-words">
                        {t.description}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => dismissToast(t.id)}
                    aria-label="Fechar notificação"
                    className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </aside>
      )}
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
