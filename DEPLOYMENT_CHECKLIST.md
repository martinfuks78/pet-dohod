# 🚀 Deployment Checklist - Přesun na www.petdohod.cz

## Před nasazením na ostrou doménu:

### 1. SEO & Indexace
- [ ] Změnit `robots.index: true` v `app/layout.js` (řádek 22)
- [ ] Ověřit že canonical URL je `https://www.petdohod.cz`
- [ ] Přidat Google Search Console
- [ ] Přidat sitemap.xml (pokud chceš)

### 2. Environment Variables
- [ ] Zkontrolovat `RESEND_API_KEY` je nastaven v Vercel
- [ ] Zkontrolovat `DATABASE_URL` (Vercel Postgres)
- [ ] Zkontrolovat `ADMIN_PASSWORD`
- [ ] Zkontrolovat `EMAIL_FROM` (Resend verified domain)

### 3. Domain & DNS
- [ ] Nakonfigurovat doménu www.petdohod.cz ve Vercel
- [ ] Nastavit DNS záznamy u registrátora
- [ ] Ověřit SSL certifikát
- [ ] Test redirectů (non-www → www)

### 4. Analytics & Tracking (volitelné)
- [ ] Přidat Google Analytics 4
- [ ] Přidat Facebook Pixel (pokud chceš)
- [ ] Nastavit conversion tracking pro registrace

### 5. Testing
- [ ] Test registrace workshopu (s JS)
- [ ] Test registrace workshopu (bez JS)
- [ ] Test kontaktního formuláře (s JS)
- [ ] Test kontaktního formuláře (bez JS)
- [ ] Test na mobilu (iOS/Android)
- [ ] Test ve více prohlížečích (Chrome, Safari, Firefox)

### 6. Email Testing
- [ ] Test potvrzovacího emailu (registrace)
- [ ] Test admin notifikace
- [ ] Test kontaktní email
- [ ] Ověřit spam score (mail-tester.com)

### 7. Final Checks
- [ ] Zkontrolovat všechny linky fungují
- [ ] Zkontrolovat images se načítají
- [ ] PageSpeed Insights (cíl: 90+)
- [ ] Lighthouse audit (cíl: všechny 90+)

## Po nasazení:

### První týden:
- [ ] Monitorovat error logy (Vercel Dashboard)
- [ ] Zkontrolovat registrace přicházejí do DB
- [ ] Ověřit emaily se odesílají
- [ ] Google Search Console - submit sitemap

### První měsíc:
- [ ] Analyzovat Google Analytics data
- [ ] Zkontrolovat SEO pozice
- [ ] Sbírat user feedback
- [ ] Optimalizovat podle dat

---

## 🔒 Bezpečnost - Already Implemented:
- ✅ SQL injection prevence
- ✅ Rate limiting (5 pokusů/15min)
- ✅ Honeypot anti-spam
- ✅ Email validace
- ✅ Input sanitizace
- ✅ HTTPS (Vercel automatic)
- ✅ GDPR notice

## 🎨 UX/UI - Already Implemented:
- ✅ SSR pro SEO
- ✅ No-JS fallback
- ✅ Success/error feedback
- ✅ Mobile responsive
- ✅ Accessibility (ARIA, semantic HTML)
- ✅ Loading optimalizace

## 📧 Email Templates - Already Implemented:
- ✅ Registrace confirmation
- ✅ Waitlist confirmation
- ✅ Admin notification
- ✅ Contact form notification

---

**Kontakt pro otázky:**
- Email: kouc@martinfuks.cz
- Web: www.petdohod.cz (po spuštění)
