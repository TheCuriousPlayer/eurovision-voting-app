import type { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Yeni Oylama Sistemi | Eurovision Türkiye',
  description:
    "YouTube yorumlarıyla Eurovision'a oy kullanın. :oy:, :oylarım: veya :vote: komutlarını kullanarak oylarınızı gönderin.",
};

export default function Page() {
  return <ClientPage />;
}
