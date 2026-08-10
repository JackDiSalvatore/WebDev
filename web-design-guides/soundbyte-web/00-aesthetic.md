# 00 — Style & Aesthetic

The other chapters describe *what* the system is made of. This one describes
what it is trying to **feel** like, and how to tell whether a new screen belongs.

Everything here is inferred from the code as built. Where the app has a genuine
aesthetic position it is named and defended; where the look is an accident of a
default, that is said plainly.

---

## 0.1 The thesis

> **The interface is a gallery wall. The music is the art.**

Every strong decision in this codebase follows from that one idea. The chrome is
achromatic — a neutral grayscale ramp, translucent panels, hairline borders — so
that the only saturated things on screen are album artwork, avatars, and the
controls that act on them. When color appears in the UI it is doing a job: this
is playing, this is liked, this is your tier, this is the way forward.

You can test any new component against it. If the component competes with
artwork for attention, it is wrong. If it frames artwork, it is right.

**Corollary:** SoundByte does not have a decorative color palette. It has a
*functional* one. There is no "SoundByte blue" for section headers or a
"SoundByte green" for panel accents. Adding one would break the thesis.

---

## 0.2 Positioning

The landing copy states the target explicitly: *"Built specifically for serious
artists who want to elevate their online presence."* Not listeners. Not casual
uploaders. Working independent musicians who treat their SoundCloud as a
portfolio.

That positioning produces three aesthetic obligations:

| Obligation | How it shows up |
| --- | --- |
| **Look professional, not playful** | No mascots, no illustration, no bounce easing, no rounded-cartoon type. Geist is a neutral grotesque; lucide is a plain outline set. |
| **Look adjacent to SoundCloud, not like a clone** | Orange is borrowed. The rest — the glass, the neutral chrome, the soft radii — is not SoundCloud's flat white-and-orange look. |
| **Look like a tool, not a feed** | Density is moderate, actions are explicit, metrics are always on screen. There is no infinite scroll, no algorithmic surface, no "for you." |

The app reads as **a portfolio-and-analytics surface for your own catalog**,
which is exactly what the product claims to be. That coherence between copy and
form is the single best thing about the current design.

---

## 0.3 Material

If the app has a signature, it is **frosted glass over a bright ground**.

```
bg-card/60       backdrop-blur-md    content panels
bg-background/90 backdrop-blur       fixed header
bg-background/95 backdrop-blur       fixed player
bg-white/95      backdrop-blur-sm    controls floating on artwork
bg-black/50      backdrop-blur-sm    labels floating on artwork
bg-{tone}/90     backdrop-blur-sm    metric pills floating on artwork
```

Almost nothing in the product register is fully opaque. Panels sit at 60%,
chrome at 90–95%, floating labels at 50–95% — always with a blur behind them.
The result is that scrolling content ghosts faintly through the header and the
player rail, and the page feels like layered sheets rather than stacked boxes.

Three properties make this work, and all three must be preserved together:

1. **Translucency without blur is dirt.** `bg-card/60` alone lets artwork bleed
   through as noise. The `backdrop-blur` is what turns it into a material.
2. **Blur needs something behind it.** On an empty page the glass has nothing to
   frost and reads as flat gray. This is why the empty states still use
   `bg-card/60 backdrop-blur-md` — they inherit the material even with no
   content, so surfaces stay consistent.
3. **Opacity scales with permanence.** The more fixed a surface is, the more
   opaque: content panels 60%, chrome 90–95%. Ephemeral things are more
   transparent than persistent things.

### The bloom

The most ambitious single effect in the app, `track-details.tsx:82–92`:

```tsx
<div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/60 to-transparent z-10" />
<div className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110 opacity-30"
     style={{ backgroundImage: `url(${artworkAt500})` }} />
```

The track's own artwork, blown up 110%, blurred to `xl`, dropped to 30%, and
washed with a white gradient — so every track detail page is tinted by the
record it's showing. Orange cover art gives you a warm page; a blue one gives
you a cool page. The page takes its color from the music.

This is the purest expression of the thesis and it should be extended, not
retired. Natural next homes: the profile hero (bloom the avatar), the player
rail (bloom the now-playing artwork behind the transport).

---

## 0.4 Light

The app is a **daylight product**. White ground, near-black text, pale gray
hairlines, and two extremely faint radial washes on the landing page:

```tsx
bg-[radial-gradient(circle_at_20%_80%,_rgba(249,115,22,0.08)_0%,transparent_50%)]  // orange, 8%
bg-[radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.06)_0%,transparent_50%)]  // blue, 6%
```

At 6–8% inside a container already set to `opacity-30`, these are barely
perceptible — a warm cast bottom-left, a cool cast top-right. That restraint is
the correct instinct: the wash gives the white ground a temperature without
becoming a "gradient background."

### An honest note about the light theme

Nearly every music product ships dark: Spotify, Apple Music, Tidal, Deezer,
Serato, Ableton. SoundCloud's own web app is light. SoundByte being bright is
therefore either a sharp differentiation or an accident.

The code says **accident**. `--background: oklch(1 0 0)` is the untouched shadcn
default, `.dark` was scaffolded and never wired up
([07 §A1](07-consistency-audit.md#a1-dark-mode-is-a-trap-door)), and every
hand-written component hardcodes `bg-white`. Nobody chose daylight; daylight was
what came out of the box.

That said, the accident is defensible, and here is the argument for keeping it:

- The positioning is **tool, not player**. Dashboards, analytics, and portfolio
  editors are conventionally light. Dark chrome would push the product toward
  "consumer listening app," which is not what it is.
- Artwork pops harder against white than against near-black. A gallery wall is
  white for a reason.
- The frosted-glass material reads better over a bright ground; over near-black
  it collapses toward flat dark gray unless the whole palette is retuned.

And the argument against: artists work at night, dark is the category
expectation, and the tokens are already half-written.

**Recommendation.** Ship light as the *deliberate* default and treat dark as a
first-class alternate rather than a fallback — meaning the dark palette gets
designed (warmer neutrals, artwork-first contrast, the glass retuned), not just
inverted. Whichever way it goes, write the decision down. Right now the app is
light by omission, and "by omission" is not an aesthetic.

---

## 0.5 Shape

Nothing in the app has a sharp corner. The radius ramp runs from 6px on menu
items to 24px on track cards, with circles for anything that reads as an object.

| Radius | What it signals |
| --- | --- |
| `rounded-md` (8px) | *Control.* Something you type in or press. |
| `rounded-xl` (14px) | *Surface.* Something that holds content. |
| `rounded-2xl` / `3xl` (16/24px) | *Object.* Something you look at. |
| `rounded-full` | *Instrument.* Avatars, transport buttons, tags, badges. |

The softness is doing real work. A 24px radius on the track card
(`track.tsx:39`) makes an album cover read as a **physical tile** rather than a
window, and pairing it with `overflow-hidden` so the artwork is clipped to the
same curve is what sells it. Meanwhile every transport control is a perfect
circle, which is the oldest visual grammar in audio hardware — a play button has
been round since the cassette deck.

**Aesthetic rule.** Roundness increases with how *object-like* something is.
Text fields are nearly square; the things you press to make sound are circles.
Do not flatten the track card to `rounded-xl` for the sake of the three-step
scale in [01](01-foundations.md#17-radii) unless you are willing to lose that.
It is the one place where eight radii buys something.

---

## 0.6 Depth

Depth is built from four stacked techniques, and the app uses them in a
consistent order:

```
1. Scrim      bg-gradient-to-t from-black/60 via-transparent to-transparent
2. Blur       backdrop-blur-sm / -md
3. Shadow     shadow-sm → shadow-lg → shadow-2xl
4. Lift       hover:-translate-y-2
```

A hovered track card runs all four at once: the scrim fades in, the pills frost,
the shadow deepens four steps, and the whole tile rises 8px. That is a lot of
simultaneous signal for a hover — see [04](04-motion.md#the-hover-language) for
the recommendation to dial the shadow and lift back. The *technique stack* is
right; only the amplitude is overdone.

Note what the app never does for depth: no borders thicker than 2px, no inner
shadows, no bevels, no gradients-as-depth on surfaces. Gradients are reserved
for two jobs only — brand CTAs and tier badges — which keeps them meaningful.

---

## 0.7 Density and air

Generous. `p-6` is the default card padding, `p-8` on marketing panels, `gap-8`
between marketing grid items, `space-y-8` between form sections, `m-8` around
pages.

This is a **low-density** interface by music-app standards. Spotify's library is
a 40px-row list; SoundByte's library is a grid of tiles with 16px gutters. The
airiness supports the portfolio framing — a catalog of 30 tracks looks like a
curated body of work rather than a queue.

The risk is that it does not scale. At six columns on a 1024px screen
([02 §2.5](02-layout.md#25-grids)) each tile is ~160px, and the air that felt
generous at three columns becomes cramped at six. The fix is fewer columns, not
less padding — protect the air.

**Aesthetic rule.** When a layout gets tight, remove columns before removing
padding. The white space is the product's posture.

---

## 0.8 Typography voice

**Geist Sans.** A neutral geometric grotesque — Vercel's typeface, contemporary,
slightly technical, with no personality of its own. That absence is the point:
it does not compete with artwork, and it signals "modern software product"
without signaling any genre of music.

The type is used plainly. No letterspacing tricks, no all-caps labels, no
italics anywhere in the app, no display weights above 800 (and the one
`font-extrabold` is in the placeholder footer). Weight does the work: 500 for
labels, 600 for headings and card titles, 700 for page titles.

Two idioms give it warmth:

- **`whitespace-pre-wrap` on everything user-authored** — bios, comments, track
  descriptions. Artists format their own text with line breaks and spacing, and
  the app preserves it instead of collapsing it. Small decision, big respect.
- **`text-balance` on centered headings** — keeps ragged lines from looking
  accidental.

⚠ Geist Mono is loaded and never used ([07 §C21](07-consistency-audit.md#c--defects-fix-now-each-is-small)).
There is an obvious aesthetic use for it: **the technical metadata**. BPM, key
signature, duration, timestamps, and SoundCloud IDs in mono would read as
instrument-panel data and sharpen the "tool for working musicians" register at
zero cost. That is the single cheapest way to add character to the type.

```tsx
<span className="font-mono text-sm tabular-nums">{formatDuration(track.duration)}</span>
<span className="font-mono text-sm">{track.bpm} BPM · {track.key_signature}</span>
```

`tabular-nums` on the player's time readout also stops the digits from jittering
every second, which is a nice detail the current build lacks.

---

## 0.9 Iconography voice

**lucide-react**, exclusively — outline style, ~2px stroke, rounded caps and
joins. Consistent with Geist: plain, contemporary, no attitude.

The app has one genuinely good icon convention: **fill means active.**

```tsx
<Heart fill={isLiked ? "#ff6b35" : "none"} stroke={isLiked ? "#ff6b35" : "currentColor"} />
<Heart className="w-3 h-3 text-white" fill="currentColor" />   // a like *count* is a filled heart
<Play fill="currentColor" />                                    // a play *count* is a filled triangle
<Repeat />                                                      // reposts, never filled — it's a loop, not a solid
```

Outline = affordance ("you could like this"). Filled = state or quantity ("this
is liked", "this many plays"). Keep it.

Sizes cluster sensibly: `size-3` inside pills, `size-4` inline with text,
`size-5` in buttons, `size-6`–`size-7` for feature glyphs, `size-16` for the
artwork play overlay.

⚠ Two lapses to fix: the hand-written inline SVGs in `subscription-section.tsx`
and `delete-confirm-modal.tsx` (use `Check`, `CheckCircle2`, `AlertTriangle`),
and the `⏳` emoji spinner in `settings/page.tsx:180`, which breaks the icon
voice completely — it renders as a different picture on every OS.

---

## 0.10 Color as language

The functional palette, and what each color is allowed to mean:

| Color | Meaning | Never use for |
| --- | --- | --- |
| **Orange** | Brand, playback, forward motion, SoundCloud | Errors, warnings, decoration |
| **Red** | Likes, destructive actions | Anything neutral |
| **Green** | Reposts, success | Primary actions |
| **Blue** | Comments, information | Primary actions ⚠ *currently violated* |
| **Yellow/amber** | Top tier (Pro+) | Warnings |
| **Neutral** | Everything else | — |

The four-color engagement mapping — neutral plays, red likes, green reposts,
blue comments — is the most disciplined thing in the codebase. It holds across
`track.tsx`, `song-stats-bar.tsx`, and `track-details.tsx`, it matches the
semantics people already carry (hearts are red, loops are green), and it means a
user can read a track's performance at a glance without reading a single label.

**It is also why blue must stop being the form-button color**
([07 §A2](07-consistency-audit.md#a2-three-colors-act-as-primary)). Blue
currently means both "comments" and "the primary action," and those two meanings
appear on the same screen. Every blue button spent is a blue comment icon
devalued.

### The gradient budget

Gradients appear in exactly two roles, and this restraint is worth defending:

1. **Brand CTAs** — `from-orange-500 to-orange-600`, a 1-step gradient that
   reads as a subtle sheen rather than a color transition.
2. **Tier badges** — `plan-badge.tsx`, where gradient + colored glow + matching
   ring is the "premium object" treatment.

Plus one structural use: the artwork scrim and the bloom, which are gradients as
*lighting*, not as decoration.

**Aesthetic rule.** A gradient means "this is special." Three gradients on one
screen means nothing is. Do not gradient a card background, a header, or a
section divider.

---

## 0.11 Motion personality

**Unhurried.** The app's transitions run 300–700ms where most product UIs run
150–250ms. The artwork zoom is 700ms. The card lift is 500ms. The marketing
entrance takes 1.1 seconds to fully resolve.

That slowness is a legible choice — it reads as *considered*, and it suits
browsing a catalog. Fast, snappy motion reads as utility; slow, eased motion
reads as presentation. A portfolio should feel like the latter.

But there is a line between unhurried and laggy, and two places cross it:

- The 700ms artwork zoom outlasts the 500ms card lift, so the image keeps
  growing after the card has settled. They should resolve together, or the image
  should lead.
- Nothing responds in under 200ms except color changes, so the interface never
  feels *responsive* — only smooth. Adding `active:scale-[0.98]` to buttons
  would give immediate press feedback without touching the browsing tempo.

**Aesthetic rule.** Browsing is slow (300–500ms). Acting is instant (<150ms).
The gap between those two is where the app feels alive.

⚠ And none of it respects `prefers-reduced-motion`
([04 §4.8](04-motion.md#48-reduced-motion)). A slow aesthetic has a higher
obligation here, not a lower one.

---

## 0.12 Imagery

Artwork is always **square, `object-cover`, clipped to the container radius**,
requested at the right SoundCloud size for its slot (`t50x50`, `t300x300`,
`t500x500`). There is no cropping to other ratios, no polaroid framing, no
drop-shadowed floating covers.

The fallback chain is `artwork_url → user.avatar_url → placeholder`, so a track
without cover art falls back to the artist's face rather than to a void. That is
the right instinct — a person is better than an empty box.

⚠ The placeholder itself is `/file.svg`, a leftover Next.js starter icon of a
generic document, and `track-details.tsx` references two placeholder files that
**do not exist in `public/`**. Right now a missing cover renders either a
document glyph or a broken-image icon. For a product whose entire aesthetic is
"the artwork is the art," the missing-artwork state deserves an actual design: a
muted square in `bg-muted` with the SoundByte mark at low opacity, or the
track's initial in large Geist. Ship one.

---

## 0.13 The three registers, and the one that's off

| Register | Ground | Surface | Radius | Action color | Verdict |
| --- | --- | --- | --- | --- | --- |
| **Marketing** (`app/page.tsx`) | Gradient wash + radial tints | `bg-white rounded-2xl shadow-lg` | 16px | Orange gradient | ✅ On brand |
| **Product** (`(me)/` routes) | `bg-background` | `bg-card/60 backdrop-blur-md` | 14–24px | Orange | ✅ On brand |
| **Forms** (`soundbyte-profile/*`) | `bg-white` | `bg-white border-gray-200` | 10px | **Blue** | ❌ Off brand |

Marketing and product are two dialects of one language — the marketing surface
is louder and more opaque, the product surface quieter and glassier, but both
are recognizably the same app.

The forms register is a different product. Flat white cards, hard gray borders,
no blur, no translucency, no orange, native browser checkboxes and selects, blue
buttons, blue focus rings, blue selected states. It looks like a well-built
generic settings page from a different codebase — which, in effect, it is.

This is the biggest **aesthetic** debt in the app, distinct from the technical
debt catalogued in [07](07-consistency-audit.md). A user's path is: orange
marketing page → orange connect button → **blue settings form**. The identity
drops out at exactly the moment the user is committing to the product.

**Fix.** The form register should be the product register with more structure:
glass cards, orange primary, `ring-ring/50` focus, and real `Checkbox` /
`RadioGroup` / `Select` primitives. See [08 §8.8](08-recipes.md#88-form-section).

---

## 0.14 What this aesthetic is not

Reject these even when they'd be easy:

- **Dark-by-default player chrome.** Do not make the player rail dark while the
  page stays light. It is the most common instinct in music UI and it would
  split the app in half.
- **Genre-coded color.** Do not tint the UI by genre (purple for electronic,
  red for hip-hop). Color is already spoken for by engagement semantics.
- **Waveform decoration.** Waveforms are functional in a scrubber. As a
  background texture or a divider, they are noise, and they compete with
  artwork.
- **Neon, glow, or "cyber" treatments.** The glow in `plan-badge` is a colored
  shadow at 20–30%, not a neon halo. Keep it that subtle.
- **Card gradients.** See §0.10.
- **Illustration and empty-state characters.** The product is a professional
  tool. An empty state gets an icon, a sentence, and a button.
- **Sharp corners.** Nothing in the app is square. Introducing one hard-cornered
  panel would read as broken, not as contrast.
- **More than one accent per screen.** If a screen has an orange primary button,
  it should not also have a blue selected state and a green badge fighting for
  the same attention.

---

## 0.15 Aesthetic scorecard

Where the app delivers on its own intent, and where it doesn't:

| Dimension | Score | Note |
| --- | --- | --- |
| Thesis clarity | ●●●●○ | "Artwork carries the color" is real and mostly held |
| Material consistency | ●●●○○ | Glass is strong in product, absent in forms |
| Color discipline | ●●●○○ | Engagement mapping excellent; three primaries is a mess |
| Shape language | ●●●●○ | Coherent and purposeful; slightly too many steps |
| Typographic voice | ●●●○○ | Correct and plain, but no ladder and Geist Mono wasted |
| Iconography | ●●●●○ | Consistent lucide + a real fill convention; three lapses |
| Motion personality | ●●●○○ | Distinctive tempo, but no press feedback and no reduced-motion |
| Imagery | ●●●●○ | Right treatment throughout; placeholder state unbuilt |
| Register coherence | ●●○○○ | Forms are a different product |
| Theme intent | ●○○○○ | Light by omission, dark half-scaffolded |

The pattern is clear: **the aesthetic is genuinely good wherever someone
designed it, and absent wherever a default was accepted.** The track card, the
profile hero, the track detail bloom, and the plan badge are all considered
pieces of work. The forms, the placeholders, the theme, and the metadata are all
untouched scaffolding.

Closing that gap is not a redesign. It is applying the taste already
demonstrated in `track.tsx` to the six files that never got it.

---

## 0.16 The five-second test

For any new screen, ask:

1. **Is the most saturated thing on screen a piece of artwork?** If a button or
   a panel is louder than the covers, fix the button.
2. **Is there exactly one primary action, and is it orange?**
3. **Do the surfaces frost, or are they flat white?**
4. **Is every corner soft, and does the roundness increase with object-ness?**
5. **Does the screen feel unhurried when browsing and instant when pressed?**

Five yeses and it belongs in SoundByte.
</content>
