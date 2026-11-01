# Starlet Directory — VIP Edition

A high-performance, aesthetically crafted adult filmography directory and verified scene catalog built with **Vite**, **React 19**, **Framer Motion**, and **Tailwind CSS**.

---

## 🌟 Key Features

### 1. Direct Video Streaming & Verified Filmography (Phase 1)
- **Eliminated Random FPO Searches**: Instead of generating arbitrary keyword search URLs that lead to irrelevant results, every performer's scene catalog now indexes **verified video releases**.
- **Rich Scene Metadata**:
  - Direct video playback URLs (`https://www.fpo.xxx/video/...`)
  - Real high-definition screenshot thumbnails
  - Exact scene durations (e.g. `8:01`, `39:48`)
  - User rating percentage badges (e.g. `90%`, `82%`)
  - Studio & scenario tags (Brazzers, Pure Taboo, TeamSkeet, Stepmom, Stepsis, etc.)
- **Persistent Scene Cache**: Fetched scene data is cached in `./scene-cache/` to ensure offline availability and instant loading.

### 2. Next-Gen VIP UI with Framer Motion (Phase 2)
- **Fluid Layout & Physics**:
  - Smooth tab switching with Framer Motion sliding pill indicator
  - 3D perspective hover tilt on performer cards
  - Spring-animated Performer Dossier Modal with backdrop blur
  - Micro-confetti particle burst when favoriting performers
- **Family Scene Shelf & Streaming Theater**:
  - Dedicated theater view categorizing scenes by family scenario genres
  - Quick studio filter pills (Brazzers, Pure Taboo, TeamSkeet, Nubiles, Deeper, etc.)
  - Real-time search by starlet name or scene title
- **Smart Natural Language Search**:
  - Supports queries like `"under 25"`, `"over 30"`, `"blonde"`, `"brunette"`, `"newcomer"`, `"family"`, or free text.
  - Keyboard shortcut: Press `[/]` to instantly focus search, `[Esc]` to close modals or reset search, and `[1-5]` to switch tabs.
- **Offline Tri-Tier Avatar Fallback**:
  - Tier 1: Local high-res JPG (`./avatars/{id}.jpg`)
  - Tier 2: Local SVG monogram avatar (`./avatars/{id}.svg`)
  - Tier 3: Babepedia CDN / Dynamic initials avatar

---

## 🚀 Quick Start

### Launching the Application
Double-click `start.bat` or run:
```powershell
python -m http.server 8000
```
Then open either edition in your browser:
- **VIP Edition (Vite + React + Framer Motion)**:  
  [http://localhost:8000/starlet-app/dist/index.html](http://localhost:8000/starlet-app/dist/index.html)
- **Classic Edition**:  
  [http://localhost:8000/starlet-directory-v5.html](http://localhost:8000/starlet-directory-v5.html)

### Running Vite Development Server
To develop with instant Hot Module Replacement (HMR):
```powershell
cd starlet-app
npm run dev
```
Open `http://localhost:5173`.

---

## 🛠️ Automated Scene Enrichment CLI

To fetch and verify more real scenes with direct video links and thumbnails for your performers:

```powershell
# Enrich next 50 performers
node enrich-scenes-all.mjs --limit 50

# Regenerate tags and rebuild the VIP app
node tag-genres.mjs performers.json performers-tagged.json
Copy-Item performers-tagged.json starlet-app/public/ -Force
cd starlet-app
npm run build
```

