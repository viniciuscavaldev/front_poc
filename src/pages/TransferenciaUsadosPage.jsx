import React from 'react'
import { ArrowLeftRight, Download, FileText, MapPin, UserCheck } from 'lucide-react'

export default function TransferenciaUsadosPage({
  novoProc,
  onNovoProcChange,
  onCriarProcesso,
  msgProc,
  processosTrf,
  processoAtual,
  onSelecionarProcesso,
  geo,
  onCapturarGeo,
  onAvancarProcesso,
  onBaixarPdfPades,
  onIrParaMesa
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Coluna Esquerda: Formulário Nova Transferência */}
      <div className="lg:col-span-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 space-y-4 h-fit">
        <div className="border-b border-[var(--border-subtle)] pb-3">
          <div className="text-[11px] font-mono text-[var(--semantic-info-text)] mb-0.5">
            Seção 3.1 do Manual DETRAN-CE
          </div>
          <h2 className="font-bold text-base text-[var(--text-primary)]">
            Nova Transferência de Usado
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Rito operacional de 13 etapas com ATPV-e digital, biometria e laudo ECV.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[var(--text-secondary)] mb-1 font-medium">
              Modalidade Vendedor → Comprador
            </label>
            <select
              value={novoProc.natureza}
              onChange={(e) => onNovoProcChange({ ...novoProc, natureza: e.target.value })}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-[var(--text-primary)]"
            >
              <option value="PF_PF">Pessoa Física → Pessoa Física (PF → PF)</option>
              <option value="PF_PJ">Pessoa Física → Pessoa Jurídica (PF → PJ)</option>
              <option value="PJ_PF">Pessoa Jurídica → Pessoa Física (PJ → PF)</option>
              <option value="PJ_PJ">Pessoa Jurídica → Pessoa Jurídica (PJ → PJ)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-medium">
                Placa Mercosul
              </label>
              <input
                value={novoProc.placa}
                placeholder="POA8B20"
                onChange={(e) =>
                  onNovoProcChange({ ...novoProc, placa: e.target.value.toUpperCase() })
                }
                className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 uppercase text-[var(--text-primary)] font-mono"
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-medium">
                Score IA (%)
              </label>
              <input
                type="number"
                value={novoProc.score_ia}
                onChange={(e) => onNovoProcChange({ ...novoProc, score_ia: Number(e.target.value) })}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-[var(--text-primary)] font-mono tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] mb-1 font-medium">
              Chassi do Veículo
            </label>
            <input
              value={novoProc.chassi}
              placeholder="9BWAA05U4BP012345"
              onChange={(e) =>
                onNovoProcChange({ ...novoProc, chassi: e.target.value.toUpperCase() })
              }
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 uppercase text-[var(--text-primary)] font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-medium">
                CPF/CNPJ Vendedor
              </label>
              <input
                value={novoProc.cpf_cnpj_vendedor}
                onChange={(e) =>
                  onNovoProcChange({
                    ...novoProc,
                    cpf_cnpj_vendedor: e.target.value.replace(/\D/g, '')
                  })
                }
                className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-[var(--text-primary)] font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-medium">
                CPF/CNPJ Comprador
              </label>
              <input
                value={novoProc.cpf_cnpj_comprador}
                onChange={(e) =>
                  onNovoProcChange({
                    ...novoProc,
                    cpf_cnpj_comprador: e.target.value.replace(/\D/g, '')
                  })
                }
                className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-[var(--text-primary)] font-mono tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] mb-1 font-medium">
              ID Laudo de Vistoria (ECV Credenciada)
            </label>
            <input
              value={novoProc.laudo_vistoria_id}
              onChange={(e) =>
                onNovoProcChange({ ...novoProc, laudo_vistoria_id: e.target.value.toUpperCase() })
              }
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-[var(--text-primary)] font-mono"
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-1 text-[var(--text-secondary)]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={novoProc.crv_antigo}
                onChange={(e) => onNovoProcChange({ ...novoProc, crv_antigo: e.target.checked })}
                className="rounded border-[var(--border-strong)]"
              />
              CRV Antigo (Papel)
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={novoProc.possui_procuracao}
                onChange={(e) =>
                  onNovoProcChange({ ...novoProc, possui_procuracao: e.target.checked })
                }
                className="rounded border-[var(--border-strong)]"
              />
              Procuração / Contrato
            </label>
          </div>

          <button
            type="button"
            onClick={onCriarProcesso}
            className="w-full py-2.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] font-bold text-[var(--accent-on-primary)] text-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Iniciar Rito de Transferência (13 Etapas)
          </button>

          {msgProc && (
            <p className="text-xs p-2.5 rounded-lg bg-[var(--semantic-warning-bg)] border border-[var(--semantic-warning-border)] text-[var(--semantic-warning-text)]">
              {msgProc}
            </p>
          )}
        </div>
      </div>

      {/* Coluna Direita: Lista e Detalhes do Processo */}
      <div className="lg:col-span-8 space-y-5">
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h2 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--semantic-success-text)]" />
              Processos de Transferência Registrados (Seção 3.1)
            </h2>
            <span className="text-xs font-mono text-[var(--text-muted)] tabular-nums">
              Total: {processosTrf.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {processosTrf.map((p) => {
              const isSel = processoAtual?.id === p.id
              const statusTextClass =
                p.status === 'CONCLUIDO'
                  ? 'text-[var(--semantic-success-text)]'
                  : p.status === 'REPROVADO'
                  ? 'text-[var(--semantic-danger-text)]'
                  : p.status === 'EM_REVISAO_MANUAL'
                  ? 'text-[var(--semantic-warning-text)]'
                  : 'text-[var(--semantic-info-text)]'

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelecionarProcesso(p)}
                  className={`p-3 rounded-xl border text-left text-xs cursor-pointer transition-colors ${
                    isSel
                      ? 'border-[var(--accent-border)] bg-[var(--bg-surface-alt)] ring-1 ring-[var(--accent-border)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono font-bold text-[var(--text-primary)] truncate">
                      {p.protocolo}
                    </span>
                    <span className={`font-mono font-bold tabular-nums ${statusTextClass}`}>
                      {p.status === 'CONCLUIDO' ? '13/13' : `${p.etapa_atual}/13`}
                    </span>
                  </div>
                  <div className="text-[var(--text-secondary)] font-semibold">
                    {p.placa} · {p.natureza?.replace('_', ' → ')}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
                    {p.status === 'EM_REVISAO_MANUAL' ? 'Mesa Revisora' : p.status}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {processoAtual && (
          <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--semantic-success-text)]">
                    {processoAtual.protocolo}
                  </span>
                  <span className="text-[var(--text-subtle)]" aria-hidden="true">·</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    Transferência ({processoAtual.natureza?.replace('_', ' → ')})
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                  Placa: <strong className="text-[var(--text-primary)]">{processoAtual.placa}</strong> · Chassi:{' '}
                  <span className="text-[var(--text-secondary)]">{processoAtual.chassi}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={onCapturarGeo}
                className="px-3 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-xs text-[var(--btn-secondary-text)] flex items-center gap-1.5 cursor-pointer border border-[var(--btn-secondary-border)] self-start sm:self-auto whitespace-nowrap"
              >
                <MapPin className="w-3.5 h-3.5 text-[var(--semantic-success-text)]" />
                <span className="font-mono tabular-nums">
                  {geo.lat ? `${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}` : 'Capturar GPS'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y sm:divide-y-0 md:divide-x divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-lg text-xs bg-[var(--bg-surface-alt)]">
              <div className="p-3.5 space-y-1">
                <div className="text-[var(--semantic-info-text)] font-semibold flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" /> Vendedor (Proprietário Atual)
                </div>
                <div className="font-bold text-[var(--text-primary)] truncate">
                  {processoAtual.dados?.vendedor?.nome || 'VINICIUS CAVALCANTE VIANA'}
                </div>
                <div className="font-mono text-[var(--text-muted)] tabular-nums">
                  CPF: {processoAtual.cpf_cnpj_vendedor || '07569577370'}
                </div>
                <div className="text-[11px] text-[var(--semantic-success-text)] pt-1">
                  Assinatura Vendedor (ATPV-e): Registrada
                </div>
              </div>

              <div className="p-3.5 space-y-1">
                <div className="text-[var(--semantic-warning-text)] font-semibold flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" /> Comprador (Adquirente)
                </div>
                <div className="font-bold text-[var(--text-primary)] truncate">
                  {processoAtual.dados?.comprador?.nome || 'MARCOS VINICIUS ALMEIDA'}
                </div>
                <div className="font-mono text-[var(--text-muted)] tabular-nums">
                  CPF: {processoAtual.cpf_cnpj_comprador || '01234567890'}
                </div>
                <div className="text-[11px] pt-1">
                  {processoAtual.etapa_atual >= 8 ? (
                    <span className="text-[var(--semantic-success-text)]">
                      Assinatura Comprador: Concluída com Biometria
                    </span>
                  ) : (
                    <span className="text-[var(--semantic-warning-text)]">
                      Assinatura Comprador: Pendente de Assinatura
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Barra de Progresso das 13 Etapas */}
            <div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)] font-medium mb-1.5">
                <span>Progresso do Rito Operacional</span>
                <span className="font-mono text-[var(--semantic-success-text)] font-bold tabular-nums">
                  Etapa {processoAtual.etapa_atual} de 13 (
                  {Math.round((processoAtual.etapa_atual / 13) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-[var(--bg-surface-alt)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div
                  className="bg-[var(--accent-primary)] h-full transition-all duration-300"
                  style={{ width: `${Math.round((processoAtual.etapa_atual / 13) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2.5">
                {processoAtual.etapa_atual < 7 && processoAtual.status === 'EM_ANDAMENTO' && (
                  <button
                    type="button"
                    onClick={() =>
                      onAvancarProcesso(
                        {
                          biometriaValidada: true,
                          tipoAssinatura: 'VENDEDOR',
                          lat: geo.lat,
                          lng: geo.lng
                        },
                        processoAtual
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-xs font-bold text-[var(--accent-on-primary)] cursor-pointer transition-colors"
                  >
                    Avançar Etapa: Assinatura do Vendedor (Biometria + GPS)
                  </button>
                )}

                {processoAtual.etapa_atual >= 7 &&
                  processoAtual.etapa_atual < 13 &&
                  processoAtual.status === 'EM_ANDAMENTO' && (
                    <button
                      type="button"
                      onClick={() =>
                        onAvancarProcesso(
                          {
                            biometriaValidada: true,
                            tipoAssinatura: 'COMPRADOR',
                            lat: geo.lat,
                            lng: geo.lng
                          },
                          processoAtual
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white cursor-pointer transition-colors"
                    >
                      Avançar Etapa {processoAtual.etapa_atual + 1}: Assinatura do Comprador (Biometria + Geo)
                    </button>
                  )}

                {processoAtual.status === 'CONCLUIDO' && (
                  <button
                    type="button"
                    onClick={() => onBaixarPdfPades(processoAtual)}
                    className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-xs font-bold text-[var(--accent-on-primary)] cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar CRLV-e / Comprovante PAdES (ICP-Brasil)
                  </button>
                )}

                {processoAtual.status === 'EM_REVISAO_MANUAL' && (
                  <button
                    type="button"
                    onClick={onIrParaMesa}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white cursor-pointer transition-colors"
                  >
                    Analisar na Mesa Revisora (Faixa Amarela)
                  </button>
                )}
              </div>

              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                Hash: {(processoAtual.hash_blockchain || '').slice(0, 20)}...
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
