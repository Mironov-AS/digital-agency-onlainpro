# CRM Sales And Orders

Status: implemented

## User Need
CRM Light users need to manage not only services performed for customers, but also sales deals with customers.

## Features
- A sales nomenclature directory named `Продажи`.
- A top-level CRM tab named `Заказы`.
- Orders are linked to CRM customers.
- Orders contain line items from sales nomenclature or manual line names.
- Orders can be closed as `Выполнен` or `Отменен`.
- Closing an order requires an `ИТОГ` text field that records the result of the interaction.
- Calendar activities can be linked to a specific active order.
- Statistics includes a `По продажам` report with filters by customer, sales item, and date interval.
- Settings includes a CRM mode: `Услуги`, `Продажи`, or `Услуги и продажи`.

## Visibility Rules
- `Услуги`: hides sales orders and sales nomenclature UI.
- `Продажи`: hides service work records and service nomenclature UI.
- `Услуги и продажи`: shows both directions.

Customers, calendar, statistics, employees, display settings, integration, and work-hours settings remain available because they support both business directions.

## Acceptance Criteria
- Users can create, edit, and archive sales nomenclature.
- Users can create an order for a customer, add line items, and see order totals.
- Users can plan order activities and see them in the calendar.
- Users cannot close an order without filling `ИТОГ`.
- Sales statistics returns totals by customers, sales items, and individual orders.
