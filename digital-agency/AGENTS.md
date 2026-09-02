# Digital Agency Workspace

## Purpose
Internal product workspace for a digital agency. The main user-facing app lives in `app/` and several backend services live in `services/`.

## Stack
- Frontend: React + Vite in `app/`
- Backend: Node.js/Express services in `services/`
- Database: PostgreSQL through shared `shared/db`
- Tests: Vitest for frontend, Jest/Supertest for backend services

## Useful Commands
- Frontend build: `cd app && NODE_OPTIONS='--max-old-space-size=512' npm run build`
- Frontend tests: `cd app && NODE_OPTIONS='--max-old-space-size=512' npm test`
- CRM backend tests: `cd services/crm-service && NODE_OPTIONS='--max-old-space-size=512' npm test`

## CRM Pointers
- CRM shell: `app/src/pages/CrmLightPage.jsx`
- CRM tabs: `app/src/pages/crm/`
- CRM backend: `services/crm-service/src/`
- CRM schema bootstrap: `services/crm-service/src/db/index.js`
- CRM sales/orders spec: `docs/product-specs/crm-sales-orders.md`

## Product Pointers
- Product shelf seed: `services/product-shelf-service/src/seed.js`
- Store management service: `services/store-service/`
- Store management spec: `docs/product-specs/store-management.md`
- Landing product pages: `landing/src/pages/`

## Notes
- Do not use local SQLite. Services expect managed PostgreSQL via environment connection strings.
- Keep unrelated dirty submodules untouched unless the task explicitly targets them.
