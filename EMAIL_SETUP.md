# Nastavení automatických emailů (Resend)

## 1. Vytvoř Resend účet

1. Jdi na [resend.com](https://resend.com)
2. Klikni **Sign Up**
3. Zaregistruj se (email + heslo)
4. Potvrď email

## 2. Získej API klíč

1. Po přihlášení jdi na **API Keys**
2. Klikni **Create API Key**
3. Pojmenuj ho: `pet-dohod`
4. Klikni **Add**
5. **ZKOPÍRUJ KLÍČ** (uvidíš ho jen jednou!) - vypadá jako `re_xxxxxxxxxx`

## 3. Přidej API klíč do projektu

### Lokálně (dev):

Do souboru `.env.local` přidej:
```
RESEND_API_KEY=re_xxxxxxxxxx
```

### Na Vercelu (production):

1. Jdi do Vercel Dashboard → pet-dohod → Settings → Environment Variables
2. Přidej novou proměnnou:
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_xxxxxxxxxx` (tvůj API klíč)
   - **Environments:** Production, Preview, Development
3. Klikni **Save**
4. **Redeploy** projekt (Deployments → ... → Redeploy)

## 4. Ověř doménu (důležité!)

**Bez tohoto kroku NEFUNGUJÍ emaily v produkci!**

1. V Resend dashboardu jdi na **Domains**
2. Klikni **Add Domain**
3. Zadej svou doménu (např. `petdohod.cz`)
4. Resend ti ukáže DNS záznamy, které musíš přidat
5. Přidej je u svého domain providera
6. Počkej na ověření (může trvat až 48h, obvykle pár minut)

**Poznámka:** Dokud není doména ověřená, můžeš posílat emaily POUZE na email, se kterým jsi se zaregistroval na Resend.

## 5. Uprav email adres

V souboru `lib/email.js` uprav:

```javascript
from: 'Pět dohod <workshop@petdohod.cz>', // Změň na svou ověřenou doménu
to: ['tvuj@email.cz'], // Pro admin notifikaci
```

## 6. Uprav platební údaje

V souboru `lib/email.js` v sekci "Platební údaje" uprav:

```html
<p><strong>Číslo účtu:</strong> 123456789/0100</p>
```

Na své skutečné číslo účtu.

## 7. Test

Po nastavení otestuj registraci:

1. Otevři http://localhost:3000
2. Vyplň registrační formulář
3. Odešli
4. Zkontroluj:
   - Email ve schránce účastníka
   - Email ve své admin schránce

## Co se děje automaticky

Po každé registraci se pošlou **2 emaily**:

1. **Účastníkovi:**
   - Potvrzení registrace
   - Detail workshopu (termín, místo, cena)
   - Platební údaje (číslo účtu, VS, částka)

2. **Adminovi (tobě):**
   - Notifikace o nové registraci
   - Všechny údaje účastníka
   - Link na admin panel

## Troubleshooting

### "API key not found"
- Zkontroluj, že je `RESEND_API_KEY` v `.env.local`
- Restartuj dev server: `bun run dev`

### "Domain not verified"
- Emaily půjdou jen na tvůj registrační email
- Ověř doménu podle kroku 4

### Emaily nedorazily
- Zkontroluj spam folder
- Zkontroluj Resend dashboard → Logs
- Zkontroluj server console pro error logy
