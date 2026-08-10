# 07 — Consistency Audit

Every drift found in `apps/soundbyte-web/`, ranked by cost to fix later.

Severity is about **how expensive this gets if you build ten more screens on top
of it**, not how broken it looks today.

---

## A — Structural (fix before adding screens)

### A1. Dark mode is a trap door

`.dark` is fully specified in `globals.css:81-113`. `@custom-variant dark` is
registered. The vendored shadcn primitives carry `dark:` variants. But no code
ever applies the class, and every hand-written component uses light-only
literals.

**Blast radius.** Turning dark mode on today breaks: `track.tsx` (`bg-white/80`,
`text-gray-900`, `text-gray-600`, `from-gray-50 to-gray-100`), `comment.tsx`
(`bg-white`, `border-gray-200`, `text-gray-800`), all five
`soundbyte-profile/*` files, `track-details.tsx` (~40 gray literals),
`soundcloud-player.tsx` (`bg-gray-200`, `text-gray-900`), `search-input.tsx`
(`bg-white`), `app/page.tsx` (entirely light).

**Decision required.** Either:

- **(a) Commit to dark mode.** Add `next-themes`, a toggle, and convert every
  literal to a token. ~1–2 days across 15 files.
- **(b) Commit to light-only.** Delete the `.dark` block and the
  `@custom-variant`, and document light-only as the decision.

Option (b) is a legitimate choice and costs an hour. What is not viable is
leaving it as-is — the tokens create the *appearance* of theme support, so new
code gets written both ways.

Given the product (a music app, competing against uniformly dark players) and
that half the token layer already exists, **(a) is the better call** — but do it
now, not after ten more screens.

### A2. Three colors act as "primary"

| Register | Primary action | Files |
| --- | --- | --- |
| Marketing / player / track detail / settings | **orange-500** | 6 files |
| Profile form / social links / plan selection | **blue-600** | 3 files |
| Load More buttons | **`bg-primary`** (neutral-900) | 2 files |

A user who signs up via an orange CTA, connects SoundCloud with an orange
button, then hits a blue Save button on the very next screen, is looking at two
different products.

**Fix.** Promote orange to `--brand` (see
[01](01-foundations.md#13-brand-color)), add `brand` and `brandGradient`
variants to `buttonVariants`, and replace every blue action. `bg-primary` on
Load More becomes `variant="secondary"`.

Effort: ~2 hours. Do it with A1 so you only touch each file once.

### A3. The design system is bypassed more often than used

| Primitive | Times used | Times hand-rolled |
| --- | --- | --- |
| `Button` | 4 (3 fully overridden) | 14 raw `<button>` |
| `Input` | 1 | 6 raw `<input>` |
| `Label` | 0 | 8 raw `<label>` |
| `Dialog` | 1 (partially, via direct Radix imports) | 1 full custom modal |
| `Avatar` | 3 | 3 raw `<img>` |
| Tooltip | 0 via `ui/` | 1 via direct Radix import |

**Fix.** Two moves: (1) add the missing variants so the primitives can actually
express what the app needs (see [03](03-components.md#32-button)); (2) add the
missing primitives (`Select`, `Checkbox`, `RadioGroup`, `Badge`, `Card`,
`Skeleton`, `Alert`, `Separator`, `Command`, `Slider`). Then a codemod pass
replacing raw elements.

Until (1) happens, developers will keep bypassing the primitives, correctly,
because the primitives can't do the job.

### A4. Three surface dialects

| Dialect | Class | Files |
| --- | --- | --- |
| Glass (token-driven) | `bg-card/60 backdrop-blur-md border border-border rounded-xl p-6` | `profile`, `tracks`, `comments`, `playlists` |
| Flat white (literal) | `bg-white rounded-lg border border-gray-200 p-6` | all `soundbyte-profile/*`, `comment` |
| Marketing white | `bg-white rounded-2xl shadow-lg border border-gray-200 p-8` | `app/page.tsx` |

**Fix.** One `<Card>` primitive with the glass treatment as default and a
`variant="solid"` for forms. Marketing keeps its own, because it *should* look
different.

---

## B — Systemic (fix opportunistically)

### B1. Eight radii

`rounded-xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full` are all in use, and
`lg`/`2xl`/`3xl` all mean "card." Also `rounded` (4px, off-scale) in
`search-input.tsx:44`.

**Fix.** Collapse to `md` (controls) / `xl` (surfaces) / `full` (objects). Keep
`3xl` on the track card only if you decide the softer corner is part of the
artwork identity — and if so, write that down.

### B2. Six shadows, arbitrary pairings

`shadow-xs` through `shadow-2xl`, with the track card jumping `sm → 2xl` on
hover.

**Fix.** `shadow-sm` at rest → `shadow-lg` on hover; `shadow-lg` for floating
layers; `shadow-2xl` reserved for the track-detail hero artwork.

### B3. No heading ladder

Page titles render at `text-xl`, `text-3xl`, and `text-4xl lg:text-5xl` on
different routes. Section headings at `text-lg` and `text-xl`. Card titles at
`text-sm` and `text-base`.

**Fix.** Adopt the ladder in
[01](01-foundations.md#-drift-no-fixed-heading-ladder) and, ideally, express it
as component-level defaults (`<PageTitle>`, `<SectionTitle>`) rather than
per-call-site classes.

### B4. Duplicated formatters

`formatCount` × 3 (identical), `formatTime` × 3 (two identical, one with a
different unit and the same name), `formatDate` × 2 (different behaviors), the
artwork `.replace()` × 5.

**Fix.** `src/lib/format.ts`. See [05](05-content-and-state.md). ~30 minutes,
and it eliminates a real unit-confusion bug class.

### B5. Duplicated markup

- The empty-state block appears verbatim in 4 files.
- The Load More block appears in 2 files (plus commented out in a 3rd).
- The `<section className="max-w-7xl mx-auto mt-6">` + `<h3>` + grid shell
  appears in 3 files.
- The green/red banner appears in 2 files with different shades.

**Fix.** `<EmptyState>`, `<LoadMoreButton>`, `<Collection>`, `<Banner>`.

### B6. Responsive gaps

| Grid | Problem |
| --- | --- |
| Tracks `1 → sm:3 → lg:6` | Skips `md:`; 6 columns at 1024px is ~160px per card |
| Profile stats `grid-cols-4` | No responsive variant; 4 columns at 375px |
| Marketing stats `grid-cols-3` | No responsive variant |
| Page margin `m-8` | Flat 32px at 375px |

**Fix.** See [02](02-layout.md#25-grids).

### B7. Magic layout numbers

`pt-[64px] pb-[120px]` guess at rail heights that are actually content-derived,
and the player's 120px is reserved even when no player is mounted.

**Fix.** CSS custom properties for the rail heights; conditional bottom padding.

### B8. z-index has one value

Header, player, dialog overlay, dialog content, dropdown, and tooltip all sit at
`z-50`. The search dropdown sits at `z-10` and survives only by inheriting the
header's stacking context.

**Fix.** The five-tier scale in [02](02-layout.md#26-stacking-z-index).

---

## C — Defects (fix now, each is small)

| # | Issue | File:line | Fix |
| --- | --- | --- | --- |
| C1 | Tooltip is white text on light gray — invisible | `profile.tsx:63` | Use `<TooltipContent>` from `@/components/ui/tooltip`, drop the override |
| C2 | `fullName[0][0]` crashes on an empty name | `user-dropdown-menu.tsx:29` | `name.trim()[0]?.toUpperCase() ?? "?"` |
| C3 | `track.license.split("-")` throws on null | `track-details.tsx:331` | Optional chain + fallback |
| C4 | `bg-primary text-white` inverts wrong in dark | `tracks.tsx:44`, `comments.tsx:44` | `text-primary-foreground` |
| C5 | Referenced images don't exist | `track-details.tsx:103,138` | `/placeholder-artwork.jpg`, `/placeholder-avatar.jpg` are absent from `public/` |
| C6 | `bg-opacity-50` deprecated in Tailwind v4 | `delete-confirm-modal.tsx:38` | `bg-black/50` |
| C7 | `align-items-center` is not a class | `track-search-result.tsx:20` | `items-center` |
| C8 | `cursor-pointe` typo | `soundcloud-player.tsx:382` | `cursor-pointer` |
| C9 | Hooks called after early `return` | `tracks/[id]/page.tsx:25`, `library/page.tsx:20`, `(me)/layout.tsx:20` | Move `if (!x) return` below all hook calls — this violates the Rules of Hooks and will throw |
| C10 | `useEffect` with `[]` deps reading `userId`/`providerTrackId` | `tracks/[id]/page.tsx:37` | Add the deps |
| C11 | `.slice(0, 20)` truncation on titles | `soundcloud-player.tsx:305,309` | `truncate` class, or wire up `.marquee` |
| C12 | `.marquee` CSS defined, never used | `globals.css:124-148` | Wire into the player or delete |
| C13 | Playlists Load More commented out | `playlists.tsx:94-104` | Restore — playlists silently cap at 25 |
| C14 | `SongStatsBar` commented out of the track card | `track.tsx:139-145` | Restore; it is the touch-device fallback for hover-only stats |
| C15 | `alt="@shadcn"` and a github.com avatar fallback | `user-dropdown-menu.tsx:20,28` | Local placeholder + real alt |
| C16 | `"App description goes here"` ships as meta description | `app/layout.tsx:19` | Real metadata + title template |
| C17 | `"My App"` is the brand lockup | `header.tsx:19` | "SoundByte" + the `Music` icon lockup from `app/page.tsx:66` |
| C18 | Footer renders the word "Footer" | `footer.tsx` | Delete the component or build it |
| C19 | Unused `import` / vars (`isPending`, `Player`, `axios`, `env`, `Track` in playlists, several lucide icons) | multiple | Clean up |
| C20 | `@tabler/icons-react` installed, zero imports | `package.json:21` | Remove the dependency |
| C21 | Geist Mono loaded, `font-mono` never used | `app/layout.tsx:12` | Use it (durations, BPM, key) or drop it |
| C22 | `framer-motion` imported but `motion` is the installed package | `app/page.tsx:7` | `import { motion } from "motion/react"` |
| C23 | `console.log` of streaming credentials | `(me)/layout.tsx:27-28` | Remove — that is an access token in the browser console |
| C24 | `type SearchInputProps = {}` empty type | `search-input.tsx:7` | Delete |
| C25 | CTA excluded from the stagger sequence | `app/page.tsx:94` | Add `variants={itemVariants}` |
| C26 | Trailing colon in collection headings | `tracks.tsx:31`, `comments.tsx:31` | Remove; `playlists.tsx` already omits it |
| C27 | Empty-state copy capitalization is inconsistent | 4 files | "No tracks found." / "No comments yet." — pick one form |
| C28 | Social links keyed by array index | `social-links-section.tsx:43` | Stable id per row |
| C29 | Success banner never auto-dismisses on the profile page | `profile/page.tsx:305` | Match settings' 5s timeout, or use `sonner` |
| C30 | Inert heart button with no label or handler | `comment.tsx:114` | Wire it up or remove it |

---

## D — Suggested sequence

Each phase is independently shippable.

**Phase 1 — stop the bleeding (½ day)**
C1–C10 (the crashes and the invisible tooltip), C23 (token logging).
Then decide A1 and write the decision down.

**Phase 2 — the token layer (1 day)**
A2 brand token + Button variants. Convert all literal `bg-white` /
`text-gray-*` to tokens (this is also most of A1 option (a)). B1 radii, B2
shadows.

**Phase 3 — the primitive layer (1–2 days)**
`npx shadcn@latest add select checkbox radio-group textarea badge card skeleton alert separator command slider sonner`.
Rewrite `soundbyte-profile/*` on the primitives. A3, A4.

**Phase 4 — extraction (½ day)**
B4 formatters, B5 shared components (`EmptyState`, `LoadMoreButton`,
`Collection`, `Banner`, `Card`, `Stat`).

**Phase 5 — accessibility (1 day)**
[06](06-accessibility.md) end to end: focus rings, `<main>` semantics, the
progress slider, the search combobox, `aria-label`s, live regions, reduced
motion, the skip link.

**Phase 6 — polish (½ day)**
B3 heading ladder, B6 responsive grids, B7 layout variables, B8 z-scale, loading
skeletons, real metadata and brand lockup.

---

## E — What to protect

When refactoring, do not lose these. They are the good parts:

1. **The engagement color mapping** — red likes, green reposts, blue comments,
   neutral plays. Consistent across three components and instantly legible.
2. **The artwork bloom** on the track detail page (`blur-xl scale-110
   opacity-30` behind a white scrim). Distinctive and cheap.
3. **The glass surface** `bg-card/60 backdrop-blur-md` over a fixed
   `bg-background/90 backdrop-blur` header. This is the app's visual signature.
4. **The `PlanBadge` config-map pattern** — gradient + colored glow + matching
   ring, driven by a single switch.
5. **The `Stat` sub-component** — value over label in a `bg-background/40` well.
6. **The delete confirmation interaction** — type `DELETE`, with an enumerated
   list of what will be destroyed.
7. **The collection component contract** — `{ items, title, hasMore, isLoading,
   onLoadMore }`, with the component owning its own empty state and grid.
8. **`text-base md:text-sm` on inputs** — prevents iOS zoom.
9. **`flex-col-reverse sm:flex-row` on dialog footers** — primary action on top
   on mobile.
10. **The SoundCloud attribution row** in the player. Required, and tastefully
    done.
</content>
