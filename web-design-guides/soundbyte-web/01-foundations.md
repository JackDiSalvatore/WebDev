# 01 — Foundations

Tokens, color, type, space, radius, elevation.

---

## 1.1 Tailwind v4, CSS-first

There is no `tailwind.config.js`. `components.json` sets `tailwind.config: ""`
deliberately. All theme configuration lives in `src/app/globals.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  /* …one --color-* alias per semantic token… */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

`@theme inline` maps each raw CSS custom property (`--card`) to a Tailwind color
namespace entry (`--color-card`), which is what generates `bg-card`,
`text-card`, `border-card`, etc.

**Rule.** To add a design token, add it in three places, in this order:

1. `:root { --my-token: oklch(...) }`
2. `.dark { --my-token: oklch(...) }`
3. `@theme inline { --color-my-token: var(--my-token) }`

Skipping step 3 means the token exists but no utility class is generated for it.
Skipping step 2 means it will be wrong the day dark mode is switched on.

---

## 1.2 Color tokens

All tokens are authored in **OKLCH**. The base color is Tailwind's `neutral`
ramp, so the achromatic values map cleanly onto familiar Tailwind grays.

### Light (`:root`)

| Token | Value | ≈ Tailwind | Role |
| --- | --- | --- | --- |
| `--background` | `oklch(1 0 0)` | white | Page ground |
| `--foreground` | `oklch(0.145 0 0)` | neutral-950 | Body text |
| `--card` | `oklch(1 0 0)` | white | Card ground |
| `--card-foreground` | `oklch(0.145 0 0)` | neutral-950 | Card text |
| `--popover` | `oklch(1 0 0)` | white | Menus, dropdowns |
| `--popover-foreground` | `oklch(0.145 0 0)` | neutral-950 | Menu text |
| `--primary` | `oklch(0.205 0 0)` | neutral-900 | Primary fill |
| `--primary-foreground` | `oklch(0.985 0 0)` | neutral-50 | On primary |
| `--secondary` | `oklch(0.97 0 0)` | neutral-100 | Secondary fill |
| `--secondary-foreground` | `oklch(0.205 0 0)` | neutral-900 | On secondary |
| `--muted` | `oklch(0.97 0 0)` | neutral-100 | Muted fill |
| `--muted-foreground` | `oklch(0.556 0 0)` | neutral-500 | Secondary text |
| `--accent` | `oklch(0.97 0 0)` | neutral-100 | Hover fill |
| `--accent-foreground` | `oklch(0.205 0 0)` | neutral-900 | On accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` | red-600 | Danger |
| `--border` | `oklch(0.922 0 0)` | neutral-200 | Hairlines |
| `--input` | `oklch(0.922 0 0)` | neutral-200 | Field borders |
| `--ring` | `oklch(0.708 0 0)` | neutral-400 | Focus ring |

### Dark (`.dark`)

| Token | Value | ≈ Tailwind |
| --- | --- | --- |
| `--background` | `oklch(0.145 0 0)` | neutral-950 |
| `--foreground` | `oklch(0.985 0 0)` | neutral-50 |
| `--card` / `--popover` | `oklch(0.205 0 0)` | neutral-900 |
| `--primary` | `oklch(0.922 0 0)` | neutral-200 |
| `--primary-foreground` | `oklch(0.205 0 0)` | neutral-900 |
| `--secondary` / `--muted` / `--accent` | `oklch(0.269 0 0)` | neutral-800 |
| `--muted-foreground` | `oklch(0.708 0 0)` | neutral-400 |
| `--destructive` | `oklch(0.704 0.191 22.216)` | red-400 |
| `--border` | `oklch(1 0 0 / 10%)` | white @ 10% |
| `--input` | `oklch(1 0 0 / 15%)` | white @ 15% |
| `--ring` | `oklch(0.556 0 0)` | neutral-500 |

Note the dark theme switches borders from a solid gray to **translucent white**.
That is the correct choice for the glass-surface language — a solid border on a
`bg-card/60` panel reads as a seam; a translucent one reads as an edge.

### Chart & sidebar tokens

`--chart-1` … `--chart-5` and the eight `--sidebar-*` tokens are defined in both
themes but **are not used anywhere in the app**. They are shadcn scaffolding.
Leave them; they cost nothing and they are the right slots to fill when
analytics ("Advanced analytics" is a promised Pro feature) and a sidebar nav
arrive.

### ⚠ Drift: dark mode is defined but dormant

`.dark` is fully specified, `@custom-variant dark` is registered, and the
vendored shadcn primitives carry `dark:` variants (`button.tsx`, `input.tsx`,
`dropdown-menu.tsx`). But:

- Nothing ever adds the `.dark` class to `<html>` or `<body>`
  (`src/app/layout.tsx` renders `<html lang="en">` with no theme class).
- There is no theme provider, toggle, or `prefers-color-scheme` bridge.
- Every hand-written component uses light-only literals (`bg-white`,
  `text-gray-900`, `border-gray-200`).

So the theme would break the instant it were enabled. See
[07-consistency-audit.md](07-consistency-audit.md#a1-dark-mode-is-a-trap-door).

---

## 1.3 Brand color

**Observed.** The brand accent is **orange**, and it is never a token. It is
applied as literal Tailwind utilities across 9 files.

| Usage | Class |
| --- | --- |
| Primary CTA (marketing) | `bg-gradient-to-r from-orange-500 to-orange-600` |
| CTA hover | `hover:from-orange-600 hover:to-orange-700` |
| Transport play button | `bg-orange-500 hover:bg-orange-600` |
| Progress fill | `bg-orange-500` |
| Volume slider | `accent-orange-500` |
| "Playing" badge | `bg-orange-500 text-white` |
| Now-playing track title | `text-orange-600` |
| Track title hover | `hover:text-orange-500` |
| SoundCloud links | `text-orange-500 hover:underline` |
| Genre chip (track detail) | `bg-orange-500/20 text-orange-700` |
| Avatar ring | `ring-2 ring-primary/30` (neutral, not orange) |
| Avatar fallback (comment) | `bg-orange-500` |
| Background wash (marketing) | `rgba(249,115,22,0.08)` radial |

`rgba(249,115,22)` is `#f97316` — Tailwind `orange-500`. Consistent.

### ⚠ Drift: two competing "primary" colors

`--primary` is neutral-900 (near-black). The *actual* brand primary is orange.
And a third color — `blue-600` — acts as primary throughout the profile form:

| Surface | Primary action color | File |
| --- | --- | --- |
| Landing page CTA | orange gradient | `app/page.tsx:101` |
| Settings — connect provider | `bg-orange-500` | `(me)/settings/page.tsx:11` |
| Track detail — Play | `bg-orange-500` | `track-details.tsx:189` |
| Profile form — Save | `bg-blue-600` | `(me)/profile/page.tsx:383` |
| Social links — Add | `bg-blue-600` | `social-links-section.tsx:35` |
| Plan selection — selected | `border-blue-500 bg-blue-50` | `subscription-section.tsx:63` |
| Load More | `bg-primary` (neutral-900) | `tracks.tsx:44` |

Three different answers to "what color is the button you press."

**Rule.** Orange is the brand action color. Promote it to a token and use it:

```css
:root {
  --brand:            oklch(0.705 0.187 47.6);  /* ≈ #f97316 orange-500 */
  --brand-hover:      oklch(0.646 0.190 41.1);  /* ≈ #ea580c orange-600 */
  --brand-foreground: oklch(1 0 0);
  --brand-subtle:     oklch(0.954 0.038 75.2);  /* ≈ #ffedd5 orange-100 */
}
.dark {
  --brand:            oklch(0.705 0.187 47.6);
  --brand-hover:      oklch(0.75 0.17 52);
  --brand-foreground: oklch(0.145 0 0);
  --brand-subtle:     oklch(0.30 0.07 47);
}
@theme inline {
  --color-brand: var(--brand);
  --color-brand-hover: var(--brand-hover);
  --color-brand-foreground: var(--brand-foreground);
  --color-brand-subtle: var(--brand-subtle);
}
```

Then add a `brand` variant to `buttonVariants` and retire the blue.

---

## 1.4 Semantic status colors

**Observed**, as literal utilities:

| Meaning | Fill | Text | Border | Icon |
| --- | --- | --- | --- | --- |
| Success | `bg-green-50` / `bg-green-100` | `text-green-700` / `text-green-800` | `border-green-200` | `text-green-500` |
| Error | `bg-red-50` / `bg-red-100` | `text-red-700` / `text-red-800` | `border-red-200` | `text-red-600` |
| Destructive action | `bg-red-600 hover:bg-red-700` | `text-white` | — | — |
| Info / selection | `bg-blue-50` / `bg-blue-100` | `text-blue-600` | `border-blue-500` | `text-blue-600` |

⚠ The 50/700 and 100/800 pairs are used interchangeably —
`(me)/profile/page.tsx:309` uses 50/700, `(me)/settings/page.tsx:154` uses
100/800, for the same kind of banner.

**Rule.** Notification banners use the **50 / 700 / 200** triplet:

```tsx
// success
"rounded-md border border-green-200 bg-green-50 p-4 text-green-700"
// error
"rounded-md border border-red-200 bg-red-50 p-4 text-red-700"
```

### Engagement metric colors

These are semantic and *do* have a consistent, intentional mapping. Keep it.

| Metric | Color | Icon (lucide) |
| --- | --- | --- |
| Plays / listens | neutral (`text-gray-300`, or white on black pill) | `Headphones`, `Play` |
| Likes / favorites | **red** (`bg-red-500/90`, `text-red-400`) | `Heart` (filled) |
| Reposts | **green** (`bg-green-500/90`, `text-green-500`) | `Repeat` |
| Comments | **blue** (`bg-blue-500/90`, `text-blue-400`) | `MessageSquareText` |

Defined in `track.tsx:70-100` and `song-stats-bar.tsx`. This four-color
engagement palette is one of the strongest, most consistent parts of the system.

### Plan badge palette

`plan-badge.tsx` maps SoundCloud subscription tiers to gradients:

| Plan | Gradient | Icon | Glow | Ring |
| --- | --- | --- | --- | --- |
| Pro+ | `from-yellow-400 via-yellow-500 to-amber-600` | `Crown` | `shadow-yellow-500/30` | `ring-yellow-400/40` |
| Pro | `from-orange-500 to-red-500` | `Star` | `shadow-orange-500/25` | `ring-orange-400/30` |
| Go / Go+ | `from-blue-500 to-cyan-500` | `Zap` | `shadow-blue-500/25` | `ring-blue-400/30` |
| Free | `from-gray-400 to-gray-500` | none | `shadow-gray-500/20` | `ring-gray-400/30` |

The pattern — gradient fill + colored shadow at 20–30% + matching 1px ring —
is the app's "premium object" treatment. Reuse it for any tier or rank badge.

---

## 1.5 Typography

### Families

```tsx
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
```

Applied on `<body>` alongside `antialiased`. `--font-sans` and `--font-mono` are
aliased in `@theme inline`, so `font-sans` / `font-mono` resolve to Geist.

⚠ `font-mono` is never used. Geist Mono is loaded on every page for nothing.
Either use it (durations, BPM, key signature, IDs are natural candidates) or
drop the import.

### Scale in use

| Class | Size | Where |
| --- | --- | --- |
| `text-xs` | 12px | Stat pills, timestamps, tags, attribution, labels |
| `text-sm` | 14px | Body copy, form labels, card metadata, muted notes |
| `text-base` | 16px | Track card title, player track title |
| `text-lg` | 18px | Section headings, dialog title, stat values |
| `text-xl` | 20px | Form-section headings, settings page title |
| `text-2xl` | 24px | Profile display name, plan price |
| `text-3xl` | 30px | Page title, marketing section heading |
| `text-4xl` | 36px | Marketing H1/H2, track detail title |
| `text-5xl` | 48px | Marketing H2 (md+), track detail title (lg+) |
| `text-6xl` | 60px | Marketing headline (md+) |

### Weights

`font-medium` (500) · `font-semibold` (600) · `font-bold` (700) ·
`font-extrabold` (800, only in `footer.tsx`, which is a placeholder).

### ⚠ Drift: no fixed heading ladder

The same semantic level renders at different sizes depending on the file:

| Level | Values found |
| --- | --- |
| Page title | `text-3xl font-bold` (profile), `text-xl font-semibold` (settings), `text-4xl lg:text-5xl font-bold` (track detail) |
| Section heading | `text-lg font-semibold` (tracks, comments, playlists), `text-xl font-semibold` (all form sections, track-detail "About") |
| Card title | `text-base font-semibold` (track), `text-sm font-semibold` (comment, playlist) |

**Rule.** Fix the ladder at:

```
Display   text-4xl md:text-6xl font-bold leading-tight    marketing hero only
Page      text-3xl font-bold                              one per route
Section   text-lg font-semibold mb-4                      groups of cards
Card      text-base font-semibold leading-tight           primary card object
Subcard   text-sm font-semibold                           dense list rows
Body      text-sm leading-relaxed
Meta      text-xs text-muted-foreground
```

### Text treatment idioms

Consistently applied, keep them:

- `truncate` on single-line names that can overflow (`profile.tsx:51`,
  `soundcloud-player.tsx:304`)
- `line-clamp-2` on card titles, `line-clamp-3` on bios and descriptions
- `whitespace-pre-wrap break-words` on user-authored text (bios, comments,
  descriptions) — preserves the line breaks artists actually type
- `leading-tight` on headlines, `leading-relaxed` on paragraphs
- `text-balance` on centered headings (`footer.tsx`, `tooltip.tsx`)
- Truncating in JS with `.slice(0, 20)` in `soundcloud-player.tsx:305,309` —
  ⚠ replace with CSS `truncate`; the slice cuts mid-word and lies about length.

---

## 1.6 Spacing

Standard Tailwind 4px scale. Observed rhythm:

| Token | Use |
| --- | --- |
| `gap-1` / `gap-1.5` | Icon-to-number inside a stat pill |
| `gap-2` / `space-x-2` | Icon-to-label, tight inline pairs |
| `gap-3` | Avatar-to-text, form rows, button groups |
| `gap-4` | Grid gutters, card stacks, dialog internals |
| `gap-6` | Profile avatar-to-body, player sections |
| `gap-8` | Marketing grids, form section stack |
| `space-y-2` | Feature bullet lists |
| `space-y-3` | Form field groups, detail rows |
| `space-y-4` | Form fields within a section |
| `space-y-8` | Top-level form section stack |
| `mt-6` | Gap between stacked page sections |
| `m-8` | Product route page margin |
| `p-2` | Header / player rail padding |
| `p-3` | Track card body |
| `p-4` | Dense card (comment) |
| `p-6` | Standard card (glass, form section) |
| `p-8` | Marketing card, track detail panel |
| `p-12` | Marketing CTA block |

**Rule.** Card padding is `p-6`. Drop to `p-4` only for dense list rows, rise to
`p-8` only on marketing surfaces. Vertical section separation is `mt-6` inside a
page, `space-y-8` inside a form.

---

## 1.7 Radii

`--radius: 0.625rem` (10px). The derived scale:

| Class | Computed | Where used |
| --- | --- | --- |
| `rounded-xs` | 2px | Dialog close button |
| `rounded-sm` | 6px | Dropdown items, sign-in dialog |
| `rounded-md` | 8px | **Buttons, inputs, banners, form controls** |
| `rounded-lg` | 10px | Dialog content, comment card, form section card, Load More |
| `rounded-xl` | 14px | **Glass cards, artwork, marketing icon tiles, CTA button** |
| `rounded-2xl` | 16px | Marketing feature card, track detail panel |
| `rounded-3xl` | 24px | Track card |
| `rounded-full` | ∞ | Avatars, stat pills, transport buttons, tags, badges |

Note `rounded-2xl` and `rounded-3xl` are **not** theme-derived — they resolve to
Tailwind's stock 16px/24px, not `calc(var(--radius) + n)`. So changing
`--radius` moves five of the eight steps and leaves three behind.

### ⚠ Drift: eight radii is too many

Three of them (`lg`, `2xl`, `3xl`) do the same job — "this is a card" — on
different screens.

**Rule.** Three radii, plus `full`:

```
rounded-md    controls: buttons, inputs, selects, banners
rounded-xl    surfaces: every card, panel, artwork frame, dialog
rounded-full  objects: avatars, pills, badges, transport buttons
```

Keep `rounded-3xl` on the track card only if you consider the softer corner part
of the artwork treatment — it *does* read distinctly, and it is the app's most
photographed component. That is a defensible exception; document it if you keep
it.

---

## 1.8 Elevation

**Observed.** The full Tailwind shadow scale is in play, roughly by surface
weight:

| Shadow | Where |
| --- | --- |
| `shadow-xs` | shadcn buttons and inputs (built into the variants) |
| `shadow-sm` | Track card at rest, comment card |
| `shadow` | Playlist card, Load More button |
| `shadow-md` | Comment card on hover, dropdown content |
| `shadow-lg` | Glass profile card, dialog, marketing card, plan badge, search results, marketing logo tile |
| `shadow-xl` | Marketing card on hover, benefits panel, plan badge on hover, player play button |
| `shadow-2xl` | Track card on hover, track detail panel, track detail artwork |

**Rule.** Two-step elevation, tied to interactivity:

```
Resting card      shadow-sm
Interactive hover shadow-lg          (from shadow-sm)
Floating layer    shadow-lg          (dialogs, dropdowns, popovers)
Hero object       shadow-2xl         (track-detail artwork only)
```

The jump from `shadow-sm` to `shadow-2xl` on the track card
(`track.tsx:39`) is a four-step leap and reads as a pop rather than a lift.
`shadow-sm → shadow-lg` gives the same affordance with less noise.

---

## 1.9 Translucency and blur

This is the app's most distinctive surface treatment. Catalogue:

| Class | Where | Purpose |
| --- | --- | --- |
| `bg-card/60 backdrop-blur-md` | Profile, playlists, all empty states | Content panel |
| `bg-background/90 backdrop-blur` | Fixed header | Chrome over scrolling content |
| `bg-background/95 backdrop-blur` | Fixed player | Chrome over scrolling content |
| `bg-white/80 backdrop-blur-sm` | Track card | Content panel (light-only) |
| `bg-white/95 backdrop-blur-sm` | Track card play button | Floating control on artwork |
| `bg-black/50 backdrop-blur-sm` | Track card play-count pill | Legible label on artwork |
| `bg-{color}-500/90 backdrop-blur-sm` | Track card stat pills | Colored label on artwork |
| `bg-black/50` | Dialog overlay | Scrim |
| `bg-black/40` | Track detail artwork hover | Scrim |
| `blur-xl scale-110 opacity-30` | Track detail background | Artwork bloom |

**Rule.** Chrome (fixed header, fixed player) uses `bg-background/90–95` +
`backdrop-blur`. Content panels use `bg-card/60 backdrop-blur-md`. Labels
sitting on top of imagery use `bg-<color>/90 backdrop-blur-sm` so the text stays
legible over any artwork.

⚠ `track.tsx:39` uses `bg-white/80` instead of `bg-card/60`, which is why the
track card — the app's centerpiece — is the one component that would not survive
a dark-mode switch.

---

## 1.10 Custom keyframes

`globals.css` defines exactly one custom animation:

```css
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}
.marquee { overflow: hidden; white-space: nowrap; position: relative; }
.marquee span {
  display: inline-block;
  animation: marquee 10s linear infinite;
  animation-delay: 2s;
}
```

Intended for scrolling long track titles in the player. **It is not referenced
by any component** — the player uses `.slice(0, 20)` instead. Either wire
`.marquee` into `soundcloud-player.tsx` (better: it preserves the full title) or
delete the rule.

If you wire it up, gate it behind `prefers-reduced-motion` and only run it when
the text actually overflows — an infinitely scrolling title next to a play
button is a vestibular hazard.

---

## 1.11 Base layer

```css
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

Every element defaults to the border token, so `border` / `border-b-2` alone
produces the right color without specifying one. This is why the app shell can
write `border-b-2` with no color class and still be theme-correct — a pattern
worth preserving.
</content>
