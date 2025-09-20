'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

// mode: 'visible' = herkes sonuçları görebilir, 'hide' = sonuçlar gizli, 'gm-only' = sadece GM görebilir
type ResultsViewMode = 'visible' | 'hide' | 'gm-only';

export default function VoteController({ 
  mode, 
  isGM, 
  showResultsProp = false 
}: { 
  mode: ResultsViewMode; 
  isGM?: boolean;
  showResultsProp?: boolean;
}) {
  const [showResults, setShowResults] = useState(showResultsProp);
  const pathname = usePathname();
  const year = pathname.match(/eurovision(20\d{2})/)?.[1] || '2022';
  
  // Sonuçları gösterme/gizleme işlevi
  const toggleShowResults = () => {
    const newShowResults = !showResults;
    setShowResults(newShowResults);
    localStorage.setItem(`eurovision${year}_showResults`, JSON.stringify(newShowResults));
  };
  
  // Kullanıcının ayarlarını yükle (localStorage'dan)
  useEffect(() => {
    const savedShowResults = localStorage.getItem(`eurovision${year}_showResults`);
    if (savedShowResults !== null) {
      setShowResults(JSON.parse(savedShowResults));
    }
  }, [year]);
  
  // Oturum açma bileşeni
  const SignInPrompt = () => (
    <div className="bg-[#2c3e50] rounded-lg p-6">
  <h2 className="text-2xl font-bold text-white mb-4">Oylarım</h2>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="bg-[#2a3846] border-2 border-dashed border-[#34495e] rounded-lg p-6 w-full">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">Please sign in to start voting</h3>
            <p className="text-gray-400 mb-6">Google ile giriş yaparak oy verin ve tercihlerinizi kaydedin</p>
            <button
              onClick={() => signIn('google')}
              className="bg-[#4285f4] hover:bg-[#3367d6] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
      
      {/* Mode'a göre Show Results butonunu göster/gizle */}
      {(mode === 'visible' || mode === 'hide' || (mode === 'gm-only' && isGM)) && (
        <button
          onClick={toggleShowResults}
          className={`mt-4 w-full py-2 px-4 rounded font-medium transition-colors ${
            showResults 
              ? 'bg-[#e74c3c] hover:bg-[#c0392b] text-white' 
              : 'bg-[#3498db] hover:bg-[#2980b9] text-white'
          }`}
        >
          {showResults ? 'Hide Results' : 'Show Results'}
        </button>
      )}
    </div>
  );
  
  return {
    showResults,
    setShowResults,
    toggleShowResults,
    SignInPrompt
  };
}
