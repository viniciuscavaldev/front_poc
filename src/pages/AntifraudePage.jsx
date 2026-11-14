import React, { useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  Play,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Terminal,
  Trash2
} from 'lucide-react'
import EventInspectionModal from '../EventInspectionModal'

const CENARIOS_ANTIFRAUDE = [
  {
    id: 'F-01',
    t: 'F-01 — Divergência Cadastral CPF Vendedor',
    regra: 'Item 2.1 · Batimento Cadastral BalcãoWS',
    endpoint: 'POST /api/poc-ce/processos',
    gatilho: 'CPF enviado (111.111.111-11) ≠ CPF oficial BalcãoWS (999.999.999-99)',
    d: 'Submete CPF do vendedor divergente do retorno oficial do BalcãoWS para comprovar o bloqueio imediato.'
  },
  {
    id: 'F-02',
    t: 'F-02 — Reutilização de Laudo de Vistoria',
    regra: 'Item 2.2 · Unicidade de Laudo ECV',
    endpoint: 'POST /api/poc-ce/processos',
    gatilho: 'Mesmo laudo_vistoria_id vinculado a dois chassis distintos',
    d: 'Tenta vincular um ID de laudo de vistoria ECV já utilizado em outro processo ativo na base estadual.'
  },
  {
    id: 'F-03',
    t: 'F-03 — Chassi Inexistente / Campo Omitido',
    regra: 'Item 2.3 · Validação Estrutural VIN (17 dígitos)',
    endpoint: 'POST /api/poc-ce/processos',
    gatilho: 'Chassi vazio ou não cadastrado na base estadual DETRAN-CE',
    d: 'Envia solicitação sem chassi válido ou com identificador inexistente na base estadual.'
  },
  {
    id: 'F-04',
    t: 'F-04 — Assinatura Incompleta / Sequência Lógica',
    regra: 'Item 2.4 · Ordem Obrigatória de Assinaturas',
    endpoint: 'POST /api/poc-ce/processos/:id/avancar',
    gatilho: 'Assinatura COMPRADOR enviada antes da etapa 7 (vendedor)',
    d: 'Tenta registrar a assinatura do comprador antes da conclusão obrigatória da etapa do vendedor.'
  }
]

export default function AntifraudePage({
  cenarioAtivoEtapa2,
  onSelecionarCenario,
  resultadoEtapa2,
  etapa2Testados = [],
  executandoEtapa2 = '',
  historicoEtapa2 = {},
  auditoria = [],
  onTestarEtapa2,
  onExecutarBateriaEtapa2,
  onIrParaAuditoria,
  onLimparConsole
}) {
  const [mostrarSimulador, setMostrarSimulador] = useState(false)
  const [simCenario, setSimCenario] = useState('F-01')
  const [simCpfVendedor, setSimCpfVendedor] = useState('11111111111')
  const [simCpfEsperado, setSimCpfEsperado] = useState('99999999999')
  const [simLaudoId, setSimLaudoId] = useState('LAUDO-CE-9901')
  const [simChassi, setSimChassi] = useState('CHASSI_INEXISTENTE')
  const [copiedKey, setCopiedKey] = useState('')
  const [eventoInspecionado, setEventoInspecionado] = useState(null)

  const totalTestados = etapa2Testados.length
  const pctProgresso = Math.round((totalTestados / CENARIOS_ANTIFRAUDE.length) * 100)
  const emExecucao = Boolean(executandoEtapa2)

  const registroAtivo = useMemo(() => {
    if (cenarioAtivoEtapa2 && historicoEtapa2[cenarioAtivoEtapa2]) {
      return historicoEtapa2[cenarioAtivoEtapa2]
    }
    const keys = Object.keys(historicoEtapa2)
    return keys.length ? historicoEtapa2[keys[keys.length - 1]] : null
  }, [cenarioAtivoEtapa2, historicoEtapa2])

  const eventosAntifraude = useMemo(
    () => auditoria.filter((a) => a.origem === 'ANTIFRAUDE_ETAPA_II'),
    [auditoria]
  )

  async function copiarJson(key, obj) {
    try {
      const text = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2)
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 1800)
    } catch {
      // Ignore clipboard failures
    }
  }

  function handleDispararSimulador(e) {
    e.preventDefault()
    if (emExecucao) return
    if (simCenario === 'F-01') {
      onTestarEtapa2('F-01', { cpfVendedor: simCpfVendedor, cpfEsperado: simCpfEsperado })
    } else if (simCenario === 'F-02') {
      onTestarEtapa2('F-02', { laudoId: simLaudoId })
    } else if (simCenario === 'F-03') {
      onTestarEtapa2('F-03', { chassi: simChassi })
    }
  }

  return (
    <>
      <section className="space-y-5">
        {/* 1. Cabeçalho Executivo & Progresso da Bateria Eliminatória (0/4 -> 4/4) */}
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono font-semibold text-[var(--semantic-danger-text)]">
                Motor Antifraude Documental · Validação Eliminatória (F-01 a F-04)
              </div>
              <h2 className="font-bold text-lg text-[var(--text-primary)]">
                Etapa II — Demonstração dos Bloqueios Automáticos
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Execute os 4 cenários exigidos no Edital DETRAN-CE individualmente ou em bateria
                sequencial para comprovar a rejeição imediata (HTTP 422) e a gravação na trilha
                VD-07.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onIrParaAuditoria && (
                <button
                  type="button"
                  onClick={onIrParaAuditoria}
                  className="px-3.5 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                >
                  Ver na Auditoria VD-07
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                disabled={emExecucao}
                onClick={() => onExecutarBateriaEtapa2?.()}
                className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-xs font-bold text-[var(--accent-on-primary)] inline-flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                {executandoEtapa2 === 'ALL' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                {executandoEtapa2 === 'ALL'
                  ? 'Executando Bateria (F-01 a F-04)...'
                  : 'Executar Bateria Completa (4/4)'}
              </button>
            </div>
          </div>

          {/* Barra de Progresso & Seletor Rápido dos 4 Cenários */}
          <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[var(--text-secondary)]">
                Progresso da Bateria Eliminatória
              </span>
              <span
                className={`font-mono font-bold tabular-nums ${
                  totalTestados === 4
                    ? 'text-[var(--semantic-success-text)]'
                    : 'text-[var(--text-primary)]'
                }`}
              >
                {totalTestados}/4 cenários comprovados ({pctProgresso}%)
              </span>
            </div>

            <div
              role="progressbar"
              aria-valuenow={pctProgresso}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progresso dos cenários antifraude F-01 a F-04"
              className="h-2 w-full rounded-full overflow-hidden bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]"
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${pctProgresso}%`,
                  backgroundColor:
                    totalTestados === 4
                      ? 'var(--semantic-success-text)'
                      : 'var(--semantic-warning-text)'
                }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {CENARIOS_ANTIFRAUDE.map((c) => {
                const comprovado = etapa2Testados.includes(c.id)
                const executandoEste = executandoEtapa2 === c.id
                const selecionado = cenarioAtivoEtapa2 === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      if (historicoEtapa2[c.id]) onSelecionarCenario?.(c.id)
                      else if (!emExecucao) onTestarEtapa2(c.id)
                    }}
                    className={`px-3 py-2 rounded-lg border text-xs font-mono flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      selecionado
                        ? 'bg-[var(--bg-surface-alt)] border-[var(--accent-border)] text-[var(--text-primary)]'
                        : 'bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                    }`}
                  >
                    <span className="font-bold">{c.id}</span>
                    <span
                      className={`text-[11px] font-semibold ${
                        executandoEste
                          ? 'text-[var(--semantic-warning-text)]'
                          : comprovado
                          ? 'text-[var(--semantic-success-text)]'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {executandoEste ? 'Testando...' : comprovado ? 'Bloqueado ✓' : 'Pendente'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 2. Grade dos 4 Cenários Eliminatórios com Regra e Gatilho Técnico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CENARIOS_ANTIFRAUDE.map((c) => {
            const isActive = cenarioAtivoEtapa2 === c.id
            const comprovado = etapa2Testados.includes(c.id)
            const executandoEste = executandoEtapa2 === c.id
            const temHistorico = Boolean(historicoEtapa2[c.id])

            return (
              <div
                key={c.id}
                className={`rounded-xl bg-[var(--bg-surface)] border p-5 flex flex-col justify-between gap-4 transition-colors ${
                  isActive
                    ? 'border-[var(--semantic-danger-border)]'
                    : comprovado
                    ? 'border-[var(--semantic-success-border)]'
                    : 'border-[var(--border-subtle)]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[11px] font-mono text-[var(--text-muted)]">
                        {c.regra}
                      </div>
                      <h3 className="font-bold text-sm text-[var(--text-primary)]">{c.t}</h3>
                    </div>

                    <span
                      className={`text-[11px] font-mono font-bold whitespace-nowrap shrink-0 inline-flex items-center gap-1 ${
                        executandoEste
                          ? 'text-[var(--semantic-warning-text)]'
                          : comprovado
                          ? 'text-[var(--semantic-success-text)]'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {comprovado && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                      {executandoEste
                        ? 'EXECUTANDO'
                        : comprovado
                        ? 'BLOQUEIO COMPROVADO'
                        : 'PENDENTE'}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{c.d}</p>

                  <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] space-y-1 text-[11px] font-mono">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[var(--text-muted)]">Endpoint:</span>
                      <span className="text-[var(--semantic-info-text)] truncate">{c.endpoint}</span>
                    </div>
                    <div className="text-[var(--text-muted)]">
                      Gatilho: <span className="text-[var(--text-primary)]">{c.gatilho}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    disabled={emExecucao}
                    onClick={() => onTestarEtapa2(c.id)}
                    className="px-3.5 py-2 rounded-lg bg-[var(--semantic-danger-bg)] hover:opacity-90 border border-[var(--semantic-danger-border)] text-xs font-bold text-[var(--semantic-danger-text)] inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    {executandoEste ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    )}
                    {executandoEste ? `Validando ${c.id}...` : `Executar Bloqueio ${c.id}`}
                  </button>

                  {temHistorico && (
                    <button
                      type="button"
                      onClick={() => onSelecionarCenario?.(c.id)}
                      className="px-3 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver Retorno ({historicoEtapa2[c.id].statusHttp})
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 3. Simulação Personalizada (Teste Dinâmico ao Vivo em Comissão) */}
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
          <button
            type="button"
            onClick={() => setMostrarSimulador((prev) => !prev)}
            className="w-full px-5 py-3.5 bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-surface-hover)] flex items-center justify-between gap-3 text-left cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <SlidersHorizontal className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                  Simulação Personalizada (Teste Dinâmico para Avaliação da Comissão)
                </div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">
                  Informe manualmente um CPF divergente, ID de laudo duplicado ou chassi inválido
                  para validar a regra ao vivo.
                </div>
              </div>
            </div>
            {mostrarSimulador ? (
              <ChevronUp className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            )}
          </button>

          {mostrarSimulador && (
            <form
              onSubmit={handleDispararSimulador}
              className="p-5 border-t border-[var(--border-subtle)] grid grid-cols-1 md:grid-cols-12 gap-3 items-end text-xs"
            >
              <div className="md:col-span-3 space-y-1">
                <label className="block font-semibold text-[var(--text-secondary)]">
                  Cenário Alvo
                </label>
                <select
                  value={simCenario}
                  onChange={(e) => setSimCenario(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  <option value="F-01">F-01 · Divergência CPF Vendedor</option>
                  <option value="F-02">F-02 · Laudo ECV Duplicado</option>
                  <option value="F-03">F-03 · Chassi Inválido / Omitido</option>
                </select>
              </div>

              {simCenario === 'F-01' && (
                <>
                  <div className="md:col-span-3 space-y-1">
                    <label className="block font-semibold text-[var(--text-secondary)]">
                      CPF Enviado no Pedido
                    </label>
                    <input
                      type="text"
                      value={simCpfVendedor}
                      onChange={(e) => setSimCpfVendedor(e.target.value)}
                      className="w-full font-mono bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="block font-semibold text-[var(--text-secondary)]">
                      CPF Oficial BalcãoWS
                    </label>
                    <input
                      type="text"
                      value={simCpfEsperado}
                      onChange={(e) => setSimCpfEsperado(e.target.value)}
                      className="w-full font-mono bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </div>
                </>
              )}

              {simCenario === 'F-02' && (
                <div className="md:col-span-6 space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">
                    ID do Laudo de Vistoria (ex.: LAUDO-CE-9901 já em uso)
                  </label>
                  <input
                    type="text"
                    value={simLaudoId}
                    onChange={(e) => setSimLaudoId(e.target.value)}
                    className="w-full font-mono bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              )}

              {simCenario === 'F-03' && (
                <div className="md:col-span-6 space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">
                    Chassi (VIN) para Teste (vazio ou != 17 caracteres bloqueia)
                  </label>
                  <input
                    type="text"
                    value={simChassi}
                    onChange={(e) => setSimChassi(e.target.value)}
                    placeholder="Deixe vazio ou digite VIN inválido"
                    className="w-full font-mono bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              )}

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={emExecucao}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-xs font-bold text-[var(--accent-on-primary)] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Disparar Teste Dinâmico
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 4. Console de Segurança Estruturado (Request × Resposta HTTP 422) */}
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-5 py-3.5 bg-[var(--bg-surface-alt)] border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <Terminal className="w-4 h-4 text-[var(--semantic-danger-text)] shrink-0" />
              <span>Console de Inspeção Antifraude · Request × Veredito BalcãoWS</span>
            </div>

            <div className="flex items-center gap-2">
              {registroAtivo && (
                <button
                  type="button"
                  onClick={() => copiarJson('resp-json', registroAtivo.responseData)}
                  className="px-2.5 py-1 rounded-md bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-[11px] font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'resp-json' ? (
                    <Check className="w-3 h-3 text-[var(--semantic-success-text)]" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copiedKey === 'resp-json' ? 'Copiado' : 'Copiar Resposta'}
                </button>
              )}
              {(resultadoEtapa2 || registroAtivo) && (
                <button
                  type="button"
                  onClick={onLimparConsole}
                  className="px-2.5 py-1 rounded-md bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-[11px] font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Limpar
                </button>
              )}
            </div>
          </div>

          {registroAtivo ? (
            <div className="p-5 space-y-4">
              {/* Veredito Estruturado */}
              <div
                className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  registroAtivo.bloqueado
                    ? 'bg-[var(--semantic-danger-bg)] border-[var(--semantic-danger-border)]'
                    : 'bg-[var(--semantic-success-bg)] border-[var(--semantic-success-border)]'
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div
                    className={`text-xs font-mono font-bold flex flex-wrap items-center gap-2 ${
                      registroAtivo.bloqueado
                        ? 'text-[var(--semantic-danger-text)]'
                        : 'text-[var(--semantic-success-text)]'
                    }`}
                  >
                    <span>
                      {registroAtivo.bloqueado
                        ? `BLOQUEIO AUTOMÁTICO ${registroAtivo.cenario}`
                        : `PERMITIDO (${registroAtivo.cenario})`}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>HTTP {registroAtivo.statusHttp}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{registroAtivo.duracaoMs} ms</span>
                  </div>
                  <p className="text-xs text-[var(--text-primary)] font-medium">
                    {registroAtivo.responseData?.mensagem}
                  </p>
                </div>

                <div className="text-[11px] font-mono text-[var(--text-muted)] tabular-nums whitespace-nowrap shrink-0">
                  {registroAtivo.metodo} {registroAtivo.endpoint}
                </div>
              </div>

              {/* Comparador Lado a Lado: Payload Enviado vs Resposta JSON */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-secondary)]">
                      Payload Enviado (Request Body)
                    </span>
                    <button
                      type="button"
                      onClick={() => copiarJson('req-json', registroAtivo.requestPayload)}
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'req-json' ? (
                        <Check className="w-3 h-3 text-[var(--semantic-success-text)]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      Copiar
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-lg bg-[var(--bg-console)] border border-[var(--border-subtle)] text-sky-300 text-xs font-mono overflow-x-auto max-h-60 leading-relaxed">
                    {JSON.stringify(registroAtivo.requestPayload, null, 2)}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-secondary)]">
                      Resposta do Motor Antifraude (Response Body)
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                      {new Date(registroAtivo.executadoEm).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <pre className="p-3.5 rounded-lg bg-[var(--bg-console)] border border-[var(--border-subtle)] text-red-300 text-xs font-mono overflow-x-auto max-h-60 leading-relaxed">
                    {JSON.stringify(registroAtivo.responseData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-xs text-[var(--text-muted)]">
              {resultadoEtapa2 ||
                'Selecione um dos cenários F-01 a F-04 acima ou clique em "Executar Bateria Completa (4/4)" para inspecionar o payload enviado e o bloqueio JSON retornado.'}
            </div>
          )}
        </div>

        {/* 5. Comprovantes Gravados em Tempo Real na Trilha VD-07 (ANTIFRAUDE_ETAPA_II) */}
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-5 py-3.5 bg-[var(--bg-surface-alt)] border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--semantic-success-text)] shrink-0" />
              <h3 className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                Registros da Sessão na Trilha VD-07 &amp; Blockchain (ANTIFRAUDE_ETAPA_II)
              </h3>
            </div>
            <span className="text-xs font-mono tabular-nums text-[var(--text-muted)]">
              {eventosAntifraude.length} bloqueio(s) selados em SHA-256
            </span>
          </div>

          {eventosAntifraude.length === 0 ? (
            <div className="p-5 text-xs text-[var(--text-muted)]">
              Nenhum bloqueio antifraude registrado nesta sessão ainda. Cada tentativa bloqueada
              gera automaticamente um bloco encadeado na auditoria VD-07.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-56 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] sticky top-0">
                  <tr>
                    <th className="py-2 px-4 font-semibold">Bloco</th>
                    <th className="py-2 px-4 font-semibold">Data/Hora</th>
                    <th className="py-2 px-4 font-semibold">Operação</th>
                    <th className="py-2 px-4 font-semibold">Hash SHA-256</th>
                    <th className="py-2 px-4 font-semibold text-right">Inspeção</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono tabular-nums">
                  {eventosAntifraude.map((ev) => (
                    <tr
                      key={ev.id}
                      onClick={() => setEventoInspecionado(ev)}
                      className="hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                    >
                      <td className="py-2 px-4 font-bold text-[var(--semantic-info-text)] whitespace-nowrap">
                        #{ev.blockIndex || ev.id}
                      </td>
                      <td className="py-2 px-4 text-[var(--text-muted)] whitespace-nowrap">
                        {new Date(ev.criado_em).toLocaleTimeString('pt-BR')}
                      </td>
                      <td className="py-2 px-4 font-sans font-medium text-[var(--text-primary)]">
                        {ev.operacao}
                      </td>
                      <td className="py-2 px-4 text-[var(--semantic-success-text)] whitespace-nowrap">
                        {ev.hash ? `${ev.hash.slice(0, 16)}...` : '—'}
                      </td>
                      <td className="py-2 px-4 text-right font-sans whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEventoInspecionado(ev)
                          }}
                          className="px-2.5 py-1 rounded-md bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-[11px] font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <EventInspectionModal
        event={eventoInspecionado}
        onClose={() => setEventoInspecionado(null)}
      />
    </>
  )
}
