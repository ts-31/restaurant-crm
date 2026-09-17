# L'Ambre TableFlow

QR table ordering for restaurants — digital menu, table-based cart, staff kitchen dashboard, menu & QR management.

**Stack:** Next.js App Router · TypeScript · Tailwind CSS v4 · Supabase

## Setup

1. Create a Supabase project.
2. In the SQL editor, run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
3. In the SQL editor, run [`supabase/migrations/0002_seed_admin.sql`](supabase/migrations/0002_seed_admin.sql) (creates the single admin account).
4. Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Enable Email auth in Supabase (Authentication → Providers → Email). Turn **off** “Enable sign ups” so only the seeded admin can access the dashboard.
6. Install and run:

```bash
npm install
npm run dev
```

7. Open http://localhost:3000/login and sign in with the seeded admin:
   - Email: `tejas2025s@gmail.com`
   - Password: `Admin@123`
8. Guest demo menu: `/t/a0000000-0000-4000-8000-000000000014` (Table 14) or print QR codes from **Dashboard → Table QR Codes**.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/login` | Admin sign in |
| `/t/[tableId]` | Guest QR menu |
| `/t/[tableId]/cart` | Cart / place order |
| `/t/[tableId]/order/[orderId]` | Live order status |
| `/dashboard` | Live kitchen kanban |
| `/dashboard/menu` | Menu CRUD + 86 |
| `/dashboard/tables` | Table QR codes |
| `/dashboard/settings` | Tax / tip / name |

## Design source

UI fidelity is based on the AI Studio prototype kept in `_design_src/` (L'Ambre / TableFlow visual system).
