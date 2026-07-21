# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

PedidosPro is a multi-tenant (multiempresa) SaaS sales-management system for retail/food-service, in Brazilian Portuguese. It has a React frontend and a Laravel backend. UI copy, labels, and comments are in pt-BR — match that.

The repo has these parts:
- `docs/` — **binding contracts** (read these first when building anything server- or data-related). [docs/ARQUITETURA.md](docs/ARQUITETURA.md) is the entry point; it links the API standard, audit standard, parameters, user roles, the MySQL DDL, and the OpenAPI spec. On any conflict between a contract and the code, the contract wins.
- `frontend/` — implemented React + TypeScript + Vite SPA (the working codebase).
- `backend/` — **scaffolding only**: `README.md`, `composer.json`, `.env.example`, plus [backend/database/schema.sql](backend/database/schema.sql) (the MySQL schema). No `app/`, `routes/`, migrations, or `artisan` exist yet. Building the backend means creating the Laravel project per `backend/README.md`, implementing the OpenAPI contract in [docs/openapi.yaml](docs/openapi.yaml).
- `Sistema de Pedidos.dc.html` — the high-fidelity design prototype (declarative HTML template + a JS logic class with sample data). It is the **source of truth for layout, states, colors, and interaction rules** — not code to copy. The root `README.md` is a detailed handoff spec transcribing every screen, design token, and behavior from this prototype. Consult both when building or changing any screen.

## Binding architecture rules (from docs/)

- **Database: MySQL 8**, tables/columns follow **Sankhya naming** (`TGF*`/`TSI*` for entities, `CODEMP` for company scope). **No standard table or column uses the `AD_` prefix** — `AD_` is reserved for future client-specific customizations only. Fields with no Sankhya equivalent (e.g. `PERFIL`, `COR`, `TAXA`) are plain names. API payloads use these same field names (`CODPARC`, `NOMEPARC`, `NUNOTA`…). See [docs/ARQUITETURA.md](docs/ARQUITETURA.md) for the full entity→table map.
- **No SaaS admin.** There is no platform admin, plans, billing, or subscriptions. "Administrador" is a *user role within a company*, not a platform admin. The `Plans`/`Billing` pages and SaaS-subscription types are out of scope — do not build on them.
- **Three user roles** ([docs/PADRAO-USUARIOS-ACESSOS.md](docs/PADRAO-USUARIOS-ACESSOS.md)): `ADMINISTRADOR` (full), `VENDEDOR` (sales/cadastros, no users/params/audit), `CAIXA` (**PDV only** — lands on `/pdv`, everything else 403). Backend is authoritative on permission; the frontend guard is UX only.
- **Multiempresa:** all business data scoped by `CODEMP`; active company sent as `X-Empresa` header (or `/empresas/{CODEMP}/...` path). Backend always verifies the user has access to that `CODEMP` via `TSIUSUEMP`.
- **Products can be shared across companies** via the `COMPARTILHA_PRODUTO_FILIAIS` parameter (`S` → `TGFPRO.CODEMP = NULL` shared; `N` → scoped). Listing always includes `CODEMP = :ativa OR CODEMP IS NULL`. See [docs/PADRAO-PARAMETROS.md](docs/PADRAO-PARAMETROS.md).
- **Every write is audited** into `TSIAUD` in the same transaction, via a central `AuditService` — never inline. Integrations send `X-Integration-Key` (logged as `CANAL`). See [docs/PADRAO-AUDITORIA.md](docs/PADRAO-AUDITORIA.md).
- **API envelope:** success = `{ data, meta }`; errors = RFC 7807 with a stable machine-readable `code`. Full standard in [docs/PADRAO-API.md](docs/PADRAO-API.md).

> The frontend `src/types/index.ts` still carries the older SaaS/English shapes (Plan, Subscription, Invoice, camelCase fields). These predate these contracts and must be migrated to the Sankhya field names and reduced scope as pages are built.

## Commands

Frontend (run from `frontend/`):
```bash
npm run dev       # Vite dev server on :5173 (proxies /api -> http://localhost:8000)
npm run build     # tsc typecheck + vite production build
npm run preview   # preview the production build
npm run lint      # eslint over ts,tsx
```
There is no frontend test runner configured. The backend README documents `php artisan test` etc., but those only apply once the Laravel app actually exists.

## Frontend architecture

Stack: React 18, TypeScript, Vite, React Router v6, Zustand (state), React Hook Form, Axios, Tailwind CSS, lucide-react.

- **Routing / auth gate** ([src/App.tsx](frontend/src/App.tsx)): the entire route tree branches on `useAuthStore().user`. Authenticated users get `MainLayout` with all app routes; unauthenticated users only see `/login` and `/signup` under `AuthLayout`. There is no per-route guard — presence of `user` is the gate.
- **State**: two Zustand stores.
  - [authStore](frontend/src/stores/authStore.ts): `user`, `token`, `isLoading`, and login/signup/logout/checkAuth actions. Token is persisted in `localStorage` under `token`.
  - [appStore](frontend/src/stores/appStore.ts): `currentCompany`, `currentView`, `searchQuery`, `sidebarOpen` — the active-company/UI shell state.
- **API layer** ([src/api/](frontend/src/api/)): a shared Axios instance in [client.ts](frontend/src/api/client.ts) attaches the bearer token via a request interceptor and, on any `401`, clears the token and hard-redirects to `/login`. Endpoint modules (`auth`, `business`, `billing`, `users`) wrap it. Responses are unwrapped as `response.data.data` (Laravel API-Resource envelope).
- **Multi-tenancy**: all business data is scoped by company. Business endpoints are nested under `/companies/{companyId}/...` (see [business.ts](frontend/src/api/business.ts)), and the active company comes from `appStore.currentCompany`. When adding any data-fetching page, thread `currentCompany.id` through the API call.
- **Types** ([src/types/index.ts](frontend/src/types/index.ts)): single source for all domain interfaces (User, Company, Plan/Subscription/Invoice for billing, Customer/Product/Order/etc. for business). Add new domain shapes here.
- **Pages** ([src/pages/](frontend/src/pages/)) are one component per route; the shell (Sidebar + Header + Toast) lives in [MainLayout](frontend/src/components/layout/MainLayout.tsx).

### Design system (Tailwind)

Design tokens from the prototype are encoded in [tailwind.config.ts](frontend/tailwind.config.ts): semantic colors (`primary #5865f2`, `success`, `sidebar`, etc.), fonts (`font-sans` = Manrope for UI, `font-mono` = JetBrains Mono for numbers/SKUs/values/documents), radius scale (`rounded-sm/md/lg/xl`), shadow scale (`shadow-card`/`dropdown`/`modal`/`toast`), and the `popIn`/`slideUp`/`fadeIn` animations. Use these tokens rather than raw hex values so screens stay pixel-consistent with the prototype. The root `README.md` "Design Tokens" and per-screen sections are the detailed spec.

### Known gap

`authStore.isLoading` starts `true` and `checkAuth()` is defined but **not called anywhere** (not in `main.tsx` or `App.tsx`). As wired, the app renders the loading spinner indefinitely on first load. Wiring `checkAuth()` on mount (or setting `isLoading` false initially) is the intended bootstrap — keep this in mind when touching auth startup.

## Backend (planned)

Per `backend/README.md`: PHP 8.2+, Laravel 11, JWT auth via `tymon/jwt-auth` (`Authorization: Bearer {token}`), MySQL/PostgreSQL, Stripe for billing. Routes are API-Resource shaped and company-scoped, matching what the frontend already calls. The frontend expects the API at `http://localhost:8000/api` (`VITE_API_URL`), and Vite proxies `/api` there in dev.
