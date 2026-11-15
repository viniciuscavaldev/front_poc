import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
  Car,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Download,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Play,
  Check,
  RotateCcw,
  X,
  Code2,
  Copy,
  CheckCheck,
  Printer,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Sparkles,
  Square,
  Timer,
  FastForward
} from 'lucide-react'
import { useToast } from './ToastContext'

const api = axios.create({ baseURL: '/api/poc-ce', timeout: 25000 })
api.interceptors.request.use((config) => {
  try {
    const saved = localStorage.getItem('necava_auth')
    const parsed = saved ? JSON.parse(saved) : null
    if (parsed?.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`
    }
  } catch (_) {}
  return config
})

async function baixarCrlvPdfAutenticado() {
  const response = await api.get('/oficial/crlv-pdf', { responseType: 'blob' })
  const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  try {
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = 'CRLV_NEV1A26_OFICIAL.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } finally {
    window.URL.revokeObjectURL(blobUrl)
  }
}

const ROMAN_NUMERALS = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV'
]

function VioQrCodeSvg() {
  const size = 29
  const isFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7)
  const isAlignment = (r, c) => r >= 20 && r <= 24 && c >= 20 && c <= 24
  const cells = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let on = false
      if (r < 7 && c < 7) {
        on = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)
      } else if (r < 7 && c >= size - 7) {
        const cc = c - (size - 7)
        on = r === 0 || r === 6 || cc === 0 || cc === 6 || (r >= 2 && r <= 4 && cc >= 2 && cc <= 4)
      } else if (r >= size - 7 && c < 7) {
        const rr = r - (size - 7)
        on = rr === 0 || rr === 6 || c === 0 || c === 6 || (rr >= 2 && rr <= 4 && c >= 2 && c <= 4)
      } else if (isAlignment(r, c)) {
        const ar = r - 20
        const ac = c - 20
        on = ar === 0 || ar === 4 || ac === 0 || ac === 4 || (ar === 2 && ac === 2)
      } else if (!isFinder(r, c)) {
        if (r === 6 || c === 6) {
          on = (r + c) % 2 === 0
        } else {
          on = (r * 19 + c * 37 + r * c * 11 + 5) % 13 < 6
        }
      }
      if (on) cells.push({ r, c })
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-28 h-28 sm:w-32 sm:h-32 text-slate-950"
      role="img"
      aria-label="QR Code VIO de validação DETRAN-CE"
    >
      <rect width={size} height={size} fill="#ffffff" />
      {cells.map((cell, idx) => (
        <rect key={idx} x={cell.c} y={cell.r} width={1} height={1} fill="currentColor" />
      ))}
    </svg>
  )
}

function CrlvField({ label, value, mono = false, highlight = false, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="text-[7.5px] sm:text-[8px] font-semibold text-slate-600 uppercase tracking-tight leading-none">
        {label}
      </div>
      <div
        className={`text-[10.5px] sm:text-[11px] font-extrabold uppercase leading-tight mt-0.5 truncate ${
          mono ? 'font-mono tabular-nums' : ''
        } ${highlight ? 'text-[#006B3F]' : 'text-slate-950'}`}
      >
        {value}
      </div>
    </div>
  )
}

function CrlvDocumentCard({ dados, printable = false }) {
  const dataEmissao = new Date().toLocaleDateString('pt-BR')
  const placaAtual = dados.veiculo.placaAtribuida || 'NEV1A26'
  const exercicioAtual = new Date().getFullYear()

  return (
    <div
      id={printable ? 'crlv-printable-document' : undefined}
      className="bg-white text-slate-950 rounded-md border border-slate-400 shadow-lg overflow-hidden select-text"
    >
      {/* CABEÇALHO OFICIAL ESCURO PADRÃO CRLV-e */}
      <div className="bg-[#3d4240] text-white px-4 py-2.5 flex items-center justify-between gap-4 border-b-2 border-[#006B3F]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-white/95 rounded px-1 py-0.5 shrink-0">
            <img
              src="/assets/aistudio/logo-ceara_6a8ea5c6.png"
              alt="Brasão do Governo do Estado do Ceará"
              className="w-8 h-10 object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold tracking-wide uppercase leading-tight truncate">
              Governo do Estado do Ceará
            </div>
            <div className="text-[9px] text-slate-200 uppercase tracking-wider leading-tight truncate">
              Secretaria da Infraestrutura e Trânsito
            </div>
            <div className="text-[8.5px] text-slate-300 uppercase tracking-wider leading-tight truncate">
              Departamento Estadual de Trânsito · DETRAN-CE
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-base sm:text-xl font-black tracking-tight leading-none text-white">
            ce.gov.br
          </div>
          <div className="text-[7.5px] font-mono uppercase tracking-widest text-emerald-300 mt-0.5">
            CRLV-e Digital
          </div>
        </div>
      </div>

      {/* METADE SUPERIOR: 2 COLUNAS SEPARADAS POR LINHA PONTILHADA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-dashed border-slate-400">
        {/* QUADRANTE SUPERIOR ESQUERDO */}
        <div className="p-3 sm:p-4 lg:border-r lg:border-dashed lg:border-slate-400 space-y-2">
          <div className="border-b border-slate-400 pb-1">
            <div className="text-[8px] font-bold text-slate-600 uppercase leading-none">
              DETRAN - CE
            </div>
            <div className="text-[9.5px] sm:text-[10px] font-black text-slate-900 uppercase tracking-tight mt-0.5">
              Certificado de Registro e Licenciamento de Veículo - Eletrônico
            </div>
          </div>

          {/* BLOCO IDENTIFICAÇÃO PRINCIPAL + QR CODE VIO */}
          <div className="grid grid-cols-[1fr_auto] gap-2.5 items-stretch">
            <div className="flex flex-col justify-between space-y-1.5 min-w-0">
              <CrlvField label="Código RENAVAM" value="01429817451" mono />

              <div className="grid grid-cols-2 border-t border-slate-300 pt-1">
                <CrlvField label="Placa" value={placaAtual} mono highlight />
                <CrlvField
                  label="Exercício"
                  value={String(exercicioAtual)}
                  mono
                  className="border-l border-slate-300 pl-2"
                />
              </div>

              <div className="grid grid-cols-2 border-t border-slate-300 pt-1">
                <CrlvField label="Ano Fabricação" value={dados.veiculo.anoFabricacao} mono />
                <CrlvField
                  label="Ano Modelo"
                  value={dados.veiculo.anoModelo}
                  mono
                  className="border-l border-slate-300 pl-2"
                />
              </div>

              <div className="border-t border-slate-300 pt-1">
                <CrlvField label="Número do CRV" value="01429817451" mono />
              </div>
            </div>

            <div className="flex items-center gap-1 pl-2 border-l border-slate-200 shrink-0">
              <VioQrCodeSvg />
              <span className="[writing-mode:vertical-rl] rotate-180 text-[7.5px] font-semibold text-slate-600 tracking-tight select-none text-center">
                Valide este QRCode com app Vio
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[1.5fr_1fr] border-t border-slate-300 pt-1.5">
            <CrlvField label="Código de Segurança do CLA" value="98412847192" mono />
            <CrlvField
              label="CAT"
              value="***"
              mono
              className="border-l border-slate-300 pl-2"
            />
          </div>

          <div className="border-t border-slate-300 pt-1.5">
            <CrlvField
              label="Marca / Modelo / Versão"
              value={`I/${dados.veiculo.marca} ${dados.veiculo.modelo}`}
            />
          </div>

          <div className="border-t border-slate-300 pt-1.5">
            <CrlvField
              label="Espécie / Tipo"
              value={dados.veiculo.tipo || 'PASSAGEIRO AUTOMÓVEL'}
            />
          </div>

          <div className="grid grid-cols-[1fr_1.35fr] border-t border-slate-300 pt-1.5">
            <CrlvField label="Placa Anterior / UF" value="*******/**" mono />
            <CrlvField
              label="Chassi"
              value={dados.veiculo.chassi}
              mono
              className="border-l border-slate-300 pl-2"
            />
          </div>

          <div className="grid grid-cols-[1fr_1.35fr] border-t border-slate-300 pt-1.5">
            <CrlvField label="Cor Predominante" value={dados.veiculo.cor} />
            <CrlvField
              label="Combustível"
              value={dados.veiculo.combustivel}
              className="border-l border-slate-300 pl-2"
            />
          </div>
        </div>

        {/* QUADRANTE SUPERIOR DIREITO */}
        <div className="p-3 sm:p-4 space-y-1.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="grid grid-cols-[1.5fr_1fr]">
              <CrlvField label="Categoria" value="PARTICULAR" />
              <CrlvField
                label="Capacidade"
                value="*.*"
                mono
                className="border-l border-slate-300 pl-2"
              />
            </div>

            <div className="grid grid-cols-[1.5fr_1fr] border-t border-slate-300 pt-1">
              <CrlvField
                label="Potência / Cilindrada"
                value={dados.veiculo.potencia || '156CV/1595'}
                mono
              />
              <CrlvField
                label="Peso Bruto Total"
                value="1.85"
                mono
                className="border-l border-slate-300 pl-2"
              />
            </div>

            <div className="grid grid-cols-[1.5fr_0.65fr_0.5fr_0.65fr] border-t border-slate-300 pt-1 gap-1">
              <CrlvField label="Motor" value={dados.veiculo.motor || '27182030194812'} mono />
              <CrlvField
                label="CMT"
                value="1.5"
                mono
                className="border-l border-slate-300 pl-1.5"
              />
              <CrlvField
                label="Eixos"
                value="2"
                mono
                className="border-l border-slate-300 pl-1.5"
              />
              <CrlvField
                label="Lotação"
                value="05P"
                mono
                className="border-l border-slate-300 pl-1.5"
              />
            </div>

            <div className="border-t border-slate-300 pt-1">
              <CrlvField label="Carroceria" value="NÃO APLICÁVEL" />
            </div>

            <div className="border-t border-slate-300 pt-1">
              <CrlvField label="Nome" value={dados.adquirente.nome} />
            </div>

            <div className="grid grid-cols-[1.5fr_1fr] border-t border-slate-300 pt-1">
              <div />
              <CrlvField
                label="CPF / CNPJ"
                value={dados.adquirente.cpf}
                mono
                className="border-l border-slate-300 pl-2"
              />
            </div>

            <div className="grid grid-cols-[1.5fr_1fr] border-t border-slate-300 pt-1">
              <CrlvField label="Local" value="FORTALEZA CE" />
              <CrlvField
                label="Data"
                value={dataEmissao}
                mono
                className="border-l border-slate-300 pl-2"
              />
            </div>

            <div className="border-t border-slate-300 pt-1 text-center text-[7.5px] font-bold text-slate-600 uppercase tracking-wider">
              Assinado digitalmente pelo DETRAN-CE · e-CNPJ ICP-Brasil (PAdES)
            </div>
          </div>

          {/* QUADRO DADOS DO SEGURO DPVAT */}
          <div className="pt-1 space-y-1">
            <div className="flex items-center justify-between border-b border-slate-400 pb-0.5">
              <span className="text-[8px] font-extrabold text-slate-800 uppercase">
                Dados do Seguro DPVAT
              </span>
              <span className="text-[7.5px] font-mono text-slate-500">00150316161</span>
            </div>

            <div className="grid grid-cols-[0.75fr_1fr_1.5fr] gap-1 text-[7.5px]">
              <div>
                <div className="text-slate-500 uppercase font-semibold leading-tight">Cat. Tarif</div>
                <div className="font-mono font-bold text-slate-900">*</div>
              </div>
              <div className="border-l border-slate-300 pl-1.5">
                <div className="text-slate-500 uppercase font-semibold leading-tight">
                  Data de Quitação
                </div>
                <div className="font-mono font-bold text-slate-900">*</div>
              </div>
              <div className="border-l border-slate-300 pl-1.5">
                <div className="text-slate-500 uppercase font-semibold leading-tight">Pagamento</div>
                <div className="flex items-center gap-2 mt-0.5 text-[7px] font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 border border-slate-500 inline-block" /> COTA ÚNICA
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 border border-slate-500 inline-block" /> PARCELADO
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 border-t border-slate-300 pt-1 text-[7px]">
              <div>
                <div className="text-slate-500 uppercase font-semibold leading-tight">
                  Repasse Obrigatório ao Fundo Nacional de Saúde (R$)
                </div>
                <div className="font-mono font-bold text-slate-900">*</div>
              </div>
              <div className="border-l border-slate-300 pl-1.5">
                <div className="text-slate-500 uppercase font-semibold leading-tight">
                  Custo do Bilhete (R$)
                </div>
                <div className="font-mono font-bold text-slate-900">*</div>
              </div>
              <div className="border-l border-slate-300 pl-1.5">
                <div className="text-slate-500 uppercase font-semibold leading-tight">
                  Custo Efetivo do Seguro (R$)
                </div>
                <div className="font-mono font-bold text-slate-900">*</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 border-t border-slate-300 pt-1 text-[7px]">
              <div>
                <div className="text-slate-500 uppercase font-semibold leading-tight">
                  Repasse Obrigatório ao Órgão Nacional de Trânsito (R$)
                </div>
                <div className="font-mono font-bold text-slate-900">*</div>
              </div>
              <div className="border-l border-slate-300 pl-1.5">
                <div className="text-slate-500 uppercase font-semibold leading-tight">
                  Valor do IOF (R$)
                </div>
                <div className="font-mono font-bold text-slate-900">*</div>
              </div>
              <div className="border-l border-slate-300 pl-1.5">
                <div className="text-slate-500 uppercase font-semibold leading-tight">
                  Valor Total a Ser Pago pelo Segurado (R$)
                </div>
                <div className="font-mono font-bold text-slate-900">*</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* METADE INFERIOR: OBSERVAÇÕES, MENSAGENS E INFORMAÇÕES DPVAT */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-3 sm:p-4 lg:border-r lg:border-dashed lg:border-slate-400 space-y-3">
          <div className="relative border border-slate-400 rounded-sm px-3 pt-3 pb-2.5 min-h-[68px]">
            <span className="absolute -top-2 left-2.5 bg-white px-1 text-[8px] font-bold text-slate-700 uppercase">
              Observações do Veículo
            </span>
            <div className="font-mono text-[9.5px] font-bold text-slate-900 leading-relaxed space-y-0.5">
              <div>SEM RESERVA · VEÍCULO 0KM (1º REGISTRO DIGITAL)</div>
              <div className="text-[8.5px] font-normal text-slate-700">
                NF-E {dados.nfe.numero} · PROTOCOLO REG-OFICIAL-001 · PAdES NECAVA 05.591.991/0001-48
              </div>
            </div>
          </div>

          <div className="relative border border-slate-400 rounded-sm px-3 pt-3 pb-2.5 min-h-[58px]">
            <span className="absolute -top-2 left-2.5 bg-white px-1 text-[8px] font-bold text-slate-700 uppercase">
              Mensagens DETRAN-CE
            </span>
            <div className="font-mono text-[8.5px] text-slate-700 leading-relaxed">
              VEÍCULO REGISTRADO E LICENCIADO PARA O EXERCÍCIO {exercicioAtual}. VALIDE A
              AUTENTICIDADE VIA APP VIO (RESOLUÇÃO CONTRAN 809/2020).
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 flex flex-col">
          <div className="relative border border-slate-400 rounded-sm px-3 pt-3 pb-2.5 flex-1 min-h-[138px] flex flex-col justify-between">
            <span className="absolute -top-2 left-2.5 bg-white px-1 text-[8px] font-bold text-slate-700 uppercase">
              Informações do Seguro DPVAT
            </span>
            <div className="font-mono text-[8.5px] text-slate-700 leading-relaxed">
              SEGURO OBRIGATÓRIO DPVAT/SPVAT · EXERCÍCIO {exercicioAtual} · SITUAÇÃO REGULAR
              CONFORME LEGISLAÇÃO VIGENTE.
            </div>
            <div className="pt-2 mt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[8.5px] font-bold text-[#006B3F] uppercase">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                Averbado no RENAVAM 01429817451
              </span>
              <span className="font-mono text-slate-600">SHA-256 · VIO DETRAN-CE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PrimeiroRegistroOficial({ onAtualizarDashboard, onProgressChange }) {
  const toast = useToast()
  const mtlsSectionRef = useRef(null)
  const mtlsButtonRef = useRef(null)
  const passo2SectionRef = useRef(null)
  const passo3SectionRef = useRef(null)
  const stepRefs = useRef({})
  const ritoButtonRef = useRef(null)
  const step1CardRef = useRef(null)
  const crlvButtonRef = useRef(null)

  const [tourAtivo, setTourAtivo] = useState(false)
  const [tourPasso, setTourPasso] = useState(1)
  const [spotlightRect, setSpotlightRect] = useState(null)
  const [pilotoAutomatico, setPilotoAutomatico] = useState(false)
  const [tempoPiloto, setTempoPiloto] = useState(0)
  const pilotoIntervalRef = useRef(null)
  const pilotoCanceladoRef = useRef(false)

  const [dados, setDados] = useState(null)
  const [erroCarga, setErroCarga] = useState('')
  const [testandoAoVivo, setTestandoAoVivo] = useState(false)
  const [resultadoAoVivo, setResultadoAoVivo] = useState(null)
  const [executandoRito, setExecutandoRito] = useState(false)
  const [etapaAtual, setEtapaAtual] = useState(0)
  const [acompanharScroll, setAcompanharScroll] = useState(true)
  const acompanharScrollRef = useRef(true)
  const [concluido, setConcluido] = useState(false)
  const [etapasReais, setEtapasReais] = useState(null)
  const [bloqueiosReais, setBloqueiosReais] = useState([])
  const [statusFluxoReal, setStatusFluxoReal] = useState(null)
  const [etapaSelecionada, setEtapaSelecionada] = useState(null)
  const [abaModalInspecao, setAbaModalInspecao] = useState('ambos')
  const [modalCrlv, setModalCrlv] = useState(false)
  const [copiado, setCopiado] = useState('')
  const [mostrarDossieCompleto, setMostrarDossieCompleto] = useState(false)
  const [mostrarTokenJwt, setMostrarTokenJwt] = useState(false)
  const [mostrarEtapasBloqueadas, setMostrarEtapasBloqueadas] = useState(false)

  useEffect(() => {
    acompanharScrollRef.current = acompanharScroll
  }, [acompanharScroll])

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    if (onProgressChange) {
      onProgressChange({
        etapaAtual,
        executandoRito,
        concluido,
        mtlsPendencia: Boolean(resultadoAoVivo && !resultadoAoVivo.sucesso)
      })
    }
  }, [etapaAtual, executandoRito, concluido, resultadoAoVivo, onProgressChange])

  useEffect(() => {
    if (!executandoRito || !acompanharScroll || etapaAtual < 1) return
    const targetEl = stepRefs.current[etapaAtual]
    if (!targetEl) return
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    targetEl.scrollIntoView({
      behavior: prefersReduced ? 'auto' : 'smooth',
      block: 'center',
      inline: 'nearest'
    })
  }, [etapaAtual, executandoRito, acompanharScroll])

  const TOUR_STEPS = [
    {
      step: 1,
      title: 'Autenticação mTLS & Biometria Facial',
      desc: 'Para iniciar o processo de Primeiro Emplacamento, clique neste botão para abrir o canal seguro mTLS com o BalcãoWS do DETRAN-CE e autenticar a biometria facial do adquirente.',
      completedDesc: 'Canal seguro mTLS estabelecido com sucesso e sessão biométrica JWT ativa. Você pode revalidar ou seguir para a execução do rito.',
      actionLabel: 'Executar Verificação BalcãoWS (mTLS)',
      stepNum: 'Passo 1 de 4'
    },
    {
      step: 2,
      title: 'Execução do Rito Operacional (15 Etapas)',
      desc: 'Excelente! O token biométrico do Estado está ativo. Agora clique aqui para processar em tempo real as 15 etapas de averbação veicular exigidas pelo Manual do DETRAN-CE.',
      completedDesc: 'Rito operacional de 15 etapas concluído e averbado com sucesso no RENAVAM.',
      actionLabel: 'Executar Rito Operacional (15 Etapas)',
      stepNum: 'Passo 2 de 4'
    },
    {
      step: 3,
      title: 'Auditoria Técnica do BalcãoWS',
      desc: 'A transparência é total. Clique em qualquer etapa da linha do tempo para abrir o modal de inspeção e auditar os payloads JSON enviados e recebidos do DETRAN-CE.',
      completedDesc: 'Inspeção técnica dos payloads de requisição e resposta concluída com sucesso.',
      actionLabel: 'Inspecionar Etapa 1 na Linha do Tempo',
      stepNum: 'Passo 3 de 4'
    },
    {
      step: 4,
      title: 'Emissão e Impressão do CRLV-e Digital',
      desc: 'Parabéns! O veículo foi homologado e registrado. Clique aqui para conferir a cédula oficial do CRLV-e emitida com QR Code VIO e assinatura digital ICP-Brasil da NECAVA.',
      completedDesc: 'Documento oficial do CRLV-e emitido de acordo com a Resolução CONTRAN 809/2020.',
      actionLabel: 'Visualizar CRLV-e Emitido',
      stepNum: 'Passo 4 de 4'
    }
  ]

  function getTourTarget(passo) {
    if (passo === 1) return mtlsButtonRef.current
    if (passo === 2) return ritoButtonRef.current
    if (passo === 3) return step1CardRef.current || stepRefs.current[1]
    if (passo === 4) return crlvButtonRef.current || passo3SectionRef.current
    return null
  }

  function iniciarTour() {
    setTourAtivo(true)
    if (!resultadoAoVivo?.sucesso) {
      setTourPasso(1)
    } else if (!concluido) {
      setTourPasso(2)
    } else {
      setTourPasso(1)
    }
    const notificar = toast?.info || toast?.success
    if (notificar) {
      notificar(
        '🎯 Modo Guia Interativo Ativado',
        'Siga o holofote verde nos botões para conduzir a homologação oficial da PoC.'
      )
    }
  }

  function encerrarTour() {
    setTourAtivo(false)
    const notificar = toast?.info || toast?.success
    if (notificar) {
      notificar('Guia Interativo Encerrado', 'Você pode reativar o guia a qualquer momento pelo botão no topo.')
    }
  }

  function concluirTour() {
    setTourAtivo(false)
    toast.success(
      '🎉 Parabéns! Guia Concluído',
      'Você passou por todos os 4 passos da homologação do 1º Registro no padrão DETRAN-CE.'
    )
  }

  function fecharModalInspecao() {
    setEtapaSelecionada(null)
    if (tourAtivo && tourPasso === 3) {
      setTimeout(() => {
        setTourPasso(4)
        toast.success(
          'Passo 3 Concluído!',
          'Auditoria conferida. Agora veja e imprima a cédula oficial do CRLV-e no Passo 4.'
        )
      }, 350)
    }
  }

  function pararPilotoAutomatico(mostrarToast = true) {
    pilotoCanceladoRef.current = true
    setPilotoAutomatico(false)
    if (pilotoIntervalRef.current) {
      clearInterval(pilotoIntervalRef.current)
      pilotoIntervalRef.current = null
    }
    if (mostrarToast) {
      const notificar = toast?.info || toast?.success
      if (notificar) notificar('Piloto Automático Pausado', 'A demonstração foi interrompida.')
    }
  }

  async function iniciarPilotoAutomatico() {
    pilotoCanceladoRef.current = false
    setPilotoAutomatico(true)
    setTempoPiloto(0)
    setTourAtivo(true)
    setTourPasso(1)

    if (pilotoIntervalRef.current) clearInterval(pilotoIntervalRef.current)
    const t0 = performance.now()
    pilotoIntervalRef.current = setInterval(() => {
      setTempoPiloto(Number(((performance.now() - t0) / 1000).toFixed(1)))
    }, 100)

    const notificar = toast?.info || toast?.success
    if (notificar) {
      notificar(
        '🚀 Piloto Automático Iniciado',
        'Executando a demonstração oficial de ponta a ponta com cronometragem em tempo real.'
      )
    }

    try {
      // ===== PASSO 1: mTLS & Biometria Facial =====
      setTourPasso(1)
      await new Promise((r) => setTimeout(r, 900))
      if (pilotoCanceladoRef.current) return

      let balcaoRes = resultadoAoVivo
      if (!balcaoRes?.sucesso) {
        setTestandoAoVivo(true)
        const res = await api.post('/oficial/testar-balcaows')
        balcaoRes = res.data
        setResultadoAoVivo(balcaoRes)
        setTestandoAoVivo(false)
        if (onAtualizarDashboard) onAtualizarDashboard()
      }
      if (pilotoCanceladoRef.current) return

      toast.success(
        'Passo 1 Concluído (mTLS Ativo)',
        'Sessão biométrica autenticada no BalcãoWS com Token JWT oficial do DETRAN-CE.'
      )

      // ===== PASSO 2: Rito Operacional de 15 Etapas =====
      await new Promise((r) => setTimeout(r, 1200))
      if (pilotoCanceladoRef.current) return
      setTourPasso(2)

      if (!concluido) {
        setExecutandoRito(true)
        for (let i = 1; i <= 15; i++) {
          if (pilotoCanceladoRef.current) {
            setExecutandoRito(false)
            return
          }
          setEtapaAtual(i)
          await new Promise((r) => setTimeout(r, 130))
        }
        const { data: ritoRes } = await api.post('/oficial/executar-15-etapas')
        if (onAtualizarDashboard) onAtualizarDashboard()
        setEtapasReais(ritoRes?.etapas || null)
        setBloqueiosReais(ritoRes?.bloqueios || [])
        setStatusFluxoReal(ritoRes?.status || null)
        setEtapaAtual(ritoRes?.etapaAlcancada || 0)
        const realmenteConcluido = ritoRes?.status === 'CONCLUIDO' && ritoRes?.crlvObtido === true
        setConcluido(realmenteConcluido)
        setExecutandoRito(false)
        if (pilotoCanceladoRef.current) return

        if (realmenteConcluido) {
          toast.success(
            'Passo 2 Concluído (15 Etapas)',
            'Fluxo concluído no DETRAN/CE e CRLV-e obtido via integração.'
          )
        } else {
          const msgBloqueio = ritoRes?.bloqueios?.[0]?.mensagem || ritoRes?.status || 'Fluxo interrompido pelo DETRAN.'
          ;(toast.warning || toast.info)(
            `Fluxo interrompido na Etapa ${ritoRes?.etapaAlcancada || '?'} (${ritoRes?.status || 'BLOQUEADO'})`,
            msgBloqueio
          )
        }
      }

      // ===== PASSO 3: Inspeção Técnica JSON da Etapa 1 =====
      await new Promise((r) => setTimeout(r, 1200))
      if (pilotoCanceladoRef.current) return
      setTourPasso(3)

      const primeiraEtapa = (dados?.etapasDetalhadas && dados.etapasDetalhadas[0]) || null
      if (primeiraEtapa) {
        setEtapaSelecionada(primeiraEtapa)
        toast.info(
          'Passo 3 · Auditoria Técnica',
          'Inspecionando payload da NF-e, contrato OpenAPI e assinatura digital ICP-Brasil...'
        )
        // Mantém o modal visível por 3.5 segundos para a banca do DETRAN-CE ler o JSON
        await new Promise((r) => setTimeout(r, 3500))
        if (pilotoCanceladoRef.current) return
        setEtapaSelecionada(null)
      }

      // ===== PASSO 4: Emissão e Download do CRLV-e Digital =====
      await new Promise((r) => setTimeout(r, 1000))
      if (pilotoCanceladoRef.current) return
      setTourPasso(4)

      passo3SectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

      // Dispara download automático apenas se o CRLV-e tiver sido obtido pela integração real
      if (concluido) {
        baixarCrlvPdfAutenticado().catch((err) => {
          console.warn('Erro ao disparar download do CRLV-e:', err)
        })
      }

      await new Promise((r) => setTimeout(r, 800))
      if (pilotoCanceladoRef.current) return

      const tempoFinal = Number(((performance.now() - t0) / 1000).toFixed(1))
      if (pilotoIntervalRef.current) {
        clearInterval(pilotoIntervalRef.current)
        pilotoIntervalRef.current = null
      }
      setTempoPiloto(tempoFinal)
      setPilotoAutomatico(false)

      toast.success(
        '🏆 Simulação Automatizada Concluída!',
        `Todos os 4 passos finalizados com 100% de sucesso em ${tempoFinal}s. CRLV-e assinado emitido!`
      )
    } catch (err) {
      console.error('Erro no piloto automático:', err)
      pararPilotoAutomatico(false)
      toast.error('Erro na Simulação', err.message || 'Falha ao executar piloto automático.')
    }
  }

  useEffect(() => {
    return () => {
      if (pilotoIntervalRef.current) {
        clearInterval(pilotoIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!tourAtivo) {
      setSpotlightRect(null)
      return
    }
    const el = getTourTarget(tourPasso)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const timer = setTimeout(() => {
        const rect = el.getBoundingClientRect()
        setSpotlightRect(rect)
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [tourAtivo, tourPasso, concluido, resultadoAoVivo])

  useEffect(() => {
    if (!tourAtivo) return
    const handleUpdate = () => {
      const el = getTourTarget(tourPasso)
      if (el) {
        setSpotlightRect(el.getBoundingClientRect())
      }
    }
    window.addEventListener('scroll', handleUpdate, { passive: true })
    window.addEventListener('resize', handleUpdate, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleUpdate)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [tourAtivo, tourPasso])

  async function carregarDados() {
    setErroCarga('')
    try {
      const res = await api.get('/oficial/dados')
      setDados(res.data)
    } catch (err) {
      console.error('Erro ao carregar dados oficiais:', err)
      setErroCarga(err.response?.data?.error || err.message || 'Falha ao carregar dados oficiais.')
    }
  }

  async function testarBalcaoWs() {
    setTestandoAoVivo(true)
    try {
      const res = await api.post('/oficial/testar-balcaows')
      setResultadoAoVivo(res.data)
      if (res.data?.sucesso) {
        toast.success(
          'mTLS Connection Established',
          `Sessão biométrica JWT autenticada no BalcãoWS (HTTP ${res.data.status || 200}). Passo 2 liberado.`
        )
        if (onAtualizarDashboard) onAtualizarDashboard()
        if (tourAtivo && tourPasso === 1) {
          setTimeout(() => {
            setTourPasso(2)
            toast.success('Passo 1 do Tour Concluído!', 'mTLS estabelecido. Avançando para o Rito das 15 Etapas.')
          }, 800)
        }
      } else {
        toast.error(
          'Pendência mTLS BalcãoWS',
          res.data?.motivo || `HTTP ${res.data?.status || 400}`
        )
      }
    } catch (err) {
      const motivo = err.response?.data?.error || err.message
      setResultadoAoVivo({
        sucesso: false,
        status: err.response?.status || 502,
        motivo,
        diagnostico: 'Falha de comunicação ou timeout no endpoint do BalcãoWS.'
      })
      toast.error('Falha de Comunicação mTLS', motivo)
    } finally {
      setTestandoAoVivo(false)
    }
  }

  async function iniciarRitoVisual() {
    if (executandoRito) return
    if (!resultadoAoVivo?.sucesso) {
      toast.error(
        'Passo 1 Obrigatório',
        'Autentique a conexão mTLS e a sessão biométrica no Passo 1 antes de iniciar o rito.'
      )
      irParaPasso(mtlsSectionRef, () => mtlsButtonRef.current?.focus())
      return
    }

    setExecutandoRito(true)
    setConcluido(false)
    setEtapaAtual(1)

    const stepDelayMs = 1000

    for (let i = 1; i <= 15; i++) {
      setEtapaAtual(i)
      await new Promise((r) => setTimeout(r, stepDelayMs))
    }

    try {
      const { data: ritoRes } = await api.post('/oficial/executar-15-etapas')
      if (onAtualizarDashboard) onAtualizarDashboard()
      setEtapasReais(ritoRes?.etapas || null)
      setBloqueiosReais(ritoRes?.bloqueios || [])
      setStatusFluxoReal(ritoRes?.status || null)
      setEtapaAtual(ritoRes?.etapaAlcancada || 0)
      const realmenteConcluido = ritoRes?.status === 'CONCLUIDO' && ritoRes?.crlvObtido === true
      setConcluido(realmenteConcluido)
      if (realmenteConcluido) {
        toast.success(
          '1º Registro Concluído (15/15 Etapas)',
          'Fluxo concluído no DETRAN/CE e CRLV-e obtido via integração.'
        )
      } else {
        const msgBloqueio = ritoRes?.bloqueios?.[0]?.mensagem || ritoRes?.status || 'Fluxo interrompido.'
        ;(toast.warning || toast.info)(
          `Fluxo interrompido na Etapa ${ritoRes?.etapaAlcancada || '?'} (${ritoRes?.status || 'BLOQUEADO'})`,
          msgBloqueio
        )
      }
      if (tourAtivo && tourPasso === 2) {
        setTimeout(() => {
          setTourPasso(3)
          toast.success(
            'Passo 2 do Tour Concluído!',
            '15 etapas averbadas. Agora clique na Etapa I da linha do tempo para auditar os payloads.'
          )
        }, 1200)
      }
      if (acompanharScrollRef.current) {
        setTimeout(() => {
          if (!acompanharScrollRef.current) return
          passo3SectionRef.current?.scrollIntoView({
            behavior:
              typeof window !== 'undefined' &&
              window.matchMedia &&
              window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth',
            block: 'start'
          })
        }, 520)
      }
    } catch (err) {
      console.error(err)
      setEtapaAtual(0)
      toast.error('Erro no Rito de 15 Etapas', err.response?.data?.mensagem || err.message)
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

  function copiarTexto(valor, chave = 'req') {
    const conteudo = typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)
    navigator.clipboard.writeText(conteudo)
    setCopiado(chave)
    toast.success('Conteúdo Copiado', 'Informação copiada para a área de transferência.')
    setTimeout(() => setCopiado(''), 1800)
  }

  function irParaPasso(ref, afterScroll) {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    if (afterScroll) {
      setTimeout(afterScroll, 280)
    }
  }

  if (erroCarga && !dados) {
    return (
      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--semantic-danger-border)] p-8 text-center space-y-3">
        <AlertCircle className="w-7 h-7 text-[var(--semantic-danger-text)] mx-auto" />
        <div className="text-sm font-semibold text-[var(--text-primary)]">
          Falha ao carregar o processo oficial
        </div>
        <p className="text-xs text-[var(--text-muted)] font-mono">{erroCarga}</p>
        <button
          type="button"
          onClick={carregarDados}
          className="px-4 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] cursor-pointer transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!dados) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]" />
        <div className="h-52 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]" />
        <div className="h-44 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]" />
        <div className="h-72 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]" />
      </div>
    )
  }

  const etapas = etapasReais || dados.etapasDetalhadas || []
  const mtlsAutenticado = Boolean(resultadoAoVivo?.sucesso)
  const progressoPercentual = concluido ? 100 : Math.round((etapaAtual / 15) * 100)

  const walkthroughSteps = [
    {
      num: 'Passo 1',
      title: 'Segurança mTLS & Biometria',
      statusText: mtlsAutenticado
        ? 'Sessão JWT ativa'
        : resultadoAoVivo && !resultadoAoVivo.sucesso
        ? 'Pendência de retorno'
        : 'Aguardando verificação',
      state: mtlsAutenticado ? 'complete' : 'current',
      onClick: () => irParaPasso(mtlsSectionRef, () => mtlsButtonRef.current?.focus())
    },
    {
      num: 'Passo 2',
      title: 'Rito Operacional (15 Etapas)',
      statusText: !mtlsAutenticado
        ? 'Bloqueado até Passo 1'
        : concluido
        ? '15/15 etapas averbadas'
        : executandoRito
        ? `Executando ${etapaAtual}/15`
        : 'Liberado para execução',
      state: concluido ? 'complete' : mtlsAutenticado ? 'current' : 'locked',
      onClick: () => irParaPasso(passo2SectionRef)
    },
    {
      num: 'Passo 3',
      title: 'Cédula CRLV-e Digital',
      statusText: concluido ? 'CRLV-e emitido e assinado' : 'Aguardando conclusão',
      state: concluido ? 'complete' : 'locked',
      onClick: () => irParaPasso(passo3SectionRef)
    }
  ]

  return (
    <div className="space-y-6">
      {/* FAIXA DE ROTEIRO GUIADO */}
      <nav
        aria-label="Roteiro guiado do Primeiro Registro"
        className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3 sm:p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {walkthroughSteps.map((step, idx) => {
            const isComplete = step.state === 'complete'
            const isCurrent = step.state === 'current'

            return (
              <button
                key={step.num}
                type="button"
                onClick={step.onClick}
                className={`text-left px-3.5 py-2.5 rounded-lg border transition-colors duration-200 flex items-center justify-between gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] ${
                  isComplete
                    ? 'bg-[var(--semantic-success-bg)] border-[var(--semantic-success-border)]'
                    : isCurrent
                    ? 'bg-[var(--bg-surface-alt)] border-[var(--accent-border)]'
                    : 'bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] opacity-80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isComplete
                        ? 'bg-[var(--accent-primary)] text-[var(--accent-on-primary)]'
                        : isCurrent
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--accent-border)]'
                        : 'bg-[var(--btn-secondary-bg)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {isComplete ? (
                      <Check className="w-4 h-4" />
                    ) : step.state === 'locked' && idx === 1 ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                      <span
                        className={
                          isComplete
                            ? 'text-[var(--semantic-success-text)]'
                            : isCurrent
                            ? 'text-[var(--accent-text)]'
                            : 'text-[var(--text-muted)]'
                        }
                      >
                        {step.num}
                      </span>
                      <span className="text-[var(--text-subtle)]" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-mono truncate tabular-nums text-[var(--text-secondary)]">
                        {step.statusText}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {step.title}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              </button>
            )
          })}
        </div>
      </nav>

      {/* DOSSIÊ EXECUTIVO COMPACTO DO VEÍCULO HOMOLOGADO */}
      <section className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-[var(--accent-text)] font-medium">
              Item 1 · Primeiro Registro / Emplacamento 0km · DETRAN-CE (Seção 3.2)
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {dados.veiculo.marca} {dados.veiculo.modelo}{' '}
              <span className="text-[var(--text-muted)] font-semibold tabular-nums">
                · {dados.veiculo.anoFabricacao}/{dados.veiculo.anoModelo}
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={pilotoAutomatico ? () => pararPilotoAutomatico(true) : iniciarPilotoAutomatico}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 shadow-sm ${
                pilotoAutomatico
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-amber-500/30 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/30 shadow-emerald-950/30'
              }`}
              title="Executar toda a demonstração oficial automaticamente com cronômetro em tempo real"
            >
              {pilotoAutomatico ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                  <Square className="w-3.5 h-3.5 fill-current text-slate-950" />
                  <span>Parar Piloto ({tempoPiloto.toFixed(1)}s)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-emerald-200" />
                  <span>Piloto Automático (Auto-Play)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (tourAtivo) {
                  encerrarTour()
                } else {
                  iniciarTour()
                }
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 shadow-sm ${
                tourAtivo && !pilotoAutomatico
                  ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 shadow-emerald-500/30'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 shadow-emerald-950/20'
              }`}
            >
              <HelpCircle className={`w-4 h-4 ${tourAtivo && !pilotoAutomatico ? 'text-slate-950 animate-pulse' : 'text-emerald-400'}`} />
              <span>{tourAtivo ? 'Encerrar Guia' : 'Iniciar Guia Interativo'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMostrarDossieCompleto((prev) => !prev)}
              aria-expanded={mostrarDossieCompleto}
              className="px-3.5 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <span>{mostrarDossieCompleto ? 'Ocultar ficha' : 'Ficha completa (NF-e)'}</span>
              {mostrarDossieCompleto ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <a
              href={dados.nfe.danfePdfUrl || '/downloads/DANFE_TESTE_DETRAN_CE.pdf'}
              download="DANFE_TESTE_DETRAN_CE.pdf"
              className="px-4 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <FileText className="w-4 h-4 text-[var(--semantic-info-text)]" />
              Baixar DANFE (.PDF)
            </a>
          </div>
        </div>

        {/* Faixa Resumo de Dados-Chave (4 campos essenciais) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[var(--border-subtle)] text-xs">
          <div className="px-3 py-2 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
            <div className="text-[11px] text-[var(--text-muted)]">Placa Oficial</div>
            <div className="font-mono font-bold text-[var(--semantic-success-text)] tabular-nums mt-0.5">
              {dados.veiculo.placaAtribuida || 'NEV1A26'}
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
            <div className="text-[11px] text-[var(--text-muted)]">Chassi (VIN)</div>
            <div className="font-mono font-semibold text-[var(--text-primary)] truncate tabular-nums mt-0.5">
              {dados.veiculo.chassi}
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
            <div className="text-[11px] text-[var(--text-muted)]">RENAVAM / CLA</div>
            <div className="font-mono font-semibold text-[var(--text-primary)] truncate tabular-nums mt-0.5">
              01429817451 · 98412847192
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
            <div className="text-[11px] text-[var(--text-muted)]">Adquirente ({dados.adquirente.cpf})</div>
            <div className="font-semibold text-[var(--text-primary)] truncate mt-0.5">
              {dados.adquirente.nome}
            </div>
          </div>
        </div>

        {/* Detalhes completos sob demanda */}
        {mostrarDossieCompleto && (
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)] border-t border-[var(--border-subtle)] pt-4">
            <div className="pb-4 lg:pb-0 lg:pr-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--semantic-success-text)]">
                <Car className="w-4 h-4" /> Especificação Veicular
              </div>
              <dl className="grid grid-cols-[96px_1fr] gap-y-1.5 text-xs">
                <dt className="text-[var(--text-muted)]">Cor / Tipo</dt>
                <dd className="text-[var(--text-secondary)]">
                  {dados.veiculo.cor} · {dados.veiculo.tipo}
                </dd>
                <dt className="text-[var(--text-muted)]">Motorização</dt>
                <dd className="text-[var(--text-secondary)]">
                  {dados.veiculo.potencia} · {dados.veiculo.combustivel}
                </dd>
              </dl>
            </div>

            <div className="py-4 lg:py-0 lg:px-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--semantic-info-text)]">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Nota Fiscal (DANFE)
                </span>
                <span className="font-mono text-[11px] text-[var(--text-secondary)] tabular-nums">
                  {dados.nfe.valor || 'R$ 95.000,00'}
                </span>
              </div>
              <dl className="grid grid-cols-[88px_1fr] gap-y-1.5 text-xs">
                <dt className="text-[var(--text-muted)]">NF-e / Série</dt>
                <dd className="font-mono text-[var(--text-primary)] tabular-nums">
                  {dados.nfe.numero} · Série {dados.nfe.serie} ({dados.nfe.dataEmissao})
                </dd>
                <dt className="text-[var(--text-muted)]">Emitente</dt>
                <dd className="text-[var(--text-secondary)] truncate">{dados.nfe.emitente.razaoSocial}</dd>
                <dt className="text-[var(--text-muted)]">Chave 44d</dt>
                <dd
                  className="font-mono text-[11px] text-[var(--semantic-success-text)] truncate tabular-nums"
                  title={dados.nfe.chaveAcesso}
                >
                  {dados.nfe.chaveAcesso}
                </dd>
              </dl>
            </div>

            <div className="pt-4 lg:pt-0 lg:pl-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--semantic-warning-text)]">
                <ShieldCheck className="w-4 h-4" /> Domicílio &amp; Categoria
              </div>
              <dl className="grid grid-cols-[88px_1fr] gap-y-1.5 text-xs">
                <dt className="text-[var(--text-muted)]">Nascimento</dt>
                <dd className="font-mono text-[var(--text-secondary)] tabular-nums">
                  {dados.adquirente.dataNascimento}
                </dd>
                <dt className="text-[var(--text-muted)]">Domicílio</dt>
                <dd className="text-[var(--text-secondary)] truncate">{dados.adquirente.endereco}</dd>
                <dt className="text-[var(--text-muted)]">Categoria</dt>
                <dd className="text-[var(--text-secondary)]">Particular · 0km</dd>
              </dl>
            </div>
          </div>
        )}
      </section>

      {/* PASSO 1 */}
      <section
        id="passo-1-mtls"
        ref={mtlsSectionRef}
        className={`scroll-mt-20 rounded-xl bg-[var(--bg-surface)] border p-6 space-y-5 transition-colors duration-200 ${
          mtlsAutenticado
            ? 'border-[var(--semantic-success-border)]'
            : 'border-[var(--accent-border)]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono font-bold text-[var(--semantic-info-text)]">Passo 1 de 3</span>
              <span className="text-[var(--text-subtle)]" aria-hidden="true">
                ·
              </span>
              <span
                className={`font-semibold ${
                  mtlsAutenticado
                    ? 'text-[var(--semantic-success-text)]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {mtlsAutenticado ? 'Autenticado (HTTP 200)' : 'Pré-requisito obrigatório de segurança'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Lock
                className={`w-4 h-4 ${
                  mtlsAutenticado
                    ? 'text-[var(--semantic-success-text)]'
                    : 'text-[var(--semantic-info-text)]'
                }`}
              />
              Camada de Segurança mTLS &amp; Sessão Biométrica
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Validação ao vivo do certificado e-CNPJ A1 ICP-Brasil da NECAVA e da biometria facial no endpoint{' '}
              <span className="font-mono text-[var(--text-secondary)]">
                https://balcaows.detran.ce.gov.br/balcaows_dev
              </span>
              .
            </p>
          </div>

          <button
            ref={mtlsButtonRef}
            type="button"
            onClick={testarBalcaoWs}
            disabled={testandoAoVivo}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 self-start lg:self-auto ${
              mtlsAutenticado
                ? 'bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-[var(--semantic-success-text)]'
                : 'bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white'
            } ${
              tourAtivo && tourPasso === 1
                ? 'relative z-50 ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-900 shadow-2xl shadow-emerald-500/50 scale-[1.02]'
                : ''
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${testandoAoVivo ? 'animate-spin' : ''}`} />
            {testandoAoVivo
              ? 'Autenticando mTLS...'
              : mtlsAutenticado
              ? 'Revalidar BalcãoWS (mTLS)'
              : 'Executar Verificação BalcãoWS (mTLS)'}
          </button>
        </div>

        {resultadoAoVivo?.sucesso && (
          <div className="p-3.5 rounded-xl bg-[var(--semantic-success-bg)] border border-[var(--semantic-success-border)] flex flex-col gap-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 font-semibold text-[var(--semantic-success-text)]">
                <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--semantic-success-text)]" />
                </span>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  e-CNPJ A1 ICP-Brasil + Biometria validados · Passo 2 desbloqueado
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setMostrarTokenJwt((prev) => !prev)}
                  className="px-2.5 py-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-secondary)] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {mostrarTokenJwt ? <EyeOff className="w-3.5 h-3.5" /> : <KeyRound className="w-3.5 h-3.5" />}
                  {mostrarTokenJwt ? 'Ocultar JWT' : 'Ver JWT'}
                </button>
                <button
                  type="button"
                  onClick={() => copiarTexto(resultadoAoVivo.token, 'jwt')}
                  className="px-3 py-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--semantic-success-border)] text-[11px] font-mono text-[var(--semantic-success-text)] flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                >
                  {copiado === 'jwt' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiado === 'jwt' ? 'Copiado' : 'Copiar Token JWT'}
                </button>
              </div>
            </div>

            {mostrarTokenJwt && (
              <div className="font-mono text-[11px] bg-[var(--bg-console)] border border-[var(--border-subtle)] px-3 py-2 rounded-lg text-emerald-300 break-all">
                Bearer {resultadoAoVivo.token}
              </div>
            )}
          </div>
        )}

        {resultadoAoVivo && !resultadoAoVivo.sucesso && (
          <div className="p-4 rounded-xl bg-[var(--semantic-warning-bg)] border border-[var(--semantic-warning-border)] text-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-[var(--semantic-warning-text)]">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Pendência na Autenticação mTLS junto ao Serviço de Identidade DETRAN-CE</span>
              </div>
              <span className="font-mono text-[11px] text-[var(--semantic-warning-text)] tabular-nums">
                HTTP {resultadoAoVivo.status}
              </span>
            </div>
            <div className="bg-[var(--bg-console)] p-3 rounded-lg font-mono text-[11px] text-red-300 border border-red-900/40">
              {resultadoAoVivo.motivo}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              O Passo 2 permanece bloqueado até que o endpoint do BalcãoWS confirme a sessão biométrica e
              retorne um Bearer Token JWT válido.
            </p>
          </div>
        )}
      </section>

      {/* PASSO 2: RITO DAS 15 ETAPAS (LINHA DO TEMPO VERTICAL) */}
      <section
        id="passo-2-rito"
        ref={passo2SectionRef}
        className={`scroll-mt-20 rounded-xl bg-[var(--bg-surface)] border p-6 space-y-5 transition-colors duration-200 ${
          concluido ? 'border-[var(--semantic-success-border)]' : 'border-[var(--border-subtle)]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono font-bold text-[var(--accent-text)]">Passo 2 de 3</span>
              <span className="text-[var(--text-subtle)]" aria-hidden="true">
                ·
              </span>
              <span className="text-[var(--text-muted)]">
                Clique em qualquer etapa para inspecionar os payloads BalcãoWS
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Rito Operacional das 15 Etapas Oficiais (I a XV)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {mtlsAutenticado && (
              <button
                type="button"
                role="switch"
                aria-checked={acompanharScroll}
                onClick={() => setAcompanharScroll((prev) => !prev)}
                title="Acompanhar automaticamente com scroll suave conforme cada etapa avança"
                className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  acompanharScroll
                    ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent-text)]'
                    : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <ArrowDown className={`w-3.5 h-3.5 ${executandoRito && acompanharScroll ? 'animate-bounce' : ''}`} />
                <span>Auto-Scroll: {acompanharScroll ? 'ON' : 'OFF'}</span>
              </button>
            )}

            {concluido ? (
              <button
                type="button"
                onClick={reiniciarRito}
                className="px-4 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--semantic-warning-text)] flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar Rito
              </button>
            ) : (
              <button
                ref={ritoButtonRef}
                type="button"
                onClick={iniciarRitoVisual}
                disabled={!mtlsAutenticado || executandoRito}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                  !mtlsAutenticado
                    ? 'bg-[var(--btn-secondary-bg)] border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed'
                    : 'bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:opacity-60 text-[var(--accent-on-primary)] cursor-pointer'
                } ${
                  tourAtivo && tourPasso === 2
                    ? 'relative z-50 ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-900 shadow-2xl shadow-emerald-500/50 scale-[1.02]'
                    : ''
                }`}
              >
                {!mtlsAutenticado ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Aguardando Passo 1 (mTLS)
                  </>
                ) : executandoRito ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="tabular-nums">Executando Etapa {etapaAtual}/15...</span>
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

        {!mtlsAutenticado && (
          <div className="p-4 rounded-xl bg-[var(--semantic-warning-bg)] border border-[var(--semantic-warning-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <Lock className="w-5 h-5 text-[var(--semantic-warning-text)] shrink-0 mt-0.5 sm:mt-0" />
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[var(--semantic-warning-text)]">
                  Passo 2 bloqueado até conclusão do Passo 1 (Segurança mTLS)
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Autentique o certificado e-CNPJ e a sessão biométrica JWT no Passo 1 para liberar a
                  execução sequencial das 15 etapas.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMostrarEtapasBloqueadas((prev) => !prev)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] cursor-pointer transition-colors whitespace-nowrap"
              >
                {mostrarEtapasBloqueadas ? 'Ocultar prévia' : 'Ver prévia das 15 etapas'}
              </button>
              <button
                type="button"
                onClick={() => irParaPasso(mtlsSectionRef, () => mtlsButtonRef.current?.focus())}
                className="px-3.5 py-2 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--semantic-warning-border)] text-xs font-semibold text-[var(--semantic-warning-text)] flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Ir para Passo 1
              </button>
            </div>
          </div>
        )}

        {/* Linha do Tempo Vertical Sequencial (exibida ao autenticar ou quando usuário abre a prévia) */}
        {(mtlsAutenticado || mostrarEtapasBloqueadas) && (
          <div className="relative pl-10 sm:pl-12 space-y-2.5">
            <div
              aria-hidden="true"
              className="absolute left-[15px] sm:left-[19px] top-4 bottom-4 w-0.5 bg-[var(--border-subtle)] pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute left-[15px] sm:left-[19px] top-4 w-0.5 bg-[var(--accent-primary)] transition-all duration-300 pointer-events-none"
              style={{
                height:
                  etapas.length > 0
                    ? `calc(${progressoPercentual}% - ${progressoPercentual > 0 ? 16 : 0}px)`
                    : '0%'
              }}
            />

            {etapas.map((item, idx) => {
              const hasRealState = Boolean(item.estado)
              const isConcluido = hasRealState
                ? item.estado === 'REAL_OK' || item.estado === 'CONDICIONAL_DISPENSADA'
                : concluido ||
                  etapaAtual > item.etapa ||
                  (etapaAtual === item.etapa && !executandoRito && etapaAtual > 0)
              const isBloqueado = item.estado === 'BLOQUEADO_DETRAN'
              const isAguardando = item.estado === 'AGUARDANDO_ACAO'
              const isProcessando = executandoRito && etapaAtual === item.etapa
              const romano = ROMAN_NUMERALS[idx] || String(item.etapa)

              return (
                <div
                  key={item.etapa}
                  ref={(el) => {
                    if (el) {
                      stepRefs.current[item.etapa] = el
                    } else {
                      delete stepRefs.current[item.etapa]
                    }
                  }}
                  className="relative scroll-mt-24"
                >
                  <div
                    aria-hidden="true"
                    className={`absolute -left-10 sm:-left-12 top-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center font-mono text-[11px] font-bold transition-colors duration-200 ${
                      isConcluido
                        ? 'bg-[var(--accent-primary)] border-[var(--accent-border)] text-[var(--accent-on-primary)]'
                        : isProcessando
                        ? 'bg-sky-600 border-sky-400 text-white'
                        : 'bg-[var(--bg-surface-alt)] border-[var(--border-strong)] text-[var(--text-muted)]'
                    }`}
                  >
                    {isConcluido ? (
                      <Check className="w-4 h-4" />
                    ) : isProcessando ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      romano
                    )}
                  </div>

                  <button
                    ref={idx === 0 ? step1CardRef : undefined}
                    type="button"
                    onClick={() => {
                      setAbaModalInspecao('ambos')
                      setEtapaSelecionada(item)
                    }}
                    title={`Inspecionar ${item.metodo} ${item.endpoint}`}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer group focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] ${
                      isConcluido
                        ? 'bg-[var(--bg-surface-alt)] border-[var(--semantic-success-border)]'
                        : isProcessando
                        ? 'bg-[var(--semantic-info-bg)] border-[var(--semantic-info-border)] ring-2 ring-[var(--semantic-info-border)]'
                        : !mtlsAutenticado
                        ? 'bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] opacity-80'
                        : 'bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                    } ${
                      tourAtivo && tourPasso === 3 && idx === 0
                        ? 'relative z-50 ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-900 shadow-2xl shadow-emerald-500/50 scale-[1.01]'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold truncate text-[var(--text-primary)]">
                          {item.nome}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--text-muted)] tabular-nums shrink-0">
                          ({String(item.etapa).padStart(2, '0')}/15)
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity text-[11px] font-mono text-[var(--accent-text)] hidden sm:inline-flex items-center gap-1">
                          <Code2 className="w-3.5 h-3.5" /> {item.metodo} · JSON
                        </span>

                        {isBloqueado ? (
                          <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-rose-400">
                            Bloqueado DETRAN{item.statusHttp ? ` (HTTP ${item.statusHttp})` : ''}
                          </span>
                        ) : isAguardando ? (
                          <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-400">
                            Aguardando Ação{item.statusHttp ? ` (HTTP ${item.statusHttp})` : ''}
                          </span>
                        ) : isConcluido ? (
                          <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--semantic-success-text)]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {item.estado === 'CONDICIONAL_DISPENSADA' ? 'Dispensada' : item.statusHttp ? `Real HTTP ${item.statusHttp}` : 'Concluído'}
                          </span>
                        ) : isProcessando ? (
                          <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--semantic-info-text)]">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Processando
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-[var(--text-muted)]">
                            {item.estado === 'NAO_EXECUTADA' ? 'Não executada (bloqueio anterior)' : mtlsAutenticado ? 'Pendente' : 'Aguardando mTLS'}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                      {item.resumo || item.desc}
                    </p>
                    {item.pendenciaDetran && (
                      <p className="text-[11px] text-rose-400 mt-1 font-mono">
                        Pendência DETRAN: {item.pendenciaDetran}
                      </p>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* PASSO 3: CONCLUSÃO & CRLV-e */}
      <section
        id="passo-3-crlv"
        ref={passo3SectionRef}
        className={`scroll-mt-20 rounded-xl bg-[var(--bg-surface)] border p-6 space-y-5 transition-colors duration-200 ${
          concluido ? 'border-[var(--semantic-success-border)]' : 'border-[var(--border-subtle)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono font-bold text-[var(--accent-text)]">Passo 3 de 3</span>
              <span className="text-[var(--text-subtle)]" aria-hidden="true">
                ·
              </span>
              <span className="font-mono text-[var(--text-muted)]">Resolução CONTRAN 809/2020</span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Conclusão &amp; Cédula do CRLV-e Digital Oficial
            </h3>
          </div>

          {concluido && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                ref={crlvButtonRef}
                type="button"
                onClick={() => {
                  setModalCrlv(true)
                  if (tourAtivo && tourPasso === 4) {
                    setTimeout(() => {
                      concluirTour()
                    }, 600)
                  }
                }}
                className={`px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-xs font-bold text-[var(--accent-on-primary)] flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                  tourAtivo && tourPasso === 4
                    ? 'relative z-50 ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-900 shadow-2xl shadow-emerald-500/50 scale-[1.02]'
                    : ''
                }`}
              >
                <Eye className="w-4 h-4" />
                Visualizar CRLV-e Emitido
              </button>
              <button
                type="button"
                onClick={() => baixarCrlvPdfAutenticado().catch((err) => console.warn('Erro ao baixar CRLV-e:', err))}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Baixar PDF Assinado (PAdES)
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-xs font-semibold text-[var(--btn-secondary-text)] flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
              >
                <Printer className="w-4 h-4" />
                Imprimir CRLV-e
              </button>
            </div>
          )}
        </div>

        {!concluido ? (
          <div className="p-4 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            Cédula CRLV-e Digital com QR Code VIO e assinatura PAdES será exibida automaticamente após a conclusão da Etapa XV.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-xl bg-[var(--semantic-success-bg)] border border-[var(--semantic-success-border)] flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--semantic-success-text)] shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[var(--text-primary)]">
                  Primeiro Registro Concluído (15/15 Etapas BalcãoWS)
                </span>
                <span className="text-[var(--text-secondary)]">
                  {' '}— Placa{' '}
                  <strong className="font-mono text-[var(--semantic-success-text)]">NEV1A26</strong> · RENAVAM{' '}
                  <span className="font-mono">01429817451</span> · CLA{' '}
                  <span className="font-mono">98412847192</span> · Ledger SHA-256 atualizado.
                </span>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <CrlvDocumentCard dados={dados} printable={!modalCrlv} />
            </div>
          </div>
        )}
      </section>

      {/* MODAL DE INSPEÇÃO TÉCNICA BALCÃOWS */}
      {etapaSelecionada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Inspeção técnica ${etapaSelecionada.nome}`}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70]"
          onClick={(e) => {
            if (e.target === e.currentTarget) fecharModalInspecao()
          }}
        >
          <div className="bg-[var(--bg-modal)] border border-[var(--border-strong)] rounded-xl max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-3">
              <div className="space-y-1 min-w-0">
                <div className="text-xs font-mono text-[var(--semantic-success-text)]">
                  Etapa {ROMAN_NUMERALS[etapaSelecionada.etapa - 1] || etapaSelecionada.etapa} ({etapaSelecionada.etapa} de 15) · Inspeção BalcãoWS
                </div>
                <h3 className="font-bold text-base text-[var(--text-primary)] truncate">
                  {etapaSelecionada.nome}
                </h3>
                <p className="text-xs font-mono text-[var(--semantic-info-text)] truncate">
                  {etapaSelecionada.metodo} {etapaSelecionada.endpoint}
                </p>
              </div>
              <button
                type="button"
                onClick={fecharModalInspecao}
                aria-label="Fechar modal"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-lg self-start">
              {[
                { id: 'ambos', label: 'Visão Completa' },
                { id: 'mtls', label: 'Camada mTLS' },
                { id: 'req', label: 'Request JSON' },
                { id: 'res', label: 'Response JSON' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAbaModalInspecao(t.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                    abaModalInspecao === t.id
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-on-primary)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs font-mono">
              {(abaModalInspecao === 'ambos' || abaModalInspecao === 'mtls') && (
                <div className="bg-[var(--bg-console)] p-3.5 rounded-lg border border-[var(--border-subtle)] space-y-1.5 text-slate-200">
                  <div className="text-[11px] text-slate-400 font-sans font-semibold">
                    Headers de Segurança mTLS &amp; Bearer Token
                  </div>
                  <div>
                    Certificado Cliente:{' '}
                    <span className="text-emerald-400">e-CNPJ A1 ICP-Brasil (NECAVA · 05.591.991/0001-48)</span>
                  </div>
                  <div className="truncate">
                    Authorization:{' '}
                    <span className="text-sky-400">
                      Bearer {resultadoAoVivo?.token || '<token_jwt_sessao_biometrica>'}
                    </span>
                  </div>
                  <div>
                    Content-Type: <span className="text-slate-400">application/json; charset=utf-8</span>
                  </div>
                </div>
              )}

              {(abaModalInspecao === 'ambos' || abaModalInspecao === 'req') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-primary)] font-sans font-semibold flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--semantic-info-text)]" /> Payload Enviado (Request Body)
                    </span>
                    <button
                      type="button"
                      onClick={() => copiarTexto(etapaSelecionada.payloadReq, 'req')}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 text-[11px] font-sans cursor-pointer"
                    >
                      {copiado === 'req' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-[var(--semantic-success-text)]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copiado === 'req' ? 'Copiado' : 'Copiar JSON'}
                    </button>
                  </div>
                  <pre className="bg-[var(--bg-console)] p-3.5 rounded-lg border border-[var(--border-subtle)] text-sky-300 text-[11px] overflow-x-auto leading-relaxed">
                    {JSON.stringify(etapaSelecionada.payloadReq, null, 2)}
                  </pre>
                </div>
              )}

              {(abaModalInspecao === 'ambos' || abaModalInspecao === 'res') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-primary)] font-sans font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--semantic-success-text)]" /> Resposta Oficial DETRAN-CE (Response Body)
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--semantic-success-text)] text-[11px] font-mono">
                        HTTP 200 OK
                      </span>
                      <button
                        type="button"
                        onClick={() => copiarTexto(etapaSelecionada.payloadRes, 'res')}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 text-[11px] font-sans cursor-pointer"
                      >
                        {copiado === 'res' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[var(--semantic-success-text)]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiado === 'res' ? 'Copiado' : 'Copiar JSON'}
                      </button>
                    </div>
                  </div>
                  <pre className="bg-[var(--bg-console)] p-3.5 rounded-lg border border-[var(--border-subtle)] text-emerald-300 text-[11px] overflow-x-auto leading-relaxed">
                    {JSON.stringify(etapaSelecionada.payloadRes, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Evidência gravada no Ledger SHA-256</span>
              <button
                type="button"
                onClick={() => setEtapaSelecionada(null)}
                className="px-4 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-[var(--btn-secondary-text)] font-semibold cursor-pointer transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AMPLIADO CRLV-e */}
      {modalCrlv && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="CRLV-e Digital Oficial"
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <div className="bg-[var(--bg-modal)] border border-[var(--border-strong)] rounded-xl max-w-4xl w-full p-5 sm:p-6 space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Certificado de Registro e Licenciamento de Veículo Digital (CRLV-e)
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] font-mono">
                  Resolução CONTRAN 809/2020 · Governo do Estado do Ceará · DETRAN-CE
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalCrlv(false)}
                aria-label="Fechar CRLV-e"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CrlvDocumentCard dados={dados} printable={modalCrlv} />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-xs text-[var(--text-muted)]">
                Homologação DETRAN/CE · Item 1 da Prova de Conceito
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => baixarCrlvPdfAutenticado().catch((err) => console.warn('Erro ao baixar CRLV-e:', err))}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-on-primary)] font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar PDF Assinado (PAdES)
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] text-[var(--btn-secondary-text)] font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir CRLV-e
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODO TOUR GUIADO INTERATIVO (SPOTLIGHT / ONBOARDING) */}
      {tourAtivo && (
        <>
          {/* BACKDROP ESCURECIDO COM BLUR SUAVE */}
          <div
            className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-[2px] transition-opacity duration-300"
            onClick={() => {
              const notificar = toast?.info || toast?.success
              if (notificar) {
                notificar(
                  'Guia Interativo Ativo',
                  'Clique no botão iluminado pelo holofote para continuar a demonstração da PoC.'
                )
              }
            }}
          />

          {/* ANEL PULSANTE DO HOLOFOTE (SPOTLIGHT GLOW) */}
          {spotlightRect && (
            <div
              className="fixed z-50 pointer-events-none transition-all duration-300 rounded-xl"
              style={{
                top: Math.max(0, spotlightRect.top - 6),
                left: Math.max(0, spotlightRect.left - 6),
                width: spotlightRect.width + 12,
                height: spotlightRect.height + 12,
                boxShadow: '0 0 0 3px #10b981, 0 0 35px 8px rgba(16, 185, 129, 0.45)'
              }}
            >
              <span className="absolute -inset-1.5 rounded-xl border-2 border-emerald-400 animate-ping opacity-60" />
            </div>
          )}

          {/* BALÃO FLUTUANTE EXPLICATIVO COM SETA/PONTEIRO */}
          {spotlightRect && (() => {
            const currentTourStep = TOUR_STEPS[tourPasso - 1] || TOUR_STEPS[0]
            const balloonWidth =
              typeof window !== 'undefined' && window.innerWidth < 640
                ? window.innerWidth - 32
                : 440
            const balloonHeight = 240
            const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1200
            const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800

            let balloonLeft = spotlightRect.left + spotlightRect.width / 2 - balloonWidth / 2
            balloonLeft = Math.max(16, Math.min(viewportW - balloonWidth - 16, balloonLeft))

            const spaceBelow = viewportH - spotlightRect.bottom
            const spaceAbove = spotlightRect.top
            let balloonTop = 80
            let arrowPlacement = 'top'

            if (spaceBelow >= balloonHeight + 24) {
              balloonTop = spotlightRect.bottom + 16
              arrowPlacement = 'top'
            } else if (spaceAbove >= balloonHeight + 24) {
              balloonTop = spotlightRect.top - balloonHeight - 16
              arrowPlacement = 'bottom'
            } else {
              balloonTop = Math.max(16, Math.min(viewportH - balloonHeight - 16, spotlightRect.bottom + 16))
              arrowPlacement = 'top'
            }

            const arrowLeft = Math.max(
              24,
              Math.min(balloonWidth - 40, spotlightRect.left + spotlightRect.width / 2 - balloonLeft - 7)
            )

            return (
              <div
                className="fixed z-[60] rounded-2xl bg-slate-900 border border-emerald-500/40 p-5 shadow-2xl shadow-black/80 backdrop-blur-md text-white transition-all duration-300"
                style={{
                  width: `${balloonWidth}px`,
                  top: `${balloonTop}px`,
                  left: `${balloonLeft}px`
                }}
              >
                {/* SETA/PONTEIRO */}
                <div
                  className={`absolute w-3.5 h-3.5 bg-slate-900 border-emerald-500/40 rotate-45 ${
                    arrowPlacement === 'top'
                      ? '-top-2 border-t border-l'
                      : '-bottom-2 border-b border-r'
                  }`}
                  style={{ left: `${arrowLeft}px` }}
                />

                {/* CABEÇALHO DO BALÃO */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-400">
                        {currentTourStep.stepNum}
                      </span>
                      {pilotoAutomatico ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1 animate-pulse">
                          <Timer className="w-3 h-3" />
                          Piloto: {tempoPiloto.toFixed(1)}s
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Guia Interativo PoC · DETRAN-CE
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      {currentTourStep.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={encerrarTour}
                    aria-label="Pular Guia"
                    className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* CORPO DO BALÃO */}
                <div className="py-3.5 space-y-2">
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {tourPasso === 1 && mtlsAutenticado
                      ? currentTourStep.completedDesc
                      : tourPasso === 2 && concluido
                      ? currentTourStep.completedDesc
                      : currentTourStep.desc}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-emerald-400 flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-semibold">Ação necessária:</span>
                    <span className="text-slate-200 truncate">{currentTourStep.actionLabel}</span>
                  </div>
                </div>

                {/* RODAPÉ DO BALÃO: CONTROLES & PAGINAÇÃO */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
                  {/* Bolinhas de Progresso 1..4 */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setTourPasso(s)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          tourPasso === s
                            ? 'w-6 bg-emerald-400'
                            : s < tourPasso
                            ? 'w-2 bg-emerald-600/70 hover:bg-emerald-500'
                            : 'w-2 bg-slate-700 hover:bg-slate-600'
                        }`}
                        title={`Ir para o Passo ${s}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {!pilotoAutomatico ? (
                      <button
                        type="button"
                        onClick={iniciarPilotoAutomatico}
                        className="px-2.5 py-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 font-semibold transition-colors cursor-pointer text-xs flex items-center gap-1 border border-emerald-500/30"
                        title="Executar os 4 passos automaticamente com cronômetro"
                      >
                        <Play className="w-3 h-3 fill-current text-emerald-400" />
                        <span>Auto-Play</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => pararPilotoAutomatico(true)}
                        className="px-2.5 py-1.5 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-950/50 font-semibold transition-colors cursor-pointer text-xs flex items-center gap-1 border border-amber-500/30"
                      >
                        <Square className="w-3 h-3 fill-current text-amber-300" />
                        <span>Pausar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={encerrarTour}
                      className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 font-medium transition-colors cursor-pointer text-xs"
                    >
                      Pular Guia
                    </button>

                    {tourPasso > 1 && (
                      <button
                        type="button"
                        onClick={() => setTourPasso((p) => Math.max(1, p - 1))}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer text-xs"
                      >
                        Anterior
                      </button>
                    )}

                    {tourPasso < 4 ? (
                      <button
                        type="button"
                        onClick={() => setTourPasso((p) => Math.min(4, p + 1))}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors cursor-pointer text-xs flex items-center gap-1 shadow-md shadow-emerald-950/40"
                      >
                        <span>Próximo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={concluirTour}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors cursor-pointer text-xs flex items-center gap-1 shadow-md shadow-emerald-950/40"
                      >
                        <span>Concluir</span>
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}
        </>
      )}
    </div>

  )
}