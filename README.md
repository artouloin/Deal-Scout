# 🚀 GCG Deal Scout

**Intelligente Lead-Generierung für GCG Unternehmensberatung**

Eine Web-App, die automatisch Stellenangebote von 15 Job-Portalen scraped, mit KI analysiert und bewertet, Anschreiben generiert, und das Team per E-Mail benachrichtigt.

---

## 📋 Features

✅ **11 Job-Scraper** — Bundesagentur, Indeed, StepStone, XING, LinkedIn, JobVector, Talent.com, YourFirm, und mehr
✅ **Intelligente Job-Analyse** — Match-Scoring (0-100) gegen GCG-Profil
✅ **Anschreiben-Generator** — Automatisch generierte Bewerbungsanschreiben
✅ **Team-Benachrichtigungen** — Tägliche E-Mails mit Top-Matches an j.s.a.baumgartner@gmx.de
✅ **Responsive Dashboard** — Filterable Job-Liste mit Call-Tracking
✅ **Fallback-System** — Funktioniert auch ohne Claude API (Keywords-basiert)
✅ **Vercel Deployment** — Production-ready

---

## 🚀 Quick Start (3 Schritte)

### 1. Code zu GitHub pushen
```bash
cd /Users/johannesbaumgartner/Documents/gcg-deal-scout
gh auth login
git push -u origin main
```

### 2. Vercel deployen + DB initialisieren
```bash
bash vercel-deploy.sh
```

### 3. Fertig! 🎉
App läuft unter `https://your-domain.vercel.app`

---

## 📚 Dokumentation

| Datei | Inhalt |
|-------|--------|
| **DEPLOY_NOW.md** | ← **START HIER** — 3-Schritt Deployment |
| QUICKSTART.md | 5-Minuten Übersicht |
| DEPLOY_VERCEL.md | Detaillierte Anleitung + Troubleshooting |
| SETUP.md | Lokal starten (Entwicklung) |

---

## 🔐 Login (Demo)

- **Email:** `demo@gcg.de`
- **Password:** `demo123`

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL (Vercel Postgres)
- **Auth:** NextAuth.js
- **Scraping:** Playwright, REST APIs
- **AI:** Claude API (Optional)
- **Deployment:** Vercel

---

## 📞 Support

- **GitHub:** https://github.com/artouloin/Deal-Scout
- **Email:** info@gcg-consulting.de
- **Docs:** Siehe Ordner `/docs/` in diesem Projekt

---

## 📄 Lizenz

Intern verwendetes GCG Tool — Alle Rechte vorbehalten.

---

**Bereit?** → Öffne `DEPLOY_NOW.md` und starte! 🚀
# Deal-Scout
