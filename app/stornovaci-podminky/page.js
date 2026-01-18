export const metadata = {
  title: 'Stornovací podmínky | Workshop Pět dohod',
  description: 'Podmínky storna registrace a vrácení platby za workshop Pět dohod.',
}

export default function CancellationPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Stornovací podmínky
          </h1>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Storno ze strany účastníka
              </h2>

              <div className="bg-primary-50 border-l-4 border-primary-500 p-6 mb-6">
                <p className="font-semibold text-gray-900 mb-2">
                  Důležité informace o stornování
                </p>
                <p className="text-gray-700">
                  V případě zrušení účasti je nutné nás informovat emailem na{' '}
                  <a href="mailto:kouc@martinfuks.cz" className="text-primary-600 hover:text-primary-700">
                    kouc@martinfuks.cz
                  </a>
                  {' '}nebo telefonicky na{' '}
                  <a href="tel:+420603551119" className="text-primary-600 hover:text-primary-700">
                    +420 603 551 119
                  </a>
                </p>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Více než 14 dní před workshopem
                  </h3>
                  <p className="text-gray-700">
                    <strong className="text-green-600">100% vrácení platby</strong>
                  </p>
                  <p className="text-gray-600 mt-2">
                    Při stornování více než 14 dní před začátkem workshopu Vám vrátíme celou zaplacenou částku.
                    Peníze budou vráceny na účet, ze kterého byla platba provedena, do 7 pracovních dnů.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    7-14 dní před workshopem
                  </h3>
                  <p className="text-gray-700">
                    <strong className="text-yellow-600">50% vrácení platby</strong>
                  </p>
                  <p className="text-gray-600 mt-2">
                    Při stornování 7-14 dní před začátkem workshopu Vám vrátíme 50% zaplacené částky.
                    Zbývajících 50% slouží k pokrytí administrativních nákladů a rezervovaného místa.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Méně než 7 dní před workshopem
                  </h3>
                  <p className="text-gray-700">
                    <strong className="text-red-600">Bez vrácení platby</strong>
                  </p>
                  <p className="text-gray-600 mt-2">
                    Při stornování méně než 7 dní před začátkem workshopu již není možné vrátit platbu.
                    V tomto termínu již nemůžeme obsadit Vaše místo a vznikly nám náklady na organizaci.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8 bg-blue-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Náhradník místo Vás
              </h2>
              <p className="text-gray-700 mb-4">
                V případě, že nemůžete na workshop dorazit, máte možnost poslat místo sebe náhradníka
                (přítele, kolegu, rodinného příslušníka).
              </p>
              <p className="text-gray-700">
                <strong>Podmínky:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li>Informujte nás o změně minimálně 2 dny před workshopem</li>
                <li>Uveďte jméno, příjmení a email náhradníka</li>
                <li>Náhradník obdrží všechny potřebné informace o workshopu</li>
                <li>Tato možnost je dostupná až do 2 dnů před začátkem workshopu</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Storno ze strany pořadatele
              </h2>
              <p className="text-gray-700 mb-4">
                Vyhrazujeme si právo zrušit workshop v případě:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Nedostatečného počtu přihlášených účastníků (méně než 8 osob)</li>
                <li>Vážných zdravotních důvodů lektora</li>
                <li>Vyšší moci (přírodní katastrofy, pandemie, apod.)</li>
                <li>Technických důvodů znemožňujících konání workshopu</li>
              </ul>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
                <p className="font-semibold text-gray-900 mb-2">
                  V případě zrušení ze strany pořadatele:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Vrátíme Vám 100% zaplacené částky</li>
                  <li>Nabídneme alternativní termín</li>
                  <li>Informujeme Vás minimálně 7 dní předem (pokud je to možné)</li>
                  <li>Peníze budou vráceny do 14 dnů od zrušení</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Přesunutí na jiný termín
              </h2>
              <p className="text-gray-700 mb-4">
                Pokud Vám nevyhovuje zvolený termín, můžete požádat o přesunutí na jiný běžící workshop:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Více než 14 dní před workshopem:</strong>{' '}
                  Přesun zdarma
                </li>
                <li>
                  <strong>Méně než 14 dní před workshopem:</strong>{' '}
                  Přesun možný s administrativním poplatkem 500 Kč
                </li>
                <li>Přesun je možný pouze pokud má nový termín volnou kapacitu</li>
                <li>Cenový rozdíl mezi workshopy je nutné doplatit nebo Vám bude vrácen</li>
              </ul>
            </section>

            <section className="mb-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Časté dotazy ke stornování
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Jak dlouho trvá vrácení peněz?
                  </h3>
                  <p className="text-gray-700">
                    Peníze budou vráceny na Váš účet do 7-14 pracovních dnů od potvrzení storna.
                    Platba bude vrácena na stejný účet, ze kterého byla provedena.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Co když onemocním těsně před workshopem?
                  </h3>
                  <p className="text-gray-700">
                    I v případě nemoci platí standardní stornovací podmínky. Doporučujeme však
                    kontaktovat nás - v některých případech můžeme najít individuální řešení
                    (přesun na jiný termín, náhradník).
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Mohu stornovat jen jednu osobu z párové registrace?
                  </h3>
                  <p className="text-gray-700">
                    Ano, můžete stornovat pouze jednu osobu. V takovém případě se platí rozdíl mezi
                    párovou a single cenou. Případný přeplatek Vám vrátíme podle stornovacích podmínek.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Jak poznám, že moje storno bylo přijato?
                  </h3>
                  <p className="text-gray-700">
                    Po obdržení Vašeho storna Vám do 24 hodin zašleme potvrzovací email s informacemi
                    o vrácení platby nebo dalších krocích.
                  </p>
                </div>
              </div>
            </section>

            <section className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Kontakt pro stornování
              </h2>
              <div className="bg-primary-50 rounded-lg p-6">
                <p className="text-gray-900 font-semibold mb-4">
                  Pro stornování nebo dotazy kontaktujte:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:kouc@martinfuks.cz" className="text-primary-600 hover:text-primary-700">
                      kouc@martinfuks.cz
                    </a>
                  </p>
                  <p>
                    <strong>Telefon:</strong>{' '}
                    <a href="tel:+420603551119" className="text-primary-600 hover:text-primary-700">
                      +420 603 551 119
                    </a>
                  </p>
                  <p className="text-sm text-gray-600 mt-4">
                    Odpovídáme během 24 hodin (v pracovní dny)
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-8 text-sm text-gray-600">
              <p>
                Poslední aktualizace: Leden 2026
              </p>
              <p className="mt-2">
                Tyto podmínky jsou součástí{' '}
                <a href="/obchodni-podminky" className="text-primary-600 hover:text-primary-700">
                  obchodních podmínek
                </a>
                {' '}workshopů Pět dohod.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
