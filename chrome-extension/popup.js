const $ = (id) => document.getElementById(id)

function show(msg, cls) {
  const s = $('status')
  s.textContent = msg
  s.className = cls
  s.style.display = 'block'
}

const DEFAULT_URL = 'https://pedidos.ibyt.com.br'
// Corrige domínios antigos salvos e usa o padrão quando vazio.
const fixUrl = (u) => {
  u = (u || '').replace('thays.ibyt.com.br', 'pedidos.ibyt.com.br').replace(/\/+$/, '')
  return u || DEFAULT_URL
}

const MSG_PADRAO =
  'Olá! Agradecemos muito o seu contato 💜 No momento, nosso atendimento é apenas em Cuiabá e Várzea Grande, no estado de Mato Grosso. Para acompanhar as novidades e fazer seu pedido, siga o nosso Instagram: {instagram}'

// Carrega config salva
chrome.storage.local.get(
  ['url', 'token', 'autoReplyEnabled', 'dddPermitido', 'instagram', 'mensagem', 'orcamentoEnabled'],
  (d) => {
    const url = fixUrl(d.url)
    $('url').value = url
    if (url !== d.url) chrome.storage.local.set({ url }) // persiste a correção
    $('token').value = d.token || ''
    $('orcamentoEnabled').checked = !!d.orcamentoEnabled
    $('autoReplyEnabled').checked = !!d.autoReplyEnabled
    $('dddPermitido').value = d.dddPermitido || '65'
    $('instagram').value = d.instagram || ''
    $('mensagem').value = d.mensagem || MSG_PADRAO
  }
)

$('saveAuto').onclick = () => {
  const autoReplyEnabled = $('autoReplyEnabled').checked
  const dddPermitido = ($('dddPermitido').value.trim().replace(/\D/g, '') || '65')
  const instagram = $('instagram').value.trim()
  const mensagem = $('mensagem').value.trim() || MSG_PADRAO
  if (autoReplyEnabled && !instagram) {
    show('Informe o @ do Instagram antes de ativar.', 'err')
    return
  }
  chrome.storage.local.set({ autoReplyEnabled, dddPermitido, instagram, mensagem }, () =>
    show(autoReplyEnabled ? 'Resposta automática ATIVADA.' : 'Configuração salva (desativada).', 'ok')
  )
}

$('toggle').onclick = () => {
  const t = $('token')
  t.type = t.type === 'password' ? 'text' : 'password'
}

$('save').onclick = () => {
  const url = $('url').value.trim().replace(/\/+$/, '')
  const token = $('token').value.trim()
  const orcamentoEnabled = $('orcamentoEnabled').checked
  if (orcamentoEnabled && (!url || !token)) { show('Informe URL e token para enviar orçamentos.', 'err'); return }
  chrome.storage.local.set({ url, token, orcamentoEnabled }, () => show('Configuração salva.', 'ok'))
}

// Diagnóstico: testa o caminho real (service worker -> API) e mostra os pendentes.
$('testarOrc').onclick = () => {
  const url = $('url').value.trim().replace(/\/+$/, '')
  const token = $('token').value.trim()
  if (!url || !token) { show('Preencha URL e token e clique em Salvar antes de testar.', 'err'); return }
  chrome.storage.local.set({ url, token })
  show('Consultando o servidor…', 'ok')
  chrome.runtime.sendMessage({ type: 'orcPendentes' }, (resp) => {
    if (chrome.runtime.lastError) { show('Service worker não respondeu (' + chrome.runtime.lastError.message + '). Recarregue a extensão em chrome://extensions.', 'err'); return }
    if (!resp) { show('Sem resposta do service worker. Recarregue a extensão (v1.6.0).', 'err'); return }
    if (!resp.ok) { show('Falha na API (HTTP ' + (resp.status || '?') + ') ' + (resp.error || ''), 'err'); return }
    const d = resp.data || []
    if (!d.length) { show('Conexão OK. Nenhum orçamento pendente agora (verifique status "orçamento" e telefone do cliente).', 'ok'); return }
    show(`Conexão OK! ${d.length} pendente(s). Ex.: ${d[0].cliente} → ${d[0].telefone}. Abra o WhatsApp Web para enviar.`, 'ok')
  })
}

// Função injetada na página do WhatsApp Web para ler os contatos da lista.
// A lista é virtualizada: as conversas são [role="row"] dentro do #pane-side
// (que também é o container de rolagem), e o nome fica em span[dir="auto"][title].
// Mantém o seletor antigo (div[role="listitem"]) como fallback para versões antigas.
async function scrapeWhatsApp() {
  const pane = document.querySelector('#pane-side')
  const seen = new Map()
  const isPhone = (t) => /^\+?[\d\s()\-.]{8,}$/.test(t) && t.replace(/\D/g, '').length >= 8
  // Ignora o DDI (55) e guarda só DDD + número, formatado.
  const soDddNumero = (t) => {
    let d = (t || '').replace(/\D/g, '')
    if (d.length >= 12 && d.startsWith('55')) d = d.slice(2)
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    return d
  }

  const collect = () => {
    document.querySelectorAll('#pane-side [role="row"], #pane-side div[role="listitem"]').forEach((row) => {
      const span = row.querySelector('span[dir="auto"][title]') || row.querySelector('span[title]')
      if (!span) return
      const t = (span.getAttribute('title') || span.textContent || '').trim()
      if (!t || seen.has(t)) return
      seen.set(t, isPhone(t) ? { name: '', phone: soDddNumero(t) } : { name: t, phone: '' })
    })
  }

  if (pane) {
    let last = -1
    for (let i = 0; i < 60; i++) {
      collect()
      if (seen.size === last) break
      last = seen.size
      pane.scrollBy(0, pane.clientHeight)
      await new Promise((r) => setTimeout(r, 320))
    }
    pane.scrollTo(0, 0)
  }
  collect()
  return [...seen.values()]
}

// Captura o contato da conversa aberta: abre o painel de detalhe (clicando no
// cabeçalho) e copia o NOME e o NÚMERO reais de lá — necessário porque o
// cabeçalho de contatos salvos mostra só o nome. Ignora o DDI (guarda DDD+número).
async function scrapeOpenChat() {
  const isPhone = (t) => /^\+?[\d\s()\-.]{8,}$/.test(t) && t.replace(/\D/g, '').length >= 8
  const soDddNumero = (t) => {
    let d = (t || '').replace(/\D/g, '')
    if (d.length >= 12 && d.startsWith('55')) d = d.slice(2)
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    return d
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const clickSeq = (el) => {
    const r = el.getBoundingClientRect()
    for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'])
      el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window, clientX: r.x + 10, clientY: r.y + 10 }))
  }

  const header = document.querySelector('#main header')
  if (!header) return null
  const headSpan = header.querySelector('span[dir="auto"]')
  let nome = headSpan ? (headSpan.getAttribute('title') || headSpan.textContent || '').trim() : ''

  // Abre o painel de detalhe do contato.
  clickSeq(header.querySelector('div[role="button"]') || header)
  await sleep(1400)

  // Acha o painel "Dados do contato" e sobe até o ancestral que contém um telefone.
  let numero = ''
  const titulo = [...document.querySelectorAll('span, div')].find(
    (e) => /^(Dados do contato|Contact info|Dados da empresa)$/i.test((e.textContent || '').trim()) && e.children.length === 0
  )
  if (titulo) {
    let panel = titulo
    for (let i = 0; i < 12 && panel.parentElement; i++) {
      panel = panel.parentElement
      const fone = [...panel.querySelectorAll('span')].map((s) => (s.textContent || '').trim()).find((t) => isPhone(t) && t.length <= 22)
      if (fone) {
        numero = fone
        const np = [...panel.querySelectorAll('span[dir="auto"]')].map((s) => (s.textContent || '').trim()).find((t) => t && !isPhone(t) && t.length < 40)
        if (np) nome = np
        break
      }
    }
  }
  // Fecha o painel.
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

  // Contato não salvo: o próprio nome do cabeçalho é o número.
  if (!numero && isPhone(nome)) numero = nome

  const phone = soDddNumero(numero)
  const name = isPhone(nome) ? '' : nome
  if (!name && !phone) return null
  return { name, phone }
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
    show(`Concluído! ${contatos.length} ${lidosLabel} · ${d.criados} novos · ${d.atualizados ?? 0} atualizados · ${d.existentes} iguais · ${d.ignorados} ignorados.`, 'ok')
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
