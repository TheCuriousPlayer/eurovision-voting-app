'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import { eurovision2020DataFinal } from '@/data/eurovision2020';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { VOTE_CONFIG } from '@/config/eurovisionvariables';
import { formatNumber } from '@/utils/formatNumber';

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

interface PresetTheme {
  revealedBg: string;
  winnerBg: string;
  hiddenBg: string;
  badgeRevealedWinner: string;
  badgeRevealedNormal: string;
  badgeHidden: string;
  pointsRevealedWinner: string;
  pointsRevealedNormal: string;
  pointsHidden: string;
  titleRevealedWinner: string;
  titleRevealedNormal: string;
  titleHidden: string;
  performerRevealedWinner: string;
  performerRevealedNormal: string;
  performerHidden: string;
  songRevealedWinner: string;
  songRevealedNormal: string;
}

// Preset color themes for cards (includes winner and normal revealed/hidden styles)
const PRESETS: { [key: string]: PresetTheme } = {
  'royal purple': {
    revealedBg: 'bg-gradient-to-br from-purple-900 to-pink-900 border-amber-700',
    winnerBg: 'bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-600 border-yellow-300 shadow-2xl shadow-yellow-500/50',
    hiddenBg: 'bg-[#2c3e50] border-gray-600',
    badgeRevealedWinner: 'bg-gradient-to-br from-red-800 to-black text-black border-1 border-black-300 shadow-lg',
    badgeRevealedNormal: 'bg-purple-500 text-black',
    badgeHidden: 'bg-gray-600 text-gray-400',
    pointsRevealedWinner: 'text-black',
    pointsRevealedNormal: 'text-yellow-400',
    pointsHidden: 'text-gray-600',
    titleRevealedWinner: 'text-black',
    titleRevealedNormal: 'text-white',
    titleHidden: 'text-gray-500',
    performerRevealedWinner: 'text-gray-900',
    performerRevealedNormal: 'text-gray-200',
    performerHidden: 'text-gray-600',
    songRevealedWinner: 'text-gray-800',
    songRevealedNormal: 'text-gray-300',
  },
  'emerald green': {
    revealedBg: 'bg-gradient-to-br from-emerald-900 to-emerald-700 border-emerald-600',
    winnerBg: 'bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-600 border-yellow-300 shadow-2xl shadow-yellow-500/50',
    hiddenBg: 'bg-[#0f172a] border-gray-600',
    badgeRevealedWinner: 'bg-gradient-to-br from-red-800 to-black text-black shadow-lg',
    badgeRevealedNormal: 'bg-emerald-600 text-black',
    badgeHidden: 'bg-gray-600 text-gray-400',
    pointsRevealedWinner: 'text-black',
    pointsRevealedNormal: 'text-emerald-300',
    pointsHidden: 'text-gray-600',
    titleRevealedWinner: 'text-black',
    titleRevealedNormal: 'text-white',
    titleHidden: 'text-gray-500',
    performerRevealedWinner: 'text-gray-900',
    performerRevealedNormal: 'text-gray-200',
    performerHidden: 'text-gray-600',
    songRevealedWinner: 'text-gray-800',
    songRevealedNormal: 'text-gray-300',
  },
  'midnight blue': {
    revealedBg: 'bg-gradient-to-br from-slate-900 to-indigo-900 border-sky-800',
    winnerBg: 'bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-600 border-yellow-300 shadow-2xl shadow-yellow-500/50',
    hiddenBg: 'bg-[#0b1220] border-gray-600',
    badgeRevealedWinner: 'bg-gradient-to-br from-red-800 to-black text-black shadow-lg',
    badgeRevealedNormal: 'bg-sky-600 text-black',
    badgeHidden: 'bg-gray-600 text-gray-400',
    pointsRevealedWinner: 'text-black',
    pointsRevealedNormal: 'text-sky-300',
    pointsHidden: 'text-gray-600',
    titleRevealedWinner: 'text-black',
    titleRevealedNormal: 'text-white',
    titleHidden: 'text-gray-500',
    performerRevealedWinner: 'text-gray-900',
    performerRevealedNormal: 'text-gray-200',
    performerHidden: 'text-gray-600',
    songRevealedWinner: 'text-gray-800',
    songRevealedNormal: 'text-gray-300',
  },
  'sunset orange': {
    revealedBg: 'bg-gradient-to-br from-orange-900 to-rose-600 border-amber-700',
    winnerBg: 'bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-600 border-yellow-300 shadow-2xl shadow-yellow-500/50',
    hiddenBg: 'bg-[#2b1b12] border-gray-600',
    badgeRevealedWinner: 'bg-gradient-to-br from-red-800 to-black text-black shadow-lg',
    badgeRevealedNormal: 'bg-orange-700 text-black',
    badgeHidden: 'bg-gray-600 text-gray-400',
    pointsRevealedWinner: 'text-black',
    pointsRevealedNormal: 'text-orange-300',
    pointsHidden: 'text-gray-600',
    titleRevealedWinner: 'text-black',
    titleRevealedNormal: 'text-white',
    titleHidden: 'text-gray-500',
    performerRevealedWinner: 'text-gray-900',
    performerRevealedNormal: 'text-gray-200',
    performerHidden: 'text-gray-600',
    songRevealedWinner: 'text-gray-800',
    songRevealedNormal: 'text-gray-300',
  },
  'rose gold': {
    revealedBg: 'bg-gradient-to-br from-pink-900 to-rose-500 border-pink-500',
    winnerBg: 'bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-200 border-amber-100 shadow-2xl shadow-amber-300/50',
    hiddenBg: 'bg-[#2b2430] border-gray-600',
    badgeRevealedWinner: 'bg-gradient-to-br from-red-700 to-black text-black shadow-lg',
    badgeRevealedNormal: 'bg-pink-500 text-black',
    badgeHidden: 'bg-gray-600 text-gray-400',
    pointsRevealedWinner: 'text-black',
    pointsRevealedNormal: 'text-pink-300',
    pointsHidden: 'text-gray-600',
    titleRevealedWinner: 'text-black',
    titleRevealedNormal: 'text-white',
    titleHidden: 'text-gray-500',
    performerRevealedWinner: 'text-gray-900',
    performerRevealedNormal: 'text-gray-200',
    performerHidden: 'text-gray-600',
    songRevealedWinner: 'text-gray-800',
    songRevealedNormal: 'text-gray-300',
  }
};

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
  const [juryTotalVotes, setJuryTotalVotes] = useState(0);
  const [onePointDistributionIndex, setOnePointDistributionIndex] = useState(-1);
  const [currentPointType, setCurrentPointType] = useState(1); // Track which point type we're distributing
  const [allPointsByType, setAllPointsByType] = useState<{ [pointType: number]: string[] }>({});
  const [animationSpeed, setAnimationSpeed] = useState(700); // Animation duration in milliseconds
  const [distributionOrder, setDistributionOrder] = useState<'asc' | 'desc'>('asc'); // 'asc' = lowest to highest (default), 'desc' = highest to lowest
  const [isDistributionComplete, setIsDistributionComplete] = useState(false); // Track if all distributions are complete
  const [selectedPreset, setSelectedPreset] = useState<string>('royal purple');
  const [isDistributing, setIsDistributing] = useState(false);
  const [distributedSet, setDistributedSet] = useState<Set<string>>(new Set());

  // Calculate jury multiplier: UV / (2 * JV)
  // Where JV = jury totalVotes (202004) and UV = user totalVotes (202003)
  // This multiplier is used to scale jury points during distribution
  // so that jury votes are weighted at ~50% of user votes
  // Calculate jury multiplier: UV / (4 * JV) for ~25% weight
  const JURI_MULTIPLIER = juryTotalVotes > 0 && totalVotes > 0 
    ? Math.floor(totalVotes / (4 * juryTotalVotes))
    : 1;

  // Access control helpers (derived from session)
  const userEmail = session?.user?.email ?? '';
  const gmList = VOTE_CONFIG?.['202003']?.GMs
    ? VOTE_CONFIG['202003'].GMs.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : [];
  const isGM = userEmail ? gmList.includes(userEmail.toLowerCase()) : false;

  // Log multiplier calculation when both values are available
  useEffect(() => {
    if (juryTotalVotes > 0 && totalVotes > 0) {
      console.log('Jury Multiplier Calculation:');
      console.log(`  JV (Jury Total Votes): ${juryTotalVotes}`);
      console.log(`  UV (User Total Votes): ${totalVotes}`);
      console.log(`  Multiplier.Floor = ${totalVotes} / (4 * ${juryTotalVotes}) = ${JURI_MULTIPLIER}`);
      console.log(`  Use this multiplier to scale jury points during distribution`);
    }
  }, [juryTotalVotes, totalVotes, JURI_MULTIPLIER]);

  // Apply multiplier to jury results after both totalVotes are loaded
  useEffect(() => {
    if (juryTotalVotes > 0 && totalVotes > 0 && juryResults.length > 0) {
      setJuryResults(prevResults => 
        prevResults.map(result => ({
          ...result,
          points: result.breakdown.total * JURI_MULTIPLIER,
          breakdown: {
            ...result.breakdown,
            total: result.breakdown.total * JURI_MULTIPLIER
          }
        }))
      );
      console.log('Applied JURI_MULTIPLIER to all jury results');
    }
  }, [JURI_MULTIPLIER, juryResults.length, juryTotalVotes, totalVotes]);

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

        // Extract countries that received points for each point type
        const pointsByType: { [pointType: number]: string[] } = {
          1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 10: [], 12: []
        };
        
        parsedResults.forEach((result) => {
          // For each point type, add the country to the array that many times
          const breakdown = result.breakdown;
          for (let i = 0; i < breakdown.points1; i++) pointsByType[1].push(result.country);
          for (let i = 0; i < breakdown.points2; i++) pointsByType[2].push(result.country);
          for (let i = 0; i < breakdown.points3; i++) pointsByType[3].push(result.country);
          for (let i = 0; i < breakdown.points4; i++) pointsByType[4].push(result.country);
          for (let i = 0; i < breakdown.points5; i++) pointsByType[5].push(result.country);
          for (let i = 0; i < breakdown.points6; i++) pointsByType[6].push(result.country);
          for (let i = 0; i < breakdown.points7; i++) pointsByType[7].push(result.country);
          for (let i = 0; i < breakdown.points8; i++) pointsByType[8].push(result.country);
          for (let i = 0; i < breakdown.points10; i++) pointsByType[10].push(result.country);
          for (let i = 0; i < breakdown.points12; i++) pointsByType[12].push(result.country);
        });
        
        console.log('Points by type:', pointsByType);
        setAllPointsByType(pointsByType);
        
        // Keep backward compatibility
        // Keep backward compatibility
        const onePointCountries: string[] = [];
        parsedResults.forEach((result) => {
          const onePointCount = result.breakdown.points1;
          console.log(`${result.country}: ${onePointCount} x 1-point votes`);
          for (let i = 0; i < onePointCount; i++) {
            onePointCountries.push(result.country);
          }
        });
        console.log('Total 1-point votes to distribute:', onePointCountries.length, onePointCountries);
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
        
        // Store jury total votes for multiplier calculation
        setJuryTotalVotes(data.totalVotes || 0);
        
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

  const distributeOnePoints = () => {
    // Check if already distributing
    if (isRevealing) {
      return;
    }

    // For points 1-8, we combine them all into one distribution
    const isGroupedPoints = currentPointType >= 1 && currentPointType <= 8;
    
    // Calculate total points for each country from the breakdown
    const pointsByCountry: { [country: string]: number } = {};
    
    if (isGroupedPoints) {
      // For grouped points (1-8), sum up the breakdown values directly
      results.forEach(result => {
        const total = 
          result.breakdown.points1 +
          result.breakdown.points2 +
          result.breakdown.points3 +
          result.breakdown.points4 +
          result.breakdown.points5 +
          result.breakdown.points6 +
          result.breakdown.points7 +
          result.breakdown.points8;
        if (total > 0) {
          pointsByCountry[result.country] = total;
        }
      });
    } else {
      // For single point types (10, 12), use the specific breakdown value
      results.forEach(result => {
        let points = 0;
        if (currentPointType === 10) {
          points = result.breakdown.points10;
        } else if (currentPointType === 12) {
          points = result.breakdown.points12;
        }
        if (points > 0) {
          pointsByCountry[result.country] = points;
        }
      });
    }
    
    if (Object.keys(pointsByCountry).length === 0) {
      console.log(`No countries with ${isGroupedPoints ? '1-8' : currentPointType} points to distribute`);
      return;
    }

    // Get current rankings (last to first or first to last based on distributionOrder)
    const rankedCountries = [...juryResults]
      .sort((a, b) => {
        if (a.points !== b.points) {
          return distributionOrder === 'asc' 
            ? a.points - b.points  // Lower points first (ascending)
            : b.points - a.points; // Higher points first (descending)
        }
        const aPublicVotes = publicVoteCounts[a.country] || 0;
        const bPublicVotes = publicVoteCounts[b.country] || 0;
        return distributionOrder === 'asc'
          ? aPublicVotes - bPublicVotes  // Lower public vote count first
          : bPublicVotes - aPublicVotes; // Higher public vote count first
      })
      .filter(r => pointsByCountry[r.country] > 0)
      .map(r => r.country);

    console.log(`Distribution order for ${isGroupedPoints ? '1-8' : currentPointType}-point votes (${distributionOrder === 'asc' ? 'last to first' : 'first to last'}):`, rankedCountries);
    console.log(`Starting ${isGroupedPoints ? '1-8' : currentPointType} point distribution`);
    
  // Reset progress to 0
  setOnePointDistributionIndex(0);
  setIsRevealing(true);
  setIsDistributing(true);
  setDistributedSet(new Set());

    // Distribute all points for each country one by one
    let currentCountryIndex = 0;
    const interval = setInterval(() => {
      if (currentCountryIndex >= rankedCountries.length) {
        console.log(`${isGroupedPoints ? '1-8' : currentPointType}-point distribution complete`);
        clearInterval(interval);
        setIsRevealing(false);
        setOnePointDistributionIndex(rankedCountries.length); // Set to max for completed state
        setIsDistributing(false);
        
        // Move to next point type
        // Points 1-8 are grouped, then 10, then 12
        if (currentPointType >= 1 && currentPointType <= 8) {
          setCurrentPointType(10);
        } else if (currentPointType === 10) {
          setCurrentPointType(12);
        } else if (currentPointType === 12) {
          // 12-point distribution complete - mark as finished
          setIsDistributionComplete(true);
        }
        return;
      }

      const countryToUpdate = rankedCountries[currentCountryIndex];
      const pointsToAdd = pointsByCountry[countryToUpdate];
      
      console.log(`Adding ${pointsToAdd} points to ${countryToUpdate} (${currentCountryIndex + 1}/${rankedCountries.length})`);
      
      setJuryResults((currentResults) => {
        const updatedResults = currentResults.map((result) => {
          if (result.country === countryToUpdate) {
            return {
              ...result,
              points: result.points + pointsToAdd,
              breakdown: {
                ...result.breakdown,
                total: result.breakdown.total + pointsToAdd,
              }
            };
          }
          return result;
        });

        // Auto-sort after each country's points are added
        const sortedResults = [...updatedResults].sort((a, b) => {
          if (b.points !== a.points) {
            return b.points - a.points; // Higher points first
          }
          // Use public vote counts (202003) as tiebreaker
          const aPublicVotes = publicVoteCounts[a.country] || 0;
          const bPublicVotes = publicVoteCounts[b.country] || 0;
          return bPublicVotes - aPublicVotes; // Higher public vote count wins tie
        });

        return sortedResults;
      });

      // Mark this country as distributed so it recovers its original color
      setDistributedSet((prev) => {
        const s = new Set(prev);
        s.add(countryToUpdate);
        return s;
      });

      currentCountryIndex++;
      setOnePointDistributionIndex(currentCountryIndex);
    }, animationSpeed + 500); // Animation duration + 500ms buffer
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
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-15">
      <div className="container mx-auto px-1 flex gap-15">
        {/* Left Side - Controls */}
        <div className="w-80 flex-shrink-0">
          <h1 className="text-3xl font-bold text-white mb-6">
            Eurovision 2020 Final
          </h1>

          <div className="mb-6 text-white">
            <p className="text-lg">
              {`Toplam Oy Sayısı: ${totalVotes}`}
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-col gap-4 mb-8">
            {!isDistributionComplete && (
              <button
                onClick={currentIndex >= 0 ? distributeOnePoints : startReveal}
                disabled={isRevealing}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition"
              >
                {currentIndex >= 0 
                  ? currentPointType >= 1 && currentPointType <= 8
                    ? 'Alınan 1-8 Puanları dağıt'
                    : `Alınan ${currentPointType} Puanları dağıt`
                  : 'Başlat'}
              </button>
            )}
          </div>

          {/* Distribution Order Toggle */}
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">
              Dağıtım Sırası
            </label>
            <button
              onClick={() => setDistributionOrder(distributionOrder === 'asc' ? 'desc' : 'asc')}
              disabled={isRevealing}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg border border-gray-600 transition font-medium"
            >
              {distributionOrder === 'asc' ? '📈 Düşükten Yükseğe' : '📉 Yüksekten Düşüğe'}
            </button>
            <p className="text-gray-400 text-xs mt-1">
              {distributionOrder === 'asc' ? 'Son sıradan birinciye' : 'Birinciden son sıraya'}
            </p>
          </div>

          {/* Animation Speed Control */}
          <div className="mb-8">
            <label className="block text-white text-sm font-bold mb-2">
              Animasyon Süresi (ms)
            </label>
            <input
              type="number"
              min="500"
              max="3000"
              step="100"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
              disabled={isRevealing}
            />
            <p className="text-gray-400 text-xs mt-1">
              Sıralama animasyon süresi (500-1000ms önerilir)
              <br />
              Açıklama aralığı: {animationSpeed + 500}ms
            </p>
          </div>

          {/* Card Theme Preset */}
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">Card Theme</label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              disabled={isRevealing}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg border border-gray-600 transition font-medium"
            >
              {Object.keys(PRESETS).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <p className="text-gray-400 text-xs mt-1">Select a visual preset for the cards (winner + normal styles).</p>
          </div>

          {/* Progress */}
          <div className="text-white">
            <p className="text-lg mb-2">
              {currentIndex >= 0 && onePointDistributionIndex >= 0
                ? (() => {
                    // Calculate total countries for current point type(s)
                    const isGroupedPoints = currentPointType >= 1 && currentPointType <= 8;
                    const pointTypesToCheck = isGroupedPoints ? [1, 2, 3, 4, 5, 6, 7, 8] : [currentPointType];
                    const countriesWithPoints = new Set<string>();
                    pointTypesToCheck.forEach(pt => {
                      allPointsByType[pt]?.forEach(country => countriesWithPoints.add(country));
                    });
                    return `${onePointDistributionIndex} / ${countriesWithPoints.size}`;
                  })()
                : currentIndex >= 0 
                ? `${currentIndex + 1} / ${(showJury ? juryResults : results).length}` 
                : 'Başlamak için "Başlat" butonuna tıklayın'}
            </p>
            {currentIndex >= 0 && (
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: onePointDistributionIndex >= 0
                      ? (() => {
                          const isGroupedPoints = currentPointType >= 1 && currentPointType <= 8;
                          const pointTypesToCheck = isGroupedPoints ? [1, 2, 3, 4, 5, 6, 7, 8] : [currentPointType];
                          const countriesWithPoints = new Set<string>();
                          pointTypesToCheck.forEach(pt => {
                            allPointsByType[pt]?.forEach(country => countriesWithPoints.add(country));
                          });
                          return `${(onePointDistributionIndex / countriesWithPoints.size) * 100}%`;
                        })()
                      : `${((currentIndex + 1) / (showJury ? juryResults : results).length) * 100}%`
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Country Cards (two-column layout: 1-10 left, 11-21 right) */}
        <div className="flex-1">
          <div className="max-w-10xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
            {(() => {
              const displayed = showJury ? juryResults : results;
              const left = displayed.slice(0, 10);
              const right = displayed.slice(10);

              const renderCard = (result: CountryResult, globalIndex: number) => {
                const position = globalIndex + 1;
                const isRevealed = showJury ? currentIndex >= globalIndex : false;
                const isTopTen = position <= 10;
                const isWinner = position === 1 && currentIndex >= juryResults.length - 1;

                const presetObj = PRESETS[selectedPreset] || PRESETS['royal purple'];
                const paddingClass = isWinner ? 'p-3 border-4' : isTopTen ? 'p-2 border-2' : 'p-1.5 border-2';
                const bgClass = isRevealed ? (isWinner ? presetObj.winnerBg : presetObj.revealedBg) : presetObj.hiddenBg;
                const badgeSizeClass = isWinner ? 'w-12 h-12 text-2xl' : isTopTen ? 'w-10 h-10 text-lg' : 'w-8 h-8 text-sm';
                const badgeColorClass = isRevealed ? (isWinner ? presetObj.badgeRevealedWinner : presetObj.badgeRevealedNormal) : presetObj.badgeHidden;
                const titleColorClass = isRevealed ? (isWinner ? presetObj.titleRevealedWinner : presetObj.titleRevealedNormal) : presetObj.titleHidden;
                const performerColorClass = isRevealed ? (isWinner ? presetObj.performerRevealedWinner : presetObj.performerRevealedNormal) : presetObj.performerHidden;
                const songColorClass = isRevealed ? (isWinner ? presetObj.songRevealedWinner : presetObj.songRevealedNormal) : presetObj.performerHidden;
                const pointsColorClass = isRevealed ? (isWinner ? presetObj.pointsRevealedWinner : presetObj.pointsRevealedNormal) : presetObj.pointsHidden;

                // During distribution, non-distributed cards should show a white border for emphasis;
                // distributed cards recover their original preset colors.
                let finalBgClass = bgClass;
                if (isDistributing) {
                  try {
                    if (!distributedSet.has(result.country)) {
                      finalBgClass = bgClass.replace(/border-[^\s]+/g, 'border-white');
                    }
                  } catch {
                    finalBgClass = bgClass;
                  }
                }

                return (
                  <motion.div
                    key={result.country}
                    layoutId={`card-${result.country}`}
                    layout
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                      opacity: isRevealed ? 1 : 0.3,
                      scale: isRevealed ? (isWinner ? 1.05 : 1) : 0.95
                    }}
                    transition={{ 
                      layout: { duration: animationSpeed / 1000, ease: "easeInOut" },
                      opacity: { duration: 1.5 },
                      scale: { duration: 7.0 }
                    }}
                    className={`relative rounded-lg ${paddingClass} ${finalBgClass}`}
                  >
                    <div className={`absolute -top-3 -left-7 z-20 ${badgeSizeClass} rounded-full flex items-center justify-center font-bold ${badgeColorClass}`}>
                      {isWinner && isRevealed ? '👑' : `#${position}`}
                    </div>

                    <div className={`flex items-center ${isWinner ? 'gap-6 mb-3' : 'gap-4 mb-2'} relative z-10`}>
                      <div className="flex-shrink-0">
                        <Image 
                          src={`/flags/${result.country}_${eurovision2020Songs[result.country]?.code}.png`}
                          alt={result.country}
                          width={isWinner ? 60 : 40}
                          height={isWinner ? 40 : 27}
                          className={`rounded ${!isRevealed ? 'opacity-30' : isWinner ? '' : ''}`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h3 className={`${isWinner ? 'text-2xl' : isTopTen ? 'text-lg' : 'text-md'} font-bold ${titleColorClass}`}>
                            {result.country}
                          </h3>
                          {eurovision2020Songs[result.country] && (
                            <p className={`${isWinner ? 'text-base' : isTopTen ? 'text-[14px]' : 'text-[13px]'} truncate ${performerColorClass}`}>
                              | {eurovision2020Songs[result.country].performer}
                            </p>
                          )}
                        </div>
                        {eurovision2020Songs[result.country] && (
                          <p className={`${isWinner ? 'text-base' : isTopTen ? 'text-[14px]' : 'text-[13px]'} italic truncate ${songColorClass}`}>
                            &quot;{eurovision2020Songs[result.country].song}&quot;
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <AnimatePresence mode="popLayout">
                          {isRevealed ? (
                            <motion.div
                              key={`revealed-${result.points}`}
                              initial={{ scale: 0.1, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{ type: "spring", stiffness: 300}}
                              className={`${isWinner ? 'text-5xl' : 'text-3xl'} font-bold ${pointsColorClass}`}
                            >
                              {formatNumber(result.points)}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="hidden"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`${isWinner ? 'text-5xl' : 'text-3xl'} font-bold text-gray-600`}
                            >
                              ?
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {isDistributionComplete && isRevealed ? (
                          <div className={`${isWinner ? 'text-sm' : isTopTen ? 'text-[12px]' : 'text-[12px]'} ${isWinner ? presetObj.titleRevealedWinner + ' font-semibold' : presetObj.titleRevealedNormal}`}>
                            {(() => {
                              const voteCount = publicVoteCounts[result.country] || 0;
                              const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : '0.0';
                              return (
                                <>
                                  <span>{percentage}%</span> <span className="inline-flex items-center justify-center w-4 h-3 rounded-md bg-yellow-500 text-[10px]">👤</span> <span>{formatNumber(voteCount)}</span>
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className={`${isWinner ? 'text-sm' : isTopTen ? 'text-[12px]' : 'text-[12px]'} ${isRevealed ? (isWinner ? presetObj.titleRevealedWinner + ' font-semibold' : presetObj.titleRevealedNormal) : 'text-gray-600'}`}>
                            points
                          </div>
                        )}
                      </div>
                    </div>

                    {isWinner && isRevealed && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        <motion.div
                          className="absolute inset-0 w-full h-full"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          style={{ background: 'linear-gradient(110deg, transparent 0%, rgba(255, 255, 55, 0.3) 40%, rgba(255, 255, 55, 0.6) 50%, rgba(255, 255, 55, 0.3) 60%, transparent 100%)', width: '100%' }}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              };

              return (
                <LayoutGroup>
                  <div className="space-y-2">
                    {left.map((r, i) => renderCard(r, i))}
                  </div>
                  <div className="space-y-2">
                    {right.map((r, i) => renderCard(r, i + left.length))}
                  </div>
                </LayoutGroup>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
