import React, { useState } from 'react'
import {
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  Building2,
  AlertCircle
} from 'lucide-react'
import BrandLogo from './BrandLogo'
import ThemeSwitcher from './ThemeSwitcher'

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  function preencherDemo() {
    setUsuario('demo')
    setSenha('nevaca123')
    setErro('')
  }

  function handleSubmit(e) {
    e?.preventDefault()
    setErro('')
    setCarregando(true)

    setTimeout(() => {
      const userTrimmed = usuario.trim()
      if ((userTrimmed === 'demo' || userTrimmed === 'marcos') && senha === 'nevaca123') {
        const authPayload = { usuario: userTrimmed, logadoEm: Date.now() }
        localStorage.setItem('necava_auth', JSON.stringify(authPayload))
        onLogin(authPayload)
      } else {
        setErro('Credenciais inválidas. Utilize o acesso demonstrativo: demo / nevaca123')
        setCarregando(false)
      }
    }, 350)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] grid grid-cols-1 lg:grid-cols-12">
      {/* LADO ESQUERDO: Painel Institucional NECAVA · DETRAN/CE */}
      <div className="lg:col-span-7 relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] overflow-hidden">
        {/* Topo Institucional */}
        <div className="relative z-10 flex items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3.5">
            <BrandLogo sizeClass="w-10 h-10" textSize="text-lg" />
            <div>
              <div className="text-lg font-bold tracking-tight text-[var(--text-primary)] leading-none">
                NECAVA <span className="text-[var(--text-muted)] font-normal">·</span> DETRAN/CE
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1 font-mono tabular-nums">
                CNPJ 05.591.991/0001-48
              </div>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-[var(--text-secondary)]">
              Homologação Estadual
            </div>
            <div className="text-[11px] font-mono text-[var(--semantic-success-text)]">
              BalcãoWS · mTLS ICP-Brasil
            </div>
          </div>
        </div>

        {/* Proposta Central & Módulos */}
        <div className="relative z-10 my-10 lg:my-auto max-w-2xl space-y-8">
          <div className="space-y-4">
            <div className="text-xs font-mono text-[var(--accent-text)] tracking-wide">
              Estado do Ceará · Prova de Conceito Oficial (PoC)
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.12] [text-wrap:balance]">
              Plataforma Digital de Registro e Transferência Veicular
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl">
              Infraestrutura crítica para validação de primeiro registro 0km, transferência digital
              ATPV-e, motor antifraude documental, mesa revisora humana e auditoria imutável em SHA-256.
            </p>
          </div>

          <div className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            <div className="py-4 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  01. Primeiro Registro e Transferência Digital
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Ritos completos de 15 e 13 etapas com emissão de CRLV-e e assinatura PAdES e-CNPJ.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[var(--semantic-success-text)] whitespace-nowrap shrink-0 pt-0.5">
                Seções 3.1 &amp; 3.2
              </span>
            </div>

            <div className="py-4 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  02. Mesa Revisora, Faixas e Antifraude
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Calibração parametrizada de scores (VD-05) e bloqueios automáticos F-01 a F-04.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[var(--semantic-warning-text)] whitespace-nowrap shrink-0 pt-0.5">
                Itens 1.7.8 &amp; 1.7.9
              </span>
            </div>

            <div className="py-4 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  03. Visão Computacional em Lote (100 Imagens)
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Reconhecimento OCR e normalização veicular em ≤ 60s com exportação CSV UTF-8 BOM.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[var(--semantic-info-text)] whitespace-nowrap shrink-0 pt-0.5">
                Etapa III · Anexo I
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé Esquerdo */}
        <div className="relative z-10 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--semantic-success-text)] shrink-0" />
            <span>NECAVA Inspeção e Pesquisa em Transportes Ltda.</span>
          </div>
          <span className="font-mono text-[11px] text-[var(--text-muted)]">
            Ledger SHA-256 · Trilha VD-07
          </span>
        </div>
      </div>

      {/* LADO DIREITO: Autenticação do Avaliador / Operador */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-[var(--bg-canvas)]">
        {/* Cabeçalho do Órgão + Alternador de Tema */}
        <div className="flex items-center justify-between gap-3 pb-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-text)] shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--text-primary)]">DETRAN — Ceará</div>
              <div className="text-xs text-[var(--text-muted)]">Departamento Estadual de Trânsito</div>
            </div>
          </div>

          <ThemeSwitcher compact />
        </div>

        {/* Formulário Central */}
        <div className="my-auto py-10 w-full max-w-sm mx-auto space-y-6">
          <div className="space-y-1.5">
            <div className="text-xs font-mono text-[var(--text-muted)]">Portal do Avaliador Técnico</div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Autenticação no Sistema
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Informe sua matrícula funcional ou utilize as credenciais de homologação da PoC.
            </p>
          </div>

          {erro && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-[var(--semantic-danger-bg)] border border-[var(--semantic-danger-border)] text-[var(--semantic-danger-text)] text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-usuario"
                className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
              >
                Login / Matrícula
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ex: demo"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-strong)] text-sm text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-senha"
                  className="text-xs font-medium text-[var(--text-secondary)]"
                >
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={preencherDemo}
                  className="text-xs font-medium text-[var(--accent-text)] hover:underline cursor-pointer transition-colors"
                >
                  Preencher Demo
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-strong)] text-sm text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-2.5 px-4 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 text-[var(--accent-on-primary)] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {carregando ? (
                <span>Validando credenciais...</span>
              ) : (
                <>
                  <span>Acessar Plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Acesso Rápido para Comissão Avaliadora */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent-text)] flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[var(--text-primary)]">
                  Credenciais de Homologação
                </div>
                <div className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                  Usuário: <span className="text-[var(--accent-text)] font-semibold">demo</span> · Senha:{' '}
                  <span className="text-[var(--accent-text)] font-semibold">nevaca123</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={preencherDemo}
              className="px-3 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              Usar Demo
            </button>
          </div>
        </div>

        {/* Rodapé Direito */}
        <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)] gap-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--semantic-success-text)] shrink-0" />
            Conformidade BalcãoWS &amp; Edital DETRAN/CE
          </span>
          <span className="font-mono">ICP-Brasil A1</span>
        </div>
      </div>
    </div>
  )
}
