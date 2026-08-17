# Scraper — dokumentacja projektu

Gra przeglądarkowa 2D typu "unikaj przeszkód", napisana jako pojedynczy plik
`scraper.html` (HTML + CSS + JS, bez zależności zewnętrznych, bez buildu).
Wszystko renderowane na `<canvas>` 420×600, sterowane logiką w jednym IIFE
(`(function(){ ... })()`) na dole pliku.

Ten dokument opisuje **wszystko, co zostało zrobione do tej pory**, żeby dało
się swobodnie kontynuować rozwój w Claude Code (albo dowolnym innym edytorze)
bez utraty kontekstu.

---

## 1. Jak uruchomić / edytować

**Od 2026-07-09 gra jest podzielona na moduły** (patrz pkt 18) — źródłem
prawdy jest teraz:

- `index.html` — struktura HTML + `<link>` do `style.css` + dwa `<script src>`
  (`i18n.js`, potem `game.js`, w tej kolejności).
- `style.css` — cały CSS (bez zmian treściowych, tylko wycięty z `<style>`).
- `i18n.js` — dane tłumaczeń (`LANGS`, `I18N`), bez logiki. **Musi się
  wczytać przed `game.js`** (deklaruje `const LANGS`/`const I18N` w
  zwykłym, niemodułowym `<script>`, więc trafiają do dzielonego zasięgu
  globalnego strony — `game.js` odwołuje się do nich bez `window.` i bez
  własnej deklaracji).
- `game.js` — cała reszta logiki gry, w tym samym jednym IIFE co wcześniej.

Otwórz `index.html` bezpośrednio w przeglądarce (podwójne kliknięcie) — nadal
brak serwera/buildu/npm, `<link>`/`<script src>` do plików w tym samym
folderze działają poprawnie nawet przy otwieraniu przez `file://`.

**Stary plik `scraper (1).html` (monolityczny, jeden plik ze wszystkim)
został zostawiony w folderze jako kopia zapasowa/punkt odniesienia — nie jest
już rozwijany.** Wszystkie zmiany od tej pory rób w `index.html` /
`style.css` / `game.js` / `i18n.js`.

- Do szybkiej walidacji składni JS podczas edycji (jeśli akurat jest
  dostępny `node` w środowisku — patrz zastrzeżenie w pkt 18):
  ```bash
  node -e "new Function(require('fs').readFileSync('game.js','utf8')); console.log('JS syntax OK')"
  node -e "new Function(require('fs').readFileSync('i18n.js','utf8')); console.log('i18n syntax OK')"
  ```
- Warto też sprawdzać zbalansowanie `<div>` w `index.html`:
  ```bash
  python3 -c "
  import re
  html = open('index.html', encoding='utf-8').read()
  print(len(re.findall(r'<div', html)), len(re.findall(r'</div>', html)))
  "
  ```

---

## 2. Ogólna koncepcja gry

Gracz steruje kulką, która musi unikać spadających/poruszających się
przeszkód. Gra ma trzy główne tryby dostępne z menu głównego:

1. **Singleplayer**
   - **Poziomy** — 50 poziomów w 5 stronach po 10, z systemem odblokowywania
     i zapisem postępu.
   - **Tryb wolny** — nieskończona rozgrywka, liczy się przebyty dystans,
     zapisywany jest rekord.
2. **Multiplayer** (dwie kulki na tej samej planszy, jedna klawiatura)
   - **Kooperacja** — wspólne 3 życia, gracze grają razem jak najdłużej.
   - **Rywalizacja** — kto pierwszy się zderzy, przegrywa.
3. **Ustawienia** — głośność + wybór języka (10 języków).

Menu główne: **Singleplayer / Multiplayer / Ustawienia / Exit**.

---

## 3. Mechanika rozgrywki (najważniejsze — było kilka iteracji!)

### 3.1. System poziomów (tryb "Poziomy")

- **50 poziomów**, generowanych programowo funkcją `levelConfig(levelNumber)`
  (nie są hardcodowane pojedynczo).
- Każdy poziom ma: `baseSpeed` (startowa prędkość przeszkód), `spawnInterval`
  (jak często spawnują się przeszkody) i `target` (**wymagany dystans** do
  ukończenia poziomu — patrz niżej, to NIE są punkty).
- **Poziomy bossów: 10, 20, 30, 40, 50** — oznaczone czerwoną ramką + ikoną
  korony 👑 na kafelku wyboru poziomu. Mają wyższy target, wyższą baseSpeed i
  krótszy spawnInterval (czyli są dłuższe i trudniejsze).
- **WAŻNE — historia zmian mechaniki celu poziomu:**
  1. Pierwsza wersja: poziom kończył się po zdobyciu **X punktów** (unikniętych
     przeszkód).
  2. Zmieniono na: poziom kończy się po przebyciu **X dystansu** — zamiast
     punktów jest licznik dystansu w HUD (`Dystans X / Y m`).
  3. Dodano wizualną **linię mety** (checkerboard bar), która pojawiała się
     pod koniec i "wjeżdżała" w gracza — ale to powodowało błędy synchronizacji
     (meta pojawiała/kończyła się za wcześnie względem faktycznego dystansu).
  4. **OSTATECZNA DECYZJA (ostatnie polecenie usera): linia mety została
     CAŁKOWICIE USUNIĘTA.** Poziom kończy się **natychmiast**, gdy
     `distance >= target` — prosty, bezpośredni warunek w pętli gry, bez
     żadnego elementu wizualnego "mety". To jest aktualny, docelowy stan.
- Formuła trudności (w `levelConfig`):
  ```js
  baseSpeed = 2.0 + i * 0.12          // i = levelNumber - 1
  spawnInterval = max(260, 1000 - i*14)
  target = 900 + i * 130
  // dla poziomów boss (levelNumber % 10 === 0):
  target *= 1.7
  baseSpeed *= 1.15
  spawnInterval = max(200, spawnInterval * 0.72)
  ```
- **Ramp trudności WEWNĄTRZ poziomu** (to było celowe usprawnienie): prędkość
  przeszkód i częstotliwość spawnu rosną wraz z przebytym dystansem, nie tylko
  między poziomami:
  ```js
  currentSpeed = baseSpeed + distance * SPEED_RAMP_K       // SPEED_RAMP_K = 0.0007
  currentInterval = max(MIN_INTERVAL, spawnInterval - distance * INTERVAL_RAMP_K) // INTERVAL_RAMP_K = 0.05, MIN_INTERVAL = 170
  distance += currentSpeed * (dt / 16.6667)
  ```
  Dzięki temu nawet poziom 1 pod koniec jest wyraźnie trudniejszy niż na
  początku — spełnia wymaganie "im dalej, tym szybciej i więcej przeszkód".

### 3.2. Odblokowywanie i zapis postępu

- `progress` = tablica boolean długości 50, zapisywana w `localStorage` pod
  kluczem **`scraper_progress_v1`**.
- Poziom `i` jest odblokowany, gdy `i === 0 || progress[i-1] === true`.
- Ukończone poziomy dostają złotą ramkę + badge z ptaszkiem (`✓`).
- Poziomy boss mają zawsze czerwoną ramkę (niezależnie od stanu ukończenia) +
  ikonę korony — to jest stały wizualny znacznik "to jest boss", niezwiązany
  z odblokowaniem.
- Wybór poziomu jest **paginowany**: 5 stron po 10 poziomów, z przyciskami
  ◀ ▶ i etykietą "Strona X/5 (a-b)". Wejście w Singleplayer → Poziomy
  automatycznie otwiera stronę z pierwszym nieukończonym poziomem
  (`firstIncompletePage()`).

### 3.3. Tryb wolny (Freeplay)

- Nieskończona rozgrywka, `target = Infinity`, brak linii mety / warunku
  końca poza zderzeniem.
- Liczy się **dystans** (nie punkty) — rekord zapisywany w `localStorage`
  pod kluczem **`scraper_bestdist_v1`**.
- Rekord wyświetlany na ekranie wyboru trybu Singleplayer (`renderSingleSelect()`
  aktualizuje tekst `#freeplayRecord`).

### 3.4. Multiplayer — Kooperacja i Rywalizacja

- Dwóch graczy na tej samej planszy i tej samej klawiaturze:
  - Gracz 🟢 — strzałki (`ArrowUp/Down/Left/Right`)
  - Gracz 🟠 — WASD
- **Rywalizacja (`versus`)**: pierwsze zderzenie kończy grę, przegrywa ten,
  kto się zderzył, wynik to wspólny przebyty dystans.
- **Kooperacja (`coop`)**: 3 **wspólne życia** (`coopLives`). Zderzenie
  odejmuje życie, gracz odradza się (`respawnPlayer`) w swojej startowej
  pozycji z ~1.5s nietykalności (miganie przezroczystością). Gra kończy się,
  gdy życia spadną do 0. Wynik to przebyty wspólny dystans.
- Zarówno coop, jak i versus pokazują wynik jako **dystans**, nie punkty
  (to była osobna poprawka na życzenie usera).

### 3.5. Typy przeszkód (wspólne dla wszystkich trybów)

Sześć typów, generowane losowo w `spawnObstacle()` z wagami (patrz `randType()`,
zaktualizowane 2026-07-09 przy dodaniu dwóch nowych typów — patrz pkt 20):
- `block` (28%) — czerwony prostokąt, leci prosto w dół.
- `zigzag` (18%) — pomarańczowy, leci w dół faluje na boki (sinus).
- `orb` (14%) — fioletowa kula, szybsza, mniejsza.
- `slider` (12%) — żółty, leci poziomo w poprzek ekranu (z lewej lub prawej).
- `spinner` (16%) — niebieski "wirnik": para grotów obracająca się wokół
  wspólnego, opadającego środka (`obstacleHitsPlayer` sprawdza kolizję z
  oboma grotami osobno, przez `circleCircleHit`). Trzeba trafić moment, gdy
  szczelina między obracającymi się grotami jest po stronie gracza.
- `pulsar` (12%) — różowa kula, przez większość czasu **nieszkodliwa** i
  mała, ale cyklicznie (900 ms ładowania z rosnącym pierścieniem
  ostrzegawczym → 260 ms pełnego, dużego i śmiertelnego rozbłysku → 650 ms
  kurczenia się z powrotem) zamienia się w duże zagrożenie. To jedyna
  przeszkoda, w której dotknięcie **nie zawsze** oznacza kolizję — trzeba
  reagować na czas, nie tylko na pozycję (`o.lethal` flaguje aktywne okno
  kolizji, patrz `obstacleHitsPlayer`).

Dodatkowo **wyłącznie na poziomach bossów** (10/20/30/40/50, w trybie
`single`) pojawia się siódma, unikalna przeszkoda spoza powyższej puli:

- **`beam` (laser bossa)** — spawnowany na osobnym, niezależnym liczniku
  (`beamTimer`/`BEAM_INTERVAL = 3200` ms, funkcja `spawnBeam()`), nie przez
  losowy `randType()`. Odczytuje pozycję `x` gracza **raz, w momencie
  powstania** (nie śledzi jej dalej — to celowe, żeby unik był sprawiedliwy:
  wystarczy odsunąć się w ciągu okna ostrzegawczego), po czym przechodzi
  przez cykl: 700 ms półprzezroczystej, pulsującej obwódki-ostrzeżenia na
  całą wysokość planszy → 220 ms jasnego, w pełni śmiertelnego rozbłysku na
  całą wysokość → 180 ms wygaszania. To jedyna przeszkoda o pełnej wysokości
  planszy i jedyna, która nie "spada" (`o.age` zamiast `o.y`). Zaspokaja to
  wieloletni punkt z listy "do zrobienia" (pkt 13/pkt 10.5): "unikalne wzory
  ataku na poziomach boss" — boss przestaje być tylko "szybciej i gęściej".

Legenda kolorów jest widoczna pod planszą podczas gry (`#legend`) — obejmuje
6 zwykłych typów (bez `beam`, który celowo nie ma tam wpisu: pojawia się
tylko na bossach, rzadko, i jest samowyjaśniający się dzięki dramatycznemu,
pełnoekranowemu ostrzeżeniu — pasuje do istniejącego języka wizualnego
"boss" (czerwona pulsująca ramka, tag ⚠ BOSS), nie wymaga dodatkowego
wyjaśnienia w legendzie).

---

## 4. Pauza (tylko w trybach Singleplayer: Poziomy i Tryb wolny)

- Przycisk ⏸ w HUD (widoczny tylko gdy `mode === 'single' || mode === 'freeplay'`)
  oraz klawisz **Esc**.
- Pauza zatrzymuje pętlę gry (`running = false`), zatrzymuje muzykę rozgrywki
  i uruchamia muzykę menu (patrz sekcja Audio).
- Ekran pauzy (`#pauseScreen`) zawiera **suwak głośności** i **wybór języka**
  (zsynchronizowane z tymi samymi kontrolkami w ekranie Ustawień — patrz
  `setVolume()` / `setLanguage()`, które aktualizują oba miejsca naraz), plus
  przyciski "Wznów" i "Menu główne".
- Multiplayer (coop/versus) **nie ma pauzy** — celowo, bo user prosił o
  pauzę tylko dla singleplayera.

---

## 5. Audio (w całości proceduralne, Web Audio API — brak plików mp3)

- `AudioContext` tworzony leniwie w `ensureAudio()` (wymaga gestu użytkownika
  — standardowe ograniczenie przeglądarek).
- **Muzyka menu** (`startMenuMusic` / `stopMenuMusic` / `menuMusicStep`) —
  wolniejsza, spokojniejsza (interwał 430ms, skala `menuScaleFreqs`, fale
  `sine`) — gra na wszystkich ekranach menu i **w trakcie pauzy**.
- **Muzyka rozgrywki** (`startMusic` / `stopMusic` / `musicStep`) — gra tylko
  gdy `running === true` w trybie single/freeplay/coop/versus. Ma dwa
  warianty: normalny (`scaleFreqs`, interwał 260ms) i **boss** (`bossScaleFreqs`,
  interwał 210ms, mroczniejsza skala) — automatycznie przełącza się, gdy
  `mode === 'single' && LEVELS[currentLevelIndex].isBoss`.
- Efekty: `playHit()` (zderzenie), `playScorePing()` (obecnie nieużywany po
  usunięciu punktacji z obstacle-offscreen — **do sprawdzenia, czy jest gdzieś
  jeszcze wołany, patrz sekcja "Znane niedociągnięcia"**), `playWinFanfare()`
  (ukończenie poziomu).
- Przełącznik dźwięku 🔊/🔇 w HUD (`soundBtn`) — wycisza **obie** ścieżki
  (menu + gameplay).
- Głośność: `volumePercent` (0–100), zapisywana w `localStorage` pod kluczem
  **`scraper_volume_v1`**, przeliczana na `masterGain.gain.value = (v/100)*0.3`.
  Zmieniana z dwóch miejsc (Ustawienia i Pauza) przez wspólną funkcję
  `setVolume(v)`.

---

## 6. System językowy (i18n) — 10 języków

- Obiekt `I18N` zawiera klucze dla: `pl, en, de, fr, it, es, pt, zh, ko, ja`.
- Funkcja `t(key, vars)` pobiera tekst dla `currentLang` (fallback do `pl`),
  podstawia placeholdery typu `{score}`/`{distance}`/`{level}` przez
  `.split('{k}').join(value)`.
- `currentLang` zapisywany w `localStorage` pod kluczem **`scraper_lang_v1`**.
- Zmiana języka z dwóch miejsc (Ustawienia i Pauza) przez wspólną funkcję
  `setLanguage(code)`, która wywołuje `applyStaticTranslations()` —
  ta funkcja re-renderuje **wszystkie** statyczne teksty ekranów (menu,
  wybór poziomu, legenda, hint, itd.) oraz odświeża `renderLevelGrid()` i
  `renderSingleSelect()` (bo te zawierają teksty zależne od języka, np.
  etykietę strony czy rekord trybu wolnego).
- **Nazwa gry "Scraper" jest CELOWO niezlokalizowana** — to nazwa własna,
  identyczna we wszystkich językach (`<title>`, `<h1>`, `<h2>` w mainMenu).
- Dynamiczne teksty w grze (HUD, komunikaty końca poziomu/gry) też przechodzą
  przez `t()` z odpowiednimi zmiennymi — **uwaga:** to było źródłem błędów
  przy zmianach mechaniki (np. gdy zmieniano scoring na dystans, trzeba było
  zaktualizować zarówno kod JS przekazujący zmienne do `t()`, jak i same
  szablony tekstów w `I18N` dla wszystkich 10 języków — łatwo o rozjazd).

**Do zrobienia / do sprawdzenia przy dalszej pracy:** tłumaczenia chińskie /
koreańskie / japońskie są zrobione "z pamięci modelu", bez nosicielskiej
weryfikacji — warto je kiedyś zlecić do sprawdzenia native speakerowi.

---

## 7. Trwały zapis (localStorage) — pełna lista kluczy

**Zaktualizowane w pkt 45 (2026-07-13)** — poprzednia wersja tabeli (z pkt 40,
2026-07-12) miała 24 klucze; poniżej doszły 2 kolejne z pkt 41 (poziom
gracza/EXP), razem **26 kluczy**. Od pkt 45 obowiązuje też zasada: *każdy*
nowy trwały klucz w tej grze musi mieć prefiks `scraper_`, bo `resetGame()`
(pkt 45.2) resetuje postęp przez usunięcie wszystkiego pod tym prefiksem, nie
przez hardkodowaną listę — pominięcie prefiksu przy dodawaniu nowego klucza
oznaczałoby, że "Resetuj grę" po cichu go nie wyczyści.

| Klucz                        | Zawartość                                              | Wprowadzony |
|-------------------------------|--------------------------------------------------------|---|
| `scraper_progress_v1`         | `boolean[100]` — ukończone poziomy (było `[50]` do pkt 29) | pkt 2, rozszerzone pkt 29 |
| `scraper_bestdist_v1`         | `number` — rekord dystansu w trybie wolnym              | pkt 2 |
| `scraper_volume_v1`           | `number` (0–100) — głośność                             | pkt 2 |
| `scraper_lang_v1`             | `string` — kod wybranego języka                         | pkt 6 |
| `scraper_coins_v1`            | `number` — saldo monet                                  | pkt 15 |
| `scraper_diamonds_v1`         | `number` — saldo diamentów                              | pkt 22 |
| `scraper_skins_v1`            | `string[]` — id posiadanych skinów                      | pkt 16 |
| `scraper_equippedskin_v1`     | `string` — id założonego skina                          | pkt 16 |
| `scraper_achievements_v1`     | `string[]` (jako Set) — id odblokowanych osiągnięć       | pkt 21 |
| `scraper_totalcoins_v1`       | `number` — monety zarobione łącznie (tylko rośnie)       | pkt 21 |
| `scraper_totaldistance_v1`    | `number` — dystans przebyty łącznie (tylko rośnie)       | pkt 23 |
| `scraper_coopruns_v1`         | `number` — liczba ukończonych biegów Kooperacji          | pkt 23 |
| `scraper_versusruns_v1`       | `number` — liczba ukończonych biegów Rywalizacji         | pkt 23 |
| `scraper_missions_v1`         | `string[]` (jako Set) — id ukończonych misji stałych     | pkt 23 |
| `scraper_dailymeta_v1`        | obiekt — data/wylosowane misje dzienne/postęp/ukończone  | pkt 23 |
| `scraper_challengemeta_v1`    | obiekt — data/cele/modyfikatory/nagroda Wyzwania dnia    | pkt 25 |
| `scraper_boosters_v1`         | obiekt `{coins2x,slowmo,small,heart: number}` — posiadane podwajacze | pkt 31 |
| `scraper_abilities_v1`        | obiekt `{shield,invis,pulse: number}` — posiadane umiejętności | pkt 32 |
| `scraper_totaldiamonds_v1`    | `number` — diamenty zdobyte łącznie (tylko rośnie)      | pkt 37.1 |
| `scraper_cratesopened_v1`     | `number` — liczba otwartych skrzynek łącznie             | pkt 37.1 |
| `scraper_abilityuses_v1`      | `number` — liczba aktywacji umiejętności klawiszami 1/2/3 | pkt 37.1 |
| `scraper_pickupscollected_v1` | `number` — liczba zebranych na planszy skrzynek umiejętności | pkt 37.1 |
| `scraper_boosterruns_v1`      | `number` — liczba biegów rozpoczętych z aktywnym podwajaczem | pkt 37.1 |
| `scraper_challengesdone_v1`   | `number` — liczba w pełni odebranych Wyzwań dnia         | pkt 37.1 |
| `scraper_level_v1`            | `number` — poziom gracza (meta-progresja, domyślnie `1`) | pkt 41 |
| `scraper_exp_v1`               | `number` — bieżące EXP w obrębie aktualnego poziomu      | pkt 41 |

Wszystkie odczyty/zapisy są opakowane w `try/catch` (bezpieczne, gdyby
`localStorage` był niedostępny, np. w trybie prywatnym).

**Historia nazw kluczy:** gra nazywała się wcześniej "Unik" i klucze miały
prefiks `unik_` (`unik_progress_v2`, `unik_lang_v1`, `unik_volume_v1`,
`unik_bestfree_v1`). Po zmianie nazwy na "Scraper" **zmieniono też prefiksy
kluczy** — oznacza to, że stary zapisany postęp z wersji "Unik" **nie jest
migrowany** i zacznie się od zera pod nowymi kluczami. To świadoma decyzja
(czysty start przy rebrandingu), ale warto o tym pamiętać.

---

## 8. Wizualia

- Canvas 420×600, ciemny neonowy motyw (`--bg-deep`, `--bg-mid`, kolory
  akcentów: `--ball` turkus, `--p2` pomarańcz, `--gold`, `--boss` czerwień).
- **Dwie warstwy gwiazd (paralaksa)** w tle — dalsza (mała, wolna) i bliższa
  (większa, szybsza), obie przyspieszają wraz z `currentSpeed`
  (`starBoost = 0.4 + currentSpeed*0.12`).
- **Winieta zależna od prędkości** — subtelny gradient na krawędziach canvasu,
  który się nasila wraz ze wzrostem `currentSpeed` (poczucie przyspieszenia).
- **Poświata kulki gracza pulsuje** (`shadowBlur` modulowany `sin(now*0.005)`).
- **Nietykalność w coopie** — gracz miga (zmienna `globalAlpha` modulowana
  sinusem) przez czas trwania `invulnerableUntil`.
- **Flash przy zderzeniu** — czerwony błysk całego ekranu (`#hitFlash`,
  CSS animacja `flashAnim`).
- **Tryb boss** — pulsujący czerwony obrys wokół całej planszy
  (`.stage.boss-mode`, CSS `@keyframes bossPulse`) + delikatny czerwony
  gradient w tle canvasu + tag "⚠ BOSS" w HUD.
- Przeszkody mają gradient + `shadowBlur` (delikatny "glow").
- **Linia mety — USUNIĘTA** (patrz sekcja 3.1, pkt 4). Jeśli ktoś będzie
  szukał w historii/backupach kodu fragmentów `finishLine`, `finishApproachDistance`
  — to jest celowo wykasowane, nie przywracać bez wyraźnej prośby.

---

## 9. PWA / "uruchamianie jak aplikacja"

- Dodano tagi w `<head>`: `apple-mobile-web-app-capable`, `theme-color`,
  `<link id="pwaManifest" rel="manifest">`.
- W JS (na starcie IIFE) generowany jest **manifest jako data URI** (JSON z
  `name`, `display: "standalone"`, ikoną SVG zakodowaną w base64) i
  podpinany dynamicznie pod `#pwaManifest`.
- **Ograniczenie, o którym user został poinformowany:** to nie tworzy
  prawdziwej aplikacji desktopowej/mobilnej (.exe/.apk) — to tylko
  umożliwia zainstalowanie strony jako PWA (ikona, okno bez paska adresu),
  i to głównie gdy strona jest hostowana online (HTTPS), nie przy otwieraniu
  lokalnego pliku `file://`. Jeśli user chce prawdziwą appkę, trzeba by to
  spakować np. Electronem/Tauri.
- **Aktualizacja 2026-08-14: hosting online faktycznie zrobiony** — patrz
  pkt 52 (GitHub + Netlify, `scraper-game.netlify.app`).

---

## 10. Znane niedociągnięcia / rzeczy do sprawdzenia w Claude Code

To są rzeczy, które warto zweryfikować / dokończyć przy dalszej pracy:

1. ~~Zweryfikować, czy `playScorePing()` jest jeszcze gdzieś wołane.~~
   **Zrobione w pkt 16** — funkcja odwoływała się do nigdy niezadeklarowanej
   zmiennej `score` i to właśnie ona powodowała zawieszanie się gry w trybach
   innych niż `single`; usunięta razem z martwym blokiem, który ją wołał.
2. **Naprawiony właśnie bug:** licznik dystansu w HUD (`distanceRef`)
   aktualizował się TYLKO w trybie `single` — w `freeplay`/`coop`/`versus`
   dystans się liczył wewnętrznie (do rampy trudności), ale nie był
   wyświetlany, przez co wyglądało to jakby "nie działało" (user zgłosił to
   jako "nie działa naliczanie dystansu, wywala grę"). Poprawka: aktualizacja
   HUD dystansu przeniesiona poza blok `if (mode === 'single')`, teraz działa
   dla wszystkich trybów. **Warto to przetestować ręcznie we wszystkich 4
   trybach**, żeby potwierdzić, że faktycznie nic już "nie wywala gry" — nie
   udało się jednoznacznie zreprodukować/zlokalizować twardego JS-crasha,
   więc możliwe, że problem był wyłącznie wizualny (HUD pokazujący "0"), ale
   warto to zweryfikować w konsoli przeglądarki (DevTools → Console) pod
   kątem ewentualnych wyjątków.
3. ~~Plik jest monolityczny.~~ **Zrobione w pkt 18** — podzielony na
   `index.html` / `style.css` / `game.js` / `i18n.js`.
2. **Tłumaczenia CJK** (zh/ko/ja) nie były weryfikowane przez native
   speakera — do przejrzenia.
3. **Brak testów automatycznych** — cała weryfikacja do tej pory to ręczne
   sprawdzanie składni JS (`node -e "new Function(...)"`) i liczenie
   tagów `<div>`. Warto rozważyć chociaż podstawowe testy jednostkowe dla
   czystych funkcji (`levelConfig`, `firstIncompletePage`, `t()`).
4. **PWA jest tylko częściowo funkcjonalne** — patrz sekcja 9, wymaga
   hostingu HTTPS żeby faktycznie zadziałało jako instalowalna appka.
5. **Balans trudności** nie był testowany "in extenso" — formuły w
   `levelConfig` i stałe rampy (`SPEED_RAMP_K`, `INTERVAL_RAMP_K`,
   `MIN_INTERVAL`) są wartościami dobranymi "na oko", nie playtestowane
   długo. Prawdopodobnie do dostrojenia po realnym testowaniu.
6. **Multiplayer wymaga jednej klawiatury** — nie ma trybu online / dwóch
   urządzeń.

---

## 11. Chronologia zmian (skrót, dla kontekstu)

1. Prosta gra: kulka unika spadających przeszkód (jeden typ przeszkody).
2. Dodano 4 typy przeszkód, sterowanie WSAD+strzałki (4 kierunki), muzykę
   proceduralną, drag na dotyku.
3. Dodano pełne menu główne: Singleplayer (10 poziomów, odblokowywanie,
   złota ramka za ukończenie) / Multiplayer (2 kulki, WSAD vs strzałki) / Exit.
4. Rozbudowa: 50 poziomów w 5 stronach z paginacją, poziomy boss (10/20/30/40/50,
   czerwona ramka + korona, dłuższe/trudniejsze), Multiplayer podzielony na
   Kooperację (wspólne życia) i Rywalizację (kto pierwszy przegra).
5. Dodano ekran Ustawień (głośność) między Multiplayer a Exit, oraz wybór
   trybu w Singleplayer: Poziomy / Tryb wolny (z zapisywanym rekordem).
6. Dodano pełny system 10 języków (i18n) z wyborem w Ustawieniach.
7. **Zmieniono mechanikę poziomów z punktowej na dystansową** (patrz sekcja
   3.1) — kilka iteracji, łącznie z dodaniem i finalnym usunięciem wizualnej
   linii mety.
8. Dodano: pauzę w singleplayerze (z dostępem do głośności/języka), osobną
   muzykę menu (różną od gameplayowej), zmieniono nazwę gry na "Scraper"
   (spójną we wszystkich językach), poprawki wizualne (druga warstwa gwiazd,
   pulsująca poświata, winieta prędkości), przełączenie wyniku w
   coop/versus/freeplay z punktów na dystans, oraz podstawy PWA
   (manifest/ikona do instalacji jako "appka").
9. **Ostatnia poprawka:** usunięcie linii mety (poziom kończy się od razu po
   `distance >= target`) oraz naprawa wyświetlania dystansu w HUD dla
   trybów freeplay/coop/versus (wcześniej aktualizowało się tylko w trybie
   `single`).

---

## 12. Szybka mapa funkcji w kodzie (do nawigacji)

- `showScreen(el)` / `showGameUI(show)` — przełączanie widoczności ekranów
  menu vs. canvas gry; steruje też muzyką menu/gameplay.
- `applyStaticTranslations()` — re-render wszystkich statycznych tekstów po
  zmianie języka.
- `levelConfig(levelNumber)` — generuje parametry trudności dla poziomu.
- `renderLevelGrid()` — rysuje siatkę 10 kafelków poziomów dla bieżącej strony.
- `startLevel(index)` / `startFreeplay()` / `startMultiplayer(kind)` —
  inicjalizacja poszczególnych trybów gry (HUD, gracze, reset stanu).
- `resetRun()` — reset stanu przed każdym uruchomieniem/restartem rozgrywki.
- `spawnObstacle()` — losowanie i tworzenie nowej przeszkody.
- `loop(now)` — **główna pętla gry** (ruch graczy, ramp trudności, spawn,
  kolizje, warunek wygranej, wywołanie `draw()`).
- `draw(now)` — całe renderowanie canvasu (tło, gwiazdy, przeszkody, gracze).
- `finishRun(hitPlayer, reason)` — obsługa przegranej (single/coop/versus/freeplay).
- `winLevel()` — obsługa wygranej w trybie `single` (zapis postępu, fanfary).
- `openPause()` / `closePause()` — pauza w single/freeplay.
- `setVolume(v)` / `setLanguage(code)` — współdzielone settery dla
  Ustawień i Pauzy.
- `t(key, vars)` — pobranie przetłumaczonego tekstu z podstawieniem zmiennych.

---

## 13. Sugerowane następne kroki (propozycje, nic z tego nie jest zrobione)

- ~~Podział pliku na moduły.~~ Zrobione, patrz pkt 18.
- Power-upy (tarcza, zwolnienie czasu, magnes) — zgłaszane jako pomysł, ale
  nigdy nie zaimplementowane.
- ~~Unikalne wzorce przeszkód na poziomach boss.~~ Zrobione w pkt 20 —
  przeszkoda `beam` (laser bossa) pojawia się wyłącznie na poziomach
  10/20/30/40/50.
- ~~Skiny/kolory kulki jako nagroda za progres.~~ Zrobione, patrz pkt 15/19
  (skiny bossowe odblokowywane automatycznie za pokonanie bossa).
- Testy jednostkowe dla czystych funkcji.
- Weryfikacja tłumaczeń zh/ko/ja przez native speakera.
- Rozważenie prawdziwego packagingu (Electron/Tauri) jeśli user faktycznie
  chce natywną aplikację desktopową, a nie tylko PWA.

---

## 14. Restyle UI — motyw "konsoli pokładowej" (2026-07-07)

**Kontekst:** po ręcznym przetestowaniu gry w przeglądarce (wszystkie 4 tryby
działały poprawnie, dystans liczy się wszędzie, brak błędów w konsoli — patrz
pkt 10.2, uznane za zweryfikowane) user zgłosił, że wygląd UI (płaskie
przyciski, domyślne selecty/suwaki) "wygląda na lata 70" i poprosił o
odświeżenie grafiki.

**Proces:** zamiast od razu edytować kod, przygotowano najpierw wizualną
propozycję jako osobny artefakt HTML (mockup poza plikiem gry) do akceptacji.
Odrzucono generyczny kierunek "glassmorphism" (gradienty fioletowo-niebieskie,
zaokrąglone szklane karty — bardzo częsty, "AI-owy" domyślny wygląd) na rzecz
koncepcji dosłownie związanej z nazwą gry: **interfejs jako wyświetlacz
systemu antykolizyjnego statku ("konsola pokładowa")**. User zaakceptował ten
kierunek bez zmian i polecił wdrożenie bezpośrednio w `scraper (1).html`.

**Co zostało zmienione (wyłącznie CSS w `<style>` + 3 literały koloru w JS,
zero zmian w logice gry/strukturze HTML):**

- **Paleta:** `--bg-deep`/`--bg-mid` pociemnione i lekko ochłodzone
  (`#090c14` / `#121a2c`), dodano `--panel-2` (`#182338`) i `--panel-edge`
  (`#2c3a5c`, stalowo-niebieski, do ramek/obramowań). Kolory rozgrywki
  (`--ball` turkus, `--p2` pomarańcz, `--gold`, `--boss` czerwień) **celowo
  nietknięte** — to jest tożsamość kulki/graczy/bossów, restyle dotyczy tylko
  otoczenia UI.
- **Typografia:** dodano dwie zmienne fontowe — `--font-display` (stos
  monospace systemowy: Cascadia Code / SF Mono / Consolas / Menlo, bez
  zewnętrznych fontów/CDN, więc offline-safe) używany na nagłówkach, HUD-zie,
  przyciskach i kafelkach poziomów (efekt "odczytu technicznego"); oraz
  `--font-body` (dotychczasowy Segoe UI/system-ui) zostawiony na opisach, żeby
  nie stracić czytelności.
- **Narożne uchwyty ("bracket frame"):** każdy ekran menu (`.screen`) i każdy
  overlay (`.overlay`, czyli wynik/pauza) dostał pseudo-element `::after` z
  8 mini-gradientami tworzącymi 4 narożne "celowniki" w kolorze `--ball` —
  czysto CSS, bez dodatkowych elementów w DOM (bo dokładnie w danej chwili
  widoczny jest zawsze tylko jeden taki panel, więc nie ma konfliktu
  "za dużo akcentu naraz").
- **Subtelny scanline** na ekranach menu (`.screen::before`, powtarzający się
  poziomy gradient + wolna animacja 9s), wyłączony w overlayach (żeby wynik/
  pauza nie migały) i respektujący `prefers-reduced-motion`.
- **Przyciski** (`.menu-btn`, `.btn`) przeprojektowane z płaskich wypełnień na
  "przełączniki HUD": ciemne tło z delikatnym gradientem, kolorowa "zakładka"
  4px po lewej krawędzi (turkus dla primary, pomarańcz dla secondary, brak
  dla ghost), unoszenie + poświata przy hover, przejścia CSS.
- **Płynne przejścia ekranów:** `.screen`/`.overlay` mają teraz
  `opacity`/`transform:scale` z transition zamiast twardego
  `display:none → flex` — JS nadal tylko przełącza klasę `.show`, nic w JS
  nie trzeba było zmieniać.
- **Suwak głośności i `<select>` języka** przestylowane własnym wyglądem
  (custom thumb/track dla `input[type=range]` przez `::-webkit-slider-thumb`
  / `::-moz-range-thumb`, ciemny select) zamiast domyślnego wyglądu
  przeglądarki.
- **Kafelki poziomów:** zablokowane mają przerywaną ramkę zamiast tylko
  zmniejszonej opacity, ukończone/boss zachowały złoty/czerwony akcent ale
  ciszej (mniejszy blur poświaty), dodano hover.
- **PWA:** kolor tła/motywu w `<meta name="theme-color">` oraz w
  wygenerowanym manifeście (`background_color`/`theme_color`) i w ikonie SVG
  zaktualizowane do nowego `#090c14`, żeby było spójne z resztą.
- Dodano subtelny custom scrollbar dla `.screen` (na wypadek długiej treści,
  np. długiej etykiety strony w wyborze poziomu).

**Zweryfikowane po zmianie:** zbalansowanie `<div>` (19 otwierających / 19
zamykających — bez zmian, bo nie ruszano HTML), wizualnie w przeglądarce.
**Nie udało się** zweryfikować składni JS narzędziem (`node -e "new
Function(...)"`) w tej sesji, bo w środowisku brak `node` w PATH — ryzyko i
tak minimalne, bo zmiany w JS ograniczyły się do 3 literałów hex koloru
(`#0b0f1a` → `#090c14`) bez zmiany struktury kodu. **Warto przy następnej
sesji (jeśli dostępny `node`) przepuścić ten sam syntax-check co w pkt 1.**

**Nie zostało zrobione (świadomie, poza zakresem tej zmiany):**
- Canvas gry (rysowanie kulki/przeszkód/gwiazd/winiety w `draw()`) — restyle
  dotyczył tylko chromu UI (menu/HUD/overlay), nie samego renderowania
  rozgrywki na `<canvas>`.
- Motyw jasny — zostaje na stałe ciemny, to świadoma decyzja zgodna z
  charakterem gry (tak było już wcześniej, restyle tego nie zmienia).

**Drobna nieścisłość zauważona przy okazji:** ten dokument w pkt 1 odnosi się
do pliku jako `scraper.html`, ale realny plik w folderze nazywa się
`scraper (1).html` (ze spacją i "(1)" w nazwie — prawdopodobnie artefakt
pobrania/duplikatu). Nie zmieniano nazwy pliku — jeśli będzie przeszkadzać
przy dalszej pracy (np. w komendach shell wymagających cudzysłowu przez
spację), warto rozważyć zmianę nazwy na `scraper.html`.

---

## 15. System ekonomii — waluta w grze (2026-07-08)

**Kontekst:** user poprosił o dodanie własnej waluty do gry: zarabianie monet
za przebyty dystans, z podsumowaniem na ekranie wyniku dla trybu wolnego i
poziomów po przegranej.

**Co zostało dodane:**

- **Nowa stała waluta**, zapisywana trwale w `localStorage` pod kluczem
  **`scraper_coins_v1`** (wzorowana na istniejącym `scraper_bestdist_v1` —
  `loadCoins()`/`saveCoins()`, opakowane w `try/catch`).
- **Formuła zarobku:** `coinsForDistance(d) = floor(d / COIN_METERS_PER_COIN)`,
  gdzie `COIN_METERS_PER_COIN = 20` (stała, do dostrojenia balansu w
  przyszłości) — 1 moneta za każde 20 m przebytego dystansu.
- **Kiedy nalicza się moneta (funkcja `addCoins(n)`, wywoływana w
  `finishRun()` i `winLevel()`):**
  - tryb `single` — **zarówno przy przegranej, jak i przy wygranej**
    poziomu (user prosił wyraźnie tylko o "poziomy po przegranej", ale
    dodano też przy wygranej dla spójności — to jedyne rozszerzenie poza
    dosłowną prośbę, do ewentualnej korekty jeśli niepożądane);
  - tryb `freeplay` — zawsze po zakończeniu biegu.
  - **Coop i versus celowo pominięte** (user nie prosił o ekonomię w
    multiplayerze) — `overCoins` w tych gałęziach `finishRun()` jest czyszczony
    (`overCoinsEl.textContent = ''`).
- **UI:**
  - Nowy wiersz `#overCoins` w overlayu wyniku (`#overlay`), tuż pod
    `#overText`, kolor `--gold`, tekst z klucza i18n `overlay_coins_earned`
    (dwa placeholdery: `{coins}` — zarobek z tego biegu, `{total}` — saldo
    po doliczeniu). Pusty `<p>` (coop/versus) jest ukrywany czysto przez CSS
    (`.overlay p:empty { display:none; }`), żeby nie zostawiać dziury w
    layoucie.
  - Nowy wiersz `#mainMenuCoins` na ekranie głównym (pod podtytułem), tekst z
    klucza `mainMenu_coins` (`🪙 {n}`), aktualizowany przez `updateCoinsHud()`
    — wołane po każdym `addCoins()` oraz w `applyStaticTranslations()` (więc
    saldo odświeża się też przy zmianie języka i przy starcie gry).
- **i18n:** dodano klucze `mainMenu_coins` i `overlay_coins_earned` do
  **wszystkich 10 języków** (pl/en/de/fr/it/es/pt/zh/ko/ja), zgodnie z
  ustaloną konwencją pełnego pokrycia tłumaczeń.

**Nie zostało zrobione / świadomie poza zakresem:**
- Sklep / wydawanie monet — na razie waluta tylko się zbiera, nie ma jeszcze
  żadnego zastosowania (skiny, power-upy z sekcji 13 to naturalne miejsce na
  wydawanie w przyszłości).
- Zarobek w coop/versus.
- Balans (`COIN_METERS_PER_COIN = 20`) dobrany "na oko", nie przetestowany
  długo — do dostrojenia po realnym graniu, podobnie jak stałe rampy
  trudności (patrz pkt 10.5).

**Weryfikacja w tej sesji:** `node`/`python3` niedostępne w środowisku (jak w
poprzedniej sesji), więc składnia JS nie została zweryfikowana automatycznie
— zamiast tego wykonano ręczny przegląd wszystkich zmienionych fragmentów
(blok CURRENCY, `finishRun`, `winLevel`, 10 bloków I18N) pod kątem
zbalansowania nawiasów/przecinków. Zmiany w HTML ograniczone do dwóch nowych
`<p>` (parowane tagi, bez wpływu na bilans `<div>`). Gra otwarta w
przeglądarce do ręcznego testu przez usera — **do potwierdzenia:** zarobek i
saldo działają poprawnie we wszystkich 3 objętych trybach (poziomy-porażka,
poziomy-wygrana, freeplay).

---

## 16. Naprawa zawieszania się Multiplayera + Sklep za monety ze skinami (2026-07-09)

**Kontekst:** user zgłosił, że tryb Multiplayer "zacina się po kilku
sekundach od startu", oraz poprosił o dodanie sklepu, w którym za monety
(zebrane w systemie ekonomii z pkt 15) będzie można kupować skiny kulki —
same skiny (więcej kolorów/wzorów) mają być dogrywane w przyszłości, ale
mechanizm sklepu (kupno/zakładanie/zapis) miał powstać już teraz.

### 16.1. Bug: zawieszanie się gry w trybach innych niż `single`

**Przyczyna znaleziona w `loop()`:** przy usuwaniu przeszkody, która zjechała
poza ekran, był wywoływany fragment:
```js
if (mode !== 'single'){
  score += 1;
  if (scoreRef) scoreRef.textContent = score;
  playScorePing();
}
```
Zmienne **`score` i `scoreRef` nigdy nie zostały nigdzie zadeklarowane** — to
martwy relikt sprzed przejścia na system dystansowy (patrz pkt 3.1). `score
+= 1` rzuca `ReferenceError`, co **ubija całą pętlę `requestAnimationFrame`
bez żadnego komunikatu widocznego dla gracza** — wygląda to dokładnie jak
"zawieszenie się" gry, mniej więcej w chwili, gdy pierwsza przeszkoda zjedzie
poza dół planszy (stąd "po kilku sekundach od startu"). Bug dotyczył
**wszystkich trybów innych niż `single`** (freeplay, coop, versus), nie tylko
Multiplayera — user zgłosił to akurat przy Multiplayerze.

**Naprawa:** usunięto cały ten blok (zostało tylko `obstacles.splice(i,1)`)
oraz usunięto funkcję `playScorePing()`, która po tej zmianie stała się
całkowicie martwym kodem (nie była wywoływana z żadnego innego miejsca) — to
dokładnie pozycja z pkt 10.1 ("zweryfikować, czy `playScorePing` jest jeszcze
gdzieś wołane"), teraz zamknięta.

### 16.2. Sklep za monety + system skinów kulki

**Nowy ekran `#shopScreen`** ("Sklep"), dostępny z menu głównego (nowy
przycisk między "Multiplayer" a "Ustawienia"). Pokazuje saldo monet i listę
skinów (`#skinList`) w stylu spójnym z resztą UI (obramowania `--panel-edge`,
font `--font-display`).

- **Dane skinów** — tablica `SKINS` (id, klucz i18n nazwy, cena, kolor,
  poświata): `default` (Turkus, cena 0, domyślnie posiadany), `coral`
  (Koral, 50), `violet` (Fiolet, 120), `amber` (Bursztyn, 250). To są
  realne, działające kolory kulki — nie tylko rusztowanie pod przyszłą
  zawartość. **Rozszerzanie o kolejne skiny (patterny, tekstury) w
  przyszłości sprowadza się do dopisania wpisu do `SKINS`** — cała reszta
  (kupno/zakładanie/zapis/i18n) jest już gotowa i nie wymaga zmian.
- **Trwały zapis:** posiadane skiny w `localStorage` pod kluczem
  **`scraper_skins_v1`** (tablica id, domyślnie `['default']`), założony
  skin pod kluczem **`scraper_equippedskin_v1`** (domyślnie `'default'`).
  Oba opakowane w `try/catch`, wzorem reszty zapisów.
- **Logika:** `buySkin(id)` — odejmuje cenę od `coins` (tylko jeśli nie
  posiadany i stać gracza), dopisuje do posiadanych. `equipSkin(id)` —
  przełącza aktywny skin (tylko jeśli posiadany). `renderShop()` — buduje
  listę wierszy z etykietą stanu (Posiadane / Założone) i przyciskiem
  (Kup za X / Załóż / Założone-wyszarzone), wołane przy wejściu do sklepu
  oraz przy zmianie języka (`applyStaticTranslations()`).
- **Zastosowanie skina:** aktywny skin wpływa na kolor/poświatę kulki **tylko
  w trybach `single` i `freeplay`** (`startLevel`/`startFreeplay` pobierają
  `currentSkinColors()` zamiast twardo zakodowanego turkusu). **Multiplayer
  (coop/versus) celowo pominięty** — kolory 🟢/🟠 tam identyfikują gracza
  (spójne z legendą sterowania), przeskórowanie by to zaburzyło.
- **i18n:** dodano klucze `btn_shop`, `shop_title`, `shop_subtitle`,
  `skin_default/coral/violet/amber`, `skin_owned`, `skin_equipped`,
  `btn_buy_price`, `btn_equip`, `btn_equipped` do **wszystkich 10 języków**,
  zgodnie z ustaloną konwencją pełnego pokrycia.

**Nie zostało zrobione / świadomie poza zakresem:**
- Same "docelowe" skiny (grafiki/wzory) — user wyraźnie powiedział, że dołoży
  je później; obecne 3 płatne kolory to działający, ale tymczasowy zestaw.
- Skiny dla kulek w multiplayerze.
- Balans cen (50/120/250 monet) dobrany "na oko", nieprzetestowany — jak
  wszystkie inne stałe balansu w tym projekcie (pkt 10.5, 15).

**Weryfikacja w tej sesji:** `node`/`python3` nadal niedostępne w tym
środowisku (Windows, brak node/npm, `python3`/`py` to tylko winletowe
"stub" aliasy do Store, nie prawdziwy interpreter) — zamiast tego
zweryfikowano strukturalnie przez `perl`: zbalansowanie nawiasów **w samym
bloku `<script>`** (`{}` 462/462, `()` 1042/1042, `[]` 48/48) oraz
zbalansowanie `<div>` w całym pliku (21/21, +2 względem poprzedniej sesji —
dokładnie tyle, ile dodano: `#shopScreen` i `#skinList`). Brak w tym
środowisku narzędzia do automatyzacji przeglądarki (nie znaleziono
`chromium-cli` ani żadnego innego drivera) — gra została otwarta w
domyślnej przeglądarce (`explorer.exe`) do ręcznego testu przez usera.
**Do potwierdzenia przez usera:** (1) Multiplayer (coop i versus) faktycznie
już się nie zawiesza po kilku sekundach; (2) sklep — zakup, założenie i
zapisanie po odświeżeniu strony działają poprawnie; (3) wybrany skin faktycznie
zmienia kolor kulki w Poziomach i Trybie wolnym.

---

## 17. Animacja wjazdu kulek + przeprojektowanie sklepu na karuzelę + 10 skinów (2026-07-09, część 2)

**Kontekst:** w tej samej sesji, zaraz po naprawie zawieszania się i
pierwszej wersji sklepu (pkt 16), user poprosił o trzy kolejne rzeczy: (1)
animację wjazdu kulek od dołu ekranu na start każdego trybu, zanim gracz
przejmuje sterowanie; (2) przeprojektowanie sklepu z listy na karuzelę —
jedna kulka na ekranie, strzałki do przewijania, przycisk kup/załóż; (3)
rozszerzenie z 4 do **10 skinów**, z czego 5 odblokowywanych za pokonanie
kolejnych poziomów bossów (10/20/30/40/50), a nie za monety — i żeby te
"bossowe" były ciekawszymi wzorami (piłka nożna, kula disco itp.), nie tylko
kolorami.

### 17.1. Animacja wjazdu kulek ("intro")

- Nowy stan gry: `introActive` (bool), `introStart` (timestamp), stała
  `INTRO_DURATION = 700` (ms).
- `resetRun()` (wspólny dla wszystkich trybów: `single`, `freeplay`, `coop`,
  `versus`) po utworzeniu graczy zapamiętuje ich docelowe `y` jako
  `p.introToY`, po czym przestawia ich faktyczne `y` na `H + 40` (czyli
  wizualnie poniżej dolnej krawędzi planszy — canvas naturalnie przycina
  rysowanie poza swoimi granicami, więc kulki nie są widoczne, dopóki nie
  "wjadą" w kadr).
- `loop()` na samym starcie sprawdza `introActive`: jeśli tak, interpoluje
  `p.y` między `H+40` a `p.introToY` z easingiem `easeOutCubic` (szybki
  start, płynne wyhamowanie przy dojechaniu na miejsce), aktualizuje ślad
  (`trail`) i gwiazdy w tle (wolniejszy ruch niż w pełnej rozgrywce), rysuje
  klatkę i **wychodzi wcześniej** — bez spawnowania przeszkód, kolizji,
  naliczania dystansu i **bez reagowania na sterowanie** (strzałki/WASD/drag
  są po prostu ignorowane, bo ta gałąź nigdy nie dochodzi do kodu ruchu
  gracza). Po `INTRO_DURATION` ms `introActive` wraca na `false`, `p.y`
  zostaje dociśnięte dokładnie do `introToY`, i gra rusza normalnie od
  kolejnej klatki.
- Dotyczy to **wszystkich 4 trybów** (jeden wspólny punkt wejścia —
  `resetRun()` — więc nie trzeba było duplikować logiki w
  `startLevel`/`startFreeplay`/`startMultiplayer`).

### 17.2. Sklep — z listy na karuzelę

Ekran `#shopScreen` przeprojektowany z przewijanej listy 4 wierszy na
pojedynczy podgląd + strzałki, zgodnie z życzeniem usera:

- **Podgląd:** własny mały `<canvas id="skinPreviewCanvas">` (140×140),
  renderowany własną pętlą `requestAnimationFrame` (`shopPreviewLoop` /
  `drawShopPreview`) **tylko gdy ekran sklepu jest widoczny** — pętla jest
  startowana/zatrzymywana centralnie w `showScreen()` (odpalana, gdy
  `el === shopScreen`, anulowana w każdym innym przypadku), więc działa to
  poprawnie niezależnie od tego, którą ścieżką user wejdzie/wyjdzie ze
  sklepu, bez potrzeby obsługi tego osobno w każdym miejscu nawigacji.
- **Strzałki ◀ ▶** (`#shopPrevBtn` / `#shopNextBtn`) przewijają
  `shopIndex` po tablicy `SKINS` (0–9), zablokowane na końcach (ten sam wzorzec
  co paginacja poziomów). Wejście do sklepu (`btnShop`) ustawia `shopIndex`
  od razu na aktualnie założony skin, żeby user widział to, co ma na sobie.
- **Jeden przycisk akcji** (`#shopActionBtn`) zmienia się kontekstowo:
  "Kup — X 🪙" (nieaktywny, gdy brakuje monet) → po zakupie "Załóż" → po
  założeniu wyszarzone "Założone". Dla skinów bossowych, które nie są
  jeszcze odblokowane, przycisk pokazuje zamiast ceny wymóg odblokowania
  ("Pokonaj BOSS-a poziomu {level}"), nieaktywny.
- Stara struktura (`.skin-list`/`.skin-row`/`.skin-swatch`/`.skin-buy-btn`)
  została **usunięta** z CSS i JS (`renderShop()` przepisane od zera), nowe
  klasy: `.shop-preview`, `.shop-arrow`, `#skinPreviewCanvas`,
  `.shop-skin-name`, `.shop-skin-state`.

### 17.3. 10 skinów: 5 za monety + 5 za bossów, z realnym rysowaniem wzorów

Tablica `SKINS` rozszerzona do 10 wpisów z polem `kind: 'coin' | 'boss'`:

| Skin | Rodzaj | Cena / wymóg | `type` (renderer) |
|---|---|---|---|
| Turkus (`default`) | moneta | 0 (posiadany od startu) | `solid` |
| Koral | moneta | 60 | `solid` |
| Fiolet | moneta | 140 | `solid` |
| Bursztyn | moneta | 260 | `solid` |
| Szmaragd | moneta | 420 | `solid` |
| Piłka nożna | boss | pokonaj poziom 10 | `soccer` |
| Kula disco | boss | pokonaj poziom 20 | `disco` |
| Ognista kula | boss | pokonaj poziom 30 | `fire` |
| Galaktyczna kula | boss | pokonaj poziom 40 | `galaxy` |
| Kula Mistrza | boss | pokonaj poziom 50 | `champion` |

- **Odblokowanie skinów bossowych jest automatyczne**, nie kosztuje monet:
  `syncBossSkinUnlocks()` przegląda `progress[]` (ten sam tablicowy zapis
  postępu poziomów co reszta gry) i dopisuje do `ownedSkins` każdy skin
  bossowy, którego poziom jest ukończony. Wołane raz przy starcie gry
  (zaraz po wczytaniu `ownedSkins`) oraz ponownie w `winLevel()` zaraz po
  `saveProgress()` — więc odblokowanie pojawia się w sklepie natychmiast po
  pokonaniu bossa, bez czekania na przeładowanie strony.
- **Realne rysowanie wzorów, nie tylko kolor:** dodano
  `drawBallShape(ctx, x, y, r, skin, now)`, które przełącza się po
  `skin.type` na jedną z funkcji: `drawSolidBall` (kolory — teraz
  wszystkie, także domyślny turkus i kulki w multiplayerze, dostały
  gradient radialny z jasnym połyskiem u góry i przyciemnioną krawędzią
  przez nowy helper `shadeColor()`, zamiast płaskiego wypełnienia — to jest
  to "trochę poprawione kolory", o które prosił user), `drawSoccerBall`
  (biała kula z czarnymi pięciokątami rysowanymi przez pomocniczy
  `drawPolygon()`, przycięta do koła przez `ctx.clip()`), `drawDiscoBall`
  (siatka "luster" + animowane w czasie błyski, `now`-zależne),
  `drawFireBall` (gradient żółć→pomarańcz→czerwień z migotaniem promienia i
  płomykiem wystającym u góry), `drawGalaxyBall` (ciemny gradient fioletowy
  + migoczące gwiazdki) i `drawChampionBall` (złoty gradient z pulsującym
  połyskiem i cienką jasną obwódką).
- **`makePlayer(skin, control)` zmieniło sygnaturę** (wcześniej
  `makePlayer(color, glow, control)`) — teraz przyjmuje cały obiekt skina;
  gracz przechowuje go jako `p.skin` (zamiast osobnych `p.color`/`p.glow`),
  z niego brane jest zarówno `color`/`glow` (do śladu i poświaty) jak i
  `type` (do wyboru kształtu). W trybach `single`/`freeplay` używany jest
  `getEquippedSkin()` (zastąpił poprzednie `currentSkinColors()`); w
  multiplayerze gracze mają **stałe** obiekty skina typu `solid` w kolorach
  🟢/🟠 (przeskórowanie celowo pominięte — kolor tam identyfikuje gracza,
  patrz pkt 16.2).
- **i18n:** dodano `skin_emerald`, `skin_soccer`, `skin_disco`, `skin_fire`,
  `skin_galaxy`, `skin_champion`, `skin_locked_boss` (z placeholderem
  `{level}`) do wszystkich 10 języków.

**Nie zostało zrobione / świadomie poza zakresem:**
- Skiny w multiplayerze — jak poprzednio, kolory 🟢/🟠 tam pozostają stałe.
- Balans cen monetowych (60/140/260/420) i progi bossów (10/20/30/40/50, czyli
  z definicji te same poziomy co istniejące bossy) nieprzetestowane "na
  żywo" — jak każdy inny balans w tym projekcie.
- Wzory bossowe są uproszczonymi stylizacjami rysowanymi na canvasie (nie
  grafiką/sprite'ami) — świadomy wybór, żeby uniknąć zależności od
  zewnętrznych zasobów graficznych (projekt ma być offline, bez assetów),
  ale przy bardzo małym promieniu kulki (12px w rozgrywce) część detalu
  (np. pięciokąty piłki nożnej) jest z konieczności bardzo drobna — do
  ewentualnej oceny wizualnej przez usera.

**Weryfikacja w tej sesji:** jak poprzednio, brak `node`/`python3`/drivera
przeglądarki w tym środowisku — zweryfikowano strukturalnie przez `perl`
(zbalansowanie `{}` 525/525, `()` 1271/1271 w bloku `<script>`, oraz `<div>`
23/23 w całym pliku, zgodnie z liczbą realnie dodanych/usuniętych divów).
Zweryfikowano też grepem brak martwych odwołań do usuniętych nazw
(`currentSkinColors`, `skinListEl`, stare klasy `.skin-list`/`.skin-row`
itd. — zero trafień). Gra otwarta w domyślnej przeglądarce (`explorer.exe`)
do ręcznego testu przez usera. **Do potwierdzenia:** (1) kulki faktycznie
wjeżdżają od dołu i dopiero potem reagują na sterowanie, we wszystkich 4
trybach; (2) karuzela w sklepie przewija się strzałkami i przycisk
kup/załóż/założone działa poprawnie; (3) po pokonaniu bossa (poziom 10)
odpowiedni skin faktycznie odblokowuje się w sklepie bez odświeżania
strony; (4) wzory bossowe (piłka nożna, disco, ogień, galaktyka, mistrz)
wyglądają czytelnie przy małym rozmiarze kulki w realnej rozgrywce.

---

## 18. Podział monolitycznego pliku na moduły (2026-07-09, część 3)

**Kontekst:** user zapytał "co teraz możemy dodać?", w odpowiedzi
zaproponowano m.in. dwie "porządkowe" (nie-gameplayowe) rzeczy z listy
pkt 10/13 — testy jednostkowe i podział pliku. Po wyjaśnieniu, na czym
polega każda z nich (i zastrzeżeniu, że testów jednostkowych i tak nie da
się tu automatycznie uruchomić bez `node`), user wybrał **podział pliku**,
z uzasadnieniem "jeżeli będzie łatwiej pracować w przyszłości".

**Co zostało zrobione:** `scraper (1).html` (monolityczny, ~1880 linii)
rozbity na 4 pliki, bez ŻADNEJ zmiany logiki/zachowania — czysto
mechaniczne przeniesienie kodu:

- **`style.css`** — dosłowna zawartość dawnego `<style>` w `<head>`, bez
  zmian.
- **`i18n.js`** — wyłącznie dane tłumaczeń: `LANGS` (lista 10 języków) i
  `I18N` (słownik kluczy). To jedyny plik, który **celowo nie jest**
  owinięty w IIFE — deklaruje `const LANGS`/`const I18N` na najwyższym
  poziomie zwykłego (nie-modułowego) `<script>`. Dzięki temu, ponieważ
  klasyczne (nie `type="module"`) tagi `<script>` w jednym dokumencie
  współdzielą jeden zasięg globalny, `game.js` może się do nich odwoływać
  bezpośrednio jako do zwykłych zmiennych — bez `window.LANGS`, bez
  importów, bez zmiany ani jednej linijki logiki, która ich używa.
- **`game.js`** — cała reszta: to samo jedno IIFE `(function(){ ... })()`
  co wcześniej, tylko bez definicji `LANGS`/`I18N` (te zostały w `i18n.js`).
  Wszystkie pozostałe funkcje/zmienne (`t()`, `levelConfig`, `loop`,
  `drawBallShape`, system sklepu, audio, itd.) — bez zmian, jeden do
  jednego przeniesione z oryginalnego pliku.
- **`index.html`** — struktura HTML (te same divy/id co wcześniej, bez
  zmian) + `<link rel="stylesheet" href="style.css">` w `<head>` + dwa
  `<script src="...">` na końcu `<body>`, **w tej konkretnej kolejności:
  najpierw `i18n.js`, potem `game.js`** (kolejność ma znaczenie — `game.js`
  odwołuje się do `LANGS`/`I18N` już przy starcie, m.in. w
  `populateLangSelect(langSelect)` wołanym zaraz po zdefiniowaniu funkcji).

**To jest teraz kanoniczna wersja gry — dalsze zmiany rób w tych 4
plikach, nie w starym.** Nadal działa dokładnie tak samo jak wcześniej:
brak serwera/builda, otwiera się przez podwójne kliknięcie `index.html`
(albo dowolny `file://`), `<link>`/`<script src>` do plików w tym samym
folderze działają poprawnie nawet bez serwera HTTP.

**Stary plik `scraper (1).html` został celowo zostawiony w folderze**,
nietknięty, jako punkt odniesienia/kopia zapasowa na wypadek, gdyby coś
w podziale poszło nie tak — **nie jest już rozwijany i nie trzeba go
aktualizować przy przyszłych zmianach**. Można go bezpiecznie usunąć w
przyszłości, jeśli podział okaże się w pełni stabilny (do decyzji usera).

**Weryfikacja w tej sesji:** dokładnie ta sama metoda co poprzednio
(`node`/`python3` niedostępne) — zbalansowanie nawiasów sprawdzone osobno
w każdym nowym pliku przez `perl`: `game.js` (`{}` 314/314, `()` 1255/1255),
`i18n.js` (`{}` 211/211, `()` 19/19), `style.css` (`{}` 97/97), `index.html`
(`<div>` 23/23 — identycznie jak w oryginalnym pliku przed podziałem, co
potwierdza, że żaden div nie zginął ani nie przybył w trakcie kopiowania).
Zweryfikowano też grepem, że `game.js` **nie** zawiera własnej deklaracji
`const LANGS`/`const I18N` (czyli faktycznie korzysta z tych z `i18n.js`,
a nie z przypadkowo zduplikowanej kopii). Otwarto `index.html` w domyślnej
przeglądarce (`explorer.exe`) do ręcznego testu. **Do potwierdzenia przez
usera:** gra jako całość (wszystkie ekrany, wszystkie 4 tryby, sklep,
zmiana języka, dźwięk) działa identycznie jak w starym pliku — podział był
czysto mechaniczny, więc jeśli coś nie działa, najbardziej prawdopodobna
przyczyna to literówka w nazwie pliku/ścieżce albo zła kolejność
`<script>`, nie błąd logiki.

---

## 19. Grafika skinów "na profesjonalniej" + nowe skiny za monety + nowy silnik muzyczny (2026-07-09, część 4)

**Kontekst:** user poprosił o: (1) nowe skiny za monety, ale lepsze graficznie
niż dotychczasowe płaskie kolory; (2) poprawienie grafiki **wszystkich**
dotychczasowych 10 skinów, żeby wyglądały "profesjonalnie"; (3) dodanie do
nich drobnych efektów; (4) zastąpienie dotychczasowej muzyki (prosty,
powtarzalny rytm nutowy) prawdziwszymi "ścieżkami dźwiękowymi", **innymi** w
rozgrywce i w lobby (menu).

### 19.1. Wspólne "wykończenie" nakładane na KAŻDĄ kulkę

Zamiast poprawiać osobno każdą z 10 istniejących funkcji rysujących, dodano
dwie funkcje działające na poziomie `drawBallShape()`, więc automatycznie
podnoszą jakość zarówno starych, jak i nowych skinów:

- **`addBallFinish(ctx,x,y,r)`** — miękki połysk (specular highlight) w lewym
  górnym rogu kulki + przyciemnienie brzegu (rim shading) w prawym dolnym —
  standardowy trik nadający płaskiemu kołu wygląd bardziej "3D"/szklistej
  kulki zamiast płaskiego kafelka.
- **`addSkinEffect(ctx,x,y,r,skin,now)`** — drobny, **czysto animowany
  funkcją czasu `now`** efekt dla typów, które wcześniej go nie miały
  (`solid` — okresowy ukośny "błysk" przesuwający się po powierzchni;
  `soccer` — wolno krążący mały refleks; `champion` — 3 orbitujące
  iskierki; `fire` — unoszące się w górę zanikające iskry; `galaxy` —
  sporadyczna "spadająca gwiazda" przecinająca kulkę). `chrome`/`prism`/
  `neon`/`disco` mają własny efekt czasowy wbudowany bezpośrednio w swoją
  funkcję rysującą (patrz niżej), więc tutaj są pominięte (no-op) —
  **żaden efekt nie wymaga dodatkowego stanu na graczu** (wszystko liczone
  na bieżąco z `now`, tak jak już wcześniej robiły gwiazdki disco/galaktyki
  — ta sama konwencja, tylko rozszerzona na resztę typów).
- `drawSolidBall()` (bazowy kolor) delikatnie przerobiony — gradient
  jaśniejszy odcień → kolor → ciemniejszy odcień (przez istniejący
  `shadeColor()`), zamiast poprzedniego płaskiego białego "bąbla" na
  środku, bo teraz `addBallFinish()` i tak dokłada właściwy połysk.
- `drawDiscoBall()` — iskierki na przemian białe i **kolorowe** (hue
  cyklicznie zależny od `now`), zamiast wyłącznie białych.

### 19.2. Trzy nowe skiny za monety (lepsza grafika od startu)

Dodane **między** dotychczasowymi kolorami a skinami bossowymi (SKINS ma
teraz 13 wpisów: 8 monetowych + 5 bossowych):

| Skin | Cena | Wygląd |
|---|---|---|
| Chrom (`chrome`) | 560 | Metaliczny gradient liniowy + przesuwający się w pętli jasny "pas odbicia" (jak szczotkowany metal). |
| Pryzmat (`prism`) | 780 | Fioletowy kryształ z liniami fasetowania (6 promieni ze środka) + 4 kolorowe błyski refrakcji zmieniające barwę w czasie (`hsla` z `now`). |
| Neon (`neon`) | 980 | Ciemna kula z pulsującym cyjanowym "obwodem" (linie + łuk) rysowanym z `shadowBlur`, jasność pulsuje sinusoidalnie. |

Każdy ma własną funkcję (`drawChromeBall`/`drawPrismBall`/`drawNeonBall`),
dopisaną do `drawBallShape()`. Ceny kontynuują rosnącą drabinkę z
poprzedniej sesji (0/60/140/260/420 → 560/780/980).

### 19.3. Nowy silnik muzyczny — akordy + bas + (opcjonalnie) perkusja

Stary system (`scaleFreqs`/`musicStep`/`menuMusicStep` — pojedyncza nuta z
tablicy co "tick") **usunięty w całości** i zastąpiony małym sekwencerem
progresji akordów, w 100% proceduralnym (Web Audio API, bez plików audio —
zgodnie z dotychczasową filozofią projektu "offline, bez zewnętrznych
zasobów"):

- **`playPad()`** — akord (3 dźwięki, `triangle`, lekko rozstrojone od
  siebie dla efektu "chóru") z wolnym atakiem, trzymany przez cały takt.
- **`playBass()`** — pojedyncza nuta basowa (`sine`) na start każdego
  akordu.
- **`playHat()`** — perkusjonalne "hi-hat": szum (`noiseBuffer`, jeden
  wspólny bufor białego szumu tworzony raz w `ensureAudio()`) przepuszczony
  przez filtr górnoprzepustowy.
- **`playKick()`** — "stopa": `sine` z gwałtownym glissandem w dół
  częstotliwości, tylko na początku taktu.
- **`stepProgression()`** — wspólna funkcja odtwarzająca jeden "krok"
  dowolnej progresji: co 4 kroki nowy akord (pad + bas + ew. kick), co krok
  jedna nuta z 4-dźwiękowego arpeggio danego akordu (+ ew. hi-hat).

**Trzy różne aranżacje** korzystające z tego samego silnika (różny
zestaw akordów, tempo, instrumentacja i to, czy w ogóle jest perkusja):

- **Menu/lobby** (`MENU_PROGRESSION`, Am-F-C-G) — wolno (480 ms/krok),
  fala `sine`, brak perkusji, cicho — ma brzmieć jak spokojne tło, nie
  rozgrywka.
- **Rozgrywka, tryb normalny** (`GAME_PROGRESSION`, Em-C-G-D — inna
  tonacja/progresja niż menu, celowo) — szybciej (235 ms/krok), fala
  `triangle`, lekka perkusja (hi-hat co krok, kick na początku taktu).
- **Rozgrywka, boss** (`BOSS_PROGRESSION`, Dm-Bb-F-C — tonacja molowa,
  mroczniejsza) — najszybciej (190 ms/krok), fala `sawtooth` (bardziej
  "brudne" brzmienie), głośniejsza/cięższa perkusja — ma brzmieć bardziej
  napięcie/intensywnie.

`startMusic()`/`stopMusic()`/`startMenuMusic()`/`stopMenuMusic()` zachowują
dotychczasową architekturę (jeden `setInterval` na ścieżkę, ta sama logika
przełączania menu ↔ rozgrywka w `showScreen()`/`openPause()`/`closePause()`
co wcześniej) — zmieniła się tylko zawartość tego, co jest odtwarzane w
środku, nie to, kiedy się włącza/wyłącza muzyka. `playHit()` i
`playWinFanfare()` (efekty dźwiękowe, nie muzyka) zostały bez zmian.

### 19.4. i18n

Dodano `skin_chrome`, `skin_prism`, `skin_neon` do wszystkich 10 języków
(`i18n.js`), zgodnie z ustaloną konwencją pełnego pokrycia.

**Nie zostało zrobione / świadomie poza zakresem:**
- Balans cen nowych skinów (560/780/980) nieprzetestowany — jak zawsze,
  dobrany "na oko" w kontynuacji istniejącej drabinki.
- Balans głośności/tempa nowego silnika muzycznego (`padVol`/`bassVol`/
  `leadVol`/`hatVol`/`kickVol` per aranżacja) — wartości dobrane "na
  ucho" bez realnego posłuchania w tej sesji (patrz zastrzeżenie niżej).
- Brak nowych efektów dla `chrome`/`prism`/`neon`/`disco` w
  `addSkinEffect()` — te 4 typy celowo mają swój czasowy efekt wpisany
  bezpośrednio w funkcję rysującą, żeby uniknąć podwójnego rysowania tego
  samego rodzaju błysku dwa razy w dwóch różnych miejscach kodu.

**Weryfikacja w tej sesji:** jak zawsze, brak `node`/`python3` w tym
środowisku. Zweryfikowano strukturalnie przez `perl`: `game.js` (`{}`
363/363, `()` 1491/1491 — wzrost z 314/1255 zgodny z ilością dopisanego
kodu), `i18n.js` (`{}` 211/211, `()` 19/19 — bez zmian w liczbie nawiasów,
bo dodane klucze to tylko nowe pary klucz-wartość w istniejących obiektach,
bez nowych literałów obiektowych). Grepem potwierdzono, że
`drawChromeBall`/`drawPrismBall`/`drawNeonBall` są zdefiniowane i mają
dokładnie jedno odwołanie w `switch` wewnątrz `drawBallShape()` (bez
duplikatów/literówek w nazwach `case`). Otwarto `index.html` w domyślnej
przeglądarce.

**Ważne zastrzeżenie, którego nie da się obejść w tym środowisku:** Claude
nie może "posłuchać" wygenerowanego dźwięku ani ocenić wizualnie animacji w
ruchu — kod audio został zweryfikowany wyłącznie czytając go (poprawność
API Web Audio, poprawność częstotliwości nut, brak literówek), a nie przez
realny odsłuch. **Koniecznie przetestuj ręcznie w przeglądarce:** (1) czy
muzyka w menu, w normalnej rozgrywce i w walce z bossem faktycznie brzmią
wyraźnie inaczej i nie są zbyt głośne/ciche względem siebie i efektów
dźwiękowych (`playHit`/`playWinFanfare`); (2) czy nowe skiny (Chrom,
Pryzmat, Neon) wyglądają dobrze w praktyce przy małym rozmiarze kulki
(12px promienia w rozgrywce, większy podgląd w sklepie); (3) czy
`addBallFinish()`/`addSkinEffect()` nie spowalniają gry (dodatkowe warstwy
rysowania na klatkę dla każdego gracza — przy 1-2 kulkach na ekranie
powinno być bez znaczenia, ale warto potwierdzić na słabszym sprzęcie).

---

## 20. Dwie nowe przeszkody + unikalna przeszkoda tylko na bossach (2026-07-09, część 5)

**Kontekst:** user potwierdził, że wszystko z poprzednich sesji działa
("jest wszystko git"), po czym poprosił o rozszerzenie z 4 do 6 typów
przeszkód (oryginalne, z ciekawą mechaniką), plus siódmą, bardzo trudną i
unikalną przeszkodę widoczną wyłącznie na poziomach bossów.

### 20.1. `spinner` (Wirnik) — dodge przez rotację

Para "grotów" połączonych linią przechodzącą przez wspólny, opadający
środek (`o.x`/`o.y` = pivot). Groty krążą wokół pivota z prędkością kątową
`o.spin` (losowy kierunek, `angle += spin*dt` co klatkę). Kolizja sprawdzana
osobno dla obu grotów przez istniejący `circleCircleHit` (żadnej nowej
matematyki geometrycznej — pozycja grota to zwykłe
`pivot + cos/sin(angle)*bladeReach`). Mechanika: trzeba trafić moment, gdy
szczelina między wirującymi grotami mija gracza — inny rodzaj uniku niż
czysto pozycyjny (block/orb) czy fala (zigzag).

### 20.2. `pulsar` — dodge przez wyczucie czasu, nie pozycji

Różowa kula, przez większość swojego cyklu **nieszkodliwa i mała**
(`o.baseR`), ale co ok. 1.8 s przechodzi przez cykl: **ładowanie** (900 ms,
rosnący pierścień-ostrzeżenie pokazujący z góry, jak duża i gdzie będzie
strefa rażenia) → **pulsacja** (260 ms, `o.curR = o.pulseR`, **jedyne**
okno, w którym `o.lethal === true`) → **wygaszanie** (650 ms, kurczy się z
powrotem). To jedyna zwykła przeszkoda, w której zetknięcie z nią **nie
zawsze** oznacza kolizję — `obstacleHitsPlayer()` sprawdza `o.lethal` przed
testem geometrycznym. Losowy offset startowy fazy (`phaseTimer =
Math.random()*2500`) sprawia, że wiele pulsarów na ekranie nie pulsuje
zgranie w tym samym momencie.

### 20.3. `beam` (laser bossa) — wyłącznie na poziomach 10/20/30/40/50

Zaspokaja wieloletni punkt z listy "do zrobienia" (pkt 13): boss miał do tej
pory tylko wyższy `baseSpeed`/gęstszy spawn, żadnego unikalnego wzorca ataku.

- **Spawnowany na całkowicie osobnym torze** niż reszta przeszkód: nie
  przechodzi przez ważony losowy `randType()`/`spawnObstacle()`, tylko przez
  dedykowany licznik `beamTimer`/`BEAM_INTERVAL = 3200` ms i funkcję
  `spawnBeam()`, wołaną z `loop()` tylko gdy `mode === 'single' &&
  LEVELS[currentLevelIndex].isBoss`. W pozostałych trybach (freeplay/coop/
  versus) nie ma pojęcia "boss", więc `beam` tam **nigdy się nie pojawia** —
  nie trzeba było nic dodatkowo blokować.
- **Odczytuje pozycję `x` gracza raz, w chwili powstania** (`spawnBeam()`
  bierze `players[0].x`) i **dalej jej nie śledzi** — to celowa decyzja
  projektowa: unik jest sprawiedliwy (wystarczy odsunąć się w oknie
  ostrzegawczym), zamiast czuć się jak nieuczciwe "aim-lock" śledzące
  gracza w nieskończoność.
- **Cykl (`o.age`, nie `o.y` — to jedyna przeszkoda, która nie spada):**
  700 ms półprzezroczystej, pulsującej opacity obwódki na **całą wysokość
  planszy** (telegraph) → 220 ms pełnego, jasnego, śmiertelnego rozbłysku
  na całą wysokość (`o.lethal = true` tylko w tym oknie) → 180 ms
  wygaszania. Kolizja: `circleRectHit` z prostokątem o wysokości całej
  planszy (`0` do `H`), szerokości 54px.

### 20.4. Wspólne zmiany w kodzie

- `TYPE_COLORS` rozszerzone o `spinner` (niebieski `#4fc3f7`), `pulsar`
  (róż `#ff3ea5`) i `beam` (czerwień `#ff2244`, celowo bliska istniejącemu
  `--boss: #ff3b5c`, żeby wizualnie kojarzyć się z "zagrożeniem bossowym").
- Kolizje wydzielone do nowej wspólnej funkcji `obstacleHitsPlayer(o, p)` —
  wcześniej `loop()` miał inline'owy warunek `if (o.type==='orb') ... else
  circleRectHit(...)`, teraz jedna funkcja obsługuje wszystkie 7 typów
  (w tym warunkowe `o.lethal` dla pulsar/beam i podwójne sprawdzenie grotów
  dla spinnera), co utrzymało `loop()` czytelnym mimo podwojenia liczby
  typów przeszkód.
- Rysowanie również wydzielone: `drawObstacle()` + trzy nowe funkcje
  pomocnicze (`drawSpinnerObstacle`, `drawPulsarObstacle`,
  `drawBeamObstacle`) w nowej sekcji `// ---------- OBSTACLE RENDERING
  ----------`, zamiast dalszego rozrastania inline'owego bloku w `draw()`.
- **Wagi losowania zmienione** (`randType()`): block 40→28%, zigzag 25→18%,
  orb 20→14%, slider 15→12%, plus nowe spinner 16%, pulsar 12% (suma nadal
  100%). Rozkład dobrany "na oko" tak, żeby nowe typy były zauważalnie
  obecne, ale nie zdominowały rozgrywki.
- **Legenda** (`#legend` w `index.html`) rozszerzona o 2 nowe pozycje
  (Wirnik/Pulsar) — `beam` celowo pominięty w legendzie, patrz uzasadnienie
  w pkt 3.5.
- **i18n:** dodano `legend_spinner`/`legend_pulsar` do wszystkich 10
  języków w `i18n.js`.

**Nie zostało zrobione / świadomie poza zakresem:**
- Balans (wagi losowania, prędkości, promienie, czasy cykli pulsara/lasera)
  nieprzetestowany "na żywo" — jak każdy inny balans w tym projekcie,
  dobrany rozsądnie ale bez realnego, długiego playtestu.
- `spinner`/`pulsar` nie mają na razie własnego `addSkinEffect`-owego
  odpowiednika (to system dla **skinów kulki**, nie dla przeszkód —
  przeszkody mają swoje własne, gotowe animacje wbudowane bezpośrednio w
  `drawSpinnerObstacle`/`drawPulsarObstacle`/`drawBeamObstacle`).
- Legenda nadal jest statyczną listą — `beam` nie pojawia się w niej nawet
  na poziomach bossów (możnaby w przyszłości zrobić legendę dynamiczną,
  pokazującą dodatkowy wpis tylko w trybie `boss`, ale uznano to za
  niewartą złożoności poprawkę, skoro laser jest wystarczająco
  samowyjaśniający się wizualnie).

**Weryfikacja w tej sesji:** jak zawsze, brak `node`/`python3` — zweryfikowano
strukturalnie przez `perl`: `game.js` (`{}` 401/401, `()` 1614/1614, `[]`
82/82 — wzrost zgodny z ilością dopisanego kodu), `i18n.js` (`{}` 211/211,
bez zmian, bo dodane klucze to tylko nowe pary w istniejących obiektach),
`index.html` (`<div>` 23/23 — bez zmian, bo dodane elementy legendy to
`<span>`, nie `<div>`). Grepem potwierdzono, że `spawnBeam`,
`obstacleHitsPlayer`, `drawObstacle` i trzy nowe funkcje rysujące są
zdefiniowane i mają dokładnie tyle wywołań, ile się spodziewano (bez
duplikatów/literówek). Otwarto `index.html` w domyślnej przeglądarce.

**Do potwierdzenia przez usera (nie da się tego zweryfikować bez realnego
grania):** (1) `spinner` i `pulsar` faktycznie czują się jak coś nowego, a
nie jak warianty istniejących typów; (2) `pulsar` daje wystarczająco dużo
czasu na reakcję między końcem ładowania a rozbłyskiem (900 ms telegraphu —
może wymagać wydłużenia, jeśli w praktyce okaże się zbyt krótkie); (3)
laser bossa (`beam`) faktycznie da się uniknąć w 700 ms okna ostrzegawczego
przy prędkości ruchu gracza (`speed = 4.6`/klatkę) — jeśli pasek 54px
okaże się zbyt szeroki względem czasu ostrzeżenia, warto to skorygować po
przetestowaniu; (4) interwał 3.2 s między laserami na bossie nie koliduje
nieprzyjemnie z resztą (dość gęstym już wcześniej) spawnu przeszkód na
poziomach bossów.

---

## 21. Powiększenie wirnika/pulsara + system 10 osiągnięć + krytyczny bug wywalający całe menu (2026-07-09, część 6)

**Kontekst:** user potwierdził, że wszystko działa dobrze, ale dwie nowe
przeszkody (wirnik, pulsar) na zwykłych poziomach są "za proste, bo za
małe" — poprosił o lekkie powiększenie. Dodatkowo poprosił o system 10
osiągnięć (mix łatwych i trudnych), każde z nazwą, opisem celu i ikoną z
boku, która ma być widoczna, ale przyciemniona, dopóki nieodblokowana, i
"normalna" (pełny kolor) po odblokowaniu.

### 21.1. Powiększenie `spinner`/`pulsar`

W `spawnObstacle()`: `bladeReach` wirnika 22–30px → 28–37px, `tipR` (promień
grotu) 8px → 10px (łączny zasięg zagrożenia ok. +25%). `pulseR` pulsara
(promień w fazie śmiertelnego rozbłysku) 30–36px → 38–45px (ok. +25%).
`baseR` (rozmiar w stanie nieszkodliwym) zostawiony praktycznie bez zmian
(7→8px) — powiększenie dotyczy tylko rozmiaru **zagrożenia**, nie
przeszkadza w czytelności "bezpiecznego" stanu przeszkody.

### 21.2. System 10 osiągnięć

Nowy ekran `#achievementsScreen` ("Osiągnięcia"), dostępny z menu głównego
(przycisk między "Sklep" a "Ustawienia"). Lista `ACHIEVEMENTS` (10 wpisów,
każdy: `id`, `icon` (emoji), `nameKey`, `descKey`), mix trudności oparty na
istniejących mechanikach gry (żeby nie trzeba było wymyślać nowego
trackingu tam, gdzie się dało):

| Osiągnięcie | Trudność | Warunek |
|---|---|---|
| Pierwsze koła 🎯 | łatwe | ukończ 1. poziom |
| Drużynowa robota 🤝 | łatwe | ukończ dowolny bieg Kooperacji |
| Zaciekła rywalizacja ⚔️ | średnie | 2000 m wspólnego dystansu w jednym biegu Rywalizacji |
| Grosz do grosza 🪙 | łatwe | zarobione łącznie 200 monet |
| Maratończyk 🏃 | średnie | 3000 m w jednym biegu Trybu wolnego |
| Kolekcjoner 🎨 | średnie | posiadaj 5 różnych skinów |
| Pogromca bossów 👑 | trudne | pokonaj wszystkich 5 bossów |
| Fortuna 💰 | trudne | zarobione łącznie 3000 monet |
| Kompletny zestaw 🌈 | trudne | posiadaj wszystkie 13 skinów |
| Mistrz gry 🏆 | trudne | ukończ wszystkie 50 poziomów |

- **Trwały zapis:** `unlockedAchievements` (Set id-ków) pod kluczem
  **`scraper_achievements_v1`**. Dodatkowo nowy, **osobny licznik**
  `totalCoinsEarned` pod kluczem **`scraper_totalcoins_v1`** — rośnie **tylko
  w górę** przy każdym `addCoins()`, niezależnie od wydawania w sklepie
  (inaczej "zarób 3000 monet" byłoby niemożliwe do trwałego spełnienia po
  wydaniu części na skiny — sprawdzanie musiało więc być oparte na
  zarobku łącznym, nie na aktualnym saldzie `coins`).
- **`checkAchievements()`** — sprawdza wszystkie 10 warunków naraz i
  odblokowuje te spełnione (pomijając już odblokowane), wołane z kilku
  miejsc: `addCoins()` (pokrywa oba osiągnięcia monetowe), `buySkin()` i
  `syncBossSkinUnlocks()` pośrednio przez kolejne `addCoins`/`winLevel`
  (pokrywa oba skinowe), `winLevel()` (poziomy/bossy) i `finishRun()`
  (drużynowe/rywalizacyjne, na podstawie żywej zmiennej `distance` w
  momencie zakończenia biegu — **musiało** być wywołane zanim `resetRun()`
  wyzeruje `distance` przy kolejnym starcie, stąd wywołanie na samym
  początku `finishRun()`).
- **Ikona przyciemniona/pełna:** czysto CSS (`.achv-icon { filter:
  grayscale(1) brightness(0.55); opacity:0.55; }`, znoszone przez
  `.achv-row.unlocked .achv-icon { filter:none; opacity:1; }`) — dokładnie
  ten efekt "widoczna, ale przyciemniona → normalna po odblokowaniu", o
  który prosił user.
- **Toast przy odblokowaniu:** `showAchievementToast()` — mały, znikający
  po ok. 3.2 s dymek u góry ekranu (`position:fixed`, więc niezależny od
  pozycji `.stage`) z ikoną i nazwą osiągnięcia, dodany jako miły,
  natychmiastowy feedback (user o to wprost nie prosił, ale pasuje do
  reszty "dopieszczenia" gry z poprzednich sesji).
- **i18n:** `btn_achievements`, `achievements_title`,
  `achievements_subtitle`, `achievement_unlocked_toast` oraz po 2 klucze
  (nazwa+opis) dla każdego z 10 osiągnięć — **24 nowe klucze × 10 języków**,
  pełne pokrycie zgodnie z konwencją.

### 21.3. Krytyczny bug: całe menu przestało działać (i jak do tego doszło)

Zaraz po pierwszym wdrożeniu osiągnięć user zgłosił, że **żaden przycisk w
menu nie reaguje** (Singleplayer, Multiplayer, wszystko).

**Przyczyna:** na końcu sekcji ACHIEVEMENTS w `game.js` było wywołanie
`checkAchievements();` **na poziomie modułu** (czyli odpalane od razu przy
wczytaniu skryptu, nie w reakcji na jakieś zdarzenie). `checkAchievements()`
sprawdza m.in. warunki oparte na `mode` i `distance` (np. "czy tryb to
`freeplay` i dystans ≥ 3000") — a te dwie zmienne (`let mode = 'menu'`,
`let distance = 0`) są deklarowane **dużo dalej** w pliku, w sekcji
"GAME STATE", która w kolejności wykonania skryptu jeszcze się nie wykonała
w momencie tego wywołania. W JavaScripcie odczytanie zmiennej `let`/`const`
**przed** jej właściwą linią deklaracji (nawet jeśli jest "znana" silnikowi
przez hoisting) rzuca `ReferenceError: Cannot access '...' before
initialization` — tzw. temporal dead zone. Taki błąd, nieobsłużony,
**przerywa wykonywanie całego pozostałego skryptu**, w tym — kluczowe —
**wszystkie `addEventListener` dla przycisków menu, które są podpinane w
sekcji "MENU NAVIGATION" na samym końcu pliku**. Stąd dosłownie żaden
przycisk nie reagował: skrypt nigdy nie dotarł do miejsca, w którym
podpina się do nich obsługę kliknięć.

**Naprawa:** przeniesiono to jedno wywołanie `checkAchievements();` z końca
sekcji ACHIEVEMENTS na **sam koniec pliku**, zaraz po `showGameUI(false);`
(czyli po tym, jak dosłownie cały skrypt — łącznie z sekcją GAME STATE i
wszystkimi `addEventListener` — już się wykonał). W tym miejscu `mode`
(`'menu'`) i `distance` (`0`) są już bezpiecznie zainicjalizowane, więc
sprawdzenie startowe (np. czy z poprzedniego zapisu user już spełnia
"Mistrz gry") działa poprawnie bez ryzyka wywalenia skryptu.

**Wniosek na przyszłość (ważne przy dalszej pracy nad tym plikiem):**
jakiekolwiek wywołanie funkcji **na poziomie modułu** (czyli nie wewnątrz
innej funkcji/event listenera, tylko bezpośrednio w ciele IIFE) musi być
umieszczone **po** deklaracji każdej zmiennej `let`/`const`, do której ta
funkcja się odwołuje — inaczej pojedynczy, pozornie niewinny dodatek na
końcu jednej sekcji może wyłączyć **całą resztę gry** bez żadnego widocznego
komunikatu błędu dla usera (tylko cichy wyjątek w konsoli przeglądarki).
Funkcje wywoływane wyłącznie z poziomu event listenerów (jak `buySkin`,
`winLevel`, `finishRun`) są bezpieczne niezależnie od kolejności deklaracji,
bo faktycznie wykonują się dopiero w trakcie rozgrywki, długo po tym, jak
cały skrypt już raz przeleciał od góry do dołu.

**Weryfikacja w tej sesji:** jak zawsze `perl` do zbalansowania nawiasów
(`game.js` `{}` 435/435, `()` 1730/1730; `i18n.js` `{}` 211/211; `index.html`
`<div>` 25/25 — +2 względem poprzedniej sesji, dokładnie tyle, ile dodano:
`#achievementsScreen` i `.achv-list`). Tym razem **kluczowe** było też
ręczne prześledzenie kolejności wykonania kodu (a nie tylko zbalansowania
nawiasów) — bo to właśnie kolejność, nie składnia, była źródłem awarii, a
w tym środowisku wciąż nie ma jak uruchomić pliku i zobaczyć błędu
konsoli automatycznie. **Do potwierdzenia przez usera:** (1) menu działa
znowu normalnie (wszystkie przyciski, wszystkie tryby); (2) ekran
Osiągnięć wygląda i działa jak opisano (przyciemnione/pełne ikony, toast
przy odblokowaniu); (3) powiększone `spinner`/`pulsar` czują się teraz
lepiej wyważone niż poprzednio.

---

## 22. Pełnoekranowe menu główne — eksperymentalny redesign (2026-07-09, część 7)

**Kontekst:** user poprosił o całkowitą przebudowę menu głównego na układ
pełnoekranowy, z konkretnie opisanym rozmieszczeniem elementów, **wprost
zaznaczając, że to eksperyment** ("zobaczymy jak wyjdzie i później podejmę
decyzję czy wracamy do tego co było, czy lekko zmieniamy lub czy zostawiamy
tak jak jest"). To świadomie wpłynęło na podejście do implementacji: **priorytet
był na łatwą odwracalność**, nie tylko na sam efekt końcowy.

### 22.1. Nowy układ (`#mainMenu`)

- **Lewy górny róg:** tytuł "Scraper." (`.mm-title`) — w tym samym, stałym,
  niezlokalizowanym stylu co dawniej (patrz pkt 6), tylko przeniesiony z
  osobnego `<h1>` nad planszą (usuniętego z `index.html`) do wewnątrz
  nowego menu.
- **Góra, środek:** duży napis rekordu (`.mm-record`, `#mmRecord`) — pokazuje
  rekord dystansu z Trybu wolnego (`bestFree`), ten sam co dawniej widoczny
  tylko w podekranie Singleplayera.
- **Prawy górny róg:** dwa "chipy" waluty — monety (działające, `🪙 {n}`) i
  **diamenty** (`💎 {n}`, na razie **wyłącznie wizualny placeholder** —
  nowy klucz `scraper_diamonds_v1` w `localStorage`, zawsze `0`, brak
  jakiejkolwiek mechaniki zarabiania — user wyraźnie powiedział, że
  "funkcje dodamy później").
- **Pod chipami waluty:** dwa kwadratowe przyciski-ikony (`.mm-icon-btn`) —
  puchar 🏆 (Osiągnięcia) i zębatka ⚙️ (Ustawienia). To te same przyciski
  co wcześniej (`id="btnAchievements"`/`id="btnSettings"`), tylko
  przestylowane z tekstowych na ikonowe kwadraty — cała logika kliknięcia
  (nawigacja do odpowiednich ekranów) działa bez zmian.
- **Po prawej, niżej:** przycisk "Sklep" (działający, jak dotychczas) i pod
  nim przycisk **"Misje"** — celowo **nieaktywny** (`disabled` w HTML,
  `title="Wkrótce"`), zgodnie z prośbą "narazie nie będzie działał".
- **Prawy dolny róg:** karuzela wyboru trybu (`.mm-mode-select`, strzałki ◀▶
  + etykieta, ten sam wzorzec co karuzela skinów w sklepie) nad dużym
  przyciskiem **GRAJ** (`.mm-play-btn`).
- **Lewy dolny róg:** mały, dyskretny link "Exit" (`.mm-exit-link`) —
  zdegradowany z pełnowymiarowego przycisku do subtelnego linku, bo user
  nie wymienił go w opisie nowego układu (uznano za mało ważną akcję,
  niewartą eksponowania w nowym designie).
- **Środek ekranu:** przez nowy `#mainMenu` **celowo nie przechodzi żadne
  tło** — jest w pełni przezroczysty poza samymi elementami UI w rogach,
  więc widać przez niego wyśrodkowaną planszę gry (`.stage`, 420×600) **pod
  spodem**, dokładnie jak prosił user ("na środku pokazany ekran gry, która
  jeszcze nie wystartowała").

### 22.2. Jak zrobiono "pełny ekran" bez przepisywania całej struktury DOM

Zamiast przenosić `#mainMenu` w drzewie DOM (co byłoby bardziej ryzykowne),
wykorzystano właściwość CSS: `position:fixed` na potomku działa względem
**viewportu**, a nie rodzica, **dopóki żaden przodek nie ma `transform`/
`filter`/`perspective`** — `.stage` (rodzic `#mainMenu` w DOM) nie ma
żadnej z tych właściwości, więc `#mainMenu.show { position:fixed; inset:0;
z-index:50; }` **ucieka** poza granice 420×600 planszy i pokrywa cały
ekran, mimo że w HTML nadal fizycznie siedzi w tym samym miejscu co
wcześniej. To pozwoliło zmienić wyłącznie CSS + zawartość jednego diva,
bez ruszania reszty struktury `index.html`.

- **Podgląd "żywej" planszy w tle:** dotąd canvas był `visibility:hidden`,
  ilekroć jakikolwiek ekran menu był aktywny. Teraz wyjątek: `canvas.style.
  visibility = (!el || el === mainMenu) ? 'visible' : 'hidden';` — widoczny
  też na głównym menu. Dodano lekką, osobną pętlę `menuIdleLoop()`/
  `drawMenuIdlePreview()` (uruchamianą/zatrzymywaną w `showScreen()` tym
  samym wzorcem co podgląd skina w sklepie), która rysuje **tylko
  dryfujące gwiazdy w tle** — bez przeszkód, graczy, HUD-u — żeby plansza
  "żyła", ale wyraźnie nie była w trakcie rozgrywki.
- **Wybór trybu scalony w jeden selektor:** dawne osobne podekrany
  Singleplayer→(Poziomy/Tryb wolny) i Multiplayer→(Kooperacja/Rywalizacja)
  zastąpiono jedną płaską karuzelą 4 opcji (`MENU_MODE_OPTIONS`, z
  zawijaniem na końcach). Przycisk GRAJ rozgałęzia się wg wybranej opcji:
  "Poziomy" → otwiera siatkę poziomów (to nadal jest miejsce docelowe, nie
  natychmiastowy start); pozostałe trzy → startują bieg od razu
  (`startFreeplay()`/`startMultiplayer('coop'|'versus')`, bez zmian w tych
  funkcjach).

### 22.3. Co zostało celowo NIETKNIĘTE (dla łatwego cofnięcia)

Zgodnie z zapowiedzią usera, że może zechcieć wrócić do poprzedniej wersji:

- **Ekrany `#singleSelect` i `#multiSelect` (stare podmenu) zostały w
  całości w `index.html`/`game.js`, nienaruszone** — łącznie z ich
  przyciskami (`btnLevels`, `btnFreeplay`, `btnBackFromSingle`, `btnCoop`,
  `btnVersus`, `btnBackFromMulti`) i nasłuchiwaczami zdarzeń. Są teraz
  po prostu **nieosiągalne** z nowego menu (nic już do nich nie prowadzi),
  ale w pełni funkcjonalne, gdyby ktoś przywrócił do nich odnośnik.
- **Jedyne usunięte na trwałe elementy** to te, które fizycznie nie mogły
  współistnieć z nowym `#mainMenu` (bo miały te same ID/miejsce): stary,
  pionowo ułożony `#mainMenu` z przyciskami `btnSingle`/`btnMulti` oraz
  osobny `<h1>` nad planszą. Ich odpowiedniki logiczne (dostęp do
  poziomów/multiplayera, tytuł gry) **istnieją nadal**, tylko w nowej
  formie.
- Gdyby user zdecydował się wrócić do starego wyglądu, najprostszą drogą
  byłoby przywrócenie starej zawartości `#mainMenu` z historii tej sesji
  (ten dokument + treść wiadomości) — nowy CSS (`.mm-*` klasy) można po
  prostu zostawić nieużywany, nie trzeba go usuwać.

### 22.4. Kolejność deklaracji — zastosowano lekcję z pkt 21

Nauczony poprzednim incydentem (pkt 21.3), przy każdym nowym elemencie
sprawdzono **kolejność wykonania**, nie tylko składnię:
- `menuIdleRaf`/`menuIdleLoop` zadeklarowane wcześnie w pliku (zaraz po
  `initStars()`), a jedyne miejsce, które ich używa na poziomie modułu
  (`showScreen()`), faktycznie wykonuje się dopiero na samym końcu skryptu
  (`showScreen(mainMenu);`) — bezpieczne, ten sam wzorzec co już wcześniej
  sprawdzony `shopPreviewRaf`.
- Dodatkowo wykonano **systematyczny audyt** wszystkich wywołań
  `getElementById(...)` w `game.js` względem realnych `id="..."` w
  `index.html` (przez `perl` + `comm`), żeby wyłapać dokładnie ten sam
  rodzaj błędu, który wcześniej wywalił całe menu — wynik: 4 "brakujące" ID
  (`bossTag`, `distanceDisplay`, `livesDisplay`, `pwaAppleIcon`), wszystkie
  **celowo** tworzone dynamicznie przez JS (`document.createElement`), nie
  błędy.

**Nie zostało zrobione / świadomie poza zakresem:**
- Diamenty są czystym placeholderem wizualnym — zero mechaniki zarabiania
  czy wydawania. To świadomie zgodne z prośbą usera ("funkcje dodamy
  później").
- Przycisk "Misje" jest tylko atrapą (`disabled`), bez żadnego ekranu za
  nim.
- Pozostałe ekrany (Sklep, Osiągnięcia, Ustawienia, wybór poziomu) **nie
  zostały** przeniesione na pełny ekran — user poprosił wyraźnie tylko o
  redesign menu głównego, więc przejście z pełnoekranowego menu do np.
  Sklepu nadal "zwija się" do małej planszy 420×600 na środku pustego tła.
  To świadoma decyzja o zakresie, nie przeoczenie.
- Wybór trybu (`menuModeIndex`) nie jest zapisywany trwale — zawsze
  startuje od "Poziomy" po odświeżeniu strony.

**Weryfikacja w tej sesji:** `perl` — `game.js` (`{}` 459/459, `()`
1787/1787), `i18n.js` (`{}` 231/231), `index.html` (`<div>` 32/32),
`style.css` (`{}` 137/137) — wszystko zbalansowane. Dodatkowo pełny audyt
`getElementById` × realne `id` w HTML (opisany w pkt 22.4) — zero
niezamierzonych rozjazdów. Otwarto `index.html` w domyślnej przeglądarce.
**Do potwierdzenia przez usera (całościowy test, bo to duża zmiana):**
(1) menu ładuje się i wygląda zgodnie z opisem (wszystkie elementy w
odpowiednich rogach); (2) plansza w tle faktycznie widoczna i "żyje"
(dryfujące gwiazdy), ale nic się nie dzieje, dopóki nie kliknie się GRAJ;
(3) karuzela wyboru trybu przewija się i GRAJ poprawnie uruchamia
wybraną opcję (zwłaszcza "Poziomy" → siatka poziomów, nie od razu
rozgrywka); (4) powrót z każdego innego ekranu (Sklep/Osiągnięcia/
Ustawienia/Poziomy/koniec biegu) prowadzi z powrotem do nowego
pełnoekranowego menu, a nie do martwego, nieosiągalnego już
`#singleSelect`/`#multiSelect`; (5) czy ogólny "feel" bardziej pasuje niż
poprzedni, prostszy układ — to pytanie do usera, na które kod nie da
odpowiedzi.

---

## 23. System Misji + Misje dzienne (2026-07-09, część 8)

**Kontekst:** user poprosił o dwa nowe systemy nagród: (1) ekran "Misje"
(przycisk już istniał w menu głównym od pkt 22, ale był wyłączony/atrapa) —
10 stałych misji, z czego 5 nagradza monetami, a 5 nagradza unikalnymi nowymi
skinami kulki; (2) osobny widget "misji dziennych" pod nazwą gry w menu
głównym — 3 proste misje, wszystkie za monety, odświeżające się codziennie,
losowane z puli 30.

### 23.1. Misje (stałe, 10 sztuk)

Nowy ekran `#missionsScreen`, wizualnie identyczny wzorzec co `#achievementsScreen`
(reużyta klasa `.achv-list`/`.achv-row`, tylko dodano nową klasę `.achv-reward`
do wiersza z informacją o nagrodzie) — celowo bez wynajdywania nowego stylu na
kolejną listę "warunek → nagroda".

- Tablica `MISSIONS` (10 wpisów: id, ikona, `nameKey`/`descKey`, `reward`):
  5 monetowych (`m_levels_5` 150🪙, `m_levels_15` 400🪙, `m_distance_10k` 300🪙,
  `m_coop_5` 250🪙, `m_versus_5` 250🪙) + 5 skinowych (`m_level_25` → Tytan,
  `m_freeplay_6000` → Aurora, `m_shop_all` → Otchłań, `m_all_levels` → Solaris,
  `m_coins_5000` → Szron).
- **5 nowych skinów** dopisanych do istniejącej tablicy `SKINS` z
  `kind: 'mission'` (obok już istniejących `'coin'`/`'boss'`) — celowo typu
  `'solid'` (reużywają istniejący `drawSolidBall` + wspólne `addBallFinish`/
  `addSkinEffect` z pkt 19, więc od razu mają połysk i animowany błysk, bez
  pisania nowej funkcji rysującej), tylko z nową paletą kolorów. `renderShop()`
  dostał trzecią gałąź (`skin.kind === 'mission'`) obok `'boss'`, pokazującą
  zablokowany, wyszarzony przycisk z tekstem `skin_locked_mission` — te skiny
  są też widoczne (zablokowane) w karuzeli sklepu, żeby user wiedział, że
  istnieją, ale equipować/kupować ich stamtąd nie da się, tylko przez misję.
- **Nowe liczniki życia gry** (analogiczne do `totalCoinsEarned` z pkt 21):
  `totalDistanceEver` (`scraper_totaldistance_v1`, suma dystansu ze
  wszystkich biegów w historii), `totalCoopRuns`/`totalVersusRuns`
  (`scraper_coopruns_v1`/`scraper_versusruns_v1`, liczba ukończonych biegów
  multiplayera) — inkrementowane na końcu `finishRun()` (dla coop/versus) i
  po każdym zakończonym biegu (`totalDistanceEver`, także w `winLevel()`).
- **`checkMissions()`** — dokładnie ten sam wzorzec co `checkAchievements()`
  z pkt 21 (mapa `id → warunek`, pomija już ukończone, `Set` zapisywany do
  `localStorage` pod kluczem `scraper_missions_v1`), wołane z tych samych
  miejsc co `checkAchievements()`: `addCoins()`, `buySkin()`, `finishRun()`,
  `winLevel()`, oraz raz przy starcie gry. Nagroda monetowa woła `addCoins()`
  (bezpieczne wobec rekurencji — id trafia do `Set` **przed** przyznaniem
  nagrody, więc `checkMissions()` wywołane rekurencyjnie przez `addCoins()`
  pomija już ukończoną misję), nagroda skinowa dopisuje bezpośrednio do
  `ownedSkins`.
- Toast przy ukończeniu misji reużywa istniejący toast osiągnięć — funkcja
  `showAchievementToast()` została rozbita na generyczne `showRewardToast(icon,
  line1, line2)` + trzy cienkie wrappery (`showAchievementToast`,
  `showMissionToast`, `showDailyToast` — patrz 23.2), żeby nie kopiować tej
  samej logiki DOM/animacji trzy razy.

### 23.2. Misje dzienne (pula 30, losowane 3/dzień)

- **`DAILY_TEMPLATES`** — 6 szablonów (poziomy ukończone, dystans w jednym
  biegu Trybu wolnego, biegi Multiplayera, łączny dystans dzisiaj w dowolnym
  trybie, liczba biegów dzisiaj, monety zarobione dzisiaj), każdy z 5
  wariantami progu/nagrody (rosnąco) → **`DAILY_POOL`** budowana programowo
  jako iloczyn 6×5 = **30 wpisów**. Dzięki temu i18n potrzebował tylko 6
  par kluczy nazwa/opis (z placeholderem `{n}`), a nie 30 osobnych — liczba
  progu wstawiana jest w runtime, bez tłumaczenia liczb.
- **`dailyMeta`** (`localStorage` klucz `scraper_dailymeta_v1`) —
  `{ date, pickedIds (3), completed (id-ki ukończone dziś), stats }`.
  `stats` to dobowe liczniki resetowane co dzień: `levels`, `bestFreeRun`
  (maksimum z jednego biegu, nie suma), `multiplayerRuns`, `distanceTotal`,
  `runsPlayed`, `coinsEarnedToday`. **`ensureDailyFresh()`** porównuje
  zapisaną datę z dzisiejszą (`todayStr()`, lokalna data `YYYY-MM-DD`) i w
  razie rozjazdu losuje nowe 3 misje (`pickDailyIds()`, Fisher-Yates na
  kopii puli) oraz zeruje `stats`/`completed` — wołane defensywnie na
  początku `registerDailyRun()`, `checkDailyMissions()` i
  `renderDailyWidget()`, więc nawet sesja zostawiona otwarta przez północ
  odświeży się przy najbliższej z tych akcji.
- **`registerDailyRun(info)`** — wołane raz na koniec każdego biegu (z
  `finishRun()` dla porażki/freeplay/coop/versus i z `winLevel()` dla
  wygranego poziomu) z jego własnymi liczbami (`distance`, `mode`,
  `levelCompleted`, `coinsEarned`) — **nie** jest podpięte pod `addCoins()`,
  więc bonusowe monety z ukończenia misji nigdy nie dopisują się same do
  siebie do dziennego licznika zarobku.
- **Widget na menu głównym** (`#mmDaily`, pod `.mm-title`, nad `.mm-record`)
  — 3 wiersze (`renderDailyWidget()`), każdy: ikona (zamieniana na ✅ po
  ukończeniu), nazwa z podstawionym `{n}`, i pasek "postęp/próg • nagroda"
  (albo sama nagroda, gdy ukończone). Stylistyka spójna z resztą
  pełnoekranowego menu z pkt 22 (`rgba(0,0,0,0.28)` tło, `--panel-edge`
  ramka, `--gold` akcent po ukończeniu), ukrywany pod 900px szerokości
  (analogicznie do `.mm-record` chowanego pod 720px), żeby nie kolidował z
  resztą UI na wąskich oknach.

### 23.3. Poprawki tuż po pierwszym wdrożeniu: większy widget + brak duplikatu szablonu tego samego dnia

Zaraz po pierwszym wdrożeniu (23.1/23.2) user zgłosił dwie rzeczy, zanim zdążył
realnie przetestować resztę: (1) widget misji dziennych ma być trochę większy;
(2) dwa warianty **tego samego szablonu** (np. "Sprint 300 m" i "Sprint 750 m"
z `daily_freerun`) nie powinny móc wypaść jednego dnia jednocześnie — pierwotne
losowanie (`pickDailyIds()`) tasowało całą 30-elementową `DAILY_POOL` i brało
pierwsze 3, więc statystycznie mogło to się zdarzyć.

- **Naprawa losowania:** `pickDailyIds()` przepisane — najpierw tasuje (Fisher-
  Yates) tablicę **6 szablonów** (`DAILY_TEMPLATES`), bierze pierwsze 3, i
  dopiero dla **każdego** z tych 3 wybranych szablonów losuje jeden z jego 5
  wariantów trudności. Gwarantuje to, że dzienna trójka zawsze pochodzi z 3
  **różnych** szablonów — nie tylko naprawia zgłoszony przypadek (Sprint×2),
  ale też ubocznie robi dzienne misje bardziej zróżnicowane (nigdy np. dwie
  monetowe naraz).
- **Powiększenie widgetu** (`.mm-daily*` w `style.css`): szerokość panelu
  250→320px, ikona 16→24px, nazwa misji 10.5→13px, tekst postępu 10→12px,
  padding wiersza 7×10→11×14px, większe odstępy. Próg chowania widgetu na
  wąskich oknach podniesiony z 900px do 1000px (bo panel jest teraz szerszy,
  łatwiej o kolizję z resztą UI).

### 23.4. i18n

Dodano **44 nowe klucze** (2 tytuł/podtytuł ekranu misji, toast, tekst
zablokowanego skinu misji, 2 etykiety nagrody, 10×2 nazwa/opis misji stałych,
5 nazw nowych skinów, tytuł widgetu dziennego, 6×2 nazwa/opis szablonów
dziennych) do **wszystkich 10 języków** (`i18n.js`), zgodnie z ustaloną
konwencją pełnego pokrycia — w sumie 440 nowych par klucz-wartość. Jak przy
poprzednich sesjach, tłumaczenia zh/ko/ja są zrobione "z pamięci modelu", bez
weryfikacji przez native speakera (patrz zastrzeżenie w pkt 6).

**Nie zostało zrobione / świadomie poza zakresem:**
- Balans progów/nagród (misje stałe: 150–400🪙 lub skin; misje dzienne:
  10–80🪙 zależnie od trudności wariantu) dobrany "na oko", tak jak każdy
  inny balans w tym projekcie — nieprzetestowany długo w praktyce.
- 5 nowych skinów misyjnych (Tytan/Aurora/Otchłań/Solaris/Szron) to typ
  `'solid'` z nową paletą, nie nowe unikalne wzory rysowane jak skiny
  bossowe z pkt 17 (piłka nożna, disco, itd.) — świadomy kompromis zakresu,
  żeby nie pisać 5 kolejnych funkcji `draw*Ball`.
- Widget misji dziennych nie ma licznika czasu do odświeżenia (np.
  "odświeży się za Xh") — pokazuje tylko bieżące 3 misje i ich postęp.
- Brak przycisku "odśwież ręcznie" ani żadnej możliwości pominięcia/wymiany
  wylosowanej misji dziennej na inną — wybór trzyma się do końca dnia.

**Weryfikacja w tej sesji:** jak zawsze, brak `node`/prawdziwego `python3` w
tym środowisku (sprawdzono ponownie — nadal niedostępne) — zweryfikowano
strukturalnie przez `perl`: `game.js` (`{}` 589/589, `()` 2040/2040),
`i18n.js` (`{}` 311/311), `index.html` (`<div>` 38/38), `style.css` (`{}`
155/155) — wszystko zbalansowane. Dodatkowo powtórzono audyt
`getElementById` × realne `id` w HTML (wzorem pkt 22.4) — te same 4
"brakujące" id co poprzednio (`bossTag`, `distanceDisplay`, `livesDisplay`,
`pwaAppleIcon`, tworzone dynamicznie przez JS, nie błędy) i żadnych nowych.
Osobno zweryfikowano grepem, że każdy klucz `t('...')` użyty w `game.js` ma
dokładnie 10 wystąpień w `i18n.js` (czyli tłumaczenie w każdym języku) —
zero brakujących kluczy. **Nie znaleziono w tym środowisku żadnego narzędzia
do automatyzacji przeglądarki** (`chromium-cli`, prawdziwy `node`/`python3`)
mimo ponownego sprawdzenia — jak w każdej poprzedniej sesji, gra została
otwarta w domyślnej przeglądarce (`explorer.exe`) do ręcznego testu przez
usera, dwukrotnie (raz po 23.1/23.2, raz po poprawkach z 23.3). Po
poprawkach z 23.3 perl potwierdził ponownie zbalansowanie (`game.js` `{}`
590/590, `()` 2044/2044; `style.css` `{}` 155/155).

**Sesja zakończona przez usera bez realnego przetestowania w przeglądarce**
("na teraz koniec") — user zauważył, że część funkcjonalności (misje
dzienne) i tak zmieni się dopiero jutro (nowa data → nowe losowanie), więc
świadomie odłożył pełny test na później. **Wciąż do potwierdzenia w kolejnej
sesji:** (1) widget "Misje dzienne" pod tytułem w menu głównym wyświetla 3
misje z sensownym opisem/postępem/nagrodą, w nowym większym rozmiarze, i nie
nachodzi wizualnie na rekord/prawą kolumnę; (2) przycisk "Misje" otwiera
nowy ekran z 10 pozycjami (5 z nagrodą monetową, 5 z nagrodą skinową) w tym
samym stylu co Osiągnięcia; (3) ukończenie dowolnej misji (np. ukończ 5
poziomów) faktycznie przyznaje nagrodę, pokazuje toast i odznacza się
trwale (Set w `localStorage`) po odświeżeniu strony; (4) misje dzienne
faktycznie się liczą (np. rozegranie jednego biegu Trybu wolnego podbija
"Rozgrzewka dnia"), a po ukończeniu progu widget się aktualizuje na
zielono/złoto z ikoną ✅; (5) losowanie dziennej trójki faktycznie nigdy nie
daje dwóch wariantów tego samego szablonu (poprawka z 23.3) — **da się to
przetestować bez czekania do jutra**: DevTools (F12) → Application → Local
Storage → usuń klucz `scraper_dailymeta_v1` → odśwież stronę (F5), powtórzyć
kilka razy, za każdym razem powinny wyjść 3 różne szablony; (6) 5 nowych
skinów misyjnych jest widocznych (zablokowanych) w karuzeli sklepu i
faktycznie odblokowują się/dają się założyć po spełnieniu warunku; (7) brak
błędów w konsoli przeglądarki (DevTools → Console) na starcie gry i przy
przechodzeniu między wszystkimi ekranami menu.

---

## 24. Rozróżnienie wizualne Osiągnięć i Misji (2026-07-10)

**Kontekst:** user zauważył, że ekran Osiągnięć i ekran Misji wyglądają
praktycznie identycznie (oba reużywały ten sam wzorzec `.achv-list`/
`.achv-row` z pkt 21/23, Misje dostały tylko dodatkową linijkę nagrody).
Zapytany o kierunek zmiany, user wybrał **wyłącznie redesign wizualny** —
warunki odblokowania, nagrody i moment przyznania (`checkAchievements()`/
`checkMissions()`, wołane z tych samych miejsc co dotychczas) **zostały
całkowicie nietknięte**, zmienił się tylko wygląd i sposób renderowania.

### 24.1. Osiągnięcia → siatka "gabloty z trofeami"

- Kontener zmieniony z pionowej listy (`.achv-list`) na **siatkę 2 kolumn**
  (`.trophy-grid`, w `index.html` kontener `#achvList` dostał nową klasę),
  każdy wpis to kafelek `.trophy-item` z dużą ikoną na środku, nazwą i
  opisem pod spodem (zamiast poziomego wiersza ikona+tekst).
- **Nowe pole `tier: 'bronze' | 'silver' | 'gold'`** dopisane do każdego z
  10 wpisów w `ACHIEVEMENTS` (`game.js`), odtwarzające podział trudności z
  tabeli w pkt 21.2 (3× łatwe → brąz, 3× średnie → srebro, 4× trudne →
  złoto). Odblokowany kafelek dostaje kolorową obwódkę/poświatę **w
  kolorze swojego tier-u** (nowe klasy `.trophy-item.unlocked.tier-*` w
  `style.css`) oraz mały kolorowy "sygnet" w rogu (`.trophy-badge`) —
  zamiast jednolitego złotego akcentu dla wszystkich, jak było wcześniej.
  Nieodblokowane kafelki wyglądają tak samo niezależnie od tier-u
  (wyszarzona ikona, szara obwódka) — tier widać dopiero po zdobyciu.
- `renderAchievements()` przepisane pod nową strukturę DOM
  (`.trophy-item`/`.trophy-badge`/`.trophy-icon`/`.trophy-name`/
  `.trophy-desc`), reszta funkcji (`checkAchievements()`, zapis do
  `scraper_achievements_v1`, toast) bez zmian.

### 24.2. Misje → lista "dziennika questów" z paskiem postępu

- Kontener zmieniony z `.achv-list` na `.quest-list` (kontener
  `#missionsList` w `index.html`), wiersze `.quest-row` zachowują układ
  poziomy (ikona + tekst), ale z nowym rozkładem: **nazwa i nagroda w
  jednej linii u góry** (`.quest-top-line`, nagroda po prawej, blisko
  nazwy — bardziej "widać co dostanę" niż poprzednio, gdzie nagroda była
  osobną linijką na dole), opis pod spodem, a na samym dole **pasek
  postępu** (`.quest-bar-track`/`.quest-bar-fill`) z liczbowym odczytem
  `current/target` obok (np. "3/5"), zamieniającym się na "✓" po
  ukończeniu.
- **Nowa funkcja `missionProgress(m)`** (`game.js`, tuż przed
  `renderMissions()`) — czysto do wyświetlania, liczy `{current, target}`
  dla każdej z 10 misji na podstawie tych samych zmiennych stanu, których
  już używa `checkMissions()` (`progress`, `totalDistanceEver`,
  `totalCoopRuns`, `totalVersusRuns`, `bestFree`, `ownedSkins`,
  `totalCoinsEarned`) — **nie wpływa** na to, kiedy misja faktycznie się
  ukończy (to nadal wyłącznie `checkMissions()`), tylko pozwala pokazać
  pasek postępu przed ukończeniem. Dla misji binarnych (`m_level_25` —
  "pokonaj poziom 25") pasek pokazuje po prostu 0/1 → 1/1, bez połówkowych
  stanów.
- Etykieta paska ("✓" albo liczby) celowo **nie przechodzi przez `t()`** —
  to tylko cyfry i uniwersalny symbol ptaszka, więc nie wymagało dopisania
  nowych kluczy i18n do 10 języków.
- `.achv-reward` (stara klasa nagrody) usunięta z `style.css`, zastąpiona
  przez `.quest-reward` w nowym układzie. `.achv-toast*` (dymek przy
  odblokowaniu, wspólny dla osiągnięć/misji/misji dziennych) **zostawiony
  bez zmian** — to osobny, wspólny element, nie część żadnej z tych dwóch
  list.

**Nie zostało zrobione / świadomie poza zakresem** (bo user wybrał
wyłącznie redesign wizualny, nie zmianę mechaniki):
- Same warunki odblokowania i nagrody Misji vs Osiągnięć nadal się
  częściowo pokrywają koncepcyjnie (np. "ukończ X poziomów" istnieje w
  obu listach) — to świadomie odłożone, do rozważenia w osobnej sesji,
  gdyby user zechciał też zmienić *treść* list, nie tylko wygląd.
- Widget "Misje dzienne" na menu głównym (`.mm-daily*`, pkt 23.2) **nie
  został ruszony** — ma już własny, odrębny styl sprzed tej zmiany i user
  o niego nie pytał.

**Weryfikacja w tej sesji:** `node` nadal niedostępny w tym środowisku —
zbalansowanie sprawdzone przez `perl`: `game.js` (`{}` 605/605, `()`
2083/2083, `[]` 111/111), `index.html` (`<div>` 38/38 — bez zmian, bo
zmieniono tylko atrybuty `class` na istniejących divach, żaden nie
przybył/zniknął), `style.css` (`{}` 175/175). Grepem potwierdzono brak
pozostałych odwołań do starej klasy `.achv-list` w kodzie (tylko w tym
dokumencie, opisowo). Otwarto `index.html` w domyślnej przeglądarce.
**Do potwierdzenia przez usera:** (1) ekran Osiągnięć wygląda jak siatka
2 kolumn z odznakami, a nie pionowa lista; (2) trzy poziomy trudności
faktycznie różnią się kolorem obwódki/poświaty po odblokowaniu
(brąz/srebro/złoto); (3) ekran Misji pokazuje pasek postępu w każdym
wierszu i faktycznie się wypełnia w miarę postępu (np. po ukończeniu 2 z
5 wymaganych poziomów pasek "Ukończ 5 poziomów" pokazuje ok. 40%,
etykieta "2/5"); (4) obie listy teraz wyraźnie różnią się z pierwszego
rzutu oka.

---

## 25. Wyzwanie dnia — osobny tryb z modyfikatorami trudności (2026-07-10)

**Kontekst:** user poprosił o nowy widget "Wyzwanie dnia" pod widgetem Misji
dziennych na menu głównym: resetuje się codziennie jak misje dzienne, ma 3
różne zadania do wykonania, nagroda to monety/diamenty/coś innego w
przyszłości, i przycisk "Wyzwanie" uruchamiający dedykowaną rozgrywkę z
narzuconymi na dany dzień modyfikatorami (np. 2× prędkość, 2× rozmiar, 2×
częstość przeszkód) — bez zarobku monet za dystans, jedyna nagroda to ta
dzienna. User wyraźnie zastrzegł: zadania mają być **dość ciężkie**, a
nagroda **fajna**.

### 25.1. Nowy tryb rozgrywki `mode === 'challenge'`

- `startChallenge()` (`game.js`, obok `startFreeplay()`/`startMultiplayer()`)
  — jak Tryb wolny (nieskończony dystans, jedno życie, kończy się na
  pierwszym zderzeniu), ale `baseSpeed`/`spawnInterval` przeliczone przez
  dzienne mnożniki (`challengeMeta.modifiers`). Rozmiar przeszkód skalowany
  osobno w `spawnObstacle()` przez `sizeMult` (1 poza trybem `challenge`,
  inaczej `challengeMeta.modifiers.sizeMult`) — dotyczy wszystkich wymiarów
  (`w`/`h`/`r`/`bladeReach`/`tipR`/`baseR`/`pulseR`) każdego z 6 typów
  przeszkód.
- **Brak monet za dystans** w tym trybie — `finishRun()` dostał nową gałąź
  `mode === 'challenge'` (przed dotychczasowym domyślnym `else`, który
  obsługuje wyłącznie Rywalizację — trzeba było jawnie rozgałęzić, żeby
  Wyzwanie nie wpadło przez pomyłkę w tekst/przyciski ekranu Rywalizacji).
  Cały wspólny "ogon" `finishRun()` (`totalDistanceEver`, `registerDailyRun`,
  `checkMissions`, liczniki coop/versus) owinięty w `if (mode !== 'challenge')`
  — **świadoma decyzja**: Wyzwanie to w pełni osobny system, żeby
  napompowany modyfikatorami dystans nie dało się wykorzystać jako obejście
  (np. szybsze zdobycie osiągnięcia "Maratończyk" z pkt 21, które sprawdza
  tylko `mode === 'freeplay'`, albo misji "10 000 m łącznie" z pkt 23, która
  sumuje `totalDistanceEver`).
- Brak pauzy w tym trybie (tak jak w coop/versus) — celowo nierozszerzone,
  user o to nie prosił (patrz pkt 4).

### 25.2. Trzy cele, losowane codziennie, mierzone jako "najlepszy wynik dnia"

Trzy stałe **typy** celu (nie pula do losowania z większego zbioru — uznano
to za wystarczające zróżnicowanie bez dodatkowej złożoności), każdy dostaje
nowy losowy próg co dzień:

| Typ | Treść | Zakres progu |
|---|---|---|
| `distance` | Przebiegnij X m w jednym biegu Wyzwania | 650 / 800 / 950 m |
| `survive` | Przetrwaj X sekund w jednym biegu Wyzwania | 30 / 40 / 50 s |
| `dodge` | Unikaj X× przeszkód wylosowanego typu (jeden z 6 zwykłych typów, też losowany codziennie) w jednym biegu | 10 / 13 / 16× |

- **Postęp liczony jako "najlepszy wynik w pojedynczym biegu danego dnia"**
  (`challengeMeta.best.{distance,survive,dodge}`), nie suma — dokładnie ten
  sam wzorzec co `bestFreeRun` w Misjach dziennych (pkt 23.2). Dzięki temu
  gracz może próbować dowolną liczbę razy w ciągu dnia; każdy cel odblokowuje
  się niezależnie, gdy tylko *jakikolwiek* bieg tego dnia go przebije — nie
  trzeba zaliczyć wszystkich trzech w jednym podejściu. To świadomy wybór na
  rzecz grywalności zamiast maksymalnej trudności "wszystko w jednym biegu",
  przy zachowaniu wysokiego progu wejścia dzięki modyfikatorom.
- `dodge` liczony przez nowy per-bieg licznik `challengeRunDodge`
  (zerowany w `resetRun()`), inkrementowany w `loop()` dokładnie w miejscu,
  gdzie przeszkoda znika poza ekranem **bez** trafienia gracza (już istniejący
  punkt `if (offscreen){ obstacles.splice(i,1); }`) — liczy się tylko, jeśli
  `o.type` zgadza się z wylosowanym na dziś typem do unikania.
- Po zakończeniu biegu w trybie `challenge`, `finishRun()` aktualizuje
  `challengeMeta.best` (biorąc `Math.max` z dotychczasowym) i wywołuje
  `checkChallengeObjectives()`, która odznacza spełnione cele i — gdy
  wszystkie 3 są zaznaczone i nagroda jeszcze nie odebrana (`claimed`) —
  przyznaje ją raz (`addCoins`/nowe `addDiamonds`) i pokazuje toast.

### 25.3. Modyfikatory trudności — losowane codziennie, widoczne jako chipy

`challengeMeta.modifiers` = `{ speedMult, sizeMult, spawnMult }`, każdy
losowany niezależnie z małej puli "twardych" wartości:
`speedMult ∈ {1.5, 1.75, 2}`, `sizeMult ∈ {1.3, 1.5, 1.75}`,
`spawnMult ∈ {1.3, 1.6, 2}`. Zastosowanie w `startChallenge()`:
`baseSpeed = 2.2 * speedMult` (ta sama bazowa prędkość co Tryb wolny, tylko
przemnożona — dalej korzysta z istniejącej rampy trudności
`SPEED_RAMP_K`/dystans), `spawnInterval = 900 / spawnMult` (krótszy odstęp =
częstszy spawn). `sizeMult` zastosowany w `spawnObstacle()` (patrz 25.1).
Widoczne na widgecie jako trzy małe "chipy" z ikoną i mnożnikiem (⚡/📏/🌀),
z tytułem (`title`, natywny tooltip przeglądarki) tłumaczonym przez `t()`.

### 25.4. Nagroda — moneta lub diament, losowana codziennie z małej puli

`challengeMeta.reward` losowany raz dziennie z puli: 500 / 650 / 800 monet
albo 6 / 9 / 12 diamentów. **Diamenty (`💎`, chip w prawym górnym rogu menu
od pkt 22) dostały tu swoje pierwsze realne zastosowanie** — wcześniej były
czystym wizualnym placeholderem (zawsze 0, brak funkcji `addDiamonds`/
`saveDiamonds`) — dopisano `saveDiamonds()`/`addDiamonds(n)` obok istniejącego
`loadDiamonds()`, wzorem `addCoins()`. Nadal nie ma żadnego miejsca, gdzie
diamenty da się *wydać* — to zostaje na przyszłość, zgodnie z pierwotnym
zamysłem z pkt 22.

### 25.5. Widget na menu głównym

- HTML: nowy wrapper `.mm-topleft-col` (przeniesiono na niego
  `position:absolute; top:112px; left:30px; width:320px` z dawnego
  `.mm-daily`), wewnątrz którego `#mmDaily` (bez zmian logiki) i nowy
  `#mmChallenge` — dzięki temu drugi widget układa się automatycznie pod
  pierwszym (flex column, gap 20px) bez ręcznego liczenia pikseli offsetu.
  Media query chowająca panel na wąskich oknach przeniesiona z `.mm-daily`
  na `.mm-topleft-col` (chowa oba widgety razem, tak jak dotychczas chował
  się sam `.mm-daily`), plus nowa reguła chowająca samo `.mm-challenge` przy
  niskich oknach (`max-height: 760px`) — dwa widgety pod sobą są wyraźnie
  wyższe niż sam dawny widget misji, warto to zweryfikować realnie w
  przeglądarce (patrz "do potwierdzenia" niżej).
- Kolorystyka celowo **czerwona/bossowa** (`--boss`), nie turkusowo-złota jak
  Misje dzienne — sygnalizuje "to jest trudniejsze/niebezpieczne", spójnie z
  istniejącym językiem wizualnym bossów/lasera.
- Paski postępu celów reużywają `.quest-bar-row`/`.quest-bar-track`/
  `.quest-bar-fill`/`.quest-bar-label` z redesignu ekranu Misji (pkt 24) —
  ten sam wizualny język "paska postępu" w dwóch miejscach zamiast
  wynajdywania nowego.
- `renderChallengeWidget()` wołane z `applyStaticTranslations()` (więc
  odświeża się przy starcie i przy zmianie języka, tak jak `renderDailyWidget`/
  `renderMissions`/`renderAchievements`) oraz z `checkChallengeObjectives()`
  po każdym zakończonym biegu Wyzwania.
- Przycisk "Wyzwanie" zawsze aktywny (też po odebraniu dzisiejszej nagrody)
  — można grać dalej "dla frajdy"/treningu, tak jak Tryb wolny nie blokuje
  się po ustanowieniu rekordu.

### 25.6. i18n

Dodano **15 nowych kluczy** (`btn_challenge`, `challenge_title`,
`challenge_mod_speed/size/spawn`, `chal_obj_distance/survive/dodge`,
`challenge_reward_pending/claimed`, `challenge_complete_toast`,
`mission_reward_diamonds` — nowy, ogólny klucz nagrody diamentowej, wzorem
istniejącego `mission_reward_coins`, gotowy do reużycia gdyby przyszłe misje
też zaczęły nagradzać diamentami — `hud_challenge`,
`overlay_challenge_title`, `overlay_challenge_text`) do **wszystkich 10
języków**, zgodnie z ustaloną konwencją. Nazwa unikanego typu przeszkody w
opisie celu `dodge` **nie jest nowym kluczem** — reużywa istniejące
`legend_block`/`legend_zigzag`/itd. z pkt 3.5/20.4.

**Nie zostało zrobione / świadomie poza zakresem:**
- Cele nie są losowane z większej puli szablonów (jak Misje dzienne, 6
  szablonów × 5 wariantów) — trzy stałe typy z nowym progiem co dzień. Prostsze
  i uznane za wystarczające dla "3 różne rzeczy", ale mniej urozmaicone
  długoterminowo niż pełny system puli — do rozważenia w przyszłości, jeśli
  po dłuższym graniu okaże się zbyt monotonne.
- Balans progów/modyfikatorów/nagród dobrany "na oko" (jak każdy inny balans
  w tym projekcie) — nieprzetestowany długo w praktyce. W szczególności próg
  `dodge` (10–16× wylosowanego typu) zależy mocno od tego, jaki typ akurat
  wypadnie (np. `pulsar`/`spinner` mają niższą wagę losowania niż `block` —
  patrz `randType()`, pkt 20.4) — przy rzadszych typach może być
  nieproporcjonalnie trudniejszy niż przy `block`. Warto obserwować.
- Brak licznika czasu "ile zostało do resetu" na widgecie (tak samo jak przy
  Misjach dziennych, patrz pkt 23, świadomie pominięte tam też).
- Diamenty nadal nie mają żadnego zastosowania poza wyświetlaniem salda —
  ten temat (sklep za diamenty?) zostaje otwarty na przyszłość.

**Weryfikacja w tej sesji:** `node` niedostępny — zbalansowanie sprawdzone
przez `perl`: `game.js` (`{}` 667/667, `()` 2270/2270, `[]` 127/127),
`i18n.js` (`{}` 401/401), `index.html` (`<div>` 44/44), `style.css` (`{}`
194/194). Policzono wystąpienia wszystkich 15 nowych kluczy i18n — po 10 (raz
na język) dla każdego. Powtórzono audyt `getElementById` × realne `id` w HTML
(wzorem pkt 22.4/23.4) — te same 4 znane, celowo dynamiczne id co poprzednio,
zero nowych rozjazdów. Otwarto `index.html` w domyślnej przeglądarce.
**Do potwierdzenia przez usera** (spora zmiana, nie da się zweryfikować bez
realnego grania): (1) widget "Wyzwanie dnia" pokazuje się pod "Misje dzienne"
i nie wygląda na ucięty/nachodzący na inne elementy menu przy typowej
wysokości okna przeglądarki — jeśli tak, próg `max-height: 760px` w pkt 25.5
może wymagać podniesienia; (2) trzy chipy modyfikatorów pokazują sensowne
wartości (⚡/📏/🌀 ×...); (3) kliknięcie "Wyzwanie" faktycznie startuje bieg
zauważalnie trudniejszy niż zwykły Tryb wolny (szybsze, większe, gęstsze
przeszkody); (4) po biegu paski postępu w widgecie faktycznie się
aktualizują, a po przekroczeniu progu we wszystkich trzech celach pojawia się
toast i saldo monet/diamentów rośnie o właściwą wartość; (5) po odebraniu
nagrody widget pokazuje "Odebrano: ..." i przycisk "Wyzwanie" dalej działa;
(6) reset następnego dnia faktycznie losuje nowe cele/modyfikatory/nagrodę
(da się przetestować bez czekania: DevTools → Application → Local Storage →
usuń `scraper_challengemeta_v1` → odśwież, powtórzyć kilka razy).

**Poprawka jeszcze w tej samej sesji:** user zgłosił, że widget "wcale nie
ma go w grze" — przyczyna: `@media (max-height: 760px) { .mm-challenge {
display:none; } }` w `style.css` chowała cały widget na każdym oknie
przeglądarki niższym niż 760px, czyli w praktyce na większości typowych,
niezmaksymalizowanych okien (albo mniejszych ekranów) — reguła usunięta w
całości. Przy okazji `.mm-topleft-col` (wspólny wrapper Misji dziennych i
Wyzwania z pkt 25.5) dostał ścieśniony odstęp (`gap: 20px → 14px`) dla
bezpieczniejszego marginesu na niższych oknach — `#mainMenu.show` ma
`overflow: visible` (patrz pkt 22.2), więc bardzo niska wysokość okna nadal
może obcinać dół widgetu bez możliwości przewinięcia; to znany, celowo
nienaprawiany kompromis tego pełnoekranowego layoutu (dotyczy też
`.mm-play-area`/`.mm-exit-btn`, które od zawsze są zakotwiczone do dołu bez
scrolla). Następnie, na prośbę usera, wyśrodkowano chipy modyfikatorów
(`.mm-challenge-mods { justify-content:center; }`, usunięto `margin-left:2px`
które ciągnęło je w lewo) oraz dodano całemu widgetowi Wyzwania własne
przyciemnione tło + czerwoną obwódkę + delikatną poświatę (`.mm-challenge`),
żeby czytał się jako zamknięta "karta", a nie luźne elementy nad animowanym
tłem gry (wcześniej separował go tylko cienki `border-top`).

---

## 26. Skrzynki — kupowanie i otwieranie z animacją (2026-07-10, część 2)

**Kontekst:** user poprosił o system "Skrzynek": nowy przycisk pod "Misje" w
menu głównym, ekran z trzema rodzajami skrzynek do kupienia (zwykła/epicka/
legendarna — nazwa u góry, rysunek na środku, cena i przycisk kupna na
dole), zakupiona skrzynka trafia do własnego "magazynu" na tym samym
ekranie, kliknięcie jej odpala animację otwarcia z dźwiękiem: najpierw
wylatują monety (ilość zależna od rzadkości), potem dodatkowe przedmioty —
2 w zwykłej, 5 w epickiej, 10 w legendarnej. Ceny: zwykła 500 monet, epicka
2000 monet, legendarna 10 diamentów. Dodatkowe przedmioty na razie są
wyłącznie diamentami (kolejne typy mają dojść później).

### 26.1. Dane i trwały zapis

- **`CRATES`** (`game.js`, tuż po sekcji SHOP/SKINS) — 3 wpisy:
  `common` (📦, 500 🪙, 2 przedmioty), `epic` (🎁, 2000 🪙, 5 przedmiotów),
  `legendary` (👑, 10 💎 — **jedyna skrzynka płatna diamentami**, 10
  przedmiotów). Każdy wpis ma też `coinsRange`/`itemRange` — widełki losowania
  wypłaty monet i wartości pojedynczego przedmiotu (patrz 26.3).
- **Magazyn nieotwartych skrzynek** — `crateInventory = {common,epic,legendary}`
  (liczniki sztuk), zapisywany w `localStorage` pod kluczem
  **`scraper_crates_v1`**, wzorem reszty zapisów (`try/catch`, sanity-check
  kształtu obiektu przy wczytaniu).
- **`buyCrate(id)`** — odejmuje cenę od `coins` **albo** `diamonds` (zależnie
  od `crate.currency`), tylko jeśli stać gracza; dopisuje +1 do
  `crateInventory[id]`. Dokładnie ten sam wzorzec co `buySkin()` (pkt 16.2),
  tylko z rozgałęzieniem waluty.

### 26.2. Ekran `#cratesScreen` — trzy karty obok siebie + magazyn

- W przeciwieństwie do karuzeli sklepu (pkt 17.2, jedna kulka + strzałki),
  user opisał układ "od lewej: zwykła, epicka, legendarna" — więc
  `renderCrateShop()` buduje **trzy karty jednocześnie** w rzędzie
  (`.crate-shop-row`), każda: nazwa u góry (`.crate-card-name`), duża ikona
  emoji na środku (`.crate-card-icon`, 40px — to jest "ładny rysunek";
  patrz uzasadnienie w 26.5 dlaczego emoji, nie canvas), cena
  (`.crate-card-price`, `{price} 🪙` albo `{price} 💎`) i przycisk "Kup"
  (`.crate-buy-btn`, wyszarzony/`disabled`, gdy nie stać).
- Pod kartami: sekcja "Twoje skrzynki" (`renderCrateInventory()`) — rząd
  klikalnych kafelków tylko dla rodzajów, których gracz **faktycznie
  posiada ≥1** sztukę (`.crate-inv-item`, ikona + `×N` + etykieta "Otwórz"),
  pusty stan pokazuje `t('crates_none_owned')` zamiast pustego miejsca.
  Kliknięcie kafelka wywołuje `openCrateAnimated(id)`.
- Kolory rzadkości: `common` neutralny (bez akcentu), `epic` fioletowy
  (`#b672ff`, ten sam odcień co istniejący skin Fiolet), `legendary` złoty
  (`var(--gold)`) z dodatkową poświatą — zastosowane spójnie na karcie
  sklepowej, kafelku magazynu i ikonie w overlayu otwarcia (klasy
  `.rarity-epic`/`.rarity-legendary` w kilku miejscach naraz).

### 26.3. Otwieranie — animacja + dźwięk, dane stosowane od razu

- **`openCrateAnimated(id)`**: odejmuje 1 sztukę z `crateInventory` i
  zapisuje **od razu** (żeby stan magazynu był poprawny, nawet gdyby user
  zamknął kartę w trakcie animacji), losuje wypłatę monet
  (`randRange(coinsRange)`) i `extraCount` przedmiotów (każdy
  `randRange(itemRange)` diamentów), **od razu** dolicza je przez
  `addCoins()`/nowe zsumowane `addDiamonds()` — sama animacja
  (`showCrateOpenOverlay()`) jest **czysto wizualna**, sterowana własnym
  ciągiem `setTimeout`, rozłączona z mutacją danych (ten sam wzorzec co
  "najpierw zastosuj stan, potem odtwórz efekt" używany już przy innych
  nagrodach w tym projekcie).
- **Sekwencja animacji** (nowy overlay `#crateOpenOverlay`, reużywa istniejącą
  klasę `.overlay`/`.overlay-btns` z overlayu wyniku — pkt 1/kolumna
  "Weryfikacja" wielu wcześniejszych punktów): (1) ikona skrzynki "trzęsie
  się" 650 ms (`@keyframes crateShake`), (2) potem "rozbłyska"
  (`@keyframes crateBurst`, skala + rozjaśnienie) i pokazuje się wypłata
  monet, (3) kolejne przedmioty pojawiają się jeden po drugim co 170 ms z
  animacją "pop" (`@keyframes itemPop`, scale-in), (4) 300 ms po ostatnim
  przedmiocie pojawia się przycisk "Super!" zamykający overlay i
  odświeżający ekran skrzynek pod spodem.
- **Dźwięk `playCrateOpen(rarity)`** (nowa funkcja w sekcji AUDIO, obok
  `playHit()`/`playWinFanfare()`) — niski "odblokowujący" stuk (opadający
  sinus) + kaskada rosnących dźwięków przez istniejący `playNote()`, z
  **różną liczbą/wysokością nut zależnie od rzadkości** (2 nuty dla zwykłej,
  4 dla epickiej, 6 dla legendarnej) — więc każda rzadkość brzmi wyraźnie
  inaczej, nie tylko wygląda inaczej.

### 26.4. Balans (świadomie "na oko", jak wszystko w tym projekcie)

| Skrzynka | Cena | Wypłata monet | Przedmioty (diamenty każdy) | Razem diamentów (śr.) |
|---|---|---|---|---|
| Zwykła | 500 🪙 | 100–180 | 2 × (1–3) | ~4 |
| Epicka | 2000 🪙 | 400–700 | 5 × (2–5) | ~17 |
| Legendarna | 10 💎 | 900–1500 | 10 × (3–7) | ~50 |

Legendarna kosztuje diamenty i **wypłaca więcej diamentów niż kosztuje** —
to świadoma decyzja, nie przeoczenie: diamenty i tak nie mają w tej chwili
żadnego innego zastosowania poza kupowaniem skrzynek (patrz pkt 25.4), więc
"nadwyżka" nie psuje żadnej realnej równowagi ekonomicznej — ma tylko dawać
poczucie nagrody za odblokowanie najdroższej skrzynki. Do przemyślenia,
gdyby w przyszłości diamenty zyskały inne, "poważniejsze" zastosowanie
(sklep za diamenty?), wtedy tę relację cena/wypłata warto będzie
zrewidować.

### 26.5. Świadome uproszczenia poza zakresem

- **Rysunek skrzynki to duże emoji + kolorowa poświata CSS, nie osobny
  rysunek na `<canvas>`** (w przeciwieństwie do skinów kulki z pkt 17/19,
  które **muszą** być na canvasie, bo to realna grafika używana w
  rozgrywce). Skrzynki nie pojawiają się nigdy w rozgrywce, więc nie ma tej
  presji — emoji + obwódka/poświata rzadkości to dokładnie ten sam,
  sprawdzony już wzorzec wizualny co ikony Osiągnięć (pkt 24.1) i Misji, i
  uznano go za "wystarczająco ładny rysunek" bez dodatkowego ryzyka
  (3 nowe funkcje rysujące na canvasie to więcej kodu i więcej okazji do
  błędu w tej samej sesji, w której i tak już sporo się zmieniło).
- **Tylko jeden typ przedmiotu (diamenty)** — zgodnie z wyraźną prośbą
  usera ("narazie... zaraz dodamy inne"). Kod jest już przygotowany pod
  rozszerzenie: `extraCount` jest per-skrzynka, a `showCrateOpenOverlay()`
  renderuje przedmioty z osobnej pętli `items.forEach` — dodanie nowego typu
  przedmiotu w przyszłości sprowadzi się do rozszerzenia kształtu obiektu
  `{amount}` o pole `type` i dodania gałęzi renderującej inny tekst/ikonę per
  typ, bez przepisywania reszty mechanizmu.
- Brak ograniczenia liczby posiadanych nieotwartych skrzynek (magazyn może
  rosnąć bez limitu) — user o limit nie prosił.
- Brak własnych osiągnięć/misji powiązanych ze skrzynkami (np. "otwórz 10
  skrzynek") — nie było o to proszone, ale to naturalne rozszerzenie na
  przyszłość, skoro `ACHIEVEMENTS`/`MISSIONS` już mają gotowy wzorzec.

**Weryfikacja w tej sesji:** `node` niedostępny — zbalansowanie sprawdzone
przez `perl`: `game.js` (`{}` 708/708, `()` 2437/2437, `[]` 149/149),
`i18n.js` (`{}` 431/431), `index.html` (`<div>` 53/53), `style.css` (`{}`
240/240). Policzono wystąpienia wszystkich 14 nowych kluczy i18n — po 10
(raz na język). Powtórzono audyt `getElementById` × realne `id` w HTML —
te same 4 znane, celowo dynamiczne id co w poprzednich sesjach, zero
nowych rozjazdów. Otwarto `index.html` w domyślnej przeglądarce.

**Do potwierdzenia przez usera** (nie da się zweryfikować bez realnego
klikania): (1) przycisk "Skrzynki" pod "Misje" w menu głównym działa i
otwiera nowy ekran; (2) trzy karty (Zwykła/Epicka/Legendarna) pokazują się
w rzędzie z sensownym rozmiarem na planszy 420px, przycisk "Kup" jest
wyszarzony, gdy brakuje waluty, i aktywny, gdy stać; (3) po zakupie
skrzynka pojawia się w sekcji "Twoje skrzynki" pod spodem; (4) kliknięcie
posiadanej skrzynki odpala animację: trzęsienie → rozbłysk → wypłata
monet → kolejne przedmioty pojawiające się jeden po drugim → przycisk
"Super!"; (5) dźwięk otwarcia faktycznie brzmi bogaciej dla wyższych
rzadkości; (6) po zamknięciu overlayu saldo monet/diamentów w rogu menu
faktycznie odzwierciedla to, co pokazała animacja; (7) zakup legendarnej
(za diamenty) blokuje się poprawnie, gdy diamentów jest za mało (na
starcie gracz ma 0 diamentów, więc trzeba najpierw zdobyć je np. z
Wyzwania dnia z pkt 25, żeby w ogóle przetestować ten zakup).

**Poprawka jeszcze w tej samej sesji:** user zdecydował, że nie chce
pośredniego kroku "kup → skrzynka czeka w magazynie → osobno kliknij, żeby
otworzyć" — zakup ma **od razu** odpalać animację otwarcia. Usunięto cały
magazyn: `crateInventory`/`loadCrateInventory()`/`saveCrateInventory()`,
klucz `localStorage` **`scraper_crates_v1`**, funkcję `renderCrateInventory()`
oraz sekcję "Twoje skrzynki" w `index.html`/`style.css`
(`.crate-inv-title`/`.crate-inventory-row`/`.crate-inv-*`). `buyCrate()` i
`openCrateAnimated()` połączone w jedną funkcję `buyAndOpenCrate(id)` —
płatność i losowanie nagród dzieje się od razu po kliknięciu "Kup", po czym
od razu startuje ten sam overlay z animacją co poprzednio (bez zmian w
`showCrateOpenOverlay()` poza tym, że przycisk "Super!" na końcu odświeża
już tylko `renderCrateShop()`, nie ma już czego odświeżać w magazynie).
Usunięto też i18n klucze `crates_owned_title`/`crates_none_owned`/
`btn_open_crate` (30 par klucz-wartość, po 3 na 10 języków) jako martwe po
tej zmianie. Ekran Skrzynek to teraz po prostu trzy karty do kupienia —
kliknięcie "Kup" **jest** otwarciem. Zbalansowanie zweryfikowane ponownie
przez `perl` (`game.js` `{}` 694/694, `()` 2388/2388, `[]` 143/143;
`index.html` `<div>` 51/51; `style.css` `{}` 230/230) oraz grepem
potwierdzono zero pozostałych odwołań do usuniętych nazw
(`crateInventory`, `renderCrateInventory`, `openCrateAnimated`).

---

## 27. Usunięcie sterowania kursorem/dotykiem + usunięcie lasera bossa (2026-07-10, część 3)

**Kontekst:** user poprosił o dwie zmiany na raz: (1) żeby podczas
rozgrywki nie dało się sterować kulką kursorem — tylko WSAD/strzałki; (2)
usunąć "pionowe paski przechodzące przez mapę" widoczne podczas rozgrywki.

### 27.1. Sterowanie wyłącznie klawiaturą

- Usunięto całkowicie sterowanie przeciąganiem (`dragTarget`,
  `pointerToXY()`, oraz 6 nasłuchiwaczy: `mousedown`/`mousemove`/`mouseup`/
  `touchstart`/`touchmove`/`touchend` na `canvas`/`window`) — obecne od
  samego początku projektu (patrz pkt 11, punkt 2: "sterowanie WSAD+strzałki,
  drag na dotyku"), teraz świadomie wycofane na wyraźną prośbę usera.
- W `loop()` ruch gracza typu `'both'` (używany w trybach `single`/
  `freeplay`/`challenge`) uproszczony do samego sprawdzania
  `keysArrows`/`keysWasd` — zniknęła gałąź `if (dragTarget){...} else
  {...}`, zostało tylko sterowanie klawiaturą (identyczne z tym, co już
  wcześniej robiły gałęzie `'arrows'`/`'wasd'` dla multiplayera).
- `ensureAudio()` (odblokowanie `AudioContext` przy pierwszym geście
  użytkownika) było też wołane z `mousedown`/`touchstart` na canvasie —
  usunięcie tych listenerów **nie jest problemem**, bo `ensureAudio()` i tak
  jest już wołane na starcie każdego trybu (`startLevel`/`startFreeplay`/
  `startMultiplayer`/`startChallenge`), które są odpalane kliknięciem
  przycisku GRAJ — to samo kliknięcie już liczy się jako gest użytkownika.
- **Zaktualizowano podpowiedź** (`hint_text`, wcześniej "Steruj strzałkami
  lub WSAD albo przeciąganiem palca") we wszystkich 10 językach, żeby nie
  wspominała już o przeciąganiu.
- **Świadomy skutek uboczny, o którym warto wiedzieć:** przeciąganie było
  **jedynym** sposobem sterowania na urządzeniach dotykowych bez klawiatury
  (telefon/tablet) — po tej zmianie gra jest efektywnie **niegrywalna na
  czystym dotyku** (nie ma już żadnego sposobu poruszania kulką bez
  klawiatury fizycznej/ekranowej). User o to wprost poprosił, więc zmiana
  jest zamierzona, ale to świadomy kompromis, gdyby w przyszłości ktoś
  zapytał "czemu gra nie działa na telefonie".

### 27.2. Usunięcie lasera bossa (`beam`)

- "Pionowe paski przechodzące przez mapę" — po przejrzeniu całego kodu
  rysującego okazało się, że jedyne miejsce w całej grze rysujące pełną,
  pionową belkę na całą wysokość planszy (`fillRect(left, 0, o.w, H)`) to
  przeszkoda `beam` ("laser bossa"), dodana w pkt 20.3 jako unikalny atak
  wyłącznie na poziomach bossów (10/20/30/40/50). To jednoznacznie
  zidentyfikowało, o co chodziło userowi — nie było żadnego innego
  kandydata w kodzie.
- **Usunięto całkowicie**: wpis `beam` w `TYPE_COLORS`, stałe
  `BEAM_TELEGRAPH`/`BEAM_STRIKE`/`BEAM_FADE`/`BEAM_INTERVAL` i zmienną
  `beamTimer`, funkcję `spawnBeam()` i jej wywołanie w `loop()` (blok
  odpalany tylko na poziomach bossów), gałąź `o.type === 'beam'` w
  `obstacleHitsPlayer()`, gałąź aktualizacji stanu `beam` w pętli
  aktualizacji przeszkód w `loop()`, oraz funkcję `drawBeamObstacle()` wraz
  z jej wywołaniem w `drawObstacle()`.
- **Skutek:** poziomy bossów (10/20/30/40/50) nadal istnieją i nadal są
  trudniejsze (wyższy `baseSpeed`, krótszy `spawnInterval`, wyższy `target`,
  czerwona ramka + korona na kafelku, ciemniejsza muzyka bossa — patrz
  pkt 3.1/19.3), ale **stracił swój unikalny wzorzec ataku** dodany w
  pkt 20.3 — wracają do bycia "po prostu szybszą i gęstszą" wersją
  zwykłych 6 typów przeszkód (block/zigzag/orb/slider/spinner/pulsar),
  dokładnie tak jak przed pkt 20. Legenda przeszkód (`#legend`) i tak nigdy
  nie wspominała `beam` (patrz pkt 3.5), więc nie wymagała zmiany.
- Nie zostało tknięte nic związanego z pozostałymi 6 typami przeszkód ani z
  resztą mechaniki poziomów bossów — to wyłącznie usunięcie jednego,
  konkretnego typu przeszkody.

**Weryfikacja w tej sesji:** `node` niedostępny — zbalansowanie sprawdzone
przez `perl`: `game.js` (`{}` 667/667, `()` 2322/2322, `[]` 137/137,
spadek zgodny z ilością usuniętego kodu), `i18n.js` (`{}` 431/431, bez
zmian w liczbie nawiasów — `hint_text` to tylko edycja istniejącego
tekstu, nie nowy klucz), `index.html` (`<div>` 51/51, bez zmian). Grepem
potwierdzono **zero** pozostałych wystąpień `beam`/`BEAM`/`dragTarget`/
`pointerToXY` w `game.js`, `index.html`, `style.css` i `i18n.js`. Otwarto
`index.html` w domyślnej przeglądarce.

**Do potwierdzenia przez usera:** (1) w Poziomach/Trybie wolnym/Wyzwaniu
kulka reaguje wyłącznie na strzałki/WSAD, kliknięcie/przeciąganie myszką po
planszy nic już nie robi; (2) na poziomach bossów (10/20/30/40/50)
faktycznie nie pojawia się już żaden pionowy pasek/laser, tylko zwykłe
6 typów przeszkód, szybciej i gęściej niż na zwykłych poziomach; (3) brak
błędów w konsoli przeglądarki po tych usunięciach.

### 27.3. Sprostowanie: prawdziwe źródło pasków było gdzie indziej

**Zaraz po wdrożeniu 27.2** user zgłosił, że paski **nadal są widoczne** —
diagnoza "to na pewno `beam`" (uzasadniona tym, że to było jedyne miejsce
rysujące pełnowysokościowy prostokąt przez `fillRect(...,H)`) okazała się
niepełna: w `draw()` (funkcja renderująca tło planszy na **każdej klatce, w
każdym trybie**, nie tylko na bossach) był osobny, niezależny fragment,
którego pierwsze przeszukanie kodu nie wyłapało (bo szukano wywołań
`fillRect`, a to było rysowanie linii przez `moveTo`/`lineTo` w pętli):

```js
ctx.strokeStyle = 'rgba(255,255,255,0.03)';
ctx.lineWidth = 1;
for (let gx = 0; gx < W; gx += 30){
  ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke();
}
```

To była **subtelna siatka tła** — pionowa linia co 30px, od góry do dołu
planszy, bardzo niska nieprzezroczystość (`alpha 0.03`) — obecna od dawna
(prawdopodobnie od samego początku projektu, poza zasięgiem historii
zapisanej w tym dokumencie), rysowana bezwarunkowo w **każdym** trybie
rozgrywki, nie tylko na bossach. To właśnie to, a nie `beam`, user miał na
myśli — dopiero po usunięciu lasera i dalszym zgłoszeniu "paski nadal są"
przeszukano całą funkcję `draw()` linia po linii i znaleziono ten fragment.
**Usunięty w całości** (4 linie), reszta `draw()` (gwiazdy, przeszkody,
ślad kulki, poświata, winieta, obwódka bossa) bez zmian. Usunięcie lasera
bossa z pkt 27.2 **zostaje** — to była też realna, zamierzona zmiana, tylko
nie ona odpowiadała za zgłoszony objaw.

**Weryfikacja:** `perl` — `game.js` (`{}` 666/666, `()` 2316/2316, spadek o
dokładnie tyle, ile usunięto). Grepem potwierdzono brak innych wystąpień
pętli rysującej linie siatki (`gx += 30`) gdziekolwiek indziej w pliku (np.
w pętli podglądu menu `drawMenuIdlePreview()` — nie było jej tam
duplikowanej, więc nie trzeba było nic dodatkowo poprawiać). Otwarto
`index.html` w domyślnej przeglądarce. **Do potwierdzenia przez usera:**
paski faktycznie zniknęły z planszy we wszystkich trybach.

### 27.4. Przywrócenie lasera bossa

Skoro to nie on odpowiadał za zgłoszone paski (patrz 27.3), user poprosił o
**przywrócenie** lasera bossa usuniętego w 27.2. Przywrócono dosłownie
wszystko, co zostało usunięte: wpis `beam` w `TYPE_COLORS`, stałe
`BEAM_TELEGRAPH`/`BEAM_STRIKE`/`BEAM_FADE`/`BEAM_INTERVAL` + `beamTimer`,
`beamTimer = 0` w `resetRun()`, funkcję `spawnBeam()`, gałąź `beam` w
`obstacleHitsPlayer()`, blok odpalający `spawnBeam()` w `loop()` (tylko na
poziomach bossów), gałąź aktualizacji stanu `beam` w pętli przeszkód, oraz
funkcję `drawBeamObstacle()` wraz z jej wywołaniem w `drawObstacle()`. Kod
jest identyczny z tym sprzed usunięcia w 27.2 — laser bossa działa więc
znowu dokładnie tak, jak opisano w pkt 20.3. **Usunięcie sterowania
kursorem/dotykiem z pkt 27.1 oraz usunięcie siatki tła z pkt 27.3 zostają
bez zmian** — tylko laser wrócił.

**Weryfikacja:** `perl` — `game.js` (`{}` 681/681, `()` 2349/2349).
Grepem potwierdzono, że wszystkie fragmenty `beam`/`BEAM` są z powrotem na
swoich miejscach (13 wystąpień, dokładnie tyle, ile było przed usunięciem
w 27.2). Otwarto `index.html` w domyślnej przeglądarce.

---

## 28. Poszerzenie planszy gry (2026-07-11)

**Kontekst:** user poprosił o delikatne poszerzenie mapy rozgrywki w lewo i
w prawo, żeby plansza była nieco większa.

**Co zostało zmienione:** szerokość canvasu (`#board`) i otaczającego go
`.stage` zwiększona z **420px do 480px** (+60px, wysokość 600px bez zmian):

- `index.html` — atrybut `width="420"` → `width="480"` na `<canvas
  id="board">`.
- `style.css` — `.stage { width:420px }` → `480px` i `#board { width:420px }`
  → `480px` (oba muszą się zgadzać, bo canvas nie jest skalowany CSS-em,
  tylko renderowany 1:1 w swojej natywnej rozdzielczości).

**Dlaczego to było bezpieczne bez zmian w `game.js`:** cała logika gry
czyta wymiary planszy dynamicznie z samego elementu canvas
(`const W = canvas.width, H = canvas.height;`, `game.js:33`) i **nigdzie nie
ma zaszytych na sztywno liczb** typu `420`/`210` do pozycjonowania graczy,
przeszkód czy gwiazd — wszystko liczone względem `W`/`H` (`W/2`,
`Math.random()*(W-w)`, itd. — sprawdzone grepem). Dzięki temu poszerzenie
planszy samo w sobie automatycznie poszerzyło obszar spawnu przeszkód, pozycje
startowe graczy (`W*0.35`/`W*0.65`/`W/2`), pole ruchu (`clamp` do `[0, W]`) i
tło z gwiazdami — bez dotykania `game.js`. `.screen`/`.overlay` (ekrany menu,
overlay wyniku) mają `position:absolute; inset:0`, więc też automatycznie
rozciągnęły się na nową szerokość `.stage`, bez osobnej zmiany.

**Nie zostało zmienione:**
- Wysokość planszy (600px) — user prosił wyłącznie o poszerzenie w bok, nie o
  zmianę wysokości.
- Rozmiary graczy/przeszkód/skinów — zostają takie same, tylko dostały więcej
  miejsca w poziomie do poruszania się.
- Pełnoekranowe menu główne (`#mainMenu`, pkt 22) i jego widgety
  (`.mm-topleft-col`, `.mm-right-col`) — te są pozycjonowane względem całego
  viewportu (`position:fixed`), nie względem `.stage`, więc nie wymagały
  żadnej korekty.

**Weryfikacja w tej sesji:** `node` niedostępny w tym środowisku (jak
zawsze) — zweryfikowano przez `perl`: `style.css` (`{}` 230/230),
`index.html` (`<div>` 51/51) — oba bez zmian liczbowych względem stanu
sprzed edycji, bo zmieniono tylko wartości liczbowe w istniejących
deklaracjach, nie strukturę. `game.js` w ogóle nietknięty w tej sesji.
Otwarto `index.html` w domyślnej przeglądarce.

**Do potwierdzenia przez usera:** (1) plansza faktycznie wygląda na szerszą
we wszystkich trybach (Poziomy/Tryb wolny/Multiplayer/Wyzwanie); (2) menu i
overlay wyniku nadal wyglądają poprawnie wewnątrz szerszej planszy, bez
przycinania tekstu/przycisków; (3) czy 480px to docelowa szerokość, czy
user chce jeszcze więcej/mniej.

---

## 29. Poziomy jako przycisk menu + 100 poziomów + progresywne odblokowywanie przeszkód + brak monet za powtórkę (2026-07-11, część 2)

**Kontekst:** w tej samej sesji user poprosił o cztery powiązane zmiany w
trybie Poziomy: (1) „Poziomy” ma być osobnym przyciskiem w menu głównym pod
„Skrzynki”, zamiast pozycji w karuzeli trybów przy GRAJ; (2) rozszerzyć z 50
do **100 poziomów**, z kolejnymi bossami na 60/70/80/90/100; (3) poziom 1 ma
mieć tylko podstawową przeszkodę (`block`), a kolejne typy mają dochodzić na
poziomach 11/21/31/41/51 (te już istniejące: zygzak/kula/suwak/wirnik/pulsar)
oraz na 61/71/81/91 (cztery zupełnie nowe, wymyślone od zera); (4) powtórne
przejście już ukończonego poziomu ma **nie** dawać monet.

### 29.1. „Poziomy” jako przycisk menu głównego

- Przycisk `#btnLevels` przeniesiony z martwego, nieosiągalnego ekranu
  `#singleSelect` (patrz pkt 22.3 — ten ekran wciąż tam jest, tylko teraz bez
  tego jednego przycisku) do `.mm-side-buttons` w `#mainMenu`, pod „Skrzynki”
  — sam handler kliknięcia (otwórz siatkę poziomów) już istniał i działał
  bez zmian, wystarczyło przenieść element w `index.html`.
- `MENU_MODE_OPTIONS` (karuzela przy GRAJ) straciła pozycję `'levels'` —
  zostały tylko Tryb wolny / Kooperacja / Rywalizacja. Usunięto też martwą
  już gałąź `picked === 'levels'` w handlerze `btnPlay`.

### 29.2. 100 poziomów zamiast 50

- `LEVEL_COUNT: 50 → 100`. `isBoss = levelNumber % 10 === 0` (pkt 3.1) objął
  60/70/80/90/100 **bez żadnej zmiany kodu** — to już był ogólny warunek
  modulo, nie lista wpisana na sztywno. Paginacja (`PAGE_COUNT =
  LEVEL_COUNT/10`) automatycznie urosła z 5 do **10 stron**.
- **Ważna poprawka przy okazji:** `loadProgress()` wcześniej odrzucała cały
  zapisany postęp, jeśli długość tablicy w `localStorage` nie zgadzała się
  dokładnie z `LEVEL_COUNT` (`arr.length === LEVEL_COUNT`) — przy zwykłym
  podbiciu stałej to skasowałoby realny postęp gracza (wszystkie ukończone
  poziomy 1–50). Zmieniono na **dopełnianie** krótszej tablicy wartościami
  `false` zamiast odrzucania, więc dotychczasowe 50 ukończonych poziomów
  zostaje zachowane, a nowe 50 startuje jako nieukończone.
- Osiągnięcie „Pogromca bossów” (`all_bosses`) miało zaszyte na sztywno
  indeksy `[9,19,29,39,49]` (poziomy 10/20/30/40/50 liczone od zera) —
  rozszerzone o `59,69,79,89,99`. Tekst osiągnięcia i opis w `level_subtitle`
  zaktualizowane do „10 bossów”/pełnej listy poziomów bossów we **wszystkich
  10 językach**. `ach_all_levels_desc` („ukończ wszystkie 50 poziomów”)
  zaktualizowane do 100 też we wszystkich językach.
- Skiny bossowe (piłka nożna/disco/ogień/galaktyka/mistrz, pkt 17.3) **nie
  zostały rozszerzone** o kolejne 5 dla nowych bossów — user o to nie prosił,
  poziomy 60–100 są trudniejsze i dają skiny znane już z listy „Misje”, ale
  nie własne unikalne nagrody. Naturalne miejsce do rozszerzenia w
  przyszłości, jeśli będzie taka prośba.

### 29.3. Progresywne odblokowywanie typów przeszkód w Poziomach

- Nowa tablica `OBSTACLE_UNLOCKS` (`game.js`) mapuje próg poziomu na typ,
  który się od niego dodaje: `1→block, 11→zigzag, 21→orb, 31→slider,
  41→spinner, 51→pulsar, 61→gate, 71→homing, 81→mine, 91→swarm`. Funkcja
  `unlockedTypesForLevel(levelNumber)` zwraca listę wszystkich typów, których
  próg jest `<= levelNumber` — więc np. poziom 5 ma tylko `block`, poziom 15
  ma `block+zigzag`, poziom 65 ma siedem typów (wszystko do `gate` włącznie).
- `randType()` przepisane z twardo zakodowanych progów prawdopodobieństwa
  (`if (r<0.28) return 'block'...`) na **wagowe losowanie z dowolnej puli**
  (nowa stała `OBSTACLE_WEIGHTS`, 10 typów). W trybie `single` pula jest
  najpierw zawężana przez `unlockedTypesForLevel(currentLevelIndex+1)`, w
  pozostałych trybach (freeplay/coop/versus/challenge, które nie mają
  pojęcia „poziomu”) używana jest zawsze **pełna** pula 10 typów — dokładnie
  tak jak dotychczas (freeplay itd. zawsze miały komplet typów).
- Poziomy bossów (10/20/...) nie dostały żadnego specjalnego traktowania puli
  typów — korzystają z tego, co jest odblokowane na ich numerze poziomu,
  tak jak zwykłe poziomy (np. boss na 10 nadal ma tylko `block`, plus swój
  osobny laser `beam` z pkt 20.3, niezależny od tej puli).

### 29.4. Cztery nowe przeszkody (61/71/81/91)

Każda ma własne dane w `spawnObstacle()`, aktualizację stanu w `loop()`,
kolizję w `obstacleHitsPlayer()` i funkcję rysującą podpiętą w
`drawObstacle()` — dokładnie ten sam szkielet co istniejące typy z pkt 20.

- **`gate` (Brama, poziom 61)** — pełnoszerokościowa opadająca bariera z
  jedną wąską szczeliną (losowana szerokość i pozycja przy spawnie, stała
  przez cały opad). Kolizja to dwa prostokąty (`circleRectHit` po lewej i
  prawej stronie szczeliny) zamiast jednego — pierwsza przeszkoda w grze,
  która wymaga precyzyjnego ustawienia w poziomie pod konkretną, wąską
  bramkę, a nie tylko uniknięcia bryły.
- **`homing` (Namierzacz, poziom 71)** — wolna kula, która w każdej klatce
  lekko doskrętnia swoje `x` w stronę `x` gracza (`turnSpeed` ok. 0.018–0.032
  na klatkę) — słabe, unikalne dociąganie, nie „aim-lock" (da się od niej
  odjechać, ale trzeba na nią reagować, nie tylko raz wybrać tor i czekać).
  W multiplayerze celuje zawsze w `players[0]` — ten sam uproszczony wzorzec
  co istniejący `spawnBeam()` (pkt 20.3), który też ignoruje drugiego gracza.
- **`mine` (Mina, poziom 81)** — mała i nieszkodliwa przez `MINE_ARM_TIME`
  (550 ms) od zespawnowania, potem **uzbraja się trwale** (rośnie i zostaje
  śmiertelna aż do zejścia z planszy) — w odróżnieniu od `pulsar` (pkt 20.2)
  nie ma cyklu wygaszania, więc to jednorazowa decyzja „zdążyć uciec zanim
  się uzbroi", nie powtarzalne wyczucie rytmu.
- **`swarm` (Rój, poziom 91)** — rozszerzenie mechaniki `spinner` (pkt 20.1)
  z 2 grotów na **3, rozstawione co 120°** wokół wspólnego, opadającego
  pivotu — bezpieczna szczelina jest węższa i mija szybciej niż przy
  wirniku, najtrudniejszy z nowej czwórki, zgodnie z tym, że odblokowuje się
  najpóźniej (poziom 91).
- Kolory (`TYPE_COLORS`): brama zielona `#4ade80`, namierzacz
  indygo/fioletowoniebieski `#7c83ff`, mina bursztynowa `#ffb703`, rój
  turkusowy `#2dd4bf` — dobrane tak, by nie kolidowały wizualnie z 7
  istniejącymi kolorami przeszkód.
- **Legenda** (`#legend` w `index.html`) rozszerzona o 4 nowe pozycje (zawsze
  widoczne, statycznie — tak jak dotychczas, patrz zastrzeżenie w pkt 20.4:
  legenda nie zmienia się dynamicznie zależnie od odblokowanych na danym
  poziomie typów, więc np. na poziomie 5 legenda pokaże też typy, które
  jeszcze się nie pojawią).
- **i18n:** `legend_gate`/`legend_homing`/`legend_mine`/`legend_swarm`
  dodane do wszystkich 10 języków.
- **Wyzwanie dnia (pkt 25):** cel „unikaj X× danego typu” (`chal_obj_dodge`,
  `CHALLENGE_DODGE_TYPES`) rozszerzony o 4 nowe typy — skoro Wyzwanie i tak
  korzysta z pełnej puli 10 typów (nie ma „poziomu”), dziennie losowany typ
  do unikania może teraz wypaść też jako brama/namierzacz/mina/rój.

### 29.5. Brak monet za powtórne ukończenie poziomu

- `winLevel()` odczytuje `progress[currentLevelIndex]` **przed**
  nadpisaniem go na `true`, żeby wiedzieć, czy to pierwsze ukończenie. Jeśli
  poziom był już wcześniej ukończony, `earned = 0` — `addCoins()` w ogóle
  nie jest wołane, a wiersz z zarobkiem w overlayu wyniku znika (pusty
  `<p>`, ukrywany tym samym mechanizmem CSS `.overlay p:empty` co przy
  coop/versus, patrz pkt 15).
- Konsekwentnie: zerowy zarobek trafia też do `registerDailyRun(...,
  coinsEarned: earned)`, więc powtórka ukończonego poziomu nie podbija też
  dziennej misji „zarób X monet dzisiaj” (pkt 23.2) — nie tylko brak monet
  wprost, ale i brak pośredniego obejścia przez system dzienny.
- Pierwsze ukończenie dowolnego poziomu (w tym każdego z 50 nowych)
  zarabia monety dokładnie jak dotychczas — zmiana dotyczy wyłącznie
  **powtórek**.

**Nie zostało zrobione / świadomie poza zakresem:**
- Balans nowych przeszkód (`turnSpeed` namierzacza, `MINE_ARM_TIME`, rozmiar
  szczeliny bramy, prędkość roju) dobrany „na oko”, tak jak każdy inny
  balans w tym projekcie — nieprzetestowany długo w praktyce.
- Legenda pozostaje statyczna (patrz 29.4) — nie pokazuje dynamicznie tylko
  odblokowanych na danym poziomie typów.
- Brak nowych skinów bossowych dla bossów 60–100.
- Tłumaczenia nowych nazw przeszkód w zh/ko/ja zrobione „z pamięci modelu”,
  bez weryfikacji przez native speakera — jak cała reszta i18n w tym
  projekcie (patrz pkt 6).

**Weryfikacja w tej sesji:** `node` niedostępny — zweryfikowano `perl`:
`game.js` (`{}` 732/732, `()` 2504/2504, `[]` 153/153), `i18n.js` (`{}`
431/431 — bez zmian liczbowych, bo dodane teksty to nowe pary w istniejących
obiektach języków, nie nowe literały), `index.html` (`<div>` 51/51 — bez
zmian, bo ruszano tylko istniejące przyciski/atrybuty). Policzono wystąpienia
`legend_gate`/`legend_homing`/`legend_mine`/`legend_swarm` — po 10 (raz na
język). Sprawdzono grepem, że każdy z 4 nowych typów przeszkód ma dokładnie
6 wystąpień w `game.js` (`OBSTACLE_UNLOCKS`, `spawnObstacle`, `loop`,
`obstacleHitsPlayer`, `drawObstacle`, `CHALLENGE_DODGE_TYPES`) — symetrycznie
podłączone bez brakujących gałęzi. Powtórzono audyt `getElementById` × realne
`id` w HTML (wzorem pkt 22.4) — te same 4 znane, celowo dynamiczne id co w
poprzednich sesjach, zero nowych rozjazdów; potwierdzono też, że `id="btnLevels"`
występuje w pliku dokładnie raz (po przeniesieniu, nie duplikacji). Otwarto
`index.html` w domyślnej przeglądarce.

**Do potwierdzenia przez usera (duża zmiana, wymaga realnego grania):** (1)
przycisk „Poziomy” w menu głównym otwiera siatkę poziomów, a karuzela przy
GRAJ nie ma już pozycji „Poziomy”; (2) siatka poziomów pokazuje 10 stron
(100 poziomów), z bossami (czerwona ramka + korona) na 10/20/.../100; (3)
poziom 1 rzeczywiście spawnuje tylko czerwone bloki, a kolejne typy
przeszkód pojawiają się stopniowo na 11/21/31/41/51/61/71/81/91 — najlepiej
przetestować kilka poziomów w okolicach tych progów; (4) cztery nowe
przeszkody (brama/namierzacz/mina/rój) wyglądają i zachowują się czytelnie w
realnej rozgrywce, a namierzacz faktycznie „dogania” gracza w widoczny,
ale unikalny sposób; (5) ukończenie poziomu po raz drugi (np. wejście
ponownie w już ukończony poziom 1) faktycznie nie daje monet i nie pokazuje
wiersza zarobku w ekranie wyniku, podczas gdy pierwsze ukończenie nowego
poziomu nadal je daje; (6) dotychczasowy zapisany postęp (jeśli user miał
ukończone poziomy z 50-poziomowej wersji) **nie zniknął** po odświeżeniu —
to akurat da się sprawdzić wprost przy pierwszym uruchomieniu tej wersji.

**Poprawka jeszcze w tej samej sesji:** user zagrał i zgłosił, że Mina i Rój
(pkt 29.4) są „za proste do przejścia” — powiększono obie w `spawnObstacle()`:

- **Mina** — promień w stanie uzbrojonym (`armedR`) z 17–21px na
  **23–29px** (+~35%), promień w stanie nieuzbrojonym (`baseR`) z 8px na
  9px (drobna korekta, żeby nie była punktowa nawet przed uzbrojeniem).
  Czas do uzbrojenia (`MINE_ARM_TIME`, 550 ms) **zostawiony bez zmian** —
  user prosił wyłącznie o powiększenie, nie o szybsze uzbrajanie.
- **Rój** — zasięg grotów (`bladeReach`) z 24–32px na **31–41px** (+~30%),
  promień samego grota (`tipR`) z 9px na 11px — bezpieczna szczelina
  między trzema grotami jest teraz wyraźnie węższa.
- Rysowanie i kolizje obu przeszkód (`drawMineObstacle`/`drawSwarmObstacle`,
  `obstacleHitsPlayer`) już wcześniej skalowały się dynamicznie od tych
  wartości (`o.curR`/`o.armedR`/`o.bladeReach`/`o.tipR`), więc nie
  wymagały żadnej zmiany — powiększenie ograniczone wyłącznie do liczb w
  `spawnObstacle()`.

**Weryfikacja:** `perl` — `game.js` (`{}` 732/732, `()` 2506/2506, wzrost o
2 nawiasy okrągłe zgodny z dopisanymi komentarzami/wyrażeniami). Otwarto
`index.html` w domyślnej przeglądarce. **Do potwierdzenia przez usera:** Mina
i Rój na poziomach 81/91 faktycznie czują się teraz trudniejsze do ominięcia
niż poprzednio.

---

## 30. Dłuższa, mniej powtarzalna muzyka + dźwięki UI (2026-07-11, część 3)

**Kontekst:** user zgłosił, że muzyka menu i rozgrywki (proceduralny silnik
akordowy z pkt 19.3) brzmi jak to samo kilkusekundowe kółko odtwarzane w
nieskończoność — poprosił o dwie wyraźnie różne ścieżki (menu vs rozgrywka),
każda trwająca po kilka minut zamiast pętli co kilka sekund. Dodatkowo
poprosił o dźwięki dla: otwierania skrzynek, klikania przycisków, wygrania
poziomu, kupienia czegoś.

### 30.1. Dlaczego pętla brzmiała krótko

Każda z trzech aranżacji (menu/rozgrywka/boss) miała tylko **4 akordy**,
odtwarzane w kółko w tej samej kolejności — przy tempie menu (480 ms/krok × 4
kroki/akord) to była pętla **7,7 sekundy**, przy rozgrywce (235 ms/krok)
**3,76 sekundy**, przy bossie (190 ms/krok) **3,04 sekundy**. Stąd wrażenie
"co chwilę to samo".

### 30.2. Rozwiązanie: 8 akordów + długa, deterministyczna kolejność odtwarzania

Zamiast nagrywać/pisać ręcznie kilkuminutowe kompozycje (niemożliwe bez
plików audio — projekt zostaje w 100% proceduralny, offline, zgodnie z
filozofią z pkt 19.3), rozszerzono silnik o dwie rzeczy:

- **Każda z 3 progresji rozszerzona z 4 do 8 akordów** (`MENU_PROGRESSION`
  Am-F-C-G-F-Am-Dm-G, `GAME_PROGRESSION` Em-C-G-D-Am-Em-C-D,
  `BOSS_PROGRESSION` Dm-Bb-F-C-Gm-Dm-Bb-C) — każda dodaje jeden nowy akord
  względem oryginału (Dm/Am/Gm) i powtarza fragment wcześniejszej
  progresji z wariacją, więc brzmi jak rozbudowana, ale wciąż spójna
  wersja tego, co było.
- **Nowa funkcja `buildChordSequence(poolSize, length, seed)`** — mały,
  deterministyczny LCG (generator pseudolosowy z ustalonym ziarnem, przez
  `Math.imul` żeby uniknąć utraty precyzji przy dużych liczbach w JS)
  budujący **długą kolejność** odtwarzania akordów z puli 8, bez dwóch
  identycznych akordów pod rząd. Celowo deterministyczny (nie
  `Math.random()`) — odtwarzalny, łatwy do rozumowania o jego zachowaniu,
  nie zależy od tego, ile razy wcześniej odpalono inne dźwięki.
- **Długość sekwencji dobrana pod docelowy czas trwania**: menu 128 taktów
  (× 1,92 s/takt ≈ **4 minuty**), rozgrywka 256 taktów (× 0,94 s/takt ≈ **4
  minuty**), boss 240 taktów (× 0,76 s/takt ≈ **3 minuty**) — dopiero po
  tylu taktach sekwencja faktycznie zawija się do początku, więc realnie
  brzmi jak długi, zmienny utwór, nie krótka pętla.
- **Dodatkowa warstwa urozmaicenia:** nowa stała `ARP_PATTERNS` (4 stałe
  permutacje kolejności 4 nut arpeggio w akordzie), rotowana **co takt** na
  podstawie samego numeru taktu — dzięki temu nawet takt grający ten sam
  akord co poprzednio (co się zdarza w 8-elementowej puli) nie brzmi
  nutę-w-nutę identycznie.
- `stepProgression()` zmieniło sygnaturę (`progression, sequence, stepIdx,
  opts` zamiast `progression, stepIdx, opts`) — woła teraz `sequence[...]`
  żeby wybrać, który z 8 akordów gra w danym takcie, zamiast prostego
  `stepIdx % 4`. `startMusic()`/`startMenuMusic()` przekazują odpowiednio
  `GAME_SEQUENCE`/`BOSS_SEQUENCE`/`MENU_SEQUENCE`.
- **Nic w architekturze włączania/wyłączania muzyki się nie zmieniło** —
  wciąż jeden `setInterval` na ścieżkę, wciąż ten sam mechanizm
  przełączania menu ↔ rozgrywka ↔ boss z `showScreen()`/`openPause()`/
  `closePause()`/`loop()`. Zmieniła się wyłącznie zawartość tego, co gra.

### 30.3. Nowe dźwięki UI

- **`playClick()`** — krótki, cichy „tik” (kwadratowa fala, 880→640 Hz,
  ~70 ms) na **każde** kliknięcie dowolnego `<button>` w grze. Podpięty
  **jednym delegowanym nasłuchiwaczem** na `document` (faza bąbelkowania)
  zamiast dopisywania wywołania do ~35 istniejących osobnych
  `addEventListener('click', ...)` w menu — nasłuchiwacz sprawdza
  `e.target.closest('button')`. Faza bąbelkowania oznacza, że własny
  handler przycisku (np. `buySkin()` wołający `playPurchase()`) wykonuje
  się **najpierw**, a ten cichy „tik” leci **pod spodem/tuż po** —
  celowo, żeby nie zagłuszał ważniejszych dźwięków akcji, tylko dawał
  natychmiastowe potwierdzenie kliknięcia.
- **`playClick()` sam woła `ensureAudio()`** (w odróżnieniu od reszty
  efektów w tej sekcji, które zakładają, że audio już istnieje) — to
  często **pierwszy** dźwięk, jaki gracz wywoła (klik w menu głównym,
  zanim jeszcze cokolwiek uruchomił), a klik przycisku to dokładnie ten
  rodzaj gestu użytkownika, którego przeglądarki wymagają, żeby
  `AudioContext` w ogóle mógł wystartować.
- **`playPurchase()`** — jasny, wznoszący się dwudźwięk (783,99 Hz →
  1174,66 Hz, `triangle`), wołany z `buySkin()` po udanym zakupie skina za
  monety. Celowo krótszy i prostszy niż istniejący `playCrateOpen()` (pkt
  16.2/26.3) — skrzynki mają zostać swoim własnym, większym momentem
  „otwierania”, zakup skina nie ma brzmieć identycznie.
- **Otwieranie skrzynek i wygrana poziomu miały już swoje dźwięki
  wcześniej** (`playCrateOpen()` z pkt 16.2/26.3, `playWinFanfare()` z
  wcześniejszych sesji) — nie wymagały zmian, user mógł nie być
  świadomy, że już tam są.

**Nie zostało zrobione / świadomie poza zakresem:**
- Balans głośności/tempa nowych, dłuższych progresji nie był odsłuchany w
  tej sesji (to samo zastrzeżenie co przy pkt 19.3 — Claude nie może
  odtworzyć dźwięku) — **koniecznie przetestuj ręcznie**, czy 8-akordowe
  wersje menu/rozgrywki/bossa faktycznie brzmią spójnie, a nie jak losowe
  akordy.
- `playClick()` gra na **każdym** przycisku, łącznie z tymi, które mają już
  własny dźwięk akcji (Kup, otwórz skrzynkę) — świadomy wybór (prostszy niż
  lista wyjątków), efekt to cichy „tik” pod spodem głównego dźwięku, nie
  osobny, konkurujący dźwięk. Jeśli w praktyce zabrzmi to jako
  „podwójny klik”, warto rozważyć wykluczenie konkretnych przycisków.
- Czas trwania pętli (4 minuty/4 minuty/3 minuty) to wciąż pętla, nie
  utwór bez końca — przy bardzo długich sesjach (>4 min bez zmiany ekranu)
  usłyszy się powtórkę od początku sekwencji. Zgodne z prośbą „po kilka
  minut”, nie „w nieskończoność bez powtórek”.

**Weryfikacja w tej sesji:** `node` niedostępny — zweryfikowano `perl`:
`game.js` (`{}` 751/751, `()` 2559/2559, `[]` 189/189). Sprawdzono grepem
spójność nowych identyfikatorów (`playClick`, `playPurchase`,
`buildChordSequence`, `MENU_SEQUENCE`/`GAME_SEQUENCE`/`BOSS_SEQUENCE`,
`ARP_PATTERNS`) — każdy zdefiniowany raz i użyty dokładnie tyle razy, ile
się spodziewano. Ręcznie prześledzono indeksowanie (`arpOrder[posInChord]`,
`sequence[barIdx % sequence.length]`) pod kątem wyjścia poza zakres tablicy
— bezpieczne, bo `posInChord` zawsze 0–3 (permutacja 4-elementowa), a
`buildChordSequence` zawsze zwraca indeksy `0..poolSize-1`. Naprawiono przy
okazji potencjalny błąd precyzji w generatorze LCG (zwykłe mnożenie `s *
1103515245` przy dużych `s` przekracza `Number.MAX_SAFE_INTEGER` w
JavaScripcie przed operacją `>>> 0`) — zamieniono na `Math.imul(s,
1103515245)`, które poprawnie liczy w 32-bitowej arytmetyce całkowitej.
Otwarto `index.html` w domyślnej przeglądarce.

**Do potwierdzenia przez usera (dźwięk — nie da się zweryfikować bez
realnego odsłuchu):** (1) muzyka menu i rozgrywki brzmią teraz wyraźnie
dłużej, zanim usłyszy się dokładnie ten sam fragment ponownie; (2) obie
ścieżki (menu vs rozgrywka/boss) nadal wyraźnie się od siebie różnią,
mimo rozszerzenia; (3) kliknięcie dowolnego przycisku w menu wydaje cichy
dźwięk „klik”; (4) kupno skina w sklepie brzmi inaczej niż otwarcie
skrzynki; (5) głośność nowych dźwięków (klik, zakup) jest wyważona
względem reszty efektów (trafienie, fanfara, skrzynka) — nie za cicho, nie
za głośno.

---

## 31. Skrzynki dają też skiny i nowe „Podwajacze” (2026-07-11, część 4)

**Kontekst:** user poprosił o dwie powiązane rzeczy: (1) żeby skrzynki miały
małą szansę wypuścić któryś ze skinów kupowanych za monety (obok istniejącej
puli diamentów); (2) nowy system „podwajaczy” — 2× monety, 2× wolniejsze
tempo, 2× mniejsze przeszkody, dodatkowe serce — aktywowanych po kliknięciu
Start w Trybie wolnym i trybach Multiplayer, jeśli gracz je posiada. Serce
działa jako wskrzeszenie: pierwsza śmierć kosztuje 1 serce, kolejna 2, itd.
Zapytany, skąd gracz ma zdobywać podwajacze, user wybrał: **ze skrzynek**
(jako nowy typ przedmiotu, obok diamentów i teraz skinów), z zapowiedzią, że
źródło "misje" dojdzie w osobnej, przyszłej sesji.

### 31.1. Skrzynki: trzeci i czwarty typ przedmiotu

`buyAndOpenCrate()` losował dotąd wyłącznie diamenty na każdy z N slotów
"dodatkowych przedmiotów" (kod był świadomie przygotowany pod rozszerzenie,
patrz pkt 26.5). Nowa funkcja **`rollCrateItem(itemRange)`** losuje dla
każdego slotu niezależnie:
- **~5%** — jeden z **nieposiadanych jeszcze** skinów monetowych (Turkus/
  Koral/Fiolet/Bursztyn/Szmaragd/Chrom/Pryzmat/Neon) — jeśli gracz ma już
  wszystkie, ta gałąź jest pomijana (spada z powrotem do diamentów, nie ma
  ryzyka "pustego" losowania).
- **~22%** — jedna sztuka losowego podwajacza (patrz 31.2).
- **pozostałe ~73%** — diamenty, jak dotychczas.

Balans (5/22/73%) dobrany "na oko", bez uwzględniania rzadkości skrzynki —
`extraCount` już rośnie z rarity (2/5/10 slotów dla zwykłej/epickiej/
legendarnej), więc droższe skrzynki naturalnie dają więcej prób/lepsze
szanse, bez potrzeby osobnego strojenia procentów per rarity.

`buyAndOpenCrate()` stosuje wylosowane nagrody od razu (ten sam wzorzec
"najpierw dane, potem czysto wizualna animacja" co reszta projektu): skin
trafia do `ownedSkins` (+ `checkAchievements()`/`checkMissions()`, bo zdobycie
skina może odblokować np. "Kolekcjoner"), podwajacz dopisuje się do nowego
`boosterInventory`. `showCrateOpenOverlay()` rozpoznaje typ itemu i pokazuje
albo nazwę skina (🎨), albo ikonę+nazwę podwajacza, albo dotychczasową kwotę
diamentów.

### 31.2. Cztery podwajacze — dane i trwały zapis

Nowy obiekt `BOOSTERS` (4 wpisy: `coins2x`, `slowmo`, `small`, `heart`),
posiadane sztuki w `boosterInventory` (`localStorage` klucz
**`scraper_boosters_v1`**, ten sam wzorzec `try/catch` + sanity-check kształtu
co reszta zapisów).

| Podwajacz | Efekt |
|---|---|
| 🪙 Podwójne monety | `coinsForDistance(distance) × 2` przy końcu biegu (tylko realny efekt w Trybie wolnym — coop/versus i tak nigdy nie zarabiają monet, patrz pkt 15, więc tam jest wybieralny, ale bez skutku) |
| 🐢 Zwolnione tempo | `baseSpeed × 0.5` **i** `spawnInterval × 2` — wolniejsze przeszkody i rzadszy spawn |
| 🔍 Mniejsze przeszkody | `sizeMult = 0.5` w `spawnObstacle()` (ten sam mechanizm co modyfikator rozmiaru Wyzwania dnia z pkt 25.3, tylko przeciwny kierunek — tam >1 powiększa, tu <1 zmniejsza) |
| ❤️ Dodatkowe serce | patrz 31.4 — mechanika wskrzeszenia, nie stały modyfikator |

### 31.3. Ekran wyboru podwajacza — po kliknięciu GRAJ

Nowy ekran `#boosterScreen` ("Podwajacze"), wizualnie reużywający wzorzec
"dziennika questów" z pkt 24.2 (`.quest-row`/`.quest-top-line`/`.quest-desc`),
tylko z paskiem postępu zastąpionym kompaktowym przyciskiem "Aktywuj"
(nowa klasa `.booster-activate-btn`).

- **Pokazuje się tylko, gdy jest sens** — `anyBoosterOwned()` sprawdzane w
  handlerze GRAJ (`btnPlay`): jeśli gracz nie ma **żadnego** podwajacza,
  GRAJ startuje bieg od razu jak dotychczas (`launchMode(picked, null)`),
  bez dodatkowego ekranu. Ekran pojawia się wyłącznie, gdy jest faktyczny
  wybór do zrobienia.
- Dotyczy **tylko** Trybu wolnego / Kooperacji / Rywalizacji — te trzy są
  jedynymi pozycjami zostałymi w karuzeli trybów po pkt 29.1. Poziomy (własny
  przycisk) i Wyzwanie dnia (własny przycisk, własny system nagród z pkt 25)
  **nie przechodzą przez ten ekran** — `startLevel()`/`startChallenge()`
  dodatkowo zerują `activeBooster` na starcie, defensywnie, na wypadek gdyby
  jakiś podwajacz z poprzedniego biegu został "w locie".
- **`launchMode(modeId, boosterId)`** — wspólna funkcja startująca bieg:
  dla podwajaczy innych niż `heart` odejmuje 1 sztukę z `boosterInventory` od
  razu (koszt płacony z góry za cały bieg); dla `heart` **nic nie odejmuje**
  na starcie — tylko ustawia `activeBooster = 'heart'`, prawdziwy koszt
  nalicza się dopiero przy realnej śmierci (patrz 31.4). Przycisk
  "Start bez podwajacza" (`btnStartNoBooster`) woła `launchMode(mode, null)`.
- **"Zagraj ponownie" w ekranie wyniku (Tryb wolny/Kooperacja/Rywalizacja)
  celowo NIE przechodzi przez ten ekran** — zeruje `activeBooster` wprost
  przed ponownym startem, żeby zużyty (albo niewykorzystany) podwajacz z
  poprzedniego biegu nie "doczepił się" za darmo do kolejnego; jeśli user
  chce znowu użyć podwajacza, musi wrócić do menu i kliknąć GRAJ ponownie.

### 31.4. Serce — jedno wskrzeszenie na bieg

**Poprawka jeszcze w tej samej sesji:** pierwsza wersja miała rosnący koszt
(1 serce za pierwsze wskrzeszenie, 2 za drugie w tym samym biegu, itd.) —
user zdecydował, że ma być **maksymalnie jedno** wskrzeszenie na bieg,
zawsze za 1 serce, bez możliwości drugiego. Zamiast stałego modyfikatora na
cały bieg, `heart` działa progowo, w momencie śmierci:

- **`tryHeartRevive()`** — wywoływane dokładnie w miejscu, gdzie gra
  normalnie by się skończyła: w `loop()` dla Trybu wolnego/Rywalizacji
  (branch, który wcześniej zawsze wołał `finishRun(p,'normal')`) oraz w
  `registerCoopHit()` dla Kooperacji, gdy `coopLives` spadną do 0 (zamiast
  zawsze kończyć przez `finishRun(p,'coop-out')`).
- **Flat koszt 1 serca, maksymalnie jedno wskrzeszenie na bieg:**
  `heartRevivesUsed` działa teraz jako flaga 0/1 (nie licznik) — jeśli już
  równa się 1, `tryHeartRevive()` od razu zwraca `false`, niezależnie od
  tego, ile serc gracz jeszcze posiada. Zerowana w `resetRun()`, więc każdy
  nowy bieg znowu ma dostępne jedno wskrzeszenie. Serce odejmowane jest z
  **tego samego, ogólnego** `boosterInventory.heart` co widoczny w ekranie
  wyboru podwajacza — jeśli go brakuje, `tryHeartRevive()` zwraca `false` i
  bieg kończy się normalnie.
- Po udanym wskrzeszeniu: gracz wraca na pozycję startową z 1,5 s
  nietykalności (reużyty istniejący `respawnPlayer()` z coopa), w
  Kooperacji dodatkowo `coopLives` wraca na 1 (bieg nie kończy się mimo
  wyzerowanych wspólnych żyć), a `running` nigdy nie zostaje ustawione na
  `false` — pętla gry po prostu leci dalej, bez wchodzenia w `finishRun()`.
- **Wspólna pula dla obu graczy w Rywalizacji** — booster jest wybierany raz
  na cały bieg (nie per gracz), więc w Rywalizacji hearts wydają się z tej
  samej puli niezależnie od tego, który z dwóch graczy akurat zginął.
- **Znacznik w HUD** (`#boosterTag`, nowa funkcja `updateHudBoosterTag()`,
  ten sam wzorzec append-once/update-in-place co istniejący `#bossTag` z
  pkt 3/19.3) pokazuje ikonę aktywnego podwajacza, a dla serca dodatkowo
  aktualną liczbę posiadanych serc — odświeżane po każdym udanym
  wskrzeszeniu, więc widać malejący zapas na żywo.

**Nie zostało zrobione / świadomie poza zakresem:**
- **Zakup podwajaczy wprost w sklepie** i **zdobywanie z misji** — user
  wybrał na razie wyłącznie skrzynki; misje wspomniane jako "dodamy
  później", nie zaimplementowane w tej sesji.
- Legendarna skrzynka (płatna diamentami) nie ma podniesionych szans na
  skin/podwajacz względem zwykłej/epickiej — tylko więcej slotów
  (`extraCount`), bez osobnego strojenia prawdopodobieństw per rarity.
- `coins2x` jest wybieralny w Kooperacji/Rywalizacji, mimo że nie ma tam
  żadnego efektu (te tryby nie dają monet za dystans, patrz pkt 15) —
  świadomie nieprzefiltrowane z listy wyboru per tryb, żeby nie komplikować
  ekranu wyboru rozgałęzieniem "które opcje pokazać w zależności od trybu".
- Brak ograniczenia, ile podwajaczy gracz może posiadać naraz (magazyn rośnie
  bez limitu, jak przy skrzynkach z pkt 26.5).
- Balans procentowych szans w `rollCrateItem()` oraz efektów podwajaczy
  (×2/×0.5) nieprzetestowany w praktyce — jak każdy inny balans w tym
  projekcie.

**Weryfikacja w tej sesji:** `node` niedostępny — zweryfikowano `perl`:
`game.js` (`{}` 796/796, `()` 2697/2697, `[]` 202/202 — po poprawce
jednorazowego serca opisanej w pkt 31.4), `i18n.js` (`{}`
431/431 — bez zmian liczbowych, nowe teksty to tylko pary w istniejących
obiektach języków), `index.html` (`<div>` 53/53), `style.css` (`{}` 234/234).
Policzono wystąpienia 12 nowych kluczy i18n (`booster_title`,
`booster_subtitle`, `btn_start_no_booster`, `btn_activate`, oraz nazwa+opis
dla 4 podwajaczy) — po 10 (raz na język). Sprawdzono grepem spójność nowych
identyfikatorów (`launchMode`, `anyBoosterOwned`, `renderBoosterPicker`,
`tryHeartRevive`, `updateHudBoosterTag`, `pendingPlayMode`) — każdy
zdefiniowany raz, reszta wystąpień to spodziewane wywołania/komentarze, bez
duplikatów. Powtórzono audyt `getElementById` × realne `id` w HTML — te same
4 znane, celowo dynamiczne id co w poprzednich sesjach plus nowe `boosterTag`
(dokładnie ten sam, świadomy wzorzec co istniejące `bossTag`), zero
niezamierzonych rozjazdów. Otwarto `index.html` w domyślnej przeglądarce.

**Do potwierdzenia przez usera (duża zmiana, wymaga realnego grania —
podwajacze są losowe ze skrzynek, więc może trzeba otworzyć kilka, żeby
jakiś wypadł):** (1) otwieranie skrzynek czasem pokazuje w animacji zdobyty
skin (🎨) albo podwajacz zamiast samych diamentów; (2) zdobyty skin
faktycznie pojawia się w karuzeli sklepu jako posiadany; (3) po zdobyciu
choć jednego podwajacza, kliknięcie GRAJ dla Trybu wolnego/Kooperacji/
Rywalizacji pokazuje nowy ekran „Podwajacze” z listą i przyciskiem „Start
bez podwajacza”; (4) aktywowanie 🪙/🐢/🔍 faktycznie zmienia odpowiednio
zarobek monet, tempo przeszkód i ich rozmiar w tym konkretnym biegu, a HUD
pokazuje ikonę aktywnego podwajacza; (5) aktywowanie ❤️ i śmierć w trakcie
biegu wskrzesza gracza zamiast kończyć bieg (kosztem 1 serca), a przy
**drugiej** śmierci w tym samym biegu wskrzeszenie już się **nie**
powtarza (bieg kończy się normalnie, nawet jeśli user ma więcej serc w
zapasie) — działa to w Trybie wolnym, Kooperacji i Rywalizacji; (6) „Zagraj ponownie”
po zakończonym biegu **nie** ma już aktywnego podwajacza (trzeba wrócić do
menu i wybrać go ponownie, jeśli user tego chce).

---

## 32. Umiejętności aktywowane w locie: Tarcza / Niewidzialność / Fala uderzeniowa (2026-07-11, część 5)

**Kontekst:** user zapytał, co jeszcze mogłoby dropić ze skrzynek — po
zaproponowaniu kilku kierunków wybrał **Tarczę** jako pierwszą nową rzecz, z
konkretnym zastrzeżeniem, że ma działać **inaczej niż podwajacze**: nie
wybierana przed startem biegu, tylko **aktywowana w dowolnym momencie
rozgrywki klawiszem 1**, z licznikiem posiadanych sztuk widocznym gdzieś na
ekranie w trakcie gry, i z „super animacją”. Dodatkowo poprosił o drugą
umiejętność pod klawiszem **2** — chwilowe zniknięcie/niewidzialność kulki,
która pod koniec ma mrygać (nawiązanie do istniejącego efektu migania przy
nietykalności) — oraz trzecią, w pełni autorską, pod klawiszem **3**, też
mocno dopracowaną wizualnie. Do wszystkich trzech miały dojść dźwięki
aktywacji. Wszystkie trzy stają się kolejnymi możliwymi przedmiotami ze
skrzynek.

### 32.1. Nowy, osobny system — „Umiejętności” różnią się architektonicznie od Podwajaczy

Zamiast dopisywać je do istniejącego `BOOSTERS`/`boosterInventory` z pkt 31
(wybór **raz, przed startem**, z ekranu `#boosterScreen`), umiejętności
dostały **całkiem osobny system**, bo mają fundamentalnie inny model użycia:

- Nowy obiekt `ABILITIES` (3 wpisy: `shield`/`invis`/`pulse`, każdy z
  przypisanym klawiszem `key: '1'|'2'|'3'`) + osobny `abilityInventory`
  (`localStorage` klucz **`scraper_abilities_v1`**, ten sam wzorzec
  `try/catch`/sanity-check co `boosterInventory`).
- **Brak ekranu wyboru przed startem** — umiejętności są **zawsze dostępne**
  w każdym biegu, w każdym trybie (w tym w Poziomach i Wyzwaniu dnia, gdzie
  Podwajacze celowo nie działają, patrz pkt 31.3) — jeśli gracz coś posiada,
  może to aktywować klawiszem w dowolnym momencie, bez żadnego ekranu
  pośredniego. To bezpośrednia konsekwencja tego, że user chciał aktywację
  "w jakimś momencie rozgrywki", nie z góry.
- Aktywacja **nic nie kosztuje z góry** poza tym, że zużywa 1 sztukę z
  `abilityInventory` w momencie faktycznego naciśnięcia klawisza (nie przy
  starcie biegu) — więc nieaktywowana umiejętność zostaje w magazynie na
  następny bieg.

### 32.2. Tarcza (klawisz 1) — blokuje jedno trafienie

- **`activateShield()`** — jeśli `running` (i nie trwa animacja wjazdu
  `introActive`) i gracz ma ≥1 sztukę, odejmuje 1 z `abilityInventory.shield`
  i ustawia `p.shieldActive = true` na **wszystkich** graczach naraz (ten sam
  wzorzec współdzielonej puli co `heart` z pkt 31.4 — w Multiplayerze jedna
  aktywacja/jedna sztuka daje tarczę **obu** graczom, bo jest tylko jeden
  wspólny magazyn i jeden klawisz).
- **`tryShieldBlock(p)`** — wołane w `loop()` jako **pierwszy** warunek przy
  trafieniu, przed sprawdzeniem coop/heart/finishRun: jeśli gracz ma aktywną
  tarczę, `p.shieldActive = false`, dostaje 400 ms nietykalności (żeby nie
  oberwać od razu drugi raz w tej samej klatce), i **cała reszta łańcucha
  konsekwencji (utrata życia w coopie, wskrzeszenie sercem, koniec biegu) w
  ogóle się nie wykonuje** — tarcza anuluje kolizję całkowicie, zanim
  jakikolwiek inny system ją zobaczy.
- **Wizualnie:** dopóki aktywna, `drawShieldRing()` rysuje wokół kulki
  obracający się sześciokątny "energetyczny" pierścień (dwie warstwy: grubszy
  zewnętrzny kontur + cieńszy wewnętrzny, z delikatnym pulsowaniem promienia
  i poświatą `shadowBlur`) — rysowany w `draw()` w osobnym przebiegu, przed
  właściwą kulką, więc kulka zawsze zostaje czytelnie na wierzchu.
- **Animacja pęknięcia:** w momencie zablokowania trafienia,
  `triggerShieldBreak(p)` dodaje wpis do `shieldBreakFx`, renderowany przez
  `drawShieldBreakFx()` jako 10 rozlatujących się "odłamków" (krótkich
  kresek) w kolorze tarczy, gasnących w ~450 ms — efekt "rozbitego szkła",
  wyraźnie odróżniający się od zwykłego trafienia.
- **Animacja aktywacji:** `triggerActivationFx(p, SHIELD_COLOR)` (wspólna
  funkcja reużyta też przez Niewidzialność, patrz 32.3) dodaje krótki,
  rozszerzający się i gasnący pierścień w miejscu gracza w momencie
  włączenia — sygnalizuje moment aktywacji, osobno od samego stałego
  pierścienia tarczy.

### 32.3. Niewidzialność (klawisz 2) — chwilowa nietykalność z domryganiem

- **`activateInvis()`** — ustawia `p.invisibleUntil = now + 4000` (4 s) **i**
  jednocześnie podnosi `p.invulnerableUntil` do tego samego momentu — dzięki
  temu niewidzialność jest **realną** nietykalnością (kolizje sprawdzane są
  przez już istniejący warunek `if (now < p.invulnerableUntil) continue;` w
  `loop()`), a nie tylko efektem wizualnym — zero zmian w
  `obstacleHitsPlayer()`/logice kolizji.
- **Renderowanie w `draw()`:** przez większość czasu trwania kulka rysowana
  jest z bardzo niską, stałą przezroczystością (`alpha = 0.14`) — "prawie
  niewidoczna", zgodnie z prośbą. W **ostatnich 1200 ms** przełącza się na
  ten sam wzór migania sinusoidalnego, jakiego gra już używa przy nietykalności
  po odrodzeniu w coopie (`0.3 + 0.35*sin(now*0.03)`, lekko wolniejsze niż
  oryginalne `*0.02` z coopa, żeby migotanie było bardziej zauważalne w
  krótszym oknie) — to jest dosłownie nawiązanie, o które prosił user
  ("niech tak mryga"), reużywające istniejący język wizualny gry zamiast
  wymyślania nowego.
- Animacja aktywacji: taki sam rozszerzający się pierścień jak przy Tarczy
  (`triggerActivationFx`), tylko w innym kolorze (fioletowym, `INVIS_COLOR`),
  żeby obie umiejętności miały wyraźnie różny "sygnał aktywacji" mimo
  współdzielenia tej samej funkcji efektu.

### 32.4. Fala uderzeniowa (klawisz 3) — autorska trzecia umiejętność

User poprosił o coś własnego, mocno dopracowanego. Wybrano **natychmiastowe
oczyszczenie planszy** — efektowną, unikalną wobec Tarczy (obrona) i
Niewidzialności (unik) trzecią kategorię: **ofensywa/ratunek awaryjny**,
tematycznie pasująca do gry o unikaniu (tu: "zamiast unikać, na chwilę
zniszcz zagrożenia").

- **`activatePulse()`** — `obstacles.length = 0` (czyści **wszystkie**
  przeszkody na planszy, łącznie z laserem bossa `beam`, bo to też zwykły
  wpis w tej samej tablicy — miły efekt uboczny, nie wymagał osobnej
  obsługi), origin efektu liczony jako **średnia pozycja wszystkich
  graczy** (w Multiplayerze wygląda to jak jeden wspólny wybuch pomiędzy
  dwiema kulkami, nie dwa osobne), plus 300 ms nietykalności na wypadek,
  gdyby coś było o włos od trafienia w chwili aktywacji.
- **Wizualnie:** `drawPulseFx()` rysuje podwójny, rozszerzający się od
  środka pierścień (grubszy zewnętrzny + cieńszy wewnętrzny, oba gasnące
  wraz z ekspansją), którego promień w szczytowym momencie sięga
  `Math.hypot(W,H)` — czyli **całą przekątną planszy**, więc fala wizualnie
  faktycznie "zamiata" cały ekran, nie tylko jego fragment.
- **Dźwięk:** głęboki, schodzący w dół "impact" (sinus 140→35 Hz) + trzask
  szumu (reużyty `playHat()`) + opadająca kaskada trzech nut `sawtooth` —
  najbardziej "ciężko" brzmiący z nowych efektów, adekwatnie do rangi
  "oczyść cały ekran".

### 32.5. HUD z licznikami (klawisze 1/2/3)

Nowy pasek `#abilityHud` pod głównym HUD-em (`index.html`), **zawsze
pokazujący wszystkie 3 sloty** (nie tylko posiadane) — nieposiadane są
przyciemnione klasą `.empty` zamiast całkiem ukryte, żeby klawiszologia
1/2/3 była odkrywalna, zanim gracz w ogóle zdobędzie pierwszą umiejętność.
`updateAbilityHud()` woła się raz na start każdego biegu (`resetRun()`,
wspólny punkt dla wszystkich trybów) oraz po każdej aktywacji/zużyciu, więc
liczby są zawsze aktualne w czasie rzeczywistym. Toggle widoczności całego
paska podpięty do `showGameUI()`, dokładnie tak jak reszta HUD-u.

### 32.6. Skrzynki: czwarty typ przedmiotu

`rollCrateItem()` przebalansowany z 3 na 4 kategorie: ~5% nieposiadany skin,
**~15% umiejętność** (nowość), ~15% podwajacz (obniżone z 22%, żeby zrobić
miejsce), reszta (~65%) diamenty. `buyAndOpenCrate()`/`showCrateOpenOverlay()`
dostały czwartą gałąź (`it.type === 'ability'`) analogiczną do pozostałych
trzech.

### 32.7. Dźwięki

Cztery nowe funkcje w sekcji AUDIO: `playShieldOn()` (jasny, trzynutowy
wznoszący się "sparkle"), `playShieldBreak()` (szum jak tłuczone szkło +
opadające "brzdęki" — celowo różny od `playHit()`, żeby zablokowane
trafienie nie brzmiało jak zwykła, śmiertelna kolizja), `playInvisOn()`
(eteryczny, opadający filtrowany "whoosh"), `playPulseActivate()` (głęboki
sub-basowy "bum" + trzask szumu + opadająca kaskada). Wszystkie reużywają
istniejące niskopoziomowe helpery (`playNote`/`playHat`) z tego samego
silnika co reszta efektów w grze.

**Nie zostało zrobione / świadomie poza zakresem:**
- Ekran wyboru/aktywacji w menu — user chciał aktywację wyłącznie klawiszem
  w trakcie gry, więc świadomie **nie ma** żadnego ekranu podglądu
  umiejętności poza samym paskiem HUD w trakcie rozgrywki.
- Zakup umiejętności wprost w sklepie / zdobywanie z misji — jak przy
  Podwajaczach (pkt 31), na razie wyłącznie skrzynki.
- Ograniczenie liczby posiadanych sztuk — magazyn rośnie bez limitu, jak
  reszta systemów przedmiotowych w tym projekcie.
- Balans (czas trwania niewidzialności 4 s, okno domrygania 1,2 s, 15%
  szansy w skrzyni, koszt many aktywacji = brak, bo to darmowe zużycie
  posiadanej sztuki) dobrany "na oko", nieprzetestowany w praktyce.
- Legenda przeszkód (`#legend`) nie wspomina o umiejętnościach — to inny typ
  informacji (gracz kontra otoczenie, nie przeszkoda), świadomie osobny
  pasek HUD zamiast dopisywania do legendy.

**Weryfikacja w tej sesji:** `node` niedostępny — zweryfikowano `perl`:
`game.js` (`{}` 848/848, `()` 2924/2924, `[]` 218/218), `i18n.js` (`{}`
431/431 — bez zmian liczbowych), `index.html` (`<div>` 54/54), `style.css`
(`{}` 238/238). Policzono wystąpienia 6 nowych kluczy i18n
(`ability_shield_name/desc`, `ability_invis_name/desc`,
`ability_pulse_name/desc`) — po 10 (raz na język). Sprawdzono grepem
spójność nowych identyfikatorów (`activateShield`/`activateInvis`/
`activatePulse`/`tryShieldBlock`/`drawShieldRing`/`drawShieldBreakFx`/
`drawActivationFx`/`drawPulseFx`/`updateAbilityHud`) — każdy zdefiniowany
raz, reszta wystąpień to spodziewane wywołania, bez duplikatów. Powtórzono
audyt `getElementById` × realne `id` w HTML — te same znane, celowo
dynamiczne id co w poprzednich sesjach (`boosterTag`/`bossTag`/
`distanceDisplay`/`livesDisplay`/`pwaAppleIcon`), zero nowych rozjazdów.
Otwarto `index.html` w domyślnej przeglądarce.

**Do potwierdzenia przez usera (duża zmiana, wymaga realnego grania —
umiejętności są losowe ze skrzynek, może trzeba otworzyć kilka):** (1) po
zdobyciu którejś z 3 umiejętności, pasek pod HUD-em pokazuje "1: 🛡️ ×N",
"2: 👻 ×N", "3: 💥 ×N" z poprawnymi liczbami; (2) naciśnięcie 1 w trakcie
dowolnego biegu (Poziomy/Tryb wolny/Multiplayer/Wyzwanie) pokazuje
obracającą się tarczę wokół kulki, a zderzenie z przeszkodą łamie ją z
efektem "odłamków" zamiast kończyć bieg; (3) naciśnięcie 2 sprawia, że
kulka staje się prawie niewidoczna na ~3 sekundy, potem zaczyna mrygać
przez ostatnią sekundę, i przez cały ten czas nic jej nie może trafić; (4)
naciśnięcie 3 natychmiast czyści planszę z przeszkód z efektowną,
rozszerzającą się falą na cały ekran; (5) wszystkie trzy mają wyraźnie
różne, pasujące dźwięki aktywacji, a złamanie tarczy brzmi inaczej niż
zwykłe zderzenie; (6) w Multiplayerze (coop/versus) jedna aktywacja
faktycznie obejmuje obu graczy naraz z jednej sztuki w magazynie; (7)
skrzynki od czasu do czasu wypuszczają umiejętność zamiast
diamentów/skina/podwajacza.

---

## 33. 30 nowych skinów wyłącznie ze skrzynek (2026-07-11, część 6)

**Kontekst:** user poprosił o dodanie 30 skinów dropiących ze skrzynek, z
wyraźnym zastrzeżeniem, że każdy ma być **bardzo ładnie wykonany**.

### 33.1. Strategia: 8 nowych parametrycznych renderów zamiast 30 osobnych funkcji

Napisanie 30 w pełni unikalnych funkcji rysujących (jak `drawSoccerBall`/
`drawFireBall` z pkt 17.3) byłoby ogromnym, trudnym do zweryfikowania bez
realnego odsłuchu/obejrzenia ryzykiem. Zamiast tego zastosowano **dokładnie
ten sam trik co przy 8 kolorach monetowych z `drawSolidBall`** (pkt 16.3) —
"jedna funkcja, wiele palet" — tylko rozszerzony na **8 bogatszych, w pełni
animowanych wyglądów** zamiast płaskiego koloru:

| Typ | Wygląd | Parametry |
|---|---|---|
| `gem` | Fasetowany kryształ — gradient + 6 linii fasetowania + pierścień rdzenia | 1 kolor |
| `nebula` | Ciemna baza + miękkie, dryfujące "obłoki gazu" + migoczące gwiazdki | 2 kolory |
| `stripe` | Wiatraczek 8 na przemian ułożonych klinów (jak piłka plażowa) | 2 kolory |
| `dot` | Baza + stały wzór cętek (biedronka/lampart/panda, zależnie od palety) | 2 kolory |
| `wave` | Animowane, faliste poziome pasy (styl lampy lawowej) | 2 kolory |
| `holo` | Baza w odcieniu + ukośny, przesuwający się pas tęczowego połysku (hue zależny od czasu) | 1 kolor |
| `metal` | Uogólniony `drawChromeBall` (ten sam trik przesuwającego się rozbłysku), przyciemniany/rozjaśniany dowolnym kolorem przez `shadeColor()` zamiast sztywnych szarości | 1 kolor |
| `spark` | Ciemny rdzeń + 3 pulsujące, świecące "błyskawice" promieniście od środka (uogólniony `drawNeonBall`) | 1 kolor |

Każdy z 8 renderów ma **własną animację wbudowaną wewnętrznie** (jak
istniejące `chrome`/`prism`/`neon`/`disco` z pkt 19), więc `addSkinEffect()`
(pkt 19.1) **nie wymagał żadnych nowych gałęzi** — pozostaje no-opem dla
tych typów, dokładnie tak jak już było dla chrome/prism/neon/disco.
`addBallFinish()` (wspólny połysk + przyciemnienie krawędzi) nakłada się na
wszystkie automatycznie, bez zmian.

### 33.2. 30 skinów zbudowanych na tych 8 renderach

Nowe pole `color2` (drugi kolor) dodane do obiektów skinów tam, gdzie
renderer go wymaga (`nebula`/`stripe`/`dot`/`wave`) — dotychczasowe skiny
(`gem`/`holo`/`metal`/`spark` i cała reszta) używają tylko `color`, jak
dotychczas.

| Kategoria (renderer) | Skiny (4-4-4-4-4-3-4-3 = 30) |
|---|---|
| `gem` (4) | Rubin, Szafir, Jadeit, Ametyst |
| `nebula` (4) | Mgławica Żaru, Mgławica Lazuru, Mgławica Jadu, Mgławica Złota |
| `stripe` (4) | Cukierek, Alarm, Zamieć, Guma Balonowa |
| `dot` (4) | Biedronka, Panda, Lampart, Orchidea |
| `wave` (4) | Przypływ, Lawa, Toksyna, Arktyka |
| `holo` (3) | Fatamorgana, Zaćmienie, Opal |
| `metal` (4) | Dotyk Midasa, Brąz, Stal, Różowe Złoto |
| `spark` (3) | Napięcie, Plazma, Grom |

Kolory dobrane tak, żeby nawet skiny współdzielące ten sam renderer wyraźnie
się od siebie różniły (np. 4 `gem`-y to wyraźnie inny odcień: czerwień,
błękit, zieleń, fiolet) — 30 wizualnie odrębnych efektów z tylko 8 funkcji
rysujących.

### 33.3. Nowy `kind: 'crate'` — wyłącznie losowe, nigdy kupowane ani misyjne

Wszystkie 30 dostało `kind: 'crate'` (obok istniejących `'coin'`/`'boss'`/
`'mission'` z pkt 16/17/23) — nowa kategoria w tablicy `SKINS`, bez żadnej
osobnej logiki odblokowania w kodzie (mechanizm nadawania skina ze skrzynki
z pkt 26/31/32 już operuje ogólnie po `skinId`, nieświadomie `kind`).
Potrzebne były tylko dwie zmiany w istniejącym kodzie:

- **`rollCrateItem()`** — filtr kandydatów na losowy skin rozszerzony z
  `kind === 'coin'` na `kind === 'coin' || kind === 'crate'`. **Szansa na
  skin podniesiona z ~5% do ~10%** na slot — przy puli, która urosła z 8 do
  38 możliwych trafień (w tym 30 osiągalnych *wyłącznie* tą drogą), 5%
  byłoby zbyt rzadkie, żeby skrzynki faktycznie czuły się jak źródło tych
  30 skinów.
- **`renderShop()`** — dodana gałąź `skin.kind === 'crate'` (analogiczna do
  `'boss'`/`'mission'`): nieposiadany skin tego typu pokazuje wyszarzony,
  zablokowany przycisk z tekstem „Zdobądź ze skrzynki” zamiast ceny —
  karuzela sklepu pokazuje więc wszystkie 48 skinów (18 dotychczasowych + 30
  nowych), ale nowe są kupowalne wyłącznie przez szczęście, nigdy za monety.

**Uboczny efekt, wart odnotowania:** osiągnięcie „Kompletny zestaw”
(`skins_all`, pkt 21.2) sprawdza `ownedSkins.size >= SKINS.length` —
`SKINS.length` skoczyło z 18 do **48**, więc to osiągnięcie stało się
znacznie trudniejsze (wymaga też złapania wszystkich 30 losowych skinów ze
skrzynek, nie tylko dokupienia/domisjonowania reszty). To nie zostało
skorygowane — potraktowane jako naturalna, akceptowalna konsekwencja
(najtrudniejsze osiągnięcie "zbierz wszystko" faktycznie wymaga zebrania
wszystkiego), ale user może zechcieć to złagodzić w przyszłości, jeśli
okaże się fair. Misja „Kolekcja sklepu" (`m_shop_all`, nagroda: skin
Otchłań) **pozostała nietknięta** — filtruje tylko `kind === 'coin' ||
kind === 'boss'` (13 skinów), więc nadal osiągalna bez polegania na
losowych dropach.

**Nie zostało zrobione / świadomie poza zakresem:**
- Balans (10% szansy na skin per slot, rozkład 30 skinów po równo na 8
  typów) dobrany "na oko" — nieprzetestowany w praktyce.
- Legendarna skrzynka nie ma podniesionych szans na *nowe* skiny względem
  zwykłej/epickiej — tak jak przy poprzednich rundach balansu (pkt 31.1),
  tylko więcej slotów (`extraCount`) daje lepsze realne szanse.
- Osiągnięcie „Kompletny zestaw” nie zostało przebalansowane pod nowe 48
  skinów (patrz wyżej) — świadomie zostawione, do ewentualnej korekty.

**Weryfikacja w tej sesji:** `node` niedostępny — zweryfikowano `perl`:
`game.js` (`{}` 898/898, `()` 3188/3188, `[]` 227/227), `i18n.js` (`{}`
431/431 — bez zmian liczbowych, bo 31 nowych kluczy to tylko nowe pary w
istniejących obiektach języków, żadna z 310 nowych wartości tekstowych nie
zawiera dosłownych `{`/`}`). Policzono wystąpienia wszystkich 30 kluczy nazw
skinów + `skin_locked_crate` — każdy dokładnie 10 (raz na język), zero
brakujących. Policzono `kind: 'crate'` w `game.js` — dokładnie 30
wystąpień, zgodnie z wymaganą liczbą. Sprawdzono grepem, że każda z 8 nowych
funkcji rysujących (`drawGemBall`/`drawNebulaBall`/`drawStripeBall`/
`drawDotBall`/`drawWaveBall`/`drawHoloBall`/`drawMetalBall`/`drawSparkBall`)
jest zdefiniowana raz i wywołana dokładnie raz w `drawBallShape()`. Otwarto
`index.html` w domyślnej przeglądarce.

**Do potwierdzenia przez usera (wizualne — nie da się w pełni zweryfikować
bez realnego obejrzenia w przeglądarce):** (1) w Sklepie (karuzela, strzałki)
da się przewinąć przez wszystkich 48 skinów, w tym 30 nowych na końcu listy,
każdy z zablokowanym przyciskiem „Zdobądź ze skrzynki”, dopóki nie zostanie
zdobyty; (2) 8 stylów wygląda wyraźnie różnie od siebie (kryształ vs
mgławica vs paski vs kropki vs fala vs holo vs metal vs iskry), a skiny
dzielące ten sam renderer (np. 4 kryształy) nadal wyglądają odrębnie dzięki
kolorom; (3) animacje (przesuwający się połysk metalu, migoczące gwiazdki
mgławicy, falująca lawa, pulsujące iskry, przesuwający się tęczowy pas holo)
faktycznie się poruszają w czasie rzeczywistym, nie tylko w podglądzie
sklepu, ale i w realnej rozgrywce; (4) po zdobyciu skina ze skrzynki
faktycznie da się go założyć w Sklepie i widać go na kulce w grze; (5) nowe
skiny wypadają ze skrzynek zauważalnie częściej niż przed zmianą (subiektywne
odczucie, trudne do policzenia bez wielu otwarć, ale warto sprawdzić "na
oko").

---

## 34. Sklep podzielony na 4 zakładki (Monety/Skrzynki/Misje/Bossy) (2026-07-11, część 7)

**Kontekst:** po dodaniu 30 nowych skinów (pkt 33) karuzela Sklepu urosła do
48 pozycji przewijanych po jednej strzałkami — user poprosił o podzielenie
jej na 4 zakładki u góry ekranu (Monety/Skrzynki/Misje/Bossy), które
"otwierają się dopiero wtedy" (czyli zawartość karuzeli pojawia się dopiero
po wybraniu zakładki).

### 34.1. Zakładki filtrują po `skin.kind` — bez nowej logiki odblokowania

Cztery zakładki odpowiadają dokładnie czterem istniejącym wartościom
`kind` w tablicy `SKINS` (pkt 16/17/23/33): Monety→`coin` (8 skinów),
Skrzynki→`crate` (30), Misje→`mission` (5), Bossy→`boss` (5) — czysto
**wizualne** rozbicie tej samej listy na kategorie, żadna logika
kupna/odblokowania/losowania nie została ruszona.

- **Nowa stała `SHOP_TABS`** (4 wpisy: `kind`, id przycisku, klucz i18n
  etykiety) + funkcja **`shopSkinsForTab()`**, która filtruje `SKINS` po
  aktualnie wybranej zakładce (`shopTab`). `shopIndex` (pozycja w karuzeli)
  teraz porusza się **w obrębie przefiltrowanej listy**, nie całej tablicy
  `SKINS` — strzałki ◀▶ i ich stan `disabled` na końcach przeliczone na
  `list.length` zamiast `SKINS.length`.
- **Stan początkowy: `shopTab = null`** — dokładnie zgodnie z prośbą "otwierają
  się dopiero wtedy": wejście do Sklepu (`btnShop`) zawsze resetuje do stanu
  "brak wybranej zakładki", w którym widoczne są tylko 4 przyciski zakładek +
  podpowiedź „Wybierz kategorię powyżej” (`#shopTabHint`) — cały blok
  podglądu/nazwy/stanu/przycisku kupna (`#shopBrowseArea`, nowy wspólny
  kontener) jest ukryty (`display:none` przez klasę `.hidden`) dopóki
  `shopTab` nie zostanie ustawiony kliknięciem zakładki.
- **`selectShopTab(kind)`** — ustawia `shopTab`, zeruje `shopIndex` do 0
  (zawsze zaczyna od pierwszej pozycji nowej kategorii) i wywołuje
  `renderShop()`. `renderShop()` dodatkowo przełącza klasę `.active` na
  przyciskach zakładek (podświetlenie aktualnie wybranej) oraz przełącza
  widoczność `#shopBrowseArea`/`#shopTabHint` zależnie od tego, czy
  `list[shopIndex]` istnieje.
- **Zakładki zostają widoczne cały czas** (nie znikają po wybraniu) — można
  dowolnie przełączać się między kategoriami bez wracania do menu głównego,
  to nie zostało wprost napisane przez usera, ale uznano za oczywiste
  minimum użyteczności (inaczej powrót do listy Monet po obejrzeniu Bossów
  wymagałby wyjścia i ponownego wejścia do Sklepu).

### 34.2. UI

- **`.shop-tabs`** — rząd 4 przycisków nad podglądem kulki, wspólny styl
  `.shop-tab-btn` (ciemne tło, cienka ramka) z modyfikatorem `.active`
  (turkusowe obramowanie + lekko podświetlone tło), spójny z resztą
  "konsoli pokładowej" z pkt 14.
- **`drawShopPreview()`** (pętla `requestAnimationFrame` podglądu kulki w
  Sklepie, pkt 17.2) zaktualizowana, żeby czytać skina z
  `shopSkinsForTab()[shopIndex]` zamiast `SKINS[shopIndex]`, z obsługą
  braku skina (gdy `shopTab === null`, pętla po prostu nic nie rysuje w tej
  klatce zamiast rzucić wyjątkiem przy `undefined.glow`).

**Poprawka jeszcze w tej samej sesji:** user doprecyzował, że nie chodziło o
pusty ekran startowy — Sklep ma **od razu** otwierać się na zakładce Monety
(pierwsza, najbardziej podstawowa kategoria), a nie zmuszać do klikania
zakładki za każdym razem. `btnShop`'s handler zmieniony z `shopTab = null`
na `shopTab = 'coin'` — jedna linia, cała reszta mechanizmu (filtrowanie,
podświetlenie aktywnej zakładki, przełączanie między zakładkami) bez zmian,
bo `renderShop()` i tak już poprawnie obsługiwał dowolny startowy `shopTab`.
Stan `shopTab === null` (i towarzyszący mu `#shopTabHint`/ukrywanie
`#shopBrowseArea`) **wciąż istnieje w kodzie** jako defensywny fallback,
tylko już nieosiągalny z normalnej ścieżki wejścia do Sklepu.

**Nie zostało zrobione / świadomie poza zakresem:**
- Zapamiętywanie ostatnio wybranej zakładki między wejściami do Sklepu —
  zawsze resetuje do zakładki Monety przy każdym wejściu (patrz poprawka
  wyżej), nie do tego, gdzie user był poprzednio.
- Dawne zachowanie „wejście do Sklepu od razu skacze na założony skin”
  (sprzed tej zmiany) zostało **usunięte** — teraz zawsze trzeba najpierw
  wybrać zakładkę. Świadoma konsekwencja nowego modelu nawigacji, nie
  przeoczenie.
- Liczba pozycji w danej zakładce nigdzie nie jest wyświetlana (np. "Misje
  (5/5)") — tylko strzałki + pozycja w podglądzie.

**Weryfikacja w tej sesji:** `node` niedostępny — zweryfikowano `perl`:
`game.js` (`{}` 907/907, `()` 3219/3219, `[]` 229/229), `i18n.js` (`{}`
431/431), `index.html` (`<div>` 56/56 — +2 względem poprzedniej sesji,
dokładnie tyle, ile dodano: `#shopTabs` i `#shopBrowseArea`), `style.css`
(`{}` 246/246). Policzono wystąpienia 5 nowych kluczy i18n
(`shop_tab_coin/crate/mission/boss/hint`) — po 10 (raz na język). Powtórzony
audyt `getElementById` × realne `id` w HTML — te same znane, celowo
dynamiczne id co w poprzednich sesjach, zero nowych rozjazdów. Otwarto
`index.html` w domyślnej przeglądarce.

**Do potwierdzenia przez usera** (zaktualizowane po poprawce „domyślnie
Monety” opisanej wyżej — punkt (1) już nieaktualny w pierwotnym brzmieniu):
(1) wejście do Sklepu pokazuje **od razu** zakładkę Monety z gotowym
podglądem pierwszego skina (Turkus), bez potrzeby klikania czegokolwiek;
(2) każda z 4 zakładek pokazuje wyłącznie skiny swojej kategorii (Monety=8,
Skrzynki=30, Misje=5, Bossy=5) i da się między nimi przełączać w dowolnej
kolejności bez wychodzenia z ekranu; (3) strzałki ◀▶ poprawnie blokują się
na pierwszej/ostatniej pozycji **danej zakładki**, nie całej listy 48
skinów; (4) zakup/założenie/blokady (Kup za X / Załóż / Pokonaj BOSS-a /
Zdobądź ze skrzynki / Ukończ misję) nadal działają identycznie jak
wcześniej wewnątrz każdej zakładki.

---

## 35. Podsumowanie sesji 2026-07-11 — mapa dla kolejnej sesji

**Ta sesja była wyjątkowo długa (punkty 28–34)** — zamiast czytać wszystko po
kolei następnym razem, ten punkt jest szybkim indeksem: co zrobiono, co
najpilniej przetestować, i jaki jest stan balansu/i18n na wyjściu.

### 35.1. Co zrobiono w tej sesji (skrót, szczegóły w 28–34)

1. **Pkt 28** — poszerzenie planszy 420→480px.
2. **Pkt 29** — „Poziomy” jako przycisk menu (nie karuzela), rozszerzenie do
   **100 poziomów** (10 bossów: 10/20/.../100), **progresywne
   odblokowywanie 10 typów przeszkód** co 10 poziomów (1/11/21/.../91),
   brak monet za powtórne ukończenie poziomu.
3. **Pkt 29 (poprawka)** — powiększenie Miny i Roju (były za proste).
4. **Pkt 30** — muzyka menu/rozgrywki/bossa wydłużona z kilku sekund do
   kilku minut pętli (8 akordów + deterministyczna długa sekwencja), nowe
   dźwięki UI: `playClick()` (każdy przycisk), `playPurchase()` (zakup
   skina).
5. **Pkt 31** — skrzynki dostały szansę na skiny monetowe, **system
   Podwajaczy** (🪙2×monety / 🐢2×wolniej / 🔍2×mniejsze przeszkody /
   ❤️dodatkowe serce) wybieranych **przed** startem Trybu wolnego/Co-op/
   Versus z nowego ekranu `#boosterScreen`. Serce: **jedno** wskrzeszenie na
   bieg (poprawka w tej samej sesji — pierwotnie miało rosnący koszt).
6. **Pkt 32** — **system Umiejętności** (Tarcza/Niewidzialność/Fala
   uderzeniowa) aktywowanych klawiszami **1/2/3 w trakcie** dowolnej
   rozgrywki (w tym Poziomów i Wyzwania — inaczej niż Podwajacze), z
   licznikami w HUD, animacjami i dźwiękami.
7. **Pkt 33** — **30 nowych skinów** wyłącznie ze skrzynek (`kind: 'crate'`),
   zbudowanych na 8 nowych, w pełni animowanych rendererach (gem/nebula/
   stripe/dot/wave/holo/metal/spark). Szansa na skin ze skrzynki podniesiona
   z ~5% do ~10%.
8. **Pkt 34** — Sklep podzielony na **4 zakładki** (Monety/Skrzynki/Misje/
   Bossy) filtrujące `SKINS` po `kind`, domyślnie otwiera się na zakładce
   Monety (poprawka w tej samej sesji — pierwotnie wymagał kliknięcia
   zakładki).

### 35.2. Najpilniejsze do przetestowania na start kolejnej sesji

Skondensowana lista z "Do potwierdzenia" 28–34, w kolejności "od najbardziej
prawdopodobnego problemu":

1. **Ekonomia skrzynek na żywo** — otworzyć kilka zwykłych skrzynek (500 🪙
   każda) i sprawdzić, czy realnie wypadają wszystkie 4 typy przedmiotów
   (diamenty/skin/podwajacz/umiejętność), a nie tylko diamenty — to
   najbardziej złożona zmiana danych w tej sesji (pkt 26.3→31.1→32.6→33.3,
   cztery kolejne przebudowy tej samej funkcji `rollCrateItem()`).
2. **Podwajacze i Umiejętności w realnym biegu** — zwłaszcza serce (jedno
   wskrzeszenie, nie więcej) i tarcza (blokuje trafienie, łamie się z
   animacją) — to nowa logika kolizji (`tryHeartRevive`/`tryShieldBlock`
   wpięte w `loop()`), najbardziej ryzykowne miejsce pod kątem "gra się nie
   wywala, ale i nic nie chroni".
3. **Progresja przeszkód na Poziomach** — zagrać kilka poziomów w okolicach
   11/21/31/41/51/61/71/81/91, sprawdzić, czy nowe typy faktycznie dochodzą
   stopniowo, a poziom 1 ma tylko `block`.
4. **Sklep — 4 zakładki** — przejść przez wszystkie 4, sprawdzić strzałki na
   granicach, zakup/założenie w każdej.
5. **Dźwięk** (nie do zweryfikowania przez Claude'a w ogóle w tym
   środowisku) — dłuższa muzyka, klik przycisków, dźwięki umiejętności —
   to jedyna kategoria zmian, której poprawność nie została nawet pośrednio
   zweryfikowana kodem, tylko czytaniem.

### 35.3. Stan balansu i i18n na wyjściu z sesji

- **Balans wszystkiego dobrany "na oko"** w tej sesji (progi odblokowań,
  szanse w skrzynkach, czas trwania niewidzialności, koszty podwajaczy) —
  żadna z tych liczb nie była testowana w realnej, dłuższej rozgrywce.
  Jeśli user zgłosi "za łatwe/za trudne/za rzadkie", pierwsze miejsce do
  spojrzenia to stałe na górze odpowiedniej sekcji (`OBSTACLE_WEIGHTS`,
  `rollCrateItem()`, `INVIS_DURATION_MS`, `MINE_ARM_TIME` itd.), nie
  przepisywanie mechanizmu.
- **i18n: pełne pokrycie 10 języków utrzymane** przez całą sesję (każdy
  nowy klucz dodany do wszystkich 10 bloków językowych w `I18N`,
  zweryfikowane grepem po każdej rundzie) — zh/ko/ja nadal "z pamięci
  modelu", bez weryfikacji przez native speakera (to samo zastrzeżenie co
  od pkt 6).
- **Osiągnięcie „Kompletny zestaw” (`skins_all`) wymaga teraz 48 skinów**
  zamiast 18 (patrz pkt 33.3) — nieprzebalansowane, zostawione jako
  świadoma konsekwencja.
- **Tabela kluczy `localStorage` w pkt 7 została w tej sesji odświeżona**
  do pełnych 18 kluczy (było 4, nieaktualne od dawna) — teraz jest jedynym
  miejscem, do którego warto zaglądać po pełną listę, bez zbierania
  informacji z poszczególnych punktów 15/16/21/23/25/26/29/31/32.

---

## 36. Skrzynki umiejętności na planszy + poprawka skinu Neon + 5 nowych skinów bossów (2026-07-12)

**Kontekst:** user poprosił o trzy rzeczy naraz: (1) zbieralne skrzynki na
planszy z ikonami Tarczy/Niewidzialności/Fali (rzeczy dotychczas dostępne
tylko pod klawiszami 1/2/3), które po wjechaniu w nie **automatycznie**
aktywują efekt, zamiast trafiać do magazynu i czekać na klawisz; (2) poprawkę
skinu Neon, który — jak doprecyzował user — był za ciemny i wtapiał się w
tło, a narysowane na nim „kreski” wyglądały słabo; (3) skiny bossów dla
pozostałych poziomów bossów (61.–100. co 10, dotąd tylko 10/20/30/40/50 miały
skiny mimo że bossów jest już 10, patrz pkt 29).

### 36.1. Zbieralne skrzynki umiejętności — osobny system od Umiejętności z pkt 32

**Architektonicznie odrębne od `abilityInventory`/klawiszy 1/2/3** (user
wyraźnie odróżnił to w rozmowie: mapowe skrzynki mają działać automatycznie,
"a nie pod klawiszami") — nowa tablica `pickups`, spawnowana i poruszana w
`loop()` obok (ale niezależnie od) `obstacles`:

- **`spawnAbilityPickup()`** — losuje jeden z 3 typów (`ABILITY_IDS`, ten sam
  zestaw co Tarcza/Niewidzialność/Fala) i spawnuje go u góry planszy, spadający
  w dół ze stałą, wolną prędkością. Odstęp między spawnami losowy 9–15 s
  (`PICKUP_MIN_INTERVAL`/`PICKUP_MAX_INTERVAL`, własny `pickupTimer` w
  `loop()`, zresetowany w `resetRun()`) — rzadziej niż przeszkody, żeby nie
  zdominować rozgrywki, ale częściej niż losowe umiejętności ze skrzynek
  sklepowych (pkt 32.6), skoro to ma być główna, powtarzalna droga zdobywania
  tych efektów w trakcie gry.
- **`collectAbilityPickup(id)`** — wywoływane przy zderzeniu gracza ze
  skrzynką (osobna pętla kolizji w `loop()`, po głównej pętli przeszkód).
  Aplikuje **dokładnie tę samą logikę efektu** co `activateShield`/
  `activateInvis`/`activatePulse` z pkt 32 (tarcza/niewidzialność na
  wszystkich graczy naraz, fala czyści przeszkody) — ale **nie rusza
  `abilityInventory`** ani nie wymaga naciśnięcia klawisza: efekt uruchamia
  się natychmiast po dotknięciu, za darmo.
- **Wspólna pula w Multiplayerze** — zgodnie z odpowiedzią usera w rozmowie
  ("skoro klawisze obejmują wspólną pulę, skrzynki też mogą"): jedna skrzynka
  aktywuje efekt dla **wszystkich** graczy naraz (ten sam wzorzec co klawisze
  1/2/3), nie tylko dla gracza, który w nią wjechał.
- **Działa we wszystkich trybach** (Poziomy, Tryb wolny, Kooperacja,
  Rywalizacja, Wyzwanie dnia) — tak jak same Umiejętności z pkt 32, bez
  ograniczeń trybowych, jakie mają Podwajacze (pkt 31).
- **Wizualnie** (`drawAbilityPickup()`): mała, zaokrąglona "skrzynka" z tym
  samym emoji co dany slot w `#abilityHud` (🛡️/👻/💥), w kolorze efektu
  (`SHIELD_COLOR`/`INVIS_COLOR`/`PULSE_COLOR`), z poświatą i delikatnym
  bujaniem/kołysaniem w trakcie spadania — czytelnie odróżnia się od
  przeszkód (inny kształt, inne, "przyjazne" kolory zamiast czerwieni/
  pomarańczu typowych dla zagrożeń).
- **Brak nowego HUD-u/dźwięku** — reużywa istniejące dźwięki aktywacji
  (`playShieldOn`/`playInvisOn`/`playPulseActivate`) i istniejący pasek
  `#abilityHud` (który i tak nie ma tu nic do pokazania, bo pickup nie
  trafia do magazynu) — świadomie minimalny zakres, żeby nie duplikować UI.

**Nie zostało zrobione / świadomie poza zakresem:**
- Brak wizualnej zapowiedzi/dźwięku samego spawnu skrzynki (pojawia się po
  prostu u góry ekranu, tak jak przeszkody) — brak potrzeby ostrzegania,
  skoro to korzyść, nie zagrożenie.
- Balans częstotliwości (9–15 s) i prędkości spadania dobrany "na oko",
  nieprzetestowany w dłuższej rozgrywce — jak każdy inny balans w projekcie.
- Skrzynka nie znika/nie "odbija się" w żaden specjalny sposób przy
  nieudanym zebraniu (np. tarcza już aktywna) — po prostu znika po dotknięciu
  bez dodatkowego efektu, nawet jeśli akurat nic nie zmieniła.

### 36.2. Poprawka skinu Neon

User zgłosił dwa problemy z `drawNeonBall()`: tło było prawie czarne i kulka
wtapiała się w ciemne tło gry, a narysowany kształt to była luźna, rozłączona
linia łamana ("kreski"), a nie coś, co wygląda jak spójna grafika.

- **Tło rozjaśnione** z `#0c2530`→`#020a0d` na `#1c5866`→`#0a2530` — wyraźnie
  jaśniejszy turkusowy gradient zamiast prawie czerni.
- **Kreski zastąpione zamkniętym kształtem błyskawicy** — 6-punktowy,
  domknięty polygon (klasyczny kształt ⚡, jak w `drawSparkBall()` z pkt 33,
  tylko jako jeden spójny kształt zamiast promieni), wypełniony gradientem
  biel→jasny turkus→turkus zamiast samego obrysu, plus dodatkowy pulsujący
  pierścień poświaty w tle (efekt "szklanej rurki neonowej").
- Kolory poświaty rozjaśnione (`#39f0ff` → `#7dfbff` na `shadowColor`),
  intensywność blur/pulsowania podniesiona, żeby kulka była czytelna na tle
  ciemnej planszy gry, nie tylko w podglądzie sklepu.

### 36.3. 5 nowych skinów bossów (poziomy 60/70/80/90/100)

Rozszerzenie z 100 poziomów (pkt 29, bossowie co 10 aż do poziomu 100)
zostawiło tylko 5 pierwszych bossów (10–50) ze skinami — brakowało nagród za
60/70/80/90/100.

- **Reużyto 5 z 8 parametrycznych rendererów** stworzonych dla 30 skinów ze
  skrzynek (pkt 33) zamiast pisać kolejne bespoke funkcje rysujące — ten sam
  kompromis efekt/nakład co w pkt 33: `titan` (metal, poziom 60), `supernova`
  (nebula, 70), `charge` (spark, 80), `zenith` (holo, 90), `eternity` (gem,
  100, jako najbardziej prestiżowy, złoto-biały wygląd na ostatniego bossa).
  Każdy z nowymi, unikalnymi kolorami, nieużywanymi przez żaden istniejący
  skin ze skrzynek.
- **`syncBossSkinUnlocks()` i logika sklepu zadziałały bez żadnych zmian** —
  obie już operują generycznie po `skin.kind === 'boss'` i `skin.bossLevel`,
  więc dopisanie 5 wpisów do `SKINS` wystarczyło.
- **i18n:** dodano `skin_titan`/`skin_supernova`/`skin_charge`/`skin_zenith`/
  `skin_eternity` do wszystkich 10 języków, w tej samej konwencji nazewnictwa
  co istniejące skiny bossów ("Kula X" / "X ball" / itd.).
- **Efekt uboczny:** `SKINS.length` rośnie z 48 do 53 — kolejne (po pkt 33.3)
  podniesienie progu osiągnięcia „Kompletny zestaw”, świadomie nieskorygowane
  z tego samego powodu co poprzednio.
- **Przy okazji naprawiono nieaktualny opis polskiego osiągnięcia**
  `ach_all_bosses_desc` — od rozszerzenia do 100 poziomów (pkt 29) wszystkie
  pozostałe 9 języków mówiły już o "10 bossach (10–100)", tylko polska wersja
  wciąż mówiła o starych "5 bossach (10–50)"; ujednolicono z resztą języków.

**Nie zostało zrobione / świadomie poza zakresem:**
- Balans (kolory/dobór rendererów dla 5 nowych skinów bossów) nieprzetestowany
  wizualnie w realnej rozgrywce.
- Próg osiągnięcia „Kompletny zestaw” (teraz 53 skiny) nieprzebalansowany,
  jak w pkt 33.3.

**Weryfikacja w tej sesji:** `node` nadal niedostępny w tym środowisku —
zweryfikowano `perl`: `game.js` (`{}` 929/929, `()` 3306/3306, `[]` 243/243),
`i18n.js` (`{}` 431/431 — bez zmian liczbowych, nowe klucze to tylko pary w
istniejących obiektach języków). Sprawdzono grepem, że
`spawnAbilityPickup`/`collectAbilityPickup`/`drawAbilityPickup` oraz stan
`pickups`/`pickupTimer`/`nextPickupIn`/`PICKUP_MIN_INTERVAL`/
`PICKUP_MAX_INTERVAL` są zdefiniowane dokładnie raz i użyte w spodziewanych
miejscach (spawn w `loop()`, reset w `resetRun()`, rysowanie w `draw()`), bez
duplikatów. Policzono wystąpienia 5 nowych kluczy i18n skinów bossów — po 10
(raz na język). Otwarto `index.html` w domyślnej przeglądarce (nadal brak w
tym środowisku narzędzia do automatyzacji przeglądarki, więc bez zrzutu
ekranu/interakcji zweryfikowanej przez Claude'a).

**Do potwierdzenia przez usera:** (1) skrzynki z ikonami 🛡️/👻/💥 pojawiają
się na planszy co kilka–kilkanaście sekund, we wszystkich trybach, i spadają
w dół jak łagodne, "przyjazne" obiekty; (2) dotknięcie jednej **natychmiast**
aktywuje efekt (bez potrzeby naciskania 1/2/3), a w Multiplayerze obejmuje
obu graczy naraz; (3) zebranie nie zmniejsza liczników w `#abilityHud` (bo to
osobna, darmowa pula, nie magazyn); (4) skin Neon w Sklepie wygląda teraz
wyraźnie jaśniej i ma spójny kształt błyskawicy zamiast rozjechanych kresek;
(5) w zakładce Bossy widać 10 skinów (5 nowych zablokowanych do pokonania
bossów 60–100), a po pokonaniu danego bossa odpowiedni skin się odblokowuje.

**Aktualizacja:** po poprawce z pkt 36.4 user przetestował grę i potwierdził
ogólnie "wszystko jest dobrze" — bez wskazania dalszych problemów. Powyższa
lista nie została jednak odhaczona punkt po punkcie (user nie potwierdził
wprost każdej z 5 rzeczy z osobna), więc traktować jako "działa w praktyce",
nie jako wyczerpującą, zweryfikowaną checklistę.

### 36.4. Poprawka jeszcze w tej samej sesji: zawieszanie się gry po skrzynce 💥

User zgłosił, że gra zawiesza się (obraz zamiera, klawisze przestają
reagować, tylko Esc→Wznów w singleplayerze/trybie wolnym przywracało grę do
życia) konkretnie po wjechaniu w skrzynkę Fali uderzeniowej — inne dwie
(Tarcza/Niewidzialność) działały poprawnie.

**Diagnoza była utrudniona przez środowisko:** strona jest otwierana przez
`file://`, a `game.js` jest ładowany jako zewnętrzny `<script src>` — w takiej
konfiguracji przeglądarka **czyści szczegóły błędu** widziane przez globalny
`window.addEventListener('error', ...)` do ogólnego „Script error.” bez
numeru linii ani stack trace'u (zabezpieczenie przed wyciekiem informacji
cross-origin), więc pierwsza próba złapania błędu w ten sposób nic nie dała.
Zadziałało dopiero owinięcie samej pętli gry (`loop()`) w lokalny
`try/catch` **wewnątrz tego samego pliku** — lokalny catch nie podlega temu
ograniczeniu i pokazał pełny komunikat przez `alert()` (user nie miał jak
otworzyć DevTools, więc to był jedyny sposób, żeby odczytać błąd bez
konsoli). Zrzut ekranu usera z tym oknem ujawnił dokładną przyczynę. Cały ten
tymczasowy mechanizm diagnostyczny (`window.addEventListener('error', ...)`,
potem owinięcie `loop`/`loopInner` w `try/catch` + `alert`) został **usunięty
po znalezieniu buga** — nie zostaje w kodzie.

**Rzeczywista przyczyna:** `IndexSizeError: Failed to execute 'arc' ... The
radius provided (-0.838227) is negative`, rzucany w `drawPulseFx()`. Powód:
`t = (now - fx.start) / PULSE_FX_MS`, gdzie `fx.start` to `performance.now()`
zapisane w środku klatki (w `activatePulse()`/`collectAbilityPickup()`), a
`now` w `draw()` to znacznik czasu **z początku** tej samej klatki animacji
(`requestAnimationFrame`) — realny zegar (`performance.now()`) idzie więc o
ułamek milisekundy **przed** znacznikiem klatki, przez co `t` bywa chwilowo
ujemne. `drawPulseFx()` liczyło promień jako `r = t * PULSE_MAX_RADIUS` bez
żadnego zabezpieczenia — ujemne `t` dawało ujemny promień, a `ctx.arc()` z
ujemnym promieniem rzuca wyjątek, który cicho zabijał całą pętlę
`requestAnimationFrame` (dokładnie ten sam mechanizm zawieszania co
historyczny bug z pkt 16.1). Ten sam efekt uboczny (ujemne `t`) dotyczy też
`drawActivationFx()`/`drawShieldBreakFx()` (tarcza/niewidzialność), ale tam
wzory na promień/dystans mają stałą bazową (`r = 6 + t*34`, `dist = 6 + t*30`)
— przypadkiem maskującą problem, bo lekko ujemne `t` wciąż dawało dodatni
wynik. To wyjaśnia, czemu psuła się tylko Fala, a nie pozostałe dwie.
Bug **istniał już wcześniej** w klawiszowej Fali z pkt 32 (nigdy realnie
niesprawdzonej — "do potwierdzenia" w tamtej sesji) — skrzynki na mapie z
tej sesji po prostu jako pierwsze realnie go uruchomiły.

**Naprawa:** jedna linia w `drawPulseFx()` — `t` przycięte do minimum 0
(`Math.max(0, ...)`), więc promień nigdy nie może wyjść ujemny.
`drawActivationFx()`/`drawShieldBreakFx()` nie zostały ruszone — nie
manifestują tego problemu (maskowane przez własną stałą bazową), więc zmiana
byłaby tam kosmetyczna, nie naprawcza.

**Weryfikacja:** `perl` — `game.js` (`{}` 929/929, `()` 3313/3313, `[]`
243/243, z powrotem do stanu sprzed tymczasowego debugowania). **Potwierdzone
przez usera w tej samej sesji:** po naprawie skrzynka 💥 przetestowana w
realnej rozgrywce i nie zawiesza już gry — zamknięte, nie tylko "do
potwierdzenia".

---

## 37. 40 nowych misji (10 → 50) + 5 nowych skinów misyjnych (2026-07-12, część 2)

**Kontekst:** user zasygnalizował, że projekt powoli wchodzi w fazę końcową
produkcji i poprosił o rozbudowanie systemu Misji (dotąd 10 pozycji z pkt
2/13 dokumentu, 5 nagradzających monetami i 5 skinami) o **40 nowych misji**,
z rozkładem nagród podanym wprost przez usera: 5 kolejnych misji za skiny
(razem 10), 10 za diamenty (dotąd 0), 15 za monety, 10 za podwajacze/
umiejętności (np. kilka sztuk podwójnych monet, dodatkowych serc, tarcz) —
suma 5+15+10+10 = 40, zgodna z żądaną liczbą. User wyraźnie poprosił o
różnorodne, ciekawe misje powiązane z mechanikami dodanymi już **po**
oryginalnej dziesiątce (skrzynki z pkt 16, podwajacze z pkt 31, umiejętności
z pkt 32, Wyzwanie dnia z pkt 25) — nie tylko warianty istniejących progów
poziomów/dystansu.

### 37.1. Sześć nowych liczników życiowych (potrzebnych do warunków misji)

Oryginalny system miał liczniki tylko dla dystansu/monet/coop/versus
(`totalDistanceEver`, `totalCoinsEarned`, `totalCoopRuns`, `totalVersusRuns`)
— żadnej z nowszych mechanik (diamenty, skrzynki, umiejętności, podwajacze,
Wyzwanie dnia) nie dało się warunkować bez dodania analogicznych liczników.
Dodano sześć nowych, każdy tym samym wzorcem `loadRunCounter(key)` /
`saveRunCounter(key, v)`, który już istniał i był reużyty 1:1 (bez nowej
abstrakcji):

- `totalDiamondsEarned` (`scraper_totaldiamonds_v1`) — inkrementowany w
  `addDiamonds()`, jedynym miejscu, przez które przechodzą wszystkie źródła
  diamentów (skrzynki, misje, Wyzwanie dnia). **Przy okazji naprawiono, że
  `addDiamonds()` w ogóle nie wołało `checkMissions()`** — bez tego nowe
  misje diamentowe nigdy by się nie odhaczały po zdobyciu diamentów.
- `totalCratesOpened` (`scraper_cratesopened_v1`) — w `buyAndOpenCrate()`.
- `totalAbilityUses` (`scraper_abilityuses_v1`) — aktywacje umiejętności
  **klawiszami 1/2/3** z magazynu (`activateShield`/`activateInvis`/
  `activatePulse`), celowo osobno od poniższego licznika skrzynek z planszy.
- `totalPickupsCollected` (`scraper_pickupscollected_v1`) — zebranie
  darmowej skrzynki umiejętności na planszy (`collectAbilityPickup()`, pkt
  36.1) — rozróżnione od `totalAbilityUses`, żeby dało się osobno nagradzać
  "gracza aktywnego pod klawisze" i "gracza zbierającego na mapie".
- `totalBoosterRuns` (`scraper_boosterruns_v1`) — liczba biegów rozpoczętych
  z aktywnym podwajaczem, w `launchMode()`.
- `totalChallengesDone` (`scraper_challengesdone_v1`) — liczba w pełni
  odebranych Wyzwań dnia, w `checkChallengeObjectives()`.

Wszystkie sześć dodano do tabeli kluczy `localStorage` w pkt 7 — **suma
kluczy rośnie z 18 do 24** (patrz zaktualizowana tabela w pkt 7 — nie, uwaga:
tabela w pkt 7 nie została ponownie przepisana w tej sesji, żeby nie
duplikować pracy z pkt 35; nowe klucze wypisane tu, w pkt 37.1, jako
jedyne miejsce odniesienia dla tej sesji).

### 37.2. Pięć nowych skinów misyjnych — reużyte parametryczne renderery

Zamiast `type: 'solid'` (jak oryginalna piątka: Tytan/Aurora/Otchłań/
Solaris/Szron), nowa piątka reużywa parametryczne renderery z pkt 33 (ten sam
kompromis efekt/nakład co przy skinach ze skrzynek i bossów z pkt 33/36.3),
żeby czuły się jak wyraźny "krok w górę" prestiżu:

| Skin | Misja (próg) | Renderer | Kolor |
|---|---|---|---|
| Obsydian (`obsidian`) | 20 otwartych skrzynek | `metal` | ciemny fiolet-szary |
| Feniks (`phoenix`) | 50 aktywacji umiejętności (klawisze) | `spark` | ognista czerwień |
| Celestia (`celestia`) | 1000 zdobytych diamentów | `holo` | głęboki granat |
| Nieskończoność (`infinity`) | 15 ukończonych Wyzwań dnia | `nebula` | czerń/biel |
| Geneza (`genesis`) | 15 różnych skinów ze skrzynek | `gem` | złoto |

**`SKINS.length` rośnie z 53 do 58** — kolejne (po pkt 33.3/36.3) podniesienie
progu osiągnięcia „Kompletny zestaw” (`skins_all`), świadomie nieskorygowane,
z tego samego powodu co poprzednio.

### 37.3. Dwa nowe typy nagród misji: `diamonds` i `booster`/`ability`

Oryginalny `checkMissions()` obsługiwał tylko `reward.type === 'coins'` i
`'skin'`. Dodano:

- **`'diamonds'`** — `{ type: 'diamonds', amount }`, woła `addDiamonds()`.
  Klucz i18n `mission_reward_diamonds` (`+{n} 💎`) **już istniał** (był
  używany przez `challengeRewardText()`, pkt 25), więc nie trzeba było dodawać
  nowego tekstu — tylko podpiąć istniejący klucz do `renderMissions()`.
- **`'booster'`** / **`'ability'`** — `{ type: 'booster', boosterId, amount }`
  / `{ type: 'ability', abilityId, amount }`, dopisują `amount` do
  `boosterInventory`/`abilityInventory` (identyczny wzorzec co przy
  skrzynkach, pkt 31/32) i zapisują. Nowy wspólny klucz i18n
  **`mission_reward_item`** (`+{n}× {item}`, gdzie `{item}` to ikona +
  nazwa podwajacza/umiejętności złożona w JS) dodany do wszystkich 10
  języków — jedyny całkiem nowy klucz UI w tej sesji poza samymi 40 misjami.

`renderMissions()`'s reward-text switch rozszerzony z prostego trójskładnikowego
warunku na pełną gałąź 5 typów.

### 37.4. Rozkład 40 nowych misji (pełna lista progów w `game.js`, `MISSIONS`)

- **5 za skiny** (pkt 37.2): 20 skrzynek / 50 aktywacji umiejętności / 1000
  diamentów / 15 Wyzwań dnia / 15 skinów ze skrzynek.
- **15 za monety** (200–900 🪙): poziomy 30/50/75, dystans 25k/50k m, rekord
  wolnego 12000 m, coop 15/30, versus 15, skrzynki umiejętności na mapie 25,
  bieg z podwajaczem ×10, pierwsza skrzynka (5), 5/10 osiągnięć, pierwsze 100
  diamentów.
- **10 za diamenty** (6–15 💎): poziomy 40/60/90, dystans 75k m, versus/coop
  25, 10 skrzynek, 100 aktywacji umiejętności, 5 Wyzwań dnia, 15 000 monet
  łącznie.
- **10 za podwajacze/umiejętności** (po 3 sztuki): poziomy 20/70/95, dystans
  100k/150k m, coop 50, versus 50, 50 skrzynek umiejętności na mapie, bieg z
  podwajaczem ×25, 35 otwartych skrzynek — pokrywają wszystkie 4 podwajacze i
  wszystkie 3 umiejętności co najmniej raz.

Wszystkie progi dobrane tak, żeby **nie powtarzać** żadnego istniejącego progu
(oryginalna 10, ani między sobą) w tej samej kategorii statystyki — np.
poziomy: 5/15/25(pojedynczy)/100%(istniejące) vs. 20/30/40/50/60/70/75/90/95
(nowe), każdy używany dokładnie raz w całym systemie misji.

### 37.5. Poprawka przy okazji: nieaktualne "50 poziomów" w opisie `m_all_levels`

Misja „Legenda Scrapera” (`m_all_levels`, pkt 2/13) nagradza skin Solaris za
ukończenie **wszystkich** poziomów — ale opis (`m_all_levels_desc`) we
**wszystkich 10 językach** wciąż mówił o "wszystkich 50 poziomach", mimo że
gra ma 100 poziomów od pkt 29. To ten sam typ nieścisłości co
`ach_all_bosses_desc`, naprawiony wcześniej tylko dla polskiego w pkt 36.3 —
tym razem naprawiono od razu we wszystkich 10 językach (50→100), skoro sesja
i tak już edytowała te same linie i18n przy okazji dopisywania nowych misji.

**Nie zostało zrobione / świadomie poza zakresem:**
- Balans progów (wszystkie liczby w pkt 37.4) dobrany "na oko", tak jak cały
  pozostały balans w projekcie — nieprzetestowany w realnej, długiej
  rozgrywce.
- Próg osiągnięcia „Kompletny zestaw” (teraz 58 skinów) nieprzebalansowany,
  jak w pkt 33.3/36.3.
- Tłumaczenia CJK (zh/ko/ja) dla 40 nowych misji + 5 skinów zrobione "z
  pamięci modelu", bez weryfikacji przez native speakera — to samo
  zastrzeżenie co od pkt 6, dotyczy teraz też tej nowej treści.
- Tabela kluczy `localStorage` w pkt 7 **nie została** ponownie przepisana z
  6 nowymi kluczami z pkt 37.1 — są wypisane tylko tutaj. Warto ją odświeżyć
  przy następnej większej sesji, tak jak zrobiono to w pkt 35 dla ówczesnych
  18 kluczy.

**Weryfikacja w tej sesji:** `node` niedostępny — zweryfikowano `perl`:
`game.js` (`{}` 1062/1062, `()` 3463/3463, `[]` 251/251), `i18n.js` (`{}`
451/451, `()` 69/69, `[]` 1/1). Policzono wystąpienia wszystkich 40 nowych
kluczy `_name`/`_desc`, 5 nowych kluczy `skin_*` i `mission_reward_item` —
każdy dokładnie 10 (raz na język), zero brakujących. Policzono
`id: 'm_...'` w `MISSIONS` — dokładnie 50 (10 istniejących + 40 nowych).
Policzono `nameKey: 'skin_...'` w `SKINS` — dokładnie 58 (53 istniejące + 5
nowych). Brak w tym środowisku narzędzia do automatyzacji przeglądarki —
`index.html` **nie został otwarty/przetestowany w tej sesji** (do zrobienia
przez usera).

**Do przetestowania przez usera (nic z tego nie zostało zweryfikowane w
przeglądarce w tej sesji):** (1) ekran Misji pokazuje 50 pozycji z poprawnymi
paskami postępu; (2) misje nagradzające diamenty/podwajacze/umiejętności
faktycznie dopisują je do salda/magazynu po odhaczeniu (tekst nagrody w
liście powinien pokazywać np. "+8 💎" albo "+3× 🛡️ Tarcza"); (3) nowa piątka
skinów wygląda odrębnie wizualnie (metal/spark/holo/nebula/gem) i pojawia się
w zakładce "Misje" Sklepu; (4) żadna z 50 misji nie odhacza się od razu przy
starcie (czyli warunki startowe, np. `progress.filter(Boolean).length >= 20`,
nie są fałszywie spełnione dla nowego/pustego zapisu).

**Poprawka jeszcze w tej samej sesji (37.6):** user poprosił o uporządkowanie
listy w ekranie Misji w kolejności: monety → diamenty → podwajacze/
umiejętności → skórki na końcu (dotąd kolejność wynikała wprost z kolejności
definicji w tablicy `MISSIONS`, czyli była pomieszana — oryginalna dziesiątka
w kolejności monety/monety/monety/monety/monety/skin×5, potem cztery nowe
bloki z pkt 37.4 jeden po drugim). Zamiast fizycznie przestawiać 50 wpisów w
`MISSIONS` (ryzyko pomyłki przy tak dużej tablicy, a i tak bez znaczenia dla
`checkMissions()`/`missionProgress()`, które nie zależą od kolejności), dodano
mapę priorytetu `MISSION_REWARD_ORDER` (`{ coins:0, diamonds:1, booster:2,
ability:2, skin:3 }`) i sortowanie **kopii** tablicy wewnątrz
`renderMissions()` tuż przed renderowaniem — `MISSIONS` samo w sobie zostaje
nietknięte, w oryginalnej kolejności definicji. Podwajacze i umiejętności
celowo dzielą ten sam priorytet (2), więc lądują w jednej grupie zgodnie z
proźbą "podwajacze i te inne", w kolejności względnej takiej, w jakiej
występują w `MISSIONS` (sortowanie w JS jest stabilne).

---

## 38. 22 nowe skiny za monety (30 → 80 skinów łącznie) + misja Otchłań wymaga teraz wszystkich (2026-07-12, część 3)

**Kontekst:** user poprosił o dodanie 22 nowych skinów za monety (kategoria
"Monety" rosła z 8 do 30) i jednocześnie zmianę warunku misji „Pełna
kolekcja sklepowa” (`m_shop_all`, nagroda: skin Otchłań) — dotąd wymagała
posiadania 13 skinów (8 monetowych + 5 bossowych), teraz ma wymagać
posiadania **wszystkich 80 skinów w grze**. Liczba 22 nie jest przypadkowa —
80 to dokładnie suma po dodaniu: 8 (stare monety) + 22 (nowe monety) + 10
(bossy) + 10 (misje, po rozszerzeniu z pkt 37.2) + 30 (skrzynki) = 80.

### 38.1. 22 nowe skiny — kontynuacja drabinki cenowej, reużyte renderery

Dopisane zaraz po `neon` (ostatni z oryginalnej ósemki, 980 🪙), ceny rosnące
dalej: 1150 → 4700 🪙. Jak w pkt 33/36/37.2, żadnych nowych funkcji
rysujących — reużyto 8 parametrycznych rendererów (`gem`/`nebula`/`stripe`/
`dot`/`wave`/`holo`/`metal`/`spark`) plus `solid`, z nowymi paletami:

| Renderer | Skiny (cena 🪙) |
|---|---|
| `solid` (4) | Karmin 1150, Limonka 1300, Błękit Nieba 1450, Kość Słoniowa 1600 |
| `gem` (2) | Topaz 1800, Perydot 1950 |
| `nebula` (2) | Mgławica Róży 2100, Mgławica Lodu 2250 |
| `stripe` (2) | Zebra 2400, Osa 2550 |
| `dot` (2) | Żyrafa 2700, Gepard 2850 |
| `wave` (2) | Zorza Polarna 3000, Zachód Słońca 3150 |
| `holo` (2) | Kwarc 3350, Onyks 3500 |
| `metal` (3) | Platyna 3750, Grafit 3900, Miedź 4100 |
| `spark` (3) | Inferno 4350, Lodowiec 4500, Jad 4700 |

Kolory dobrane tak, żeby nie kolidowały wizualnie z już istniejącymi 58
skinami (drobne, akceptowalne podobieństwa tonalne, np. Miedź vs. Brąz ze
skrzynek, są nieuniknione przy 80 skinach w jednej palecie — świadomie
zaakceptowane, jak przy poprzednich rundach kolorów w pkt 33).

### 38.2. Misja Otchłań: z "13 skinów sklepowych" na "wszystkich 80"

- `checkMissions()`: warunek `m_shop_all` zmieniony z
  `SKINS.filter(s => s.kind === 'coin' || s.kind === 'boss').every(...)` na
  `ownedSkins.size >= SKINS.length` — **dokładnie ten sam warunek co
  osiągnięcie „Kompletny zestaw” (`skins_all`, pkt 21.2)**. To celowe
  powielenie, nie przeoczenie — dokładnie ten sam wzorzec co istniejąca para
  `m_all_levels` (misja) / `all_levels` (osiągnięcie), które od dawna dzielą
  identyczny warunek jako dwie osobne ścieżki nagrody.
- `missionProgress()`: `m_shop_all` uproszczone do jednej linii
  (`Math.min(SKINS.length, ownedSkins.size)` / `SKINS.length`) zamiast
  wcześniejszego filtrowania po `kind`.
- **Tekst misji zaktualizowany we wszystkich 10 językach** — "13 skinów
  dostępnych w sklepie" → "80 skinów dostępnych w grze" (celowo "w grze", nie
  "w sklepie", bo teraz wymaga też skinów ze skrzynek/misji, które nie są
  bezpośrednio kupowalne, tylko widoczne w odpowiednich zakładkach Sklepu).

**Efekt uboczny, wart odnotowania:** misja Otchłań staje się teraz
**najtrudniejszą** w całej grze — trudniejszą nawet niż osiągnięcie
„Kompletny zestaw” samo w sobie tylko dlatego, że wymaga dokładnie tego
samego (100% skinów, w tym 30 losowych ze skrzynek). To świadoma konsekwencja
wprost zgodna z poleceniem usera, nie błąd.

**Nie zostało zrobione / świadomie poza zakresem:**
- Ceny 22 nowych skinów (1150–4700 🪙) dobrane "na oko", kontynuacja
  wcześniejszej drabinki — nieprzetestowane w realnej ekonomii.
- Tłumaczenia CJK (zh/ko/ja) nazw 22 nowych skinów — jak zawsze, "z pamięci
  modelu", bez weryfikacji przez native speakera.

**Weryfikacja w tej sesji:** `perl` — `game.js` (`{}` 1084/1084, `()`
3488/3488, `[]` 253/253), `i18n.js` (`{}` 451/451, `()` 69/69, `[]` 1/1).
Policzono wystąpienia wszystkich 22 nowych kluczy `skin_*` — każdy dokładnie
10 (raz na język). Policzono `nameKey: 'skin_...'` **w samej tablicy
`SKINS`** (nie w całym pliku, żeby uniknąć fałszywych trafień z innych
tablic) — dokładnie 80. Policzono `kind: 'coin'` w `SKINS` — dokładnie 30.
Brak w tym środowisku narzędzia do automatyzacji przeglądarki — **nie
przetestowano wizualnie w tej sesji**.

**Do przetestowania przez usera:** (1) zakładka "Monety" w Sklepie pokazuje
30 skinów z rosnącymi cenami, przewijalnych strzałkami; (2) każdy z 9 nowych
rendererów/palet wygląda odrębnie (szczególnie w obrębie tej samej kategorii,
np. 3 skiny `metal` czy 3 skiny `spark`); (3) misja „Pełna kolekcja sklepowa”
pokazuje pasek postępu X/80 zamiast dawnego X/13, i realnie wymaga zdobycia
kompletu (w tym skinów ze skrzynek) zanim się odhaczy.

---

## 39. 19 nowych osiągnięć (10 → 29, docelowo 30) + poziom diamentowy + 2 ukryte (2026-07-12, część 4)

**Kontekst:** user poprosił o rozbudowę systemu Osiągnięć z 10 do 30, z
podziałem na rzadkość brąz/srebro/złoto, oraz o 3 **ukryte** osiągnięcia
poziomu **diamentowego** (nowa, najrzadsza rzadkość, wyżej niż złoto) —
niewidoczne (treść zastąpiona "???") dopóki się ich nie zdobędzie. Dwa z
trzech user podał wprost: „Zdobądź wszystkie skórki” i „Przejdź wszystkie
poziomy” — **obie już istniały** jako osiągnięcia złote (`skins_all`,
`all_levels`), więc zostały **przekwalifikowane** na diament+ukryte zamiast
dublowane. Trzecie diamentowe osiągnięcie ma zostać dodane później — stąd
user poprosił o dodanie **19**, nie 20, na tę sesję (10 istniejących + 19
nowych = 29; +1 diamentowe później = 30 docelowo).

### 39.1. Nowa rzadkość „diamond” + mechanizm ukrywania

- **`skins_all`** (Kompletny zestaw) i **`all_levels`** (Mistrz gry) — jedyna
  zmiana w ich definicjach w `ACHIEVEMENTS`: `tier: 'gold'` → `tier:
  'diamond'`, plus nowe pole `hidden: true`. **Warunek/logika w
  `checkAchievements()` bez zmian** — to czysto kosmetyczna promocja
  istniejących, najtrudniejszych osiągnięć na nowy, rzadszy poziom, nie nowa
  funkcjonalność.
- **`renderAchievements()`** — nowa zmienna `isSecret = a.hidden &&
  !unlocked`. Gdy `true`: ikona zastąpiona `❔`, nazwa i opis zastąpione
  wspólnym kluczem i18n `achievement_hidden_name`/`achievement_hidden_desc`
  (`'???'` / `'Ukryte osiągnięcie — odblokuj je, aby poznać szczegóły.'`) —
  **ten sam placeholder dla każdego ukrytego osiągnięcia**, żeby sama treść
  "???" nie zdradzała, o co chodzi. Po odblokowaniu renderuje się dokładnie
  jak zwykłe osiągnięcie (prawdziwa ikona/nazwa/opis), bez dodatkowej logiki.
- **CSS** (`style.css`): nowa klasa `.tier-diamond` — obramowanie/poświata w
  kolorze `#7fd8ff` (ten sam odcień co ikonka 💎 w `.mm-chip-diamonds`, więc
  "diamentowość" jest rozpoznawalna na pierwszy rzut oka, nie tylko "kolejne
  złoto"). Nowa klasa `.trophy-item.secret` — przerywana ramka na zablokowanej
  jeszcze kafelce ukrytego osiągnięcia (odróżnia "tu jest coś tajnego" od
  zwykłego zablokowanego osiągnięcia bez zdradzania treści).

### 39.2. 19 nowych osiągnięć — 7 brąz / 7 srebro / 5 złoto

Rozkład celowo piramidalny (więcej łatwych u podstawy): po dodaniu tier
sumarycznie wynosi **10 brąz / 10 srebro / 7 złoto / 2 diament** = 29.
Wszystkie warunki reużywają liczników dodanych w pkt 37.1 (skrzynki,
diamenty, umiejętności, skrzynki-z-planszy, biegi z podwajaczem, Wyzwania
dnia) plus `completedMissions.size` (nowość — dotąd nic nie liczyło
ukończonych misji jako osobnej metryki):

- **Brąz (7)** — "pierwszy raz" dla mechanik, które go dotąd nie miały:
  pierwsza Rywalizacja, pierwszy boss, pierwsza skrzynka, pierwszy diament,
  pierwsza misja, pierwsza umiejętność, pierwsze Wyzwanie dnia.
- **Srebro (7)** — okrągłe progi pośrednie: 50 poziomów, 10 skrzynek, 50
  diamentów, 10 misji, 25 aktywacji umiejętności, 10 Wyzwań dnia, 10 skrzynek
  z planszy.
- **Złoto (5)** — wyższe progi: 10 000 monet, 500 diamentów, 50 skrzynek, 30
  misji, 50 biegów z podwajaczem.

Żaden nowy próg nie powiela dokładnie progu z pozostałych 19 ani z
oryginalnej 10 w tej samej kategorii statystyki (np. poziomy: istniejące
1(pierwszy)/10×10(bossy)/100%(diament) vs. nowe 50; skrzynki: nowe 1/10/50).

### 39.3. Naprawiona luka: `checkAchievements()` nie było wołane wszędzie tam, gdzie powinno

Przy projektowaniu warunków dla nowych osiągnięć odkryto, że **`checkAchievements()`
nie było wołane** po zdobyciu diamentów (`addDiamonds()`), aktywacji
umiejętności (`activateShield`/`activateInvis`/`activatePulse`), zebraniu
skrzynki z planszy (`collectAbilityPickup()`), starcie biegu z podwajaczem
(`launchMode()`) ani po zaklepaniu Wyzwania dnia
(`checkChallengeObjectives()`) — te ścieżki wcześniej wołały tylko
`checkMissions()` (dodane w pkt 37.1), nigdy `checkAchievements()`, bo do tej
sesji żadne osiągnięcie nie zależało od tych zdarzeń. Dodano brakujące
wywołanie `checkAchievements()` w każdym z tych pięciu miejsc, **plus** nowe
wywołanie na końcu `checkMissions()` (gdy `changed === true`) — to pokrywa
osiągnięcia zależne od `completedMissions.size` (pierwsza/10/30 misji) bez
względu na to, które zdarzenie akurat spowodowało ukończenie danej misji.
Osiągnięcia zależne od poziomów/bossów (`first_boss`, `levels_50`) nie
wymagały nowego okablowania — `checkAchievements()` już było wołane w
`winLevel()`. `versus_finish` też nie wymagał zmian — `checkAchievements()`
jest wołane na samym początku `finishRun()`, niezależnie od trybu.

**Nie zostało zrobione / świadomie poza zakresem:**
- Trzecie diamentowe/ukryte osiągnięcie — user zapowiedział, że doda je
  później, celowo nie zgadywano co to będzie.
- Balans progów (7 nowych brązowych to feats "pierwszy raz", ale progi
  srebra/złota dobrane "na oko") — nieprzetestowany w realnej rozgrywce.
- Tłumaczenia CJK 19 nowych osiągnięć — jak zawsze, bez weryfikacji przez
  native speakera.

**Weryfikacja w tej sesji:** `perl` — `game.js` (`{}` 1104/1104, `()`
3527/3527, `[]` 254/254), `i18n.js` (`{}` 451/451, `()` 85/85, `[]` 1/1),
`style.css` (`{}` 249/249, `()` 377/377, `[]` 5/5). Policzono `id: '...'`
**w samej tablicy `ACHIEVEMENTS`** — dokładnie 29. Policzono `hidden: true` —
dokładnie 2. Policzono `tier: 'bronze'/'silver'/'gold'/'diamond'` w tej samej
tablicy — 10/10/7/2, sumarycznie 29. Policzono wystąpienia wszystkich 19
nowych kluczy `ach_*_name`/`_desc` + `achievement_hidden_name`/`_desc` —
każdy dokładnie 10 (raz na język). Brak w tym środowisku narzędzia do
automatyzacji przeglądarki — **nie przetestowano wizualnie w tej sesji**.

**Do przetestowania przez usera:** (1) ekran Osiągnięć pokazuje 29 kafelków,
w tym dwa z przerywaną ramką i "❔"/"???" zamiast prawdziwej treści (dopóki
nie zostaną zdobyte); (2) po zdobyciu ukrytego osiągnięcia (np. ukończenie
wszystkich 100 poziomów) kafelek odsłania prawdziwą ikonę/nazwę/opis i
świeci na niebiesko-turkusowo (diament), wyraźnie inaczej niż złoto; (3)
nowe osiągnięcia typu "pierwszy raz" (skrzynka/diament/umiejętność/misja/
Wyzwanie dnia/Rywalizacja) faktycznie odblokowują się przy pierwszym
wystąpieniu danego zdarzenia, nie dopiero przy którymś kolejnym.

**Poprawka jeszcze w tej samej sesji (39.4):** user poprosił o dwie rzeczy.

1. **Kolejność wyświetlania wg rzadkości** — dotąd `renderAchievements()`
   iterowało `ACHIEVEMENTS` w kolejności definicji (przez co diamentowe
   `skins_all`/`all_levels` wypadały pomiędzy resztą, nie na końcu). Naprawiono
   dokładnie tym samym wzorcem co `MISSION_REWARD_ORDER`/`renderMissions()` z
   pkt 37.6: nowa mapa priorytetu `ACHIEVEMENT_TIER_ORDER` (`{ bronze:0,
   silver:1, gold:2, diamond:3 }`) i sortowanie **kopii** tablicy w
   `renderAchievements()` — `ACHIEVEMENTS` samo w sobie nietknięte, sortowanie
   stabilne (kolejność w obrębie tej samej rzadkości = kolejność definicji).
2. **Bug siatki 2 kolumn: lewa kafelka bywała szersza od prawej** — przyczyna:
   `.trophy-grid` miało `grid-template-columns: repeat(2, 1fr)` bez
   `minmax(0, ...)`, więc kolumna z dłuższym nieprzełamywalnym tekstem (np.
   nazwa/opis) była poszerzana przez CSS Grid ponad `1fr` (domyślne
   `min-width: auto` na elemencie siatki respektuje minimalny rozmiar treści),
   kosztem drugiej kolumny. Naprawa: `minmax(0, 1fr)` na obu kolumnach
   (pozwala kolumnie skurczyć się poniżej rozmiaru treści zamiast wypychać
   sąsiednią), plus `min-width:0` na `.trophy-item` i `overflow-wrap:
   break-word` na `.trophy-name`/`.trophy-desc` jako zabezpieczenie, żeby
   długi tekst zawijał się zamiast wymuszać szerokość.

**Weryfikacja:** `perl` — `game.js` (`{}` 1105/1105, `()` 3532/3532, `[]`
256/256), `style.css` (`{}` 249/249, `()` 378/378, `[]` 5/5). Nie
przetestowano wizualnie (brak automatyzacji przeglądarki w tym środowisku) —
**do potwierdzenia przez usera**, że obie kolumny są teraz faktycznie równej
szerokości i że kolejność w gridzie to brąz → srebro → złoto → diament.

---

## 40. Podsumowanie sesji 2026-07-12 (część 2–4) — mapa dla kolejnej sesji

**Ta sesja (kontynuacja tego samego dnia co pkt 36) była bardzo długa —
punkty 37–39** — zamiast czytać wszystko po kolei następnym razem, ten punkt
jest szybkim indeksem: co zrobiono, co najpilniej przetestować, i jaki jest
stan projektu na wyjściu. User poinformował na koniec, że **na razie kończy
pracę nad tą sesją** — to jest naturalny punkt startowy następnej.

### 40.1. Co zrobiono w tej sesji (skrót, szczegóły w 37–39)

1. **Pkt 37** — **40 nowych misji** (system rósł z 10 do 50): 5 za skiny
   (nowe skiny Obsydian/Feniks/Celestia/Nieskończoność/Geneza), 15 za monety,
   10 za diamenty (nowy typ nagrody misji), 10 za podwajacze/umiejętności
   (kolejny nowy typ nagrody). Dodano 6 nowych liczników życiowych (pkt
   37.1) i naprawiono brak `checkMissions()` w `addDiamonds()`. Przy okazji
   naprawiono nieaktualne "50 poziomów" → "100 poziomów" w opisie misji
   `m_all_levels` we wszystkich 10 językach.
   - **Poprawka 37.6** — lista Misji sortowana przy renderowaniu wg typu
     nagrody: monety → diamenty → podwajacze/umiejętności → skiny na końcu
     (`MISSION_REWARD_ORDER`, sama tablica `MISSIONS` nietknięta).
2. **Pkt 38** — **22 nowe skiny za monety** (kategoria Monety: 8 → 30, razem
   w grze **80 skinów**). Misja „Pełna kolekcja sklepowa” (nagroda: skin
   Otchłań) przebudowana z "13 skinów sklepowych" na **"wszystkich 80 skinów
   w grze"** — teraz dzieli dokładnie ten sam warunek co osiągnięcie
   „Kompletny zestaw” (celowe, jak przy `m_all_levels`/`all_levels`).
3. **Pkt 39** — **19 nowych osiągnięć** (10 → 29, docelowo 30): 7 brąz / 7
   srebro / 5 złoto, plus **nowa rzadkość „diamond”** (rzadsza niż złoto) z
   mechanizmem **ukrywania** (`hidden: true` → placeholder "???" dopóki
   nieodblokowane). Dwa istniejące złote osiągnięcia (`skins_all`,
   `all_levels`) **przekwalifikowane** na diament+ukryte zamiast dublowane —
   **trzecie diamentowe osiągnięcie user zapowiedział na później, jeszcze
   nieustalone jakie**. Odkryto i naprawiono lukę: `checkAchievements()` nie
   było wołane po zdobyciu diamentów/aktywacji umiejętności/zebraniu
   skrzynki z planszy/starcie biegu z podwajaczem/Wyzwaniu dnia.
   - **Poprawka 39.4** — siatka Osiągnięć sortowana przy renderowaniu wg
     rzadkości: brąz → srebro → złoto → diament na końcu
     (`ACHIEVEMENT_TIER_ORDER`, analogicznie do 37.6). Naprawiono też bug
     CSS Grid, przez który lewa kolumna w widoku 2×N bywała szersza od
     prawej (brak `minmax(0, ...)` na `grid-template-columns`).

### 40.2. Najpilniejsze do przetestowania na start kolejnej sesji

**Cała ta sesja nie została ani razu otwarta w przeglądarce** (brak
narzędzia do automatyzacji przeglądarki w tym środowisku przez całą sesję) —
inaczej niż zwykle, tym razem **dosłownie nic nie zostało zweryfikowane
wizualnie**, tylko statycznie (bilans nawiasów, liczby wystąpień kluczy).
Kolejność "od najbardziej prawdopodobnego problemu":

1. **Ekran Misji — 50 pozycji** — czy renderuje się poprawnie, paski postępu
   liczą się prawidłowo, a kolejność to monety→diamenty→podwajacze/
   umiejętności→skiny (pkt 37.6). Nagrody typu diamenty/podwajacz/umiejętność
   (nowe w tej sesji) faktycznie trafiają na konto po odhaczeniu misji.
2. **Ekran Osiągnięć — 29 kafelków, siatka 2 kolumn** — czy obie kolumny są
   teraz równej szerokości (pkt 39.4, nigdy niewidziane wizualnie), czy
   kolejność to brąz→srebro→złoto→diament, czy dwa ukryte diamentowe
   pokazują "❔"/"???" póki nieodblokowane i odsłaniają się poprawnie po
   zdobyciu.
3. **Sklep, zakładka Monety — 30 skinów** — czy przewijanie strzałkami działa
   przy tak dużej liczbie pozycji, czy 9 nowych rendererów/palet (pkt 38.1)
   wygląda odrębnie, zwłaszcza w obrębie tej samej kategorii (3× metal, 3×
   spark).
4. **Realne odblokowanie nowych misji/osiągnięć w grze** — zagrać kawałek w
   każdym trybie i sprawdzić, czy liczniki z pkt 37.1 (skrzynki, diamenty,
   umiejętności, skrzynki-z-planszy, biegi-z-podwajaczem, Wyzwania dnia)
   faktycznie rosną i odblokowują odpowiednie misje/osiągnięcia w
   odpowiednim momencie (nie za wcześnie, nie w ogóle).
5. **Misja „Pełna kolekcja sklepowa” (Otchłań)** — teraz wymaga 80/80 skinów,
   najtrudniejsza w grze — nie da się jej realnie przetestować end-to-end bez
   długiej sesji grania/farmienia, ale warto chociaż potwierdzić, że pasek
   postępu liczy się poprawnie (X/80, nie X/13 z pamięci starego kodu).

### 40.3. Stan projektu na wyjściu z sesji

- **Misje: 50** (10 oryginalnych + 40 z pkt 37). **Skiny: 80** (30 monety +
  10 bossy + 10 misje + 30 skrzynki, pkt 38). **Osiągnięcia: 29** (10 brąz +
  10 srebro + 7 złoto + 2 diament-ukryte, docelowo 30 po dodaniu trzeciego
  diamentowego — **user zapowiedział, że doda je w przyszłej sesji, jeszcze
  nie ustalono jakie**, to pierwsza rzecz do zapytania na starcie kolejnej
  rozmowy o tym projekcie, jeśli sam nie powie).
- **Próg osiągnięcia „Kompletny zestaw” (`skins_all`) = 80** (dawniej 18→48→
  53→58→80 przez kolejne sesje, pkt 33.3/36.3/38.2) — wciąż nieprzebalansowany
  względem realnej trudności zdobycia, świadomie zostawione jak zawsze.
- **`localStorage`: 24 klucze**, tabela w pkt 7 odświeżona w tej sesji (było
  18 od pkt 35).
- **i18n: pełne pokrycie 10 języków utrzymane** przez całą sesję (40 misji ×
  2 + 5 skinów + 22 skiny + 19 osiągnięć × 2 + kilka kluczy UI — wszystko
  dodane do wszystkich 10 bloków językowych, zweryfikowane liczeniem
  wystąpień po każdej rundzie). zh/ko/ja nadal "z pamięci modelu", bez
  weryfikacji przez native speakera — lista rzeczy czekających na taką
  weryfikację rośnie z każdą sesją (to samo zastrzeżenie od pkt 6, teraz
  dotyczy już kilkuset dodatkowych kluczy).
- **Balans wszystkiego w tej sesji dobrany "na oko"** (progi misji/osiągnięć,
  ceny 22 nowych skinów, szansa na nic nie zmienioną w skrzynkach) —
  nieprzetestowane w realnej, dłuższej rozgrywce, jak cały pozostały balans
  projektu.
- **Żadna zmiana z tej sesji nie została otwarta w przeglądarce** (patrz pkt
  40.2) — jeśli coś nie działa, to jest pierwsze miejsce, gdzie szukać
  literówki/rozjazdu, skoro weryfikacja była wyłącznie statyczna.

---

## 41. Zalążek systemu Poziomu gracza / EXP — tylko pasek na razie (2026-07-13)

**Kontekst:** user zaproponował dodanie **poziomu gracza** (osobny od
poziomów gry z sekcji 3.1 — to jest meta-progresja konta, jak "player level"
w innych grach), zdobywanego przez EXP. Docelowo poziom ma **odblokowywać
przyciski Misje/Skrzynki/Wyzwanie dnia** na menu głównym (obecnie zawsze
dostępne) — **to świadomie NIE zostało zrobione w tej sesji**, user poprosił
wyraźnie tylko o wizualny pasek + etykietę na razie, bez logiki odblokowania
i bez żadnego źródła EXP.

**Co zostało dodane:**

- **Nowy panel `#mmLevel`** na menu głównym, **nad** `#mmRecord` (rekord
  dystansu trybu wolnego) — `#mmRecord` przesunięty w dół (`top:32px` →
  `top:98px`, żeby zrobić miejsce). Zawiera etykietę `Poziom {n}` (klucz i18n
  `mainMenu_level`, dodany do **wszystkich 10 języków**) oraz pasek postępu
  (`.mm-level-bar-track`/`.mm-level-bar-fill`, wzorowany na istniejącym
  `.quest-bar-track`/`.quest-bar-fill` z ekranu Misji) wypełniający się na
  **zielono** (nowa zmienna `--level: #4ade80` + `--level-glow`, obramowanie i
  poświata panelu też w tym kolorze — jedyny zielony akcent w całej palecie,
  celowo odróżniony od turkusu kulki/gold/boss/diamentu).
- **Trwały zapis:** `scraper_level_v1` (domyślnie `1`) i `scraper_exp_v1`
  (domyślnie `0`) w `localStorage`, wzorem `loadCoins`/`saveCoins`
  (`loadLevel`/`saveLevel`, `loadExp`/`saveExp`, opakowane w `try/catch`).
  **Nic w tej sesji jeszcze nie wywołuje `saveLevel`/`saveExp` z nową
  wartością** — funkcje istnieją jako gotowa podstawa pod przyszłe źródło
  EXP, ale realnie poziom zostanie `1`, a pasek pusty, dopóki ktoś nie dopisze
  logiki przyznającej EXP (analogicznie do `addCoins`/`addDiamonds`).
- **Formuła progu (podana wprost przez usera):** `expForLevel(l) = 100 + (l-1)*25`
  — EXP potrzebne, by wejść z poziomu `l` na `l+1`. Poziom 1→2 = 100 EXP,
  2→3 = 125 EXP, 3→4 = 150 EXP, itd. (rosnąco liniowo, +25 za każdy kolejny
  próg).
- **Render:** `updateLevelHud()` — nowa funkcja, wołana z wnętrza
  `updateCoinsHud()` (razem z monetami/diamentami/rekordem), więc automatycznie
  odświeża się przy każdym miejscu, które już wywołuje `updateCoinsHud()`
  (w tym raz na starcie, przez `applyStaticTranslations()`).

**Nie zostało zrobione / świadomie poza zakresem (do kolejnej sesji):**
- **Żadne źródło EXP** — nic w grze jeszcze nie przyznaje EXP, to celowo
  zostawione na następny krok (user zapowiedział dystans/misje/osiągnięcia
  jako naturalnych kandydatów, ale nic nie zostało ustalone).
- **Odblokowywanie przycisków Misje/Skrzynki/Wyzwanie dnia poziomem** — to
  było wprost wspomniane przez usera jako docelowy cel całego systemu, ale
  **nie na tę sesję** — obecnie te przyciski są, jak dotąd, zawsze aktywne.
- Zapis/wczytywanie realnej wartości `level`/`exp` (funkcje `saveLevel`/
  `saveExp` są gotowe, ale nic ich jeszcze nie wywołuje z nowym stanem).
- Panel level ukrywa się na małych ekranach (`@media max-width:720px`),
  tak samo jak `#mmRecord` obok niego — spójne z istniejącym zachowaniem tego
  obszaru menu.

**Weryfikacja w tej sesji:** `perl` — `game.js` (`{}` 1123/1123, `()`
3570/3570, `[]` 256/256), `i18n.js` (`{}` 461/461, `()` 85/85, `[]` 1/1).
Zbalansowanie `<div>` w `index.html` policzone przez `Grep` (bo `python3` w
tym środowisku to tylko stub Microsoft Store, jak w poprzednich sesjach) —
59/59. Brak w środowisku narzędzia do automatyzacji przeglądarki — gra
otwarta przez `explorer.exe` do ręcznego testu przez usera. **Do
potwierdzenia:** panel poziomu wygląda poprawnie (zielony, nad rekordem,
rekord czytelnie przesunięty w dół, bez nachodzenia na `.mm-topleft-col` przy
różnych szerokościach okna).

---

## 42. Przebudowa dropów ze skrzynek + EXP jako pierwsze faktyczne źródło poziomu (2026-07-13, część 2)

**Kontekst:** user zapytał o aktualne szanse dropu ze skrzynek (opisane w
`rollCrateItem()`, patrz pkt 16.2 dla samego wprowadzenia sklepu/skrzynek),
po czym poprosił o ich przebudowę: **ujednolicić zakres diamentów** na 1–3
dla wszystkich trzech rzadkości (dotąd rósł z rzadkością: 1-3/2-5/3-7), oraz
**zmienić cały rozkład szans** na: 20% podwajacz, 20% umiejętność, 25% EXP
(50–200), 25% diamenty (1–3), 10% skin — **wyłącznie skiny ze skrzynek**
(`kind: 'crate'`, 30 sztuk), już nie skiny monetowe sklepu jak dotąd.

### 42.1. Skrzynki jako pierwsze realne źródło EXP

**To zamyka lukę z pkt 41** — dotąd system Poziomu/EXP (pasek na menu
głównym) istniał tylko wizualnie, bez żadnego źródła przyznającego EXP.
Skrzynki są teraz **pierwszym i jedynym** takim źródłem. Dodano funkcję
`addExp(n)` (obok `expForLevel()`/`updateLevelHud()` w sekcji LEVEL/EXP):
dolicza EXP, po czym w pętli `while (exp >= expForLevel(level))` odejmuje
próg i inkrementuje `level` — **obsługuje wielokrotny level-up za jednym
razem** (np. duża porcja EXP z legendarnej skrzynki może przeskoczyć więcej
niż jeden poziom naraz, co jest możliwe przy niskich progach wczesnych
poziomów: 100/125/150 EXP vs. zakres nagrody 50–200 EXP na pojedynczy drop).
Zapisuje `level`/`exp` przez `saveLevel`/`saveExp` (funkcje istniały od pkt
41, teraz pierwszy raz faktycznie wywołane) i odświeża HUD.

### 42.2. Nowy rozkład `rollCrateItem()`

Zastąpiono poprzedni rozkład (10% skin / 15% umiejętność / 15% podwajacz /
60% diamenty, patrz pkt 16.2) nowym, podanym wprost przez usera:

| Wynik | Szansa | Zakres/pula |
|---|---|---|
| Podwajacz (booster) | 20% | losowy z 4 typów |
| Umiejętność (ability) | 20% | losowa z 3 typów |
| EXP | 25% | 50–200 (stała `CRATE_EXP_RANGE`, ta sama dla każdej rzadkości skrzynki) |
| Diamenty | 25% | 1–3 (`itemRange`, teraz identyczny dla common/epic/legendary) |
| Skin | 10% | wyłącznie 30 skinów `kind: 'crate'` (już NIE skiny monetowe sklepu) |

**Kolejność sprawdzania progów w kodzie:** podwajacz → umiejętność → EXP →
diamenty → skin (ostatni, z fallbackiem). Jeśli akurat w tej 10% gałęzi nie
ma już żadnego nieposiadanego skina ze skrzynek (gracz ma komplet 30/30),
rzut **spada na diamenty** zamiast nic nie dawać — analogiczny fallback do
tego, co się działo (przypadkiem, przez zagnieżdżenie warunków) w starej
wersji z pkt 16.2, tu zrobiony jawnie.

**`CRATES` — pole `itemRange`** ujednolicone do `[1, 3]` we wszystkich trzech
wpisach (dotąd `[1,3]`/`[2,5]`/`[3,7]`). `extraCount` (2/5/10) i
`coinsRange`/cena **bez zmian** — wyższa rzadkość skrzynki nadal daje realnie
więcej, tylko wyłącznie przez liczbę rzutów i gwarantowane monety, nie przez
wyższe szanse per rzut (ten sam wzorzec co już opisano userowi przy
odpowiedzi o starym rozkładzie).

### 42.3. UI otwierania skrzynki + i18n

`buyAndOpenCrate()`: nowy licznik `totalExp` (wzorem `totalDiamonds`),
sumuje wszystkie trafienia typu `'exp'` z danego otwarcia, następnie
`addExp(totalExp)` wywoływane obok istniejącego `addDiamonds(totalDiamonds)`.
`showCrateOpenOverlay()`: nowa gałąź dla `it.type === 'exp'`, renderuje przez
nowy klucz i18n **`mission_reward_exp: '+{n} EXP'`** (dodany do wszystkich 10
języków, tuż obok istniejącego `mission_reward_diamonds` — "EXP" celowo
zostawione nieprzetłumaczone we wszystkich wersjach językowych, jak nazwa
gry "Scraper", to powszechny skrót w grach niezależnie od języka).

**Nie zostało zrobione / świadomie poza zakresem:**
- Balans nowych progów (20/20/25/25/10%, zakres EXP 50–200) dobrany wprost
  wg liczb podanych przez usera — nieprzetestowany w realnej rozgrywce, jak
  cały pozostały balans projektu.
- Odblokowywanie Misji/Skrzynek/Wyzwania dnia poziomem gracza — wciąż nie
  zrobione, patrz pkt 41, to osobny, jeszcze nieustalony krok.
- Achievementy/misje reagujące na zdobyte poziomy/EXP — nic obecnie nie
  śledzi `level`/`exp` jako warunku (w przeciwieństwie do coins/diamonds,
  które mają dedykowane progi w `ACHIEVEMENTS`/`MISSIONS`).

**Weryfikacja w tej sesji:** `perl` — `game.js` (`{}` 1131/1131, `()`
3589/3589, `[]` 261/261), `i18n.js` (`{}` 471/471, `()` 85/85, `[]` 1/1).
Policzono wystąpienia `mission_reward_exp:` — dokładnie 10 (raz na język).
Brak w środowisku narzędzia do automatyzacji przeglądarki — gra otwarta przez
`explorer.exe` do ręcznego testu przez usera. **Do potwierdzenia:** (1)
otwarcie każdej z 3 skrzynek pokazuje sensowny rozkład typów przedmiotów
zbliżony do 20/20/25/25/10% w dłuższej próbie; (2) trafienie EXP faktycznie
podnosi pasek poziomu na menu głównym, a przy dużej porcji EXP poziom
potrafi przeskoczyć więcej niż raz na jednym otwarciu; (3) po skompletowaniu
wszystkich 30 skinów ze skrzynek 10%-owa gałąź realnie zamienia się w
diamenty zamiast crashować/nic nie dawać.

---

## 43. Licznik EXP obok poziomu, opisy Misji dziennych, ukryte skiny bossów (2026-07-13, część 3)

**Kontekst:** trzy drobne, niezależne poprawki zgłoszone przez usera jedną
wiadomością.

### 43.1. Panel poziomu — licznik "ile masz / ile trzeba" obok napisu poziomu

Panel `#mmLevel` (pkt 41) miał dotąd tylko etykietę `Poziom {n}` i pasek bez
liczb. Dodano `#mmLevelExp` — nowy wiersz górny `.mm-level-top` (flex,
`justify-content:space-between`) mieszczący **obie** etykiety obok siebie:
`Poziom {n}` po lewej, `{cur} / {need} EXP` po prawej (nowy klucz i18n
`mainMenu_level_exp`, dodany do wszystkich 10 języków — **"EXP" celowo
nieprzetłumaczone**, jak `mission_reward_exp` z pkt 42.3). `updateLevelHud()`
liczy `need = expForLevel(level)` raz i używa go zarówno do tekstu, jak i do
szerokości paska — bez zmiany logiki `addExp()`/formuły progu z pkt 41.

### 43.2. Misje dzienne — dopisany opis, czego dotyczą

**Odkryto, że opis już istniał, tylko nie był wyświetlany:** każdy szablon w
`DAILY_TEMPLATES` ma od dawna parę kluczy i18n `daily_<key>_name` (chwytliwa
nazwa, np. "Sprint") **i** `daily_<key>_desc` (rzeczywisty opis celu, np.
"Przejedź {n} m w jednym biegu Trybu wolnego.") — ale `renderDailyWidget()`
renderował tylko `_name` + pasek postępu, nigdy `_desc`. Dopisano jedną linię
(`t(dm.key + '_desc', { n: dm.n })`) między nazwą a paskiem postępu, przez
**reużytą** klasę `.quest-desc` (ten sam styl co opisy w pełnym ekranie
Misji i w Booster Pickerze — zero nowego CSS). Dotyczy to samego widgetu na
menu głównym; ekran pełnych Misji (`renderMissions()`, pkt 37) już od dawna
pokazywał opisy poprawnie, więc tu nic nie zmieniano.

### 43.3. Skiny bossów — ukryte (❔ / "???") dopóki nie zdobyte

Analogicznie do mechanizmu ukrytych osiągnięć diamentowych (`hidden: true`,
pkt 39.1), ale zaaplikowane do zakładki "Bossy" w Sklepie zamiast do
Osiągnięć — **żaden nowy atrybut w `SKINS` nie był potrzebny**, warunek to
po prostu `skin.kind === 'boss' && !ownedSkins.has(skin.id)`, bo bossowe
skiny i tak już mają unikalny `kind`.

- **`renderShop()`** — gdy `isHiddenBoss`, `#shopSkinName` pokazuje `'???'`
  (reużyty klucz `achievement_hidden_name`, identyczny tekst we wszystkich
  10 językach — bez nowego klucza) zamiast prawdziwej nazwy skina.
  **Warunek odblokowania (`skin_locked_boss`, "Pokonaj bossa poziomu X")
  zostaje widoczny bez zmian** — to świadoma decyzja: gracz ma wiedzieć
  *jak* zdobyć nagrodę, tylko nie *jak wygląda*, zanim ją zdobędzie.
- **`drawShopPreview()`** — dla ukrytego bossowego skina canvas podglądu nie
  woła już `drawBallShape()` z prawdziwymi kolorami/wzorem, tylko rysuje
  prosty szary krążek (`rgba(255,255,255,0.06)`, obwódka `#2c3a5c` —
  literały hex zamiast zmiennych CSS, bo kontekst 2D canvasu nie odczytuje
  `var(--x)`, zgodnie z tym, jak reszta gry już to robi) z dużym `❔`
  pośrodku (`#7686ab`, ten sam odcień co `--muted`). Po zdobyciu skina
  wraca normalne, kolorowe renderowanie bez dodatkowej logiki.
- Przewijanie strzałkami ◀▶ w zakładce Bossy nadal pokazuje **kolejność**
  skinów (poziom bossa rośnie), tylko treść każdego nieodkrytego jest
  zasłonięta — nie ukryto samych pozycji z listy.

**Nie zostało zrobione / świadomie poza zakresem:**
- Analogiczne ukrywanie dla skinów typu `mission`/`crate` — user poprosił
  wyraźnie tylko o bossowe, nie rozszerzano na inne kategorie.
- Żadna zmiana w samym mechanizmie zdobywania skinów bossów
  (`syncBossSkinUnlocks`, pkt 16.2) — czysto wizualna zmiana w Sklepie.

**Weryfikacja w tej sesji:** `perl` — `game.js` (`{}` 1134/1134, `()`
3608/3608, `[]` 261/261), `i18n.js` (`{}` 491/491, `()` 85/85, `[]` 1/1).
Policzono wystąpienia `mainMenu_level_exp:` — dokładnie 10. Zbalansowanie
`<div>` w `index.html` przez `Grep` — 61/61 (+2 względem pkt 42, dokładnie
tyle, ile dodano: `.mm-level-top` i `#mmLevelExp`). Brak w środowisku
narzędzia do automatyzacji przeglądarki — gra otwarta przez `explorer.exe`
do ręcznego testu przez usera. **Do potwierdzenia:** (1) liczby EXP obok
napisu poziomu wyglądają dobrze i nie rozpychają panelu poza ekran; (2)
opisy misji dziennych czytelnie mieszczą się w wąskiej kolumnie
`.mm-topleft-col` (320px) bez psucia layoutu; (3) w zakładce Bossy w Sklepie
nieodkryte skiny faktycznie pokazują ❔/"???" zamiast prawdziwego wyglądu, a
zdobyty boss-skin odsłania się poprawnie po pokonaniu właściwego bossa.

---

## 44. Trzecie (ostatnie) osiągnięcie diamentowe — "Legenda" za 100. poziom gracza (2026-07-13, część 4)

**Kontekst:** pkt 39 zapowiadał trzecie, jeszcze nieustalone osiągnięcie
diamentowe/ukryte (10 brąz/10 srebro/7 złoto/2 diament → docelowo 30 z 3
diamentowymi). User dopiero teraz, po zbudowaniu systemu Poziomu gracza/EXP
(pkt 41–43), zdecydował, czym ono będzie: **osiągnięcie 100. poziomu
gracza** — **nie** mylić z istniejącym `all_levels` ("Mistrz gry"), które
dotyczy ukończenia wszystkich 100 poziomów *gry* (system z pkt 3.1). To dwa
zupełnie różne liczniki, które przypadkiem obie kończą się na "100": poziomy
gry (`progress[]`, ukończone plansze) vs. poziom gracza (`level`, z EXP
zbieranego wyłącznie ze skrzynek, pkt 42.1).

- **Nowy wpis w `ACHIEVEMENTS`**: `{ id: 'player_level_100', icon: '🌟',
  nameKey: 'ach_player_level_100_name', descKey: 'ach_player_level_100_desc',
  tier: 'diamond', hidden: true }`, dopisany zaraz po `all_levels` — **30.
  i ostatnie planowane osiągnięcie**, komplet: 10 brąz / 10 srebro / 7 złoto
  / **3 diament** (docelowa liczba z pkt 39 wreszcie osiągnięta).
- **Warunek w `checkAchievements()`**: `player_level_100: () => level >= 100`
  — najprostszy z możliwych, bo `level` to już gotowa zmienna z pkt 41.
- **Nazwa "Legenda"** (i odpowiedniki w pozostałych 9 językach) — inna niż
  "Mistrz gry" (`all_levels`), żeby w trophy case nie wyglądały jak duplikat
  mimo podobieństwa liczby "100" w opisie.
- **Naprawiona kolejna luka w stylu pkt 39.3:** `addExp()` (pkt 41) nigdy nie
  wołało `checkAchievements()`/`checkMissions()` — sensowne, dopóki nic nie
  zależało od `level`/`exp`, ale teraz, gdy jedno osiągnięcie faktycznie
  zależy od `level`, brak tego wywołania oznaczałby, że gracz mógłby minąć
  próg 100. poziomu (np. w trakcie jednego dużego dropu EXP ze skrzynki
  legendarnej) i osiągnięcie nigdy by się nie odblokowało bez ponownego
  wywołania `checkAchievements()` z zupełnie innego miejsca. Dodano oba
  wywołania na końcu `addExp()`, tym samym wzorcem co `addCoins`/`addDiamonds`.

**Nie zostało zrobione / świadomie poza zakresem:**
- Balans: przy jedynym obecnym źródle EXP (skrzynki, 25% szansy na 50–200
  EXP) i rosnących progach (`100 + (l-1)*25`), 100. poziom wymaga **bardzo**
  dużo skrzynek — to świadomie najtrudniejsze osiągnięcie w grze razem z
  pozostałymi dwoma diamentowymi, nieprzetestowane w realnej rozgrywce.
- Żadne inne osiągnięcie/misja nie zależy od `level`/`exp` — tylko to jedno.

**Weryfikacja w tej sesji:** `perl` — `game.js` (`{}` 1135/1135, `()`
3614/3614, `[]` 261/261), `i18n.js` (`{}` 491/491, `()` 85/85, `[]` 1/1).
Policzono `nameKey: 'ach_` **w całym pliku** (odpowiada wyłącznie wpisom w
`ACHIEVEMENTS`, bo tylko tam używany jest ten prefiks) — dokładnie **30**.
Policzono `tier: 'diamond'` — dokładnie **3**. Policzono
`ach_player_level_100_name:` w `i18n.js` — dokładnie 10 (raz na język). Brak
w środowisku narzędzia do automatyzacji przeglądarki — gra otwarta przez
`explorer.exe` do ręcznego testu przez usera. **Do potwierdzenia:** (1)
ekran Osiągnięć pokazuje teraz 30 kafelków z 3 ukrytymi diamentowymi na
końcu listy; (2) po ręcznym doprowadzeniu `level` do 100 (np. przez chwilową
edycję `scraper_level_v1`/`scraper_exp_v1` w DevTools, bo naturalne
dojście zajęłoby bardzo dużo grania) osiągnięcie "Legenda" faktycznie się
odblokowuje i odsłania prawdziwą ikonę/nazwę/opis.

---

## 45. Usunięcie "więcej opcji w przyszłości" + przycisk resetu całej gry (2026-07-13, część 5)

**Kontekst:** ekran Ustawień od początku projektu (pkt 5) miał podtytuł
"Więcej opcji pojawi się w przyszłości" — nieaktualny od dawna (ekran ma już
głośność + język, i teraz dochodzi trzecia, ważniejsza opcja). User poprosił
o usunięcie tego napisu i dodanie przycisku **pełnego resetu gry** —
wszystko: rekord, misje, osiągnięcia, poziomy gry, poziom gracza, skiny,
waluta (monety+diamenty), itd.

### 45.1. Usunięcie podtytułu

Usunięto `<p id="settingsSubtitle">` z `index.html`, powiązaną linię w
`applyStaticTranslations()` (`game.js`) oraz **sam klucz i18n
`settings_subtitle` w całości, ze wszystkich 10 języków** — nie zostawiono
martwego, niewywoływanego klucza w `I18N`.

### 45.2. `resetGame()` — pełny wipe, nie ręczne zerowanie ~20 zmiennych

**Kluczowa decyzja projektowa:** zamiast ręcznie zerować każdą zmienną stanu
w pamięci (coins, diamonds, level, exp, bestFree, progress[], ownedSkins,
equippedSkinId, unlockedAchievements, completedMissions, dailyMeta,
challengeMeta, boosterInventory, abilityInventory i ~8 liczników
życiowych — patrz tabela w pkt 7, teraz 26 kluczy) i ręcznie przewołując
każdą funkcję renderującą każdy ekran, `resetGame()`:

1. Zbiera **wszystkie** klucze `localStorage` zaczynające się od prefiksu
   `'scraper_'` (zamiast hardkodować listę 26 nazw, która musiałaby być
   ręcznie aktualizowana przy każdej przyszłej funkcji dodającej nowy klucz
   — sprawdzono grepem, że **każdy** zapis w tej grze konsekwentnie używa
   tego prefiksu, więc iterowanie po nim jest bezpieczne i kompletne).
2. Usuwa je wszystkie (`localStorage.removeItem`).
3. Wywołuje `location.reload()`.

Przeładowanie strony jest tu celowe, nie "leniwe" — każda z ~15 funkcji
`load*()` w tym pliku już wie, jak wyprodukować poprawny domyślny stan przy
pustym `localStorage` (to działa od pierwszego uruchomienia gry), więc reload
gwarantuje dokładnie taki sam, w pełni spójny stan "świeżej instalacji", jaki
widziałby zupełnie nowy gracz — bez ryzyka pominięcia jednej z wielu
zmiennych/ekranów przy ręcznym resecie w locie (dokładnie ta klasa błędu,
którą pkt 39.3/44 już raz złapały przy `checkAchievements()`).

### 45.3. UI

- **Nowy przycisk `#btnResetGame`** w Ustawieniach, między suwakiem
  języka a "Powrót do menu". Nowy wariant `.menu-btn.danger` w `style.css`
  (czerwony akcent `--boss`, ten sam wzorzec `--tab`/hover co
  `.primary`/`.secondary`) — pierwszy czerwony przycisk menu w grze, żeby
  wizualnie odróżniał się jako destrukcyjny.
- **Potwierdzenie przez natywny `confirm()`** (klucz i18n `reset_confirm`,
  wymienia wprost co zostanie utracone) — reset **nie** wykonuje się od razu
  po kliknięciu, dopiero po akceptacji w oknie przeglądarki. Brak custom
  modala celowy — to jednorazowa, rzadka akcja, natywny `confirm()`
  wystarcza i nie wymaga nowego ekranu/overlayu.
- Nowe klucze i18n `btn_reset_game` i `reset_confirm` dodane do
  **wszystkich 10 języków**.

**Nie zostało zrobione / świadomie poza zakresem:**
- Częściowy reset (np. "tylko waluta" albo "zachowaj osiągnięcia") — user
  poprosił wyraźnie o reset **wszystkiego**, nie budowano granularności.
- Eksport/backup postępu przed resetem — nie proszono o to.

**Weryfikacja w tej sesji:** `perl` — `game.js` (`{}` 1140/1140, `()`
3635/3635, `[]` 262/262), `i18n.js` (`{}` 491/491, `()` 93/93, `[]` 1/1).
Policzono `settings_subtitle` w `i18n.js` — **0** (całkowicie usunięty, nie
tylko z HTML). Policzono `btn_reset_game:`/`reset_confirm:` — po 10 (raz na
język). Zbalansowanie `<div>` w `index.html` — 61/61 (bez zmian: usunięto
`<p>`, dodano `<button>`, żaden `<div>` nie ruszony). Brak w środowisku
narzędzia do automatyzacji przeglądarki — gra otwarta przez `explorer.exe`
do ręcznego testu przez usera. **Do potwierdzenia:** (1) ekran Ustawień nie
ma już starego podtytułu i wygląda dobrze z nowym czerwonym przyciskiem;
(2) kliknięcie "Resetuj grę" pokazuje natywne okno potwierdzenia, anulowanie
niczego nie zmienia; (3) po potwierdzeniu strona się przeładowuje i **cały**
postęp wraca do stanu początkowego (poziom 1, 0 monet/diamentów/EXP, brak
odblokowanych poziomów poza pierwszym, pusta lista osiągnięć/misji, domyślny
skin) — warto sprawdzić DevTools → Application → Local Storage, że po
resecie nie zostaje ani jeden klucz `scraper_*`.

---

## 46. Podsumowanie sesji 2026-07-13 (pkt 41–45) — mapa dla kolejnej sesji

**Cała ta sesja (jak każda ostatnio) nie została ani razu otwarta w
przeglądarce przez model** — brak narzędzia do automatyzacji w tym
środowisku, więc gra była po każdej zmianie otwierana przez `explorer.exe`
do ręcznego testu przez **usera**, weryfikacja modela była wyłącznie
statyczna (bilans nawiasów `perl`, bilans `<div>`, liczenie wystąpień
kluczy i18n/id-ków). **To pierwsza sesja, w której user faktycznie
potwierdził na bieżąco, że dotychczasowy stan gry działa** (patrz jego
komentarz na starcie: "staram się wszystko weryfikować... narazie chyba
wszystko jest dobrze") — ale zmiany z **tej konkretnej** sesji (41–45)
wciąż czekają na jego potwierdzenie w przeglądarce.

### 46.1. Co zrobiono w tej sesji (skrót, szczegóły w 41–45)

1. **Pkt 41** — zalążek systemu **Poziomu gracza / EXP**: pasek + etykieta
   "Poziom {n}" na menu głównym (nad rekordem, rekord przesunięty niżej),
   zielony akcent (`--level`), zapis `scraper_level_v1`/`scraper_exp_v1`.
   Na tym etapie **bez żadnego źródła EXP** — czysto wizualny szkielet.
2. **Pkt 42** — **przebudowa dropów ze skrzynek** + **skrzynki jako
   pierwsze i jedyne źródło EXP**: nowy rozkład 20% podwajacz / 20%
   umiejętność / 25% EXP (50–200) / 25% diamenty (1–3, ujednolicone dla
   wszystkich 3 rzadkości) / 10% skin (**tylko** te ze skrzynek, już nie
   monetowe). Nowa funkcja `addExp()` z obsługą wielokrotnego level-upu
   naraz.
3. **Pkt 43** — trzy drobne poprawki: (a) licznik "{cur}/{need} EXP" obok
   napisu poziomu; (b) **odkryto i naprawiono**, że opisy misji dziennych
   (`_desc`) istniały w i18n od dawna, ale nie były renderowane na menu
   głównym — teraz są; (c) skiny bossów w Sklepie **ukryte** (❔/"???")
   dopóki nie zdobyte, na wzór ukrytych osiągnięć diamentowych.
4. **Pkt 44** — **trzecie i ostatnie planowane osiągnięcie diamentowe**:
   "Legenda" (`player_level_100`, `level >= 100`) — **Osiągnięcia: 29 → 30**
   (10 brąz/10 srebro/7 złoto/**3 diament**, komplet zapowiadany od pkt 39).
   Naprawiono kolejną lukę w stylu pkt 39.3: `addExp()` nie wołało
   `checkAchievements()`/`checkMissions()`.
5. **Pkt 45** — usunięto nieaktualny podtytuł Ustawień ("więcej opcji w
   przyszłości", **klucz i18n też usunięty, nie tylko HTML**) i dodano
   **przycisk pełnego resetu gry** (`resetGame()`) — czyści **wszystkie**
   klucze `localStorage` z prefiksem `scraper_` (26 kluczy, patrz
   zaktualizowana tabela w pkt 7) + `location.reload()`, z natywnym
   `confirm()` jako zabezpieczeniem. **Nowa zasada projektowa: każdy
   przyszły trwały klucz MUSI mieć prefiks `scraper_`**, inaczej reset go
   nie wyczyści.

### 46.2. Najpilniejsze do przetestowania na start kolejnej sesji

1. **Panel poziomu na menu głównym** — czy "Poziom 1" + "0 / 100 EXP" +
   pusty zielony pasek wyglądają dobrze nad rekordem, bez nachodzenia na
   `.mm-topleft-col` (Misje dzienne / Wyzwanie dnia) przy różnych
   szerokościach okna.
2. **Otwarcie kilku skrzynek każdego typu** — czy rozkład 20/20/25/25/10%
   wygląda sensownie "z ręki", czy trafienie EXP faktycznie podnosi pasek
   poziomu (i potrafi przeskoczyć od razu więcej niż 1 poziom przy dużym
   dropie), czy w zakładce Monety/Bossy nic się nie posypało.
3. **Opisy misji dziennych** — czy nowa linia `.quest-desc` mieści się
   czytelnie w wąskiej (320px) kolumnie menu głównego bez łamania layoutu.
4. **Zakładka Bossy w Sklepie** — czy nieodkryte skiny faktycznie pokazują
   ❔/"???" i szary krążek zamiast prawdziwego wyglądu, a zdobyty boss-skin
   odsłania się poprawnie.
5. **Przycisk "Resetuj grę"** — czy potwierdzenie/anulowanie działa, i czy
   po reset faktycznie **wszystko** wraca do zera (najlepiej sprawdzić
   DevTools → Local Storage, że nie zostaje ani jeden klucz `scraper_*`).
   To jedyna zmiana z tej sesji, którą warto przetestować **ostrożnie**
   (na koniec, po sprawdzeniu reszty) — bo w razie błędu w logice czyszczy
   realny, zebrany przez sesje postęp bez możliwości cofnięcia.
6. **Osiągnięcie "Legenda"** (`player_level_100`) — realnie nieosiągalne
   bez wielogodzinnego farmienia skrzynek; do sprawdzenia raczej przez
   chwilową ręczną edycję `scraper_level_v1` w DevTools niż naturalną grą.

### 46.3. Stan projektu na wyjściu z sesji

- **Osiągnięcia: 30** (10 brąz/10 srebro/7 złoto/3 diament-ukryte —
  **komplet, nic więcej nie jest zapowiedziane** w przeciwieństwie do
  poprzednich sesji, gdzie zawsze było "trzecie diamentowe później").
- **Misje: 50, Skiny: 80** — bez zmian w tej sesji (patrz pkt 40.3).
- **`localStorage`: 26 kluczy** (było 24 od pkt 40), tabela w pkt 7
  odświeżona. **Nowa twarda zasada:** wszystko musi trzymać prefiks
  `scraper_`, bo od tej sesji od tego zależy poprawność `resetGame()`.
- **Nowy system meta-progresji (Poziom gracza/EXP)** ma na razie **jedno**
  źródło EXP (skrzynki) i **zero** odblokowań nim sterowanych — user
  zapowiedział wcześniej (pkt 41), że poziom ma docelowo odblokowywać
  przyciski Misje/Skrzynki/Wyzwanie dnia na menu głównym, ale **to wciąż
  nie zostało zrobione** — jeśli user o tym nie wspomni na starcie
  kolejnej sesji, warto samemu zapytać, czy to następny krok.
- **Balans wszystkiego dobrany "na oko"** (formuła EXP `100+(l-1)*25`,
  rozkład dropów skrzynek 20/20/25/25/10%, zakres EXP 50–200) —
  nieprzetestowany w realnej, dłuższej rozgrywce, jak cały pozostały
  balans projektu (powtarzające się zastrzeżenie od pkt 10.5).

---

## 47. Ekran końcowy: dystans/monety/EXP/rekord + EXP za sam bieg (2026-08-14)

**Kontekst:** pierwsza sesja po miesięcznej przerwie (poprzednia: 2026-07-13,
pkt 41–46). User poprosił o ekran końcowy pokazujący ile zarobiono monet, ile
EXP, jaki dystans osiągnięto i jaki jest rekord — z napisem "Twój nowy
rekord!", gdy zostanie pobity.

- **Odkrycie przy analizie:** ekran końcowy (`#overlay`) już pokazywał monety
  (`overCoinsEl`) i, w Trybie wolnym, dystans + rekord wewnątrz zdania
  (`overlay_freeplay_text`) oraz zmieniał tytuł na "Nowy rekord!" przy
  pobiciu rekordu. Realnie brakowało: (a) EXP nigdzie na ekranie końcowym —
  bo EXP w ogóle nie było przyznawane za bieg, tylko za skrzynki (pkt 42);
  (b) dystansu na ekranie **wygranej** w Poziomach (`overlay_win_text` go nie
  zawierał); (c) dosłownego "Twój" w tytule rekordu.
- **Nowe źródło EXP — sam bieg**, obok skrzynek: nowa stała
  `EXP_METERS_PER_EXP = 30` i funkcja `expForDistance(d)` (analogiczna do
  `coinsForDistance`). Przyznawane w `finishRun()` (tryby `single`/
  `freeplay`) i `winLevel()` — **świadomie NIE** w `coop`/`versus`/
  `challenge`, spójnie z tym, że te tryby i tak nie płacą monet za dystans
  (uniknięcie nowej furtki do farmienia w multiplayerze).
- Nowy element `#overExp` (kolor `--level`, zielony) na ekranie końcowym,
  wypełniany `overlay_exp_earned` gdy `expEarned > 0`.
- `overlay_win_text` rozszerzony o `{distance}` (dotąd zawierał tylko numer
  poziomu).
- `overlay_freeplay_record_title`: `'Nowy rekord!'` → `'Twój nowy rekord!'`
  (i odpowiedniki we wszystkich 10 językach) — reszta mechaniki rekordu
  (`isNewRecord`, `bestFree`) bez zmian, świadomie ograniczona wyłącznie do
  Trybu wolnego (jedyny tryb z realnym pojęciem "rekordu dystansu" w tym
  kodzie — user to potwierdził wprost, pytany o zakres).
- Wszystko przetłumaczone w **10 językach** (nowy klucz `overlay_exp_earned`,
  edytowane `overlay_win_text` i `overlay_freeplay_record_title`).

**Later fix (pkt 49):** odkryto, że EXP z `winLevel()` nie respektowało
zasady "brak monet za powtórkę już ukończonego poziomu" — naprawione tam.

---

## 48. Odblokowywanie funkcji poziomem gracza (2026-08-14, część 2)

**Kontekst:** zapowiedziane od pkt 41, wreszcie zrobione. User podał własne
progi wprost (dopytany, bo poprzednio "nic nie zostało ustalone"): Sklep
**od razu**, Misje dzienne **od razu**, Misje **5**, Skrzynki **10**, Tryb
wolny **10**, Kooperacja + Rywalizacja **15**, Wyzwanie dnia **15**, Poziomy
zawsze dostępne. Po pierwszej implementacji user douściślił: Sklep jednak od
poziomu **2**, nie od razu.

- Nowa stała `FEATURE_UNLOCK_LEVELS = { shop:2, missions:5, crates:10,
  freeplay:10, multiplayer:15, challenge:15 }` — jedyne źródło prawdy dla
  progów, reużyte we wszystkich miejscach poniżej.
- `lockButtonLabel()` + `updateFeatureLocks()` — blokuje/odblokowuje
  `btnShop`/`btnMissions`/`btnCrates`/`btnChallenge`: gdy zablokowane,
  przycisk dostaje `disabled`, prefiks `🔒` w etykiecie i `title` z tekstem
  "Odblokowane na poziomie {n}" (`mainMenu_locked_level`, nowy klucz i18n).
  Wołane z `updateLevelHud()` (żywe odświeżanie przy level-upie) i na końcu
  `applyStaticTranslations()` (musi być **ostatnie** w tej funkcji, bo
  wcześniejsze linie tam bezwarunkowo ustawiają zwykłą, odblokowaną etykietę).
- Karuzela trybu przy przycisku GRAJ (`MENU_MODE_OPTIONS`) rozszerzona o pole
  `unlockLevel` per tryb (`freeplay`→10, `coop`/`versus`→`multiplayer`=15).
  `renderMenuMode()` blokuje `btnPlay` i pokazuje `🔒` w etykiecie trybu, gdy
  aktualnie wybrany (strzałkami) tryb jest zablokowany — strzałki same
  celowo **nie** są blokowane, można przeglądać zablokowane tryby.
- Nowy panel **w Ustawieniach** (`#unlocksList`, reużywa stylu `.quest-row` z
  ekranu Misji — zero nowego CSS) z pełną listą **wszystkich** funkcji i ich
  progów (łącznie z "zawsze dostępnymi" Poziomami/Misjami dziennymi, dla
  kompletności), status ✅/🔒 aktualizowany na żywo (`FEATURE_INFO` +
  `renderUnlocksList()`).
- **Weryfikacja:** wyłącznie statyczna (bilans `{}`/`()` w `perl`/`grep`,
  brak automatyzacji przeglądarki w tym środowisku, jak w każdej
  poprzedniej sesji) — user testował ręcznie na bieżąco w przeglądarce
  otwieranej przez `Start-Process`.

---

## 49. Samouczek — 5-krokowy, blokujący modal z efektem maszyny do pisania (2026-08-14, część 3)

**Kontekst:** wymagania doprecyzowywane w kilku kolejnych turach tej samej
sesji — pierwsza wersja (3 kroki: poziom 2 → kup+załóż skin → zrób misję
dzienną, cichy widget w rogu menu) została przez usera przeprojektowana na
docelowy kształt poniżej.

**Finalny kształt — 5 kroków** (stałe `TUTORIAL_DONE_STEP=5`,
`TUTORIAL_LAST_STEP=4`, `tutorialStep` 0–4 aktywne, 5 = zakończony):

0. Zagraj w Poziomy do **2. poziomu gracza** — bez klikalnego celu, samo tło.
1. **Kliknij Sklep, kup skin i załóż go** — spotlight na `btnShop`, reszta
   menu głównego zablokowana.
2. **Kliknij Osiągnięcia 🏆** — spotlight na `btnAchievements`.
3. **Wykonaj jedną z dzisiejszych misji dziennych** — spotlight na
   `btnLevels` (jedyny sensowny "wstęp" do realnej rozgrywki) + osobne,
   pulsujące podświetlenie panelu `#mmDaily` (nie ma tam przycisku do
   kliknięcia, więc tylko highlight, bez blokady/odblokowania).
4. **Komunikat końcowy** (bez celu) — informuje, że reszta funkcji
   (Skrzynki/Misje/Multiplayer/Wyzwanie dnia) odblokuje się z poziomem,
   pełna lista w Ustawieniach (patrz pkt 48). OK kończy samouczek **na
   stałe** — nic więcej się już nie pojawia.

**Mechanika modala** (`#tutorialModal`, zagnieżdżony **wewnątrz**
`#mainMenu`, żeby dziedziczyć jego `position:fixed; inset:0` pełnoekranowy
układ współrzędnych z pkt 22 — inaczej niż 480×600 `.stage` używany przez
overlaye w grze):
- Przyciemnia i blokuje kliknięcia w **całe** menu, dopóki nie klikniesz
  **OK** (`tutorial-modal.show`, tło `rgba(5,7,12,0.82)` + blur). Box
  pozycjonowany wysoko (`padding-top:112px`), nie na środku — czyta się jako
  "między logiem a panelem poziomu/rekordu", zgodnie z życzeniem usera.
- **"Pomiń samouczek"** — zawsze dostępny obok OK, z natywnym `confirm()`,
  na życzenie usera zamieniony miejscami z OK (Pomiń teraz po **lewej**, OK
  po **prawej**).
- **Efekt maszyny do pisania:** `typewriterReveal()` odsłania tekst po
  jednym znaku co 26 ms, z cichym, losowo-wysokim dźwiękiem `playTypeTick()`
  (nowa funkcja audio — krótsza i cichsza wersja `playClick()`, żeby się nie
  nakładała przy szybkim odtwarzaniu). **Iteruje po `Array.from(text)`, nie
  po `text[i]`** — ten drugi dzieli parę surogatów (np. emoji 🏆 w kroku 2)
  na dwie połówki i jedna migałaby przez 26 ms jako zepsuty znak.
- **Spotlight** (`applyTutorialSpotlight()`/`clearTutorialSpotlight()`/
  `syncTutorialSpotlight()`): force-disable **wszystkich** interaktywnych
  przycisków menu głównego (`MAIN_MENU_INTERACTIVE_IDS`, 11 elementów) poza
  celem aktualnego kroku, który dostaje pulsujący turkusowy pierścień
  (`.tutorial-spotlight` + `@keyframes tutorialPulse`, nowe w `style.css`,
  plus nowe reguły `:disabled` dla `.mm-icon-btn`/`.mm-exit-btn`/`.mm-arrow`,
  które wcześniej nie miały żadnego stylu na zablokowany stan).
  `clearTutorialSpotlight()` re-enable'uje wszystko, po czym woła
  `updateFeatureLocks()` — bo force-disable ze spotlightu i disable z
  poziomowej blokady (pkt 48) są nierozróżnialne na samym DOM.
- **Trwały zapis:** `scraper_tutorial_v1` (numer aktywnego kroku) +
  `scraper_tutorial_ack_v1` (ostatni krok, dla którego kliknięto OK —
  **osobno** od samego kroku, żeby modal sam wracał po awansie kroku bez
  specjalnej logiki "czy to nowy krok").

**Trzy bugi znalezione i naprawione w tej samej sesji** (dwa zgłoszone przez
usera na żywo, jeden wyłapany w końcowym przeglądzie na jego prośbę):
1. **Utknięcie na kroku 3** — jeśli gracz miał już ukończone wszystkie
   dzisiejsze misje dzienne *zanim* dotarł do kroku 3 (np. przy grindzie do
   poziomu 2), zdarzenie "właśnie ukończono nową misję" nigdy by nie
   nadeszło → spotlight blokował Ustawienia/reset na zawsze. `renderTutorial()`
   teraz sprawdza `dailyMeta.completed.length > 0` wprost przy wejściu na
   krok 3 i przeskakuje dalej automatycznie.
2. **Dźwięk pisania "w tle"** — modal (i jego dźwięk) próbował się odpalić,
   nawet gdy `#mainMenu` było ukryte (level-up w trakcie biegu, zakup w
   Sklepie) — bo modal żyje wewnątrz `#mainMenu`, więc jest fizycznie
   niewidoczny, ale `renderTutorial()` i tak leciał przez `updateLevelHud()`.
   Naprawione: `showTutorialModal()` odpala się tylko, gdy
   `mainMenu.classList.contains('show')`; `showScreen()` woła
   `renderTutorial()` za każdym powrotem na menu główne (jedna zmiana
   pokrywa 15+ miejsc w kodzie, które tam prowadzą).
3. **Farmienie EXP powtórkami poziomu** — w `winLevel()` monety za powtórne
   ukończenie już zdobytego poziomu są zerowane (`alreadyCompleted`), ale
   EXP (dodane w pkt 47) nie miało tej samej blokady — dało się nieskończenie
   grindować EXP powtarzaniem tego samego poziomu. Teraz
   `expEarned = alreadyCompleted ? 0 : expForDistance(distance)`.

Przy okazji odświeżono też dwa nieaktualne komentarze w kodzie (opisywały
starą, 3-krokową wersję samouczka) i komentarz przy `loadDiamonds()`
(mówił "no shop item spends them yet", mimo że legendarna skrzynia od dawna
kosztuje diamenty — patrz pkt 26/31).

---

## 50. Reset gry zachowuje dzisiejsze misje dzienne (2026-08-14, część 4)

**Kontekst:** user chciał, żeby "Resetuj grę" (pkt 45) **nie losowało** na
nowo dzisiejszych 3 misji dziennych — mają zostać te same, tylko ich
postęp/status wraca do zera. Efekt: misja ukończona przed resetem staje się
znowu możliwa do zrobienia na świeżym koncie, zamiast czekać na jutrzejsze
losowanie.

- `resetGame()` — jedyny świadomy wyjątek od reguły "wyczyść wszystko z
  prefiksem `scraper_`" (pkt 45): przed pętlą czyszczącą odczytuje
  `scraper_dailymeta_v1`, zapamiętuje `date` + `pickedIds`, po wyczyszczeniu
  zapisuje je z powrotem z `completed: []` i świeżym `freshDailyStats()`.
  Jeśli klucz nie istniał/był uszkodzony — po prostu nic nie zapisuje z
  powrotem (dzień i tak wygeneruje się na nowo przy starcie przez
  `ensureDailyFresh()`), więc brak ryzyka błędu blokującego reset.

---

## 51. Podsumowanie sesji 2026-08-14 (pkt 47–50) — mapa dla kolejnej sesji

**Cała sesja zweryfikowana wyłącznie statycznie** (bilans `{}`/`()`/`<div>`
przez `grep`/`bash` po każdej większej zmianie — `perl`/`python3` w tym
środowisku dalej niedostępne, `node` też się nie znalazł na `PATH`) +
ręczne testy usera na bieżąco w przeglądarce otwieranej przez
`PowerShell Start-Process`. Trzy realne błędy z tej sesji (opisane w pkt 49)
zostały złapane właśnie dzięki temu, że user faktycznie klikał w
przeglądarce między turami, a nie tylko na końcu.

### 51.1. Co zrobiono (skrót, szczegóły w 47–50)

1. Ekran końcowy: dystans/monety/EXP/rekord + nowe źródło EXP (sam bieg, nie
   tylko skrzynki) w Poziomach i Trybie wolnym.
2. Odblokowywanie poziomem: Sklep 2, Misje 5, Skrzynki 10, Tryb wolny 10,
   Multiplayer 15, Wyzwanie dnia 15 — blokada przycisków + nowa lista
   referencyjna w Ustawieniach.
3. Samouczek: 5 kroków, blokujący modal z typewriter-efektem + dźwiękiem,
   spotlight wymuszający klikanie tylko właściwego przycisku, przycisk
   Pomiń z potwierdzeniem, plus trzy naprawione buggi (utykanie na misjach
   dziennych, dźwięk grający poza ekranem, farmienie EXP powtórkami).
4. Reset gry: dzisiejsze misje dzienne przetrwają reset (tylko postęp
   wraca do zera).

### 51.2. Najpilniejsze do przetestowania na start kolejnej sesji

1. **Cała ścieżka samouczka od zera** (przez reset gry) — czy 5 kroków
   następuje po sobie płynnie, czy spotlight faktycznie blokuje resztę menu
   na każdym kroku, czy pulsująca poświata jest czytelna, czy krok 4
   (podświetlenie `#mmDaily`) wygląda dobrze na węższych oknach (panel i tak
   znika całkowicie pod 1000px szerokości — to ograniczenie sprzed tej
   sesji, nie regresja).
2. **Ekran końcowy w każdym trybie** — zwłaszcza czy zdanie z dystansem w
   `overlay_win_text` (Poziomy, wygrana) dobrze się czyta po polsku i w
   pozostałych 9 językach.
3. **Reset gry + misje dzienne** — sprawdzić w DevTools → Local Storage, że
   po reset `scraper_dailymeta_v1.pickedIds`/`date` zostają, a
   `completed`/`stats` wracają do zera.
4. **Odblokowywanie poziomem na żywo** — czy przyciski faktycznie się
   odblokowują w locie przy level-upie (bez przeładowania strony), czy
   tooltip z wymaganym poziomem pokazuje się poprawnie.

### 51.3. Stan projektu na wyjściu z sesji

- **EXP ma teraz dwa źródła:** skrzynki (pkt 42, większe porcje 50–200) i
  sam bieg w Poziomach/Trybie wolnym (ta sesja, `EXP_METERS_PER_EXP=30`) —
  oba respektują zasadę "brak farmienia" tam, gdzie dotyczy to też monet.
- **System odblokowań poziomem (zapowiadany od pkt 41) jest wreszcie
  zrobiony** — nic więcej z tamtej zapowiedzi nie zostało w zawieszeniu.
- **Samouczek jest kompletny i zamyka się na stałe** po ostatnim kroku —
  nie odpala się ponownie dla żadnej z 30 osiągnięć/50 misji/80 skinów, jak
  chciał user.
- **Balans wszystkiego nadal "na oko"** — formuła EXP z pkt 41, próg
  `EXP_METERS_PER_EXP=30`, progi odblokowań (2/5/10/10/15/15) — żadne z
  tego nie było testowane w dłuższej, realnej rozgrywce (to samo
  powtarzające się zastrzeżenie od pkt 10.5). User świadomie zostawił to na
  osobną, przyszłą sesję poświęconą wyłącznie balansowi.
- **Diamenty** — przy okazji pytania usera potwierdzone, że jedynym ich
  sinkiem wciąż jest skrzynia legendarna (10 diamentów) — bez zmian w tej
  sesji, tylko doprecyzowany nieaktualny komentarz w kodzie.

---

## 52. Gra działa online (GitHub + Netlify) + skrót na pulpicie (2026-08-14, część 5)

Gra jest teraz faktycznie hostowana jako publiczna strona (nie tylko PWA
z lokalnego pliku, patrz zastrzeżenie w pkt 9).

- **GitHub:** repo `https://github.com/scraper-games/Scraper` (publiczne,
  konto/org `scraper-games`). Commity idą pod username `scraper-games` z
  prywatnym mailem `scraper-games@users.noreply.github.com` — celowo, żeby
  nie ujawniać prawdziwego maila usera w publicznej historii commitów.
- **Netlify:** podpięty pod to repo (dostęp tylko do repo `Scraper`, nie do
  wszystkich repo usera). Auto-deploy **tylko** z brancha `main`.
- **Live URL: `https://scraper-game.netlify.app`** (uwaga: NIE
  `scraper.netlify.app` — ten adres nie działa, to była pomyłka nazwy przy
  konfiguracji).
- **Workflow branchy:** codzienna praca (commity, push) dzieje się na
  branchu `dev` — to nie wpływa na stronę live. Merge `dev` → `main` (i push
  `main`) tylko wtedy, gdy user wprost mówi, że chce opublikować/wypuścić
  aktualizację (np. "publikujemy", "wypuszczamy aktualizację"). Dzięki temu
  może się uzbierać tydzień pracy na `dev`, zanim trafi live w jednym
  wydaniu.
- **Skrót na pulpicie:** plik `Gra Kulka.url` w
  `C:\Users\szymo\OneDrive\Pulpit` (obok innych skrótów do gier), wskazuje
  na `https://scraper-game.netlify.app`. Otwiera stronę w domyślnej
  przeglądarce — wymaga internetu, to nie jest lokalna/offline kopia gry.

**Do zrobienia w kolejnej sesji, jeśli user zechce:** przetestować cały
przepływ publikacji end-to-end (commit na `dev` → merge do `main` → push →
sprawdzić, że `scraper-game.netlify.app` faktycznie się zaktualizował).

---

## 53. Etykieta "Alpha" + start motywu wizualnego "Kosmos" (2026-08-15/16)

### 53.1. Etykieta "Alpha" na ekranie głównym

Pod napisem "Scraper" na głównym menu (`#mmTitle`, `index.html`) dodany
mały, osobny napis "Alpha" (`.mm-alpha-badge` w `style.css`) — user chciał
jasno zaznaczyć, że gra jest we wczesnej fazie. Istniejąca niebieska
zanikająca kreska pod tytułem (`.mm-title::after`) została nietknięta,
Alpha siedzi kawałek niżej pod nią. Kolumna menu (`.mm-topleft-col`)
przesunięta o 14px w dół, żeby zrobić na to miejsce. **To jedyna zmiana z
tej sesji, która trafiła na `main` (opublikowana na żywo)** — reszta
poniżej zostaje na razie tylko na `dev`/lokalnie, patrz 53.3.

### 53.2. Zamrożone snapshoty gry na pulpicie

Poza samym `Scraper.url` (zawsze wskazuje na aktualną wersję live) user
chce też mieć możliwość wrócenia do tego, jak gra wyglądała na danym etapie.
Mechanizm: zwykła kopia plików gry (poza repo git) w datowanym folderze na
pulpicie + skrót `.lnk` do niej. Pierwszy taki snapshot: folder
`Scraper-Alpha-2026-08-15` (obecnie **wewnątrz** folderu `Gra Kulka`, z
regułą `Scraper-Alpha-*/` w nowo dodanym `.gitignore`, żeby git go
całkowicie ignorował) + skrót `Scraper-Alpha.lnk` na pulpicie wskazujący na
jego `index.html`. Wzorem starszego `Scraper-Prototyp.lnk` → `unik (4).html`.

Przy okazji: `icon.png` — ikona gry (ta sama, która jest generowana w locie
w `game.js` jako SVG dla PWA/manifestu, patrz pkt 9) wyeksportowana też jako
zwykły plik PNG 512×512 w folderze gry, żeby user miał ją pod ręką jako
osobny plik graficzny.

### 53.3. Motyw wizualny "Kosmos" — w toku, NIEOPUBLIKOWANY

User uznał, że gra "wygląda jak arcade z lat 80" i chciał nadać jej
wyraźny kierunek artystyczny. Po dyskusji (patrz też plan w
`C:\Users\szymo\.claude\plans\snappy-watching-pillow.md`) odrzucone zostały:
cyberpunkowa neonowa alejka (zaimplementowana próbnie, user się rozmyślił,
cofnięte przez `git checkout -- game.js style.css` zanim cokolwiek trafiło
do commita) i "droga z góry" (odrzucona, bo wymagałaby zmiany piłki gracza
na samochód, co zepsułoby ~40 wykupionych skórek w sklepie). Finalny
kierunek: **kosmos** — bo pionowy canvas (480×600) naturalnie pasuje do
"lotu w dół/przed siebie", a piłka jako sonda/orb nie wymaga naciąganej
fabuły.

**Stan na koniec sesji: zaimplementowane i widoczne w grze, ale świadomie
NIE zacommitowane do gita (user chciał zostawić to na razie tylko lokalnie,
nie publikować graczom)** — `game.js`/`style.css` mają niezapisane zmiany
w working tree na branchu `dev`.

Co zostało zrobione (`drawSpaceBackground()` w `game.js`, wołane z `draw()`
i z `drawMenuIdlePreview()`, więc działa też jako tło menu głównego):
- **Mgławice** — 3 miękkie, pulsujące plamy gradientu w tle.
- **Asteroidy** — ~18 małych, stonowanych brył, bez blasku (żeby się nie
  mylić z przeszkodami).
- **Planety** — do 2 naraz na ekranie, 5 palet kolorów, każda losowo:
  pierścień (tak/nie — **poprawnie chowa się za planetą**, rysowany w dwóch
  połówkach: dalsza przed kulą, bliższa po), i wygląd powierzchni: kratery
  (ciemne plamy, bez jasnych) / pasy (jak u gazowego olbrzyma) / gładka —
  kratery i pasy generowane z odrzuceniem kolizji (rejection sampling), żeby
  się nie nakładały, i skierowane w stronę widocznej części planety (bo
  planeta wystaje tylko kawałkiem zza krawędzi canvasu).
- **Komety/meteoryty** — losowe przeloty po przekątnej, ~30% to duże,
  świecące bryły z grubszym ogonem; ~35% przelotów to "rój" 3-5 sztuk naraz.
  Usuwane dopiero jak faktycznie wylecą poza canvas (wcześniej znikały na
  sztywnym timerze, czasem w środku ekranu — poprawione).
- **Satelity** — sztuczne obiekty z panelami słonecznymi (2 lub 4, losowo)
  i migającym czerwonym światłem, 3 kategorie rozmiaru.
- **Rakiety** — przelatują ukośnie przez ekran, 3 różne modele (klasyczna
  biało-czerwona, "myśliwiec" szaro-cyjanowy, wahadłowiec delta-wing
  brązowy) w 3 rozmiarach, z migającym płomieniem silnika.

Wspólna paleta kolorów w `SPACE_COLORS` (`game.js`, obok `TYPE_COLORS`) +
odpowiadające zmienne w `:root` (`style.css`) pod przyszłe przestrojenie
HUD/menu.

**Świadomie pominięte/odłożone (patrz plan w `.claude/plans`):**
- Faza 2 planu (przemalowanie przeszkód) — uznana za zbędną: istniejące
  przeszkody (gradient + `shadowBlur`) już dobrze pasują do kosmosu, nie
  zmieniano `TYPE_COLORS`.
- Faza 3 (domyślna piłka jako "sonda") i Faza 4 (HUD/menu pod paletę
  kosmosu) — jeszcze nie zrobione.
- Dźwięk/muzyka pod klimat kosmosu — świadomie poza zakresem, osobna sesja.

**Do zrobienia w kolejnej sesji:** dokończyć Fazę 3/4 z planu (jeśli user
zechce), i **zdecydować czy/kiedy zacommitować `game.js`/`style.css` na
`dev`** — na koniec tej sesji zmiany istnieją tylko w working tree, nie w
historii gita.

---

## 54. GUI "na nowocześniej", profil gracza, konsola deweloperska,
    przebalansowanie misji dziennych (2026-08-16)

Kontynuacja poprzedniej sesji (pkt 53) — motyw Kosmos z tamtej sesji został
w tej faktycznie zacommitowany (patrz 54.8), razem z całą resztą poniżej.

### 54.1. Lista rzeczy do zrobienia przed wersją Beta (ustalona z userem)

User poprosił o rozpisanie planu przed publicznym "wypuszczeniem" gry jako
Beta. Ustalone na czacie (nie zapisane nigdzie indziej niż tu):

- **Do zrobienia:** balans (poziomy/EXP/progi odblokowań/trudność), więcej
  ustawień (np. rozdzielczość/skalowanie canvasu), ulepszyć dźwięki, więcej
  trybów, własne profile graczy, ulepszyć GUI, zmienić tło rozgrywki
  (**zrobione**, Kosmos), dodać napis "Beta" (**zrobione**), streak
  logowania (**pomysł usera, jeszcze NIE zrobiony**), ekran statystyk gracza
  (**zrobiony**, patrz 54.2 — połączony z profilem zamiast osobnego ekranu).
- **Do rozważenia, wymaga backendu** (świadomie odłożone, brak
  infrastruktury serwerowej): rozgrywka online, tabele wyników (leaderboard).
- **Osobna lista QA/testów** (z pkt 51.2, wciąż aktualna, nieprzetestowana):
  cała ścieżka samouczka od zera, ekran końcowy w każdym trybie/języku,
  reset gry + misje dzienne w localStorage, odblokowywanie poziomem na
  żywo, dystans w HUD we wszystkich 4 trybach, pełny przepływ publikacji
  end-to-end (dev→main→Netlify), weryfikacja tłumaczeń CJK, testy
  jednostkowe.

**Do zrobienia w kolejnej sesji, jeśli user zechce:** streak logowania —
to jedyny punkt z ustalonej listy funkcji, który user potwierdził
("na pewno dodamy"), a nie został jeszcze zrobiony (odbiegliśmy w stronę
przebalansowania misji dziennych, patrz 54.6, zamiast tego).

### 54.2. Odświeżenie GUI ("bardziej nowoczesna i profesjonalna gra")

Czysto wizualny refresh w `style.css` + jeden `<link>` na fonty w
`index.html` — **zero zmian w wymiarach/pozycjach elementów powiązanych z
`game.js`** (canvas 480×600, siatka poziomów itd.), żeby nic nie ruszyć w
logice.

- **Fonty:** `Orbitron` (nagłówki/przyciski/HUD, sci-fi/gamingowy
  charakter) + `Inter` (opisy/teksty, czytelność) z Google Fonts — dociągane
  w `<head>` (`index.html`), podpięte pod istniejące zmienne
  `--font-display`/`--font-body` (`style.css:1-19`), więc każde miejsce w
  grze, które już używało tych zmiennych, dostało nowy font automatycznie.
- **Efekt "szkła"** (glassmorphism) na pływających panelach HUD nad
  animowanym tłem menu (poziom gracza, waluty, misje dzienne, wyzwanie
  dnia, wybór trybu) — `backdrop-filter: blur()` + półprzezroczyste tło,
  nowa zmienna `--glass`/`--glass-edge` w `:root`.
- Nowa skala zaokrągleń (`--r-sm/md/lg/xl`), krzywa easingu
  (`--ease`/`--ease-out`) użyta konsekwentnie w hoverach/kliknięciach,
  warstwowe cienie (`--shadow-soft`, inset highlight na przyciskach) zamiast
  płaskich krawędzi.
- Drobne dodatki: kolor zaznaczenia tekstu (`::selection`), widoczny
  outline przy nawigacji klawiaturą (`:focus-visible`), stonowany
  `scrollbar-width: thin` w listach (osiągnięcia/misje/skrzynki).

### 54.3. System Profilu gracza — awatar, nazwa, statystyki

User chciał coś "jak w Brawl Stars" — ikonka gracza, klikasz i wchodzisz na
ekran ze statystykami. Zaimplementowane jako **jeden profil na urządzenie,
nie wiele kont/save-slotów** — czysta personalizacja + ekran ze statystykami
tylko do odczytu.

- **Nowy ekran `#profileScreen`** (`index.html`, wzorem
  `#achievementsScreen`): duży awatar, plakietka z nazwą, poziom gracza,
  siatka 10 wybieralnych emoji-ikonek (astronauta/kosmita/robot/UFO/rakieta/
  planeta/gwiazda/kometa/galaktyka/obcy — `PROFILE_ICONS` w `game.js`),
  i lista statystyk (`renderProfileStats()`) zbudowana z **liczników, które
  gra już zbierała, ale nigdy wcześniej nie pokazywała graczowi**:
  `totalDistanceEver`, `totalCoinsEarned`, `totalDiamondsEarned`,
  `totalCratesOpened`, `unlockedAchievements.size`/`ACHIEVEMENTS.length`,
  `completedMissions.size`/`MISSIONS.length`, `totalCoopRuns`,
  `totalVersusRuns`, `totalAbilityUses`, `totalChallengesDone`, oraz
  `bestFree` (rekord Trybu wolnego — **przeniesiony tutaj**, wcześniej
  osobny chip na głównym menu, patrz 54.4).
- **Wybór ikonki:** klik w siatce zapisuje `scraper_profileicon_v1`
  (localStorage) i od razu podmienia ikonkę wszędzie (przycisk na menu +
  duży awatar w profilu).
- **Wymagana nazwa gracza:** blokujący modal "Nazwa Gracza:" (`#nameModal`,
  reużywa stylu `.tutorial-modal`) wyskakuje **automatycznie zaraz po
  ukończeniu lub pominięciu samouczka** (hak w `renderTutorial()` /
  `checkNamePrompt()`), limit **12 znaków**, Enter zatwierdza, nie da się
  zamknąć bez wpisania czegoś. Zapis: `scraper_playername_v1`. Nazwa
  wyświetla się jako mała plakietka "nachodząca" na dolną krawędź okrągłego
  awatara (styl Brawl Stars — `.mm-avatar-name`, `position:absolute` w
  `.mm-avatar-col`), pełna, bez ucinania (celowo brak `text-overflow`).
- Wszystkie nowe stringi UI przetłumaczone na **wszystkich 10 języków**
  w `i18n.js` (klucze `btn_profile`, `profile_*`, `name_modal_*`).

### 54.4. Nowy układ górnego paska głównego menu

Na życzenie usera przeorganizowany layout (czysto CSS/HTML, żadnych zmian
w logice):

- **Lewy górny róg:** awatar profilu (`#btnProfile`, teraz okrągły,
  78×78px) + zaraz na prawo od niego panel poziomu gracza (`.mm-level`,
  wcześniej wyśrodkowany u góry) — oba w nowym kontenerze
  `.mm-topleft-row`.
- **Góra-środek** (miejsce po starym poziomie/rekordzie): napis
  "Scraper" + "Beta" (`.mm-title`), teraz wyśrodkowany zamiast
  przyklejony do lewej krawędzi, powiększony (44px→56px).
- **Rekord Trybu wolnego usunięty z głównego menu** (był osobnym chipem,
  `#mmRecord`) — przeniesiony jako pozycja na liście statystyk w ekranie
  Profil (patrz 54.3). Martwy CSS/JS po starym `#mmRecord` posprzątany.
- Panel misji dziennych/wyzwania dnia (`.mm-topleft-col`) przesunięty niżej
  (114px→150px), żeby zmieścić nowy rząd awatar+poziom nad nim.

### 54.5. Konsola deweloperska (`/`)

Narzędzie czysto deweloperskie, **niewidoczne w żadnym menu**, tylko pod
klawiszem `/`. Wciśnięcie `/` gdziekolwiek (menu, w trakcie biegu), o ile
akurat nie pisze się w innym polu tekstowym, otwiera mały pasek na dole
ekranu (`#devConsole`). Wpisanie i Enter:

- `set money <n>` (alias: `set coins <n>`) — ustawia `coins`.
- `set diamonds <n>` — ustawia `diamonds`.
- `set level <n>` — ustawia `level`, zeruje `exp`.

Nieprawidłowa komenda po prostu nic nie robi. **Ważny szczegół
bezpieczeństwa interakcji:** input konsoli (i input nazwy gracza z 54.3)
wołają `e.stopPropagation()` w swoim `keydown`, żeby cyfry/WASD wpisywane w
tekście nie "przeciekały" do globalnego listenera ruchu/umiejętności
(`window.addEventListener('keydown', ...)` w sekcji sterowania) — bez tego
wpisanie np. "set diamonds 100" aktywowałoby też umiejętności 1/2/3.

### 54.6. Przebalansowanie nagród z misji dziennych

Duża zmiana w balansie, na wyraźną prośbę usera — misje dzienne **nie mają
już stałej nagrody na wariant** (było 10-80 monet). Teraz:
`rollDailyReward()` w `game.js`: **80% szans na monety (200-400, zaokrąglone
co 20 — zawsze "czysta" liczba typu 260/380), 20% szans na diamenty (1-3)**.

- **Nagroda jest losowana z góry**, w momencie gdy dzisiejsze 3 misje
  zostają wybrane (`ensureDailyFresh()`), **nie** w momencie ukończenia —
  ale user chciał, żeby i tak było to widoczne jawnie w panelu od razu
  (nie ukryte za "???"), więc panel pokazuje konkretną wylosowaną liczbę
  (np. "260 🪙") już przed ukończeniem, nie tylko po.
- Wynik trzymany w nowym polu `dailyMeta.rewards` (obiekt id→{type,amount}),
  osobne od `dailyMeta.completed`.
- Toast po ukończeniu misji dziennej pokazuje teraz pogrubioną faktyczną
  nagrodę zamiast tylko nazwy misji.
- Stare stałe wartości `reward:` usunięte z `DAILY_TEMPLATES`.

### 54.7. Krytyczny bug po tej zmianie + brak Node.js w tym środowisku

Po pierwszej wersji 54.6 (nagroda losowana dopiero przy ukończeniu, nie z
góry) user zgłosił **całkiem pusty, biały ekran** po otwarciu gry.
Przyczyna: `ensureDailyFresh()`'s backfill sprawdzał tylko `if
(!dailyMeta.rewards)` — skoro `dailyMeta.rewards` już istniał w zapisie
usera (choćby jako pusty/częściowy obiekt z wcześniejszej iteracji tej samej
funkcji w tej samej sesji), backfill się nie uruchamiał, a
`dailyRewardText(undefined)` dla jeszcze nieukończonej misji wywalało cały
`game.js` (jeden błąd w tym monolitycznym IIFE = pusta strona, bo
`showScreen(mainMenu)` nigdy się nie wykonuje). **Naprawione** — backfill
sprawdza teraz brakujący wpis **dla każdego dzisiejszego `id` z osobna**,
nie tylko czy `.rewards` istnieje jako obiekt.

**Ważne dla przyszłych sesji: w tym środowisku (ta maszyna, ten
Claude Code) `node` NIE jest dostępny** — stara metoda weryfikacji składni
z pkt 10.3 (`node -e "new Function(...)"`) **nie działa tutaj**, mimo że
jest udokumentowana jako historyczna metoda projektu. Zamiast tego, żeby
złapać błędy JS w konsoli bez ręcznego klikania w DevTools, znaleziony
i zweryfikowany sposób: **Microsoft Edge w trybie headless**
(`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`), bo
`node`/`npm`/`python` nie ma, ale przeglądarka jest zawsze pod ręką:

```
msedge.exe --headless=new --disable-gpu --user-data-dir=<tymczasowy_folder> ^
  --no-first-run --enable-logging=stderr --v=1 --virtual-time-budget=4000 ^
  --dump-dom "file:///C:/.../index.html" > dump.html 2> log.txt
```

Potem `log.txt` przeszukać po `CONSOLE` + `error/exception/Uncaught` (błędy
JS z `console.error`/nieobsłużone wyjątki lądują tam z prefiksem
`INFO:CONSOLE:`), a `dump.html` sprawdzić czy `#mainMenu` ma klasę
`screen show` (dowód, że `game.js` doszedł do końca bez wyjątku). **Dwie
pułapki, na które warto uważać:** (1) trzeba **URL-encodować spacje** w
ścieżce (`Gra Kulka` → `Gra%20Kulka`), inaczej Edge dostaje dwa osobne
argumenty i wywala się z "Multiple targets are not supported"; (2) trzeba
podać **osobny `--user-data-dir`**, inaczej próba odpalenia headless przy
już uruchomionym zwykłym Edge (a user zwykle ma go otwartego, bo tam testuje
grę) też kończy się tym samym błędem "Multiple targets".

### 54.8. Stan gita na koniec sesji

W trakcie tej sesji zrobiony **jeden duży commit** (`77be705`, "Add space
theme, player profile, and modernized UI") na branchu `dev`, **zacommitowany
i wypchnięty na `origin/dev`** — obejmuje: motyw Kosmos z poprzedniej sesji
(pkt 53.3, wcześniej niezacommitowany), całe GUI z 54.2, profil z 54.3,
layout z 54.4, konsolę z 54.5, etykietę "Beta", plus `.gitignore`/`icon.png`
i wpisy dokumentacji pkt 52-53 z poprzedniej sesji.

**Nie wpłynęło na `scraper-game.netlify.app`** — to wciąż tylko `dev`, nie
`main` (patrz zasada z pkt 52 — merge do `main` tylko na wyraźną prośbę
"publikujemy").

**WAŻNE — niezacommitowane na koniec tej sesji:** wszystko z 54.6/54.7
(przebalansowanie nagród dziennych + poprawka buga) powstało **po** tym
jednym commicie i wciąż siedzi tylko w working tree na `dev`. Podobnie
drobne poprawki layoutu z 54.4 (powiększenie awatara/poziomu/tytułu, ostatni
kształt plakietki z nazwą) — też po tamtym commicie.

**Do zrobienia w kolejnej sesji:** zacommitować resztę zmian (54.4 drobne
poprawki + 54.6/54.7 przebalansowanie misji dziennych + fix buga), potem
kontynuować od streak logowania (54.1) albo resztą listy Beta.

---

## 55. Pełnoekranowe podekrany, przeprojektowanie Osiągnięć, panel boczny
    (hamburger), rozbudowana muzyka w menu (2026-08-17)

Sesja zaczęła się od pytania o multiplayer/leaderboard online (patrz 55.1),
ale user zdecydował odłożyć to na później i zająć się kosmetyką — reszta
sesji to czysto wizualny/audio refresh, bez zmian w rdzeniu logiki gry.

### 55.1. Multiplayer/leaderboard online — odłożone

User pytał czy da się zrobić tabelę wyników i/albo pełny multiplayer.
Wyjaśniono: leaderboard = stosunkowo proste (darmowy backend typu
Supabase/Firebase + prosty insert/select, front prawie bez zmian),
multiplayer na żywo = osobny, duży projekt (serwer WebSocket, synchronizacja
stanu). User wybrał "oba, ale po kolei" (leaderboard najpierw), po czym
przełączył się na inne rzeczy — **nic z tego nie zostało zaimplementowane
w tej sesji**, temat czeka na start w kolejnej, jeśli user zechce.

### 55.2. Powiększenie planszy 480×600 → 560×640

Na życzenie usera: 40px więcej lewo/prawo, 20px więcej góra/dół
(symetrycznie). Zmiana tylko w trzech miejscach —
`index.html:` atrybuty `width`/`height` na `<canvas id="board">`,
`style.css` `.stage`/`#board`. **Zero zmian w `game.js`** — cała logika gry
liczy pozycje proporcjonalnie do `W`/`H` (`canvas.width`/`canvas.height`
odczytane raz na starcie, `game.js:33`), nigdzie nie ma zahardkodowanych
`480`/`600`, więc powiększenie planszy przeszło bezpiecznie bez dotykania
mechaniki.

### 55.3. Usunięcie przycisku "Wyjdź" → potwierdzenie przez Esc

Stary zawsze-widoczny przycisk "Wyjdź" na dole głównego menu (`btnExit`)
usunięty. Zamiast tego: **Esc** na głównym menu otwiera modal potwierdzenia
("Czy na pewno chcesz wyjść z gry?") z przyciskami **Nie** (lewo) / **Tak**
(prawo, oba stylu `ghost` — user chciał identyczny wygląd obu). Tak robi to,
co robił stary przycisk (`window.close()` + `showScreen(exitScreen)`).

- Nowy modal `#exitConfirmModal` w `index.html`, wzorem istniejącego
  `.tutorial-modal`/`#nameModal`.
- `game.js`: `showExitConfirm()`/`hideExitConfirm()`/`confirmExit()`, nowa
  gałąź w globalnym listenerze `keydown` (linia ~192) — **nie koliduje** z
  istniejącym Esc-podczas-rozgrywki (otwiera pauzę), bo ten kod ma osobną
  wczesną gałąź dla `mode === 'single' || 'freeplay'` z `return`, więc
  exit-confirm odpala się tylko gdy `mainMenu.classList.contains('show')`.
- Nowe klucze i18n (`exit_confirm_title`, `btn_exit_no`, `btn_exit_yes`) we
  **wszystkich 10 językach** w `i18n.js`. Stary klucz `btn_exit` zostawiony
  (nieużywany teraz, ale nieszkodliwy).
- Martwy CSS `.mm-exit-btn` posprzątany.

### 55.4. Kolorowe, animowane tło strony (poza planszą)

Poza planszą gry (`.stage`) tło całej reszty ekranu było prawie czarnym,
statycznym gradientem (`html, body` w `style.css`) — user chciał "coś
fajnego". Dodane w `style.css`:

- `body::before` — pole gwiazd (7 nakładających się `radial-gradient` w
  powtarzanym kaflu 420×320px), migające przez `@keyframes starTwinkle`
  (6s, opacity 0.55↔1).
- `body::after` — 3 duże, kolorowe mgławice (fiolet/róż/turkus,
  `radial-gradient` z tych samych barw co kanwowy motyw "kosmos" z sesji
  53/54), animowane `@keyframes nebulaDrift` (10s, translate+scale) —
  user poprosił żeby było **szybciej i mocniej**, więc opacity ~2× wyższe
  niż pierwsza wersja (0.30→0.55 itd.) i cykl skrócony z 26s do 10s.
- Oba pseudo-elementy `position:fixed; z-index:0`, `.wrap` dostało
  `z-index:1`, żeby zawartość strony zawsze była nad tłem.
- **Bug znaleziony przez usera:** mgławica "wchodziła" na planszę gry
  (widać było kontur `.stage` jako ciemny prostokąt na animowanym tle).
  Przyczyna: `.stage` nie miał własnego tła, więc przy transparentnym
  `#mainMenu`/innych ekranach zza canvasa/ekranu prześwitywało tło strony.
  **Naprawione dwuetapowo:** (1) `.stage` dostał `background:var(--bg-deep)`
  (nieprzezroczyste, blokuje mgławicę na głównym menu); (2) ale to z kolei
  ujawniło **inny** artefakt po dodaniu przezroczystych pełnoekranowych
  podekranów (patrz 55.5) — sam prostokąt `.stage` prześwitywał jako ciemny
  "kontur" NA TYCH ekranach. Rozwiązanie: `showScreen()` (`game.js`) teraz
  przełącza klasę `.stage.board-hidden` (`background:transparent`) zawsze
  gdy pokazywany jest ekran inny niż `mainMenu` (dokładnie ten sam warunek
  co istniejące już `canvas.style.visibility`), więc `.stage` jest
  nieprzezroczysty tylko na głównym menu i w trakcie faktycznej rozgrywki.

### 55.5. Wszystkie podekrany na pełny ekran (nie tylko 560×640 box)

User zauważył, że np. Sklep otwiera się w "małym okienku na środku" —
okazało się, że `#mainMenu.show` od dawna miał już
`position:fixed;inset:0;z-index:50` (pełny viewport), ale **generyczna**
reguła `.screen.show` (używana przez Sklep/Misje/Skrzynki/Osiągnięcia/
Ustawienia/Profil/Poziomy/itd.) wciąż była `position:absolute` ograniczona
do 560×640 `.stage`. Jedna zmiana w `style.css` (`.screen.show` dostało też
`position:fixed;inset:0;z-index:50`) naprawiła to dla wszystkich ekranów
naraz — `#mainMenu.show`'s własne (redundantne, ale nieszkodliwe) te same
wartości zostały bez zmian.

### 55.6. Przeprojektowanie ekranu Osiągnięć (pierwszy "pilot" nowego stylu)

User: "wygląda dość słabo, zróbmy to porządnie i zobaczmy jak to wygląda
zanim rozniesiemy na resztę ekranów" — Osiągnięcia stały się poligonem
testowym dla wzorca, który ma potem trafić na inne ekrany.

- **Siatka trofeów** (`.trophy-grid`) z sztywnych 2 kolumn/300px na
  `repeat(auto-fill, minmax(190px,1fr))` na pełną szerokość, karty większe,
  stylu "glass" (`backdrop-filter:blur`, jak reszta UI), hover unosi kartę.
- **Przycisk cofnięcia** — nowa reużywalna klasa `.screen-back-btn`
  (okrągły, szklany, top-left, `position:fixed`). Kilka iteracji na
  życzenie usera: **powiększony** (64→74px), **grubszy** znaczek,
  i finalnie **przebudowany geometrycznie** (patrz niżej — długa historia
  centrowania).
- **Przezroczyste tło ekranu** (`#achievementsScreen.show { background:
  transparent; border:none; border-radius:0; }`) — odsłania animowane tło
  strony z 55.4 zamiast płaskiego gradientu panelu, żeby karty "unosiły
  się" nad ruchomym kosmosem. Ten sam trik co `#mainMenu.show` już
  stosował.
- **Historia centrowania strzałek `‹`/`›` (WAŻNA LEKCJA na przyszłość):**
  1. Pierwsza wersja: znak Unicode `◀` (wypełniony trójkąt) — user chciał
     cieńszy, spójny z `›` w panelu bocznym (patrz 55.7).
  2. Zamieniono na obrócony róg kwadratu (`border-width:0 4px 4px 0` +
     `rotate()`) — **wygląda inaczej niż się wydaje**: takie centrowanie
     samego kwadratu centruje tylko niewidoczny bounding box, a widoczny
     "czubek" strzałki siedzi w jednym rogu tego kwadratu, więc realnie
     wygląda przesunięty.
  3. Próba kompensacji przez `translateX()` żeby czubek trafił dokładnie
     na środek przycisku — **też źle**, bo wtedy cała reszta kształtu
     (ramiona) wystaje tylko w jedną stronę (czubek na środku ≠ kształt
     wizualnie wyważony).
  4. **Finalne, poprawne rozwiązanie:** strzałka zbudowana z **dwóch
     osobnych belek** (`::before`/`::after`, każda mały prostokąt
     `background:currentColor`) połączonych w jednym punkcie (wspólny
     `top:50%;left:calc(50% ± shift)`, `transform-origin:0 50%`,
     `rotate()` w przeciwne strony) — punkt zbiegu (pivot) celowo
     przesunięty od geometrycznego środka przycisku o połowę poziomego
     zasięgu ramion (`arm_length * cos45° / 2`), tak żeby **bounding box
     całego kształtu** (czubek + końce obu ramion), a nie sam czubek, był
     wyśrodkowany. **Zweryfikowane naocznie** headless-Edge screenshotami
     z czerwonym krzyżykiem w prawdziwym środku przycisku (viewport
     przeskalowany 4× dla czytelności) — pierwsze dwa podejścia user
     odrzucił mówiąc "nie", trzecie zweryfikowane i zaakceptowane.
     **Wniosek na przyszłość:** przy podobnych sztuczkach czysto-CSS
     (ikony rysowane z border/transform) nie ufać samej matematyce/
     intuicji — zrobić szybki izolowany plik testowy w scratchpadzie i
     zrzut ekranu (`msedge.exe --headless=new --screenshot=...`) **zanim**
     zgłosi się gotowość, szczególnie gdy `node`/prawdziwe DevTools nie są
     dostępne w tym środowisku (patrz też 54.7).
  5. Analogiczny problem i to samo rozwiązanie zastosowane do `›` w
     panelu bocznym (55.7) — obie strzałki dzielą tę samą technikę,
     tylko lustrzane kąty/przesunięcia.

### 55.7. Hamburger + wysuwany panel boczny (zamiast ikonki Ustawień)

Pomysł usera: zamiast pojedynczej ikonki ⚙️ na głównym menu — **hamburger
(☰)** w tym samym miejscu, otwierający panel z prawej (~1/5 ekranu,
`min-width:270px;max-width:400px`), z animacją wysuwania/chowania
(`transform:translateX()`, tranzycja 0.32s) i przyciskiem `›` na górze do
schowania. Na razie w panelu tylko **Ustawienia**, zbudowane tak, żeby
łatwo dorzucić kolejne pozycje później (`.side-drawer-item`, lista
`.side-drawer-list`).

- Stary `#btnSettings` (ikonka) → `#btnMenuToggle` (hamburger, otwiera
  panel). Nowy `#btnSettings` to teraz pozycja **wewnątrz** panelu
  (`.side-drawer-item`), robi to co robił stary przycisk
  (`showScreen(settingsScreen)`) + dodatkowo zamyka panel.
  `MAIN_MENU_INTERACTIVE_IDS` (lista przycisków, które samouczek
  odblokowuje/blokuje) zaktualizowana: `'btnSettings'` →
  `'btnMenuToggle'`.
- `showScreen()` (`game.js`) woła `closeDrawer()` na starcie za każdym
  razem — panel zawsze zamyka się przy zmianie ekranu, nawet jeśli user
  go nie zamknął ręcznie.
- **Kilka iteracji wyglądu na życzenie usera:** mini-logo "Scraper Beta"
  (ta sama tożsamość co `.mm-title`/`.mm-alpha-badge` z głównego menu, w
  dużym pomniejszeniu) najpierw trafiło na ekran Osiągnięć, potem
  **przeniesione do panelu bocznego** (obok `›`) — user doprecyzował że
  chodziło o panel, nie Osiągnięcia. "Beta" pod niebieską kreską (nie
  obok "Scraper"), logo **wycentrowane w przestrzeni między przyciskiem
  `›` a krawędzią panelu** (`.side-drawer-logo-wrap { flex:1;
  justify-content:center; }` — automatyczne równe odstępy zamiast
  ręcznych marginesów).
- **Wizualny refresh panelu** (na życzenie "zrób coś fajnego na tym
  pasku"): z płaskiego nieprzezroczystego gradientu na **szklany panel**
  (`background:var(--glass); backdrop-filter:blur(20px)`), zaokrąglone
  lewe rogi (`border-top/bottom-left-radius:var(--r-xl)`), odstęp
  16px od góry/dołu ekranu (efekt "pływającej karty" zamiast paska na
  pełną wysokość), świecąca turkusowa linia pod górnym rzędem
  (`.side-drawer-top::after`), **delikatna dryfująca mgławica wewnątrz
  panelu** (`.side-drawer::before`, reużywa `@keyframes nebulaDrift` z
  55.4, przycięta do zaokrąglonych rogów przez `overflow:hidden` na
  rodzicu), i świecący pasek z lewej na pozycjach listy przy hover.

### 55.8. Rozbudowana, wieloczęściowa muzyka w menu głównym

User: stara muzyka w menu to "zwykły rytm zapętlony" (jeden 8-akordowy
progres, przetasowywany, ale zawsze ten sam charakter/tempo/brzmienie) —
chciał czegoś rozbudowanego, przyjemnego, pasującego do (kosmicznego)
klimatu gry, i **żeby się zmieniało w zupełnie inną melodię**, nie tylko
inne akordy. Wszystko w `game.js`, silnik audio to procedury Web Audio API
(bez plików audio — projekt zostaje offline/bez zależności, patrz istniejący
komentarz "Procedural soundtrack engine"). **Ścieżki rozgrywki/bossa
(`stepProgression`/`startMusic`) celowo nietknięte** — cała nowa logika w
osobnych, menu-only funkcjach, żeby zero ryzyka regresji w gameplayu.

- **Trzy pełne "sekcje"/nastroje** zamiast jednej progresji: `warm`
  (istniejąca Am-F-C-G-F-Am-Dm-G), `bright` (nowa, durowa
  C-G-Am-Em-F-C-G-Am, jaśniejsza, szybsze tempo 400ms/krok, częstsze
  iskierki), `deep` (nowa, mroczna Dm-Bb-Gm-F-Dm-Am-Bb-F, wolniejsza
  560ms/krok, rzadsza, głębszy dron). Każda sekcja ma **własną**
  progresję akordów, tempo, głośności warstw, zakres filtra pada, barwę
  (`leadWave`), szansę na iskierkę i wysokość drona — `MENU_SECTIONS` w
  `game.js`. Sekcja wybierana wg globalnego numeru taktu
  (`menuSectionAt()`, `MENU_BARS_PER_SECTION = 24` taktów/sekcję, cykl
  warm→bright→deep→warm... ok. 2-2.5 min na pełny obrót, ale że każda
  sekcja ma **własną**, długą (96-taktową) kolejność akordów indeksowaną
  globalnym numerem taktu (nie resetowaną przy każdym powrocie do
  sekcji), powtórzenie dokładnie tego samego przebiegu zajmuje dużo
  dłużej niż jeden cykl 3 sekcji.
- **Nowe warstwy brzmienia** (tylko dla menu, funkcje `playMenuPad`/
  `playMenuLead`/`playSparkle`/`startMenuDrone`/`glideMenuDrone`,
  oddzielne od współdzielonych `playPad`/`playNote` używanych przez
  rozgrywkę): pad z **wolno "oddychającym" filtrem dolnoprzepustowym**
  (cutoff sweep w trakcie trwania akordu, zakres zależny od sekcji);
  **echo/pogłos** (`DelayNode` + feedback + wet gain, `ensureMenuDelay()`,
  jedna wspólna szyna na cały czas życia `audioCtx`) na melodii i
  iskierkach; **"iskierki"** — rzadkie wysokie dzwonki (dwie prawie-unisono
  sine, oktawa+detune, długi zanik), losowy moment w takcie, szansa zależna
  od sekcji; **cichy dron** — dwa lekko rozstrojone sawtooth przez
  lowpass, gra ciągle przez cały czas trwania muzyki w menu (nie
  restartowany co takt jak reszta warstw), **płynnie "zjeżdża"**
  (`linearRampToValueAtTime`, 3.5s) do wysokości nowej sekcji zamiast
  skakać.
- **Zmiana architektury odtwarzania:** stały `setInterval` zamieniony na
  samo-planujący się `setTimeout` (`scheduleMenuStep()`), bo tempo
  (`stepDur`) teraz zależy od aktualnej sekcji i może się zmieniać w
  trakcie grania — `setInterval` nie obsłużyłby zmiennego okresu.

### 55.9. Stan gita na koniec sesji

**Nic w tej sesji nie zostało zacommitowane** — wszystkie zmiany (55.2
przez 55.8) siedzą tylko w working tree na branchu `dev`
(`git status`: `game.js`, `i18n.js`, `index.html`, `style.css` zmienione).
User nie poprosił o commit ani o publikację — zgodnie z zasadą "nigdy nie
commituj bez wyraźnej prośby" nic nie zostało wypchnięte.

**Do zrobienia w kolejnej sesji:** zdecydować czy/kiedy zacommitować
całość 55.2-55.8 (jeden duży commit czy podzielony), ewentualnie
kontynuować leaderboard/multiplayer (55.1) jeśli user zechce, albo wrócić
do reszty listy Beta z 54.1 (balans, streak logowania, więcej ustawień).
