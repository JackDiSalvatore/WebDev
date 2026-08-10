# 01 — Foundations

Tokens, theming, shape, elevation, spacing, and type.

**Files that own this layer**

| File | Owns |
|---|---|
| `apps/web/app/globals.css` | All CSS variables, both themes, base element styles, component/utility layers, keyframes |
| `tooling/tailwind-config/tailwind.config.ts` | Maps CSS variables → Tailwind class names |
| `apps/web/tailwind.config.ts` | Thin wrapper: spreads the shared config, sets `content` globs |
| `apps/web/components.json` | shadcn/ui generator config (`cssVariables: true`, `baseColor: slate`) |

> **Rule:** never introduce a raw color, shadow, or radius in a component. If you need a new
> value, add a token in `globals.css` (both themes) and expose it in the shared Tailwind config.

---

## 1. Color

### 1.1 Brand palette

Declared as a comment block at the top of `globals.css`. These are the *source* hues; the
runtime tokens below are tuned derivatives, not literal copies.

| Name | HSL | Role |
|---|---|---|
| Obsidian Black | `240 10% 5%` | Dark ground, primary-foreground in dark |
| Soft Porcelain | `45 20% 96%` | Light ground, foreground in dark |
| Chrome Silver | `228 8% 81%` | Neutral mid |
| Ash Graphite | `225 10% 25%` | Neutral deep |
| Vivid Orchid | `286 100% 68%` | Dark-mode accent |
| Neon Cyan | `175 86% 58%` | Light-mode accent |
| Warm Amber | `38 92% 50%` | Secondary accent — warnings, "pro" moments |

### 1.2 Token format

Every color token stores a **bare HSL triplet**, not a color function:

```css
--primary: 286 100% 72%;
```

Tailwind wraps it: `primary: "hsl(var(--primary))"`. This is what makes opacity modifiers
work — `bg-primary/10`, `text-destructive/80`, `hsl(var(--primary) / 0.15)` in raw CSS.

**Consequence:** you cannot write `--primary: #c084fc`. It must stay a triplet.

### 1.3 Full token table

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--background` | `45 20% 97%` | `240 12% 6%` | Page ground |
| `--foreground` | `240 10% 10%` | `45 15% 95%` | Primary text |
| `--surface-1` | `0 0% 100%` | `240 10% 8%` | Input fields, preview panel |
| `--surface-2` | `45 15% 98%` | `240 10% 10%` | Chips at rest |
| `--surface-3` | `45 10% 95%` | `240 10% 12%` | Chip hover |
| `--card` | `0 0% 100%` | `240 10% 9%` | Cards, dialogs, sheets, sidebar, bottom nav |
| `--card-foreground` | `240 10% 10%` | `45 15% 95%` | Text on cards |
| `--popover` | `0 0% 100%` | `240 10% 10%` | Select/dropdown panels |
| `--popover-foreground` | `240 10% 10%` | `45 15% 95%` | Text in popovers |
| `--primary` | `175 70% 42%` | `286 100% 72%` | CTAs, active nav, progress fill, focus ring |
| `--primary-foreground` | `0 0% 100%` | `240 10% 5%` | Text on primary |
| `--secondary` | `175 25% 93%` | `240 10% 15%` | Secondary buttons, progress track |
| `--secondary-foreground` | `175 40% 25%` | `45 15% 85%` | Text on secondary |
| `--muted` | `175 20% 94%` | `240 10% 14%` | Skeletons, tab list, inert fills |
| `--muted-foreground` | `240 10% 45%` | `240 8% 55%` | Secondary text, inactive nav, icons |
| `--accent` | `175 40% 92%` | `286 40% 20%` | Hover surface, active nav background |
| `--accent-foreground` | `175 60% 30%` | `286 100% 85%` | Text on accent |
| `--destructive` | `0 72% 51%` | `0 72% 51%` | Delete, errors |
| `--destructive-foreground` | `0 0% 100%` | `0 0% 100%` | Text on destructive |
| `--warning` | `38 92% 50%` | `38 92% 50%` | Amber highlights, pro features |
| `--warning-foreground` | `38 92% 10%` | `0 0% 100%` | Text on warning |
| `--border` | `175 20% 85%` | `240 10% 16%` | Hairlines (used sparingly) |
| `--input` | `175 20% 85%` | `240 10% 16%` | Input borders, switch off-state |
| `--ring` | `175 70% 42%` | `286 100% 72%` | Focus ring — always tracks `--primary` |

`--destructive` and `--warning` are intentionally identical across themes; every other token
shifts.

### 1.4 The accent-follows-mode rule

Light mode is **cyan/teal**. Dark mode is **orchid/violet**. There is no accent picker —
`ThemeProvider`'s docblock states this explicitly:

```
Accent colors are automatic:
  - Light mode: Neon Cyan
  - Dark mode: Vivid Orchid
```

Anything written as `bg-primary` / `text-primary` / `ring-ring` inherits the swap for free.
Anything written as `text-cyan-500` does not — which is why raw palette classes are banned.

### 1.5 Surface ladder

Depth comes from a tonal ladder, not from borders:

```
dark:   background 6%  →  surface-1 8%  →  card 9%  →  surface-2 10%
                          popover 10%   →  surface-3 12%  →  muted 14%
light:  background 97% →  surface-2 98% →  card / surface-1 100%
```

Note the light ladder inverts: elevated surfaces get *lighter* (toward pure white) while the
page ground is a warm off-white. In dark mode elevated surfaces get lighter too (6% → 14%).
The rule is the same in both: **higher elevation = higher lightness.**

### 1.6 Theming mechanics

`darkMode: ["class"]`. The `.dark` class goes on `<html>`.

Three cooperating pieces:

1. **Blocking inline script** in `app/layout.tsx` `<head>` reads
   `localStorage['afterimage-theme']` (shape `{ mode: "light" | "dark" }`), falls back to
   `prefers-color-scheme`, and sets the class before first paint. This is what prevents a
   flash. `<html suppressHydrationWarning>` accompanies it.
2. **`ThemeProvider`** (`components/theme/ThemeProvider.tsx`) — context with
   `{ mode, setMode, toggleTheme }`; persists to the same key; subscribes to
   `matchMedia('(prefers-color-scheme: dark)')` but **only applies system changes when the
   user has no stored preference**.
3. **`ThemeToggle`** (`components/theme/ThemeToggle.tsx`) — a two-state icon button
   (Moon in light, Sun in dark). Binary only; there is no "system" option in the UI.

> `next-themes` is in `package.json` but the app uses this hand-rolled provider instead.
> Don't reach for `next-themes` — you'd end up with two sources of truth on one storage key.

---

## 2. Shape (radius)

```css
--radius:        1rem;    /* 16px */
--radius-sm:     0.75rem; /* 12px */
--radius-lg:     1.5rem;  /* 24px */
--radius-input:  0.75rem; /* 12px */
```

Mapped in `tooling/tailwind-config/tailwind.config.ts`:

| Class | Resolves to | Use |
|---|---|---|
| `rounded-sm` | `calc(0.75rem - 4px)` = **8px** | Select items, dialog close button |
| `rounded-md` | `--radius-sm` = **12px** | Buttons, chips, skeleton default |
| `rounded-lg` | `--radius` = **16px** | Cards, dialogs, sheets, popovers, nav items — *the default* |
| `rounded-xl` | `--radius-lg` = **24px** | Hero panels, generating preview frame |
| `rounded-input` | `--radius-input` = **12px** | Input, Textarea, SelectTrigger |
| `rounded-full` | Tailwind default | Pills, badges, avatars, progress bar |

### ⚠️ The `rounded-2xl` trap

The config **overrides only** `xl`, `lg`, `md`, `sm`, and adds `input`. Tailwind's `2xl`
(1rem) and `3xl` (1.5rem) survive untouched. So:

```
rounded-2xl  = 1rem  = 16px  ← identical to rounded-lg, NOT larger
rounded-3xl  = 1.5rem = 24px ← identical to rounded-xl
rounded      = 0.25rem = 4px ← off-scale, avoid
```

There are ~25 `rounded-2xl` usages in the codebase (empty-state icon wells, bottom sheets).
They render at 16px, the same as `rounded-lg`. **Prefer `rounded-lg` / `rounded-xl`** so the
intent survives a future token change; treat existing `rounded-2xl` as legacy.

---

## 3. Elevation

Two independent ladders: neutral shadows for hierarchy, accent glows for emphasis.

### 3.1 Soft-depth shadows

```css
/* light */                                  /* dark */
--shadow-xs:   0 1px  2px 0 hsl(240 10% 10% / .03);   hsl(0 0% 0% / .30)
--shadow-sm:   0 2px  8px   hsl(240 10% 10% / .06);   hsl(0 0% 0% / .35)
--shadow-md:   0 6px 16px   hsl(240 10% 10% / .08);   hsl(0 0% 0% / .40)
--shadow-lg:   0 10px 30px  hsl(240 10% 10% / .12);   hsl(0 0% 0% / .35)
--shadow-xl:   0 20px 40px  hsl(240 10% 10% / .15);   hsl(0 0% 0% / .45)
--shadow-soft: 0 10px 30px  hsl(240 10% 10% / .12);   hsl(0 0% 0% / .35)
--shadow-lift: 0 14px 40px  hsl(240 10% 10% / .18);   hsl(0 0% 0% / .45)
```

Exposed as **`shadow-soft-xs` … `shadow-soft-xl`**, plus `shadow-soft` and `shadow-lift`.

> Note the naming asymmetry: the CSS variable is `--shadow-md` but the Tailwind class is
> `shadow-soft-md`. Bare `shadow-md` / `shadow-lg` / `shadow-xl` are **Tailwind defaults**
> (hard `rgb(0 0 0 / 0.1)` stacks), not these tokens. See
> [07 — Gaps](./07-conventions-and-gaps.md#g2-non-token-shadow-classes).

`--shadow-soft` and `--shadow-lg` are byte-identical, as are `--shadow-lift` and `--shadow-xl`
in dark mode. `shadow-soft` is the most-used class in the app (~65 usages) and is the
idiomatic choice for a card.

**Assignment map**

| Class | Applies to |
|---|---|
| `shadow-soft-xs` | Input, Textarea, SelectTrigger, Checkbox, Switch, outline/secondary buttons, TabsList |
| `shadow-soft-sm` | Primary + destructive buttons, active TabsTrigger, Switch thumb (`soft-md`) |
| `shadow-soft-md` | `Card` default |
| `shadow-soft` | Card overrides on library pages, preview result frames |
| `shadow-soft-lg` | SelectContent, DropdownMenuContent, Toaster |
| `shadow-soft-xl` | DialogContent |
| `shadow-lift` | `.card-interactive:hover` |

### 3.2 Accent glows

```css
--glow-primary:          0 0 20px hsl(var(--primary) / .15 light | .20 dark)
--glow-primary-intense:  0 0 30px hsl(var(--primary) / .25 light | .35 dark)
--glow-warning:          0 0 20px hsl(38 92% 50% / .15 | .20)
--glow-warning-intense:  0 0 30px hsl(38 92% 50% / .25 | .35)
```

Classes: `shadow-glow`, `shadow-glow-intense`, `shadow-glow-warning`,
`shadow-glow-warning-intense`, plus the animated `.pulse-glow` utility.

Glow is **emphasis, not decoration**. It appears on: primary button hover, checked
Checkbox/Switch, Slider thumb hover, current Stepper node, and generating states. Never on a
resting surface.

---

## 4. Spacing

No custom spacing scale — stock Tailwind. The spec's 4/8/12/16/24/32/48 rhythm is followed by
convention, i.e. `1 / 2 / 3 / 4 / 6 / 8 / 12`.

**Observed conventions**

| Context | Value |
|---|---|
| Page padding | `p-4 md:p-6 lg:p-8` (31 usages) |
| Compact page padding | `p-4 md:p-6` (create forms) |
| Card internals | `p-6` header/content/footer; `pt-0` on content and footer |
| Compact card internals | `p-3` (grid card footers), `px-5 pt-5 pb-4` (create cards) |
| Grid gap | `gap-4` |
| Form field stack | `space-y-1.5` (label→control), `space-y-4` (field→field) |
| Toolbar / action row | `gap-3` |
| Icon↔label inside a control | `gap-2` |
| Section stack | `space-y-6` / `space-y-8` |

**Content widths**

| Width | Usage | Where |
|---|---|---|
| `max-w-6xl` | 23 | Library + detail pages — the default |
| `max-w-4xl` | 7 | Narrower editors |
| `max-w-xl` | 3 | Single-column create forms |
| `max-w-7xl` | 4 | Marketing header/sections |
| `max-w-sm` | 14 | Empty-state and helper copy line length |

---

## 5. Typography

### 5.1 Font

Inter, single family, loaded via `next/font/google` with the `latin` subset and applied as
`<body className={inter.className}>`. No display face, no mono face configured (`font-mono`
falls back to the Tailwind stack; used only for token labels on `/theme-demo`).

### 5.2 Base element styles

Set globally in `globals.css` `@layer base` — plain `<h1>`–`<h4>` are already styled, so page
headings usually need no classes:

```css
h1 { @apply text-3xl md:text-4xl font-semibold tracking-tight; }
h2 { @apply text-xl  md:text-2xl font-semibold tracking-tight; }
h3 { @apply text-lg  md:text-xl  font-medium; }
h4 { @apply text-base md:text-lg font-medium; }
body { @apply bg-background text-foreground antialiased; }
* { @apply border-border; }   /* every border defaults to the token */
```

That last rule matters: `border` alone already produces a token-colored hairline. You never
need `border border-border`.

### 5.3 Scale in practice

| Role | Classes | Example |
|---|---|---|
| Page title | inherited `h1`, or `text-3xl md:text-4xl font-semibold tracking-tight` | `PageHeader` |
| Marketing headline | `text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]` | `HeroSection` |
| Card title | `text-xl font-semibold leading-none tracking-tight` | `CardTitle` |
| Dialog / Sheet title | `text-lg font-semibold leading-none tracking-tight` | `DialogTitle` |
| Section heading | `text-lg font-semibold` | `EmptyState` |
| Body | `text-sm` (app) / `text-base md:text-xl` (marketing) | — |
| Secondary body | `text-sm text-muted-foreground leading-relaxed` | `CardDescription` |
| Control label | `text-sm font-medium leading-none` | `Label` |
| Micro label | `text-xs text-muted-foreground` | Settings fields |
| Eyebrow / group label | `text-xs font-medium uppercase tracking-wider text-muted-foreground` | Sidebar groups, `MoreSheet` |
| Nav tab label (mobile) | `text-[10px] font-medium` | `BottomNav` |

Weights used: 400 (body), 500 `font-medium` (labels, nav, controls), 600 `font-semibold`
(titles), 700 `font-bold` (marketing headline only). Don't add 800/900.

### 5.4 Copy tone

From the spec, and observed in the code:

- Minimal, calm, confident. Sentence case.
- "Generate", not "Submit". "Draft", not "Auto".
- Placeholder prompts are evocative and rotate at random (`PROMPT_PLACEHOLDERS` in
  `lib/form-constants.ts`, index picked with `Math.random()` on mount).
- Progress copy is present-continuous and specific: *"Analyzing prompt…"*, *"Enhancing
  prompt…"*, *"Loading references…"*, *"Generating images…"*, *"Saving images…"*.
- Toasts are short: `"Quick Shot created!"`, `` `${label} complete` ``, `` `${label} failed` ``.
  (The spec asks to avoid exclamation marks; success toasts currently use them — a live
  inconsistency, see [07](./07-conventions-and-gaps.md#g5-microcopy-drift).)

---

## 6. Extras defined in `globals.css`

**Safe-area tokens** — `--safe-top/-bottom/-left/-right` from `env(safe-area-inset-*)`.
`app/layout.tsx` sets `viewport: { viewportFit: "cover" }`, so fixed bottom UI must pad with
`env(safe-area-inset-bottom)` (see `BottomNav`, `MoreSheet`, `FilterSheet`).

**Autofill override** — Chrome's yellow autofill wash is neutralized with a
`box-shadow: inset 0 0 20px 20px hsl(var(--surface-1))` + `-webkit-text-fill-color` trick.
If you build a custom input that isn't `input`/`textarea`/`select`, replicate it.

**`.scrollbar-none`** — hides scrollbars cross-browser. Used by `TabsList` for its horizontal
overflow strip.

**Coarse-pointer sizing** — under `@media (pointer: coarse)`, every `button`, `[role=button]`,
input, textarea, select, and `[role=combobox]` is forced to `min-height: 44px`. Buttons whose
class contains `h-7`/`h-6`/`h-5` are exempted so deliberately tiny controls survive.

---

Next: [02 — Layout](./02-layout.md)
