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
| `lib/audio/metronome.ts` | Web-Audio-Lookahead-Scheduler. Framework-frei, kein React. |
| `lib/session/types.ts` | Domänen-Typen + Zod-Schemas für alles Persistierte |
| `lib/session/drills.ts` | Der Übungs-Katalog (reine Daten) |
| `lib/session/progress.ts` | Auswertung des Logs: Tempo-Fortschreibung, Streak, Mastery |
| `lib/session/builder.ts` | Wählt aus, was heute drankommt |
| `lib/storage/practice-log.ts` | localStorage, einziger Zugriffspunkt aufs Log |
| `components/session/*` | UI der Session |
| `app/theory/*` | Theorie-Texte, aus dem ursprünglichen v0-Stand übernommen |

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

## Wo es weitergeht

- **Mikrofon-Input**: Onset-Erkennung gegen das Metronom, um Timing wirklich zu
  messen statt danach zu fragen. `components/rhythm-trainer.tsx` enthält bereits
  das Scoring-Modell für Tap-Timing — dort ansetzen.
- `utils/music-theory-validator.ts` ist korrekt und aktuell ungenutzt; gedacht
  für Ton-/Akkord-Prüfung, sobald das Mikrofon dran ist.
