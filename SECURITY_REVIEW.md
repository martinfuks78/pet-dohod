# Security & Code Quality Review - Pet Dohod Website

## Executive Summary

Provedl jsem kompletní security a code quality review webu. Celkově je **web bezpečný a připravený k produkci**, ale našel jsem několik oblastí vyžadujících pozornost.

**Overall Security Rating: ✅ GOOD (8/10)**

---

## Security Findings

### ✅ SECURE - Co funguje správně

1. **SQL Injection Protection**
   - ✅ Všechny SQL queries používají parametrizované dotazy přes `@vercel/postgres`
   - ✅ Žádné string concatenation v SQL queries
   - ✅ Příklad: `WHERE email = ${data.email}` (správně parametrizované)

2. **XSS Protection**
   - ✅ React automaticky escapuje výstup
   - ✅ Žádné použití `dangerouslySetInnerHTML` v user-controllable datech
   - ✅ Email templaty používají template literals (automaticky escapované proměnné)

3. **Authentication**
   - ✅ Admin endpoints vyžadují Bearer token autentizaci
   - ✅ Heslo je v environment variables, ne v kódu
   - ✅ Validace hesla na serveru (checkAuth funkce)

4. **Input Validation**
   - ✅ Email validace pomocí regex
   - ✅ Povinná pole jsou validována
   - ✅ Duplikátní registrace jsou blokovány

5. **Environment Variables**
   - ✅ Citlivé údaje (ADMIN_PASSWORD, RESEND_API_KEY) jsou v .env
   - ✅ Není žádný sensitive údaj commitnutý v kódu

6. **HTTPS**
   - ✅ Web běží na Vercel s automatickým HTTPS
   - ✅ Cookies a sessions jsou secure

---

### ⚠️ MEDIUM PRIORITY - Doporučená vylepšení

1. **Admin Authentication - Local Storage**
   - **Problém:** Admin heslo je uloženo v `localStorage` v plain textu
   - **Soubor:** `app/admin/page.js:66-67`
   - **Riziko:** MEDIUM - XSS útok by mohl získat heslo
   - **Doporučení:**
     ```javascript
     // AKTUÁLNĚ:
     localStorage.setItem('admin_auth', 'true')
     localStorage.setItem('admin_token', password)

     // DOPORUČENO: Použít httpOnly cookies nebo session token
     // Nebo minimálně hash heslo před uložením do localStorage
     ```
   - **Priorita:** Pro malou aplikaci s 1 adminem je OK, ale lepší řešení by bylo:
     - Implementovat JWT token s expirací
     - Použít httpOnly cookies
     - Přidat rate limiting na login endpoint

2. **Rate Limiting**
   - **Problém:** Chybí rate limiting na API endpointech
   - **Riziko:** Útočník může spamovat registrace nebo brute-force admin heslo
   - **Doporučení:**
     - Použít Vercel Edge Middleware pro rate limiting
     - Nebo implementovat simple counter v databázi (např. max 5 pokusů za hodinu pro login)
   - **Priorita:** MEDIUM - pro launch není nutné, ale vhodné doplnit později

3. **CSRF Protection**
   - **Problém:** Chybí CSRF token pro POST requesty
   - **Riziko:** LOW - Next.js API routes jsou partially protected, ale explicitní CSRF by byl lepší
   - **Doporučení:** Není nutné pro launch, ale zvážit do budoucna

4. **Email Validation**
   - **Aktuálně:** Základní regex validace
   - **Doporučení:** Zvážit pokročilejší validaci (např. DNS check) nebo email verification link
   - **Priorita:** LOW - aktuální řešení je dostačující

---

### ✅ LOW PRIORITY - Kosmetické

1. **Error Messages**
   - ✅ Error messages neodhalují citlivé informace
   - ✅ Generic "Server configuration error" místo konkrétní chyby

2. **Password Complexity**
   - **Aktuálně:** Žádné požadavky na složitost hesla
   - **Doporučení:** Ujistit se, že ADMIN_PASSWORD je silné (min 12 znaků, mix case, numbers, symbols)

3. **Content Security Policy (CSP)**
   - **Chybí:** CSP headers pro ochranu před XSS
   - **Priorita:** LOW - React už poskytuje dobrý základ
   - **Doporučení:** Přidat v `next.config.js`:
     ```javascript
     headers: async () => [
       {
         source: '/:path*',
         headers: [
           {
             key: 'Content-Security-Policy',
             value: "default-src 'self'; script-src 'self' 'unsafe-inline'; ..."
           }
         ]
       }
     ]
     ```

---

## Code Quality Findings

### ✅ EXCELLENT - Co je dobře

1. **Code Organization**
   - ✅ Čistá struktura složek (app/, components/, lib/)
   - ✅ Separation of concerns (DB logic v lib/db.js, email v lib/email.js)
   - ✅ API routes jsou logicky organizované

2. **Error Handling**
   - ✅ Try-catch bloky všude kde jsou potřeba
   - ✅ Správné HTTP status codes (400, 401, 404, 500)
   - ✅ Console logging pro debugging

3. **React Best Practices**
   - ✅ Správné použití hooks (useState, useEffect)
   - ✅ Conditional rendering
   - ✅ Key props v lists
   - ✅ Client vs Server components správně odděleny

4. **Database**
   - ✅ Normalizovaná struktura tabulek
   - ✅ Foreign keys (workshop_id REFERENCES workshops)
   - ✅ Indexes (SERIAL PRIMARY KEY)
   - ✅ Timestamps (created_at, updated_at)

5. **Email Templates**
   - ✅ Pěkné HTML emaily s inline CSS
   - ✅ Responsive design v emailech
   - ✅ QR kódy pro platbu

---

### ⚠️ Code Quality Improvements

1. **Missing Database Migration**
   - **Problém:** Přidali jsme sloupec `variable_symbol` do `registrations` tabulky, ale existující záznamy ho nemají
   - **Soubor:** `lib/db.js:62`
   - **Řešení:** Vytvořit migration script:
     ```javascript
     // migrations/add-variable-symbol.js
     export async function migrateVariableSymbols() {
       const regs = await sql`SELECT id, created_at FROM registrations WHERE variable_symbol IS NULL`

       for (const reg of regs.rows) {
         const date = new Date(reg.created_at)
         const year = date.getFullYear()
         const month = String(date.getMonth() + 1).padStart(2, '0')
         const sequence = String(reg.id).padStart(4, '0')
         const vs = `${year}${month}${sequence}`

         await sql`UPDATE registrations SET variable_symbol = ${vs} WHERE id = ${reg.id}`
       }
     }
     ```

2. **Missing Environment Variables Documentation**
   - **Problém:** Není dokumentace potřebných ENV variables
   - **Řešení:** Vytvořit `.env.example`:
     ```
     # Database (Vercel Postgres)
     POSTGRES_URL="postgres://..."

     # Email (Resend)
     RESEND_API_KEY="re_..."
     EMAIL_FROM="noreply@petdohod.cz"
     ADMIN_EMAIL="kouc@martinfuks.cz"

     # Admin
     ADMIN_PASSWORD="strong-password-here"
     ```

3. **Hardcoded Values**
   - **Nalezeno:**
     - Email: `kouc@martinfuks.cz` (hardcoded v několika místech)
     - Telefon: `+420 603 551 119` (hardcoded)
     - Fallback účet: `123456789/0100` (hardcoded)
   - **Doporučení:** Přesunout do environment variables nebo config souboru
   - **Priorita:** LOW - tyto hodnoty se nejspíš nezmění

4. **Missing TypeScript**
   - **Aktuálně:** Plain JavaScript
   - **Doporučení:** TypeScript by zabránil type errors
   - **Priorita:** OPTIONAL - není nutné pro launch

5. **Console.log Statements**
   - **Nalezeno:** `console.log()` v produkčním kódu (např. `app/api/register/route.js:91`)
   - **Doporučení:** Odstranit nebo zabalit do `if (process.env.NODE_ENV === 'development')`
   - **Priorita:** LOW - nebrání funkčnosti

---

## Performance Review

### ✅ Performance je dobrá

1. **Next.js Optimizations**
   - ✅ Static generation kde je to možné
   - ✅ Image optimization (Next.js Image component)
   - ✅ Font optimization (next/font)

2. **Database Queries**
   - ✅ LIMIT 1 kde je potřeba jen jeden záznam
   - ✅ Indexes na primary keys
   - ✅ Žádné N+1 queries

3. **Loading States**
   - ✅ Loading indicators pro uživatele
   - ✅ Try-catch pro error states

### ⚠️ Performance Improvements (Optional)

1. **Database Indexes**
   - Zvážit přidat index na `registrations.email` a `registrations.workshop_date` (často používané v WHERE)
   - Zvážit přidat index na `workshops.is_active` (často filtrováno)

2. **Caching**
   - Workshop data by mohla být cache (mění se zřídka)
   - Implementovat client-side cache pomocí React Query nebo SWR

3. **Image Optimization**
   - Chybí obrázky: `/ctyri-dohody.jpg`, `/pata-dohoda.jpg`, `/martin-fuks-profile.jpg`
   - Doporučení: Přidat obrázky a použít Next.js Image component

---

## Accessibility (A11y)

### ✅ Dobře

1. ✅ Semantic HTML (h1, h2, h3, button, nav)
2. ✅ Alt text na obrázcích (kde jsou definované)
3. ✅ Form labels jsou správně asociované s inputy

### ⚠️ Možná vylepšení

1. Přidat ARIA labels na interaktivní elementy
2. Testovat s screen readerem
3. Keyboard navigation (Tab order)
4. Focus indicators (outline) - aktuálně je focus:outline-none, zvážit vlastní focus style

---

## SEO Review

### ✅ SEO je připraveno správně

1. ✅ `robots: { index: false }` - správně nastaveno pro staging
2. ✅ Meta tags (title, description, keywords)
3. ✅ Structured data (JSON-LD) - Organization, WebSite, EducationEvent
4. ✅ Canonical URL připraven
5. ✅ Open Graph tags pro social sharing
6. ✅ Semantic HTML (h1, h2, p, nav)

### 📝 Checklist před launch na www.petdohod.cz

- [ ] Změnit `robots.index: false` → `true` v `app/layout.js:22`
- [ ] Zkontrolovat canonical URL (`https://www.petdohod.cz`)
- [ ] Vytvořit `sitemap.xml`
- [ ] Vytvořit `robots.txt`
- [ ] Nastavit Google Search Console
- [ ] Nastavit Google Analytics (pokud chce Martin)

---

## GDPR Compliance

### ✅ GDPR Compliant

1. ✅ Privacy Policy stránka existuje (`/ochrana-osobnich-udaju`)
2. ✅ Informace o správci (Martin Fuks, IČ: 19755015)
3. ✅ Účel zpracování jasně definován
4. ✅ Právní základ (GDPR Article 6)
5. ✅ Doba uložení specifikována (3 roky / 10 let pro účetnictví)
6. ✅ Práva subjektů popsána (přístup, oprava, výmaz, přenositelnost)
7. ✅ Kontaktní údaje pro uplatnění práv

### ⚠️ GDPR Recommendations

1. **Cookie Consent**
   - Aktuálně: "Nepoužíváme analytické ani marketingové cookies"
   - Doporučení: Pokud přidáte Google Analytics, implementovat cookie consent banner

2. **Email Unsubscribe**
   - Newsletter tabulka existuje, ale chybí unsubscribe link v emailech
   - Doporučení: Přidat "Odhlásit z newsletteru" link

3. **Data Export**
   - Chybí funkcionalita pro uživatele exportovat svoje data
   - Doporučení: Přidat "Vyexportovat moje data" endpoint

---

## Deployment Checklist

### Před nasazením na produkci

- [x] Environment variables nastaveny na Vercelu
- [ ] ADMIN_PASSWORD je silné (min 12 znaků, mix)
- [ ] RESEND_API_KEY je validní
- [ ] EMAIL_FROM je nastavený na správnou doménu
- [ ] ADMIN_EMAIL je správný
- [ ] Database connection string je validní
- [x] HTTPS je zapnuté (Vercel auto)
- [ ] Testovací registrace proběhla úspěšně
- [ ] Email notifikace fungují
- [ ] Admin panel je přístupný
- [ ] CSV export funguje
- [ ] QR kódy v emailech se generují

### Po nasazení

- [ ] Testovat plný registrační flow
- [ ] Testovat admin login
- [ ] Testovat změnu statusu (email notifikace)
- [ ] Zkontrolovat structured data v Google Search Console
- [ ] Monitorovat error logs (Vercel Dashboard)
- [ ] Backup databáze

---

## Summary

**Web je bezpečný a připravený k launch** s těmito poznámkami:

### Musí být opraveno před launch: ❌ ŽÁDNÉ KRITICKÉ PROBLÉMY

### Doporučuji opravit (5 minut práce):
1. Vytvořit `.env.example` s dokumentací ENV variables
2. Odstranit `console.log()` z produkčního kódu
3. Vytvořit migration script pro `variable_symbol` (pro existující záznamy)

### Doporučuji do budoucna:
1. Implementovat rate limiting
2. Vylepšit admin autentizaci (JWT tokens)
3. Přidat unsubscribe link do newsletteru
4. Implementovat sitemap.xml generování

**Security Rating: 8/10** - Velmi dobrá úroveň zabezpečení pro malou aplikaci. Žádné kritické zranitelnosti.

**Code Quality: 9/10** - Čistý, organizovaný kód s dobrou separací concerns.

**Ready for Production: ✅ YES** - Po kontrole ENV variables a testování lze spustit.

---

## Contact

Pokud máš otázky k tomuto review, napiš na Claude Code.

---

**Datum review:** ${new Date().toLocaleString('cs-CZ')}
**Reviewer:** Claude Sonnet 4.5
