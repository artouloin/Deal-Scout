# GCG Deal Scout — Einrichtungsanleitung

## 🚀 Schnellstart

### 1. Datenbank aufsetzen

#### Option A: PostgreSQL lokal (Docker)
```bash
docker run --name gcg-postgres \
  -e POSTGRES_USER=gcg_user \
  -e POSTGRES_PASSWORD=gcg_password \
  -e POSTGRES_DB=gcg_deal_scout \
  -p 5432:5432 \
  -d postgres:16
```

Dann `.env.local` updaten:
```env
DATABASE_URL="postgresql://gcg_user:gcg_password@localhost:5432/gcg_deal_scout"
```

#### Option B: Railway (Cloud)
1. Gehe zu [railway.app](https://railway.app)
2. Neues Projekt → Add Database → PostgreSQL
3. Connection String in `.env.local` kopieren

### 2. Prisma Datenbank initialisieren

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Claude API-Key hinzufügen

1. Gehe zu [console.anthropic.com](https://console.anthropic.com)
2. API Key generieren
3. In `.env.local` eintragen:
```env
ANTHROPIC_API_KEY="sk-ant-..."
```

### 4. NextAuth Secret generieren

```bash
openssl rand -base64 32
```

Dann in `.env.local`:
```env
NEXTAUTH_SECRET="<generated-secret>"
```

### 5. Projekt starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

**Demo-Login:**
- Email: `demo@gcg.de`
- Passwort: `demo123`

---

## 📋 Demo-Daten laden

Um die Anwendung mit echten Job-Daten zu testen:

```bash
curl -X POST http://localhost:3000/api/scraper/run
```

Dies triggert die Bundesagentur-API und Indeed-Scraper im Hintergrund.

---

## 🔧 Produktions-Deployment

### Frontend (Vercel)

```bash
# Vercel CLI installieren
npm install -g vercel

# Projekt verbinden & deployen
vercel
```

Umgebungsvariablen auf Vercel setzen:
```
ANTHROPIC_API_KEY
DATABASE_URL
NEXTAUTH_SECRET
SMTP_*
NOTIFY_EMAILS
```

### Backend/Database (Railway)

1. Neues Service auf Railway
2. GitHub repo verbinden
3. Start command: `npm run build && npm start`
4. Environment variables setzen

---

## 📧 E-Mail konfigurieren

### Gmail SMTP
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"
SMTP_FROM="GCG <noreply@gcg-consulting.de>"
```

### Outlook SMTP
```env
SMTP_HOST="smtp.office365.com"
SMTP_PORT="587"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
SMTP_FROM="GCG <noreply@gcg-consulting.de>"
```

---

## 🧪 Testing

### Jobs API Test
```bash
# Get jobs (requires auth)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/jobs?status=NEW&minScore=70

# Trigger scraper
curl -X POST http://localhost:3000/api/scraper/run
```

### Prisma Studio
```bash
npx prisma studio
```

Öffnet [http://localhost:5555](http://localhost:5555) zum Visualisieren/Editieren von Datenbankdaten

---

## 📚 Technologie-Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL, Prisma ORM
- **Auth:** NextAuth.js
- **AI:** Claude API (Sonnet 4)
- **Scraping:** Playwright, Bundesagentur REST API
- **Email:** Nodemailer
- **Queue/Cron:** node-cron (Bull optional für Redis)
- **Deployment:** Vercel (Frontend), Railway (Backend/DB)

---

## 🗂️ Dateistruktur

```
gcg-deal-scout/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/
│   │   │   ├── jobs/
│   │   │   ├── cover-letters/
│   │   │   └── scraper/
│   │   ├── (dashboard)/
│   │   │   └── jobs/         # Main dashboard
│   │   ├── login/            # Login page
│   │   └── layout.tsx
│   ├── components/           # React components
│   ├── lib/
│   │   ├── prisma.ts         # DB client
│   │   ├── claude.ts         # AI client
│   │   ├── scrapers/         # Job scrapers
│   │   ├── ai/               # AI logic (analyzer)
│   │   ├── email/            # Email services
│   │   └── cron/             # Cron jobs
│   └── generated/            # Auto-generated Prisma files
├── prisma/
│   └── schema.prisma         # Data model
└── .env.local                # Environment variables
```

---

## ⚙️ Umgebungsvariablen Reference

| Variable | Beispiel | Zweck |
|----------|----------|-------|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection |
| `NEXTAUTH_SECRET` | `abc123...` | JWT signing key |
| `NEXTAUTH_URL` | `http://localhost:3000` | App URL |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Claude API |
| `SMTP_HOST` | `smtp.gmail.com` | E-Mail SMTP server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | `noreply@gcg...` | SMTP user |
| `SMTP_PASS` | `...` | SMTP password |
| `SMTP_FROM` | `GCG <noreply@...>` | From address |
| `NOTIFY_EMAILS` | `a@gcg.de,b@gcg.de` | Team notification emails |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public app URL |
| `TEAM_USERS` | `[{...}]` | JSON array of allowed users |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection (optional) |

---

## 🐛 Häufige Fehler

### „Cannot find module @prisma/client"
```bash
npm install
npx prisma generate
```

### „Unknown database"
PostgreSQL nicht läuft oder DATABASE_URL falsch:
```bash
docker ps | grep postgres
# Oder:
psql -U gcg_user -d gcg_deal_scout -c "SELECT 1"
```

### „NEXTAUTH_SECRET is missing"
Muss in `.env.local` und Produktionsumgebung definiert sein

### „Job-Scraping wird nicht ausgelöst"
1. Verifiziere Playwright-Installation: `npx playwright install`
2. Prüfe Netzwerk-Zugang zu Job-Portalen (VPN, Firewall?)
3. Logs prüfen: `npm run dev`

---

## 📞 Support

**Kontakt:**
- 📧 info@gcg-consulting.de
- 🌐 www.gcg-consulting.de
- ☎️ +49 721 9454991-0

---

## 📄 Lizenz

Intern verwendetes GCG Tool — Alle Rechte vorbehalten.
