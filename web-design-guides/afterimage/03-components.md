# 03 — Components

Every primitive in `apps/web/components/`, its API, and the rules for using it.

## Inventory

```
components/
  ui/            18 primitives — shadcn/ui, vendored and restyled
  layout/        app-shell, sidebar, top-bar, bottom-nav, more-sheet, page-header, public-header
  jobs/          CardGlow, GeneratingIndicator, CompletionSparkle, ErrorOverlay,
                 RevealSection, JobProgress, ActiveJobsIndicator, JobToasts, JobBoot
  theme/         ThemeProvider, ThemeToggle, use-theme
  auth/          AuthModal          home/          marketing sections
  characters/    CharacterCard      quick-shots/   9 feature components
  pack/          PackCard, GenerateAllDialog, pack-editor/{tabs,hooks}
  wardrobes/     WardrobeCard, wardrobe-editor/{tabs,hooks}
  character-builder/  {components,steps,hooks} + context
  settings/      DeleteAccountDialog
```

**Import convention:** always from the barrel where one exists —
`@/components/ui/button`, `@/components/layout`, `@/components/jobs`, `@/components/home`.
`cn()` from `@/lib/utils` (clsx + tailwind-merge) merges classes on every primitive; the
`className` prop always wins over defaults.

---

## 1. Button

`components/ui/button.tsx` · CVA · `forwardRef` · `asChild` via Radix `Slot`

**Base:** `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm
font-medium ring-offset-background transition-all duration-150 focus-visible:ring-2
focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none
disabled:opacity-50 active:scale-[0.98]`

| Variant | Styling |
|---|---|
| `default` | `bg-primary text-primary-foreground shadow-soft-sm hover:bg-primary/90 hover:shadow-glow` |
| `destructive` | `bg-destructive text-destructive-foreground shadow-soft-sm hover:bg-destructive/90` |
| `outline` | `border border-input bg-transparent shadow-soft-xs hover:bg-accent hover:text-accent-foreground hover:border-accent` |
| `secondary` | `bg-secondary text-secondary-foreground shadow-soft-xs hover:bg-secondary/80` |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` |
| `link` | `text-primary underline-offset-4 hover:underline` |

| Size | Height |
|---|---|
| `default` | `h-10 px-4 py-2` |
| `sm` | `h-9 px-3 text-xs` |
| `lg` | `h-11 px-8 text-base` |
| `icon` | `h-10 w-10` |

**`loading` prop** — renders a leading `Loader2` spinner, sets `disabled` and
`aria-busy`. Children are wrapped in `<Slottable>` so `loading` composes with `asChild`.

```tsx
<Button loading={saving}>Save</Button>          // ✅ built-in spinner
<Button disabled={saving}>                       // ❌ hand-rolled; drops aria-busy
  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
</Button>
```

Base gap is `gap-2`, so icons need no margin — but much of the codebase still writes
`<Icon className="mr-2 h-4 w-4" />`, which double-spaces. Prefer bare icons in new code.

**Rules**
- One `default` (primary) button per view. Everything else is `outline`/`secondary`/`ghost`.
- `destructive` only for irreversible actions, and always behind a `ConfirmDialog`.
- Wrapping a `Button` in `<Link>` is the established navigation pattern here (not `asChild`).
- Icon-only buttons **must** carry `aria-label`.

---

## 2. Card

`components/ui/card.tsx` — six exports: `Card`, `CardHeader`, `CardTitle`,
`CardDescription`, `CardContent`, `CardFooter`.

```tsx
<div className="rounded-lg bg-card text-card-foreground shadow-soft-md transition-all duration-200" />
```

**No border by default** — depth comes from `bg-card` + `shadow-soft-md`. This is the core
"soft depth" idea. Adding `border` to a card is a deviation; `border-0` appears on library
cards to strip a border that isn't there anyway (legacy noise).

**`interactive` prop** adds `.card-interactive cursor-pointer`, defined in `globals.css`:

```css
.card-interactive { @apply transition-all duration-200 ease-out; }
@media (hover: hover) {                 /* no sticky hover on touch */
  .card-interactive:hover { @apply shadow-lift -translate-y-0.5; }
}
.card-interactive:active { @apply scale-[0.99] -translate-y-0; }
```

Sub-component padding: header/content/footer all `p-6`, with `pt-0` on content and footer;
header stacks at `space-y-1.5`. `CardTitle` is an `<h3>` at `text-xl font-semibold
leading-none tracking-tight`; `CardDescription` is `text-sm text-muted-foreground
leading-relaxed`.

---

## 3. Form controls

All share one visual contract: `bg-surface-1`, `border-input`, `rounded-input` (12px),
`shadow-soft-xs`, `transition-all duration-150`, and on focus
`ring-2 ring-ring ring-offset-2` + `border-ring`.

| Component | Notes |
|---|---|
| `Input` | `h-10 w-full px-3 py-2 text-sm`, `file:` variants for file inputs |
| `Textarea` | `min-h-[80px] px-3 py-2.5 resize-y` |
| `SelectTrigger` | `h-10 justify-between` + `ChevronDown` at `opacity-50`; content is `rounded-lg bg-popover shadow-soft-lg` with Radix side/state animations |
| `Checkbox` | `h-4 w-4 rounded` (8px); checked → `bg-primary` + `shadow-glow`; `Check` icon at `strokeWidth={3}` |
| `Switch` | `h-6 w-11 rounded-full`; checked → `bg-primary` + `shadow-glow`; thumb `h-5 w-5 shadow-soft-md`, `translate-x-5` |
| `Slider` | track `h-2 rounded-full bg-muted`, range `bg-primary`, thumb `h-5 w-5 border-2 border-primary` with `hover:scale-110 hover:shadow-glow active:scale-95` |
| `Label` | `text-sm font-medium leading-none peer-disabled:opacity-70`; always pair with `htmlFor` |

**Field composition**

```tsx
<div className="space-y-1.5">
  <Label htmlFor="prompt" className="text-xs text-muted-foreground">Negative Prompt</Label>
  <Textarea id="prompt" placeholder="Things to avoid…" rows={2} maxLength={500} />
</div>
```

Fields stack with `space-y-4`; two-up rows use `grid grid-cols-2 gap-3`.

There is **no `FormField` / error-message primitive.** Validation surfaces through `toast.error`
plus disabled submit buttons. Character counters are hand-rolled as an absolutely-positioned
`text-xs` in the textarea's bottom-right, turning `text-destructive` near the cap:

```tsx
<div className={cn('absolute bottom-2 right-2 text-xs',
  prompt.length > 1800 ? 'text-destructive' : 'text-muted-foreground/50')}>
  {prompt.length} / 2000
</div>
```

---

## 4. Overlays

### Dialog

`bg-background/80 backdrop-blur-sm` overlay; content is `max-w-lg`, centered by
`left-[50%] top-[50%] translate-[-50%]`, `border bg-card p-6 shadow-soft-xl sm:rounded-lg`,
with fade + `zoom-95` + slide-from-48% enter/exit.

Use for: confirmations and small forms.

### Sheet

Four sides via CVA (`top`/`bottom`/`left`/`right`, default `right`). Overlay is `bg-black/60
backdrop-blur-sm`. Left `w-3/4 sm:max-w-sm`; right `w-3/4 sm:max-w-md`. Enter 500ms, exit
300ms.

Use for: multi-field creation/editing, mobile filter panels, the jobs panel, the mobile
"More" menu.

**Bottom sheets must** carry `rounded-t-2xl` and pad with
`calc(1.5rem + env(safe-area-inset-bottom))`.

### DropdownMenu

Radix, `shadow-lg` content (a non-token shadow — see
[07](./07-conventions-and-gaps.md#g2-non-token-shadow-classes)). Used as the kebab overflow
menu on editor headers.

### ConfirmDialog

`components/ui/confirm-dialog.tsx` — **the only sanctioned way to confirm a destructive
action.** Wraps `Dialog` with title, description, cancel/confirm, loading state, variant, and
an icon slot. Appends `…` to the confirm label while loading (`"Delete" → "Delete…"`). Stops
click propagation so it can live inside clickable cards.

```tsx
<ConfirmDialog
  open={deleteDialogOpen !== null}
  onOpenChange={(open) => !open && setDeleteDialogOpen(null)}
  title="Delete Quick Shot"
  description={<>Are you sure you want to delete &ldquo;{title}&rdquo;? …</>}
  confirmLabel="Delete"
  onConfirm={() => handleDelete(id)}
  loading={deletingId !== null}
  variant="destructive"
  icon={<Trash2 className="mr-2 h-4 w-4" />}
/>
```

### FilterSheet

Responsive filter container. Renders a "Filters" trigger button + bottom sheet under `md`,
and `md:contents` (children promoted into the parent flex row) above. Active filters show a
2px primary dot on the trigger. `children` is rendered **twice** — keep it stateless and
controlled from the page.

---

## 5. Tabs

`TabsList` is a segmented control: `inline-flex h-11 rounded-lg bg-muted p-1 shadow-soft-xs
overflow-x-auto scrollbar-none`, wrapped in a `relative` div that adds a `md:hidden` gradient
fade on the right edge to hint at horizontal scroll.

`TabsTrigger` active state: `data-[state=active]:bg-card data-[state=active]:text-foreground
data-[state=active]:shadow-soft-sm` — the active tab reads as a raised card sitting in a muted
well. `TabsContent` gets `mt-3 animate-fade-in`.

Used for detail/editor pages and `/theme-demo`.

---

## 6. Feedback

### Toaster (sonner)

Configured once in `app/layout.tsx`. `theme="system"`, custom lucide icons, and toasts styled
as cards: `bg-card text-card-foreground border-border shadow-soft-lg rounded-lg`. Each
severity gets a **tinted border only** — `border-emerald-500/20`, `border-destructive/20`,
`border-amber-500/20`, `border-primary/20` — never a filled banner. That is the spec's toast
rule, implemented.

```tsx
toast.success('Quick Shot created!')
toast.error(getApiErrorMessage(error))          // always via lib/toast-helpers
const t = toast.loading('Creating…'); toast.dismiss(t)
toast.success(`${label} complete`, { action: { label: 'View', onClick: () => router.push(route) } })
```

Always extract error text with `getApiErrorMessage(error)` (`lib/toast-helpers.ts`) — it
unwraps `Error`, string, and `{ error: string }` shapes and falls back to
`"An unexpected error occurred"`.

### Progress

Hand-rolled (not Radix): `h-4 w-full rounded-full bg-secondary` track, `bg-primary` fill with
`transition-all duration-300 ease-in-out`, full ARIA (`role="progressbar"`, `aria-valuemin`,
`aria-valuemax`, `aria-valuenow`). Value is clamped internally. Callers usually pass
`className="h-2"`.

### EmptyState / ErrorState

`components/ui/empty-state.tsx`. Shared anatomy:

```
py-16, centered
  icon well:  p-4 rounded-2xl bg-muted/50 mb-6   (bg-destructive/10 for errors)
  icon:       h-10 w-10 text-muted-foreground    (h-12 w-12 in page-level variants)
  title:      text-lg font-semibold mb-2
  description:text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed
  action slot (children)
```

`ErrorState` defaults to *"Something went wrong" / "We couldn't load the data. Please try
again."* with an optional **Try Again** button.

> Several library pages inline this anatomy inside a `Card` instead of importing
> `EmptyState`. Prefer the component; see [07](./07-conventions-and-gaps.md#g4-empty-state-duplication).

### Skeleton

`.skeleton` (globals.css) = `bg-muted` + a `::after` shimmer sweeping
`hsl(var(--foreground) / 0.04)` on a 1.5s loop.

Four exports: `Skeleton`, `SkeletonCard` (bordered card with three bars),
`SkeletonImage` (`square` | `video` | `portrait` aspect), `SkeletonText` (n lines, last at
`w-3/4`).

Skeletons must mirror the real layout — same grid, same aspect ratio, same header — so nothing
jumps on load.

### ErrorBoundary

`components/ui/error-boundary.tsx`, mounted once inside `AppShell` around `<main>`'s children.
Route-level errors also have `app/(dashboard)/error.tsx`.

---

## 7. Job-state components (`components/jobs/`)

The AI-native layer. See [04 — Patterns](./04-patterns.md#3-job-tracking) for wiring.

| Component | Renders |
|---|---|
| `CardGlow` | Wrapper adding `.card-generating` (pulsing primary glow) or `.card-error` (static destructive glow) |
| `GeneratingIndicator` | Four staggered pulsing dots + a `.stage-text-pulse` message + an `aria-live="polite"` mirror |
| `CompletionSparkle` | One-shot radial burst on generating → ready |
| `ErrorOverlay` | Destructive icon well, message, "Stage reached: …", optional Retry |
| `RevealSection` / `RevealGroup` | Fade-in + one-shot shimmer as sections complete; `RevealGroup` staggers children by 100ms |
| `JobProgress` | Status icon + label + `current/total` + `Progress` bar + message |
| `ActiveJobsIndicator` | TopBar activity button with a count badge → Sheet grouping jobs by feature |
| `JobToasts` | Headless; global success/failure toasts with a **View** deep link |
| `JobBoot` | Headless; rehydrates tracked jobs on mount |

---

## 8. PreviewPanel

`components/ui/preview-panel.tsx` — the spec's three-state preview surface, in one component:
`rounded-2xl bg-surface-1 border border-border`, `min-h-[400px]`.

| `state` | Renders |
|---|---|
| `"empty"` | Icon well + "Preview will appear here" + clickable example-prompt chips (`bg-surface-2 hover:bg-surface-3 rounded-full`) |
| `"generating"` | Square skeleton with a `pulse-glow` Sparkles badge + animated progress copy |
| `"result"` | Image with a hover gradient scrim revealing **Regenerate** / **Download** glass buttons, prompt below at `line-clamp-2` |

`EmptyPreview`, `GeneratingPreview`, `ResultPreview` are exported individually for reuse.

---

## 9. Content cards

`QuickShotCard`, `PackCard`, `WardrobeCard`, `CharacterCard` share a template:

```
CardGlow (generating/error)
└ Card interactive={!isGenerating} className="h-full shadow-soft group border-0 relative overflow-hidden"
  ├ CompletionSparkle
  ├ <Link> square thumbnail  (aspect-square bg-muted/50 overflow-hidden)
  │   ├ next/image  object-cover  group-hover:scale-105  + opacity fade on load
  │   ├ generating overlay:  bg-background/60 backdrop-blur-sm + GeneratingIndicator
  │   ├ error overlay:       bg-background/60 backdrop-blur-sm + ErrorOverlay
  │   └ hover scrim:  bg-gradient-to-t from-black/60 → opacity-0 group-hover:opacity-100
  │       ├ status pill  (bottom-left)
  │       └ delete icon button  (bottom-right, rounded-full bg-white/20 hover:bg-red-500/80)
  └ <Link> footer  p-3 → title (text-sm font-medium truncate) + meta (text-xs muted)
```

Conventions to preserve: `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"` on
`next/image`; `imgLoaded` state driving an opacity fade so images don't pop; the card is
non-interactive while generating.

**Status pills** come from `lib/ui-helpers.ts` — use `getStatusBadgeClasses(status)`, never
hand-written colors:

```ts
draft:      'bg-muted text-muted-foreground'
generating: 'bg-primary/10 text-primary'
ready:      'bg-accent/10 text-accent-foreground'
error:      'bg-destructive/10 text-destructive'
```

Pill shape: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium`.

Also in `ui-helpers`: `formatDate` (`"Jan 15, 2024"`), `capitalize`, `formatModelFormat`.

---

## 10. Stepper

`components/ui/stepper.tsx`. Numbered `h-6 w-6 rounded-full` nodes joined by an `h-px w-8`
rule that turns `bg-primary` once passed. Completed nodes show `Check` at `strokeWidth={3}`;
the current node gets `bg-primary shadow-glow`. Labels are `hidden sm:inline`. Steps are
clickable only backwards (`index <= currentStep`). `<nav aria-label="Progress">` + `<ol>`.

`StepContent` wraps each step body in `animate-fade-in`.

---

## 11. Chip / pill vocabulary

Not a component — a recurring inline pattern. Three flavors:

```tsx
// selectable option (aspect ratio, variants)
'px-3 py-1.5 text-xs rounded-md border transition-colors'
selected ? 'bg-primary text-primary-foreground border-primary'
         : 'bg-muted/30 hover:bg-muted/60 text-muted-foreground'

// additive suggestion tag  (prefixed with "+ ")
'px-2.5 py-1 text-xs rounded-full border transition-colors bg-muted/50
 hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-foreground'

// example-prompt chip
'px-3 py-1.5 text-xs rounded-full bg-surface-2 hover:bg-surface-3
 text-muted-foreground hover:text-foreground transition-colors duration-150'
```

If you add a fourth flavor, extract a component instead.

---

Next: [04 — Patterns](./04-patterns.md)
