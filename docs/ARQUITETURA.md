# Arquitetura & Padrões — PedidosPro

> Documento-base. Toda decisão estrutural do sistema vive aqui ou nos contratos referenciados.
> Em caso de conflito entre um contrato e o código, **o contrato vale** — ajuste o código.

## Contratos deste diretório

| Documento | Assunto |
|---|---|
| [PADRAO-API.md](PADRAO-API.md) | Contrato de API REST (integração + IA) |
| [PADRAO-AUDITORIA.md](PADRAO-AUDITORIA.md) | Log de auditoria/alteração e controle de integrações |
| [PADRAO-PARAMETROS.md](PADRAO-PARAMETROS.md) | Sistema de parâmetros (tela Configurações) |
| [PADRAO-USUARIOS-ACESSOS.md](PADRAO-USUARIOS-ACESSOS.md) | Perfis: administrador, vendedor, caixa |
| [openapi.yaml](openapi.yaml) | Especificação OpenAPI 3.1 (fonte de verdade legível por máquina/IA) |
| [../backend/database/schema.sql](../backend/database/schema.sql) | DDL MySQL |

## Decisões de escopo

- **Banco:** MySQL 8+ (utf8mb4). Dialeto MySQL — não Oracle, apesar da nomenclatura Sankhya.
- **Sem área de administração do SaaS.** Não há platform-admin, planos, cobrança/billing nem assinaturas. As telas `Plans`, `Billing` e `Analytics de SaaS` saem do escopo. "Administrador" no sistema é um **perfil de usuário da empresa**, não um admin de plataforma.
- **Multiempresa (filiais):** todo dado transacional é escopado por `CODEMP`. Um usuário pode ter acesso a uma ou mais empresas. A empresa ativa da sessão define o filtro.
- **Cadastro de produtos compartilhável entre filiais** via parâmetro `COMPARTILHA_PRODUTO_FILIAIS` (ver [PADRAO-PARAMETROS.md](PADRAO-PARAMETROS.md)).

## Convenção de nomenclatura (padrão Sankhya)

Mirroramos o padrão Sankhya para familiaridade e integração futura. **Não é um banco Sankhya real** — é MySQL seguindo a mesma convenção.

| Prefixo | Significado |
|---|---|
| `TGF*` | Entidades comerciais/faturamento (parceiros, produtos, pedidos, estoque) |
| `TSI*` | Entidades de sistema (usuários, parâmetros) |
| `AD_*` | **Reservado para customizações futuras** (adições específicas de um cliente/ambiente). **Nenhuma tabela/campo padrão do sistema usa `AD_`** — as entidades e campos nativos do PedidosPro, mesmo os que não existem no Sankhya, recebem nome sem prefixo. |
| `CODEMP` | Código da empresa/filial (chave de escopo multiempresa) |
| `COD<X>` | Chave primária de entidade (`CODPARC`, `CODPROD`, `CODUSU`…) |

## Mapa entidade da aplicação → tabela

| Entidade (app/frontend) | Tabela | PK | Escopo | Observação |
|---|---|---|---|---|
| Empresa / filial | `TGFEMP` | `CODEMP` | — (é o escopo) | Tenant do dado |
| Cliente / parceiro | `TGFPAR` | `CODPARC` | `CODEMP` | `TIPPESSOA` F/J |
| Produto | `TGFPRO` | `CODPROD` | `CODEMP` (nullable) | `CODEMP` NULL = compartilhado (ver parâmetro) |
| Grupo de produto | `TGFGRU` | `CODGRUPOPROD` | `CODEMP` | |
| Unidade | `TGFVOL` | `CODVOL` | `CODEMP` | Sigla + descrição |
| Forma de pagamento | `TGFTPV` | `CODTIPVENDA` | `CODEMP` | Alimenta o checkout do PDV |
| Pedido (cabeçalho) | `TGFCAB` | `NUNOTA` | `CODEMP` | `STATUS` do fluxo |
| Item do pedido | `TGFITE` | `NUNOTA`+`SEQUENCIA` | via cabeçalho | |
| Estoque | `TGFEST` | `CODPROD`+`CODEMP` | `CODEMP` | Saldo por empresa |
| Usuário | `TSIUSU` | `CODUSU` | N:N via `TSIUSUEMP` | Perfil no campo `PERFIL` |
| Acesso usuário×empresa | `TSIUSUEMP` | `CODUSU`+`CODEMP` | — | Junção multiempresa |
| Parâmetro | `TSIPAR` | `CHAVE` | opcional `CODEMP` | |
| Log de auditoria | `TSIAUD` | `IDLOG` | `CODEMP` | Toda escrita passa aqui |

> Campos não existentes no Sankhya nativo (ex.: `COR` do grupo, `PERFIL` do usuário, `TAXA` da forma de pagamento) são campos padrão do PedidosPro e **não** levam prefixo — `AD_` fica reservado para customizações futuras. Ver `schema.sql`.

## Stack

- **Backend:** PHP 8.2 / Laravel 11, JWT (`tymon/jwt-auth`), MySQL 8. Ainda a implementar (hoje só há scaffolding).
- **Frontend:** React 18 + TS + Vite + Zustand + Tailwind (ver [../CLAUDE.md](../CLAUDE.md)).
- **Contrato entre eles:** [openapi.yaml](openapi.yaml).
