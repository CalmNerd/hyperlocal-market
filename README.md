# Hyperlocal Marketplace

Minimal hyperlocal grocery marketplace with three portals and a REST API.

| App | Purpose | Local URL |
|-----|---------|-----------|
| `backend/` | Express + Prisma API | http://localhost:4000 |
| `customer/` | Customer portal | http://localhost:3000 |
| `vendor/` | Vendor portal | http://localhost:3001 |
| `admin/` | Admin portal | http://localhost:3002 |

## Tech stack

- **Backend:** Node.js, TypeScript, Express, Prisma, Zod, JWT, Vitest + Supertest
- **Database:** PostgreSQL (local or Neon)
- **Frontends:** Next.js, TypeScript, Axios, Zustand, TanStack Query, Tailwind/shadcn-style UI

## Architecture

```
route → Zod validation → auth / role checks → service (business rules) → Prisma → JSON error shape
```

Frontends keep **UI separate from business/API logic** via feature folders (`features/*/api.ts` + panels) and shared Axios/Zustand/Query plumbing.

## Database design

Tables: `users`, `vendors`, `products`, `carts`, `cart_items`, `orders`, `order_items`.

Key choices:

- Auth identity (`users`) is separate from shop entity (`vendors`)
- Vendor status enum: `PENDING | APPROVED | REJECTED | DISABLED`
- One cart per customer (`carts.customer_id` unique) and one shop per cart (`carts.vendor_id`)
- Order line items snapshot `product_title` + `unit_price` so history survives catalogue edits
- Products use soft delete (`deleted_at`) so order FKs remain meaningful
- Nearby shops use lat/lng + Haversine (PostGIS documented as the scale-up path)

Migration files live in [`backend/prisma/migrations`](backend/prisma/migrations).

## Setup

### 1. Database

Use local Postgres or Neon. Copy env:

```bash
cp backend/.env.example backend/.env
# set DATABASE_URL, JWT_SECRET, CORS_ORIGINS
```

### 2. Backend

```bash
cd backend
npm install
npx prisma migrate deploy   # or: npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Seed accounts (password `Password123!`):

- Admin: `admin@example.com`
- Customer: `customer@example.com`
- Approved vendor: `vendor@example.com`
- Pending vendor: `pending-vendor@example.com`

### 3. Frontends

```bash
cd customer && npm install && npm run dev   # :3000
cd vendor && npm install && npm run dev     # :3001
cd admin && npm install && npm run dev      # :3002
```

Each frontend needs `NEXT_PUBLIC_API_URL` (see `.env.local` / `.env.example`).

### 4. Tests

```bash
cd backend
npm test
```

## API documentation

- OpenAPI: [`docs/openapi.yaml`](docs/openapi.yaml)
- Postman: [`docs/postman_collection.json`](docs/postman_collection.json)

### Endpoint summary

**Auth**

- `POST /api/auth/register` — customer or vendor (vendors start `PENDING`)
- `POST /api/auth/login`
- `GET /api/auth/me`

**Vendor** (role `VENDOR`)

- `GET|PUT /api/vendor/shop`
- `GET|POST /api/vendor/products`
- `PATCH|DELETE /api/vendor/products/:id`

**Customer**

- `GET /api/shops/nearby?latitude=&longitude=&radiusKm=`
- `GET /api/shops/:shopId/products`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH|DELETE /api/cart/items/:itemId`
- `POST|GET /api/orders`

**Admin** (role `ADMIN`)

- `GET /api/admin/vendors`
- `PATCH /api/admin/vendors/:id/approve|reject|disable`
- `GET /api/admin/orders`

## Deploy notes (Render)

Backend is deploy-ready:

- listens on `process.env.PORT`
- `npm start` after `npm run build`
- run `npx prisma migrate deploy` on release
- set `DATABASE_URL` (Neon), `JWT_SECRET`, `CORS_ORIGINS` to your frontend URLs

## Deployed URLs

Fill these in after you host the apps:

- API:
- Customer:
- Vendor:
- Admin:

## Assumptions

1. A customer has at most one active cart.
2. A cart can only contain products from a single vendor (cross-shop add → `409`).
3. Vendor registration starts as `PENDING`; only `APPROVED` shops appear nearby.
4. Disabled/rejected/pending vendors cannot mutate products (pending may still edit shop details).
5. Checkout re-reads DB prices and availability; client totals are never trusted.
6. Orders snapshot product title and unit price at purchase time.
7. No inventory quantities, payments, delivery, or order status workflow.
8. Product images are URL strings (no upload service).
9. Admin accounts are seeded, not publicly registerable.
10. Distance uses Haversine over stored latitude/longitude.

## Key design decisions & trade-offs

- **Ownership in queries:** product updates use `WHERE id = ? AND vendor_id = ?` so vendors cannot mutate peers’ catalogue.
- **Transactional checkout:** create order + order items + clear cart in one Prisma `$transaction`.
- **Soft delete over hard delete:** preserves analytical/history links without breaking FK constraints awkwardly.
- **Haversine now, PostGIS later:** keeps the assignment simple; spatial indexes scale better for large catalogues.
- **Separate portals:** clearer role UX and smaller frontend bundles than one mega-app.

## Security considerations

- Passwords hashed with bcrypt; hashes never returned
- JWT Bearer auth + role middleware
- Resource ownership checks for vendor products and cart items
- Zod validation on all external inputs
- Prisma parameterized queries
- CORS allowlist via `CORS_ORIGINS`
- No public admin registration
- Client-supplied prices / vendor IDs ignored at checkout

## Error handling

Consistent JSON:

```json
{ "error": { "code": "CONFLICT", "message": "...", "details": null } }
```

Common statuses: `400`, `401`, `403`, `404`, `409`, `422`, `500`.

## Future scalability (out of scope — how we’d extend)

- **Payments:** `Payment` / `OrderPayment` tables + `PaymentService` abstraction; order creation waits on payment confirmation.
- **Delivery:** `Delivery` + address tables linked to `orders`; provider webhooks update delivery state only.
- **Inventory:** `products.stock` (or `product_stocks`) with atomic decrement inside the checkout transaction.
- **Order status workflow:** `orders.status` enum + guarded transitions; keep snapshots immutable.
- **Notifications:** domain events (`OrderCreated`, `VendorApproved`) consumed by email/SMS/push workers.
- **Search:** Postgres full-text first; OpenSearch later for typo-tolerant catalogue search.
- **Reviews:** `reviews` requiring a prior order for that vendor/product.
- **Coupons:** `coupons` + `coupon_redemptions`, applied during pricing in checkout.
- **Analytics:** emit product/cart/order events to a separate pipeline — do not couple analytics into controllers.
- **Geo at scale:** migrate lat/lng to PostGIS `GEOGRAPHY(POINT,4326)` + GiST index.

## Project structure (backend)

```
backend/src/
  modules/   # auth, vendor, product, shop, cart, order, admin
  middleware/
  lib/
  config/
```

## License

Assignment submission — not for production use without hardening.
