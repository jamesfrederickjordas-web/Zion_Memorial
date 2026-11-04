# Google Play-Style GCash Auto-Debit Setup Guide (Xendit + Supabase Edge Functions)

This guide walks you step-by-step through activating **tokenized GCash Auto-Debit** (the exact same pattern used by Google Play, Netflix, and Spotify) for **Zion Memorial Garden**.

---

## Architecture Overview

1. **No MPIN is ever asked or stored by Zion Memorial Garden.**
2. **One-Time Linking (`POST /v2/payment_methods`, `reusability: MULTIPLE_USE`):**
   - The client clicks **Link GCash** in the **Payments & GCash Auto-Debit** tab.
   - Our Supabase Edge Function ([`supabase/functions/gcash-api/index.ts`](supabase/functions/gcash-api/index.ts)) creates a Xendit Customer + Reusable GCash Payment Method and redirects the client to GCash's official authorization screen.
   - After approval, Xendit activates the token (`pm-...`) and notifies [`supabase/functions/xendit-webhook/index.ts`](supabase/functions/xendit-webhook/index.ts), which marks the token `ACTIVE` in `public.payment_methods`.
3. **Automatic Deduction on Reservation & Due Dates (`POST /payment_requests`):**
   - **Initial Reservation (Down Payment or Full Price):** Immediately debited from the linked GCash token when submitting the reservation.
   - **Monthly Installments:** Every `INSTALLMENT` reservation automatically generates monthly rows in `public.payment_schedules` via a PostgreSQL trigger.
   - **Daily Background Auto-Debit (`pg_cron` at 9:00 AM PHT):** Calls [`supabase/functions/gcash-autodebit-run/index.ts`](supabase/functions/gcash-autodebit-run/index.ts), which charges due/overdue installments (up to 3 retries, max 1 retry/day) and emails **3-day pre-due reminders** + **PAID receipts**.
4. **Role Separation:**
   - **Client accounts:** See the **Payments & GCash Auto-Debit** tab to link/unlink GCash, toggle auto-debit, pay early, or pay off their full remaining balance. Staff Portal is hidden.
   - **Staff accounts:** Client personal GCash tab is hidden; Staff can access `admin.html` for counter cash payments and inventory, **excluding** the Admin GCash Gateway Setup tab.
   - **Admin accounts:** Have exclusive access to **💳 GCash Auto-Debit (Admin)** inside `admin.html` to monitor linked wallets, scheduled deductions, Xendit webhooks, and manually trigger auto-debit runs.

---

## Step 1 — Create Your Xendit Account & Get Test Keys

1. Sign up at **https://dashboard.xendit.co/register** (select **Philippines**).
2. Switch the top-left toggle in the Xendit Dashboard to **Test Mode** (sandbox is available immediately without waiting for business KYC).
3. Go to **Settings → Developers → API Keys → Generate Secret Key**:
   - Name: `Zion Memorial Garden Supabase`
   - Permissions: **Money-In Products = Write** (Customers, Payment Methods, Payment Requests)
   - Copy the key (starts with `xnd_development_...`). **Save it somewhere safe — Xendit only shows it once.**
4. Still in **Settings → Developers → Webhooks**:
   - Find your **Webhook Verification Token** (`x-callback-token`) and copy it. (You will paste the Webhook URL in Step 4 after deploying the Edge Functions.)
5. Check **Settings → Payment Methods → E-Wallets → GCash**:
   - Make sure **GCash** (and **GCash Link & Pay / Recurring**, if listed separately on your account) is enabled in **Test Mode**.
   - *(Note: For Live Mode later, submit your business KYC documents in Xendit and message Xendit PH Support to enable `MULTIPLE_USE` / Link & Pay for GCash on your live merchant ID.)*

---

## Step 2 — Run the Database Migration in Supabase

1. Open your Supabase SQL Editor:
   **https://supabase.com/dashboard/project/mjhkglatnwcudwcpbzsp/sql/new**
2. Open [`sql/06_gcash_autodebit.sql`](sql/06_gcash_autodebit.sql), copy the entire file, paste it into the SQL Editor, and click **Run**.
   - Creates `public.payment_methods`, `public.payment_schedules`, and `public.payment_gateway_events`.
   - Adds gateway tracking columns to `public.payments`.
   - Installs the trigger that auto-generates monthly `payment_schedules` for every `INSTALLMENT` reservation (and backfills existing ones).
   - Locks writes behind Row-Level Security so only the server's `service_role` can mark payments `COMPLETED`.

---

## Step 3 — Deploy the 3 Supabase Edge Functions & Set Secrets

Open **PowerShell** in your project folder (`c:\Users\Acer\Downloads\zion-memorial-garden-main\zion-memorial-garden-main`):

### 3.1 Install & Log in to Supabase CLI
```powershell
npm install -g supabase
supabase login
supabase link --project-ref mjhkglatnwcudwcpbzsp
```

### 3.2 Set Your Server Secrets
Replace the placeholder values below with:
- Your `xnd_development_...` key from Step 1
- Your Xendit Webhook Verification Token from Step 1
- Any strong random password you invent for `CRON_SECRET` (e.g. `zmg_cron_9f8a7b6c5d4e3f2a1b`)
- Your live site URL (or local Live Server URL `http://127.0.0.1:5500` while testing locally)
- *(Optional, for background server emails when the user is offline)* Your EmailJS Private Key from **EmailJS Dashboard → Account → API Keys → Private Key** (also enable *"Allow EmailJS API for non-browser applications"* in EmailJS Account → Security).

```powershell
supabase secrets set `
  XENDIT_SECRET_KEY="xnd_development_PASTE_YOUR_KEY_HERE" `
  XENDIT_WEBHOOK_TOKEN="PASTE_YOUR_XENDIT_WEBHOOK_VERIFICATION_TOKEN" `
  XENDIT_GCASH_CHANNEL="GCASH" `
  CRON_SECRET="INVENT_A_STRONG_RANDOM_CRON_SECRET_HERE" `
  APP_BASE_URL="http://127.0.0.1:5500" `
  EMAILJS_PUBLIC_KEY="siuCT77XCPFo0C3Pl" `
  EMAILJS_PRIVATE_KEY="PASTE_YOUR_EMAILJS_PRIVATE_KEY_OPTIONAL" `
  EMAILJS_SERVICE_ID="service_xvwt6qa" `
  EMAILJS_TEMPLATE_ID="template_56p30ne"
```

> **Note:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by Supabase into every Edge Function — you do not need to set them.

### 3.3 Deploy All 3 Functions
- `gcash-api` verifies the logged-in user's JWT automatically.
- `xendit-webhook` and `gcash-autodebit-run` are called by Xendit and `pg_cron` (which authenticate using `x-callback-token` and `x-cron-secret`, not a user JWT), so deploy those two with `--no-verify-jwt`:

```powershell
supabase functions deploy gcash-api
supabase functions deploy xendit-webhook --no-verify-jwt
supabase functions deploy gcash-autodebit-run --no-verify-jwt
```

---

## Step 4 — Connect Xendit Webhooks (Updated for Modern Payments API Dashboard)

In your Xendit Dashboard (**Settings → Developers → Webhook URL**), paste your Supabase webhook URL into the following rows under **Payments API**:

**Webhook URL to copy:**
```text
https://mjhkglatnwcudwcpbzsp.supabase.co/functions/v1/xendit-webhook
```

### Which rows to fill in your table:
| Product | Event in your dashboard | Purpose | Action |
|---|---|---|---|
| **Payments API** | **`Payment Token Status`** | Notifies when a user links/approves their GCash wallet (`payment_token.activation` / `payment_token.failure`) | Paste URL & click **Test and save** |
| **Payments API** | **`Payment Request Status`** | Notifies when automated deductions/payment requests process (`payment_request.*`) | Paste URL & click **Test and save** |
| **Payments API** | **`Payment Status`** | Notifies when payments are captured/completed (`payment.capture` / `payment.failure`) | Paste URL & click **Test and save** |

*(You can leave **Payment Session** and **Payment Links** empty or set to example.com since Zion Memorial Garden uses direct Payments API tokenization.)*

> **Note on "Test and save":** When you click **Test and save**, Xendit sends a ping to your endpoint with your `x-callback-token`. Make sure you have completed Step 3 (deployed `xendit-webhook` and set `XENDIT_WEBHOOK_TOKEN` in Supabase Secrets) so it receives a `200 OK`. You can also see incoming pings inside `admin.html` → **💳 GCash Auto-Debit (Admin)** → *Recent Xendit Webhook Events*.

---

## Step 5 — Turn On the Daily Auto-Debit Scheduler (`pg_cron`)

1. In Supabase Dashboard, go to **Database → Extensions** and enable:
   - **`pg_cron`**
   - **`pg_net`**
2. Open [`sql/07_gcash_autodebit_cron.sql`](sql/07_gcash_autodebit_cron.sql).
3. Replace `YOUR_CRON_SECRET` on line 30 with the **exact same `CRON_SECRET`** you set in Step 3.2.
4. Paste into the **Supabase SQL Editor** and click **Run**.

Every day at **9:00 AM Philippine Time (`0 1 * * *` UTC)**, Supabase will automatically:
- Deduct every installment whose `due_date <= today` for clients with an `ACTIVE` linked GCash and `auto_debit_enabled = true` (retrying up to 3 days if a wallet has insufficient funds).
- Email 3-day pre-due reminders for installments due in 3 days.

---

## Step 6 — How to Test the Whole Flow End-to-End (Sandbox)

1. **Link GCash (Once):**
   - Log in as a **Client** on `dashboard.html`.
   - Click **💳 Payments & GCash Tab** in the top bar → click **🔗 Link GCash**.
   - Xendit's Test Mode GCash simulator page opens. Click **Authorize / Success**.
   - You are redirected back to `dashboard.html` and your status badge turns green: **`✓ Linked`**.
2. **Test Immediate Auto-Deduction on Reservation (Down Payment or Full Payment):**
   - Reserve an available plot and choose **GCash** (either **Installment** or **Full Payment**).
   - Click **Confirm & Submit Reservation**.
   - The server immediately charges your linked GCash token via Xendit, updates `reservations.total_paid` and `reservations.balance`, generates all monthly rows in `payment_schedules`, downloads your **`TAG: PAID`** PDF receipt, and emails your receipt.
3. **Test Automatic Due-Date Deduction Right Now (Without Waiting 30 Days):**
   - In Supabase SQL Editor, move your first installment's `due_date` to today:
     ```sql
     UPDATE public.payment_schedules
     SET due_date = CURRENT_DATE
     WHERE status = 'PENDING'
     AND id = (SELECT id FROM public.payment_schedules WHERE status = 'PENDING' ORDER BY id LIMIT 1);
     ```
   - Log in as an **Admin** (`role = 'admin'`), open `admin.html` → **💳 GCash Auto-Debit (Admin)**, enter your `CRON_SECRET`, and click **⚡ Trigger Auto-Debit Run Now** (or wait for the 9:00 AM daily cron).
   - Watch the installment flip to **`PAID`**, the reservation balance drop automatically, and the client receive their **`PAID`** email receipt!

---

## Step 7 — Going Live (Real Money)

When Zion Memorial Garden is ready to accept real GCash auto-debits:
1. Complete business KYC in Xendit and confirm `MULTIPLE_USE` GCash Link & Pay is enabled on your Live account.
2. Switch Xendit Dashboard to **Live Mode**, generate a `xnd_production_...` secret key, copy the Live Webhook Verification Token, and configure the same webhook URL under Live Webhooks.
3. Update your Supabase secrets:
   ```powershell
   supabase secrets set `
     XENDIT_SECRET_KEY="xnd_production_YOUR_LIVE_KEY" `
     XENDIT_WEBHOOK_TOKEN="YOUR_LIVE_WEBHOOK_TOKEN" `
     APP_BASE_URL="https://your-production-domain.com"
   ```
4. No code changes are required — the UI automatically detects Live Mode and hides the Test Mode banner.

