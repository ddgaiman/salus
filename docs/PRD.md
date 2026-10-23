# PRD: Zmajska akademija ugank

Verzija 1.0 · 23. oktober 2026 · Zasebni družinski prototip

> Ta dokument je vir resnice za gradnjo. Agent za kodiranje (Claude Code, Codex, Hyperagent) ga bere skupaj z `HANDOFF.md` (vrstni red gradnje) in `AGENTS.md` (pravila dela). Ob nejasnosti velja: najprej ta PRD, nato HANDOFF, nato AGENTS.

## 1. Povzetek

Zmajska akademija ugank je zasebna družinska igra za iPhone. Otroci od 6 do 9 let rešujejo kratke matematične misije v svetu knjižne serije *Kako izuriti svojega zmaja* avtorice Cresside Cowell. Otrok izbere junaka (Viki, Smrkljasti ali Kamikazi), spremlja ga knjižni Brezzobi. Ena misija traja 2 do 3 minute, težavnost se sproti prilagaja, napredek je vezan na osvojeno znanje, ne na čas pred zaslonom.

**Vodilno načelo:** otrok naj se zaljubi v matematiko, ne v aplikacijo.

**Status:** zasebni, nekomercialni prototip. Brez javne distribucije, trgovin z aplikacijami ali monetizacije. Liki in svet so avtorsko varovani; vse zgodbe, uganke in ilustracije so izvirne.

| Področje | Odločitev |
| --- | --- |
| Starost | 6 do 9 let (1. do 3. razred) |
| Cilj | Matematika postane zabavna; otrok z veseljem sprejema zahtevnejše izzive |
| Naprava | iPhone, mobilna spletna igra (PWA), pokončno |
| Pobudnik | Otrok sam |
| Junaki | Viki, Smrkljasti, Kamikazi; spremljevalec Brezzobi |
| Seja | 2 do 3 minute na misijo, premor po 3 misijah |
| Vsebina | Tri miniigre s prilagodljivimi nalogami |
| Napake | Vizualna in glasovna razlaga po korakih |
| Napredek | Rast Brezzobega in odklepanje otokov, vezano na znanje |
| Tehnologija | React, TypeScript, Vite, lokalna hramba, brez računov, brez sprotnega AI |
| Jezik vmesnika | Slovenščina |

## 2. Cilji in ne-cilji

**Cilji**

1. Otrok matematiko doživi kot zabavno in se vrača po lastni volji.
2. Otrok utrdi znanje prve triade v svojem tempu.
3. Otrok razvije zaupanje vase in sprejme napako kot del učenja.
4. Igra ostane zdrava navada: kratke seje z naravnim koncem.

**Ne-cilji (MVP)**

- Maksimiranje časa v igri ali dnevnih odprtij.
- Lestvice, tekmovanje, klepet.
- Generativni AI med igranjem.
- Več otroških profilov, sinhronizacija, orodja za učitelje.

## 3. Uporabniki

| Persona | Opis | Potrebuje |
| --- | --- | --- |
| Lana, 6 let | Še ne bere tekoče | Glasovna navodila, velike gumbe, štetje s predmeti |
| Jakob, 8 let | Matematika mu je dolgočasna, rad ima zmaje | Hitre misije, zgodbo, občutek uspeha |
| Ema, 9 let | Hitro napreduje, se hitro naveliča | Večji izziv, nove sposobnosti zmaja |
| Starš | Želi varen in koristen čas pred zaslonom | Starševska vrata, pregled napredka, nadzor premora |

Vsa navodila morajo biti na voljo glasovno in s slikami.

## 4. Pedagoška načela in varovala

Zasnova temelji na teoriji samodoločanja: sposobnost, samostojnost, povezanost. Občutek sposobnosti je najmočnejši napovednik samodoločene motivacije (Bureau idr. 2022). Motivacija zaradi zunanjih nagrad ni povezana z boljšim dosežkom, povezana pa je s slabšim počutjem (Howard idr. 2021).

| Potreba | Izvedba |
| --- | --- |
| Sposobnost | Naloge na robu znanja (cilj 70 do 85 % uspešnosti), razlaga namesto kazni |
| Samostojnost | Otrok izbira misijo in pot na zemljevidu; brez prisile k nadaljevanju |
| Povezanost | Brezzobi kot topel spremljevalec; starš vidi napredek |

**Varovala (obvezna, testirana):**

- Misija ima jasen konec; nobenega samodejnega zagona naslednje.
- Po 3 misijah zaslon premora brez gumba za nadaljevanje. Število nastavi starš (1 do 5).
- Brez neskončnega drsenja, naključnih nagrad, skrinj s presenečenji.
- Brez dnevnih nizov, ki kaznujejo izpuščen dan.
- Brez potisnih obvestil, oglasov, nakupov.
- Nagrade izključno iz osvojenega znanja.

## 5. Svet in junaki

Otrok je vajenec na Zmajski akademiji ugank. Svet, osebnosti in humor izhajajo iz knjig, ne iz filmov.

| Junak | Značaj | Sporočilo |
| --- | --- | --- |
| Viki | Iznajdljiv, premišljen, razume zmaje | Premisli in poišči strategijo |
| Smrkljasti | Tekmovalen, pogumen | Moč ne nadomesti razmišljanja |
| Kamikazi | Drzna, radovedna, ustvarjalna | Poskusi drugačno pot |

Izbira junaka spremeni glas, dialoge in ton namigov, ne težavnosti.

**Brezzobi:** majhen, zelen, samosvoj knjižni zmaj. Komentira, se šali, ob napaki pokaže postopek, raste z znanjem. Nikoli ne graja in nikoli ne prosi otroka, naj ostane dlje.

**Zgradba misije:**

1. Uvod: 1 do 2 stavka zgodbe (glas + ilustracija).
2. Uganka: 3 do 5 nalog ene miniigre.
3. Razplet: kratka animacija pokaže, kaj je znanje rešilo.
4. Zaključek: nagrada za spretnost, jasen konec.

## 6. Miniigre

| ID | Miniigra | Spretnost | Interakcija | Primer |
| --- | --- | --- | --- | --- |
| G1 | Zakladnica | Seštevanje in odštevanje | Vlečenje kovancev v/iz skrinje, številčnica | V skrinji je 8 kovancev, pirat jih vzame 3. Koliko ostane? |
| G2 | Zmajski zemljevid | Primerjanje in zaporedja | Dotik otoka, številska vrsta | Kateri otok je bližje: 47 ali 52 korakov? |
| G3 | Zmajska hrana | Množenje in deljenje | Razdeljevanje rib med zmaje | Trije zmaji dobijo po 4 ribe. Koliko rib? |

## 7. Funkcionalnosti MVP

| ID | Funkcionalnost | Prioriteta | Sprejemni kriterij |
| --- | --- | --- | --- |
| F1 | Izbira junaka | Obvezno | Največ 2 dotika; izbira se shrani |
| F2 | Zemljevid otokov | Obvezno | Odklenjene in zaklenjene misije; otrok izbere |
| F3 | Tri miniigre | Obvezno | Vsaka 4 ravni, vsaj 20 različnih nalog na raven (generator) |
| F4 | Prilagodljiva težavnost | Obvezno | Pravila iz poglavja 8, pokrita s testi |
| F5 | Namigi in razlaga | Obvezno | Pravila iz poglavja 9 |
| F6 | Glasovna navodila | Obvezno | Vsako besedilo za otroka ima zvok (MP3 ali sinteza) |
| F7 | Rast Brezzobega, odklepanje otokov | Obvezno | Sproži ga le osvojena spretnost |
| F8 | Premor po N misijah | Obvezno | Privzeto N = 3, nastavljivo v starševskem kotičku |
| F9 | Starševski kotiček | Obvezno | Vrata z nalogo za odrasle; spretnosti, nastavitve, ponastavitev |
| F10 | Lokalna hramba | Obvezno | Napredek preživi zaprtje in ponovni zagon |
| F11 | PWA, začetni zaslon | Zaželeno | Celozaslonski zagon z ikone |
| F12 | Delovanje brez povezave | Zaželeno | Service worker predpomni vse vire |

## 8. Logika prilagajanja

**Spretnosti in ravni**

| Spretnost (`skillId`) | Raven 1 | Raven 2 | Raven 3 | Raven 4 |
| --- | --- | --- | --- | --- |
| `addsub` | Do 10 s predmeti | Do 20 | Do 100 brez prehoda | Do 100 s prehodom |
| `compare` | Števila do 20 | Do 100 | Zaporedja po 2, 5, 10 | Manjkajoči člen |
| `muldiv` | Enake skupine s slikami | Poštevanka 2, 5, 10 | Poštevanka 3, 4 | Deljenje na enake dele |

**Pravila (za vsako spretnost posebej)**

- Okno: zadnjih 10 odgovorov.
- Točkovanje: pravilno v 1. poskusu = 1; pravilno po namigu = 0,5; sicer 0.
- Vsota ≥ 9: raven +1 (največ 4); dogodek `levelUp`.
- Vsota 7 do 8,5: raven ostane.
- Vsota ≤ 6,5: raven −1 (najmanj 1); brez komentarja v vmesniku.
- Po spremembi ravni se okno izprazni.
- Spretnost je osvojena pri vsoti ≥ 9 na ravni 4; dogodek `skillMastered`.
- Okno se oceni šele, ko ima vsaj 10 odgovorov.
- Ponavljanje: vsaka 5. naloga je iz že osvojene ravni ali spretnosti.
- Naloga, rešena šele po 3. napaki, se doda v vrsto ponavljanja.
- Zemljevid ponudi največ 3 misije; prednost ima spretnost z najnižjo uspešnostjo.

Meje so izhodišče; po družinskem testu se umerijo (konstante v `src/engine/config.ts`).

## 9. Namigi in napake

| Poskus | Odziv | Primer (8 − 3) |
| --- | --- | --- |
| 1. napaka | Prijazen odziv in namig na strategijo | "Preštej kovance, ki ostanejo v skrinji." |
| 2. napaka | Vizualna razlaga po korakih (predmeti + glas) | 8 kovancev, 3 odletijo, Brezzobi šteje |
| 3. napaka | Prikazan postopek; otrok sam vnese odgovor | Naloga gre v vrsto ponavljanja |

- Brez rdečih križcev, zvokov neuspeha ali izgube točk.
- Pohvala za trud in strategijo, ne za "pametnost".
- Namig ob 1. napaki nikoli ne razkrije odgovora.
- Ton se prilagodi junaku.
- Vsa besedila so vnaprej napisana v `src/content/`.

## 10. Napredek in nagrade

| Dogodek | Posledica |
| --- | --- |
| `levelUp` | Brezzobi dobi novo sposobnost |
| `skillMastered` | Odklene se nov otok |
| Vse tri spretnosti na isti ravni | Brezzobi zraste za stopnjo (5 stopenj) |
| Zaključena misija | Zapis v otrokovo knjigo zmajev ("Znaš seštevati do 20.") |

Ni točk za lestvico, valute, naključnih skrinj ali nagrad za vrnitev.

## 11. Zasloni

| ID | Zaslon | Ključni elementi |
| --- | --- | --- |
| S1 | Uvod | Animacija Brezzobega, glasovni pozdrav, gumb Začni |
| S2 | Izbira junaka | Tri kartice, glasovni opis ob dotiku |
| S3 | Zemljevid otokov | Otoki, poti, ključavnice, Brezzobi na lokaciji, ikona ključa (starš) |
| S4 | Uvod v misijo | Ilustracija, glas, gumb Gremo |
| S5 | Miniigra | Predmeti, številčnica, gumb za namig, zvočnik |
| S6 | Namig in razlaga | Animirani koraki, gumb Poskusim |
| S7 | Razplet in nagrada | Animacija, nova sposobnost, gumb Na zemljevid |
| S8 | Premor | Brezzobi spi, "Se vidiva jutri", brez nadaljevanja |
| S9 | Starševski kotiček | Vrata (npr. 7 × 8), spretnosti, nastavitve, ponastavitev |

Gumbi najmanj 56 × 56 točk. Pokončno, 375 do 430 točk širine, varne cone iPhona.

## 12. Uporabniške poti

1. **Prvi zagon:** starš odpre povezavo, doda na začetni zaslon; S1 → S2 → prva (lahka) misija.
2. **Običajna seja:** S3 → S4 → S5 → S7 → S3; po N misijah S8.
3. **Napaka:** S5 → namig → S5; 2. napaka → S6 → S5.
4. **Starš:** S3 → ikona ključa → vrata → S9.

## 13. Podatkovni model (localStorage, ključ `zau:v1`)

```ts
type HeroId = 'viki' | 'smrkljasti' | 'kamikazi';
type SkillId = 'addsub' | 'compare' | 'muldiv';

interface SaveState {
  schemaVersion: 1;
  heroId: HeroId | null;
  skills: Record<SkillId, {
    level: 1 | 2 | 3 | 4;
    window: number[];      // točke zadnjih odgovorov (0, 0.5, 1)
    mastered: boolean;
  }>;
  reviewQueue: Array<{ skillId: SkillId; level: number; taskSeed: string }>;
  dragonStage: 1 | 2 | 3 | 4 | 5;
  abilities: string[];
  unlockedIslands: string[];
  dragonBook: Array<{ date: string; text: string }>;
  session: { missionsToday: number; date: string };
  settings: { missionsBeforeBreak: number; voice: 'recorded' | 'tts' };
  log: Array<{ ts: number; skillId: SkillId; level: number; score: number }>; // največ 500 vnosov
}
```

Ob neznani verziji sheme: migracija, ob napaki varna ponastavitev z obvestilom staršu.

## 14. Tehnične zahteve

| Plast | Izbira |
| --- | --- |
| Jezik | TypeScript (strict) |
| Ogrodje | React + Vite |
| Stanje | React context ali Zustand |
| Animacije | CSS, Framer Motion |
| Zvok | MP3 v `public/assets/audio` ali Web Speech API (`sl-SI`, če je na voljo) |
| Hramba | localStorage z verzijo sheme |
| PWA | vite-plugin-pwa |
| Testi | Vitest (logika), Playwright z WebKit (poti) |

**Nefunkcionalno**

- Prvi prikaz pod 2 s na iPhonu prek Wi-Fi.
- Odziv na dotik pod 100 ms, animacije 60 fps.
- Kontrast vsaj 4,5 : 1; vsak interaktivni element ima `aria-label`.
- Med igranjem nobenih omrežnih klicev, analitike ali AI API-jev.

## 15. Zasebnost, varnost, pravice

- Brez osebnih podatkov, računov, imen; vse ostane na napravi.
- ZVOP-2, 8. člen: za otroke pod 15 let je privolitev veljavna le z odobritvijo staršev. Prototip podatkov ne obdeluje; ob spremembi ponovno preveriti.
- Objava le za družino, z zaščito dostopa (geslo ali dostopno pravilo gostitelja).
- Liki pripadajo imetnikom pravic. Ilustracije so izvirne in ne posnemajo knjižnih ali filmskih. Pred kakršno koli objavo je potrebno dovoljenje.

## 16. Merila uspeha (družinski test, 2 do 3 dni)

| Merilo | Cilj |
| --- | --- |
| Otrok igro odpre sam | Vsaj 1-krat na dan brez spodbude |
| Uspešnost prvega poskusa | 70 do 85 % |
| Zaključene misije | Vsaj 90 % začetih |
| Premor sprejet brez prepira | 4 od 5 primerov |
| Otrok pove, kaj se je naučil | Da |
| Stabilnost | 0 sesutij, napredek ohranjen |

Večja vztrajnost in fokus sta dolgoročna hipoteza, ne obljuba prototipa.

## 17. Predpostavke in odprta vprašanja

**Predpostavke**

- Meje prilagajanja so izhodišče za umerjanje.
- Slovenski glas v Web Speech API na iPhonu morda ni na voljo; rezerva so posnetki.
- Gostovanje: statična gradnja z zaščito dostopa (npr. Cloudflare Pages z dostopnim pravilom). Pogoji gostitelja niso preverjeni.
- Hyperagent bere iste datoteke kot Claude Code in Codex; njegov način branja navodil ni preverjen.
- Slovenska imena likov sledijo slovenski knjižni izdaji.

**Odprta vprašanja**

- [ ] Kdo pripravi ilustracije?
- [ ] Posneti glasovi ali sinteza govora?
- [ ] Več otroških profilov?

## Viri

- Bureau, Julien S., Joshua L. Howard, Jane X. Y. Chong in Frédéric Guay. 2022. "Pathways to Student Motivation." *Review of Educational Research* 92 (1): 46–72. https://research.monash.edu/en/publications/pathways-to-student-motivation-a-meta-analysis-of-antecedents-of-/
- Howard, Joshua L., Julien Bureau, Frédéric Guay, Jane X. Y. Chong in Richard M. Ryan. 2021. "Student Motivation and Associated Outcomes." *Perspectives on Psychological Science* 16 (6): 1300–1323. https://pure.ewha.ac.kr/en/publications/student-motivation-and-associated-outcomes-a-meta-analysis-from-s/
- Lathifah, Inayatul, Nasrul Umam in Sandi Aji Wahyu Utomo. 2025. "Gamification in Early Childhood Education." SCITEPRESS. https://scitepress.org/publishedPapers/2025/140690/pdf/index.html
- RPC. 2019. "ICO: Age Appropriate Design Code." https://www.rpclegal.com/snapshots/data-protection/ico-age-appropriate-design-code-for-information-society-services/
- Zakon o varstvu osebnih podatkov (ZVOP-2), 8. člen. https://www.racunovodstvo.net/zakonodaja/zvop-1/8-clen
