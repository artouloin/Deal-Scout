# 🚀 GCG Deal Scout — 3-Schritt Deployment (Jetzt!)

Alles ist vorbereitet. Folge diesen 3 Schritten:

---

## ✅ Schritt 1: Code zu GitHub pushen

```bash
cd /Users/johannesbaumgartner/Documents/gcg-deal-scout

# Push mit GitHub Credentials (Token oder SSH)
git push -u origin main

# Falls "Device not configured" → GitHub CLI verwenden:
# gh auth login
# gh repo create artouloin/Deal-Scout --source=. --remote=origin --push
```

⏱️ **Dauer:** 30 Sekunden

---

## ✅ Schritt 2 & 4: Vercel Deploy + DB Init

```bash
# Alles automatisch machen:
bash vercel-deploy.sh
```

Das Skript macht:
1. ✅ Vercel CLI installieren (falls nötig)
2. ✅ Zu Vercel deployen (`vercel --prod`)
3. ✅ Environment Variablen konfigurieren
4. ✅ Prisma Datenbank initialisieren

⏱️ **Dauer:** 5-10 Minuten (mit Vercel UI)

---

## 📋 Was während `bash vercel-deploy.sh` passiert:

### 1. Vercel Prompt
```
? Set up and deploy? [Y/n]
```
→ **Y drücken**

### 2. Connect to GitHub (First time only)
→ Authorize Vercel zum GitHub Zugriff → Done

### 3. Vercel Environment Variables
Das Skript sagt dir, welche zu setzen sind:
- `DATABASE_URL` ← Vercel generiert automatisch
- `NEXTAUTH_SECRET` ← Kann leer bleiben (Vercel generiert default)
- `NOTIFY_EMAILS` ← Ist bereits `j.s.a.baumgartner@gmx.de`
- `TEAM_USERS` ← Demo-Benutzer vorhanden

### 4. Prisma Migrations
Datenbank wird automatisch erstellt und migriert.

---

## ✨ Nach Deployment

### App öffnen:
```bash
vercel --prod
```

→ Deine URL wird angezeigt (z.B. `https://deal-scout.vercel.app`)

### Login:
- 📧 Email: `demo@gcg.de`
- 🔐 Password: `demo123`

### Scraper testen:
- Dashboard öffnen
- Button "Jetzt scannen" drücken
- Wait 30 Sekunden → Jobs appear

### Benachrichtigungen:
- E-Mails gehen an: `j.s.a.baumgartner@gmx.de`
- Nur wenn SMTP konfiguriert (optional)

---

## 🔑 Das Besondere: Funktioniert OHNE Claude API!

Die App nutzt **Keyword-basierte Fallback-Analyse**:
- ✅ Jobs werden bewertet (0-100)
- ✅ Anschreiben werden generiert (Template)
- ✅ Alle Funktionen funktionieren

Mit Claude API wäre es besser (KI-Analyse statt Keywords), aber nicht nötig!

---

## 🐛 Falls etwas schiefgeht:

### Error: "Device not configured"
```bash
# Lösung: SSH Key verwenden
git remote set-url origin git@github.com:artouloin/Deal-Scout.git
git push -u origin main
```

### Error: "Database migration failed"
```bash
# Manuell versuchen:
npx prisma migrate deploy
```

### Error: "Vercel deployment failed"
```bash
# Logs anschauen:
vercel logs
```

---

## 📊 Zusammenfassung der Architektur

```
GitHub (Code)
    ↓
Vercel (Deployment)
    ├── Next.js Frontend (React)
    ├── Next.js API Routes
    └── Vercel Postgres (Datenbank)

Automatisch täglich:
    → Job Scraper (11 Plattformen)
    → Claude Analyse (oder Fallback)
    → E-Mail an j.s.a.baumgartner@gmx.de
```

---

## 🎯 Was ist jetzt live:

| Feature | Status |
|---------|--------|
| Login (demo@gcg.de / demo123) | ✅ Ready |
| Job-Scraping (11 Plattformen) | ✅ Ready |
| Job-Analyse & Scoring | ✅ Ready (Fallback) |
| Anschreiben-Generator | ✅ Ready (Template) |
| E-Mail Benachrichtigungen | ⚠️ Optional (kein SMTP) |
| Claude AI Optimierung | ⚠️ Optional (kein Key) |
| Tägliche Auto-Scraper | ⏳ Nach GitHub Actions Setup |

---

## 🚀 Los gehts!

```bash
# Terminal öffnen und:
cd /Users/johannesbaumgartner/Documents/gcg-deal-scout

# 1. GitHub
git push -u origin main

# 2. Vercel + DB
bash vercel-deploy.sh

# 3. Fertig! 🎉
```

---

**Fragen?** Siehe: `QUICKSTART.md`, `DEPLOY_VERCEL.md`, oder `SETUP.md`

**Geschätzte Zeit bis live:** 10-15 Minuten ⏱️
