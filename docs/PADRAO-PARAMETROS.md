# Padrão de Parâmetros — PedidosPro

Configurações do sistema editáveis por uma **tela de Parâmetros** (Configurações), sem deploy. Mesma ideia do `TSIPAR` do Sankhya (`CHAVE` / `TEXTO`).

## 1. Tabela `TSIPAR`

| Coluna | Tipo | Descrição |
|---|---|---|
| `CHAVE` | VARCHAR(50) PK | Identificador do parâmetro (UPPER_SNAKE) |
| `TEXTO` | TEXT | Valor (sempre texto; a aplicação interpreta) |
| `TIPO` | VARCHAR(10) | `TEXTO` \| `NUMERO` \| `BOOL` \| `JSON` — como interpretar `TEXTO` |
| `CODEMP` | INT NOT NULL (default 0) | `0` = global; `>0` = específico da empresa (MySQL não aceita NULL em PK) |
| `DESCRICAO` | VARCHAR(200) | Rótulo/ajuda exibido na tela |
| `EDITAVEL` | CHAR(1) | `S`/`N` — se aparece editável na tela |

- Resolução: parâmetro específico da empresa (`CODEMP` = ativa) tem precedência sobre o global (`CODEMP = 0`).
- Booleanos seguem a convenção Sankhya: **texto `'S'`/`'N'`** (não `true/false`).

## 2. API

- `GET /api/v1/parametros` — lista os visíveis para a empresa ativa.
- `PUT /api/v1/parametros/{CHAVE}` — atualiza `TEXTO` (audita a alteração; só **administrador**).
- Leitura em massa/cacheável; alteração invalida cache.

## 3. Parâmetro inicial: `COMPARTILHA_PRODUTO_FILIAIS`

| Campo | Valor |
|---|---|
| `CHAVE` | `COMPARTILHA_PRODUTO_FILIAIS` |
| `TIPO` | `TEXTO` (booleano S/N) |
| `TEXTO` (default) | `S` |
| `CODEMP` | NULL (global) |
| `DESCRICAO` | "Compartilha cadastro de produtos entre todas as empresas" |

### Semântica
- **`S` (compartilha):** o cadastro de produto é único para todas as empresas. Ao gravar produto, `TGFPRO.CODEMP = NULL`. Todas as filiais enxergam o mesmo catálogo.
- **`N` (exclusivo):** produto é exclusivo da empresa. Ao gravar, `TGFPRO.CODEMP = <empresa ativa>`.

### Regra na camada de produtos
- **Ao criar/editar produto:**
  - `S` → grava `CODEMP = NULL`.
  - `N` → grava `CODEMP = :empresaAtiva`.
- **Ao listar/buscar produtos** (sempre, independente do valor atual, para não "sumir" itens legados):
  ```sql
  SELECT * FROM TGFPRO
  WHERE CODEMP = :empresaAtiva     -- exclusivos da empresa
     OR CODEMP IS NULL             -- compartilhados
  ```
- **Estoque continua por empresa** (`TGFEST.CODEMP` sempre preenchido), mesmo com produto compartilhado — o saldo é de cada filial.
- Alterar o parâmetro **não** reprocessa produtos existentes; vale para gravações a partir dali. (Migração retroativa, se desejada, é operação manual auditada.)

## 4. Novos parâmetros

Adicionar parâmetro = inserir linha em `TSIPAR` (seed/migration) + tratar a `CHAVE` na aplicação. A tela de Parâmetros renderiza dinamicamente a partir de `TIPO`/`DESCRICAO`/`EDITAVEL` — não hardcodar campos na UI.
