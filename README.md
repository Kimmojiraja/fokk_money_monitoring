# fook — Variable Income OS

> **Offline-first variable income budgeting for global freelancers.**
> No cloud. No bank sync. No subscriptions. On-device ML.

[![Live Demo](https://img.shields.io/badge/Demo-localhost:8081-10b981?style=flat-square)](http://localhost:8081)
![Offline](https://img.shields.io/badge/Offline-100%25-10b981?style=flat-square)
![No APIs](https://img.shields.io/badge/APIs-Zero-06b6d4?style=flat-square)
![Currencies](https://img.shields.io/badge/Currencies-50%2B-8b5cf6?style=flat-square)

---

## What is fook?

Most budgeting apps assume you earn the same amount every month. **You don't.**

fook is built for:
- 🇳🇬 Freelancer in Lagos earning in USD + NGN
- 🇹🇭 Uber driver in Bangkok earning daily in THB
- 🇦🇷 React contractor in Buenos Aires with USD + ARS clients
- 🇵🇭 Tutor in Manila with irregular payment cycles

**Same app. Same price. Works everywhere. No internet needed.**

---

## Features

### 🧠 On-Device Income Forecasting
- Double Exponential Smoothing (Holt-Winters) runs **100% in your browser**
- Shows confidence intervals: Conservative → Expected → Optimistic
- Never a false single-number prediction
- Gets smarter with more history

### 📱 Mobile-First Design
- Bottom navigation bar for one-thumb use
- Swipeable KPI card carousel on mobile
- Bottom sheet modal (native feel on iOS/Android)
- PWA: Add to Home Screen support
- Large tap targets (44px minimum)

### 💰 Multi-Currency (Offline)
- 50+ currencies embedded — **no API calls ever**
- Instant conversion to your home currency
- Supports NGN, INR, KES, BRL, THB, PHP and more

### 🎨 Dark / Light Theme
- System-level design tokens
- OLED-optimized dark mode
- Clean light mode for daytime use
- Toggle with one tap (or press `T`)

### 🔒 Privacy Blur
- Tap the eye icon to blur all numbers
- Perfect for public spaces or screen sharing
- Press `P` as keyboard shortcut

### 🔥 Unique Features
| Feature | Description |
|---|---|
| **Doom Mode** | Red alert when cash runway < 5 days |
| **Income Volatility Index** | Coefficient of Variation — how stable is your income? |
| **Weekly Streak** | 8-week check-in habit tracker |
| **Health Score** | 0–100 composite: savings rate + diversification + ML accuracy |
| **Prediction Override** | Manually adjust forecast ±50% with a reason |
| **Client Pareto Analysis** | Which clients drive 80% of your revenue? |
| **Safe-to-Invest Calculator** | What's left after all projected expenses? |

### ⚡ Smart NL Quick-Log
Type naturally: `"1200 USD from Upwork"` or `"spent 45 on food"` — AI parses it instantly.
Voice input supported (Chrome/Edge/Safari).

### 📊 Full Accounting View
- Ledger with search + filter (Income / Expense / Recurring / Tax-Ded.)
- Tax deduction breakdown
- CSV + JSON export
- Print-friendly report

---

## Quick Start

```bash
# No npm, no node, no dependencies
python3 server.py

# Opens at http://localhost:8081
```

That's it. Open your browser. Done.

---

## Architecture

```
fokk_money_monitor/
├── index.html          # Full SPA — mobile-first UI
├── styles.css          # Design system (dark/light tokens)
├── app.js              # FookApp controller
├── ml_engine.js        # On-device: IncomeForecaster, NaiveBayesNLP, AnomalyDetector
├── currency_matrix.js  # 50+ currencies embedded (no API)
├── i18n.js             # EN, ES, HI, PT, FR localization
├── server.py           # Python stdlib HTTP + SQLite (zero deps)
├── manifest.json       # PWA manifest
└── fook_local.db       # Auto-created SQLite database
```

### ML Algorithms (All On-Device)
- **Income Forecasting**: Double Exponential Smoothing (Holt-Winters) with seasonal multipliers
- **NLP Categorization**: Naïve Bayes with multi-language keywords + currency detection
- **Anomaly Detection**: Z-Score per category (flags outliers ≥ 2.4σ)
- **Volatility**: Coefficient of Variation across income history

### Safe Spend Formula
```
safe_ceiling = (predicted_monthly_income × safe_rate) − monthly_fixed_commitments
safe_daily   = (safe_ceiling − spent_so_far) / days_remaining
```

---

## Monetization Model
- **$2.99/month** or **$15 one-time lifetime** purchase
- Built for the global freelancer market (5M+ potential users)
- Zero cloud infrastructure costs → high margin

---

## Privacy
- **Zero telemetry**. No analytics. No tracking.
- All data stored in browser `localStorage` + optional local SQLite
- Data never leaves your device
- Privacy blur mode for public spaces

---

## Tech Stack
- Vanilla JS (ES2020) — no framework
- Tailwind CSS (CDN) + Custom CSS design tokens
- Python 3 standard library (HTTP server + SQLite)
- Web Speech API (voice input)

---

*Built with ❤️ for freelancers who live in the variable-income reality.*
