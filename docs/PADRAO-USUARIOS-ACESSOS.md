# Usuários & Perfis de Acesso — PedidosPro

Cadastro de usuários com **3 perfis**. O perfil fica no campo próprio `TSIUSU.PERFIL` (sem prefixo `AD_` — é campo padrão do sistema, não uma customização).

## 1. Perfis

| Perfil (`PERFIL`) | Descrição |
|---|---|
| `ADMINISTRADOR` | Acesso total: cadastros, pedidos, PDV, parâmetros, usuários, estoque, auditoria. |
| `VENDEDOR` | Operação comercial: PDV, pedidos e cadastros de clientes/produtos. **Sem** usuários, parâmetros nem auditoria. |
| `CAIXA` | **Somente o PDV.** Não acessa nenhuma outra tela. |

## 2. Matriz de permissões

| Recurso / Tela | ADMINISTRADOR | VENDEDOR | CAIXA |
|---|:---:|:---:|:---:|
| PDV (operar venda) | ✅ | ✅ | ✅ |
| Pedidos | ✅ | ✅ | ❌ |
| Clientes | ✅ | ✅ | ❌ |
| Produtos / Grupos / Unidades | ✅ | ✅ (editar) | ❌ |
| Formas de pagamento | ✅ | 👁️ leitura | ❌ |
| Controle de estoque | ✅ | ✅ | ❌ |
| Dashboard | ✅ | ✅ | ❌ |
| Usuários | ✅ | ❌ | ❌ |
| Parâmetros / Configurações | ✅ | ❌ | ❌ |
| Auditoria | ✅ | ❌ | ❌ |

- **CAIXA** é o caso mais restrito: ao logar, cai direto no `/pdv` e a sidebar mostra só esse item. Qualquer outra rota → `403`/redirect para `/pdv`.

## 3. Aplicação da permissão (defesa em profundidade)

1. **Backend (autoritativo):** middleware por rota checa `PERFIL` e acesso à `CODEMP`. Negado → `403 FORBIDDEN`. **A UI nunca é a fonte de verdade.**
2. **Frontend (usabilidade):** esconde/desabilita itens da sidebar e rotas conforme o perfil; guarda de rota redireciona. Regra centralizada (ex.: `can(perfil, recurso)`), não espalhada por componente.

## 4. Modelo de dados

- `TSIUSU`: `CODUSU` (PK), `NOMEUSU`, `EMAIL` (login, único), `SENHA` (hash bcrypt), `PERFIL` (enum acima), `ATIVO` (`S`/`N`).
- `TSIUSUEMP` (junção usuário × empresa): `CODUSU` + `CODEMP` — define a quais filiais o usuário tem acesso. Sem linha aqui → sem acesso àquela empresa.
- Perfil é **por usuário** (global às empresas dele) nesta versão. Perfil por-empresa fica como evolução futura (mover `PERFIL` para `TSIUSUEMP`).

## 5. Regras

- Todo usuário tem exatamente **um** `PERFIL` e ≥1 empresa em `TSIUSUEMP`.
- Não é possível excluir/rebaixar o **último** `ADMINISTRADOR` ativo de uma empresa (evita lock-out) → `409 CONFLICT`.
- Criar/editar/desativar usuário é auditado (`ENTIDADE='TSIUSU'`).
- Senha nunca trafega/loga em claro; reset gera token temporário.
