# 00 — Art Direction

The style and aesthetic. **Why** AfterImage looks the way it does — the layer above tokens.

Read this before designing a new screen. [01 — Foundations](./01-foundations.md) tells you
*which* values to use; this tells you what you're aiming at.

---

## 1. Positioning

> **Cinematic, modern, minimal. A creative tool for photography and production — not a
> dashboard.**

| Feels like | Not like |
|---|---|
| Linear's polish | Crypto-casino dashboards |
| Framer's editorial vibe | Skeuomorphic UI |
| Raycast's calm density | Loud gradients everywhere |
| A magazine art department | An analytics console |

The product's job is to make people feel like a director. The interface should feel like
studio equipment: precise, quiet, expensive. Nothing should feel like a form.

---

## 2. The four commitments

### 2.1 Dark-first editorial

Dark is designed, not inverted. Near-black grounds (`240 12% 6%`) with soft off-white type
(`45 15% 95%`) — never pure `#000` on pure `#fff`. The warmth in the foreground hue (45°) is
deliberate: it keeps a dark screen from reading clinical.

Light mode is genuinely warm too — `45 20% 97%` porcelain, not white. Both themes are *tinted*.
Neutral gray is not part of this system.

### 2.2 Soft depth over borders

Hierarchy comes from **surface + shadow**, not lines. `Card` ships with no border at all —
`bg-card` + `shadow-soft-md` does the work. Borders are hairlines at ~1.27:1 contrast: they
*suggest* an edge, they don't draw one.

The spec's phrase for the failure mode is worth memorizing: **"avoid flat gray soup."**
Every surface should sit at a discernible height.

### 2.3 Accent is punctuation, not paint

One cool primary + one warm secondary, used sparingly. Accent appears on: the active nav
indicator, the primary CTA, progress fill, focus rings, selected chips, and generating states.
That's the whole list.

The dominant surface treatment for accent is a **10% tint**, not a fill:

```
bg-primary/10 text-primary       status pill, icon well
bg-accent     text-accent-foreground   active nav row
bg-primary    text-primary-foreground  primary CTA only
```

Neon-on-black everywhere is explicitly a "don't." The accent should read as a highlighter,
not a wall color.

### 2.4 The work is the hero

This is a photo product. **Generated images are the brightest, most saturated thing on
screen — always.** Chrome recedes so imagery advances. Practically: muted UI, low-contrast
borders, no competing gradients in the app shell, and thumbnails that fill their frame edge
to edge.

If a screen's most eye-catching element is a button, the screen is wrong.

---

## 3. Imagery — the core aesthetic surface

Because the product generates photographs, image presentation *is* the art direction.

### 3.1 Aspect ratio vocabulary

| Ratio | Where | Why |
|---|---|---|
| `aspect-square` | Library grid thumbnails | Uniform grid, ratio-agnostic — packs, quick shots, and wardrobes coexist |
| `3 / 4` portrait | Marketing character rails, reference examples | Portrait is the product's center of gravity |
| `landscape` / `square` mix with `span: 1 \| 2` | Marketing showcase grid | Editorial masonry — deliberate irregularity |
| `aspect-video` | Skeleton variant | Available, rarely used |

The library grid is square *on purpose*: a mixed-ratio grid would ragged the page, and the
detail view is where true aspect ratio matters.

### 3.2 Treatment rules

```tsx
<Image
  src={thumbnailUrl}
  alt=""                                        // decorative in a labelled card
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
  className={cn(
    "object-cover transition-all duration-300 group-hover:scale-105",
    imgLoaded ? "opacity-100" : "opacity-0"     // fade in, never pop
  )}
  onLoad={() => setImgLoaded(true)}
/>
```

- **`object-cover`, always.** Never letterbox. Crop is preferred to empty space.
- **Fade in on load.** Images resolve from transparent; they never snap in.
- **Zoom on hover** — `scale-105` in app cards, `scale-[1.02]` on marketing rails. Contained
  by `overflow-hidden` on the frame.
- **Scrims, not panels.** Controls over imagery sit on
  `bg-gradient-to-t from-black/60 via-transparent to-transparent`, revealed on hover. Never
  put a solid bar over a photo.
- **Glass controls on imagery** — `bg-white/20` or `bg-white/10 backdrop-blur-sm` with white
  icons. This is the one place white-on-image is correct.
- **Lazy + code-split.** Marketing images are `loading="lazy"`; the lightbox is a
  `dynamic(..., { ssr: false })` import so it costs nothing until opened.

### 3.3 Placeholder state

Missing imagery is a centered `ImageIcon` at `h-10 w-10 text-muted-foreground/40` on
`bg-muted/50` — quiet, never a broken-image glyph, never a colored block.

### 3.4 Subject matter

The 39 shipped reference images set the tone: cinematic lighting, editorial framing, moody
weather. Categories in the marketing grid — Landscape · Interior Design · Product ·
Architecture · Fantasy · Automotive · Beverage — deliberately span far beyond people, to
signal the tool isn't only a headshot generator.

Character archetypes name audiences, not demographics: *Influencers & Creators · Indie
Artists · Character Designers · Roleplayers*.

---

## 4. Color as mood

### 4.1 The accent swap is an art-direction decision

| | Light | Dark |
|---|---|---|
| Accent | Neon Cyan `175 70% 42%` | Vivid Orchid `286 100% 72%` |
| Feel | Fresh, clean, daylight studio | Sophisticated, glowing, night shoot |

There is no accent picker. The mode *is* the mood. A cyan dark mode or an orchid light mode
would both be off-brand.

### 4.2 Temperature tension

Each theme pairs a warm ground with a cool accent, or the reverse:

```
light:  warm porcelain ground  ×  cool cyan accent
dark:   cool obsidian ground   ×  warm amber secondary + cool orchid primary
```

That tension is what keeps the palette from feeling like a default template. Preserve it —
don't add a third accent hue.

### 4.3 Amber is for weight, not alarm

Warm Amber (`38 92% 50%`) marks *significance*: pro features, highlights, warnings. It is
identical in both themes, which makes it the one fixed point in the palette. It is a **fill
color in light mode** (2.14:1 as text — see [06](./06-accessibility.md#1-contrast-audit)).

---

## 5. Typography as an editorial device

No display face. Inter only. Hierarchy is built from **weight and size contrast**, which is
the discipline the spec asks for: *"If adding a display font increases scope, keep Inter and
use weight/size contrast."*

**The editorial signatures:**

```
Eyebrow / metadata     text-xs uppercase tracking-wider text-muted-foreground
Tag rows               text-xs uppercase tracking-widest  ·  joined with " · "
Page title             text-3xl md:text-4xl font-semibold tracking-tight
Marketing headline     text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1]
Body                   leading-relaxed
```

Two details carry most of the editorial feel:

1. **`tracking-tight` on headings, `tracking-wider`/`widest` on small caps.** Big type tightens,
   small type opens. That contrast is the magazine move.
2. **Middle-dot separators** (`tags.join(' · ')`) instead of commas or pills for taxonomy.

Copy is set at generous measure — `max-w-sm` on helper text, `max-w-lg` on hero body. Long
lines are an aesthetic failure, not just a readability one.

---

## 6. Iconography

**Lucide React, exclusively.** One family, outline style, consistent stroke.

### Size scale

| Size | Use | Count |
|---|---|---|
| `h-3 w-3` | Inline metadata glyphs | 22 |
| `h-3.5 w-3.5` | Dense controls, disclosure chevrons | 8 |
| `h-4 w-4` | **The default** — buttons, nav, list rows | 138 |
| `h-5 w-5` | Mobile nav, sheet rows, feature marks | 29 |
| `h-6 w-6` | Error/status marks | 13 |
| `h-8 w-8` | Loading spinners, brand mark | 29 |
| `h-10 w-10` / `h-12 w-12` | Empty-state icons | 27 |

Stroke weight is default except for confirmations — `Check` uses `strokeWidth={3}` in
Checkbox and Stepper so a small tick reads as decisive.

### Semantic assignments — keep these stable

```
Zap          Quick Shots        FolderOpen   Packs
Shirt        Wardrobes          Users/User   Characters / Account
ImageIcon    References, Generations, missing imagery
Sparkles     AI generation ("Generate")      Wand2  AI-powered
Camera       photo capture      Clapperboard direction / shoots
Loader2      loading (always animate-spin)   Activity  active jobs
CreditCard   Billing            Settings2    advanced settings
```

`Sparkles` means *AI is doing something*. Don't use it as generic decoration.

### Icon wells

Two recurring containers — use these rather than inventing a third:

```tsx
// neutral / empty state
<div className="p-4 rounded-2xl bg-muted/50">
  <Icon className="h-10 w-10 text-muted-foreground" />
</div>

// accent / feature
<div className="p-2.5 rounded-lg bg-primary/10 group-hover:shadow-glow transition-shadow">
  <Icon className="h-5 w-5 text-primary" />
</div>

// destructive
<div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
  <AlertTriangle className="h-6 w-6 text-destructive" />
</div>
```

### Brand mark

`/icon.png` at 32×32 (28×28 on mobile), `rounded-lg`, paired with "AfterImage" in
`font-semibold`. Logo and wordmark always sit together with `gap-2`. There is no icon-only
lockup except in the collapsed sidebar.

---

## 7. Voice and tone

**Minimal, calm, confident.** Sentence case. Second person. Name the action, never the
mechanism.

| Do | Don't |
|---|---|
| "Generate" | "Submit" |
| "Draft" | "Auto" |
| "Sign in to generate your image" | "Authentication required" |
| "Gemini required for reference images" | *(disabling the control silently)* |
| "Analyzing prompt…" | "Stage: classifying" |
| "Try adjusting your search or filters" | "No results" |

**Rules with teeth:**

1. **Progress copy is present-continuous and specific.** "Enhancing prompt…", "Loading
   references…", "Saving images…" — the user should be able to tell how far along they are
   from the verb alone. Never render a raw enum.
2. **Constraints get an explanation.** Every disabled control has a sentence next to it saying
   why.
3. **Placeholders are evocative, not instructional.** *"Aerial view of a bioluminescent
   coastline at night…"* teaches prompt craft by example, and rotates at random on mount.
4. **Empty states offer a next step**, never just report absence.
5. **Marketing copy is declarative and short.** "Picture Everything." "One face for every
   aesthetic." "Suit up, punk out, or go full fantasy."

The spec asks to avoid exclamation-heavy microcopy; 12 toast strings currently break this
(see [07 §G5](./07-conventions-and-gaps.md#g5-microcopy-drift)). The job-system phrasing —
`` `${label} complete` `` — is the model to follow.

---

## 8. Where ornament is allowed

Gradients and glassmorphism are on the "don't" list — with **one sanctioned exception**:
`components/home/HeroSection.tsx`.

Permitted there, and nowhere else:

```
bg-gradient-to-b from-background via-background to-muted/30     section ground
radial accent washes at 10% / 40–60% opacity                    ambient depth
2%-opacity 40px grid overlay                                    texture
text-transparent bg-clip-text bg-gradient-to-r
  from-primary via-pink-500 to-amber-400                        headline
border-white/10 bg-card/50 backdrop-blur-xl                     glass form card
```

The reasoning: the marketing hero sells the *feeling* of the output; the app itself must stay
out of the way of the actual output. Porting hero treatments into the dashboard is the single
most likely way to break this design system.

The only glassmorphism sanctioned inside the app is functional: overlay scrims
(`bg-background/60 backdrop-blur-sm` over generating cards), sticky headers
(`bg-background/80 backdrop-blur-sm`), and the mobile bottom nav (`bg-card/95 backdrop-blur-md`).
In every case the blur exists to separate layers, not to decorate.

---

## 9. Choreography

Marketing sections reveal on scroll; the app does not. That difference is intentional — a
tool shouldn't animate on every scroll.

The marketing pattern (`CharacterStoryCard`, `QuickShotGrid`, `HowItWorksSection`):

```tsx
IntersectionObserver({ threshold: 0.2 })  →  observer.disconnect()   // fires once
opacity-0 translate-y-6  →  opacity-100 translate-y-0                // 400ms ease-out
transitionDelay: `${(i + 1) * 80}ms`                                 // 80ms stagger
className="… motion-reduce:transition-none"                          // always
```

Three things to copy from it: reveals fire **once** (disconnect after intersecting), the
stagger is **80ms**, and every transition carries `motion-reduce:transition-none`.

Horizontal image rails use scroll-snap — `snap-x snap-mandatory` with `snap-start` children at
`clamp(240px, 50vw, 360px)` and `scrollbar-none`. Cards bleed past their padding
(`-mx-4 px-4 md:-mx-6 md:px-6`) so images run to the card edge. That edge-bleed is a
magazine device and worth preserving.

---

## 10. Aesthetic do / don't

### Do

- Let generated imagery be the brightest thing on screen.
- Use surface elevation and type contrast to build hierarchy.
- Keep accent to indicators, CTAs, and 10% tints.
- Crop with `object-cover`; fade images in.
- Use scrims and glass for controls over photography.
- Tighten tracking on large type, open it on small caps.
- Separate taxonomy with ` · `.
- Write progress copy that names the actual stage.
- Give big type room — generous whitespace, constrained measure.

### Don't

- Don't put a gradient, glass panel, or grid texture anywhere but the marketing hero.
- Don't add a third accent hue, or make the accent theme-independent.
- Don't set body copy in the accent color (it fails contrast in light mode).
- Don't draw borders where a shadow will do.
- Don't letterbox an image or leave dead space in a frame.
- Don't put a solid bar over a photograph.
- Don't use `Sparkles` as generic decoration — it means AI is working.
- Don't animate on scroll inside the app shell.
- Don't ship more than one primary button per view.
- Don't mix icon families. Lucide only.

---

## 11. The on-brand test

Before shipping a screen, ask:

1. **Squint at it.** Is the imagery the brightest thing? If a button or a border wins, rebalance.
2. **Count accent uses.** More than ~3 accented elements in one viewport is too many.
3. **Count borders.** Could any of them be a shadow or a surface step instead?
4. **Read the copy aloud.** Does it name actions and stages, or mechanisms and enums?
5. **Flip the theme.** Does it look *designed* in both, or inverted in one?
6. **Kill the network.** Are the loading, empty, error, and generating states as considered as
   the success state?
7. **Would this belong in a magazine art department, or an analytics console?**

---

Next: [01 — Foundations](./01-foundations.md)
