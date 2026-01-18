# 🚀 RYCHLÝ NÁVOD: Video Upload (5-10 minut)

**Status:** ✅ Video komponenta implementována s auto-play
**Zbývá:** Zkomprimovat + nahrát video na Vercel

---

## Krok 1: Zkomprimuj video (NUTNÉ - 236 MB je moc!)

### Možnost A: Online kompresor (NEJJEDNODUŠŠÍ - 3 minuty)

1. **Otevři:** [https://www.freeconvert.com/video-compressor](https://www.freeconvert.com/video-compressor)

2. **Nahraj video:**
   - Klikni "Choose Files"
   - Vyber: `/Users/Boris/pet-dohod/public/ant-studio-workshop.mp4`

3. **Nastav:**
   - **Target Size:** `50 MB` (nebo `40 MB` pro ještě rychlejší loading)
   - **Output Format:** `MP4`
   - **Resolution:** Keep original

4. **Klikni:** "Compress Now!"

5. **Stáhni:** Zkomprimované video
   - Přejmenuj na: `ant-studio-workshop-compressed.mp4`

**Výsledek:** Video ~40-50 MB (80% úspora), vizuálně téměř stejné

---

## Krok 2: Nahraj na Vercel Blob Storage (DOPORUČENO)

### Proč Blob místo public/ složky?
- ✅ **CDN optimalizace** - rychlejší loading globálně
- ✅ **Neomezená velikost** - není problém s Git limity
- ✅ **Vercel Free tier** - 1 GB zdarma

### Jak nahrát:

1. **Otevři:** [https://vercel.com/dashboard](https://vercel.com/dashboard)

2. **Vyber projekt:** `pet-dohod`

3. **Storage tab:**
   - V levém menu: **Storage**
   - Klikni: **Create Database**
   - Vyber: **Blob**

4. **Vytvoř Blob store:**
   - Name: `pet-dohod-videos`
   - Region: `Frankfurt (fra1)` (nejblíž ČR)
   - Klikni: **Create**

5. **Nahraj video:**
   - Otevři Blob store: `pet-dohod-videos`
   - Klikni: **Upload**
   - Vyber: `ant-studio-workshop-compressed.mp4`
   - Počkej na upload (1-2 minuty)

6. **Zkopíruj URL:**
   - Po uploadu uvidíš URL ve formátu:
   ```
   https://xxxxx.public.blob.vercel-storage.com/ant-studio-workshop-compressed-yyyyyyy.mp4
   ```
   - **ZKOPÍRUJ celou URL!**

---

## Krok 3: Aktualizuj URL v kódu

1. **Otevři soubor:** `app/page.js`

2. **Najdi řádek 1169:**
   ```javascript
   <source src="/ant-studio-workshop.mp4" type="video/mp4" />
   ```

3. **Změň na:**
   ```javascript
   <source src="https://xxxxx.public.blob.vercel-storage.com/ant-studio-workshop-compressed-yyyyyyy.mp4" type="video/mp4" />
   ```
   (Použij svou URL z kroku 2.6)

4. **Ulož soubor**

---

## Krok 4: Commit & Push

```bash
cd /Users/Boris/pet-dohod
git add app/page.js
git commit -m "Update video URL to Vercel Blob Storage"
git push
```

Vercel automaticky nasadí novou verzi během ~30 sekund.

---

## Krok 5: Ověř, že funguje

1. **Otevři:** [https://pet-dohod.vercel.app](https://pet-dohod.vercel.app)
2. **Scrolluj dolů** na sekci "Firemní workshop"
3. **Mělo by se stát:**
   - ✅ Video se začne automaticky přehrávat (ztlumené)
   - ✅ Uvidíš "LIVE" indikátor v levém horním rohu
   - ✅ V pravém dolním rohu je ikona zvuku (🔇)
   - ✅ Kliknutím na zvuk se zapne audio

---

## Troubleshooting

### ❌ Video se nenačítá (prázdná černá obrazovka)
**Příčina:** Špatná URL nebo video není nahráno
**Řešení:**
1. Zkontroluj URL v `app/page.js:1169`
2. Otevři URL v browseru - mělo by stáhnout video
3. Pokud ne, nahraj znovu do Blob storage

### ❌ Video se nehraje automaticky
**Příčina:** Browser blokuje auto-play (Safari, Firefox)
**Řešení:** To je OK - muted auto-play by mělo fungovat. Pokud ne:
1. Otevři DevTools Console (F12)
2. Hledej error: "Auto-play prevented"
3. Zkontroluj, že video má atribut `muted`

### ❌ Video je stále pomalé (long loading)
**Příčina:** Video není dostatečně zkomprimované
**Řešení:**
1. Zkomprimuj na **40 MB** místo 50 MB
2. Nebo zkus **30 MB** target size
3. Re-upload do Blob storage

### ❌ Zvuk nefunguje po kliknutí na ikonu
**Příčina:** Video nemá audio track nebo je corrupted
**Řešení:**
1. Zkontroluj originální video - má zvuk?
2. Zkus jiný kompresor (např. HandBrake)

---

## Co dál? (Volitelné optimalizace)

### 🟡 Pokud chceš ještě lepší UX:

#### 1. Přidej video preview (první frame)
```javascript
// V app/page.js, VideoPlayer komponenta:
<video
  ref={videoRef}
  loop
  muted
  playsInline
  preload="metadata"  // ← Přidat tento řádek
  className="w-full h-full object-cover"
>
```

#### 2. Přidej loading spinner
```javascript
const [isLoading, setIsLoading] = useState(true)

<video
  ref={videoRef}
  onLoadedData={() => setIsLoading(false)}
  // ... rest
>

{isLoading && (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
)}
```

#### 3. Google Analytics tracking
```javascript
// Track video play
useEffect(() => {
  const video = videoRef.current
  if (!video) return

  const handlePlay = () => {
    if (window.gtag) {
      window.gtag('event', 'video_play', {
        video_title: 'Ant Studio Workshop',
        video_location: 'Corporate Section'
      })
    }
  }

  video.addEventListener('play', handlePlay)
  return () => video.removeEventListener('play', handlePlay)
}, [])
```

---

## Rychlý checklist ✅

Před dokončením zkontroluj:

- [ ] Video zkomprimováno na <50 MB
- [ ] Video nahráno do Vercel Blob Storage
- [ ] URL aktualizována v `app/page.js`
- [ ] Změny commitnuty a pushnuty
- [ ] Video se přehrává automaticky na webu
- [ ] Zvukové tlačítko funguje
- [ ] "LIVE" indikátor se zobrazuje
- [ ] Mobile UX funguje (iPhone/Android test)

---

## Pokud něco nejde

**Kontakt:**
- Vercel Support: [https://vercel.com/support](https://vercel.com/support)
- Vercel Docs - Blob: [https://vercel.com/docs/storage/vercel-blob](https://vercel.com/docs/storage/vercel-blob)

**Nebo:**
- Můžu pomoct přes email/call
- Screen sharing session

---

## Odhad času:

- ⏱️ **Komprese videa:** 2-3 minuty (online kompresor)
- ⏱️ **Upload na Vercel Blob:** 1-2 minuty
- ⏱️ **Aktualizace kódu:** 1 minuta
- ⏱️ **Commit & push:** 30 sekund
- ⏱️ **Verifikace:** 1 minuta

**CELKEM:** ~5-10 minut!

---

**Vytvořeno:** 2026-01-18
**Status:** ✅ Ready to implement
**Náročnost:** ⭐⭐ (Easy - Medium)
