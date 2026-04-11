# Historiart — Claude Code Guide

## Project overview
Historiart is a Vietnamese history ebook platform with inline multimedia. Users read
historical books and encounter contextual media (images, documentary films, music,
annotations) that auto-trigger as they scroll through relevant passages. Chapter quizzes
reinforce learning after each section.

Target audience: Vietnamese students aged 12–18 (THCS–THPT).

## Architecture

### Stack
- **Framework**: Next.js (App Router) + TypeScript — read `node_modules/next/dist/docs/`
  before writing any Next.js code. APIs and conventions may differ from training data.
- **Database**: Drizzle ORM — schema in `src/drizzle/schema.ts`, config in `drizzle.config.ts`
- **Auth**: Better Auth — client in `src/lib/auth-client.ts`, server in `src/lib/auth.ts`
- **UI**: shadcn/ui components in `src/components/ui/` + custom CSS variables
- **Styling**: Tailwind + CSS variables defined in `src/app/globals.css` — never hardcode
  colors, always use the variable system
- **Animation**: Framer Motion for page/component transitions, GSAP for scroll-based effects
- **State**: React Query (`src/context/QueryProvider.tsx`) for server state, React hooks for
  local state
- **AI**: Vercel AI SDK — used in `/api/quiz` for generating quiz questions when DB is empty

### Key directories
```
src/
├── app/                          # Next.js App Router pages and API routes
│   ├── api/                      # API route handlers
│   ├── library/                  # Book listing page
│   ├── read/[bookId]/            # Reader page shell
│   └── ...
├── features/
│   └── read/[bookId]/            # All reader logic lives here
│       ├── components/           # Reader UI components
│       ├── hooks/                # useReaderController.ts and other hooks
│       ├── helpers.ts
│       └── types.ts
├── drizzle/                      # DB schema, migrations, relations
├── lib/                          # Shared utilities and integrations
├── components/                   # Shared UI components (Navbar, TransitionLink, etc.)
│   └── ui/                       # shadcn/ui primitives
└── context/                      # React context providers
```

### Reader architecture
The reader is built around `src/features/read/[bookId]/`:
- `ReaderFeature.tsx` — top-level feature component, orchestrates all sub-components
- `hooks/useReaderController.ts` — central state: current chapter, active annotations,
  scroll position, quiz visibility
- `components/ReaderContent.tsx` — renders book text, wraps trigger passages in
  `<span data-passage-id="...">` for the IntersectionObserver
- `components/MediaPanel.tsx` — right sidebar showing contextual media for passages in view
- `components/QuizPanel.tsx` — shown after last passage of a chapter, one question at a time
- `components/HighlightsSidebar.tsx` — left sidebar for user highlights and notes
- `components/ReaderNavigation.tsx` — chapter nav, progress bar, font controls

### Multimedia annotation system
Annotations are stored in the `mediaAnnotations` table and also seeded via
`src/lib/seed-annotations.ts` for demo content.

Annotation types:
- `image` — renders `<img>` with caption in MediaPanel
- `video` — renders YouTube iframe using `youtube-nocookie.com` domain
- `audio` — renders `<audio controls>` with caption
- `annotation` — renders a styled blockquote with optional source link

Scroll trigger flow:
1. `ReaderContent` renders passages with `data-passage-id` attributes
2. `useReaderController` runs an IntersectionObserver (threshold: 0.5)
3. On intersection, looks up annotations for that passage ID
4. Updates `activeAnnotations` state
5. `MediaPanel` re-renders with the new media cards

## Database

### Migrations
Always use Drizzle migrations — never edit the DB directly.
```bash
npm run db:generate   # generate migration from schema changes
npm run db:migrate    # apply migrations
npm run db:studio     # open Drizzle Studio
```

### Schema rules
- All new tables go in `src/drizzle/schema.ts`
- All relations go in `src/drizzle/relations.ts`
- Use `uuid('id').primaryKey().defaultRandom()` for primary keys
- Use `timestamp('created_at').defaultNow()` for timestamps

## API routes

### Conventions
- All routes use the Next.js App Router `route.ts` convention
- Auth check at the top of every protected route using `src/dal/verifySession.ts`
- Return `NextResponse.json()` with appropriate status codes
- Wrap DB calls in try/catch, return `{ error: string }` on failure

### Existing routes (do not remove)
- `POST /api/auth/[...all]` — Better Auth handler, do not touch
- `GET /api/books` — returns all books
- `GET /api/books/[bookId]/pages` — returns paginated chapter content
- `GET/POST /api/books/favorites` — user favorites
- `GET /api/profile` — user profile
- `POST /api/upload` — book upload

### Historiart-specific routes
- `GET /api/media/[bookId]` — returns all mediaAnnotations for a book
- `GET /api/quiz/[bookId]/[chapterId]` — returns quiz questions; generates via AI if none
  exist in DB, then caches them

## Content and language

### Vietnamese-first UI
All user-facing text is in Vietnamese. Do not write English UI strings.
Use English only for: code identifiers, comments, console logs, error messages in the API.

### Book data
Books are seeded in `src/lib/sample-books.ts`. The three launch books are:
- "An Tư" — Nguyễn Huy Tưởng — era: "Chống Mông Nguyên"
- "Điện Biên Phủ — Điểm hẹn lịch sử" — Võ Nguyên Giáp — era: "Kháng Pháp"  
- "Đại thắng mùa Xuân 1975" — nhiều tác giả — era: "Kháng Mỹ"

### Seed annotations
Demo annotations are in `src/lib/seed-annotations.ts`. These are the primary content
for the demo — keep them accurate and sourced.

## Styling rules

### CSS variables (defined in globals.css)
Never hardcode colors. Always use the existing variable system:
- `--accent-primary`, `--accent-secondary`, `--accent-glow`, `--accent-gradient`
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-card`
- `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-accent`
- `--border-subtle`
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full`
- `--font-serif`, `--font-mono`

### Component patterns
- Use `className="glass"` for frosted-glass card surfaces
- Use `className="glass-hover"` to add hover lift effect
- Use `className="btn-primary"` and `className="btn-ghost"` for buttons
- Use `className="gradient-text"` for accent heading spans
- shadcn/ui components for all form elements, dialogs, dropdowns

### Animations
- Page transitions: use `TransitionLink` from `src/components/TransitionLink.tsx` for
  all internal navigation — never use plain `<a>` or Next.js `<Link>` directly
- Entry animations: `framer-motion` with `initial={{ opacity: 0, y: 30 }}` pattern
- Scroll-reveal: use `whileInView` with `viewport={{ once: true }}`
- Do not add new animation libraries

## What not to touch

- `src/lib/auth.ts` and `src/lib/auth-client.ts` — Better Auth config
- `src/context/AuthContext.tsx` and `src/context/OnboardingGuard.tsx`
- `src/app/api/auth/[...all]/route.ts`
- `src/app/globals.css` variable definitions — only append, never overwrite
- `src/components/TransitionLink.tsx`
- `tsconfig.json`, `eslint.config.mjs`, `drizzle.config.ts`

## Development workflow

```bash
npm run dev          # start dev server
npm run build        # production build — run after every phase to verify
npm run lint         # ESLint
npm run db:generate  # generate Drizzle migration
npm run db:migrate   # apply migration
```

Always run `npm run build` before marking a task complete. A passing lint is not enough —
the build must succeed with zero TypeScript errors.

## YouTube embedding
Videos use `youtube-nocookie.com` for privacy. Always embed as:
```tsx
<iframe
  src={`https://www.youtube-nocookie.com/embed/${videoId}`}
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
  allowFullScreen
  style={{ width: "100%", aspectRatio: "16/9", border: "none", borderRadius: "var(--radius-md)" }}
/>
```
The `youtube-nocookie.com` domain must be in `next.config.ts` frame allow list.

## Common mistakes to avoid
- Do not use `<Link>` from Next.js directly — always use `TransitionLink`
- Do not fetch data in client components — use React Query hooks or server components
- Do not create new CSS files for one-off styles — use CSS modules (`.module.css`) for
  component-scoped styles or add to `globals.css` for global patterns
- Do not install new packages without checking if the functionality already exists in the
  current dependencies
- Do not translate existing English variable/function names to Vietnamese — keep code
  identifiers in English
  