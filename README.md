# Calico dashboard

The customer dashboard for **Calico**, our growth planning software for local businesses. This is the screen account owners and our own support team use to see customers, plans and seats, and what has happened on the account recently.

The product's marketing site lives in `calico-marketing-site`. This repo is only the dashboard.

## Running it locally

You need Node 20 or newer.

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173.

There is no backend to set up. The dashboard runs against an in-memory mock of the Calico API in `src/api.js`: it loads seed data from `src/data/`, answers after a short delay like the real service would, and keeps changes in memory until you reload the page. Every call is logged to the browser console with an `[api]` prefix so you can see what a screen is requesting.

`npm run build` produces a production build in `dist/`, and `npm run preview` serves it.

## Accounts

The account switcher in the header flips the whole dashboard between two accounts:

- **Northwind Studio** on the Growth plan, a small account with 40 customers.
- **Halden Logistics** on the Enterprise plan, a larger account with 120 customers and a busier activity feed.

## Screens

| Screen | What it shows |
| --- | --- |
| Overview | Headline numbers for the account and a few panels (new customers, recent activity, plan mix, seat usage) |
| Customers | Every customer on the account with plan, seats and status. Plans and seats can be edited from here. |
| Activity | Everything that has happened on the account in the last 90 days, searchable and filterable by type |

## How it fits together

```
src/api.js          In-memory API client: get(path) and patch(path, body)
src/data/           Seed data the client loads on start-up
src/layout/         Sidebar, header and account switcher
src/pages/          One file per screen, plus the Overview panels and the activity feed
src/components/     Shared pieces: badges, stat cards, dialog, skeletons
src/utils/          Formatting helpers
src/styles/         Plain CSS, split by concern
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
