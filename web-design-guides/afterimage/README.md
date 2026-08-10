# AfterImage Design Guide

**Editorial Dark + Soft Depth + AI-Native UX**

Derived from `~/afterimage/apps/web` as of 2026-08-10 (branch `main`, commit `ccb12b7`).

This guide documents the design system **as it is actually implemented**. The aspirational
spec lives at `~/afterimage/.claude/skills/afterimage-ui-design/spec.md`; where implementation
and spec disagree, this guide follows the code and flags the gap in
[07 — Conventions & Gaps](./07-conventions-and-gaps.md).

---

## Contents

| # | Guide | Covers |
|---|---|---|
| 00 | [Art Direction](./00-art-direction.md) | Style and aesthetic — positioning, imagery treatment, iconography, voice, ornament rules |
| 01 | [Foundations](./01-foundations.md) | Color tokens, theming, radius, elevation, spacing, typography |
| 02 | [Layout](./02-layout.md) | App shell, navigation, page templates, responsive strategy |
| 03 | [Components](./03-components.md) | Every primitive: API, variants, styling rules |
| 04 | [Patterns](./04-patterns.md) | Prompt-first creation, library grids, detail editors, job tracking |
| 05 | [Motion & States](./05-motion-and-states.md) | Animation catalog, loading/empty/error/generating states |
| 06 | [Accessibility](./06-accessibility.md) | Contrast audit, focus, touch targets, reduced motion, ARIA |
| 07 | [Conventions & Gaps](./07-conventions-and-gaps.md) | Code conventions, do/don't, known inconsistencies, checklists |

---

**New here?** Read [00 — Art Direction](./00-art-direction.md) first. It explains what the
product is trying to look like; everything after it is how that gets built.

## The system in one page

**Stack.** Next.js 14 App Router · React 18 · TypeScript · Tailwind CSS 3.4 · shadcn/ui
(vendored into `components/ui`, `style: default`, `baseColor: slate`, CSS variables on) ·
Radix primitives · `class-variance-authority` for variants · `lucide-react` for icons ·
`sonner` for toasts · TanStack Query for server state · Zustand for job state.

**Font.** Inter via `next/font/google`, applied on `<body>` in `app/layout.tsx`. No display font.

**Theme.** Two hand-authored themes, `:root` (light) and `.dark`, both defined in
`app/globals.css`. The accent hue *changes with the mode* — this is the signature move:

| | Light | Dark |
|---|---|---|
| Background | `hsl(45 20% 97%)` warm porcelain | `hsl(240 12% 6%)` obsidian |
| Primary accent | **Neon Cyan** `hsl(175 70% 42%)` | **Vivid Orchid** `hsl(286 100% 72%)` |
| Secondary accent | Warm Amber `hsl(38 92% 50%)` | Warm Amber `hsl(38 92% 50%)` |

**Shape.** Radius scale remapped onto Tailwind's names — `rounded-md` = 12px (buttons,
inputs), `rounded-lg` = 16px (cards, the default), `rounded-xl` = 24px (hero surfaces).

**Depth.** Borders are minimized; elevation carries hierarchy. Seven-step soft shadow scale
plus two accent glow tokens, all theme-aware.

**Motion.** 150–300ms, `ease-out`, no bounce. Every animation communicates a state change.
`prefers-reduced-motion` is globally honored.

---

## Quick reference

```
Container     max-w-6xl mx-auto            (library/detail pages)
              max-w-xl mx-auto             (single-column create forms)
Page padding  p-4 md:p-6 lg:p-8
Header gap    mb-6 md:mb-8                 (PageHeader owns this)
Grid          grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4

Radius        rounded-md   12px  buttons, inputs, chips
              rounded-lg   16px  cards, sheets, popovers  ← default
              rounded-xl   24px  hero panels
              rounded-full        pills, badges, avatars

Elevation     shadow-soft-xs      inputs, checkboxes, switches
              shadow-soft-sm      primary buttons, active tab
              shadow-soft-md      cards at rest
              shadow-soft-lg      popovers, dropdowns, toasts
              shadow-soft-xl      dialogs
              shadow-lift         card hover
              shadow-glow         primary-accent emphasis

Type          h1  text-3xl md:text-4xl font-semibold tracking-tight
              h2  text-xl  md:text-2xl font-semibold tracking-tight
              h3  text-lg  md:text-xl  font-medium
              body           text-sm / text-base leading-relaxed
              meta  text-xs uppercase tracking-wider text-muted-foreground
```

## Live style reference

The app ships its own showcase at **`/theme-demo`** (`app/theme-demo/page.tsx`) — colors,
button variants, form elements, the shadow scale, glow effects, and skeletons, all rendered
in the active theme. Run `pnpm dev` in `apps/web` and open it before making token changes.
