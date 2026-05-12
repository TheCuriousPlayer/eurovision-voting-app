import { getServerSession } from 'next-auth';
import { authOptions, getIsGMCheckData, isGM } from '@/lib/auth';
import ClientPage from './ClientPage';
import NotGMRedirect from './NotGMRedirect';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email || '';
  const { gmEmails, adminEmails, normalized } = getIsGMCheckData(userEmail);
  const isGMUser = isGM(userEmail);

  if (!isGMUser) {
    // Not a GM — show message before redirecting to home
    return <NotGMRedirect gmEmails={gmEmails} adminEmails={adminEmails} normalized={normalized} />;
  }

  return <ClientPage />;
}
