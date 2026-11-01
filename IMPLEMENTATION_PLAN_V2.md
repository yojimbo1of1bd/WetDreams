# Starlet Directory — Master Implementation Plan v2.0
## Cognitive Governor, Bipartite Co-Star Graph & Scenario Expansion

**Project:** Starlet Directory — VIP Edition  
**Version:** 2.0.0 (Architecture & Execution Master Record)  
**Client / Stakeholder:** G45  
**Updated:** 2026-10-30  
**Target Codebase:** `C:\Users\Lenovo\Desktop\Shit\starlet-app\`  

---

## 1. Executive Summary & Core Paradigm Shift

The Starlet Directory is evolving from a passive adult filmography catalog into an **entropy-aware, self-regulating cognitive media portal**. 

Conventional adult recommendation platforms operate as pure **dopamine extractors**: they optimize exclusively for raw clicks and session length, inevitably trapping users in **Rapid Hedonic Adaptation**, repetitive roleplay loops, and late-night compulsive scanning. 

Plan v2.0 introduces three fundamental architectural pillars:
1. **The Bipartite Co-Star Graph & Scenario-First Pipeline**: Decouples performers from isolated scene lists into a shared, deduplicated scene graph with bi-directional co-star edges, exploding the inventory for niche dynamics (**MSD, MFS, Family Swaps, Blackmail, Permission**).
2. **Reddit Discussion Density & Virality Diffusion**: Replaces naive karma metrics with a discussion-ratio engine that lifts breakout newcomers through co-star graph diffusion without polluting the catalog with spam.
3. **The Cognitive Governor ("The Mirror with a Gate")**: A client-side behavioral telemetry and anti-habituation system utilizing personal Exponential Moving Average (EMA) baselines, Z-score stress estimation, $B / (1+H)$ ranking, and the "Melody Effect" cooling-off lockout.

---

## 2. Mathematical Formulations

### 2.1 The Anti-Habituation & Exploration-Exploitation Model

To prevent Hall-of-Famers (e.g., Cory Chase, Brandi Love) from permanently choking out fresh newcomers, every model's search and discovery score is dynamically regulated by her **Habituation Score ($H$)**:

$$Score(u, m, Q) = M(m, Q) \cdot \left[ \frac{B(m)}{1 + H_{\text{actual}}(u, m)} \right]$$

Where:
* $M(m, Q) \in \{0, 1\}$: Binary or fuzzy query match.
* $B(m)$: Base tier score ($10 = \text{Legend}, 9 = \text{POY}, 7 = \text{Fan Favorite}, 6 = \text{New Starlet}, 5 = \text{Unranked}$).
* $H(u, m)$: Cumulative habituation:
  $$H(u, m) = 1 - \exp\Big(-\lambda \big(w_c \cdot C(u, m) + w_p \cdot P(u, m)\big)\Big)$$
  - $C(u, m)$: Profile click count ($w_c = 1.0$).
  - $P(u, m)$: Verified pass count ($w_p = 0.05$, logged via `IntersectionObserver` only when dwell in viewport $\ge 1,200\text{ ms}$).
  - $\lambda = 0.08$: Exposure sensitivity coefficient.
* $H_{\text{actual}}(u, m)$: Time-decayed habituation accounting for natural forgetting:
  $$H_{\text{actual}}(u, m) = H(u, m) \cdot \exp(-\gamma \cdot \Delta t)$$
  - $\Delta t$: Days since last impression.
  - $\gamma = 0.015$: Forgetting velocity (restores novelty after ~45–60 days).

---

### 2.2 Intra-Session Dwell Collapse & The "Melody Effect" Lockout

When a user rapidly re-clicks a performer while their dwell time collapses toward zero, they have crossed into **Rapid Hedonic Exhaustion** (the novelty has shattered, but compulsive behavior keeps them re-clicking):

$$F(m) = \frac{k_m}{\sum_{i=1}^{k_m} t_{m, i} + \epsilon}$$

Where:
* $k_m$: Profile visits for model $m$ during the current session.
* $t_{m, i}$: Verified active dwell seconds on visit $i$ (paused on `document.visibilityState === 'hidden'`).
* $\epsilon = 0.1$: Numerical guard.

**The Cooling-Off Lockout Rule:**
If $k_m \ge 3$ and $F(m) \ge 0.45$ (e.g., 3 visits with $< 7$ total seconds of dwell):
1. The performer is temporarily quarantined from category and natural search results.
2. In place of her card, the UI renders an ambient, frosted glass `CoolingOffCard`:
   > *"Feed Resting: You've explored this profile several times in short bursts. The engine is resting her content to prevent novelty fatigue. Auto-restores tomorrow."*
3. An optional minimalist "View anyway" button provides conscious friction rather than absolute blockage.

---

### 2.3 Personal Baseline & Bayesian Stress Inference

Stress and impulsivity cannot be directly measured with a physical sensor in a browser; they are **latent cognitive states** inferred from behavioral deviations against the user's **own historical baseline**:

#### 1. Exponential Moving Average (EMA) Baseline
$$\bar{x}_s = \alpha \cdot x_s + (1 - \alpha) \cdot \bar{x}_{s-1}$$
$$\sigma_{x, s}^2 = \alpha \cdot (x_s - \bar{x}_s)^2 + (1 - \alpha) \cdot \sigma_{x, s-1}^2$$
* Metric vector $\mathbf{x} = [\Delta i, scroll\_v, back\_nav, dwell, query\_revisions, tab\_blur]$.
* $\alpha = 0.25$: Adaptability rate over distinct sessions.

#### 2. Personal Z-Score
$$z_j = \frac{x_j - \bar{x}_j}{\sigma_j + \epsilon}$$

#### 3. Bayesian Belief Update
$$P(\text{stressed} \mid \mathbf{z}) \propto P(\text{stressed})_{\text{prior}} \cdot \prod_{j=1}^{k} \mathcal{N}\left(z_j \;\middle|\; \mu_j^{\text{stress}}, \sigma_j^2\right)$$

* **Circadian Priors**:
  $$P(\text{stressed})_{\text{prior}} = \begin{cases} 0.15 & 08:00 - 18:00 \\ 0.35 & 18:00 - 23:00 \\ 0.70 & 23:00 - 05:00 \text{ (Global Friction Active)} \end{cases}$$

---

### 2.4 Reddit Discussion Density & Virality Index ($H_i$)

Raw Reddit upvotes measure bot reposts of the same 5 mainstream starlets. True community fascination is measured by **Discussion Density**:

$$H_i = \log_{10}(U_i + 1) + 2.5 \cdot \log_2(C_i + 1) + 3.5 \cdot V_i$$

Where:
* $U_i$: Aggregate thread karma.
* $C_i$: Comment count across threads where starlet $i$ is discussed.
* $V_i$: Count of virality tokens (`"captioned"`, `"roleplay"`, `"goat scene"`, `"msd"`, `"swap"`, `"who is she"`, `"[solved]"`).

#### Co-Star Latent Diffusion for Unknown Rookies:
When an unknown newcomer $j$ co-stars with established starlet $i$ in a viral scene, her affinity is diffused across the normalized co-star adjacency graph:
$$\mathbf{S} = \mathbf{D}^{-1/2} \mathbf{A} \mathbf{D}^{-1/2}$$
$$\mathbf{v}_j[\text{niche}] \leftarrow \mathbf{v}_j[\text{niche}] + 0.40 \cdot \mathbf{v}_i[\text{niche}] \cdot \hat{H}_i$$
This instantly pulls the rookie into the recommendation neighborhood of the established starlet.

---

## 3. Data Architecture & Schema

### 3.1 Canonical Scene Entity (Deduplicated Repository)

```jsonc
{
  "id": "pt-2024-sister-swap-01",
  "title": "The Sister Swap: Episode 1",
  "fullTitle": "Pure Taboo - The Sister Swap: Episode 1",
  "studio": "Pure Taboo",
  "releaseDate": "2024-04-12",
  "duration": "38:45",
  "rating": "94%",
  "url": "https://www.fpo.xxx/video/...",
  "thumbnail": "https://www.fpo.xxx/contents/...",
  "performers": ["adria-rae", "cherie-deville"], // Co-Star Graph Links
  "genres": ["swap", "stepsis", "stepmom", "family", "ffm", "msd"],
  "redditSignal": {
    "threadCount": 4,
    "totalComments": 82,
    "viralityScore": 91.5
  },
  "isReal": true
}
```

### 3.2 High-Precision 16-Class Scenario Taxonomy

```javascript
export const SCENARIO_TAXONOMY = {
  msd: /\b(msd|mom\s*son\s*daughter|mother\s*son\s*daughter|stepmom\s*and\s*stepsis|mom\s*daughter\s*threesome)\b/i,
  mfs: /\b(mfs|mom\s*father\s*son|mother\s*father\s*son|parents\s*and\s*son)\b/i,
  swap: /\b(swap|momswap|sister\s*swap|family\s*swap|daughter\s*swap|wife\s*swap|swapped)\b/i,
  blackmail: /\b(blackmail|blackmailed|coerced|extortion|threatened|or\s*else|leaked\s*pics)\b/i,
  permission: /\b(permission|ask(?:ed|ing)?\s*permission|hall\s*pass|persuaded|bribed|allowed\s*to|approved\s*by)\b/i,
  ffm: /\b(ffm|threesome|two\s*girls|sharing\s*him|mom\s*and\s*sis|double\s*team)\b/i,
  mmf: /\b(mmf|double\s*penetration|two\s*bros|brother\s*and\s*friend|dad\s*and\s*son)\b/i,
  roleplay: /\b(roleplay|role\s*play|taboo\s*fantasy|acting|pretend|captioned|storyline)\b/i,
  caught: /\b(caught|walked\s*in|interrupted|busted|spied|peeping|spycam)\b/i,
  shared_bed: /\b(shared\s*bed|bed\s*share|sleeping\s*together|same\s*bed|hotel\s*room|sleepover)\b/i,
  vacation: /\b(vacation|holiday|cabin|lake\s*house|road\s*trip|hotel)\b/i,
  study: /\b(study|tutor|homework|exam|failing|math|lesson)\b/i,
  birthday: /\b(birthday|present|gift|surprise|party)\b/i,
  stepmom: /\b(stepmom|step-mom|stepmother)\b/i,
  stepsis: /\b(stepsis|step-sis|stepsister)\b/i,
  stepdaughter: /\b(stepdaughter|step-daughter)\b/i
};
```

---

## 4. Phase-by-Phase Implementation Roadmap

### Phase 1: Scenario-First Ingestion & Bipartite Co-Star Graph
* **Script**: `scrape-scenarios.mjs`
  - Queries FPO scenario batches: `"msd"`, `"mom son daughter"`, `"family swap"`, `"sister swap"`, `"blackmail"`, `"permission"`, `"pure taboo"`, `"family strokes"`.
  - Extracts co-star cast lists, durations, ratings, thumbnails, and direct links.
* **Script**: `build-costar-graph.mjs`
  - Cross-indexes each multi-actor scene into all participating starlets' records.
  - Automatically identifies uncataloged co-stars $\le 40$ years old via Wikidata/Babepedia and enqueues them into `performers.json`.

### Phase 2: Reddit Discussion Density Harvester
* **Script**: `reddit-hype-harvester.mjs`
  - Scrapes target subreddits: `r/Porn_Discuss`, `r/tipofmypenis`, `r/dirtyfamilygottalent`, `r/familystrokes`, `r/TabooCaptions`.
  - Filters for posts with text length $> 80$ chars or specific inquiry flairs (ignoring low-effort image dumps).
  - Computes Discussion Density ($H_i$) and updates `similarity-matrix.json` via latent diffusion.

### Phase 3: Client-Side Cognitive Governor
* **Modules**:
  - `src/engine/antiTamperStorage.js`: Multi-layer state (localStorage, sessionStorage, silent canvas hash).
  - `src/engine/habituationEngine.js`: Computes $H(u,m)$, $B / (1+H)$, and detects $F(m) \ge 0.45$.
  - `src/engine/behavioralTelemetry.js`: Passive tracker for ICI, scroll velocity, modal dwell, and Bayesian stress posterior.
  - `src/hooks/useCardImpression.js`: `IntersectionObserver` logging passes ($dwell \ge 1.2\text{s}$).

### Phase 4: Luxury VIP Frontend Integration
* **Components & Styling**:
  - `CoolingOffCard.jsx`: Soothing frosted glass placeholder when a model crosses the fatigue threshold.
  - Scenario Shelf Chips: Clean, human-readable filters (`[All]`, `[MSD]`, `[Family Swap]`, `[Blackmail]`, `[Permission]`).
  - Search Autocomplete: Silently maps natural queries to latent dimensions without leaking raw tokens.
  - Performer Card: Minimalist amber flame indicator 🔥 for trending starlets ($H_i \ge 70$).

---

## 5. Verification & Acceptance Criteria

1. **Scenario Inventory Explosion**:
   - MSD scenes in directory increase from 0 to $> 60$.
   - Family Swap scenes increase from 10 to $> 85$.
   - Blackmail and Permission scenes increase from 2 each to $> 40$.
2. **Co-Star Bi-Directional Integrity**:
   - Any multi-actress scene appears simultaneously in the verified filmographies of both starlets.
3. **Anti-Habituation Ranking Verification**:
   - Clicking a Hall-of-Fame starlet 10 times in Category Search visibly moves an unviewed newcomer above her on subsequent page views.
4. **Melody Effect Soft-Lockout Test**:
   - Clicking a single performer 3 times with $< 3$ seconds of dwell triggers the `CoolingOffCard` resting state.
5. **Zero Token Leakage**:
   - Inspecting the DOM reveals no internal token names, weights, or raw telemetry variables exposed to the end user.
6. **Vite Build Performance**:
   - `npm run build` passes with zero warnings, CSS bundle remains under 55 KB, and JavaScript bundle renders at 60fps under Framer Motion.

