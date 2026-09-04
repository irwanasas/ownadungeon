'use client';

import dynamic from 'next/dynamic';

const ForgeApp = dynamic(() => import('./forge/ForgeApp'), { ssr: false });

export default function Page() {
  return <ForgeApp />;
}
