# CSV Dashboard Generator

A Next.js (App Router) dashboard that lets you upload a CSV, auto‑detect headers, build dynamic charts, and explore tables. It includes a local, rule‑based chatbot for quick dataset questions.

## Features
- CSV upload → JSON parsing via API route
- Auto‑detected numeric, categorical, and date columns
- KPI cards, charts, and tables
- Sidebar to select headers for custom tables and chart inputs
- Right‑side chatbot that answers basic CSV questions without external APIs

## Requirements
- Node.js 18+ (recommended: latest LTS)
- npm 9+ (or pnpm/yarn if you prefer)

## Install
```bash
npm install
```

## Run (Development)
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

## Build (Production)
```bash
npm run build
npm run start
```

## Project Structure
```
app/
  api/upload/route.js   # CSV → JSON API
  layout.js
  page.js               # Dashboard UI
components/
  KPI.jsx
  Charts.jsx
  DataTable.jsx
  AutoTables.jsx
  Sidebar.jsx
  Chatbot.jsx
styles/
  dashboard.css
```

## Notes
- The chatbot is local and rule‑based (no external AI). It can answer summary, columns, row count, and basic per‑column stats.
- Charts are generated based on the selected numeric/categorical/date headers in the sidebar.

