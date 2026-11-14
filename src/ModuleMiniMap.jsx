import React from 'react'

const STATUS_DOT = {
  complete: {
    dot: 'bg-emerald-500 ring-2 ring-emerald-500/25',
    text: 'text-emerald-400',
    label: 'Concluído'
  },
  warning: {
    dot: 'bg-amber-400 ring-2 ring-amber-400/25',
    text: 'text-amber-300',
    label: 'Atenção'
  },
  inactive: {
    dot: 'bg-slate-600 ring-2 ring-slate-700/40',
    text: 'text-slate-500',
    label: 'Inativo'
  }
}

export default function ModuleMiniMap({ items = [], activeTab, onSelectTab }) {
  const completedCount = items.filter((item) => item.status === 'complete').length

  return (
    <aside
      aria-label="Mapa de progresso dos módulos"
      className="mt-6 xl:mt-0 xl:sticky xl:top-32 rounded-xl bg-[#111827] border border-slate-800/80 p-4 space-y-4"
    >
      {/* Cabeçalho do Mini-Map */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <div className="text-xs font-bold text-white tracking-tight">Progresso PoC</div>
          <div className="text-[11px] text-slate-400">Roteiro Operacional</div>
        </div>
        <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
          {completedCount}/{items.length}
        </span>
      </div>

      {/* Trilha Vertical de Etapas */}
      <nav aria-label="Navegação rápida por módulo" className="relative space-y-1.5">
        <div
          aria-hidden="true"
          className="absolute left-[13px] top-4 bottom-4 w-px bg-slate-800 pointer-events-none"
        />

        {items.map((item, idx) => {
          const isActive = activeTab === item.id
          const cfg = STATUS_DOT[item.status] || STATUS_DOT.inactive

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'step' : undefined}
              className={`relative w-full text-left pl-8 pr-2.5 py-2 rounded-lg border transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                isActive
                  ? 'bg-[#0B0F17] border-emerald-500/50 text-white'
                  : 'bg-transparent border-transparent hover:bg-slate-800/50 text-slate-300'
              }`}
            >
              {/* Indicador visual (Verde = Concluído, Âmbar = Atenção, Cinza = Inativo) */}
              <span
                aria-label={cfg.label}
                className={`absolute left-[9px] top-3 w-2.5 h-2.5 rounded-full transition-colors ${cfg.dot}`}
              />

              <div className="flex items-center justify-between gap-1.5">
                <span
                  className={`text-xs font-semibold truncate ${
                    isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  {idx + 1}. {item.shortLabel}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
                )}
              </div>

              <div className={`text-[10px] font-mono truncate mt-0.5 tabular-nums ${cfg.text}`}>
                {item.detail}
              </div>
            </button>
          )
        })}
      </nav>

      {/* Legenda Compacta */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Concluído
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Atenção
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-600" /> Inativo
        </span>
      </div>
    </aside>
  )
}
