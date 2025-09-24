import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: 'export',
  // Set base path for GitHub Pages deployment
  basePath: '/copilot-snake',
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  // Trailing slash for GitHub Pages compatibility
  trailingSlash: true,
  // Disable server-side features for static export
  distDir: 'out'
}

export default nextConfig
