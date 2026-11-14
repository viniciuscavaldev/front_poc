import React from 'react'
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  SlidersHorizontal,
  UserCheck,
  XCircle
} from 'lucide-react'

export default function MesaRevisoraPage({
  mostrarConfigFaixas,
  onToggleConfigFaixas,
  onSimularProcessoMesa,
  msgFaixas,
  faixas,
  onFaixasChange,
  onSalvarFaixa,
  mesaFila,
  justificativas,
  onJustificativasChange,
  onDecidirMesa
}) {
  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="text-xs font-mono text-[var(--semantic-warning-text)] mb-1">
              Item 1.7 · Supervisão Humana DETRAN-CE
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Mesa Revisora &amp; Calibração de Faixas (Itens 1.7.8 e 1.7.9)
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Ambiente deliberativo para processos encaminhados à Faixa Amarela da Inteligência Artificial.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleConfigFaixas}
              className="px-3.5 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--semantic-warning-text)]" />
              Calibrar Faixas (1.7.9)
              {mostrarConfigFaixas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={onSimularProcessoMesa}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Gerar Caso de Teste (Score 65%)
            </button>
          </div>
        </div>

        {/* Régua Visual do Semáforo (Item 1.7.8) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[var(--semantic-danger-bg)] border border-[var(--semantic-danger-border)] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--semantic-danger-text)] flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Reprovação Automática
              </span>
              <span className="font-mono text-xs font-bold text-[var(--semantic-danger-text)] tabular-nums">
                ≤ 49%
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Indício severo de adulteração ou fraude documental. Bloqueio direto sem tramitação.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--semantic-warning-bg)] border border-[var(--semantic-warning-border)] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--semantic-warning-text)] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Mesa Revisora Humana
              </span>
              <span className="font-mono text-xs font-bold text-[var(--semantic-warning-text)] tabular-nums">
                50% a 79%
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Leve divergência biométrica ou documental. Encaminhado ao servidor do DETRAN-CE.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--semantic-success-bg)] border border-[var(--semantic-success-border)] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--semantic-success-text)] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Aprovação Automática
              </span>
              <span className="font-mono text-xs font-bold text-[var(--semantic-success-text)] tabular-nums">
                ≥ 80%
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Conferência documental e biométrica íntegra. Deferimento automático instantâneo.
            </p>
          </div>
        </div>

        {/* Bloco Retrátil de Calibração (Item 1.7.9) */}
        {mostrarConfigFaixas && (
          <div className="p-5 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-xs text-[var(--text-primary)]">
                  Calibração Dinâmica das Faixas pelo DETRAN-CE (Item 1.7.9)
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Ajuste os limites de corte diretamente em banco sem intervenção em código-fonte.
                </p>
              </div>
              {msgFaixas && (
                <span className="text-xs text-[var(--semantic-success-text)] font-medium">
                  {msgFaixas}
                </span>
              )}
            </div>

            <div className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)]">
              {faixas.map((f, idx) => (
                <div
                  key={f.id}
                  className="py-3 grid grid-cols-1 md:grid-cols-6 gap-3 items-end text-xs"
                >
                  <div className="md:col-span-2 font-semibold text-[var(--text-primary)] self-center">
                    {f.descricao}
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                      Reprovação ≤
                    </label>
                    <input
                      type="number"
                      value={f.reprovacao_max}
                      onChange={(e) => {
                        const n = [...faixas]
                        n[idx] = { ...f, reprovacao_max: Number(e.target.value) }
                        onFaixasChange(n)
                      }}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-2.5 py-1.5 text-[var(--text-primary)] font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                      Mesa Revisora ≤
                    </label>
                    <input
                      type="number"
                      value={f.revisao_max}
                      onChange={(e) => {
                        const n = [...faixas]
                        n[idx] = { ...f, revisao_max: Number(e.target.value) }
                        onFaixasChange(n)
                      }}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-2.5 py-1.5 text-[var(--text-primary)] font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                      Aprovação ≥
                    </label>
                    <input
                      type="number"
                      value={f.aprovacao_min}
                      onChange={(e) => {
                        const n = [...faixas]
                        n[idx] = { ...f, aprovacao_min: Number(e.target.value) }
                        onFaixasChange(n)
                      }}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-2.5 py-1.5 text-[var(--text-primary)] font-mono tabular-nums"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onSalvarFaixa(faixas[idx])}
                    className="px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] font-bold text-[var(--accent-on-primary)] text-xs cursor-pointer transition-colors"
                  >
                    Salvar Regra
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fila de Dossiês para Julgamento Humano */}
      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[var(--semantic-success-text)]" />
            Processos Aguardando Julgamento Humano ({mesaFila.length})
          </h3>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {mesaFila.length ? 'Ação pendente do auditor' : 'Fila zerada'}
          </span>
        </div>

        {!mesaFila.length && (
          <div className="p-8 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-center space-y-3">
            <CheckCircle2 className="w-9 h-9 text-[var(--semantic-success-text)] mx-auto" />
            <div className="font-bold text-sm text-[var(--text-primary)]">
              Todos os processos foram deliberados
            </div>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              Não há dossiês pendentes na Faixa Amarela no momento. Gere um caso de teste para
              demonstrar a análise humana.
            </p>
            <button
              type="button"
              onClick={onSimularProcessoMesa}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white cursor-pointer transition-colors"
            >
              Gerar Caso de Teste (Score 65%)
            </button>
          </div>
        )}

        {mesaFila.map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--semantic-warning-border)] space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[var(--semantic-warning-text)]">
                    {m.protocolo}
                  </span>
                  <span className="text-[var(--text-subtle)]" aria-hidden="true">·</span>
                  <span className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-[var(--semantic-success-text)]" />
                    Placa {m.placa} · {m.tipo_servico === 'TRANSFERENCIA' ? 'Transferência de Usado' : m.tipo_servico}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono">
                  Chassi: {m.chassi} · Modalidade: {m.natureza?.replace('_', ' → ')}
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-[11px] text-[var(--text-muted)]">Avaliação da IA</div>
                <div className="text-sm font-mono font-bold text-[var(--semantic-warning-text)] tabular-nums">
                  Score {m.score_ia}% · Faixa Amarela
                </div>
              </div>
            </div>

            {/* Alerta de Inconsistência da IA */}
            <div className="p-3.5 rounded-lg bg-[var(--semantic-warning-bg)] border border-[var(--semantic-warning-border)] text-xs space-y-1">
              <div className="font-bold text-[var(--semantic-warning-text)] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Apontamento do Motor de IA:
              </div>
              <p className="text-[var(--text-primary)]">
                {Array.isArray(m.inconsistencias) && m.inconsistencias.length
                  ? m.inconsistencias.join('; ')
                  : 'Assinatura da ATPV-e com leve variação grafotécnica em relação ao documento original.'}
              </p>
            </div>

            {/* Partes Envolvidas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-lg text-xs bg-[var(--bg-surface)]">
              <div className="p-3.5 space-y-1">
                <div className="text-[11px] font-semibold text-[var(--semantic-info-text)]">
                  Vendedor (Proprietário)
                </div>
                <div className="font-bold text-[var(--text-primary)]">
                  {m.dados?.vendedor?.nome || 'VINICIUS CAVALCANTE VIANA'}
                </div>
                <div className="font-mono text-[var(--text-muted)] tabular-nums">
                  CPF: {m.cpf_cnpj_vendedor || '07569577370'}
                </div>
              </div>
              <div className="p-3.5 space-y-1">
                <div className="text-[11px] font-semibold text-[var(--semantic-success-text)]">
                  Comprador (Adquirente)
                </div>
                <div className="font-bold text-[var(--text-primary)]">
                  {m.dados?.comprador?.nome || 'MARCOS VINICIUS ALMEIDA'}
                </div>
                <div className="font-mono text-[var(--text-muted)] tabular-nums">
                  CPF: {m.cpf_cnpj_comprador || '01234567890'}
                </div>
              </div>
            </div>

            {/* Justificativa Formal & Deliberação */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Justificativa Formal do Servidor DETRAN-CE (Exigência Item 2.1.11 / VD-05):
                </label>
                <input
                  type="text"
                  value={justificativas[m.id] || ''}
                  onChange={(e) => onJustificativasChange({ ...justificativas, [m.id]: e.target.value })}
                  placeholder="Ex: Documento e assinatura conferidos visualmente e considerados autênticos pelo servidor."
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                  Hash Blockchain: {(m.hash_blockchain || '').slice(0, 24)}...
                </span>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onDecidirMesa(m.id, 'REPROVAR')}
                    className="px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-600 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <XCircle className="w-4 h-4" /> Reprovar com Notificação
                  </button>
                  <button
                    type="button"
                    onClick={() => onDecidirMesa(m.id, 'APROVAR')}
                    className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-xs font-bold text-[var(--accent-on-primary)] flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Aprovar Processo
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
