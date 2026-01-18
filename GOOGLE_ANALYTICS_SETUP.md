# 📊 Google Analytics 4 Setup Guide

**Datum:** 2026-01-18
**Pro:** Pet Dohod Workshop Website
**Status:** 🔴 KRITICKÉ - Potřeba nastavit před spuštěním na produkci

---

## Proč potřebujete Google Analytics?

Bez analytics **nevidíte**:
- ❌ Kolik lidí navštíví web
- ❌ Odkud přicházejí (Google, Facebook, email...)
- ❌ Co si prohlížejí (workshopy, FAQ, kontakt...)
- ❌ Kde odcházejí (opouštějí web před registrací?)
- ❌ Kolik lidí klikne na "Registrovat se"
- ❌ Jaká je konverzní míra (návštěva → registrace)

**S analytics vidíte:**
✅ Které termíny workshopů jsou nejzajímavější
✅ Která marketing kampaň funguje nejlépe
✅ Kde lidé "utíkají" z webu
✅ Co optimalizovat pro lepší prodeje

---

## Krok 1: Založení Google Analytics 4 účtu

### 1.1. Přejděte na Google Analytics
🔗 [https://analytics.google.com](https://analytics.google.com)

### 1.2. Vytvořte účet
1. Klikněte na **"Start measuring"** nebo **"Začít měřit"**
2. **Account name** (Název účtu): `Pet Dohod`
3. Zaškrtněte checkboxy pro sdílení dat (volitelné)
4. Klikněte **"Next"**

### 1.3. Vytvořte Property (Web)
1. **Property name**: `Pet Dohod - Production`
2. **Reporting time zone**: `Czech Republic (Prague)`
3. **Currency**: `Czech Koruna (CZK)`
4. Klikněte **"Next"**

### 1.4. O vašem podnikání
1. **Industry**: `Education` nebo `Events`
2. **Business size**: `Small` (1-10 zaměstnanců)
3. **How you plan to use Google Analytics**:
   - ✅ Examine user behavior
   - ✅ Measure online conversions
4. Klikněte **"Create"**

### 1.5. Přijměte Terms of Service
- Vyberte **Czech Republic**
- Přečtěte a přijměte podmínky
- Klikněte **"I Accept"**

---

## Krok 2: Nastavení Data Stream (Web)

### 2.1. Vytvořte Web Data Stream
Po vytvoření Property se automaticky otevře "Set up a data stream"

1. Klikněte na **"Web"**
2. **Website URL**: `https://www.petdohod.cz` ⚠️ (zatím použijte `https://pet-dohod.vercel.app`)
3. **Stream name**: `Pet Dohod Web`
4. **Enhanced measurement** - nechte zaškrtnuté (automaticky trackuje):
   - ✅ Page views
   - ✅ Scrolls
   - ✅ Outbound clicks
   - ✅ Site search
   - ✅ Video engagement
   - ✅ File downloads
5. Klikněte **"Create stream"**

### 2.2. Zkopírujte Measurement ID
Po vytvoření uvidíte **Measurement ID** ve formátu: `G-XXXXXXXXXX`

**📝 Poznamenejte si ho** - budete ho potřebovat v dalším kroku!

Příklad:
```
Measurement ID: G-ABC123XYZ
```

---

## Krok 3: Instalace na Web (Next.js)

### 3.1. Přidejte Environment Variable

Vytvořte soubor `.env.local` (pokud ještě neexistuje) a přidejte:

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-ABC123XYZ
```

⚠️ **Nahraďte `G-ABC123XYZ` vaším skutečným Measurement ID!**

### 3.2. Aktualizujte `.env.local` na Vercelu

1. Přejděte na [Vercel Dashboard](https://vercel.com)
2. Vyberte projekt `pet-dohod`
3. Přejděte na **Settings** → **Environment Variables**
4. Přidejte novou proměnnou:
   - **Key**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value**: `G-ABC123XYZ` (váš Measurement ID)
   - **Environment**: Zaškrtněte **Production**, **Preview**, **Development**
5. Klikněte **"Save"**

### 3.3. Vytvořte Google Analytics komponentu

Vytvořte soubor `components/GoogleAnalytics.js`:

```javascript
'use client'

import Script from 'next/script'

export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!measurementId) {
    console.warn('Google Analytics Measurement ID is not set')
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}
```

### 3.4. Přidejte komponentu do `app/layout.js`

Upravte `app/layout.js`:

```javascript
import GoogleAnalytics from '../components/GoogleAnalytics'

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}
```

### 3.5. Nasaďte na Vercel

```bash
git add .
git commit -m "Add Google Analytics 4 tracking"
git push
```

Vercel automaticky nasadí novou verzi.

---

## Krok 4: Nastavení Conversion Events (Konverze)

### 4.1. Co jsou konverze?
Konverze = akce, kterou chcete měřit (např. registrace na workshop, odeslání kontaktního formuláře)

### 4.2. Jaké konverze sledovat na Pet Dohod?

| Konverze | Popis | Priority |
|----------|-------|----------|
| **registration_started** | Uživatel otevřel registrační formulář | 🟡 Medium |
| **registration_completed** | Uživatel odeslal registraci | 🔴 **HIGH** |
| **contact_form_submitted** | Uživatel odeslal kontaktní formulář | 🟡 Medium |
| **newsletter_signup** | Uživatel se přihlásil k newsletteru | 🟢 Low |
| **workshop_detail_view** | Uživatel klikl na "Více informací" | 🟢 Low |

### 4.3. Implementace Conversion Tracking

#### Vytvoření helper funkce pro tracking

Vytvořte soubor `lib/analytics.js`:

```javascript
// Track conversion event
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams)
    console.log('📊 Analytics event:', eventName, eventParams)
  }
}

// Specific event trackers
export const trackRegistrationStarted = (workshopName, workshopDate) => {
  trackEvent('registration_started', {
    workshop_name: workshopName,
    workshop_date: workshopDate,
  })
}

export const trackRegistrationCompleted = (workshopName, workshopDate, price, registrationType) => {
  trackEvent('registration_completed', {
    workshop_name: workshopName,
    workshop_date: workshopDate,
    value: price,
    registration_type: registrationType, // 'single' or 'couple'
  })
}

export const trackContactFormSubmitted = () => {
  trackEvent('contact_form_submitted')
}

export const trackNewsletterSignup = () => {
  trackEvent('newsletter_signup')
}

export const trackWorkshopDetailView = (workshopName) => {
  trackEvent('workshop_detail_view', {
    workshop_name: workshopName,
  })
}
```

#### Přidání do registračního formuláře

V `components/RegistrationModal.js`:

```javascript
import { trackRegistrationStarted, trackRegistrationCompleted } from '../lib/analytics'

// Když se otevře modal:
useEffect(() => {
  if (isOpen && workshop) {
    trackRegistrationStarted(workshop.name, workshop.date)
  }
}, [isOpen, workshop])

// Když uživatel úspěšně odešle formulář:
const handleSubmit = async (e) => {
  // ... existing submit logic ...

  if (response.ok) {
    trackRegistrationCompleted(
      workshop.name,
      workshop.date,
      formData.registrationType === 'couple' ? workshop.priceCouple : workshop.priceSingle,
      formData.registrationType
    )
    // ... show success message ...
  }
}
```

### 4.4. Označení událostí jako "Conversion" v GA4

1. Přejděte na [Google Analytics](https://analytics.google.com)
2. Vyberte Property **Pet Dohod - Production**
3. V levém menu: **Configure** → **Events**
4. Počkejte, až se objeví události (může trvat 24-48 hodin po prvním nasazení)
5. U události **registration_completed** klikněte na přepínač **"Mark as conversion"**

---

## Krok 5: Ověření, že Analytics funguje

### 5.1. Realtime Reports

1. Přejděte na [Google Analytics](https://analytics.google.com)
2. V levém menu: **Reports** → **Realtime**
3. Otevřete váš web v jiném okně: `https://pet-dohod.vercel.app`
4. V Realtime reportu byste měli vidět **1 active user** (vy)

### 5.2. Debug v Browseru

1. Otevřete web
2. Otevřete Developer Tools (F12)
3. Přejděte na **Console**
4. Měli byste vidět logy: `📊 Analytics event: page_view`

---

## Krok 6: Vytvoření Custom Reports

### 6.1. Nejužitečnější Reports pro Pet Dohod

#### Report 1: Workshop Performance
**Co sleduje:** Jaké workshopy jsou nejpopulárnější

1. V GA4: **Explore** → **Free form**
2. **Dimensions**: `workshop_name`, `workshop_date`
3. **Metrics**: `Event count` (event: `registration_completed`)
4. **Visualization**: Table
5. Uložte jako **"Workshop Registrations"**

#### Report 2: Conversion Funnel
**Co sleduje:** Kolik lidí projde z návštěvy webu → registrace

1. **Explore** → **Funnel exploration**
2. **Steps**:
   - Step 1: `page_view` (stránka `/`)
   - Step 2: `registration_started`
   - Step 3: `registration_completed`
3. Uložte jako **"Registration Funnel"**

#### Report 3: Traffic Sources
**Co sleduje:** Odkud lidé přicházejí

1. **Reports** → **Acquisition** → **Traffic acquisition**
2. Podívejte se na:
   - `google` - organické vyhledávání
   - `(direct)` - přímý vstup (psaní URL)
   - `facebook` - Facebook kampaně
   - `email` - emaily

---

## Krok 7: Nastavení Goals & Alerts

### 7.1. Vytvoření Alert pro nízkou konverzi

1. **Configure** → **Custom Definitions** → **Custom metrics**
2. Vytvořte metriku:
   - **Metric name**: `Conversion Rate`
   - **Calculation**: `registration_completed / page_view * 100`
3. **Admin** → **Custom alerts** → **Create alert**
4. Nastavení:
   - **Alert name**: "Low Conversion Rate"
   - **Condition**: Conversion Rate < 2% (pro 7 dní)
   - **Send email**: váš email

---

## Co Dál? (Po spuštění)

### První týden:
- ✅ Kontrolujte **Realtime** report denně
- ✅ Sledujte, které stránky mají nejvyšší **bounce rate** (odchody)
- ✅ Podívejte se, odkud přicházejí návštěvníci

### První měsíc:
- ✅ Analyzujte **Conversion Funnel** - kde lidé odcházejí?
- ✅ Porovnejte **workshop performance** - které termíny táhnou?
- ✅ Testujte změny na webu a sledujte dopady na konverzi

### Průběžně:
- ✅ Nastavte měsíční review GA dat
- ✅ A/B testujte různé copy texty
- ✅ Optimalizujte stránky s vysokým bounce rate

---

## Troubleshooting (Časté problémy)

### ❌ Problém: Nevidím žádná data v GA4
**Řešení:**
1. Zkontrolujte, že `NEXT_PUBLIC_GA_MEASUREMENT_ID` je správně nastavena
2. Otevřete DevTools → Console - vidíte chyby?
3. Zkontrolujte, že máte povolené cookies (GA4 potřebuje cookies)
4. Data mohou trvat **24-48 hodin** než se začnou zobrazovat (kromě Realtime)

### ❌ Problém: Conversion events se nezobrazují
**Řešení:**
1. Otevřete DevTools → Console - vidíte logy `📊 Analytics event`?
2. Zkontrolujte, že `window.gtag` existuje: `console.log(window.gtag)`
3. Události se mohou objevit až po 24 hodinách

### ❌ Problém: Realtime ukazuje 0 users, ale jsem na webu
**Řešení:**
1. Zkontrolujte, že nemáte ad blocker (vypněte uBlock, AdBlock, atd.)
2. Zkontrolujte Developer Tools → Network - hledejte request na `google-analytics.com`
3. Zkuste jiný browser (Chrome recommended)

---

## Doporučené Chrome Extensions

- **Google Analytics Debugger** - vidíte všechny GA eventy v console
- **Tag Assistant (by Google)** - validace GA4 taggingu
- **GA4 Event Debugger** - real-time debug mode

---

## GDPR & Cookie Consent (Pro produkci)

⚠️ **DŮLEŽITÉ:** Google Analytics používá cookies, které vyžadují souhlas podle GDPR.

### Před spuštěním na produkci:
1. Přidejte **Cookie Consent banner**
2. Načítejte GA4 pouze po souhlasu uživatele
3. Aktualizujte **Privacy Policy** (už máte v `/ochrana-osobnich-udaju`)

### Doporučená knihovna:
```bash
npm install @cookieyes/react-cookie-consent
```

**Nebo** použijte jednoduchý in-house banner (levnější).

---

## Checklist před spuštěním ✅

- [ ] Vytvořen Google Analytics 4 účet
- [ ] Measurement ID zkopírováno
- [ ] Environment variable nastavena na Vercelu
- [ ] `GoogleAnalytics` komponenta přidána do `app/layout.js`
- [ ] Conversion tracking implementován (`lib/analytics.js`)
- [ ] Web nasazen a testován
- [ ] Realtime report ukazuje aktivní uživatele
- [ ] Conversion events označeny jako "conversion" v GA4
- [ ] Cookie consent banner přidán (GDPR)

---

## Kontakty & Další zdroje

**Google Analytics Help:**
🔗 [https://support.google.com/analytics](https://support.google.com/analytics)

**GA4 Documentation:**
🔗 [https://developers.google.com/analytics/devguides/collection/ga4](https://developers.google.com/analytics/devguides/collection/ga4)

**Next.js + GA4 Example:**
🔗 [https://github.com/vercel/next.js/tree/canary/examples/with-google-analytics](https://github.com/vercel/next.js/tree/canary/examples/with-google-analytics)

---

**Vytvořeno:** 2026-01-18
**Autor:** Claude Sonnet 4.5
**Pro:** Martin Fuks - Pet Dohod

**Status:** ✅ Připraveno k implementaci
