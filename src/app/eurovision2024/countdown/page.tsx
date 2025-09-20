'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Countdown from '@/components/Countdown';
import VoteController from '@/components/VoteController';

export default function CountDownPage() {
  const pathname = usePathname();
  const year = pathname.match(/eurovision(20\d{2})/)?.[1] || '2024';
  const { data: session } = useSession();
  
  // Sayfa yapılandırması için state
  const [config, setConfig] = useState({
    status: false,
    showCountDown: '',
    mode: 'visible',
    isGM: false
  });
  
  // Sunucudan yapılandırmayı al
  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch(`/api/config/vote-config?year=${year}`);
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error('Yapılandırma yüklenirken hata:', error);
      }
    }
    
    fetchConfig();
  }, [year, session]);

  // Vote controller'ı yapılandır
  const voteController = VoteController({
    mode: config.mode as 'visible' | 'hide' | 'gm-only',
    isGM: config.isGM,
    showResultsProp: false
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-8">
          Eurovision <span className="text-yellow-400">{year}</span> — Oylama Başlıyor
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sol Kolon - Geri Sayım */}
          <div className="md:col-span-2">
            <Countdown 
              targetDateStr={config.showCountDown}
              onComplete={() => {
                // Geri sayım tamamlandığında sayfayı yenile
                window.location.reload();
              }} 
            />
          </div>
          
          {/* Sağ Kolon - Oylama Kontrolü */}
          <div className="md:col-span-1">
            <voteController.SignInPrompt />
          </div>
        </div>
      </div>
    </div>
  );
}
