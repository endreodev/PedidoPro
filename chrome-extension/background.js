// PedidosPro — Service worker (MV3)
// Faz as chamadas à API do sistema. Rodar aqui (e não no content script) é
// obrigatório porque a página do WhatsApp Web tem CSP que bloqueia requisições
// externas. O service worker usa host_permissions e não sofre CSP da página.

function cfg() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['url', 'token'], (d) => {
      const url = (d.url || '')
        .replace('thays.ibyt.com.br', 'pedidos.ibyt.com.br')
        .replace(/\/+$/, '')
      resolve({ url, token: d.token || '' })
    })
  })
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  ;(async () => {
    const { url, token } = await cfg()
    if (!url || !token) {
      sendResponse({ ok: false, error: 'URL/token não configurados' })
      return
    }
    try {
      if (msg.type === 'orcPendentes') {
        const r = await fetch(url + '/api/v1/integracao/orcamentos-pendentes', {
          headers: { 'X-Integration-Key': token },
        })
        const data = r.ok ? (await r.json()).data || [] : []
        sendResponse({ ok: r.ok, status: r.status, data })
      } else if (msg.type === 'orcConfirmar') {
        const r = await fetch(url + '/api/v1/integracao/orcamentos-enviados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Integration-Key': token },
          body: JSON.stringify({ nunota: msg.nunota, hash: msg.hash }),
        })
        sendResponse({ ok: r.ok, status: r.status })
      } else if (msg.type === 'sincronizarContatos') {
        const r = await fetch(url + '/api/v1/integracao/sincronizar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Integration-Key': token },
          body: JSON.stringify({ contatos: msg.contatos || [] }),
        })
        const data = r.ok ? (await r.json()).data : null
        sendResponse({ ok: r.ok, status: r.status, data })
      } else {
        sendResponse({ ok: false, error: 'tipo desconhecido' })
      }
    } catch (e) {
      sendResponse({ ok: false, error: String(e) })
    }
  })()
  return true // resposta assíncrona
})
