# PedidosPro — Extensão Chrome (importar contatos do WhatsApp)

Lê os contatos das conversas do **WhatsApp Web** e cadastra como clientes no PedidosPro (nome e telefone), via API autenticada por **token de integração**.

## Instalar (modo desenvolvedor)
1. Abra `chrome://extensions` no Chrome.
2. Ative o **Modo do desenvolvedor** (canto superior direito).
3. Clique em **Carregar sem compactação** e selecione a pasta `chrome-extension/`.
4. A extensão aparece na barra. Fixe-a se quiser.

## Configurar
1. No sistema, entre como **Administrador** → **Integrações** → **Gerar token** e copie o token (`pp_...`). Ele é mostrado **uma única vez**.
2. Clique no ícone da extensão:
   - **URL do sistema**: `https://thays.ibyt.com.br` (ou outra — é configurável).
   - **Token**: cole o token gerado.
   - Clique em **Salvar configuração**.

## Usar
1. Abra o **web.whatsapp.com** numa aba e deixe as conversas carregarem.
2. Clique no ícone da extensão. Há duas opções:
   - **Capturar contato aberto**: abra a conversa de um contato e clique aqui — envia **só** aquele contato (lido do cabeçalho da conversa).
   - **Sincronizar contatos do WhatsApp**: rola a lista de conversas e envia **todos** os contatos de uma vez.
3. Repetidos (mesmo telefone) **não são duplicados**.

## Resposta automática (por DDD)
A extensão pode **monitorar as conversas** e responder sozinha quem tem DDD diferente do que você atende.

1. No popup, seção **Resposta automática**:
   - Marque **Ativar monitoramento e resposta automática**.
   - **DDD que você atende**: `65` (Cuiabá/Várzea Grande-MT) — quem for 65 **não** recebe a mensagem.
   - **Instagram**: seu @ (entra na mensagem).
   - **Mensagem**: texto padrão editável; use `{instagram}` onde o @ deve aparecer.
   - Clique em **Salvar resposta automática**.
2. Deixe o **web.whatsapp.com** aberto. A cada poucos segundos a extensão verifica conversas **não lidas**; se o DDD do contato não for o permitido, abre a conversa e envia a mensagem — **uma única vez por contato**.

**Importante / limitações:**
- Responde apenas contatos cujo **número está visível** (não salvos = novos clientes). Contatos **salvos** e **grupos** são ignorados (não dá para ler o DDD com segurança).
- Nunca responde duas vezes o mesmo número (registro em `chrome.storage`).
- Enquanto a aba do WhatsApp estiver fechada, nada é enviado.
- Uso de automação no WhatsApp é por sua conta; mantenha a mensagem curta e sem spam.

## Como funciona
- `POST {URL}/api/v1/integracao/sincronizar` com header `X-Integration-Key: <token>` e corpo `{ "contatos": [{ "name": "...", "phone": "..." }] }`.
- O backend valida o token em `TSIINTEGR`, cria/atualiza em `TGFPAR` (deduplicando por telefone) e registra em auditoria (`TSIAUD`, canal = descrição do token).

## Limitações do WhatsApp Web
O WhatsApp Web **não expõe o número de telefone de contatos já salvos** na lista — só o nome. Para contatos **não salvos**, o próprio título é o telefone. Então:
- Contatos salvos → cadastra o **nome** (telefone em branco).
- Contatos não salvos → cadastra o **telefone**.

O sistema deduplica por telefone; quando faltar telefone, deduplica por nome.
