# 04 — Motion

Durations, easing, choreography, and the hover language.

---

## 4.1 Motion inventory

Two systems coexist:

| System | Where | Purpose |
| --- | --- | --- |
| **CSS transitions** (Tailwind) | Everywhere in the product | Hover, focus, state change |
| **framer-motion** | `app/page.tsx` only | Marketing entrance choreography |
| **tw-animate-css** | shadcn primitives | Radix `data-state` enter/exit |

`package.json` lists `motion@^12.23.12` (the v12 package name), but
`app/page.tsx:7` imports `from "framer-motion"`. That resolves today because
`motion` ships a `framer-motion` compat entry, but it is a latent break.

**Rule.** Import from `"motion/react"`.

---

## 4.2 Duration scale

| Duration | Applied to | Files |
| --- | --- | --- |
| `duration-100` | Progress bar fill | `soundcloud-player.tsx:323` |
| `duration-200` | Color and shadow changes | `track.tsx`, `comment.tsx`, `track-details.tsx`, `plan-badge.tsx`, `ui/dialog.tsx` |
| `duration-300` | Opacity, transform, overlay reveals, CTA | `track.tsx`, `track-details.tsx`, `app/page.tsx` |
| `duration-500` | Track card lift | `track.tsx:39` |
| `duration-700` | Artwork zoom | `track.tsx:50` |
| `duration-900` | `animate-pulse` on "Playing" badge | `track.tsx:104` |

**Rule.** Three durations, chosen by what is moving:

```
150–200ms   color, background, border, shadow          → duration-200
300ms       opacity, small transforms, reveals         → duration-300
500ms       large transforms (card lift, image scale)  → duration-500
```

`duration-700` on the artwork zoom is slower than the card lift it accompanies
(`duration-500`), so the image keeps growing after the card has settled. Match
them at 500, or make the image slightly *faster* so it leads.

`duration-900` is not a Tailwind scale value and is meaningless on
`animate-pulse`, which has its own hardcoded 2s timing. Remove it.

---

## 4.3 Easing

The product uses Tailwind's default `ease` on every transition — no
`ease-in`/`ease-out`/`ease-linear` modifiers appear anywhere except:

- `duration-100` progress fill (should be `ease-linear` — playback is linear)
- `.marquee` keyframe: `animation-timing-function: linear` ✅

framer-motion uses `ease: "easeOut"` on entrance items.

**Rule.**
- Entrances and reveals: `ease-out` (fast start, gentle settle).
- Exits: `ease-in`.
- Continuous / time-driven (progress, marquee): `linear`.
- Hover: default `ease` is fine.

---

## 4.4 The hover language

The app has a consistent, well-developed hover vocabulary. Codify it.

### Card lift

```tsx
"transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl
 border-gray-200/50 hover:border-gray-300/70"        // track.tsx
"hover:shadow-xl transition-shadow duration-300"     // marketing card
"whileHover={{ y: -5 }}"                             // marketing card wrapper (framer)
"hover:shadow-md transition-shadow duration-200"     // comment card
```

Three different lift magnitudes (−8px, −5px, none) and three shadow targets.

**Rule.** One lift:

```tsx
"transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
```

### Artwork zoom + scrim

```tsx
// container
"relative overflow-hidden"
// image
"transition-all duration-700 group-hover:scale-110"
// scrim
"absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
```

This is the signature move. Keep it — but see
[06](06-accessibility.md#63-hover-only-content) about what rides on top of it.

### Reveal-with-rise

Stat pills don't just fade in, they rise:

```tsx
"opacity-0 group-hover:opacity-100 transition-all duration-300
 transform translate-y-2 group-hover:translate-y-0"
```

Top pills and bottom pills both rise by 8px, which means the bottom pair moves
*toward* the card edge. Consider mirroring: `-translate-y-2` for the bottom row
so both groups move outward from center.

### Scale-in control

```tsx
// play button on track card
"opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100
 transition-all duration-300 hover:bg-white hover:scale-105"
```

Note the double scale: 75%→100% on group hover, then 105% on direct hover. That
layering is good — it distinguishes "the card is hovered" from "the button is
hovered."

### Badge lift

```tsx
// plan-badge.tsx
"transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
```

### Press feedback

Only on marketing CTAs, via framer-motion:

```tsx
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

**Rule.** Add `active:scale-[0.98]` to the transport and primary button variants
so product buttons have press feedback too, without pulling framer-motion into
the product bundle.

---

## 4.5 framer-motion patterns (marketing only)

`app/page.tsx` runs a stagger-on-mount sequence gated by a `useState` +
`useEffect` visibility flag:

```tsx
const [isVisible, setIsVisible] = useState(false);
useEffect(() => setIsVisible(true), []);

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { delayChildren: 0.2, staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden:  { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

<motion.div variants={containerVariants} initial="hidden"
            animate={isVisible ? "visible" : "hidden"}>
  <motion.div variants={itemVariants}> … </motion.div>
</motion.div>
```

Six sections stagger at 150ms apart after a 200ms delay — a ~1.1s total
entrance. Each rises 30px over 600ms.

⚠ The CTA wrapper at `page.tsx:94` sets `whileHover`/`whileTap` but **omits
`variants={itemVariants}`**, so it is excluded from the stagger and appears
instantly while everything around it animates in. Add the variants.

**Rule.** Keep framer-motion on `/` only. Product routes use CSS transitions —
the library is ~30KB and the product surfaces are already client-heavy.

---

## 4.6 Radix state animations

Provided by `tw-animate-css`, applied on `data-state`:

```
data-[state=open]:animate-in    data-[state=closed]:animate-out
data-[state=open]:fade-in-0     data-[state=closed]:fade-out-0
data-[state=open]:zoom-in-95    data-[state=closed]:zoom-out-95
data-[side=bottom]:slide-in-from-top-2
data-[side=left]:slide-in-from-right-2
data-[side=right]:slide-in-from-left-2
data-[side=top]:slide-in-from-bottom-2
```

Dialogs fade + zoom from 95%. Dropdowns and tooltips additionally slide 8px from
their anchor side. This is stock shadcn and it is correct — don't override it.

---

## 4.7 Loading and state indicators

| Indicator | Implementation |
| --- | --- |
| Player buffering | `w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin` |
| "Playing" badge | `bg-orange-500 … animate-pulse` |
| Provider connecting | `<span className="animate-spin mr-2">⏳</span>` |
| Everything else | plain text: `"Loading..."`, `"Saving..."`, `"Deleting..."` |

⚠ The `⏳` emoji with `animate-spin` (`settings/page.tsx:180`) is a rotating
hourglass glyph — it renders differently on every platform and reads as an
error to a screen reader. Replace with `<Loader2 className="mr-2 size-4
animate-spin" />` from lucide.

**Rule.** Async button labels swap text *and* show a spinner:

```tsx
<Button disabled={isPending}>
  {isPending && <Loader2 className="size-4 animate-spin" />}
  {isPending ? "Saving…" : "Save"}
</Button>
```

Use a real ellipsis character or three periods consistently — the codebase mixes
`"Loading..."` and `"Signing in ..."` (with a space).

---

## 4.8 Reduced motion

**Nothing in the app respects `prefers-reduced-motion`.** The 110% artwork zoom,
the card lift, the 1.1s staggered marketing entrance, the pulsing "Playing"
badge, and the (unused) infinite marquee are all unconditional.

**Rule.** Add to `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

And gate the framer-motion sequence:

```tsx
import { useReducedMotion } from "motion/react";
const shouldReduce = useReducedMotion();
const itemVariants = {
  hidden:  { y: shouldReduce ? 0 : 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: shouldReduce ? 0 : 0.6, ease: "easeOut" } },
};
```

This matters more than usual here: an audio app's users may be listening with
their eyes elsewhere, and a pulsing badge plus an infinite marquee in the same
fixed rail is a genuine vestibular trigger.
</content>
