import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions, isGM } from '@/lib/auth';
import ClientPage from './ClientPage';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email || '';

  const isGMUser = isGM(userEmail);

  if (!isGMUser) {
    // Not a GM — redirect to home
    redirect('/');
  }

  return <ClientPage />;
}
