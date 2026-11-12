# PCON Website

The website for the Programming Club of NIT Jamshedpur, built with Next.js App Router and TypeScript, with an admin panel backed by Postgres (Prisma) and Google sign-in (Auth.js).

## Run locally

```bash
npm install
cp .env.example .env        # then fill it in (see below)
npx prisma migrate dev --name init   # first time only: creates the tables
npm run db:seed             # makes the emails in SEED_ADMIN_EMAILS admins
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the site and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

### Environment

| Variable | What it is |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Postgres connection (Neon/Supabase/local). Same value for both if you don't use a pooler. |
| `AUTH_SECRET` | Generate with `npx auth secret`. |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google OAuth client. Redirect URI: `http://localhost:3000/api/auth/callback/google` (and the production equivalent). |
| `ALLOWED_EMAIL_DOMAIN` | Only this domain can sign in. Default `nitjsr.ac.in`. |
| `SEED_ADMIN_EMAILS`, `SEED_OWNER_EMAILS` | Comma-separated emails `npm run db:seed` gives ADMIN / OWNER. Safe to re-run; never lowers a role. |
| `TEST_DATABASE_URL` | A separate database for `npm test`, name must contain `test`. The tests wipe it. Leave empty to skip database tests. |

## Admin panel

Roles, from least to most access (each includes everything below it):

| | Member | Admin | Owner |
|---|:-:|:-:|:-:|
| Sign in, see own blogs | ✓ | ✓ | ✓ |
| Edit / publish / delete **own** blogs | ✓ | ✓ | ✓ |
| Create blogs | | ✓ | ✓ |
| Create / edit / delete events | | ✓ | ✓ |
| Manage the team (members page, alumni) | | ✓ | ✓ |
| Change anyone's role | | | ✓ |

Rules built in:

- **Blogs belong to their author.** No one else, not even an owner, can edit, publish or delete them. Authors keep control after they stop being admins.
- **Events display rule.** Once there are more than 10 events, events that started more than 4 years ago are hidden on the public site. Use `getPublicEvents()` from `lib/events.ts` for every public event list. The admin events table always shows everything and marks hidden events.
- **Roles.** Only owners change roles, nobody can change their own role, and the last owner can't be demoted, so the club can't be locked out.
- **Handover.** The outgoing owner makes the new president an owner, and the new owner then sets the old one back to member. Users & roles flags admins who are no longer on the current team.
- Every server action checks permissions itself. Layouts only hide UI.

## Signing in to the admin panel

1. Go to `/admin` (for example `http://localhost:3000/admin`). You'll be sent to the sign-in page.
2. Click **Continue with Google** and pick your `@nitjsr.ac.in` account. Other accounts are refused.
3. What you see depends on your role. A new person is a Member until an owner (or the seed script) gives them more.

There are no passwords. Access comes from your role in the database:

- **First admin/owner:** put the email in `SEED_ADMIN_EMAILS` or `SEED_OWNER_EMAILS` and run `npm run db:seed`, before or after that person first signs in.
- **Everyone after that:** they sign in once, then an owner sets their role on **Users & roles**. Admins can also add someone to the team by email before they ever sign in.

## Tests

```bash
npm run test:unit   # fast, no database needed
npm test            # unit + database tests (needs TEST_DATABASE_URL)
```

The database tests call the real server actions as members, admins and owners against a throwaway Postgres database, and check every permission rule: only admins manage events, only the author changes a blog, only owners change roles, the last owner can't be removed, and demotions apply immediately. To set one up locally:

```bash
createdb pcon_test   # or create it in your Postgres tool
# then set TEST_DATABASE_URL in .env
npm test
```

GitHub Actions runs type checking, all tests and a production build on every push and pull request (`.github/workflows/ci.yml`).

## Project structure

```text
app/                 Public pages, root layout, global styles
app/admin/           Admin panel: login, (panel)/ pages, _actions/ (server actions), _components/
app/api/auth/        Auth.js route
auth.ts              Auth.js config (Google, domain restriction, database sessions)
components/          Shared site header, footer, and brand elements
lib/                 Site data, Prisma client, role helpers, permission guards, event rule, validation
prisma/              Schema and seed script
tests/unit/          Fast tests for roles, the event rule, dates and validation
tests/db/            Server-action permission tests against a test database
public/              Static assets, including the PCON mark
```
