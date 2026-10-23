# AGENTS.md: Zmajska akademija ugank

Pravila za vse agente za kodiranje (Codex, Claude Code, Hyperagent in druge).

## Kontekst

- Zasebna družinska matematična igra za otroke od 6 do 9 let, iPhone, slovenščina.
- Specifikacija: `docs/PRD.md`. Vrstni red dela: `docs/HANDOFF.md`.
- Ob nejasnosti vprašaj. Ne dodajaj funkcionalnosti, ki jih PRD ne zahteva.

## Sklad

- TypeScript (strict), React, Vite, Vitest, Playwright (WebKit), vite-plugin-pwa.
- Brez zaledja, baze, uporabniških računov.

## Struktura

```
docs/            PRD.md, HANDOFF.md
src/engine/      čista logika: prilagajanje, generatorji nalog, ponavljanje (brez Reacta)
src/content/     vsa besedila za otroka v JSON, slovenščina
src/games/       miniigre G1 do G3
src/screens/     zasloni S1 do S9
src/storage/     localStorage, ključ zau:v1, migracije
public/assets/   izvirne slike in zvoki
```

## Ukazi

- `npm run dev` razvojni strežnik
- `npm test` testi enot (Vitest)
- `npm run test:e2e` Playwright, WebKit, iPhone viewport
- `npm run lint` ESLint in Prettier
- `npm run build` produkcijska gradnja

## Obvezna pravila

1. **Brez omrežnih klicev med igranjem.** Nobene analitike, sledilnikov, AI API-jev, zunanjih pisav ali CDN-jev.
2. **Brez osebnih podatkov.** Nobenih imen, e-pošte, lokacije.
3. **Varovala pred zasvajanjem** (PRD, poglavje 4) so obvezna in testirana. Nikoli ne dodaj samodejnega nadaljevanja, nizov, naključnih nagrad, obvestil ali gumba za nadaljevanje na zaslonu premora.
4. **Besedila samo v `src/content/`.** V komponentah ni trdo zapisanih besedil za otroka.
5. **Logika pred vmesnikom.** `src/engine` je pokrit s testi, preden ga uporabi zaslon.
6. **Avtorske pravice.** Ne ustvarjaj ali prenašaj slik, ki posnemajo knjižne ali filmske ilustracije serije. Ne prepisuj odlomkov iz knjig. Do izvirnih ilustracij uporabljaj preproste oblike.
7. **Dostopnost.** Gumbi vsaj 56 x 56 točk, kontrast vsaj 4,5 : 1, `aria-label` na vseh interaktivnih elementih.
8. **Ton.** Brez rdečih križcev, zvokov neuspeha ali izgube točk.

## Zaključek vsake naloge

- Zaženi `npm run lint` in `npm test` (in `npm run test:e2e`, če si spreminjal zaslone).
- Povzemi: kaj je narejeno, katere datoteke, kaj je odprto.
- Commit po fazi, sporočilo v obliki `faza-N: kratek opis`.
