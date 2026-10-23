# Zmajska akademija ugank

Zasebna družinska matematična igra za otroke od 6 do 9 let (iPhone, slovenščina). Specifikacija je v `docs/PRD.md`, vrstni red gradnje v `docs/HANDOFF.md`, pravila dela v `AGENTS.md`.

Zasebni, nekomercialni prototip. Liki pripadajo imetnikom pravic; vse zgodbe, uganke in oblike v igri so izvirne. Igre ne objavljajte javno.

## Ukazi

| Ukaz | Namen |
| --- | --- |
| `npm install` | Namesti odvisnosti (Node 22). |
| `npm run dev` | Razvojni strežnik. |
| `npm test` | Testi enot (Vitest). |
| `npm run test:coverage` | Testi enot s pokritostjo (`src/engine`, `src/storage`, meja 90 %). |
| `npm run test:e2e` | Playwright, WebKit, iPhone 13. |
| `npm run lint` | ESLint in Prettier. |
| `npm run build` | Produkcijska gradnja v mapo `dist`. |
| `npm run preview` | Lokalni ogled produkcijske gradnje. |

Če WebKit za Playwright ni nameščen, zaženite iste teste v Chromiumu z enakim zaslonom: `E2E_BROWSER=chromium npm run test:e2e`.

## Zgradba

```
src/engine/    čista logika: prilagajanje, generatorji nalog, ponavljanje, nagrade, premor
src/content/   vsa besedila v JSON (slovenščina) in oblikovanje množine
src/storage/   localStorage (ključ zau:v1), migracija, varna ponastavitev
src/games/     G1 Zakladnica, G2 Zmajski zemljevid, G3 Zmajska hrana
src/screens/   zasloni S1 do S9 in knjiga zmajev
src/audio/     glas: Web Speech API (sl-SI), rezerva MP3
e2e/           poti 1 do 4, varovala, PWA
```

Meje prilagajanja so v `src/engine/config.ts`. Po družinskem testu jih umerite po `docs/HANDOFF.md`, poglavje 5.

## Glas

1. Če ima naprava slovenski sistemski glas, igra bere z njim (Web Speech API, `sl-SI`).
2. Sicer igra poskusi predvajati posnetek `public/assets/audio/<ključ>.mp3`. Ključ je zgoščena vrednost besedila (`audioKey` v `src/audio/speech.ts`).
3. Če posnetka ni, igra deluje naprej; besedilo ostane na zaslonu.

V starševskem kotičku lahko izberete sintezo govora ali posnetke. Posnetki so smiselni za stalna besedila (pozdrav, uvodi misij, namigi). Naloge s števili se spreminjajo, zato zanje potrebujete sintezo govora.

## Namestitev na iPhone

1. Odprite zaščiteno povezavo v Safariju.
2. Tapnite Deli, nato Dodaj na začetni zaslon.
3. Igro odpirajte z ikone. Teče celozaslonsko, pokončno in po prvem obisku tudi brez povezave.

## Objava za družino

Igra je statična stran. Objavite samo vsebino mape `dist` in dostop vedno zaščitite. Ničesar ne objavljajte, dokler ni vklopljena zaščita.

```
npm ci
npm run lint && npm test && npm run build
```

### Primer: Cloudflare Pages z zaščito Cloudflare Access

1. V Cloudflare ustvarite projekt Pages in naložite mapo `dist` (neposredni prenos ali povezava z repozitorijem; ukaz gradnje `npm run build`, izhodna mapa `dist`).
2. V Cloudflare Zero Trust dodajte aplikacijo Access za domeno projekta in pravilo, ki dovoli le e-poštne naslove družinskih članov.
3. Preverite v zasebnem oknu brskalnika, da brez prijave stran ni dostopna.

Predpostavka: pogoji, cene in koraki gostitelja niso preverjeni (PRD, poglavje 17). Pred objavo jih preverite v uradni dokumentaciji gostitelja. Enako velja za druge gostitelje z zaščito z geslom.

## Kontrolni seznam pred prvim testom na iPhonu

Glejte `docs/HANDOFF.md`, poglavje 4.
