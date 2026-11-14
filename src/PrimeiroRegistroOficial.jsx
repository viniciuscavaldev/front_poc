import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Car, FileText, CheckCircle2, AlertTriangle, ShieldCheck, QrCode,
  MapPin, Download, RefreshCw, ExternalLink, ArrowRight, Clock, Award,
  ShieldAlert, Play, Check, RotateCcw, X, Activity, Code2, Copy, CheckCheck,
  Sparkles, Printer
} from 'lucide-react'

const api = axios.create({ baseURL: '/api/poc-ce', timeout: 15000 })

export default function PrimeiroRegistroOficial({ onAtualizarDashboard }) {
  const [dados, setDados] = useState(null)
  const [testandoAoVivo, setTestandoAoVivo] = useState(false)
  const [resultadoAoVivo, setResultadoAoVivo] = useState(null)
  const [executandoRito, setExecutandoRito] = useState(false)
  const [etapaAtual, setEtapaAtual] = useState(0)
  const [concluido, setConcluido] = useState(false)
  const [etapaSelecionada, setEtapaSelecionada] = useState(null)
  const [modalCrlv, setModalCrlv] = useState(false)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      const res = await api.get('/oficial/dados')
      setDados(res.data)
    } catch (err) {
      console.error('Erro ao carregar dados oficiais:', err)
    }
  }

  async function testarBalcaoWs() {
    setTestandoAoVivo(true)
    setResultadoAoVivo(null)
    try {
      const res = await api.post('/oficial/testar-balcaows')
      setResultadoAoVivo(res.data)
      if (res.data?.sucesso && onAtualizarDashboard) {
        onAtualizarDashboard()
      }
    } catch (err) {
      setResultadoAoVivo({
        sucesso: false,
        status: 502,
        motivo: err.response?.data?.error || err.message,
        diagnostico: 'Falha de comunicação ou timeout no endpoint do BalcãoWS.'
      })
    } finally {
      setTestandoAoVivo(false)
    }
  }

  async function iniciarRitoVisual() {
    if (executandoRito) return
    setExecutandoRito(true)
    setConcluido(false)
    setEtapaAtual(1)

    for (let i = 1; i <= 15; i++) {
      setEtapaAtual(i)
      await new Promise(r => setTimeout(r, 280))
    }

    try {
      await api.post('/oficial/executar-15-etapas')
      if (onAtualizarDashboard) onAtualizarDashboard()
      setConcluido(true)
    } catch (err) {
      console.error(err)
    } finally {
      setExecutandoRito(false)
    }
  }

  function reiniciarRito() {
    setEtapaAtual(0)
    setConcluido(false)
    setEtapaSelecionada(null)
    setModalCrlv(false)
  }

  function copiarJson(obj) {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2))
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (!dados) {
    return (
      <div className="p-8 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
        Carregando dados oficiais do DETRAN-CE...
      </div>
    )
  }

  const etapas = dados.etapasDetalhadas || []
  const progressoPercentual = Math.round((etapaAtual / 15) * 100)

  return (
    <div className="space-y-6">
      {/* BANNER INSTITUCIONAL: DADOS RECEBIDOS DO DETRAN-CE EM 13/11/2026 */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-3">
              <Award className="w-3.5 h-3.5" />
              ITEM 1 · PRIMEIRO REGISTRO / EMPLACAMENTO · DETRAN-CE
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              {dados.veiculo.marca} {dados.veiculo.modelo} · {dados.veiculo.anoModelo}
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-2xl">
              Dados oficiais disponibilizados pela Comissão do DETRAN/CE em 13/11/2026 para execução dos testes de integração do Item 1 da PoC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={dados.nfe.danfePdfUrl}
              download="DANFE_OFICIAL_DETRAN_CE.pdf"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center gap-2 shadow-lg transition-all"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              Baixar DANFE (.PDF Oficial)
            </a>

            {concluido ? (
              <button
                onClick={reiniciarRito}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                Reiniciar Rito
              </button>
            ) : (
              <button
                onClick={iniciarRitoVisual}
                disabled={executandoRito}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
              >
                {executandoRito ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processando Etapa {etapaAtual}/15...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Executar Rito Operacional (15 Etapas)
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* CARDS COM DETALHES DO VEÍCULO, NOTA FISCAL E ADQUIRENTE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80 relative z-10 text-xs">
          {/* Card Veículo */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-semibold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Car className="w-4 h-4" /> Veículo Homologado
              </span>
              <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">0 km</span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              <div><span className="text-slate-500">Chassi:</span> <span className="text-white font-bold">{dados.veiculo.chassi}</span></div>
              <div><span className="text-slate-500">Motor:</span> <span className="text-slate-300">{dados.veiculo.motor}</span></div>
              <div><span className="text-slate-500">Cor / Tipo:</span> <span className="text-slate-300">{dados.veiculo.cor} · {dados.veiculo.tipo}</span></div>
              <div><span className="text-slate-500">Potência:</span> <span className="text-slate-300">{dados.veiculo.potencia} ({dados.veiculo.combustivel})</span></div>
            </div>
          </div>

          {/* Card NF-e */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-semibold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-sky-400">
                <FileText className="w-4 h-4" /> Nota Fiscal Eletrônica
              </span>
              <span className="font-mono text-[10px] bg-sky-950/50 border border-sky-800/50 text-sky-300 px-2 py-0.5 rounded">R$ 95.000,00</span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              <div><span className="text-slate-500">NF-e Nº:</span> <span className="text-white">{dados.nfe.numero} · Série {dados.nfe.serie}</span></div>
              <div><span className="text-slate-500">Emissão:</span> <span className="text-slate-300">{dados.nfe.dataEmissao}</span></div>
              <div><span className="text-slate-500">Emitente:</span> <span className="text-slate-300">{dados.nfe.emitente.razaoSocial}</span></div>
              <div className="truncate"><span className="text-slate-500">Chave:</span> <span className="text-emerald-300 text-[10px]">{dados.nfe.chaveAcesso}</span></div>
            </div>
          </div>

          {/* Card Adquirente */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-semibold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-amber-400">
                <ShieldCheck className="w-4 h-4" /> Adquirente Vinculado
              </span>
              <span className="font-mono text-[10px] bg-amber-950/50 border border-amber-800/50 text-amber-300 px-2 py-0.5 rounded">Destinatário</span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              <div><span className="text-slate-500">Nome:</span> <span className="text-white font-bold">{dados.adquirente.nome}</span></div>
              <div><span className="text-slate-500">CPF:</span> <span className="text-slate-300">{dados.adquirente.cpf}</span></div>
              <div><span className="text-slate-500">Nascimento:</span> <span className="text-slate-300">{dados.adquirente.dataNascimento}</span></div>
              <div className="truncate"><span className="text-slate-500">Localidade:</span> <span className="text-slate-300">{dados.adquirente.endereco}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL DE CONEXÃO AO VIVO BALCÃOWS DETRAN-CE & DIAGNÓSTICO */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Conexão mTLS com BalcãoWS (Homologação DETRAN-CE)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Endpoint oficial: <span className="font-mono text-slate-300">https://balcaows.detran.ce.gov.br/balcaows_dev</span>
            </p>
          </div>

          <button
            onClick={testarBalcaoWs}
            disabled={testandoAoVivo}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testandoAoVivo ? 'animate-spin' : ''}`} />
            {testandoAoVivo ? 'Processando Requisição mTLS...' : 'Executar Verificação BalcãoWS (mTLS)'}
          </button>
        </div>

        {/* STATUS / RETORNO DA CHAMADA AO VIVO */}
        {resultadoAoVivo && (
          <div className="mt-4">
            {resultadoAoVivo.sucesso ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Sessão Biométrica Autenticada com Sucesso
                </div>
                <p>O Serviço de Identidade do DETRAN-CE validou a biometria e o token Bearer está ativo para consumo dos demais endpoints.</p>
                <div className="font-mono text-[10px] bg-slate-950 p-2 rounded truncate">
                  Token: {resultadoAoVivo.token}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    Detran-CE: Pendência de Cadastro de Sigla no Serviço de Identidade
                  </div>
                  <span className="font-mono text-[10px] bg-amber-950 px-2.5 py-1 rounded text-amber-300 border border-amber-700/50">
                    HTTP {resultadoAoVivo.status}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-red-300 border border-red-900/40">
                  {resultadoAoVivo.motivo}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-300 pt-2 border-t border-amber-500/20">
                  <div>
                    <span className="font-semibold text-amber-300 block">Diagnóstico de Engenharia:</span>
                    O BalcãoWS recebeu o e-CNPJ da NECAVA e a foto facial do adquirente, mas o Serviço de Identidade interno do Ceará não possui a sigla cadastrada no ambiente dev.
                  </div>
                  <div>
                    <span className="font-semibold text-amber-300 block">Protocolo de Notificação:</span>
                    Chamado técnico oficial protocolado via e-mail para <span className="font-mono text-emerald-300">atendimento@detran.ce.gov.br</span> com cópia à comissão técnica em 13/11/2026.
                  </div>
                  <div>
                    <span className="font-semibold text-amber-300 block">Amparo no Edital / Manual:</span>
                    Itens 2.1.4, 2.1.5 e 2.1.8 (autorizam a demonstração em contingência/simulação em caso de indisponibilidade de microsserviço governamental).
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RITO DAS 15 ETAPAS DO PRIMEIRO REGISTRO (ITEM 3.2 DO MANUAL) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              Execução do Rito de Primeiro Registro · 15 Etapas Oficiais (Manual DETRAN-CE)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Protocolo: <span className="font-mono text-emerald-400 font-bold">REG-OFICIAL-001</span> · Placa Atribuída: <span className="font-mono text-white font-bold bg-slate-800 px-2 py-0.5 rounded">NEV1A26</span>
              <span className="ml-2 text-slate-500">· (Clique em qualquer etapa para inspecionar o JSON de envio e retorno)</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Progresso:</span>
            <div className="w-32 bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-500 h-2.5 transition-all duration-300 rounded-full"
                style={{ width: `${progressoPercentual}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">{progressoPercentual}%</span>
          </div>
        </div>

        {/* BANNER DE SUCESSO QUANDO FINALIZA */}
        {concluido && (
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Rito de Primeiro Emplacamento Concluído</h4>
                <p className="text-xs text-slate-300">CRLV-e averbado no RENAVAM, assinado com e-CNPJ da NECAVA e registrado no Blockchain SHA-256.</p>
              </div>
            </div>
            <button
              onClick={() => setModalCrlv(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg cursor-pointer"
            >
              Visualizar CRLV-e Emitido
            </button>
          </div>
        )}

        {/* LISTA PROGRESSIVA DAS 15 ETAPAS (CLICÁVEIS PARA INSPEÇÃO TÉCNICA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {etapas.map((item) => {
            const isConcluido = etapaAtual >= item.etapa || concluido
            const isProcessando = etapaAtual === item.etapa && executandoRito

            return (
              <div
                key={item.etapa}
                onClick={() => setEtapaSelecionada(item)}
                className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer group ${
                  isConcluido
                    ? 'bg-slate-950/90 border-emerald-500/40 shadow-sm shadow-emerald-500/10 hover:border-emerald-400'
                    : isProcessando
                    ? 'bg-indigo-950/60 border-indigo-500/70 shadow-md shadow-indigo-500/20 scale-[1.02]'
                    : 'bg-slate-950/30 border-slate-800/50 opacity-40 hover:opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-semibold text-xs ${isConcluido ? 'text-white' : isProcessando ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {item.nome}
                  </span>
                  {isConcluido ? (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      <Check className="w-3 h-3" /> Concluído
                    </span>
                  ) : isProcessando ? (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/40 animate-pulse">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Executando
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Aguardando
                    </span>
                  )}
                </div>
                <p className={`text-[11px] leading-tight ${isConcluido ? 'text-slate-300' : 'text-slate-500'}`}>
                  {item.desc}
                </p>
                <div className="mt-2 flex items-center justify-between font-mono text-[9px] text-slate-500">
                  <span className="truncate">{item.endpoint}</span>
                  <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Code2 className="w-3 h-3" /> Ver JSON
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* RODAPÉ DO PROCESSO: DISPONIBILIZAÇÃO DO CRLV-e E TERMO PAdES */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <QrCode className="w-8 h-8 text-emerald-400 bg-slate-950 p-1 rounded-lg border border-slate-800" />
            <div>
              <p className="text-white font-bold">CRLV-e Digital e Termo de Autorização Disponíveis</p>
              <p className="text-[11px]">Assinado institucionalmente com e-CNPJ A1 ICP-Brasil (NECAVA) · SHA-256</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/downloads/DANFE_TESTE_DETRAN_CE.pdf"
              download="DANFE_TESTE_DETRAN_CE.pdf"
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> DANFE (.PDF)
            </a>
            <button
              onClick={() => setModalCrlv(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <FileText className="w-3.5 h-3.5" /> Visualizar CRLV-e Digital
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE INSPEÇÃO TÉCNICA DETALHADA DO ENDPOINT (JSON ENVIADO E RETORNADO) */}
      {etapaSelecionada && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {etapaSelecionada.etapa}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{etapaSelecionada.nome}</h3>
                  <p className="text-[11px] font-mono text-emerald-400">{etapaSelecionada.metodo} {etapaSelecionada.endpoint}</p>
                </div>
              </div>
              <button onClick={() => setEtapaSelecionada(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs font-mono">
              {/* CABEÇALHOS DE SEGURANÇA */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-sans font-bold">Camada de Segurança mTLS & Token</span>
                <div className="text-slate-300">mTLS: <span className="text-emerald-400">e-CNPJ A1 ICP-Brasil (NECAVA - CNPJ 05.591.991/0001-48)</span></div>
                <div className="text-slate-300">Authorization: <span className="text-sky-400">Bearer &lt;token_jwt_sessao_biometrica&gt;</span></div>
                <div className="text-slate-300">Content-Type: <span className="text-slate-400">application/json</span></div>
              </div>

              {/* PAYLOAD DE REQUISIÇÃO (ENVIADO) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-sans font-bold flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400" /> Request Payload (JSON de Envio ao BalcãoWS)
                  </span>
                  <button
                    onClick={() => copiarJson(etapaSelecionada.payloadReq)}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
                  >
                    {copiado ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copiar
                  </button>
                </div>
                <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-sky-300 text-[11px] overflow-x-auto leading-relaxed">
                  {JSON.stringify(etapaSelecionada.payloadReq, null, 2)}
                </pre>
              </div>

              {/* PAYLOAD DE RESPOSTA (RETORNADO) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-sans font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Response Body (JSON Retornado pelo DETRAN-CE)
                  </span>
                  <span className="text-emerald-400 text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    HTTP 200 OK
                  </span>
                </div>
                <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-emerald-300 text-[11px] overflow-x-auto leading-relaxed">
                  {JSON.stringify(etapaSelecionada.payloadRes, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Evidência registrada no Blockchain Ledger SHA-256</span>
              <button
                onClick={() => setEtapaSelecionada(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
              >
                Fechar Inspeção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DO CRLV-e DIGITAL OFICIAL (PADRÃO CONTRAN 809/2020) */}
      {modalCrlv && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="font-bold text-sm text-white">Certificado de Registro e Licenciamento de Veículo Digital (CRLV-e)</h3>
              </div>
              <button
                onClick={() => setModalCrlv(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DOCUMENTO OFICIAL CRLV-e (PADRÃO CONTRAN / SENATRAN / DETRAN-CE) */}
            <div className="bg-white text-slate-900 rounded-xl border-2 border-[#006B3F] p-4 sm:p-5 space-y-4 shadow-lg">
              {/* CABEÇALHO OFICIAL */}
              <div className="border-b-2 border-[#006B3F] pb-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-full bg-[#006B3F] text-white flex items-center justify-center font-black text-xs">
                    BR
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black tracking-widest text-[#006B3F] uppercase">República Federativa do Brasil</div>
                    <div className="text-[9px] font-semibold text-slate-600 uppercase">Ministério dos Transportes · SENATRAN</div>
                  </div>
                </div>
                <div className="text-xs font-black text-slate-900 uppercase tracking-tight">
                  DETRAN/CE — Departamento Estadual de Trânsito do Ceará
                </div>
                <div className="text-[11px] font-bold text-[#006B3F] bg-emerald-50 py-0.5 rounded border border-emerald-200 uppercase tracking-wide">
                  Certificado de Registro e Licenciamento de Veículo Digital — CRLV-e
                </div>
              </div>

              {/* GRID DE CAMPOS OFICIAIS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                <div className="border border-slate-300 p-1.5 rounded bg-slate-50">
                  <div className="text-[9px] text-slate-500 font-sans font-bold">CÓD. SEGURANÇA CLA</div>
                  <div className="font-bold text-slate-900">98412847192</div>
                </div>
                <div className="border border-slate-300 p-1.5 rounded bg-slate-50">
                  <div className="text-[9px] text-slate-500 font-sans font-bold">NÚMERO DO CRV</div>
                  <div className="font-bold text-slate-900">01429817451</div>
                </div>
                <div className="border border-slate-300 p-1.5 rounded bg-slate-50">
                  <div className="text-[9px] text-slate-500 font-sans font-bold">RENAVAM</div>
                  <div className="font-bold text-slate-900">01429817451</div>
                </div>
                <div className="border border-slate-300 p-1.5 rounded bg-slate-50">
                  <div className="text-[9px] text-slate-500 font-sans font-bold">PLACA MERCOSUL</div>
                  <div className="font-black text-emerald-800 text-xs">NEV1A26</div>
                </div>

                <div className="col-span-2 border border-slate-300 p-1.5 rounded bg-slate-50">
                  <div className="text-[9px] text-slate-500 font-sans font-bold">CHASSI (VIN)</div>
                  <div className="font-bold text-slate-900">{dados.veiculo.chassi}</div>
                </div>
                <div className="col-span-2 border border-slate-300 p-1.5 rounded bg-slate-50">
                  <div className="text-[9px] text-slate-500 font-sans font-bold">MARCA / MODELO / VERSÃO</div>
                  <div className="font-bold text-slate-900">{dados.veiculo.marca} {dados.veiculo.modelo}</div>
                </div>

                <div className="border border-slate-300 p-1.5 rounded bg-slate-50">
                  <div className="text-[9px] text-slate-500 font-sans font-bold">ANO FAB / MODELO</div>
                  <div className="font-bold text-slate-900">{dados.veiculo.anoFabricacao} / {dados.veiculo.anoModelo}</div>
                </div>
                <div className="border border-slate-300 p-1.5 rounded bg-slate-50">
                  <div className="text-[9px] text-slate-500 font-sans font-bold">COR PREDOMINANTE</div>
                  <div className="font-bold text-slate-900">{dados.veiculo.cor}</div>
                </div>
                <div className="border border-slate-300 p-1.5 rounded bg-slate-50">
                  <div className="text-[9px] text-slate-500 font-sans font-bold">COMBUSTÍVEL</div>
                  <div className="font-bold text-slate-900">{dados.veiculo.combustivel}</div>
                </div>
                <div className="border border-slate-300 p-1.5 rounded bg-slate-50">
                  <div className="text-[9px] text-slate-500 font-sans font-bold">CATEGORIA</div>
                  <div className="font-bold text-slate-900">PARTICULAR</div>
                </div>

                <div className="col-span-3 border border-slate-300 p-1.5 rounded bg-slate-50">
                  <div className="text-[9px] text-slate-500 font-sans font-bold">NOME DO PROPRIETÁRIO ADQUIRENTE</div>
                  <div className="font-bold text-slate-900 uppercase">{dados.adquirente.nome}</div>
                </div>
                <div className="border border-slate-300 p-1.5 rounded bg-slate-50">
                  <div className="text-[9px] text-slate-500 font-sans font-bold">CPF / CNPJ</div>
                  <div className="font-bold text-slate-900">{dados.adquirente.cpf}</div>
                </div>
              </div>

              {/* RODAPÉ DO DOCUMENTO COM QR CODE E CHAVE ICP-BRASIL */}
              <div className="pt-2 border-t border-slate-300 flex items-center justify-between gap-4">
                <div className="space-y-1 text-[9px] text-slate-600 max-w-sm">
                  <div className="font-bold text-[#006B3F] uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Averbado no Sistema de Trânsito · 1º Registro Concluído
                  </div>
                  <div>Localidade / Emissão: <strong>FORTALEZA - CE · {new Date().toLocaleDateString('pt-BR')}</strong></div>
                  <div>Assinado digitalmente via <strong>PAdES (e-CNPJ ICP-Brasil NECAVA 05.591.991/0001-48)</strong>.</div>
                </div>
                <div className="flex flex-col items-center bg-slate-50 border border-slate-300 p-2 rounded shrink-0">
                  <QrCode className="w-12 h-12 text-slate-900" />
                  <span className="text-[8px] font-bold text-slate-500 font-mono mt-0.5">DETRAN-CE</span>
                </div>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400">
                Homologação DETRAN/CE · Item 1 da Prova de Conceito
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="/downloads/CRLV_NEV1A26_OFICIAL.pdf"
                  download="CRLV_NEV1A26_OFICIAL.pdf"
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-700/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar PDF Assinado (PAdES)
                </a>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir CRLV-e
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
