<div align="center">

# ⚡ HintaTutka

**Suomen älykkäin reaaliaikainen hintatutka: Elektroniikka, Huonekalut, Ruoka, Urheilu, Apteekit, Tori.fi, Vinted & Huuto.net**  
*The ultimate real-time price comparison, unit-price analyzer (`€/kg`, `€/l`), price watchlist, bargaining advisor, S-Bonus calculator & second-hand overlay for 81 Finnish & EU online stores.*

[![Version](https://img.shields.io/badge/version-7.3-10b981?style=for-the-badge)](https://github.com/FIMARx/hintatutka)
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

1. Asenna selaimeesi käyttäjäskriptien hallintalisäosa:
   * [**Tampermonkey**](https://www.tampermonkey.net/) (Chrome, Edge, Brave, Firefox, Safari) tai
   * [**Violentmonkey**](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)
2. Klikkaa alla olevaa asennuslinkkiä:
   * 👉 **[Asenna HintaTutka (`HintaTutka.user.js`)](https://raw.githubusercontent.com/FIMARx/hintatutka/main/HintaTutka.user.js)**
3. Vahvista asennus klikkaamalla **Install / Asenna**.
4. Avaa mikä tahansa tuotesivu — **HintaTutka** avautuu automaattisesti reunaan!

---

## 🗺️ Kehityssuunnitelma & Versiohistoria / Roadmap & Changelog

### 🚀 v7.2 Päivitys (Uusin / Latest)
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
