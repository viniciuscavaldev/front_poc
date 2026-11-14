import React from 'react'

function clampPercentage(pct) {
  const num = Number(pct)
  if (!Number.isFinite(num)) return 0
  return Math.min(100, Math.max(0, num))
}

export default function DashboardKpiCard({
  label,
  value,
  percentage = 0,
  barColorVar = 'var(--accent-primary)',
  valueToneClass = 'text-[var(--text-primary)]',
  secondaryValue = null,
  icon: Icon = null,
  headerAction = null,
  segments = null,
  footerLeft = null,
  footerRight = null,
  ariaLabel
}) {
  const safePct = clampPercentage(percentage)
  const hasSegments = Array.isArray(segments) && segments.length > 0

  return (
    <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 sm:p-5 flex flex-col justify-between gap-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-[var(--text-muted)] truncate">{label}</div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div
            className={`font-extrabold font-mono tabular-nums flex items-center gap-2 ${
              Icon ? 'text-xl pt-1' : 'text-3xl'
            } ${valueToneClass}`}
          >
            {Icon && <Icon className="w-5 h-5 shrink-0" />}
            <span>{value}</span>
          </div>

          {secondaryValue !== null && secondaryValue !== undefined && (
            <span className="text-xs font-mono tabular-nums text-[var(--text-muted)] whitespace-nowrap">
              {secondaryValue}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div
          role="progressbar"
          aria-valuenow={Math.round(safePct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={ariaLabel || `${label}: ${Math.round(safePct)}%`}
          className="h-2 w-full rounded-full overflow-hidden bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] flex"
        >
          {hasSegments ? (
            segments.map((seg, idx) => (
              <div
                key={seg.key || idx}
                className="h-full transition-all duration-300"
                style={{
                  width: `${clampPercentage(seg.percentage)}%`,
                  backgroundColor: seg.colorVar || 'var(--accent-primary)'
                }}
              />
            ))
          ) : (
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${safePct}%`,
                backgroundColor: barColorVar
              }}
            />
          )}
        </div>

        {(footerLeft !== null || footerRight !== null) ? (
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums text-[var(--text-muted)]">
            <span className="truncate">{footerLeft}</span>
            <span className="shrink-0">{footerRight}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-[var(--text-muted)]">
            <span>Distribuição</span>
            <span>{Math.round(safePct)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
