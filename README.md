# TableFlow CRM — Enterprise Restaurant QR Ordering & Real-Time Kitchen Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5_(App_Router)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0_(Strict)-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%2B_Realtime-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Checkout_%26_Webhooks-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com/)

> A production-grade, full-stack contactless dining and restaurant management system. Engineered for high-throughput restaurant operations with mobile-first customer ordering, server-validated online payments, and instant kitchen synchronization.

---

## 🌟 Executive Summary

**TableFlow CRM** is built to solve operational bottlenecks in modern dining establishments. Guests scan table-specific dynamic QR codes to browse the menu, customize requests, and pay securely via Stripe or cash at the table. Behind the scenes, kitchen and management staff monitor real-time ticket pipelines updated via PostgreSQL Change Data Capture (CDC) over WebSockets.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend / Client Tier"]
        Guest["Guest Mobile Client\n(/t/[tableId])"]
        Staff["Kitchen / Staff KDS\n(/dashboard)"]
    end

    subgraph ServerTier["Next.js 15 Server Tier (App Router)"]
        ServerAction["Server Actions\n(Zero-Trust Price Recalculation)"]
        StripeWebhook["Stripe Webhook Route\n(/api/webhooks/stripe)"]
        AuthService["Supabase SSR Auth\n(Cookie-based Session Validation)"]
    end

    subgraph External["External Services"]
        StripeAPI["Stripe Gateway\n(Hosted Checkout & Payment Intents)"]
    end

    subgraph DataTier["Database & Storage Tier (Supabase)"]
        PostgresDB[("PostgreSQL Database\n(Row Level Security Enabled)")]
        RealtimeEngine["Supabase Realtime Engine\n(PostgreSQL Replication CDC)"]
        StorageCDN["Supabase Storage\n(Dish Images & Assets CDN)"]
    end

    Guest -->|Place Order / Pay| ServerAction
    ServerAction -->|Recalculate Totals| PostgresDB
    ServerAction -->|Create Checkout Session| StripeAPI
    StripeAPI -->|Webhook Event (checkout.session.completed)| StripeWebhook
    StripeWebhook -->|Mark Paid (Admin Client)| PostgresDB
    PostgresDB -->|Replication Broadcast| RealtimeEngine
    RealtimeEngine -->|Push Live Order Ticket| Staff
    Guest -->|Load Optimized Assets| StorageCDN
    Staff -->|Manage Menu & Tables| AuthService
    AuthService --> PostgresDB
```

---

## 🚀 Key Features

### 1. 📱 Guest Contactless Ordering
- **Dynamic Table Routing**: Direct table identification via UUID or slug (`/t/table-4`), isolating orders to the correct dining station.
- **Dietary & Category Navigation**: Filter gourmet dishes by courses (*Starters, Mains, Pasta, Desserts*) and dietary tags (*Gluten-Free, Vegetarian, Signature*).
- **Interactive Cart & Kitchen Notes**: Custom dish preparation notes (*e.g., "extra truffle", "nut allergy"*) sent directly to culinary staff.
- **Live Ticket Tracker**: Step-by-step progress stepper (`Received` ➔ `Cooking` ➔ `Ready` ➔ `Delivered`) updating in real-time.

### 2. 💳 Stripe Payment Gateway (Test Mode)
- **Zero-Trust Pricing Architecture**: The client never dictates prices or subtotals. Server Actions recalculate items, applicable taxes, and tips directly against database records before creating payment sessions.
- **Dual Payment Flexibility**: Guests choose between **"Pay Online (Card / Apple Pay / Google Pay)"** via Stripe Checkout or **"Pay at Table (Cash)"**.
- **Cryptographic Webhook Verification**: `POST /api/webhooks/stripe` handles raw request buffers and verifies signatures with `stripe.webhooks.constructEvent()` to eliminate spoofing.
- **Resilient Dual-Reconciliation**: Synchronous verification on redirect fallback paired with asynchronous webhook event processing ensures orders are updated even under flaky networks.
- **Live Payment Badging**: Clear status tags (`[PAID · STRIPE]` vs `[PAY AT TABLE]`) displayed across customer receipts, Kitchen Display Systems, and history records.

### 3. 🍳 Real-Time Kitchen Display System (KDS)
- **Instant Synchronization**: PostgreSQL database triggers broadcast row changes directly to the staff board over WebSockets without polling.
- **Ticket Lifecycle Management**: Transition tickets through kitchen phases with one click, triggering real-time customer status changes.
- **Acoustic & Visual Alerts**: Ambient sound cues and visual pulses on incoming high-priority orders.

### 4. ⚙️ Administrative Operations & CMS
- **Menu Availability Toggle (86'd Items)**: Instantly mark out-of-stock ingredients to disable ordering across all active digital menus.
- **Dynamic QR Code Engine**: Generate, customize, and print high-resolution SVG/PNG table QR codes on the fly.
- **Branding Customization**: Configure restaurant identity, tax rates, currency format (`EUR`, `USD`, `INR`), and accent colors.
- **Database Health Monitor**: Real-time Postgres diagnostic widget reporting database disk utilization, relation sizes, and storage limits.

---

## 🔒 Security & Best Practices

| Security Domain | Implementation |
| :--- | :--- |
| **Database Authorization** | PostgreSQL **Row Level Security (RLS)** strictly enforcing role-based access (`anon` vs `authenticated staff`). |
| **Elevated Privilege Isolation** | `SUPABASE_SERVICE_ROLE_KEY` is isolated in server-only modules (`lib/supabase/admin.ts`) and never exposed to the client bundle. |
| **Price Tampering Protection** | Subtotals and taxes are recalculated exclusively on the server from authoritative database records. |
| **Webhook Security** | Cryptographic HMAC signature verification (`stripe-signature`) against `STRIPE_WEBHOOK_SECRET`. |
| **Environment Variable Safety** | Public keys use `NEXT_PUBLIC_` prefixes; secrets (`STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept strictly server-side. |

---

## 🛠️ Tech Stack & Libraries

- **Framework**: [Next.js 15.5](https://nextjs.org/) (App Router, Server Actions, Server Components)
- **Library**: [React 19.1](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Supabase SSR, Row Level Security)
- **Payment Processing**: [Stripe Node SDK](https://github.com/stripe/stripe-node) (v23 / modern API)
- **Asset Storage**: Supabase Storage CDN
- **QR Generation**: [qrcode](https://www.npmjs.com/package/qrcode)

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/ts-31/restaurant-crm.git
cd restaurant-crm
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL (used for QR generation & Stripe callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Database Setup
Execute the consolidated database migration in your Supabase SQL Editor:
- File located at: `supabase/schema_setup.sql`
- Run Stripe migration: `supabase/migrations/0007_stripe_payments.sql`

### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Demo Credentials & Test Paths

### Staff Dashboard:
- **URL**: [http://localhost:3000/login](http://localhost:3000/login)
- **One-Click**: Click the **"Demo Login"** button
- **Manual Credentials**:
  - **Email**: `admin@gmail.com`
  - **Password**: `Admin@123`

### Guest Table Ordering:
- **URL**: [http://localhost:3000/t/table-4](http://localhost:3000/t/table-4)
- **Stripe Test Card**: `4242 4242 4242 4242` · Expiry: Any future date · CVC: `123`

---

## 🗺️ Engineering Roadmap

- [x] **Phase 1: Core Architecture** (Next.js 15, Supabase PostgreSQL, RLS, Realtime KDS)
- [x] **Phase 2: Payment Gateway** (Stripe Checkout Sessions, Webhook Verification, Payment Badges)
- [ ] **Phase 3: Customer Notifications** (Automated WhatsApp & SMS Receipts via Twilio)
- [ ] **Phase 4: Geolocation Services** (Google Maps restaurant pin & takeaway address picker)
- [ ] **Phase 5: CRM / ERP Integration** (Outbound webhooks for enterprise data sync)
- [ ] **Phase 6: Technical SEO** (Schema.org JSON-LD `Restaurant` & `Menu` structured data)
- [ ] **Phase 7: Containerization** (Production-ready Docker & docker-compose orchestration)

---

## 👨‍💻 Author

**Gaurav Bachhav**  
*Full Stack Web Developer*  
- GitHub: [@ts-31](https://github.com/ts-31)
