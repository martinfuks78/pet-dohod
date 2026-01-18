# Rate Limiting

Tento projekt implementuje rate limiting pro ochranu API před abuse a DDoS útoky.

## Aktuální stav

✅ **In-Memory Rate Limiting** - Funguje ihned (bez potřeby setup)
⏳ **Vercel KV (Redis)** - Připraveno k aktivaci (vyžaduje setup)

## Konfigurace limitů

| Endpoint | Limit | Time Window |
|----------|-------|-------------|
| Registrace | 5 požadavků | 1 hodina |
| Kontakt | 3 požadavky | 1 hodina |
| Newsletter | 5 požadavků | 1 den |
| API obecně | 100 požadavků | 1 minuta |

## Použití v API routes

### Základní použití

```javascript
import { withRateLimit } from '../../../lib/rate-limit'

async function handlePOST(request) {
  // Váš kód zde
  return NextResponse.json({ success: true })
}

// Použít rate limit pro registrace (5 za hodinu)
export const POST = withRateLimit(handlePOST, 'registration')
```

### Kombinace s CSRF a Auth

```javascript
import { withRateLimit } from '../../../lib/rate-limit'
import { withCSRF } from '../../../lib/csrf'
import { checkAuth } from '../../../lib/auth'

async function handlePOST(request) {
  // Autentizace
  const auth = checkAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  // Váš kód zde
  return NextResponse.json({ success: true })
}

// Kombinace všech ochran
export const POST = withCSRF(withRateLimit(handlePOST, 'api'))
```

## Typy rate limitů

- `'registration'` - Registrace na workshop (5/hod)
- `'contact'` - Kontaktní formulář (3/hod)
- `'newsletter'` - Newsletter subscribe (5/den)
- `'api'` - Obecné API (100/min) - výchozí

## Response Headers

Každá odpověď obsahuje rate limit informace:

```
X-RateLimit-Limit: 5          # Maximální počet požadavků
X-RateLimit-Remaining: 3      # Zbývající požadavky
X-RateLimit-Reset: 1704067200 # Unix timestamp kdy se limit resetuje
```

## Error Response (429 Too Many Requests)

```json
{
  "error": "Příliš mnoho požadavků. Zkuste to prosím později.",
  "retryAfter": 3600
}
```

## In-Memory vs. Vercel KV

### In-Memory Storage (Aktuální)

✅ **Výhody:**
- Funguje ihned bez setup
- Žádné extra náklady
- Rychlé (lokální paměť)

❌ **Nevýhody:**
- Resetuje se při každém deployi
- Nefunguje přes více serverless funkcí
- Limitováno pamětí

### Vercel KV - Redis (Připraveno k aktivaci)

✅ **Výhody:**
- Persistent storage (přežije deploy)
- Funguje globálně přes všechny instance
- Škálovatelné

❌ **Nevýhody:**
- Vyžaduje Vercel KV setup
- Dodatečné náklady (free tier: 30 000 requests/měsíc)

## Aktivace Vercel KV

### 1. Vytvoření KV store

```bash
# Přihlásit se k Vercel CLI
vercel login

# Vytvořit KV store
vercel kv create pet-dohod-rate-limit
```

### 2. Instalace dependencies

```bash
npm install @vercel/kv
```

### 3. Přidání environment variables

Vercel automaticky přidá tyto proměnné:
```
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

### 4. Odkomentování KV kódu

V `lib/rate-limit.js` odkomentujte sekci:

```javascript
// Odkomentovat tento import
import { kv } from '@vercel/kv'

// Odkomentovat checkRateLimitKV funkci (řádky ~74-95)
```

### 5. Deploy

```bash
vercel --prod
```

## Testování

### Lokální test

```bash
# První požadavek - projde
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Opakovat 5x rychle za sebou
# 6. požadavek vrátí 429 Too Many Requests
```

### Monitoring rate limitů

```javascript
// V prohlížeči DevTools → Network → Headers
// Zkontrolovat:
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 1704067200
```

## Troubleshooting

### "Příliš mnoho požadavků" ale nic nevolám

- **Důvod:** Sdílíte IP adresu (např. firemní síť, VPN)
- **Řešení:** Zvyšte limit nebo použijte jiné IP

### Rate limit se resetuje při každém deployi

- **Důvod:** Používá se in-memory storage
- **Řešení:** Aktivujte Vercel KV (viz výše)

### 429 error ale header ukazuje remaining > 0

- **Důvod:** Bug nebo cache issue
- **Řešení:** Zkontrolujte implementaci v `lib/rate-limit.js`

## Bezpečnostní poznámky

1. Rate limiting je **jedna vrstva obrany**, ne kompletní řešení
2. Kombinujte s CSRF ochranou pro write operace
3. Kombinujte s Bearer auth pro admin endpointy
4. Monitorujte abuse patterns v Sentry

## Přizpůsobení limitů

Upravte `RATE_LIMITS` v `lib/rate-limit.js`:

```javascript
const RATE_LIMITS = {
  registration: {
    windowMs: 60 * 60 * 1000,  // ← Změnit na 2 hodiny: 2 * 60 * 60 * 1000
    maxRequests: 5,             // ← Změnit na 10
  },
  // ...
}
```

## Production Checklist

- [ ] Otestovat rate limiting lokálně
- [ ] Zkontrolovat hlavičky X-RateLimit-*
- [ ] Rozhodnout: in-memory nebo Vercel KV?
- [ ] (Volitelně) Aktivovat Vercel KV
- [ ] Monitorovat 429 errors v Sentry
- [ ] Upravit limity podle reálného trafficu
