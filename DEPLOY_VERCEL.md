# GCG Deal Scout — Vercel Deployment Guide

## 🚀 Quick Deploy (5 Minuten)

### Schritt 1: GitHub Repository erstellen & pushen

```bash
cd /Users/johannesbaumgartner/Documents/gcg-deal-scout

# Git remote hinzufügen (ersetze mit deinem GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/gcg-deal-scout.git
git branch -M main
git push -u origin main
```

### Schritt 2: Vercel CLI installieren & deployen

```bash
npm install -g vercel
vercel
```

Folge den Prompts:
- ✅ Link existing project? → **No** (first time)
- ✅ What's your project's name? → `gcg-deal-scout`
- ✅ In which directory is your code? → `./`
- ✅ Want to modify the settings? → **Yes**

### Schritt 3: Environment Variables in Vercel setzen

Gehe zu [vercel.com/dashboard](https://vercel.com/dashboard), öffne das Projekt und gehe zu **Settings > Environment Variables**:

**Minimal (Erforderlich):**
```
DATABASE_URL=postgresql://...vercel.postgres.com/...
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-project.vercel.app
ANTHROPIC_API_KEY=sk-ant-...
NOTIFY_EMAILS=j.s.a.baumgartner@gmx.de
TEAM_USERS=[{"id":"1","email":"demo@gcg.de","name":"Demo","password":"$2a$10$..."}]
```

**Optional (für E-Mail-Benachrichtigungen):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=GCG Deal Scout <noreply@your-domain>
```

### Schritt 4: Vercel Postgres aktivieren

1. Gehe zur [Vercel Dashboard](https://vercel.com/dashboard)
2. Öffne dein GCG Deal Scout Projekt
3. Klick auf **"Storage"** → **"Create Database"** → **"Postgres"**
4. Akzeptiere die Bedingungen
5. **Connection String kopieren** und in `DATABASE_URL` einfügen

### Schritt 5: Prisma Migrationen in Production

```bash
# Local: Erstelle eine Migration
npx prisma migrate dev --name init

# Oder direkt in Vercel via CLI:
vercel env pull .env.local
npx prisma migrate deploy
```

---

## 📋 Erforderliche Umgebungsvariablen

| Variable | Wo bekommen | Beispiel |
|----------|-----------|---------|
| `DATABASE_URL` | Vercel Postgres | `postgresql://...vercel.postgres.com/...` |
| `ANTHROPIC_API_KEY` | console.anthropic.com | `sk-ant-...` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | `abc123...` |
| `NEXTAUTH_URL` | Deine Vercel App URL | `https://gcg-deal-scout.vercel.app` |
| `SMTP_HOST` | Gmail oder Outlook | `smtp.gmail.com` |
| `SMTP_PORT` | 587 (TLS) oder 465 (SSL) | `587` |
| `SMTP_USER` | Deine Gmail/Outlook E-Mail | `your@gmail.com` |
| `SMTP_PASS` | Gmail App Password | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | Beliebig | `GCG <noreply@gcg.de>` |
| `NOTIFY_EMAILS` | Deine E-Mail | `j.s.a.baumgartner@gmx.de` |

---

## 🔐 Gmail App Password generieren (Optional)

**Nur nötig wenn du E-Mail-Benachrichtigungen einschalten möchtest!**

1. Gehe zu [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Wähle **Mail** und **Windows Computer** (oder dein Gerät)
3. Kopiere das 16-stellige Passwort
4. Verwende das in `SMTP_PASS`

**Ohne SMTP:** App funktioniert trotzdem, aber E-Mails werden nicht versendet (nur Logs)

---

## 🧪 Nach Deployment testen

```bash
# App öffnen
vercel --prod

# Logs anschauen
vercel logs

# Scraper triggern
curl https://your-project.vercel.app/api/scraper/run \
  -H "Authorization: Bearer <session-token>"
```

---

## ⚙️ Automatische Deployments

Vercel deployt automatisch jeden Push zu `main`:

```bash
# Change → Commit → Push = Auto Deploy in ~30 Sekunden
git add .
git commit -m "Fix scraper"
git push origin main
```

---

## 🔄 Tägliche Job-Scraper (Vercel Cron)

Für automatische tägliche Scans brauchst du **Vercel Pro** (~$20/Monat) für Cron Jobs.

Alternativ: Verwende einen kostenlosen **n8n**-Workflow oder **GitHub Actions**:

### Option 1: GitHub Actions (Kostenlos)

Erstelle `.github/workflows/daily-scraper.yml`:

```yaml
name: Daily Job Scraper

on:
  schedule:
    - cron: '0 7 * * *'  # Täglich 7:00 AM UTC

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Scraper
        run: |
          curl -X POST https://gcg-deal-scout.vercel.app/api/scraper/run \
            -H "Authorization: Bearer ${{ secrets.SCRAPER_TOKEN }}"
```

### Option 2: n8n (Kostenlos)

1. Gehe zu [n8n.cloud](https://n8n.cloud)
2. Erstelle einen HTTP Request Workflow
3. Sende POST zu `/api/scraper/run` täglich um 7 AM

---

## 📊 Monitoring & Logs

```bash
# Live Logs anschauen
vercel logs --follow

# Errors filtern
vercel logs --level=error

# Spezifische API anschauen
vercel logs --search="api/scraper"
```

---

## 🐛 Häufige Probleme

### "Playwright binaries not found"
Playwright braucht spezielle Handling in Serverless. Lösung:
```bash
npm install --save-optional playwright
# Oder: Playwright auf dem Server installieren
npx playwright install chromium
```

### "Can't connect to database"
- Vercel Postgres aktiviert?
- `DATABASE_URL` korrekt gesetzt?
- Prisma migrations deployed?

```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### "Email nicht versendet"
- SMTP Credentials korrekt?
- Gmail App Password (nicht Passwort!) verwendet?
- Firewall blockiert Port 587?

---

## 📱 Admin Dashboard URL

Nach Deployment:
- **Frontend:** `https://gcg-deal-scout.vercel.app`
- **API Base:** `https://gcg-deal-scout.vercel.app/api`

---

## 🚨 Sicherheit

✅ Secrets NIE in Repo committen
✅ Verwende Vercel Environment Variables
✅ NEXTAUTH_SECRET stark (32 Zeichen)
✅ SMTP Passwort ist ein App Password, nicht dein Hauptpasswort

---

## 💡 Nächste Schritte nach Deploy

1. **Teste Login**: demo@gcg.de / demo123
2. **Triggerе Scraper**: Button "Jetzt scannen" drücken
3. **Überprüfe E-Mails**: j.s.a.baumgartner@gmx.de sollte Benachrichtigungen erhalten
4. **Monitoring**: Vercel Logs anschauen für Fehler

---

**Fragen?** E-Mail: info@gcg-consulting.de
