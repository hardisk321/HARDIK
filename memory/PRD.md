# DRISHTI — Auto ID Solution Marketing Site

## Original Problem Statement
"CREATE WEB PAGE FOR AIDC PRODUCT I HAVE ATTACHED LOGO FOR YOUR REFERENCE"
Follow-up: Add a section for Barcode Labels, Printers and Ribbon selling — owner has 8 years' experience selling these.

## Brand
- Name: DRISHTI · Auto ID Solution
- Tagline: "Your Insight Into Data."
- Palette: Navy #00264d / #003a7a, Cyan #00ccff / #0099bb
- Tech stack covered: Barcode, RFID, QR, NFC, OCR, IoT Data
- Consumables/hardware specialty (8+ yrs): Labels, Label Printers, TT Ribbons

## Architecture
- Backend: FastAPI (server.py) + MongoDB (motor). Routes prefixed /api.
- Frontend: React 19, Tailwind, shadcn/ui, sonner toasts, lucide-react icons.
- Single-page anchor-scroll site at /.

## Core Sections (implemented)
1. Header (sticky, mobile menu) — Solutions / Products / Industries / Why / About / CTA
2. Hero — tagline, CTAs, stats, animated DRISHTI mark, tech marquee
3. Solutions (6) — Barcode, RFID, QR, NFC, OCR, IoT — technical-grid cards
4. Products (NEW) — Barcode Labels / Label Printers / TT Ribbons + 8+ yrs mastery stats strip with OEM chips (Zebra, TSC, Honeywell, Sato, Postek, Epson)
5. Industries (4) — Logistics, Retail, Manufacturing, Healthcare bento grid
6. Why DRISHTI (6 features on dark) + About
7. Contact form — POST /api/inquiries (name, email, phone, company, interested_in, message)
8. Footer

## Backend APIs
- GET /api/ — health
- POST /api/inquiries — create lead (validated via EmailStr)
- GET /api/inquiries — list leads (excludes _id)
- POST/GET /api/status — legacy

## Verified
- Backend pytest 6/6, frontend Playwright e2e all flows pass (testing_agent_v3 iteration_1)
- New Products section visually verified via screenshot

## Backlog / Next
- P1: Admin dashboard to view inquiries with filtering & CSV export
- P1: Email notification (SendGrid/Resend) on new inquiry
- P2: Product catalog detail pages with filterable SKUs
- P2: WhatsApp/calendar booking integration on contact CTA
- P2: Case studies section + testimonials

## Iteration 2 — Admin Dashboard (2026-04-30)
- **JWT admin auth** (bcrypt + PyJWT, 24h tokens, seeded from `backend/.env`)
- **Admin routes** (all protected): `/api/admin/login`, `/admin/me`, `/admin/inquiries` (paginated + regex-safe search), `/admin/inquiries/export.csv`, `DELETE /admin/inquiries/{id}`
- **Admin UI**: `/admin/login` and `/admin` (protected) — table with search, pagination, detail drawer, CSV export, reply-via-email, delete
- **Credentials**: see `/app/memory/test_credentials.md` (`admin@drishti-aidc.com` / `Drishti@2026`)
- **Testing**: 19/19 backend pytest + 10/10 Playwright flows pass (iteration_2.json)
- **Future-ready**: `NOTIFICATION_EMAIL` env var reserved for lead-email integration when email is registered

## Backlog (remaining)
- P1: Email notification on new lead (Resend/SendGrid) — waiting for user email
- P2: Per-SKU catalog pages for printers & ribbons with filtering
- P2: Brute-force lockout on admin login (5 fails → 15 min)
- P2: WhatsApp quick-quote floating button

## Iteration 3 — Email + Catalog + Brute-Force Lockout (2026-04-30)
- **Resend email integration** (`/app/backend/email_service.py`) — wired via FastAPI BackgroundTasks on `POST /api/inquiries`. Graceful no-op: silently skipped when `RESEND_API_KEY` or `NOTIFICATION_EMAIL` is empty. **User still needs to provide a Resend API key (re_...) and recipient email in `.env` to activate.**
- **Brute-force lockout** on admin login — 5 failed attempts per IP+email → 429 for 15 minutes (`Retry-After` header). Configurable via `LOGIN_LOCKOUT_MAX_ATTEMPTS` / `LOGIN_LOCKOUT_WINDOW_MIN` env vars. Successful login clears attempts.
- **Static product catalog** at `/catalog` — 16 SKUs (6 printers / 5 labels / 5 ribbons) with category chips, live search, detail drawer, and one-click "Request Quote" that prefills the contact form with category-mapped interest + product name in message (via sessionStorage).
- **Browse Catalog** CTA added to Products section on home page.
- **Testing**: 30/30 backend pytests (11 new + 19 regression) + 10/10 Playwright flows. Zero bugs.

## Backlog (remaining)
- Awaiting user: Resend API key + recipient email → to activate lead notifications
- P2: Per-SKU deep pages with images (currently text-only cards)
- P2: Rate-limit public POST /api/inquiries to prevent spam
- P2: Admin UI to manage catalog SKUs (move catalog to MongoDB)

## Iteration 4 — MongoDB Catalog + Per-SKU Pages + Admin CRUD (2026-04-30)
- **MongoDB-backed catalog** — migrated from static JS to `/api/products` (public GET list+detail) and `/api/admin/products` (admin POST/PUT/DELETE). 16 SKUs seeded idempotently from `backend/products_seed.py` on startup. Unique index on `slug`.
- **Per-SKU pages** at `/product/:slug` — hero image, breadcrumb, long description, specs sidebar, use-cases, Request Quote CTA (prefills contact form), Email CTA, 3 related products.
- **Admin CRUD UI** at `/admin/products` (protected) — searchable table with image thumbnails + featured stars, drawer-style create/edit form (auto-slug from name, slug immutable on edit), delete with confirmation. Accessible from Admin Dashboard via "Manage catalog" nav link.
- **Images** — all 16 product images verified 200 (switched from Unsplash to Pexels for reliable hotlinking). Admin can paste any image URL.
- **Testing**: 59/59 backend pytest (23 new + 36 regression) + 15/15 Playwright flows. Zero bugs.

## Backlog remaining
- Blocked on user: Resend API key + NOTIFICATION_EMAIL → activates lead emails
- P2: Rate-limit public POST /api/inquiries to prevent spam
- P2: Native image upload (S3 / cloud storage) instead of URL-paste
- P2: Inquiry pipeline status (Assigned / Contacted / Quoted / Closed)
