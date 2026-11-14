import crypto from 'node:crypto'

const GENESIS_HASH = '0'.repeat(64)

function sha256(str) {
  return crypto.createHash('sha256').update(String(str)).digest('hex')
}

function buildAuditBlock({
  id,
  blockIndex,
  criado_em,
  origem,
  operacao,
  endpoint,
  sucesso = true,
  modo_simulado = true,
  previousHash = GENESIS_HASH
}) {
  const canonicalPayload = JSON.stringify({
    id,
    blockIndex,
    previousHash,
    criado_em,
    origem,
    operacao,
    endpoint: endpoint || '',
    sucesso: Boolean(sucesso),
    modo_simulado: Boolean(modo_simulado)
  })
  const hash = sha256(canonicalPayload)
  return {
    id,
    blockIndex,
    criado_em,
    origem,
    operacao,
    endpoint,
    sucesso: Boolean(sucesso),
    modo_simulado: Boolean(modo_simulado),
    previousHash,
    canonicalPayload,
    hash
  }
}

function validateBlockchainLedger(auditoriaList) {
  const chronological = [...(auditoriaList || [])].sort((a, b) => a.blockIndex - b.blockIndex)
  let expectedPrev = GENESIS_HASH
  let blocosValidados = 0
  const blocos = chronological.map((b) => {
    const computed = sha256(b.canonicalPayload || '')
    const prevMatches = b.previousHash === expectedPrev
    const hashMatches = computed === b.hash
    const valido = prevMatches && hashMatches
    if (valido) blocosValidados += 1
    expectedPrev = b.hash
    return {
      ...b,
      valido
    }
  })
  const ultimoHash = blocos.length ? blocos[blocos.length - 1].hash : GENESIS_HASH
  return {
    integra: blocos.length === 0 || blocosValidados === blocos.length,
    totalBlocos: blocos.length,
    blocosValidados,
    genesisHash: GENESIS_HASH,
    ultimoHash,
    blocos
  }
}

function buildMinimalPdf(title, protocolo) {
  const safeText = (s) => String(s || '').replace(/[()\\]/g, '')
  const stream = `BT /F1 14 Tf 50 740 Td (${safeText(title)}) Tj 0 -24 Td (Protocolo: ${safeText(protocolo)}) Tj 0 -20 Td (Assinado digitalmente PAdES / e-CNPJ NECAVA 05.591.991/0001-48) Tj ET`
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n',
    `4 0 obj << /Length ${Buffer.byteLength(stream, 'utf8')} >> stream\n${stream}\nendstream endobj\n`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n'
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'))
    pdf += obj
  }
  const xrefPos = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`
  return Buffer.from(pdf, 'utf8')
}

function createInitialState() {
  const faixas = [
    { id: 1, descricao: 'Biometria Facial & Grafotécnica (ATPV-e)', reprovacao_max: 49, revisao_max: 79, aprovacao_min: 80 },
    { id: 2, descricao: 'Validação Documental (OCR NF-e / CRLV / CNH)', reprovacao_max: 49, revisao_max: 79, aprovacao_min: 80 },
    { id: 3, descricao: 'Vistoria Veicular ECV (Placa, Chassi e Motor)', reprovacao_max: 49, revisao_max: 79, aprovacao_min: 80 }
  ]

  const processos = [
    {
      id: 1,
      protocolo: 'TRF-2026-0001',
      tipo_servico: 'TRANSFERENCIA',
      natureza: 'PF_PF',
      placa: 'POA8B20',
      chassi: '9BWAA05U4BP012345',
      cpf_cnpj_vendedor: '07569577370',
      cpf_cnpj_comprador: '01234567890',
      laudo_vistoria_id: 'LAUDO-CE-9901',
      score_ia: 92,
      etapa_atual: 7,
      status: 'EM_ANDAMENTO',
      hash_blockchain: sha256('TRF-2026-0001:POA8B20'),
      inconsistencias: [],
      dados: {
        vendedor: { nome: 'VINICIUS CAVALCANTE VIANA' },
        comprador: { nome: 'MARCOS VINICIUS ALMEIDA' }
      }
    },
    {
      id: 2,
      protocolo: 'TRF-2026-0002',
      tipo_servico: 'TRANSFERENCIA',
      natureza: 'PJ_PF',
      placa: 'HYZ4E19',
      chassi: '9BD17822682345678',
      cpf_cnpj_vendedor: '05591991000148',
      cpf_cnpj_comprador: '09876543210',
      laudo_vistoria_id: 'LAUDO-CE-9902',
      score_ia: 68,
      etapa_atual: 6,
      status: 'EM_REVISAO_MANUAL',
      hash_blockchain: sha256('TRF-2026-0002:HYZ4E19'),
      inconsistencias: ['Assinatura da ATPV-e com leve variação grafotécnica (Score 68% - Faixa Amarela)'],
      dados: {
        vendedor: { nome: 'NECAVA TRANSPORTES LTDA' },
        comprador: { nome: 'CARLOS EDUARDO MENDES' }
      }
    },
    {
      id: 3,
      protocolo: 'TRF-2026-0003',
      tipo_servico: 'TRANSFERENCIA',
      natureza: 'PF_PF',
      placa: 'NUX9C44',
      chassi: '8AP196272F4019283',
      cpf_cnpj_vendedor: '11223344556',
      cpf_cnpj_comprador: '66554433221',
      laudo_vistoria_id: 'LAUDO-CE-9903',
      score_ia: 95,
      etapa_atual: 13,
      status: 'CONCLUIDO',
      hash_blockchain: sha256('TRF-2026-0003:NUX9C44'),
      inconsistencias: [],
      dados: {
        vendedor: { nome: 'ANA PAULA FERREIRA' },
        comprador: { nome: 'JOAO PEDRO NOGUEIRA' }
      }
    },
    {
      id: 4,
      protocolo: 'REG-OFICIAL-001',
      tipo_servico: 'PRIMEIRO_REGISTRO',
      natureza: 'CONCESSIONARIA_PF',
      placa: 'NEV1A26',
      chassi: '9BWAG45U7PT104829',
      cpf_cnpj_vendedor: '07123456000188',
      cpf_cnpj_comprador: '07569577370',
      laudo_vistoria_id: 'ECV-CE-2026-001',
      score_ia: 96,
      etapa_atual: 15,
      status: 'CONCLUIDO',
      hash_blockchain: sha256('REG-OFICIAL-001:NEV1A26'),
      inconsistencias: [],
      dados: {
        vendedor: { nome: 'CEARÁ VEÍCULOS S/A' },
        comprador: { nome: 'VINICIUS CAVALCANTE VIANA' }
      }
    }
  ]

  const now = Date.now()
  const seedEvents = [
    {
      id: 1,
      criado_em: new Date(now - 3600_000).toISOString(),
      origem: 'BALCAOWS_DETRAN_CE',
      operacao: 'HANDSHAKE_MTLS_BALCAOWS',
      endpoint: '/balcaows_dev/v1/identidade/autenticar',
      sucesso: true,
      modo_simulado: true
    },
    {
      id: 2,
      criado_em: new Date(now - 2400_000).toISOString(),
      origem: 'EXTERNO_BIOMETRIA',
      operacao: 'VALIDACAO_FACIAL_LIVENESS',
      endpoint: '/biometria/liveness',
      sucesso: true,
      modo_simulado: true
    },
    {
      id: 3,
      criado_em: new Date(now - 1800_000).toISOString(),
      origem: 'EXTERNO_VALIDACAO_DOC',
      operacao: 'OCR_NFE_SEFAZ_CE',
      endpoint: '/sefaz/nfe/validar',
      sucesso: true,
      modo_simulado: true
    },
    {
      id: 4,
      criado_em: new Date(now - 900_000).toISOString(),
      origem: 'MESA_REVISORA',
      operacao: 'ROTEAMENTO_FAIXA_AMARELA',
      endpoint: '/processos/TRF-2026-0002',
      sucesso: true,
      modo_simulado: true
    }
  ]

  let prevHash = GENESIS_HASH
  const auditoriaChrono = seedEvents.map((ev, index) => {
    const block = buildAuditBlock({
      ...ev,
      blockIndex: index + 1,
      previousHash: prevHash
    })
    prevHash = block.hash
    return block
  })
  const auditoria = [...auditoriaChrono].reverse()

  const sampleBatch = Array.from({ length: 100 }, (_, i) => {
    const idx = i + 1
    const brands = [
      ['VOLKSWAGEN', 'POLO TRACK'],
      ['FIAT', 'ARGO DRIVE'],
      ['CHEVROLET', 'ONIX LT'],
      ['HYUNDAI', 'HB20 SENSE'],
      ['TOYOTA', 'COROLLA XEI']
    ]
    const colors = ['BRANCA', 'PRATA', 'PRETA', 'CINZA', 'VERMELHA']
    const positions = ['DIANTEIRA', 'TRASEIRA']
    const [marca, modelo] = brands[i % brands.length]
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const placa = `P${letters[i % 26]}${letters[(i * 3) % 26]}${(i % 10)}${letters[(i * 7) % 26]}${((i * 3) % 90 + 10).toString().padStart(2, '0')}`.slice(0, 7)
    return {
      Arquivo: `veiculo_${String(idx).padStart(3, '0')}.jpg`,
      Placa: placa,
      Marca: marca,
      Modelo: modelo,
      Cor: colors[i % colors.length],
      'Posição': positions[i % 2],
      Tipo: 'MERCOSUL',
      Originalidade: 'ORIGINAL'
    }
  })

  const historicoEtapa3 = [
    {
      id: 1,
      criadoEm: new Date(now - 7200_000).toISOString(),
      totalImagens: 100,
      tempoSegundos: 28.92,
      dentroLimite60s: true,
      downloadUrl: '/api/poc-ce/etapa3/download-csv/1',
      resultados: sampleBatch
    }
  ]

  const dadosOficiais = {
    veiculo: {
      marca: 'VOLKSWAGEN',
      modelo: 'POLO TRACK 1.0 MPI',
      anoFabricacao: '2026',
      anoModelo: '2026',
      chassi: '9BWAG45U7PT104829',
      motor: 'CSEZ948102',
      cor: 'BRANCA CRISTAL',
      tipo: 'AUTOMÓVEL',
      potencia: '84 CV',
      combustivel: 'ÁLCOOL/GASOLINA'
    },
    nfe: {
      numero: '000482910',
      serie: '001',
      dataEmissao: '13/11/2026',
      chaveAcesso: '23261107123456000188550010004829101984726152',
      danfePdfUrl: '/downloads/DANFE_TESTE_DETRAN_CE.pdf',
      emitente: {
        razaoSocial: 'CEARÁ VEÍCULOS CONCESSIONÁRIA S/A'
      }
    },
    adquirente: {
      nome: 'VINICIUS CAVALCANTE VIANA',
      cpf: '075.695.773-70',
      dataNascimento: '14/05/1991',
      endereco: 'FORTALEZA - CE'
    },
    etapasDetalhadas: [
      {
        etapa: 1,
        nome: '01 · Abertura & mTLS',
        desc: 'Handshake mTLS com e-CNPJ NECAVA e autenticação de sessão biométrica.',
        metodo: 'POST',
        endpoint: '/balcaows_dev/v1/identidade/autenticar',
        payloadReq: { cnpjPrestador: '05591991000148', cpfOperador: '07569577370', certSerial: 'ICP-BR-A1-2026' },
        payloadRes: { status: 'AUTENTICADO', tokenType: 'Bearer', expiresIn: 3600 }
      },
      {
        etapa: 2,
        nome: '02 · Leitura OCR NF-e',
        desc: 'Extração automática da chave de acesso e dados fiscais da DANFE.',
        metodo: 'POST',
        endpoint: '/api/poc-ce/ocr/nfe',
        payloadReq: { arquivo: 'DANFE_TESTE_DETRAN_CE.pdf' },
        payloadRes: { chaveAcesso: '23261107123456000188550010004829101984726152', confiancaOcr: 99.4 }
      },
      {
        etapa: 3,
        nome: '03 · Consulta SEFAZ-CE',
        desc: 'Validação de autenticidade da NF-e na SEFAZ e vínculo com RENAVAM.',
        metodo: 'GET',
        endpoint: '/balcaows_dev/v1/nfe/validar',
        payloadReq: { chaveNfe: '23261107123456000188550010004829101984726152' },
        payloadRes: { situacaoNfe: 'AUTORIZADA', valorTotal: 95000.0 }
      },
      {
        etapa: 4,
        nome: '04 · Pré-Cadastro BIN',
        desc: 'Consulta do chassi 0 km na Base Índice Nacional (SENATRAN).',
        metodo: 'GET',
        endpoint: '/balcaows_dev/v1/bin/chassi/9BWAG45U7PT104829',
        payloadReq: { chassi: '9BWAG45U7PT104829' },
        payloadRes: { preCadastroAtivo: true, restricoes: 'NADA CONSTA' }
      },
      {
        etapa: 5,
        nome: '05 · Biometria Facial',
        desc: 'Prova de vida (liveness) e batimento facial do adquirente.',
        metodo: 'POST',
        endpoint: '/balcaows_dev/v1/biometria/validar',
        payloadReq: { cpf: '07569577370', livenessScore: 0.98 },
        payloadRes: { aprovado: true, scoreSimilaridade: 97.6 }
      },
      {
        etapa: 6,
        nome: '06 · Validação CNH/Doc',
        desc: 'Conferência documental OCR do adquirente e comprovante de endereço.',
        metodo: 'POST',
        endpoint: '/api/poc-ce/documentos/validar',
        payloadReq: { cpf: '07569577370', tipo: 'CNH_DIGITAL' },
        payloadRes: { valido: true, municipio: 'FORTALEZA-CE' }
      },
      {
        etapa: 7,
        nome: '07 · Score IA & Faixas',
        desc: 'Cálculo de score consolidado e roteamento automático na régua de faixas.',
        metodo: 'POST',
        endpoint: '/api/poc-ce/ia/roteamento',
        payloadReq: { protocolo: 'REG-OFICIAL-001', score: 96 },
        payloadRes: { faixa: 'VERDE', decisao: 'APROVACAO_AUTOMATICA' }
      },
      {
        etapa: 8,
        nome: '08 · Cálculo Taxas DAE',
        desc: 'Emissão do Documento de Arrecadação Estadual (1º Emplacamento).',
        metodo: 'POST',
        endpoint: '/balcaows_dev/v1/financeiro/dae',
        payloadReq: { servico: 'PRIMEIRO_EMPLACAMENTO', cpf: '07569577370' },
        payloadRes: { nossoNumero: '20260009918273', statusPagamento: 'COMPENSADO' }
      },
      {
        etapa: 9,
        nome: '09 · Vistoria / ECV',
        desc: 'Registro fotográfico do chassi, motor e conformidade 0 km.',
        metodo: 'POST',
        endpoint: '/balcaows_dev/v1/vistoria/vincular',
        payloadReq: { laudoId: 'ECV-CE-2026-001', chassi: '9BWAG45U7PT104829' },
        payloadRes: { statusVistoria: 'APROVADA' }
      },
      {
        etapa: 10,
        nome: '10 · Escolha de Placa',
        desc: 'Reserva da combinação alfanumérica Mercosul junto ao DETRAN-CE.',
        metodo: 'POST',
        endpoint: '/balcaows_dev/v1/placa/reservar',
        payloadReq: { placa: 'NEV1A26', chassi: '9BWAG45U7PT104829' },
        payloadRes: { placaReservada: 'NEV1A26', padrao: 'MERCOSUL' }
      },
      {
        etapa: 11,
        nome: '11 · Autorização EPIV',
        desc: 'Emissão da autorização eletrônica de estampagem para EPIV credenciada.',
        metodo: 'POST',
        endpoint: '/balcaows_dev/v1/epiv/autorizar',
        payloadReq: { placa: 'NEV1A26', epivId: 1 },
        payloadRes: { autorizacaoEpiv: 'EPIV-CE-88412', liberada: true }
      },
      {
        etapa: 12,
        nome: '12 · Assinatura PAdES',
        desc: 'Assinatura institucional com e-CNPJ A1 ICP-Brasil (ETSI.CAdES.detached).',
        metodo: 'POST',
        endpoint: '/api/poc-ce/assinatura/pades',
        payloadReq: { protocolo: 'REG-OFICIAL-001', placa: 'NEV1A26' },
        payloadRes: { algoritmo: 'SHA-256', subFilter: 'ETSI.CAdES.detached', assinado: true }
      },
      {
        etapa: 13,
        nome: '13 · Averbação RENAVAM',
        desc: 'Gravação definitiva do 1º Registro na base estadual e RENAVAM.',
        metodo: 'POST',
        endpoint: '/balcaows_dev/v1/renavam/averbar',
        payloadReq: { protocolo: 'REG-OFICIAL-001', chassi: '9BWAG45U7PT104829', placa: 'NEV1A26' },
        payloadRes: { renavam: '01429817451', crv: '01429817451', situacao: 'AVERBADO' }
      },
      {
        etapa: 14,
        nome: '14 · Emissão CRLV-e',
        desc: 'Geração do CRLV-e digital oficial conforme Resolução CONTRAN 809/2020.',
        metodo: 'GET',
        endpoint: '/balcaows_dev/v1/crlve/NEV1A26',
        payloadReq: { renavam: '01429817451', placa: 'NEV1A26' },
        payloadRes: { codigoSegurancaCla: '98412847192', disponivel: true }
      },
      {
        etapa: 15,
        nome: '15 · Blockchain SHA-256',
        desc: 'Selagem criptográfica imutável da trilha completa de auditoria.',
        metodo: 'POST',
        endpoint: '/api/poc-ce/blockchain/selar',
        payloadReq: { protocolo: 'REG-OFICIAL-001', etapas: 15 },
        payloadRes: { bloco: 12, hash: sha256('REG-OFICIAL-001:NEV1A26'), integra: true }
      }
    ]
  }

  return {
    faixas,
    processos,
    auditoria,
    historicoEtapa3,
    dadosOficiais,
    totalBlocos: auditoria.length,
    notificacoesEnviadas: 3,
    nextProcId: 5,
    nextAuditId: 5,
    nextBatchId: 2
  }
}

function toCsv(rows) {
  const header = 'Arquivo,Placa,Marca,Modelo,Cor,Posição,Tipo,Originalidade'
  const lines = rows.map((r) =>
    [r.Arquivo, r.Placa, r.Marca, r.Modelo, r.Cor, r['Posição'] || r.Posicao || 'DIANTEIRA', r.Tipo, r.Originalidade]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  )
  return '\uFEFF' + [header, ...lines].join('\n')
}

function readRawBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', () => resolve(Buffer.alloc(0)))
  })
}

async function readJsonBody(req) {
  const buf = await readRawBody(req)
  if (!buf.length) return {}
  try {
    return JSON.parse(buf.toString('utf8'))
  } catch {
    return {}
  }
}

function extractMultipartFilenames(buf) {
  const raw = buf.toString('latin1')
  const names = []
  const re = /filename="([^"]+)"/g
  let m
  while ((m = re.exec(raw)) !== null) {
    if (m[1]) names.push(m[1])
  }
  return names
}

function sendJson(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

export function pocCeMockApiPlugin() {
  const state = createInitialState()

  function addAudit(origem, operacao, endpoint, sucesso = true) {
    const previousHash = state.auditoria[0]?.hash || GENESIS_HASH
    const blockIndex = state.auditoria.length + 1
    const block = buildAuditBlock({
      id: state.nextAuditId++,
      blockIndex,
      criado_em: new Date().toISOString(),
      origem,
      operacao,
      endpoint,
      sucesso,
      modo_simulado: true,
      previousHash
    })
    state.auditoria.unshift(block)
    state.totalBlocos = state.auditoria.length
  }

  function attachMiddleware(middlewares) {
    middlewares.use('/api/poc-ce', async (req, res, next) => {
      try {
        const parsed = new URL(req.url || '/', 'http://localhost')
        const pathname = parsed.pathname.replace(/\/+$/, '') || '/'
        const method = (req.method || 'GET').toUpperCase()

        if (method === 'GET' && (pathname === '/health' || pathname === '')) {
          return sendJson(res, 200, {
            status: 'ok',
            uptime: Math.round(process.uptime ? process.uptime() : 10),
            timestamp: new Date().toISOString()
          })
        }

        if (method === 'GET' && pathname === '/status-mtls') {
          return sendJson(res, 200, {
            mtlsConectado: true,
            status: 200,
            modo: 'simulacao_local',
            bearerConfigurado: true
          })
        }

        if (method === 'GET' && pathname === '/dashboard') {
          const total = state.processos.length
          const total_transferencias = state.processos.filter((p) => p.tipo_servico === 'TRANSFERENCIA').length
          const total_primeiro_registro = state.processos.filter((p) => p.tipo_servico === 'PRIMEIRO_REGISTRO').length
          const aprovados = state.processos.filter((p) => p.status === 'CONCLUIDO').length
          const em_mesa_revisora = state.processos.filter((p) => p.status === 'EM_REVISAO_MANUAL').length
          const reprovados = state.processos.filter((p) => p.status === 'REPROVADO').length
          const avg = total
            ? (state.processos.reduce((acc, p) => acc + (Number(p.score_ia) || 0), 0) / total).toFixed(1) + '%'
            : '—'
          const chain = validateBlockchainLedger(state.auditoria)
          return sendJson(res, 200, {
            resumo: {
              total,
              total_transferencias,
              total_primeiro_registro,
              aprovados,
              score_medio: avg,
              em_mesa_revisora,
              reprovados
            },
            notificacoesEnviadas: state.notificacoesEnviadas,
            blockchain: {
              integra: chain.integra,
              totalBlocos: chain.totalBlocos,
              ultimoHash: chain.ultimoHash,
              genesisHash: chain.genesisHash
            }
          })
        }

        if (method === 'GET' && pathname === '/config-faixas') {
          return sendJson(res, 200, state.faixas)
        }

        if (method === 'PUT' && pathname.startsWith('/config-faixas/')) {
          const id = Number(pathname.split('/').pop())
          const body = await readJsonBody(req)
          const idx = state.faixas.findIndex((f) => f.id === id)
          if (idx === -1) return sendJson(res, 404, { error: 'Faixa não encontrada' })
          state.faixas[idx] = { ...state.faixas[idx], ...body, id }
          addAudit('MESA_REVISORA', 'CALIBRACAO_FAIXA_IA', `/config-faixas/${id}`, true)
          return sendJson(res, 200, { sucesso: true, faixa: state.faixas[idx] })
        }

        if (method === 'GET' && pathname === '/processos') {
          return sendJson(res, 200, state.processos)
        }

        if (method === 'POST' && pathname === '/processos') {
          const body = await readJsonBody(req)
          const chassi = String(body.chassi ?? '').trim()
          const cpfEsperado = body.dados?.cpfEsperadoBalcao
          const cpfVendedor = String(body.cpf_cnpj_vendedor ?? '').trim()

          if (cpfEsperado && cpfVendedor && cpfEsperado !== cpfVendedor) {
            addAudit('ANTIFRAUDE_ETAPA_II', 'BLOQUEIO_F01_DIVERGENCIA_BALCAOWS', '/processos', false)
            return sendJson(res, 422, {
              bloqueado: true,
              codigo: 'F-01',
              mensagem: `Bloqueio F-01: CPF/CNPJ do vendedor (${cpfVendedor}) diverge do cadastro oficial retornado pelo BalcãoWS (${cpfEsperado}).`
            })
          }

          if (!chassi) {
            addAudit('ANTIFRAUDE_ETAPA_II', 'BLOQUEIO_F03_CAMPO_OBRIGATORIO', '/processos', false)
            return sendJson(res, 422, {
              bloqueado: true,
              codigo: 'F-03',
              mensagem: 'Bloqueio F-03: Omissão de campo obrigatório (Chassi do veículo não informado).'
            })
          }

          if (chassi.length !== 17 || /INEXISTENTE|INVALID|00000000000000000/i.test(chassi)) {
            addAudit('ANTIFRAUDE_ETAPA_II', 'BLOQUEIO_F03_CHASSI_INEXISTENTE', '/processos', false)
            return sendJson(res, 422, {
              bloqueado: true,
              codigo: 'F-03',
              mensagem: `Bloqueio F-03: Chassi (${chassi}) inexistente na base estadual DETRAN-CE ou formato VIN inválido (17 caracteres).`
            })
          }

          const laudoId = String(body.laudo_vistoria_id ?? '').trim()
          if (laudoId && state.processos.some((p) => p.laudo_vistoria_id === laudoId)) {
            addAudit('ANTIFRAUDE_ETAPA_II', 'BLOQUEIO_F02_REUTILIZACAO_LAUDO', '/processos', false)
            return sendJson(res, 422, {
              bloqueado: true,
              codigo: 'F-02',
              mensagem: `Bloqueio F-02: Reutilização indevida de documento — laudo ${laudoId} já está vinculado a outro processo.`
            })
          }

          const id = state.nextProcId++
          const score = Number(body.score_ia ?? 90)
          const faixa = state.faixas[0] || { reprovacao_max: 49, revisao_max: 79, aprovacao_min: 80 }
          let status = 'EM_ANDAMENTO'
          if (score <= faixa.reprovacao_max) status = 'REPROVADO'
          else if (score <= faixa.revisao_max) status = 'EM_REVISAO_MANUAL'

          const protocolo = `TRF-2026-${String(id).padStart(4, '0')}`
          const novo = {
            id,
            protocolo,
            tipo_servico: body.tipo_servico || 'TRANSFERENCIA',
            natureza: body.natureza || 'PF_PF',
            placa: (body.placa || `POC${100 + id}A`).toUpperCase(),
            chassi: chassi.toUpperCase(),
            cpf_cnpj_vendedor: cpfVendedor || '07569577370',
            cpf_cnpj_comprador: String(body.cpf_cnpj_comprador || '01234567890'),
            laudo_vistoria_id: laudoId || `LAUDO-CE-${9900 + id}`,
            crv_antigo: Boolean(body.crv_antigo),
            possui_procuracao: Boolean(body.possui_procuracao),
            score_ia: score,
            etapa_atual: 1,
            status,
            hash_blockchain: sha256(`${protocolo}:${chassi}:${Date.now()}`),
            inconsistencias: body.dados?.motivoMesa ? [body.dados.motivoMesa] : [],
            dados: {
              vendedor: { nome: 'VINICIUS CAVALCANTE VIANA' },
              comprador: { nome: 'MARCOS VINICIUS ALMEIDA' },
              ...(body.dados || {})
            }
          }
          state.processos.unshift(novo)
          addAudit(
            status === 'EM_REVISAO_MANUAL' ? 'MESA_REVISORA' : 'BALCAOWS_DETRAN_CE',
            `ABERTURA_PROCESSO_${protocolo}`,
            '/processos',
            status !== 'REPROVADO'
          )
          return sendJson(res, 201, novo)
        }

        if (method === 'POST' && /^\/processos\/\d+\/avancar$/.test(pathname)) {
          const id = Number(pathname.split('/')[2])
          const proc = state.processos.find((p) => p.id === id)
          if (!proc) return sendJson(res, 404, { mensagem: 'Processo não encontrado' })
          const body = await readJsonBody(req)
          const acao = body.acaoDados || {}

          if (proc.etapa_atual < 7 && acao.tipoAssinatura === 'COMPRADOR') {
            addAudit('ANTIFRAUDE_ETAPA_II', 'BLOQUEIO_F04_SEQUENCIA_LOGICA', pathname, false)
            return sendJson(res, 422, {
              bloqueado: true,
              codigo: 'F-04',
              mensagem: 'Bloqueio F-04: Violação da sequência lógica — comprador não pode assinar antes da assinatura do vendedor (etapa < 7).'
            })
          }

          if (proc.etapa_atual < 7) {
            proc.etapa_atual = 7
          } else if (proc.etapa_atual < 13) {
            proc.etapa_atual = 13
            proc.status = 'CONCLUIDO'
          }
          proc.hash_blockchain = sha256(`${proc.protocolo}:etapa:${proc.etapa_atual}:${Date.now()}`)
          addAudit('EXTERNO_BIOMETRIA', `AVANCO_ETAPA_${proc.etapa_atual}_${proc.protocolo}`, pathname, true)
          return sendJson(res, 200, proc)
        }

        if (method === 'GET' && pathname === '/mesa-revisora') {
          return sendJson(res, 200, state.processos.filter((p) => p.status === 'EM_REVISAO_MANUAL'))
        }

        if (method === 'POST' && /^\/mesa-revisora\/\d+\/decisao$/.test(pathname)) {
          const id = Number(pathname.split('/')[2])
          const proc = state.processos.find((p) => p.id === id)
          if (!proc) return sendJson(res, 404, { error: 'Processo não encontrado na mesa revisora' })
          const body = await readJsonBody(req)
          const decisao = body.decisao === 'REPROVAR' ? 'REPROVAR' : 'APROVAR'
          proc.status = decisao === 'APROVAR' ? 'CONCLUIDO' : 'REPROVADO'
          if (decisao === 'APROVAR') proc.etapa_atual = 13
          proc.justificativa_auditor = body.justificativa || ''
          proc.hash_blockchain = sha256(`${proc.protocolo}:mesa:${decisao}:${Date.now()}`)
          state.notificacoesEnviadas += 1
          addAudit('MESA_REVISORA', `DECISAO_${decisao}_${proc.protocolo}`, pathname, decisao === 'APROVAR')
          return sendJson(res, 200, { sucesso: true, processo: proc })
        }

        if (method === 'GET' && pathname === '/auditoria') {
          const origem = parsed.searchParams.get('origem')
          const list = origem ? state.auditoria.filter((a) => a.origem === origem) : state.auditoria
          return sendJson(res, 200, list)
        }

        if (method === 'GET' && pathname === '/blockchain/validar') {
          return sendJson(res, 200, validateBlockchainLedger(state.auditoria))
        }

        if (method === 'POST' && pathname === '/assinatura/pades') {
          const body = await readJsonBody(req)
          const pdfBuf = buildMinimalPdf(body.titulo || 'Documento PAdES DETRAN/CE', body.protocolo || 'POC-NECAVA-001')
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-Disposition', 'attachment; filename="documento_pades_necava.pdf"')
          return res.end(pdfBuf)
        }

        if (method === 'GET' && pathname === '/etapa3/ultima-execucao') {
          const last = state.historicoEtapa3[0]
          if (!last) return sendJson(res, 200, { sucesso: false })
          return sendJson(res, 200, { sucesso: true, execucao: last })
        }

        if (method === 'GET' && pathname === '/etapa3/historico') {
          return sendJson(res, 200, state.historicoEtapa3)
        }

        if (method === 'POST' && (pathname === '/etapa3/processar-lote' || pathname === '/etapa3/simular-100-fotos')) {
          const rawBuf = await readRawBody(req)
          const uploadedNames = pathname === '/etapa3/processar-lote' ? extractMultipartFilenames(rawBuf) : []
          const count = uploadedNames.length || 100
          const brands = [
            ['VOLKSWAGEN', 'POLO TRACK'],
            ['FIAT', 'ARGO DRIVE'],
            ['CHEVROLET', 'ONIX LT'],
            ['HYUNDAI', 'HB20 SENSE'],
            ['TOYOTA', 'COROLLA XEI']
          ]
          const colors = ['BRANCA', 'PRATA', 'PRETA', 'CINZA', 'VERMELHA']
          const positions = ['DIANTEIRA', 'TRASEIRA']
          const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
          const resultados = Array.from({ length: count }, (_, i) => {
            const [marca, modelo] = brands[i % brands.length]
            const placa = `N${letters[(i + 2) % 26]}${letters[(i * 5) % 26]}${i % 10}${letters[(i * 3) % 26]}${String((i * 7) % 90 + 10).padStart(2, '0')}`.slice(0, 7)
            return {
              Arquivo: uploadedNames[i] || `foto_lote_${String(i + 1).padStart(3, '0')}.jpg`,
              Placa: placa,
              Marca: marca,
              Modelo: modelo,
              Cor: colors[i % colors.length],
              'Posição': positions[i % 2],
              Tipo: 'MERCOSUL',
              Originalidade: 'ORIGINAL'
            }
          })
          const id = state.nextBatchId++
          const tempoSegundos = Number((Math.min(42, Math.max(0.45, count * 0.28))).toFixed(2))
          const exec = {
            id,
            criadoEm: new Date().toISOString(),
            totalImagens: count,
            tempoSegundos,
            dentroLimite60s: tempoSegundos <= 60,
            downloadUrl: `/api/poc-ce/etapa3/download-csv/${id}`,
            resultados
          }
          state.historicoEtapa3.unshift(exec)
          addAudit('EXTERNO_VALIDACAO_DOC', `ETAPA3_LOTE_${count}_IMAGENS`, pathname, true)

          if (pathname === '/etapa3/simular-100-fotos') {
            return sendJson(res, 200, {
              tempoSegundos,
              linhas: resultados.map((r) => ({
                arquivo: r.Arquivo,
                placa: r.Placa,
                marca: r.Marca,
                modelo: r.Modelo,
                cor: r.Cor,
                posicao: r['Posição'],
                tipo: r.Tipo,
                originalidade: r.Originalidade
              }))
            })
          }
          return sendJson(res, 200, {
            tempoSegundos,
            resultados,
            csv: exec.downloadUrl
          })
        }

        if (method === 'GET' && (pathname.startsWith('/etapa3/download-csv') || pathname === '/etapa3/download-ultimo-csv')) {
          const maybeId = Number(pathname.split('/').pop())
          const batch = (!Number.isNaN(maybeId) && state.historicoEtapa3.find((h) => h.id === maybeId)) || state.historicoEtapa3[0]
          const csv = toCsv(batch?.resultados || [])
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/csv; charset=utf-8')
          res.setHeader('Content-Disposition', `attachment; filename="resultado_etapa3_lote_${batch?.id || 1}.csv"`)
          return res.end(csv)
        }

        if (method === 'GET' && pathname === '/oficial/dados') {
          return sendJson(res, 200, state.dadosOficiais)
        }

        if (method === 'POST' && pathname === '/oficial/testar-balcaows') {
          addAudit('BALCAOWS_DETRAN_CE', 'TESTE_CONEXAO_MTLS_AO_VIVO', pathname, true)
          return sendJson(res, 200, {
            sucesso: true,
            status: 200,
            token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.necava_detran_ce_homologacao_mtls.poc'
          })
        }

        if (method === 'POST' && pathname === '/oficial/executar-15-etapas') {
          addAudit('BALCAOWS_DETRAN_CE', 'PRIMEIRO_REGISTRO_15_ETAPAS_CONCLUIDO', pathname, true)
          state.notificacoesEnviadas += 1
          return sendJson(res, 200, {
            sucesso: true,
            protocolo: 'REG-OFICIAL-001',
            placa: 'NEV1A26'
          })
        }

        return next()
      } catch (err) {
        return sendJson(res, 500, { error: err?.message || 'Erro interno no mock PoC' })
      }
    })
  }

  function attachWebSocketHeartbeat(httpServer) {
    if (!httpServer) return
    httpServer.on('upgrade', (req, socket) => {
      if (!req.url?.startsWith('/api/poc-ce/ws')) return
      const key = req.headers['sec-websocket-key']
      if (!key) {
        socket.destroy()
        return
      }
      const accept = crypto
        .createHash('sha1')
        .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
        .digest('base64')

      socket.write(
        'HTTP/1.1 101 Switching Protocols\r\n' +
          'Upgrade: websocket\r\n' +
          'Connection: Upgrade\r\n' +
          `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
      )

      const sendFrame = (obj) => {
        if (socket.destroyed) return
        const payload = Buffer.from(JSON.stringify(obj), 'utf-8')
        const len = payload.length
        const header = len < 126 ? Buffer.from([0x81, len]) : Buffer.from([0x81, 126, (len >> 8) & 0xff, len & 0xff])
        socket.write(Buffer.concat([header, payload]))
      }

      sendFrame({ type: 'connected', ts: new Date().toISOString() })
      const interval = setInterval(() => {
        sendFrame({ type: 'heartbeat', ts: new Date().toISOString() })
      }, 15000)

      socket.on('close', () => clearInterval(interval))
      socket.on('end', () => clearInterval(interval))
      socket.on('error', () => clearInterval(interval))
    })
  }

  return {
    name: 'poc-ce-mock-api',
    configureServer(server) {
      attachMiddleware(server.middlewares)
      attachWebSocketHeartbeat(server.httpServer)
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares)
      attachWebSocketHeartbeat(server.httpServer)
    }
  }
}
