# 06 — Accessibility

The rules, plus the defects currently in the tree.

---

## 6.1 What the app already gets right

Credit where due — these are load-bearing and should not regress:

- **Radix primitives** bring focus trapping, `aria-*` wiring, roving tabindex,
  and escape handling to Dialog, DropdownMenu, Tooltip, and Avatar for free.
- **`focus-visible` rings** on `Button` and `Input`:
  `focus-visible:ring-ring/50 focus-visible:ring-[3px]` plus
  `focus-visible:border-ring`. A 3px ring is generous and clearly visible.
- **`sr-only` close label** in `ui/dialog.tsx:75`.
- **`aria-label="Clear error"`** on the player's error dismiss button.
- **`aria-invalid` styling** baked into `Button` and `Input` variants.
- **16px mobile inputs** (`text-base md:text-sm`) prevent iOS zoom-on-focus.
- **`<Link>` inside `DropdownMenuItem asChild`** keeps real anchors.
- **`rel="noreferrer"` / `rel="noopener noreferrer"`** on external links.
- **Semantic `<article>`** for track and playlist cards.

---

## 6.2 Focus

### ⚠ Two focus conventions

| Convention | Where |
| --- | --- |
| `focus-visible:ring-ring/50 focus-visible:ring-[3px]` | `ui/button.tsx`, `ui/input.tsx` |
| `focus:outline-none focus:ring-1 focus:ring-blue-500` | `basic-info-section.tsx`, `social-links-section.tsx` |
| `focus:outline-none focus:ring-2 focus:ring-red-500` | `delete-confirm-modal.tsx:86` |
| `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` | `profile/page.tsx:383` |
| **nothing** | `tracks.tsx:44`, `comments.tsx:44`, `track.tsx:61`, `track-details.tsx:189`, `soundcloud-player.tsx:336,344,357,368`, `comment.tsx:114`, `track-search-result.tsx:19` |

The third row is the problem: **ten interactive controls have no focus style at
all**, including every transport button in the player and the play button on
every track card. A keyboard user cannot tell what is focused.

`focus:outline-none` without a `focus-visible` replacement is worse than
nothing — it actively removes the browser default.

**Rule.** One focus treatment, everywhere:

```
focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50
focus-visible:border-ring
```

The cheapest fix is to route every control through `<Button>`, which already
carries it. For the handful that can't be, add the ring classes explicitly.

### Focus order

The fixed header is first in DOM order and the player is last, which matches
visual order. Good. But there is **no skip link** — a keyboard user must tab
through the brand, the search input, its results, and the avatar menu on every
page before reaching content.

**Rule.** Add to `(me)/layout.tsx`, first child:

```tsx
<a href="#main"
   className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4
              focus:z-[60] focus:rounded-md focus:bg-background focus:px-4
              focus:py-2 focus:ring-[3px] focus:ring-ring/50">
  Skip to content
</a>
…
<main id="main" className="pt-[64px] pb-[120px]">{children}</main>
```

---

## 6.3 Hover-only content

The track card hides its entire interactive payload behind `:hover`:

| Element | Class | Consequence |
| --- | --- | --- |
| Play/pause button | `opacity-0 group-hover:opacity-100` | Unreachable on touch; invisible to keyboard |
| Plays, likes, reposts, comments | `opacity-0 group-hover:opacity-100` | Four metrics per track, hidden on mobile |
| Artwork scrim | `opacity-0 group-hover:opacity-100` | — |

On a phone — where a music app lives — a track card shows artwork, a title, and
an artist. Tapping the artwork does play the track (there's an `onClick` on the
`<img>`), but nothing indicates that, and the metrics are simply gone.

**Rule.** Three fixes, in order of importance:

1. **Keyboard parity** — reveal on focus as well as hover:
   ```
   opacity-0 transition-opacity duration-300
   group-hover:opacity-100 group-focus-within:opacity-100
   ```
2. **Touch parity** — always show the play button below `md:`, or show it
   persistently at reduced opacity:
   ```
   opacity-100 md:opacity-0 md:group-hover:opacity-100
   ```
3. **Metrics parity** — un-comment `<SongStatsBar>` at `track.tsx:139` so the
   counts render in the card body on all devices, and let the overlay pills be
   pure hover enhancement.

Also: `@media (hover: none)` exists precisely for this. Consider a
`hover:` → `@media (hover: hover)` audit across the card.

---

## 6.4 Semantics

### ⚠ Multiple `<main>` elements

`<main>` is used as a generic block wrapper in three components:

| File | Line | Element |
| --- | --- | --- |
| `header.tsx` | 15 | `<main className={className}>` — the header |
| `footer.tsx` | 3 | `<main className={className}>` |
| `soundcloud-player.tsx` | 266 | `<main>` — the player |
| `library/page.tsx` | 84 | `<main className="m-8">` — the actual main |
| `settings/page.tsx` | 148 | `<main className="flex flex-col m-8">` |
| `(me)/layout.tsx` | 48 | `<main className="pt-[64px] pb-[120px]">` — the real one |

On `/library` there are **four** `<main>` elements nested and sibling. A screen
reader's "jump to main content" becomes meaningless.

**Rule.** Exactly one `<main>` per page, in `(me)/layout.tsx`. Change:

- `header.tsx` → `<header>`
- `footer.tsx` → `<footer>`
- `soundcloud-player.tsx` → `<div role="region" aria-label="Audio player">`
- page roots → `<div>` (the layout already supplies `<main>`)

### ⚠ Non-interactive elements with handlers

| Element | File | Fix |
| --- | --- | --- |
| Search result row (`<div onClick>` + inline cursor style) | `track-search-result.tsx:19` | `<button>` |
| Progress bar (`<div onClick>`) | `soundcloud-player.tsx:317` | see below |
| Track artwork (`<img onClick>`) | `track.tsx:50` | wrap in `<button>` |

### The progress bar

```tsx
<div ref={progressRef} className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
     onClick={handleSeek}>
  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
</div>
```

No role, no keyboard access, no announced value. Users who cannot use a mouse
cannot seek.

**Rule.** Make it a real slider:

```tsx
<div
  ref={progressRef}
  role="slider"
  tabIndex={0}
  aria-label="Seek"
  aria-valuemin={0}
  aria-valuemax={Math.floor(duration)}
  aria-valuenow={Math.floor(currentTime)}
  aria-valuetext={`${formatDuration(currentTime * 1000)} of ${formatDuration(duration * 1000)}`}
  onClick={handleSeek}
  onKeyDown={(e) => {
    if (e.key === "ArrowRight") seekBy(5);
    if (e.key === "ArrowLeft")  seekBy(-5);
    if (e.key === "Home")       seekTo(0);
    if (e.key === "End")        seekTo(duration);
  }}
  className="… focus-visible:ring-[3px] focus-visible:ring-ring/50"
>
```

Or use `npx shadcn@latest add slider` (Radix Slider), which gives all of this.

### Missing labels on icon-only buttons

`soundcloud-player.tsx` — skip back, play/pause, skip forward, and mute all
render a bare lucide icon with no accessible name. Add `aria-label`, and make
the play button's label reflect state:

```tsx
<button aria-label={displayIsPlaying ? "Pause" : "Play"} …>
<button aria-label="Skip back 10 seconds" …>
<button aria-label="Skip forward 10 seconds" …>
<button aria-label={isMuted ? "Unmute" : "Mute"} …>
```

Same for the track card play button and the (currently inert) heart button in
`comment.tsx:114`.

### Decorative images

`comment.tsx`, `track.tsx`, `track-details.tsx` pass meaningful `alt` — good.
But where an image sits next to the same text as a label (the search result row,
the player artwork), `alt=""` is correct so it isn't announced twice.

---

## 6.5 Contrast

Confirmed failures:

| Location | Combination | Issue |
| --- | --- | --- |
| `profile.tsx:63` | `text-white` on `bg-gray-100` tooltip | ~1.1:1 — invisible |
| `track-details.tsx:252,341` | `text-orange-400` on white | ~2.2:1 — fails AA for body text |
| `track-details.tsx:252` hover | `hover:text-orange-300` | worse on hover — inverted convention |
| `song-stats-bar.tsx:39` | `text-gray-300` play icon on white | ~1.5:1 |
| `user-dropdown-menu.tsx:59` | `hover:bg-black hover:text-red-500` | red-500 on black ≈ 3.4:1 |
| `profile.tsx:74` | `hover:text-black` on `bg-orange-500` | ~3.3:1 |

**Rule.**

- On white, orange text must be `orange-600` minimum (`#ea580c`, ~3.9:1 — passes
  AA for large text) or `orange-700` for body copy.
- Hover states get *darker*, never lighter, on light backgrounds.
- Muted text is `text-muted-foreground` (neutral-500, 4.6:1 on white), never
  `text-gray-400` or lighter for anything readable.
- Icons conveying information need 3:1 minimum — `text-gray-300` never qualifies.

The four engagement-pill colors (`red-500/90`, `green-500/90`, `blue-500/90`,
`black/50`) all carry white text over `backdrop-blur-sm`, which is fine — the
blur guarantees the backdrop can't wash them out.

---

## 6.6 Forms

`soundbyte-profile/*` is the weakest area.

| Issue | Detail |
| --- | --- |
| Native `<select>` and `<input type="checkbox">` unstyled cross-browser | `social-links-section.tsx:45`, `basic-info-section.tsx:37` |
| No `<fieldset>`/`<legend>` on the genre group | `genres-section.tsx:23` — 20+ checkboxes with no group name |
| No `<fieldset>` on plan radios | `subscription-section.tsx` |
| Radio cards use `sr-only` inputs with `<label>` wrappers | ✅ correct technique, but focus isn't visible on the card |
| No `aria-describedby` linking errors to fields | Errors only appear as a page-level banner |
| No `required` indication beyond the HTML attribute | `basic-info-section.tsx:32` |
| Social link rows keyed by array index | `social-links-section.tsx:43` — React reuses DOM across removals |
| Remove buttons say only "Remove" | Should be `aria-label={`Remove ${platform} link`}` |

**Rule for the radio cards** — add a visible focus ring driven by the sr-only
input:

```tsx
<label className="… has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50">
  <input type="radio" className="sr-only" … />
```

Tailwind v4's `has-[]` variant makes this a one-liner and it is already used
elsewhere in the codebase (`has-[>svg]:px-3` in `button.tsx`).

---

## 6.7 Announcements

No `aria-live` regions exist. Things that change without announcement:

| Change | Should announce |
| --- | --- |
| Search results appear | `role="status"` on the results container, or a combobox pattern |
| Save succeeded / failed | `role="status"` / `role="alert"` on the banner |
| Provider connected / disconnected | `role="status"` |
| Track started playing | `role="status"` with "Now playing: {title} by {artist}" |
| Load More appended N items | `role="status"` with "Loaded 24 more tracks" |
| Player error | `role="alert"` |

**Rule.** Banners get `role="status"` for success and `role="alert"` for errors,
plus `aria-live="polite"` / `"assertive"` respectively. The player rail gets a
visually-hidden live region announcing track changes.

---

## 6.8 The search combobox

`search-input.tsx` renders a plain `<input>` with an absolutely positioned
results list. Missing: `role="combobox"`, `aria-expanded`, `aria-controls`,
`aria-activedescendant`, `role="listbox"`/`role="option"`, arrow-key navigation,
Enter-to-select, Escape-to-dismiss, click-outside-to-dismiss, and a "no results"
state.

Currently Enter *clears* the search (`setSearch("")`) rather than selecting the
first result — surprising behavior.

**Rule.** Use `npx shadcn@latest add command` (cmdk), which implements the full
combobox pattern. It is the single highest-leverage accessibility fix in the
app, because search is in the header on every authenticated page.

---

## 6.9 Checklist for new work

Before merging a component:

- [ ] Every interactive element is a `<button>`, `<a>`, or `<input>` — not a
      `<div onClick>`
- [ ] Icon-only controls have `aria-label`, and it reflects state
- [ ] Focus is visible: `focus-visible:ring-[3px] focus-visible:ring-ring/50`
- [ ] Nothing essential is `:hover`-only — add `group-focus-within:` and a
      touch fallback
- [ ] Text on its background is ≥ 4.5:1 (≥ 3:1 for ≥18.66px bold / 24px)
- [ ] Images have `alt`; decorative ones have `alt=""`
- [ ] Form controls have a `<label htmlFor>`; groups have `<fieldset><legend>`
- [ ] Async state changes are announced via `role="status"` / `role="alert"`
- [ ] Works at 320px wide and at 200% zoom
- [ ] Respects `prefers-reduced-motion` (see [04](04-motion.md#48-reduced-motion))
- [ ] Uses tokens (`bg-card`, `text-muted-foreground`) not literals
      (`bg-white`, `text-gray-500`)
</content>
