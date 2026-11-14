import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  LayoutDashboard,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  X
} from 'lucide-react'
import DashboardAuditLayout from '../DashboardAuditLayout'
import DashboardKpiCard from '../DashboardKpiCard'
import EventInspectionModal from '../EventInspectionModal'
import LiveBlockchainValidation from '../LiveBlockchainValidation'
import { useToast } from '../ToastContext'

const ORIGEM_OPTIONS = [
  { value: '', label: 'Todas as origens' },
  { value: 'BALCAOWS_DETRAN_CE', label: 'BALCAOWS_DETRAN_CE' },
  { value: 'EXTERNO_BIOMETRIA', label: 'EXTERNO_BIOMETRIA' },
  { value: 'EXTERNO_VALIDACAO_DOC', label: 'EXTERNO_VALIDACAO_DOC' },
  { value: 'MESA_REVISORA', label: 'MESA_REVISORA' },
  { value: 'ANTIFRAUDE_ETAPA_II', label: 'ANTIFRAUDE_ETAPA_II' }
]

function classificarStatusAuditoria(evento) {
  const op = String(evento?.operacao || '')
  if (!evento?.sucesso || evento?.origem === 'ANTIFRAUDE_ETAPA_II' || /BLOQUEIO|REPROVAR|ERRO|FALHA/i.test(op)) {
    return 'SINALIZADO'
  }
  if (
    /ROTEAMENTO_FAIXA_AMARELA|REVISAO_MANUAL|PENDENTE|AGUARDANDO/i.test(op) ||
    (evento?.origem === 'MESA_REVISORA' && /ABERTURA_PROCESSO/i.test(op))
  ) {
    return 'PENDENTE'
  }
  return 'VALIDADO'
}

export default function DashboardPage({
  dashboard = {},
  auditoria = [],
  filtroOrigem = '',
  onFiltroOrigemChange,
  onCarregarAuditoria,
  onBaixarPdfPades,
  historicoEtapa3 = [],
  onAtualizarTudo,
  carregandoDados = false
}) {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeView = tabParam === 'auditoria' ? 'auditoria' : 'dashboard'

  const [buscaAuditoria, setBuscaAuditoria] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [eventoInspecionado, setEventoInspecionado] = useState(null)
  const [padesPreviewOpen, setPadesPreviewOpen] = useState(false)

  function handleChangeView(view) {
    if (view === 'auditoria') {
      setSearchParams({ tab: 'auditoria' }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape' && padesPreviewOpen) {
        setPadesPreviewOpen(false)
      }
    }
    if (padesPreviewOpen) {
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [padesPreviewOpen])

  const resumo = dashboard.resumo || {}
  const totalProcessos = Number(resumo.total || 0)
  const totalTransferencias = Number(resumo.total_transferencias || 0)
  const totalPrimeiroReg = Number(resumo.total_primeiro_registro || 0)
  const totalAprovados = Number(resumo.aprovados || 0)
  const totalMesa = Number(resumo.em_mesa_revisora || 0)
  const totalReprovados = Number(resumo.reprovados || 0)
  const notificacoesEnviadas = Number(dashboard.notificacoesEnviadas || 0)
  const blockchainIntegra = dashboard.blockchain?.integra !== false
  const totalBlocos = Number(dashboard.blockchain?.totalBlocos ?? auditoria.length ?? 0)
  const headHash = dashboard.blockchain?.ultimoHash || auditoria[0]?.hash || '0'.repeat(64)

  const pctPrimeiroReg = totalProcessos > 0 ? Math.round((totalPrimeiroReg / totalProcessos) * 100) : 0
  const pctTransferencias = totalProcessos > 0 ? Math.max(0, 100 - pctPrimeiroReg) : 0

  const pctAprovados = totalProcessos > 0 ? Math.round((totalAprovados / totalProcessos) * 100) : 0
  const pctMesa = totalProcessos > 0 ? Math.round((totalMesa / totalProcessos) * 100) : 0
  const pctReprovados = totalProcessos > 0 ? Math.max(0, 100 - pctAprovados - pctMesa) : 0

  const scoreMedioNum = useMemo(() => {
    const raw = String(resumo.score_medio || '').replace('%', '').trim()
    const num = Number(raw)
    return Number.isFinite(num) ? Math.min(100, Math.max(0, num)) : 0
  }, [resumo.score_medio])

  const lotesStats = useMemo(() => {
    const total = historicoEtapa3.length
    const conformes = historicoEtapa3.filter((h) => h.dentroLimite60s).length
    const mediaSeg = total
      ? historicoEtapa3.reduce((acc, h) => acc + Number(h.tempoSegundos || 0), 0) / total
      : 0
    const pctConformes = total > 0 ? Math.round((conformes / total) * 100) : 100
    return { total, conformes, mediaSeg, pctConformes }
  }, [historicoEtapa3])

  const statusCounts = useMemo(() => {
    let validados = 0
    let pendentes = 0
    let sinalizados = 0
    for (const a of auditoria) {
      const st = classificarStatusAuditoria(a)
      if (st === 'SINALIZADO') sinalizados += 1
      else if (st === 'PENDENTE') pendentes += 1
      else validados += 1
    }
    return {
      todos: auditoria.length,
      validados,
      pendentes,
      sinalizados,
      ok: validados + pendentes,
      bloqueado: sinalizados
    }
  }, [auditoria])

  const auditoriaFiltrada = useMemo(() => {
    const q = buscaAuditoria.trim().toLowerCase()
    return auditoria.filter((a) => {
      const statusClass = classificarStatusAuditoria(a)
      if (filtroStatus === 'VALIDADO' && statusClass !== 'VALIDADO') return false
      if (filtroStatus === 'PENDENTE' && statusClass !== 'PENDENTE') return false
      if (filtroStatus === 'SINALIZADO' && statusClass !== 'SINALIZADO') return false
      if (!q) return true
      const haystack = [
        a.operacao,
        a.origem,
        a.endpoint,
        a.hash,
        a.previousHash,
        a.blockIndex ? `#${a.blockIndex}` : ''
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [auditoria, buscaAuditoria, filtroStatus])

  function exportarAuditoriaCsv() {
    if (!auditoriaFiltrada.length) {
      toast.error('Sem Eventos para Exportar', 'Ajuste os filtros ou aguarde novos eventos VD-07.')
      return
    }
    const header = 'Bloco,ID,Data/Hora,Origem,Operação,Endpoint,Status,Modo,Hash SHA-256,Hash Anterior'
    const lines = auditoriaFiltrada.map((a) =>
      [
        a.blockIndex || a.id,
        a.id,
        new Date(a.criado_em).toLocaleString('pt-BR'),
        a.origem,
        a.operacao,
        a.endpoint || '',
        a.sucesso ? 'OK' : 'BLOQUEADO',
        a.modo_simulado ? 'SIMULADO' : 'AO_VIVO',
        a.hash || '',
        a.previousHash || ''
      ]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = '\uFEFF' + [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `trilha_auditoria_vd07_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      try {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch {
        // Ignore cleanup failures
      }
    }, 1500)
    toast.success(
      'CSV Export Ready',
      `${auditoriaFiltrada.length} eventos da Trilha VD-07 exportados em UTF-8 BOM.`
    )
  }

  function limparFiltrosAuditoria() {
    setBuscaAuditoria('')
    setFiltroStatus('TODOS')
    if (filtroOrigem) {
      onFiltroOrigemChange('')
      onCarregarAuditoria('')
    }
  }

  const layoutTabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      count: totalProcessos
    },
    {
      id: 'auditoria',
      label: 'Auditoria',
      icon: ShieldCheck,
      count: auditoria.length
    }
  ]

  const layoutRightActions = (
    <>
      {activeView === 'auditoria' && (
        <button
          type="button"
          onClick={exportarAuditoriaCsv}
          className="px-3 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Exportar CSV VD-07
        </button>
      )}
      <button
        type="button"
        onClick={() => onAtualizarTudo(true)}
        className="px-3 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${carregandoDados ? 'animate-spin' : ''}`} />
        Sincronizar
      </button>
    </>
  )

  return (
    <>
      <DashboardAuditLayout
        activeView={activeView}
        onChangeView={handleChangeView}
        tabs={layoutTabs}
        subtitle={
          activeView === 'dashboard'
            ? 'Indicadores executivos, assinatura PAdES AC-02 e lotes Etapa III'
            : 'Verificação Blockchain SHA-256 (VD-06) e Trilha Segregada (VD-07)'
        }
        rightActions={layoutRightActions}
      >
        {activeView === 'dashboard' ? (
          <>
            {/* 1. Grade Executiva de KPIs + Barras Proporcionais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <DashboardKpiCard
                label="Total de Processos"
                value={totalProcessos}
                percentage={pctPrimeiroReg}
                ariaLabel={`Distribuição de serviços: ${pctPrimeiroReg}% Primeiro Registro, ${pctTransferencias}% Transferência`}
                segments={
                  totalProcessos > 0
                    ? [
                        {
                          key: 'primeiro-reg',
                          percentage: pctPrimeiroReg,
                          colorVar: 'var(--semantic-info-text)'
                        },
                        {
                          key: 'transferencia',
                          percentage: pctTransferencias,
                          colorVar: 'var(--accent-primary)'
                        }
                      ]
                    : []
                }
                footerLeft={`1º Reg: ${totalPrimeiroReg} (${pctPrimeiroReg}%)`}
                footerRight={`Transf: ${totalTransferencias} (${pctTransferencias}%)`}
              />

              <DashboardKpiCard
                label="Aprovados / Concluídos"
                value={totalAprovados}
                valueToneClass="text-[var(--semantic-success-text)]"
                secondaryValue={`${pctAprovados}% do total`}
                percentage={scoreMedioNum}
                barColorVar="var(--semantic-success-text)"
                footerLeft="Score médio IA"
                footerRight={
                  <span className="font-semibold text-[var(--text-primary)]">
                    {resumo.score_medio || '—'}
                  </span>
                }
              />

              <DashboardKpiCard
                label="Mesa Revisora / Reprovados"
                value={
                  <>
                    <span className="text-[var(--semantic-warning-text)]">{totalMesa}</span>
                    <span className="text-[var(--text-subtle)] font-normal mx-1.5">/</span>
                    <span className="text-[var(--semantic-danger-text)]">{totalReprovados}</span>
                  </>
                }
                percentage={pctMesa + pctReprovados}
                ariaLabel={`Semáforo: ${pctAprovados}% aprovados, ${pctMesa}% mesa revisora, ${pctReprovados}% reprovados`}
                segments={
                  totalProcessos > 0
                    ? [
                        {
                          key: 'aprovados',
                          percentage: pctAprovados,
                          colorVar: 'var(--semantic-success-text)'
                        },
                        {
                          key: 'mesa',
                          percentage: pctMesa,
                          colorVar: 'var(--semantic-warning-text)'
                        },
                        {
                          key: 'reprovados',
                          percentage: pctReprovados,
                          colorVar: 'var(--semantic-danger-text)'
                        }
                      ]
                    : []
                }
                footerLeft="Notificações enviadas"
                footerRight={
                  <span className="font-semibold text-[var(--text-primary)]">
                    {notificacoesEnviadas}
                  </span>
                }
              />

              <DashboardKpiCard
                label="Integridade Blockchain (VD-06)"
                icon={Lock}
                value={blockchainIntegra ? 'ÍNTEGRA (SHA-256)' : 'ALERTA CADEIA'}
                valueToneClass={
                  blockchainIntegra
                    ? 'text-[var(--semantic-success-text)]'
                    : 'text-[var(--semantic-danger-text)]'
                }
                percentage={lotesStats.pctConformes}
                barColorVar={
                  blockchainIntegra
                    ? 'var(--semantic-success-text)'
                    : 'var(--semantic-danger-text)'
                }
                headerAction={
                  <button
                    type="button"
                    onClick={() => handleChangeView('auditoria')}
                    className="text-[11px] font-semibold text-[var(--accent-text)] hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    Auditar <ArrowRight className="w-3 h-3" />
                  </button>
                }
                footerLeft={`Blocos: ${totalBlocos}`}
                footerRight={`SLA Lotes: ${lotesStats.conformes}/${lotesStats.total || 0} (≤ 60s)`}
              />
            </div>

            {/* 2. Assinatura Institucional PAdES (AC-02) + Resumo de Lotes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <div className="lg:col-span-7 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <h2 className="font-bold text-sm sm:text-base text-[var(--text-primary)] flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
                    <span>Assinatura Institucional PAdES (AC-02 · e-CNPJ NECAVA)</span>
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Gera documento PDF assinado com SubFilter{' '}
                    <code className="font-mono text-[var(--semantic-info-text)]">
                      ETSI.CAdES.detached
                    </code>
                    , algoritmo SHA-256 e validação compatível com Adobe Reader e Verificador ITI.
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-[var(--text-muted)] tabular-nums">
                    CNPJ 05.591.991/0001-48 · Head: {headHash.slice(0, 14)}...
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPadesPreviewOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Visualizar Certificado
                    </button>
                    <button
                      type="button"
                      onClick={() => onBaixarPdfPades(null)}
                      className="px-3.5 py-1.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-xs font-bold text-[var(--accent-on-primary)] inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar PDF PAdES
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <h2 className="font-bold text-sm sm:text-base text-[var(--text-primary)] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--semantic-success-text)] shrink-0" />
                    <span>Resumo de Auditoria &amp; SLA</span>
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Cadeia VD-06 com {totalBlocos} blocos encadeados e {statusCounts.ok} eventos
                    autorizados ({statusCounts.bloqueado} bloqueios antifraude registrados).
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-[var(--text-muted)] tabular-nums">
                    SLA Etapa III: {lotesStats.mediaSeg.toFixed(2)}s / 60.00s
                  </span>
                  <button
                    type="button"
                    onClick={() => handleChangeView('auditoria')}
                    className="px-3 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                  >
                    Abrir Painel de Auditoria
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Histórico de Lotes da Etapa III */}
            <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
                    Histórico de Lotes da Etapa III (IA · Anexo I)
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono tabular-nums">
                    {lotesStats.total} lote(s) · Conformes ≤ 60s: {lotesStats.conformes}/
                    {lotesStats.total} ({lotesStats.pctConformes}%) · Média:{' '}
                    {lotesStats.mediaSeg.toFixed(2)}s
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onAtualizarTudo(true)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${carregandoDados ? 'animate-spin' : ''}`} />
                  Atualizar Logs
                </button>
              </div>

              {historicoEtapa3.length === 0 ? (
                <div className="py-10 px-4 text-center space-y-2">
                  <div className="text-xs font-medium text-[var(--text-primary)]">
                    Nenhum lote processado registrado no histórico até o momento.
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Execute um lote de 100 imagens no módulo Etapa III para registrar tempos de SLA
                    e planilhas CSV.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Lote</th>
                        <th className="py-2.5 px-4 font-semibold">Data/Hora</th>
                        <th className="py-2.5 px-4 font-semibold">Volume</th>
                        <th className="py-2.5 px-4 font-semibold">Tempo vs SLA (60s)</th>
                        <th className="py-2.5 px-4 font-semibold">Critério ≤ 60s</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Exportação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] font-mono tabular-nums">
                      {historicoEtapa3.map((h) => {
                        const tempo = Number(h.tempoSegundos || 0)
                        const slaRatio = Math.min(100, Math.round((tempo / 60) * 100))
                        return (
                          <tr
                            key={h.id}
                            className="hover:bg-[var(--bg-surface-hover)] transition-colors"
                          >
                            <td className="py-2.5 px-4 font-bold text-[var(--semantic-info-text)] whitespace-nowrap">
                              #LOTE-{h.id}
                            </td>
                            <td className="py-2.5 px-4 text-[var(--text-secondary)] font-sans whitespace-nowrap">
                              {new Date(h.criadoEm).toLocaleString('pt-BR')}
                            </td>
                            <td className="py-2.5 px-4 text-[var(--text-primary)] whitespace-nowrap">
                              {h.totalImagens} imagens
                            </td>
                            <td className="py-2.5 px-4 min-w-[180px]">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`font-bold w-14 shrink-0 ${
                                    h.dentroLimite60s
                                      ? 'text-[var(--semantic-success-text)]'
                                      : 'text-[var(--semantic-danger-text)]'
                                  }`}
                                >
                                  {tempo.toFixed(2)}s
                                </span>
                                <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] overflow-hidden">
                                  <div
                                    className="h-full"
                                    style={{
                                      width: `${slaRatio}%`,
                                      backgroundColor: h.dentroLimite60s
                                        ? 'var(--semantic-success-text)'
                                        : 'var(--semantic-danger-text)'
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <span
                                className={`text-[11px] font-semibold inline-flex items-center gap-1 ${
                                  h.dentroLimite60s
                                    ? 'text-[var(--semantic-success-text)]'
                                    : 'text-[var(--semantic-danger-text)]'
                                }`}
                              >
                                {h.dentroLimite60s ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                ) : (
                                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                )}
                                {h.dentroLimite60s ? 'CONFORME (≤ 60s)' : 'EXCEDIDO'}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right font-sans whitespace-nowrap">
                              <a
                                href={h.downloadUrl}
                                download={`resultado_etapa3_lote_${h.id}.csv`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-on-primary)] text-xs font-semibold transition-colors whitespace-nowrap"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Baixar Planilha CSV
                              </a>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* VISÃO AUDITORIA: 1. Validação Blockchain SHA-256 (VD-06) */}
            <LiveBlockchainValidation
              auditCount={auditoria.length}
              blockchainSummary={dashboard.blockchain}
            />

            {/* VISÃO AUDITORIA: 2. Trilha de Auditoria Segregada (VD-07 · Item 2.1.11) */}
            <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
              <div className="px-5 py-4 bg-[var(--bg-surface-alt)] border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
                    Trilha de Auditoria Segregada (VD-07 · Item 2.1.11)
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Registro cronológico segregado por origem operacional. Clique em qualquer linha
                    para inspecionar hashes e JSON.
                  </p>
                </div>
                <span className="text-xs font-mono tabular-nums text-[var(--text-muted)]">
                  Exibindo {auditoriaFiltrada.length} de {auditoria.length} eventos
                </span>
              </div>

              {/* Barra de Busca, Origem e Chips Rápidos de Status */}
              <div className="p-4 border-b border-[var(--border-subtle)] space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[220px] max-w-md">
                    <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={buscaAuditoria}
                      onChange={(e) => setBuscaAuditoria(e.target.value)}
                      placeholder="Buscar operação, endpoint, origem ou hash..."
                      aria-label="Buscar na trilha de auditoria"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg pl-8 pr-8 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                    {buscaAuditoria && (
                      <button
                        type="button"
                        onClick={() => setBuscaAuditoria('')}
                        aria-label="Limpar busca"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <select
                      aria-label="Filtrar auditoria por origem"
                      value={filtroOrigem}
                      onChange={(e) => {
                        onFiltroOrigemChange(e.target.value)
                        onCarregarAuditoria(e.target.value)
                      }}
                      className="bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    >
                      {ORIGEM_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    {(buscaAuditoria || filtroStatus !== 'TODOS' || filtroOrigem) && (
                      <button
                        type="button"
                        onClick={limparFiltrosAuditoria}
                        className="px-2.5 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-medium text-[var(--btn-secondary-text)] inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick-Filter Chips de Status para o Auditor Fiscal */}
                <div
                  role="group"
                  aria-label="Filtros rápidos por status do evento"
                  className="flex flex-wrap items-center gap-2"
                >
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] mr-1">
                    Status rápido:
                  </span>
                  {[
                    {
                      key: 'TODOS',
                      label: 'Todos',
                      count: statusCounts.todos,
                      icon: null,
                      activeClass:
                        'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent-text)]'
                    },
                    {
                      key: 'VALIDADO',
                      label: 'Validados',
                      count: statusCounts.validados,
                      icon: CheckCircle2,
                      activeClass:
                        'bg-[var(--semantic-success-bg)] border-[var(--semantic-success-border)] text-[var(--semantic-success-text)]'
                    },
                    {
                      key: 'PENDENTE',
                      label: 'Pendentes',
                      count: statusCounts.pendentes,
                      icon: Clock,
                      activeClass:
                        'bg-[var(--semantic-warning-bg)] border-[var(--semantic-warning-border)] text-[var(--semantic-warning-text)]'
                    },
                    {
                      key: 'SINALIZADO',
                      label: 'Sinalizados',
                      count: statusCounts.sinalizados,
                      icon: ShieldAlert,
                      activeClass:
                        'bg-[var(--semantic-danger-bg)] border-[var(--semantic-danger-border)] text-[var(--semantic-danger-text)]'
                    }
                  ].map((chip) => {
                    const ChipIcon = chip.icon
                    const isActive = filtroStatus === chip.key
                    return (
                      <button
                        key={chip.key}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setFiltroStatus(chip.key)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                          isActive
                            ? chip.activeClass
                            : 'bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {ChipIcon && <ChipIcon className="w-3.5 h-3.5 shrink-0" />}
                        <span>{chip.label}</span>
                        <span className="font-mono text-[11px] tabular-nums opacity-85">
                          ({chip.count})
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tabela VD-07 */}
              {carregandoDados && auditoria.length === 0 ? (
                <div className="p-4 space-y-2.5">
                  {[1, 2, 3, 4].map((idx) => (
                    <div
                      key={idx}
                      className="h-10 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Bloco</th>
                        <th className="py-2.5 px-4 font-semibold">Data/Hora</th>
                        <th className="py-2.5 px-4 font-semibold">Origem</th>
                        <th className="py-2.5 px-4 font-semibold">Operação</th>
                        <th className="py-2.5 px-4 font-semibold">Endpoint</th>
                        <th className="py-2.5 px-4 font-semibold">Status</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Inspeção</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {auditoriaFiltrada.map((a) => (
                        <tr
                          key={a.id}
                          onClick={() => setEventoInspecionado(a)}
                          className="hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                        >
                          <td className="py-2.5 px-4 font-mono font-bold text-[var(--semantic-info-text)] tabular-nums whitespace-nowrap">
                            #{a.blockIndex || a.id}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[var(--text-muted)] tabular-nums whitespace-nowrap">
                            {new Date(a.criado_em).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[var(--semantic-success-text)] whitespace-nowrap">
                            {a.origem}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">
                            {a.operacao}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[var(--text-muted)] max-w-xs truncate">
                            {a.endpoint || '—'}
                          </td>
                          <td className="py-2.5 px-4 whitespace-nowrap font-mono">
                            {(() => {
                              const statusClass = classificarStatusAuditoria(a)
                              if (statusClass === 'SINALIZADO') {
                                return (
                                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--semantic-danger-text)]">
                                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                    SINALIZADO
                                  </span>
                                )
                              }
                              if (statusClass === 'PENDENTE') {
                                return (
                                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--semantic-warning-text)]">
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                    PENDENTE
                                  </span>
                                )
                              }
                              return (
                                <span className="inline-flex items-center gap-1 font-semibold text-[var(--semantic-success-text)]">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  VALIDADO
                                </span>
                              )
                            })()}
                            {a.modo_simulado && (
                              <span className="ml-1.5 text-[var(--text-muted)]">
                                (SIM)
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEventoInspecionado(a)
                              }}
                              className="px-2.5 py-1 rounded-md bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-[11px] font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              Detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                      {auditoriaFiltrada.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-10 px-4 text-center space-y-3">
                            <div className="text-xs text-[var(--text-muted)]">
                              Nenhum evento encontrado para os critérios de busca e filtro ativos.
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={limparFiltrosAuditoria}
                                className="px-3 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] cursor-pointer"
                              >
                                Limpar Filtros
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </DashboardAuditLayout>

      {/* Modal de Inspeção do Evento VD-07 */}
      <EventInspectionModal
        event={eventoInspecionado}
        onClose={() => setEventoInspecionado(null)}
      />

      {/* Modal de Preview do Certificado & Manifesto PAdES (AC-02) */}
      {padesPreviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPadesPreviewOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pades-modal-title"
            className="w-full max-w-xl rounded-xl bg-[var(--bg-modal)] border border-[var(--border-strong)] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[var(--semantic-success-text)] shrink-0" />
                <div>
                  <h3 id="pades-modal-title" className="text-sm font-bold text-[var(--text-primary)]">
                    Manifesto de Assinatura Digital PAdES (AC-02)
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Certificado Institucional e-CNPJ ICP-Brasil · Conformidade ITI &amp; DETRAN/CE
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPadesPreviewOpen(false)}
                aria-label="Fechar preview PAdES"
                className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
                  <div className="text-[11px] text-[var(--text-muted)]">Titular do Certificado</div>
                  <div className="mt-1 font-bold text-[var(--text-primary)]">
                    NECAVA INSPEÇÃO E PESQUISA EM TRANSPORTES LTDA
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
                  <div className="text-[11px] text-[var(--text-muted)]">
                    CNPJ / Identificador ICP-Brasil
                  </div>
                  <div className="mt-1 font-mono font-bold text-[var(--text-primary)] tabular-nums">
                    05.591.991/0001-48 · e-CNPJ A1
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
                  <div className="text-[11px] text-[var(--text-muted)]">Padrão &amp; SubFilter</div>
                  <div className="mt-1 font-mono text-[var(--semantic-info-text)] font-semibold">
                    PAdES · ETSI.CAdES.detached
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
                  <div className="text-[11px] text-[var(--text-muted)]">Algoritmo &amp; Verificação</div>
                  <div className="mt-1 font-mono text-[var(--semantic-success-text)] font-semibold">
                    SHA-256 · Adobe Reader / ITI
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">
                    Resumo da Sessão Selada no Documento
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                    {totalProcessos} processos · {totalBlocos} blocos
                  </span>
                </div>
                <div className="font-mono text-[11px] text-[var(--semantic-success-text)] break-all">
                  Head Hash: {headHash}
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPadesPreviewOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onBaixarPdfPades(null)
                    setPadesPreviewOpen(false)
                  }}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-xs font-bold text-[var(--accent-on-primary)] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar PDF PAdES Assinado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
