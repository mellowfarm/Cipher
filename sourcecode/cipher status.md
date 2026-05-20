# Cipher — Project Status

*Last updated: May 2026*

-----

## What is Cipher

A behavioural science-backed personal finance app that derives financial psychology from spending data using a multi-layer ML pipeline. Users upload bank PDFs → Cipher categorises transactions, detects patterns, assigns a spending archetype, and generates a personalised portrait.

**Positioning:** Behavioural science + ML + consumer product. Nobody in SEA has all three.

**Team:** 3 people (Nicha + 2 others). Frontend/backend split.

-----

## Tech Stack

|Layer     |Tech                                                |
|----------|----------------------------------------------------|
|Frontend  |React (PWA, mobile-first)                           |
|Backend   |FastAPI (Python)                                    |
|Database  |PostgreSQL (Neon)                                   |
|Auth      |Neon Auth (Stack Auth under the hood)               |
|ML        |scikit-learn, sentence-transformers, FAISS (planned)|
|LLM       |Groq API (archetypes), Claude API (portraits)       |
|Deployment|Vercel (frontend) + Railway (FastAPI)               |

-----

## What’s Done ✅

### Infrastructure

- [x] React frontend — baseline UI
- [x] FastAPI backend
- [x] PostgreSQL database (Neon)
- [x] Authentication (Neon Auth / Stack Auth)
- [x] PDF parser (pdfplumber) — parses DBS, OCBC, UOB formats, extracts date/description/amount columns
- [x] Frontend ↔ backend connected end to end
- [x] GitHub repo set up

### ML / Features

- [x] Transaction categorisation — TF-IDF + logistic regression (working, current baseline)
- [x] Spending archetype generation — Groq API call (rule-based, not real ML)
- [x] Basic insights section (exists, details TBC)

### Product

- [x] 6 behavioural archetypes defined with academic grounding (Kahneman, Thaler, Ariely):
  - Present Hedonist
  - Comfort Seeker
  - Status Signaller
  - Anxious Saver
  - Optimism Spender
  - Inertia Holder

-----

## What’s In Progress 🔄

- [ ] More transaction data needed to improve categorisation model

-----

## What’s Next — ML Upgrade Roadmap 🚀

### Phase 1 — Smarter Categorisation (do this weekend)

**Upgrade TF-IDF → sentence transformers (zero-shot)**

No training data needed. Embed transaction descriptions + category labels, pick closest match by cosine similarity.

```python
from sentence_transformers import SentenceTransformer, util
model = SentenceTransformer('all-MiniLM-L6-v2')
# embed categories once, compare each transaction at runtime
```

- [ ] Install sentence-transformers
- [ ] Replace TF-IDF vectoriser with zero-shot sentence transformer pipeline
- [ ] Test on existing transaction data, identify failure cases (Singapore merchants like Koufu, NTUC, EZ-Link)
- [ ] If consistent errors → fine-tune on those specific cases

**Interview story:** “I started with TF-IDF, identified limitations on unseen Singapore merchants, upgraded to sentence transformers with zero-shot classification”

-----

### Phase 2 — Semantic Search (FAISS)

**Add vector search over user’s transactions**

User queries like “how much did I spend on food last month” → semantic search over transaction embeddings → retrieve relevant transactions → LLM summarises.

- [ ] Build FAISS index over user’s transaction embeddings
- [ ] Add semantic search endpoint in FastAPI
- [ ] Connect to frontend as a query feature

**Interview story:** mirrors friend’s TikTok interview — “I built a retrieval pipeline using bi-encoders for fast candidate retrieval” (bi-encoder = sentence transformer here)

-----

### Phase 3 — Spending Forecasting

**Predict end-of-month spend per category**

Linear regression or moving average over monthly aggregated totals. No external training data — fit on user’s own history.

- [ ] Aggregate transactions into monthly totals per category
- [ ] Fit linear regression (sklearn) on user’s history
- [ ] Show “you’re on track to spend $X on food this month”
- [ ] Handle cold start (< 2 months data) gracefully

-----

### Phase 4 — Anomaly Detection

**Flag unusual transactions**

Isolation forest or DBSCAN on user’s transaction history. Unsupervised, no labels needed.

- [ ] Flag transactions that are outliers vs user’s typical spending
- [ ] Surface as alerts: “this coffee was 3x your usual”
- [ ] Detect duplicate charges

-----

### Phase 5 — Real Archetype Clustering (replace Groq API)

**Replace rule-based archetypes with actual ML clustering**

DBSCAN or KMeans on behavioural features extracted from transaction history.

- [ ] Feature engineering: late-night spend %, impulse purchase flags, category ratios, spend variance
- [ ] Cluster users into archetypes using DBSCAN
- [ ] Map clusters to the 6 defined archetypes
- [ ] Keep Groq/Claude API at the end to narrate the ML output in human language

-----

## Product Roadmap (Versions)

|Version|Theme                                                                               |Status     |
|-------|------------------------------------------------------------------------------------|-----------|
|V1     |Decode yourself — stateless, no login, upload CSV/PDF, get archetype                |~done      |
|V2     |Understand yourself — user accounts, longitudinal tracking, Cipher Wrapped          |in progress|
|V3     |Change yourself — nudges, commitment devices, peer benchmarking                     |planned    |
|V4     |Recommend for yourself — behaviourally matched product recommendations, monetisation|future     |

-----

## Interview Story Arc

> “I built a personal finance app with a semantic transaction search engine. Started with TF-IDF for categorisation, identified failure cases on Singapore-specific merchants, upgraded to a sentence transformer zero-shot pipeline. Then built a FAISS vector index over user transactions to enable semantic queries — similar to a retrieval pipeline in a search system. The ML models do the analytical work; the LLM at the end narrates the outputs into human language.”

This mirrors exactly what the TikTok vertical search intern talked about across all 3 interview rounds.

-----

## Key Numbers (for interviews)

- 3-person team
- React + FastAPI + PostgreSQL + sentence-transformers + FAISS
- PDF parsing for DBS, OCBC, UOB formats
- 6 behavioural archetypes grounded in Kahneman/Thaler/Ariely research