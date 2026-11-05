<div align="center">

# ⚡ HintaTutka

**Suomen älykkäin reaaliaikainen hintatutka, hintahistoria-analyysaattori & Tori.fi-markkinavertailija**  
*The ultimate real-time price comparison, price history chart & Tori.fi used market overlay for 33 Finnish & EU online stores.*

[![Version](https://img.shields.io/badge/version-5.7-10b981?style=for-the-badge)](https://github.com/FIMARx/hintatutka)
[![Author](https://img.shields.io/badge/author-FIMARx-6366f1?style=for-the-badge)](https://github.com/FIMARx)
[![Install](https://img.shields.io/badge/Install-HintaTutka.user.js-f43f5e?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/FIMARx/hintatutka/main/HintaTutka.user.js)
[![Languages](https://img.shields.io/badge/FI%20%7C%20EN-supported-3b82f6?style=for-the-badge)](#)

</div>

---

## 🚀 Mikä on HintaTutka? / What is HintaTutka?

**HintaTutka** on Tampermonkey / Violentmonkey -lisäosa, joka tuo tyylikkään, lasimorfisen hintatutka-sivupaneelin suoraan **33 suomalaisen ja eurooppalaisen verkkokaupan** (sekä **Tori.fi**:n) tuotesivuille.

Se kertoo välittömästi yhdellä silmäyksellä:
1. **Onko kaupan hinta oikeasti edullinen vai ylihintainen?** (Vihreä = Halvin/Edullinen, Keltainen = OK, Punainen = Kallis).
2. **Onko "halvin hinta" vain klubitarjous?** (`👑 HH PLUS`, `Klubihinta`, `MyPOWER`, `Jäsenhinta`) — näyttää sekä klubihinnan, normaalihinnan että halvimman kaupan *ilman* klubijäsenyyttä.
3. **Miltä tuotteen hintahistoria näyttää?** Interaktiivinen SVG-hintakäyrä kaikkien aikojen alimmalla hinnalla (**ATL**) sekä hiiren kohdistimella toimivalla päivämäärä- ja kauppatarkastelulla.
4. **Paljonko sama tuote maksaa käytettynä Tori.fi:ssä?** Hakee automaattisesti täsmälleen saman mallin myynti-ilmoitukset Tori.fi:stä, suodattaa pois kuoret/varaosat/Osto-ilmoitukset ja piirtää käytettyjen hintajakaumakäyrän.
5. **Kumpi sukupolvi kannattaa ostaa?** Laajennettava **2-sarakkeinen vertailutila (`⚔️ Vertaa`)**, jolla vertaat kahta mallia (esim. *DJI Mini 5 Pro* vs. *DJI Mini 4 Pro* tai *RTX 5080* vs. *RTX 4080 Super*) rinnakkain sekä uutena että käytettynä!

---

## ✨ Tärkeimmät ominaisuudet / Key Features

### 🎨 1. Suora hintavärjäys & arvio tuotesivulla (On-Page Price Verdict)
* Värjää kaupan oman hintatekstin suoraan sivulla:
  * 🟢 **Vihreä (`✓ EDULLINEN`)** — Markkinoiden halvin tai lähes halvin hinta (`≤ 2.5 %` tai `≤ 3 €` erolla).
  * 🟡 **Keltainen (`● OK HINTA`)** — Kohtuullinen hinta (`≤ 8.5 %` kalliimpi kuin halvin).
  * 🔴 **Punainen (`⚠ KALLIS`)** — Selvästi kalliimpi kuin kilpailijoilla — näyttää tarkan euro- ja prosenttieron sekä halvimman kaupan nimen.
  * 👑 **Violetti/Kulta (`👑 KLUBITARJOUS`)** — Tunnistaa automaattisesti klubi- ja jäsenhinnat (esim. *HobbyHall HH PLUS*, *Gigantti-klubi*, *MyPOWER*, *Asiakasomistajahinta*) ja varoittaa, jos normaalihinta ilman klubia on kallis.

### 📈 2. Kaksi interaktiivista SVG-hintakäyrää (`📈 Uutena` & `♻️ Tori.fi`)
* **📈 Uutena (Hinta.fi-hintahistoria)**:
  * Näyttää hintakehityksen kuukausittain, kaikkien aikojen halvimman hinnan (**ATL**) vihreällä pisteellä sekä nykyisen sivun hintatason katkoviivalla.
  * Vie hiiri käyrän päälle nähdäksesi tarkan ajankohdan ja sen hetken halvimmat kaupat.
* **♻️ Tori.fi (Käytettyjen markkinahintakäyrä)**:
  * Laskee reaaliaikaisesti Tori.fi-ilmoitusten **halvimman hinnan**, **keskiarvon** ja **mediaanin**.
  * Klikkaa mitä tahansa pistettä käyrällä avataksesi kyseisen Tori-ilmoituksen suoraan uuteen välilehteen.

### ♻️ 3. Älykäs Tori.fi-käytettyjen haku & Tori.fi-sivutuki
* **Tarkka mallitunnistus**: Erottaa mallisukupolvet ja -tasot (esim. *DJI Mini 5 Pro* vs. *DJI Mini 4 Pro* tai *iPhone 16 Pro* vs. *iPhone 16*), normalisoi myyjien käänteiset otsikot (esim. *"DJI Mini Pro 4"* → *"DJI Mini 4 Pro"*) ja suodattaa automaattisesti pois suojakuoret, panssarilasit, laturit, ND-suotimet, rikkinäiset laitteet ja *Ostetaan*-ilmoitukset.
* **🛡️ ToriDiili-suodatin**: Suodata yhdellä klikkauksella vain ToriDiili-ostoturvalla ja toimituksella varustetut ilmoitukset.
* **Toimii myös suoraan Tori.fi-ilmoitussivuilla**: Kun avaat minkä tahansa Tori.fi-myynti-ilmoituksen, HintaTutka kertoo heti, onko pyyntihinta **Hyvä löytö**, **OK (tinkivaraa)** vai **Ylihintainen käytetyksi** verrattuna kaupan uuteen takuulliseen tuotteeseen!

### ⚔️ 4. Rinnakkaisvertailu (`⚔️ Vertaa`) & Live-hakuehdotukset
* Klikkaa yläpalkin **`⚔️ Vertaa`** -painiketta laajentaaksesi paneelin 2-sarakkeiseksi vertailunäkymäksi (`358px` ↔ `700px`).
* **Automaattiset sukupolviehdotukset**: Ehdottaa automaattisesti edellistä/seuraavaa mallisukupolvea yhdellä klikkauksella (esim. `⚡ DJI Mini 4 Pro`, `⚡ DJI Mini 3 Pro`).
* **Live Autocomplete -haku**: Kun alat kirjoittaa hakukenttään (esim. `dji mini 4` tai `rtx 50`), HintaTutka näyttää reaaliaikaisen pudotusvalikon täsmällisistä malleista ja hinnoista, jotta sinun ei tarvitse muistaa koko tuotenimeä ulkoa.

### 🚚 5. Toimituskulu- ja varastosuodattimet
* **🚚 `+Toimitus`**: Vaihda pelkän tuotehinnan ja toimituskulut sisältävän kokonaishinnan välillä.
* **📦 `Varastossa`**: Näytä vain kaupat, joilla tuote on heti varastossa.

---

## 🏪 Tuetut kaupat / Supported Stores (33)

HintaTutka toimii automaattisesti kaikilla kielipoluilla (`/fi/`, `/en/`, `/sv/`) ja SPA-sivustoilla:

| Kategoria | Kaupat |
| :--- | :--- |
| **Kodinkoneet & Elektroniikka** | Verkkokauppa.com, Gigantti, Power, Veikon Kone, Euronics, HobbyHall, Bigbox |
| **PC-komponentit & Pelaaminen** | Jimm's, Proshop, Datatronic, Multitronic, Tietokonekauppa.fi, Data-Systems, Komponenttikauppa.fi, Cruzbroker, MaxGaming, VPD Pelikauppa, Puolenkuun Pelit, Kasuplan, Mikromafia, TeraStore, DigiDreamer, CS Megastore |
| **Tavaratalot & Verkkokaupat** | Prisma, Kärkkäinen, Amazon.de, Dustin / DustinHome, e-ville, SatShop |
| **Operaattorit** | Elisa, Telia, DNA |
| **Käytetyt (Vertaiskauppa)** | **Tori.fi** *(sekä kaupan tuotesivuilla että suoraan Tori.fi-ilmoitussivuilla)* |

---

## 🛠️ Asennus / Installation

1. Asenna selaimeesi käyttäjäskriptien hallintalisäosa:
   * [**Tampermonkey**](https://www.tampermonkey.net/) (Chrome, Edge, Brave, Firefox, Safari) tai
   * [**Violentmonkey**](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)
2. Klikkaa alla olevaa asennuslinkkiä:
   * 👉 **[Asenna HintaTutka (`HintaTutka.user.js`)](https://raw.githubusercontent.com/FIMARx/hintatutka/main/HintaTutka.user.js)**
3. Vahvista asennus klikkaamalla **Install / Asenna**.
4. Avaa mikä tahansa tuotesivu (esim. Verkkokauppa.com, Gigantti, Jimm's, HobbyHall tai Tori.fi) — **HintaTutka** avautuu automaattisesti oikeaan reunaan!

---

## 🗺️ Kehityssuunnitelma / Roadmap

- [x] Reaaliaikainen Hinta.fi-hintavertailu & SVG-hintahistoriakäyrä
- [x] Tori.fi-käytettyjen markkinahaku, hintajakaumakäyrä & suora Tori.fi-sivutuki
- [x] 2-sarakkeinen mallivertailu (`⚔️ Vertaa`) & Live Autocomplete -hakuehdotukset
- [x] Klubitarjousten (`👑 HH PLUS`, `Klubihinta`, `MyPOWER`) tunnistus ja erottelu normaalihinnoista
- [ ] Laajennus päivittäistavaroihin, ruokakauppoihin (yksikköhinnat `€/kg`, `€/l`) sekä huonekaluihin ja kodin tuotteisiin (pöydät, tuolit, kalusteet)

---

## 📄 Lisenssi / License

Julkaistu **MIT**-lisenssillä. Tekijä: [**FIMARx**](https://github.com/FIMARx).
