# Nastavení databáze - Krok za krokem

## 1. Vytvoř Vercel Postgres databázi

1. Jdi na [vercel.com/dashboard](https://vercel.com/dashboard)
2. Klikni na **Storage** v horním menu
3. Klikni na **Create Database**
4. Vyber **Postgres**
5. Pojmenuj ji: `pet-dohod-db`
6. Vyber region: **Frankfurt** (nejblíž k ČR)
7. Klikni **Create**

## 2. Zkopíruj databázové credentials

1. Po vytvoření databáze uvidíš tab **`.env.local`**
2. Klikni na něj a zkopíruj všechny proměnné
3. Vytvoř soubor `.env.local` v root složce projektu
4. Vlož zkopírované proměnné do souboru

Soubor `.env.local` by měl vypadat nějak takto:

```env
POSTGRES_URL="postgres://default:xxx@xxx-pooler.aws.neon.tech/verceldb?sslmode=require"
POSTGRES_PRISMA_URL="postgres://default:xxx@xxx-pooler.aws.neon.tech/verceldb?sslmode=require&pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NO_SSL="postgres://default:xxx@xxx.aws.neon.tech/verceldb"
POSTGRES_URL_NON_POOLING="postgres://default:xxx@xxx.aws.neon.tech/verceldb?sslmode=require"
POSTGRES_USER="default"
POSTGRES_HOST="xxx.aws.neon.tech"
POSTGRES_PASSWORD="xxx"
POSTGRES_DATABASE="verceldb"
```

## 3. Inicializuj databázové tabulky

Spusť inicializační endpoint (stačí jednou):

```bash
# V browseru nebo pomocí curl:
curl http://localhost:3000/api/init-db

# Nebo prostě otevři v browseru:
open http://localhost:3000/api/init-db
```

Měl bys vidět:
```json
{
  "success": true,
  "message": "Database initialized successfully"
}
```

## 4. Hotovo! 🎉

Databáze je připravená a obsahuje:

- ✅ Tabulku `workshops` (workshopy)
- ✅ Tabulku `registrations` (registrace)
- ✅ Tabulku `newsletter_subscribers` (newsletter)
- ✅ 3 ukázkové workshopy (březen, duben, květen 2026)

## Co teď funguje

- **Registrace** - ukládají se do databáze
- **Admin panel** - zobrazuje reálná data z databáze
- **Newsletter** - nový endpoint `/api/newsletter`

## Další kroky

1. ✅ Databáze (hotovo)
2. 🔄 Automatické emaily (Resend) - další krok
3. 🔄 Propojení newsletteru na homepage
4. 🔄 SEO optimalizace
5. 🔄 Deployment na Vercel

## Troubleshooting

### "Missing environment variable"
- Zkontroluj, že máš soubor `.env.local` v root složce
- Restartuj dev server: `bun run dev`

### "Connection refused"
- Zkontroluj, že credentials v `.env.local` jsou správné
- Zkontroluj, že databáze běží ve Vercel dashboardu
