import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import {
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Link2,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  X
} from 'lucide-react'
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

function formatPayloadJson(raw) {
  if (!raw) return '{}'
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return String(raw)
  }
}

export default function LiveBlockchainValidation({
  auditCount = 0,
  blockchainSummary = null,
  rightCard = null
}) {
  const toast = useToast()
  const [liveEnabled, setLiveEnabled] = useState(false)
  const [chainExpanded, setChainExpanded] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [chainReport, setChainReport] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [copiedKey, setCopiedKey] = useState('')

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
          if (clientValid) clientValidCount += 1
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
          blocosChrono: verifiedBlocks,
          blocos: [...verifiedBlocks].reverse()
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

  useEffect(() => {
    if (!selectedBlock) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setSelectedBlock(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedBlock])

  function handleToggle() {
    const next = !liveEnabled
    setLiveEnabled(next)
    if (next) {
      setChainExpanded(true)
      runVerification(true)
    }
  }

  function handleInspectChain() {
    const next = !chainExpanded
    setChainExpanded(next)
    if (next && (!chainReport || chainReport.totalBlocos !== auditCount)) {
      runVerification(false)
    }
  }

  async function copyText(key, value) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 1800)
    } catch {
      // Ignore clipboard failures
    }
  }

  const activeIntegra = chainReport ? chainReport.integra : blockchainSummary?.integra !== false
  const headHashDisplay = chainReport?.ultimoHash || blockchainSummary?.ultimoHash || '0'.repeat(64)
  const totalDisplay = chainReport?.totalBlocos ?? blockchainSummary?.totalBlocos ?? auditCount

  return (
    <div className="space-y-4">
      {/* Faixa de Governança Criptográfica: VD-06 Blockchain + AC-02 PAdES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div
          className={`${
            rightCard ? 'lg:col-span-7' : 'lg:col-span-12'
          } rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 flex flex-col justify-between gap-4`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <ShieldCheck
                  className={`w-4 h-4 shrink-0 ${
                    activeIntegra
                      ? 'text-[var(--semantic-success-text)]'
                      : 'text-[var(--semantic-danger-text)]'
                  }`}
                />
                <h2 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
                  Validação Blockchain SHA-256 (VD-06)
                </h2>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Auditoria criptográfica em tempo real do encadeamento Genesis → Head via WebCrypto API e servidor.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={liveEnabled}
              onClick={handleToggle}
              className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                liveEnabled
                  ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent-text)]'
                  : 'bg-[var(--bg-surface-alt)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>Live Blockchain Validation</span>
              <span
                aria-hidden="true"
                className={`w-8 h-4.5 rounded-full p-0.5 transition-colors flex items-center ${
                  liveEnabled
                    ? 'bg-[var(--accent-primary)] justify-end'
                    : 'bg-[var(--border-strong)] justify-start'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
              </span>
            </button>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs min-w-0">
              <span
                className={`font-mono font-bold tabular-nums inline-flex items-center gap-1.5 ${
                  activeIntegra
                    ? 'text-[var(--semantic-success-text)]'
                    : 'text-[var(--semantic-danger-text)]'
                }`}
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                {chainReport
                  ? `${chainReport.integra ? 'VERIFICADA' : 'DIVERGÊNCIA'} (${chainReport.blocosValidados}/${chainReport.totalBlocos})`
                  : `${activeIntegra ? 'ÍNTEGRA' : 'ALERTA'} · ${totalDisplay} blocos`}
              </span>
              <span className="text-[var(--text-subtle)]" aria-hidden="true">
                ·
              </span>
              <button
                type="button"
                onClick={() => copyText('head-hash', headHashDisplay)}
                title={`Copiar Head Hash: ${headHashDisplay}`}
                className="font-mono text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1.5 cursor-pointer tabular-nums"
              >
                <span>Head: {headHashDisplay.slice(0, 14)}...</span>
                {copiedKey === 'head-hash' ? (
                  <Check className="w-3 h-3 text-[var(--semantic-success-text)]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInspectChain}
                className="px-3 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                {chainExpanded ? 'Ocultar Cadeia' : 'Inspecionar Cadeia'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setChainExpanded(true)
                  runVerification(true)
                }}
                disabled={verifying}
                className="px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-xs font-bold text-[var(--accent-on-primary)] inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                Revalidar Agora
              </button>
            </div>
          </div>
        </div>

        {rightCard && <div className="lg:col-span-5 flex">{rightCard}</div>}
      </div>

      {/* Explorador Interativo da Cadeia SHA-256 (Largura Total) */}
      {(liveEnabled || chainExpanded) && (
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-5 py-3.5 bg-[var(--bg-surface-alt)] border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-[var(--text-primary)]">
                Cadeia Criptográfica Verificada (WebCrypto + Servidor)
              </span>
              {chainReport && (
                <span className="text-[var(--text-muted)] font-mono tabular-nums">
                  · Verificado às {chainReport.verificadoEm} · {chainReport.blocosValidados}/
                  {chainReport.totalBlocos} blocos íntegros
                </span>
              )}
            </div>
            {liveEnabled && (
              <span className="text-[11px] font-mono text-[var(--semantic-success-text)] font-semibold">
                Monitoramento contínuo ativo (5s)
              </span>
            )}
          </div>

          <div className="p-5 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-[var(--semantic-danger-bg)] border border-[var(--semantic-danger-border)] text-[var(--semantic-danger-text)] text-xs font-mono">
                {errorMsg}
              </div>
            )}

            {verifying && !chainReport && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className="h-16 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] animate-pulse"
                  />
                ))}
              </div>
            )}

            {chainReport && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
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

                  <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
                    <div className="text-[11px] text-[var(--text-muted)]">Blocos Auditados</div>
                    <div className="mt-1 font-mono font-bold text-[var(--text-primary)] tabular-nums">
                      {chainReport.blocosValidados} / {chainReport.totalBlocos} válidos
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
                    <div className="text-[11px] text-[var(--text-muted)]">Bloco Gênesis</div>
                    <div
                      className="mt-1 font-mono text-[var(--text-secondary)] truncate tabular-nums"
                      title={chainReport.genesisHash}
                    >
                      {chainReport.genesisHash}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
                    <div className="text-[11px] text-[var(--text-muted)]">Head Hash (Último Bloco)</div>
                    <div
                      className="mt-1 font-mono text-[var(--semantic-success-text)] truncate tabular-nums"
                      title={chainReport.ultimoHash}
                    >
                      {chainReport.ultimoHash}
                    </div>
                  </div>
                </div>

                {/* Trilha Visual Interativa dos Blocos */}
                {chainReport.blocosChrono.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span>Encadeamento Cronológico (clique em um bloco para auditar o SHA-256)</span>
                      <span className="font-mono tabular-nums">
                        {chainReport.blocosChrono.length} blocos encadeados
                      </span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      <div className="px-3 py-2 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)] shrink-0">
                        GENESIS · 0000...0000
                      </div>
                      {chainReport.blocosChrono.map((b) => (
                        <React.Fragment key={b.id}>
                          <Link2 className="w-3.5 h-3.5 text-[var(--text-subtle)] shrink-0" />
                          <button
                            type="button"
                            onClick={() => setSelectedBlock(b)}
                            className={`px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer shrink-0 min-w-[168px] ${
                              b.clientValid
                                ? 'bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-surface-hover)] border-[var(--border-subtle)]'
                                : 'bg-[var(--semantic-danger-bg)] border-[var(--semantic-danger-border)]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                              <span className="font-bold text-[var(--semantic-info-text)]">
                                Bloco #{b.blockIndex}
                              </span>
                              <span
                                className={`font-semibold ${
                                  b.clientValid
                                    ? 'text-[var(--semantic-success-text)]'
                                    : 'text-[var(--semantic-danger-text)]'
                                }`}
                              >
                                {b.clientValid ? 'OK' : 'INVÁLIDO'}
                              </span>
                            </div>
                            <div className="text-[11px] font-medium text-[var(--text-primary)] truncate max-w-[180px] mt-0.5">
                              {b.operacao}
                            </div>
                            <div className="text-[10px] font-mono text-[var(--text-muted)] truncate mt-0.5 tabular-nums">
                              {b.clientSha256.slice(0, 14)}...
                            </div>
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tabela Completa de Verificação Bloco a Bloco */}
                <div className="overflow-x-auto max-h-60 overflow-y-auto border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Bloco</th>
                        <th className="py-2.5 px-3 font-semibold">Operação</th>
                        <th className="py-2.5 px-3 font-semibold">Hash Anterior</th>
                        <th className="py-2.5 px-3 font-semibold">SHA-256 Calculado</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Verificação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] font-mono tabular-nums">
                      {chainReport.blocos.map((b) => (
                        <tr
                          key={b.id}
                          onClick={() => setSelectedBlock(b)}
                          className="hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                        >
                          <td className="py-2 px-3 text-[var(--semantic-info-text)] font-bold whitespace-nowrap">
                            #{b.blockIndex}
                          </td>
                          <td className="py-2 px-3 font-sans text-[var(--text-primary)] max-w-xs truncate">
                            {b.operacao}
                          </td>
                          <td className="py-2 px-3 text-[var(--text-muted)] whitespace-nowrap" title={b.previousHash}>
                            {b.previousHash.slice(0, 12)}...
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
        </div>
      )}

      {/* Modal de Inspeção Criptográfica do Bloco */}
      {selectedBlock && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedBlock(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="block-modal-title"
            className="w-full max-w-2xl rounded-xl bg-[var(--bg-modal)] border border-[var(--border-strong)] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] flex items-center justify-between gap-3">
              <div>
                <h3 id="block-modal-title" className="text-sm font-bold text-[var(--text-primary)]">
                  Auditoria Criptográfica · Bloco #{selectedBlock.blockIndex}
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                  {selectedBlock.origem} · {selectedBlock.operacao}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBlock(null)}
                aria-label="Fechar modal"
                className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
                  <div className="text-[11px] text-[var(--text-muted)]">Vínculo Hash Anterior</div>
                  <div
                    className={`mt-1 font-bold ${
                      selectedBlock.prevMatches
                        ? 'text-[var(--semantic-success-text)]'
                        : 'text-[var(--semantic-danger-text)]'
                    }`}
                  >
                    {selectedBlock.prevMatches ? 'ENCADEAMENTO OK' : 'QUEBRA DE CADEIA'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
                  <div className="text-[11px] text-[var(--text-muted)]">Conferência WebCrypto</div>
                  <div
                    className={`mt-1 font-bold ${
                      selectedBlock.hashMatches
                        ? 'text-[var(--semantic-success-text)]'
                        : 'text-[var(--semantic-danger-text)]'
                    }`}
                  >
                    {selectedBlock.hashMatches ? 'HASH IDÊNTICO' : 'DIVERGENTE'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
                  <div className="text-[11px] text-[var(--text-muted)]">Timestamp Registro</div>
                  <div className="mt-1 font-mono tabular-nums text-[var(--text-primary)]">
                    {new Date(selectedBlock.criado_em).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                      Previous Hash (Bloco #{selectedBlock.blockIndex - 1})
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText('prev-hash', selectedBlock.previousHash)}
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'prev-hash' ? (
                        <Check className="w-3 h-3 text-[var(--semantic-success-text)]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      Copiar
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-secondary)] break-all">
                    {selectedBlock.previousHash}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                      SHA-256 Calculado (Servidor &amp; WebCrypto)
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText('block-hash', selectedBlock.clientSha256)}
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'block-hash' ? (
                        <Check className="w-3 h-3 text-[var(--semantic-success-text)]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      Copiar
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-[var(--semantic-success-text)] break-all">
                    {selectedBlock.clientSha256}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">
                    Payload Canônico Auditado (JSON)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyText('payload-json', formatPayloadJson(selectedBlock.canonicalPayload))
                    }
                    className="px-2.5 py-1 rounded-md bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-[11px] font-medium text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'payload-json' ? (
                      <Check className="w-3 h-3 text-[var(--semantic-success-text)]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copiedKey === 'payload-json' ? 'Copiado' : 'Copiar JSON'}
                  </button>
                </div>
                <pre className="p-3.5 rounded-lg bg-[var(--bg-console)] border border-[var(--border-subtle)] text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {formatPayloadJson(selectedBlock.canonicalPayload)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
