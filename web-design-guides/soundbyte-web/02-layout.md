# 02 — Layout

App shell, containers, grids, breakpoints, stacking.

---

## 2.1 Route structure

```
src/app/
├── layout.tsx              root: fonts, AuthProvider, TooltipProvider
├── page.tsx                "/" marketing landing (redirects to /library if signed in)
├── globals.css
├── (me)/
│   ├── layout.tsx          authed shell: header + player rails, redirects to "/" if no session
│   ├── library/page.tsx    profile + tracks + likes + playlists
│   ├── profile/page.tsx    SoundByte profile editor
│   ├── settings/page.tsx   streaming provider connections
│   ├── tracks/[providerTrackId]/page.tsx
│   └── users/[providerUserId]/page.tsx
└── api/
    ├── auth/[...all]/route.ts
    └── spotify/callback/route.ts
```

The `(me)` route group is the authenticated product surface. `/` is the only
unauthenticated page and it is a different design register entirely.

**Rule.** Anything behind auth goes in `(me)/` and inherits the shell. Anything
public gets its own layout — do not reuse the marketing register inside `(me)`.

---

## 2.2 The app shell

`src/app/(me)/layout.tsx`:

```tsx
<PlayerProvider>
  <SearchProvider>
    <div className="relative min-h-screen">
      <Header className="fixed inset-x-0 top-0 z-50 flex items-baseline
                         justify-between border-b-2 p-2
                         bg-background/90 backdrop-blur">
        <SearchInput />
      </Header>

      <main className="pt-[64px] pb-[120px]">{children}</main>

      <PlayerOverlay accessToken={soundCloudAccessToken} />
    </div>
  </SearchProvider>
</PlayerProvider>
```

Three fixed bands:

```
┌──────────────────────────────────────────────┐  z-50
│  logo        [ search 50% ]        avatar    │  header, ~64px
├──────────────────────────────────────────────┤
│                                              │
│   main  pt-[64px] pb-[120px]                 │  scrolls
│   ├─ page container (max-w-7xl, m-8)         │
│                                              │
├──────────────────────────────────────────────┤
│ [art] title/artist  ──progress──  ⏮ ▶ ⏭  🔊 │  player, ~120px, z-50
└──────────────────────────────────────────────┘  mounts only when a track plays
```

Header composition (`header.tsx`) is a three-slot bar:

- **Left** — brand lockup, `flex items-center space-x-4`
- **Center** — `{children}`, `flex-1 flex justify-center` (the search input)
- **Right** — `UserDropdownMenu`, `flex items-center space-x-4`

### ⚠ Drift: magic offsets

`pt-[64px] pb-[120px]` are hard-coded guesses at the rail heights. The header is
actually sized by its content (`p-2` + a `h-9` input ≈ 52px, plus the input's
`my-2` ≈ 68px), and the player is `p-2` + a 64px artwork + an attribution row,
which lands well over 120px on narrow screens where the player wraps to
`flex-col`.

**Rule.** Make the heights explicit and derive the offsets:

```css
:root {
  --header-h: 64px;
  --player-h: 120px;
}
```

```tsx
<Header className="fixed inset-x-0 top-0 z-50 h-[var(--header-h)] …" />
<main className="pt-[var(--header-h)] pb-[var(--player-h)]">{children}</main>
```

Better still: only reserve player space when a track is playing. Today the
120px is always reserved even before anything has been played.

### The player is conditional

`PlayerOverlay` returns `null` unless there is both a `playingTrack` and an
`accessToken`. The bottom rail therefore does not exist on a fresh session — but
the `pb-[120px]` gap does. See above.

---

## 2.3 Containers

| Container | Class | Used by |
| --- | --- | --- |
| Product | `max-w-7xl mx-auto` | profile, tracks, comments, playlists, track-details, player |
| Marketing | `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8` | landing page |
| Form | `max-w-2xl mx-auto p-6 space-y-8` | profile editor |
| Full-bleed | none | settings (`flex flex-col m-8`) |

Page-level margin on `(me)` routes is `m-8` on the page's root element:

```tsx
// library/page.tsx
<main className="m-8"> … </main>
// users/[id]/page.tsx and tracks/[id]/page.tsx
<section className="m-8"> … </section>
```

Then each section re-applies `max-w-7xl mx-auto` internally. That is redundant
but harmless, and it means components are self-contained — you can drop
`<Tracks>` anywhere and it centers itself.

### ⚠ Drift: `m-8` gives no responsive padding

`m-8` is a flat 32px at every breakpoint, including 375px phones where it eats
17% of the viewport. The marketing page gets this right with
`px-4 sm:px-6 lg:px-8`.

**Rule.** Product pages use the marketing page's responsive padding:

```tsx
<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
```

---

## 2.4 Breakpoints

Stock Tailwind. Actual usage:

| Prefix | Min width | Used for |
| --- | --- | --- |
| `sm:` | 640px | Track grid 1→3 cols, playlist grid 1→2, dialog max-width, dialog footer row |
| `md:` | 768px | Marketing grids, type scale bumps, player horizontal layout, genre grid |
| `lg:` | 1024px | Track grid →6 cols, playlist grid →3, track detail two-column |

No `xl:` or `2xl:` usage anywhere.

### Responsive layout switches worth knowing

**Player** (`soundcloud-player.tsx:267`) — stacks on mobile, becomes a
horizontal transport bar at `md:`:

```tsx
"flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-2 w-full max-w-7xl mx-auto"
```

**Track detail** (`track-details.tsx:95`) — artwork above info on mobile,
side-by-side at `lg:`:

```tsx
"flex flex-col lg:flex-row gap-8"
```

**Dialog footer** (`ui/dialog.tsx:98`) — buttons stack **reversed** on mobile so
the primary action sits on top, then become a right-aligned row at `sm:`:

```tsx
"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
```

That `flex-col-reverse` is a good detail. Keep it in any custom modal you write.

---

## 2.5 Grids

| Grid | Class | File |
| --- | --- | --- |
| Track cards | `grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4` | `tracks.tsx:33` |
| Playlists | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` | `playlists.tsx:37` |
| Marketing features | `grid-cols-1 md:grid-cols-3 gap-8` | `page.tsx:108` |
| Marketing benefits | `grid-cols-1 md:grid-cols-2 gap-8` | `page.tsx:171` |
| Marketing stats | `grid-cols-3 gap-8` | `page.tsx:193` |
| Profile stats | `grid-cols-4 gap-3` | `profile.tsx:100` |
| Genre checkboxes | `grid-cols-2 md:grid-cols-3 gap-3` | `genres-section.tsx:23` |
| Plan cards | `grid-cols-1 md:grid-cols-2 gap-4` | `subscription-section.tsx:58` |
| Track detail body | `grid-cols-1 lg:grid-cols-3 gap-8` (`lg:col-span-2` + sidebar) | `track-details.tsx:233` |

### ⚠ Drift: the track grid jumps 1 → 3 → 6

At 640px, three square cards in a 640px viewport are ~200px each *before*
gutters — each carries a title, artist, four hover-stat pills and a 64px play
button. At 1024px, six columns are ~160px each. The card is designed at roughly
240px.

**Rule.** Track grid:

```tsx
"grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
```

Two columns on phones (artwork grids read better paired than stacked), then a
column per breakpoint. Same fix applies to the `grid-cols-3` and `grid-cols-4`
stat rows, which have no responsive variant at all and squeeze to unreadable
widths on narrow screens — use `grid-cols-2 sm:grid-cols-4` for the profile
stats.

---

## 2.6 Stacking (z-index)

| z | Layer |
| --- | --- |
| `z-50` | Fixed header, player rail, dialog overlay, dialog content, dropdown content, tooltip content |
| `z-20` | Track detail foreground content (over the artwork bloom) |
| `z-10` | Marketing content (over the radial background), search results dropdown |
| — | Track card overlays use stacking context from `relative`/`absolute`, no explicit z |

### ⚠ Two problems

1. **The search results dropdown is `z-10`** (`search-input.tsx:44`) but lives
   inside a `z-50` header. It works because it inherits the header's stacking
   context — but if the header's z ever changes, or the dropdown is portaled,
   results will render behind the page.
2. **Everything else shares `z-50`.** The dialog overlay and the fixed player
   are both `z-50`; whichever paints later wins. Open a dialog while a track
   plays and the player sits at the same level as the scrim.

**Rule.** Define a scale and use it:

```
z-10   in-page overlays (artwork gradients, badges)
z-20   sticky in-content elements
z-30   fixed app chrome (header, player rail)
z-40   dropdowns, popovers, tooltips anchored to chrome
z-50   modal scrim + modal content
```

Move the header and player to `z-30`, the search dropdown to `z-40`, and leave
dialogs at `z-50`.

---

## 2.7 Page composition patterns

**List page** (`library/page.tsx`) — one hero object, then repeated collections:

```tsx
<main className="m-8">
  <Profile profile={profile} />
  <Tracks tracks={tracks}      title="Tracks"    hasMore={…} onLoadMore={…} />
  <Tracks tracks={likedTracks} title="Likes"     hasMore={…} onLoadMore={…} />
  <Playlists playlists={playlists} title="Playlists" hasMore={…} onLoadMore={…} />
</main>
```

Each collection component owns its own `<section className="max-w-7xl mx-auto mt-6">`,
its heading, its grid, its empty state, and its Load More. That is a good
boundary — the page only wires data.

**Detail page** (`tracks/[id]/page.tsx`) — hero panel, then related collection:

```tsx
<section className="m-8">
  <TrackDetails track={providerTrack} />
  <Comments comments={…} hasMore={…} onLoadMore={…} />
</section>
```

**Form page** (`profile/page.tsx`) — narrow column, centered header, banner slot,
then sections separated by `space-y-8`, with actions in a `justify-between` row
(destructive left, primary right):

```tsx
<div className="max-w-2xl mx-auto p-6 space-y-8">
  <div className="text-center"> <h1/> <p/> </div>
  {message && <Banner />}
  <form className="space-y-8">
    <Section/> <Section/> <Section/> <Section/>
    <div className="flex justify-between items-center">
      <DestructiveButton/>   {/* omitted when not applicable */}
      <PrimaryButton className={!profile ? "ml-auto" : ""}/>
    </div>
  </form>
</div>
```

The `ml-auto` fallback when the destructive button is absent is a neat trick —
the primary button stays right-aligned without a wrapper.

**Rule.** Destructive actions go bottom-left, primary bottom-right, never
adjacent.
</content>
