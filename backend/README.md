# PedidosPro Backend

Backend em PHP/Laravel para o sistema SaaS de gestão de vendas.

## Setup

```bash
# 1. Instalar dependências
composer install

# 2. Configurar ambiente
cp .env.example .env

# 3. Gerar chave da aplicação
php artisan key:generate

# 4. Gerar chave JWT
php artisan jwt:secret

# 5. Criar banco de dados
# Editar .env com dados do banco e executar:
php artisan migrate --seed

# 6. Iniciar servidor
php artisan serve

# Servidor estará em: http://localhost:8000
```

## Stack

- **PHP 8.2+** - Linguagem
- **Laravel 11** - Framework
- **Laravel Sanctum** - Autenticação API
- **JWT Auth** - Token JWT
- **MySQL/PostgreSQL** - Banco de dados
- **Laravel Tinker** - REPL

## Arquitetura

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── UserController.php
│   │   │   ├── CompanyController.php
│   │   │   ├── PlanController.php
│   │   │   ├── SubscriptionController.php
│   │   │   ├── InvoiceController.php
│   │   │   └── ... (outros controllers)
│   │   ├── Requests/       # Form Requests
│   │   └── Resources/      # API Resources
│   ├── Models/
│   │   ├── User.php
│   │   ├── Company.php
│   │   ├── Plan.php
│   │   ├── Subscription.php
│   │   ├── Invoice.php
│   │   ├── Customer.php
│   │   ├── Product.php
│   │   ├── Order.php
│   │   └── ... (outros models)
│   ├── Services/           # Lógica de negócio
│   │   ├── AuthService.php
│   │   ├── SubscriptionService.php
│   │   ├── BillingService.php
│   │   └── ... (outros services)
│   ├── Events/             # Eventos
│   ├── Listeners/          # Event listeners
│   ├── Jobs/               # Filas
│   ├── Notifications/      # Notificações
│   └── Exceptions/         # Exceções personalizadas
├── database/
│   ├── migrations/         # Migrações do banco
│   ├── seeders/           # Seeders
│   └── factories/         # Factories
├── routes/
│   ├── api.php            # Rotas de API
│   ├── web.php            # Rotas web
│   └── admin.php          # Rotas admin
├── tests/                  # Testes
├── config/                 # Configurações
├── bootstrap/
├── storage/
└── public/
```

## Autenticação

- **JWT Token** via tymon/jwt-auth
- Token é enviado no header: `Authorization: Bearer {token}`
- Token expira em 1 hora (configurável)

## API Routes

### Auth
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuário atual
- `PUT /api/auth/profile` - Atualizar perfil
- `POST /api/auth/change-password` - Mudar senha

### Users (Admin)
- `GET /api/companies/{id}/users` - Listar usuários
- `POST /api/companies/{id}/users/invite` - Convidar usuário
- `PUT /api/companies/{id}/users/{userId}` - Atualizar usuário
- `DELETE /api/companies/{id}/users/{userId}` - Remover usuário
- `POST /api/companies/{id}/users/{userId}/deactivate` - Desativar
- `POST /api/companies/{id}/users/{userId}/reactivate` - Reativar

### Plans
- `GET /api/plans` - Listar planos
- `GET /api/plans/{id}` - Detalhes do plano
- `POST /api/plans` - Criar plano (admin)
- `PUT /api/plans/{id}` - Atualizar plano (admin)
- `DELETE /api/plans/{id}` - Deletar plano (admin)

### Subscriptions
- `GET /api/companies/{id}/subscription` - Assinatura da empresa
- `POST /api/companies/{id}/subscribe` - Assinar plano
- `POST /api/subscriptions/{id}/cancel` - Cancelar assinatura
- `POST /api/subscriptions/{id}/resume` - Reativar assinatura

### Invoices
- `GET /api/invoices` - Listar faturas
- `GET /api/invoices/{id}` - Detalhes da fatura
- `POST /api/invoices/{id}/pay` - Pagar fatura
- `GET /api/invoices/{id}/pdf` - Download PDF

### Business
- `GET /api/companies/{id}/customers` - Clientes
- `GET /api/companies/{id}/products` - Produtos
- `GET /api/companies/{id}/orders` - Pedidos
- ... (Todos os CRUD)

## Variáveis de Ambiente (.env)

```env
APP_NAME=PedidosPro
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pedidospro
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=seu_secret_key_aqui
JWT_ALGORITHM=HS256
JWT_TTL=60

MAIL_DRIVER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls

STRIPE_KEY=
STRIPE_SECRET=
```

## Migrations

```bash
# Criar nova migração
php artisan make:migration create_users_table

# Executar migrações
php artisan migrate

# Revert última batch
php artisan migrate:rollback

# Reset todas as migrações
php artisan migrate:reset

# Refresh (reset + migrate)
php artisan migrate:refresh --seed
```

## Seeders

```bash
# Criar seeder
php artisan make:seeder PlanSeeder

# Executar seeders
php artisan db:seed

# Executar seeder específico
php artisan db:seed --class=PlanSeeder
```

## Testes

```bash
# Rodar testes
php artisan test

# Com coverage
php artisan test --coverage

# Teste específico
php artisan test tests/Unit/CalculatorTest.php
```

## Troubleshooting

- **Erro 419 CSRF**: Adicionar rota a `except` em `app/Http/Middleware/VerifyCsrfToken.php`
- **JWT Errors**: Executar `php artisan jwt:secret`
- **Banco não encontrado**: Criar banco e atualizar `.env`
- **Permissões**: `chmod -R 775 storage bootstrap/cache`
