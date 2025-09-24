import type { Metadata } from 'next'
import './globals.css'

// Note: Google Fonts temporarily disabled for static export compatibility
// Will be re-enabled with proper fallbacks in production
const geistSans = {
  variable: '--font-geist-sans'
}

const geistMono = {
  variable: '--font-geist-mono'
}

export const metadata: Metadata = {
  metadataBase: new URL('https://ncalteen.github.io/copilot-snake'),
  title: 'Snake Game | GitHub Copilot Demo',
  description:
    'A classic Snake game built with Next.js and GitHub Copilot. Test your skills and see how high you can score!',
  keywords: [
    'snake game',
    'github copilot',
    'nextjs',
    'react',
    'game',
    'classic games'
  ],
  authors: [{ name: 'Nick Alteen', url: 'https://github.com/ncalteen' }],
  openGraph: {
    title: 'Snake Game | GitHub Copilot Demo',
    description: 'A classic Snake game built with Next.js and GitHub Copilot',
    type: 'website',
    url: 'https://ncalteen.github.io/copilot-snake',
    siteName: 'GitHub Copilot Snake Game',
    images: [
      {
        url: '/favicon.ico',
        width: 32,
        height: 32,
        alt: 'Snake Game Icon'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'Snake Game | GitHub Copilot Demo',
    description: 'A classic Snake game built with Next.js and GitHub Copilot'
  },
  robots: 'index, follow'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
