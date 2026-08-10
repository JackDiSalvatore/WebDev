# 04 — Patterns

The AI-native interaction patterns that make this app what it is.

---

## 1. Prompt-first creation

`components/quick-shots/QuickShotForm.tsx` is the canonical implementation. Reuse it, or copy
its shape, for any new generation surface.

### Anatomy, top to bottom

```
1  Prompt textarea            ← the hero element, everything else is secondary
     rotating placeholder, maxLength 2000, live counter bottom-right
2  Character quick-pick strip (app variant only)
3  Reference upload   ·   "Enhance with AI" switch
4  Constraint notice          "Gemini required for reference images"
5  Suggestion tags            "+ soft lighting"  — appear as you type
6  Settings disclosure        collapsed, summarized as "1:1 | Gemini | 2K"
     └ aspect ratio chips (with proportional glyphs)
       provider · quality  (grid-cols-2 gap-3)
       variants chips
       negative prompt
7  Generate button            full width, Sparkles icon, disabled until prompt is non-empty
```

### The rules this encodes

**Progressive disclosure with a summary.** The advanced panel is closed by default, and its
trigger *shows the current values* so collapsing costs no information:

```tsx
const settingsSummary = `${ratio} | ${provider} | ${quality}`   // "1:1 | Gemini | 2K"
```

The chevron rotates 180° over 300ms; the panel opens with
`animate-in fade-in slide-in-from-top-1 duration-200`.

**Settings persist, content does not.** `outputConfig` is written to
`localStorage['afterimage:quickshot-settings']` on every change and merged over
`DEFAULT_OUTPUT_CONFIG` on load, with invalid providers reset. The prompt itself is never
persisted.

**Suggestions are debounced and subtractive.** `useDebouncedValue(prompt, 300)` →
`getSuggestionsForPrompt()` keyword-matches against `SUGGESTION_TAGS`, filters out tags already
present in the prompt, and caps at 6. Clicking appends with smart comma handling.

**Constraints are explained, not just enforced.** When references are attached, the provider
`Select` is disabled *and* a line of copy says why. Never disable a control silently.

**One form, two variants.** `variant="hero"` (marketing) vs `"default"` (app). Hero mode
swaps in glass styling, a larger textarea, an `h-11` button, and — critically — calls
`onHeroSubmit` instead of the API, handing off to `/quick-shots/new?prompt=…` where the
auto-create effect takes over. Reference IDs cross that boundary via
`sessionStorage['afterimage:hero-refs']`.

**Auto-create shows a card, not a spinner.** When `/quick-shots/new` receives hero params it
renders a card with a spinner *and* the copy "Creating your Quick Shot / Generating your
image…", then `router.replace`s to the detail page. A `useRef` guard prevents double
submission under StrictMode.

### Microcopy source

`lib/form-constants.ts` owns `ASPECT_RATIO_OPTIONS`, `PROVIDER_OPTIONS`, `QUALITY_OPTIONS`
(labelled by resolution — `1K` / `2K` / `4K` with "fastest / balanced / highest detail"),
`VARIANT_OPTIONS`, `SUGGESTION_TAGS`, and `PROMPT_PLACEHOLDERS`. Add options there, not inline.

---

## 2. Library → detail flow

**Library page** — see [02 §4.1](./02-layout.md#41-library-page) for the template. Data comes
from TanStack Query hooks in `lib/query/hooks.ts` with keys from `lib/query/query-keys.ts`.

**Filtering is client-side** over the fetched page: search matches title + prompt
case-insensitively; status and pipeline are exact matches with `'all'` sentinels; filter
option lists are derived from the data (`Array.from(new Set(...))`) and a filter only renders
when it would offer more than one choice.

**Optimistic delete with rollback** — the pattern to copy:

```tsx
const deletedItem = items.find(i => i.id === id)
setDeleteDialogOpen(null); setDeletingId(id)

queryClient.setQueryData(queryKeys.x.list(), old =>
  old ? { ...old, data: old.data.filter(i => i.id !== id) } : old)

try {
  await api.delete(id)
  toast.success('Quick Shot deleted!')
} catch (error) {
  if (deletedItem) queryClient.setQueryData(queryKeys.x.list(), old => old ? {
    ...old,
    data: [...old.data, deletedItem].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  } : old)
  toast.error(getApiErrorMessage(error))
} finally { setDeletingId(null) }
```

Note the dialog closes *before* the request starts — the confirmation is the decision point,
not the result.

**Detail/editor pages** use context + tabs + hooks, decomposed as described in
[02 §4.4](./02-layout.md#44-detail--editor-page). Inline title editing: click the title →
`<input>` styled `bg-transparent border-b border-primary outline-none` at heading size, Enter
saves, Escape cancels, blur saves, then `queryClient.invalidateQueries` + toast.

---

## 3. Job tracking

The async generation pipeline is the most distinctive part of the UI. Architecture:
**Zustand store + WebSocket + per-feature hooks.**

```
stores/job-store.ts        TrackedJob map, wsConnected, subscribeCompleted/subscribeFailed
hooks/use-job-tracker.ts   track(jobId), getJob(id), useAllJobs()
components/jobs/JobBoot    rehydrates tracked jobs on mount        (in (dashboard)/layout)
components/jobs/JobToasts  global terminal-state toasts + View     (in (dashboard)/layout)
components/jobs/job-meta   jobFeature() / jobLabel() / jobRouteFor()
```

### Status vocabulary

Entity status (`quick_shots`, `packs`, `wardrobes`): `draft` → `generating` → `ready` |
`error`.

> **Gotcha:** rows are created as `'draft'` and only flip to `'generating'` once the worker
> picks them up. Every "is this working?" guard must include both:
> ```ts
> const isGenerating = status === 'generating' || status === 'draft'
> ```

Job status (`Job.status`): `pending` · `processing` · `completed` · `failed` · `cancelled`,
labelled *Queued · Processing · Completed · Failed · Cancelled* in `JobProgress`.

### Stage messages

Raw stage keys are mapped to human copy at the component boundary:

```ts
const STAGE_MESSAGES = {
  classifying:      'Analyzing prompt...',
  enhancing:        'Enhancing prompt...',
  loading_refs:     'Loading references...',
  generating_images:'Generating images...',
  storing:          'Saving images...',
  complete:         'Generation complete',
}
// fallback chain: STAGE_MESSAGES[stage] ?? progress.message ?? 'Preparing your quick shot...'
```

Never render a raw stage key. If a new stage appears, add it to the map.

### The card lifecycle

```
draft/generating ──► CardGlow isActive          (.card-generating pulsing primary glow)
                     backdrop-blur overlay + GeneratingIndicator (dots + stage copy)
                     card not interactive
        │
        ├─ ready ──► CompletionSparkle fires once (generating→ready edge)
        │            thumbnail fades in, hover scrim + status pill return
        │            global toast: "<label> complete" [View]
        │
        └─ error ──► CardGlow variant="error"    (.card-error static destructive glow)
                     ErrorOverlay: message + "Stage reached: …" + Retry
                     global toast: "<label> failed" + error description [View]
```

The sparkle is edge-triggered, not state-derived — a `wasGenerating` ref/state guard means a
page reload on a finished item shows no animation.

### Polling + socket, together

Cards poll `jobsApi.list({ …, status: 'processing', limit: 1 })` every **3000ms** while
generating to discover the active job id, then hand that id to `track()` so the WebSocket
supplies live progress. List pages use TanStack `refetchInterval` while any row is active.
Both stop when nothing is generating.

### ActiveJobsIndicator

TopBar entry point. Renders `null` when there are no jobs at all. Shows a count badge of
`pending + processing`. The Sheet groups rows by feature (Packs · Wardrobes · Quick Shots ·
Characters · References · Other), collapses batch children into their parent row
(`meta.batchParentJobId`), shows `current/total` on batch parents, and offers a **View**
deep-link per row. Connection state is a `Wifi`/`WifiOff` icon next to the sheet title.

### JobToasts

Headless safety net for jobs whose originating page has unmounted. Honors `meta.silent` so a
feature that already shows its own success UI can opt out. Always attaches a **View** action
when `jobRouteFor()` resolves a route.

---

## 4. Reveal / staged output

For plans and packs that materialize section by section, `RevealSection` + `RevealGroup`
fade each section in (`content-reveal`, 300ms) with a one-shot `completion-shimmer` (600ms),
staggered 100ms per child. Sections render `null` until revealed.

Use this when output arrives incrementally. Use skeletons when output arrives all at once.

---

## 5. Reference images

`ReferenceImagePicker`, `ReferenceImageThumbnail`, `QuickShotReferenceUpload`,
`reference-upload.tsx`. Each reference carries a **role** — `subject` | `style` |
`composition` — plus an optional `subjectLabel`. Attaching one constrains the provider to
Gemini, which the UI states in copy rather than enforcing silently.

`CharacterQuickPick` is a horizontal strip of saved characters that populates references in
one tap — the "start from something you already made" shortcut.

---

## 6. Auth-gated actions

The hero form does **not** gate on load. The user composes a full prompt, hits Generate, and
only then does `AuthModal` appear — with the pending redirect URL stashed so the action
resumes after sign-in.

```tsx
if (!session && !isPending) {
  setPendingRedirectUrl(redirectUrl)
  setShowAuthModal(true)
  return
}
router.push(redirectUrl)
```

Copy: *"Welcome Back" / "Sign in to generate your image"* — names the action, not the wall.
Note the `!isPending` guard: never flash the modal while the session is still resolving.

---

Next: [05 — Motion & States](./05-motion-and-states.md)
