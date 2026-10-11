# ClearDesk

ClearDesk turns one desk photo into a prioritized organization plan and a generated decoration suggestion for the same desk. Users can choose a Minimalist, Cozy, or Productivity style before analysis. This repository is the hackathon-ready skeleton: a responsive upload experience, browser-side image preparation, a typed analysis API, deterministic scoring, and database-backed organization rules and visual style profiles.

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS
- OpenAI Responses API with image input and Structured Outputs, plus GPT Image editing
- Drizzle ORM with PostgreSQL
- Vercel-ready deployment

## Start locally

```bash
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `DEMO_MODE=true` returns a representative plan and sample decoration image without making an API call.

## Enable live analysis

Set these values in `.env.local`:

```bash
DEMO_MODE=false
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.5
```

The API key is only read by the server route. Live analysis scans the current environment, compares it with the selected Neon-backed visual profile, then edits the uploaded photo with `OPENAI_IMAGE_MODEL` (default: `gpt-image-2.5-sunburst`) to create a restrained decoration suggestion. Never prefix the key with `NEXT_PUBLIC_`.

## Connect PostgreSQL

Add `DATABASE_URL`, apply the migrations, and seed the three organization styles plus the universal rules:

```bash
npm run db:migrate
npm run db:seed
```

Until a database is connected and populated, the server uses the curated seed data in `src/db/rules.ts` and `src/db/styles.ts`. The `organization_rules.style_id` field is nullable: all current rules are universal, and later style-specific rules can reference one of the three records in `organization_styles` without changing the API contract.

## Key paths

- `src/components/desk-analyzer.tsx` — upload and results experience
- `src/lib/image.ts` — browser validation and resizing
- `src/lib/analysis.ts` — shared Zod schemas and deterministic score
- `src/app/api/analyze/route.ts` — OpenAI and rule-retrieval boundary
- `src/db/schema.ts` — PostgreSQL schema
- `src/db/rules.ts` — database query with seed fallback
- `src/db/styles.ts` — style lookup and seed records
- `src/lib/styles.ts` — shared Minimalist, Cozy, and Productivity definitions

## Change log

### 2026-10-10 — Style-aware decoration suggestions

- Switched image generation to `OPENAI_IMAGE_MODEL`, defaulting to `gpt-image-2.5-sunburst`.
- Removed the legacy `input_fidelity` image-edit parameter.
- Added structured environment scanning for existing objects, available zones, colors, lighting, and style matches or conflicts.
- Connected Neon `visual_profile` data directly to the generation prompt, including keywords, palette, materials, approved decorations, and addition limits.
- Added code-level enforcement so generated edits can only add approved Neon objects, capped at two or three additions depending on the selected style.
- Reframed generated images as realistic decoration suggestions that preserve the original desk and avoid unapproved objects.
- Updated the interface and documentation to use the new decoration-suggestion terminology.

## Before deploying

1. Add `OPENAI_API_KEY`, `OPENAI_MODEL`, and `DATABASE_URL` in Vercel.
2. Set `DEMO_MODE=false`.
3. Run `npm run lint`, `npm run typecheck`, and `npm run build`.
4. Add rate limiting before sharing the public URL broadly.
