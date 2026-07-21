# PedidosPro Frontend

Frontend em React + TypeScript + Vite para o sistema de gestão de vendas SaaS.

## Setup

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env.local

# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## Estrutura do Projeto

```
src/
├── api/                 # Clientes HTTP para API
│   ├── client.ts       # Configuração do Axios
│   ├── auth.ts         # Endpoints de autenticação
│   ├── billing.ts      # Endpoints de billing e planos
│   ├── users.ts        # Endpoints de gerenciamento de usuários
│   └── business.ts     # Endpoints de negócio (produtos, pedidos, etc)
├── components/
│   ├── layout/         # Layouts principais
│   ├── sidebar/        # Sidebar e seletor de empresa
│   ├── header/         # Header principal
│   └── common/         # Componentes reutilizáveis
├── pages/              # Páginas da aplicação
├── stores/             # Zustand stores
├── types/              # TypeScript types
└── App.tsx             # Roteamento principal
```

## Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Routing
- **Zustand** - State management
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Date-fns** - Date utilities

## Autenticação

O token JWT é armazenado em localStorage e enviado automaticamente em cada requisição via header Authorization.

## Variáveis de Ambiente

- `VITE_API_URL` - URL base da API (padrão: http://localhost:8000/api)
- `VITE_APP_NAME` - Nome da aplicação
