import { BASE_PATH } from './config'

/**
 * Utility function to handle asset paths for GitHub Pages deployment
 * When deployed to GitHub Pages with a basePath, we need to prefix image paths
 */
export function getAssetPath(path: string): string {
  // In production, we need to prefix with the basePath for GitHub Pages
  const basePath = process.env.NODE_ENV === 'production' ? BASE_PATH : ''

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${basePath}${normalizedPath}`
}
