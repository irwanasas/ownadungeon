'use client';

import dynamic from 'next/dynamic';

const GameApp = dynamic(() => import('./GameApp'), { ssr: false });

export default function Page() {
  return <GameApp />;
}
