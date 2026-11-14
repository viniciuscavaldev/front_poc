import React, { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FileSearch,
  Gavel,
  History,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  XCircle
} from 'lucide-react'
import DashboardKpiCard from '../DashboardKpiCard'
import EventInspectionModal from '../EventInspectionModal'

const JUSTIFICATIVAS_RAPIDAS = [
  {
    label: 'Conferência visual íntegra',
    texto:
      'Documento, foto de vistoria e assinatura da ATPV-e conferidos visualmente e validados pelo servidor do DETRAN-CE.'
  },
  {
    label: 'Biometria e titularidade confirmadas',
    texto:
      'Divergência leve na captura biométrica justificada por iluminação; titularidade confirmada junto ao BalcãoWS.'
  },
  {
    label: 'Inconsistência documental grave',
    texto:
      'Reprovado por divergência grafotécnica e incompatibilidade cadastral identificadas na conferência humana.'
  }
]

function classificarScore(score, faixa) {
  const repMax = Number(faixa?.reprovacao_max ?? 49)
  const revMax = Number(faixa?.revisao_max ?? 79)
  if (score <= repMax) {
    return {
      faixa: 'VERMELHA',
      titulo: 'Faixa Vermelha · Reprovação Automática',
      destino: 'Bloqueio direto sem tramitação',
      textClass: 'text-[var(--semantic-danger-text)]',
      bgClass: 'bg-[var(--semantic-danger-bg)] border-[var(--semantic-danger-border)]'
    }
  }
  if (score <= revMax) {
    return {
      faixa: 'AMARELA',
      titulo: 'Faixa Amarela · Mesa Revisora Humana',
      destino: 'Encaminhado ao servidor DETRAN-CE',
      textClass: 'text-[var(--semantic-warning-text)]',
      bgClass: 'bg-[var(--semantic-warning-bg)] border-[var(--semantic-warning-border)]'
    }
  }
  return {
    faixa: 'VERDE',
    titulo: 'Faixa Verde · Aprovação Automática',
    destino: 'Deferimento automático instantâneo',
    textClass: 'text-[var(--semantic-success-text)]',
    bgClass: 'bg-[var(--semantic-success-bg)] border-[var(--semantic-success-border)]'
  }
}

function validarFaixaConsistencia(faixa) {
  const rep = Number(faixa?.reprovacao_max)
  const rev = Number(faixa?.revisao_max)
  const apr = Number(faixa?.aprovacao_min)

  if (!Number.isFinite(rep) || !Number.isFinite(rev) || !Number.isFinite(apr)) {
    return { valida: false, erro: 'Preencha todos os limites numéricos entre 0 e 100.' }
  }
  if (rep < 0 || rev > 99 || apr > 100) {
    return { valida: false, erro: 'Os limites devem permanecer dentro da escala de 0% a 100%.' }
  }
  if (rep >= rev) {
    return {
      valida: false,
      erro: 'O teto de Reprovação Automática deve ser menor que o teto da Mesa Revisora.'
    }
  }
  if (rev >= apr) {
    return {
      valida: false,
      erro: 'O teto da Mesa Revisora deve ser menor que o piso de Aprovação Automática.'
    }
  }
  if (apr !== rev + 1) {
    return {
      valida: true,
      aviso: `Atenção: existe lacuna entre ${rev}% e ${apr}% (recomendado: ${rev + 1}%).`
    }
  }
  return { valida: true, aviso: null }
}

function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export default function MesaRevisoraPage({
  mostrarConfigFaixas,
  onToggleConfigFaixas,
  onSimularProcessoMesa,
  msgFaixas,
  faixas = [],
  onFaixasChange,
  onSalvarFaixa,
  mesaFila = [],
  processos = [],
  auditoria = [],
  justificativas = {},
  onJustificativasChange,
  onDecidirMesa,
  onIrParaAuditoria
}) {
  const [scoreSimulado, setScoreSimulado] = useState(65)
  const [simulandoScore, setSimulandoScore] = useState(false)
  const [decidindoId, setDecidindoId] = useState(null)
  const [eventoInspecao, setEventoInspecao] = useState(null)

  const faixaPrincipal = useMemo(
    () =>
      faixas[0] || {
        id: 1,
        descricao: 'Transferência de Veículo Usado (Geral)',
        reprovacao_max: 49,
        revisao_max: 79,
        aprovacao_min: 80
      },
    [faixas]
  )

  const repMax = Math.max(0, Math.min(98, Number(faixaPrincipal.reprovacao_max ?? 49)))
  const revMax = Math.max(repMax + 1, Math.min(99, Number(faixaPrincipal.revisao_max ?? 79)))
  const aprMin = Math.max(revMax + 1, Math.min(100, Number(faixaPrincipal.aprovacao_min ?? 80)))

  const segVermelhoPct = repMax
  const segAmareloPct = Math.max(0, revMax - repMax)
  const segVerdePct = Math.max(0, 100 - revMax)

  const totalProcessos = processos.length
  const aprovadosCount = processos.filter((p) => p.status === 'CONCLUIDO').length
  const reprovadosCount = processos.filter((p) => p.status === 'REPROVADO').length
  const deliberadosMesa = useMemo(
    () => processos.filter((p) => Boolean(p.justificativa_auditor)),
    [processos]
  )
  const eventosMesa = useMemo(
    () => auditoria.filter((a) => a.origem === 'MESA_REVISORA'),
    [auditoria]
  )

  const contagemPorFaixa = useMemo(() => {
    let vermelha = 0
    let amarela = 0
    let verde = 0
    for (const p of processos) {
      const s = Number(p.score_ia ?? 0)
      if (s <= repMax) vermelha += 1
      else if (s <= revMax) amarela += 1
      else verde += 1
    }
    return { vermelha, amarela, verde }
  }, [processos, repMax, revMax])

  const previsaoSimulacao = classificarScore(scoreSimulado, {
    reprovacao_max: repMax,
    revisao_max: revMax,
    aprovacao_min: aprMin
  })

  async function handleSimularScore(targetScore = scoreSimulado) {
    setSimulandoScore(true)
    try {
      await onSimularProcessoMesa?.(Number(targetScore))
    } finally {
      setSimulandoScore(false)
    }
  }

  async function handleDecidir(id, decisao) {
    setDecidindoId(`${id}:${decisao}`)
    try {
      await onDecidirMesa?.(id, decisao)
    } finally {
      setDecidindoId(null)
    }
  }

  return (
    <section className="space-y-6">
      {/* Cabeçalho & Ações Rápidas */}
      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="text-xs font-mono text-[var(--semantic-warning-text)] mb-1">
              Item 1.7 · Supervisão Humana DETRAN-CE
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              Mesa Revisora &amp; Calibração de Faixas (Itens 1.7.8 e 1.7.9)
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Ambiente deliberativo para processos encaminhados à Faixa Amarela da Inteligência Artificial e ajuste dinâmico de cortes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleConfigFaixas}
              className="px-3.5 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--semantic-warning-text)]" />
              Calibrar Faixas (1.7.9)
              {mostrarConfigFaixas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {onIrParaAuditoria && (
              <button
                type="button"
                onClick={onIrParaAuditoria}
                className="px-3.5 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                Auditoria VD-07
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              disabled={simulandoScore}
              onClick={() => handleSimularScore(scoreSimulado)}
              className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:opacity-60 text-xs font-bold text-[var(--accent-on-primary)] inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${simulandoScore ? 'animate-spin' : ''}`} />
              Simular Score ({scoreSimulado}%)
            </button>
          </div>
        </div>

        {/* KPIs Executivos da Mesa Revisora */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <DashboardKpiCard
            label="Fila na Faixa Amarela"
            value={mesaFila.length}
            secondaryValue={`de ${totalProcessos} ativos`}
            percentage={totalProcessos ? (mesaFila.length / totalProcessos) * 100 : 0}
            barColorVar={
              mesaFila.length > 0 ? 'var(--semantic-warning-text)' : 'var(--semantic-success-text)'
            }
            valueToneClass={
              mesaFila.length > 0
                ? 'text-[var(--semantic-warning-text)]'
                : 'text-[var(--semantic-success-text)]'
            }
            footerLeft={mesaFila.length > 0 ? 'Aguardando deliberação' : 'Fila zerada'}
            footerRight={`${repMax + 1}% – ${revMax}%`}
          />

          <DashboardKpiCard
            label="Aprovados / Concluídos"
            value={aprovadosCount}
            secondaryValue={`${totalProcessos ? Math.round((aprovadosCount / totalProcessos) * 100) : 0}%`}
            percentage={totalProcessos ? (aprovadosCount / totalProcessos) * 100 : 0}
            barColorVar="var(--semantic-success-text)"
            valueToneClass="text-[var(--semantic-success-text)]"
            footerLeft={`Faixa Verde (≥ ${aprMin}%)`}
            footerRight={`${deliberadosMesa.filter((p) => p.status === 'CONCLUIDO').length} via Mesa`}
          />

          <DashboardKpiCard
            label="Reprovados / Bloqueados"
            value={reprovadosCount}
            secondaryValue={`${totalProcessos ? Math.round((reprovadosCount / totalProcessos) * 100) : 0}%`}
            percentage={totalProcessos ? (reprovadosCount / totalProcessos) * 100 : 0}
            barColorVar="var(--semantic-danger-text)"
            valueToneClass={
              reprovadosCount > 0 ? 'text-[var(--semantic-danger-text)]' : 'text-[var(--text-primary)]'
            }
            footerLeft={`Faixa Vermelha (≤ ${repMax}%)`}
            footerRight={`${deliberadosMesa.filter((p) => p.status === 'REPROVADO').length} via Mesa`}
          />

          <DashboardKpiCard
            label="Regras Calibradas (1.7.9)"
            value={faixas.length || 1}
            secondaryValue="Semáforo IA"
            segments={[
              { key: 'red', percentage: segVermelhoPct, colorVar: 'var(--semantic-danger-text)' },
              { key: 'amber', percentage: segAmareloPct, colorVar: 'var(--semantic-warning-text)' },
              { key: 'green', percentage: segVerdePct, colorVar: 'var(--semantic-success-text)' }
            ]}
            footerLeft={`Corte Amarelo: ${repMax + 1}%–${revMax}%`}
            footerRight={`${eventosMesa.length} eventos`}
          />
        </div>

        {/* Régua Dinâmica do Semáforo (Item 1.7.8) */}
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)]">
                Régua Dinâmica do Semáforo IA — {faixaPrincipal.descricao} (Item 1.7.8)
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Escala proporcional vinculada em tempo real aos limiares persistidos no servidor.
              </p>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)]">
              0% ── {repMax}% | {repMax + 1}%–{revMax}% | {aprMin}% ── 100%
            </span>
          </div>

          {/* Barra Proporcional 0-100% com Marcador do Simulador */}
          <div className="relative pt-2 pb-1">
            <div className="h-3 w-full rounded-full overflow-hidden border border-[var(--border-subtle)] flex bg-[var(--bg-surface)]">
              <div
                style={{ width: `${segVermelhoPct}%`, backgroundColor: 'var(--semantic-danger-text)' }}
                className="h-full transition-all duration-300 opacity-85"
                title={`Reprovação Automática: 0% a ${repMax}%`}
              />
              <div
                style={{ width: `${segAmareloPct}%`, backgroundColor: 'var(--semantic-warning-text)' }}
                className="h-full transition-all duration-300 opacity-90"
                title={`Mesa Revisora: ${repMax + 1}% a ${revMax}%`}
              />
              <div
                style={{ width: `${segVerdePct}%`, backgroundColor: 'var(--semantic-success-text)' }}
                className="h-full transition-all duration-300 opacity-85"
                title={`Aprovação Automática: ${aprMin}% a 100%`}
              />
            </div>

            {/* Marcador do Score Simulado */}
            <div
              className="absolute top-0 bottom-0 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-200"
              style={{ left: `${Math.min(99, Math.max(1, scoreSimulado))}%` }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--text-primary)] border-2 border-[var(--bg-surface)] shadow-sm" />
              <span className="w-0.5 flex-1 bg-[var(--text-primary)]/70" />
            </div>
          </div>

          {/* Cartões Dinâmicos das 3 Faixas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--semantic-danger-bg)] border border-[var(--semantic-danger-border)] space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-[var(--semantic-danger-text)] flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 shrink-0" /> Reprovação Automática
                </span>
                <span className="font-mono text-xs font-bold text-[var(--semantic-danger-text)] tabular-nums">
                  0% a ≤ {repMax}%
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Indício severo de adulteração ou fraude documental. Bloqueio direto sem tramitação ({contagemPorFaixa.vermelha} na base).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--semantic-warning-bg)] border border-[var(--semantic-warning-border)] space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-[var(--semantic-warning-text)] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> Mesa Revisora Humana
                </span>
                <span className="font-mono text-xs font-bold text-[var(--semantic-warning-text)] tabular-nums">
                  {repMax + 1}% a ≤ {revMax}%
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Leve divergência biométrica ou documental. Encaminhado ao servidor do DETRAN-CE ({contagemPorFaixa.amarela} na base).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--semantic-success-bg)] border border-[var(--semantic-success-border)] space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-[var(--semantic-success-text)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Aprovação Automática
                </span>
                <span className="font-mono text-xs font-bold text-[var(--semantic-success-text)] tabular-nums">
                  ≥ {aprMin}% a 100%
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Conferência documental e biométrica íntegra. Deferimento automático instantâneo ({contagemPorFaixa.verde} na base).
              </p>
            </div>
          </div>

          {/* Simulador Interativo de Roteamento por Score IA */}
          <div className="pt-3 border-t border-[var(--border-subtle)] grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-7 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="simulador-score-ia"
                  className="text-xs font-semibold text-[var(--text-primary)]"
                >
                  Simulador de Roteamento por Score IA
                </label>
                <div className="flex items-center gap-1.5">
                  {[
                    { label: 'Crítico 35%', val: 35 },
                    { label: 'Amarelo 65%', val: 65 },
                    { label: 'Íntegro 88%', val: 88 }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setScoreSimulado(preset.val)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold border cursor-pointer transition-colors ${
                        scoreSimulado === preset.val
                          ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent-text)]'
                          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="simulador-score-ia"
                  type="range"
                  min={0}
                  max={100}
                  value={scoreSimulado}
                  onChange={(e) => setScoreSimulado(Number(e.target.value))}
                  className="flex-1 accent-[var(--accent-primary)] cursor-pointer"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={scoreSimulado}
                  onChange={(e) => {
                    const n = Math.max(0, Math.min(100, Number(e.target.value) || 0))
                    setScoreSimulado(n)
                  }}
                  aria-label="Valor numérico do Score IA simulado"
                  className="w-20 bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-center text-[var(--text-primary)] tabular-nums"
                />
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate ${previsaoSimulacao.textClass}`}>
                  {previsaoSimulacao.titulo}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">
                  {previsaoSimulacao.destino}
                </div>
              </div>

              <button
                type="button"
                disabled={simulandoScore}
                onClick={() => handleSimularScore(scoreSimulado)}
                className="px-3.5 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-bold text-[var(--btn-secondary-text)] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
              >
                <Play className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                Executar Teste ({scoreSimulado}%)
              </button>
            </div>
          </div>
        </div>

        {/* Bloco Retrátil de Calibração Dinâmica (Item 1.7.9) */}
        {mostrarConfigFaixas && (
          <div className="p-5 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-strong)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-xs text-[var(--text-primary)]">
                  Calibração Dinâmica das Faixas pelo DETRAN-CE (Item 1.7.9)
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Ajuste os limites de corte diretamente em banco sem intervenção em código-fonte. As alterações refletem na régua e nas próximas aberturas imediatamente.
                </p>
              </div>
              {msgFaixas && (
                <span className="text-xs text-[var(--semantic-success-text)] font-semibold">
                  {msgFaixas}
                </span>
              )}
            </div>

            <div className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)]">
              {faixas.map((f, idx) => {
                const check = validarFaixaConsistencia(f)
                return (
                  <div key={f.id} className="py-3.5 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end text-xs">
                      <div className="md:col-span-2 font-semibold text-[var(--text-primary)] self-center">
                        {f.descricao}
                      </div>
                      <div>
                        <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                          Reprovação ≤ (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={98}
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
                          Mesa Revisora ≤ (%)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={99}
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
                          Aprovação ≥ (%)
                        </label>
                        <input
                          type="number"
                          min={2}
                          max={100}
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
                        disabled={!check.valida}
                        onClick={() => onSalvarFaixa(faixas[idx])}
                        className="px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:opacity-45 disabled:cursor-not-allowed font-bold text-[var(--accent-on-primary)] text-xs cursor-pointer transition-colors"
                      >
                        Salvar Regra
                      </button>
                    </div>

                    {check.erro && (
                      <div className="text-[11px] text-[var(--semantic-danger-text)] flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        {check.erro}
                      </div>
                    )}
                    {!check.erro && check.aviso && (
                      <div className="text-[11px] text-[var(--semantic-warning-text)] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {check.aviso}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Fila de Dossiês para Julgamento Humano */}
      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[var(--semantic-warning-text)]" />
            Processos Aguardando Julgamento Humano ({mesaFila.length})
          </h3>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {mesaFila.length ? 'Ação pendente do auditor · Item 2.1.11 / VD-05' : 'Fila zerada'}
          </span>
        </div>

        {!mesaFila.length && (
          <div className="p-8 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-center space-y-3">
            <CheckCircle2 className="w-9 h-9 text-[var(--semantic-success-text)] mx-auto" />
            <div className="font-bold text-sm text-[var(--text-primary)]">
              Todos os processos da Faixa Amarela foram deliberados
            </div>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              Não há dossiês pendentes no momento. Gere um caso de teste dentro da Faixa Amarela ({repMax + 1}%–{revMax}%) para demonstrar a decisão humana e o registro VD-05.
            </p>
            <button
              type="button"
              disabled={simulandoScore}
              onClick={() => {
                const meioAmarelo = Math.round((repMax + 1 + revMax) / 2)
                setScoreSimulado(meioAmarelo)
                handleSimularScore(meioAmarelo)
              }}
              className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-xs font-bold text-[var(--accent-on-primary)] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Gerar Caso na Faixa Amarela ({Math.round((repMax + 1 + revMax) / 2)}%)
            </button>
          </div>
        )}

        {mesaFila.map((m) => {
          const scoreVal = Number(m.score_ia ?? 65)
          const classificacao = classificarScore(scoreVal, {
            reprovacao_max: repMax,
            revisao_max: revMax,
            aprovacao_min: aprMin
          })
          const justificativaAtual = justificativas[m.id] || ''
          const carregandoAprovar = decidindoId === `${m.id}:APROVAR`
          const carregandoReprovar = decidindoId === `${m.id}:REPROVAR`

          return (
            <div
              key={m.id}
              className="p-5 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--semantic-warning-border)] space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--semantic-warning-text)]">
                      {m.protocolo}
                    </span>
                    <span className="text-[var(--text-subtle)]" aria-hidden="true">·</span>
                    <span className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-[var(--semantic-success-text)] shrink-0" />
                      Placa {m.placa} · {m.tipo_servico === 'TRANSFERENCIA' ? 'Transferência de Usado' : m.tipo_servico}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-mono flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>Chassi: {m.chassi}</span>
                    <span>Modalidade: {m.natureza?.replace('_', ' → ')}</span>
                    <span>Laudo: {m.laudo_vistoria_id || '—'}</span>
                  </div>
                </div>

                <div className="text-left md:text-right shrink-0 min-w-[180px] space-y-1">
                  <div className="text-[11px] text-[var(--text-muted)]">Avaliação da IA</div>
                  <div className={`text-sm font-mono font-bold tabular-nums ${classificacao.textClass}`}>
                    Score {scoreVal}% · {classificacao.faixa}
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(0, scoreVal))}%`,
                        backgroundColor: 'var(--semantic-warning-text)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Alerta de Inconsistência da IA */}
              <div className="p-3.5 rounded-lg bg-[var(--semantic-warning-bg)] border border-[var(--semantic-warning-border)] text-xs space-y-1">
                <div className="font-bold text-[var(--semantic-warning-text)] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Apontamento do Motor de IA:
                </div>
                <p className="text-[var(--text-primary)]">
                  {Array.isArray(m.inconsistencias) && m.inconsistencias.length
                    ? m.inconsistencias.join('; ')
                    : m.dados?.motivoMesa ||
                      'Assinatura da ATPV-e com leve variação grafotécnica em relação ao documento original.'}
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

              {/* Justificativa Formal & Atalhos do Auditor */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor={`justificativa-${m.id}`}
                    className="text-xs font-semibold text-[var(--text-secondary)]"
                  >
                    Justificativa Formal do Servidor DETRAN-CE (Exigência Item 2.1.11 / VD-05):
                  </label>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {JUSTIFICATIVAS_RAPIDAS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          onJustificativasChange({
                            ...justificativas,
                            [m.id]: preset.texto
                          })
                        }
                        className="px-2 py-1 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  id={`justificativa-${m.id}`}
                  type="text"
                  value={justificativaAtual}
                  onChange={(e) =>
                    onJustificativasChange({ ...justificativas, [m.id]: e.target.value })
                  }
                  placeholder="Ex: Documento e assinatura conferidos visualmente e considerados autênticos pelo servidor."
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-primary)]"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-[var(--text-muted)] font-mono truncate">
                    Hash Blockchain: {(m.hash_blockchain || '').slice(0, 28)}...
                  </span>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      disabled={Boolean(decidindoId)}
                      onClick={() => handleDecidir(m.id, 'REPROVAR')}
                      className="px-4 py-2 rounded-lg bg-[var(--semantic-danger-bg)] hover:opacity-90 border border-[var(--semantic-danger-border)] text-xs font-bold text-[var(--semantic-danger-text)] inline-flex items-center gap-1.5 cursor-pointer transition-opacity whitespace-nowrap disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 shrink-0" />
                      {carregandoReprovar ? 'Reprovando...' : 'Reprovar com Notificação'}
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(decidindoId)}
                      onClick={() => handleDecidir(m.id, 'APROVAR')}
                      className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-xs font-bold text-[var(--accent-on-primary)] inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {carregandoAprovar ? 'Aprovando...' : 'Aprovar Processo'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Histórico de Deliberações & Trilha Auditável (VD-05 / VD-07) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Processos Deliberados */}
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Gavel className="w-4 h-4 text-[var(--accent-text)]" />
              Histórico de Deliberações da Mesa ({deliberadosMesa.length})
            </h3>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">VD-05</span>
          </div>

          {!deliberadosMesa.length ? (
            <div className="p-6 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
              Nenhuma deliberação humana registrada ainda nesta sessão. Aprove ou reprove um dossiê na fila acima para registrar o parecer VD-05.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {deliberadosMesa.map((p) => {
                const aprovado = p.status === 'CONCLUIDO'
                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] space-y-1.5 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-[var(--text-primary)]">{p.protocolo}</span>
                        <span className="text-[var(--text-subtle)]">·</span>
                        <span className="text-[var(--text-muted)]">{p.placa}</span>
                        <span className="text-[var(--text-subtle)]">·</span>
                        <span className="text-[var(--text-muted)]">Score {p.score_ia}%</span>
                      </div>
                      <span
                        className={`font-mono font-bold text-[11px] ${
                          aprovado
                            ? 'text-[var(--semantic-success-text)]'
                            : 'text-[var(--semantic-danger-text)]'
                        }`}
                      >
                        {aprovado ? 'APROVADO (CONCLUÍDO)' : 'REPROVADO (NOTIFICADO)'}
                      </span>
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      “{p.justificativa_auditor}”
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Eventos da Mesa na Trilha VD-07 */}
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <History className="w-4 h-4 text-[var(--semantic-warning-text)]" />
              Eventos MESA_REVISORA na Trilha VD-07 ({eventosMesa.length})
            </h3>
            {onIrParaAuditoria && (
              <button
                type="button"
                onClick={onIrParaAuditoria}
                className="text-[11px] font-semibold text-[var(--accent-text)] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Ver Trilha Completa
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {!eventosMesa.length ? (
            <div className="p-6 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
              Nenhum evento de calibração ou decisão da Mesa Revisora registrado até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[var(--bg-surface-alt)] text-[11px] font-mono text-[var(--text-muted)] border-b border-[var(--border-subtle)] sticky top-0">
                  <tr>
                    <th className="py-2 px-2.5">Bloco</th>
                    <th className="py-2 px-2.5">Operação</th>
                    <th className="py-2 px-2.5">Resultado</th>
                    <th className="py-2 px-2.5">Horário</th>
                    <th className="py-2 px-2.5 text-right">Inspecionar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {eventosMesa.map((ev) => (
                    <tr
                      key={ev.id}
                      onClick={() => setEventoInspecao(ev)}
                      className="hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-2.5 font-mono text-[var(--text-muted)] tabular-nums whitespace-nowrap">
                        #{ev.blockIndex || ev.id}
                      </td>
                      <td className="py-2.5 px-2.5 font-mono font-semibold text-[var(--text-primary)]">
                        <div className="truncate max-w-[200px]" title={ev.operacao}>
                          {ev.operacao}
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5 font-mono font-bold whitespace-nowrap">
                        <span
                          className={
                            ev.sucesso
                              ? 'text-[var(--semantic-success-text)]'
                              : 'text-[var(--semantic-danger-text)]'
                          }
                        >
                          {ev.sucesso ? 'OK' : 'REPROVADO'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 font-mono text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap">
                        {formatDateTime(ev.criado_em)}
                      </td>
                      <td className="py-2.5 px-2.5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent-text)]">
                          <FileSearch className="w-3.5 h-3.5" />
                          Abrir
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Inspeção de Evento VD-07 */}
      <EventInspectionModal event={eventoInspecao} onClose={() => setEventoInspecao(null)} />
    </section>
  )
}
