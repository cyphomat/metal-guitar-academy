# Metal Guitar Academy

Eine Übungs-App für Metal-Gitarre, gebaut um eine einzige Gewohnheit:
**starten, fünfzehn Minuten spielen, fertig.** Wenn du magst, hängst du
Minuten dran — aber die Session ist auch nach fünfzehn ein abgeschlossenes
Ding.

Läuft komplett im Browser, ohne Server und ohne Konto. Als App
installierbar auf iPhone, iPad und Mac.

---

## Wie eine Session abläuft

Immer dieselbe Form, damit sie keine Entscheidung kostet:

1. **Warm-up** (2 Min) — Finger wach kriegen
2. **Technik** (~6 Min) — eine Sache isoliert, mit Metronom
3. **Riff** (~6 Min) — dieselbe Technik im musikalischen Zusammenhang
4. **Abschluss** — kurz einschätzen, wie es lief

Die Einschätzung ist der Motor: Wer sauber durchkommt, startet nächstes Mal
schneller; wer sich quält, langsamer. Was drankommt, wählt die App aus dem
Übungs-Log — was am schwächsten sitzt oder am längsten her ist.

Am Ende: *Feierabend* oder *Noch 5 Minuten*.

## Timing messen

In jedem Block lässt sich das Mikrofon zuschalten. Die App hört dann deine
Anschläge und vergleicht sie mit dem Metronom. Zwei Zahlen, die man nicht
verwechseln darf:

| | |
|---|---|
| **Streuung** | Wie gleichmäßig du bist. **Das** ist die Spielqualität, darauf baut der Score. |
| **Versatz** | Konstanter Abstand zum Klick. Darin steckt die Laufzeit bis ins Mikrofon — zählt nicht gegen dich. |

Danach schlägt die App die Einschätzung selbst vor. Du kannst sie überstimmen.

Sie hört **Anschläge, keine Tonhöhen**: bei verzerrter Gitarre ist
Pitch-Tracking unzuverlässig, Transienten dagegen sind eindeutig — und für
Rhythmusarbeit ist der Einsatzzeitpunkt ohnehin die ganze Frage. Es wird
nichts aufgenommen und nichts hochgeladen, nur der Zeitpunkt jedes Anschlags
ausgewertet.

> **Kopfhörer benutzen.** Über Lautsprecher hört das Mikrofon das Metronom mit
> und zählt es als Anschlag.

---

## Als App installieren

**iPhone / iPad** — in **Safari** öffnen (Chrome auf iOS kann das nicht),
Teilen-Symbol → *Zum Home-Bildschirm*.

**Mac** — Safari 17+: *Ablage → Zum Dock hinzufügen*. In Chrome: Symbol in der
Adressleiste → *Installieren*.

Danach startet sie ohne Browserleiste, hat ein eigenes Icon und **läuft
offline** — nach dem ersten Aufruf liegt alles im Cache, eine Session braucht
kein Netz mehr.

Installieren lohnt auch aus einem weniger offensichtlichen Grund: Safari räumt
den Speicher normaler Webseiten nach sieben Tagen ohne Besuch auf. Für
Home-Screen-Apps gilt das nicht — dein Übungs-Log überlebt also nur, wenn du
sie wirklich installierst.

### Was du auf dem iPhone wissen musst

- **Der Klingelschalter muss an sein.** iOS schaltet Web-Audio stumm, wenn das
  Gerät auf lautlos steht — das Metronom bleibt dann still, ohne Fehlermeldung.
  Das ist eine iOS-Eigenheit, kein Fehler der App.
- **Mikrofon braucht iOS 14.3 oder neuer.** Davor gab Safari im
  Home-Screen-Modus keinen Mikrofonzugriff frei.
- Beim ersten Antippen von *Timing messen* fragt iOS nach der Erlaubnis.

---

## Daten

Der Übungsfortschritt liegt in `localStorage` auf dem Gerät. Kein Konto, kein
Server, nichts verlässt den Browser. Das heißt auch: **kein Sync.** iPhone und
Mac führen getrennte Logs, und ein geleerter Browserspeicher ist weg.

---

## Entwicklung

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

```bash
pnpm test         # Vitest — die Logik in lib/session und lib/audio
pnpm check        # Typen, Tests und Lint in einem Rutsch
pnpm build        # statischer Export nach out/
```

Das Mikrofon braucht einen sicheren Kontext. `localhost` zählt als sicher,
die IP im Heimnetz **nicht** — zum Testen auf dem Handy also über die
veröffentlichte Seite gehen, nicht über `http://192.168.…`.

Architektur und Konventionen stehen in [CLAUDE.md](./CLAUDE.md).

## Deployment

Push auf `main` → GitHub Actions baut den statischen Export und veröffentlicht
ihn auf GitHub Pages ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)).
Der Workflow lässt nichts durch, was `pnpm check` reisst.

Einmalig einzurichten: **Settings → Pages → Source: GitHub Actions.**

Pages liefert unter `/<repo>/` aus, deshalb setzt der Workflow
`NEXT_PUBLIC_BASE_PATH`. Pfade, die zur Laufzeit entstehen — das Audio-Worklet,
der Service Worker — müssen durch `asset()` aus `lib/base-path.ts`, sonst
greifen sie im Unterverzeichnis daneben.

## Inhalte

Alle Drills und Riffs sind eigene Übungen im jeweiligen Stil — keine
abgeschriebenen Tabs, kein fremdes Audio.
