# 06 — Accessibility

What the system gets right, and the two contrast problems you should know about before
shipping anything new.

---

## 1. Contrast audit

WCAG 2.1 ratios computed from the actual token values in `globals.css`.
Thresholds: **4.5:1** normal text · **3:1** large text (≥18.66px bold / ≥24px) and UI
components.

### Dark theme — passes across the board

| Pair | Ratio | |
|---|---|---|
| `foreground` on `background` | **17.46:1** | ✅ AAA |
| `foreground` on `card` | **16.48:1** | ✅ AAA |
| `muted-foreground` on `background` | **5.21:1** | ✅ AA |
| `muted-foreground` on `card` | **4.92:1** | ✅ AA |
| `muted-foreground` on `muted` | **4.35:1** | ⚠️ just under 4.5 — fine for large text/icons |
| `primary` (orchid) on `background` | **7.24:1** | ✅ AAA |
| `primary` on `card` | **6.84:1** | ✅ AAA |
| `primary-foreground` on `primary` | **7.34:1** | ✅ AAA — button labels |
| `accent-foreground` on `accent` | **8.37:1** | ✅ AAA — active nav |
| `secondary-foreground` on `secondary` | **11.42:1** | ✅ AAA |
| `warning` on `card` | **8.54:1** | ✅ AAA |
| `destructive` on `card` | **3.81:1** | ⚠️ large text / icons only |
| `border` on `background` | 1.27:1 | decorative hairline, by design |

Dark mode is the well-tuned theme. This tracks with "dark-first" as a stated principle.

### Light theme — two real failures

| Pair | Ratio | |
|---|---|---|
| `foreground` on `background` | **16.84:1** | ✅ AAA |
| `foreground` on `card` | **17.87:1** | ✅ AAA |
| `muted-foreground` on `background` | **5.16:1** | ✅ AA |
| `muted-foreground` on `card` | **5.48:1** | ✅ AA |
| `secondary-foreground` on `secondary` | **6.93:1** | ✅ AA |
| `accent-foreground` on `accent` | **4.46:1** | ⚠️ borderline |
| `accent-foreground` on `card` | **5.11:1** | ✅ AA — status pills read fine |
| `destructive` on `card` | **4.80:1** | ✅ AA |
| **`primary-foreground` (white) on `primary`** | **2.52:1** | ❌ **fails** — every primary button label |
| **`primary` as text on `background`** | **2.37:1** | ❌ **fails** — `text-primary` copy, active nav |
| `primary` as text on `muted` | 2.24:1 | ❌ fails |
| `warning` on `card` | **2.14:1** | ❌ fails as text (fills/borders only) |
| `border` on `background` | 1.28:1 | decorative |

### What this means in practice

**A1 — Light-mode primary buttons fail AA.** `bg-primary text-primary-foreground` in light
mode is white on `hsl(175 70% 42%)` = **2.52:1**. It affects every `<Button>` (default
variant), `ErrorState`'s Try Again, selected chips, and the Stepper's current/completed nodes.

The clean fix is one token: darken light-mode `--primary` to roughly `hsl(175 85% 26%)`
(≈4.6:1 with white) — or keep the hue and flip `--primary-foreground` to a dark ink. Either is
a single-line change in `globals.css`; verify at `/theme-demo`.

**A2 — `text-primary` is unreadable as body copy in light mode** (2.37:1). Restrict cyan to
fills, borders, indicators, and icon accents in light mode; don't set prose in it. The
sidebar's active item is safe because it uses `text-accent-foreground` on `bg-accent`
(4.46:1), not `text-primary`.

**A3 — amber is a fill, not a text color, in light mode** (2.14:1). Use `bg-warning` with
`text-warning-foreground`, never `text-warning` on a light surface.

Both A1 and A2 are token-level and fixable without touching components — see
[07](./07-conventions-and-gaps.md#g1-light-mode-primary-contrast).

---

## 2. Focus

Every interactive element carries the same treatment:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

with `ring-offset-background` establishing the offset color. `--ring` always equals
`--primary`, so the ring inherits the theme swap. Radix `Select` uses `focus:` rather than
`focus-visible:` (it manages its own roving focus).

**`focus-visible`, not `focus`** — so mouse users don't get rings, keyboard users always do.

Never remove a ring without an equivalent replacement. The one deliberate exception is the
inline title editor, which uses `outline-none` plus a visible `border-b border-primary` — a
valid substitute indicator.

---

## 3. Touch targets

Two mechanisms, belt and braces:

**Global**, in `globals.css`:

```css
@media (pointer: coarse) {
  button:not([class*="h-7"]):not([class*="h-6"]):not([class*="h-5"]),
  [role="button"], a[class*="flex"][class*="items-center"] { min-height: 44px; }
  input, textarea, select, [role="combobox"] { min-height: 44px; }
}
```

The `h-7`/`h-6`/`h-5` escape hatch preserves intentionally small controls (e.g. the `h-7` View
button in the jobs sheet).

**Explicit**, on links the selector can't reach: `min-h-[44px]` on `BottomNav` tabs,
`MoreSheet` rows, and editor back-links (`min-h-[44px] md:min-h-0` — the constraint relaxes on
desktop).

Because that global rule keys off `class*="h-7"` **string matching**, a `Button` sized with an
arbitrary value or a variable class may be silently exempted or forced. Check on a device.

---

## 4. Semantics and ARIA

**What's in place**

| Feature | Implementation |
|---|---|
| Loading buttons | `aria-busy` + `disabled` (`Button`) |
| Progress | `role="progressbar"` + `aria-valuemin/max/now` |
| Stepper | `<nav aria-label="Progress">` + `<ol>` |
| Generating status | `<div className="sr-only" aria-live="polite" aria-atomic="true">` mirroring the stage message |
| Errors | `role="alert"` on `ErrorOverlay` |
| Icon-only buttons | `aria-label` — theme toggle, active jobs, collapsed nav (`title`) |
| Close buttons | `<span className="sr-only">Close</span>` |
| Decorative graphics | `aria-hidden="true"` (spinner icon, dot indicators) |
| Labels | Radix `Label` with `htmlFor` throughout |
| Semantic landmarks | `<aside>` `<nav>` `<header>` `<main>` `<section>` |
| Alt text | `alt=""` on decorative card thumbnails; descriptive alt on marketing images |

**Coverage:** `aria-label` in 15 files, `sr-only` in 5, `role=` in several, `aria-live` in
**one** (`GeneratingIndicator`).

**Gaps worth closing**

- **No skip link.** Keyboard users tab through the whole sidebar to reach content. A
  `sr-only focus:not-sr-only` skip-to-content anchor in `AppShell` is ~5 lines.
- **`aria-live` only covers the card-level generating indicator.** Job completions announce
  visually (toast + sparkle) but not to screen readers outside that one component. Sonner
  provides its own live region, which mitigates but doesn't cover in-page transitions.
- **`aria-current="page"`** is absent on active nav items — active state is conveyed by color
  and a pseudo-element bar only.
- **Toolbar filter labels** are `md:sr-only`, so the visible-label-on-mobile pattern is right,
  but the desktop `Select`s rely on placeholder text for their accessible name.

---

## 5. Keyboard

Radix supplies focus trapping, `Escape` to close, arrow-key navigation, and typeahead for
Dialog, Sheet, Select, Tabs, DropdownMenu, Checkbox, Switch, and Slider. Don't re-implement
any of it.

App-level handlers to know:

- Inline title editor — `Enter` saves, `Escape` cancels, blur saves.
- Stepper — backward steps are focusable buttons; forward steps are `disabled`.
- Dialog footers use `flex-col-reverse sm:flex-row`, so on mobile the primary action is
  visually first but **last in DOM order** — which is the correct tab order.

---

## 6. Pre-merge accessibility checklist

- [ ] Text meets 4.5:1 in **both** themes (check light — it's the weak one).
- [ ] Interactive elements keep `focus-visible:ring-2 ring-ring ring-offset-2`.
- [ ] Icon-only controls have `aria-label`.
- [ ] Status is never conveyed by color alone — pair with text or an icon.
- [ ] Touch targets ≥44px on coarse pointers.
- [ ] New CSS animation → covered by the global reduced-motion rule; new JS animation → guard
      it yourself.
- [ ] Async status changes have an `aria-live` announcement or a toast.
- [ ] Images: `alt=""` if decorative, descriptive otherwise.
- [ ] Tab through the whole flow with the mouse untouched.

---

Next: [07 — Conventions & Gaps](./07-conventions-and-gaps.md)
