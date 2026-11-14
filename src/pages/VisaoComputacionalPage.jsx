import React from 'react'
import { CheckCircle2, Cpu, Download, Search, Upload } from 'lucide-react'

export default function VisaoComputacionalPage({
  cronometro,
  ultimaExecEtapa3Info,
  resultadosEtapa3,
  resultadosEtapa3Filtrados,
  arquivosEtapa3,
  onSelecionarArquivos,
  processandoLote,
  onProcessarLote,
  onRodarTreino100Fotos,
  csvEtapa3,
  onBaixarCsvEtapa3,
  buscaEtapa3,
  onBuscaEtapa3Change
}) {
  return (
    <section className="space-y-5">
      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-5">
        {/* Cabeçalho + Cronômetro Proeminente */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
          <div className="space-y-1">
            <div className="text-xs font-mono text-[var(--semantic-info-text)]">
              Anexo I · Motor de Visão Computacional &amp; OCR Veicular
            </div>
            <h2 className="font-bold text-lg text-[var(--text-primary)]">
              Etapa III — Processamento em Lote (100 Imagens em ≤ 60s)
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Selecione as 100 fotos (.jpg, .jpeg, .png) para classificação simultânea e
              exportação oficial em CSV UTF-8 com BOM.
            </p>
          </div>

          {/* Cronômetro Bruto */}
          <div className="px-5 py-3 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-right shrink-0">
            <div className="text-[11px] text-[var(--text-muted)] font-medium">
              Tempo Bruto de Execução
            </div>
            <div
              className={`text-2xl sm:text-3xl font-mono font-bold tabular-nums ${
                cronometro <= 60
                  ? 'text-[var(--semantic-success-text)]'
                  : 'text-[var(--semantic-danger-text)]'
              }`}
            >
              {cronometro.toFixed(2)}s{' '}
              <span className="text-[var(--text-muted)] text-base font-normal">/ 60.00s</span>
            </div>
          </div>
        </div>

        {/* Banner de Preservação de Estado */}
        {ultimaExecEtapa3Info && resultadosEtapa3.length > 0 && (
          <div className="p-3.5 rounded-lg bg-[var(--semantic-success-bg)] border border-[var(--semantic-success-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--semantic-success-text)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Estado preservado em banco:{' '}
                <strong className="font-mono tabular-nums">{resultadosEtapa3.length} imagens</strong>{' '}
                processadas em{' '}
                <strong className="font-mono tabular-nums">{cronometro.toFixed(2)}s</strong> (
                {new Date(ultimaExecEtapa3Info.criadoEm).toLocaleString('pt-BR')})
              </span>
            </div>
            <span className="font-mono text-[11px] whitespace-nowrap">
              Auditado · Pronto para CSV
            </span>
          </div>
        )}

        {/* Controles de Upload e Ação */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="px-4 py-2.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] flex items-center gap-2 cursor-pointer transition-colors">
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

          <button
            type="button"
            onClick={onProcessarLote}
            disabled={processandoLote || !arquivosEtapa3.length}
            className="px-5 py-2.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 text-xs font-bold text-[var(--accent-on-primary)] cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap"
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
            className="px-4 py-2.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] disabled:opacity-50 border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] cursor-pointer transition-colors whitespace-nowrap"
          >
            Executar Lote Referência (100 Imagens)
          </button>

          {(csvEtapa3 || resultadosEtapa3.length > 0) && (
            <button
              type="button"
              onClick={onBaixarCsvEtapa3}
              className="px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold cursor-pointer flex items-center gap-2 text-white transition-colors whitespace-nowrap ml-auto"
            >
              <Download className="w-4 h-4" /> Exportar Planilha Oficial (CSV)
            </button>
          )}
        </div>

        {/* Barra de Busca + Tabela de 8 Colunas */}
        {resultadosEtapa3.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
                Exibindo {resultadosEtapa3Filtrados.length} de {resultadosEtapa3.length} registros (Anexo I)
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={buscaEtapa3}
                  onChange={(e) => onBuscaEtapa3Change(e.target.value)}
                  placeholder="Filtrar placa, marca, modelo..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[420px] overflow-y-auto border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Arquivo</th>
                    <th className="py-2.5 px-3 font-semibold">Placa</th>
                    <th className="py-2.5 px-3 font-semibold">Marca</th>
                    <th className="py-2.5 px-3 font-semibold">Modelo</th>
                    <th className="py-2.5 px-3 font-semibold">Cor</th>
                    <th className="py-2.5 px-3 font-semibold">Posição</th>
                    <th className="py-2.5 px-3 font-semibold">Tipo</th>
                    <th className="py-2.5 px-3 font-semibold">Originalidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {resultadosEtapa3Filtrados.map((r, i) => (
                    <tr key={i} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                      <td className="py-2 px-3 font-mono text-[var(--text-secondary)]">{r.Arquivo}</td>
                      <td className="py-2 px-3 font-mono font-bold text-[var(--semantic-success-text)]">
                        {r.Placa}
                      </td>
                      <td className="py-2 px-3 text-[var(--text-primary)]">{r.Marca}</td>
                      <td className="py-2 px-3 text-[var(--text-primary)]">{r.Modelo}</td>
                      <td className="py-2 px-3 text-[var(--text-secondary)]">{r.Cor}</td>
                      <td className="py-2 px-3 text-[var(--text-secondary)]">{r['Posição']}</td>
                      <td className="py-2 px-3 text-[var(--text-secondary)]">{r.Tipo}</td>
                      <td className="py-2 px-3 text-[var(--semantic-success-text)] font-medium">
                        {r.Originalidade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
