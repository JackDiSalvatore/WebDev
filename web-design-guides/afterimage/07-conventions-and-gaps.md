# 07 — Conventions & Gaps

Code conventions, the do/don't list, known inconsistencies with evidence, and checklists.

---

## 1. Code conventions

### File and component structure

```
components/<feature>/
  <Feature>Card.tsx            list item
  <Feature>Form.tsx            create/edit form
  index.ts                     barrel — always export through it
  <feature>-editor/
    <Feature>EditorContext.tsx state + handlers via context
    <Feature>EditorHeader.tsx  title, meta, actions
    tabs/                      one file per tab
    hooks/                     use-<feature>-data, -images, -generation
    types.ts
```

Editors use **context, not prop drilling**: `usePackEditorContext()` /
`useWardrobeEditorContext()`. Hooks own data fetching and mutations; tab components stay
presentational.

### Naming

| Kind | Convention | Example |
|---|---|---|
| shadcn primitives | kebab-case files, PascalCase exports | `confirm-dialog.tsx` → `ConfirmDialog` |
| Feature components | PascalCase files | `QuickShotCard.tsx` |
| Layout components | kebab-case files | `page-header.tsx` → `PageHeader` |
| Hooks | `use-*.ts` | `use-job-tracker.ts` |
| Helpers | kebab-case | `ui-helpers.ts`, `form-constants.ts` |

Both file-naming conventions coexist. Match the folder you're in.

### Styling rules

1. `cn()` for every conditional class — `clsx` + `tailwind-merge` means later classes win.
2. `cva` when a component has ≥3 style variants (`Button`, `Sheet`, `Label`).
3. Tokens only. No hex, no `rgb()`, no Tailwind palette colors.
4. `className` prop on every reusable component, merged last.
5. `forwardRef` on anything Radix might need to compose with.
6. `'use client'` wherever hooks/interaction appear (104 files) — the app is client-heavy;
   RSC is mostly the outer page shells.

### State

| Concern | Tool |
|---|---|
| Server data | TanStack Query — keys in `lib/query/query-keys.ts`, hooks in `lib/query/hooks.ts` |
| Job tracking | Zustand (`stores/job-store.ts`) + WebSocket |
| Auth / user | React context (`context/AuthProvider`, `context/UserProvider`) |
| Theme | React context (`components/theme/ThemeProvider`) |
| Form state | Local `useState` — no form library |
| Editor state | Feature context providers |
| Persistence | `localStorage` — `afterimage-theme`, `afterimage-sidebar-collapsed`, `afterimage:quickshot-settings`; `sessionStorage` — `afterimage:hero-refs` |

Provider order in `app/layout.tsx` is load-bearing:
`ThemeProvider → QueryProvider → AuthProvider → UserProvider → {children} + <Toaster />`.

---

## 2. Do / Don't

### Do

- Reach for an existing primitive before writing markup.
- Use `PageHeader` for every page title — it owns the `mb-6 md:mb-8` rhythm.
- Use `EmptyState` / `ErrorState` for empty and error surfaces.
- Route destructive actions through `ConfirmDialog`.
- Use `getStatusBadgeClasses()` for status pills and `formatDate()` for dates.
- Keep one primary CTA per view.
- Express hierarchy with surface + shadow + type, not borders.
- Give every async surface all four states: loading, empty, error, generating.
- Map raw backend enums to human copy at the component boundary.
- Persist user *preferences* (settings, collapse state), never user *content*.
- Verify both themes at `/theme-demo` after touching tokens.

### Don't

- Don't hardcode colors — no `text-green-500`, no `bg-blue-500`, no hex.
- Don't use bare `shadow-lg` / `shadow-sm` / `shadow-xl` — they're Tailwind defaults, not
  tokens. Use `shadow-soft-*`.
- Don't use `rounded-2xl` expecting it to be larger than `rounded-lg`. It isn't.
- Don't add gradients or glassmorphism outside `HeroSection`.
- Don't ship more than one primary button per view.
- Don't add a border to a `Card`.
- Don't hand-roll a button spinner — use `<Button loading>`.
- Don't animate anything that doesn't convey state.
- Don't check `status === 'generating'` alone — include `'draft'`.
- Don't add a UI dependency without checking for an existing primitive first.
- Don't use `next-themes` (installed but unused; the app has its own provider).

---

## 3. Known gaps

Each is verified against the code, with the evidence and a suggested fix.

### G1 — Light-mode primary contrast ❌ *ship-blocking for AA*

White on `hsl(175 70% 42%)` = **2.52:1**; `text-primary` on background = **2.37:1**. Affects
every default `Button`, selected chips, Stepper nodes, `ErrorState`'s Try Again.

*Fix:* darken light `--primary` to ~`hsl(175 85% 26%)`, or set light `--primary-foreground` to
a dark ink. One line in `globals.css` `:root`; `--ring` follows automatically. Full numbers in
[06 §1](./06-accessibility.md#1-contrast-audit).

### G2 — Non-token shadow classes

19 occurrences of bare `shadow-sm` / `shadow-lg` / `shadow-xl` / `shadow-2xl` outside
`globals.css`, resolving to Tailwind's hard black defaults rather than the soft-depth scale:

```
components/ui/sheet.tsx:34            shadow-xl    → shadow-soft-xl
components/ui/dropdown-menu.tsx:50    shadow-lg    → shadow-soft-lg
components/subject-selector.tsx:158   shadow-sm    → shadow-soft-sm
components/home/CharacterStoryCard.tsx:54  shadow-sm shadow-lg
components/home/HowItWorksSection.tsx:215  shadow-sm
components/home/BeforeAfterCompare.tsx:135 shadow-lg
components/home/HeroSection.tsx:85         shadow-2xl   (intentional — hero glass card)
components/quick-shots/QuickShotForm.tsx:452 shadow-lg  (hero submit button)
```

The two `ui/` cases are the ones that matter — they're primitives every feature inherits.

*Fix:* swap `ui/sheet.tsx` and `ui/dropdown-menu.tsx` to `shadow-soft-xl` / `shadow-soft-lg`.

### G3 — Raw palette colors in job UI

~36 occurrences of Tailwind palette classes that bypass the token system and don't respond to
the theme's accent swap. Concentrated in job/status UI:

```
JobProgress.tsx           text-blue-500 (processing) · text-green-500 (completed) · text-red-500 (failed)
ActiveJobsIndicator.tsx   bg-blue-500 count badge · text-green-500 wifi · text-red-500 errors
BuilderProgress.tsx       text-green-600 / text-amber-600
ui/sonner.tsx             text-emerald-500 / text-amber-500 toast icons (arguably fine — fixed semantics)
QuickShotCard.tsx         hover:bg-red-500/80 on the delete button
```

`ui-helpers.ts` already defines a tokenized status vocabulary; the job components predate or
ignore it.

*Fix:* extend `statusStyles` to cover job statuses (`pending`/`processing`/`completed`/
`failed`/`cancelled`) and consume it in `JobProgress` + `ActiveJobsIndicator`. Success green
has no token — either add `--success` or accept `emerald` as a deliberate semantic constant and
document it.

### G4 — Empty-state duplication

`app/(dashboard)/quick-shots/page.tsx` (and siblings) inline the `EmptyState` anatomy inside a
`Card` rather than importing the component — same icon well, same type scale, hand-copied. Two
implementations of one pattern will drift.

*Fix:* use `<EmptyState>` with a `children` CTA; if the `Card` wrapper is wanted, add a
`variant="card"` to the component.

### G5 — Microcopy drift

The spec says *"Avoid exclamation-heavy microcopy."* Live strings include
`'Quick Shot created!'`, `'Quick Shot deleted!'`, `'Character saved!'`. The job-system toasts
(`` `${label} complete` ``) follow the spec; the hand-written ones don't.

*Fix:* decide one way and normalize. (The job-system phrasing is the better model.)

### G6 — Dark-first is stated, light-first is implemented

The spec says "Dark mode is default." In practice `ThemeProvider` initializes `useState<ThemeMode>("light")`
and `getSystemPreference()` returns `"light"` during SSR. The pre-paint script in
`app/layout.tsx` does respect `prefers-color-scheme`, so a dark-preferring user sees dark
immediately — but a user with **no** system preference gets light, and the light theme is the
less-polished of the two (see G1).

*Fix:* if dark-first is the intent, default the fallbacks to `"dark"`. If light-first is the
intent, fix the spec — and G1 becomes urgent.

### G7 — Three hand-maintained nav lists

`sidebar.tsx`, `bottom-nav.tsx`, and `more-sheet.tsx` each hold an independent literal.

*Fix:* one `lib/navigation.ts` exporting `navGroups`, with `BottomNav` selecting a primary
subset.

### G8 — No form-field primitive

Validation is toast-only; no inline field errors, no `FormField`/`FormMessage`. The spec asks
for "helper text + error text with consistent spacing" and for errors that use "both color +
text." Character counters are hand-rolled per form.

*Fix:* add a small `FormField` (label + control + helper/error slot) before the next
multi-field form lands.

### G9 — Minor

- `QuickShotCard`'s retry logs `'Retry not yet implemented'` — `ErrorOverlay` renders a Retry
  button that does nothing.
- `RevealSection` contains an empty `useEffect` with only comments (dead code).
- `next-themes` and `@radix-ui/react-toast` are dependencies but unused (sonner handles toasts).
- The `reference_images` GCS bucket exists in Terraform but the app writes everything to the
  generated-images bucket.
- Button base is `gap-2`, yet most call sites still add `mr-2` to icons — double spacing.

---

## 4. Checklists

### New component

- [ ] Does a primitive already cover this?
- [ ] `forwardRef` + `className` prop merged with `cn()`.
- [ ] `cva` if ≥3 variants.
- [ ] Tokens only — no raw colors, no non-token shadows.
- [ ] Radius from the scale (`rounded-md` controls / `rounded-lg` surfaces).
- [ ] Focus ring present.
- [ ] Transitions 150–300ms `ease-out`.
- [ ] Loading / empty / error / generating states handled.
- [ ] Both themes checked.
- [ ] ≥44px touch target on coarse pointers.
- [ ] Exported through the folder barrel.

### New page

- [ ] Correct route group — `(dashboard)` for app, root for public.
- [ ] `p-4 md:p-6 lg:p-8 max-w-6xl mx-auto` (or `max-w-xl` for a single-column form).
- [ ] `PageHeader` with title, subtitle, and at most one primary action.
- [ ] Loading branch returns early with the header intact + skeletons.
- [ ] Both empty flavors (nothing yet / nothing matching).
- [ ] Mutations are optimistic with rollback + toast.
- [ ] Added to `middleware.ts` `protectedRoutes` if it needs auth.
- [ ] Added to all three nav lists if it's a destination.
- [ ] Mobile checked at 375px, desktop at 1440px.

### Token change

- [ ] Updated in **both** `:root` and `.dark`.
- [ ] Value is a bare HSL triplet.
- [ ] Exposed in `tooling/tailwind-config/tailwind.config.ts` if it needs a class.
- [ ] Contrast re-checked in both themes.
- [ ] `/theme-demo` reviewed.
- [ ] `pnpm typecheck && pnpm build` in `apps/web`.

---

## 5. Sources

| Path | What it is |
|---|---|
| `apps/web/app/globals.css` | Token + animation source of truth |
| `tooling/tailwind-config/tailwind.config.ts` | Token → class mapping |
| `apps/web/app/theme-demo/page.tsx` | Live showcase |
| `.claude/skills/afterimage-ui-design/spec.md` | Original design spec (intent) |
| `apps/web/prompts/frontend-ui-ux.txt` | Agent brief for UI work |
| `apps/web/docs/job-tracking-ui-spec.md` | Job-tracking UI spec |
| `apps/web/docs/pack-editor-refactor-recommendations.md` | Editor decomposition notes |

**Verify commands** (from `apps/web`): `pnpm typecheck` · `pnpm build` · `pnpm test:run` ·
`pnpm dev` then open `/theme-demo`.
