# 03 — Components

Catalog, anatomy, variants, and when to reach for which.

---

## 3.1 The two tiers

```
src/components/
├── ui/                     tier 1 — shadcn primitives, vendored, unmodified
│   ├── avatar.tsx  button.tsx  dialog.tsx  dropdown-menu.tsx
│   ├── input.tsx   label.tsx   tooltip.tsx
├── soundbyte-profile/      tier 2 — form sections for the profile editor
│   ├── basic-info-section.tsx      genres-section.tsx
│   ├── social-links-section.tsx    subscription-section.tsx
│   └── delete-confirm-modal.tsx
└── *.tsx                   tier 2 — product components
    header · footer · profile · track · tracks · track-details
    track-search-result · playlists · comment · comments · player
    player-overlay · soundcloud-player · search-input · song-stats-bar
    plan-badge · sign-in · sign-out · sign-in-dialog · user-dropdown-menu
```

**Rule.** `ui/` is generated code. Do not hand-edit it — re-run
`npx shadcn@latest add <component>` instead, and put customizations in tier 2
wrappers or in `className` overrides at the call site.

### Component conventions

- `export default function` for product components; **named** export for
  `ui/` primitives, `soundbyte-profile/*` sections, `PlanBadge`, and
  `UserDropdownMenu`.
- Files are kebab-case, components PascalCase.
- Props typed inline via `type Props = { … }` or `type XProps = { … }`.
- `"use client"` on anything with state, context, or handlers — which is
  nearly everything. There are no server components in the tree beyond the
  layouts' static parts.
- `className` is accepted as a prop on layout-ish components (`Header`,
  `Footer`, `SignIn`, `SignOut`, `SongStatsBar`, `Comment`, `Player`).

⚠ `SignIn`, `SignOut`, `Player`, `Footer`, and `SongStatsBar` type `className`
as **required** `string`, not `className?: string`. Every call site is forced to
pass one, which is why long literal class strings are scattered through pages.
Make it optional and give the component a sensible default.

---

## 3.2 Button

`src/components/ui/button.tsx` — CVA, six variants, four sizes.

Base:

```
inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
text-sm font-medium transition-all shrink-0 outline-none
disabled:pointer-events-none disabled:opacity-50
[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
aria-invalid:ring-destructive/20 aria-invalid:border-destructive
```

| Variant | Fill |
| --- | --- |
| `default` | `bg-primary text-primary-foreground shadow-xs hover:bg-primary/90` |
| `destructive` | `bg-destructive text-white shadow-xs hover:bg-destructive/90` |
| `outline` | `border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground` |
| `secondary` | `bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80` |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` |
| `link` | `text-primary underline-offset-4 hover:underline` |

| Size | Metrics |
| --- | --- |
| `default` | `h-9 px-4 py-2 has-[>svg]:px-3` |
| `sm` | `h-8 px-3 gap-1.5 has-[>svg]:px-2.5` |
| `lg` | `h-10 px-6 has-[>svg]:px-4` |
| `icon` | `size-9` |

Note the `has-[>svg]:` selectors auto-tighten horizontal padding when the button
contains an icon. Free, and it's why icon buttons don't look lopsided.

### ⚠ Drift: the Button component is mostly bypassed

`<Button>` appears in only four places (`sign-in`, `sign-out`, `sign-in-dialog`,
`settings`), and three of those override the entire appearance via `className`:

```tsx
// settings/page.tsx:11 — reskins Button into an orange brand button
"bg-orange-500 hover:bg-orange-400 text-white"
// page.tsx:101 — reskins Button into a gradient CTA
"bg-gradient-to-r from-orange-500 to-orange-600 … px-10 py-4 rounded-xl text-lg"
// sign-in-dialog.tsx:34 — reskins Button blue
"w-full bg-blue-500 hover:bg-gray-200 hover:text-black text-white py-2 px-4 rounded"
```

Meanwhile, raw `<button>` elements with bespoke classes appear in `tracks.tsx`,
`comments.tsx`, `track.tsx`, `track-details.tsx`, `soundcloud-player.tsx`,
`comment.tsx`, `social-links-section.tsx`, `delete-confirm-modal.tsx`, and
`profile/page.tsx`.

**Rule.** Add the missing variants to CVA rather than overriding at call sites:

```ts
variant: {
  …,
  brand: "bg-brand text-brand-foreground shadow-xs hover:bg-brand-hover",
  brandGradient:
    "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg " +
    "hover:from-orange-600 hover:to-orange-700",
  transport:
    "rounded-full bg-brand text-white hover:bg-brand-hover " +
    "disabled:opacity-50 disabled:cursor-not-allowed",
},
size: {
  …,
  xl: "h-14 rounded-xl px-10 text-lg",       // marketing CTA
  transport: "size-12 rounded-full",         // player play/pause
  transportSm: "size-9 rounded-full",        // skip back/forward
}
```

Then `<Button variant="brandGradient" size="xl">` replaces every literal.

### Observed ad-hoc button shapes to fold into variants

| Shape | Class | Becomes |
| --- | --- | --- |
| Load More | `px-4 py-2 bg-primary text-white rounded-lg shadow disabled:opacity-50` | `<Button variant="secondary">` |
| Pill action | `flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-full text-white font-semibold` | `variant="brand" size="lg"` + `rounded-full` |
| Form primary | `px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` | `<Button variant="brand">` |
| Form destructive | `px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700` | `<Button variant="destructive">` |
| Small add | `px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700` | `<Button variant="brand" size="sm">` |

⚠ `Load More` uses `bg-primary text-white`. In light mode `--primary` is
near-black, so white text works. In dark mode `--primary` is near-**white** —
white on white. Use `text-primary-foreground`, which flips correctly.

---

## 3.3 Input

`src/components/ui/input.tsx`. Single component, no variants.

```
h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1
text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none
placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground
disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
aria-invalid:ring-destructive/20 aria-invalid:border-destructive
```

`text-base md:text-sm` is deliberate: 16px on mobile prevents iOS Safari from
zooming on focus, 14px on desktop matches the type scale. Preserve this in any
custom field.

### ⚠ Drift: the profile form doesn't use it

Every field in `soundbyte-profile/*` and `delete-confirm-modal.tsx` is a raw
`<input>` with hand-written classes:

```tsx
// basic-info-section.tsx:31
"mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
```

Different border color, different focus ring width, different focus color, no
`aria-invalid` handling, no `disabled` styling, no dark-mode variant, and
`focus:` instead of `focus-visible:` (so the ring appears on mouse clicks too).

**Rule.** All text/email/url fields use `<Input>`. Missing primitives —
`Select`, `Checkbox`, `RadioGroup`, `Textarea` — should be added via
`npx shadcn@latest add select checkbox radio-group textarea` rather than
hand-rolled. See [07](07-consistency-audit.md).

### Label

`ui/label.tsx` exists (Radix `Label`) and is **never imported**. The form
sections write raw `<label className="block text-sm font-medium text-gray-700">`
instead. Use `<Label>`; it handles the `peer-disabled` and
`group-data-[disabled]` states for free.

---

## 3.4 Dialog

`src/components/ui/dialog.tsx` — full Radix set with `data-slot` attributes.

Anatomy:

```tsx
<Dialog>
  <DialogTrigger asChild><Button variant="outline">Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>…</DialogTitle>
      <DialogDescription>…</DialogDescription>
    </DialogHeader>
    {/* body */}
    <DialogFooter>
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Content geometry:

```
fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
grid gap-4 w-full max-w-[calc(100%-2rem)] sm:max-w-lg
rounded-lg border bg-background p-6 shadow-lg duration-200
```

Overlay: `fixed inset-0 z-50 bg-black/50` with fade in/out.
Close button: top-right, `opacity-70 hover:opacity-100`, includes
`<span className="sr-only">Close</span>`.

### ⚠ Two modal implementations

| | `ui/dialog.tsx` | `delete-confirm-modal.tsx` |
| --- | --- | --- |
| Focus trap | ✅ Radix | ❌ none |
| Escape to close | ✅ | ❌ |
| Scroll lock | ✅ | ❌ |
| `aria-modal` / `role="dialog"` | ✅ | ❌ |
| Returns focus on close | ✅ | ❌ |
| Scrim | `bg-black/50` | `bg-black bg-opacity-50` (deprecated in TW v4) |
| Radius | `rounded-lg` | `rounded-lg` |
| Theme-aware | ✅ | ❌ `bg-white` |

`DeleteConfirmModal` is a good *interaction* — type-to-confirm with an explicit
list of what will be destroyed is exactly right for an irreversible action — in
a bad *container*.

**Rule.** Port `DeleteConfirmModal`'s body into `<Dialog>`. Keep the
type-`DELETE`-to-confirm pattern and the "this will remove:" list; it should be
the template for every destructive confirmation.

Also: `sign-in-dialog.tsx` imports `Dialog`, `DialogContent`, `DialogTitle`,
`DialogTrigger`, `DialogClose` **directly from `@radix-ui/react-dialog`** while
importing `DialogHeader`/`DialogFooter` from `./ui/dialog`. That bypasses all
the styling — which is why it needs `className="… p-4 rounded-sm border-1 mt-4
bg-gray-50"` to look like anything, and why it renders without a portal-managed
overlay. Import everything from `@/components/ui/dialog`.

---

## 3.5 Avatar

`ui/avatar.tsx`. `size-8` default, `rounded-full`, `overflow-hidden`, with an
`AvatarFallback` that fills `bg-muted`.

Sizes in use: `size-8` (header, comment), `size-16` (playlist cover),
`w-24 h-24` (profile hero, as a raw `<img>` not the primitive).

The profile hero deliberately uses a native `<img>`:

```tsx
{/* Using native <img> for avatars to avoid requiring next.config image domains */}
<img src={profile.avatar_url ?? "/file.svg"}
     className="w-24 h-24 rounded-full object-cover ring-2 ring-primary/30" />
```

That `ring-2 ring-primary/30` treatment is the profile-hero signature. The badge
overlay sits `absolute -bottom-2 -right-2` on the wrapping `relative` div.

⚠ `user-dropdown-menu.tsx:20` falls back to `https://github.com/shadcn.png` and
`alt="@shadcn"` — leftover scaffolding. Replace with a local placeholder and a
real alt string.

⚠ `user-dropdown-menu.tsx:29` does `fullName[0][0]` with no guard. A user whose
name is an empty string crashes the header.

---

## 3.6 Tooltip

`ui/tooltip.tsx`. `bg-foreground text-background`, `rounded-md px-3 py-1.5
text-xs text-balance`, with a rotated `Arrow` matching the fill. Registered
globally in `app/layout.tsx` with `delayDuration={500}`.

⚠ `profile.tsx:57-66` imports Tooltip from `@radix-ui/react-tooltip` directly
and styles the content `className="bg-gray-100 text-white border-gray-400"` —
**white text on a light gray background**, then wraps a
`text-muted-foreground` paragraph inside it. The tooltip is effectively
invisible. Use `<TooltipContent>` from `@/components/ui/tooltip` and delete the
override.

---

## 3.7 Dropdown menu

`ui/dropdown-menu.tsx` — the full Radix set including sub-menus, checkbox items,
radio items, shortcuts, and a `variant="destructive"` item.

Used once, in `user-dropdown-menu.tsx`: an `<Avatar>` trigger opening a `w-56`
menu with a `DropdownMenuLabel`, a group of three `Link` items, a separator, and
a sign-out row.

```tsx
<DropdownMenuItem asChild>
  <Link className="cursor-pointer" href="/library">Library</Link>
</DropdownMenuItem>
```

`asChild` + `Link` is the right pattern for navigational menu items — it keeps
real anchors for middle-click and open-in-new-tab.

⚠ The sign-out row nests a `<Button>` inside a `DropdownMenuItem`, then
re-colors it `bg-white text-black hover:bg-black hover:text-red-500`. That is a
button inside a menuitem (nested interactive elements) plus a hover state that
inverts to black-on-black-ish. Use
`<DropdownMenuItem variant="destructive" onSelect={handleSignOut}>` — the
variant already styles destructive rows correctly.

---

## 3.8 Product components

### `Track` — the flagship card

`src/components/track.tsx`. The most designed object in the app.

```
┌─────────────────────────┐  article
│ ┌─────────────────────┐ │  group bg-white/80 backdrop-blur-sm
│ │ ▣ 12.3K    ♥ 4.2K   │ │  border-gray-200/50 rounded-3xl shadow-sm
│ │                     │ │  hover:border-gray-300/70 hover:shadow-2xl
│ │        ( ▶ )        │ │  hover:-translate-y-2 transition-all duration-500
│ │                     │ │
│ │ ↻ 890      💬 45    │ │  aspect-square artwork, group-hover:scale-110 (700ms)
│ └─────────────────────┘ │  gradient scrim from-black/60, fades in over 300ms
│ Track Title             │  text-base font-semibold line-clamp-2
│ artist name             │  text-sm text-gray-600
└─────────────────────────┘
```

Layers, bottom to top:

1. `aspect-square` artwork on a `from-gray-50 to-gray-100` gradient placeholder
2. `bg-gradient-to-t from-black/60 via-transparent to-transparent`, opacity 0→1
3. Four stat pills (top-left plays, top-right likes, bottom-left reposts,
   bottom-right comments), each `opacity-0 group-hover:opacity-100` plus
   `translate-y-2 group-hover:translate-y-0`
4. Center play/pause button, `w-16 h-16 bg-white/95 rounded-full shadow-xl`,
   `scale-75 group-hover:scale-100`
5. Status badge when playing: `bg-orange-500 … animate-pulse` "Playing", or
   `bg-gray-500` "Paused"

Artwork resolution: `artwork_url` → user `avatar_url` → `/file.svg`, each with
`.replace("-large", "-t300x300")` to request the right SoundCloud size.

Playing state drives the title color: `text-orange-600` when playing, otherwise
`text-gray-900 hover:text-orange-500`.

⚠ Everything in layers 2–5 is hover-only, so on touch devices the play button
and all four metrics are unreachable. See [06](06-accessibility.md#63-hover-only-content).

### `Tracks` / `Comments` / `Playlists` — collection wrappers

Identical shape, and this is the app's cleanest repeated pattern:

```tsx
export default function Collection({ items, title, onLoadMore, hasMore, isLoading }: Props) {
  if (!items?.length) return <EmptyState label={`No ${title} found.`} />;
  return (
    <section className="max-w-7xl mx-auto mt-6">
      <h3 className="text-lg font-semibold mb-4">{title ?? "…"}</h3>
      <div className="grid …">{items.map(i => <Item key={i.id} … />)}</div>
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button onClick={onLoadMore} disabled={isLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg shadow disabled:opacity-50">
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
}
```

**Rule.** Extract this into a shared `<Collection>` with a `renderItem` prop, or
at minimum extract `<LoadMoreButton>` and `<EmptyState>`. Right now the empty
state markup is duplicated verbatim in four files and the Load More button in
two (plus commented-out in `playlists.tsx`).

⚠ `Tracks` and `Comments` render `{title}: ` with a trailing colon inside the
heading (`"Tracks: "`). `Playlists` does not. Drop the colon everywhere.

### `Profile` — the glass hero

`src/components/profile.tsx`. The canonical `bg-card/60 backdrop-blur-md` card.

```
┌──────────────────────────────────────────────────────────┐
│ ⬤ 96px avatar    Display Name              [View on SC]  │
│   ring-2         @username (tooltip: SoundCloud ID)      │
│   ⌐ PlanBadge    City • Country                          │
│                  bio, line-clamp-3, whitespace-pre-wrap  │
│                  ┌──────┬──────┬──────┬──────┐           │
│                  │ 12.4K│  38  │ 2.1K │  450 │  Stat     │
│                  │Follow│Tracks│Likes │Repost│           │
│                  └──────┴──────┴──────┴──────┘           │
└──────────────────────────────────────────────────────────┘
```

The nested `Stat` sub-component is the pattern for any metric tile:

```tsx
function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-background/40 p-3">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
```

Value above label, `bg-background/40` inset well on a translucent card. Reuse
verbatim.

⚠ "View on SoundCloud" is `bg-orange-500 text-primary-foreground` with
`hover:text-black`. `--primary-foreground` is near-white in light mode so it
happens to work, but it is the wrong token on an orange fill, and the black
hover has poor contrast on orange-500. Use `text-white hover:bg-orange-600`.

### `TrackDetails` — the hero panel

`src/components/track-details.tsx`. The app's richest layout.

- Background: the artwork itself, `bg-cover bg-center blur-xl scale-110
  opacity-30`, with a `from-white/90 via-white/60 to-transparent` scrim over it.
  This "artwork bloom" is a strong signature — reuse for any media detail page.
- Foreground `z-20 p-8`, `flex-col lg:flex-row gap-8`.
- 256px artwork with a `bg-black/40` hover scrim and a 64px play glyph.
- Genre pill: `bg-orange-500/20 text-orange-700 text-sm rounded-full px-3 py-1`.
- Stats row: five `flex items-center gap-2 text-gray-600` items with icons.
- Actions: `rounded-full` pill buttons, primary in orange.
- Body: `grid lg:grid-cols-3` — description + tags at `col-span-2`, a
  definition-list sidebar (Released / BPM / Key / Label / License) at
  `col-span-1`.

The sidebar's row pattern is worth reusing for any metadata list:

```tsx
<div className="flex items-center justify-between">
  <span className="text-gray-600 flex items-center gap-2"><Calendar className="w-4 h-4"/>Released</span>
  <span className="text-gray-900">{formatDate(track.created_at)}</span>
</div>
```

⚠ `track.license.split("-")[0]` at line 331 will throw if `license` is null.
⚠ "Show more"/"Show less" and the SoundCloud link use `text-orange-400
hover:text-orange-300` — the *darker* hover convention is inverted here, and
orange-400 on white fails contrast. Use `text-orange-600 hover:text-orange-700`.

### `SoundCloudPlayer` — the transport bar

`src/components/soundcloud-player.tsx`. Five-region horizontal bar at `md:`,
stacked below.

```
[64px art] Title      ──────●────────  ⏮  (▶)  ⏭    🔇 ────
           artist     0:42       3:15
```

- Artwork: `w-16 h-16 rounded-lg` with an orange square fallback.
- Progress: a `h-2 bg-gray-200 rounded-full` track with a
  `bg-orange-500 rounded-full transition-all duration-100` fill, seek via
  `onClick` + `getBoundingClientRect`.
- Transport: `p-3 bg-orange-500 rounded-full` primary, `p-2 hover:bg-gray-100
  rounded-full` secondaries.
- Loading: `w-6 h-6 border-2 border-white border-t-transparent rounded-full
  animate-spin` inside the play button.
- Volume: `accent-orange-500` on a native range input.
- Error: `bg-red-50 border border-red-200 rounded-lg p-3` with a dismiss `X`.
- Attribution row: "Powered by SoundCloud" left, "View on SoundCloud" right,
  both `text-xs`.

**Rule.** Keep the attribution row — it is a SoundCloud API terms requirement,
not a design choice.

⚠ The progress bar is a `<div onClick>` with no `role`, no `tabIndex`, and no
keyboard seek. See [06](06-accessibility.md).

### `Comment`

`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md
transition-shadow duration-200`. Header row (avatar + username + relative date),
body (`whitespace-pre-wrap`), footer separated by `border-t border-gray-100`
showing the in-track timestamp.

Nice touch: the avatar has an `onError` handler that hides the broken `<img>`
and reveals a `bg-orange-500` initial fallback. Fragile (it walks
`nextElementSibling` and mutates inline styles) but the *intent* is right —
formalize it as a shared `<UserAvatar>` built on Radix `Avatar`, which does this
declaratively.

⚠ The heart button at the footer is an inline hand-written SVG with no
`aria-label` and no onClick. Either wire it up with `<Heart>` from lucide, or
remove it.

### `PlanBadge`

Config-map pattern — a `getPlanConfig(planName)` switch returning
`{ label, icon, gradient, textColor, glowColor, ringColor }`, then one render
path. This is the cleanest variant implementation in the codebase and the model
to follow for any future badge/status component. Consider migrating it to CVA
for consistency with `Button`.

### `SearchInput`

`w-1/2 m-auto my-2 relative` wrapper, an `<Input>`, and an absolutely positioned
results panel:

```tsx
"absolute left-0 right-0 mt-2 bg-white shadow-lg rounded z-10 max-h-80 overflow-y-auto border"
```

300ms debounce via a `useRef` timeout. Enter clears the query.

⚠ `rounded` (4px) is off-scale; `bg-white` is not theme-aware; `z-10` is
discussed in [02](02-layout.md#26-stacking-z-index). There is no combobox
semantics — no `role="combobox"`, no `aria-expanded`, no arrow-key navigation,
no "no results" state.

### `TrackSearchResult`

The least designed component in the app: inline `style={{ cursor: "pointer" }}`,
`style={{ width: 50, height: 50 }}`, an invalid `align-items-center` class (that
is a CSS property, not a Tailwind class), unstyled text, and a clickable `<div>`.

**Rule.** Rewrite as a `<button>` row using the token language:

```tsx
<button onClick={handlePlay}
        className="flex w-full items-center gap-3 p-2 text-left
                   hover:bg-accent focus-visible:bg-accent
                   focus-visible:outline-none">
  <img src={art} alt="" className="size-12 rounded-md object-cover" />
  <div className="min-w-0">
    <div className="truncate text-sm font-medium">{track.title}</div>
    <div className="truncate text-xs text-muted-foreground">{track.user.username}</div>
  </div>
</button>
```

### `Footer`

A placeholder rendering the literal word "Footer" at `text-4xl font-extrabold`.
Unused in the shell (the player occupies the bottom rail). Delete or build it.

### `Player` (Spotify)

`react-spotify-web-playback` wrapper, dead code — Spotify is commented out of
`availableStreamingProviders` in settings. Keep only if multi-provider is on the
roadmap; it is the seam where a second provider would plug in.

---

## 3.9 Missing primitives

Add these before writing another form:

| Primitive | Currently hand-rolled in |
| --- | --- |
| `Select` | `social-links-section.tsx:45` |
| `Checkbox` | `basic-info-section.tsx:37,50`, `genres-section.tsx:31` |
| `RadioGroup` / `Card` selection | `subscription-section.tsx:67,146` |
| `Textarea` | not yet needed, but bios are coming |
| `Badge` | `plan-badge`, genre chip, tags, "Popular" — four hand-rolled pill styles |
| `Card` | four different card treatments across the app |
| `Skeleton` | every loading state is a text string |
| `Alert` / `Toast` | two banner implementations with different shades |
| `Separator` | `border-t border-gray-100` literals |

```sh
npx shadcn@latest add select checkbox radio-group textarea badge card skeleton alert separator sonner
```
</content>
