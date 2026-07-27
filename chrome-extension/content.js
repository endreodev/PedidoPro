// PedidosPro — Resposta automática no WhatsApp Web
// Monitora as conversas não lidas. Quando chega mensagem de um contato cujo
// DDD não é o permitido (padrão 65 = Cuiabá/Várzea Grande-MT), responde uma
// única vez com uma mensagem automática. Roda como content script.
//
// Seletores confirmados ao vivo (WhatsApp Web 2026):
//   lista .......... #pane-side [role="row"]
//   nome/telefone .. span[dir="auto"][title]   (title)
//   não lida ....... descendente com aria-label contendo "não lida"
//   caixa .......... #main footer div[contenteditable="true"][role="textbox"]
//   enviar ......... #main footer button[aria-label="Enviar"]

const CFG_DEFAULT = {
  autoReplyEnabled: false,
  dddPermitido: '65',
  instagram: '@sualoja',
  mensagem:
    'Olá! Agradecemos muito o seu contato 💜 No momento, nosso atendimento é apenas em Cuiabá e Várzea Grande, no estado de Mato Grosso. Para acompanhar as novidades e fazer seu pedido, siga o nosso Instagram: {instagram}',
}

let cfg = { ...CFG_DEFAULT }
let respondidos = new Set()
let ocupado = false

function carregarConfig() {
  chrome.storage.local.get(
    ['autoReplyEnabled', 'dddPermitido', 'instagram', 'mensagem', 'respondidos'],
    (d) => {
      cfg = {
        autoReplyEnabled: !!d.autoReplyEnabled,
        dddPermitido: (d.dddPermitido || CFG_DEFAULT.dddPermitido).replace(/\D/g, '') || '65',
        instagram: d.instagram || CFG_DEFAULT.instagram,
        mensagem: d.mensagem || CFG_DEFAULT.mensagem,
      }
      respondidos = new Set(d.respondidos || [])
    }
  )
}
carregarConfig()
chrome.storage.onChanged.addListener(carregarConfig)

const soDigitos = (t) => (t || '').replace(/\D/g, '')
const ehTelefone = (t) => /^\+?[\d\s()\-.]{8,}$/.test(t) && soDigitos(t).length >= 8

// Extrai o DDD (2 dígitos) de um telefone brasileiro em vários formatos.
function dddDe(texto) {
  let d = soDigitos(texto)
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2) // remove código do país
  if (d.length >= 10) return d.slice(0, 2)
  return null
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function marcarRespondido(chave) {
  respondidos.add(chave)
  chrome.storage.local.set({ respondidos: [...respondidos] })
}

// Escreve o texto na caixa do WhatsApp (substitui qualquer rascunho) — só DOM.
function escrever(input, txt) {
  input.focus()
  const sel = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(input)
  sel.removeAllRanges()
  sel.addRange(range)
  document.execCommand('insertText', false, txt)
}

async function abrirConversa(row) {
  const alvo = row.querySelector('[data-testid="cell-frame-container"]') || row
  const r = alvo.getBoundingClientRect()
  for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
    alvo.dispatchEvent(
      new MouseEvent(type, { bubbles: true, cancelable: true, view: window, clientX: r.x + 30, clientY: r.y + 30 })
    )
  }
  for (let i = 0; i < 25; i++) {
    if (document.querySelector('#main footer div[contenteditable="true"][role="textbox"]')) return true
    await sleep(150)
  }
  return false
}

async function enviar(mensagem) {
  const input = document.querySelector('#main footer div[contenteditable="true"][role="textbox"]')
  if (!input) return false
  escrever(input, mensagem)
  await sleep(400)
  const btn = document.querySelector('#main footer button[aria-label="Enviar"]')
  if (!btn) return false
  btn.click()
  await sleep(400)
  return true
}

// Um ciclo de varredura: procura a primeira conversa não lida elegível e responde.
async function ciclo() {
  if (ocupado || !cfg.autoReplyEnabled) return
  const pane = document.querySelector('#pane-side')
  if (!pane) return

  const rows = [...pane.querySelectorAll('[role="row"]')]
  for (const row of rows) {
    const naoLida =
      row.querySelector('[aria-label*="não lida"], [aria-label*="nao lida"], [aria-label*="unread"]')
    if (!naoLida) continue

    const span = row.querySelector('span[dir="auto"][title]')
    const titulo = span ? (span.getAttribute('title') || '').trim() : ''
    // Só tratamos quando o número é visível (contato não salvo = novo cliente).
    // Contatos salvos e grupos (título é nome) são ignorados por segurança.
    if (!ehTelefone(titulo)) continue

    const chave = soDigitos(titulo)
    if (respondidos.has(chave)) continue

    const ddd = dddDe(titulo)
    if (!ddd || ddd === cfg.dddPermitido) continue // é 65 (ou indefinido) → deixa para o humano

    ocupado = true
    try {
      const abriu = await abrirConversa(row)
      if (abriu) {
        const msg = cfg.mensagem.replaceAll('{instagram}', cfg.instagram)
        const ok = await enviar(msg)
        if (ok) marcarRespondido(chave)
      }
    } catch (e) {
      // silencioso — tenta de novo no próximo ciclo
    } finally {
      ocupado = false
    }
    return // uma conversa por ciclo
  }
}

// =====================================================================
// Envio de ORÇAMENTOS pelo WhatsApp
// Consulta o endpoint do sistema, envia para o telefone do cliente e confirma.
// O servidor controla duplicidade/alteração por hash: só volta na lista quando
// nunca foi enviado ou quando o orçamento mudou. Só orçamentos (status ORCAMENTO).
// =====================================================================

let cfgApi = { url: '', token: '', orcamentoEnabled: false }
function carregarApi() {
  chrome.storage.local.get(['url', 'token', 'orcamentoEnabled'], (d) => {
    // Corrige domínio antigo (thays -> pedidos) e persiste a correção.
    const url = (d.url || '').replace('thays.ibyt.com.br', 'pedidos.ibyt.com.br').replace(/\/+$/, '')
    if (url && url !== d.url) chrome.storage.local.set({ url })
    cfgApi = { url, token: d.token || '', orcamentoEnabled: !!d.orcamentoEnabled }
  })
}
carregarApi()
chrome.storage.onChanged.addListener(carregarApi)

const getLocal = (k) => new Promise((r) => chrome.storage.local.get([k], (d) => r(d[k])))
const setLocal = (o) => new Promise((r) => chrome.storage.local.set(o, r))

async function esperarFooter(timeoutMs) {
  const fim = Date.now() + timeoutMs
  while (Date.now() < fim) {
    if (document.querySelector('#main footer div[contenteditable="true"][role="textbox"]')) return true
    await sleep(300)
  }
  return false
}

// Após navegar para send?phone, completa o envio do orçamento pendente.
async function completarOrcamentoPendente() {
  const atual = await getLocal('waOrcAtual')
  if (!atual) return
  // Segurança: só completa se a navegação foi recente (evita envio errado em reload solto).
  if (!atual.ts || Date.now() - atual.ts > 90000) {
    await setLocal({ waOrcAtual: null })
    return
  }
  const abriu = await esperarFooter(20000)
  if (!abriu) {
    const skip = (await getLocal('waOrcSkip')) || {}
    skip[atual.nunota] = Date.now()
    await setLocal({ waOrcSkip: skip, waOrcAtual: null })
    return
  }
  const ok = await enviar(atual.mensagem)
  if (ok) {
    const { url, token } = cfgApi.token ? cfgApi : { url: (await getLocal('url') || '').replace(/\/+$/, ''), token: await getLocal('token') }
    try {
      await fetch(url + '/api/v1/integracao/orcamentos-enviados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Integration-Key': token },
        body: JSON.stringify({ nunota: atual.nunota, hash: atual.hash }),
      })
    } catch (e) { /* tenta confirmar de novo no próximo poll (hash ainda pendente) */ }
  }
  await setLocal({ waOrcAtual: null })
}

async function pollOrcamentos() {
  if (ocupado || !cfgApi.orcamentoEnabled || !cfgApi.url || !cfgApi.token) return
  if (await getLocal('waOrcAtual')) return // envio em andamento (aguardando navegação)

  let lista = []
  try {
    const r = await fetch(cfgApi.url + '/api/v1/integracao/orcamentos-pendentes', {
      headers: { 'X-Integration-Key': cfgApi.token },
    })
    if (!r.ok) return
    lista = (await r.json()).data || []
  } catch (e) { return }
  if (!lista.length) return

  const skip = (await getLocal('waOrcSkip')) || {}
  const agora = Date.now()
  const cand = lista.find((o) => !skip[o.nunota] || agora - skip[o.nunota] > 3600000)
  if (!cand) return

  await setLocal({ waOrcAtual: { nunota: cand.nunota, hash: cand.hash, telefone: cand.telefone, mensagem: cand.mensagem, ts: Date.now() } })
  // Abre a conversa do número (mesmo não salvo). O reload continua o envio.
  location.href = 'https://web.whatsapp.com/send?phone=' + encodeURIComponent(cand.telefone)
}

// Monitor de resposta automática por DDD.
setInterval(() => { ciclo().catch(() => {}) }, 5000)

// Envio de orçamentos: primeiro completa um pendente pós-navegação, depois busca novos.
;(async () => { try { await completarOrcamentoPendente() } catch (e) {} })()
setInterval(() => { pollOrcamentos().catch(() => {}) }, 20000)
