# Deployment Guide - Pet Dohod

Kompletní průvodce nasazením projektu do produkce.

## 📋 Přehled

- **Framework:** Next.js 16.1.1 (App Router)
- **Hosting:** Vercel
- **Databáze:** Vercel Postgres (Neon)
- **Email:** Resend
- **Error Tracking:** Sentry
- **Domain:** www.petdohod.cz (připraveno)

---

## 🚀 Rychlý Start (Vercel)

### 1. Přihlášení a Import

```bash
# Přihlásit se k Vercel CLI
vercel login

# Import projektu
vercel

# Následuj instrukce:
# - Project name: pet-dohod
# - Link to existing project? Yes
```

### 2. Environment Variables

V Vercel dashboard → Settings → Environment Variables přidat:

```bash
# Database (Vercel Postgres - Neon)
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
POSTGRES_USER=neondb_owner
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=neondb
POSTGRES_URL_NO_SSL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...

# Admin Auth
ADMIN_PASSWORD=pet-dohod-2026  # ZMĚNIT v produkci!

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=onboarding@resend.dev  # ZMĚNIT na verified domain
ADMIN_EMAIL=martin.fuks@gmail.com

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_ORG=martin-fuks
SENTRY_PROJECT=pet-dohod

# Volitelné - Vercel KV (Rate Limiting)
# KV_URL=...
# KV_REST_API_URL=...
# KV_REST_API_TOKEN=...

# Volitelné - Resend Webhooks
# RESEND_WEBHOOK_SECRET=whsec_...
```

### 3. Deploy

```bash
# Production deploy
vercel --prod

# Nebo přes Git (automaticky)
git push origin main  # Auto-deploy na Vercel
```

---

## 🔧 Lokální Development

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))
- Vercel CLI: `npm i -g vercel`

### Setup

```bash
# 1. Clone repository
git clone https://github.com/martinfuks78/pet-dohod.git
cd pet-dohod

# 2. Install dependencies
npm install

# 3. Vytvořit .env.local (kopírovat z .env.example)
cp .env.example .env.local

# 4. Vyplnit credentials v .env.local

# 5. Spustit development server
npm run dev

# 6. Otevřít v prohlížeči
open http://localhost:3000
```

### Inicializace databáze

```bash
# Navštivit endpoint (vytvoří tabulky)
curl http://localhost:3000/api/init-db

# Nebo v prohlížeči:
open http://localhost:3000/api/init-db
```

---

## 🗄️ Database Setup (Vercel Postgres)

### 1. Vytvoření databáze

```bash
# V Vercel Dashboard
# Storage → Create Database → Postgres
# Název: pet-dohod-db
# Region: Frankfurt (EU)
```

### 2. Získání credentials

Vercel automaticky přidá env variables do projektu:
- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- atd.

### 3. Migrace dat (pokud existující DB)

```bash
# Export z původní DB
pg_dump -U user -d old_db > dump.sql

# Import do Vercel Postgres
psql "$POSTGRES_URL_NON_POOLING" < dump.sql
```

### 4. Inicializace tabulek

```bash
# V produkci
curl https://pet-dohod.vercel.app/api/init-db

# Zkontrolovat v Vercel Dashboard → Storage → Browse
```

---

## 📧 Email Setup (Resend)

### 1. Registrace na Resend

1. Jdi na [resend.com](https://resend.com)
2. Sign up s GitHub
3. Vytvoř API key

### 2. Verify doménu

```bash
# V Resend Dashboard → Domains → Add Domain
# Přidat: petdohod.cz

# Přidat DNS records (u doménového registrátora):
TXT _resend @ "resend-verify=..."
MX @ "mx1.resend.com" 10
MX @ "mx2.resend.com" 20
```

### 3. Update EMAIL_FROM

Po ověření domény změnit v .env:

```bash
EMAIL_FROM=workshop@petdohod.cz  # Místo onboarding@resend.dev
```

### 4. Webhook (Volitelné)

Pro tracking delivery:

```bash
# Resend Dashboard → Webhooks → Create
URL: https://petdohod.cz/api/webhooks/resend
Events: email.sent, email.delivered, email.bounced
```

---

## 🛡️ Security Checklist

- [x] **HTTPS Only** (Vercel automaticky)
- [x] **CSRF Protection** (implementováno v lib/csrf.js)
- [x] **Rate Limiting** (implementováno v lib/rate-limit.js)
- [x] **Environment Secrets** (ne v Git)
- [ ] **Admin Password** - ZMĚNIT výchozí heslo!
- [ ] **Database Backups** - Nastavit automatické zálohy
- [ ] **Sentry Alerts** - Nastavit email notifikace

### Změna Admin Hesla

```bash
# V Vercel Dashboard → Settings → Environment Variables
# Změnit ADMIN_PASSWORD na silné heslo

# Doporučeno: generátor hesel
openssl rand -base64 32
```

---

## 🌐 Custom Domain Setup

### 1. Přidání domény na Vercel

```bash
# Vercel Dashboard → Settings → Domains
# Add Domain: petdohod.cz
# Add Domain: www.petdohod.cz
```

### 2. DNS konfigurace

U doménového registrátora přidat:

```
Type  Name  Value                     TTL
A     @     76.76.21.21              Auto
A     www   76.76.21.21              Auto
AAAA  @     2606:50c0:8000::153      Auto
AAAA  www   2606:50c0:8000::153      Auto
```

Nebo použít CNAME:

```
Type   Name  Value                    TTL
CNAME  www   cname.vercel-dns.com.   Auto
```

### 3. SEO Update po nasazení

**DŮLEŽITÉ:** Když je web na produkční doméně, zapnout indexaci:

```javascript
// V app/layout.js
export const metadata = {
  // ...
  robots: {
    index: true,   // ← ZMĚNIT z false na true
    follow: true,
  },
}
```

```bash
# Commit a deploy
git add app/layout.js
git commit -m "Enable SEO indexing on production domain"
git push
```

---

## 📊 Monitoring & Analytics

### Sentry Error Tracking

1. **Dashboard:** [sentry.io](https://sentry.io)
2. **Email alerts:** Settings → Notifications
3. **Issues:** Filtrovat podle `email_delivery`, `api_errors`

### Vercel Analytics

```bash
# V Vercel Dashboard → Analytics
# Sledovat:
# - Page views
# - API latency
# - Error rates
```

### Database Monitoring

```bash
# Vercel Dashboard → Storage → Metrics
# Sledovat:
# - Connection count
# - Query performance
# - Storage usage
```

---

## 🔄 CI/CD Workflow

### Automatický Deploy (Git Push)

```bash
# Main branch → Production
git push origin main

# Preview branches
git checkout -b feature/nova-funkce
git push origin feature/nova-funkce
# Automaticky vytvoří preview URL
```

### Manuální Deploy

```bash
# Production
vercel --prod

# Preview
vercel
```

### Rollback

```bash
# V Vercel Dashboard → Deployments
# Najít předchozí úspěšný deploy
# Kliknout → Promote to Production
```

---

## 🧪 Testing

### Před deployem otestovat:

```bash
# 1. Build locally
npm run build

# 2. Start production server
npm start

# 3. Test kritické flows
# - Registrace na workshop
# - Admin login
# - Email odesílání
# - CSRF ochrana
# - Rate limiting
```

### E2E testy (Připraveno pro budoucnost)

```bash
# TODO: Implementovat Playwright testy
npm run test:e2e
```

---

## 📝 Post-Deploy Checklist

Po každém production deploy zkontrolovat:

- [ ] Web je dostupný na https://petdohod.cz
- [ ] Registrační formulář funguje
- [ ] Emaily se odesílají (test registrace)
- [ ] Admin login funguje
- [ ] Workshopy se zobrazují správně
- [ ] Sentry nehlásí kritické chyby
- [ ] Database migrations proběhly úspěšně
- [ ] SSL certifikát je platný
- [ ] Mobile responsive design

---

## 🆘 Troubleshooting

### Build Failed

```bash
# Zkontrolovat logy
vercel logs

# Lokální build test
npm run build

# Často: missing env variables
# → Zkontroluj Vercel Dashboard → Environment Variables
```

### Database Connection Error

```bash
# Zkontrolovat credentials
vercel env pull .env.local

# Test connection
psql "$POSTGRES_URL_NON_POOLING"

# Pokud timeout: whitelist IP v Neon dashboard
```

### Emails Not Sending

```bash
# 1. Zkontrolovat Resend API key
echo $RESEND_API_KEY

# 2. Zkontrolovat Sentry logs
# Hledat: email_delivery errors

# 3. Test Resend API
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@resend.dev","to":"test@example.com","subject":"Test","html":"Test"}'
```

### 429 Rate Limit Errors

```bash
# Pokud často:
# 1. Zvýšit limity v lib/rate-limit.js
# 2. Nebo aktivovat Vercel KV

# Debug:
# Zkontroluj X-RateLimit-* headers v Network tab
```

---

## 🔐 Backup & Recovery

### Database Backup

```bash
# Manuální backup
pg_dump "$POSTGRES_URL_NON_POOLING" > backup-$(date +%Y%m%d).sql

# Automatické zálohy: Vercel Postgres má point-in-time recovery
# Dashboard → Storage → Backups
```

### Code Backup

```bash
# Git je hlavní backup
git push origin main

# Extra: GitHub → Settings → Archives
# Stáhnout ZIP archive
```

### Environment Variables Backup

```bash
# Export všech env vars
vercel env pull .env.backup

# Uložit bezpečně (1Password, LastPass, etc.)
```

---

## 🚦 Production Health Check

```bash
# Každý týden zkontrolovat:

# 1. Uptime
curl -I https://petdohod.cz

# 2. Database size
# Vercel Dashboard → Storage → Metrics

# 3. Error rate
# Sentry Dashboard → Issues

# 4. Email delivery rate
# Resend Dashboard → Activity

# 5. SSL certifikát expiration
# Vercel automaticky obnovuje (Let's Encrypt)
```

---

## 📚 Další Dokumentace

- [CSRF_PROTECTION.md](./CSRF_PROTECTION.md) - CSRF ochrana
- [RATE_LIMITING.md](./RATE_LIMITING.md) - Rate limiting
- [EMAIL_MONITORING.md](./EMAIL_MONITORING.md) - Email delivery monitoring
- [SECURITY.md](./SECURITY.md) - Security best practices
- [README.md](./README.md) - Obecný přehled projektu

---

## 🎯 Production URLs

- **Web:** https://www.petdohod.cz
- **Admin:** https://www.petdohod.cz/admin
- **API:** https://www.petdohod.cz/api/*
- **Sentry:** https://sentry.io/organizations/martin-fuks/projects/pet-dohod/
- **Resend:** https://resend.com/dashboard
- **Vercel:** https://vercel.com/martinfuks78/pet-dohod

---

## 👤 Kontakt

**Správce projektu:** Martin Fuks
**Email:** martin.fuks@gmail.com
**GitHub:** [@martinfuks78](https://github.com/martinfuks78)

**Technická podpora (Claude Code):**
- Dokumentace: [claude.ai/docs](https://docs.anthropic.com/claude/)
- Sentry issues: Automaticky trackované

---

**Last Updated:** ${new Date().toISOString().split('T')[0]}
