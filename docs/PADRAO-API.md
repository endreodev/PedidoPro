# Contrato de API — PedidosPro

Padrão único para todos os endpoints. Objetivo: **integração previsível com sistemas externos e consumo por IA** (respostas e erros determinísticos, autodescobríveis, versionados). A fonte legível por máquina é [openapi.yaml](openapi.yaml); este documento explica as regras.

## 1. Princípios

1. **Estável e versionada** — mudança quebra-contrato só em nova versão de path.
2. **Determinística** — mesmo request → mesma forma de resposta. Sem campos "às vezes presentes" sem contrato.
3. **Autodescritiva** — OpenAPI publicado + endpoint de capacidades. Uma IA/integração descobre recursos, campos e erros sem ler código.
4. **Rastreável** — toda escrita é auditada (ver [PADRAO-AUDITORIA.md](PADRAO-AUDITORIA.md)) e correlacionável por `X-Request-Id`.

## 2. Base, versão e formato

- Base: `/api/v1`. A versão está no path; `v1` nunca sofre breaking change.
- Sempre `Content-Type: application/json; charset=utf-8`. Corpo em JSON.
- Datas em **ISO 8601 UTC** (`2026-07-14T12:00:00Z`). Valores monetários em `decimal` (string ou number com 2 casas), nunca float impreciso — o cliente decide formatação.
- **Nomes de campo = dicionário Sankhya** (`CODEMP`, `CODPARC`, `NOMEPARC`, `DTNEG`…). Uma integração vinda de Sankhya mapeia 1:1. O dicionário completo está no `schema.sql` e no OpenAPI.

## 3. Autenticação

- JWT Bearer: `Authorization: Bearer <token>`.
- `POST /api/v1/auth/login` → `{ "data": { "token": "...", "expires_in": 3600, "user": {...} } }`.
- `401` → token ausente/expirado. `403` → autenticado mas sem permissão (ver perfis).
- Integrações máquina-a-máquina usam o mesmo login com um usuário de serviço (perfil `administrador`) **e** enviam `X-Integration-Key` para rastreio no log (ver auditoria).

## 4. Escopo multiempresa

- A empresa ativa vai no header **`X-Empresa: <CODEMP>`** em toda chamada a recurso de negócio.
- Alternativa REST equivalente (usada hoje pelo frontend): prefixo de path `/api/v1/empresas/{CODEMP}/<recurso>`. As duas formas são aceitas; o header tem precedência.
- O backend **sempre** valida que o usuário tem acesso àquela `CODEMP` (`TSIUSUEMP`). Sem acesso → `403`.

## 5. Envelope de resposta

**Sucesso — recurso único:**
```json
{ "data": { "CODPARC": 10, "NOMEPARC": "Cliente X" }, "meta": { "request_id": "..." } }
```

**Sucesso — coleção (paginada):**
```json
{
  "data": [ { "CODPARC": 10, "NOMEPARC": "..." } ],
  "meta": {
    "request_id": "...",
    "pagination": { "page": 1, "per_page": 25, "total": 134, "total_pages": 6 }
  }
}
```

- O invólucro `data` é **obrigatório** em toda resposta 2xx (o frontend já lê `response.data.data`).
- `204 No Content` para DELETE sem corpo.

## 6. Erros — RFC 7807 + código estável

Todo erro (4xx/5xx) retorna:
```json
{
  "type": "https://pedidospro/errors/validation",
  "title": "Dados inválidos",
  "status": 422,
  "code": "VALIDATION_ERROR",
  "detail": "O campo NOMEPARC é obrigatório.",
  "request_id": "req_01H...",
  "errors": { "NOMEPARC": ["obrigatório"], "CGC_CPF": ["formato inválido"] }
}
```

- `code` é a **chave estável legível por máquina/IA** (não muda entre versões). Tabela mínima:

| HTTP | `code` | Quando |
|---|---|---|
| 400 | `BAD_REQUEST` | request malformado |
| 401 | `UNAUTHENTICATED` | sem token/expirado |
| 403 | `FORBIDDEN` | perfil sem permissão / sem acesso à empresa |
| 404 | `NOT_FOUND` | recurso inexistente no escopo |
| 409 | `CONFLICT` | violação de unicidade/estado (ex.: status inválido do pedido) |
| 422 | `VALIDATION_ERROR` | validação de campos (`errors` detalha) |
| 429 | `RATE_LIMITED` | limite de taxa |
| 500 | `INTERNAL_ERROR` | falha não tratada |

- Nunca vaze stack trace em produção; `detail` é mensagem humana, `code` é para máquina.

## 7. Coleções: paginação, filtro, ordenação, busca

- Paginação: `?page=1&per_page=25` (default 25, máx 100).
- Filtro: `?filter[CAMPO]=valor` (igualdade), `?filter[CAMPO][gte]=...` para operadores (`gte,lte,gt,lt,like,in`).
- Ordenação: `?sort=CAMPO` asc, `?sort=-CAMPO` desc (múltiplos separados por vírgula).
- Busca textual: `?q=texto` (busca nos campos relevantes do recurso — mesmo comportamento da busca do header no frontend).
- Campos esparsos: `?fields=CODPARC,NOMEPARC` (reduz payload para integração/IA).

## 8. Verbos e semântica

| Método | Uso | Idempotente |
|---|---|---|
| `GET` | ler | sim |
| `POST` | criar | não (usar `Idempotency-Key`) |
| `PUT` | substituir | sim |
| `PATCH` | atualizar parcial / transição de estado | sim |
| `DELETE` | remover | sim |

- Transição de status de pedido é `PATCH /pedidos/{NUNOTA}` com `{ "STATUS": "SEPARANDO" }`, validando o fluxo permitido.

## 9. Idempotência (integrações)

- `POST` aceita header **`Idempotency-Key: <uuid>`**. Repetição com a mesma chave retorna a resposta original (não duplica). Obrigatório para criação via integração.

## 10. Rastreabilidade

- Todo request recebe/propaga **`X-Request-Id`** (gera se não vier). Retorna em `meta.request_id` e grava no log de auditoria.
- **`X-Integration-Key`** identifica o sistema externo/robô/IA que originou a chamada → gravado em `TSIAUD.CANAL` para "controle das integrações".

## 11. Descoberta (AI-friendly)

- `GET /api/v1/openapi.json` — devolve a spec OpenAPI 3.1 completa.
- `GET /api/v1/meta/capabilities` — recursos disponíveis, campos, perfis exigidos e parâmetros ativos. Permite a uma IA planejar chamadas sem hardcode.

## 12. Rate limiting

- Header de resposta `X-RateLimit-Limit` / `X-RateLimit-Remaining` / `Retry-After`. Estouro → `429 RATE_LIMITED`.

## 13. Recursos (v1)

Todos sob `/api/v1`, escopo por `X-Empresa` salvo indicado.

```
POST   /auth/login                 POST /auth/logout   GET /auth/me
GET    /parametros                 PUT  /parametros/{CHAVE}
GET    /usuarios   POST /usuarios   PUT /usuarios/{CODUSU}   DELETE /usuarios/{CODUSU}
CRUD   /parceiros                  (clientes)  → TGFPAR
CRUD   /produtos                              → TGFPRO
CRUD   /grupos-produto                        → TGFGRU
CRUD   /unidades                              → TGFVOL
CRUD   /formas-pagamento                      → TGFTPV
CRUD   /pedidos   PATCH /pedidos/{NUNOTA}     → TGFCAB/TGFITE
GET/PATCH /estoque                            → TGFEST
GET    /auditoria                             → TSIAUD (só administrador)
GET    /meta/capabilities   GET /openapi.json
```

CRUD = `GET` (lista), `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`.
