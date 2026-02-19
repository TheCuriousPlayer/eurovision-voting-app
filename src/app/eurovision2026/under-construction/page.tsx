'use client';


import { formatNumber } from '@/utils/formatNumber';
import EurovisionNavigation from '@/components/EurovisionNavigation';
import PageReadySignal from '@/components/PageReadySignal';

export default function UnderConstruction() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-8">
      <PageReadySignal />
      <div className="container mx-auto px-4">
        <EurovisionNavigation currentYear={2026} />
        
        <div className="flex items-center justify-center mt-16">
          <div className="bg-[#2c3e50] rounded-lg p-8 max-w-xl text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Sayfa Yapım Aşamasında</h1>
            <p className="text-gray-300">Bu sayfa geçici olarak devre dışı bırakılmıştır. Lütfen daha sonra tekrar kontrol edin.</p>
            <p className="text-3xl font-bold text-gray-300 mb-4">🚧🚧🚧🚧</p>
            <h1 className="text-3xl font-bold text-white mb-4">This Page is Under Construction</h1>
            <p className="text-gray-300">This page is temporarily disabled while we make improvements. Please check back soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
