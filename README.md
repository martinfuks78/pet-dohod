# Pět dohod - Workshop Website

Profesionální web pro správu workshopů osobního rozvoje založených na moudrosti Čtyř dohod a Páté dohody.

## Přehled funkcí

### Pro návštěvníky
- ✅ Přehled nadcházejících workshopů s kapacitou
- ✅ Online registrace (single + páry)
- ✅ Waitlist pro plné workshopy
- ✅ Kontrola stavu registrace (Moje registrace)
- ✅ Newsletter subscription
- ✅ Kontaktní formulář

### Pro administrátora
- ✅ Dashboard se statistikami
- ✅ Správa workshopů (CRUD)
- ✅ Správa registrací
- ✅ Změna statusu registrací
- ✅ Export CSV
- ✅ Email notifikace

### Email komunikace
- ✅ Potvrzovací email s platebními údaji
- ✅ QR kód pro platbu
- ✅ iCal (.ics) příloha
- ✅ Email při změně statusu (potvrzení platby)
- ✅ Waitlist email
- ✅ Admin notifikace o nové registraci

### SEO & Marketing
- ✅ Structured data (schema.org)
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Meta tags & Open Graph
- ✅ Responzivní design
- ✅ Framer Motion animace

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Database**: Vercel Postgres
- **Email**: Resend API
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Hosting**: Vercel
- **Error Tracking**: Sentry
- **Security**: Rate limiting, Honeypot, Security headers

## Požadované Environment Variables

Vytvořte soubor `.env.local` s následujícími proměnnými:

```bash
# Database
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NO_SSL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="Workshop Pět dohod <noreply@petdohod.cz>"
ADMIN_EMAIL="kouc@martinfuks.cz"

# Admin
ADMIN_PASSWORD="silne_heslo_zde"

# Sentry (error tracking) - optional
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="tvoje-organizace"
SENTRY_PROJECT="pet-dohod"
SENTRY_AUTH_TOKEN="..." # Pro upload source maps
```

## Bezpečnost

### Ochrana proti botům a spamu
- **Rate limiting**: Max 5 registrací za 15 minut z jedné IP adresy
- **Honeypot pole**: Skryté pole v registračním formuláři detekuje boty
- **Duplikace check**: Stejný email nemůže registrovat na stejný workshop vícekrát

### Security headers
- `X-Frame-Options: DENY` - Ochrana proti clickjacking
- `X-Content-Type-Options: nosniff` - Ochrana proti MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Autentizace
- Bearer token pro admin API
- HTTPS only (automaticky přes Vercel)
- SQL injection ochrana (prepared statements)

## Error Tracking (Sentry)

1. Vytvoř projekt na [sentry.io](https://sentry.io)
2. Copy DSN do `NEXT_PUBLIC_SENTRY_DSN`
3. Errors se automaticky logují
4. Dashboard: sentry.io/organizations/...

## Údržba

### Týdenně (5 min)
- ✅ Zkontroluj Sentry errors
- ✅ Zkontroluj spam registrace (admin → Registrace)
- ✅ Zkontroluj email delivery (Resend dashboard)

### Měsíčně (30 min)
- ✅ `npm audit` - security vulnerabilities
- ✅ Databázový export (admin → Export CSV)
- ✅ Review Vercel Analytics

### Čtvrtletně (1-2 hodiny)
- ✅ `npm outdated` - zkontroluj zastaralé balíčky
- ✅ `npm update` - update minor/patch verzí
- ✅ Test na mobilních zařízeních
- ✅ Review Next.js changelog

```bash
# Security check
npm audit

# Safe updates
npm audit fix

# All updates (TESTOVAT!)
npm audit fix --force
```

## Instalace a spuštění

```bash
# Instalace závislostí
npm install

# Inicializace databáze (pouze jednou)
# Návštívit: http://localhost:3000/api/init-db

# Development server
npm run dev

# Production build
npm run build
npm start
```

## Databázové tabulky

### workshops
- Informace o workshopech
- Kapacita, ceny (single/couple)
- Program, adresa, platební údaje

### registrations
- Registrace účastníků
- Status (pending/confirmed/cancelled/waitlist)
- Partner info pro páry
- Variable symbol

### newsletter_subscribers
- Email
- Subscribe date
- Active status

## Admin přístup

URL: `/admin`

Přihlášení pomocí hesla z `ADMIN_PASSWORD` env variable.

## API Endpointy

### Veřejné
- `GET /api/workshops` - Seznam aktivních workshopů
- `POST /api/register` - Registrace na workshop
- `GET /api/registration-lookup?email=...&vs=...` - Kontrola registrace
- `POST /api/contact` - Kontaktní formulář
- `POST /api/newsletter` - Newsletter subscribe

### Admin (vyžadují autentizaci)
- `POST /api/workshops` - Vytvořit workshop
- `PUT /api/workshops` - Upravit workshop
- `DELETE /api/workshops?id=...` - Smazat workshop
- `GET /api/register` - Seznam všech registrací
- `PUT /api/register` - Změnit status registrace
- `DELETE /api/register?id=...` - Smazat registraci

## Deployment

### Vercel (doporučeno)

1. Push do GitHub
2. Import projektu na Vercel
3. Přidat environment variables
4. Deploy!

### Po přesunu na produkční doménu (www.petdohod.cz)

V souboru `app/layout.js` změnit:

```javascript
// Před
robots: {
  index: false,  // Staging
  follow: true,
}

// Po
robots: {
  index: true,   // Produkce
  follow: true,
}
```

## Testing Checklist

- [ ] Registrace pro 1 osobu funguje
- [ ] Registrace pro pár funguje
- [ ] Email s platebními údaji přichází
- [ ] QR kód v emailu funguje
- [ ] Duplikátní registrace se zamítnou
- [ ] Admin může vytvořit/upravit/smazat workshop
- [ ] Admin může změnit status registrace
- [ ] Export CSV funguje
- [ ] Moje registrace stránka funguje
- [ ] Newsletter subscribe funguje
- [ ] Kontaktní formulář funguje

## Dokumentace

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Kompletní deployment guide
- **[CSRF_PROTECTION.md](./CSRF_PROTECTION.md)** - CSRF ochrana implementace
- **[RATE_LIMITING.md](./RATE_LIMITING.md)** - Rate limiting konfigurace
- **[EMAIL_MONITORING.md](./EMAIL_MONITORING.md)** - Email delivery monitoring
- **[SECURITY.md](./SECURITY.md)** - Security best practices

## Support

Pro technickou podporu kontaktujte:
- Email: kouc@martinfuks.cz
- Telefon: +420 603 551 119

## License

© 2026 Martin Fuks - Všechna práva vyhrazena
