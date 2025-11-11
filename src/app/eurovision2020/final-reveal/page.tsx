'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import { eurovision2020DataFinal } from '@/data/eurovision2020';
import { motion, AnimatePresence } from 'framer-motion';
import { VOTE_CONFIG } from '@/config/eurovisionvariables';

const eurovision2020Songs = eurovision2020DataFinal;

interface CountryResult {
  country: string;
  points: number;
  voteCount: number;
  breakdown: {
    total: number;
    points12: number;
    points10: number;
    points8: number;
    points7: number;
    points6: number;
    points5: number;
    points4: number;
    points3: number;
    points2: number;
    points1: number;
  };
}

export default function Eurovision2020FinalReveal() {
  const { data: session, status } = useSession();
  const [results, setResults] = useState<CountryResult[]>([]);
  const [juryResults, setJuryResults] = useState<CountryResult[]>([]);
  const [publicVoteCounts, setPublicVoteCounts] = useState<{ [country: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showJury, setShowJury] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);

  // Access control helpers (derived from session)
  const userEmail = session?.user?.email ?? '';
  const gmList = VOTE_CONFIG?.['202003']?.GMs
    ? VOTE_CONFIG['202003'].GMs.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : [];
  const isGM = userEmail ? gmList.includes(userEmail.toLowerCase()) : false;

  useEffect(() => {
    if (status === 'authenticated' && isGM) {
      fetchResults();
      fetchJuryResults();
    } else if (status === 'authenticated' && !isGM) {
      setLoading(false);
    }
  }, [status, isGM]);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/votes/202003/simple', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Parse the detailed breakdown from the database
        const parsedResults: CountryResult[] = [];
        
        Object.entries(data.countryPoints || {}).forEach(([country, value]) => {
          if (typeof value === 'string') {
            // Format: "total,12pts,10pts,8pts,7pts,6pts,5pts,4pts,3pts,2pts,1pts"
            const parts = value.split(',').map(v => parseInt(v));
            parsedResults.push({
              country,
              points: parts[0] || 0,
              voteCount: 0,
              breakdown: {
                total: parts[0] || 0,
                points12: parts[1] || 0,
                points10: parts[2] || 0,
                points8: parts[3] || 0,
                points7: parts[4] || 0,
                points6: parts[5] || 0,
                points5: parts[6] || 0,
                points4: parts[7] || 0,
                points3: parts[8] || 0,
                points2: parts[9] || 0,
                points1: parts[10] || 0,
              }
            });
          } else if (typeof value === 'number') {
            // Backward compatibility
            parsedResults.push({
              country,
              points: value,
              voteCount: 0,
              breakdown: {
                total: value,
                points12: 0,
                points10: 0,
                points8: 0,
                points7: 0,
                points6: 0,
                points5: 0,
                points4: 0,
                points3: 0,
                points2: 0,
                points1: 0,
              }
            });
          }
        });

        // Sort alphabetically at the beginning
        parsedResults.sort((a, b) => a.country.localeCompare(b.country));
        
        setResults(parsedResults);
        setTotalVotes(data.totalVotes || 0);
        
        // Store public vote counts for tiebreaker
        if (data.countryVoteCounts) {
          setPublicVoteCounts(data.countryVoteCounts);
        }
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJuryResults = async () => {
    try {
      const response = await fetch('/api/votes/202004/simple', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Parse jury results
        const parsedJuryResults: CountryResult[] = [];
        
        Object.entries(data.countryPoints || {}).forEach(([country, value]) => {
          const points = typeof value === 'number' ? value : 0;
          const voteCount = (data.countryVoteCounts && data.countryVoteCounts[country]) || 0;
          parsedJuryResults.push({
            country,
            points,
            voteCount,
            breakdown: {
              total: points,
              points12: 0,
              points10: 0,
              points8: 0,
              points7: 0,
              points6: 0,
              points5: 0,
              points4: 0,
              points3: 0,
              points2: 0,
              points1: 0,
            }
          });
        });

        // Sort alphabetically initially
        parsedJuryResults.sort((a, b) => a.country.localeCompare(b.country));
        
        setJuryResults(parsedJuryResults);
      }
    } catch (error) {
      console.error('Error fetching jury results:', error);
    }
  };

  const startReveal = () => {
    setShowJury(true);
    setCurrentIndex(0);
    setIsRevealing(true);
    
    // Auto reveal with 550ms interval
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxLength = juryResults.length;
        if (prev >= maxLength - 1) {
          clearInterval(interval);
          setIsRevealing(false);
          
          // After reveal completes, sort by points (descending) with public vote count tiebreaker
          // After reveal completes, sort by points (descending) with public vote count tiebreaker
          setTimeout(() => {
            const sortedResults = [...juryResults].sort((a, b) => {
              if (b.points !== a.points) {
                return b.points - a.points; // Higher points first
              }
              // Use public vote counts (202003) as tiebreaker
              const aPublicVotes = publicVoteCounts[a.country] || 0;
              const bPublicVotes = publicVoteCounts[b.country] || 0;
              return bPublicVotes - aPublicVotes; // Higher public vote count wins tie
            });
            setJuryResults(sortedResults);
          }, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 550);
  };

  const previousCountry = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  // Access control: show sign-in or denied messages for non-GMs
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-white mb-4">Bu sayfa yalnızca yönetici (GM) erişimine açıktır.</p>
          <button
            onClick={() => signIn('google', { callbackUrl: `${window.location.origin}/eurovision2020/final-reveal` })}
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
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Erişim reddedildi</h2>
          <p className="text-gray-300">Bu sayfaya erişim yetkiniz yok. Eğer yetkiliyseniz lütfen GM listesini kontrol edin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-8">
          Eurovision 2020 Final - Sonuç Açıklaması
        </h1>

        <div className="text-center mb-6 text-white">
          <p className="text-xl">
            {showJury ? 'Jüri Puanları' : `Toplam Oy Sayısı: ${totalVotes}`}
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {currentIndex >= 0 && (
            <button
              onClick={previousCountry}
              disabled={currentIndex <= 0 || isRevealing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition"
            >
              ← Önceki
            </button>
          )}
          <button
            onClick={startReveal}
            disabled={isRevealing}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition"
          >
            {currentIndex >= 0 ? 'Alınan 1 Puanları dağıt' : 'Başlat'}
          </button>
        </div>

        {/* 21 Country Cards in a single grid parent (enables smooth cross-column layout animations) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
          {(showJury ? juryResults : results).map((result, index) => {
            const position = index + 1;
            const isRevealed = showJury ? currentIndex >= index : false;

            return (
              <motion.div
                key={result.country}
                layout
                initial={{ opacity: 0.3 }}
                animate={{ 
                  opacity: isRevealed ? 1 : 0.3,
                  scale: isRevealed ? 1 : 0.95
                }}
                transition={{ 
                  layout: { duration: 1.5, ease: "easeInOut" },
                  opacity: { duration: 0.5 },
                  scale: { duration: 0.5 }
                }}
                className={`relative rounded-lg p-4 border-2 ${
                  isRevealed 
                    ? 'bg-gradient-to-br from-purple-900 to-pink-900 border-yellow-400' 
                    : 'bg-[#2c3e50] border-gray-600'
                }`}
              >
                {/* Position Badge */}
                <div className={`absolute -top-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                  isRevealed 
                    ? 'bg-yellow-400 text-black' 
                    : 'bg-gray-600 text-gray-400'
                }`}>
                  #{position}
                </div>

                <div className="flex items-center gap-4 mb-3">
                  {/* Flag */}
                  <div className="flex-shrink-0">
                    <Image 
                      src={`/flags/${result.country}_${eurovision2020Songs[result.country]?.code}.png`}
                      alt={result.country}
                      width={48}
                      height={32}
                      className={`rounded ${!isRevealed ? 'opacity-30' : ''}`}
                    />
                  </div>

                  {/* Country Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xl font-bold ${isRevealed ? 'text-white' : 'text-gray-500'}`}>
                      {result.country}
                    </h3>
                    {eurovision2020Songs[result.country] && (
                      <>
                        <p className={`text-sm truncate ${isRevealed ? 'text-gray-200' : 'text-gray-600'}`}>
                          {eurovision2020Songs[result.country].performer}
                        </p>
                        <p className={`text-xs italic truncate ${isRevealed ? 'text-gray-300' : 'text-gray-700'}`}>
                          &quot;{eurovision2020Songs[result.country].song}&quot;
                        </p>
                      </>
                    )}
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <AnimatePresence mode="wait">
                      {isRevealed ? (
                        <motion.div
                          key="revealed"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="text-4xl font-bold text-yellow-400"
                        >
                          {result.points}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="hidden"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-4xl font-bold text-gray-600"
                        >
                          ?
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className={`text-sm ${isRevealed ? 'text-white' : 'text-gray-600'}`}>
                      points
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mt-8 text-center text-white max-w-2xl mx-auto">
          <p className="text-xl mb-2">
            {currentIndex >= 0 ? `${currentIndex + 1} / ${(showJury ? juryResults : results).length}` : 'Başlamak için "Başlat" butonuna tıklayın'}
          </p>
          {currentIndex >= 0 && (
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / (showJury ? juryResults : results).length) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
