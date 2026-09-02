# Architecture

## Frontend
The `app/` package is a React/Vite single-page application. CRM Light is mounted from `CrmLightPage.jsx` and splits feature areas into tab components under `app/src/pages/crm/`.

CRM UI state is mostly local to tabs. Shared persistent CRM preferences, such as customer display columns and the services/sales mode, are stored through `/api/crm/display-settings`.

## Backend
The CRM backend is `services/crm-service`, an Express service mounted under `/api/crm/*`. Routes are organized by domain:
- `customers`, `services`, `employees`, `workRecords`
- `activities` for calendar tasks
- `salesItems` for saleable nomenclature
- `orders` for customer sales orders
- `statistics` for employee and sales reports

Schema initialization is centralized in `services/crm-service/src/db/index.js`. The service uses PostgreSQL via the shared database adapter.

## CRM Sales Flow
Sales add three persistent domains:
- `sales_items`: saleable products or positions.
- `orders`: customer-level sales deals with statuses `active`, `completed`, `canceled`.
- `order_items`: order line items copied from saleable nomenclature or entered manually.

Calendar `activities` can optionally reference an `order_id`, so users can plan follow-ups for a sales order while still seeing those tasks in the main CRM calendar.
