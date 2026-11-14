import React, { useState } from 'react'
import { Shield, Lock, User, ArrowRight, CheckCircle2, ShieldCheck, FileCheck, Eye, EyeOff, Award } from 'lucide-react'

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
      if ((usuario.trim() === 'demo' && senha === 'nevaca123') || (usuario.trim() === 'marcos' && senha === 'nevaca123')) {
        localStorage.setItem('necava_auth', JSON.stringify({ usuario, logadoEm: Date.now() }))
        onLogin({ usuario })
      } else {
        setErro('Credenciais inválidas. Utilize demo / nevaca123')
        setCarregando(false)
      }
    }, 400)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row text-slate-100 font-sans">
      {/* LADO ESQUERDO: Painel Institucional NECAVA & DETRAN/CE */}
      <div className="lg:w-7/12 bg-gradient-to-br from-slate-950 via-slate-900 to-[#0b192e] p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
        {/* Efeito de iluminação decorativa no fundo */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Topo: Logo & Identidade */}
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-xl text-slate-950 shadow-lg shadow-emerald-500/20">
                N
              </div>
              <div>
                <span className="font-extrabold tracking-wider text-xl text-white">NECAVA</span>
                <span className="text-[10px] block font-mono text-emerald-400 tracking-widest uppercase">Tecnologia em Transportes</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">Plataforma Credenciada</span>
              <span className="text-xs font-semibold text-slate-200">DETRAN / CE</span>
            </div>
          </div>
        </div>

        {/* Centro: Título do Sistema e Módulos */}
        <div className="my-12 lg:my-0 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ESTADO DO CEARÁ · DETRAN-CE · HOMOLOGAÇÃO
          </div>

          <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            PLATAFORMA DIGITAL DE REGISTRO & TRANSFERÊNCIA
          </h1>
          <p className="mt-4 text-sm lg:text-base text-slate-300 leading-relaxed font-light">
            Ambiente integrado de conformidade operacional para validação de processos veiculares,
            mesa revisora com IA, motor antifraude documental e trilha de auditoria imutável via Blockchain.
          </p>

          {/* Cards de Módulos (como na referência) */}
          <div className="mt-8 space-y-3">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-xs font-bold">
                  TRF
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Transferência Digital e 1º Registro</h4>
                  <p className="text-[11px] text-slate-400">Validação completa dos ritos de 13 e 15 etapas integrados ao BalcãoWS</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">Etapa I</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-mono text-xs font-bold">
                  REV
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Mesa Revisora com 3 Faixas</h4>
                  <p className="text-[11px] text-slate-400">Roteamento automático por score (Aprovação, Revisão Assistida ou Reprovação)</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">Auditável</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-mono text-xs font-bold">
                  IA
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Motor de Visão Computacional (Anexo I)</h4>
                  <p className="text-[11px] text-slate-400">Processamento simultâneo de 100 imagens em ≤ 60s com F1-Score certificado</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">Etapa III</span>
            </div>
          </div>
        </div>

        {/* Rodapé Esquerdo */}
        <div className="relative z-10 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>NECAVA INSPECAO E PESQUISA EM TRANSPORTES LTDA · CNPJ 05.591.991/0001-48</span>
          </div>
          <span className="font-mono">mTLS Ativo (HTTP 200)</span>
        </div>
      </div>

      {/* LADO DIREITO: Formulário de Autenticação */}
      <div className="lg:w-5/12 bg-slate-950 p-8 lg:p-16 flex flex-col justify-between">
        {/* Card Superior de Identificação Institucional */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">DETRAN - CEARÁ</h3>
              <p className="text-[11px] text-slate-400">Departamento Estadual de Trânsito</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase">
            Acesso Oficial
          </span>
        </div>

        {/* Formulário Central */}
        <div className="my-auto py-8 max-w-sm w-full mx-auto">
          <div className="mb-6">
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block mb-1">
              PORTAL DO OPERADOR / AVALIADOR
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">Acessar Sistema Integrado</h2>
            <p className="text-xs text-slate-400 mt-1">Informe seu usuário e senha funcionais cadastrados:</p>
          </div>

          {erro && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Login / Matrícula</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ex: demo"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Senha de Acesso</label>
                <button type="button" onClick={preencherDemo} className="text-[11px] text-emerald-400 hover:text-emerald-300">
                  Usar credenciais demo
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              {carregando ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Acessar o Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Card de Acesso Rápido Demo (como na imagem de referência) */}
          <div className="mt-5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                N
              </div>
              <div>
                <p className="text-xs font-medium text-slate-200">Acesso Demonstrativo Rápido</p>
                <p className="text-[11px] font-mono text-slate-400">Login: <span className="text-emerald-400">demo</span> | Senha: <span className="text-emerald-400">nevaca123</span></p>
              </div>
            </div>
            <button
              onClick={preencherDemo}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
            >
              Preencher Credenciais
            </button>
          </div>
        </div>

        {/* Rodapé Direito: Aviso Legal e Conformidade */}
        <div className="pt-6 border-t border-slate-800/80 text-[10px] text-slate-500 leading-relaxed text-center">
          <p>
            Ambiente Corporativo Seguro · NECAVA Inspeção e Pesquisa em Transportes Ltda.
          </p>
          <p className="mt-1">
            Plataforma em conformidade com as diretrizes de integração BalcãoWS e edital de homologação DETRAN/CE.
          </p>
        </div>
      </div>
    </div>
  )
}
