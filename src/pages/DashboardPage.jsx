import React from 'react'
import { Download, Lock, RefreshCw } from 'lucide-react'
import LiveBlockchainValidation from '../LiveBlockchainValidation'

export default function DashboardPage({
  dashboard,
  auditoria,
  filtroOrigem,
  onFiltroOrigemChange,
  onCarregarAuditoria,
  onBaixarPdfPades,
  historicoEtapa3,
  onAtualizarTudo
}) {
  return (
    <section className="space-y-6">
      {/* KPIs Executivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 space-y-1">
          <div className="text-xs font-medium text-[var(--text-muted)]">Total de Processos</div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] font-mono tabular-nums">
            {dashboard.resumo?.total || 0}
          </div>
          <div className="text-xs text-[var(--text-muted)] pt-1 font-mono tabular-nums">
            Transf: {dashboard.resumo?.total_transferencias || 0} · 1º Reg:{' '}
            {dashboard.resumo?.total_primeiro_registro || 0}
          </div>
        </div>

        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 space-y-1">
          <div className="text-xs font-medium text-[var(--text-muted)]">Aprovados / Concluídos</div>
          <div className="text-3xl font-extrabold text-[var(--semantic-success-text)] font-mono tabular-nums">
            {dashboard.resumo?.aprovados || 0}
          </div>
          <div className="text-xs text-[var(--text-muted)] pt-1 font-mono tabular-nums">
            Score médio IA: {dashboard.resumo?.score_medio || '—'}
          </div>
        </div>

        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 space-y-1">
          <div className="text-xs font-medium text-[var(--text-muted)]">Mesa Revisora / Reprovados</div>
          <div className="text-3xl font-extrabold text-[var(--semantic-warning-text)] font-mono tabular-nums">
            {dashboard.resumo?.em_mesa_revisora || 0}{' '}
            <span className="text-[var(--text-subtle)] font-normal">/</span>{' '}
            <span className="text-[var(--semantic-danger-text)]">
              {dashboard.resumo?.reprovados || 0}
            </span>
          </div>
          <div className="text-xs text-[var(--text-muted)] pt-1 font-mono tabular-nums">
            Notificações enviadas: {dashboard.notificacoesEnviadas || 0}
          </div>
        </div>

        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 space-y-1">
          <div className="text-xs font-medium text-[var(--text-muted)]">Integridade Blockchain (VD-06)</div>
          <div
            className={`text-xl font-bold pt-1 flex items-center gap-2 ${
              dashboard.blockchain?.integra !== false
                ? 'text-[var(--semantic-success-text)]'
                : 'text-[var(--semantic-danger-text)]'
            }`}
          >
            <Lock className="w-5 h-5 shrink-0" />
            <span>{dashboard.blockchain?.integra !== false ? 'ÍNTEGRA (SHA-256)' : 'ALERTA'}</span>
          </div>
          <div className="text-xs text-[var(--text-muted)] pt-1 font-mono tabular-nums">
            Blocos encadeados: {dashboard.blockchain?.totalBlocos || 0}
          </div>
        </div>
      </div>

      {/* Toggle de Validação Criptográfica em Tempo Real (SHA-256) */}
      <LiveBlockchainValidation auditCount={auditoria.length} />

      {/* Card Assinatura Institucional PAdES */}
      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
            Assinatura Institucional PAdES (AC-02 · e-CNPJ NECAVA)
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Gera documento PDF assinado com SubFilter{' '}
            <code className="font-mono text-[var(--semantic-info-text)]">ETSI.CAdES.detached</code>, hash SHA-256 e
            validação compatível com Adobe Reader e Verificador ITI.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onBaixarPdfPades(null)}
          className="px-4 py-2.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-xs font-bold text-[var(--accent-on-primary)] flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" /> Gerar e Baixar PDF PAdES
        </button>
      </div>

      {/* Trilha de Auditoria Segregada VD-07 */}
      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
              Trilha de Auditoria Segregada (VD-07 · Item 2.1.11)
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Registro cronológico segregado por origem operacional (BalcãoWS, Biometria, IA e Mesa).
            </p>
          </div>
          <select
            aria-label="Filtrar auditoria por origem"
            value={filtroOrigem}
            onChange={(e) => {
              onFiltroOrigemChange(e.target.value)
              onCarregarAuditoria(e.target.value)
            }}
            className="bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          >
            <option value="">Todas as origens</option>
            <option value="BALCAOWS_DETRAN_CE">BALCAOWS_DETRAN_CE</option>
            <option value="EXTERNO_BIOMETRIA">EXTERNO_BIOMETRIA</option>
            <option value="EXTERNO_VALIDACAO_DOC">EXTERNO_VALIDACAO_DOC</option>
            <option value="MESA_REVISORA">MESA_REVISORA</option>
            <option value="ANTIFRAUDE_ETAPA_II">ANTIFRAUDE_ETAPA_II</option>
          </select>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] sticky top-0">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Data/Hora</th>
                <th className="py-2.5 px-4 font-semibold">Origem</th>
                <th className="py-2.5 px-4 font-semibold">Operação</th>
                <th className="py-2.5 px-4 font-semibold">Endpoint</th>
                <th className="py-2.5 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {auditoria.map((a) => (
                <tr key={a.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                  <td className="py-2.5 px-4 font-mono text-[var(--text-muted)] tabular-nums whitespace-nowrap">
                    {new Date(a.criado_em).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[var(--semantic-success-text)] whitespace-nowrap">
                    {a.origem}
                  </td>
                  <td className="py-2.5 px-4 text-[var(--text-primary)]">{a.operacao}</td>
                  <td className="py-2.5 px-4 font-mono text-[var(--text-muted)]">
                    {a.endpoint || '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap font-mono">
                    <span
                      className={
                        a.sucesso
                          ? 'text-[var(--semantic-success-text)] font-semibold'
                          : 'text-[var(--semantic-danger-text)] font-semibold'
                      }
                    >
                      {a.sucesso ? 'OK' : 'BLOQUEADO'}
                    </span>
                    {a.modo_simulado && (
                      <span className="ml-1.5 text-[var(--semantic-warning-text)]">(SIM)</span>
                    )}
                  </td>
                </tr>
              ))}
              {auditoria.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                    Nenhum evento encontrado para o filtro selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histórico de Lotes da Etapa III */}
      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
              Histórico de Lotes da Etapa III (IA · Anexo I)
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Execuções em lote de 100 imagens com validação de SLA (≤ 60s) e download CSV UTF-8 BOM.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAtualizarTudo(true)}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar Logs
          </button>
        </div>

        {historicoEtapa3.length === 0 ? (
          <div className="p-6 text-xs text-[var(--text-muted)]">
            Nenhum lote processado registrado no histórico até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] sticky top-0">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Lote</th>
                  <th className="py-2.5 px-4 font-semibold">Data/Hora</th>
                  <th className="py-2.5 px-4 font-semibold">Volume</th>
                  <th className="py-2.5 px-4 font-semibold">Tempo</th>
                  <th className="py-2.5 px-4 font-semibold">Critério ≤ 60s</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Exportação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-mono tabular-nums">
                {historicoEtapa3.map((h) => (
                  <tr key={h.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                    <td className="py-2.5 px-4 font-bold text-[var(--semantic-info-text)]">
                      #LOTE-{h.id}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--text-secondary)] font-sans">
                      {new Date(h.criadoEm).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--text-primary)]">
                      {h.totalImagens} imagens
                    </td>
                    <td className="py-2.5 px-4 text-[var(--semantic-success-text)] font-bold">
                      {Number(h.tempoSegundos).toFixed(2)}s
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[11px] font-semibold ${
                          h.dentroLimite60s
                            ? 'text-[var(--semantic-success-text)]'
                            : 'text-[var(--semantic-danger-text)]'
                        }`}
                      >
                        {h.dentroLimite60s ? 'CONFORME (≤ 60s)' : 'EXCEDIDO'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-sans">
                      <a
                        href={h.downloadUrl}
                        download={`resultado_etapa3_lote_${h.id}.csv`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" /> Baixar Planilha CSV
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
