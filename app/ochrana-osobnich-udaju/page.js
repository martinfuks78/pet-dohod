export const metadata = {
  title: 'Ochrana osobních údajů - Pět dohod',
  description: 'Informace o zpracování osobních údajů v souladu s GDPR',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">
          Ochrana osobních údajů
        </h1>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              1. Správce osobních údajů
            </h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>Jméno a příjmení:</strong> Martin Fuks</p>
              <p><strong>IČ:</strong> 19755015</p>
              <p><strong>Email:</strong> kouc@martinfuks.cz</p>
              <p><strong>Telefon:</strong> +420 603 551 119</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              2. Rozsah zpracování osobních údajů
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Zpracováváme pouze osobní údaje, které nám poskytnete dobrovolně při registraci na naše workshopy nebo při komunikaci s námi.
              </p>
              <p>
                <strong>Zpracováváme tyto osobní údaje:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Jméno a příjmení</li>
                <li>E-mailová adresa</li>
                <li>Telefonní číslo</li>
                <li>Korespondenční adresa (ulice, město, PSČ)</li>
                <li>Údaje o partnerovi (pokud se registrujete jako pár)</li>
                <li>Poznámky, které nám poskytnete při registraci</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              3. Účel zpracování osobních údajů
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>Vaše osobní údaje zpracováváme pro tyto účely:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Registrace na workshopy</strong> - evidence účastníků, potvrzení registrace</li>
                <li><strong>Komunikace</strong> - zasílání informací o workshopech, odpovědi na dotazy</li>
                <li><strong>Platby</strong> - identifikace plateb, vedení účetnictví</li>
                <li><strong>Newsletter</strong> - zasílání novinek o workshopech (pouze s vaším souhlasem)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              4. Právní základ zpracování
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>Vaše osobní údaje zpracováváme na základě:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Plnění smlouvy</strong> (čl. 6 odst. 1 písm. b) GDPR) - registrace a účast na workshopu</li>
                <li><strong>Oprávněného zájmu</strong> (čl. 6 odst. 1 písm. f) GDPR) - komunikace s účastníky</li>
                <li><strong>Souhlasu</strong> (čl. 6 odst. 1 písm. a) GDPR) - newsletter</li>
                <li><strong>Právní povinnosti</strong> (čl. 6 odst. 1 písm. c) GDPR) - účetnictví, daňová evidence</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              5. Doba uložení osobních údajů
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>Vaše osobní údaje uchováváme:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Registrace na workshopy:</strong> 3 roky od účasti na workshopu</li>
                <li><strong>Účetní doklady:</strong> 10 let (podle zákona o účetnictví)</li>
                <li><strong>Newsletter:</strong> do odvolání souhlasu nebo ukončení služby</li>
              </ul>
              <p className="mt-4">
                Po uplynutí doby uložení osobní údaje bezpečně smažeme nebo anonymizujeme.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              6. Vaše práva
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>V souvislosti se zpracováním vašich osobních údajů máte tato práva:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Právo na přístup</strong> - máte právo vědět, jaké vaše osobní údaje zpracováváme</li>
                <li><strong>Právo na opravu</strong> - máte právo požádat o opravu nesprávných údajů</li>
                <li><strong>Právo na výmaz</strong> ("právo být zapomenut") - za určitých podmínek</li>
                <li><strong>Právo na omezení zpracování</strong> - za určitých podmínek</li>
                <li><strong>Právo na přenositelnost</strong> - získat své údaje ve strukturovaném formátu</li>
                <li><strong>Právo vznést námitku</strong> - proti zpracování založenému na oprávněném zájmu</li>
                <li><strong>Právo odvolat souhlas</strong> - u zpracování založeného na souhlasu</li>
                <li><strong>Právo podat stížnost</strong> - u Úřadu pro ochranu osobních údajů</li>
              </ul>
              <p className="mt-4">
                Pro uplatnění vašich práv nás kontaktujte na emailu: <a href="mailto:kouc@martinfuks.cz" className="text-primary-600 hover:underline">kouc@martinfuks.cz</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              7. Předávání osobních údajů třetím stranám
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>Vaše osobní údaje můžeme předávat pouze těmto kategoriím příjemců:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Poskytovatelé IT služeb</strong> - hosting (Vercel), emailové služby (Resend)</li>
                <li><strong>Daňový poradce / účetní</strong> - pro vedení účetnictví</li>
                <li><strong>Státní orgány</strong> - pokud to vyžaduje zákon</li>
              </ul>
              <p className="mt-4">
                Neprodáváme ani nepronajímáme vaše osobní údaje třetím stranám pro marketingové účely.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              8. Zabezpečení osobních údajů
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>Vaše osobní údaje chráníme pomocí těchto opatření:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Šifrované připojení</strong> - používáme HTTPS protokol</li>
                <li><strong>Zabezpečená databáze</strong> - s přístupem pouze oprávněných osob</li>
                <li><strong>Pravidelné zálohy</strong> - pro ochranu před ztrátou dat</li>
                <li><strong>Autentizace</strong> - heslem chráněný přístup do administrace</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              9. Cookies
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                Naše webové stránky používají pouze technické cookies nezbytné pro fungování webu (např. session cookies pro admin přihlášení).
                Nepoužíváme analytické ani marketingové cookies.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              10. Kontakt
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                Pokud máte jakékoliv dotazy ohledně zpracování vašich osobních údajů, kontaktujte nás:
              </p>
              <p className="mt-4">
                <strong>Email:</strong> <a href="mailto:kouc@martinfuks.cz" className="text-primary-600 hover:underline">kouc@martinfuks.cz</a><br />
                <strong>Telefon:</strong> +420 603 551 119
              </p>
            </div>
          </section>

          <section className="border-t pt-8">
            <p className="text-sm text-gray-600">
              <strong>Poslední aktualizace:</strong> 10. ledna 2026
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Tento dokument může být průběžně aktualizován. O významných změnách vás budeme informovat prostřednictvím emailu nebo na našich webových stránkách.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
          >
            Zpět na hlavní stránku
          </a>
        </div>
      </div>
    </div>
  )
}
