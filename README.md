# Handoff: Sistema de Pedidos Multiempresa (PedidoPro)

## Overview
Sistema de gestão de vendas para varejo (adaptável a restaurantes/lanchonetes), web e responsivo, em português (Brasil). Cobre Dashboard configurável (cards estilo Trello), PDV, Pedidos, cadastros (Clientes, Produtos, Grupos, Unidades, Formas de pagamento), Controle de estoque, Parâmetros e troca de empresa (multiempresa). **Não** possui área de administração de SaaS (planos/cobrança).

## Perfis de Acesso (Usuários)
O sistema tem **3 perfis de acesso**. O caixa é o mais restrito — opera **somente o PDV**. Contrato completo em [docs/PADRAO-USUARIOS-ACESSOS.md](docs/PADRAO-USUARIOS-ACESSOS.md).

| Perfil | Acesso |
|---|---|
| **Administrador** | Acesso total: Dashboard, PDV, Pedidos, todos os cadastros, Controle de estoque, **Usuários**, **Parâmetros**. |
| **Vendedor** | Operação comercial: Dashboard, PDV, Pedidos, cadastros (Clientes, Produtos, Grupos, Unidades) e Controle de estoque. Formas de pagamento apenas leitura. **Sem** Usuários nem Parâmetros. |
| **Caixa** | **Somente o PDV.** Ao entrar cai direto em `/pdv`; a sidebar mostra só esse item e qualquer outra rota é bloqueada. |

Matriz detalhada:

| Recurso / Tela | Administrador | Vendedor | Caixa |
|---|:---:|:---:|:---:|
| PDV (operar venda) | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ❌ |
| Pedidos | ✅ | ✅ | ❌ |
| Clientes | ✅ | ✅ | ❌ |
| Produtos / Grupos / Unidades | ✅ | ✅ | ❌ |
| Formas de pagamento | ✅ | 👁️ leitura | ❌ |
| Controle de estoque | ✅ | ✅ | ❌ |
| Usuários | ✅ | ❌ | ❌ |
| Parâmetros / Configurações | ✅ | ❌ | ❌ |

> A permissão é aplicada em duas camadas: **backend autoritativo** (perfil em `TSIUSU.PERFIL` + escopo por empresa em `TSIUSUEMP`) e **frontend** (sidebar/rotas escondidas por usabilidade). A UI nunca é a fonte de verdade.

### Contas de demonstração (frontend sem backend)
Enquanto o backend não existe, o login usa dados locais. Contas seed (qualquer senha):

| E-mail | Perfil |
|---|---|
| `admin@pedidospro.com` | Administrador |
| `vendedor@pedidospro.com` | Vendedor |
| `caixa@pedidospro.com` | Caixa |

## About the Design Files
Os arquivos deste pacote são **referências de design criadas em HTML** — um protótipo interativo que mostra o visual e o comportamento pretendidos, **não** código de produção para copiar diretamente. A tarefa é **recriar este design no ambiente/codebase alvo** (React, Vue, Angular, etc.) usando os padrões e bibliotecas já estabelecidos nele. Se ainda não existe um ambiente, escolha o framework mais adequado (recomendação abaixo) e implemente lá.

O arquivo `Sistema de Pedidos.dc.html` é um "Design Component": um template HTML declarativo + uma classe de lógica em JavaScript (estado, handlers, dados de exemplo). Ele é ótimo como **fonte da verdade de layout, estados e regras**, mas foi escrito para um runtime de design — não reaproveite o runtime; reimplemente a lógica no seu stack.

## Fidelity
**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos, raios e interações estão finais. Recriar pixel-perfect usando as bibliotecas do codebase.

## Recommended stack (se não houver um)
- **React + TypeScript + Vite**
- **TailwindCSS** (os tokens abaixo mapeiam direto) ou CSS Modules
- **React Router** para as rotas/telas
- Estado local com **Zustand** ou Context; **@tanstack/react-query** quando entrar backend real
- **dnd-kit** para o drag-and-drop do dashboard
- Ícones: **lucide-react** (o protótipo usa os mesmos ícones do Feather/Lucide)
- Fontes: **Manrope** (UI) e **JetBrains Mono** (números/valores) via Google Fonts

## Arquitetura sugerida
- Layout raiz: `Sidebar` (fixa, 236px) + `Header` (62px) + área de conteúdo com scroll.
- Uma rota por tela; a tela ativa dirige título/subtítulo do header.
- Entidades em stores separadas: `empresas`, `clientes`, `produtos`, `grupos`, `unidades`, `formas`, `pedidos`, `dashboard`.
- **Multiempresa:** todo dado é escopado por `empresaId`. Trocar de empresa recarrega/filtra os dados daquela empresa. No protótipo os dados são globais (exemplo) — no real, filtre por `empresaId`.

## Screens / Views

### 1. Layout global
- **Sidebar** (236px, fundo `#171922`, texto claro): logo "PedidoPro" (quadrado gradiente `#5865f2→#8a5bd6`, 34px, radius 9px) + subtítulo "Gestão de vendas". Abaixo da logo, o **seletor de empresa**. Depois grupos de navegação com rótulos em maiúsculas `#565d70` (11px, letter-spacing .8px): PRINCIPAL (Dashboard, PDV — Venda, Pedidos), CADASTROS (Clientes, Produtos, Grupos de produtos, Unidades, Formas de pagamento), OPERAÇÃO (Controle de estoque). No rodapé, card do usuário (avatar iniciais + nome + papel). Item ativo: fundo `rgba(255,255,255,.10)`, texto `#fff`; inativo: texto `#9aa3b2`. Item: padding 9x10px, radius 9px, ícone 17px, fonte 13.5px/600. Sidebar tem `overflow-y:auto` para telas baixas.
- **Header** (62px, `#fff`, borda inferior `#e5e8ee`): título (16px/800) + subtítulo (12px `#7b8290`) à esquerda; à direita campo de busca (38px, `#f2f4f8`, radius 9px, ícone de lupa) e botão de sino (38x38, radius 9px). A busca filtra a lista da tela ativa.

### 2. Seletor de empresa (multiempresa)
- **Trigger** na sidebar, abaixo da logo: botão largura total, fundo `#20232f`, borda `#2c3040`, radius 11px, padding 9x10. Conteúdo: avatar 30px (radius 8px, cor da empresa) com iniciais; label "EMPRESA" (9px `#6c7385`) + nome (12.5px/700 `#fff`); chevron para baixo à direita.
- **Dropdown** (abre para baixo, 260px+, `#fff`, radius 13px, sombra forte, z-index 40): cabeçalho "MINHAS EMPRESAS"; lista de empresas (avatar 34px cor própria + nome + `ramo · CNPJ`), a atual com fundo `#f4f5ff` e check `#5865f2`; rodapé "**+ Adicionar empresa**" (`#5865f2`).
- **Adicionar/Editar empresa** (modal): nome, CNPJ, ramo (select: Varejo, Alimentação, Atacado, Serviços, Outro), cor (paleta de swatches). Ao salvar novo, entra na lista e vira a empresa ativa.

### 3. Dashboard (cards estilo Trello)
- **Barra de configuração** (topo, `#fff`, borda `#d9dee7`, radius 13px, sombra leve): ícone de engrenagem em box `#eceeff`; título "Configuração do painel" + hint dinâmico; selo de permissão (Administrador `#e6f6ee/#1f9d6b` × Somente leitura `#eef0f4/#8b93a2`); toggle "Permissão" (switch verde 38x22); botão "Editar painel" (`#5865f2`) que vira "Concluir edição" (`#171922`). Sem permissão, o botão fica desabilitado (`#eef0f4/#b3bac6`).
- **KPIs**: fileira de cards (`#fff`, borda `#e5e8ee`, radius 13px) com label (12px `#7b8290`), valor grande em JetBrains Mono (23px/700) e delta colorido (verde alta / vermelho baixa / âmbar aviso).
- **Quadro Trello**: 3 colunas (Indicadores, Operação, Acompanhar), largura 296px, fundo `#f1f3f8`, borda tracejada `#dee2ea` (vira `#e7ebff`/`#5865f2` quando é alvo de drop). Cabeçalho da coluna: dot colorido + título + badge de contagem.
- **Tipos de card** (borda `#d3d9e4`, radius 11px, sombra `0 2px 6px rgba(20,24,40,.07)`, `draggable`):
  - **metric**: label + valor mono (26px) + delta com seta.
  - **progress**: label + % + barra de progresso (trilho `#eceff4`, preenchimento colorido) + legenda.
  - **bars**: título + valor + mini gráfico de barras (última barra `#4b57d6`, demais `#c3caf7`) + legenda.
  - **list**: título + linhas (dot de tom + label + valor). Tons: danger `#d64545`, warn `#c47f16`, default `#5a6270`.
- **Drag-and-drop**: arrastar card entre colunas move o card. No modo edição aparece: botão ✕ (canto sup. dir., `#fbe9e9/#d64545`) para remover, e no rodapé da coluna "**+ Adicionar card**" (tracejado) abrindo menu com 4 tipos (Métrica, Progresso, Gráfico de barras, Lista).

### 4. PDV — Ponto de venda
- **Layout 2 colunas**: esquerda = produtos (chips de filtro por grupo + grade `auto-fill minmax(150px,1fr)`); direita = carrinho fixo (360px, `#fff`, borda esquerda).
- **Card de produto** (botão): faixa tint do grupo com nome do grupo, nome do produto (13px/700), preço mono verde `#1f9d6b`, estoque em cinza. Hover: borda `#5865f2` + sombra.
- **Carrinho**: seletor de cliente no topo (abre modal de seleção; "Consumidor não identificado" como padrão); linhas de item com nome, preço unit., stepper −/qty/+ e subtotal; rodapé com Subtotal, Desconto, **Total** (mono 24px verde) e botão "Finalizar venda" (48px, verde `#1f9d6b`; desabilitado/cinza quando vazio).
- **Pagamento** (modal): valor total grande; grade 2×N de métodos (vêm das **Formas de pagamento ativas**, com ícone) selecionáveis; "Confirmar pagamento"; tela de sucesso com check e "Nova venda" (limpa o carrinho).

### 5. Pedidos
- **Filtros** (chips): Todos, Em aberto, Em separação, Concluído, Cancelado + botão "Novo pedido".
- **Tabela** (grid): Pedido (#número mono `#5865f2`), Cliente (avatar+nome), Itens, Total mono, Status (badge colorido), Data, ações. Cores de status: Rascunho `#8b93a2/#eef0f4`, Em aberto `#3a7bd5/#e7f0fb`, Em separação `#c47f16/#fbf1de`, Concluído `#1f9d6b/#e6f6ee`, Cancelado `#d64545/#fbe9e9`.
- **Ações por linha**: avançar status (→, fluxo Em aberto → Em separação → Concluído; desabilitado nos finais), editar, excluir.
- **Montador de pedido** (modal largo 680px): cliente (select), status (select); dois painéis lado a lado — "Adicionar produtos" (busca + lista com botão +) e "Itens do pedido" (steppers −/+); rodapé com Total ao vivo e "Salvar pedido". Ao criar, gera número automático e entra no topo da lista.

### 6. Clientes
- Botão "Novo cliente" + tabela: Cliente (avatar iniciais colorido + nome + email), Documento (CPF/CNPJ mono), Telefone, Cidade, Total compras (mono, à direita), editar/excluir.
- **Form** (modal): nome/razão social, CPF/CNPJ, telefone, e-mail, cidade.

### 7. Produtos
- Botão "Novo produto" + tabela: SKU (mono), Produto, Grupo (badge tint), Unidade (mono), Preço (mono, dir.), Estoque (mono, cor por status), editar/excluir.
- **Form** (modal): nome, SKU, grupo (select), unidade (select), preço, estoque atual, estoque mínimo.

### 8. Grupos de produtos
- Botão "Novo grupo" + grade de cards: ícone em box tint (cor do grupo), nome, contagem de produtos, editar/excluir.
- **Form** (modal): nome + seletor de cor (swatches).

### 9. Unidades
- Botão "Nova unidade" + tabela enxuta (máx 640px): Sigla (badge mono `#eef0f7`), Descrição, editar/excluir.
- **Form** (modal): sigla (uppercase), descrição.

### 10. Formas de pagamento
- Botão "Nova forma" + grade de cards: ícone por tipo (💵 Dinheiro, 📱 Pix, 💳 Cartão, 🧾 Boleto), nome, tipo colorido, selo Ativa/Inativa; blocos Taxa (%) e Recebimento (Na hora / D+n); toggle "Aceitar" (ativa/desativa), editar, excluir.
- **Form** (modal): nome, tipo (Dinheiro/Pix/Cartão/Boleto/Transferência), taxa (%), prazo (dias), toggle ativa. **Formas ativas alimentam o checkout do PDV.**

### 11. Controle de estoque
- Fileira de resumo: Saudável (verde), Baixo (âmbar), Crítico (vermelho), cada um com contagem em box tint.
- **Tabela**: Produto, Grupo (badge), Mínimo (mono), Atual (mono grande, cor por status), Status (badge), Ajuste (steppers −/+ que alteram a quantidade).
- **Regra de status**: `atual ≤ min*0.5` → Crítico; `atual ≤ min` → Baixo; senão OK.

## Interactions & Behavior
- Navegação: clicar item da sidebar troca a tela e limpa a busca. Título/subtítulo do header derivam da tela ativa.
- Busca no header filtra a lista da tela atual (nome/campos relevantes).
- Modais: fecham no overlay, no ✕ e no Cancelar; conteúdo para o clique (`stopPropagation`). Animações: overlay `fadeIn .15s`; caixa `popIn .2s`.
- Toast (feedback): barra escura `#171922` centralizada embaixo, `slideUp .25s`, some após ~2.4s.
- Dashboard: drag entre colunas; permissão bloqueia edição; adicionar/remover cards em modo edição.
- PDV: adicionar/incrementar/decrementar itens; total recalcula; checkout só com métodos ativos; sucesso limpa carrinho e cliente.
- Pedidos: avançar status por fluxo; criar/editar via montador; número auto-incremental.
- CRUD genérico em todas as entidades (criar/editar/excluir) com atualização imediata da lista.
- Responsivo: sidebar pode virar off-canvas/drawer no mobile; grades usam `auto-fill/minmax`; PDV empilha carrinho abaixo dos produtos em telas estreitas; tabelas rolam horizontalmente.

## State Management
- `empresas[]`, `empresaId`, `empresaMenuOpen`
- `view` (tela ativa), `search`
- `clientes[]`, `produtos[]`, `grupos[]`, `unidades[]`, `formas[]`, `pedidos[]`
- Dashboard: `columns[]` (cada uma com `cards[]`), `canConfig`, `editMode`, `dragged`, `dragOverCol`, `addMenuCol`
- PDV: `pdvCart[]`, `pdvGrupo`, `pdvClienteId`, `payMethod`, `payDone`
- Pedidos: `pedidoItems[]`, `pedidoForm`, `pedidoSearch`, `pedidoFilter`
- Modal: `modal {type, id}`, `form` (compartilhado pelos formulários), `toast`
- No real: escopar tudo por `empresaId`; persistir dashboard (organização dos cards) por usuário/empresa; buscar dados por API.

## Design Tokens
**Cores**
- Fundo app: `#eef0f4` · Superfície: `#ffffff` · Sidebar: `#171922` (elev. `#20232f`)
- Texto: `#16181d` (forte `#22262f`), secundário `#7b8290`/`#8b93a2`, sidebar inativo `#9aa3b2`
- Bordas: `#e5e8ee` (cards `#d9dee7`/`#d3d9e4`), inputs `#dfe3ea`
- Primária/roxo: `#5865f2` (hover `#4753e0`), acento roxo `#8a5bd6`
- Sucesso/verde: `#1f9d6b` (tint `#e6f6ee`) · Aviso/âmbar: `#c47f16`/`#d98a24` (tint `#fbf1de`) · Erro/vermelho: `#d64545` (tint `#fbe9e9`) · Azul: `#3a7bd5` (tint `#e7f0fb`)
- Paleta de grupos/empresas: `#4b57d6, #1f9d6b, #d98a24, #c2557a, #2f9e8f, #7d5bd6, #d64545, #3a7bd5`
- Tints geradas a ~13% de alpha da cor base.

**Tipografia**
- UI: **Manrope** (400/500/600/700/800). Números/valores/SKU/documentos: **JetBrains Mono** (500/600).
- Escala usada: título header 16/800; valor KPI 23–26; total PDV 24; corpo 13–14; labels 11–12; rótulos de seção 10.5–11 uppercase.

**Raio**: 7–8 (botões pequenos/steppers), 9–11 (botões/inputs/cards internos), 13–16 (cards/superfícies/modais), 20px (pílulas/badges), 50% (avatares).

**Sombras**: cards `0 1px 2px rgba(20,24,40,.04)` a `0 2px 6px rgba(20,24,40,.07)`; dropdown `0 16px 40px rgba(20,24,40,.18)`; modal `0 24px 60px rgba(20,22,40,.28)`; toast `0 12px 30px rgba(0,0,0,.24)`.

**Espaçamento**: base 4px. Padding de conteúdo 22x24; gaps de grade 12–16; padding de card 13–17; header/itens 9–18.

**Keyframes**: `popIn` (opacity+translateY(8px)+scale .98), `slideUp` (toast), `fadeIn` (overlay).

## Assets
- Sem imagens. Todos os ícones são SVG inline no estilo Feather/Lucide (usar **lucide-react** equivalentes: LayoutGrid, ShoppingCart, FileText, Users, Package, Layers, Ruler, CreditCard, Archive, Settings, Edit, Trash, Check, ChevronRight/Down, Search, Bell).
- Emojis usados apenas nos ícones de tipo de forma de pagamento (💵📱💳🧾) — opcional trocar por ícones Lucide.
- Fontes via Google Fonts: Manrope e JetBrains Mono.

## Files
- `Sistema de Pedidos.dc.html` — protótipo completo (template + lógica com dados de exemplo). Fonte da verdade de layout, estados e regras.
