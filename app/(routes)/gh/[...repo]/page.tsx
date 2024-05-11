'use client';

import dynamic from 'next/dynamic';

const WebEditor = dynamic(() => import('./components'), { ssr: false });

export default ({ params }: { params: { repo: string[] } }) => (
  <WebEditor repoPath={params.repo} />
);
