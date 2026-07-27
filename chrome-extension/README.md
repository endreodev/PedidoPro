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
   - **URL do sistema**: `https://pedidos.ibyt.com.br` (ou outra — a extensão usa exatamente o domínio configurado aqui).
   - **Token**: cole o token gerado.
   - Clique em **Salvar configuração**.

## Usar
1. Abra o **web.whatsapp.com** numa aba e deixe as conversas carregarem.
2. Clique no ícone da extensão. Há duas opções:
   - **Capturar contato aberto**: abra a conversa de um contato e clique aqui — a extensão **abre o detalhe do contato** e copia **nome e número** reais (funciona para contato salvo, cujo cabeçalho mostra só o nome).
   - **Sincronizar contatos do WhatsApp**: rola a lista de conversas e envia **todos** os contatos de uma vez.
3. O número é salvo **sem o DDI** — só **DDD + número** (ex.: `(65) 98888-7777`).
4. Repetidos (mesmo DDD+número, com ou sem DDI) **não são duplicados**; se o nome/número mudou, o cadastro é **atualizado**.

## Sincronização automática de contatos
No popup, marque **Sincronizar contatos automaticamente** e salve. Com o **web.whatsapp.com** aberto, a extensão lê a lista de conversas e envia os contatos ao sistema **sozinha** (uma vez ao abrir e depois a cada ~15 min). Guarda só **DDD + número** (sem DDI) e **não duplica** — atualiza os já existentes. O botão manual **Sincronizar contatos** continua funcionando.

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

## Envio de orçamentos pelo WhatsApp
Quando um **orçamento** (status `ORCAMENTO`) é feito no sistema para um cliente com telefone, a extensão envia o orçamento no WhatsApp automaticamente.

1. No popup, marque **Enviar orçamentos automaticamente pelo WhatsApp** e salve (usa a mesma **URL** e **token**).
2. Deixe o **web.whatsapp.com** aberto. A cada ~20s a extensão consulta o sistema; havendo orçamento pendente, abre a conversa do número do cliente e envia a mensagem com os itens e o total.

Regras (controladas pelo servidor via hash do orçamento):
- **Nunca envia repetido** o mesmo orçamento.
- **Reenvia quando o orçamento é alterado** (item, quantidade, valor).
- Envia **apenas** orçamentos com status `ORCAMENTO` e cliente com telefone.

Endpoints (auth por `X-Integration-Key`):
- `GET /api/v1/integracao/orcamentos-pendentes` → lista `{ nunota, telefone, hash, mensagem }`.
- `POST /api/v1/integracao/orcamentos-enviados` `{ nunota, hash }` → confirma o envio.

## Como funciona
- `POST {URL}/api/v1/integracao/sincronizar` com header `X-Integration-Key: <token>` e corpo `{ "contatos": [{ "name": "...", "phone": "..." }] }`.
- O backend valida o token em `TSIINTEGR`, cria/atualiza em `TGFPAR` (deduplicando por telefone) e registra em auditoria (`TSIAUD`, canal = descrição do token).

## Limitações do WhatsApp Web
O WhatsApp Web **não expõe o número de telefone de contatos já salvos** na lista — só o nome. Para contatos **não salvos**, o próprio título é o telefone. Então:
- Contatos salvos → cadastra o **nome** (telefone em branco).
- Contatos não salvos → cadastra o **telefone**.

O sistema deduplica por telefone; quando faltar telefone, deduplica por nome.
