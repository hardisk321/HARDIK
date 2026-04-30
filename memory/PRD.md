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
