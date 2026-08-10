# 02 — Layout

App shell, navigation, page templates, responsive strategy.

---

## 1. Two shells

The app has exactly two chrome treatments, chosen by route group.

| Shell | Routes | Chrome |
|---|---|---|
| **App shell** | `app/(dashboard)/*` | Fixed sidebar + top bar (desktop), top bar + bottom nav (mobile) |
| **Public shell** | `/`, `/login`, `/signup`, `/privacy`, `/terms`, `/share/[shareId]` | Sticky `PublicHeader` + `Footer`, no nav |

`middleware.ts` gates them: `protectedRoutes = ['/packs', '/settings', '/characters',
'/quick-shots', '/generations', '/references']` redirect to `/login?next=…` when the
`better-auth.session_token` (or `__Secure-` prefixed) cookie is absent.

### Route map

```
/                              marketing home (hero → stories → grid → how-it-works → footer)
/login  /signup                auth
/privacy  /terms               legal
/share/[shareId]               public share view
/theme-demo                    design-system showcase (unprotected, dev reference)

(dashboard)
  /quick-shots                 library grid
  /quick-shots/new             create (single column)
  /quick-shots/[id]            detail
  /packs  /packs/new  /packs/[id]
  /wardrobes  /wardrobes/new  /wardrobes/[id]
  /characters  /characters/new  /characters/[id]
  /references                  album grid (+ loading.tsx)
  /generations                 album grid
  /settings/account
  /settings/billing
```

---

## 2. App shell anatomy

`components/layout/app-shell.tsx` composes `Sidebar` + `TopBar` + `BottomNav` + `MoreSheet`
and wraps children in an `ErrorBoundary`.

```
┌──────────┬──────────────────────────────────────┐
│          │  TopBar  h-14 / md:h-16   z-30       │  fixed, bg-background/80 backdrop-blur-sm
│ Sidebar  ├──────────────────────────────────────┤
│  w-56    │                                      │
│  (w-16   │  <main>                              │  pt-14 pb-16 md:pt-16 md:pb-0
│ collapsed│    ErrorBoundary                     │  md:pl-56 (or md:pl-16)
│   )      │      page content                    │
│  z-40    │                                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
        BottomNav  h-14  z-50  md:hidden   (mobile only)
```

**Measurements**

| Element | Mobile | Desktop (`md:` ≥768px) |
|---|---|---|
| TopBar height | `h-14` (56px) | `h-16` (64px) |
| Sidebar width | hidden | `w-56` (224px) / `w-16` (64px) collapsed |
| BottomNav height | `h-14` + safe-area | hidden |
| Main padding | `pt-14 pb-16` | `md:pt-16 md:pb-0` + `md:pl-56` / `md:pl-16` |

**Z-index ladder** — keep to these five values:

```
z-50  BottomNav, Dialog/Sheet overlay + content, PublicHeader
z-40  Sidebar
z-30  TopBar
z-50  Select/Dropdown content (portalled)
```

> TopBar sits *below* the Sidebar (`z-30` vs `z-40`) and offsets itself with
> `md:left-16` / `md:left-56` rather than overlapping. Sidebar owns the logo on desktop; the
> TopBar renders a duplicate logo only under `md:hidden`.

**Sidebar collapse state** is local component state persisted to
`localStorage['afterimage-sidebar-collapsed']`, read in an effect on mount. Both the sidebar
width and the `<main>` left padding animate with `transition-all duration-200`.

---

## 3. Navigation

### 3.1 Sidebar (desktop)

Four groups, defined as a `NavGroup[]` literal at the top of `components/layout/sidebar.tsx`:

| Group | Items |
|---|---|
| **Create** | New Quick Shot · New Pack · New Wardrobe |
| **Portfolio** | Quick Shots · Packs · Wardrobes · Characters |
| **Albums** | References · Generations |
| **Settings** | Account · Billing |

Group labels: `text-xs font-medium uppercase tracking-wider text-muted-foreground`, hidden
when collapsed. Groups separated by `mb-6`; items by `space-y-1`.

**Active state** — the signature nav treatment: tinted surface **plus a left accent bar**
built from a pseudo-element, no extra DOM:

```tsx
isActive
  ? "bg-accent text-accent-foreground relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-5 before:bg-primary before:rounded-full"
  : "text-muted-foreground"
```

Matching is prefix-based: `pathname === item.href || pathname.startsWith(item.href + "/")`.

Collapsed mode: `justify-center px-0`, label hidden, `title={item.label}` supplies a native
tooltip. Footer holds a ghost collapse toggle with a chevron.

### 3.2 BottomNav (mobile)

Three tabs + More: **Shots · Packs · Wardrobes · More**. Styling:
`bg-card/95 backdrop-blur-md border-t`, `min-h-[44px]` per tab, icon `h-5 w-5` above a
`text-[10px]` label, active = `text-primary` plus a 4px primary dot. Pads with
`env(safe-area-inset-bottom)`.

The **More** button opens `MoreSheet` — a bottom sheet listing *all* nav destinations grouped
under the same four headings, `max-h-[85vh]`, scrollable body, `rounded-t-2xl`, rows at
`py-3 min-h-[44px]`.

> Keep `BottomNav` tabs and `MoreSheet`/`Sidebar` entries in sync manually — the three lists
> are independent literals. Adding a destination means editing all three.

### 3.3 TopBar

Right-aligned control cluster with `gap-3`: `ActiveJobsIndicator` → `ThemeToggle` →
`AuthNav`. On mobile the layout becomes `justify-between` so the logo sits left.

### 3.4 PublicHeader

`sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b`, `h-16`, `max-w-7xl` inner
container. Logo left, `ThemeToggle` + `AuthNav` right.

---

## 4. Page templates

### 4.1 Library page

The dominant template — used by Quick Shots, Packs, Wardrobes, Characters, References,
Generations.

```tsx
<div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
  <PageHeader
    title="Quick Shots"
    subtitle="Generate single AI photos in seconds"
    actions={<Link href="/quick-shots/new"><Button><Plus className="mr-2 h-4 w-4" />New Quick Shot</Button></Link>}
  />

  {/* toolbar — only when the collection is non-empty */}
  <div className="flex items-center gap-3 mb-6">
    <div className="relative flex-1 md:flex-none md:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search…" className="pl-9" />
    </div>
    <FilterSheet hasActiveFilters={…} onClear={…}>{/* Selects */}</FilterSheet>
    {hasActiveFilters && <Button variant="ghost" size="sm" className="gap-1 hidden md:flex">Clear</Button>}
  </div>

  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">…</div>

  <ConfirmDialog … />
</div>
```

Rules baked into this template:

1. **Search sizing** — `flex-1` on mobile (fills the row), `md:w-64` fixed on desktop.
   Icon absolutely positioned at `left-3`, input compensates with `pl-9`.
2. **Toolbar hides when the collection is empty.** Filters on nothing is noise.
3. **Two distinct empty states** — "you have none yet" (primary CTA) vs. "no matches"
   (outline *Clear Filters*). Never collapse these into one.
4. **Loading returns early** with the same `PageHeader` plus `SkeletonCard`s, so the header
   never shifts.
5. **Delete is optimistic** with rollback: `queryClient.setQueryData` removes the row, the
   catch block re-inserts it sorted by `createdAt` desc and toasts the error.

### 4.2 Create page (single column)

`max-w-xl mx-auto`, `p-4 md:p-6`. Back link → `Card` → icon + `text-lg font-semibold` title →
form → full-width Cancel. See `app/(dashboard)/quick-shots/new/page.tsx`.

Wrapped in `<Suspense>` when it reads `useSearchParams()`, with a card-shaped fallback (never
a bare spinner on an empty page).

### 4.3 Create page (multi-step)

Character Builder (`components/character-builder/`) is the reference: `Stepper` +
`StepContent`, context provider (`CharacterBuilderContext`) holding wizard state, one
component per step (`ModeSelectStep` → `IdentityCoreStep` → `AngleGridStep`), and a
`BuilderProgress` bar showing `filled/total` alongside `required` completion (amber until met,
green once satisfied).

### 4.4 Detail / editor page

Pack and Wardrobe editors share the structure:

```
back link  ("← Back to Packs", text-sm text-muted-foreground, min-h-[44px] md:min-h-0)
inline-editable title  (click → input, Enter saves, Escape cancels, blur saves)
meta row  (date · counts · icons)
actions  (primary + DropdownMenu kebab for the rest)
─────────────────────────────────────────
Tabs:  Overview · Character · Wardrobe · Shot List · Style Bible · Gallery
```

Each editor is decomposed as `<Feature>EditorContext.tsx` + `<Feature>EditorHeader.tsx` +
`tabs/*` + `hooks/*`. Follow that split when adding a new editor rather than growing a page
component.

### 4.5 Marketing home

`app/page.tsx` composes: `PublicHeader` → `HeroSection` → `CharacterStories` →
`QuickShotGrid` → `HowItWorksSection` → `Footer`.

`HeroSection` is the only place in the app that uses gradients and glassmorphism, and it is
deliberately quarantined there:

- `bg-gradient-to-b from-background via-background to-muted/30` section ground
- two radial accent washes at 10% opacity + a 2%-opacity 40px grid overlay
- gradient headline text (`from-primary via-pink-500 to-amber-400`)
- glass form card: `border-white/10 bg-card/50 backdrop-blur-xl`
- desktop-only `BeforeAfterCompare` drag slider in the right column

> Do **not** port these treatments into the dashboard. The spec's "Don't" list names heavy
> gradients and glassmorphism explicitly; the hero is the sanctioned exception.

---

## 5. Responsive strategy

**Mobile-first, one breakpoint does the heavy lifting.** `md:` (768px) flips shell chrome from
mobile to desktop. `lg:` (1024px) adds marketing two-column and extra page padding. `xl:`
(1280px) adds the fourth grid column. `sm:` appears only inside shadcn primitives.

**Grid progression** — `grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4`. Two columns on
phones (not one) because the cards are square image thumbnails.

**Component-level responsive patterns**

| Pattern | Implementation |
|---|---|
| Filters | `FilterSheet` — bottom sheet under `md`, `md:contents` inline row above |
| Nav | Sidebar `hidden md:flex` / BottomNav `md:hidden` |
| Page header | `flex-col md:flex-row md:items-center md:justify-between` |
| Dialog footer | `flex-col-reverse sm:flex-row sm:justify-end` (primary on top on mobile) |
| Tab overflow | `overflow-x-auto scrollbar-none` + a `md:hidden` gradient fade hint on the right edge |
| Stepper labels | `hidden sm:inline` — numbers only on narrow screens |
| Clear-filters button | `hidden md:flex` (the sheet has its own "Clear all") |

`FilterSheet`'s `md:contents` is worth calling out: it makes the desktop wrapper vanish from
the layout box tree so the `Select`s become direct flex children of the toolbar. Reuse that
trick rather than duplicating filter markup.

---

Next: [03 — Components](./03-components.md)
