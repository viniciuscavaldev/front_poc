import React from 'react'
import { Terminal } from 'lucide-react'

const CENARIOS_ANTIFRAUDE = [
  {
    id: 'F-01',
    t: 'F-01 — Divergência Cadastral CPF Vendedor',
    d: 'Submete CPF do vendedor divergente do retorno oficial retornado pelo BalcãoWS (bloqueio automático).'
  },
  {
    id: 'F-02',
    t: 'F-02 — Reutilização de Laudo de Vistoria',
    d: 'Tenta vincular um ID de laudo de vistoria ECV já utilizado em outro processo ativo (bloqueio automático).'
  },
  {
    id: 'F-03',
    t: 'F-03 — Chassi Inexistente / Campo Omitido',
    d: 'Envia solicitação sem chassi válido ou não cadastrado na base estadual DETRAN-CE (bloqueio automático).'
  },
  {
    id: 'F-04',
    t: 'F-04 — Assinatura Incompleta / Violação de Sequência',
    d: 'Tenta registrar assinatura do comprador antes da conclusão obrigatória do vendedor (bloqueio automático).'
  }
]

export default function AntifraudePage({
  cenarioAtivoEtapa2,
  resultadoEtapa2,
  onTestarEtapa2,
  onLimparConsole
}) {
  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-5">
        <div className="border-b border-[var(--border-subtle)] pb-4">
          <div className="text-xs font-mono text-[var(--semantic-danger-text)] mb-1">
            Motor Antifraude Documental · Validação Eliminatória
          </div>
          <h2 className="font-bold text-lg text-[var(--text-primary)]">
            Etapa II — Demonstração dos Bloqueios Automáticos (F-01 a F-04)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Dispare os 4 cenários críticos exigidos no Edital DETRAN-CE para comprovar a rejeição
            automática imediata e o registro na trilha de auditoria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CENARIOS_ANTIFRAUDE.map((c) => {
            const isActive = cenarioAtivoEtapa2 === c.id
            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border transition-colors flex flex-col justify-between gap-4 ${
                  isActive
                    ? 'bg-[var(--bg-surface-alt)] border-[var(--semantic-danger-border)]'
                    : 'bg-[var(--bg-surface-alt)] border-[var(--border-subtle)]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{c.t}</span>
                    <span className="font-mono text-[11px] text-[var(--semantic-danger-text)] shrink-0">
                      {c.id}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{c.d}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onTestarEtapa2(c.id)}
                  className="self-start px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-600 text-xs font-bold text-white cursor-pointer transition-colors whitespace-nowrap"
                >
                  Executar Bloqueio {c.id}
                </button>
              </div>
            )
          })}
        </div>

        {/* Console Integrado de Resposta Antifraude */}
        <div className="rounded-xl bg-[var(--bg-console)] border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-2.5 bg-black/25 border-b border-white/10 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-300 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-red-400" />
              Console de Segurança · Retorno BalcãoWS / Motor Antifraude
            </span>
            {resultadoEtapa2 && (
              <button
                type="button"
                onClick={onLimparConsole}
                className="text-slate-400 hover:text-white text-[11px] cursor-pointer"
              >
                Limpar console
              </button>
            )}
          </div>
          <pre className="p-4 text-xs font-mono text-red-300 overflow-x-auto min-h-[120px] leading-relaxed">
            {resultadoEtapa2 ||
              '// Selecione um dos cenários F-01 a F-04 acima para inspecionar o bloqueio JSON retornado.'}
          </pre>
        </div>
      </div>
    </section>
  )
}
