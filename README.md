# SmartIMS — Enterprise Inventory & Order Management System

A modern, smart enterprise Inventory & Order Management System (IMS) built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Highcharts**.

Features a color palette and visual design inspired by top-tier modern luxury & pharmacy management dashboards, featuring pastel KPI metric cards, Highcharts data visualizations, a collapsible/expandable sidebar with floating tooltips, and light/dark theme support.

---

## 🎨 Design System & Visual Highlights

### 1. Color Palette (Inspired by Modern Healthcare & Luxury SaaS)
- **Primary Brand**: Deep Pine & Forest Teal (`#093A3E` / `#0A332C` / `#0D9488`).
- **Canvas Background**:
  - **Light Theme**: Crisp, soft mint-warm off-white (`#F0F7F6`).
  - **Dark Theme**: Deep oceanic teal-slate (`#071317` / `#0D2026`).
- **Pastel Metric Cards**:
  - **Mint Gradient (`#DCFCE7` → `#D1FAE5`)**: Monthly Revenue with green sparkline micro-chart.
  - **Aqua Gradient (`#CCFBF1` → `#A7F3D0`)**: Total Stock Valuation with teal sparkline micro-chart.
  - **Coral/Rose Gradient (`#FFE4E6` → `#FECDD3`)**: Low Stock Critical Alerts with rose sparkline.
  - **Lavender Gradient (`#EDE9FE` → `#DDD6FE`)**: Inbound Purchase Orders with purple sparkline.

### 2. Collapsible & Expandable Sidebar with Floating Tooltips
- **Desktop Expand/Collapse**: Toggle between full-width (`w-64`) and compact icon mode (`w-[72px]`) via the header or sidebar toggle button.
- **Floating Tooltips in Collapsed Mode**: Hovering any navigation icon instantly displays an elevated tooltip with the module name and live badge counter (e.g. `4 low stock alerts`, `2 pending POs`).
- **Full Responsiveness**: Adaptive drawer overlay on tablets and mobile screens with backdrop blur.

### 3. Highcharts Interactive Visualizations
- **Graph Report (Donut Chart)**:
  - Multi-segmented ring chart (Mint, Coral, Lime, Lavender) displaying stock, sales, inbound PO, and buffer distribution.
  - Center label with bold total valuation (`$39.5K`).
  - Custom legend with percentage breakdowns.
- **Total Sales & Movements Overview (Capsule Bar Chart)**:
  - Modern capsule columns with rounded caps for daily volumes.
  - Highcharts custom dark pill tooltip matching `$298.00K` style.
- **Theme-Adaptive**: Chart text, gridlines, and backgrounds automatically synchronize with light and dark mode toggles.

---

## ⚡ Connected Core Modules & End-to-End Workflows

All modules share an in-memory singleton store (`src/lib/store.ts`) ensuring real-time state synchronization:

1. **Executive Dashboard (`/`)**:
   - 4 Pastel KPI cards with sparkline micro-charts.
   - Highcharts Donut Report and Capsule Bar Chart.
   - Actionable **Low Stock Alerts** with a one-click **"Restock SKU"** button that opens a pre-filled Purchase Order modal ($2 \times \text{minLevel}$).
   - Real-time **Recent Movements Feed** with audit tags and warehouse allocation.

2. **Stock & Godowns Ledger (`/stock`)**:
   - Multi-facet filters: Category (*Electronics*, *Office Furniture*, *Accessories*), Godown Location (*Main Hub*, *West Warehouse*), and Stock Health.
   - Slide-over **Stock History Drawer (Sheet)** showing historical audit ledger, margin calculations, and inline **Manual Stock Adjustment**.

3. **Purchase Orders — Inbound Workflow (`/purchases`)**:
   - Filterable PO table (Pending, Received, Cancelled).
   - Connected **"Mark as Received"** trigger: automatically increments warehouse stock, clears low stock alerts, and appends an inbound audit entry.
   - Issue PO modal with supplier selection, dynamic line items, and unit costs.

4. **Sales Orders & Invoices — Outbound Workflow (`/sales`)**:
   - Filterable invoices (Draft, Confirmed, Paid).
   - Real-time stock validation preventing overselling beyond available warehouse quantity.
   - Connected **Confirm & Fulfill** trigger: automatically deducts stock and trips low stock alerts if levels fall $\le \text{minLevel}$.
   - **Mark Paid** trigger: increments recognized monthly revenue.

5. **Reports & Financial Analytics (`/reports`)**:
   - Tabbed analytics: **Stock Valuation Report**, **Sales Summary Report**, and **Purchase Spend Report**.
   - Working **Export CSV** for each report.

6. **Quick Actions & Persistence**:
   - Global **Command Palette (`Cmd+K` / `Ctrl+K`)**.
   - **Reset Demo Data** button in the header restoring original initial seed data at any time.

---

## 🚀 Getting Started

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```
