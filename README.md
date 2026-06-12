# Cipher

Cipher is a behavioural finance web app that analyses your spending and tells you *why* you spend the way you do — not just what you spend on.

Upload a bank statement PDF (DBS, OCBC, UOB, Amex), and Cipher automatically categorises your transactions, assigns you a spending archetype grounded in behavioural economics (Kahneman, Thaler, Ariely), forecasts your end-of-month spend per category, flags unusual transactions, and generates a plain-language portrait of your spending psychology.

## Stack

- **Frontend** — React, deployed on Vercel
- **Backend** — FastAPI (Python), deployed on Railway
- **Database** — PostgreSQL (Neon)
- **ML** — scikit-learn (categorisation, forecasting, anomaly detection), sentence-transformers
- **LLM** — OpenAI API (portrait generation)

## Features

- PDF parsing for DBS, OCBC, UOB, and Amex credit card statements
- Automatic transaction categorisation via sentence-transformer zero-shot classification
- 6 behavioural spending archetypes (Present Hedonist, Comfort Seeker, Status Signaller, Anxious Saver, Optimism Spender, Inertia Holder)
- Spending forecasts using linear regression on personal transaction history
- Anomaly detection via Isolation Forest
- "Ask Cipher" — natural language search over your own transactions
- JWT authentication with password change support
