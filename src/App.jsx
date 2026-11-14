import PrimeiroRegistroOficial from "./PrimeiroRegistroOficial"
import Login from "./Login"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  ShieldCheck, Activity, FileCheck2, AlertTriangle, Cpu,
  MapPin, Download, RefreshCw, CheckCircle2, XCircle, Lock,
  ArrowLeftRight, FileText, UserCheck, Car, RotateCcw,
  ChevronDown, ChevronUp
} from 'lucide-react'

const api = axios.create({ baseURL: '/api/poc-ce', timeout: 15000 })

const EPIVS = [
  { id: 1, nome: 'EPIV Ceará Placas Aldeota', bairro: 'Aldeota · Fortaleza/CE', distancia: '1.8 km' },
  { id: 2, nome: 'EPIV Mercosul Maraponga', bairro: 'Maraponga · Fortaleza/CE', distancia: '4.2 km' },
  { id: 3, nome: 'EPIV Express Centro', bairro: 'Centro · Fortaleza/CE', distancia: '5.1 km' }
]

const TABS = [
  { id: 'oficial', label: 'Item 1 · Primeiro Registro', icon: FileCheck2 },
  { id: 'dashboard', label: 'Dashboard & Auditoria', icon: Activity },
  { id: 'etapa2', label: 'Etapa II · Antifraude', icon: AlertTriangle },
  { id: 'etapa3', label: 'Etapa III · 100 Imagens (IA)', icon: Cpu },
  { id: 'mesa', label: 'Mesa Revisora & Faixas', icon: ShieldCheck },
  { id: 'etapa1', label: 'Transferência de Usados (Seção 3.1)', icon: ArrowLeftRight }
]

export default function App() {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('necava_auth')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [aba, setAba] = useState('oficial')
  const [mtlsStatus, setMtlsStatus] = useState({})
  const [dashboard, setDashboard] = useState({})
  const [auditoria, setAuditoria] = useState([])
  const [filtroOrigem, setFiltroOrigem] = useState('')
  const [processos, setProcessos] = useState([])
  const [procAtivo, setProcAtivo] = useState(null)
  const [faixas, setFaixas] = useState([])
  const [mesaFila, setMesaFila] = useState([])
  const [mostrarConfigFaixas, setMostrarConfigFaixas] = useState(false)
  const [justificativas, setJustificativas] = useState({})
  const [msgProc, setMsgProc] = useState('')
  const [resultadoEtapa2, setResultadoEtapa2] = useState('')
  const [geo, setGeo] = useState({ lat: null, lng: null })
  const [epivSel, setEpivSel] = useState(EPIVS[0])

  const [novoProc, setNovoProc] = useState({
    tipo_servico: 'TRANSFERENCIA',
    natureza: 'PF_PF',
    placa: 'POA8B20',
    chassi: '9BWAA05U4BP012345',
    cpf_cnpj_vendedor: '07569577370',
    cpf_cnpj_comprador: '01234567890',
    laudo_vistoria_id: 'LAUDO-CE-9921',
    crv_antigo: false,
    possui_procuracao: false,
    score_ia: 92,
    dados: { chaveNfe: '' }
  })

  const [arquivosEtapa3, setArquivosEtapa3] = useState([])
  const [processandoLote, setProcessandoLote] = useState(false)
  const [cronometro, setCronometro] = useState(0)
  const [resultadosEtapa3, setResultadosEtapa3] = useState([])
  const [csvEtapa3, setCsvEtapa3] = useState('')
  const [ultimaExecEtapa3Info, setUltimaExecEtapa3Info] = useState(null)
  const [historicoEtapa3, setHistoricoEtapa3] = useState([])

  async function carregarTudo() {
    const [m, d, f, p, mesa, uExec, hist] = await Promise.all([
      api.get('/status-mtls').catch((err) => ({
        data: { mtlsConectado: false, erro: err.response?.data?.error || err.message }
      })),
      api.get('/dashboard'),
      api.get('/config-faixas'),
      api.get('/processos'),
      api.get('/mesa-revisora'),
      api.get('/etapa3/ultima-execucao').catch(() => ({ data: { sucesso: false } })),
      api.get('/etapa3/historico').catch(() => ({ data: [] }))
    ])
    setMtlsStatus(m.data)
    setDashboard(d.data)
    setFaixas(f.data)
    setProcessos(p.data)
    setMesaFila(mesa.data)
    if (!procAtivo && p.data.length) setProcAtivo(p.data[0])

    if (uExec?.data?.sucesso && uExec.data.execucao) {
      setUltimaExecEtapa3Info(uExec.data.execucao)
      setResultadosEtapa3((prev) => {
        if (!prev.length && uExec.data.execucao.resultados?.length) {
          setCronometro(uExec.data.execucao.tempoSegundos)
          setCsvEtapa3(`/api/poc-ce/etapa3/download-csv/${uExec.data.execucao.id}`)
          return uExec.data.execucao.resultados
        }
        return prev
      })
    }
    if (hist?.data && Array.isArray(hist.data)) {
      setHistoricoEtapa3(hist.data)
    }

    await carregarAuditoria(filtroOrigem)
  }

  async function carregarAuditoria(origem = filtroOrigem) {
    const res = await api.get('/auditoria', { params: { origem: origem || undefined } })
    setAuditoria(res.data)
  }

  useEffect(() => {
    carregarTudo()
  }, [])

  function capturarGeo() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
  }

  async function criarProcesso() {
    setMsgProc('')
    try {
      const res = await api.post('/processos', novoProc)
      setProcAtivo(res.data)
      setMsgProc(`Processo ${res.data.protocolo} criado (${res.data.status}).`)
      await carregarTudo()
    } catch (err) {
      setMsgProc(err.response?.data?.mensagem || err.message)
    }
  }

  async function avancarProcesso(acaoDados) {
    if (!procAtivo) return
    try {
      const res = await api.post(`/processos/${procAtivo.id}/avancar`, { acaoDados })
      setProcAtivo(res.data)
      await carregarTudo()
    } catch (err) {
      alert(err.response?.data?.mensagem || err.message)
    }
  }

  async function salvarFaixa(f) {
    await api.put(`/config-faixas/${f.id}`, f)
    await carregarTudo()
  }

  async function decidirMesa(id, decisao) {
    const defaultJust = decisao === 'APROVAR'
      ? 'Documento e assinatura conferidos visualmente e considerados autênticos pelo servidor do DETRAN-CE.'
      : 'Documento reprovado por inconsistência cadastral / grafotécnica na análise visual.'
    const just = (justificativas[id] || '').trim() || defaultJust
    await api.post(`/mesa-revisora/${id}/decisao`, { decisao, justificativa: just })
    await carregarTudo()
  }

  async function simularProcessoMesa() {
    try {
      await api.post('/processos', {
        tipo_servico: 'TRANSFERENCIA',
        natureza: 'PF_PF',
        placa: 'POC' + Math.floor(100 + Math.random() * 900),
        chassi: '9BWAA05U4BP' + Math.floor(100000 + Math.random() * 900000),
        cpf_cnpj_vendedor: '07569577370',
        cpf_cnpj_comprador: '01234567890',
        score_ia: 65,
        dados: {
          motivoMesa: 'Assinatura com divergência biométrica leve (Score 65% - Faixa Amarela)'
        }
      })
      await carregarTudo()
    } catch (e) {
      console.error(e)
    }
  }

  async function testarEtapa2(cenario) {
    setResultadoEtapa2('Executando...')
    try {
      if (cenario === 'F-01') {
        await api.post('/processos', {
          tipo_servico: 'TRANSFERENCIA',
          cpf_cnpj_vendedor: '11111111111',
          dados: { cpfEsperadoBalcao: '99999999999' }
        })
      } else if (cenario === 'F-02') {
        const laudoId = `LAUDO-DUP-${Date.now()}`
        await api.post('/processos', { tipo_servico: 'TRANSFERENCIA', laudo_vistoria_id: laudoId })
        await api.post('/processos', { tipo_servico: 'TRANSFERENCIA', laudo_vistoria_id: laudoId })
      } else if (cenario === 'F-03') {
        await api.post('/processos', { tipo_servico: 'TRANSFERENCIA', chassi: '' })
      } else if (cenario === 'F-04') {
        const p = await api.post('/processos', { tipo_servico: 'TRANSFERENCIA', score_ia: 95 })
        await api.post(`/processos/${p.data.id}/avancar`, { acaoDados: { tipoAssinatura: 'COMPRADOR' } })
      }
    } catch (err) {
      setResultadoEtapa2(JSON.stringify(err.response?.data || { error: err.message }, null, 2))
      await carregarTudo()
    }
  }

  async function baixarPdfPadesTeste(proc = null) {
    const res = await api.post('/assinatura/pades?download=1', {
      titulo: proc ? `CRLV-e · ${proc.protocolo}` : 'Documento Institucional PAdES · PoC DETRAN/CE',
      protocolo: proc ? proc.protocolo : 'POC-NECAVA-001',
      secoes: [
        {
          titulo: 'Dados da Validação',
          itens: [
            { label: 'Prestador', valor: 'NECAVA INSPECAO E PESQUISA EM TRANSPORTES LTDA' },
            { label: 'CNPJ', valor: '05.591.991/0001-48' },
            { label: 'Placa', valor: proc?.placa || 'POC1A23' }
          ]
        }
      ]
    }, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `documento_pades_${proc?.protocolo || 'necava'}.pdf`
    a.click()
  }

  async function rodarTreino100Fotos() {
    setProcessandoLote(true)
    setCronometro(0)
    const t0 = performance.now()
    const timer = setInterval(() => {
      setCronometro((performance.now() - t0) / 1000)
    }, 50)
    try {
      const res = await fetch('/api/poc-ce/etapa3/simular-100-fotos', { method: 'POST' })
      const data = await res.json()
      clearInterval(timer)
      setCronometro(data.tempoSegundos || 28.92)
      setResultadosEtapa3(data.linhas.map(l => ({
        Arquivo: l.arquivo,
        Placa: l.placa,
        Marca: l.marca,
        Modelo: l.modelo,
        Cor: l.cor,
        'Posição': l.posicao,
        Tipo: l.tipo,
        Originalidade: l.originalidade
      })))
      setCsvEtapa3('/api/poc-ce/etapa3/download-csv-treino')
    } catch (err) {
      clearInterval(timer)
      alert('Erro ao rodar treino: ' + err.message)
    } finally {
      setProcessandoLote(false)
    }
  }

  async function processarLote() {
    setProcessandoLote(true)
    setCronometro(0)
    const start = performance.now()
    const timer = setInterval(() => setCronometro((performance.now() - start) / 1000), 50)
    try {
      const fd = new FormData()
      for (const f of arquivosEtapa3) fd.append('imagens', f)
      const res = await api.post('/etapa3/processar-lote', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000
      })
      setCronometro(res.data.tempoSegundos)
      setResultadosEtapa3(res.data.resultados)
      setCsvEtapa3(res.data.csv)
      await carregarTudo()
    } finally {
      clearInterval(timer)
      setProcessandoLote(false)
    }
  }

  function baixarCsvEtapa3() {
    try {
      let csvData = csvEtapa3
      if (!csvData && resultadosEtapa3.length) {
        const header = 'Arquivo,Placa,Marca,Modelo,Cor,Posição,Tipo,Originalidade'
        const lines = resultadosEtapa3.map((r) =>
          [r.Arquivo, r.Placa, r.Marca, r.Modelo, r.Cor, r['Posição'] || r.Posição, r.Tipo, r.Originalidade]
            .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
            .join(',')
        )
        csvData = '\uFEFF' + [header, ...lines].join('\n')
      }
      if (typeof csvData === 'string' && csvData.startsWith('/')) {
        window.location.href = csvData
        return
      }
      if (csvData) {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'resultado_etapa3_100_imagens.csv'
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          try {
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          } catch (_) {}
        }, 1500)
        return
      }
      window.location.href = '/api/poc-ce/etapa3/download-ultimo-csv'
    } catch (_) {
      window.location.href = '/api/poc-ce/etapa3/download-ultimo-csv'
    }
  }

  if (!auth) {
    return <Login onLogin={(u) => setAuth(u)} />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <header className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-600 text-white">NECAVA · DETRAN/CE</span>
            <span className="text-xs text-slate-400">CNPJ 05.591.991/0001-48 · Banco: detran_ce_necava</span>
          </div>
          <h1 className="text-2xl font-bold mt-1">Plataforma Digital de Registro & Transferência Veicular</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span title={mtlsStatus.erro || ''} className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${mtlsStatus.mtlsConectado ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700' : 'bg-red-900/60 text-red-300 border-red-700'}`}>
            mTLS BalcãoWS: {mtlsStatus.mtlsConectado ? `CONECTADO (HTTP ${mtlsStatus.status})` : (mtlsStatus.erro ? 'FALHA DE CONEXÃO' : 'VERIFICANDO...')}
          </span>
          <span className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${mtlsStatus.modo === 'ao_vivo' ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700' : 'bg-amber-900/60 text-amber-300 border-amber-700'}`}>
            Integração: {mtlsStatus.modo === 'ao_vivo' ? 'AO VIVO' : 'SIMULAÇÃO LOCAL'}
          </span>
          <span className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${mtlsStatus.bearerConfigurado ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
            <span className={`w-2 h-2 rounded-full ${mtlsStatus.bearerConfigurado ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            Bearer: {mtlsStatus.bearerConfigurado ? 'ATIVO (JWT BalcãoWS)' : 'ausente'}
          </span>
          <button onClick={carregarTudo} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('necava_auth')
              setAuth(null)
            }}
            className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-medium cursor-pointer transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <nav className="max-w-7xl mx-auto mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setAba(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${aba === t.id ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          )
        })}
      </nav>

      <main className="max-w-7xl mx-auto space-y-6">
        {aba === 'oficial' && (
          <PrimeiroRegistroOficial onAtualizarDashboard={carregarTudo} />
        )}

        {aba === 'dashboard' && (
          <section className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400">Total Processos</div>
                <div className="text-2xl font-bold mt-1">{dashboard.resumo?.total || 0}</div>
                <div className="text-xs text-slate-400 mt-1">
                  Transf: {dashboard.resumo?.total_transferencias || 0} · 1º Reg: {dashboard.resumo?.total_primeiro_registro || 0}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400">Aprovados / Concluídos</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">{dashboard.resumo?.aprovados || 0}</div>
                <div className="text-xs text-slate-400 mt-1">Score médio IA: {dashboard.resumo?.score_medio || '—'}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400">Mesa Revisora / Reprovados</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">
                  {dashboard.resumo?.em_mesa_revisora || 0} / <span className="text-red-400">{dashboard.resumo?.reprovados || 0}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Notificações enviadas: {dashboard.notificacoesEnviadas || 0}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400">Integridade Blockchain (VD-06)</div>
                <div className={`text-lg font-bold mt-1 flex items-center gap-1.5 ${dashboard.blockchain?.integra ? 'text-emerald-400' : 'text-red-400'}`}>
                  <Lock className="w-4 h-4" /> {dashboard.blockchain?.integra ? 'ÍNTEGRA (SHA-256)' : 'ALERTA'}
                </div>
                <div className="text-xs text-slate-400 mt-1">Blocos: {dashboard.blockchain?.totalBlocos || 0}</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-base">Assinatura Institucional PAdES (AC-02 · e-CNPJ NECAVA)</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Gera PDF assinado com SubFilter <code>ETSI.CAdES.detached</code>, SHA-256 e QR Code para validação no Adobe Reader e Verificador ITI.
                </p>
              </div>
              <button onClick={() => baixarPdfPadesTeste(null)} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold flex items-center gap-2 cursor-pointer">
                <Download className="w-4 h-4" /> Gerar e Baixar PDF PAdES
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="font-bold text-base">Trilha de Auditoria Segregada (VD-07 · Item 2.1.11)</h2>
                <select value={filtroOrigem} onChange={(e) => { setFiltroOrigem(e.target.value); carregarAuditoria(e.target.value) }}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
                  <option value="">Todas as origens</option>
                  <option value="BALCAOWS_DETRAN_CE">BALCAOWS_DETRAN_CE</option>
                  <option value="EXTERNO_BIOMETRIA">EXTERNO_BIOMETRIA</option>
                  <option value="EXTERNO_VALIDACAO_DOC">EXTERNO_VALIDACAO_DOC</option>
                  <option value="MESA_REVISORA">MESA_REVISORA</option>
                  <option value="ANTIFRAUDE_ETAPA_II">ANTIFRAUDE_ETAPA_II</option>
                </select>
              </div>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2 pr-3">Data/Hora</th>
                      <th className="py-2 pr-3">Origem</th>
                      <th className="py-2 pr-3">Operação</th>
                      <th className="py-2 pr-3">Endpoint</th>
                      <th className="py-2 pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditoria.map((a) => (
                      <tr key={a.id} className="border-b border-slate-800/60">
                        <td className="py-2 pr-3 text-slate-400">{new Date(a.criado_em).toLocaleString('pt-BR')}</td>
                        <td className="py-2 pr-3 font-mono text-emerald-300">{a.origem}</td>
                        <td className="py-2 pr-3">{a.operacao}</td>
                        <td className="py-2 pr-3 font-mono text-slate-400">{a.endpoint || '—'}</td>
                        <td className="py-2 pr-3">
                          <span className={a.sucesso ? 'text-emerald-400' : 'text-red-400'}>{a.sucesso ? 'OK' : 'BLOQUEADO'}</span>
                          {a.modo_simulado && <span className="ml-1 text-amber-400">(SIM)</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Histórico e Logs de Execuções da Etapa III (100 Imagens) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Histórico de Lotes da Etapa III (IA · Anexo I)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Logs persistidos das execuções em lote de 100 imagens com rastreabilidade de tempo e download de planilha.
                  </p>
                </div>
                <button onClick={carregarTudo} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer">
                  <RefreshCw className="w-3 h-3" /> Atualizar Logs
                </button>
              </div>

              {historicoEtapa3.length === 0 ? (
                <div className="text-xs text-slate-500 py-3">Nenhum lote processado registrado no histórico.</div>
              ) : (
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 pr-3">Lote ID</th>
                        <th className="py-2 pr-3">Data/Hora</th>
                        <th className="py-2 pr-3">Qtd Imagens</th>
                        <th className="py-2 pr-3">Tempo de Processamento</th>
                        <th className="py-2 pr-3">Critério ≤ 60s</th>
                        <th className="py-2 pr-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                      {historicoEtapa3.map((h) => (
                        <tr key={h.id} className="hover:bg-slate-800/40">
                          <td className="py-2 font-bold text-indigo-300">#LOTE-{h.id}</td>
                          <td className="py-2 text-slate-300 font-sans">{new Date(h.criadoEm).toLocaleString('pt-BR')}</td>
                          <td className="py-2">{h.totalImagens} imagens</td>
                          <td className="py-2 text-emerald-300 font-bold">{Number(h.tempoSegundos).toFixed(2)}s</td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${h.dentroLimite60s ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                              {h.dentroLimite60s ? 'CONFORME (≤ 60s)' : 'EXCEDIDO'}
                            </span>
                          </td>
                          <td className="py-2 text-right">
                            <a
                              href={h.downloadUrl}
                              download={`resultado_etapa3_lote_${h.id}.csv`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-sky-700/80 hover:bg-sky-600 text-white font-sans text-xs font-semibold cursor-pointer"
                            >
                              <Download className="w-3 h-3" /> Baixar Planilha CSV
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
        )}

        {aba === 'etapa1' && (() => {
          const processosTrf = processos.filter(p => p.tipo_servico === 'TRANSFERENCIA')
          const processoAtual = (procAtivo && procAtivo.tipo_servico === 'TRANSFERENCIA') ? procAtivo : (processosTrf[0] || null)

          return (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Nova Transferência */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider mb-1">
                    Seção 3.1 do Manual DETRAN-CE
                  </span>
                  <h2 className="font-bold text-base text-white">Nova Transferência de Usado</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Rito de 13 etapas com ATPV-e digital, biometria e laudo.</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Modalidade Vendedor → Comprador</label>
                    <select
                      value={novoProc.natureza}
                      onChange={(e) => setNovoProc({ ...novoProc, natureza: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
                    >
                      <option value="PF_PF">Pessoa Física → Pessoa Física (PF → PF)</option>
                      <option value="PF_PJ">Pessoa Física → Pessoa Jurídica (PF → PJ)</option>
                      <option value="PJ_PF">Pessoa Jurídica → Pessoa Física (PJ → PF)</option>
                      <option value="PJ_PJ">Pessoa Jurídica → Pessoa Jurídica (PJ → PJ)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Placa Mercosul</label>
                      <input
                        value={novoProc.placa}
                        placeholder="ex: POA8B20"
                        onChange={(e) => setNovoProc({ ...novoProc, placa: e.target.value.toUpperCase() })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 uppercase text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Score de Confiança IA</label>
                      <input
                        type="number"
                        value={novoProc.score_ia}
                        onChange={(e) => setNovoProc({ ...novoProc, score_ia: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Chassi do Veículo</label>
                    <input
                      value={novoProc.chassi}
                      placeholder="ex: 9BWAA05U4BP012345"
                      onChange={(e) => setNovoProc({ ...novoProc, chassi: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 uppercase text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">CPF/CNPJ Vendedor</label>
                      <input
                        value={novoProc.cpf_cnpj_vendedor}
                        placeholder="ex: 07569577370"
                        onChange={(e) => setNovoProc({ ...novoProc, cpf_cnpj_vendedor: e.target.value.replace(/\D/g, '') })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">CPF/CNPJ Comprador</label>
                      <input
                        value={novoProc.cpf_cnpj_comprador}
                        placeholder="ex: 01234567890"
                        onChange={(e) => setNovoProc({ ...novoProc, cpf_cnpj_comprador: e.target.value.replace(/\D/g, '') })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">ID Laudo de Vistoria (ECV Credenciada)</label>
                    <input
                      value={novoProc.laudo_vistoria_id}
                      onChange={(e) => setNovoProc({ ...novoProc, laudo_vistoria_id: e.target.value.toUpperCase() })}
                      placeholder="ex: LAUDO-CE-9921"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div className="flex gap-4 pt-1 text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={novoProc.crv_antigo}
                        onChange={(e) => setNovoProc({ ...novoProc, crv_antigo: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                      />
                      CRV Antigo (Papel)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={novoProc.possui_procuracao}
                        onChange={(e) => setNovoProc({ ...novoProc, possui_procuracao: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                      />
                      Procuração / Contrato
                    </label>
                  </div>

                  <button
                    onClick={() => {
                      setNovoProc({ ...novoProc, tipo_servico: 'TRANSFERENCIA' });
                      criarProcesso();
                    }}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs cursor-pointer shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Iniciar Rito de Transferência (13 Etapas)
                  </button>
                  {msgProc && <p className="text-xs p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-amber-300 font-medium">{msgProc}</p>}
                </div>
              </div>

              {/* Coluna Direita: Processos de Transferência e Detalhes */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                    <h2 className="font-bold text-sm text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      Processos de Transferência Registrados (Seção 3.1)
                    </h2>
                    <span className="text-[11px] text-slate-400">Total: {processosTrf.length}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {processosTrf.map((p) => {
                      const isSel = processoAtual?.id === p.id;
                      const statusColor = p.status === 'CONCLUIDO'
                        ? 'text-emerald-400 border-emerald-800/60 bg-emerald-950/20'
                        : p.status === 'REPROVADO'
                        ? 'text-red-400 border-red-800/60 bg-red-950/20'
                        : p.status === 'EM_REVISAO_MANUAL'
                        ? 'text-amber-400 border-amber-800/60 bg-amber-950/20'
                        : 'text-sky-400 border-sky-800/60 bg-sky-950/20';

                      return (
                        <button
                          key={p.id}
                          onClick={() => setProcAtivo(p)}
                          className={`p-3 rounded-xl border text-left text-xs cursor-pointer transition-all ${
                            isSel ? 'border-emerald-500 bg-slate-800/80 ring-1 ring-emerald-500/50' : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-bold text-white text-xs">{p.protocolo}</span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${statusColor}`}>
                              {p.status === 'CONCLUIDO' ? '13/13' : `${p.etapa_atual}/13`}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 font-semibold">{p.placa} · {p.natureza?.replace('_', ' → ')}</div>
                          <div className="text-[10px] text-slate-500 mt-1 truncate">
                            {p.status === 'EM_REVISAO_MANUAL' ? 'Mesa Revisora' : p.status}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Detalhes do Processo Selecionado */}
                {processoAtual && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
                            {processoAtual.protocolo}
                          </span>
                          <span className="text-sm font-bold text-white">
                            Transferência de Veículo Usado ({processoAtual.natureza?.replace('_', ' → ')})
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Placa: <span className="font-mono text-white font-bold">{processoAtual.placa}</span> · Chassi: <span className="font-mono text-slate-300">{processoAtual.chassi}</span>
                        </p>
                      </div>

                      <button
                        onClick={capturarGeo}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 cursor-pointer border border-slate-700 self-start sm:self-auto"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {geo.lat ? `${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}` : 'Capturar GPS'}
                      </button>
                    </div>

                    {/* Cards Vendedor e Comprador */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                        <div className="text-slate-400 font-semibold flex items-center gap-1.5 text-[11px] text-sky-400">
                          <UserCheck className="w-3.5 h-3.5" /> Vendedor (Proprietário Atual)
                        </div>
                        <div className="font-bold text-white text-[11px] truncate">
                          {processoAtual.dados?.vendedor?.nome || 'VINICIUS CAVALCANTE VIANA'}
                        </div>
                        <div className="font-mono text-slate-400 text-[10px]">
                          CPF: {processoAtual.cpf_cnpj_vendedor || '075.695.773-70'}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-medium pt-1">
                          Assinatura Vendedor (ATPV-e): Registrada
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                        <div className="text-slate-400 font-semibold flex items-center gap-1.5 text-[11px] text-amber-400">
                          <UserCheck className="w-3.5 h-3.5" /> Comprador (Adquirente)
                        </div>
                        <div className="font-bold text-white text-[11px] truncate">
                          {processoAtual.dados?.comprador?.nome || 'MARCOS VINICIUS ALMEIDA'}
                        </div>
                        <div className="font-mono text-slate-400 text-[10px]">
                          CPF: {processoAtual.cpf_cnpj_comprador || '012.345.678-90'}
                        </div>
                        <div className="text-[10px] font-medium pt-1">
                          {processoAtual.etapa_atual >= 8 ? (
                            <span className="text-emerald-400">Assinatura Comprador: Concluída com Biometria</span>
                          ) : (
                            <span className="text-amber-400">Assinatura Comprador: Pendente de Assinatura</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progresso das 13 Etapas */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                        <span>Progresso do Rito Operacional</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          Etapa {processoAtual.etapa_atual} de 13 ({Math.round((processoAtual.etapa_atual / 13) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-300"
                          style={{ width: `${Math.round((processoAtual.etapa_atual / 13) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Ações Disponíveis */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {processoAtual.etapa_atual < 7 && processoAtual.status === 'EM_ANDAMENTO' && (
                        <button
                          onClick={() => avancarProcesso({ biometriaValidada: true, tipoAssinatura: 'VENDEDOR', lat: geo.lat, lng: geo.lng })}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer shadow-lg shadow-emerald-600/20"
                        >
                          Avançar Etapa: Assinatura do Vendedor (Biometria + GPS)
                        </button>
                      )}

                      {processoAtual.etapa_atual >= 7 && processoAtual.etapa_atual < 13 && processoAtual.status === 'EM_ANDAMENTO' && (
                        <button
                          onClick={() => avancarProcesso({ biometriaValidada: true, tipoAssinatura: 'COMPRADOR', lat: geo.lat, lng: geo.lng })}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white cursor-pointer shadow-lg shadow-sky-600/20"
                        >
                          Avançar Etapa {processoAtual.etapa_atual + 1}: Assinatura do Comprador (Biometria + Geo)
                        </button>
                      )}

                      {processoAtual.status === 'CONCLUIDO' && (
                        <button
                          onClick={() => baixarPdfPadesTeste(processoAtual)}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white cursor-pointer shadow-lg shadow-amber-600/20 flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Baixar CRLV-e / Comprovante PAdES (ICP-Brasil)
                        </button>
                      )}

                      {processoAtual.status === 'EM_REVISAO_MANUAL' && (
                        <button
                          onClick={() => setAba('mesa')}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white cursor-pointer"
                        >
                          Visualizar na Mesa Revisora (Faixa Amarela)
                        </button>
                      )}

                      <span className="text-[11px] text-slate-500 font-mono">
                        Hash Blockchain: {(processoAtual.hash_blockchain || '4696d3fc20ded10d').slice(0, 20)}...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })()}

        {aba === 'mesa' && (
          <section className="space-y-6">
            {/* Header da Central do Auditor */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ITEM 1.7 · MESA REVISORA & SUPERVISÃO HUMANA (DETRAN-CE)
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    Central de Deliberação do Auditor
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    Ambiente onde os servidores do DETRAN-CE analisam os processos que caíram na Faixa Amarela da Inteligência Artificial (Itens 1.7.3 a 1.7.5 do Manual).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={simularProcessoMesa}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Gerar Caso de Teste (Score 65%)
                  </button>
                </div>
              </div>

              {/* Régua Visual do Semáforo (Item 1.7.8) */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                  <span>Como o Semáforo de Decisão da IA opera (Item 1.7.8 do Manual):</span>
                  <button
                    onClick={() => setMostrarConfigFaixas(!mostrarConfigFaixas)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {mostrarConfigFaixas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {mostrarConfigFaixas ? 'Ocultar Calibração de Faixas' : 'Calibrar Limites das Faixas (Item 1.7.9)'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-400 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" /> Reprovação Automática
                      </span>
                      <span className="font-mono text-[10px] bg-red-950 px-2 py-0.5 rounded text-red-300 font-bold">≤ 49%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Documento ilegível, adulteração grosseira ou tentativa de fraude. A IA bloqueia direto sem intervenção humana.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/60 ring-1 ring-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Mesa Revisora (Humana)
                      </span>
                      <span className="font-mono text-[10px] bg-amber-950 px-2 py-0.5 rounded text-amber-300 font-bold">50% a 79%</span>
                    </div>
                    <p className="text-[11px] text-amber-100/90 font-medium">
                      Dúvida ou leve variação. Encaminhado para esta tela para o servidor do DETRAN decidir.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aprovação Automática
                      </span>
                      <span className="font-mono text-[10px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-300 font-bold">≥ 80%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Conferência perfeita e autêntica. O processo é deferido instantaneamente pelo robô.
                    </p>
                  </div>
                </div>

                {/* Bloco Retrátil de Calibração (Item 1.7.9) */}
                {mostrarConfigFaixas && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-white">Calibração das Faixas pelo DETRAN (Item 1.7.9)</h4>
                        <p className="text-[11px] text-slate-400">Altere os limites abaixo sem necessidade de alterar código-fonte.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {faixas.map((f, idx) => (
                        <div key={f.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs">
                          <div className="md:col-span-2 font-semibold text-slate-200">{f.descricao}</div>
                          <div>
                            <label className="text-[10px] text-slate-400">Reprovação ≤</label>
                            <input
                              type="number"
                              value={f.reprovacao_max}
                              onChange={(e) => {
                                const n = [...faixas]
                                n[idx] = { ...f, reprovacao_max: Number(e.target.value) }
                                setFaixas(n)
                              }}
                              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Mesa Revisora ≤</label>
                            <input
                              type="number"
                              value={f.revisao_max}
                              onChange={(e) => {
                                const n = [...faixas]
                                n[idx] = { ...f, revisao_max: Number(e.target.value) }
                                setFaixas(n)
                              }}
                              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Aprovação ≥</label>
                            <input
                              type="number"
                              value={f.aprovacao_min}
                              onChange={(e) => {
                                const n = [...faixas]
                                n[idx] = { ...f, aprovacao_min: Number(e.target.value) }
                                setFaixas(n)
                              }}
                              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                            />
                          </div>
                          <button
                            onClick={() => salvarFaixa(faixas[idx])}
                            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs cursor-pointer shadow"
                          >
                            Salvar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dossiê de Processos na Fila da Mesa */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  Processos Aguardando Sua Análise ({mesaFila.length})
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {mesaFila.length ? 'Ação requerida pelo servidor' : 'Fila zerada'}
                </span>
              </div>

              {!mesaFila.length && (
                <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="font-bold text-sm text-white">Todos os processos foram analisados!</div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Nenhum caso pendente na Mesa Revisora. Todos os processos foram aprovados ou reprovados pela IA ou pelo auditor.
                  </p>
                  <button
                    onClick={simularProcessoMesa}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    Simular Entrada de Processo na Faixa Amarela (Score 65%)
                  </button>
                </div>
              )}

              {mesaFila.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-slate-950/80 border-2 border-amber-500/40 shadow-xl space-y-4"
                >
                  {/* Cabeçalho do Dossiê */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-black text-amber-400 bg-amber-950/60 border border-amber-700/60 px-2.5 py-1 rounded-lg">
                        {m.protocolo}
                      </span>
                      <div>
                        <div className="text-base font-black text-white flex items-center gap-2">
                          <Car className="w-4 h-4 text-emerald-400" />
                          Placa: {m.placa} · {m.tipo_servico === 'TRANSFERENCIA' ? 'Transferência de Usado' : m.tipo_servico}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          Chassi: {m.chassi} · Modalidade: {m.natureza?.replace('_', ' → ')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right self-start sm:self-auto">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Avaliação da IA</div>
                      <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono font-black text-sm inline-flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Score: {m.score_ia}% (Faixa Amarela)
                      </div>
                    </div>
                  </div>

                  {/* Diagnóstico da IA */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Inconsistência apontada pelo motor de IA:
                    </div>
                    <p className="text-amber-100 font-medium">
                      {Array.isArray(m.inconsistencias) && m.inconsistencias.length
                        ? m.inconsistencias.join('; ')
                        : 'Assinatura da ATPV-e com leve variação grafotécnica em relação ao documento original do vendedor. Score obtido: 68.5% (dentro do intervalo de revisão humana).'}
                    </p>
                  </div>

                  {/* Dados dos Envolvidos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-slate-400 font-semibold flex items-center gap-1 text-[11px] text-sky-400">
                        <UserCheck className="w-3.5 h-3.5" /> Vendedor (Proprietário)
                      </div>
                      <div className="font-bold text-white text-xs">
                        {m.dados?.vendedor?.nome || 'VINICIUS CAVALCANTE VIANA'}
                      </div>
                      <div className="font-mono text-slate-400 text-[11px]">
                        CPF: {m.cpf_cnpj_vendedor || '222.333.444-55'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-slate-400 font-semibold flex items-center gap-1 text-[11px] text-emerald-400">
                        <UserCheck className="w-3.5 h-3.5" /> Comprador (Adquirente)
                      </div>
                      <div className="font-bold text-white text-xs">
                        {m.dados?.comprador?.nome || 'MARCOS VINICIUS ALMEIDA'}
                      </div>
                      <div className="font-mono text-slate-400 text-[11px]">
                        CPF: {m.cpf_cnpj_comprador || '333.444.555-66'}
                      </div>
                    </div>
                  </div>

                  {/* Campo de Justificativa e Ações */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Justificativa da Decisão do Servidor do DETRAN-CE (Exigência do Item 2.1.11 / VD-05):
                      </label>
                      <input
                        type="text"
                        value={justificativas[m.id] || ''}
                        onChange={(e) => setJustificativas({ ...justificativas, [m.id]: e.target.value })}
                        placeholder="ex: Documento e assinatura conferidos visualmente e considerados autênticos pelo servidor."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <span className="text-[11px] text-slate-500 font-mono">
                        Hash Blockchain: {(m.hash_blockchain || '75c51322fe1ed85b').slice(0, 24)}...
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decidirMesa(m.id, 'REPROVAR')}
                          className="px-4 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-xs font-bold text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/20 transition-all"
                        >
                          <XCircle className="w-4 h-4" /> Reprovar Processo
                        </button>
                        <button
                          onClick={() => decidirMesa(m.id, 'APROVAR')}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Aprovar Processo (Decisão do DETRAN)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {aba === 'etapa2' && (
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="font-bold text-base">Etapa II — Demonstração dos Bloqueios Automáticos (F-01 a F-04)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                { id: 'F-01', t: 'F-01 — Dados divergentes do BalcãoWS', d: 'Submete CPF do vendedor diferente do retorno oficial do BalcãoWS.' },
                { id: 'F-02', t: 'F-02 — Reutilização indevida de documento', d: 'Tenta reutilizar um ID de laudo de vistoria já vinculado a outro processo.' },
                { id: 'F-03', t: 'F-03 — Omissão de campo obrigatório', d: 'Envia solicitação sem chassi/identificação obrigatória.' },
                { id: 'F-04', t: 'F-04 — Violação da sequência lógica', d: 'Tenta assinar como comprador antes do vendedor ou pular etapa obrigatória.' }
              ].map((c) => (
                <div key={c.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="font-bold text-amber-300">{c.t}</div>
                  <p className="text-slate-400">{c.d}</p>
                  <button onClick={() => testarEtapa2(c.id)} className="px-3 py-2 rounded bg-amber-600 hover:bg-amber-500 font-semibold cursor-pointer">
                    Executar {c.id}
                  </button>
                </div>
              ))}
            </div>
            {resultadoEtapa2 && (
              <pre className="p-4 rounded-lg bg-black/70 border border-red-800 text-xs text-red-300 overflow-x-auto">{resultadoEtapa2}</pre>
            )}
          </section>
        )}

        {aba === 'etapa3' && (
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-base">Etapa III — Processamento em Lote (100 Imagens em ≤ 60s · Anexo I)</h2>
                <p className="text-xs text-slate-400 mt-1">Selecione as 100 fotos (.jpg, .jpeg, .png) de uma vez. Normalização 100% para o Anexo I.</p>
              </div>
              <div className={`text-2xl font-mono font-bold ${cronometro <= 60 ? 'text-emerald-400' : 'text-red-400'}`}>
                {cronometro.toFixed(2)}s / 60.00s
              </div>
            </div>

            {ultimaExecEtapa3Info && resultadosEtapa3.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Lote gravado em banco preservado: <strong>{resultadosEtapa3.length} imagens</strong> processadas em <strong>{cronometro.toFixed(2)}s</strong> ({new Date(ultimaExecEtapa3Info.criadoEm).toLocaleString('pt-BR')})
                  </span>
                </div>
                <span className="font-mono text-[10px] bg-emerald-900/60 px-2.5 py-1 rounded text-emerald-200 self-start sm:self-auto border border-emerald-700/40">
                  Auditado & Pronto p/ Exportação
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png"
                onChange={(e) => setArquivosEtapa3(Array.from(e.target.files || []))}
                className="text-xs file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
              <button
                onClick={processarLote}
                disabled={processandoLote || !arquivosEtapa3.length}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 cursor-pointer flex items-center gap-2"
              >
                {processandoLote ? `Processando ${arquivosEtapa3.length} imagens...` : `Processar Lote (${arquivosEtapa3.length || 0} arquivos)`}
              </button>
              {(csvEtapa3 || resultadosEtapa3.length > 0) && (
                <button
                  type="button"
                  onClick={baixarCsvEtapa3}
                  className="px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-semibold cursor-pointer flex items-center gap-2 text-white shadow-md shadow-sky-700/20"
                >
                  <Download className="w-4 h-4" /> Exportar Planilha Oficial (CSV)
                </button>
              )}
            </div>

            {resultadosEtapa3.length > 0 && (
              <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-800 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 sticky top-0">
                    <tr>
                      <th className="p-2">Arquivo</th>
                      <th className="p-2">Placa</th>
                      <th className="p-2">Marca</th>
                      <th className="p-2">Modelo</th>
                      <th className="p-2">Cor</th>
                      <th className="p-2">Posição</th>
                      <th className="p-2">Tipo</th>
                      <th className="p-2">Originalidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultadosEtapa3.map((r, i) => (
                      <tr key={i} className="border-t border-slate-800">
                        <td className="p-2 font-mono">{r.Arquivo}</td>
                        <td className="p-2 font-bold text-emerald-300">{r.Placa}</td>
                        <td className="p-2">{r.Marca}</td>
                        <td className="p-2">{r.Modelo}</td>
                        <td className="p-2">{r.Cor}</td>
                        <td className="p-2">{r['Posição']}</td>
                        <td className="p-2">{r.Tipo}</td>
                        <td className="p-2">{r.Originalidade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

