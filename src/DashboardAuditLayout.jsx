import React from 'react'
import { LayoutDashboard, ShieldCheck } from 'lucide-react'

const DEFAULT_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'auditoria', label: 'Auditoria', icon: ShieldCheck }
]

export default function DashboardAuditLayout({
  activeView = 'dashboard',
  onChangeView,
  tabs = DEFAULT_TABS,
  subtitle = 'Governança Operacional · Conformidade DETRAN/CE',
  rightActions = null,
  children
}) {
  return (
    <section className="space-y-5">
      {/* Barra Compacta de Alternância entre Dashboard e Auditoria */}
      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div
            role="tablist"
            aria-label="Alternar entre Dashboard e Auditoria"
            className="inline-flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] shrink-0"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeView === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => onChangeView?.(tab.id)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-2 ${
                    isActive
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-on-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span className="font-mono tabular-nums text-[11px] opacity-85">
                      ({tab.count})
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {subtitle && (
            <span className="hidden md:inline text-xs text-[var(--text-muted)] truncate">
              {subtitle}
            </span>
          )}
        </div>

        {rightActions && (
          <div className="flex items-center gap-2 shrink-0">{rightActions}</div>
        )}
      </div>

      {/* Painel Ativo */}
      <div
        role="tabpanel"
        id={`panel-${activeView}`}
        aria-labelledby={`tab-${activeView}`}
        className="space-y-5"
      >
        {children}
      </div>
    </section>
  )
}
