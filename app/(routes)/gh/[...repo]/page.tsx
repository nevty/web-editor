'use client';

import dynamic from 'next/dynamic';

const WebEditor = dynamic(() => import('./components'), { ssr: false });

export default function WebEditorPage({
  params,
}: {
  params: { repo: string[] };
}) {
  return <WebEditor repoPath={params.repo} />;
}
WebEditorPage.displayName = 'WebEditorPage';
