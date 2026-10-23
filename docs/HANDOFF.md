# HANDOFF: Zmajska akademija ugank

Navodila za gradnjo z agentom za kodiranje: Claude Code, Codex ali Hyperagent. Specifikacija je v `docs/PRD.md`, pravila dela v `AGENTS.md`.

## 1. Priprava repozitorija

1. Ustvari prazen repozitorij (npr. `zmajska-akademija`).
2. Vanj kopiraj:
   - `docs/PRD.md`
   - `docs/HANDOFF.md`
   - `AGENTS.md` (v koren)
   - `CLAUDE.md` (v koren; za Claude Code)
3. Odpri repozitorij v izbranem agentu:
   - **Claude Code:** v terminalu v mapi projekta zaženi `claude`. CLAUDE.md se naloži samodejno.
   - **Codex:** odpri repozitorij v Codex (CLI ali oblak). AGENTS.md se upošteva samodejno.
   - **Hyperagent:** priloži ali poveži repozitorij in v prvem pozivu izrecno navedi, naj prebere `AGENTS.md` in `docs/PRD.md`.

## 2. Pravilo dela po fazah

- Vsaka faza = en poziv, ena veja ali en commit.
- Agent na koncu faze zažene teste in poda kratek povzetek: kaj je narejeno, kaj je odprto.
- Ne nadaljuj v naslednjo fazo, dokler testi niso zeleni in nisi pregledal rezultata.
- Ob odstopanju od PRD naj agent vpraša, ne ugiba.

## 3. Faze in pozivi

Pozive kopiraj dobesedno. Vsak se začne z enakim kontekstom.

### Faza 0: Ogrodje

```
Preberi AGENTS.md in docs/PRD.md. Postavi projekt React + TypeScript (strict) + Vite.
Dodaj Vitest, Playwright (WebKit, iPhone viewport), ESLint, Prettier in vite-plugin-pwa.
Ustvari strukturo map iz AGENTS.md. Dodaj skripte: dev, build, test, test:e2e, lint.
Ne gradi še nobenega zaslona. Na koncu zaženi lint in test ter povzemi.
```

Sprejemni kriterij: `npm run build`, `npm test` in `npm run lint` uspejo.

### Faza 1: Učni motor (brez vmesnika)

```
Po poglavjih 8 in 13 v docs/PRD.md implementiraj src/engine:
- config.ts s konstantami (velikost okna 10, meje 9 / 7 / 6,5, ponavljanje vsaka 5. naloga)
- adaptive.ts: recordAnswer(state, skillId, score) vrne nov state in dogodke (levelUp, levelDown, skillMastered)
- generators/ za addsub, compare, muldiv: generateTask(skillId, level, seed) vrne nalogo, pravilni odgovor in podatke za vizualizacijo
- review.ts: vrsta ponavljanja
Generatorji morajo biti deterministični glede na seed. Napiši teste enot za vse meje,
vključno z robovi (raven 1 ne gre nižje, raven 4 ne višje, okno pod 10 odgovori se ne oceni).
Vsaj 20 različnih nalog na raven. Brez React kode v tej fazi.
```

Sprejemni kriterij: pokritost `src/engine` vsaj 90 %, vsi testi zeleni.

### Faza 2: Hramba

```
Implementiraj src/storage po poglavju 13 v docs/PRD.md: ključ zau:v1, schemaVersion,
load/save, migracija in varna ponastavitev ob pokvarjenih podatkih. Dnevnik omeji na 500 vnosov.
Testi: shrani in naloži, pokvarjen JSON, neznana verzija.
```

### Faza 3: Vsebina

```
Ustvari src/content v JSON (slovenščina):
- heroes.json: Viki, Smrkljasti, Kamikazi z opisom in tonom
- missions.json: vsaj 3 misije na spretnost (uvod 1 do 2 stavka, razplet 1 stavek)
- hints.json: namigi za 1. in 2. napako za vsako spretnost in raven, z različico tona za vsakega junaka
- dragon.json: 5 stopenj Brezzobega in seznam sposobnosti
Vse zgodbe in besedila naj bodo izvirna; ne prepisuj odlomkov iz knjig.
Dodaj test, ki preveri, da ima vsaka spretnost in raven namige za vse tri junake.
```

### Faza 4: Zasloni in navigacija

```
Zgradi zaslone S1 do S9 iz poglavja 11 v docs/PRD.md z začasnimi preprostimi oblikami (brez slik likov).
Pokončna postavitev za iPhone, gumbi vsaj 56 x 56, varne cone, aria-label povsod.
Poveži navigacijo po poteh iz poglavja 12. Premor (S8) nima gumba za nadaljevanje.
Starševska vrata: naloga za odrasle (npr. 7 x 8).
Playwright test (WebKit, iPhone 13 viewport) za poti 1 do 4.
```

### Faza 5: Miniigre

```
Zgradi G1 Zakladnica, G2 Zmajski zemljevid, G3 Zmajska hrana po poglavju 6.
Uporabi generatorje iz src/engine in logiko namigov iz poglavja 9 (3 stopnje pomoči).
Interakcije: vlečenje in dotik, brez tipkovnice. Brez rdečih križcev in zvokov neuspeha.
Vsaka misija ima 3 do 5 nalog in se konča z razpletom (S7).
Testi: misija se zaključi, napaka sproži pravilno stopnjo pomoči.
```

### Faza 6: Napredek, zvok, varovala

```
Poveži dogodke motorja z nagradami iz poglavja 10 (sposobnosti, otoki, stopnje Brezzobega, knjiga zmajev).
Dodaj zvok: najprej poskusi Web Speech API z jezikom sl-SI; če glasu ni, uporabi MP3 iz public/assets/audio
(manjkajoč posnetek naj ne sesuje igre).
Implementiraj vsa varovala iz poglavja 4 in za vsako napiši test.
```

### Faza 7: PWA in objava

```
Nastavi PWA: manifest (ime, ikona, standalone, portrait), service worker za delovanje brez povezave.
Pripravi produkcijsko gradnjo in kratka navodila v README.md za objavo statične mape dist
pri gostitelju z zaščito dostopa. Ne objavljaj ničesar sam.
```

## 4. Kontrolni seznam pred prvim testom na iPhonu

- [ ] Vsi testi (enote in e2e) so zeleni.
- [ ] Igra se odpre z začetnega zaslona celozaslonsko.
- [ ] Napredek ostane po zaprtju Safarija.
- [ ] Premor se prikaže po nastavljenem številu misij.
- [ ] Ni omrežnih klicev med igranjem (preveri v razvijalskih orodjih).
- [ ] Glasovna navodila delujejo ali so posnetki na voljo.
- [ ] Dostop je zaščiten; povezava ni javna.
- [ ] Nobena slika ne posnema knjižnih ali filmskih ilustracij.

## 5. Po družinskem testu

1. V starševskem kotičku preberi uspešnost po spretnostih.
2. Če je uspešnost prvega poskusa nad 85 %, zvišaj zahtevnost (ali meje v `config.ts`); pod 70 % jo znižaj.
3. Zapiši opažanja otrok in odpri nov poziv za popravke.
