# Security Policy

## Bezpečnostní opatření

Tento projekt implementuje několik vrstev zabezpečení pro ochranu dat uživatelů a integrity systému.

## Implementované bezpečnostní funkce

### 1. Ochrana proti automatizovaným útokům

#### Rate Limiting
- **Limit**: Maximálně 5 registrací za 15 minut z jedné IP adresy
- **Umístění**: `/app/api/register/route.js`
- **Mechanismus**: In-memory tracking s automatickým čištěním
- **Response**: HTTP 429 (Too Many Requests) s `Retry-After` header

```javascript
// Příklad response při překročení limitu
{
  "error": "Příliš mnoho pokusů o registraci. Zkuste to prosím za 12 minut."
}
```

#### Honeypot ochrana
- **Mechanismus**: Skryté pole `website` v registračním formuláři
- **Umístění**: `/components/RegistrationForm.js` + `/app/api/register/route.js`
- **Chování**:
  - Pole je neviditelné pro uživatele (CSS `position: absolute; left: -9999px`)
  - Boti formulář vyplní automaticky včetně skrytých polí
  - Pokud je pole vyplněné → vrátí fake success response (bot neví, že byl detekován)

### 2. Security Headers

Implementováno v `/next.config.js`:

- **X-Frame-Options: DENY**
  - Ochrana proti clickjacking útokům
  - Zabraňuje vložení stránky do `<iframe>`

- **X-Content-Type-Options: nosniff**
  - Ochrana proti MIME type sniffing
  - Prohlížeč respektuje Content-Type header

- **Referrer-Policy: strict-origin-when-cross-origin**
  - Kontroluje předávání referrer informací
  - Full URL pouze pro same-origin requests

- **X-XSS-Protection: 1; mode=block**
  - Aktivuje built-in XSS filtr prohlížeče
  - Blokuje stránku při detekci XSS

- **Permissions-Policy: camera=(), microphone=(), geolocation=()**
  - Zakazuje přístup k hardwaru (kamera, mikrofon, GPS)

### 3. SQL Injection ochrana

- **Metoda**: Prepared statements přes `@vercel/postgres`
- **Příklad bezpečného dotazu**:

```javascript
// ✅ SPRÁVNĚ - prepared statement
const result = await sql`
  SELECT * FROM registrations
  WHERE email = ${userEmail}
`

// ❌ ŠPATNĚ - SQL injection zranitelnost
const result = await sql.query(
  `SELECT * FROM registrations WHERE email = '${userEmail}'`
)
```

### 4. Autentizace a autorizace

#### Admin přístup
- **Metoda**: Bearer token autentizace
- **Storage**: localStorage (client-side)
- **API**: Všechny admin endpointy vyžadují `Authorization: Bearer <password>` header
- **Validace**: Server-side kontrola proti `process.env.ADMIN_PASSWORD`

**Bezpečnostní doporučení**:
- Používej silné heslo (min. 16 znaků, mix velkých/malých písmen, čísel, symbolů)
- Pravidelně měň heslo (každých 6 měsíců)
- Nepoužívej stejné heslo jako na jiných službách
- Vždy se odhlašuj po dokončení práce

#### HTTPS Only
- **Vercel**: Automaticky vynutí HTTPS
- **Headers**: HSTS (HTTP Strict Transport Security) přes Vercel
- **Certificates**: Let's Encrypt automaticky

### 5. Error Tracking (Sentry)

- **Citlivá data**: Automaticky maskována (emails, IP adresy)
- **Session Replay**: Maskuje všechen text a média
- **Source Maps**: Skryté v produkci (`hideSourceMaps: true`)
- **Logger**: Automaticky tree-shaken z produkčního buildu

## Reporting vulnerabilities

Pokud najdeš bezpečnostní zranitelnost:

### ✅ UDĚLEJ:
1. **Kontaktuj nás soukromě**: kouc@martinfuks.cz
2. **Zahrň**:
   - Popis zranitelnosti
   - Kroky k reprodukci
   - Potenciální dopad
   - (Volitelně) Návrh opravy
3. **Počkej na odpověď**: Odpovíme do 48 hodin

### ❌ NEUDĚLEJ:
- Veřejně nezveřejňuj zranitelnost před opravou
- Nezkoušej využít zranitelnost na produkčním prostředí
- Nemazat/modifikovat data bez svolení

## Incident Response Plan

V případě bezpečnostního incidentu:

### Okamžitá reakce (do 1 hodiny)
1. ✅ Deaktivovat kompromitovaný přístup
2. ✅ Změnit všechna hesla a API klíče
3. ✅ Zkontrolovat Sentry logs
4. ✅ Zkontrolovat Vercel logs
5. ✅ Zkontrolovat databázové logy

### Krátké období (do 24 hodin)
1. ✅ Identifikovat rozsah útoku
2. ✅ Provést databázové zálohy
3. ✅ Notifikovat postižené uživatele (pokud jsou data kompromitována)
4. ✅ Dokumentovat incident

### Dlouhodobě (do 1 týdne)
1. ✅ Implementovat opravu
2. ✅ Security audit celého systému
3. ✅ Update všech dependencies
4. ✅ Review všech přístupových práv

## Compliance

### GDPR
- Data minimalizace: Sbíráme pouze nezbytná data
- Právo na výmaz: Admin může smazat registrace
- Právo na přístup: Uživatelé mohou kontrolovat své registrace
- Privacy Policy: `/ochrana-osobnich-udaju`

### Cookies
- Používáme pouze localStorage (ne cookies)
- Žádné tracking cookies třetích stran
- Žádné reklamy

## Security Checklist

### Před deploy

- [ ] `npm audit` prošel bez critical/high vulnerabilities
- [ ] Všechny env variables jsou nastavené
- [ ] ADMIN_PASSWORD je silné (min. 16 znaků)
- [ ] `robots.txt` je správně nastaven
- [ ] Sentry DSN je nastaven
- [ ] Email FROM adresa je ověřená v Resend

### Po deploy

- [ ] Test registrace funguje
- [ ] Admin přístup funguje
- [ ] HTTPS je vynutí
- [ ] Security headers jsou v response (zkontroluj v DevTools)
- [ ] Sentry loguje errory
- [ ] Rate limiting funguje (zkus 6+ registrací rychle po sobě)
- [ ] Honeypot funguje (zkus vyplnit skryté pole)

### Pravidelně

#### Týdně
- [ ] Zkontroluj Sentry errors
- [ ] Zkontroluj podezřelé registrace (admin)
- [ ] Zkontroluj Vercel logs

#### Měsíčně
- [ ] `npm audit`
- [ ] Review audit log
- [ ] Databázový backup

#### Čtvrtletně
- [ ] `npm outdated` a update dependencies
- [ ] Změnit ADMIN_PASSWORD
- [ ] Review přístupových práv (Vercel, Resend, Sentry)

## Dependencies Security

### Known vulnerabilities (leden 2026)

Po instalaci Sentry (`npm install @sentry/nextjs`):
- 3 low vulnerabilities
- 13 moderate vulnerabilities
- 6 high vulnerabilities

**Akce**:
- Většinou jsou v dev dependencies a nepředstavují riziko v produkci
- Monitoruj `npm audit` pravidelně
- Update při critical/high v production dependencies

### Update strategie

```bash
# Bezpečné - pouze patch/minor verze
npm update

# Před major update - testuj!
npm outdated
npm install package@latest

# Critical security fix
npm audit fix
```

## Best Practices

### Environment Variables
- ❌ Nikdy necommituj `.env.local` do Gitu
- ✅ Používej `.env.example` jako template
- ✅ Nastav env vars ve Vercel Dashboard
- ✅ Rotuj API klíče pravidelně (každých 6 měsíců)

### Database
- ✅ Pravidelné zálohy (týdně)
- ✅ Pouze prepared statements
- ✅ Minimal permissions (read/write only pro app)

### Admin
- ✅ Silná hesla (min. 16 znaků)
- ✅ Vždy se odhlásit po práci
- ✅ Používat HTTPS
- ✅ Nepřístupuj z veřejné WiFi bez VPN

### Code
- ✅ Review všech pull requestů
- ✅ Testuj lokálně před deploy
- ✅ Používej TypeScript (preventivní typ checking)
- ✅ Nikdy neloguj citlivá data (hesla, tokeny)

## Contact

Security Team: kouc@martinfuks.cz
Response Time: 48 hodin

---

**Poslední update**: Leden 2026
**Next review**: Duben 2026
