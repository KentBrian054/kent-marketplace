# CampusMarket — Hiring Test 3

Next.js / React marketplace with Supabase Postgres and Storage. Visitors can browse and filter listings, publish a single item for sale with an optional photo, and leave a private inquiry on a listing.

## Run the local demo

Requires Node.js 20.9+.

```sh
npm ci
```

Copy `.env.example` to `.env.local`, set `MARKETPLACE_LOCAL_DEMO=1`, then:

```sh
npm run dev -- --hostname 127.0.0.1 --port 3188
```

Open http://127.0.0.1:3188. The demo includes three sample items and writes to the ignored `.marketplace-local/` directory. Local demo mode is disabled in production. Run `npm run test:smoke` in another terminal to verify the local API flow.

## Connect a real Supabase project

1. Use a dedicated personal Supabase project for Test 3.
2. Execute `supabase/01-marketplace.sql` once in that project's SQL Editor.
3. Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in `.env.local` and leave `MARKETPLACE_LOCAL_DEMO=0`. The older `SUPABASE_SERVICE_ROLE_KEY` is also supported. Keep the key server-only and never commit it.
4. Run the app and verify a new listing, uploaded photo, and an inquiry. In the SQL Editor, confirm the inquiry row has the correct listing ID. Use fictitious email addresses for test evidence.

Public listings are served through a field-filtered Next.js endpoint. Seller contact addresses are excluded, and there is no public endpoint for reading inquiries. The RLS-enabled tables only grant app access to the server role. Listing photos are public. Uploads are limited to 4 MB to keep multipart requests below Vercel's function body limit. Inquiries are stored in Supabase and do not send external email. There's no seller inbox in this version.

## Vercel and submission

Import this project as a Next.js app into Vercel and set the same Supabase variables for Production. Verify the public production URL in a private window. Test creating a listing, refreshing, filtering, opening the listing, sending a message, and confirming persistence in Supabase. Capture screenshots of the marketplace, create form, and message confirmation. Optionally record a short demo. Submit the production URL and screenshots through the hiring form.

See the [Test 3 brief](https://tremendous-tiger-a4a.notion.site/Test-3-Marketplace-22400bbdfc3b805b8b7df94e0daa4f54).

## Test 4 frontend preview

In a separate checkout, run the dev server with `MARKETPLACE_LOCAL_DEMO=1`
and `NEXT_PUBLIC_STRIPE_UI_PREVIEW=1`. This development-only preview exercises
seller onboarding, available/unavailable/sold listings, and checkout confirm
or cancel without calling Stripe or Supabase. Seller state and simulated sold
status reset on reload. The local sample bicycle is purchasable, the desk lamp is
not, and the keyboard starts sold. Existing listing and inquiry screens remain
accessible. Real onboarding, Checkout, platform fees, Supabase order storage,
and signed webhook processing are backend work and are not wired here.
