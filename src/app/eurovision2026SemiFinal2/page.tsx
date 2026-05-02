import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ClientPage from './ClientPage';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email || '';

  const gmRaw = process.env.GM_EMAILS_DEFAULT || '';
  const gmEmails = gmRaw.split(',').map(e => e.trim()).filter(Boolean);

  const isGM = userEmail && gmEmails.includes(userEmail);

  if (!isGM) {
    // Not a GM — redirect to home
    redirect('/');
  }

  return <ClientPage />;
}
