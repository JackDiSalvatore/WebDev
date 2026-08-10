# 05 — Content & State

Formatters, copy voice, and the four states every screen must handle.

---

## 5.1 Number formatting

**Observed.** The same `formatCount` is copy-pasted into three files —
`track.tsx:31`, `track-details.tsx:40`, `song-stats-bar.tsx:12` — byte for byte:

```ts
const formatCount = (count: number | undefined): string => {
  if (!count) return "0";
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000)     return `${(count / 1_000).toFixed(1)}K`;
  return count.toLocaleString();
};
```

| Input | Output |
| --- | --- |
| `undefined` / `0` | `0` |
| `847` | `847` |
| `1_240` | `1.2K` |
| `999_999` | `1000.0K` ⚠ |
| `2_400_000` | `2.4M` |

Meanwhile `profile.tsx:103-118` uses full grouping for the same class of number:

```tsx
profile.followers_count.toLocaleString("en-US")   // "1,240"
```

**Rule.** One formatter, in `src/lib/format.ts`, with two modes:

```ts
/** Compact: for pills, cards, dense rows. 1.2K / 2.4M */
export function formatCount(n?: number): string {
  if (!n) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Exact: for profile stats and anywhere the precise figure is the point. */
export function formatNumber(n?: number): string {
  return (n ?? 0).toLocaleString("en-US");
}
```

`Intl.NumberFormat` with `notation: "compact"` fixes the `999_999 → "1000.0K"`
bug (it yields `1M`) and localizes for free.

**Convention:** compact inside cards and pills, exact on the profile hero.

---

## 5.2 Time formatting

Two duplicated implementations.

**Track duration / playback position** — `m:ss`, in `track-details.tsx:24`,
`soundcloud-player.tsx:256`:

```ts
function formatTime(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds)) return "0:00";
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
```

Note the unit mismatch at the call sites: `track-details.tsx:181` passes
`Math.ceil(track.duration / 1000)` (SoundCloud returns ms), while the player
passes `audio.currentTime` (already seconds). The function takes seconds; do the
conversion at the boundary, not inline.

**Comment timestamp** — `comment.tsx:17` takes **milliseconds** and does the
same math with a `/ 60000` divisor. Same output format, different unit, same
name. That is exactly the kind of collision that produces a bug.

**Rule.**

```ts
export function formatDuration(ms?: number): string {
  if (!ms || Number.isNaN(ms)) return "0:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
```

Everything in the domain is milliseconds (SoundCloud's `duration`, comment
`timestamp`); convert `audio.currentTime * 1000` at the one call site that isn't.
Tracks over an hour should render `h:mm:ss` — currently a 75-minute DJ set shows
as `75:00`.

---

## 5.3 Date formatting

**Relative** — `comment.tsx:23`:

| Age | Output |
| --- | --- |
| < 1 hour | `Just now` |
| < 24 hours | `5h ago` |
| < 168 hours (7d) | `3d ago` |
| ≥ 7 days | `10/4/2025` (locale short) |

**Absolute** — `track-details.tsx:31`:

```ts
date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
// → "Oct 4, 2025"
```

**Rule.** Keep both, move both to `src/lib/format.ts`, and pair them: relative
text as the visible label, absolute as the `title`/tooltip.

```tsx
<time dateTime={iso} title={formatDate(iso)}>{formatRelative(iso)}</time>
```

Using `<time dateTime>` is free semantics and lets assistive tech announce the
real date. Also consider `Intl.RelativeTimeFormat` so "3d ago" localizes.

---

## 5.4 Artwork sizing

SoundCloud serves artwork at a size encoded in the URL. The app rewrites it:

| Call | Rendered at | Where |
| --- | --- | --- |
| `.replace("-large", "-t50x50")` | 32px avatar | `track-details.tsx:137` |
| `.replace("-large", "-t300x300")` | Card artwork, 256px hero | `track.tsx:45`, `track-details.tsx:101` |
| `.replace("-large", "-t500x500")` | Blurred background bloom | `track-details.tsx:89` |

**Rule.** Wrap it, don't inline it:

```ts
type ArtworkSize = "t50x50" | "t300x300" | "t500x500";
export function artwork(url: string | null | undefined, size: ArtworkSize = "t300x300") {
  return url?.replace("-large", `-${size}`) ?? null;
}
```

**Fallback chain** (consistent across `track.tsx`, `track-details.tsx`,
`track-search-result.tsx`):

```
track.artwork_url → track.user.avatar_url → "/file.svg"
```

⚠ `/file.svg` is a leftover Next.js starter asset (a generic document icon), as
are `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` in `public/`. Ship a
real branded placeholder — a muted square with the SoundByte mark — and delete
the starter files. `track-details.tsx` references
`/placeholder-artwork.jpg` and `/placeholder-avatar.jpg`, **neither of which
exists in `public/`** — those are broken images today.

---

## 5.5 Copy voice

**Observed.** Two voices, matching the two registers.

**Marketing** — aspirational, professional-artist framing, title case headlines:

> Professional Artist Profiles · Powered by SoundCloud
> Create stunning artist profiles, showcase your music catalog, and connect
> with the rising music community.
> Ready to Elevate Your Music Career?
> Built specifically for serious artists who want to elevate their online presence

**Product** — terse, sentence case, direct:

> Connect a streaming provider:
> Select the genres you're most interested in
> No social links added yet. Click "Add Link" to get started.
> This action cannot be undone

**Rule.**

- Sentence case for all product UI. Title Case only in marketing headlines.
- Buttons are verbs: *Save*, *Connect SoundCloud*, *Add Link*, *Delete Profile*,
  *Load More*. Never "Submit" or "OK."
- Loading labels are the present participle of the verb: *Saving…*,
  *Connecting…*, *Deleting…* — the codebase already does this well.
- Errors say what failed and what to do:
  *"Failed to save profile. Please try again."* ✅
- Destructive copy is explicit about consequence and enumerates what is lost —
  `delete-confirm-modal.tsx` is the model.

⚠ Placeholder copy to fix before launch:

| Location | Current | Problem |
| --- | --- | --- |
| `app/layout.tsx:19` | `description: "App description goes here"` | Ships as the meta description |
| `app/layout.tsx:18` | `title: "SoundByte Web App"` | Should be a real title template |
| `header.tsx:19` | `<span className="font-bold">My App</span>` | Brand lockup is literally "My App" |
| `footer.tsx:5` | `Footer` | Placeholder text |
| `user-dropdown-menu.tsx:28` | `alt="@shadcn"` | Scaffolding alt text |

**Rule.** Root metadata should be:

```tsx
export const metadata: Metadata = {
  title: { default: "SoundByte", template: "%s · SoundByte" },
  description: "Professional artist profiles powered by SoundCloud.",
};
```

Then each route exports its own `title`. No route currently does.

---

## 5.6 The four states

Every data surface must handle: **empty**, **loading**, **error**, **loaded**.

### Empty — solved, and consistent

Duplicated verbatim in `profile.tsx:20`, `tracks.tsx:21`, `comments.tsx:21`,
`playlists.tsx:25`:

```tsx
<section className="max-w-7xl mx-auto mt-6">
  <div className="bg-card/60 backdrop-blur-md border border-border rounded-xl p-6 text-center">
    <p className="text-sm text-muted-foreground">No Tracks found.</p>
  </div>
</section>
```

**Rule.** Extract to `<EmptyState>` and give it an optional icon and action:

```tsx
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-10 text-center backdrop-blur-md">
      {Icon && <Icon className="mx-auto mb-3 size-8 text-muted-foreground" />}
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

Copy should be capitalized consistently — currently "No Tracks found.",
"No Comments.", "No playlists found.", "No profile found.", "No bio provided."
mix capitalization and punctuation.

### Loading — unsolved

| Location | Current |
| --- | --- |
| `(me)/layout.tsx:34` | `<div>Loading...</div>` — unstyled, top-left of viewport |
| `tracks/[id]/page.tsx:65` | `<>Loading...</>` — bare fragment |
| `profile/page.tsx:280` | `min-h-screen flex items-center justify-center` + `text-lg` |
| `settings/page.tsx:142` | centered `text-gray-500` |
| Collections | Load More button label only; no first-load state |

Four different treatments and one that renders raw text with no container.

**Rule.** Skeletons that match the shape of the content, not spinners:

```tsx
// track card skeleton
<div className="rounded-xl border border-border bg-card/60 p-3">
  <div className="mb-3 aspect-square animate-pulse rounded-xl bg-muted" />
  <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
</div>
```

Render `count` skeletons matching the grid while `isLoading && !data.length`.
Add `npx shadcn@latest add skeleton`.

Route-level loading belongs in `loading.tsx` files, which App Router will stream
automatically — none exist today.

### Error — partially solved

Two banner styles, discussed in [01](01-foundations.md#14-semantic-status-colors):

```tsx
// profile/page.tsx:307 — 50/700/200
`p-4 rounded-md ${type === "success"
  ? "bg-green-50 text-green-700 border border-green-200"
  : "bg-red-50 text-red-700 border border-red-200"}`

// settings/page.tsx:151 — 100/800/200
`mb-4 p-3 rounded-md ${type === "success"
  ? "bg-green-100 text-green-800 border border-green-200"
  : "bg-red-100 text-red-800 border border-red-200"}`
```

Plus a third, inline, in the player (`soundcloud-player.tsx:388`):
`bg-red-50 border border-red-200 rounded-lg p-3` with a dismiss `X`.

Auto-dismiss exists in settings (5s `setTimeout`) but not in profile, where the
banner persists forever.

Fetch errors elsewhere go to `console.error` only — `library/page.tsx`,
`users/[id]/page.tsx`, and `tracks/[id]/page.tsx` have no error UI at all. If
SoundCloud is down, those pages show an empty state that says "No Tracks found."
— which is a lie.

**Rule.**

- Install `sonner` for transient feedback (saves, connects, disconnects).
- Reserve inline banners for persistent, page-scoped problems.
- Every `useFetch` / `usePaginatedFetch` call site must render its error, and
  the empty state must distinguish "nothing here" from "we couldn't load this."

```tsx
if (error)         return <ErrorState onRetry={refetch} />;
if (isLoading)     return <SkeletonGrid count={12} />;
if (!items.length) return <EmptyState title="No tracks yet" … />;
return <Grid items={items} />;
```

### Loaded

The one thing to add: `aria-live` regions so async results are announced. See
[06](06-accessibility.md).

---

## 5.7 Pagination

Cursor-based, driven by SoundCloud's `next_href`:

```tsx
const { data, nextHref, isLoading, fetchPage } = usePaginatedFetch<T>(
  (opts) => Client.method({ …, nextHref: opts?.next ? nextHref : undefined }),
  [deps]
);
…
<Collection hasMore={!!nextHref} isLoading={isLoading} onLoadMore={() => fetchPage({ next: true })} />
```

Page sizes vary by collection: tracks 10, playlists 25, likes 25, comments 25,
user tracks 25.

⚠ Tracks load 10 at a time into a grid that shows 6 across at `lg:` — so the
first page is 1⅔ rows. Use a page size that is a multiple of the widest column
count (12 or 24 for a 6-col grid).

**Rule.** Standardize on 24 and centralize it as `const PAGE_SIZE = 24`.

⚠ `playlists.tsx` has its Load More block commented out (lines 94–104), so
playlists silently cap at 25 with no way to see more.

---

## 5.8 Debounce and timing constants

| Value | Purpose | File |
| --- | --- | --- |
| 300ms | Search input debounce | `search-input.tsx:21` |
| 500ms | Tooltip open delay | `app/layout.tsx:33` |
| 5000ms | Notification auto-dismiss | `settings/page.tsx:66` |
| 2000ms | Marquee start delay | `globals.css:143` |

These are sensible. Move them into a `src/lib/constants.ts` so they are tunable
in one place rather than buried in components.
</content>
