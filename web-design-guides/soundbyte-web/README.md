# SoundByte Web — Design Guide

A design system reference derived from `apps/soundbyte-web/` in the
`soundbyte-platform` monorepo.

**Source of truth:** the code. This guide documents the system as it actually
exists on the `feature/profiles` branch, not an idealized version of it. Where
the codebase contradicts itself, the guide says so explicitly and gives a
recommendation.

---

## How to read this guide

Each chapter is split into two kinds of statements:

| Marker | Meaning |
| --- | --- |
| **Observed** | What the code does today. Descriptive. |
| **Rule** | What new code should do. Normative. |
| **⚠ Drift** | A place where the codebase is inconsistent with itself. |

If you are adding a screen, read **00**, **01**, **02**, and **08**. If you are
auditing or refactoring, read **07** first. **00** is the *why*; everything
after it is the *what*.

---

## Chapters

| # | File | Covers |
| --- | --- | --- |
| 00 | [aesthetic.md](00-aesthetic.md) | Design thesis, material, light, shape, voice, motion personality, what this is *not* |
| 01 | [foundations.md](01-foundations.md) | Stack, design tokens, color, typography, spacing, radii, elevation |
| 02 | [layout.md](02-layout.md) | App shell, containers, grids, breakpoints, z-index |
| 03 | [components.md](03-components.md) | Component catalog, anatomy, variants, when to use what |
| 04 | [motion.md](04-motion.md) | Transitions, framer-motion patterns, hover choreography |
| 05 | [content-and-state.md](05-content-and-state.md) | Formatters, copy voice, empty / loading / error states |
| 06 | [accessibility.md](06-accessibility.md) | Focus, semantics, contrast, touch — plus known defects |
| 07 | [consistency-audit.md](07-consistency-audit.md) | Every inconsistency found, ranked, with fixes |
| 08 | [recipes.md](08-recipes.md) | Copy-paste patterns for new pages and cards |

---

## The system in one page

**Identity.** A music platform for independent artists, layered on SoundCloud.
The visual language borrows SoundCloud's orange and pairs it with a neutral
grayscale chrome, glassy translucent surfaces, and generous rounding. Content —
artwork, avatars, waveform-adjacent controls — carries the color; the interface
around it stays quiet.

**Stack.**

- Next.js 15.3 (App Router) · React 19 · TypeScript 5
- Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`)
- shadcn/ui, `new-york` style, `neutral` base color, CSS variables on
- Radix UI primitives (dialog, dropdown, avatar, tooltip, label, slot)
- lucide-react icons
- framer-motion (marketing surfaces only)
- Geist Sans / Geist Mono via `next/font/google`

**Three visual registers.** The app speaks in three distinct dialects, and
knowing which one you are in determines every other choice:

1. **Marketing** (`src/app/page.tsx`) — light gradient ground, white
   `rounded-2xl` cards, orange gradient CTAs, framer-motion entrance
   choreography, large display type.
2. **Product chrome** (`(me)/` routes) — token-driven, translucent
   `bg-card/60 backdrop-blur-md` surfaces, `max-w-7xl` container, fixed header
   and player rails.
3. **Forms & settings** (`soundbyte-profile/*`) — flat `bg-white` cards, hard
   `border-gray-200`, blue as the action color, native inputs.

Register 3 is the outlier and the main source of drift. See
[07-consistency-audit.md](07-consistency-audit.md).

**Signature moves.**

- Orange (`orange-500` → `orange-600`) for anything that plays, links to
  SoundCloud, or is the primary path forward.
- Translucent surfaces over blur: `bg-card/60 backdrop-blur-md`,
  `bg-background/90 backdrop-blur` on the header, `bg-background/95` on the
  player.
- Hover-revealed metadata on artwork: stats fade in as colored pills over a
  darkening gradient while the image scales to 110%.
- Card lift on hover: `hover:-translate-y-2 hover:shadow-2xl` over 500ms.
- Everything is rounded. `rounded-md` is the floor; artwork cards go to
  `rounded-3xl`.

---

## Quick reference card

```
Container      max-w-7xl mx-auto        (product)
               max-w-6xl mx-auto        (marketing)
               max-w-2xl mx-auto        (forms)

Page padding   m-8                      (product routes)
Section gap    mt-6                     between stacked sections
Card padding   p-6 (glass) · p-4 (dense) · p-3 (track card body)

Brand          orange-500 / orange-600
Destructive    red-600 · var(--destructive)
Positive       green-500
Muted text     text-muted-foreground · text-gray-500/600

Radius         rounded-md   inputs, buttons, pills-in-forms
               rounded-xl   glass cards, artwork, feature tiles
               rounded-3xl  track cards
               rounded-full avatars, stat pills, transport controls

Body text      text-sm
Section head   text-lg font-semibold
Page title     text-3xl font-bold

Transition     duration-200 color · duration-300 opacity/transform
               duration-500 card hover · duration-700 image zoom

Header height  64px  (main gets pt-[64px])
Player height  120px (main gets pb-[120px])
Overlay z      z-50
```

---

## Files that define the system

| Concern | File |
| --- | --- |
| Tokens, theme, keyframes | `src/app/globals.css` |
| Fonts, providers, `<html>` | `src/app/layout.tsx` |
| shadcn config | `components.json` |
| `cn()` class merge helper | `src/lib/utils.ts` |
| App shell (header/player rails) | `src/app/(me)/layout.tsx` |
| Canonical glass card | `src/components/profile.tsx` |
| Canonical content card | `src/components/track.tsx` |
| Canonical form section | `src/components/soundbyte-profile/basic-info-section.tsx` |
</content>
</invoke>
