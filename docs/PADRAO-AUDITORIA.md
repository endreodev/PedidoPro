# Padrão de Auditoria / Log de Alteração — PedidosPro

Objetivo: **rastrear toda alteração de dado e controlar as integrações**. Toda escrita (web, PDV, API externa, IA) deixa registro imutável em `TSIAUD`.

## 1. Regra de ouro

Nenhuma escrita (`INSERT`/`UPDATE`/`DELETE`) em tabela de negócio ocorre sem um registro correspondente em `TSIAUD`, na **mesma transação**. Se o log falhar, a operação faz rollback.

## 2. Tabela `TSIAUD`

| Coluna | Tipo | Descrição |
|---|---|---|
| `IDLOG` | BIGINT PK auto | Identificador |
| `DHLOG` | DATETIME | Data/hora UTC do evento |
| `CODEMP` | INT | Empresa do dado (escopo) |
| `CODUSU` | INT | Usuário autor (NULL se robô puro) |
| `ENTIDADE` | VARCHAR(30) | Tabela/recurso afetado (`TGFPAR`, `TGFCAB`…) |
| `CHAVEREG` | VARCHAR(100) | PK do registro afetado (ex.: `NUNOTA=1042`) |
| `ACAO` | VARCHAR(20) | `INSERT` \| `UPDATE` \| `DELETE` \| `LOGIN` \| `LOGOUT` \| `EXPORT` \| `STATUS` |
| `ORIGEM` | VARCHAR(20) | `WEB` \| `PDV` \| `API` \| `INTEGRACAO` \| `IA` |
| `CANAL` | VARCHAR(60) | `X-Integration-Key` — qual sistema externo/robô originou (controle de integrações) |
| `REQUESTID` | VARCHAR(40) | `X-Request-Id` correlacionado à chamada de API |
| `IPORIGEM` | VARCHAR(45) | IP de origem |
| `DADOSANTES` | JSON | Estado anterior (NULL em INSERT) |
| `DADOSDEPOIS`| JSON | Estado posterior (NULL em DELETE) |
| `OBSERVACAO` | VARCHAR(255) | Texto livre opcional |

Índices: `(CODEMP, ENTIDADE, CHAVEREG)`, `(CANAL, DHLOG)`, `(CODUSU, DHLOG)`.

## 3. O que registrar

- **Diff mínimo:** `DADOSANTES`/`DADOSDEPOIS` guardam **apenas os campos que mudaram** (não a linha inteira), reduzindo ruído. Em `INSERT` grava só `DADOSDEPOIS`; em `DELETE` só `DADOSANTES`.
- **Nunca** gravar senha, token ou `CGC_CPF` completo em claro no diff — mascarar campos sensíveis.
- Transições de status de pedido usam `ACAO='STATUS'` com `DADOSANTES/{STATUS}` → `DADOSDEPOIS/{STATUS}`.

## 4. Controle de integrações

- Toda chamada externa deve enviar `X-Integration-Key`. O backend grava em `CANAL` e marca `ORIGEM='INTEGRACAO'` (ou `'IA'` quando a chave for de um agente).
- Consulta de auditoria por integração: `GET /api/v1/auditoria?filter[CANAL]=erp-x&filter[DHLOG][gte]=...` (somente perfil **administrador**).
- Chamada sem `X-Integration-Key` vinda de token de serviço → aceita, mas `CANAL='DESCONHECIDO'` (sinaliza integração não identificada para revisão).

## 5. Implementação (backend Laravel)

- Centralizar num **observer/serviço de auditoria** (`AuditService`) acionado pelos model events (`created/updated/deleted`) — nunca espalhar `INSERT INTO TSIAUD` pelos controllers.
- O contexto (`CODUSU`, `CODEMP`, `ORIGEM`, `CANAL`, `REQUESTID`, `IPORIGEM`) vem de um middleware que popula um `AuditContext` por request.
- `TSIAUD` é **append-only**: sem `UPDATE`/`DELETE` em produção (retenção definida por política, ex.: arquivamento após N meses).
