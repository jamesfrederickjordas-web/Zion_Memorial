# Zion Memorial Garden - Cemetery Management System

A cloud-based cemetery reservation and records management system with interactive mapping, built for Zion Memorial Garden.

## 🚀 System Architecture & Phases

### **Phase 1: Cloud Database & Authentication System**
- **Supabase Cloud Database (PostgreSQL)**: Complete relational schema (`profiles`, `memorial_spaces`, `reservations`, `payments`, `memorial_records`, `staff`, `maintenance_visits`, `support_tickets`).
- **Row Level Security (RLS)**: Fine-grained policies protecting client data, staff operations, and public inventories.
- **Authentication**: Modern registration and login portal with email verification modal and automatic profile triggers.
- **Profile Management**: Live profile editing with direct avatar image uploads to Supabase Storage.

### **Phase 2: Interactive Plot Reservation, Amortization & Inventory Management**
- **Online Plot Reservation Flow**:
  - Category selector tabs (Condominium, Single Teired, Supreme, Special Supreme, Mausoleum).
  - Dynamic cloud plot picker querying real-time available plots.
  - Interactive grid mapping (`plot-details.html`) connecting directly to Supabase `memorial_spaces`.
- **Amortization & Booking Form Modal (Step 2)**:
  - Plan type selection: `PRE-NEED` (advance planning) vs `AT-NEED` (immediate).
  - Payment options: `INSTALLMENT` (12, 24, 36, 60 months) vs `FULL_PAYMENT`.
  - Automatic amortization calculation: Down Payment, Monthly Amortization, and Remaining Balance.
  - Payment channels: Cash, Card, GCash, Maya, Bank Transfer.
  - Automatic inventory sync trigger updating plot statuses (`available` -> `reserved` -> `occupied`).
- **My Reservation Page (Figma Frame 120_91 & Frame 213_2)**:
  - Real-time reservation records table with status, plan type, and payment badges.
  - Detailed reservation modal showing complete plot, financial, and amortization schedules.
  - Ability to cancel/delete pending reservations with automatic plot status restoration.
  - Print/download receipt summary option.
- **Live User Dashboard**:
  - Dynamically synchronized profile status, account status, and membership dates.
  - Live Payment Overview tracking current due, upcoming installments, and payment records.
  - Change password flow directly communicating with Supabase Auth.
- **Staff & Inventory Management Portal (`admin.html`)**:
  - Direct implementation of Figma Frames 490_2 and 505_8.
  - KPI metric cards (Total Plots, Total Reservations, Available Plots via `inventory_summary` view).
  - Availability donut and bar charts by lawn category.
  - Complete inventory and reservation review table with filtering, search, and approval actions.

---

## 📁 Project Structure

```
zion-memorial-garden/
├── index.html                  # Landing page with Login & Register modals
├── dashboard.html              # Authenticated Client Dashboard
├── plot-details.html           # Interactive Cloud Plot Grid Map
├── admin.html                  # Staff & Inventory Management Portal
│
├── components/                 # Dynamic HTML Components
│   ├── header.html             # Navigation header
│   ├── hero.html               # Hero banner
│   ├── info-section.html       # Quick access and mission
│   ├── login-modal.html        # Supabase Login modal
│   ├── register-modal.html     # Supabase Registration modal
│   ├── dashboard-header.html   # Client dashboard header
│   ├── dashboard-sidebar.html  # Dashboard navigation sidebar
│   ├── dashboard-content.html  # Client dashboard KPI & Map
│   ├── reservation-modal.html  # Lawn selector & Booking form modal
│   ├── my-reservation-content.html # My Reservation table & details modal
│   ├── edit-profile-page.html  # Profile editor & avatar uploader
│   └── deceased-family-content.html # Deceased records viewer
│
├── css/                        # Responsive Stylesheets
│   ├── main.css                # Global styles
│   ├── dashboard.css           # Dashboard styles
│   ├── reservation-modal.css   # Reservation & booking modal styles
│   ├── my-reservation-page.css # My reservation & details modal styles
│   ├── notification-modal.css  # Modern alerts & toast modals
│   ├── admin.css               # Inventory management portal styles
│   └── ...
│
├── js/                         # JavaScript Client Controllers
│   ├── supabase-config.js      # Supabase client credentials & initialization
│   ├── login.js                # Supabase Auth login controller
│   ├── register.js             # Supabase Auth registration controller
│   ├── dashboard-loader.js     # Dashboard state & booking form controller
│   ├── my-reservation-page.js  # My Reservation table & cancellation controller
│   ├── plot-details.js         # Interactive cloud plot grid controller
│   ├── admin.js                # Inventory & reservation approval controller
│   └── notification-modal.js   # Reusable feedback modal controller
│
└── sql/                        # Supabase Database Migrations
    ├── 01_schema.sql           # Schema, tables, triggers, and functions
    ├── 02_policies.sql         # Row Level Security (RLS) policies
    ├── 03_seed_data.sql        # Plot inventory seed & metrics view
    ├── 04_phase2_reservation_system.sql # Phase 2 status triggers & helpers
    └── complete_setup.sql      # All-in-one consolidated migration script
```

---

## 💻 Database Setup (Supabase)

1. Open your Supabase SQL Editor:
   `https://supabase.com/dashboard/project/mjhkglatnwcudwcpbzsp/sql`
2. Run `sql/complete_setup.sql` (or `sql/04_phase2_reservation_system.sql` if Phase 1 was already run).
3. The database will automatically initialize:
   - All 8 core tables with RLS and foreign key constraints
   - Real-time plot inventory synchronization trigger (`trg_reservation_status_change`)
   - KPI metrics summary view (`inventory_summary`)
   - Default seed plots across all 5 lawn categories (Condominium, Single Tiered, Supreme, Special Supreme, Mausoleum).

---

Made with care for Zion Memorial Garden 🌿
