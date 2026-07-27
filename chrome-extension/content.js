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
// Usa um evento de "paste" porque o editor (Lexical) preserva as quebras de linha
// do texto colado; o execCommand('insertText') junta tudo numa linha só.
function escrever(input, txt) {
  input.focus()
  const sel = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(input)
  sel.removeAllRanges()
  sel.addRange(range)
  const dt = new DataTransfer()
  dt.setData('text/plain', txt)
  input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }))
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
// Chama a API pelo service worker (a página do WhatsApp bloqueia fetch externo por CSP).
const chamarApi = (msg) => new Promise((r) => chrome.runtime.sendMessage(msg, r))

// Mostra um selo flutuante na página com o que a extensão está fazendo (diagnóstico).
function statusPP(msg, cor) {
  try {
    let el = document.getElementById('pp-status')
    if (!el) {
      el = document.createElement('div')
      el.id = 'pp-status'
      el.style.cssText =
        'position:fixed;z-index:2147483647;bottom:16px;right:16px;max-width:340px;padding:10px 14px;' +
        'border-radius:10px;font:13px/1.4 system-ui,sans-serif;color:#fff;background:#5865f2;' +
        'box-shadow:0 6px 20px rgba(0,0,0,.28)'
      ;(document.body || document.documentElement).appendChild(el)
    }
    el.style.background = cor || '#5865f2'
    el.textContent = 'PedidosPro: ' + msg
  } catch (e) { /* ignora */ }
}

async function esperarFooter(timeoutMs) {
  const fim = Date.now() + timeoutMs
  while (Date.now() < fim) {
    if (document.querySelector('#main footer div[contenteditable="true"][role="textbox"]')) return true
    await sleep(300)
  }
  return false
}

// Rola a lista de conversas procurando a do cliente (por nome exato ou pelo
// número, ignorando o DDI) e clica para abrir. Sem navegação — tudo na mesma página.
async function acharEClicarConversa(nome, telefone) {
  const pane = document.querySelector('#pane-side')
  if (!pane) return false
  const nomeAlvo = (nome || '').trim().toLowerCase()
  const alvoDigits = (telefone || '').replace(/\D/g, '').replace(/^55/, '')
  const clickSeq = (el) => {
    const r = el.getBoundingClientRect()
    for (const e of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'])
      el.dispatchEvent(new MouseEvent(e, { bubbles: true, cancelable: true, view: window, clientX: r.x + 30, clientY: r.y + 30 }))
  }
  const tentar = () => {
    for (const row of pane.querySelectorAll('[role="row"]')) {
      const span = row.querySelector('span[dir="auto"][title]')
      const t = span ? (span.getAttribute('title') || '').trim() : ''
      if (!t) continue
      const td = t.replace(/\D/g, '').replace(/^55/, '')
      const mNome = nomeAlvo && t.toLowerCase() === nomeAlvo
      const mTel = alvoDigits && td && (td === alvoDigits || td.endsWith(alvoDigits) || alvoDigits.endsWith(td))
      if (mNome || mTel) { clickSeq(row.querySelector('[data-testid="cell-frame-container"]') || row); return true }
    }
    return false
  }
  pane.scrollTo(0, 0)
  await sleep(300)
  let last = -1
  for (let i = 0; i < 80; i++) {
    if (tentar()) return true
    pane.scrollBy(0, pane.clientHeight * 0.8)
    await sleep(220)
    if (pane.scrollTop === last) break // chegou ao fim da lista
    last = pane.scrollTop
  }
  return tentar()
}

async function pollOrcamentos() {
  if (ocupado || !cfgApi.orcamentoEnabled || !cfgApi.url || !cfgApi.token) return

  const resp = await chamarApi({ type: 'orcPendentes' })
  if (!resp) { statusPP('service worker não respondeu — recarregue a extensão.', '#c0392b'); return }
  if (!resp.ok) { statusPP('erro ao consultar o servidor (HTTP ' + (resp.status || '?') + ').', '#c0392b'); return }
  const lista = resp.data || []
  if (!lista.length) return

  const skip = (await getLocal('waOrcSkip')) || {}
  const agora = Date.now()
  const cand = lista.find((o) => !skip[o.nunota] || agora - skip[o.nunota] > 3600000)
  if (!cand) return

  ocupado = true
  try {
    const quem = cand.cliente || cand.telefone
    statusPP('procurando conversa de ' + quem + ' (orçamento #' + cand.nunota + ')…')
    const abriu = await acharEClicarConversa(cand.cliente, cand.telefone)
    if (!abriu) {
      const s = (await getLocal('waOrcSkip')) || {}
      s[cand.nunota] = Date.now()
      await setLocal({ waOrcSkip: s })
      statusPP('não encontrei a conversa de ' + quem + ' na lista.', '#c0392b')
      return
    }
    if (!(await esperarFooter(15000))) { statusPP('a conversa de ' + quem + ' não abriu.', '#c0392b'); return }
    statusPP('digitando orçamento #' + cand.nunota + '…')
    const enviado = await enviar(cand.mensagem)
    if (enviado) {
      await chamarApi({ type: 'orcConfirmar', nunota: cand.nunota, hash: cand.hash })
      statusPP('orçamento #' + cand.nunota + ' enviado para ' + quem + ' ✓', '#1f9d6b')
    } else {
      statusPP('não consegui digitar/enviar #' + cand.nunota + '.', '#c0392b')
    }
  } finally {
    ocupado = false
  }
}

// Monitor de resposta automática por DDD.
setInterval(() => { ciclo().catch(() => {}) }, 5000)
// Envio de orçamentos (busca a conversa na lista, sem navegar).
setInterval(() => { pollOrcamentos().catch(() => {}) }, 20000)

// Sinaliza que a extensão está ativa (some depois de alguns segundos).
setTimeout(() => {
  if (cfgApi.orcamentoEnabled) {
    statusPP('ativa — monitorando orçamentos a cada 20s.', '#5865f2')
    setTimeout(() => { const el = document.getElementById('pp-status'); if (el && /monitorando/.test(el.textContent)) el.remove() }, 6000)
  }
}, 4000)
