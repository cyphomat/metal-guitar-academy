#!/usr/bin/env node
/**
 * Writes the build stamp, twice.
 *
 * `public/version.json` ships as a plain file and says what is *deployed right
 * now*. `.env.production.local` is baked into the bundle and says what is
 * *running*. Comparing the two is the whole update check: if they disagree,
 * the browser is holding an old bundle.
 *
 * One source, two destinations — writing them separately is how they drift.
 *
 * Runs before every build (npm `prebuild`). Both files are generated and
 * therefore ignored by git.
 */
import { execFileSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function git(...args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim()
  } catch {
    // A tarball without .git, or git missing. Better an honest blank than a
    // made-up commit: the app treats an empty stamp as "unknown" and stays quiet.
    return ""
  }
}

/**
 * Where this copy is deployed from. Actions provides it; locally we read the
 * origin remote. A fork gets its own name here, which is exactly how the app
 * later notices it is a fork.
 */
function repository() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY
  const url = git("config", "--get", "remote.origin.url")
  const match = url.match(/github\.com[:/]([^/]+\/[^/.]+)/)
  return match ? match[1] : ""
}

const stamp = {
  commit: git("rev-parse", "HEAD"),
  // Commit date, not build date: two builds of the same commit are the same
  // version, and a wall clock would claim otherwise.
  committedAt: git("show", "-s", "--format=%cI", "HEAD"),
  repo: repository(),
}

mkdirSync(join(root, "public"), { recursive: true })
writeFileSync(join(root, "public/version.json"), `${JSON.stringify(stamp, null, 2)}\n`)

writeFileSync(
  join(root, ".env.production.local"),
  [
    "# Erzeugt von tools/version.mjs — nicht von Hand ändern.",
    `NEXT_PUBLIC_COMMIT=${stamp.commit}`,
    `NEXT_PUBLIC_COMMITTED_AT=${stamp.committedAt}`,
    `NEXT_PUBLIC_REPO=${stamp.repo}`,
    "",
  ].join("\n"),
)

console.log(
  `Fassung: ${stamp.commit.slice(0, 7) || "unbekannt"} · ${stamp.repo || "kein Repo"} · ${stamp.committedAt || "kein Datum"}`,
)
