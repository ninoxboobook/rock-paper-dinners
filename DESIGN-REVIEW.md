# Rock Paper Dinners — Design Review

*Senior product/visual design critique. Reviewed the running production preview (`localhost:4173`, ~514 px mobile viewport) across Play, Map, Browse, the venue detail sheet, and the filter sheet, and read the full implementation (`index.css`, all components/views, `cuisine.ts`, `icons.ts`, store, hooks, `index.html`, `vite.config.ts`). WCAG ratios below are computed from the actual CSS tokens.*

---

## 1. Overall impression

This is a genuinely charming, well-executed little app that knows exactly what it is. The arcade/neon premise is committed to — not half-applied — and the slot-machine centrepiece actually delivers its payoff: three reels decelerate on a stagger and land on the winner's cuisine emoji on a pulsing payline, capped with confetti. The colour system is tokenised and, contrary to what a dark neon theme usually produces, the contrast is real (almost everything clears WCAG AA). The weak spots are not the look — they're the *system rigour* (ad-hoc px spacing, no type scale, no radius scale), the *interaction semantics* (cards and result tiles are clickable `<div>`/`<article>` with no keyboard path, essentially zero `:focus-visible`), and a few honest polish bugs (light OSM map tiles fighting the dark theme, a tile-repaint flicker during cluster zoom, pinch-zoom disabled).

### Scorecard

| Dimension | Score | One-line rationale |
|---|---|---|
| Visual hierarchy | 8/10 | Name → cuisine → meta → description reads instantly; logo and SPIN anchor the Play view well. |
| Colour & contrast | 8/10 | Cohesive 4-accent neon palette; computed ratios pass AA almost everywhere (rare for dark neon). |
| Typography | 5/10 | 100% system-font with no type scale; only "display" treatment is the neon logo. Functional, not crafted. |
| Spacing & rhythm | 5/10 | Looks tidy but every value is a bespoke px literal — no 4/8 scale, no tokens. |
| Consistency / design system | 6/10 | Colour tokens are good; spacing, type, and radius have no tokens — half a system. |
| Iconography | 8/10 | Phosphor used consistently with deliberate weight-swap on active/fill; Cherries/Map/Fork tab metaphor is on-theme. |
| Motion & micro-interactions | 8/10 | Reel deceleration curve, payline pulse, confetti, chunky button press all feel good; honours reduced-motion. |
| The slot-machine centrepiece | 8/10 | Delivers the dopamine hit; reels genuinely converge on the winner emoji. Loses points on a11y + no "no pool" affordance. |
| Accessibility | 4/10 | AA contrast is good, but: clickable non-buttons, ~no focus-visible, pinch-zoom disabled, unlabelled nav in the a11y tree. |
| Mobile / PWA ergonomics | 7/10 | Real PWA (manifest + SW + workbox), safe-area insets, 100dvh, thumb-reachable SPIN/nav. Loses points on `user-scalable=no` and the map-tile flicker. |

---

## 2. What's working well (specific)

- **The centrepiece pays off.** `SlotMachine.tsx` builds three strips, plants the winner emoji at index `LAND` on all three, resets to top with `transition:none`, forces a reflow (`void …offsetHeight`), then animates each reel to `-(LAND-1)*TILE` over staggered `[2200, 2700, 3200]ms` on a `cubic-bezier(.12,.74,.2,1)`. The result (verified live) is three reels visibly converging on the same dish on the pink payline. That's the whole app and it lands.
- **Tactile button physics.** `.spin-btn` has a 10px hard drop-shadow that collapses to 3px and translates `7px` down on `:active` — a real "chunky arcade button" press. `.btn--primary` repeats it at smaller scale. This is the single best micro-interaction.
- **The palette is disciplined.** Four named accents (`--pink`, `--cyan`, `--gold`, `--purple`) with assigned jobs: cyan = links/info/active-nav, gold = shortlist/"on" state, pink = primary action, purple = card spine. The layered `radial-gradient` background gives depth without noise.
- **Contrast is genuinely good** (see §4b). For a dark neon theme this is the exception, not the rule — muted body text still clears 6:1.
- **Emoji mapping is thoughtful.** `cuisine.ts` is an ordered regex cascade (ramen before generic Japanese, dumpling before generic Chinese) so "Chaozhou (Teochew) & Malaysian Chinese" resolves sensibly. The coarse `cuisineGroup()` powers filter chips from the same source of truth.
- **Map cluster tiering reads at a glance.** `clusterIcon()` sizes (42/52/62) and colours (cyan→pink→gold) by child count, with the big counts getting a neon glow — instantly legible density.
- **Reduced-motion is honoured** (`@media (prefers-reduced-motion: reduce)` kills reel transition, confetti, payline pulse) and **haptics** are wired (`navigator.vibrate` on spin start, per-reel settle, and a `[40,30,90]` pattern on the final stop).
- **It's a real PWA.** `vite-plugin-pwa` emits `manifest.webmanifest` + `sw.js` + workbox into `dist/`; `theme-color`, `apple-touch-icon`, and `apple-mobile-web-app-*` meta are all present. Installability is not faked.

---

## 3. Issues & recommendations (prioritised)

| Pri | Issue | Where | Recommended fix |
|---|---|---|---|
| **P1** | **Cards/result tile are clickable non-buttons with no keyboard path.** `<article className="card" onClick>` and `<div onClick={openVenue}>` around the result card aren't focusable or Enter/Space-activatable. | `VenueCard.tsx:18`; `PlayView.tsx:81` | Make the card a `<button>`/add `role="button"` + `tabIndex={0}` + `onKeyDown` (Enter/Space). Drop the redundant outer `onClick` wrapper in `PlayView` (the inner `VenueCard` already has `onClick`). |
| **P1** | **Effectively no focus-visible styles.** The whole stylesheet has `:active` transforms but no `:focus-visible` anywhere except the search border. Keyboard/switch users get no visible focus on SPIN, nav, pills, chips, stars, sheet buttons. | `index.css` (global) | Add a single global rule: `:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; border-radius: inherit; }` and remove any `outline:none` that isn't paired with a replacement. |
| **P1** | **Bottom-nav buttons expose no accessible name.** The a11y tree returns bare `button` (no label) for Play/Map/Browse — the visible `.nav-label` text isn't being read as the name in context. | `BottomNav.tsx:19` | Add `aria-label={label}` to each `nav-btn` (cheap, and also helps the icon-only Browse Filters/Shortlist pills which *do* already set `aria-label`). |
| **P1** | **Light OSM map tiles clash with the dark neon theme.** The Map is the one bright-white rectangle in an otherwise dark app — jarring, and it makes the white emoji pins low-contrast against pale streets. | `MapView.tsx:61-64` | Swap to a dark basemap (CARTO `dark_all`, Stadia "Alidade Smooth Dark", or a Stamen-style dark) to match the theme. Free CARTO dark tiles are a near drop-in URL change. |
| **P1** | **Pinch-zoom is disabled app-wide.** `user-scalable=no, maximum-scale=1.0` blocks users who need to zoom text — a WCAG 1.4.4 fail. | `index.html` viewport meta | Remove `user-scalable=no` and `maximum-scale=1.0`. Keep `viewport-fit=cover`. Use `touch-action`/`overscroll-behavior` (already set) to prevent accidental zoom on the slot, not a global lock. |
| **P2** | **Map-tile repaint flicker on cluster zoom.** Clicking the "119" cluster briefly showed only a centre strip of tiles with dark bands above/below before recovering — the Leaflet container size isn't re-measured across the zoom animation. | `MapView.tsx` | Call `map.invalidateSize()` after mount/layout (e.g. in a `whenReady`/`useEffect`), and consider dropping `preferCanvas` for div-icon markers (canvas doesn't render HTML markers and can interact badly with the cluster plugin). |
| **P2** | **No "empty pool" affordance on Play.** When filters exclude everything the SPIN button just goes disabled grey reading "No venues match" — but the reels keep showing seeded emoji and there's no path to clear filters from Play. | `PlayView.tsx:98-101`; `SlotMachine` idle | When `pool.length === 0`, show a "Clear filters" link near the button and dim/empty the reels so the disabled state is explained, not just inert. |
| **P2** | **Disabled SPIN state is the weakest contrast in the app.** `#a79fd6` on `#3a3460` = **4.66:1** — passes AA body but only just, and "Spinning…" loses the arcade energy entirely (flat grey, no motion). | `index.css` `.spin-btn:disabled` | Bump disabled label toward `--ink`; for the *spinning* state keep the pink and add a subtle pulse/shimmer so it reads "busy", not "broken". |
| **P2** | **No spacing / type / radius scale — all literals.** Padding/margins are bespoke px (`6px`, `7px`, `8px`, `13px`, `14px`, `16px`, `18px`, `20px`…); radii range across `10/12/16/22/999px`; font-sizes are inline (`11/13/14/16/17/22/24px`, `clamp(26-36)`). | `index.css` `:root` | Add `--space-1…6` (4/8/12/16/24/32), `--radius-sm/md/lg/pill`, and `--text-xs…2xl` tokens and refactor. Cheap now, compounding later. |
| **P2** | **Two "primary action" colours compete.** `.link-btn` ("Reset" in filters) is **pink**, while cuisine text and every active/link affordance elsewhere is **cyan**. Pink is otherwise reserved for the SPIN/primary button. | `index.css` `.link-btn`; `.card-cuisine` | Pick one link colour. Make text-links cyan and keep pink exclusively for the big primary buttons, so colour = meaning stays 1:1. |
| **P2** | **Result card is double-wrapped in click handlers.** `<div onClick={openVenue}>` wrapping a `<VenueCard onClick={openVenue}>` fires the same intent from two nested handlers. | `PlayView.tsx:81-83` | Remove the outer wrapper div's `onClick`; let the card own the interaction (and fix it per the P1 keyboard item). |
| **P3** | **Emoji collisions blur cuisine identity.** Greek and Middle-Eastern both map to 🥙; Indian and Malaysian both to 🍛; bakery and French both to 🥐. On the reels and pins these are indistinguishable. | `cuisine.ts` EMOJI_RULES | Differentiate where an emoji exists (🧆 falafel, 🍢 oden, 🫓 flatbread) — or accept it as a deliberate coarse mapping and document it. |
| **P3** | **Star/shortlist control is low-salience.** The outline star is muted grey (`--muted`), easy to miss as the only secondary action on a card; only "pops" once gold/filled. | `index.css` `.star` | Slightly raise the idle star's contrast or add a hairline circle background so it reads as tappable before it's toggled. |
| **P3** | **Confetti originates from a single top line.** `Confetti.tsx` drops pieces from `inset:-10px 0 auto 0` (a 0-height strip), so it rains from the top of the result block rather than bursting from the winning card. | `Confetti.tsx`; `.confetti` | Optional: emit from the card's centre with x-spread for a "jackpot burst" rather than "it's raining". |
| **P3** | **Sheet has no swipe-to-dismiss.** Bottom sheets have a grip handle (affordance for drag) but only close via backdrop tap or the Close button — the grip is decorative. | `VenueDetail.tsx` / `FilterSheet.tsx` | Either wire a drag-to-dismiss gesture or accept that the grip is purely a visual cue (it's a minor honesty gap). |

---

## 4. Dimension-by-dimension notes

### a) Visual hierarchy & layout
Strong. The Play view stacks logo → pool pills → slot → SPIN → shake toggle in a clean vertical priority order, and the slot's heavy frame (gold border, inset glow, drop shadow) earns its place as the hero. Cards have textbook hierarchy: 34px emoji tile anchors left, name (17px/800) dominates, cuisine (cyan) and suburb (muted) form a meta row, description clamps to 3 lines. The purple 4px left border (`border-left: 4px solid var(--purple)`) is a nice spine that gives the list rhythm without dividers. One layout smell: the Play view content is top-weighted and leaves a large empty lower half on tall phones (the result/CTA block is short) — fine, but a missed opportunity to bring SPIN into easier thumb reach or to fill with a "recent winners" strip.

### b) Colour & contrast
The palette is the app's quiet strength. Computed WCAG ratios from the actual tokens:

| Pair | Ratio | AA body (4.5) | AA large/UI (3.0) |
|---|---:|:---:|:---:|
| `--ink #f6f4ff` on `--bg #0d0b1f` | 17.79:1 | pass | pass |
| `--ink` on card `--panel-2 #241e55` | 13.87:1 | pass | pass |
| `--muted #a79fd6` on `--bg` | 7.90:1 | pass | pass |
| `--muted` on card `--panel-2` (worst case) | 6.16:1 | pass | pass |
| `--cyan #21e6c1` (links/cuisine) on `--panel` | 10.58:1 | pass | pass |
| `--pink #ff2e88` (Reset link) on `--panel` | 4.82:1 | pass (just) | pass |
| `--gold #ffd60a` (shortlist) on `--bg` | 13.71:1 | pass | pass |
| SPIN text `#2a0413` on pink `#ff2e88` (darkest stop) | 5.33:1 | pass | pass |
| Cluster text `#2a0413` on pink bubble | 5.33:1 | pass | pass |
| Disabled SPIN `--muted` on `#3a3460` | **4.66:1** | **pass (marginal)** | pass |

**No AA failures** in the core UI — genuinely impressive for this aesthetic. The two values to watch are the pink "Reset" link (4.82) and the disabled SPIN label (4.66); both pass but have the least headroom. Perceptually the muted purple-grey body text is the dimmest element and *feels* borderline at small sizes even though it computes fine — worth nudging up if you want comfort beyond the minimum. The only real colour problem is environmental, not token-level: the light OSM map (P1) breaks the dark theme.

### c) Typography
This is the most under-invested dimension. The app is 100% `system-ui` stack with **no custom face and no type scale** — sizes are inline literals (11/13/14/16/17/22/24px). The *only* display treatment is the neon logo (`.logo`: `clamp(26px,7vw,36px)`, weight 900, triple text-shadow pink glow + a `0 2px 0 #b3155c` extruded edge) — and it's the right call, it carries the brand. But everything below it is competent-default rather than crafted: no letter-spacing system, weights jump 600→800→900 ad hoc, line-heights are mostly browser defaults except where set. For an arcade theme this is the obvious place to add personality — even a single condensed/rounded display face for headings + logo, while keeping `system-ui` for body, would lift the whole thing. At minimum, formalise a `--text-*` scale so the jumps are intentional.

### d) Spacing & rhythm
Visually tidy, structurally undisciplined. There is **no spacing scale** — every gap/padding/margin is a hand-picked px value, and they cluster *near* an 8-grid without committing to it (`6, 7, 8, 10, 12, 13, 14, 16, 18, 20`). The result reads fine because the author has a good eye, but it's unmaintainable and inconsistent under the hood (e.g. pills use `7px 13px`, chips use `8px 12px`, buttons `12px 16px` — three different paddings for three pill-shaped controls). Radii are similarly scattered (`10/12/16/22/999`). Tokenise both.

### e) Consistency & design-system maturity
Half a system. Colour is properly tokenised in `:root` and used consistently with clear semantics, plus a couple of structural tokens (`--tile`, `--nav-h`, `--line`). What's missing to call it a system: **spacing scale, type scale, radius scale, and elevation/shadow tokens** (shadows are long bespoke `box-shadow` literals repeated across `.slot-frame`, `.spin-btn`, `.btn--primary`, clusters). Component states are consistent (the weight-swap `regular`↔`fill` pattern on active/selected is used everywhere — nice), and the pill/chip/button family shares a visual language even if their padding values drift. Adding the three missing scales would move this from "tokenised colours" to "design system".

### f) Iconography
Well handled. Phosphor is used consistently for all chrome via a single re-export module (`icons.ts`), and the active/selected convention — `weight="fill"` when on, `weight="regular"` when off — is applied uniformly to nav, stars, shortlist pills, and shake button. Sizes are sensible (nav 25, buttons 18, pills 16, search 18). The tab metaphor is playful and on-brand: **Cherries** for Play (a slot-machine symbol — clever), **MapTrifold** for Map, **ForkKnife** for Browse. Two small notes: Cherries reads as "fruit/food" more than "play/spin" to a cold user (consider pairing with the label, which you do), and the icon-only Filters/Shortlist pills in Browse rely entirely on their (present) `aria-label` since there's no text — fine, but the count badge has no accessible context.

### g) Motion & micro-interactions
A highlight. The reel curve `cubic-bezier(.12,.74,.2,1)` gives a fast-start/slow-settle that feels like a real reel braking; the `[2200,2700,3200]ms` stagger means reels stop left-to-right like a physical machine. The payline `paylinePulse` alternates pink→cyan glow while spinning (`.slot.is-spinning`), which is a great "live" signal. `result-card-wrap` pops in on a springy `cubic-bezier(.2,1.4,.4,1)` overshoot. Confetti is a dependency-free CSS one-shot, re-keyed (`key={winKey}`) so it replays per spin. The chunky button press (§2) is the cherry. Everything correctly collapses under `prefers-reduced-motion`. Only gap: the *spinning* SPIN state goes flat grey/disabled instead of staying energetic.

### h) The slot-machine centrepiece
It works and it's fun — verified live: a spin produced "Operator San" (Japanese brunch) and all three reels settled on 🍱 on the payline with confetti. The 46px emoji are large and legible in the 84px tiles, and the idle reels are pre-seeded from the real pool (`useEffect` in `SlotMachine`) so it never shows blank plates. Deductions: (1) accessibility — the whole `.slot` is `aria-hidden`, so a screen-reader user gets the result only from the card below, and there's no `aria-live` announcement of the winner; (2) the empty-pool case leaves the reels showing stale emoji with no explanation (§3 P2); (3) the emoji-collision issue (§3 P3) means a "match" sometimes shows the same glyph for different cuisines, slightly undercutting the "it really matched your pick" illusion.

### i) Accessibility
The split-personality dimension: **contrast is good** (§4b, AA throughout) and reduced-motion is respected, but interaction a11y is thin:
- **Clickable non-buttons**: `<article className="card" onClick>` and the result `<div onClick>` aren't keyboard-operable (P1).
- **~Zero `:focus-visible`**: nothing but the search input shows focus; SPIN, nav, pills, chips, stars are invisible to keyboard users (P1).
- **Touch targets**: mostly compliant — SPIN is huge, nav buttons fill `64px` height, `.btn` ≈ 44px tall, sheet actions fine. The borderline ones are the **`.star`** (a ~22px icon in a tight hit area) and the **search-bar pills** — verify ≥44×44px hit area.
- **`user-scalable=no`** disables zoom (WCAG 1.4.4 fail, P1).
- **Unlabelled nav** in the a11y tree (P1) and no `aria-live` for the spin result (the dialog sheets do set `role="dialog"`/`aria-label`, which is good).
- The `aria-hidden` slot means the *experience* is invisible to AT — acceptable as decoration as long as the result is announced elsewhere (it currently isn't, via live region).

### j) Mobile / PWA ergonomics
Mostly solid. `100dvh` on `.app` and `dvh`-based sheet/map heights handle mobile browser chrome correctly; `env(safe-area-inset-*)` is applied to the main scroll padding, the bottom nav, and the sheets (notch/home-indicator safe). `overscroll-behavior-y: none` + `-webkit-overflow-scrolling: touch` are set. Thumb reach is good: SPIN and the nav sit in the lower third. It's a real installable PWA (manifest + service worker + workbox via `vite-plugin-pwa`), with theme-color and apple meta. Ergonomic deductions: **pinch-zoom disabled** (P1), the **map-tile flicker** on cluster zoom (P2, suggests a missing `invalidateSize()`), and the **disabled SPIN** state (greyed "No venues match") being a dead-end with no recovery path on Play (P2).

---

## 5. Top 5 quick wins (high impact, low effort)

1. **Add a global focus ring.** One rule — `:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }` — fixes the single biggest accessibility gap across every control. *(P1)*
2. **Swap to a dark basemap.** Change the `TileLayer` URL in `MapView.tsx` to CARTO `dark_all` (free, drop-in). Instantly removes the one element that breaks the theme and improves pin contrast. *(P1)*
3. **Remove `user-scalable=no` / `maximum-scale=1.0`** from the viewport meta. One-line WCAG 1.4.4 fix; keep `viewport-fit=cover`. *(P1)*
4. **Make the card a real button + add `aria-label` to nav buttons.** Card → `role="button"`+`tabIndex={0}`+`onKeyDown`, nav buttons → `aria-label={label}`. Makes the core flows keyboard- and screen-reader-operable. *(P1)*
5. **Introduce spacing + radius tokens** (`--space-1…6`, `--radius-sm/md/lg/pill`) and refactor the pill/chip/button family to share them. Small change, big consistency payoff, unblocks every future tweak. *(P2)*

---

### Reviewer's note on method
I exercised Play (idle, a real spin → winner reveal, zoomed reels), Map (overview + zoomed cluster spread after a cluster-zoom), Browse (full card list, zoomed cards), and the venue detail sheet live, and read the full source. I could **not** get a clean screenshot of the **filter sheet** fully open — a persistent browser-extension overlay pinned to the bottom of the OS window kept intercepting taps on bottom-anchored sheets — so the filter-sheet assessment is from the code (`FilterSheet.tsx`) plus its chips, which are visually identical to the pills/chips seen elsewhere. Every other point is grounded in something seen live or read in the source.
