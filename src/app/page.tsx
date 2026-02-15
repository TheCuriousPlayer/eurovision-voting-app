'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { formatNumber } from '@/utils/formatNumber';

export default function Home() {
  const { data: session, status } = useSession();
  const [voteCounts, setVoteCounts] = useState<{ [year: string]: number }>({});

  useEffect(() => {
    // Fetch vote counts for all years
    const fetchVoteCounts = async () => {
      const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
      const subCompetitions = [
        { key: '202001', year: 2020 }, // Semi-Final A
        { key: '202002', year: 2020 }, // Semi-Final B
        { key: '202003', year: 2020 }  // Final
      ];
      const counts: { [year: string]: number } = {};
      
      await Promise.all([
        ...years.map(async (year) => {
          try {
            const response = await fetch(`/api/votes/${year}/simple`);
            if (response.ok) {
              const data = await response.json();
              counts[year] = data.totalVotes || 0;
            }
          } catch (error) {
            console.error(`Error fetching votes for ${year}:`, error);
          }
        }),
        ...subCompetitions.map(async ({ key }) => {
          try {
            const response = await fetch(`/api/votes/${key}/simple`);
            if (response.ok) {
              const data = await response.json();
              counts[key] = data.totalVotes || 0;
            }
          } catch (error) {
            console.error(`Error fetching votes for ${key}:`, error);
          }
        })
      ]);
      
      setVoteCounts(counts);
    };
    
    fetchVoteCounts();
  }, []);

  if (String(status) === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white">Eurovision Türkiye</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                )}
                <div className="text-white">
                  <p>{session.user?.name}</p>
                  <p className="text-sm text-gray-300">{session.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Harita Card */}
            <div className="group">
              <Link 
                href="/Harita"
                className="block relative overflow-hidden rounded-xl p-6 bg-gradient-to-r from-[#4f46e5] to-[#3730a3] transform transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl"
              >
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                  <div className="transform rotate-45 translate-x-8 -translate-y-8">
                    <div className="w-20 h-20 border-4 border-white rounded-full" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  Harita
                </h2>
                
                <div className="flex items-end justify-between h-5 relative">
                  <div className="text-gray-300 text-sm self-end">
                    <span>Oylama Haritası</span>
                  </div>
                  <div className="text-gray-200 text-5xl absolute right-0 bottom-[+5px]">
                    <span>🌍</span>
                  </div>
                </div>
              </Link>
            </div>

            {Array.from({ length: 32 }, (_, i) => 2026 - i).map(year => {
              // Special handling for year 2020 - show only contest-specific cards
              if (year === 2020) {
                return (
                  <div key={year} className="contents">
                    {/* Eurovision 2020 Overview */}
                    <div className="group">
                      <Link 
                        href="/eurovision2020"
                        className="block relative overflow-hidden rounded-xl p-6 bg-gradient-to-r from-[#249e57] to-[#11816b] transform transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl"
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                          <div className="transform rotate-45 translate-x-8 -translate-y-8">
                            <div className="w-20 h-20 border-4 border-white rounded-full" />
                          </div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-white mb-2">
                          Eurovision 2020
                        </h2>
                        
                        <div className="flex items-end justify-between">
                          <div className="text-gray-300 text-sm">
                            <span>Aktif</span>
                          </div>
                          {voteCounts[2020] !== undefined && (
                            <div className="text-gray-200 text-xs">
                              <span>{voteCounts[2020] === 0 ? '⌛' : `${formatNumber(voteCounts[2020])} oy`}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>

                    {/* Grand Final */}
                    <div className="group">
                      <Link 
                        href="/eurovision2020/final"
                        className="block relative overflow-hidden rounded-xl p-5 pl-6 bg-gradient-to-r from-[#194a6b] to-[#092d46] transform transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl"
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                          <div className="transform rotate-45 translate-x-8 -translate-y-8">
                            <div className="w-20 h-20 border-4 border-white rounded-full" />
                          </div>
                        </div>
                        
                        <h2 className="text-xl font-bold text-white">
                          Eurovision 2020
                        </h2>
                        <h3 className="text-sm font-semibold text-white">
                          Grand Final
                        </h3>
                        <div className="flex items-end justify-between">
                          <h3 className="text-sm font-semibold text-white">
                            Oylama Tamamlandı
                          </h3>
                          {voteCounts['202003'] !== undefined && (
                            <div className="text-gray-200 text-xs">
                              <span>{voteCounts['202003'] === 0 ? '⌛' : `${formatNumber(voteCounts['202003'])} oy`}</span>
                            </div>
                          )}
                        </div>
                        
                      </Link>
                    </div>
                    
                    {/* Semi-Final B */}
                    <div className="group">
                      <Link 
                        href="/eurovision2020/semi-final-b"
                        className="block relative overflow-hidden rounded-xl p-5 pl-6 bg-gradient-to-r from-[#194a6b] to-[#092d46] transform transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl"
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                          <div className="transform rotate-45 translate-x-8 -translate-y-8">
                            <div className="w-20 h-20 border-4 border-white rounded-full" />
                          </div>
                        </div>
                        
                        <h2 className="text-xl font-bold text-white">
                          Eurovision 2020
                        </h2>
                        <h3 className="text-sm font-semibold text-white">
                          Yarı Final B
                        </h3>
                        <div className="flex items-end justify-between">
                          <h3 className="text-sm font-semibold text-white">
                            Oylama Tamamlandı
                          </h3>
                          {voteCounts['202002'] !== undefined && (
                            <div className="text-gray-200 text-xs">
                              <span>{voteCounts['202002'] === 0 ? '⌛' : `${formatNumber(voteCounts['202002'])} oy`}</span>
                            </div>
                          )}
                        </div>
                        

                      </Link>
                    </div>

                    {/* Semi-Final A */}
                    <div className="group">
                      <Link 
                        href="/eurovision2020/semi-final-a"
                        className="block relative overflow-hidden rounded-xl p-5 pl-6 bg-gradient-to-r from-[#194a6b] to-[#092d46] transform transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl"
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                          <div className="transform rotate-45 translate-x-8 -translate-y-8">
                            <div className="w-20 h-20 border-4 border-white rounded-full" />
                          </div>
                        </div>
                        
                        <h2 className="text-xl font-bold text-white">
                          Eurovision 2020
                        </h2>
                        <h3 className="text-sm font-semibold text-white">
                          Yarı Final A
                        </h3>
                        <div className="flex items-end justify-between">
                          <h3 className="text-sm font-semibold text-white">
                            Oylama Tamamlandı
                          </h3>
                          {voteCounts['202001'] !== undefined && (
                            <div className="text-gray-200 text-xs">
                              <span>{voteCounts['202001'] === 0 ? '⌛' : `${formatNumber(voteCounts['202001'])} oy`}</span>
                            </div>
                          )}
                        </div>
                        

                      </Link>
                    </div>
                  </div>
                );
              }
              
              return (
                <div key={year} className="group">
                  <Link 
                    href={`/eurovision${year}`}
                    className={`
                      block relative overflow-hidden rounded-xl p-6 
                      ${year < 2026 && year > 2020 ? 'bg-gradient-to-r from-[#249e57] to-[#11816b]' : 'bg-[#2c3e50]'}
                      transform transition-all duration-300 shadow-lg
                      hover:scale-105 hover:shadow-xl
                    `}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                      <div className="transform rotate-45 translate-x-8 -translate-y-8">
                        <div className="w-20 h-20 border-4 border-white rounded-full" />
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Eurovision {year}
                    </h2>
                    
                    <div className="flex items-end justify-between">
                      <div className="text-gray-300 text-sm">
                        {year < 2026 && year > 2020 ? (
                          <span>Aktif</span>
                        ) : (
                          <span>Eklenecek...</span>
                        )}
                      </div>
                      {voteCounts[year] !== undefined && (
                        <div className="text-gray-200 text-xs">
                          <span>{voteCounts[year] === 0 ? '⌛' : `${formatNumber(voteCounts[year])} oy`}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Eurovision Türkiye</h1>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="bg-[#4285f4] hover:bg-[#357ae8] text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>

        <div className="text-center mb-8">
          <p className="text-gray-300 text-lg">Google ile giriş yaparak oylamaya başlayın ve tercihlerinizi kaydedin.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Harita Card */}
          <div className="group">
            <Link 
              href="/Harita"
              className="block relative overflow-hidden rounded-xl p-6 bg-gradient-to-r from-[#4f46e5] to-[#3730a3] transform transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl"
            >
              <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <div className="transform rotate-45 translate-x-8 -translate-y-8">
                  <div className="w-20 h-20 border-4 border-white rounded-full" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Harita
              </h2>
              
                <div className="flex items-end justify-between h-5 relative">
                  <div className="text-gray-300 text-sm self-end">
                    <span>Oylama Haritası</span>
                  </div>
                  <div className="text-gray-200 text-5xl absolute right-0 bottom-[+5px]">
                  <span>🌍</span>
                </div>
              </div>
            </Link>
          </div>

          {Array.from({ length: 32 }, (_, i) => 2026 - i).map(year => {
            // Special handling for year 2020 - show only contest-specific cards
            if (year === 2020) {
              return (
                <div key={year} className="contents">
                  {/* Eurovision 2020 Overview */}
                  <div className="group">
                    <Link 
                      href="/eurovision2020"
                      className="block relative overflow-hidden rounded-xl p-6 bg-gradient-to-r from-[#249e57] to-[#11816b] transform transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                        <div className="transform rotate-45 translate-x-8 -translate-y-8">
                          <div className="w-20 h-20 border-4 border-white rounded-full" />
                        </div>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Eurovision 2020
                      </h2>
                      
                      <div className="flex items-end justify-between">
                        <div className="text-gray-300 text-sm">
                          <span>Aktif</span>
                        </div>
                        {voteCounts[2020] !== undefined && (
                          <div className="text-gray-200 text-xs">
                            <span>{voteCounts[2020] === 0 ? '⌛' : `${formatNumber(voteCounts[2020])} oy`}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Grand Final */}
                  <div className="group">
                    <Link 
                      href="/eurovision2020/final"
                      className="block relative overflow-hidden rounded-xl p-5 pl-6 bg-gradient-to-r from-[#194a6b] to-[#092d46] transform transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                        <div className="transform rotate-45 translate-x-8 -translate-y-8">
                          <div className="w-20 h-20 border-4 border-white rounded-full" />
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-bold text-white">
                        Eurovision 2020
                      </h2>
                      <h3 className="text-sm font-semibold text-white">
                        Grand Final
                      </h3>
                      <div className="flex items-end justify-between">
                        <h3 className="text-sm font-semibold text-white">
                          Oylama Tamamlandı
                        </h3>
                        {voteCounts['202003'] !== undefined && (
                          <div className="text-gray-200 text-xs">
                            <span>{voteCounts['202003'] === 0 ? '⌛' : `${formatNumber(voteCounts['202003'])} oy`}</span>
                          </div>
                        )}
                      </div>
                      
                    </Link>
                  </div>
                  
                  {/* Semi-Final B */}
                  <div className="group">
                    <Link 
                      href="/eurovision2020/semi-final-b"
                      className="block relative overflow-hidden rounded-xl p-5 pl-6 bg-gradient-to-r from-[#194a6b] to-[#092d46] transform transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                        <div className="transform rotate-45 translate-x-8 -translate-y-8">
                          <div className="w-20 h-20 border-4 border-white rounded-full" />
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-bold text-white">
                        Eurovision 2020
                      </h2>
                      <h3 className="text-sm font-semibold text-white">
                        Yarı Final B
                      </h3>
                      <div className="flex items-end justify-between">
                        <h3 className="text-sm font-semibold text-white">
                          Oylama Tamamlandı
                        </h3>
                        {voteCounts['202002'] !== undefined && (
                          <div className="text-gray-200 text-xs">
                            <span>{voteCounts['202002'] === 0 ? '⌛' : `${formatNumber(voteCounts['202002'])} oy`}</span>
                          </div>
                        )}
                      </div>
                      

                    </Link>
                  </div>

                  {/* Semi-Final A */}
                  <div className="group">
                    <Link 
                      href="/eurovision2020/semi-final-a"
                      className="block relative overflow-hidden rounded-xl p-5 pl-6 bg-gradient-to-r from-[#194a6b] to-[#092d46] transform transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                        <div className="transform rotate-45 translate-x-8 -translate-y-8">
                          <div className="w-20 h-20 border-4 border-white rounded-full" />
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-bold text-white">
                        Eurovision 2020
                      </h2>
                      <h3 className="text-sm font-semibold text-white">
                        Yarı Final A
                      </h3>
                      <div className="flex items-end justify-between">
                        <h3 className="text-sm font-semibold text-white">
                          Oylama Tamamlandı
                        </h3>
                        {voteCounts['202001'] !== undefined && (
                          <div className="text-gray-200 text-xs">
                            <span>{voteCounts['202001'] === 0 ? '⌛' : `${formatNumber(voteCounts['202001'])} oy`}</span>
                          </div>
                        )}
                      </div>
                      

                    </Link>
                  </div>
                </div>
              );
            }
            
            return (
              <div key={year} className="group">
                <Link 
                  href={`/eurovision${year}`}
                  className={`
                    block relative overflow-hidden rounded-xl p-6 
                    ${year < 2026 && year > 2020 ? 'bg-gradient-to-r from-[#249e57] to-[#11816b]' : 'bg-[#2c3e50]'}
                    transform transition-all duration-300 shadow-lg
                    hover:scale-105 hover:shadow-xl
                  `}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                    <div className="transform rotate-45 translate-x-8 -translate-y-8">
                      <div className="w-20 h-20 border-4 border-white rounded-full" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Eurovision {year}
                  </h2>
                  
                  <div className="flex items-end justify-between">
                    <div className="text-gray-300 text-sm">
                      {year < 2026 && year > 2020 ? (
                        <span>Aktif</span>
                      ) : (
                        <span>Eklenecek...</span>
                      )}
                    </div>
                    {voteCounts[year] !== undefined && (
                      <div className="text-gray-200 text-xs">
                          <span>{voteCounts[year] === 0 ? '⌛' : `${formatNumber(voteCounts[year])} oy`}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
