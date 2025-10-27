"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import { VOTE_CONFIG } from '@/config/eurovisionvariables';
import { eurovision2020DataGroupA, eurovision2020DataGroupFinal } from '@/data/eurovision2020';
import { useDisplayPreferences } from '@/contexts/DisplayPreferencesContext';

type Results = {
  countryPoints: { [country: string]: number };
  totalVotes: number;
  countryVoteCounts?: { [country: string]: number };
};

export default function Eurovision2020SemiFinalARevealPage() {
  // React hooks (always declared in the same order)
  const { data: session, status } = useSession();
  const { preferences } = useDisplayPreferences();
  const [results, setResults] = useState<Results | null>(null);
  const [orderedCountries, setOrderedCountries] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedVideoRange, setSelectedVideoRange] = useState<{ start: number; end: number } | null>(null);
  const videoCloseTimer = useRef<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealingCountry, setRevealingCountry] = useState<string | null>(null);
  const travelIntervalRef = useRef<number | null>(null);
  const [revealedCountries, setRevealedCountries] = useState<string[]>([]);
  const [isNetherlandsPlaying, setIsNetherlandsPlaying] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [resetCountdown, setResetCountdown] = useState(7);
  
  // Effects (declare immediately so hooks run unconditionally)
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/votes/2020/semi-final-a/public');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as Results;
        setResults(data);

        // Get all countries in alphabetical order
        const allCountries = Object.keys(eurovision2020DataGroupA).sort();
        setOrderedCountries(allCountries);
        setVisibleCount(0); // initial state: none visible
      } catch (err) {
        setError((err as Error).message || 'Failed to load results');
      }
    }

    load();
  }, []);

  // Play a short YouTube clip (open modal) whenever a new country is revealed
  useEffect(() => {
    // Trigger when the revealedCountries list grows
    if (!revealedCountries || revealedCountries.length === 0) return;

    const country = revealedCountries[revealedCountries.length - 1];
    if (!country) return;
    const ytId = eurovision2020DataGroupA[country]?.youtubeId;
    if (!ytId) return; // no video available

    // console.log('Revealed countries:', revealedCountries.length);
    // Clear previous timer if any
    if (videoCloseTimer.current) {
      window.clearTimeout(videoCloseTimer.current);
      videoCloseTimer.current = null;
    }

    // Determine start/end for this country (fallback to 0..5)
    const times = eurovision2020DataGroupA[country]?.times ?? { start: 0, end: 5 };

    setSelectedVideoRange(times);
    setSelectedVideoId(ytId);

    // Auto-close after the configured snippet duration (minimum 1s)
    const durationMs = Math.max(1000, (Math.max(times.end, times.start) - times.start) * 1000);
    videoCloseTimer.current = window.setTimeout(() => {
      setSelectedVideoId('');
      setSelectedVideoRange(null);
      videoCloseTimer.current = null;
      
      // Check if all countries have been revealed
      const totalCountries = Object.keys(eurovision2020DataGroupA).length;
      if (revealedCountries.length >= totalCountries) {
        // All countries revealed, play Netherlands video after 1 second
        setTimeout(() => {
          const netherlandsData = eurovision2020DataGroupFinal['Netherlands'];
          
          if (netherlandsData && netherlandsData.youtubeId && netherlandsData.times) {
            setIsNetherlandsPlaying(true);
            const netherlandsTimes = netherlandsData.times;
            setSelectedVideoRange(netherlandsTimes);
            setSelectedVideoId(netherlandsData.youtubeId);
            
            // Auto-close Netherlands video after duration
            const netherlandsDurationMs = Math.max(1000, (netherlandsTimes.end - netherlandsTimes.start) * 1000);
            videoCloseTimer.current = window.setTimeout(() => {
              setSelectedVideoId('');
              setSelectedVideoRange(null);
              videoCloseTimer.current = null;
              // setIsNetherlandsPlaying(false);
            }, netherlandsDurationMs);
          }
        }, 1000);
      }
    }, durationMs);

    // Cleanup if component unmounts before timer
    return () => {
      if (videoCloseTimer.current) {
        window.clearTimeout(videoCloseTimer.current);
        videoCloseTimer.current = null;
      }
    };
  }, [revealedCountries]);

  // Countdown effect for reset confirmation
  useEffect(() => {
    if (showResetConfirmation && resetCountdown > 0) {
      const timer = setTimeout(() => {
        setResetCountdown(resetCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showResetConfirmation, resetCountdown]);

  // Reveal helpers (must be declared unconditionally so hooks order is stable)
  function showNext() {
    if (isRevealing) return; // Prevent multiple clicks
    
    if (!results) return; // Wait for results to load
    
    const nextIndex = visibleCount;
    if (nextIndex >= orderedCountries.length) return;
    
    // Get unrevealed countries
    const unrevealedCountries = orderedCountries.filter(country => !revealedCountries.includes(country));
    if (unrevealedCountries.length === 0) return;
    
    // Calculate top 10 finalists to determine odd/even selection
    const allCountriesWithPoints = Object.entries(results.countryPoints || {})
      .map(([c, p]) => ({ country: c, points: p }))
      .sort((a, b) => b.points - a.points);
    const top10Countries = allCountriesWithPoints.slice(0, 10).map(c => c.country);
    
    // Determine if we should pick a finalist or eliminated country
    // Even clicks (0, 2, 4...) = finalists, Odd clicks (1, 3, 5...) = eliminated
    const clickNumber = revealedCountries.length;
    const isEvenClick = clickNumber % 2 === 0;
    
    // console.log('Click #', clickNumber, 'isEven:', isEvenClick, 'should pick:', isEvenClick ? 'FINALIST' : 'ELIMINATED');
    
    // Filter unrevealed countries by finalist status
    const finalistUnrevealed = unrevealedCountries.filter(country => top10Countries.includes(country));
    const eliminatedUnrevealed = unrevealedCountries.filter(country => !top10Countries.includes(country));
    
    // console.log('Finalist unrevealed:', finalistUnrevealed);
    // console.log('Eliminated unrevealed:', eliminatedUnrevealed);
    
    // Pick from the appropriate pool
    let finalCountry: string;
    if (isEvenClick && finalistUnrevealed.length > 0) {
      // Even click: pick a random finalist
      finalCountry = finalistUnrevealed[Math.floor(Math.random() * finalistUnrevealed.length)];
      // console.log('Picked FINALIST:', finalCountry);
    } else if (!isEvenClick && eliminatedUnrevealed.length > 0) {
      // Odd click: pick a random eliminated country
      finalCountry = eliminatedUnrevealed[Math.floor(Math.random() * eliminatedUnrevealed.length)];
      // console.log('Picked ELIMINATED:', finalCountry);
    } else {
      // Fallback: pick any unrevealed country if the preferred pool is empty
      finalCountry = unrevealedCountries[Math.floor(Math.random() * unrevealedCountries.length)];
      // console.log('Picked FALLBACK:', finalCountry);
    }
    
    // Set revealing state
    setIsRevealing(true);
    
    // Random duration between 2.3~3.8 seconds for the traveling effect
    const travelDuration = (23 + Math.random() * 15) * 100;
    
    // Travel effect: randomly jump between unrevealed countries with gradual slowdown
    let travelElapsed = 0;
    let currentInterval = 80; // Start at 80ms
    
    const jump = () => {
      const randomCountry = unrevealedCountries[Math.floor(Math.random() * unrevealedCountries.length)];
      setRevealingCountry(randomCountry);
      travelElapsed += currentInterval;
      
      if (travelElapsed >= travelDuration) {
        // Stop traveling and settle on the final country
        setRevealingCountry(finalCountry);

        // Show YouTube clip immediately when settled on final country
        const ytId = eurovision2020DataGroupA[finalCountry]?.youtubeId;
        if (ytId) {
          // Clear previous timer if any
          if (videoCloseTimer.current) {
            window.clearTimeout(videoCloseTimer.current);
            videoCloseTimer.current = null;
          }

          // Determine start/end for this country (fallback to 0..5)
          const times = eurovision2020DataGroupA[finalCountry]?.times ?? { start: 0, end: 5 };
          
          setSelectedVideoRange(times);
          setSelectedVideoId(ytId);

          // Auto-close after the configured snippet duration (minimum 1s)
          const durationMs = Math.max(1000, (Math.max(times.end, times.start) - times.start) * 1000);
          videoCloseTimer.current = window.setTimeout(() => {
            setSelectedVideoId('');
            setSelectedVideoRange(null);
            videoCloseTimer.current = null;
          }, durationMs);
        }

        // After currentInterval ms of fire chain on final country, finalize the reveal
        setTimeout(() => {
          setRevealedCountries(prev => [...prev, finalCountry]);
          setVisibleCount((v) => v + 1);
          setRevealingCountry(null);
          setIsRevealing(false);
        }, currentInterval);
      } else {
        // Gradually slow down - increase interval by 10ms each jump
        currentInterval += 10;
        travelIntervalRef.current = window.setTimeout(jump, currentInterval);
      }
    };
    
    // Start the first jump immediately
    jump();
  }

  function resetAll() {
    // Clear any ongoing travel timeout
    if (travelIntervalRef.current) {
      window.clearTimeout(travelIntervalRef.current);
      travelIntervalRef.current = null;
    }
    // Clear video timer/modal if open
    if (videoCloseTimer.current) {
      window.clearTimeout(videoCloseTimer.current);
      videoCloseTimer.current = null;
    }
    setSelectedVideoId('');
    setSelectedVideoRange(null);

    setRevealedCountries([]);
    setVisibleCount(0);
    setIsRevealing(false);
    setRevealingCountry(null);
    setIsNetherlandsPlaying(false);
    setShowResetConfirmation(false);
    setResetCountdown(7);
  }

  function handleResetClick() {
    setShowResetConfirmation(true);
    setResetCountdown(7);
  }

  function handleCancelReset() {
    setShowResetConfirmation(false);
    setResetCountdown(7);
  }

  // Access control helpers (derived from session)
  const userEmail = session?.user?.email ?? '';
  const gmList = VOTE_CONFIG?.['202001']?.GMs
    ? VOTE_CONFIG['202001'].GMs.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : [];
  const isGM = userEmail ? gmList.includes(userEmail.toLowerCase()) : false;

  // Access control: show sign-in or denied messages for non-GMs
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4">Bu sayfa yalnızca yönetici (GM) erişimine açıktır.</p>
          <button
            onClick={() => signIn('google', { callbackUrl: `${window.location.origin}/eurovision2020/semi-final-a-reveal` })}
            className="px-4 py-2 bg-[#4a90e2] text-white rounded"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  if (!isGM) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Erişim reddedildi</h2>
          <p>Bu sayfaya erişim yetkiniz yok. Eğer yetkiliyseniz lütfen GM listesini kontrol edin.</p>
        </div>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-8">
      <div className="container mx-auto px-4">
        <style>{`
          
          @keyframes goldenShine {
            0% { 
              background-position: -200% 0;
            }
            100% { 
              background-position: 200% 0;
            }
          }
          
          @keyframes goldenSparkle {
            0%, 100% { 
              box-shadow: 
                0 0 10px rgba(255, 215, 0, 0.4),
                0 0 20px rgba(255, 200, 0, 0.3),
                inset 0 0 15px rgba(255, 215, 0, 0.2);
            }
            50% { 
              box-shadow: 
                0 0 20px rgba(255, 215, 0, 0.6),
                0 0 30px rgba(255, 200, 0, 0.5),
                inset 0 0 25px rgba(255, 215, 0, 0.3);
            }
          }
          
          .golden-ticket {
            background: linear-gradient(135deg, 
              #d4af37 0%,
              #f4e5a1 25%,
              #ffd700 50%,
              #f4e5a1 75%,
              #d4af37 100%
            );
            border: 4px solid rgba(220, 220, 220, 0.1);
            position: relative;
            overflow: hidden;
            animation: goldenSparkle 2s ease-in-out infinite;
          }
          
          .golden-ticket::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(110deg, 
              transparent 0%,
              transparent 35%,
              rgba(255, 255, 255, 0.1) 40%,
              rgba(255, 255, 255, 0.3) 45%,
              rgba(255, 255, 255, 0.5) 50%,
              rgba(255, 255, 255, 0.3) 55%,
              rgba(255, 255, 255, 0.1) 60%,
              transparent 65%,
              transparent 100%
            );
            background-size: 200% 100%;
            animation: goldenShine 3s linear infinite;
            pointer-events: none;
            z-index: 1; /* lowest overlay above card */
          }
          
          .golden-ticket::after {
            content: '✓';
            position: absolute;
            top: 50%;
            right: 8px;
            transform: translateY(-50%);
            font-size: 20px;
            font-weight: bold;
            color: #8b6914;
            text-shadow: 0 0 4px rgba(255, 215, 0, 0.8);
            pointer-events: none;
            z-index: 5; /* keep checkmark above everything including chain */
          }
          
          /* When golden-ticket has chain-effect, move checkmark to a different approach */
          .golden-ticket.chain-effect::after {
            content: '✓';
            /* Chain uses ::after, so checkmark needs to be handled differently */
            /* We'll render checkmark via inline element instead */
            display: none;
          }
          
          .golden-ticket > * {
            position: relative;
            z-index: 4; /* ensure content sits above golden shine */
          }
          
          .golden-ticket .country-name {
            color: #000000 !important;
            font-weight: 600;
            text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
          }
          @keyframes fireChain {
            0% {
              box-shadow: 0 0 10px rgba(255,140,0,0.8), 0 0 20px rgba(255,69,0,0.6);
            }
            50% {
              box-shadow: 0 0 18px rgba(255,215,0,0.9), 0 0 36px rgba(255,140,0,0.7);
            }
            100% {
              box-shadow: 0 0 10px rgba(255,140,0,0.8), 0 0 20px rgba(255,69,0,0.6);
            }
          }
          
          @keyframes fireFlicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.85; }
          }
          
          .chain-effect {
            animation: fireChain 0.6s ease-in-out infinite, fireFlicker 0.3s ease-in-out infinite;
            border: 4px solid rgba(255, 140, 0, 0.8);
            position: relative;
            /* Do not change element brightness or inset shadows to avoid overriding background gradients */
          }
          
          .chain-effect::after {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: inherit;
            border: 3px solid transparent;
            background: linear-gradient(90deg,
              rgba(255,69,0,0.8) 0%,
              rgba(255,140,0,0.9) 25%,
              rgba(255,215,0,0.7) 50%,
              rgba(255,140,0,0.9) 75%,
              rgba(255,69,0,0.8) 100%
            ) border-box;
            -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            animation: firePulse 1.5s ease-in-out infinite;
            pointer-events: none;
            z-index: 3; /* chain sits above eliminated/golden overlays but under content */
          }

          .chain-effect > * {
            position: relative;
            z-index: 4; /* ensure flag/icon/text sits on top */
          }
          
          @keyframes firePulse {
            0%, 100% { 
              opacity: 0.8;
              inset: -4px;
            }
            50% { 
              opacity: 1;
              inset: -6px;
            }
          }
          
          @keyframes redGlowWave {
            0% { 
              background-position: 100% 0;
            }
            100% { 
              background-position: -100% 0;
            }
          }
          
          .eliminated-glow::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: linear-gradient(110deg, 
              transparent 0%,
              rgba(255, 30, 30, 0.01) 1%,
              rgba(255, 30, 30, 0.3) 5%,
              rgba(255, 30, 30, 0.5) 10%,
              rgba(255, 30, 30, 0.3) 15%,
              rgba(255, 30, 30, 0.5) 20%,
              rgba(255, 30, 30, 0.3) 25%,
              rgba(255, 30, 30, 0.5) 30%,
              rgba(255, 30, 30, 0.3) 35%,
              rgba(255, 30, 30, 0.5) 40%,
              rgba(255, 30, 30, 0.3) 45%,
              rgba(255, 30, 30, 0.5) 50%,
              rgba(255, 30, 30, 0.3) 55%,
              rgba(255, 30, 30, 0.5) 60%,
              rgba(255, 30, 30, 0.3) 65%,
              rgba(255, 30, 30, 0.5) 70%,
              rgba(255, 30, 30, 0.3) 75%,
              rgba(255, 30, 30, 0.5) 80%,
              rgba(255, 30, 30, 0.3) 85%,
              rgba(255, 30, 30, 0.5) 90%,
              rgba(255, 30, 30, 0.3) 95%,
              rgba(255, 30, 30, 0.01) 99%,
              transparent 100%
            );
            background-size: 200% 100%;
            animation: redGlowWave 100s linear infinite;
            pointer-events: none;
            z-index: 2; /* below chain, above golden */
          }
          
          .eliminated-glow {
            border: 4px solid rgba(220, 38, 38, 0.8);
            box-shadow: 0 0 8px rgba(220, 38, 38, 0.4);
          }
          
          .eliminated-glow > * {
            position: relative;
            z-index: 4; /* ensure content sits above eliminated glow */
          }
        `}</style>
        <div className="flex w-full max-w-6xl mx-auto p-4 h-full relative">
          {/* Left sidebar with title and controls */}
          <aside className="w-full md:w-72 mr-6 flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-4">Eurovision 2020 Yarı Final A</h1>

            {error && <div className="text-red-400 mb-3">Error: {error}</div>}

            <div className="flex flex-col gap-3 mb-4">
              <button
                onClick={showNext}
                className="px-4 py-2 bg-[#4a90e2] text-white rounded hover:brightness-110 disabled:opacity-50"
                disabled={!orderedCountries.length || revealedCountries.length >= orderedCountries.length || isRevealing}
              >
                {isRevealing ? 'Açıklanıyor...' : 'Rastgele Göster'}
              </button>
              <button
                onClick={handleResetClick}
                className="px-4 py-2 bg-[#e74c3c] text-white rounded hover:brightness-110 disabled:opacity-50"
                disabled={revealedCountries.length === 0}
              >
                Reset
              </button>
              
              {/* Reset Confirmation Modal */}
              {showResetConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-[#2c3e50] rounded-lg p-6 max-w-sm mx-4">
                    <h3 className="text-white text-lg font-semibold mb-4">
                      Başa dönmek istediğinizden emin misiniz?
                    </h3>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={handleCancelReset}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:brightness-110"
                      >
                        Hayır
                      </button>
                      <button
                        onClick={resetAll}
                        disabled={resetCountdown > 0}
                        className="px-4 py-2 bg-[#e74c3c] text-white rounded hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
                      >
                        {resetCountdown > 0 ? `Evet (${resetCountdown})` : 'Evet'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Holland Golden Card */}
              <div 
                onClick={() => {
                  const netherlandsData = eurovision2020DataGroupFinal['Netherlands'];
                  if (netherlandsData && netherlandsData.youtubeId && netherlandsData.times) {
                    const times = netherlandsData.times;
                    if (videoCloseTimer.current) {
                      window.clearTimeout(videoCloseTimer.current);
                      videoCloseTimer.current = null;
                    }
                    setSelectedVideoRange(times);
                    setSelectedVideoId(netherlandsData.youtubeId);
                    const durationMs = Math.max(1000, (times.end - times.start) * 1000);
                    videoCloseTimer.current = window.setTimeout(() => {
                      setSelectedVideoId('');
                      setSelectedVideoRange(null);
                      videoCloseTimer.current = null;
                    }, durationMs);
                  }
                }}
                className={`golden-ticket flex items-center justify-between p-2 rounded relative cursor-pointer hover:brightness-110 ${isNetherlandsPlaying ? 'chain-effect' : ''}`}
              >
                {/* Checkmark for Netherlands when chain is active */}
                {isNetherlandsPlaying && (
                  <span style={{
                    position: 'absolute',
                    top: '50%',
                    right: '8px',
                    transform: 'translateY(-50%)',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#8b6914',
                    textShadow: '0 0 4px rgba(255, 215, 0, 0.8)',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}>✓</span>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0">
                    <Image 
                      src="/flags/Netherlands_NL.png"
                      alt="Netherlands flag"
                      width={32}
                      height={21}
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs text-gray-600">Direct Finalist - (2019 winner)</span>
                    <span className="country-name text-sm font-semibold">Netherlands</span>
                    <span className="text-xs text-gray-700">Jeangu Macrooy</span>
                    <span className="text-xs text-gray-600">Grow</span>
                  </div>
                </div>
              </div>

              {/* YouTube video modal placed under Reset button */}
              {selectedVideoId && (
                <div className="mt-3">
                  <div className="bg-transparent rounded-lg shadow-none p-0 relative">
                    <iframe
                      key={selectedVideoId + (selectedVideoRange?.start || 0)}
                      width="300"
                      height="175"
                      src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&controls=0&vq=large${selectedVideoRange ? `&start=${selectedVideoRange.start}&end=${selectedVideoRange.end}` : '&start=0&end=5'}`}
                      title="Eurovision Song Reveal"
                      allowFullScreen
                      className="rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Countries Section - takes up remaining space */}
          <div className="flex-1">
            <div className="bg-[#2c3e50] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                <span>Ülkeler (Alfabetik) </span>
                <span className="text-sm font-normal">
                  | Tüm sıralama ve puanlar, final oyları belli olduktan sonra duyurulacaktır.
                </span>
              </h2>
              
              {/* Information text */}
              <div className="mb-3 p-2 bg-[#1a2332] rounded text-sm text-gray-300 space-y-1">
                <p>-&quot;Rastgele Göster&quot; önce 1 tane finalist, sonra 1 tane elenini gösterir.</p>
                <p>-Finalistlerin sıralaması ve puanları gösterilmez.</p>
                <p>-Elenenlerin sıralaması ve puanları gösterilir.</p>
                <p>-Gösterilen ülkelerin video kesitleri otomatik başlar. Başlamazsa ülke kartına tıklayarak denemeye devam edin.</p>
                <p>-Birden fazla hesapla kullanılan oylar yönetici tarafından temizlendi.</p>
                <p>* X puan (tüm kullanıcılardan alınan toplam puan)</p>
                <p>* 100% Σ (Tüm kullanıcılar 12 puan verirse)</p>
                <p>* 100% 👤 (Tüm kullanıcıların ilk 10 listesinde olursa)</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* First Column */}
                <div className="space-y-3">
                  {Object.keys(eurovision2020DataGroupA).sort().slice(0, 10).map((country) => {
                    const code = eurovision2020DataGroupA[country]?.code || 'XX';
                    const songInfo = eurovision2020DataGroupA[country];
                    const isRevealed = revealedCountries.includes(country);
                    const isCurrentlyRevealing = revealingCountry === country;
                    const lastRevealedCountry = revealedCountries[revealedCountries.length - 1];
                    const keepChain = !isNetherlandsPlaying && (isCurrentlyRevealing || (!isRevealing && isRevealed && country === lastRevealedCountry));
                    
                    // Calculate top 10 finalists (highest points)
                    const allCountriesWithPoints = Object.entries(results?.countryPoints || {})
                      .map(([c, p]) => ({ country: c, points: p }))
                      .sort((a, b) => b.points - a.points);
                    const top10Countries = allCountriesWithPoints.slice(0, 10).map(c => c.country);
                    const isFinalist = top10Countries.includes(country);
                    
                    return (
                      <div
                        key={country}
                        onClick={() => {
                          if (isRevealed) {
                            const ytId = eurovision2020DataGroupA[country]?.youtubeId;
                            if (ytId) {
                              const times = eurovision2020DataGroupA[country]?.times ?? { start: 0, end: 5 };
                              if (videoCloseTimer.current) {
                                window.clearTimeout(videoCloseTimer.current);
                                videoCloseTimer.current = null;
                              }
                              setSelectedVideoRange(times);
                              setSelectedVideoId(ytId);
                              const durationMs = Math.max(1000, (Math.max(times.end, times.start) - times.start) * 1000);
                              videoCloseTimer.current = window.setTimeout(() => {
                                setSelectedVideoId('');
                                setSelectedVideoRange(null);
                                videoCloseTimer.current = null;
                              }, durationMs);
                            }
                          }
                        }}
                        className={`flex items-center justify-between p-1 rounded relative ${
                          (isRevealed ? (isFinalist ? 'golden-ticket' : 'bg-gray-700 eliminated-glow') : 'bg-[#2a3846]')
                        } ${keepChain ? 'chain-effect' : ''} ${isRevealed ? 'cursor-pointer hover:brightness-110' : ''}`}
                        style={!isRevealed ? { border: '4px solid #2a3846' } : {}}
                      >
                        {/* Checkmark for golden tickets when chain is active (since chain uses ::after) */}
                        {isRevealed && isFinalist && keepChain && (
                          <span style={{
                            position: 'absolute',
                            top: '50%',
                            right: '8px',
                            transform: 'translateY(-50%)',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#8b6914',
                            textShadow: '0 0 4px rgba(255, 215, 0, 0.8)',
                            pointerEvents: 'none',
                            zIndex: 5
                          }}>✓</span>
                        )}
                        <div className="flex items-center gap-2">
                          {isRevealed && !isFinalist && (
                            <span className="text-lg font-bold text-red-300">
                              {allCountriesWithPoints.findIndex(c => c.country === country) + 1}.
                            </span>
                          )}
                          <div className="flex-shrink-0 flex flex-col items-center">
                            <Image 
                              src={`/flags/${country.replace('&', 'and')}_${code}.png`}
                              alt={`${country} flag`}
                              width={24}
                              height={16}
                              className={`object-cover rounded ${!isRevealed ? 'opacity-60' : ''}`}
                            />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={`country-name ${isRevealed ? 'text-white' : 'text-gray-400'}`}>{country}</span>
                            {songInfo && (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400 truncate">
                                  {songInfo.performer}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                  {songInfo.song}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Show stats for eliminated countries on the right side */}
                        {isRevealed && !isFinalist && results && (
                          <div className="ml-2 whitespace-nowrap text-right">
                            <div className="font-bold text-red-300">
                              {results.countryPoints[country] || 0} puan
                            </div>
                            {preferences.showWeightPercentage && (
                              <div className="text-xs text-red-200">
                                {(() => {
                                  const denom = (results.totalVotes || 0) * 12;
                                  if (!denom) return '0%';
                                  const pct = ((results.countryPoints[country] || 0) / denom) * 100;
                                   return <>{pct.toFixed(2)}% <strong>Σ</strong></>;
                                })()}
                              </div>
                            )}
                            {preferences.showVoterPercentage && results.countryVoteCounts && results.countryVoteCounts[country] !== undefined && (
                              <div className="text-xs text-red-200">
                                {(() => {
                                  const voteCount = results.countryVoteCounts[country] || 0;
                                  const totalVoters = results.totalVotes || 0;
                                  if (!totalVoters) return (
                                    <>
                                      <span>0%</span> <span className="inline-flex items-center justify-center w-4 h-3 rounded-md bg-yellow-500 text-[10px]">👤</span>
                                    </>
                                  );
                                  const userPct = (voteCount / totalVoters) * 100;
                                  return (
                                    <>
                                      <span>{userPct.toFixed(1)}%</span> <span className="inline-flex items-center justify-center w-4 h-3 rounded-md bg-yellow-500 text-[10px]">👤</span>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Second Column */}
                <div className="space-y-3">
                  {Object.keys(eurovision2020DataGroupA).sort().slice(10, 20).map((country) => {
                    const code = eurovision2020DataGroupA[country]?.code || 'XX';
                    const songInfo = eurovision2020DataGroupA[country];
                    const isRevealed = revealedCountries.includes(country);
                    const isCurrentlyRevealing = revealingCountry === country;
                    const lastRevealedCountry = revealedCountries[revealedCountries.length - 1];
                    const keepChain = !isNetherlandsPlaying && (isCurrentlyRevealing || (!isRevealing && isRevealed && country === lastRevealedCountry));
                    
                    // Calculate top 10 finalists (highest points)
                    const allCountriesWithPoints = Object.entries(results?.countryPoints || {})
                      .map(([c, p]) => ({ country: c, points: p }))
                      .sort((a, b) => b.points - a.points);
                    const top10Countries = allCountriesWithPoints.slice(0, 10).map(c => c.country);
                    const isFinalist = top10Countries.includes(country);
                    
                    return (
                      <div
                        key={country}
                        onClick={() => {
                          if (isRevealed) {
                            const ytId = eurovision2020DataGroupA[country]?.youtubeId;
                            if (ytId) {
                              const times = eurovision2020DataGroupA[country]?.times ?? { start: 0, end: 5 };
                              if (videoCloseTimer.current) {
                                window.clearTimeout(videoCloseTimer.current);
                                videoCloseTimer.current = null;
                              }
                              setSelectedVideoRange(times);
                              setSelectedVideoId(ytId);
                              const durationMs = Math.max(1000, (Math.max(times.end, times.start) - times.start) * 1000);
                              videoCloseTimer.current = window.setTimeout(() => {
                                setSelectedVideoId('');
                                setSelectedVideoRange(null);
                                videoCloseTimer.current = null;
                              }, durationMs);
                            }
                          }
                        }}
                        className={`flex items-center justify-between p-1 rounded relative ${
                          (isRevealed ? (isFinalist ? 'golden-ticket' : 'bg-gray-700 eliminated-glow') : 'bg-[#2a3846]')
                        } ${keepChain ? 'chain-effect' : ''} ${isRevealed ? 'cursor-pointer hover:brightness-110' : ''}`}
                        style={!isRevealed ? { border: '4px solid #2a3846' } : {}}
                      >
                        {/* Checkmark for golden tickets when chain is active (since chain uses ::after) */}
                        {isRevealed && isFinalist && keepChain && (
                          <span style={{
                            position: 'absolute',
                            top: '50%',
                            right: '8px',
                            transform: 'translateY(-50%)',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#8b6914',
                            textShadow: '0 0 4px rgba(255, 215, 0, 0.8)',
                            pointerEvents: 'none',
                            zIndex: 5
                          }}>✓</span>
                        )}
                        <div className="flex items-center gap-2">
                          {isRevealed && !isFinalist && (
                            <span className="text-lg font-bold text-red-300">
                              {allCountriesWithPoints.findIndex(c => c.country === country) + 1}.
                            </span>
                          )}
                          <div className="flex-shrink-0 flex flex-col items-center">
                            <Image 
                              src={`/flags/${country.replace('&', 'and')}_${code}.png`}
                              alt={`${country} flag`}
                              width={24}
                              height={16}
                              className={`object-cover rounded ${!isRevealed ? 'opacity-60' : ''}`}
                            />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={`country-name ${isRevealed ? 'text-white' : 'text-gray-400'}`}>{country}</span>
                            {songInfo && (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400 truncate">
                                  {songInfo.performer}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                  {songInfo.song}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Show stats for eliminated countries on the right side */}
                        {isRevealed && !isFinalist && results && (
                          <div className="ml-2 whitespace-nowrap text-right">
                            <div className="font-bold text-red-300">
                              {results.countryPoints[country] || 0} puan
                            </div>
                            {preferences.showWeightPercentage && (
                              <div className="text-xs text-red-200">
                                {(() => {
                                  const denom = (results.totalVotes || 0) * 12;
                                  if (!denom) return '0%';
                                  const pct = ((results.countryPoints[country] || 0) / denom) * 100;
                                   return <>{pct.toFixed(2)}% <strong>Σ</strong></>;
                                })()}
                              </div>
                            )}
                            {preferences.showVoterPercentage && results.countryVoteCounts && results.countryVoteCounts[country] !== undefined && (
                              <div className="text-xs text-red-200">
                                {(() => {
                                  const voteCount = results.countryVoteCounts[country] || 0;
                                  const totalVoters = results.totalVotes || 0;
                                  if (!totalVoters) return (
                                    <>
                                      <span>0%</span> <span className="inline-flex items-center justify-center w-4 h-3 rounded-md bg-yellow-500 text-[10px]">👤</span>
                                    </>
                                  );
                                  const userPct = (voteCount / totalVoters) * 100;
                                  return (
                                    <>
                                      <span>{userPct.toFixed(1)}%</span> <span className="inline-flex items-center justify-center w-4 h-3 rounded-md bg-yellow-500 text-[10px]">👤</span>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


