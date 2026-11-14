import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck2,
  Layers,
  Lock,
  ShieldCheck,
  Wrench
} from 'lucide-react'

const ETAPAS_PREVISTAS = [
  '1–3 · Abertura digital PF/PJ, consulta BalcãoWS e validação de laudo ECV',
  '4–6 · Triagem IA (Faixas 1.7.8/1.7.9) e conferência documental ATPV-e',
  '7–9 · Assinatura biométrica e geolocalizada do vendedor e comprador',
  '10–13 · Assinatura PAdES ICP-Brasil, registro Blockchain VD-06 e emissão do CRLV-e'
]

const INFRA_COMPARTILHADA = [
  {
    titulo: 'Motor Antifraude (F-01 a F-04)',
    status: 'Já validado na Etapa II',
    descricao: 'Bloqueios de titularidade, laudo duplicado, campo obrigatório e sequência lógica.'
  },
  {
    titulo: 'Semáforo IA & Mesa Revisora',
    status: 'Já validado no Item 1.7',
    descricao: 'Roteamento por score com calibração dinâmica de faixas e parecer VD-05.'
  },
  {
    titulo: 'Ledger SHA-256 & PAdES ICP-Brasil',
    status: 'Já validado em Auditoria',
    descricao: 'Trilha segregada VD-07 e carimbo criptográfico prontos para o rito de 13 etapas.'
  }
]

export default function TransferenciaUsadosPage() {
  const navigate = useNavigate()

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[var(--semantic-warning-text)]">
              <Wrench className="w-3.5 h-3.5" />
              Em Produção · Item 2 do Manual DETRAN-CE (Seção 3.1)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
              <ArrowLeftRight className="w-5 h-5 text-[var(--accent-text)] shrink-0" />
              Transferência de Propriedade de Veículos Usados
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-3xl leading-relaxed">
              Este módulo compõe o <strong className="text-[var(--text-primary)]">Item 2</strong> do cronograma técnico e será demonstrado na <strong className="text-[var(--text-primary)]">próxima PoC</strong>. Nesta sessão, o foco de homologação abrange o Item 1 (Primeiro Registro), Dashboard &amp; Auditoria, Antifraude, Visão Computacional e Mesa Revisora.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-strong)] text-xs font-mono text-[var(--text-secondary)] shrink-0 self-start lg:self-center">
            <Clock className="w-4 h-4 text-[var(--semantic-warning-text)] shrink-0" />
            <span>Previsão: Próxima PoC (Item 2)</span>
          </div>
        </div>

        {/* Arquitetura Compartilhada já Ativa */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--accent-text)]" />
              Componentes da Plataforma Já Ativos para o Item 2
            </h3>
            <span className="text-[11px] font-mono text-[var(--semantic-success-text)]">
              Núcleo compartilhado operacional
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INFRA_COMPARTILHADA.map((item) => (
              <div
                key={item.titulo}
                className="p-4 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[var(--text-primary)]">{item.titulo}</span>
                  <CheckCircle2 className="w-4 h-4 text-[var(--semantic-success-text)] shrink-0" />
                </div>
                <div className="text-[11px] font-mono text-[var(--semantic-success-text)]">
                  {item.status}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.descricao}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Escopo Previsto da Próxima PoC */}
        <div className="p-5 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <Lock className="w-4 h-4 text-[var(--text-muted)]" />
              Rito Operacional Reservado para a Próxima PoC (13 Etapas · Seção 3.1)
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              Modalidades PF → PF · PF → PJ · PJ → PF · PJ → PJ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {ETAPAS_PREVISTAS.map((etapa) => (
              <div
                key={etapa}
                className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-mono"
              >
                {etapa}
              </div>
            ))}
          </div>
        </div>

        {/* Navegação Rápida para os Módulos desta PoC */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[var(--text-muted)]">
            Utilize os atalhos ao lado para retornar aos módulos ativos desta apresentação.
          </span>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/primeiro-registro')}
              className="px-3.5 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-[var(--accent-text)]" />
              Item 1 · Primeiro Registro
            </button>

            <button
              type="button"
              onClick={() => navigate('/mesa-revisora')}
              className="px-3.5 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--semantic-warning-text)]" />
              Mesa Revisora &amp; Faixas
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-xs font-bold text-[var(--accent-on-primary)] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              Dashboard &amp; Auditoria
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
