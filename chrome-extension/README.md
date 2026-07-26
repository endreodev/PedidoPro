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
2. Clique no ícone da extensão → **Sincronizar contatos do WhatsApp**.
3. A extensão rola a lista de conversas, lê os contatos e envia. Repetidos (mesmo telefone) **não são duplicados**.

## Como funciona
- `POST {URL}/api/v1/integracao/sincronizar` com header `X-Integration-Key: <token>` e corpo `{ "contatos": [{ "name": "...", "phone": "..." }] }`.
- O backend valida o token em `TSIINTEGR`, cria/atualiza em `TGFPAR` (deduplicando por telefone) e registra em auditoria (`TSIAUD`, canal = descrição do token).

## Limitações do WhatsApp Web
O WhatsApp Web **não expõe o número de telefone de contatos já salvos** na lista — só o nome. Para contatos **não salvos**, o próprio título é o telefone. Então:
- Contatos salvos → cadastra o **nome** (telefone em branco).
- Contatos não salvos → cadastra o **telefone**.

O sistema deduplica por telefone; quando faltar telefone, deduplica por nome.
