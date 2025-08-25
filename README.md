# Cashly — Personal Finance Web App

> Track balances, log expenses/incomes, make payments, and visualize your money with clean, modern UI. Built for stability first; design follows a consistent dark theme.

---

## Table of Contents

* [Overview](#overview)
* [Feature Highlights](#feature-highlights)
* [Screens & UX](#screens--ux)
* [Architecture](#architecture)
* [Tech Stack](#tech-stack)
* [Folder Structure](#folder-structure)
* [Data Model](#data-model)
* [API Endpoints](#api-endpoints)
* [Setup & Installation](#setup--installation)
* [Environment Variables](#environment-variables)
* [Run & Dev Scripts](#run--dev-scripts)
* [Seeding & Test Data](#seeding--test-data)
* [Admin Panel Rules](#admin-panel-rules)
* [Payments Logic](#payments-logic)
* [Statistics & Aggregations](#statistics--aggregations)
* [Security Notes](#security-notes)
* [Error Handling & Logging](#error-handling--logging)
* [Contributing](#contributing)
* [Screenshots](#screenshots)
* [Roadmap](#roadmap)
* [License](#license)

---

## Overview

Cashly is a **web-only** personal finance application. Users can:

* Register / login (credentials stored in MongoDB; passwords hashed)
* See **Home** dashboard with profile & current balance
* Add **Expenses**/**Incomes** and view **History**
* Make **Payments** (with method, description, amount, date) that automatically affect balance and appear in History
* Explore **Statistics** with daily/weekly/monthly/yearly filters and combined charts for incomes, expenses, and payments
* Use an **Admin Panel** to set the canonical balance and manage records (single-record deletion in History)

Stability and data integrity are prioritized. Design follows a modern dark theme consistent with the project’s overall style.

## Feature Highlights

* **Multi-card awareness** (planned) with per-card breakdowns
* **Goals & budgets** (planned) with motivational coaching
* **Dark theme** with custom palette
* **Consistent layout**: fixed Sidebar/Topbar, and Help/FAQ page structure
* **Screenshots/Assets** prepared for docs and previews

## Screens & UX

* **Home**: Greeting from DB, user name, balance, quick KPIs
* **Payments**: Choose method → add description, amount, date → submit; creates a history entry & reduces balance
* **History**: Filter/search (planned), **single-item delete** (implemented)
* **Statistics**: Time-range selector (day/week/month/year). Unified chart of incomes, expenses, payments (sourced from MongoDB)
* **Settings**: Language select, screenshot hotkey, theme switch
* **Help (FAQ)**: Expandable Q\&A + contact link

## Architecture

**Monorepo style** with separate `frontend` and `backend` directories:

* **Frontend**: HTML/CSS/JS (vanilla) with modular files per page. (Electron/React used in earlier experiments for other projects; Cashly FE is plain web.)
* **Backend**: Node.js + Express + MongoDB (Mongoose). Clear separation of controllers/services/models.

**Data flow**

1. Frontend forms → REST API (Express)
2. Controllers validate & call services
3. Services interact with MongoDB via Mongoose models
4. Responses update UI and persist state

## Tech Stack

* **Frontend**: HTML5, CSS3, JavaScript (ES6+)
* **Backend**: Node.js, Express
* **Database**: MongoDB (Mongoose ODM)
* **Auth & Security**: Password hashing (bcrypt), environment-based config
* **Charts**: (Vanilla/Chart.js or similar; current build uses lightweight charting in Statistics)
* **Tooling**: npm scripts

## Folder Structure

```
Cashly/
├─ backend/
│  ├─ src/
│  │  ├─ models/        # Mongoose schemas (User, Transaction, Payment)
│  │  ├─ controllers/   # Request handlers
│  │  ├─ services/      # Business logic
│  │  ├─ routes/        # Express routers
│  │  ├─ middlewares/   # Auth, error handling
│  │  └─ utils/         # helpers
│  ├─ .env              # server env vars (not committed)
│  └─ server.js         # Express bootstrap
│
├─ frontend/
│  ├─ index.html        # Intro / auth entry
│  ├─ home.html
│  ├─ history.html
│  ├─ payments.html
│  ├─ statistics.html
│  ├─ settings.html
│  ├─ help.html
│  ├─ styles/           # CSS files (dark theme)
│  ├─ js/               # page-specific JS (home.js, payments.js, ...)
│  └─ assets/
│     └─ screenshots/   # images used in README/docs
│
└─ docs/
   └─ images/           # optional mirror for README
```

## Data Model

**User**

```ts
{
  _id: ObjectId,
  firstName: string,
  lastName: string,
  email: string,
  passwordHash: string,
  balance: number,          // canonical balance (admin controls)
  createdAt: Date,
  updatedAt: Date
}
```

**Transaction** (generic income/expense added by user or admin)

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  type: 'income' | 'expense',
  amount: number,
  description: string,
  date: Date,
  createdAt: Date
}
```

**Payment**

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  method: string,           // e.g., Domestic, Foreign, Blik, etc.
  amount: number,           // reduces balance
  description: string,
  date: Date,
  createdAt: Date
}
```

## API Endpoints

Base URL: `http://localhost:<PORT>/api`

**Auth**

* `POST /auth/register` — create user (hash password)
* `POST /auth/login` — authenticate user, return session/JWT

**Balance & Admin**

* `GET /balance` — get current canonical balance
* `PUT /balance` — (admin) update canonical balance

**Transactions**

* `POST /transactions` — add income/expense
* `GET /transactions` — list (filter by date/type)
* `DELETE /transactions/:id` — delete single record

**Payments**

* `POST /payments` — create payment (affects balance & history)
* `GET /payments` — list payments

> All write operations update the **History** view and recompute balance on the server.

## Setup & Installation

1. **Clone**

```bash
git clone https://github.com/<your-org>/cashly.git
cd cashly
```

2. **Backend**

```bash
cd backend
npm install
cp .env.example .env   # set values (see below)
npm run dev            # or: npm start
```

3. **Frontend** (static)

```bash
cd ../frontend
# If a static server is used:
npm install            # only if tooling needed
npm run serve          # or open index.html directly via Live Server
```

## Environment Variables

`backend/.env`

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cashly
JWT_SECRET=change_me
BCRYPT_SALT_ROUNDS=10
NODE_ENV=development
```

## Run & Dev Scripts

**Backend `package.json`**

* `start` → `node server.js`
* `dev` → `nodemon server.js`

**Frontend**

* Pure HTML/CSS/JS. Use VSCode Live Server or any static server.

## Seeding & Test Data

* Provide a `scripts/seed.js` to create a demo user and a handful of transactions/payments.
* Example credentials (dev only): `test@cash.ly` / `Password!23`

## Admin Panel Rules

1. **Canonical balance** can be changed **only** in Admin Panel (persists in MongoDB).
2. **Add expense** form creates a Transaction **and** deducts from balance.
3. **History** supports **single-record delete** (no mass delete).
4. **Payments** create a history entry, deduct balance, and persist forever (no auto-clean).
5. **Passwords are hashed** on login/registration; no plaintext stored.

## Payments Logic

When user submits a payment with method/description/amount/date:

* Validate payload → create `Payment`
* Append to `History` (via unified endpoint or client merge)
* Deduct from `User.balance`
* Return updated balance & new history item

## Statistics & Aggregations

* Source data: `Transaction` (income/expense) + `Payment`
* Server computes grouped sums by **day/week/month/year** using MongoDB aggregation pipelines (`$match`, `$group`, `$bucketAuto`/calendar group, `$sort`).
* Response includes series for charting: `incomes[]`, `expenses[]`, `payments[]` with timestamps.

## Security Notes

* Password hashing with **bcrypt**
* Environment-configured secrets (never commit `.env`)
* Basic rate-limits & input validation recommended (e.g., `express-rate-limit`, `zod/joi`)
* CORS configured explicitly for frontend origin

## Error Handling & Logging

* Central error middleware returns consistent JSON shape `{ error: { code, message, details } }`
* Add request logging in dev (e.g., `morgan`)

## Contributing

1. Fork → branch from `main`
2. Use conventional commits (`feat:`, `fix:`, `docs:` …)
3. PR with description + screenshots of UI changes
4. Add/adjust tests (where available)

## Screenshots

Place images in `frontend/assets/screenshots/` or `docs/images/` and reference them here. Example:

| Screen           | File                                                |
| ---------------- | --------------------------------------------------- |
| Home (Dashboard) | `frontend/assets/Screenshot_185634.png` |
| Payments         | `frontend/assets/screenshots/Screenshot_185655.png` |
| History          | `frontend/assets/screenshots/Screenshot_185713.png` |
| Statistics       | `frontend/assets/screenshots/Screenshot_185926.png` |
| Settings         | `frontend/assets/screenshots/Screenshot_185940.png` |
| Help / FAQ       | `frontend/assets/screenshots/Screenshot_185954.png` |
| Admin Panel      | `frontend/assets/screenshots/Screenshot_190013.png` |
| Intro / Login    | `frontend/assets/screenshots/Screenshot_190028.png` |

Markdown usage:

```md
![Home](frontend/assets/screenshots/Screenshot_185634.png)
```

> Tip: keep filenames short and consistent; prefer lowercase and hyphens, e.g., `home.png`, `payments.png`.

## Roadmap

* Multi-card support & per-card analytics
* Budget goals & AI coaching messages
* Advanced search/filter in History
* i18n (EN/RU/PL/TR) on the UI
* Payment integrations (future)

## License

MIT (unless your org requires otherwise).
