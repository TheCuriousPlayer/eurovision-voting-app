'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

interface VoteMapData {
  countryCounts: { [country: string]: number };
  countryPoints: { [country: string]: number };
  totalVotes: number;
  competitions?: number[];
  totalUsers?: number;
}

// Legacy countries that have been divided/dissolved (should be filtered out from display)
const legacyCountries = ['Serbia and Montenegro', 'Serbia Montenegro', 'Yugoslavia'];

// Country code to full name mapping (for Eurovision countries)
const countryNames: { [code: string]: string } = {
  'AD': 'Andorra',
  'AL': 'Albania',
  'AM': 'Armenia',
  'AU': 'Australia',
  'AT': 'Austria',
  'AZ': 'Azerbaijan',
  'BA': 'Bosnia and Herzegovina',
  'BE': 'Belgium',
  'BG': 'Bulgaria',
  'BY': 'Belarus',
  'CH': 'Switzerland',
  // 'CS': 'Serbia and Montenegro', // Legacy - divided into RS and ME
  'CY': 'Southern Cyprus',
  'CZ': 'Czechia',
  'DE': 'Germany',
  'DK': 'Denmark',
  'EE': 'Estonia',
  'ES': 'Spain',
  'FI': 'Finland',
  'FR': 'France',
  'GB': 'United Kingdom',
  'GE': 'Georgia',
  'GR': 'Greece',
  'HR': 'Croatia',
  'HU': 'Hungary',
  'IE': 'Ireland',
  'IL': 'Israel',
  'IS': 'Iceland',
  'IT': 'Italy',
  'LT': 'Lithuania',
  'LU': 'Luxembourg',
  'LV': 'Latvia',
  'MA': 'Morocco',
  'MC': 'Monaco',
  'MD': 'Moldova',
  'ME': 'Montenegro',
  'MK': 'North Macedonia',
  'MT': 'Malta',
  'NL': 'Netherlands',
  'NO': 'Norway',
  'PL': 'Poland',
  'PT': 'Portugal',
  'RO': 'Romania',
  'RS': 'Serbia',
  'RU': 'Russia',
  'SE': 'Sweden',
  'SI': 'Slovenia',
  'SK': 'Slovakia',
  'SM': 'San Marino',
  'TR': 'Türkiye',
  'UA': 'Ukraine',
  // 'YU': 'Yugoslavia' // Legacy - divided into RS, ME, HR, SI, MK, BA
};

// Reverse mapping: country name to code
const nameToCode: { [name: string]: string } = Object.entries(countryNames).reduce((acc, [code, name]) => {
  acc[name] = code;
  return acc;
}, {} as { [name: string]: string });

// Map GeoJSON country names to our preferred display names
const geoNameToDisplayName: { [key: string]: string } = {
  'Turkey': 'Türkiye',
  'Czech Republic': 'Czechia',
  'Macedonia': 'North Macedonia',
  'N. Cyprus': 'Turkish Republic of Northern Cyprus',
  // Add more mappings as needed
};

export default function HaritaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [voteData, setVoteData] = useState<VoteMapData | null>(null);
  const [globalVoteData, setGlobalVoteData] = useState<VoteMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [showLegacyTooltip, setShowLegacyTooltip] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'global'>('personal');
  const [tooltipContent, setTooltipContent] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      alert('Bu Sayfaya Erişebilmek İçin Lütfen Google İle Giriş Yapınız.\n\nTo Access This Page Please Sign in with Google.');
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchVoteData();
    }
  }, [status, router]);

  const fetchVoteData = async () => {
    try {
      const response = await fetch('/api/user-votes-map');
      if (response.ok) {
        const data = await response.json();
        setVoteData(data);
      } else {
        console.error('Failed to fetch vote data');
      }
    } catch (error) {
      console.error('Error fetching vote data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalVoteData = async () => {
    if (globalVoteData) return; // Already fetched
    
    setGlobalLoading(true);
    try {
      const response = await fetch('/api/global-votes-map');
      if (response.ok) {
        const data = await response.json();
        setGlobalVoteData(data);
      } else {
        console.error('Failed to fetch global vote data');
      }
    } catch (error) {
      console.error('Error fetching global vote data:', error);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Fetch global data when Global tab is activated
  useEffect(() => {
    if (activeTab === 'global' && !globalVoteData && !globalLoading) {
      fetchGlobalVoteData();
    }
  }, [activeTab]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-white text-xl">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Get top countries sorted by sum of count + points (for personal tab)
  // Filter out legacy countries (Serbia and Montenegro, Yugoslavia, etc.)
  const sortedCountries = Object.entries(voteData?.countryCounts || {})
    .filter(([country]) => !legacyCountries.includes(country)) // Filter out legacy countries
    .map(([country, count]) => {
      const points = voteData?.countryPoints?.[country] || 0;
      const sum = count + points;
      return [country, count, points, sum] as [string, number, number, number];
    })
    .sort(([, , , sumA], [, , , sumB]) => sumB - sumA)
    .slice(0, 100); // Top 100 (MAX 100 ülkeden fazla gösterilmez)

  // Get top countries for global tab
  const sortedGlobalCountries = Object.entries(globalVoteData?.countryCounts || {})
    .filter(([country]) => !legacyCountries.includes(country))
    .map(([country, count]) => {
      const points = globalVoteData?.countryPoints?.[country] || 0;
      const sum = count + points;
      return [country, count, points, sum] as [string, number, number, number];
    })
    .sort(([, , , sumA], [, , , sumB]) => sumB - sumA)
    .slice(0, 100);

  // Calculate max sum for color scaling
  const maxSum = Math.max(...sortedCountries.map(([, , , sum]) => sum), 1);
  const maxGlobalSum = Math.max(...sortedGlobalCountries.map(([, , , sum]) => sum), 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          {activeTab === 'personal' ? 'Oy Haritam' : 'Global Oy Haritası'}
        </h1>
        <p className="text-gray-300 text-center mb-8">
          {activeTab === 'personal' ? (
            <>
              Toplam <span className="text-yellow-400 font-bold">{voteData?.totalVotes || 0}</span> oy verdim
              {voteData?.competitions && ` (${voteData.competitions.length} yarışma)`}
            </>
          ) : (
            <>
              <span className="text-green-400 font-bold">{globalVoteData?.totalUsers || 0}</span> kullanıcı toplam{' '}
              <span className="text-green-400 font-bold">{globalVoteData?.totalVotes || 0}</span> oy verdi
              {globalVoteData?.competitions && ` (${globalVoteData.competitions.length} yarışma)`}
            </>
          )}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Country List */}
          <div className="lg:col-span-1">
            <div className="bg-[#2c3e50] rounded-lg p-6">
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === 'personal'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#243342]'
                  }`}
                >
                  Kişisel
                </button>
                <button
                  onClick={() => setActiveTab('global')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === 'global'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#243342]'
                  }`}
                >
                  Global
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {/* Legacy Countries Info Tooltip */}
                <div className="relative inline-block">
                  <button
                    onClick={() => setShowLegacyTooltip(!showLegacyTooltip)}
                    onMouseEnter={() => setShowLegacyTooltip(true)}
                    onMouseLeave={() => setShowLegacyTooltip(false)}
                    className="w-6 h-6 rounded-full bg-yellow-500 text-white font-bold flex items-center justify-center hover:bg-yellow-600 transition-colors cursor-help"
                    title="Bilgi"
                  >
                    !
                  </button>
                  
                  {showLegacyTooltip && (
                    <div className="absolute left-0 top-8 w-80 bg-[#1a2332] border-2 border-yellow-500 rounded-lg p-4 shadow-xl z-50">
                      <div className="absolute -top-2 left-4 w-4 h-4 bg-[#1a2332] border-t-2 border-l-2 border-yellow-500 rotate-45"></div>
                      <button
                        onClick={() => setShowLegacyTooltip(false)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg"
                      >
                        ✕
                      </button>
                      <div className="text-sm text-gray-300 space-y-2 pt-1">
                        <p className="font-bold text-yellow-400 mb-2">📌 Tarihi Ülkeler Bilgisi</p>
                        <p>Bölünen veya dağılan ülkelere verdiğiniz oylar, halef ülkelerine eşit şekilde dağıtılır:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li><strong>Yugoslavia</strong> → Sırbistan Karadağ, Hırvatistan, Slovenya, Kuzey Makedonya, Bosna-Hersek</li>
                          <li><strong>Serbia and Montenegro</strong> → Sırbistan + Karadağ</li>
                        </ul>
                        <p className="text-xs text-gray-400 mt-2 pt-2 border-gray-600">
                          💡 Örnek: "Serbia and Montenegro"ya 12 puan verdiyseniz, hem Sırbistan hem de Karadağ 12'şer puan alır.
                        </p>
                        
                        <p className="font-bold text-yellow-400 mb-2 mt-4 pt-3 border-t border-gray-600">📌 Özel Oylamalar Bilgisi</p>
                        <p>Özel oluşturulmuş oylamalar dahil edilmemiştir.</p>
                        <p className="text-xs text-gray-400 mt-2">
                          💡 Örnek: Eurovision 2020 Yarı Final A, Eurovision 2020 Yarı Final B ,Eurovision 2020 Final
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-white">
                  En Çok Oy Alan Ülkeler
                </h2>
              </div>
              
              <div className="space-y-3">
                {activeTab === 'personal' ? (
                  // Personal Tab Content
                  sortedCountries.length > 0 ? (
                    sortedCountries.map(([country, count, points, sum], index) => {
                      const code = nameToCode[country];
                      const percentage = ((sum / maxSum) * 100).toFixed(0);
                      
                      // Debug: log countries without codes
                      if (!code) {
                        console.warn(`No flag code found for country: "${country}"`);
                      }
                      
                      return (
                        <div key={country} className="flex items-center gap-3">
                          <div className="text-gray-400 font-mono text-sm w-6">
                            #{index + 1}
                          </div>
                          {code ? (
                            <img
                              src={`/flags/${country}_${code}.png`}
                              alt={country}
                              className="w-8 h-6 object-cover rounded shadow"
                              onError={(e) => {
                                console.error(`Failed to load flag for ${country} (${code})`);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-6 flex items-center justify-center bg-gray-600 rounded text-xs text-white">
                              ?
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex flex-col">
                                <span className="text-white font-medium">{country}</span>
                                <span className="text-xs text-gray-400">{count} oy + {points} puan</span>
                              </div>
                              <span className="text-yellow-400 font-bold">{sum}</span>
                            </div>
                            <div className="w-full bg-[#1a1a2e] rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-yellow-500 to-yellow-300 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      Henüz oy vermediniz
                    </p>
                  )
                ) : (
                  // Global Tab Content
                  globalLoading ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">⏳</div>
                      <p className="text-gray-300">Yükleniyor...</p>
                    </div>
                  ) : sortedGlobalCountries.length > 0 ? (
                    sortedGlobalCountries.map(([country, count, points, sum], index) => {
                      const code = nameToCode[country];
                      const percentage = ((sum / maxGlobalSum) * 100).toFixed(0);
                      
                      if (!code) {
                        console.warn(`No flag code found for country: "${country}"`);
                      }
                      
                      return (
                        <div key={country} className="flex items-center gap-3">
                          <div className="text-gray-400 font-mono text-sm w-6">
                            #{index + 1}
                          </div>
                          {code ? (
                            <img
                              src={`/flags/${country}_${code}.png`}
                              alt={country}
                              className="w-8 h-6 object-cover rounded shadow"
                              onError={(e) => {
                                console.error(`Failed to load flag for ${country} (${code})`);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-6 flex items-center justify-center bg-gray-600 rounded text-xs text-white">
                              ?
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex flex-col">
                                <span className="text-white font-medium">{country}</span>
                                <span className="text-xs text-gray-400">{count} oy + {points} puan</span>
                              </div>
                              <span className="text-green-400 font-bold">{sum}</span>
                            </div>
                            <div className="w-full bg-[#1a1a2e] rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-300 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">🌍</div>
                      <p className="text-gray-300 text-lg mb-2">Global İstatistikler</p>
                      <p className="text-gray-500 text-sm">
                        Henüz hiç oy verilmemiş
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* World Map Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-[#2c3e50] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                Dünya Haritası
              </h2>
              
              <div className="bg-[#1a1a2e] rounded-lg p-4 relative">
                {/* Map Legend */}
                <div className="flex items-center justify-center gap-4 mb-4 text-xs">
                  <span className="text-gray-400">Az Oy</span>
                  <div className="flex gap-1">
                    <div className={`w-6 h-4 rounded ${activeTab === 'personal' ? 'bg-yellow-900' : 'bg-green-900'}`}></div>
                    <div className={`w-6 h-4 rounded ${activeTab === 'personal' ? 'bg-yellow-700' : 'bg-green-700'}`}></div>
                    <div className={`w-6 h-4 rounded ${activeTab === 'personal' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    <div className={`w-6 h-4 rounded ${activeTab === 'personal' ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                    <div className={`w-6 h-4 rounded ${activeTab === 'personal' ? 'bg-yellow-300' : 'bg-green-300'}`}></div>
                  </div>
                  <span className="text-gray-400">Çok Oy</span>
                </div>

                {/* Tooltip */}
                {tooltipContent && (
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm z-50 pointer-events-none">
                    {tooltipContent}
                  </div>
                )}

                {/* Interactive Map */}
                <div className="w-full" style={{ height: '500px' }}>
                  <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                      scale: 150,
                      center: [15, 50]
                    }}
                    width={800}
                    height={450}
                  >
                    <ZoomableGroup>
                      <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                        {({ geographies }) =>
                          geographies.map((geo) => {
                            const countryCode = geo.id; // ISO 3166-1 numeric code
                            const countryName = geo.properties.name;
                            
                            // Try to find matching country in our data
                            const currentData = activeTab === 'personal' ? voteData : globalVoteData;
                            const countryCounts = currentData?.countryCounts || {};
                            const countryPoints = currentData?.countryPoints || {};
                            
                            // Find country by name match
                            let matchedCountry = null;
                            let voteCount = 0;
                            let votePoints = 0;
                            
                            for (const [country, count] of Object.entries(countryCounts)) {
                              if (country === countryName || 
                                  countryName.includes(country) || 
                                  country.includes(countryName) ||
                                  (country === 'Türkiye' && countryName === 'Turkey') ||
                                  (country === 'United Kingdom' && countryName === 'United Kingdom') ||
                                  (country === 'Czechia' && countryName === 'Czech Republic') ||
                                  (country === 'North Macedonia' && countryName === 'Macedonia')) {
                                matchedCountry = country;
                                voteCount = count;
                                votePoints = countryPoints[country] || 0;
                                break;
                              }
                            }
                            
                            const totalScore = voteCount + votePoints;
                            const maxScore = Math.max(...Object.entries(countryCounts).map(([c, count]) => 
                              count + (countryPoints[c] || 0)
                            ), 1);
                            
                            // Calculate color intensity (0-1)
                            const intensity = totalScore > 0 ? totalScore / maxScore : 0;
                            
                            // Generate color based on intensity
                            let fillColor = '#2c3e50'; // Default gray for no votes
                            if (intensity > 0) {
                              if (activeTab === 'personal') {
                                // Yellow gradient for personal
                                if (intensity > 0.8) fillColor = '#fcd34d'; // yellow-300
                                else if (intensity > 0.6) fillColor = '#fbbf24'; // yellow-400
                                else if (intensity > 0.4) fillColor = '#f59e0b'; // yellow-500
                                else if (intensity > 0.2) fillColor = '#b45309'; // yellow-700
                                else fillColor = '#78350f'; // yellow-900
                              } else {
                                // Green gradient for global
                                if (intensity > 0.8) fillColor = '#86efac'; // green-300
                                else if (intensity > 0.6) fillColor = '#4ade80'; // green-400
                                else if (intensity > 0.4) fillColor = '#22c55e'; // green-500
                                else if (intensity > 0.2) fillColor = '#15803d'; // green-700
                                else fillColor = '#14532d'; // green-900
                              }
                            }
                            
                            return (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill={fillColor}
                                stroke="#1a1a2e"
                                strokeWidth={0.5}
                                onMouseEnter={() => {
                                  // Use preferred display name if available
                                  const displayName = geoNameToDisplayName[countryName] || countryName;
                                  
                                  if (matchedCountry && totalScore > 0) {
                                    setTooltipContent(
                                      `${matchedCountry}: ${voteCount} oy + ${votePoints} puan = ${totalScore}`
                                    );
                                  } else {
                                    setTooltipContent(`${displayName}: Oy yok`);
                                  }
                                }}
                                onMouseLeave={() => {
                                  setTooltipContent('');
                                }}
                                style={{
                                  default: { outline: 'none' },
                                  hover: { 
                                    fill: activeTab === 'personal' ? '#fef3c7' : '#d1fae5',
                                    outline: 'none',
                                    cursor: 'pointer'
                                  },
                                  pressed: { outline: 'none' }
                                }}
                              />
                            );
                          })
                        }
                      </Geographies>
                    </ZoomableGroup>
                  </ComposableMap>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {activeTab === 'personal' ? (
                <>
                  <div className="bg-[#2c3e50] rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">
                      {Object.keys(voteData?.countryCounts || {}).filter(c => !legacyCountries.includes(c)).length}
                    </div>
                    <div className="text-gray-300 text-sm mt-1">Farklı Ülke</div>
                  </div>
                  <div className="bg-[#2c3e50] rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">
                      {voteData?.totalVotes || 0}
                    </div>
                    <div className="text-gray-300 text-sm mt-1">Toplam Oy</div>
                  </div>
                  <div className="bg-[#2c3e50] rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">
                      {voteData?.competitions?.length || 0}
                    </div>
                    <div className="text-gray-300 text-sm mt-1">Yarışma</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-[#2c3e50] rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {globalVoteData?.totalUsers || 0}
                    </div>
                    <div className="text-gray-300 text-sm mt-1">Tekil Kullanıcı</div>
                  </div>
                  <div className="bg-[#2c3e50] rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {Object.keys(globalVoteData?.countryCounts || {}).filter(c => !legacyCountries.includes(c)).length}
                    </div>
                    <div className="text-gray-300 text-sm mt-1">Farklı Ülke</div>
                  </div>
                  <div className="bg-[#2c3e50] rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {globalVoteData?.totalVotes || 0}
                    </div>
                    <div className="text-gray-300 text-sm mt-1">Toplam Oy</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
