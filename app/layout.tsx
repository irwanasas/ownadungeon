import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './styles/tokens.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/raid.css';
import './styles/battle.css';
import './styles/preview.css';
import './styles/sidescroll.css';

export const metadata: Metadata = {
  title: 'MVP - Own a Dungeon'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
