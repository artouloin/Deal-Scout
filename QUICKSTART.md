# GCG Deal Scout — Vercel Quick Start

## 🎯 Das brauchst du (2 Dinge):

1. **Claude API Key** → https://console.anthropic.com/account/keys
   - Kostenlos bis 5 USD/Monat (großzügiges Limit)

2. **GitHub Account** → https://github.com/join
   - Kostenlos

---

## 📋 Deployment in 3 Schritten

### 1️⃣ Code auf GitHub pushen

```bash
# Im GCG Deal Scout Verzeichnis:
cd /Users/johannesbaumgartner/Documents/gcg-deal-scout

git remote add origin https://github.com/DEIN_USERNAME/gcg-deal-scout.git
git branch -M main
git push -u origin main
```

### 2️⃣ Vercel mit GitHub verbinden

```bash
# Vercel CLI
npm install -g vercel
vercel --prod
```

Vercel wird dich bitten, dich anzumelden. Verbinde es mit deinem GitHub Repo.

### 3️⃣ Umgebungsvariablen in Vercel setzen

Gehe zu **https://vercel.com/dashboard** → Dein Projekt → **Settings > Environment Variables**

Mindestens diese 4 eintragen:

```
ANTHROPIC_API_KEY = sk-ant-... (aus console.anthropic.com)
NEXTAUTH_SECRET = openssl rand -base64 32 (in Terminal ausführen)
DATABASE_URL = wird automatisch von Vercel Postgres generiert
NOTIFY_EMAILS = j.s.a.baumgartner@gmx.de
```

---

## ✅ Nach Deployment

1. **Datenbank initialisieren:**
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

2. **App öffnen:** https://gcg-deal-scout.vercel.app

3. **Login:**
   - Email: `demo@gcg.de`
   - Password: `demo123`

4. **Scraper triggern:** Button "Jetzt scannen" klicken

---

## 🤖 Automatisches tägliches Scraping

Füge eine GitHub Action hinzu (`.github/workflows/daily-scraper.yml`):

```yaml
name: Daily Scraper

on:
  schedule:
    - cron: '0 7 * * *'

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST https://YOUR_VERCEL_URL/api/scraper/run
```

---

## 🎓 Danach lesen

- **Detailed Deployment:** `DEPLOY_VERCEL.md`
- **Local Setup:** `SETUP.md`
- **Architecture:** Schau in `src/` für Code-Structure

---

## ⚡ TL;DR Commands

```bash
# GitHub push
git remote add origin https://github.com/YOUR/gcg-deal-scout.git && git push -u origin main

# Vercel deploy
npm install -g vercel && vercel --prod

# Set vars in Vercel UI:
# ANTHROPIC_API_KEY, NEXTAUTH_SECRET, DATABASE_URL, NOTIFY_EMAILS

# Initialize DB
vercel env pull .env.local && npx prisma migrate deploy

# Done! 🚀
```

---

**Questions?** Schau in DEPLOY_VERCEL.md oder öffne ein Issue auf GitHub.
