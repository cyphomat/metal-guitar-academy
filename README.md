<p align="center">
  <img src="assets/banner.svg" alt="Riffforge" width="100%">
</p>

<p align="center">
  <a href="https://cyphomat.github.io/metal-guitar-academy/"><img alt="App öffnen" src="https://img.shields.io/badge/App-öffnen-e8a23d?style=for-the-badge&labelColor=17161b"></a>
  <img alt="Tests" src="https://img.shields.io/badge/Tests-71%20grün-7fa65c?style=for-the-badge&labelColor=17161b">
  <img alt="Offline" src="https://img.shields.io/badge/Offline-läuft-6f93ad?style=for-the-badge&labelColor=17161b">
  <img alt="Abhängigkeiten" src="https://img.shields.io/badge/Abhängigkeiten-6-a7a3ab?style=for-the-badge&labelColor=17161b">
</p>

<p align="center">
  <b>Eine Übungs-App für eine Person.</b><br>
  Kein Kurskatalog. Starten, fünfzehn Minuten spielen, fertig — morgen wieder.
</p>

<p align="center">
  <sub>100% vibe coded. Nutzung auf eigene Gefahr. Featurewünsche gerne gesehen.</sub>
</p>

---

## So sieht es aus

<table>
<tr>
<td width="33%"><img src="assets/screens/heute.png" alt="Startbildschirm mit der Ansage"></td>
<td width="33%"><img src="assets/screens/block.png" alt="Ein Block während der Session"></td>
<td width="33%"><img src="assets/screens/timing.png" alt="Timing-Auswertung nach dem Block"></td>
</tr>
<tr>
<td align="center"><b>Die Ansage</b><br><sub>Was heute dran ist, und warum</sub></td>
<td align="center"><b>Im Block</b><br><sub>Uhr, Tempo, Tab, Metronom</sub></td>
<td align="center"><b>Danach</b><br><sub>Was das Mikrofon gehört hat</sub></td>
</tr>
</table>

<sub>Echte Bildschirme mit Beispieldaten, aufgenommen über <code>tools/shots.mjs</code>. Keine Mockups — die Timing-Werte oben stammen aus einer echten Messung.</sub>

---

## Wie eine Session abläuft

Immer dieselbe Form, damit sie keine Entscheidung kostet:

```
Warm-up    2 min    Finger wach kriegen
Technik    ~6 min   eine Sache isoliert, mit Metronom
Riff       ~6 min   dieselbe Technik im musikalischen Kontext
Abschluss           Selbsteinschätzung — landet im Log
```

Am Ende: **Feierabend** oder **+5 Minuten**. Die Form ist fix, der Inhalt passt
sich an.

## Was sie dir sagt

Der Unterschied zu einem Metronom mit Tab-Bildern: sie hat eine Meinung zum
heutigen Tag — aus dem Log, nicht aus dem Bauch.

- **Die Ansage** liest die letzte Session, die laufende Serie und die Pause davor
  und entscheidet zwischen `START`, `PAUSE`, `TECHNIK`, `SOLIDE` und `HART`. Jede
  Zeile ist im Log nachprüfbar:

  > **TECHNIK** — Heute sauber, nicht schnell.
  > *Gallop war zuletzt wackelig bei 95 BPM. Das Tempo bleibt, bis es sitzt.*

- **Ein wackeliger Block wiegt schwerer als drei saubere.** Was nicht sitzt,
  bestimmt den Ton — nicht der Durchschnitt.
- **Das Tempo schreibt sich fort.** Sauber durchgekommen heisst nächstes Mal
  schneller, gequält heisst langsamer. Wackelig heisst: dasselbe Tempo nochmal,
  denn genau dort passiert die Konsolidierung.
- **Was drankommt**, wählt der Scheduler nach zwei Kräften: was am schwächsten
  sitzt, und was am längsten her ist.
- **Ein Drill, den du kennst, kommt zweimal dran** — mit etwas anderem
  dazwischen. Das ist der [Kontextinterferenz-Effekt](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4989027/):
  verteilte Wiederholung behält sich messbar besser als eine lange am Stück,
  obwohl sie sich schlechter anfühlt. Ein **neuer** Drill bekommt seinen Block
  am Stück — beim Erlernen einer Bewegung ist das die bessere Reihenfolge.
- **Erst das Geschaffte, dann der Bericht.** Neue Bestwerte stehen nach der
  Session ganz oben.

## Was das Mikrofon hört

Zuschaltbar in jedem Block. Sie hört **Anschläge, keine Tonhöhen** — bei
verzerrter Gitarre ist Pitch-Tracking unzuverlässig, Transienten dagegen sind
eindeutig, und für Rhythmusarbeit ist der Einsatzzeitpunkt ohnehin die ganze
Frage.

Zwei Zahlen, die man nicht verwechseln darf:

| | |
|---|---|
| **Streuung** | Wie gleichmässig du bist. **Das** ist die Spielqualität, darauf baut der Score. |
| **Versatz** | Der konstante Abstand zum Klick. Steckt voller Laufzeit — Saite → Luft → Mikrofon → Puffer. Zählt **nicht** gegen dich. |

Der Versatz wird geschätzt, **bevor** zugeordnet wird. Ohne diesen Schritt
verfehlt bei Bluetooth-Kopfhörern (150–300 ms Latenz) jeder Ton seinen Klick,
und die Messung liest sich still als „nichts gehört".

Ein **negativer** Versatz ist übrigens kein Latenz-Artefakt: Laufzeit kann einen
Ton nur später machen, nie früher. Wer vorne liegt, spielt wirklich vorne — und
das sagt sie dann auch so.

Danach schlägt sie die Einschätzung selbst vor. Du kannst sie überstimmen.

> **Kopfhörer benutzen.** Über Lautsprecher hört das Mikrofon das Metronom mit
> und zählt es als Anschlag.

Es wird nichts aufgenommen und nichts hochgeladen — nur der Zeitpunkt jedes
Anschlags ausgewertet.

---

## Als App installieren

**iPhone / iPad** — in **Safari** öffnen (Chrome auf iOS kann das nicht),
Teilen → *Zum Home-Bildschirm*.

**Mac** — Safari 17+: *Ablage → Zum Dock hinzufügen*. In Chrome: Symbol in der
Adressleiste → *Installieren*.

Danach startet sie ohne Browserleiste, hat ein eigenes Icon und **läuft
offline** — nach dem ersten Aufruf liegt alles im Cache, eine Session braucht
kein Netz mehr.

Installieren lohnt auch aus einem weniger offensichtlichen Grund: Safari räumt
den Speicher normaler Webseiten nach sieben Tagen ohne Besuch auf. Für
Home-Screen-Apps gilt das nicht — dein Übungs-Log überlebt also nur, wenn du
sie wirklich installierst.

### Zwei iOS-Eigenheiten

- **Der Klingelschalter muss an sein.** iOS schaltet Web-Audio stumm, wenn das
  Gerät auf lautlos steht — das Metronom bleibt still, ohne Fehlermeldung. Das
  ist eine iOS-Eigenheit, kein Fehler der App.
- **Mikrofon braucht iOS 14.3 oder neuer.** Davor gab Safari im
  Home-Screen-Modus keinen Mikrofonzugriff frei.

## Daten

Der Übungsfortschritt liegt in `localStorage` auf dem Gerät. Kein Konto, kein
Server, nichts verlässt den Browser. Das heisst auch: **kein Sync.** iPhone und
Mac führen getrennte Logs.

Unter **Daten** holst du ihn als JSON heraus und wieder herein. Ein Import
**legt dazu, statt zu ersetzen**: Einträge sind unveränderlich und tragen Drill
und Zeitstempel, also ist die Vereinigung beider Seiten die richtige Antwort —
zwei Geräte, die unabhängig geübt haben, haben beide recht. Vor dem Übernehmen
zeigt die App, wie viel davon wirklich neu ist.

Dieselbe Verschmelzung trägt später den Abgleich über ein privates Datenrepo.

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

Die Logik in `lib/session/` und `lib/audio/timing.ts` ist rein: kein React,
keine Browser-APIs. Deshalb ist sie testbar, und deshalb liegen dort die Tests.
Neue Regeln zu Tempo, Auswahl oder Bewertung gehören dorthin, nicht in eine
Komponente.

Das Mikrofon braucht einen sicheren Kontext. `localhost` zählt als sicher, die
IP im Heimnetz **nicht** — zum Testen auf dem Handy also über die
veröffentlichte Seite gehen, nicht über `http://192.168.…`.

Neue Bildschirme für diese Seite:

```bash
pnpm build && (cd out && python3 -m http.server 3100 &)
node tools/shots.mjs
```

Architektur und Konventionen stehen in [CLAUDE.md](./CLAUDE.md).

## Deployment

Push auf `main` → GitHub Actions baut den statischen Export und veröffentlicht
ihn auf GitHub Pages ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)).
Der Workflow lässt nichts durch, was `pnpm check` reisst.

Pages liefert unter `/<repo>/` aus, deshalb setzt der Workflow
`NEXT_PUBLIC_BASE_PATH`. Pfade, die zur Laufzeit entstehen — das Audio-Worklet,
der Service Worker — müssen durch `asset()` aus `lib/base-path.ts`, sonst
greifen sie im Unterverzeichnis daneben.

## Inhalte

Alle Drills und Riffs sind **eigene** Übungen im jeweiligen Stil. Keine
abgeschriebenen Tabs, kein Audio urheberrechtlich geschützter Aufnahmen.

## Danke

Design-Sprache, Ton und die Idee der Ansage kommen von
[Setlist](https://github.com/cyphomat/setlist) — dem Schwesterprojekt fürs
Training. Kein Neon: ein Röhrenamp glimmt, er strahlt nicht.
