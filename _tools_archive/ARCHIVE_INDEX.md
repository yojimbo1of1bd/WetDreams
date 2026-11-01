# 📦 TOOLS & RAW DATA ARCHIVE INDEX
**Generated:** 2026-11-01  
**Total Preserved Items:** 90 assets  
**Status:** Preserved and indexed. Zero data lost.

---

## 1. Directory Structure

- `_tools_archive/scrapers/`: 60+ Node.js ES Module scripts (`.mjs`) used for historical catalog ingestion, scraping, data enrichment, and testing.
- `_tools_archive/raw_scraped_dumps/`: Raw thread comments, API responses, temporary HTML snapshots, and pipeline CSVs.
- `_tools_archive/legacy_prototypes/`: Monolithic pre-React prototypes (`starlet-directory-v4.html`, `starlet-directory-v5.html`).

---

## 2. Preserved Scrapers & Ingestion Scripts (`_tools_archive/scrapers/`)

| Script Name | Purpose / Extraction Target |
| :--- | :--- |
| `harvest-chores-points.mjs` | Harvests chores, points exchange, and leverage scenario scenes |
| `harvest-family-swap-bday.mjs` | Ingestion script for family swaps and holiday releases |
| `harvest-targeted-seven.mjs` | Targeted scene harvester for priority starlet targets |
| `enrich-priority-targets.mjs` | Photographic avatar downloader & 24-scene filmography resolver |
| `deep-background-enricher.mjs`| 1,000+ photo portrait downloader & filmography enricher |
| `deep-load-underworld.mjs` | Populates and validates scenario subdomains for Underworld |
| `enrich-underworld-scenes.mjs`| Video frame and metadata enricher for Underworld taxonomy |
| `enrich-personas-and-quotes.mjs`| Ingests performer life quotes and Reddit community consensus |
| `enrich-daughter-dynamics.mjs`| Stepdaughter & parental permission dynamics harvester |
| `enrich-costar-network.mjs` | Generates co-star network constellation edges |
| `build-costar-graph.mjs` | Deduplicated bi-directional scene co-star graph builder |
| `precompute-similarity.mjs` | Offline TF-IDF cosine similarity matrix generator |
| `generate-snapshots.mjs` | Vector SVG snapshot generator for guided walkthrough |
| `generate-reddit-hype.mjs` | Reddit discussion density and virality index calculator |
| `scrape-underworld-subdomains.mjs` | Scenario taxonomy scraper across FPO, Eporner & tube endpoints |
| `ingest-underworld-performers.mjs` | Model profile mapper for Underworld categories |
| `ingest-miriama.mjs` | Dedicated high-res portrait and scene loader for Miriama Kunkelova |
| `download-headshots.mjs` | Batch photo headshot downloader |
| `download-posed-photos.mjs` | Posed 16:9 photoshoot downloader for FaceMash Arena |
| `tag-genres.mjs` | Multi-token taxonomic genre classifier |
| `agentic-enricher.mjs` | AI-assisted scene tagger and duration normalizer |
| `batch-data-1.mjs` - `batch-data-3.mjs` | Segmented batch scene payload records |
| `batch-expand.mjs`, `batch-expand-3.mjs` | Catalog expansion scripts |
| `batch-import-user-list.mjs` | Ingestion script for user-provided starlet lists |
| `import-starname-pipeline.mjs` | Pipeline for importing model records from CSV/IAFD |
| `test-*.mjs` | Connectivity, CDN, API and parsing unit verification scripts |

---

## 3. Preserved Dumps & Intermediate Data (`_tools_archive/raw_scraped_dumps/`)

- `all_thread_comments_clean.txt`: Sanitized text dump of Reddit discussions and performer mentions.
- `extracted_comments.txt`: Raw user sentiment commentary from r/Porn_Discuss.
- `parsed_reddit_names.txt`: Extracted model alias candidates from forum threads.
- `reddit_thread_temp.html`: Temporary saved thread HTML for offline comment parsing.
- `fpo-sample.html`: Tube HTML DOM sample for embed frame scraping verification.
- `user-names-input.txt`: Raw input list of model names provided during catalog setup.
- `subreddits.txt`: Subreddit targets used for discussion density tracking.
- `thread_comments.json`: Structured JSON dump of harvested community feedback.
- `reddit_api.json`: Cached OAuth/search response from Reddit JSON endpoint.
- `canonical-scenes.json`: Initial staging record for scene deduplication.
- `newcomers-staging.json`: Staging candidate records for newly debuting starlets.
- `ENRICHMENT_STATUS.json`: Status metrics checkpoint from background enrichment.
- `starname.csv`: Source CSV dictionary of performer names and aliases.

---

## 4. How to Re-Run any Tool

All scrapers are self-contained ES Modules. To run any script in the future:
```bash
# Navigate to the workspace and execute via Node.js
node _tools_archive/scrapers/<script-name>.mjs
```

