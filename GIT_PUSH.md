# 🔓 GitHub Push — Schritt für Schritt

Du musst den Code zu GitHub pushen. Hier sind 2 einfache Methoden:

---

## ✅ Methode 1: GitHub CLI (EMPFOHLEN)

**Voraussetzung:** GitHub CLI installiert
```bash
# Prüfen ob installiert:
which gh
```

**Wenn nicht installiert:**
```bash
# macOS:
brew install gh

# Andere OS:
# https://github.com/cli/cli/blob/trunk/docs/install.md
```

**Dann ausführen:**
```bash
cd /Users/johannesbaumgartner/Documents/gcg-deal-scout

# Login bei GitHub (First time only)
gh auth login
# → Wähle: GitHub.com
# → Wähle: HTTPS
# → Wähle: Y (Authenticate Git with...)
# → Browser öffnet sich → Autorisiere

# Jetzt pushen:
git push -u origin main
```

**Fertig!** Code ist auf GitHub.

---

## ✅ Methode 2: HTTPS + Personal Access Token

**Schritt 1: Token generieren**
1. Gehe zu: https://github.com/settings/tokens/new
2. Klick **Generate new token** → **Generate new token (classic)**
3. Name: `gcg-deal-scout-deployment`
4. Expiration: `90 days`
5. Scope: Setze Häkchen bei:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Klick **Generate token**
7. **Token kopieren** (Zeigt sich nur 1x!)

**Schritt 2: Mit Token pushen**
```bash
cd /Users/johannesbaumgartner/Documents/gcg-deal-scout

# Git remote mit HTTPS nochmal setzen:
git remote set-url origin https://github.com/artouloin/Deal-Scout.git

# Pushen:
git push -u origin main

# Wenn gefragt:
# Username: artouloin
# Password: <dein token hier einfügen>
```

**Fertig!** Code ist auf GitHub.

---

## ✅ Methode 3: SSH (Für fortgeschrittene)

Nur wenn du bereits SSH-Keys bei GitHub eingerichtet hast:

```bash
cd /Users/johannesbaumgartner/Documents/gcg-deal-scout

# SSH remote setzen:
git remote set-url origin git@github.com:artouloin/Deal-Scout.git

# Pushen:
git push -u origin main
```

---

## 🔍 Verifikation: War der Push erfolgreich?

Öffne: https://github.com/artouloin/Deal-Scout

Wenn du diesen 5 Commits siehst → Erfolgreich! ✅
1. `docs: Add immediate deployment guide`
2. `feat: Add Claude API fallback and Vercel`
3. `docs: Add Vercel deployment guides`
4. `feat: Add multi-platform job scrapers`
5. `feat: Initialize GCG Deal Scout project`

---

## 🐛 Falls "Permission denied"

```bash
# SSH Problem: Versuche HTTPS statt SSH:
git remote set-url origin https://github.com/artouloin/Deal-Scout.git
git push -u origin main

# HTTPS Problem: Token ist falsch/abgelaufen
# → Generiere neuen Token (Schritt 1 wiederholen)
```

---

## ⏭️ Danach

Nach erfolgreichem Push:

```bash
bash vercel-deploy.sh
```

Das deployt die App zu Vercel und initialisiert die Datenbank.

---

**Fragen?** Siehe DEPLOY_NOW.md oder öffne ein GitHub Issue.
