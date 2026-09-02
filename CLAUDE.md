# Metal Guitar Academy

Eine Übungs-App für Metal-Gitarre. Kein Kurskatalog — eine **Session-Maschine**:
starten, ~15 Minuten üben, fertig, morgen wieder.

## Das Produktmodell

Eine Session ist immer gleich aufgebaut, damit sie keine Entscheidung kostet:

```
Warm-up    2 min    Finger wach kriegen
Technik    ~6 min   eine Sache isoliert, mit Metronom
Riff       ~6 min   dieselbe Technik im musikalischen Kontext
Abschluss           Selbsteinschätzung → landet im Log
```

Am Ende: *Feierabend* oder *Noch 5 Minuten*. Was in den Blöcken steckt,
entscheidet der Scheduler aus dem Übungs-Log — die **Form** ist fix, der
**Inhalt** passt sich an.

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
| `lib/storage/practice-log.ts` | localStorage, einziger Zugriffspunkt aufs Log |
| `components/session/*` | UI der Session |

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

## Inhalte und Recht

Alle Drills und Riffs sind **eigene** Übungen im jeweiligen Stil. Keine
abgeschriebenen Tabs, kein Audio urheberrechtlich geschützter Aufnahmen. Wenn
neue Inhalte dazukommen: bitte dabei bleiben.

## Befehle

```bash
pnpm dev      # Entwicklung
pnpm test     # Vitest (Logik in lib/session)
pnpm check    # tsc --noEmit && vitest run && next lint
pnpm build    # Produktions-Build
```

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
