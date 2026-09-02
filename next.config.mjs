/**
 * Static export for GitHub Pages.
 *
 * Pages serves the site from a subdirectory named after the repository, so
 * every URL needs that prefix. Next rewrites the ones it generates itself;
 * paths we build at runtime have to go through `lib/base-path.ts`. Der
 * Workflow setzt NEXT_PUBLIC_BASE_PATH aus dem Repo-Namen — eine Umbenennung
 * zieht damit von selbst mit.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  // Pages resolves /session/ to session/index.html; without this it 404s.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
