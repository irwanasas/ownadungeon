'use client';

import dynamic from 'next/dynamic';

// The game is a fully client-side, localStorage-backed browser game with
// no server data needs — rendering it only on the client avoids any
// server/client markup mismatch for content that direct DOM manipulation
// (not React state) controls after mount.
const GameApp = dynamic(() => import('./GameApp.js'), { ssr: false });

export default function Page() {
  return <GameApp />;
}
