const $ = (id) => document.getElementById(id)

function show(msg, cls) {
  const s = $('status')
  s.textContent = msg
  s.className = cls
  s.style.display = 'block'
}

// Carrega config salva
chrome.storage.local.get(['url', 'token'], (d) => {
  $('url').value = d.url || 'https://thays.ibyt.com.br'
  $('token').value = d.token || ''
})

$('toggle').onclick = () => {
  const t = $('token')
  t.type = t.type === 'password' ? 'text' : 'password'
}

$('save').onclick = () => {
  const url = $('url').value.trim().replace(/\/+$/, '')
  const token = $('token').value.trim()
  chrome.storage.local.set({ url, token }, () => show('Configuração salva.', 'ok'))
}

// Função injetada na página do WhatsApp Web para ler os contatos da lista.
async function scrapeWhatsApp() {
  const pane = document.querySelector('#pane-side')
  const seen = new Map()
  const isPhone = (t) => /^\+?[\d\s()\-.]{8,}$/.test(t) && t.replace(/\D/g, '').length >= 8

  const collect = () => {
    document.querySelectorAll('#pane-side div[role="listitem"]').forEach((item) => {
      const span = item.querySelector('span[title]')
      if (!span) return
      const t = (span.getAttribute('title') || span.textContent || '').trim()
      if (!t || seen.has(t)) return
      if (isPhone(t)) seen.set(t, { name: '', phone: t })
      else seen.set(t, { name: t, phone: '' })
    })
  }

  if (pane) {
    let last = -1
    for (let i = 0; i < 40; i++) {
      collect()
      if (seen.size === last) break
      last = seen.size
      pane.scrollBy(0, pane.clientHeight)
      await new Promise((r) => setTimeout(r, 350))
    }
    pane.scrollTo(0, 0)
  }
  collect()
  return [...seen.values()]
}

// Função injetada para ler o contato da conversa aberta (cabeçalho do #main).
function scrapeOpenChat() {
  const header = document.querySelector('#main header')
  if (!header) return null
  const isPhone = (t) => /^\+?[\d\s()\-.]{8,}$/.test(t) && t.replace(/\D/g, '').length >= 8
  // O título do contato costuma ser o primeiro span[title] com dir="auto" no header.
  const spans = [...header.querySelectorAll('span[title]')]
  const t = (spans.find((s) => (s.getAttribute('title') || '').trim())?.getAttribute('title') || '').trim()
  if (!t) return null
  return isPhone(t) ? { name: '', phone: t } : { name: t, phone: '' }
}

// Envia os contatos ao sistema e mostra o resultado. Retorna true em sucesso.
async function enviar(url, token, contatos, lidosLabel) {
  show(`Enviando ${contatos.length} ${lidosLabel}…`, 'ok')
  try {
    const r = await fetch(`${url}/api/v1/integracao/sincronizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Integration-Key': token },
      body: JSON.stringify({ contatos }),
    })
    if (r.status === 401) { show('Token inválido. Confira o token de integração.', 'err'); return false }
    if (!r.ok) { show('Erro do servidor: HTTP ' + r.status, 'err'); return false }
    const d = (await r.json()).data
    show(`Concluído! ${contatos.length} ${lidosLabel} · ${d.criados} novos · ${d.existentes} já existiam · ${d.ignorados} ignorados.`, 'ok')
    return true
  } catch (e) {
    show('Falha de conexão com ' + url + ': ' + e.message, 'err')
    return false
  }
}

// Garante URL+token, aba do WhatsApp ativa e roda o scraper informado.
async function coletar(botao, mensagemLendo, scraper) {
  const url = $('url').value.trim().replace(/\/+$/, '')
  const token = $('token').value.trim()
  if (!url || !token) { show('Preencha a URL e o token.', 'err'); return null }
  chrome.storage.local.set({ url, token })

  $(botao).disabled = true
  show(mensagemLendo, 'ok')

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab || !/web\.whatsapp\.com/.test(tab.url || '')) {
    show('Abra o web.whatsapp.com na aba ativa e tente de novo.', 'err')
    $(botao).disabled = false
    return null
  }
  try {
    const res = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: scraper })
    return { url, token, result: (res && res[0] && res[0].result) || null }
  } catch (e) {
    show('Não consegui ler a página: ' + e.message, 'err')
    $(botao).disabled = false
    return null
  }
}

$('capture').onclick = async () => {
  const c = await coletar('capture', 'Lendo a conversa aberta…', scrapeOpenChat)
  if (!c) return
  if (!c.result) {
    show('Nenhuma conversa aberta. Abra a conversa do contato e tente de novo.', 'err')
  } else {
    await enviar(c.url, c.token, [c.result], 'contato')
  }
  $('capture').disabled = false
}

$('sync').onclick = async () => {
  const c = await coletar('sync', 'Lendo contatos do WhatsApp…', scrapeWhatsApp)
  if (!c) return
  const contatos = c.result || []
  if (!contatos.length) {
    show('Nenhum contato encontrado. Verifique se as conversas estão carregadas.', 'err')
  } else {
    await enviar(c.url, c.token, contatos, 'contatos')
  }
  $('sync').disabled = false
}
