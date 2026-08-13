# Beneficence Protocol Foundation

Beneficence Protocol Foundation is a public-benefit institution advancing AI Agents that create measurable social value while remaining transparent, governable, and accountable to people. This repository contains its institutional website, public community experience, and private operating dashboard. The organizational source of truth remains [PROJECT.md](./PROJECT.md).

## Architecture

- Next.js App Router, React 19, TypeScript, and plain CSS
- Supabase PostgreSQL, magic-link administrator authentication, RLS, and image storage
- Resend transactional email
- OpenAI Responses API with Structured Outputs and `omni-moderation-latest`
- Vitest for unit/component tests and Playwright for desktop/mobile flows

The warm paper palette, Newsreader/Manrope typography, institutional editorial layout, original URLs, and source-image credits are preserved from the prior Vite site.

## Routes

The institutional routes remain `/`, `/mission`, `/programs`, `/governance`, and `/giving`. Community routes are:

- `/community`
- `/community/people`
- `/community/learn`
- `/community/gather` and `/community/gather/[slug]`
- `/community/contribute`
- `/community/contribute/apply`
- `/community/contribute/resources/submit`
- `/community/code-of-conduct`
- `/privacy`

The unified private dashboard is at `/admin`.

## Local development

Use a current Node.js 22 or 24 runtime.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without external-service credentials, public content renders with truthful empty states and a zero all-time count. Community forms remain closed. This is intentional and lets development/build verification run without creating fake records.

## Database setup

Apply [the community migration](./supabase/migrations/202608120001_community.sql) to the target Supabase project. It creates all entities, transactional registration/counting functions, retry functions, retention scrubbing, RLS policies, and the restricted `community-images` bucket.

The migration intentionally grants no anonymous form-table inserts. Validated Server Actions use the server-only service role, and anonymous access is limited to published resources, events, People profiles, event sessions, and the public aggregate metric.

## Production feature gate

Set `NEXT_PUBLIC_COMMUNITY_FORMS_ENABLED=true` only after every readiness input is present:

- Supabase URL, publishable key, service role, and applied migration
- OpenAI API key
- Resend API key and a verified sending subdomain
- Administrator email allowlist
- External scheduling URL and official GitHub repository URL
- HMAC and cron secrets
- Approved Privacy Policy, Code of Conduct, and monitored contact address
- Approved People profiles with separate publication consent
- `COMMUNITY_LAUNCH_APPROVED=true` after the organizational approval checklist is complete

The server independently checks readiness; changing the public flag alone does not open a form. Community launch does not activate donations or fundraising.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js development |
| `npm run typecheck` | Run strict TypeScript checks |
| `npm run lint` | Run Oxlint |
| `npm test` | Run unit and component tests |
| `npm run test:e2e` | Run Playwright desktop/mobile flows |
| `npm run build` | Create the production Next.js build |

## Agent and privacy boundary

Contributor processing sends only reasons, contribution interests, related “Other” text, general location, and optional industry to OpenAI. It never sends email or professional links and never crawls them. Requests use `store: false`, a hashed `safety_identifier`, low reasoning, and a strict Zod output schema. Meetings are not recorded or transcribed and are never analyzed by the Agent.

Automatic rejection is limited to exact-evidence, high-confidence severe conduct. Administrators can restore the application, which disables the same automated closing path. OpenAI failure cannot roll back a registration, verification, count event, or manually reviewable record.

## Deployment operations

Submissions create durable Agent jobs without sending their content to OpenAI. After email verification where required, an administrator can explicitly start or retry an Agent review from the dashboard. Agent work never starts automatically from a public submission or a scheduled job. The daily Vercel cron is limited to retention cleanup and requires `CRON_SECRET`. In the dashboard, administrators can resend verification, restore automated rejections, export formula-safe CSV, record Core Contributor nominations, and publish only consented profiles.

Do not seed fabricated courses, events, people, projects, or member records. Public empty states are part of the intended first release.
