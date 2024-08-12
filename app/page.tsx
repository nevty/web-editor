// eslint-disable-next-line import/no-internal-modules
import { redirect } from 'next/navigation';

export default async function Home() {
  redirect(`/gh/${process.env.NEXT_PUBLIC__DEFAULT_GITHUB_REPO || ''}`);
}
