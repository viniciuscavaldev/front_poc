import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  Eye,
  FileSpreadsheet,
  Search,
  Upload,
  X
} from 'lucide-react'
import DashboardKpiCard from '../DashboardKpiCard'

export default function VisaoComputacionalPage({
  cronometro = 0,
  ultimaExecEtapa3Info = null,
  resultadosEtapa3 = [],
  resultadosEtapa3Filtrados = [],
  arquivosEtapa3 = [],
  onSelecionarArquivos,
  processandoLote = false,
  onProcessarLote,
  onRodarTreino100Fotos,
  csvEtapa3 = '',
  onBaixarCsvEtapa3,
  buscaEtapa3 = '',
  onBuscaEtapa3Change,
  historicoEtapa3 = [],
  onSelecionarLoteHistorico,
  onIrParaDashboard
}) {
  const [dragOver, setDragOver] = useState(false)
  const [filtroPosicao, setFiltroPosicao] = useState('TODAS')
  const [filtroMarca, setFiltroMarca] = useState('')
  const [registroInspecionado, setRegistroInspecionado] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!registroInspecionado) {
      setPreviewUrl('')
      return
    }
    const matched = arquivosEtapa3.find((f) => f.name === registroInspecionado.Arquivo)
    if (!matched) {
      setPreviewUrl('')
      return
    }
    const objectUrl = URL.createObjectURL(matched)
    setPreviewUrl(objectUrl)
    return () => {
      try {
        URL.revokeObjectURL(objectUrl)
      } catch {
        // Ignore cleanup failures
      }
    }
  }, [registroInspecionado, arquivosEtapa3])

  useEffect(() => {
    if (!registroInspecionado) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setRegistroInspecionado(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [registroInspecionado])

  const marcasDisponiveis = useMemo(() => {
    const set = new Set(resultadosEtapa3.map((r) => r.Marca).filter(Boolean))
    return Array.from(set).sort()
  }, [resultadosEtapa3])

  const linhasExibidas = useMemo(() => {
    return resultadosEtapa3Filtrados.filter((r) => {
      if (filtroPosicao !== 'TODAS' && r['Posição'] !== filtroPosicao) return false
      if (filtroMarca && r.Marca !== filtroMarca) return false
      return true
    })
  }, [resultadosEtapa3Filtrados, filtroPosicao, filtroMarca])

  const stats = useMemo(() => {
    const total = resultadosEtapa3.length
    const mercosul = resultadosEtapa3.filter((r) => r.Tipo === 'MERCOSUL').length
    const dianteira = resultadosEtapa3.filter((r) => r['Posição'] === 'DIANTEIRA').length
    const traseira = total - dianteira
    const originais = resultadosEtapa3.filter((r) => r.Originalidade === 'ORIGINAL').length

    const pctVolume = Math.min(100, Math.round((total / 100) * 100))
    const pctMercosul = total > 0 ? Math.round((mercosul / total) * 100) : 0
    const pctDianteira = total > 0 ? Math.round((dianteira / total) * 100) : 0
    const pctTraseira = total > 0 ? Math.max(0, 100 - pctDianteira) : 0
    const pctOriginais = total > 0 ? Math.round((originais / total) * 100) : 0

    return {
      total,
      mercosul,
      dianteira,
      traseira,
      originais,
      pctVolume,
      pctMercosul,
      pctDianteira,
      pctTraseira,
      pctOriginais
    }
  }, [resultadosEtapa3])

  const slaRatio = Math.min(100, Math.round((Number(cronometro || 0) / 60) * 100))
  const dentroSla = cronometro <= 60
  const throughput =
    cronometro > 0 && resultadosEtapa3.length > 0
      ? (resultadosEtapa3.length / cronometro).toFixed(1)
      : '—'

  function handleDropFiles(e) {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer?.files || []).filter((f) =>
      /\.(jpe?g|png)$/i.test(f.name)
    )
    if (dropped.length) {
      onSelecionarArquivos(dropped)
    }
  }

  function limparFiltros() {
    onBuscaEtapa3Change('')
    setFiltroPosicao('TODAS')
    setFiltroMarca('')
  }

  return (
    <>
      <section className="space-y-5">
        {/* 1. Cabeçalho Executivo + Cronômetro Bruto de SLA (≤ 60.00s) */}
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
            <div className="space-y-1.5 min-w-0">
              <div className="text-xs font-mono font-semibold text-[var(--semantic-info-text)]">
                Anexo I · Motor de Visão Computacional &amp; OCR Veicular
              </div>
              <h2 className="font-bold text-lg text-[var(--text-primary)]">
                Etapa III — Processamento em Lote (100 Imagens em ≤ 60s)
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Classificação simultânea de placa, marca, modelo, cor, posição, tipo e originalidade
                com exportação oficial em CSV UTF-8 com BOM.
              </p>
            </div>

            {/* Cronômetro Bruto com Barra de SLA */}
            <div className="min-w-[270px] px-5 py-3.5 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] space-y-2 shrink-0">
              <div className="flex items-center justify-between gap-3 text-[11px] text-[var(--text-muted)] font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  Tempo Bruto de Execução
                </span>
                <span
                  className={`font-mono font-bold ${
                    processandoLote
                      ? 'text-[var(--semantic-warning-text)]'
                      : dentroSla
                      ? 'text-[var(--semantic-success-text)]'
                      : 'text-[var(--semantic-danger-text)]'
                  }`}
                >
                  {processandoLote
                    ? 'PROCESSANDO'
                    : resultadosEtapa3.length > 0
                    ? dentroSla
                      ? 'CONFORME ≤ 60s'
                      : 'EXCEDIDO'
                    : 'AGUARDANDO'}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <div
                  className={`text-2xl sm:text-3xl font-mono font-extrabold tabular-nums ${
                    dentroSla
                      ? 'text-[var(--semantic-success-text)]'
                      : 'text-[var(--semantic-danger-text)]'
                  }`}
                >
                  {Number(cronometro).toFixed(2)}s{' '}
                  <span className="text-[var(--text-muted)] text-sm font-normal">/ 60.00s</span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)]">
                  {throughput} img/s
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={slaRatio}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Tempo utilizado em relação ao limite de 60 segundos"
                className="h-1.5 w-full rounded-full overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
              >
                <div
                  className="h-full transition-all duration-200"
                  style={{
                    width: `${slaRatio}%`,
                    backgroundColor: dentroSla
                      ? 'var(--semantic-success-text)'
                      : 'var(--semantic-danger-text)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Banner de Preservação de Estado */}
          {ultimaExecEtapa3Info && resultadosEtapa3.length > 0 && (
            <div className="p-3.5 rounded-lg bg-[var(--semantic-success-bg)] border border-[var(--semantic-success-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--semantic-success-text)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Estado preservado em sessão:{' '}
                  <strong className="font-mono tabular-nums">
                    {resultadosEtapa3.length} imagens
                  </strong>{' '}
                  processadas em{' '}
                  <strong className="font-mono tabular-nums">
                    {Number(cronometro).toFixed(2)}s
                  </strong>{' '}
                  ({new Date(ultimaExecEtapa3Info.criadoEm).toLocaleString('pt-BR')})
                </span>
              </div>
              <span className="font-mono text-[11px] font-semibold whitespace-nowrap">
                Lote #{ultimaExecEtapa3Info.id || 1} · Pronto para CSV
              </span>
            </div>
          )}

          {/* Área de Seleção / Drag & Drop e Controles de Execução */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDropFiles}
            className={`p-4 rounded-xl border transition-colors space-y-3 ${
              dragOver
                ? 'bg-[var(--accent-soft)] border-[var(--accent-border)]'
                : 'bg-[var(--bg-surface-alt)] border-[var(--border-subtle)]'
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <label className="px-4 py-2.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap shrink-0">
                <Upload className="w-4 h-4 text-[var(--semantic-info-text)]" />
                <span>
                  {arquivosEtapa3.length
                    ? `${arquivosEtapa3.length} arquivo(s) selecionado(s)`
                    : 'Selecionar Imagens (.jpg, .png)'}
                </span>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => onSelecionarArquivos(Array.from(e.target.files || []))}
                  className="sr-only"
                />
              </label>

              {arquivosEtapa3.length > 0 && !processandoLote && (
                <button
                  type="button"
                  onClick={() => onSelecionarArquivos([])}
                  className="px-3 py-2.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <X className="w-3.5 h-3.5" />
                  Limpar Seleção
                </button>
              )}

              <button
                type="button"
                onClick={onProcessarLote}
                disabled={processandoLote || !arquivosEtapa3.length}
                className="px-4 py-2.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 text-xs font-bold text-[var(--accent-on-primary)] cursor-pointer transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Cpu className={`w-4 h-4 ${processandoLote ? 'animate-spin' : ''}`} />
                {processandoLote
                  ? `Processando ${arquivosEtapa3.length} imagens...`
                  : `Processar Lote (${arquivosEtapa3.length || 0} arquivos)`}
              </button>

              <button
                type="button"
                onClick={onRodarTreino100Fotos}
                disabled={processandoLote}
                className="px-4 py-2.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] disabled:opacity-50 border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] cursor-pointer transition-colors whitespace-nowrap shrink-0"
              >
                Executar Lote Referência (100 Imagens)
              </button>

              {(csvEtapa3 || resultadosEtapa3.length > 0) && (
                <button
                  type="button"
                  onClick={onBaixarCsvEtapa3}
                  className="px-4 py-2.5 rounded-lg bg-[var(--semantic-info-bg)] hover:opacity-90 border border-[var(--semantic-info-border)] text-xs font-bold text-[var(--semantic-info-text)] cursor-pointer inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 lg:ml-auto"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Exportar Planilha Oficial (CSV)
                </button>
              )}
            </div>

            <div className="text-[11px] text-[var(--text-muted)] flex flex-wrap items-center justify-between gap-2">
              <span>
                Arraste até 100 fotos (.jpg, .jpeg, .png) do diretório de teste ou utilize o botão
                de seleção nativa.
              </span>
              {processandoLote && (
                <span className="font-mono font-semibold text-[var(--semantic-warning-text)] tabular-nums">
                  Extraindo placas OCR e atributos veiculares em paralelo...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. KPIs Analíticos do Lote Processado */}
        {resultadosEtapa3.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <DashboardKpiCard
              label="Volume Classificado"
              value={stats.total}
              secondaryValue="Meta: 100 imgs"
              percentage={stats.pctVolume}
              barColorVar="var(--accent-primary)"
              footerLeft="8 atributos normalizados"
              footerRight={`${stats.pctVolume}% do lote`}
            />

            <DashboardKpiCard
              label="Padrão de Placa (OCR)"
              value={stats.mercosul}
              valueToneClass="text-[var(--semantic-info-text)]"
              secondaryValue={`${stats.pctMercosul}% Mercosul`}
              percentage={stats.pctMercosul}
              barColorVar="var(--semantic-info-text)"
              footerLeft="Tipo MERCOSUL"
              footerRight={`${stats.total - stats.mercosul} outros`}
            />

            <DashboardKpiCard
              label="Ângulo Capturado (Posição)"
              value={
                <span className="font-mono tabular-nums">
                  {stats.dianteira} <span className="text-[var(--text-subtle)] font-normal">/</span>{' '}
                  {stats.traseira}
                </span>
              }
              percentage={stats.pctDianteira}
              segments={[
                {
                  key: 'dianteira',
                  percentage: stats.pctDianteira,
                  colorVar: 'var(--accent-primary)'
                },
                {
                  key: 'traseira',
                  percentage: stats.pctTraseira,
                  colorVar: 'var(--semantic-info-text)'
                }
              ]}
              footerLeft={`Dianteira: ${stats.pctDianteira}%`}
              footerRight={`Traseira: ${stats.pctTraseira}%`}
            />

            <DashboardKpiCard
              label="Originalidade Veicular"
              value={stats.originais}
              valueToneClass="text-[var(--semantic-success-text)]"
              secondaryValue={`${stats.pctOriginais}% íntegras`}
              percentage={stats.pctOriginais}
              barColorVar="var(--semantic-success-text)"
              footerLeft="Classificação ORIGINAL"
              footerRight={`${stats.total - stats.originais} divergência(s)`}
            />
          </div>
        )}

        {/* 3. Tabela Oficial de 8 Colunas + Filtros Facetados */}
        {resultadosEtapa3.length > 0 && (
          <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
            <div className="p-4 bg-[var(--bg-surface-alt)] border-b border-[var(--border-subtle)] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={buscaEtapa3}
                    onChange={(e) => onBuscaEtapa3Change(e.target.value)}
                    placeholder="Filtrar placa, marca, modelo, arquivo..."
                    aria-label="Filtrar resultados da Etapa III"
                    className="w-full pl-9 pr-8 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  {buscaEtapa3 && (
                    <button
                      type="button"
                      onClick={() => onBuscaEtapa3Change('')}
                      aria-label="Limpar busca"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtro por Posição */}
                <div
                  role="group"
                  aria-label="Filtrar por posição"
                  className="inline-flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] shrink-0"
                >
                  {['TODAS', 'DIANTEIRA', 'TRASEIRA'].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setFiltroPosicao(pos)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        filtroPosicao === pos
                          ? 'bg-[var(--accent-primary)] text-[var(--accent-on-primary)] font-semibold'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {pos === 'TODAS' ? 'Todas posições' : pos}
                    </button>
                  ))}
                </div>

                {/* Filtro por Marca */}
                <select
                  aria-label="Filtrar por marca"
                  value={filtroMarca}
                  onChange={(e) => setFiltroMarca(e.target.value)}
                  className="bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  <option value="">Todas as marcas</option>
                  {marcasDisponiveis.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-[var(--text-muted)] font-mono tabular-nums whitespace-nowrap shrink-0">
                Exibindo {linhasExibidas.length} de {resultadosEtapa3.length} registros (Anexo I)
              </div>
            </div>

            <div className="overflow-x-auto max-h-[430px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">1. Arquivo</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">2. Placa</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">3. Marca</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">4. Modelo</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">5. Cor</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">6. Posição</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">7. Tipo</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">8. Originalidade</th>
                    <th className="py-2.5 px-3 font-semibold text-right whitespace-nowrap">
                      Inspeção
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {linhasExibidas.map((r, i) => (
                    <tr
                      key={`${r.Arquivo}-${i}`}
                      onClick={() => setRegistroInspecionado(r)}
                      className="hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                    >
                      <td className="py-2 px-3 font-mono text-[var(--text-secondary)] whitespace-nowrap">
                        {r.Arquivo}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-[var(--semantic-success-text)] tabular-nums whitespace-nowrap">
                        {r.Placa}
                      </td>
                      <td className="py-2 px-3 text-[var(--text-primary)] whitespace-nowrap">
                        {r.Marca}
                      </td>
                      <td className="py-2 px-3 text-[var(--text-primary)] whitespace-nowrap">
                        {r.Modelo}
                      </td>
                      <td className="py-2 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                        {r.Cor}
                      </td>
                      <td className="py-2 px-3 font-mono text-[var(--text-secondary)] whitespace-nowrap">
                        {r['Posição']}
                      </td>
                      <td className="py-2 px-3 font-mono text-[var(--semantic-info-text)] whitespace-nowrap">
                        {r.Tipo}
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-[var(--semantic-success-text)] whitespace-nowrap">
                        {r.Originalidade}
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setRegistroInspecionado(r)
                          }}
                          className="px-2.5 py-1 rounded-md bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-[11px] font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                  {linhasExibidas.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-10 px-4 text-center space-y-3">
                        <div className="text-xs text-[var(--text-muted)]">
                          Nenhuma imagem encontrada para os filtros aplicados.
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={limparFiltros}
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
          </div>
        )}

        {/* 4. Seletor Rápido do Histórico de Lotes da Sessão */}
        {historicoEtapa3.length > 0 && (
          <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[var(--text-primary)]">
                Lotes Registrados na Sessão:
              </span>
              {historicoEtapa3.slice(0, 5).map((h) => {
                const isSelected = ultimaExecEtapa3Info?.id === h.id
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => onSelecionarLoteHistorico?.(h)}
                    className={`px-2.5 py-1 rounded-md border font-mono text-[11px] tabular-nums cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent-text)] font-bold'
                        : 'bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                    }`}
                  >
                    #LOTE-{h.id} · {Number(h.tempoSegundos).toFixed(2)}s (
                    {h.dentroLimite60s ? 'SLA OK' : 'EXCEDIDO'})
                  </button>
                )
              })}
            </div>

            {onIrParaDashboard && (
              <button
                type="button"
                onClick={onIrParaDashboard}
                className="text-xs font-semibold text-[var(--accent-text)] hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                Ver Histórico Completo no Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </section>

      {/* Modal de Inspeção da Imagem Classificada (8 Atributos + Preview Local quando disponível) */}
      {registroInspecionado && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setRegistroInspecionado(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="etapa3-row-modal-title"
            className="w-full max-w-2xl rounded-xl bg-[var(--bg-modal)] border border-[var(--border-strong)] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Camera className="w-4 h-4 text-[var(--semantic-info-text)] shrink-0" />
                <div className="min-w-0">
                  <h3
                    id="etapa3-row-modal-title"
                    className="text-sm font-bold text-[var(--text-primary)] truncate"
                  >
                    Classificação IA · {registroInspecionado.Placa}
                  </h3>
                  <p className="text-xs font-mono text-[var(--text-muted)] truncate">
                    {registroInspecionado.Arquivo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRegistroInspecionado(null)}
                aria-label="Fechar inspeção da imagem"
                className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {previewUrl && (
                <div className="rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] max-h-60 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt={`Imagem enviada ${registroInspecionado.Arquivo}`}
                    className="max-h-60 w-auto object-contain"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: '1. Arquivo', value: registroInspecionado.Arquivo, mono: true },
                  {
                    label: '2. Placa (OCR)',
                    value: registroInspecionado.Placa,
                    mono: true,
                    tone: 'text-[var(--semantic-success-text)] font-bold'
                  },
                  { label: '3. Marca', value: registroInspecionado.Marca },
                  { label: '4. Modelo', value: registroInspecionado.Modelo },
                  { label: '5. Cor', value: registroInspecionado.Cor },
                  { label: '6. Posição', value: registroInspecionado['Posição'], mono: true },
                  {
                    label: '7. Tipo',
                    value: registroInspecionado.Tipo,
                    mono: true,
                    tone: 'text-[var(--semantic-info-text)]'
                  },
                  {
                    label: '8. Originalidade',
                    value: registroInspecionado.Originalidade,
                    mono: true,
                    tone: 'text-[var(--semantic-success-text)] font-bold'
                  }
                ].map((field) => (
                  <div
                    key={field.label}
                    className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] min-w-0"
                  >
                    <div className="text-[11px] text-[var(--text-muted)] truncate">
                      {field.label}
                    </div>
                    <div
                      className={`mt-1 truncate ${field.mono ? 'font-mono tabular-nums' : ''} ${
                        field.tone || 'font-semibold text-[var(--text-primary)]'
                      }`}
                    >
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-[var(--text-muted)]">
                  {previewUrl
                    ? 'Pré-visualização carregada do arquivo local selecionado.'
                    : 'Dados estruturados do lote processado (Anexo I · DETRAN/CE).'}
                </span>
                <button
                  type="button"
                  onClick={() => setRegistroInspecionado(null)}
                  className="px-4 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
