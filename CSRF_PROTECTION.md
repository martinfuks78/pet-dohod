# CSRF Protection

Tento projekt implementuje CSRF (Cross-Site Request Forgery) ochranu pro všechny API endpointy.

## Co je CSRF?

CSRF útok umožňuje útočníkovi vynutit si akce jménem přihlášeného uživatele. Například pokud admin je přihlášený do adminu a navštíví škodlivou stránku, útočník by mohl odeslat požadavky na API endpointy admina.

## Jak funguje naše ochrana?

Middleware kontroluje `Origin` a `Referer` HTTP hlavičky a ověřuje, že požadavek pochází z důvěryhodné domény.

### Povolené domény

```javascript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',           // Lokální vývoj
  'https://pet-dohod.vercel.app',   // Vercel preview
  'https://www.petdohod.cz',        // Produkce
  'https://petdohod.cz',            // Produkce (bez www)
]
```

## Použití v API endpointech

### Varianta 1: Wrapper funkce (Doporučeno)

```javascript
import { withCSRF } from '../../../lib/csrf'

async function handlePOST(request) {
  // Váš kód zde
  return NextResponse.json({ success: true })
}

export const POST = withCSRF(handlePOST)
```

### Varianta 2: Manuální kontrola

```javascript
import { checkCSRF } from '../../../lib/csrf'

export async function POST(request) {
  const csrfCheck = checkCSRF(request)

  if (!csrfCheck.valid) {
    return NextResponse.json(
      { error: csrfCheck.error },
      { status: 403 }
    )
  }

  // Váš kód zde
}
```

## Kdy se CSRF kontroluje?

- ✅ **POST, PUT, DELETE, PATCH** požadavky - vždy kontrolováno
- ❌ **GET, HEAD, OPTIONS** - NEPOTŘEBUJÍ CSRF ochranu (read-only operace)

## Bezpečnostní poznámky

1. **HTTPS je povinné v produkci** - CSRF ochrana je pouze jedna vrstva obrany
2. **Bearer token autentizace** - kombinujte CSRF s Bearer token auth pro admin endpointy
3. **CORS politika** - definována v `next.config.js` jako další vrstva obrany

## Přidání nové domény

Když přesunete projekt na novou doménu, přidejte ji do `ALLOWED_ORIGINS` v `lib/csrf.js`:

```javascript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://pet-dohod.vercel.app',
  'https://www.petdohod.cz',
  'https://petdohod.cz',
  'https://nová-doména.cz',  // ← Přidejte sem
]
```

## Testování

### Lokální test
```bash
# Platný požadavek (projde)
curl -X POST http://localhost:3000/api/workshops \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Neplatný požadavek (zamítne se)
curl -X POST http://localhost:3000/api/workshops \
  -H "Origin: https://evil.com" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Troubleshooting

### "CSRF validation failed"
- Zkontrolujte, že frontend volá API ze správné domény
- Ověřte, že doména je v `ALLOWED_ORIGINS`
- Zkontrolujte browser DevTools → Network → Headers (Origin/Referer)

### Problém s CORS
- CSRF a CORS jsou dvě různé vrstvy bezpečnosti
- CORS politika je definována v `next.config.js`
- CSRF kontroluje Origin header, CORS definuje které domény smí volat API
