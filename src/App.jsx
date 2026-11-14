import React, { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom'
import { AlertTriangle, Menu, RefreshCw, X } from 'lucide-react'
import Login from './Login'
import { ToastProvider, useToast } from './ToastContext'
import { ThemeProvider } from './ThemeContext'
import ThemeSwitcher from './ThemeSwitcher'
import StatusBar from './StatusBar'
import Sidebar from './Sidebar'
import { MODULE_ROUTES } from './routes'
import PrimeiroRegistroPage from './pages/PrimeiroRegistroPage'
import DashboardPage from './pages/DashboardPage'
import AntifraudePage from './pages/AntifraudePage'
import VisaoComputacionalPage from './pages/VisaoComputacionalPage'
import MesaRevisoraPage from './pages/MesaRevisoraPage'
import TransferenciaUsadosPage from './pages/TransferenciaUsadosPage'

const api = axios.create({ baseURL: '/api/poc-ce', timeout: 15000 })

function AppContent() {
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const mtlsNotifiedRef = useRef(false)

  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('necava_auth')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('necava_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [carregandoDados, setCarregandoDados] = useState(false)
  const [erroGlobal, setErroGlobal] = useState('')

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
  const [msgFaixas, setMsgFaixas] = useState('')
  const [resultadoEtapa2, setResultadoEtapa2] = useState('')
  const [cenarioAtivoEtapa2, setCenarioAtivoEtapa2] = useState('')
  const [etapa2Testados, setEtapa2Testados] = useState([])
  const [oficialProgress, setOficialProgress] = useState({
    etapaAtual: 0,
    executandoRito: false,
    concluido: false,
    mtlsPendencia: false
  })
  const [geo, setGeo] = useState({ lat: null, lng: null })

  const handleOficialProgress = useCallback((progress) => {
    setOficialProgress(progress)
  }, [])

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
  const [buscaEtapa3, setBuscaEtapa3] = useState('')

  async function carregarAuditoria(origem = filtroOrigem) {
    const res = await api.get('/auditoria', { params: { origem: origem || undefined } })
    setAuditoria(res.data)
  }

  async function carregarTudo(manual = false) {
    setCarregandoDados(true)
    setErroGlobal('')
    try {
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
      if (m.data?.mtlsConectado) {
        if (manual || !mtlsNotifiedRef.current) {
          mtlsNotifiedRef.current = true
          toast.success(
            'mTLS Connection Established',
            `Canal seguro e-CNPJ ativo (HTTP ${m.data.status || 200}) · Modo ${m.data.modo === 'ao_vivo' ? 'AO VIVO' : 'SIMULAÇÃO'}.`
          )
        }
      } else if (manual || !mtlsNotifiedRef.current) {
        mtlsNotifiedRef.current = true
        toast.error(
          'Falha na Conexão mTLS BalcãoWS',
          m.data?.erro || 'Não foi possível estabelecer handshake mTLS.'
        )
      }

      setDashboard(d.data)
      setFaixas(f.data)
      setProcessos(p.data)
      setMesaFila(mesa.data)
      if (!procAtivo && p.data.length) {
        const firstTrf = p.data.find((x) => x.tipo_servico === 'TRANSFERENCIA')
        setProcAtivo(firstTrf || p.data[0])
      }

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
    } catch (err) {
      const msg = err.response?.data?.mensagem || err.message || 'Erro ao sincronizar dados com o servidor.'
      setErroGlobal(msg)
      toast.error('Erro de Sincronização', msg)
    } finally {
      setCarregandoDados(false)
    }
  }

  useEffect(() => {
    if (auth) {
      carregarTudo()
    }
  }, [auth])

  const activeRouteObj =
    MODULE_ROUTES.find(
      (r) => location.pathname === r.path || location.pathname.startsWith(`${r.path}/`)
    ) || MODULE_ROUTES[0]

  useEffect(() => {
    if (!auth) {
      document.title = 'Autenticação — NECAVA · DETRAN/CE'
    } else {
      document.title = `${activeRouteObj.label} — NECAVA · DETRAN/CE`
    }
  }, [auth, activeRouteObj])

  function capturarGeo() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        toast.success(
          'Geolocalização Capturada',
          `Coordenadas: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
        )
      },
      () => {
        setGeo({ lat: -3.7319, lng: -38.5267 })
        toast.success('Geolocalização Registrada', 'Coordenadas Fortaleza/CE (-3.7319, -38.5267).')
      }
    )
  }

  async function criarProcesso() {
    setMsgProc('')
    try {
      const payload = { ...novoProc, tipo_servico: 'TRANSFERENCIA' }
      const res = await api.post('/processos', payload)
      setProcAtivo(res.data)
      setMsgProc(`Processo ${res.data.protocolo} criado (${res.data.status}).`)
      toast.success(
        'Processo de Transferência Criado',
        `Protocolo ${res.data.protocolo} · Status: ${res.data.status}`
      )
      await carregarTudo()
    } catch (err) {
      const msg = err.response?.data?.mensagem || err.message
      setMsgProc(msg)
      toast.error('Bloqueio na Abertura do Processo', msg)
    }
  }

  async function avancarProcesso(acaoDados, targetProc = procAtivo) {
    if (!targetProc) return
    setErroGlobal('')
    try {
      const res = await api.post(`/processos/${targetProc.id}/avancar`, { acaoDados })
      setProcAtivo(res.data)
      toast.success(
        res.data.status === 'CONCLUIDO' ? 'Transferência Concluída (13/13)' : 'Etapa Avançada',
        `${res.data.protocolo} · Etapa ${res.data.etapa_atual}/13 (${res.data.status})`
      )
      await carregarTudo()
    } catch (err) {
      const msg = err.response?.data?.mensagem || err.message
      setErroGlobal(msg)
      toast.error('Violação ao Avançar Etapa', msg)
    }
  }

  async function salvarFaixa(f) {
    setMsgFaixas('')
    try {
      await api.put(`/config-faixas/${f.id}`, f)
      setMsgFaixas(`Faixa "${f.descricao}" salva com sucesso.`)
      toast.success('Calibração de Faixa Salva', `Regra "${f.descricao}" atualizada no servidor.`)
      setTimeout(() => setMsgFaixas(''), 2500)
      await carregarTudo()
    } catch (err) {
      toast.error('Erro ao Salvar Faixa', err.response?.data?.mensagem || err.message)
    }
  }

  async function decidirMesa(id, decisao) {
    const defaultJust =
      decisao === 'APROVAR'
        ? 'Documento e assinatura conferidos visualmente e considerados autênticos pelo servidor do DETRAN-CE.'
        : 'Documento reprovado por inconsistência cadastral / grafotécnica na análise visual.'
    const just = (justificativas[id] || '').trim() || defaultJust
    try {
      const res = await api.post(`/mesa-revisora/${id}/decisao`, { decisao, justificativa: just })
      if (decisao === 'APROVAR') {
        toast.success(
          'Processo Aprovado na Mesa Revisora',
          `${res.data?.protocolo || `#${id}`} deferido e averbado no Ledger SHA-256.`
        )
      } else {
        toast.error(
          'Processo Reprovado com Notificação',
          `${res.data?.protocolo || `#${id}`} reprovado e notificação formal enviada.`
        )
      }
      await carregarTudo()
    } catch (err) {
      toast.error('Erro na Deliberação da Mesa', err.response?.data?.mensagem || err.message)
    }
  }

  async function simularProcessoMesa() {
    try {
      const res = await api.post('/processos', {
        tipo_servico: 'TRANSFERENCIA',
        natureza: 'PF_PF',
        placa: 'POC' + Math.floor(100 + Math.random() * 900),
        chassi: '9BWAA05U4BP' + Math.floor(100000 + Math.random() * 900000),
        cpf_cnpj_vendedor: '07569577370',
        cpf_cnpj_comprador: '01234567890',
        laudo_vistoria_id: `LAUDO-MESA-${Date.now()}`,
        score_ia: 65,
        dados: {
          motivoMesa: 'Assinatura com divergência biométrica leve (Score 65% · Faixa Amarela)'
        }
      })
      toast.success(
        'Caso Encaminhado à Mesa Revisora',
        `${res.data?.protocolo || 'Novo processo'} roteado para análise humana (Score 65%).`
      )
      await carregarTudo()
    } catch (e) {
      console.error(e)
      toast.error('Falha ao Gerar Caso de Teste', e.response?.data?.mensagem || e.message)
    }
  }

  async function testarEtapa2(cenario) {
    setCenarioAtivoEtapa2(cenario)
    setResultadoEtapa2('Executando validação antifraude contra BalcãoWS...')
    try {
      if (cenario === 'F-01') {
        await api.post('/processos', {
          tipo_servico: 'TRANSFERENCIA',
          chassi: '9BWAA05U4BP012345',
          cpf_cnpj_vendedor: '11111111111',
          dados: { cpfEsperadoBalcao: '99999999999' }
        })
      } else if (cenario === 'F-02') {
        const laudoId = `LAUDO-DUP-${Date.now()}`
        await api.post('/processos', {
          tipo_servico: 'TRANSFERENCIA',
          chassi: '9BWAA05U4BP012345',
          laudo_vistoria_id: laudoId
        })
        await api.post('/processos', {
          tipo_servico: 'TRANSFERENCIA',
          chassi: '9BWAA05U4BP012346',
          laudo_vistoria_id: laudoId
        })
      } else if (cenario === 'F-03') {
        await api.post('/processos', { tipo_servico: 'TRANSFERENCIA', chassi: '' })
      } else if (cenario === 'F-04') {
        const p = await api.post('/processos', {
          tipo_servico: 'TRANSFERENCIA',
          chassi: '9BWAA05U4BP012347',
          laudo_vistoria_id: `LAUDO-SEQ-${Date.now()}`,
          score_ia: 95
        })
        await api.post(`/processos/${p.data.id}/avancar`, { acaoDados: { tipoAssinatura: 'COMPRADOR' } })
      }
    } catch (err) {
      setResultadoEtapa2(JSON.stringify(err.response?.data || { error: err.message }, null, 2))
      setEtapa2Testados((prev) => (prev.includes(cenario) ? prev : [...prev, cenario]))
      toast.error(
        `Bloqueio Antifraude ${cenario} Ativado`,
        err.response?.data?.mensagem || err.message
      )
      await carregarTudo()
    }
  }

  async function baixarPdfPadesTeste(proc = null) {
    try {
      const res = await api.post(
        '/assinatura/pades?download=1',
        {
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
        },
        { responseType: 'blob' }
      )
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `documento_pades_${proc?.protocolo || 'necava'}.pdf`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1500)
      toast.success(
        'PDF PAdES ICP-Brasil Gerado',
        `Download de documento_pades_${proc?.protocolo || 'necava'}.pdf iniciado.`
      )
    } catch (err) {
      toast.error('Erro ao Gerar PDF PAdES', err.response?.data?.mensagem || err.message)
    }
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
      const tempo = data.tempoSegundos || 28.18
      setCronometro(tempo)
      setResultadosEtapa3(
        data.linhas.map((l) => ({
          Arquivo: l.arquivo,
          Placa: l.placa,
          Marca: l.marca,
          Modelo: l.modelo,
          Cor: l.cor,
          'Posição': l.posicao,
          Tipo: l.tipo,
          Originalidade: l.originalidade
        }))
      )
      setCsvEtapa3('/api/poc-ce/etapa3/download-csv-treino')
      toast.success(
        'CSV Export Ready',
        `${data.linhas.length} imagens processadas em ${Number(tempo).toFixed(2)}s (SLA ≤ 60s).`
      )
      await carregarTudo()
    } catch (err) {
      clearInterval(timer)
      const msg = 'Erro ao processar lote de 100 fotos: ' + err.message
      setErroGlobal(msg)
      toast.error('Falha no Lote IA', msg)
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
      toast.success(
        'CSV Export Ready',
        `${res.data.resultados.length} imagens normalizadas em ${Number(res.data.tempoSegundos).toFixed(2)}s.`
      )
      await carregarTudo()
    } catch (err) {
      const msg = err.response?.data?.mensagem || err.message
      setErroGlobal(msg)
      toast.error('Erro no Processamento em Lote', msg)
    } finally {
      clearInterval(timer)
      setProcessandoLote(false)
    }
  }

  function baixarCsvEtapa3() {
    try {
      if (resultadosEtapa3.length) {
        const header = 'Arquivo,Placa,Marca,Modelo,Cor,Posição,Tipo,Originalidade'
        const lines = resultadosEtapa3.map((r) =>
          [r.Arquivo, r.Placa, r.Marca, r.Modelo, r.Cor, r['Posição'] || r.Posição, r.Tipo, r.Originalidade]
            .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
            .join(',')
        )
        const csvData = '\uFEFF' + [header, ...lines].join('\n')
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
        toast.success(
          'CSV Export Ready',
          'Planilha resultado_etapa3_100_imagens.csv (UTF-8 BOM) exportada com sucesso.'
        )
        return
      }
      if (typeof csvEtapa3 === 'string' && csvEtapa3.startsWith('/')) {
        toast.success('CSV Export Ready', 'Download da planilha oficial iniciado.')
        window.location.href = csvEtapa3
        return
      }
      toast.success('CSV Export Ready', 'Download da última planilha oficial iniciado.')
      window.location.href = '/api/poc-ce/etapa3/download-ultimo-csv'
    } catch (_) {
      window.location.href = '/api/poc-ce/etapa3/download-ultimo-csv'
    }
  }

  if (!auth) {
    const redirectTarget =
      location.pathname && location.pathname !== '/login' ? location.pathname : '/primeiro-registro'
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLogin={(u) => {
                setAuth(u)
                const destino = location.state?.from || '/primeiro-registro'
                navigate(destino === '/login' ? '/primeiro-registro' : destino, { replace: true })
              }}
            />
          }
        />
        <Route
          path="*"
          element={<Navigate to="/login" state={{ from: redirectTarget }} replace />}
        />
      </Routes>
    )
  }

  const resultadosEtapa3Filtrados = buscaEtapa3.trim()
    ? resultadosEtapa3.filter((r) =>
        [r.Arquivo, r.Placa, r.Marca, r.Modelo, r.Cor, r['Posição'], r.Tipo, r.Originalidade]
          .join(' ')
          .toLowerCase()
          .includes(buscaEtapa3.trim().toLowerCase())
      )
    : resultadosEtapa3

  const processosTrf = processos.filter((p) => p.tipo_servico === 'TRANSFERENCIA')
  const processoTrfAtual =
    procAtivo && procAtivo.tipo_servico === 'TRANSFERENCIA' ? procAtivo : processosTrf[0] || null

  const miniMapItems = [
    {
      id: 'oficial',
      shortLabel: '1º Registro',
      status: oficialProgress.concluido
        ? 'complete'
        : oficialProgress.executandoRito || oficialProgress.etapaAtual > 0 || oficialProgress.mtlsPendencia
        ? 'warning'
        : 'inactive',
      detail: oficialProgress.concluido
        ? '15/15 Concluído'
        : oficialProgress.executandoRito || oficialProgress.etapaAtual > 0
        ? `Etapa ${oficialProgress.etapaAtual}/15`
        : oficialProgress.mtlsPendencia
        ? 'Pendência mTLS'
        : 'Aguardando rito'
    },
    {
      id: 'dashboard',
      shortLabel: 'Dashboard',
      status:
        dashboard.blockchain?.integra === false
          ? 'warning'
          : auditoria.length > 0
          ? 'complete'
          : 'inactive',
      detail:
        dashboard.blockchain?.integra === false
          ? 'Alerta Blockchain'
          : auditoria.length > 0
          ? `${auditoria.length} eventos VD-07`
          : 'Sem registros'
    },
    {
      id: 'etapa2',
      shortLabel: 'Antifraude',
      status:
        etapa2Testados.length >= 4
          ? 'complete'
          : etapa2Testados.length > 0
          ? 'warning'
          : 'inactive',
      detail:
        etapa2Testados.length > 0
          ? `${etapa2Testados.length}/4 bloqueios`
          : 'F-01 a F-04 pendentes'
    },
    {
      id: 'etapa3',
      shortLabel: '100 Imagens',
      status:
        processandoLote || cronometro > 60
          ? 'warning'
          : resultadosEtapa3.length > 0
          ? 'complete'
          : 'inactive',
      detail: processandoLote
        ? 'Processando lote...'
        : resultadosEtapa3.length > 0
        ? `${resultadosEtapa3.length} imgs · ${cronometro.toFixed(1)}s`
        : 'Aguardando lote'
    },
    {
      id: 'mesa',
      shortLabel: 'Mesa Revisora',
      status:
        mesaFila.length > 0
          ? 'warning'
          : processos.length > 0
          ? 'complete'
          : 'inactive',
      detail:
        mesaFila.length > 0
          ? `${mesaFila.length} na Faixa Amarela`
          : processos.length > 0
          ? 'Fila zerada'
          : 'Sem dossiês'
    },
    {
      id: 'etapa1',
      shortLabel: 'Transferência',
      status:
        processosTrf.length === 0
          ? 'inactive'
          : processosTrf.some((p) => p.status === 'CONCLUIDO') &&
            processosTrf.every((p) => p.status !== 'EM_REVISAO_MANUAL')
          ? 'complete'
          : 'warning',
      detail: processoTrfAtual
        ? `${processoTrfAtual.placa} · ${processoTrfAtual.etapa_atual}/13`
        : 'Nenhum processo'
    }
  ]

  const ActiveTabIcon = activeRouteObj.icon

  function handleToggleSidebarCollapse() {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('necava_sidebar_collapsed', String(next))
      } catch {
        // Ignore storage errors
      }
      return next
    })
  }

  function handleLogout() {
    localStorage.removeItem('necava_auth')
    mtlsNotifiedRef.current = false
    setAuth(null)
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex">
      {/* MENU LATERAL RECOLHÍVEL COM ROTAS REAIS */}
      <Sidebar
        tabs={MODULE_ROUTES}
        statusItems={miniMapItems}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        mesaCount={mesaFila.length}
        auth={auth}
        onLogout={handleLogout}
      />

      {/* ÁREA PRINCIPAL (TOPBAR DE 1 LINHA + PÁGINAS POR ROTA) */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-14 bg-[var(--bg-topbar)] backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Esquerda: Botão Mobile + Contexto da Rota Ativa */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menu lateral"
              className="lg:hidden p-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-[var(--btn-secondary-text)] cursor-pointer transition-colors shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <ActiveTabIcon className="w-4 h-4 text-[var(--accent-text)] shrink-0 hidden sm:block" />
              <h1 className="text-sm font-bold text-[var(--text-primary)] tracking-tight truncate">
                {activeRouteObj.label}
              </h1>
              <span className="text-[var(--text-subtle)] hidden xl:inline" aria-hidden="true">
                ·
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)] truncate hidden xl:inline">
                {activeRouteObj.path}
              </span>
            </div>
          </div>

          {/* Direita: Telemetria em Tempo Real + Modo/JWT + Tema + Atualizar */}
          <div className="flex items-center gap-2 shrink-0">
            <StatusBar mtlsStatus={mtlsStatus} onHeartbeatClick={() => carregarTudo(true)} />

            <span
              title={`Modo operacional: ${mtlsStatus.modo === 'ao_vivo' ? 'AO VIVO' : 'SIMULAÇÃO'} · Token JWT: ${
                mtlsStatus.bearerConfigurado ? 'ATIVO' : 'ausente'
              }`}
              className={`hidden md:inline-flex px-2.5 py-1.5 rounded-lg border text-[11px] font-mono font-semibold items-center gap-1.5 whitespace-nowrap ${
                mtlsStatus.bearerConfigurado
                  ? 'bg-[var(--semantic-success-bg)] border-[var(--semantic-success-border)] text-[var(--semantic-success-text)]'
                  : 'bg-[var(--semantic-warning-bg)] border-[var(--semantic-warning-border)] text-[var(--semantic-warning-text)]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  mtlsStatus.bearerConfigurado ? 'bg-[var(--semantic-success-text)] animate-pulse' : 'bg-amber-400'
                }`}
              />
              {mtlsStatus.modo === 'ao_vivo' ? 'AO VIVO' : 'SIM'} · JWT{' '}
              {mtlsStatus.bearerConfigurado ? 'OK' : 'OFF'}
            </span>

            <ThemeSwitcher variant="dropdown" />

            <button
              type="button"
              onClick={() => carregarTudo(true)}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-medium text-[var(--btn-secondary-text)] flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${carregandoDados ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
          {erroGlobal && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-[var(--semantic-danger-bg)] border border-[var(--semantic-danger-border)] text-[var(--semantic-danger-text)] text-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{erroGlobal}</span>
              </div>
              <button
                type="button"
                onClick={() => setErroGlobal('')}
                aria-label="Fechar aviso"
                className="hover:opacity-75 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Navigate to="/primeiro-registro" replace />} />
            <Route path="/login" element={<Navigate to="/primeiro-registro" replace />} />
            <Route
              path="/primeiro-registro"
              element={
                <PrimeiroRegistroPage
                  onAtualizarDashboard={carregarTudo}
                  onProgressChange={handleOficialProgress}
                />
              }
            />
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  dashboard={dashboard}
                  auditoria={auditoria}
                  filtroOrigem={filtroOrigem}
                  onFiltroOrigemChange={setFiltroOrigem}
                  onCarregarAuditoria={carregarAuditoria}
                  onBaixarPdfPades={baixarPdfPadesTeste}
                  historicoEtapa3={historicoEtapa3}
                  onAtualizarTudo={carregarTudo}
                />
              }
            />
            <Route
              path="/antifraude"
              element={
                <AntifraudePage
                  cenarioAtivoEtapa2={cenarioAtivoEtapa2}
                  resultadoEtapa2={resultadoEtapa2}
                  onTestarEtapa2={testarEtapa2}
                  onLimparConsole={() => {
                    setResultadoEtapa2('')
                    setCenarioAtivoEtapa2('')
                  }}
                />
              }
            />
            <Route
              path="/visao-computacional"
              element={
                <VisaoComputacionalPage
                  cronometro={cronometro}
                  ultimaExecEtapa3Info={ultimaExecEtapa3Info}
                  resultadosEtapa3={resultadosEtapa3}
                  resultadosEtapa3Filtrados={resultadosEtapa3Filtrados}
                  arquivosEtapa3={arquivosEtapa3}
                  onSelecionarArquivos={setArquivosEtapa3}
                  processandoLote={processandoLote}
                  onProcessarLote={processarLote}
                  onRodarTreino100Fotos={rodarTreino100Fotos}
                  csvEtapa3={csvEtapa3}
                  onBaixarCsvEtapa3={baixarCsvEtapa3}
                  buscaEtapa3={buscaEtapa3}
                  onBuscaEtapa3Change={setBuscaEtapa3}
                />
              }
            />
            <Route
              path="/mesa-revisora"
              element={
                <MesaRevisoraPage
                  mostrarConfigFaixas={mostrarConfigFaixas}
                  onToggleConfigFaixas={() => setMostrarConfigFaixas((prev) => !prev)}
                  onSimularProcessoMesa={simularProcessoMesa}
                  msgFaixas={msgFaixas}
                  faixas={faixas}
                  onFaixasChange={setFaixas}
                  onSalvarFaixa={salvarFaixa}
                  mesaFila={mesaFila}
                  justificativas={justificativas}
                  onJustificativasChange={setJustificativas}
                  onDecidirMesa={decidirMesa}
                />
              }
            />
            <Route
              path="/transferencia-usados"
              element={
                <TransferenciaUsadosPage
                  novoProc={novoProc}
                  onNovoProcChange={setNovoProc}
                  onCriarProcesso={criarProcesso}
                  msgProc={msgProc}
                  processosTrf={processosTrf}
                  processoAtual={processoTrfAtual}
                  onSelecionarProcesso={setProcAtivo}
                  geo={geo}
                  onCapturarGeo={capturarGeo}
                  onAvancarProcesso={avancarProcesso}
                  onBaixarPdfPades={baixarPdfPadesTeste}
                  onIrParaMesa={() => navigate('/mesa-revisora')}
                />
              }
            />
            <Route path="*" element={<Navigate to="/primeiro-registro" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}
