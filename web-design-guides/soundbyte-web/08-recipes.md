# 08 — Recipes

Copy-paste starting points, written in the **target** system (tokens, one focus
convention, three radii) rather than the current mixed state. Where a recipe
depends on a fix from [07](07-consistency-audit.md), it says so.

---

## 8.1 A new authenticated page

```tsx
// src/app/(me)/discover/page.tsx
"use client";

import { useAuth } from "@/context/AuthProvider";
import Tracks from "@/components/tracks";
import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import { StreamingProviderClient } from "@/lib/streaming-provider-client";
import type { SoundCloudTrack } from "@/types/soundcloud-playlist";
import type { SoundCloudPaginatedResponse } from "@/types/soundcloud-paginated-response";

const PAGE_SIZE = 24;

export default function Page() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const { data, nextHref, isLoading, fetchPage } = usePaginatedFetch<SoundCloudTrack>(
    (opts): Promise<SoundCloudPaginatedResponse<SoundCloudTrack[]>> =>
      StreamingProviderClient.tracks({
        provider: "soundcloud",
        userId: userId ?? "",
        limit: PAGE_SIZE,
        nextHref: opts?.next ? nextHref : undefined,
      }),
    [userId]
  );

  // Guard AFTER all hooks — see 07 §C9.
  if (!userId) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold">Discover</h1>

      <Tracks
        tracks={data}
        title="Trending"
        hasMore={!!nextHref}
        isLoading={isLoading}
        onLoadMore={() => fetchPage({ next: true })}
      />
    </div>
  );
}
```

Notes:

- No `<main>` — `(me)/layout.tsx` already provides it ([06](06-accessibility.md#-multiple-main-elements)).
- Responsive page padding, not `m-8` ([02](02-layout.md#23-containers)).
- All hooks before any conditional return.
- Add `export const metadata = { title: "Discover" }` once the root template
  from [05](05-content-and-state.md#55-copy-voice) is in place — note this
  requires the page to be a server component or a `layout.tsx` sibling, since
  `"use client"` pages can't export `metadata`.

---

## 8.2 A collection section

The shared wrapper that `Tracks`, `Comments`, and `Playlists` should all become:

```tsx
// src/components/collection.tsx
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type CollectionProps<T> = {
  items?: T[] | null;
  title: string;
  emptyTitle?: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
  children: (item: T, index: number) => React.ReactNode;
};

export function Collection<T>({
  items, title, emptyTitle, isLoading, hasMore, onLoadMore, className, children,
}: CollectionProps<T>) {
  if (!items?.length) {
    return (
      <section className="mt-6">
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        <EmptyState title={emptyTitle ?? `No ${title.toLowerCase()} yet`} />
      </section>
    );
  }

  return (
    <section className="mt-6">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>

      <div className={className}>{items.map(children)}</div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" onClick={onLoadMore} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoading ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </section>
  );
}
```

Usage:

```tsx
<Collection
  title="Tracks"
  items={tracks}
  hasMore={!!nextHref}
  isLoading={isLoading}
  onLoadMore={() => fetchPage({ next: true })}
  className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
>
  {(track) => <Track key={track.id} track={track} />}
</Collection>
```

---

## 8.3 Empty state

```tsx
// src/components/empty-state.tsx
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-10 text-center backdrop-blur-md">
      {Icon && <Icon className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden />}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

```tsx
<EmptyState
  icon={Music}
  title="No tracks yet"
  description="Connect SoundCloud to pull your catalog into SoundByte."
  action={<Button variant="brand" asChild><Link href="/settings">Connect SoundCloud</Link></Button>}
/>
```

---

## 8.4 Loading skeleton

Match the shape of what's coming, not a generic spinner.

```tsx
// src/components/track-skeleton.tsx
export function TrackSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3 backdrop-blur-md">
      <div className="mb-3 aspect-square animate-pulse rounded-xl bg-muted" />
      <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function TrackGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      role="status"
      aria-label="Loading tracks"
    >
      {Array.from({ length: count }, (_, i) => <TrackSkeleton key={i} />)}
    </div>
  );
}
```

The full state ladder at a call site:

```tsx
if (error)          return <ErrorState onRetry={refetch} />;
if (isLoading && !tracks?.length) return <TrackGridSkeleton />;
if (!tracks?.length) return <EmptyState title="No tracks yet" />;
return <Grid tracks={tracks} />;
```

---

## 8.5 Glass card

The canonical content surface.

```tsx
<section className="rounded-xl border border-border bg-card/60 p-6 shadow-sm backdrop-blur-md">
  <h2 className="mb-4 text-lg font-semibold">Section title</h2>
  {children}
</section>
```

Interactive variant:

```tsx
<article
  className="group rounded-xl border border-border bg-card/60 p-6 shadow-sm
             backdrop-blur-md transition-all duration-300
             hover:-translate-y-1 hover:border-border/70 hover:shadow-lg"
>
```

---

## 8.6 Stat tile

Lifted from `profile.tsx` — value over label in an inset well.

```tsx
function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-background/40 p-3 text-center">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
  <Stat label="Followers" value={formatNumber(profile.followers_count)} />
  <Stat label="Tracks"    value={formatNumber(profile.track_count)} />
  <Stat label="Likes"     value={formatNumber(profile.public_favorites_count)} />
  <Stat label="Reposts"   value={formatNumber(profile.reposts_count)} />
</div>
```

---

## 8.7 Artwork tile with hover reveal

The signature move, with keyboard and touch parity added
([06](06-accessibility.md#63-hover-only-content)).

```tsx
<article className="group overflow-hidden rounded-xl border border-border bg-card/60
                    shadow-sm backdrop-blur-md transition-all duration-300
                    hover:-translate-y-1 hover:shadow-lg">
  <div className="relative overflow-hidden">
    <div className="aspect-square bg-muted">
      <img
        src={artwork(track.artwork_url) ?? artwork(track.user.avatar_url) ?? PLACEHOLDER}
        alt=""
        className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    </div>

    {/* scrim */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t
                    from-black/60 via-transparent to-transparent opacity-0
                    transition-opacity duration-300
                    group-hover:opacity-100 group-focus-within:opacity-100" />

    {/* play — always visible on touch, revealed on pointer devices */}
    <button
      onClick={handlePlay}
      aria-label={isThisPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
      className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2
                 items-center justify-center rounded-full bg-white/95 shadow-lg
                 backdrop-blur-sm transition-all duration-300
                 hover:scale-105 hover:bg-white
                 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50
                 md:scale-75 md:opacity-0
                 md:group-hover:scale-100 md:group-hover:opacity-100
                 md:group-focus-within:scale-100 md:group-focus-within:opacity-100"
    >
      {isThisPlaying ? <Pause className="size-6 text-gray-900" />
                     : <Play className="ml-0.5 size-6 text-gray-900" />}
    </button>

    {/* metric pills — hover enhancement only; the real numbers live in the body */}
    <div className="absolute inset-x-4 top-4 flex justify-between opacity-0
                    transition-all duration-300 translate-y-2
                    group-hover:translate-y-0 group-hover:opacity-100
                    group-focus-within:translate-y-0 group-focus-within:opacity-100">
      <MetricPill icon={Headphones} value={track.playback_count} tone="neutral" />
      <MetricPill icon={Heart} value={track.favoritings_count} tone="like" filled />
    </div>
  </div>

  <div className="space-y-2 p-3">
    <Link href={`/tracks/${track.id}`}
          className="block text-base font-semibold leading-tight transition-colors
                     duration-200 hover:text-brand
                     focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
      <span className="line-clamp-2">{track.title}</span>
    </Link>
    <Link href={`/users/${track.user.id}`}
          className="block text-sm text-muted-foreground transition-colors
                     duration-200 hover:text-foreground">
      {track.user.username ?? track.user.full_name}
    </Link>
    <SongStatsBar {...track} className="space-y-2 border-t border-border pt-2" />
  </div>
</article>
```

### Metric pill

```tsx
const TONES = {
  neutral: "bg-black/50",
  like:    "bg-red-500/90",
  repost:  "bg-green-500/90",
  comment: "bg-blue-500/90",
} as const;

function MetricPill({ icon: Icon, value, tone, filled, label }: MetricPillProps) {
  return (
    <span className={cn(
      "flex items-center gap-1 rounded-full px-3 py-1.5 backdrop-blur-sm",
      TONES[tone]
    )}>
      <Icon className="size-3 text-white" fill={filled ? "currentColor" : "none"} aria-hidden />
      <span className="text-xs font-medium text-white">{formatCount(value)}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
```

Keep the tone→meaning mapping fixed: neutral = plays, red = likes,
green = reposts, blue = comments.

---

## 8.8 Form section

Once `Card`, `Label`, `Input`, and `Checkbox` primitives exist:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BasicInfoSection({ formData, onInputChange }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Basic information</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => onInputChange("email", e.target.value)}
            aria-describedby="email-hint"
          />
          <p id="email-hint" className="text-xs text-muted-foreground">
            Used for account notifications. Never shown on your public profile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="public"
            checked={formData.public}
            onCheckedChange={(v) => onInputChange("public", v === true)}
          />
          <Label htmlFor="public" className="font-normal">Make my profile public</Label>
        </div>
      </CardContent>
    </Card>
  );
}
```

Grouped controls get a fieldset:

```tsx
<fieldset className="space-y-3">
  <legend className="text-sm font-medium">Favorite genres</legend>
  <p className="text-sm text-muted-foreground">Pick the genres you release in.</p>
  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
    {genres.map((g) => (
      <div key={g.id} className="flex items-center gap-2">
        <Checkbox id={`genre-${g.id}`} checked={isSelected(g)} onCheckedChange={() => onToggle(g)} />
        <Label htmlFor={`genre-${g.id}`} className="font-normal">{g.name}</Label>
      </div>
    ))}
  </div>
</fieldset>
```

---

## 8.9 Form actions row

```tsx
<div className="flex items-center justify-between gap-3">
  {profile && (
    <Button type="button" variant="destructive" onClick={() => setShowDelete(true)}>
      Delete profile
    </Button>
  )}
  <Button type="submit" variant="brand" disabled={saving} className={!profile ? "ml-auto" : ""}>
    {saving && <Loader2 className="size-4 animate-spin" />}
    {saving ? "Saving…" : profile ? "Update profile" : "Create profile"}
  </Button>
</div>
```

Destructive left, primary right, `ml-auto` keeps the primary right-aligned when
the destructive button is absent.

---

## 8.10 Destructive confirmation

The `DeleteConfirmModal` interaction, in a real `Dialog`.

```tsx
export function DeleteProfileDialog({ open, onOpenChange, onConfirm }: Props) {
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const canDelete = text === "DELETE" && !deleting;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!deleting) { setText(""); onOpenChange(v); } }}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-6 text-destructive" aria-hidden />
            </div>
            <div className="text-left">
              <DialogTitle>Delete profile</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm">Deleting your profile permanently removes:</p>
          <ul className="ml-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Your profile information</li>
            <li>Your genre preferences</li>
            <li>Your social links</li>
            <li>Your subscription data</li>
          </ul>
          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <span className="font-bold text-destructive">DELETE</span> to confirm
            </Label>
            <Input id="confirm" value={text} disabled={deleting}
                   onChange={(e) => setText(e.target.value)}
                   placeholder="DELETE" autoComplete="off" />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={deleting}>Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={!canDelete}
            onClick={async () => { setDeleting(true); try { await onConfirm(); } finally { setDeleting(false); } }}
          >
            {deleting && <Loader2 className="size-4 animate-spin" />}
            {deleting ? "Deleting…" : "Delete profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 8.11 Feedback banner

```tsx
type BannerProps = { tone: "success" | "error"; children: React.ReactNode };

const BANNER = {
  success: "border-green-200 bg-green-50 text-green-700",
  error:   "border-red-200 bg-red-50 text-red-700",
} as const;

export function Banner({ tone, children }: BannerProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={cn("rounded-md border p-4 text-sm", BANNER[tone])}
    >
      {children}
    </div>
  );
}
```

For transient confirmations ("Saved", "Connected to SoundCloud"), prefer
`sonner` toasts over a banner — banners should be reserved for persistent,
page-scoped state.

---

## 8.12 Badge

Generalizes `PlanBadge`, the genre chip, tags, and "Popular" into one component.

```tsx
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full text-xs font-semibold " +
  "transition-all duration-200 shrink-0",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-muted-foreground",
        brand:   "bg-brand-subtle text-brand-hover",
        outline: "border border-border bg-transparent text-foreground",
        gold:    "bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/30 ring-1 ring-yellow-400/40",
        pro:     "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 ring-1 ring-orange-400/30",
        go:      "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30",
        free:    "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/20 ring-1 ring-gray-400/30",
      },
      size: { sm: "px-2 py-1", md: "px-3 py-1.5" },
      interactive: { true: "hover:scale-105 hover:shadow-xl", false: "" },
    },
    defaultVariants: { variant: "neutral", size: "md", interactive: false },
  }
);
```

The gradient + colored-glow + matching-ring recipe is the app's "premium object"
treatment. Reserve it for tiers and achievements; use `neutral`/`outline` for
tags and genres so the premium variants keep their meaning.

---

## 8.13 Formatters

```ts
// src/lib/format.ts
export function formatCount(n?: number): string {
  if (!n) return "0";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function formatNumber(n?: number): string {
  return (n ?? 0).toLocaleString("en-US");
}

/** Accepts milliseconds — everything in the SoundCloud domain is ms. */
export function formatDuration(ms?: number): string {
  if (!ms || Number.isNaN(ms)) return "0:00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatRelative(iso: string): string {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1)   return "Just now";
  if (hours < 24)  return `${hours}h ago`;
  if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
  return formatDate(iso);
}

export type ArtworkSize = "t50x50" | "t300x300" | "t500x500";
export function artwork(url?: string | null, size: ArtworkSize = "t300x300"): string | null {
  return url?.replace("-large", `-${size}`) ?? null;
}
```

Render dates with real semantics:

```tsx
<time dateTime={iso} title={formatDate(iso)}>{formatRelative(iso)}</time>
```

---

## 8.14 Adding a design token

1. `globals.css` → `:root { --my-token: oklch(…); }`
2. `globals.css` → `.dark { --my-token: oklch(…); }`
3. `globals.css` → `@theme inline { --color-my-token: var(--my-token); }`
4. Use it: `bg-my-token`, `text-my-token`, `border-my-token`

Never introduce a raw hex or a Tailwind palette literal into a component. If you
need a color that isn't a token, that is the signal to add a token.

---

## 8.15 Pre-merge checklist

- [ ] Colors are tokens, not `bg-white` / `text-gray-*` / `bg-blue-600`
- [ ] Radius is `rounded-md` (control), `rounded-xl` (surface), or
      `rounded-full` (object)
- [ ] Elevation is `shadow-sm` at rest, `shadow-lg` on hover or when floating
- [ ] Buttons are `<Button variant=…>`, not raw `<button>` with classes
- [ ] Inputs are `<Input>` with a `<Label htmlFor>`
- [ ] Type uses the ladder from [01](01-foundations.md#-drift-no-fixed-heading-ladder)
- [ ] Container is `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`
- [ ] Grid has a `md:` step and starts at 2 columns for media
- [ ] All four states handled: loading (skeleton), empty, error, loaded
- [ ] Transitions are 200 / 300 / 500ms and respect `prefers-reduced-motion`
- [ ] Nothing essential is hover-only
- [ ] Focus is visible on every interactive element
- [ ] Accessibility checklist from [06](06-accessibility.md#69-checklist-for-new-work)
- [ ] Formatters imported from `@/lib/format`, not redefined
</content>
