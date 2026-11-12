# PCON Website

The website for the Programming Club of NIT Jamshedpur, built with Next.js App Router and TypeScript, with an admin panel backed by Postgres (Prisma) and Google sign-in (Auth.js).

## Run locally

You need Node 22 and a Postgres server running on `localhost:5432` with user `postgres` / password `postgres` (Homebrew, Postgres.app or Docker all work).

```bash
npm install
createdb pcon               # the app's database
createdb pcon_test          # only if you'll run the tests
cp .env.example .env        # then fill it in (see below)
npx prisma migrate deploy   # creates the tables
npm run db:seed             # makes the emails in SEED_ADMIN_EMAILS / SEED_OWNER_EMAILS admins / owners
npm run dev
```

No Docker? Skip it: any local Postgres works. With Docker, this replaces the two `createdb` lines:

```bash
docker run -d --name pcon-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pcon postgres:16
docker exec pcon-db createdb -U postgres pcon_test
```

Open [http://localhost:3000](http://localhost:3000) for the site and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

**Each developer has their own local database**, so everyone seeds themselves: put **your own** college email in `SEED_ADMIN_EMAILS` (and `SEED_OWNER_EMAILS` if you need to manage roles). A teammate can copy someone else's `.env` (sent privately, never committed) but must change those two lines to their own email, or they'll seed the other person instead of themselves.

**Check it worked:** `npm run db:seed` should print `created you@nitjsr.ac.in as ADMIN` (or `promoted ...`). `Nothing to seed` means the `SEED_` lines are empty. After signing in, the admin top bar shows your role badge.

**Changing the schema:** edit `prisma/schema.prisma`, then run `npx prisma migrate dev --name what-changed` and commit the new folder in `prisma/migrations/`. Teammates pick it up with `npx prisma migrate deploy`.

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
   If Google says access is blocked, the OAuth consent screen (Google Cloud Console → OAuth consent screen) is in **Testing** mode: whoever owns the Google client must add your email under **Test users**, or publish the app.
3. What you see depends on your role. A new person is a Member until an owner (or the seed script) gives them more.

There are no passwords. Access comes from your role in the database:

- **First admin/owner:** put the email in `SEED_ADMIN_EMAILS` or `SEED_OWNER_EMAILS` and run `npm run db:seed`, before or after that person first signs in.
- **Everyone after that:** they sign in once, then an owner sets their role on **Users & roles**. Admins can also add someone to the team by email before they ever sign in; they then appear on Users & roles as "Not signed in yet" and an owner can promote them in advance.
- Roles live in the database, so promoting someone only affects the database the app is pointed at. On local setups each developer seeds themselves (see **Run locally**).

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

## Roadmaps

`/roadmaps` (`app/roadmaps/page.tsx`) reads all roadmap content through `getPathway()` in `lib/roadmaps.ts`. The roadmaps aren't managed in the admin panel yet; when they are, make `getPathway()` load from the database and keep the same shape:

- `Pathway` holds the shared `foundation` track, the independent `branches` (CP, Web, ML, DevOps) and the hero `principles`.
- `Roadmap` is one track: title, tint, ordered `steps`, plus optional `locked`, `exploreNext`, `furtherReading`, `channels` and `tips`.
- `RoadmapStep` has a stable `id`, a title, optional `stage`, `optional` and `milestone` flags, and its `resources` (`playlist`, `video`, `practice` or `website`, with an optional `note` such as "Sessions 1–7").
- `addedAt` (ISO date, on a step or a single resource) marks new content, which shows a "New" badge for a week.

Keep step `id`s stable: juniors' progress is saved in their browser (`localStorage` key `pcon:roadmap-progress:v1`) against them. YouTube links get a hover preview (thumbnail, title, channel) from YouTube's public oEmbed endpoint, fetched on the server and refreshed daily (`lib/youtube.ts`); no API key is needed.
