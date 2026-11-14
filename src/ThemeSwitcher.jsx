import React, { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Contrast, Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeContext'

const THEME_OPTIONS = [
  {
    id: 'night',
    label: 'Night',
    shortLabel: 'Night',
    desc: 'Obsidian · Baixa luz',
    icon: Moon,
    title: 'Tema Night independente (theme-night.css)'
  },
  {
    id: 'light',
    label: 'Light',
    shortLabel: 'Light',
    desc: 'CIPETRAN · Claro projetor',
    icon: Sun,
    title: 'Tema Light CIPETRAN independente (theme-light.css)'
  },
  {
    id: 'high-contrast',
    label: 'Alto Contraste',
    shortLabel: 'Projetor',
    desc: 'Carvão #121212 + Neon',
    icon: Contrast,
    title: 'Tema High-Contrast para Projetor (theme-high-contrast.css)'
  }
]

export default function ThemeSwitcher({ compact = false, variant = 'segmented' }) {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open || variant !== 'dropdown') return
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleEsc(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open, variant])

  if (variant === 'dropdown') {
    const activeOpt = THEME_OPTIONS.find((opt) => opt.id === theme) || THEME_OPTIONS[0]
    const ActiveIcon = activeOpt.icon

    return (
      <div ref={containerRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="listbox"
          title={activeOpt.title}
          className="px-2.5 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
        >
          <ActiveIcon className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" />
          <span className="hidden sm:inline">{activeOpt.shortLabel}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div
            role="listbox"
            aria-label="Selecionar tema visual"
            className="absolute right-0 mt-1.5 w-56 rounded-xl bg-[var(--bg-modal)] border border-[var(--border-strong)] shadow-2xl p-1.5 space-y-1 z-50"
          >
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const active = theme === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setTheme(opt.id)
                    setOpen(false)
                  }}
                  className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    active
                      ? 'bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--text-primary)]'
                      : 'border border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-[var(--accent-text)]' : 'text-[var(--text-muted)]'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{opt.label}</div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate">{opt.desc}</div>
                    </div>
                  </div>
                  {active && <Check className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-label="Selecionar folha de estilo visual"
      className="inline-flex items-center p-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] shrink-0"
    >
      {THEME_OPTIONS.map((opt) => {
        const Icon = opt.icon
        const active = theme === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            aria-pressed={active}
            title={opt.title}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
              active
                ? 'bg-[var(--accent-primary)] text-[var(--accent-on-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className={compact ? 'hidden md:inline' : ''}>
              {compact ? opt.shortLabel : opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
