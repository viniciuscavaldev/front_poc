import React, { useEffect, useState } from 'react'
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Link2,
  ShieldAlert,
  ShieldCheck,
  X
} from 'lucide-react'

function formatHashChunks(hash) {
  const clean = String(hash || '').trim()
  if (!clean) return []
  return clean.match(/.{1,8}/g) || [clean]
}

function formatTimestampDetails(isoValue) {
  if (!isoValue) {
    return { local: '—', iso: '—', utc: '—' }
  }
  const date = new Date(isoValue)
  if (Number.isNaN(date.getTime())) {
    return { local: String(isoValue), iso: String(isoValue), utc: '—' }
  }
  return {
    local: date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    iso: date.toISOString(),
    utc: date.toUTCString()
  }
}

export default function EventInspectionModal({ event, onClose }) {
  const [copiedKey, setCopiedKey] = useState('')

  useEffect(() => {
    if (!event) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [event, onClose])

  if (!event) return null

  const ts = formatTimestampDetails(event.criado_em)
  const hashChunks = formatHashChunks(event.hash)
  const prevChunks = formatHashChunks(event.previousHash)
  const formattedJson = JSON.stringify(event, null, 2)

  async function copiarTexto(key, value) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 1800)
    } catch {
      // Ignore clipboard failures
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-event-modal-title"
        className="w-full max-w-2xl rounded-xl bg-[var(--bg-modal)] border border-[var(--border-strong)] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Técnico */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
              <h3
                id="audit-event-modal-title"
                className="text-sm font-bold text-[var(--text-primary)] truncate"
              >
                Inspeção de Evento VD-07 · Bloco #{event.blockIndex || event.id}
              </h3>
            </div>
            <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5 truncate">
              {event.operacao} · ID Registro #{event.id}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Fechar modal de inspeção"
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo com Metadados, Hash Formatado e Timestamp */}
        <div className="p-5 space-y-4 text-xs max-h-[78vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
              <div className="text-[11px] text-[var(--text-muted)]">Origem Operacional</div>
              <div className="mt-1 font-mono font-bold text-[var(--semantic-success-text)]">
                {event.origem}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
              <div className="text-[11px] text-[var(--text-muted)]">Resultado / Modo</div>
              <div className="mt-1 font-mono font-bold flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 ${
                    event.sucesso
                      ? 'text-[var(--semantic-success-text)]'
                      : 'text-[var(--semantic-danger-text)]'
                  }`}
                >
                  {event.sucesso ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  )}
                  {event.sucesso ? 'OK (PERMITIDO)' : 'BLOQUEADO (ANTIFRAUDE)'}
                </span>
                <span className="text-[var(--text-muted)] font-normal">
                  · {event.modo_simulado ? 'Simulação PoC' : 'Ao Vivo'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
              <div className="text-[11px] text-[var(--text-muted)]">Endpoint Acionado</div>
              <div className="mt-1 font-mono text-[var(--text-primary)] break-all">
                {event.endpoint || '—'}
              </div>
            </div>

            {/* Visão Formatada de Timestamp */}
            <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-[var(--text-muted)] inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" />
                  Timestamp do Evento
                </span>
                <button
                  type="button"
                  onClick={() => copiarTexto('ev-ts', ts.iso)}
                  className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'ev-ts' ? (
                    <Check className="w-3 h-3 text-[var(--semantic-success-text)]" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  ISO
                </button>
              </div>
              <div className="mt-1 font-mono font-bold tabular-nums text-[var(--text-primary)]">
                {ts.local}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-[var(--text-muted)] tabular-nums truncate">
                ISO-8601: {ts.iso}
              </div>
            </div>
          </div>

          {/* Visão Formatada do Hash Blockchain (VD-06) */}
          {(event.hash || event.previousHash) && (
            <div className="space-y-2.5">
              {event.hash && (
                <div className="p-3.5 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                      Hash Blockchain SHA-256 (Bloco #{event.blockIndex || event.id})
                    </span>
                    <button
                      type="button"
                      onClick={() => copiarTexto('ev-hash', event.hash)}
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'ev-hash' ? (
                        <Check className="w-3 h-3 text-[var(--semantic-success-text)]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedKey === 'ev-hash' ? 'Copiado' : 'Copiar Hash'}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 font-mono text-[11px] tabular-nums">
                    {hashChunks.map((chunk, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--semantic-success-text)] text-center font-semibold"
                      >
                        {chunk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {event.previousHash && (
                <div className="p-3.5 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] inline-flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 shrink-0" />
                      Hash Anterior (Encadeamento VD-06)
                    </span>
                    <button
                      type="button"
                      onClick={() => copiarTexto('ev-prev', event.previousHash)}
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'ev-prev' ? (
                        <Check className="w-3 h-3 text-[var(--semantic-success-text)]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedKey === 'ev-prev' ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 font-mono text-[11px] tabular-nums">
                    {prevChunks.map((chunk, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-center"
                      >
                        {chunk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Registro JSON Completo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text-primary)]">
                Registro Estruturado (JSON)
              </span>
              <button
                type="button"
                onClick={() => copiarTexto('ev-json', formattedJson)}
                className="px-2.5 py-1 rounded-md bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-[11px] font-medium text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'ev-json' ? (
                  <Check className="w-3 h-3 text-[var(--semantic-success-text)]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copiedKey === 'ev-json' ? 'Copiado' : 'Copiar JSON'}
              </button>
            </div>
            <pre className="p-3.5 rounded-lg bg-[var(--bg-console)] border border-[var(--border-subtle)] text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
              {formattedJson}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
