---
name: laravel-backend-architect
description: Senior Laravel API backend architect for REST APIs consumed by a Next.js frontend (Sanctum, FormRequests, Policies, Resources, Services/Actions, transactions, idempotency, indexing, security, testing).
---

# Laravel Backend Architect (API-first)

Use this skill when building, refactoring, reviewing, or planning a Laravel **JSON REST API** that is consumed by a separate **Next.js** frontend.

## Default architectural stance

- **API-first**: versioned routes (`/api/v1/...`), consistent response envelope, predictable errors.
- **Auth**: Laravel Sanctum by default (cookie SPA when same-site feasible; tokens only when needed).
- **Controllers stay thin**: validation + authorization + delegate to Action/Service + return Resource.
- **Never trust frontend input**: do not accept ownership/sensitive fields (`user_id`, `tenant_id`, `org_id`, `role`, `status`, `price`, `amount`, etc.) unless explicitly justified; derive server-side.
- **DB integrity first**: constraints, foreign keys, indexes, unique keys, transactions, locks for race-prone flows.

## Recommended project structure (medium+)

Prefer:

```
app/
  Actions/
  DTOs/
  Enums/
  Exceptions/
  Http/
    Controllers/Api/V1/
    Requests/
    Resources/
  Models/
  Policies/
  Services/
  Support/
routes/api.php
database/migrations/
tests/Feature/
tests/Unit/
```

Rule of thumb:
- Simple CRUD: Controller + FormRequests + Resource (+ Policy if needed).
- Multi-table writes / money / inventory / workflow transitions: Service or Action + DTO + transaction + idempotency.

## Response envelope (required)

Success:

```json
{ "success": true, "message": "OK", "data": {}, "meta": {} }
```

Error:

```json
{ "success": false, "message": "Validation failed", "errors": {} }
```

Always use **API Resources** (Transformers). Never return raw models.

## When implementing a feature: required output checklist

For any feature request, produce (and when coding, implement) all that apply:

1. Backend structure placement (folders/classes)
2. Database schema/migrations + constraints + indexes
3. Model relationships + `$fillable`/`$hidden`
4. FormRequest validation rules (no inline validation)
5. Authorization (Policy/Gate) + scoping queries by tenant/org if relevant
6. Controller or Action class (thin controller)
7. Service layer when business logic is non-trivial
8. API Resource(s) for response shaping
9. Routes (versioned; REST + explicit action routes)
10. Security concerns (authz, rate-limit, mass assignment, file upload rules, logging secrets)
11. Query performance (pagination; avoid N+1; eager load intentionally)
12. Concurrency/race prevention (transaction, `lockForUpdate`, unique constraints, idempotency keys)
13. Testing strategy (Feature tests for authz/validation/idempotency/races where applicable)

## Concurrency & idempotency rules

Use DB transactions for:
- parent + child writes
- inventory/balance changes
- state transitions

Use row locks for race-prone reads-before-writes:
- `->lockForUpdate()` inside `DB::transaction(...)`

Use idempotency for retryable endpoints:
- checkout/order create/payment/webhooks
- enforce with DB unique constraint per user (or per client key)

## Query safety rules

- All list endpoints must be paginated with a `per_page` cap (default 15, max 100).
- Never allow arbitrary `orderBy($request->sort)`; only whitelist sorts/filters.
- If suggesting packages: prefer native Laravel first; only recommend a package when it reduces complexity.

