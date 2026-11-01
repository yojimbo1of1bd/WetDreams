# STARLET DIRECTORY v5.0 — PHASED EXECUTION PLAN
**File:** PHASED_EXECUTION_PLAN.md  
**Objective:** Deterministic, step-by-step execution protocol for AI agents. No ambiguities, no daydreaming, strict test verifications at each phase.

---

## EXECUTION ROADMAP OVERVIEW

- [ ] **Phase 1: Resilient Avatar Component & Search Bar Fix (Resolves Image 3)**
- [ ] **Phase 2: Restore Non-Interactive Sections & Header Actions (Resolves Image 1 & 2)**
- [ ] **Phase 3: Disguise Hardening, 160s Line-by-Line Scan & Dual Audio Engine**
- [ ] **Phase 4: Awakening Walkthrough, Random Hostess & Psychological Ego-Check**
- [ ] **Phase 5: FaceMash "Who Is Hotter?" Arena (New Dedicated Tab)**
- [ ] **Phase 6: Multi-Source Video Quality Switcher & Co-Star Graph Cross-Indexing (Resolves Image 4)**

---

## PHASE 1: RESILIENT AVATAR COMPONENT & SEARCH FIX (Resolves Image 3)

### Goal
Eliminate all broken circular rings across the application by building a dedicated `<StarletAvatar />` component that resolves local `.jpg` files and provides a luxury monogram fallback, completely stripping all blocked external Babepedia URLs.

### Tasks
1. **Create `starlet-app/src/components/StarletAvatar.jsx`**:
   - Props: `id`, `name`, `hair`, `tier`, `size` ('xs' | 'sm' | 'md' | 'lg' | 'xl'), `className`.
   - Checks `src="/avatars/${id}.jpg"`.
   - On error: switches state `hasError = true` and renders an SVG/HTML luxury gradient circle with the starlet's 2-letter initials and hair-toned background glow.
   - **Never** attempts `https://www.babepedia.com/pics/...` (which triggers 403 Forbidden).
2. **Update `starlet-app/src/components/SearchAutocomplete.jsx`**:
   - Replace raw `<img src={`./avatars/${p.id}.jpg`} ... onError={...babepedia...} />` with `<StarletAvatar id={p.id} name={p.name} size="sm" />`.
3. **Update `AboutView.jsx`**:
   - Replace line 295 image with `<StarletAvatar id={simPerformer.id} name={simPerformer.name} size="lg" />`.
4. **Verification**:
   - Type `"amber moore"` in the search bar.
   - Verify that Amber Moore and Ami Jordan show solid photographic or luxury monogram avatars with **no blank outline rings**.

---

## PHASE 2: RESTORE NON-INTERACTIVE SECTIONS & HEADER ACTIONS (Resolves Image 1 & 2)

### Goal
Fix all dead buttons identified in user testing: the "Melody Effect" simulation button in `AboutView.jsx` and the `Live Wallpaper` / `Focus Sanctuary` header buttons in `Header.jsx`.

### Tasks
1. **Fix "Melody Effect" Simulation in `starlet-app/src/components/AboutView.jsx`**:
   - Inspect `handleSimulateClick`: ensure state updates `simClicks = prev => prev + 1`.
   - When `simClicks >= 3`: set `simQuarantined = true`, call `quarantinePerformer(simPerformer.id)`, and trigger cooling-off mode.
   - Verify the `Simulate Rapid Click` button responds with real click feedback.
2. **Fix Header Action Buttons in `starlet-app/src/components/App.jsx`**:
   - In `App.jsx`, when `isUnlocked === true`:
     - Re-insert the `<AnimatePresence>` modal overlays for `<LiveWallpaperLounge>` and `<CalmSanctuary>`.
     - When clicking `[✨ Live Wallpaper]`: set `showWallpaperOverlay(true)` and render `LiveWallpaperLounge` in modal mode with an exit `[✕]` button.
     - When clicking `[🌬️ Focus Sanctuary]`: set `showCalmSanctuary(true)` and render `CalmSanctuary` with its exit button.
3. **Verification**:
   - Click `[Simulate Rapid Click]` in System & About -> verify burst counter increments $1/3 \to 2/3 \to 3/3 \to$ Performer in Rest Mode.
   - Click `[Live Wallpaper]` in header -> verify 4K scenic lounge opens smoothly.
   - Click `[Focus Sanctuary]` in header -> verify Pomodoro sanctuary opens smoothly.

---

## PHASE 3: DISGUISE HARDENING, 160S SCAN & DUAL AUDIO ENGINE

### Goal
Make the disguise impenetrable and authentic: render a 160-second progressive line-by-line raster canvas with locked input, add a Timer Settings Gear drawer, remove third-party branding, and implement curated + YouTube audio streaming.

### Tasks
1. **Progressive 160-Second Scan Canvas in `LiveWallpaperLounge.jsx`**:
   - Add a `<canvas>` element rendering an authentic interlaced raster scan over 160 seconds.
   - Set `pointer-events: none` during scan: clicks and keys cannot skip the render.
   - The only early bypass is the `F12` console command (`window.fuck`).
2. **Silent In-Memory Console Listener (Zero Hints / Absolute Stealth)**:
   - In `App.jsx`, register silent in-memory handlers on `window.fuck`.
   - **Zero Hints**: Do not output console greetings, log prompts, watermark strings, or any hints to the console or DOM. The cover-up operates in 100% authentic, silent stealth.
   - Only evaluating `window.fuck` or `window.fuck()` directly triggers the unlock transition.
3. **Remove Outdated Branding**:
   - In `CalmSanctuary.jsx` and `LiveWallpaperLounge.jsx`, delete `study with me.io by GRIDFITI` and `Meadow Forest Lo-Fi`.
   - Replace with the dynamic name of the active 4K scenic video.
4. **Timer Settings Gear (`Settings`) Drawer**:
   - Add a `Settings` gear icon beside the timer digits.
   - On click, open a settings panel: select duration (15m, 25m, 45m, 60m), intervals, and sound alerts.
   - Fully connect Play, Pause, and Reset states.
5. **Dual Audio Streamer**:
   - Add preset buttons for 4 lo-fi streams (Lofi Girl 24/7, Synthwave Night, Rain & Vinyl, Space Drone).
   - Add an inline text input to paste any YouTube URL / Playlist or local audio file to loop in the background.
6. **Verification**:
   - Reload page -> verify tab title is `Ambient Lounge · Focus & 4K Audio Visuals`.
   - Verify scanline renders progressively without single-click bypass.
   - Open F12 console, type `fuck` -> verify glass shatter triggers and directory opens.

---

## PHASE 4: AWAKENING WALKTHROUGH, RANDOM HOSTESS & PSYCHOLOGICAL EGO-CHECK

### Goal
Upgrade the post-shatter transition into an interactive, multi-step guided tour hosted by a randomly chosen starlet, ending with a cynical, ego-deflating monologue.

### Tasks
1. **Random Starlet Hostess in `HaremWelcomeTour.jsx`**:
   - Pick a random starlet from the catalog on mount who has a verified portrait (`hostStarlet = catalog.filter(p => p.hasPhoto)[randomIndex]`).
   - Use `<StarletAvatar />` for the portrait so the image never fails.
2. **Interactive Spotlight Steps**:
   - Step 1: Intelligent Scenario & Token Search (`"daughter swap"`, `"stepmom"`).
   - Step 2: Scene Theater & 1080p Cinema.
   - Step 3: FaceMash Elo Arena & Hotter Leaderboard.
   - Step 4: Co-Star Constellation & Studio Hubs.
3. **The Psychological Ego-Check Finale (Anonymous Philosophical & Discipline Quotes)**:
   - Deliver cynical, ego-deflating banter targeting the user's passivity, discipline, and idle consumption, incorporating aphorisms inspired by **Kautilya, Sun Tzu, Naval Ravikant, and David Goggins without mentioning author names**:
     - *"I hope you have money to offer us; we don't entertain broke men."*
     - *"Are you hard? Do you actually possess intelligence, or just cheap dopamine?"*
     - *"A man is measured strictly by his deeds, not by idle cravings. What have your hands accomplished today besides clicking a screen?"* (Kautilya)
     - *"In the midst of chaos, the disciplined seize opportunity—yet you surrender your attention to a digital mirage."* (Sun Tzu)
     - *"Desire is simply a contract you sign with yourself to remain miserable until you get what you want. You are drowning in simulated contracts you will never fulfill."* (Naval Ravikant)
     - *"You are searching for comfort where comfort will rot you from the inside out. The mind that craves easy dopamine has already surrendered its strength."* (David Goggins)
     - *"Often, those who are entirely powerless talk the most endlessly about power. What real leverage do you hold right now?"* (Kunal Shah)
4. **Verification**:
   - Unlock the barrier via F12 -> verify a random hostess appears with her name and verified avatar.
   - Advance through the tour -> verify the final step delivers the ego-check monologue.

---

## PHASE 5: FACEMASH "WHO IS HOTTER?" ARENA (New Dedicated Tab)

### Goal
Implement a high-performance Elo comparison mini-game as a dedicated primary navigation tab.

### Tasks
1. **Create `starlet-app/src/components/FaceMashArena.jsx`**:
   - Selects two random starlets with verified clean portraits.
   - Displays clean cards: Portrait, Name, Age, Era, and Tier Badges.
   - Controls:
     - `[Left Arrow]` / Click Left: Vote for Left.
     - `[Right Arrow]` / Click Right: Vote for Right.
     - `[Spacebar]` / Skip: Draw new pair without Elo change.
   - Calculates standard Elo updates ($K=32$):
     - $E_A = 1 / (1 + 10^{(R_B - R_A)/400})$
     - $R_A = R_A + 32 \times (1 - E_A)$
   - Persists Elo scores in `localStorage.getItem('facemash_elo_ratings')`.
   - Secondary tab: **"Top 50 Community Elo Leaderboard"**.
2. **Integrate into `App.jsx` and `TabBar.jsx`**:
   - Add tab `[🔥 FaceMash]` to the primary navigation bar.
   - Clicking tab switches `currentView = 'facemash'`.
3. **Verification**:
   - Navigate to FaceMash tab -> vote on 5 pairs -> verify Elo ratings update dynamically in the leaderboard.

---

## PHASE 6: MULTI-SOURCE VIDEO QUALITY SWITCHER & CO-STAR CROSS-INDEXING (Resolves Image 4)

### Goal
Provide high-definition stream mirror switching in the cinema player and fix the 0 co-star count for Melody Marks and other performers in the constellation.

### Tasks
1. **In-Player Quality Gear Switcher in `CinemaModal.jsx`**:
   - Add a Quality/Mirror gear button next to the player controls.
   - Allows switching between available mirrors:
     - `Eporner 1080p 60fps HD`
     - `XVideos 720p`
     - `FPO Archive 480p`
     - `XNXX Mirror`
2. **Co-Star Cross-Indexing Script (`enrich-costar-network.mjs`)**:
   - Create a script that scans all scene titles in `performers-tagged.json` for multi-actor patterns:
     - `"Melody Marks & Angela White"`, `"Melody Marks, Kendra Sunderland"`, etc.
   - Cross-links performers in `p.coStars` and builds mutual edge weights in `costar-graph.json`.
   - Specifically verify that Melody Marks has at least 8 verified co-star connections.
3. **Verification**:
   - Open Co-Star Constellation -> click Melody Marks -> verify she connects to Angela White, Kendra Sunderland, Gabbie Carter, etc. (no longer 0 co-stars).
   - Open Cinema Modal -> click Quality Gear -> verify mirror sources appear.

