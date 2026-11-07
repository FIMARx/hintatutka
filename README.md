<div align="center">

# ⚡ HintaTutka

**Suomen älykkäin reaaliaikainen hintatutka: Elektroniikka, Huonekalut, Ruoka, Urheilu, Apteekit, Tori.fi, Vinted & Huuto.net**  
*The ultimate real-time price comparison, unit-price analyzer (`€/kg`, `€/l`), price watchlist, bargaining advisor, S-Bonus calculator & second-hand overlay for 81 Finnish & EU online stores.*

[![Version](https://img.shields.io/badge/version-9.0-10b981?style=for-the-badge)](https://github.com/FIMARx/hintatutka)
[![Author](https://img.shields.io/badge/author-FIMARx-6366f1?style=for-the-badge)](https://github.com/FIMARx)
[![Install](https://img.shields.io/badge/Install-HintaTutka.user.js-f43f5e?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/FIMARx/hintatutka/main/HintaTutka.user.js)
[![Stores](https://img.shields.io/badge/stores-81%20supported-f59e0b?style=for-the-badge)](#)
[![Languages](https://img.shields.io/badge/FI%20%7C%20EN-supported-3b82f6?style=for-the-badge)](#)

</div>

---

## 🚀 Mikä on HintaTutka? / What is HintaTutka?

**HintaTutka** on Tampermonkey / Violentmonkey -lisäosa, joka tuo tyylikkään, lasimorfisen hintatutka-sivupaneelin suoraan **81 suomalaisen ja eurooppalaisen verkkokaupan** tuotesivuille.

Se kertoo välittömästi yhdellä silmäyksellä:
1. **Onko kaupan hinta oikeasti edullinen vai ylihintainen?** (🟢 Vihreä = Halvin, 🟡 Keltainen = OK, 🔴 Punainen = Kallis).
2. **Onko "halvin hinta" vain klubitarjous?** (`👑 HH PLUS`, `Klubihinta`, `MyPOWER`, `Asiakasomistaja`) — näyttää sekä klubihinnan että halvimman kaupan *ilman* jäsenyyttä.
3. **Miltä tuotteen hintahistoria näyttää?** Interaktiivinen SVG-hintakäyrä kaikkien aikojen alimmalla hinnalla (**ATL**) ja päivämäärätarkastelulla.
4. **Paljonko tuote maksaa käytettynä (Tori.fi, Vinted & Huuto.net)?** Yhdistetty markkinahaku, automaattinen tarvikesuodatus ja käytettyjen hintajakaumakäyrä.
5. **⭐ Hintavahti / Seurantalista**: Tallenna tuotteita seurantaan yhdellä klikkauksella ilman rekisteröitymistä.
6. **🤝 Tinkausapuri**: Ehdottaa automaattisesti reilua vastatarjousta käytetyn tuotteen myyjälle ja antaa valmiin kohteliaan tarjousviestin yhdellä kopioinnilla.
7. **💳 S-Bonus & K-Plussa -laskuri**: Laskee todellisen säästön ja tilille maksettavan bonuksen (jopa 5 % cashback Prisma/S-kaupoissa).
8. **Paljonko ruoka tai lemmikkitarvike maksaa kilolta tai litralta (`€/kg`, `€/l`)?** Laskee automaattisesti yksikköhinnat myös monipakkauksille.
9. **Kumpi malli kannattaa ostaa?** Laajennettava **2-sarakkeinen vertailutila (`⚔️ Vertaa`)** live-hakuehdotuksilla.

---

## ✨ Tärkeimmät ominaisuudet / Key Features

### 💎 1. Uudistettu, selkeä ja kompakti käyttöliittymä (Modern Tabbed GUI)
* **Täysikokoinen tuoteotsikko**: Tuotenimi saa oman täyden rivinsä ilman ahtaumaa tai katkeilua.
* **Modernit välilehdet (Segmented Tabs)**:
  * 🏪 **Kaupat**: Kauppojen hintavertailu toimituskuluineen ja saatavuustietoineen sekä täsmälinkit vertailupalveluihin.
  * ♻️ **Käytetyt**: Tori-, Vinted- ja Huuto.net -löydöt, suodattimet ja Tinkausapuri.
  * 📈 **Hintahistoria**: Interaktiivinen hintakäyrä (Uudet vs. Käytetyt), kaikkien aikojen alin hinta (ATL) ja hintatilastot.
* **Virtaviivaistettu yläpalkki**: Kaikki työkalut (`⭐ Hintavahti`, `🔔 Seuranta`, `⚔️ Rinnakkaisvertailu`, `📋 Jaa`, `↔ Puolenvaihto`, `FI/EN`, `✕ Sulje`) kätevinä ja yhtenäisinä pikakuvakkeina.
* **Ei enää loputonta skrollaamista**: Paneeli on siisti ja kompakti (~500 px korkea), ja jokainen välilehti rullaa itsenäisesti.

### 🎨 2. Suora hintavärjäys & arvio tuotesivulla (On-Page Price Verdict)
* Värjää kaupan oman hintatekstin suoraan sivulla:
  * 🟢 **Vihreä (`✓ EDULLINEN`)** — Markkinoiden halvin tai lähes halvin hinta.
  * 🟡 **Keltainen (`● OK HINTA`)** — Kohtuullinen hinta (`≤ 8.5 %` erolla).
  * 🔴 **Punainen (`⚠ KALLIS`)** — Selvästi kalliimpi kuin kilpailijoilla — näyttää tarkan euro- ja prosenttieron sekä halvimman kaupan nimen.
  * 👑 **Violetti/Kulta (`👑 KLUBITARJOUS`)** — Tunnistaa automaattisesti klubi- ja jäsenhinnat ja varoittaa, jos normaalihinta ilman klubia on kallis.

### ♻️ 2. Älykäs käytettyjen markkinahaku (Tori.fi, Vinted & Huuto.net)
* **Kolme kauppapaikkaa yhdessä näkymässä**: Hakee reaaliaikaisesti myynti-ilmoitukset **Tori.fi**:stä, **Vinted.fi**:stä ja **Huuto.net**:stä omilla tunnisteillaan (`🛡️ ToriDiili`, `🏷️ Vinted`, `🏷️ Huuto`).
* **Pikasuodattimet**: Rajaa tulokset yhdellä napautuksella vain haluamasi kauppapaikan kohteisiin.
* **Toimii suoraan Tori-, Vinted- ja Huuto-ilmoitussivuilla**: Analysoi heti, onko pyyntihinta **Hyvä löytö**, **OK käytetyn hinta** vai **Ylihintainen käytetyksi** verrattuna kauppojen uuteen hintaan!
* **🤝 Tinkausapuri**: Laskee markkinahintojen perusteella reilun vastatarjouksen ja tarjoaa valmiin viestipohjan myyjälle kopioitavaksi leikepöydälle yhdellä napautuksella.

### ⭐ 3. Hintavahti & Seurantalista (Price Watchlist)
* Tallenna mikä tahansa tuote seurantalistalle klikkaamalla yläpalkin **`⭐`**-kuvaketta.
* Näet yhdellä klikkauksella kaikki seuraamasi tuotteet, niiden tallennushinnat ja nykyiset halvimmat hinnat.
* Tyhjennä tai poista tuotteita suoraan kätevästä sivupaneelista.

### ↔ 4. Puolen vaihto (Dock Left / Right) & Jaa-raportti
* **↔ Vaihda puolta**: Siirrä paneeli yhdellä napautuksella vasempaan tai oikeaan reunaan, jos se peittää verkkokaupan ostoskoripainikkeen.
* **📋 Jaa**: Kopioi yhdellä klikkauksella selkeästi muotoiltu hintayhteenveto jaettavaksi ystäville tai foorumeille.

### 💳 5. S-Bonus & K-Plussa -säästölaskuri
* Prisma ja S-kaupat -sivustoilla näyttää automaattisesti arvioidun 5 % S-Bonuksen rahana ja tuotteen todellisen nettohinnan.
* K-Ruoka-sivustolla näyttää kertyvät Plussa-pisteet.

### 📈 6. Kaksi interaktiivista SVG-hintakäyrää (`📈 Uutena` & `♻️ Käytettynä`)
* **📈 Uutena**: Kuukausittainen hintahistoria, kaikkien aikojen alin hinta (**ATL**) ja nykyhinnan vertailu.
* **♻️ Käytettynä**: Reaaliaikainen käytettyjen hintajakauma (halvin, keskiarvo, mediaani). Pisteitä klikkaamalla avaat ilmoituksen uuteen välilehteen (Tori = punainen, Vinted = turkoosi, Huuto = keltainen).

### ⚔️ 7. Rinnakkaisvertailu (`⚔️ Vertaa`) & Live-hakuehdotukset
* 2-sarakkeinen rinnakkaisvertailu edellisten ja seuraavien sukupolvien vertailuun.
* Live Autocomplete -hakuehdotukset pudotusvalikossa reaaliaikaisilla hinnoilla.

---

## 🏪 Tuetut kaupat / Supported Stores (81)

HintaTutka toimii automaattisesti kaikilla kielipoluilla (`/fi/`, `/en/`, `/sv/`) ja SPA-sivustoilla:

| Kategoria | Kaupat |
| :--- | :--- |
| **Kodinkoneet & Elektroniikka** | Verkkokauppa.com, Gigantti, Power, Veikon Kone, Euronics, HobbyHall, Bigbox |
| **PC-komponentit & Pelaaminen** | Jimm's, Proshop, Datatronic, Multitronic, Tietokonekauppa.fi, Data-Systems, Komponenttikauppa.fi, Cruzbroker, MaxGaming, VPD Pelikauppa, Puolenkuun Pelit, Kasuplan, Mikromafia, TeraStore, DigiDreamer, CS Megastore |
| **Kunnostetut laitteet (Refurbished)** | **Swappie**, **Taitonetti**, **Fonum** |
| **Urheilu & Ulkoilu** | **XXL**, **Intersport**, **Budget Sport**, **Varuste.net**, **Scandinavian Outdoor**, **Stadium**, **Partioaitta**, **Haglöfs** |
| **Hintavertailupalvelut** | **Hinta.fi**, **Hintaseuranta.fi** |
| **Apteekit & Kauneus** | **Yliopiston Apteekki (ya.fi)**, **Lyko**, **Kicks** |
| **Lemmikkitarvikkeet & Ruoka** | **Musti ja Mirri**, **Zooplus**, **Peten Koiratarvike** |
| **Kirjat & Toimisto** | **Adlibris**, **Suomalainen Kirjakauppa** |
| **Ruoka & Päivittäistavarat** | **S-kaupat.fi** *(Prisma, S-market, Alepa, Sale)*, **K-Ruoka.fi** *(K-Citymarket, K-Supermarket, K-Market)*, **Fiksuruoka**, **Matsmart**, **Ruohonjuuri**, **Tokmanni**, **Puuilo** |
| **Huonekalut, Sisustus & Koti** | **IKEA**, **JYSK**, **Sotka**, **Asko**, **Masku**, **Isku**, **Veke**, **Finnish Design Shop**, **Stockmann**, **Rusta**, **Clas Ohlson** |
| **Rauta, Remontointi & Autoilu** | **K-Rauta**, **Taloon.com**, **Netrauta**, **Bauhaus**, **Motonet**, **Biltema**, Prisma, Kärkkäinen, Amazon.de, Dustin / DustinHome, e-ville, SatShop, Jula |
| **Operaattorit** | Elisa, Telia, DNA |
| **Käytetyt (Vertaiskauppa)** | **Tori.fi**, **Vinted.fi**, **Huuto.net** *(sekä kauppojen tuotesivuilla että suoraan kohteiden sivuilla)* |

---

## 🛠️ Asennus / Installation

### Vaihtoehto A: Tampermonkey / Violentmonkey Userscript (Nopein / Fastest)
1. Asenna selaimeesi käyttäjäskriptien hallintalisäosa:
   * [**Tampermonkey**](https://www.tampermonkey.net/) (Chrome, Edge, Brave, Firefox, Safari) tai
   * [**Violentmonkey**](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)
2. Klikkaa alla olevaa asennuslinkkiä:
   * 👉 **[Asenna HintaTutka (`HintaTutka.user.js`)](https://raw.githubusercontent.com/FIMARx/hintatutka/main/HintaTutka.user.js)**
3. Vahvista asennus klikkaamalla **Install / Asenna**.
4. Avaa mikä tahansa tuotesivu — **HintaTutka** avautuu automaattisesti reunaan!

### Vaihtoehto B: Natiivi Manifest V3 -selainlaajennus (`extension-mv3/`)
Natiivi MV3-selainlaajennus siirtää kaikki verkkohaut erilliseen taustasäikeeseen (`background.js` Service Worker) ja jakaa välimuistin sekä Hintavahdin kaikkien 81 verkkokaupan kesken:
1. Avaa Chrome / Edge / Brave -selaimessa osoite `chrome://extensions/`.
2. Kytke oikeasta yläkulmasta päälle **Developer mode / Kehittäjätila**.
3. Klikkaa **Load unpacked / Lataa pakkaamaton** ja valitse kansioksi repositorion `extension-mv3/`-kansio.

### Vaihtoehto C (Valinnainen): Oma Cloudflare Worker Serverless Edge Proxy (`cloudflare-worker/`)
Jos haluat piilottaa oman IP-osoitteesi kokonaan verkkokauppojen palomuureilta ja jakaa 15 minuutin reunavälimuistin (`caches.default`):
1. Siirry kansioon `cloudflare-worker/` ja aja `npx wrangler deploy`.
2. Aseta saamasi `https://hintatutka-proxy.<tili>.workers.dev` -osoite joko MV3-laajennuksen yläpalkkikuvakkeesta tai Tampermonkeyn valikosta (`☁️ HintaTutka: Serverless Proxy URL`).

---

## 🗺️ Kehityssuunnitelma & Versiohistoria / Roadmap & Changelog

### 🚀 v9.0 Päivitys (Uusin / Latest)
- 🇪🇺 **EU / Saksa "Suomi-lisä" -laskuri & Cross-Border -hintavertailu (`Amazon.de` + EU-hubit)**:
  - Hakee automaattisesti tuotteen hinnan suoraan **Amazon.de**:stä EAN-viivakoodilla tai mallikoodilla ja laskee tarkan Suomeen toimitetun kokonaishinnan: **`[Saksan 19 % MwSt -hinta × (1,255 / 1,19)] + [Suomi-toimitus: 0 € yli 99 € tilauksille, muuten 10,49 €]`** (kirjoille `14 % / 7 %`).
  - Paljastaa yhdellä silmäyksellä Suomen maantieteellisen hintalisän (*"SÄÄSTÄ -XX € vs. Suomi"*) sekä tarjoaa 1-klikkauksen pikapainikkeet **Amazon.de**, **Geizhals.eu** ja **Idealo.de** -hintavertailuihin.
- 🔥 **Arbitraasi- & Flip-moottori (`Tori.fi`, `Vinted` & `Huuto.net`)**:
  - Tunnistaa käytettyjen markkinoilta rajusti alihinnoitellut yksityishenkilöiden ilmoitukset suhteessa käytettyjen mediaaniin ja kaupan uuteen hintaan (huomioiden ~5 % / min `8 €` toimitus- ja ostajaturvakulut).
  - Merkitsee jälleenmyynti- ja huippulöydöt **`🔥 FLIP +XX €`** -tunnisteella sekä kauppojen tuotesivuilla että suoraan Tori-, Vinted- ja Huuto-ilmoitussivuilla.
- 🎭 **Klubihintojen Totuusmittari (`🏆 Aito Klubipohja` vs. `🎭 Näennäisale`)**:
  - Auditoi kanta-asiakashinnat (`MyPOWER`, `Klubihinta`, `HH PLUS`, `Asiakasomistaja`) suoraan halvinta ei-klubikauppaa ja historiallista hintapohjaa (**ATL**) vasten.
  - Paljastaa armotta **`🎭 NÄENNÄISALE`**-tilanteet (joissa kilpailija myy tuotetta *ilman* jäsenyyttä samaan tai halvempaan hintaan) sekä **`⚠️ KOROTETTU NORMAALIHINTA`** -ankkuroinnin, ja palkitsee aidot markkinapohjat **`🏆 AITO KLUBIPOHJA`** -merkillä.
- 🔮 **Ennustava Hinta-analytiikka & Suomen Alekalenteri (`OSTA NYT` vs. `ODOTA X PV`)**:
  - Yhdistää historiallisen vaihteluvälin, 6 jakson lineaarisen regressiotrendin (`📉 Laskeva`, `📈 Nouseva`, `➡️ Vakaa`) ja suomalaisen kaupankäynnin kausikalenterin (*Tammiale, Kevään & Syksyn Hullut Päivät, Juhannus-/Kesäale, Back to School, Singles' Day 11.11., Black Week / Black Friday, Välipäiväale*) antaen suoran suosituksen ostohetkestä.
- ☁️ **Erotettu Serverless Edge Proxy (`cloudflare-worker/`)**:
  - Valmis Cloudflare Worker -reunapalvelin tiukalla domain-sallintalistalla, 15 minuutin jaetulla reunavälimuistilla (`caches.default`), IP-suojauksella ja automaattisella varayhteydellä (`gmFetch` fallback).
- 🧩 **Natiivi Manifest V3 -selainlaajennus (`extension-mv3/`)**:
  - Täydellinen Chrome / Edge / Brave MV3 -laajennuspaketti taustasäikeen Service Worker -hauilla (`background.js`), jaetulla `chrome.storage.local` -välimuistilla ja työkalupalkin hallintaikkunalla (`popup.html`).

### 🛡️ v8.1
- 🚦 **Cloudflare- & Rate-Limit -suojakilpi, taustavälilehtitauko & jaettu GM-välimuisti**:
  - **Taustavälilehtien älytauko (`visibilityState`)**: Jos avaat kymmeniä tuotelinkkejä kerralla taustavälilehtiin, HintaTutka odottaa kunnes oikeasti avaat välilehden — **0 rinnakkaista verkkopyyntöpiikkiä**.
  - **Kauppojen välinen jaettu L1/L2 GM-välimuisti**: Sama tuote Verkkokaupassa, Gigantissa, Powerissa ja Jimm'sissä haetaan verkon yli vain kerran ja latautuu muilla sivuilla `0 ms` viiveellä suoraan jaetusta välimuistista.
  - **Globaali pyyntöjen tahdistus, satunnaisviive (Jitter) & automaattinen Circuit Breaker**: Tahdistaa saman palvelimen pyynnöt välilehtien välillä ja kytkee automaattisen jäähyn (`429` / Cloudflare Turnstile), jolloin IP-osoitettasi ei pommiteta lukkoon.
  - **On-Demand Stage-2 haku suljettuna**: Kun sivupaneeli on pienennettynä reunaan ja Hinta.fi löytää jo vahvistetut kaupat, käytettyjen markkinapaikkojen lisähaut ajetaan vasta kun avaat paneelin (vähentää taustaliikennettä jopa ~85 %).
- ⚡ **0-CLS hintamerkintä, `requestIdleCallback` & kevyt suljettu tila**:
  - **Ei sivun pomppimista (Zero Late CLS)**: Varaa kiinteän `27 px` tilan (`contain: layout style`) heti hinnan tunnistushetkellä ja päivittää tekstin paikallaan ilman "Lisää ostoskoriin" -painikkeen myöhäistä siirtymistä.
  - **Kevyt reuna-pilleri & laiska SVG-käyrän piirto**: Suljettuna paneeli renderöi vain kevyen reunapillerin ilman 300+ piilotettua DOM-elementtiä tai raskasta taustasumennusta, ja SVG-hintakäyrät lasketaan vasta `📈 Hintahistoria` -välilehdellä.
- 🔧 **Etäpäivitettävä selektorirekisteri (`selectors.json`) & geometriavahti**:
  - **Hot-Patch ilman uudelleenasennusta**: Hakee kevyen `selectors.json`-konfiguraation GitHubista 12 tunnin välein taustalla, jolloin mahdolliset verkkokauppojen ulkoasu-uudistukset korjaantuvat käyttäjille automaattisesti ilman skriptin uudelleenasennusta.
  - **Itsetarkistava geometriavahti (`insertBadgeWithGeometryGuard`)**: Tarkistaa hintalaatikon leveyden ja `overflow: hidden` -rajaukset ennen ja jälkeen lisäyksen estäen kapeiden hintarivien venymisen.

### 🌟 v8.0
- 🔍 **Täysin uudistettu haku- ja täsmäytysmoottori (Next-Gen Search & Matching Engine)**:
  - **GS1 Mod-10 -viivakooditarkistus & monilähde-EAN-kaivu**: Kaivaa EAN/GTIN/UPC-viivakoodit aina riippumatta MPN-koodista (JSON-LD, DOM-mikrodata, tekniset taulukot ja `__NEXT_DATA__`) ja tarkistaa aidon GS1-tarkistussumman estäen kaupan sisäisten tuotenumeroiden sekoittumisen viivakoodeihin.
  - **Monikielinen FI/EN/SV-synonyymisanakirja & rakennetietotarkistus**: Yhdistää suomen-, englannin- ja ruotsinkieliset tuotenimet saumattomasti (esim. `air purifier` ↔ `ilmanpuhdistin`, `electric toothbrush` ↔ `sähköhammasharja`) ja estää väärien varianttien sekoittumisen (`128GB` vs `256GB`, `55"` vs `65"`, yksittäistuote vs `2-pack`/`4-pack` sekä `+`-kombotuotepaketit).
  - **Suora Hintaseuranta.fi-hintapoiminta & korjattu Huuto.net API**: Hakee nyt automaattisesti kauppojen hinnat myös suoraan **Hintaseuranta.fi**:stä täydennyksenä (erityisesti urheilu-, vaate- ja kodintuotteille) sekä korjaa **Huuto.net**-rajapintahaun reaaliaikaiset osumat.
- 💶 **Tarkempi hinnanluku & reilumpi hintatuomio (Precision Price & Verdict Engine)**:
  - **Jaettujen senttien (Split-Cent) tuki**: Lukee täsmällisesti yläindeksiin tai erillisiin flex-elementteihin jaetut sentit (esim. Powerin `270` + `30` → `270,30 €` ja IKEAn erotellut desimaalit).
  - **ALV 0% / verottomien ja ehdollisten hintojen suodatus**: Ohittaa automaattisesti yritysmyynnin verottomat hinnat (`Hinta ilman ALV`, `ALV 0%`, `Excl. VAT`, `veroton`), vaihtohyvitykset ja liittymäasiakashinnat sekoittamatta niitä kuluttajahintaan.
  - **Tukey IQR -poikkeamasuodatus käytetyille & reilu toimitusvertailu**: Suodattaa Tori/Vinted/Huuto-tilastoista pois `1 €` "tarjoa"-haamuilmoitukset sekä ylihintaiset ääriarvot, yhdistää tuplakauppanimet (`normalizeStoreIdentity`) ja huomioi myös nykyisen kaupan toimituskulun kun `🚚 +Toimitus` on valittuna.
- ⚡ **2-vaiheinen progressiivinen renderöinti & kevennetty SPA-ydin (Core Engine v8.0)**:
  - **Välitön ensivaiheen piirto**: Näyttää Hinta.fi-tulokset välittömästi (~300 ms) ja täydentää suorat kauppatarkistukset, Hintaseurannan ja käytettyjen markkinat rinnakkain taustalla säilyttäen hakukentän fokuksen ja skrollauskohdan.
  - **Pyyntöjen yhdistäminen, LRU-välimuisti & nollakuorman SPA-seuranta**: Yhdistää päällekkäiset verkkopyynnöt (`inFlightRequests`), vapauttaa automaattisesti vanhimmat välimuistimerkinnät tilan täyttyessä ja korvaa raskaan koko sivun `MutationObserver`-tarkkailun kevyillä `History API` -koukuilla.

### 🌟 v7.8
- 🔗 **Korjattu Hintaseuranta.fi ja Hintaopas.fi -hakureititys**:
  - **Hintaseuranta.fi**: Siirrytty palvelimen vaatimaan polkupohjaiseen `/haku/{hakusana}` -muotoon aiemman `?q=` -parametrin sijasta. Tämä korjaa virheen, jossa haku ohjautui virhesivulle *"Hakusana puuttuu"*.
  - **Hintaopas.fi**: Korjattu hakuparametri muotoon `/search?query={hakusana}` vanhentuneen `search?search=` -polun sijasta, jolloin haku ei enää päädy *"Virhe 404: Tämä sivu ei ole enää käytössä"* -ilmoitukseen.
- 🔘 **Harmaannetut toissijaiset & varmistamattomat vertailupainikkeet (Dimmed / Grey Buttons)**:
  - Kun Hinta.fi löytää tuotteen (kuten `Hinta.fi (3) ↗`), se korostuu kirkkaan vihreänä vahvistettujen hintojen ensisijaisena lähteenä.
  - Toissijaiset ja varmistamattomat vertailulinkit (`Hintaseuranta ↗`, `Hintaopas ↗`) esitetään tyylikkäästi himmennettynä lasinharmaalla (`.is-secondary`), jolloin käyttäjä erottaa heti varmistetut tulokset kokeiltavista hakuvaihtoehdoista.
  - Jos Hinta.fi:stä ei löydy tuotetta (`Hinta.fi (0)`), painike harmaannetaan (`.is-zero`), jolloin huomio siirtyy luontevasti vaihtoehtoisiin vertailupalveluihin.

### 🌟 v7.7
- 🧠 **Itseoppiva Hakumuisti (Adaptive Self-Learning Search Memory Brain)**:
  - **Oppii käyttäjän tekemistä hauista & valinnoista**: Kun käyttäjä tarkentaa hakua alareunan hakukentästä, valitsee tuotteen vaihtoehtolistasta tai klikkaa live-autocompleten ehdotusta, HintaTutka **tallentaa ja oppii** kyseisen tuotesivun URL:in, EAN-viivakoodin ja nimen vastaavuuden suoraan valittuun Hinta.fi-tuotteeseen.
  - **Välitön täsmäosuma jatkossa ilman arvailua**: Kun samaa tuotetta selataan uudelleen tai sama EAN/malli tulee vastaan missä tahansa kaupassa, HintaTutka lataa opitun tuotteen heti ja asettaa sen ykkösprioriteetiksi.
  - **Tyylikäs indikaattori (`🧠 Opittu osuma`)**: Yläpalkissa näkyy hienovarainen lila `🧠 Opittu osuma` -tunniste aina kun tulos perustuu aiemmin opittuun tietoon.
  - **Helppo unohdus / nollaus (`✕`)**: Jos opittu osuma halutaan unohtaa tai vaihtaa, tunnisteen vieressä olevalla `✕`-painikkeella opitun muistin voi nollata yhdellä klikkauksella.
  - **Kauppojen välinen mallialias-oppiminen (Cross-Store Model Aliases)**: Jos pitkä kauppanimi yhdistetään mallikoodiin (esim. pitkä Philips Sonicare -tuotenimi -> `HX3886/43`), skripti oppii mallialiaan ja soveltaa sitä automaattisesti muissa verkkokaupoissa.

### 🌟 v7.6
- 🧠 **Älykäs monivaiheinen mallikoodi- ja brändihaku (Smart Multi-Tier Matcher)**:
  - **Tunnistaa erikoismerkeillä varustetut mallikoodit**: Koodintunnistus tukee nyt vinoviivoja, yhdysmerkkejä ja useampiosaisia sarjakoodeja (esim. `HX3886/43`, `WH-1000XM5`, `R18ALF-0`, `SM-S928B/DS`, `6055022C5`) ja tuottaa automaattisesti myös kantamallikoodit (`HX3886`).
  - **Monivaiheinen kyselypino**: Vaikka Hinta.fi ei tuntisi verkkokaupan EAN-viivakoodia, HintaTutka hakee välittömästi yhdistelmillä `[Brändi] [Mallikoodi]` (esim. `Philips HX3886/43` ja `Philips HX3886`) sekä mallisarjoilla.
  - **Täysin korjattu hakutulosten pisteytys (`scoreSearchCandidate`)**:
    - Korjattu virhe, jossa kaupan pitkä 15 sanan kuvaileva myynti-ilmoitus (esim. *"Philips Sonicare 9000 Diamond Clean electric toothbrush + 3000 Power flosser..."*) sai algoritmin hylkäämään Hinta.fi:n tarkan ja tiiviin tietokantanikkeen (*"Philips HX3886/43"*) liian pienen sanamääräsuhteen ja numeropoikkeamien vuoksi.
    - Tarkka mallikoodi saa nyt automaattisesti erittäin korkeat prioriteettipisteet (+90 p), eikä sitä hylätä markkinointisanojen puuttumisen takia.
  - **Siistityt pikalinkit & hakukenttä**:
    - Hakukentässä ja vertailupalveluiden pikalinkeissä (`[ Hinta.fi ↗ ]`, `[ Hintaseuranta ↗ ]`, `[ Hintaopas ↗ ]`) ei enää näytetä tai haeta paljaalla 13-numeroisella viivakoodilla, vaan aina selkeällä ja vertailupalveluissa suoraan toimivalla mallinimellä (kuten `Philips HX3886/43`).

### 🌟 v7.5
- 🎯 **Tyylikäs ja siisti hintamerkintöjen kohdistus (Verkkokauppa.com, Gigantti ym.)**:
  - **Ei enää rivinsisäistä leveyden venymistä**: Verkkokauppa.comissa ja vastaavissa kaupoissa hintamerkintä (`ufhpc-inline-price-badge-wrapper`) ankkuroidaan ulompaan hintalohkoon täydellä 100 % leveydellä omalle siistille rivilleen, jolloin se ei enää tunge epäsiististi hintanumeroiden viereen vaakasuunnassa.
  - **Ei enää osamaksuelementtien tai painikkeiden peittymistä**: Gigantissa ja vastaavissa kaupoissa hintamerkintä sijoittuu hintasäiliön alapuolelle normaaliin sivuvirtaukseen (DOM-flow), jolloin alapuolella olevat rahoitus- ja osamaksuboksit (kuten Resurs Bank) siirtyvät kauniisti alaspäin ilman päällekkäisyyttä.
  - **Miellyttävämpi ja ammattimaisempi typografia**: Poistettu huutavat suuraakkoset (`KALLIS!`, `HALVIN HINTA MARKKINOILLA`) ja hintojen turha toisto heti sivun oman hinnan perään. Tilalla on tasapainoinen lausekoko (esim. `✓ Markkinoiden halvin hinta` ja `⚠ Kalliimpi: +39,09 € (+26.3%) • Halvin: 148,90 € (Gigantti)`).
  - **Kaikkien kauppojen suojaus**: Älykäs `findBestPriceAnchor`-apufunktio varmistaa ihanteellisen sijoittelun kaikissa 81 tuetussa verkkokaupassa.

### 🌟 v7.4
- 💎 **Täysin uudistettu moderni ulkoasu (Modern Obsidian Glassmorphism UI)**:
  - Uudelleenmuotoiltu, ylellinen tumma lasimorfia (`backdrop-filter: blur(28px)`), jossa valo heijastuu pehmeästi paneelin reunoilta ja tilakohtainen hehku (`emerald`, `rose`, `amber`, `purple`) ympäröi elementtejä.
  - Laajennettu ja ilmava asettelu (leveys kasvatettu 396 px / 760 px) ja tarkempi fonttipino subpixel-antialiasingilla.
  - Virtaviivaistetut mittarikortit, pyöristetyt segmentoidut navigointivälilehdet (iOS/Raycast-tyyli) ja pehmeästi animoidut kaupparivit.
  - Alapalkin hakupainikkeissa tyhjät kohteet (`0 kpl`) himmennetään automaattisesti, jolloin aktiiviset löydöt (kuten `Tori (2)`) nousevat heti esille.
- 🔄 **Saumaton päivityskulku & automaattinen uudelleenlataustunnistus (Update & Reload Flow)**:
  - Kun käyttäjä klikkaa päivityspainiketta, HintaTutka siirtyy aktiiviseen asennustilaan ja näyttää bannerissa sykkivän `[↻ Lataa sivu uudelleen]` -toimintopainikkeen.
  - Skripti kuuntelee selaimen `focus`-tapahtumaa: heti kun käyttäjä palaa Tampermonkeyn asennusvälilehdeltä kaupan sivulle, HintaTutka herää ja kehottaa viimeistelemään päivityksen sivulatauksella.
  - Sivun latauduttua skripti havaitsee uuden version ja esittää juhlavan vihreän onnistumisilmoituksen: `"✨ HintaTutka päivitetty onnistuneesti versioon v7.4!"`.
- 🐛 **Käytettyjen sivujen vakauskorjaus**: Korjattu muuttujien alustusjärjestys (`bargainHtml`), jotta Tinkausapuri toimii virheettömästi kaikilla käytettyjen tavaroiden sivustoilla.

### 🌟 v7.3
- 🏷️ **Välilehtipohjainen kompakti käyttöliittymä (Segmented Tabs)**: Tuotu Kaupat, Käytetyt ja Hintahistoria omiin selkeisiin välilehtiinsä, jolloin paneelin korkeus pysyy miellyttävänä ilman ylipitkää skrollausta.

### 🌟 v7.2
- 🏷️ **Automaattinen brändintunnistus & yhdistäminen (XXL, Intersport ym.)**: Korjattu tilanne, jossa XXL:n ja urheilukauppojen tuotteista puuttui brändinimi (esim. Haglöfs) H1-otsikon yläpuolella olevan logon vuoksi. Skripti tunnistaa nyt brändin Schema.orgista, metatiedoista tai otsikkolinkeistä ja liittää sen aina tuotenimeen, jolloin haut kilpailijoilla ja käytettyjen sivustoilla löytävät tarkan tuotteen välittömästi.
- ⚡ **Hintaseuranta.fi & Hintaopas.fi -pikahaut**: Lisätty suorat pikahakupainikkeet Hintaseuranta.fi:hin ja Hintaopas.fi:hin, jotta erityisesti urheilu-, ulkoilu- ja vaatetuotteiden vertailu onnistuu yhdellä klikkauksella. Lisäksi Hintaseuranta.fi on lisätty suoraan tuettujen sivujen listalle.
- 🏃 **Uudet tuetut kaupat (Yhteensä 81 kauppaa)**: Mukana nyt **Budget Sport**, **Haglöfs**, **Partioaitta** ja **Hintaseuranta.fi** suoralla hintatutkatuella ja pikapainikkeilla.

### 🌟 v7.1
- 💶 **Vinted-valuuttakorjaus**: Korjattu bugi, jossa Vintedin eri maiden myyjien paikallisvaluutat (PLN, SEK, DKK, CZK) näkyivät virheellisesti euroina. Skripti ohittaa nyt ulkomaan valuutan Schema-tiedot ja lukee aina suomalaiselle ostajalle lasketun tarkan EUR-hinnan suoraan sivulta.
- 🎯 **Käytettyjen hintatuomio ilman kauppahintaa**: Kun tuotteelle ei löydy uutta kauppahintaa Hinta.fi:stä (esim. vaatteet, Zara, Shein, vintage), inline-hintatuomio vertaa hintaa käytettyjen markkinoiden **mediaaniin** eikä koskaan näytä rikkinäistä `Uutena kaupasta takuulla: — (Hinta.fi)`.
- 👗 **Vaatteiden ja samankaltaisten kohteiden tuki**: Lisätty `-X% vs. tämä sivu` -säästövertailu toisiin käytettyihin sekä selkeä `Samankaltaiset & vastaavat` -merkintä, jotta ostaja löytää vaivattomasti samantyyppiset ja saman brändin käytetyt vaatteet.

### 🌟 v7.0
- [x] Reaaliaikainen Hinta.fi-hintavertailu & SVG-hintahistoriakäyrä
- [x] Tori.fi-, Vinted- ja Huuto.net -käytettyjen markkinahaku, hintajakaumakäyrä & suora sivutuki
- [x] 2-sarakkeinen mallivertailu (`⚔️ Vertaa`) & Live Autocomplete -hakuehdotukset
- [x] Klubitarjousten (`👑 HH PLUS`, `Klubihinta`, `MyPOWER`, `Asiakasomistaja`) tunnistus ja erottelu normaalihinnoista
- [x] Laajennus ruokaan (yksikköhinnat `€/kg`, `€/l`), huonekaluihin, urheiluun, apteekkeihin, kirjoihin ja lemmikkitarvikkeisiin (77 kauppaa)
- [x] ⭐ Hintavahti & Seurantalista (Price Watchlist)
- [x] 🤝 Tinkausapuri käytettyjen ilmoitussivuilla (Bargaining Advisor)
- [x] 💳 S-Bonus & K-Plussa -laskuri
- [x] ↔ Paneelin puolen vaihto (Dock Left / Right) & 📋 Jaa hintaraportti
- [x] Automaattinen GitHub-päivitystarkistus (`@updateURL` + sisäänrakennettu ilmoitusbanneri)

---

## 📄 Lisenssi / License

Julkaistu **MIT**-lisenssillä. Tekijä: [**FIMARx**](https://github.com/FIMARx).
