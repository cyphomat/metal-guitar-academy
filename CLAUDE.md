# Riffforge

Eine Übungs-App für Metal-Gitarre. Kein Kurskatalog — eine **Session-Maschine**:
starten, ~15 Minuten üben, fertig, morgen wieder.

## Das Produktmodell

Eine Session ist immer gleich aufgebaut, damit sie keine Entscheidung kostet:

```
Warm-up    2 min    Finger wach kriegen
Technik    ~3 min   eine Sache isoliert, mit Metronom
Riff       ~3 min   dieselbe Technik im musikalischen Kontext
Technik    ~3 min   zweite Runde, mit Abstand dazwischen
Riff       ~3 min   zweite Runde
Abschluss           Selbsteinschätzung → landet im Log
```

Am Ende: *Feierabend* oder *+5 Minuten*. Was in den Blöcken steckt, entscheidet
der Scheduler aus dem Übungs-Log — die **Form** ist fix, der **Inhalt** passt
sich an.

Die zwei Runden mit Abstand sind kein Zufall: verteilte Wiederholung behält
sich besser als eine lange am Stück. Ein Drill **ohne** Vorgeschichte bekommt
seinen Block trotzdem am Stück — Erlernen und Behalten verlangen
Verschiedenes.

## Architektur

| Pfad | Rolle |
|---|---|
| `lib/audio/audio-engine.ts` | Besitzt den **einen** AudioContext der App |
| `lib/audio/metronome.ts` | Web-Audio-Lookahead-Scheduler. Framework-frei, kein React. |
| `lib/audio/onset-detector.ts` | Mikrofon → AudioWorklet → Anschlag-Zeitstempel |
| `public/worklets/onset-processor.js` | Onset-Erkennung im Audio-Thread (2,7 ms Auflösung) |
| `lib/audio/timing.ts` | Bewertet Gehörtes gegen Geklicktes. Rein, getestet. |
| `lib/session/types.ts` | Domänen-Typen + Zod-Schemas für alles Persistierte |
| `lib/session/drills.ts` | Der Übungs-Katalog (reine Daten) |
| `lib/session/progress.ts` | Auswertung des Logs: Tempo-Fortschreibung, Streak, Mastery |
| `lib/session/builder.ts` | Wählt aus, was heute drankommt |
| `lib/session/profile.ts` | Die zwei Antworten vom ersten Start: Starttempo und Gewichtung |
| `lib/session/briefing.ts` | Die Ansage: der Ton des Tages, aus dem Log |
| `lib/session/calendar.ts` | Das Raster für den Übungskalender |
| `lib/session/merge.ts` | Logs verschmelzen — für Import und später den Abgleich |
| `lib/storage/practice-log.ts` | localStorage, einziger Zugriffspunkt aufs Log |
| `lib/storage/profile.ts` | localStorage, einziger Zugriffspunkt aufs Profil |
| `lib/sync/store.ts` | Abgleich-Logik, unabhängig von GitHub — deshalb testbar |
| `lib/sync/github.ts` | GitHub-API als Ablageort, einziger Netz-Zugriff |
| `components/session/*` | UI der Session |
| `lib/theory/fsrs.ts` | FSRS-6, portiert aus der Referenz. Rein, gegengeprüft. |
| `lib/theory/types.ts` | Karten, Fragen und der Antwort-Log |
| `lib/theory/progress.ts` | Kartenstand aus dem Antwort-Log, Auswahl fürs Abfragen |
| `lib/theory/fretboard.ts` | Griffbrett als Rechnung: Töne, Intervalle, Lagen |
| `lib/theory/cards.ts` | Der Wissenskatalog (reine Daten) |
| `lib/storage/theory-log.ts` | localStorage, einziger Zugriffspunkt auf die Antworten |
| `components/theory/*` | Griffbrett, Fragekarte, Übersicht |
| `lib/update/version.ts` | Bau-Stempel vergleichen: eigene Fassung, Server, Original |
| `lib/update/check.ts` | Holt Stempel und Original-Commits, leert den Cache |
| `tools/version.mjs` | Schreibt den Bau-Stempel — läuft vor jedem Build |
| `lib/base-path.ts` | Präfix für Laufzeit-Pfade unter GitHub Pages |
| `public/sw.js`, `public/manifest.json` | PWA: offline und installierbar |

**Kernregel:** Die Logik in `lib/session/` ist rein und ohne React oder
Browser-APIs. Deshalb ist sie testbar — und deshalb liegen dort die Tests.
Neue Regeln zu Tempo, Auswahl oder Fortschritt gehören dorthin, nicht in eine
Komponente.

## Konventionen

- **Persistenz nur über `lib/storage/practice-log.ts`.** Kein direkter
  `localStorage`-Zugriff sonst. Der Umzug auf IndexedDB oder einen Server soll
  eine Änderung an einer Stelle sein.
- **Alles Gespeicherte geht durch ein Zod-Schema.** Kaputte Daten werden
  beiseitegelegt, nie stillschweigend verworfen.
- **Kein `AudioContext` vor einer Nutzergeste.** Browser blockieren das, iOS
  lässt ihn sonst dauerhaft suspendiert.
- **Timer laufen gegen die Wanduhr**, nicht per Dekrement — sonst geht ein
  Hintergrund-Tab nach.
- **UI-Text ist deutsch, Code und Kommentare englisch.**
- **Ein AudioContext für alles.** Metronom und Mikrofon müssen auf derselben
  Uhr liegen, sonst ist jede Timing-Messung Rauschen. Nie einen zweiten anlegen.
- **Theorie gehört an den Drill** (`why`-Feld), nicht in einen eigenen Bereich.
- **Breit ab 900 px** (`wide:` in Tailwind), wie bei Setlist. Die Reihenfolge im
  Markup bleibt gleich — `.zwei-spalten` stapelt auf dem Handy einfach. Der
  Abschluss-Bildschirm bleibt schmal: er ist eine Entscheidung, keine Übersicht.
- **Die Design-Sprache kommt aus Setlist.** Matte Flächen, Bernstein nur auf
  dem, was zählt, Stahlblau für alles Zweitrangige, harte Kanten mit 2 px.
  Farben stehen als CSS-Variablen in `app/globals.css`, nicht als Hex-Werte in
  Komponenten. Road-Case, kein HUD.
- **Die Ansage behauptet nichts.** Jede Zeile in `briefing.ts` muss aus dem Log
  ableitbar sein, sonst gehört sie da nicht hin.
- **Beim Abgleich gewinnt keine Seite.** Konflikt heisst: neu lesen, erneut
  verschmelzen, noch einmal schreiben — und dann aufhören. Genau ein zweiter
  Versuch, sonst hängt es.
- **Antworten auf dem Griffbrett sind gerechnet, nicht getippt.** Der Katalog
  holt jede richtige Stelle aus `lib/theory/fretboard.ts`. Ein Tippfehler in
  einer Tabelle mit hundert Tönen fällt niemandem auf; ein Fehler in der
  Rechnung fällt in den Tests auf. Und was die Erklärungen an Tönen und
  Abständen behaupten, prüft `__tests__/cards.test.ts` nach — Übungsmaterial,
  das lügt, ist schlimmer als keines.
- **Tonnamen englisch.** `B` ist der Ton über A, `A#`/`Bb` der darunter — so
  steht es in jeder Tabulatur, und Metal-Repertoire kommt als Tabulatur.
  Deutsche Eingaben nimmt `parseTon` trotzdem an, und der Fall wird in der
  Rückmeldung benannt statt stillschweigend gewertet.
- **Das Griffbrett verrät die Antwort nicht.** Eine Markierung trägt ihren
  Tonnamen erst nach dem Auflösen; vorher beantwortete das Antippen die Frage
  von selbst. Ausnahme ist der gegebene Grundton — der gehört zur Frage.
- **Nach jeder Antwort steht die richtige da, mit Begründung.** Ohne
  Rückmeldung kehrt sich der Vorteil des Abfragens bei niedriger Trefferquote
  um: wer rät und nichts erfährt, lernt die falsche Antwort. Ein "leider
  falsch" ohne Auflösung gehört deshalb nicht in diese App.
- **Anzeigen müssen etwas messen.** Die Abrufbarkeit steht direkt nach dem
  Antworten immer nahe 100 % — als Anzeige taugt sie nichts, sie meldete sonst
  nach fünf Reinfällen "sitzt: 5". Was angezeigt wird, ist die Stabilität in
  Tagen.
- **Der Kartenstand wird abgespielt, nicht gespeichert.** Stabilität und
  Schwierigkeit einer Wissenskarte fallen aus dem Antwort-Log, jedes Mal neu.
  Das ist Bedingung für den Abgleich: ein gespeicherter Zustand wäre
  veränderlich, und zwei Geräte müssten sich einigen, wer gewinnt. Antworten
  sind unveränderlich und verschmelzen wie der Übungs-Log.
- **FSRS wird nicht nachempfunden.** `lib/theory/fsrs.ts` ist ein Port der
  Referenz und hängt an `__tests__/fsrs-referenz.json` — Prüfwerte, mit
  py-fsrs erzeugt. Wer eine Formel anfasst, erzeugt die Datei neu, statt die
  Erwartungen anzupassen. Ohne Lernschritte, weil hier niemand nach zehn
  Minuten wiederkommt; das entspricht `Scheduler(learning_steps=(),
  relearning_steps=())`.
- **Der Bau-Stempel wird nicht von Hand gepflegt.** `tools/version.mjs`
  schreibt ihn zweimal aus einer Quelle: als `public/version.json` (was auf dem
  Server liegt) und als `NEXT_PUBLIC_*` im Bündel (was gerade läuft). Der
  Vergleich der beiden *ist* die Update-Erkennung — wer eines von beiden
  anders befüllt, macht sie blind. Der Service Worker muss `version.json`
  deshalb ungecacht durchlassen.
- **Löschen heisst löschen.** Was die App speichert, muss der Löschen-Weg auch
  wieder loswerden — Log, beiseitegelegte Kopie und Profil. Ein neuer
  `localStorage`-Schlüssel gehört deshalb in dieselbe Liste wie sein Löschen.
- **Kein dritter Host.** `api.github.com` ist die einzige fremde Adresse, und
  auch die nur zweimal: beim eingerichteten Abgleich, und auf Knopfdruck beim
  Blick zum Original — Letzteres ausschliesslich in einem Fork. Sonst spricht
  die App mit niemandem. Schriften liegen lokal (`next/font` lädt sie
  beim Build), es gibt keine Analyse-Dienste und keine Einbettungen. Die CSP in
  `app/layout.tsx` schreibt das fest: wer einen Host hinzufügt, muss dort
  `connect-src` erweitern — und sich fragen, warum.
- **Der Log ist append-only.** Einträge sind unveränderlich und über
  `drillId` plus `at` identifiziert. Deshalb ist Verschmelzen die richtige
  Antwort auf zwei Stände, nicht "der neuere gewinnt" — nie überschreiben.
- **Das Profil ist ein Startwert, kein Filter.** Die zwei Fragen beim ersten
  Start skalieren die Starttempi und gewichten die Auswahl leicht — sie
  schliessen nie einen Drill aus. Sobald ein Log da ist, schreibt sich das
  Tempo daraus fort und das Profil zählt für diesen Drill nicht mehr. Es darf
  deshalb auch fehlen: jede Funktion nimmt `Profile | null`.
- **Ein Drill über mehrere Runden ist ein Eintrag**, nicht drei. Der
  Session-Runner sammelt die Spielzeit und schreibt nach der letzten Runde.

## Beim Veröffentlichen

Die Testzahl steht als Abzeichen in **beiden** READMEs (`README.md` und
`README.en.md`) und zieht nicht von selbst mit. Wer Tests hinzufügt, zieht sie
dort nach — sonst steht dort irgendwann eine Zahl, die niemand mehr glaubt.
Dasselbe gilt für die Drill-Tabellen unter *Die Übungen* / *The drills*: sie
sind aus `lib/session/drills.ts` erzeugt, aber nicht generiert. Wer den Katalog
ändert, zieht sie nach — in beiden Sprachen.

Die beiden READMEs haben dieselbe Gliederung. Ein neuer Abschnitt gehört in
beide, sonst laufen sie auseinander.

## Inhalte und Recht

Alle Drills und Riffs sind **eigene** Übungen im jeweiligen Stil. Keine
abgeschriebenen Tabs, kein Audio urheberrechtlich geschützter Aufnahmen. Wenn
neue Inhalte dazukommen: bitte dabei bleiben.

## Befehle

```bash
pnpm dev      # Entwicklung
pnpm test     # Vitest (Logik in lib/session und lib/audio)
pnpm check    # tsc --noEmit && vitest run && next lint
pnpm build    # statischer Export nach out/
```

## Deployment

Statischer Export auf GitHub Pages, per Actions bei Push auf `main`. Pages
liefert unter `/<repo>/` aus:

- Pfade, die **Next erzeugt**, bekommen `basePath` automatisch.
- Pfade, die **zur Laufzeit** entstehen — `audioWorklet.addModule`,
  `serviceWorker.register` — müssen durch `asset()` aus `lib/base-path.ts`.
  Das ist die Stelle, an der es sonst still im Unterverzeichnis danebengreift.

`output: "export"` heißt: keine API-Routen, keine Server-Komponenten mit
Laufzeitlogik, kein `next/image`-Optimizer.

`next.config.mjs` unterdrückt **keine** Fehler mehr. TypeScript- und
ESLint-Fehler brechen den Build — bitte so lassen.

## Timing-Messung

Das Mikrofon hört **Anschläge**, nicht Tonhöhen. Bei verzerrter Gitarre ist
Pitch-Tracking unzuverlässig, Transienten dagegen sind eindeutig — und für
Rhythmusarbeit ist der Einsatzzeitpunkt ohnehin die ganze Frage.

Zwei Zahlen, die man nicht verwechseln darf:

- **Versatz** (`offsetMs`): konstante Verzögerung. Steckt voller Laufzeit —
  Saite → Luft → Mikrofon → Puffer, bei Bluetooth-Kopfhörern 150–300 ms. Zählt
  **nicht** in den Score. Wird vor dem Zuordnen geschätzt (Histogramm-Peak),
  sonst würde bei langsamer Signalkette gar nichts zugeordnet.
- **Streuung** (`spreadMs`): Schwankung um diesen Versatz. **Das** ist die
  Spielqualität, und der Score baut darauf auf.

Ein negativer Versatz ist kein Latenz-Artefakt: Laufzeit kann einen Ton nur
später machen, nie früher. Wer vorne liegt, spielt wirklich vorne.

## Wo es weitergeht

- **Tonhöhen-Erkennung** für Skalen und Licks — sauber gespielt machbar
  (Autokorrelation/YIN), mit High-Gain deutlich unzuverlässiger.
- **Kalibrierung**: den Versatz einmal messen und speichern, statt ihn pro
  Block neu zu schätzen.
- **Rückblick über Zeit**: Streuung pro Drill über Wochen, statt nur den
  Bestwert.
