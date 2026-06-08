# PR Review App

A minimal GitHub-like PR review interface for technical interviews. Admin creates a session per candidate, shares the link, and reviews their comments after submission.

Built for the Prosigliere Harry Potter coding challenge. The fake PR (`feat(characters): add Recently Viewed sidebar`) ships with **5 planted bugs** that a competent React developer should catch on a code review.

## What it does

- **Admin**: signs in with a password, creates a session per candidate, gets a shareable link, and views the candidate's comments and final summary after submission.
- **Candidate**: opens the unique link (no login needed), clicks any line in the diff to add a comment, then submits the review. Once submitted, the review is locked.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Upstash Redis for persistence (with in-memory fallback for local dev)
- Vercel-ready

---

## Local development

```bash
pnpm install
cp .env.example .env.local
# set ADMIN_PASSWORD in .env.local
pnpm dev
```

Open <http://localhost:3000>. With no Redis env vars set, the app uses an in-memory store — fine for testing, but **data is lost on every restart**.

To exercise the Redis path locally, sign up at <https://upstash.com> (free, no credit card), create a Redis database, and copy `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` into `.env.local`.

---

## Deploy to Vercel

1. Push this folder to a Git repo.
2. Import it on [vercel.com](https://vercel.com).
3. On the project's **Storage** tab, click **Connect Database → Upstash → Redis** (free tier). Vercel auto-injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
4. On **Settings → Environment Variables**, add `ADMIN_PASSWORD` (any strong value).
5. Redeploy.

Open your Vercel URL — you'll be sent to `/login`. Use the password you set.

---

## Using it for an interview

1. As admin, click **New session**, enter the candidate's name.
2. Copy the link (`/review/<token>`), send to the candidate.
3. Candidate opens the link, reviews the diff, leaves comments, clicks **Finish review**.
4. Back in admin (`/admin`), click the candidate's name to see comments grouped by file + line + the final summary.

## Grading

See **BUGS_ANSWER_KEY.md** at the project root — it lists each planted bug, the file + line where it lives, severity, and the "good answer" you're hoping the candidate writes in the comment. Do **not** share this file with candidates.

---

## File map

```
src/
├── app/
│   ├── page.tsx                     # redirect to /admin or /login
│   ├── login/page.tsx               # password sign-in
│   ├── admin/
│   │   ├── page.tsx                 # list of sessions
│   │   ├── new/page.tsx             # create session
│   │   └── [id]/page.tsx            # view candidate's comments
│   ├── review/[token]/
│   │   ├── page.tsx                 # candidate's review UI
│   │   └── submitted/page.tsx       # thank-you
│   └── api/                         # JSON endpoints
├── components/                      # diff view + comments
├── lib/
│   ├── db.ts                        # Redis or in-memory
│   ├── auth.ts                      # admin cookie
│   ├── sessions.ts                  # CRUD
│   └── pr-data.ts                   # the fake PR (with bugs)
└── types/
```

## Deployed URL

https://code-challenge-pr-review.vercel.app
