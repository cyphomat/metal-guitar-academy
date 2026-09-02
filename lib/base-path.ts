/**
 * The subdirectory the app is served from — empty locally, "/metal-guitar-academy"
 * on GitHub Pages. Inlined at build time from NEXT_PUBLIC_BASE_PATH.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/**
 * Prefixes a path from `public/`.
 *
 * Next rewrites asset URLs it generates, but not strings we hand to browser
 * APIs at runtime — the audio worklet, the service worker. Those need this.
 */
export function asset(path: string): string {
  return `${BASE_PATH}${path}`
}
