import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { CheckCircle2, Link2, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useToast } from './ToastContext'

const ledgerApi = axios.create({ baseURL: '/api/poc-ce', timeout: 10000 })

async function computeBrowserSha256(input) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const bytes = new TextEncoder().encode(input)
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  return null
}

export default function LiveBlockchainValidation({ auditCount = 0 }) {
  const toast = useToast()
  const [liveEnabled, setLiveEnabled] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [chainReport, setChainReport] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const runVerification = useCallback(
    async (notifyOnComplete = false) => {
      setVerifying(true)
      setErrorMsg('')
      try {
        const res = await ledgerApi.get('/blockchain/validar')
        const data = res.data

        const chronological = [...(data.blocos || [])].sort((a, b) => a.blockIndex - b.blockIndex)
        let expectedPrev = data.genesisHash
        let clientValidCount = 0

        const verifiedBlocks = []
        for (const block of chronological) {
          const computed = await computeBrowserSha256(block.canonicalPayload || '')
          const prevMatches = block.previousHash === expectedPrev
          const hashMatches = computed ? computed === block.hash : Boolean(block.valido)
          const clientValid = prevMatches && hashMatches
          if (clientValid) clientValidCount++
          expectedPrev = block.hash
          verifiedBlocks.push({
            ...block,
            clientSha256: computed || block.hash,
            prevMatches,
            hashMatches,
            clientValid
          })
        }

        const allValid = Boolean(data.integra) && clientValidCount === verifiedBlocks.length
        const report = {
          integra: allValid,
          totalBlocos: verifiedBlocks.length,
          blocosValidados: clientValidCount,
          genesisHash: data.genesisHash,
          ultimoHash: data.ultimoHash,
          verificadoEm: new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          blocos: verifiedBlocks.reverse()
        }
        setChainReport(report)

        if (notifyOnComplete) {
          if (report.integra) {
            toast.success(
              'Blockchain SHA-256 Íntegra',
              `${report.blocosValidados}/${report.totalBlocos} blocos da sessão verificados criptograficamente.`
            )
          } else {
            toast.error(
              'Divergência na Cadeia SHA-256',
              'Foi detectada quebra de encadeamento em um ou mais blocos do ledger.'
            )
          }
        }
      } catch (err) {
        const msg = err.response?.data?.error || err.message || 'Erro ao validar ledger SHA-256.'
        setErrorMsg(msg)
        if (notifyOnComplete) {
          toast.error('Falha na Validação Blockchain', msg)
        }
      } finally {
        setVerifying(false)
      }
    },
    [toast]
  )

  useEffect(() => {
    if (!liveEnabled) return
    runVerification(false)
    const timer = setInterval(() => runVerification(false), 5000)
    return () => clearInterval(timer)
  }, [liveEnabled, auditCount, runVerification])

  function handleToggle() {
    const next = !liveEnabled
    setLiveEnabled(next)
    if (next) {
      runVerification(true)
    }
  }

  return (
    <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck
              className={`w-4 h-4 ${
                liveEnabled
                  ? chainReport?.integra === false
                    ? 'text-[var(--semantic-danger-text)]'
                    : 'text-[var(--semantic-success-text)]'
                  : 'text-[var(--text-muted)]'
              }`}
            />
            <h2 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
              Live Blockchain Validation (VD-06 · Cadeia SHA-256)
            </h2>
            {liveEnabled && chainReport && (
              <span
                className={`font-mono text-[11px] font-semibold ${
                  chainReport.integra
                    ? 'text-[var(--semantic-success-text)]'
                    : 'text-[var(--semantic-danger-text)]'
                }`}
              >
                · {chainReport.integra ? 'ÍNTEGRA' : 'DIVERGÊNCIA'} ({chainReport.blocosValidados}/
                {chainReport.totalBlocos})
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Ative para recalcular e auditar em tempo real o encadeamento SHA-256 de todos os registros do ledger desta sessão.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {liveEnabled && (
            <button
              type="button"
              onClick={() => runVerification(true)}
              disabled={verifying}
              className="px-3 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-medium text-[var(--btn-secondary-text)] flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
              Revalidar Agora
            </button>
          )}

          <button
            type="button"
            role="switch"
            aria-checked={liveEnabled}
            onClick={handleToggle}
            className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              liveEnabled
                ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent-text)]'
                : 'bg-[var(--bg-surface-alt)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>Live Blockchain Validation</span>
            <span
              aria-hidden="true"
              className={`w-8 h-4.5 rounded-full p-0.5 transition-colors flex items-center ${
                liveEnabled ? 'bg-[var(--accent-primary)] justify-end' : 'bg-[var(--border-strong)] justify-start'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
            </span>
          </button>
        </div>
      </div>

      {liveEnabled && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-[var(--semantic-danger-bg)] border border-[var(--semantic-danger-border)] text-[var(--semantic-danger-text)] text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {chainReport && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="text-[11px] text-[var(--text-muted)]">Status da Cadeia</div>
                  <div
                    className={`mt-1 font-bold flex items-center gap-1.5 ${
                      chainReport.integra
                        ? 'text-[var(--semantic-success-text)]'
                        : 'text-[var(--semantic-danger-text)]'
                    }`}
                  >
                    {chainReport.integra ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                    )}
                    <span>{chainReport.integra ? 'SHA-256 VERIFICADA' : 'FALHA DE INTEGRIDADE'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="text-[11px] text-[var(--text-muted)]">Blocos Auditados</div>
                  <div className="mt-1 font-mono font-bold text-[var(--text-primary)] tabular-nums">
                    {chainReport.blocosValidados} / {chainReport.totalBlocos} válidos
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="text-[11px] text-[var(--text-muted)]">Head Hash (Último Bloco)</div>
                  <div
                    className="mt-1 font-mono text-[var(--semantic-success-text)] truncate tabular-nums"
                    title={chainReport.ultimoHash}
                  >
                    {chainReport.ultimoHash}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="text-[11px] text-[var(--text-muted)]">Última Verificação</div>
                  <div className="mt-1 font-mono text-[var(--text-secondary)] tabular-nums">
                    {chainReport.verificadoEm} · WebCrypto + Node
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto max-h-64 overflow-y-auto border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] sticky top-0">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Bloco</th>
                      <th className="py-2 px-3 font-semibold">Operação</th>
                      <th className="py-2 px-3 font-semibold">Hash Anterior</th>
                      <th className="py-2 px-3 font-semibold">SHA-256 Calculado</th>
                      <th className="py-2 px-3 font-semibold text-right">Verificação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] font-mono tabular-nums">
                    {chainReport.blocos.map((b) => (
                      <tr key={b.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                        <td className="py-2 px-3 text-[var(--semantic-info-text)] font-bold whitespace-nowrap">
                          #{b.blockIndex}
                        </td>
                        <td className="py-2 px-3 font-sans text-[var(--text-primary)] max-w-xs truncate">
                          {b.operacao}
                        </td>
                        <td className="py-2 px-3 text-[var(--text-muted)] whitespace-nowrap" title={b.previousHash}>
                          <span className="inline-flex items-center gap-1">
                            <Link2 className="w-3 h-3 text-[var(--text-subtle)]" />
                            {b.previousHash.slice(0, 12)}...
                          </span>
                        </td>
                        <td
                          className="py-2 px-3 text-[var(--semantic-success-text)] whitespace-nowrap"
                          title={b.clientSha256}
                        >
                          {b.clientSha256.slice(0, 16)}...
                        </td>
                        <td className="py-2 px-3 text-right whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              b.clientValid
                                ? 'text-[var(--semantic-success-text)]'
                                : 'text-[var(--semantic-danger-text)]'
                            }`}
                          >
                            {b.clientValid ? 'VÁLIDO' : 'INVÁLIDO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
