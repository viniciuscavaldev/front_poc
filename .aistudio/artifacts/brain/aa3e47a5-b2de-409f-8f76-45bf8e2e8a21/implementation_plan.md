# Redesign Guiado — Etapa 1: Primeiro Registro Veicular (0km) · DETRAN/CE

Redesenho estrutural e visual do módulo de Primeiro Emplacamento 0km para transformá-lo em um fluxo guiado em 3 passos (Passo 1, Passo 2 e Passo 3), conduzindo o fiscal avaliador do DETRAN-CE desde a autenticação mTLS até a emissão e impressão do CRLV-e Digital oficial.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> As decisões abaixo refletem exatamente as escolhas confirmadas na etapa de esclarecimento e governam toda a implementação do fluxo guiado.

- **Bloqueio Estrito Passo 1 → Passo 2 (Confirmado)**: A execução do Rito Operacional das 15 etapas (`Passo 2`) permanece estritamente bloqueada e desabilitada até que a verificação ao vivo `mTLS + Sessão Biométrica` (`Passo 1`) retorne sucesso com Bearer Token JWT ativo.
- **Visualização das 15 Etapas em Linha do Tempo Vertical (Confirmado)**: As etapas oficiais (`I` a `XV`) serão apresentadas em uma linha do tempo vertical sequencial com trilha contínua de progresso, indicadores de estado (`Aguardando`, `Executando`, `Concluído`) e abertura do Modal de Inspeção Técnica BalcãoWS ao clicar em qualquer nó.
- **CRLV-e Inline + Modal Ampliado no Passo 3 (Confirmado)**: Ao concluir a 15ª etapa, o `Passo 3` exibirá diretamente na tela um preview fiel da cédula verde e branca do CRLV-e (Resolução CONTRAN 809/2020), acompanhado dos botões para abrir o modal ampliado (**Visualizar CRLV-e Emitido**), baixar o PDF assinado PAdES e imprimir (`window.print()`).

---

## 1. Overview & Core Concept

- **O que faz**: Conduz o operador por um roteiro sequencial e autoexplicativo de homologação de veículo 0km (Mercedes-Benz B200 CGI · Chassi `NEM85106037002GB2` · Placa `NEV1A26` · RENAVAM `01429817451`), integrando autenticação mTLS/JWT, rastreio das 15 chamadas BalcãoWS e emissão do CRLV-e Digital com carimbo PAdES.
- **Público-alvo**: Fiscais e Comissão de Avaliação Técnica do DETRAN-CE durante sessão pública ao vivo de Prova de Conceito (PoC), além de operadores credenciados da NECAVA (`CNPJ 05.591.991/0001-48`).
- **Valor principal**: Elimina ambiguidades operacionais durante a avaliação ao vivo, tornando visível a ordem obrigatória de segurança (mTLS antes de transações RENAVAM), o progresso técnico de cada endpoint e a evidência documental final no mesmo fluxo visual.

---

## 2. User Experience & Visual Design

### Fluxo Guiado do Usuário (Passo 1 → Passo 2 → Passo 3)

1. **Faixa de Progresso Superior (Walkthrough Stepper)**:
   - Indicador horizontal no topo do módulo com os 3 marcos principais (`Passo 1 · Segurança mTLS`, `Passo 2 · Rito 15 Etapas`, `Passo 3 · CRLV-e Digital`) ligados por divisores limpos, atualizados em tempo real conforme o estado da sessão.
   - Dossiê compacto do veículo homologado e do adquirente (`VINICIUS CAVALCANTE VIANA · CPF 075.695.773-70`), separado por divisores hairline de `1px` (sem cards aninhados) e com botão direto para download da DANFE oficial (`/downloads/DANFE_TESTE_DETRAN_CE.pdf`).
2. **Passo 1 — Camada de Segurança mTLS & Sessão Biométrica**:
   - Cartão principal com identificação clara do endpoint estadual (`https://balcaows.detran.ce.gov.br/balcaows_dev`) e botão primário **Executar Verificação BalcãoWS (mTLS)**.
   - Ao autenticar com sucesso, revela o painel de sessão ativa em verde esmeralda (`emerald-500`) destacando a validação do certificado `e-CNPJ A1 ICP-Brasil` da NECAVA, o status da biometria facial e o campo monoespaçado do Token Bearer JWT com botão de cópia para área de transferência.
   - Caso haja falha ou pendência, exibe diagnóstico estruturado e mantém o Passo 2 bloqueado até nova verificação bem-sucedida.
3. **Passo 2 — Rito Operacional das 15 Etapas Oficiais (Linha do Tempo Vertical)**:
   - Enquanto o Passo 1 não for autenticado com sucesso, exibe aviso objetivo de pré-requisito obrigatório com atalho visual de foco/scroll para o Passo 1, mantendo o botão **Executar Rito Operacional (15 Etapas)** estritamente bloqueado (`disabled`).
   - Com o Passo 1 validado, libera o botão primário **Executar Rito Operacional (15 Etapas)** (e **Reiniciar Rito** após conclusão) junto à barra de progresso inteligente (`0%` a `100%`).
   - **Linha do Tempo Vertical Sequencial**: Eixo vertical contínuo à esquerda conectando os 15 nós numerados (`I` a `XV` / `01` a `15`), com preenchimento progressivo da trilha em `emerald-500` conforme cada etapa avança. Cada linha interativa exibe número romano/ordinal, nome oficial, método HTTP (`POST`/`GET`), rota BalcãoWS em `JetBrains Mono`, estado atual (`Aguardando`, `Executando`, `Concluído`) e affordance `JSON`.
   - Clicar em qualquer etapa abre o **Modal de Inspeção Técnica do BalcãoWS** com seletor segmentado (`Visão Completa`, `Camada mTLS`, `Request JSON`, `Response JSON`), cabeçalhos mTLS + Bearer JWT, cópia individual dos payloads e status `HTTP 200 OK`.
4. **Passo 3 — Conclusão & Cédula do CRLV-e Digital Oficial**:
   - Enquanto o rito não atingir `15/15`, permanece em estado de espera elegante indicando que a cédula será liberada após a averbação da Etapa XV.
   - Ao concluir a 15ª etapa, revela o banner de homologação concluída, o **preview inline completo da cédula verde e branca do CRLV-e** (`#006B3F`) com todos os campos regulamentares (CLA `98412847192`, CRV, RENAVAM `01429817451`, Placa `NEV1A26`, Chassi `NEM85106037002GB2`, Proprietário, QR Code VIO vetorial e carimbo digital PAdES), além das ações **Visualizar CRLV-e Emitido** (abre o modal ampliado), **Baixar PDF Assinado (PAdES)** (`/downloads/CRLV_NEV1A26_OFICIAL.pdf`) e **Imprimir CRLV-e** (`window.print()`).

### Identidade Visual, Tipografia e Restrições de Design

- **Tema & Paleta (60-30-10)**:
  - Canvas principal Obsidian (`#0B0F17`), superfícies estruturais em Slate escuro (`#111827`) com bordas hairline `border-slate-800/80` (elevação única, zero empilhamento de bordas grossas ou `border-l-4`).
  - Acentos estritamente funcionais: Verde Esmeralda (`emerald-500` / `emerald-400`) para autenticação concluída, etapas averbadas e CTAs de emissão; Azul Safira (`sky-500` / `sky-400`) para ação mTLS, métodos `POST` e downloads fiscais; Âmbar (`amber-400`) exclusivamente para alertas/bloqueio pré-mTLS; Verde oficial `#006B3F` exclusivamente dentro da cédula CRLV-e.
- **Tipografia & Densidade**:
  - `Plus Jakarta Sans` para títulos e instruções em linguagem clara; `JetBrains Mono` com `font-variant-numeric: tabular-nums` para Chassi, RENAVAM, CLA, CPF, NF-e, JWT e rotas HTTP.
  - Zero uso de cápsulas/pílulas decorativas em metadados estáticos (separação limpa com `·`), sem prefixos mecânicos de código em títulos e com todos os botões em linha única (`whitespace-nowrap shrink-0`).
- **Feedback & Microinterações**:
  - Transições suaves dentro de `200ms`, estados de carregamento skeleton na carga inicial, spinners funcionais apenas em requisições ativas e integração nativa com `useToast()` para confirmar handshake mTLS, conclusão do rito e cópia de tokens/JSON.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1 — Bloqueio Estrito do Passo 2 por Estado `mtlsAutenticado`**:
  - *Abordagem escolhida*: Derivar `mtlsAutenticado = Boolean(resultadoAoVivo?.sucesso)` localmente no componente e impedir a chamada `executar-15-etapas` até sua confirmação, exibindo feedback claro dentro do Passo 2 com botão para focar o Passo 1.
  - *Motivo*: Garante aderência rigorosa à sequência de segurança exigida pelos fiscais do DETRAN-CE (não há operação RENAVAM sem sessão biométrica/e-CNPJ validada).
  - *Alternativa descartada*: Execução livre com aviso opcional, que permitiria pular a demonstração mTLS durante a apresentação.
- **Decisão 2 — Componente Compartilhado Interno para Cédula CRLV-e**:
  - *Abordagem escolhida*: Extrair a renderização da cédula verde e branca (com QR Code VIO SVG e carimbo PAdES) para um subcomponente interno reutilizado tanto no preview inline do Passo 3 quanto no modal ampliado, atribuindo o identificador de impressão `#crlv-printable-document` dinamicamente apenas à instância ativa (modal quando aberto, ou preview inline caso contrário).
  - *Motivo*: Evita duplicação visual entre o preview inline e o modal e impede conflito de duas cédulas simultâneas no `@media print`.
  - *Alternativa descartada*: Manter duas marcações separadas de CRLV-e, o que dobraria manutenção e quebraria o CSS de impressão.
- **Decisão 3 — Linha do Tempo Vertical com Eixo Contínuo e Scroll Suave**:
  - *Abordagem escolhida*: Renderizar a lista de 15 etapas em coluna única com trilha vertical contínua, numeração romana + cardinal, badge textual/ícone de status e card clicável para inspeção JSON.
  - *Motivo*: Facilita a leitura sequencial em câmera/projeção durante a PoC e mostra com precisão qual etapa está em execução a cada `220ms`, mantendo todas as rotas e payloads acessíveis.
  - *Alternativa descartada*: Grade em 3 colunas ou accordion recolhido, que escondem a progressão linear I → XV.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Arquitetura de Componentes & Fluxo de Estados

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                   PrimeiroRegistroOficial (Walkthrough)                    │
│  Estado: dados | testandoAoVivo | resultadoAoVivo | executandoRito         │
│          etapaAtual (0..15) | concluido | etapaSelecionada | modalCrlv     │
└───────┬──────────────────────────┬──────────────────────────┬──────────────┘
        │                          │                          │
        ▼                          ▼                          ▼
┌───────────────────┐    ┌─────────────────────┐    ┌────────────────────────┐
│ Passo 1: mTLS     │───▶│ Passo 2: Trilha     │───▶│ Passo 3: CRLV-e        │
│ POST              │    │ Vertical (I..XV)    │    │ Preview Inline +       │
│ /oficial/         │    │ POST /oficial/      │    │ Modal Ampliado +       │
│ testar-balcaows   │    │ executar-15-etapas  │    │ Download PDF & Print   │
└────────┬──────────┘    └──────────┬──────────┘    └───────────┬────────────┘
         │                          │                           │
         ▼                          ▼                           ▼
┌───────────────────┐    ┌─────────────────────┐    ┌────────────────────────┐
│ onAtualizar       │    │ Modal Inspeção JSON │    │ Cédula Oficial CONTRAN │
│ Dashboard() +     │    │ (mTLS / Req / Res)  │    │ #crlv-printable-       │
│ useToast()        │    │ + onProgressChange  │    │ document (único ativo) │
└───────────────────┘    └─────────────────────┘    └────────────────────────┘
```

### Contrato de Dados & Mapeamento de Interações

- **Carga Inicial (`GET /api/poc-ce/oficial/dados`)**: Popula `veiculo`, `nfe`, `adquirente` e `etapasDetalhadas` (15 itens), exibindo estado de skeleton enquanto carrega e fallback com retry em caso de erro.
- **Passo 1 (`POST /api/poc-ce/oficial/testar-balcaows`)**: Ativa estado de loading no botão, recebe `{ sucesso, status, token }`, atualiza `resultadoAoVivo`, dispara toast de sucesso/erro e invoca `onAtualizarDashboard()`. Se `reiniciarRito()` for acionado, zera o progresso das etapas (`etapaAtual = 0`, `concluido = false`) preservando a sessão mTLS autenticada (ou permitindo nova verificação a qualquer momento).
- **Passo 2 (`POST /api/poc-ce/oficial/executar-15-etapas`)**: Bloqueado enquanto `!resultadoAoVivo?.sucesso`. Quando liberado e acionado, anima `etapaAtual` de `1` a `15`, persiste no backend, marca `concluido = true`, atualiza `onAtualizarDashboard()` e notifica `onProgressChange({ etapaAtual, executandoRito, concluido, mtlsPendencia })` para manter o mini-map lateral sincronizado.
- **Inspeção & Emissão (Passo 2 & Passo 3)**: Clicar em qualquer nó da linha do tempo abre o modal de inspeção com abas de visualização (`Visão Completa`, `Camada mTLS`, `Request JSON`, `Response JSON`) e cópia via `navigator.clipboard`; no Passo 3, `modalCrlv` alterna o modal ampliado enquanto o download aponta para `/downloads/CRLV_NEV1A26_OFICIAL.pdf` e a impressão chama `window.print()`.
