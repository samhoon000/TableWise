# SmartTable (Tablewise)

A full-stack restaurant table reservation demo: browse venues, pick a table and time window, pay with **Razorpay** (test mode), and receive a **numeric verification token** stored in MongoDB. Includes an **owner admin dashboard** and **My Reservations** tracking via browser **local storage**—no login required for guests.

## Features

- **Guest booking** — Multi-step flow: table & time, guest details, payment, confirmation.
- **Payments** — Razorpay Checkout (demo keys; replace for production).
- **Verification token** — Unique 6-digit token issued only after successful payment; shown on confirmation and in the admin panel.
- **Confirmation page** — `/confirmation/:id` loads booking data from the API (refresh-safe).
- **My Reservations** — Saved reservation IDs in `localStorage`; batch fetch from API; newest first; invalid or removed IDs are pruned automatically.
- **Admin dashboard** — Table layout, manual holds, renames, reservation list, search by token (restaurant-scoped).
- **MongoDB** — Reservations, table status, overlap checks for confirmed/booked slots.

## Tech Stack

| Layer    | Technologies                          |
| -------- | ------------------------------------- |
| Frontend | React 19, React Router 7, Vite 8, Tailwind CSS 4 |
| Backend  | Node.js, Express 5, Mongoose 9      |
| Payments | Razorpay                              |
| Database | MongoDB                               |

## Prerequisites

- **Node.js** 18+ (recommended)
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- npm or compatible package manager

## Project Structure

```
SmartTable/
├── src/                 # React app
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   └── data/
├── backend/
│   ├── server.js
│   ├── models/
│   ├── lib/
│   └── package.json
├── package.json         # Frontend
└── vite.config.js       # Proxies /api → localhost:5000
```

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd SmartTable
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/smarttable
```

Use your real connection string for Atlas or another host.

Start the API (default port **5000**):

```bash
npm start
```

Optional: configure Razorpay in `backend/server.js` (`create-order` route) and Razorpay key on the frontend (`src/pages/payment-page.jsx`) for live test payments.

### 3. Frontend setup

From the **repository root** (not `backend/`):

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). API calls to `/api/*` are proxied to `http://localhost:5000`.

### 4. Production build

```bash
npm run build
npm run preview   # optional: serve the built app locally
```

Serve the `dist/` folder behind a reverse proxy that also forwards `/api` to your Node server, or deploy frontend and backend separately and point the client at your API base URL (you would adjust fetch URLs / proxy accordingly).

## npm Scripts

**Root (frontend)**

| Script       | Description        |
| ------------ | ------------------ |
| `npm run dev`    | Vite dev server    |
| `npm run build`  | Production build   |
| `npm run preview`| Preview production build |
| `npm run lint`   | ESLint             |

**Backend**

| Script          | Description   |
| --------------- | --------------- |
| `npm start`     | Run `server.js` |

## API Overview (selected)

| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/api/reservations/book-after-payment` | Create confirmed reservation + token after payment |
| `GET`  | `/api/reservations/booking/:id` | Single reservation (confirmation page) |
| `POST` | `/api/reservations/by-ids` | Batch fetch `{ "ids": ["..."] }` for My Reservations |
| `GET`  | `/api/reservations/:restaurantId` | List reservations for a restaurant (`?token=` optional) |
| `POST` | `/api/reservations/book-table` | Legacy direct booking (no payment token) |
| `GET`  | `/api/reservations/today` | Guest counts per restaurant for today |
| `DELETE` | `/api/reservations/:id` | Delete reservation |
| `GET`/`POST` | `/api/table-status/...` | Table manual reserve / display names |

## Local Storage

- **My reservation IDs:** `tablewise-my-reservation-ids` — array of MongoDB reservation `_id` strings, deduplicated, newest first when appending.
- **Venue UI state:** `tablewise-venue-state` — client-side reservation cache and table overrides for the floor plan.

## Security Notes

- Replace Razorpay **test** keys with your own; never commit real **secret** keys.
- Keep `MONGO_URI` and secrets in `.env` and add `.env` to `.gitignore`.
- The booking and confirmation APIs are suitable for demos; production apps should add authentication, rate limiting, and stricter validation as needed.

## License

This project is provided as-is for demonstration and educational use. Add a `LICENSE` file if you publish it publicly.

---

**Tablewise** — Smart table reservations for restaurants.
