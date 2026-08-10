# 05 — Motion & States

> **Motion communicates state changes. It is not decoration.** Every animation in this system
> answers "what just happened?" or "what is happening now?"

---

## 1. Timing

| Duration | Used for |
|---|---|
| **150ms** | Buttons, inputs, nav items, chips — anything touched directly |
| **200ms** | Cards, sidebar collapse, overlays, tab content, layout shifts |
| **250ms** | (registered in the config; rarely used) |
| **300ms** | Progress bar fill, image scale/fade, disclosure chevron, content reveal |
| **500ms** | Sparkle burst |
| **600ms** | Completion shimmer |

Easing is `ease-out` (or `ease-in-out` for progress). **No bounce, no spring.** `duration-150`
and `duration-250` are added to `transitionDuration` in the shared Tailwind config; the rest
are stock.

---

## 2. Animation catalog

### From `tooling/tailwind-config/tailwind.config.ts`

| Class | Definition |
|---|---|
| `animate-fade-in` / `animate-fade-out` | opacity 0↔1, 0.2s ease-out |
| `animate-slide-up` | `translateY(4px)` + fade, 0.2s |
| `animate-slide-down` | `translateY(-4px)` + fade, 0.2s |
| `animate-scale-in` | `scale(.95)` + fade, 0.15s |
| `animate-spin` | 1s linear infinite |
| `animate-accordion-down` / `-up` | Radix accordion height, 0.2s |

`tailwindcss-animate` is installed, supplying the `animate-in` / `data-[state=open]:*` /
`fade-in-0` / `zoom-in-95` / `slide-in-from-*` vocabulary that the Radix primitives use.

### From `globals.css` (`@layer components`)

| Class | Effect | Where |
|---|---|---|
| `.skeleton` | 1.5s shimmer sweep at `foreground / 0.04` | All loading placeholders |
| `.pulse-glow` | 2s glow between `--glow-primary` and `--glow-primary-intense` | Generating preview badge |
| `.card-generating` | 2s box-shadow pulse, 8px→16px at `primary / .15→.25` | Cards mid-generation |
| `.card-error` | Static `0 0 12px 2px destructive / .2` | Failed cards |
| `.stage-text-pulse` | 2s opacity 0.6↔1 | Stage message copy |
| `.content-reveal` | 300ms fade + `translateY(4px)→0`, `forwards` | Revealed sections |
| `.completion-shimmer` | 600ms primary-tinted sweep, `::after`, `pointer-events-none` | One-shot on section reveal |
| `.success-sparkle` | 500ms radial burst, scale 0→1.2→1.5 with fade | Generating → ready |
| `.generating-dots` | Four 8px dots, 1.4s pulse, staggered 0 / .2 / .4 / .6s | Generating overlays |
| `.card-interactive` | `shadow-lift` + `-translate-y-0.5` on hover; `scale-[0.99]` on active | Interactive cards |

### Micro-interactions

| Element | Behavior |
|---|---|
| Any `Button` | `active:scale-[0.98]` |
| Primary `Button` | `hover:shadow-glow` |
| Card thumbnail | `group-hover:scale-105` over 300ms inside `overflow-hidden` |
| Card hover scrim | `opacity-0 group-hover:opacity-100`, `bg-gradient-to-t from-black/60` |
| Slider thumb | `hover:scale-110 hover:shadow-glow active:scale-95` |
| Disclosure chevron | `rotate-180`, 300ms `ease-in-out` |
| Select chevron | `transition-transform duration-150` |
| Sidebar | `transition-all duration-200 ease-out` on width, mirrored by `<main>` padding |

### Hover is gated on capability

```css
@media (hover: hover) { .card-interactive:hover { … } }
```

Card lift only exists on devices with a real pointer, so touch devices don't get stuck hover
states. Apply the same gate to any new hover-lift effect.

---

## 3. Reduced motion

Globally honored in `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This is a blanket override, so **new CSS animations are covered automatically**. What is *not*
covered: JS-driven motion (`setTimeout` staggers in `RevealSection`, drag interpolation in
`BeforeAfterCompare`). If you add JS animation, check the media query yourself.

---

## 4. The four states — every async surface needs all of them

### Loading

- **Grids** → `SkeletonCard` in the same grid, plus a skeleton in the `PageHeader` action
  slot (`<div className="skeleton h-10 w-32 rounded-lg" />`). The header itself renders
  normally so nothing shifts.
- **Editors** → a bespoke skeleton matching the real layout (`PackEditorSkeleton.tsx`).
- **Route-level** → `app/(dashboard)/references/loading.tsx`.
- **Suspense fallbacks** → a card-shaped placeholder, never a naked spinner on a blank page.
- **Inline actions** → `<Button loading>`.

Skeletons mirror the real layout. If the real card is `aspect-square`, so is its skeleton.

### Empty

Two distinct flavors, never merged:

| Flavor | Icon | Copy | Action |
|---|---|---|---|
| Nothing created yet | feature icon (`Zap`, `FolderOpen`…) | "No Quick Shots yet" / "Create your first…" | Primary CTA |
| Nothing matches | `Search` | "No matching Quick Shots" / "Try adjusting your search or filters" | `outline` **Clear Filters** |

Anatomy is in [03 §6](./03-components.md#emptystate--errorstate).

### Error

Three tiers:

1. **Field / action** → `toast.error(getApiErrorMessage(error))`.
2. **Item** → `ErrorOverlay` on the card: destructive icon well, message, *"Stage reached:
   {stage}"*, Retry button. Wrapped in `CardGlow variant="error"`. `role="alert"`.
3. **Page / boundary** → `ErrorState` or `ErrorBoundary` with a Try Again affordance.

Errors always pair color with text — never color alone.

### Generating (the AI-native fourth state)

What separates this system from a generic CRUD app. A generating item shows, simultaneously:

1. `CardGlow` pulsing at the container edge — visible in peripheral vision across a grid
2. A `backdrop-blur-sm bg-background/60` scrim over stale content
3. `GeneratingIndicator` — four staggered dots plus specific stage copy
4. An `aria-live="polite"` mirror of the stage message
5. Interactivity suppressed (`interactive={!isGenerating}`)

and on completion: sparkle burst → thumbnail fade-in → global toast with **View**.

---

## 5. Adding new motion — checklist

- [ ] Does it communicate a state change? If not, cut it.
- [ ] Duration in 150–300ms (one-shot celebrations may reach 600ms).
- [ ] `ease-out`, no bounce.
- [ ] Keyframes live in `globals.css` under `@layer components` (or the Tailwind `keyframes`
      block), not inline styles.
- [ ] Colors reference tokens: `hsl(var(--primary) / 0.15)`, never a literal.
- [ ] Hover-only effects wrapped in `@media (hover: hover)`.
- [ ] Overlay decorations get `pointer-events-none`.
- [ ] Edge-triggered celebrations guard against firing on mount/reload.
- [ ] JS-driven motion checks `prefers-reduced-motion` explicitly.

---

Next: [06 — Accessibility](./06-accessibility.md)
