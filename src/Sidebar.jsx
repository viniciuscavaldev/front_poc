import React from 'react'
import { NavLink } from 'react-router-dom'
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import BrandLogo from './BrandLogo'

const STATUS_DOT = {
  complete: {
    dot: 'bg-[var(--semantic-success-text)] ring-2 ring-[var(--semantic-success-border)]',
    text: 'text-[var(--semantic-success-text)]',
    label: 'Concluído'
  },
  warning: {
    dot: 'bg-amber-400 ring-2 ring-amber-400/25',
    text: 'text-[var(--semantic-warning-text)]',
    label: 'Atenção'
  },
  inactive: {
    dot: 'bg-[var(--border-strong)] ring-2 ring-[var(--border-subtle)]',
    text: 'text-[var(--text-muted)]',
    label: 'Inativo'
  }
}

function SidebarContent({
  tabs,
  statusMap,
  completedCount,
  collapsed,
  onToggleCollapse,
  mesaCount,
  auth,
  onLogout,
  isMobile = false,
  onCloseMobile
}) {
  return (
    <div className="h-full flex flex-col bg-[var(--bg-sidebar)] text-[var(--text-primary)] select-none">
      {/* Cabeçalho Institucional da Sidebar */}
      <div
        className={`h-14 border-b border-[var(--border-subtle)] flex items-center shrink-0 ${
          collapsed && !isMobile ? 'justify-center px-2' : 'justify-between px-4'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandLogo sizeClass="w-8 h-8" textSize="text-sm" />
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <div className="font-bold text-xs text-[var(--text-primary)] tracking-tight truncate">
                NECAVA · DETRAN/CE
              </div>
              <div className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums truncate">
                CNPJ 05.591.991/0001-48
              </div>
            </div>
          )}
        </div>

        {isMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Fechar menu lateral"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          !collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Recolher menu lateral"
              aria-label="Recolher menu lateral"
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )
        )}
      </div>

      {/* Botão Expandir quando recolhido */}
      {collapsed && !isMobile && (
        <div className="px-2 pt-3 flex justify-center">
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Expandir menu lateral"
            aria-label="Expandir menu lateral"
            className="w-full py-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] flex items-center justify-center cursor-pointer transition-colors"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Lista Unificada de Módulos + Progresso */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-3">
        {(!collapsed || isMobile) && (
          <div className="px-2 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[var(--text-muted)]">Módulos PoC Atual</span>
            <span className="font-mono font-bold text-[var(--accent-text)] tabular-nums">
              {completedCount}/{tabs.filter((t) => !t.upcoming).length}
            </span>
          </div>
        )}

        <nav aria-label="Navegação principal de módulos" className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const statusInfo = statusMap[tab.id] || { status: 'inactive', detail: '' }
            const cfg = STATUS_DOT[statusInfo.status] || STATUS_DOT.inactive
            const showMesaBadge = tab.id === 'mesa' && mesaCount > 0

            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                onClick={() => {
                  if (onCloseMobile) onCloseMobile()
                }}
                title={collapsed && !isMobile ? `${tab.label} · ${statusInfo.detail}` : undefined}
                className={({ isActive }) =>
                  `relative w-full rounded-lg border transition-colors duration-150 cursor-pointer group focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] ${
                    collapsed && !isMobile
                      ? 'p-2.5 flex flex-col items-center justify-center'
                      : 'px-3 py-2.5 text-left flex items-start gap-3'
                  } ${
                    isActive
                      ? 'bg-[var(--bg-surface)] border-[var(--accent-border)] text-[var(--text-primary)] shadow-xs'
                      : 'bg-transparent border-transparent hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative shrink-0 mt-0.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-[var(--accent-text)]'
                            : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                        }`}
                      />
                      <span
                        aria-label={cfg.label}
                        className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${cfg.dot}`}
                      />
                    </div>

                    {(!collapsed || isMobile) && (
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className={`text-xs font-semibold truncate ${
                              isActive
                                ? 'text-[var(--text-primary)]'
                                : tab.upcoming
                                ? 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                                : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                            }`}
                          >
                            {tab.label}
                          </span>
                          {showMesaBadge && (
                            <span
                              className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold tabular-nums shrink-0 ${
                                isActive
                                  ? 'bg-[var(--accent-primary)] text-[var(--accent-on-primary)]'
                                  : 'bg-[var(--semantic-warning-bg)] text-[var(--semantic-warning-text)]'
                              }`}
                            >
                              {mesaCount}
                            </span>
                          )}
                          {tab.upcoming && (
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[var(--text-muted)] shrink-0">
                              Em prod.
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] font-mono truncate mt-0.5 tabular-nums ${cfg.text}`}>
                          {statusInfo.detail}
                        </div>
                      </div>
                    )}

                    {collapsed && !isMobile && showMesaBadge && (
                      <span className="mt-1 font-mono text-[9px] font-bold text-[var(--semantic-warning-text)] tabular-nums">
                        {mesaCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Rodapé da Sidebar: Legenda + Operador + Sair */}
      <div className="border-t border-[var(--border-subtle)] p-3 space-y-3 shrink-0">
        {(!collapsed || isMobile) && (
          <div className="px-1 flex items-center justify-between gap-2 text-[10px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--semantic-success-text)]" /> Concluído
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Atenção
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--border-strong)]" /> Inativo
            </span>
          </div>
        )}

        {(!collapsed || isMobile) && (auth?.nome || auth?.usuario) && (
          <div className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="text-[11px] font-semibold text-[var(--text-primary)] truncate">
              {auth.nome || auth.usuario}
            </div>
            <div className="text-[10px] font-mono text-[var(--text-muted)] truncate">
              {auth.papel || 'Fiscal / Operador DETRAN-CE'}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          title={collapsed && !isMobile ? 'Sair da sessão' : undefined}
          className={`w-full rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--semantic-danger-bg)] border border-[var(--border-subtle)] hover:border-[var(--semantic-danger-border)] text-[var(--text-secondary)] hover:text-[var(--semantic-danger-text)] text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
            collapsed && !isMobile ? 'py-2 px-2' : 'py-2 px-3'
          }`}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {(!collapsed || isMobile) && <span>Encerrar Sessão</span>}
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({
  tabs = [],
  statusItems = [],
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  mesaCount = 0,
  auth,
  onLogout
}) {
  const statusMap = Object.fromEntries(statusItems.map((item) => [item.id, item]))
  const activeTabIds = new Set(tabs.filter((t) => !t.upcoming).map((t) => t.id))
  const completedCount = statusItems.filter(
    (item) => activeTabIds.has(item.id) && item.status === 'complete'
  ).length

  return (
    <>
      <aside
        aria-label="Menu lateral da plataforma"
        className={`hidden lg:block sticky top-0 h-screen shrink-0 border-r border-[var(--border-subtle)] transition-[width] duration-200 z-30 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <SidebarContent
          tabs={tabs}
          statusMap={statusMap}
          completedCount={completedCount}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          mesaCount={mesaCount}
          auth={auth}
          onLogout={onLogout}
        />
      </aside>

      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full border-r border-[var(--border-subtle)] shadow-2xl">
            <SidebarContent
              tabs={tabs}
              statusMap={statusMap}
              completedCount={completedCount}
              collapsed={false}
              mesaCount={mesaCount}
              auth={auth}
              onLogout={onLogout}
              isMobile
              onCloseMobile={onCloseMobile}
            />
          </div>
        </div>
      )}
    </>
  )
}
