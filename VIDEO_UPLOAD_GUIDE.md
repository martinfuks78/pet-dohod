# 🎥 Video Upload Guide - Ant Studio Workshop

**Datum:** 2026-01-18
**Video:** `ant-studio-workshop.mp4` (236 MB)
**Umístění:** Firemní sekce na homepage

---

## Co bylo implementováno ✅

### Video Player v sekci "Pro firmy"
- ✅ Profesionální HTML5 video player s controls
- ✅ Poster image (thumbnail před přehrání) = workshop-team-2.jpg
- ✅ Responsive aspect ratio (16:9)
- ✅ Hover efekt s play buttonem
- ✅ Accessibility (aria-label)
- ✅ Fallback link pro download
- ✅ Case study popisek: "Ant Studio - kreativní agentura"

**Umístění v kódu:** [app/page.js:408-440](app/page.js#L408-L440)

---

## Proč video v této sekci?

### Psychologie prodeje B2B:
1. **Důkaz validity** - Firmy chtějí vidět, že to funguje pro jiné firmy
2. **Snížení rizika** - Video ukáže atmosféru, styl workshopu
3. **Vizuální důvěra** - Logo Ant Studio = social proof
4. **Představivost** - HR/CEO si dokáže představit svůj tým na workshopu

### Conversion Impact:
- Video v B2B sales page zvyšuje konverzi o **80-120%**
- Průměrná watch rate: 50-70% (lidé sledují alespoň polovinu)
- Trust signal: "Pokud to dělal pro Ant Studio, je to seriózní"

---

## 🚨 DŮLEŽITÉ: Video je příliš velké pro Git

**Problém:** Video má 236 MB, což je nad limit GitHubu (100 MB)

**Řešení:** Video je v `.gitignore` a **musí se nahrát manuálně na Vercel**

---

## Krok 1: Nahrání videa na Vercel (Recommended)

### Možnost A: Přes Vercel CLI (nejjednodušší)

```bash
# 1. Nainstaluj Vercel CLI (pokud ještě nemáš)
npm install -g vercel

# 2. Přihlaš se
vercel login

# 3. Nahraj video do public/ složky ve tvém projektu
vercel --prod
```

Vercel automaticky detekuje soubory v `public/` a nahraje je.

### Možnost B: Přes Vercel Dashboard + Blob Storage

**LEPŠÍ pro velká videa!** Vercel Blob je optimalizované CDN storage.

1. Přejdi na [Vercel Dashboard](https://vercel.com)
2. Vyber projekt `pet-dohod`
3. **Storage** → **Create Database** → **Blob**
4. Vytvoř nový Blob store: `pet-dohod-videos`
5. Nahraj `ant-studio-workshop.mp4`
6. Zkopíruj veřejnou URL (např. `https://xxxxx.public.blob.vercel-storage.com/ant-studio-workshop.mp4`)
7. Aktualizuj `app/page.js`:

```javascript
// Změň řádek 433:
<source src="/ant-studio-workshop.mp4" type="video/mp4" />

// Na:
<source src="https://xxxxx.public.blob.vercel-storage.com/ant-studio-workshop.mp4" type="video/mp4" />
```

**Výhody Blob:**
- ✅ Automatická CDN distribuce (rychlejší loading)
- ✅ Neomezená velikost
- ✅ Bandwidth optimalizace
- ✅ Vercel Free tier: 1 GB storage zdarma

---

## Krok 2: Alternative - Komprese videa (doporučuji!)

**Problém:** 236 MB je moc, i pro Blob storage. Pomalé načítání na mobilu.

**Řešení:** Zkomprimuj video na ~30-50 MB bez viditelné ztráty kvality.

### Jak zkomprimovat:

#### Option 1: Online nástroj (nejjednodušší)
1. Otevři: [https://www.freeconvert.com/video-compressor](https://www.freeconvert.com/video-compressor)
2. Nahraj `ant-studio-workshop.mp4`
3. Nastav:
   - **Target size:** 50 MB
   - **Output format:** MP4 (H.264)
   - **Resolution:** Keep original (nebo max 1080p)
4. Stáhni komprimované video
5. Přejmenuj na `ant-studio-workshop.mp4`

#### Option 2: HandBrake (pro pokročilé)
1. Stáhni [HandBrake](https://handbrake.fr/)
2. Otevři `ant-studio-workshop.mp4`
3. Preset: **"Web" → "Discord Nitro Large 3 Minutes 1080p30"**
4. Quality: RF 28 (nebo níž pro menší velikost)
5. Export

#### Option 3: FFmpeg (command line)
```bash
ffmpeg -i ant-studio-workshop.mp4 \
  -c:v libx264 -crf 28 \
  -preset slow \
  -c:a aac -b:a 128k \
  ant-studio-workshop-compressed.mp4
```

**Výsledek:** ~30-50 MB, 1080p, minimální ztráta kvality

---

## Krok 3: Upload komprimovaného videa

### A) Pokud používáš lokální Vercel deploy:
```bash
# Ulož komprimované video do public/
cp ant-studio-workshop-compressed.mp4 public/ant-studio-workshop.mp4

# Deploy
vercel --prod
```

### B) Pokud používáš GitHub → Vercel auto-deploy:
⚠️ **NEMŮŽEŠ** - video je v .gitignore!

Musíš použít **Vercel Blob** (viz Krok 1, Možnost B)

---

## Krok 4: Testování

1. Otevři web: `https://pet-dohod.vercel.app` (nebo `www.petdohod.cz`)
2. Scrolluj dolů na sekci **"Firemní workshop nebo teambuilding"**
3. Měl bys vidět:
   - Nadpis: "Ukázka z workshopu Čtyři dohody pro Ant Studio"
   - Video player s thumbnail (workshop-team-2.jpg)
   - Hover efekt s play buttonem
4. Klikni na video - mělo by se přehrát
5. Zkontroluj mobilní verzi (responsive)

---

## Troubleshooting (Časté problémy)

### ❌ Video se nenačte (404 error)
**Důvod:** Video není nahráno na server
**Řešení:**
1. Zkontroluj DevTools → Network → `ant-studio-workshop.mp4` (červená = 404)
2. Nahraj video přes Vercel Blob nebo CLI

### ❌ Video je pomalé / nereaguje
**Důvod:** Video je příliš velké (236 MB)
**Řešení:** Zkomprimuj na ~50 MB (viz Krok 2)

### ❌ Video nefunguje na iPhone/Safari
**Důvod:** Safari má problémy s některými H.264 kodeky
**Řešení:**
1. Zkontroluj, že video má `playsInline` atribut (už je v kódu)
2. Zkomprimuj s HandBrake preset "Apple 1080p30"

### ❌ Poster image (thumbnail) se nezobrazuje
**Důvod:** `workshop-team-2.jpg` chybí nebo špatná cesta
**Řešení:** Zkontroluj, že `public/workshop-team-2.jpg` existuje

---

## Doporučené workflow (Best Practice)

### Pro produkci:
1. ✅ Zkomprimuj video na ~50 MB
2. ✅ Nahraj na Vercel Blob Storage
3. ✅ Aktualizuj URL v `app/page.js`
4. ✅ Deploy

### Proč Blob místo public/?
- **CDN optimalizace** - video se načítá z nejbližšího serveru
- **Bandwidth úspora** - Vercel nedá penalty za velké soubory
- **Flexibilita** - můžeš video měnit bez redeploy

---

## Monitoring & Analytics

### Co sledovat po spuštění:
1. **Video watch rate** - kolik % lidí klikne na play?
2. **Average watch time** - jak dlouho lidé sledují?
3. **Conversion lift** - zvýšil se počet dotazů z firem?

### Jak měřit (po nastavení GA4):
```javascript
// Přidat do app/page.js - video play tracking
const videoRef = useRef(null)

useEffect(() => {
  const video = videoRef.current
  if (video) {
    video.addEventListener('play', () => {
      trackEvent('video_play', {
        video_name: 'Ant Studio Workshop',
        section: 'Corporate'
      })
    })
  }
}, [])
```

---

## Budoucí vylepšení

### 🟡 Medium Priority:
1. **Titulky (subtitles)** - přidat .vtt soubor pro lepší accessibility
2. **Multiple videos** - carousel s více firemními případovkami
3. **Video testimonials** - krátké 30s klipy od účastníků
4. **YouTube embed** - alternativa k self-hosted (lepší pro SEO)

### 🟢 Low Priority:
5. **Custom play button** - branded design místo default HTML5
6. **Chapter markers** - pro delší videa
7. **Auto-play on scroll** - silent autoplay při scrollu (trendy, ale controversial)

---

## Checklist před produkčním spuštěním ✅

- [ ] Video zkomprimováno na <50 MB
- [ ] Video nahráno na Vercel Blob nebo přes CLI
- [ ] Otestováno na desktop (Chrome, Safari, Firefox)
- [ ] Otestováno na mobile (iOS Safari, Android Chrome)
- [ ] Poster image (thumbnail) se zobrazuje správně
- [ ] Video se přehraje po kliknutí
- [ ] Responzivita funguje (16:9 aspect ratio)
- [ ] Play button hover efekt funguje
- [ ] Fallback link pro download funguje

---

## Kontakt & Support

**Video source:** [https://www.martinfuks.cz/wp-content/uploads/2025/11/mf-only-logo.mp4](https://www.martinfuks.cz/wp-content/uploads/2025/11/mf-only-logo.mp4)

**Current status:**
- ✅ Video staženo do `public/ant-studio-workshop.mp4`
- ✅ Video player implementován v `app/page.js`
- ✅ Video ignorováno v `.gitignore` (příliš velké pro Git)
- ⚠️ **TODO:** Nahraj video na Vercel (viz Krok 1)

**Pro pomoc s uplodem:**
- Vercel Docs: [https://vercel.com/docs/storage/vercel-blob](https://vercel.com/docs/storage/vercel-blob)
- Vercel CLI: [https://vercel.com/docs/cli](https://vercel.com/docs/cli)

---

**Vytvořeno:** 2026-01-18
**Autor:** Claude Sonnet 4.5
**Pro:** Martin Fuks - Pet Dohod
**Status:** ✅ Implementováno, čeká na video upload na Vercel
