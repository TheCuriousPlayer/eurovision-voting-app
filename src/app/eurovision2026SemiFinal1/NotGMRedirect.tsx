"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotGMRedirect({ gmEmails, adminEmails, normalized }: { gmEmails: string[]; adminEmails: string[]; normalized: string }) {
  const router = useRouter();

  useEffect(() => {
    window.alert(`check:\ngm=${gmEmails.join(', ')}\nadmin=${adminEmails.join(', ')}\ncurrent=${normalized}`);
    router.replace('/');
  }, [gmEmails, adminEmails, normalized, router]);

  return null;
}
