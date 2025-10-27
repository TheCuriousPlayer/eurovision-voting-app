'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Countdown from '@/components/Countdown';

export default function CountDownPage() {
  const pathname = usePathname();
  const year = pathname.match(/eurovision(20\d{2})/)?.[1] || '2020';
  const { data: session } = useSession();
  
  // Sayfa yapýlandýrmasý için state
  const [config, setConfig] = useState({
    status: true,
    showCountDown: '', // API'den alýnacak
    mode: 'hide',
    isGM: false
  });
  
  // Sunucudan yapýlandýrmayý al
  useEffect(() => {
    async function fetchConfig() {
      try {
        console.log(`[Countdown] Fetching config for year: ${year}`);
        const response = await fetch(`/api/config/vote-config?year=${year}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`[Countdown] API response:`, data);
          setConfig(data);
        }
      } catch (error) {
        console.error('Yapýlandýrma yüklenirken hata:', error);
      }
    }
    
    fetchConfig();
  }, [year, session]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-8">
          Eurovision <span className="text-yellow-400">{year}</span>
        </h1>
        
        <div className="mx-auto max-w-3xl">
          {/* Geri Sayým */}
          <div>
            <Countdown 
              targetDateStr={config.showCountDown}
              onComplete={() => {
                // Geri sayým tamamlandýðýnda sayfayý yenile
                window.location.reload();
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
