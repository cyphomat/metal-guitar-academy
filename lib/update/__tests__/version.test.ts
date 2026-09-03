import { describe, expect, it } from "vitest"
import {
  compareBuilds,
  isFork,
  shortCommit,
  UPSTREAM,
  UPSTREAM_PAGE_SIZE,
  upstreamNews,
  type BuildStamp,
} from "@/lib/update/version"

function stamp(overrides: Partial<BuildStamp> = {}): BuildStamp {
  return {
    commit: "0b4920518997b62d2bbcd9a3703d6455d6a15aee",
    committedAt: "2026-09-03T04:24:08+00:00",
    repo: UPSTREAM,
    ...overrides,
  }
}

describe("compareBuilds", () => {
  it("nennt gleiche Commits aktuell", () => {
    expect(compareBuilds(stamp(), stamp())).toBe("aktuell")
  })

  it("erkennt einen neueren Stand auf dem Server", () => {
    const deployed = stamp({ commit: "ffffffff", committedAt: "2026-09-04T10:00:00+00:00" })
    expect(compareBuilds(stamp(), deployed)).toBe("neuer-da")
  })

  it("erkennt einen zurückgerollten Server", () => {
    const deployed = stamp({ commit: "aaaaaaaa", committedAt: "2026-08-30T10:00:00+00:00" })
    expect(compareBuilds(stamp(), deployed)).toBe("zurueckgerollt")
  })

  it("sagt unbekannt, statt sich etwas auszudenken", () => {
    expect(compareBuilds(null, stamp())).toBe("unbekannt")
    expect(compareBuilds(stamp(), null)).toBe("unbekannt")
    expect(compareBuilds(stamp({ commit: "" }), stamp())).toBe("unbekannt")
  })

  it("hält einen unlesbaren Zeitpunkt für neuer, nicht für gleich", () => {
    // Im Zweifel anbieten, neu zu laden: eine verpasste Aktualisierung ist
    // schlimmer als eine überflüssige.
    const deployed = stamp({ commit: "ffffffff", committedAt: "irgendwann" })
    expect(compareBuilds(stamp(), deployed)).toBe("neuer-da")
  })
})

describe("isFork", () => {
  it("hält das Original nicht für einen Fork", () => {
    expect(isFork(stamp())).toBe(false)
  })

  it("kennt den alten Repo-Namen als dasselbe Original", () => {
    expect(isFork(stamp({ repo: "cyphomat/metal-guitar-academy" }))).toBe(false)
  })

  it("erkennt einen fremden Fork", () => {
    expect(isFork(stamp({ repo: "jemand/riffforge" }))).toBe(true)
  })

  it("behauptet ohne Stempel nichts", () => {
    expect(isFork(null)).toBe(false)
    expect(isFork(stamp({ repo: "" }))).toBe(false)
  })
})

describe("upstreamNews", () => {
  const eigener = stamp()

  it("meldet nichts, wenn nichts da ist", () => {
    expect(upstreamNews([], eigener)).toEqual({ commits: 0, newest: null, capped: false })
  })

  it("zählt den eigenen Commit nicht mit", () => {
    // GitHub liefert bei ?since= den Randfall auf die Sekunde genau mit.
    const news = upstreamNews([{ sha: eigener.commit, date: eigener.committedAt }], eigener)
    expect(news.commits).toBe(0)
  })

  it("zählt und nennt den jüngsten Zeitpunkt", () => {
    const news = upstreamNews(
      [
        { sha: "a", date: "2026-09-04T09:00:00Z" },
        { sha: "b", date: "2026-09-05T11:30:00Z" },
        { sha: "c", date: "2026-09-04T20:00:00Z" },
      ],
      eigener,
    )
    expect(news.commits).toBe(3)
    expect(news.newest).toBe("2026-09-05T11:30:00.000Z")
    expect(news.capped).toBe(false)
  })

  it("sagt es, wenn die Seite voll war", () => {
    const viele = Array.from({ length: UPSTREAM_PAGE_SIZE }, (_, index) => ({
      sha: `sha-${index}`,
      date: "2026-09-04T09:00:00Z",
    }))
    expect(upstreamNews(viele, eigener).capped).toBe(true)
  })

  it("kommt mit unlesbaren Zeitpunkten klar", () => {
    const news = upstreamNews([{ sha: "a", date: "kaputt" }], eigener)
    expect(news.commits).toBe(1)
    expect(news.newest).toBeNull()
  })
})

describe("shortCommit", () => {
  it("kürzt auf sieben Zeichen wie git", () => {
    expect(shortCommit(stamp().commit)).toBe("0b49205")
  })
})
