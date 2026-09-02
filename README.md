# Metal Guitar Academy

Eine Übungs-App für Metal-Gitarre, gebaut um eine einzige Gewohnheit:
**starten, fünfzehn Minuten spielen, fertig.** Wenn du magst, hängst du
Minuten dran — aber die Session ist auch nach fünfzehn ein abgeschlossenes
Ding.

## Wie eine Session abläuft

Immer dieselbe Form, damit sie keine Entscheidung kostet:

1. **Warm-up** (2 Min) — Finger wach kriegen
2. **Technik** (~6 Min) — eine Sache isoliert, mit Metronom
3. **Riff** (~6 Min) — dieselbe Technik im musikalischen Zusammenhang
4. **Abschluss** — kurz einschätzen, wie es lief

Die Einschätzung ist der Motor: Wer sauber durchkommt, startet nächstes Mal
schneller; wer sich quält, langsamer. Was drankommt, wählt die App aus dem
Übungs-Log — was am schwächsten sitzt oder am längsten her ist.

## Timing messen

In jedem Block lässt sich das Mikrofon zuschalten. Die App hört dann deine
Anschläge und vergleicht sie mit dem Metronom: wie viele Klicks du getroffen
hast, und vor allem wie **gleichmäßig**. Die Streuung ist das Maß — ein
konstanter Versatz ist grösstenteils Laufzeit bis ins Mikrofon und zählt nicht
gegen dich.

Danach schlägt die App die Einschätzung selbst vor. Du kannst sie überstimmen.

**Kopfhörer benutzen.** Über Lautsprecher hört das Mikrofon das Metronom mit
und zählt es als Anschlag. Nichts davon verlässt dein Gerät — es wird nichts
aufgenommen und nichts hochgeladen, nur der Zeitpunkt jedes Anschlags
ausgewertet.

## Loslegen

```bash
pnpm install
pnpm dev
```

Dann [localhost:3000](http://localhost:3000) öffnen und auf *Session starten*
drücken. Ton kommt erst nach dem ersten Klick — Browser starten Audio nicht
von selbst.

Der Übungsfortschritt liegt in `localStorage` im Browser. Kein Konto, kein
Server, nichts verlässt das Gerät. Andere Browser oder ein geleerter Cache
heissen: von vorn.

## Entwicklung

```bash
pnpm test     # Vitest — die Logik in lib/session
pnpm check    # Typen, Tests und Lint in einem Rutsch
pnpm build    # Produktions-Build
```

Architektur, Konventionen und der Stand der Baustelle stehen in
[CLAUDE.md](./CLAUDE.md).

## Inhalte

Alle Drills und Riffs sind eigene Übungen im jeweiligen Stil — keine
abgeschriebenen Tabs, kein fremdes Audio.
