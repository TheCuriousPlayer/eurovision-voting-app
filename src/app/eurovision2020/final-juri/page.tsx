'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import { eurovision2020DataFinal } from '@/data/eurovision2020';
import { Juri2020final } from '@/config/eurovisionvariables';
import { motion } from 'framer-motion';

const eurovision2020Songs = eurovision2020DataFinal;
const COUNTRIES = Object.keys(eurovision2020Songs);

interface JuryVotes {
  [country: string]: number; // country -> points (1-10)
}

export default function Eurovision2020FinalJuri() {
  const { data: session, status } = useSession();
  const [votes, setVotes] = useState<JuryVotes>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [placedGemCountry, setPlacedGemCountry] = useState<string | null>(null);

  // Check if user is authorized jury member
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      const authorized = Juri2020final.includes(session.user.email);
      setIsAuthorized(authorized);
      if (authorized) {
        loadVotes();
      }
    }
    setLoading(false);
  }, [session, status]);

  const loadVotes = async () => {
    try {
      const response = await fetch('/api/votes/2020/final-juri');
      if (response.ok) {
        const data = await response.json();
        if (data.votes) {
          // Separate the 12-point gem from other votes
          const loadedVotes = { ...data.votes };
          let gemCountry = null;
          
          // Find which country has more than 10 points (base + 12 gem)
          for (const [country, points] of Object.entries(loadedVotes)) {
            if (typeof points === 'number' && points > 10) {
              gemCountry = country;
              // Subtract 12 to get the base points (1-10)
              loadedVotes[country] = points - 12;
              break;
            }
          }
          
          setVotes(loadedVotes);
          setPlacedGemCountry(gemCountry);
        }
      }
    } catch (error) {
      console.error('Error loading votes:', error);
    }
  };

  const handleVoteChange = (country: string, points: number) => {
    setVotes(prev => ({
      ...prev,
      [country]: points
    }));
  };

  const handleSave = async () => {
    // Check if gem is placed
    if (!placedGemCountry) {
      setSaveMessage('⚠ En sevdiğiniz performansa 12 puan daha verin');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setSaving(true);
    setSaveMessage('');
    
    try {
      // Add the 12-point gem to the existing vote (not replace it)
      const basePoints = votes[placedGemCountry] || 0;
      const finalVotes = {
        ...votes,
        [placedGemCountry]: basePoints + 12
      };

      const response = await fetch('/api/votes/2020/final-juri', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ votes: finalVotes }),
      });

      if (response.ok) {
        setSaveMessage('✓ Oylarınız başarıyla kaydedildi!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        const error = await response.json();
        console.error('API Error:', error);
        setSaveMessage('✗ Hata: ' + (error.error || 'Kayıt başarısız'));
      }
    } catch (error) {
      console.error('Error saving votes:', error);
      setSaveMessage('✗ Kayıt sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  // Count how many countries have been voted for
  const votedCount = Object.values(votes).filter(v => v > 0).length;
  const allCountriesVoted = votedCount === 21;

  // Sort countries by points (highest first), then alphabetically with smooth transitions
  const sortedCountries = [...COUNTRIES].sort((a, b) => {
    const pointsA = votes[a] || 0;
    const pointsB = votes[b] || 0;
    
    // If points are different, sort by points (descending)
    if (pointsA !== pointsB) {
      return pointsB - pointsA;
    }
    
    // If points are the same, sort alphabetically
    return a.localeCompare(b);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Eurovision 2020 Final - Jüri Oylaması</h1>
          <p className="text-white mb-6">Bu sayfaya erişmek için giriş yapmalısınız.</p>
          <button
            onClick={() => signIn('google')}
            className="px-6 py-3 bg-white text-purple-900 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Google ile Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Yetkisiz Erişim</h1>
          <p className="text-white">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          <p className="text-gray-300 mt-2">Giriş yapan kullanıcı: {session?.user?.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🎭 Eurovision 2020 Final - Jüri Oylaması
          </h1>
          <p className="text-xl text-gray-200 mb-2">
            Jüri Üyesi: {session?.user?.email}
          </p>
          <p className="text-gray-300">
            Her ülkeye 1-10 arası puan verebilirsiniz. Aynı puanı birden fazla ülkeye verebilirsiniz.
          </p>
        </div>

        {/* Save Button and Status */}
        <div className="mb-8 text-center">
          <button
            onClick={handleSave}
            disabled={saving || !allCountriesVoted}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition ${
              saving || !allCountriesVoted
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {saving ? 'Kaydediliyor...' : `Oyları Kaydet (${votedCount}/21)`}
          </button>
          {!allCountriesVoted && (
            <p className="mt-2 text-yellow-300 text-sm">
              Tüm ülkelere oy vermelisiniz ({21 - votedCount} ülke kaldı)
            </p>
          )}
          {saveMessage && (
            <div className={`mt-3 text-lg font-semibold ${
              saveMessage.startsWith('✓') ? 'text-green-300' : 'text-red-300'
            }`}>
              {saveMessage}
            </div>
          )}
        </div>

        {/* Country Cards - Vertical List */}
        <div className="flex flex-col gap-1 max-w-4xl mx-auto relative">
          {/* Shining Golden Gem - appears when all countries voted */}
          {allCountriesVoted && placedGemCountry === null && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -1000, 0]
              }}
              transition={{
                opacity: { duration: 0.6 },
                scale: { duration: 0.6 },
                y: {
                  duration: 11,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="absolute -right-24 top-1/2 -translate-y-1/2 z-50"
            >
              <div className="relative w-20 h-20">
                {/* Diamond outer glow */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.12, 1],
                    opacity: [0.28, 0.7, 0.28]
                  }}
                  transition={{ 
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-white/10 blur-3xl"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                  }}
                />

                {/* Diamond SVG with facets (floating) */}
                <motion.div layoutId="shared-gem" className="relative z-10" aria-hidden>
                  <motion.svg
                    width="80"
                    height="80"
                    viewBox="0 0 100 100"
                    aria-hidden
                  >
                  <defs>
                    <linearGradient id="diamondMain" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="10%" stopColor="#fff7d6" />
                      <stop offset="35%" stopColor="#ffd700" />
                      <stop offset="40%" stopColor="#afb300" />
                      <stop offset="10%" stopColor="#b8460b" />
                    </linearGradient>
                    <linearGradient id="diamondFacetA" x1="100%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#cfcdc5" stopOpacity="0.98" />
                      <stop offset="100%" stopColor="#afa24d" stopOpacity="0.95" />
                    </linearGradient>
                    <linearGradient id="diamondFacetB" x1="0%" y1="100%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c0a4c2" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#ff9f00" stopOpacity="0.9" />
                    </linearGradient>
                    <filter id="diamondGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Outer glow ring */}
                  <g filter="url(#diamondGlow)">
                    <polygon points="50,6 92,40 74,94 26,94 8,40" fill="url(#diamondMain)" opacity="0.95" />
                  </g>

                  {/* Facets */}
                  <polygon points="50,6 74,94 26,94" fill="url(#diamondFacetA)" opacity="0.95" />
                  <polygon points="50,6 92,40 50,50" fill="url(#diamondFacetB)" opacity="0.92" />
                  <polygon points="50,6 8,40 50,50" fill="#fff8ea" opacity="0.4" />
                  <polygon points="92,40 74,94 50,50" fill="#fff1c3" opacity="0.40" />
                  <polygon points="8,40 26,94 50,50" fill="#ffe9a8" opacity="0.88" />

                  {/* Sparkle highlights */}
                  <motion.circle cx="60" cy="28" r="3" fill="#ffffff" opacity={0.9}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.9, 0.2, 0.9] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                  />
                  <motion.circle cx="38" cy="36" r="2" fill="#ffffff" opacity={0.85}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.85, 0.2, 0.85] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                  />

                  {/* Center number 12 */}
                  <text
                    x="50"
                    y="62"
                    textAnchor="middle"
                    fontSize="30"
                    fontWeight="700"
                    fill="#fff"
                    aria-hidden="true"
                    style={{ textShadow: '0 2px 2px rgba(0,0,0,0.9)', pointerEvents: 'none', userSelect: 'none' }}
                  >
                    12
                  </text>
                  </motion.svg>
                </motion.div>
              </div>
            </motion.div>
          )}

          {sortedCountries.map((country) => {
            const songData = eurovision2020Songs[country];
            const currentVote = votes[country] || 0;

            return (
              <motion.div
                key={country}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  layout: { type: "spring", stiffness: 250, damping: 90 },
                  opacity: { duration: 0.9 }
                }}
                className="bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-xl border border-white/20"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left side: Flag and Country Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-shrink">
                    <div className="relative w-16 h-12 rounded overflow-hidden shadow-lg flex-shrink-0">
                      <Image
                        src={`/flags/${country}_${songData.code}.png`}
                        alt={country}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-white">{country}</h3>
                      <p className="text-sm text-gray-300">{songData.performer}</p>
                      <p className="text-xs text-gray-400 italic">&quot;{songData.song}&quot;</p>
                    </div>
                  </div>

                  {/* Right side: Point Selection Boxes */}
                  <div className="flex gap-2 flex-shrink-0 items-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(point => (
                      <button
                        key={point}
                        onClick={() => handleVoteChange(country, point)}
                        className={`w-10 h-10 rounded-lg font-bold text-sm transition ${
                          currentVote === point
                            ? 'bg-green-500 text-white shadow-lg scale-110'
                            : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                        }`}
                      >
                        {point}
                      </button>
                    ))}
                    
                    {/* Pentagon Gem Slot with flame */}
                    <div className="flex gap-1 ml-2">
                      {allCountriesVoted && (
                        <div className="relative w-12 h-12">
                          {/* Flame rail: animated stroke following pentagon border */}
                          <motion.svg
                            aria-hidden
                            viewBox="0 0 100 100"
                            preserveAspectRatio="xMidYMid meet"
                            className="absolute inset-0 z-0 pointer-events-none"
                            style={{ overflow: 'visible', zIndex: 0 }}
                            animate={{ rotate: [-2, 2, -2] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                          >
                            <defs>
                              <linearGradient id="flameGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                                <stop offset="0%" stopColor="#fff5Fd" />
                                <stop offset="40%" stopColor="#ffb7Fd" />
                                <stop offset="70%" stopColor="#ff70F3" />
                                <stop offset="100%" stopColor="#ff3dF0" />
                              </linearGradient>
                              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="9.5" result="coloredBlur" />
                                <feMerge>
                                  <feMergeNode in="coloredBlur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>

                            {/* soft underlying glow */}
                            <path
                              d="M50 5 L95 40 L78 95 L22 95 L5 40 Z"
                              fill="none"
                              stroke="url(#flameGradient)"
                              strokeWidth={8}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity={0.18}
                              style={{ filter: 'url(#glow)' }}
                            />

                            {/* stronger animated outer glow to give the rail a halo */}
                            <motion.path
                              d="M50 5 L95 40 L78 95 L22 95 L5 40 Z"
                              fill="none"
                              stroke="url(#flameGradient)"
                              strokeWidth={12}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity={0.22}
                              style={{ filter: 'url(#glow)' }}
                              animate={{ opacity: [0.16, 0.32, 0.16] }}
                              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                            />

                            {/* animated flame rail stroke */}
                            <motion.path
                              d="M50 5 L95 40 L78 95 L22 95 L5 40 Z"
                              fill="none"
                              stroke="url(#flameGradient)"
                              strokeWidth={3.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray="14 4"
                              animate={{ strokeDashoffset: [0, -88] , opacity: [0.9,1,0.9], scale: [1,1.1,1] }}
                              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                            />

                            {/* tiny ember particles that flicker along the rail (animated dots using stroke-dashoffset trick) */}
                            <motion.path
                              d="M50 5 L95 40 L78 95 L22 95 L5 40 Z"
                              fill="none"
                              stroke="#ffd54f"
                              strokeWidth={1.6}
                              strokeLinecap="round"
                              strokeDasharray="2 120"
                              animate={{ strokeDashoffset: [0, -120] }}
                              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                              opacity={0.95}
                            />
                          </motion.svg>

                          {/* Clickable pentagon slot (shows gem when placed) */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setPlacedGemCountry(prev => prev === country ? null : country)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPlacedGemCountry(prev => prev === country ? null : country); }}
                            className="relative z-20 w-12 h-12 bg-white/10 border border-white/30 rounded-sm flex items-center justify-center cursor-pointer"
                            style={{
                              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                            }}
                            aria-label={placedGemCountry === country ? 'Remove gem' : 'Place gem here'}
                          >
                            {placedGemCountry === country && (
                              <motion.div layoutId="shared-gem" initial={{ scale: 1 }} animate={{ scale: 1.5 }} transition={{ type: 'spring', stiffness: 100 }} className="w-10 h-10 pointer-events-none">
                                <svg width="40" height="40" viewBox="0 0 100 100" aria-hidden>
                                  <polygon points="50,6 92,40 74,94 26,94 8,40" fill="#ffd700" />
                                  <polygon points="50,6 74,94 26,94" fill="#fffdf5" opacity="0.9" />
                                  <polygon points="50,6 92,40 50,50" fill="#ffecb3" opacity="0.9" />
                                  <text x="50" y="62" textAnchor="middle" fontSize="20" fontWeight="700" fill="#fff" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                                    12
                                  </text>
                                </svg>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Save Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSave}
            disabled={saving || !allCountriesVoted}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition ${
              saving || !allCountriesVoted
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {saving ? 'Kaydediliyor...' : `Oyları Kaydet (${votedCount}/21)`}
          </button>
          {!allCountriesVoted && (
            <p className="mt-2 text-yellow-300 text-sm">
              Tüm ülkelere oy vermelisiniz ({21 - votedCount} ülke kaldı)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
