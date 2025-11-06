'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { eurovision2020DataFinal, eurovision2020VideoData } from '@/data/eurovision2020';

// YouTube IFrame API type definitions
interface YouTubePlayer {
  loadVideoById(options: { videoId: string; startSeconds?: number; endSeconds?: number }): void;
  destroy(): void;
}

interface YouTubePlayerOptions {
  videoId: string;
  playerVars?: {
    autoplay?: number;
    controls?: number;
    rel?: number;
    modestbranding?: number;
    start?: number;
    end?: number;
  };
  events?: {
    onStateChange?: (event: { data: number }) => void;
  };
}


export default function Eurovision2020FinalPlayer() {
  const countries = useMemo(() => Object.keys(eurovision2020DataFinal), []);
  const [selectedCountry, setSelectedCountry] = useState<string>(countries[0] || '');
  const [isStageMode, setIsStageMode] = useState(true); // true: onStage, false: studio

  const entry = eurovision2020DataFinal[selectedCountry];
  const videoData = eurovision2020VideoData[selectedCountry];
  const videoId = isStageMode ? (videoData?.onStage || '') : (videoData?.studio || '');
  const start = 0;
  const end = undefined;

  // YouTube IFrame API integration
  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayer = useRef<YouTubePlayer | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const win = window as Window & { YT?: { Player: unknown }; onYouTubeIframeAPIReady?: () => void };
    if (win.YT && win.YT.Player) {
      setPlayerReady(true);
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    win.onYouTubeIframeAPIReady = () => setPlayerReady(true);
    return () => {
      delete win.onYouTubeIframeAPIReady;
    };
  }, []);

  // Handle Georgia's missing onStage performance
  useEffect(() => {
    if (selectedCountry === 'Georgia' && isStageMode && !videoId) {
      const timer = setTimeout(() => {
        const idx = countries.indexOf(selectedCountry);
        const nextIdx = (idx + 1) % countries.length;
        setSelectedCountry(countries[nextIdx]);
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [selectedCountry, isStageMode, videoId, countries]);

  // Create or update player when ready or selectedCountry changes
  useEffect(() => {
    if (!playerReady || !playerRef.current || !videoId) return;
    if (ytPlayer.current) {
      ytPlayer.current.loadVideoById({ videoId, startSeconds: start, endSeconds: end });
      return;
    }
    const win = window as unknown as Window & { YT: { Player: new (element: HTMLElement, config: YouTubePlayerOptions) => YouTubePlayer } };
    ytPlayer.current = new win.YT.Player(playerRef.current, {
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        start,
        end,
      },
      events: {
        onStateChange: (event: { data: number }) => {
          // 0 = ended
          if (event.data === 0) {
            const idx = countries.indexOf(selectedCountry);
            const nextIdx = (idx + 1) % countries.length;
            setSelectedCountry(countries[nextIdx]);
          }
        },
      },
    });
    // Clean up on unmount
    return () => {
      if (ytPlayer.current && ytPlayer.current.destroy) ytPlayer.current.destroy();
      ytPlayer.current = null;
    };
  }, [playerReady, selectedCountry, videoId, start, end, countries]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Eurovision 2020 Final • Player</h1>
          <Link href="/eurovision2020/final" className="text-sm text-blue-300 hover:text-blue-400 underline">
            ← Back to Final Voting
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-[#2c3e50] rounded-lg p-3 border border-[#334]">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                {videoId ? (
                  <div ref={playerRef} className="absolute inset-0 w-full h-full rounded bg-black" />
                ) : (
                  <div className="absolute inset-0 w-full h-full rounded bg-[#1f2a36] flex flex-col items-center justify-center text-center p-8">
                    <div className="text-6xl mb-4">🎭</div>
                    <div className="text-2xl font-bold text-white mb-2">{selectedCountry}</div>
                    <div className="text-lg text-gray-300 mb-4"> Sahne/Canlı Performansı Yok</div>
                    <div className="text-sm text-gray-400">No Stage/Live Performance Available</div>
                  </div>
                )}
              </div>

              {entry && (
                <>
                  <div className="mt-4 flex items-center justify-between text-gray-200">
                    <div className="flex items-center gap-3">
                      <Image 
                        src={`/flags/${selectedCountry.replace('&', 'and')}_${entry.code}.png`}
                        alt={`${selectedCountry} flag`}
                        width={40}
                        height={27}
                        className="object-cover rounded"
                      />
                      <div>
                        <div className="text-lg font-semibold">{selectedCountry}</div>
                        <div className="text-sm text-gray-300">{entry.performer} — {entry.song}</div>
                      </div>
                    </div>                  
                  {/* Navigation Buttons */}
                  <div className="mt-4 flex items-center justify-center gap-3 sm:gap-4 px-2">
                    <button
                      onClick={() => {
                        const idx = countries.indexOf(selectedCountry);
                        const prevIdx = (idx - 1 + countries.length) % countries.length;
                        setSelectedCountry(countries[prevIdx]);
                      }}
                      className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg bg-[#34495e] hover:bg-[#3d5a6b] active:bg-[#2c3e50] text-white font-semibold transition-all min-w-[120px] sm:min-w-[140px] touch-manipulation shadow-lg"
                    >
                      <span className="text-xl sm:text-2xl">←</span>
                      <span className="text-sm sm:text-base">Previous</span>
                    </button>
                    <button
                      onClick={() => {
                        const idx = countries.indexOf(selectedCountry);
                        const nextIdx = (idx + 1) % countries.length;
                        setSelectedCountry(countries[nextIdx]);
                      }}
                      className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg bg-[#34495e] hover:bg-[#3d5a6b] active:bg-[#2c3e50] text-white font-semibold transition-all min-w-[120px] sm:min-w-[140px] touch-manipulation shadow-lg"
                    >
                      <span className="text-sm sm:text-base">Next</span>
                      <span className="text-xl sm:text-2xl">→</span>
                    </button>
                  </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Country List */}
          <div className="bg-[#2c3e50] rounded-lg p-4 border border-[#334]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-white">Ülkeler</h2>
              <button
                className="relative w-32 h-9 rounded-full bg-[#34495e] border-2 border-[#3498db] overflow-hidden"
                onClick={() => setIsStageMode((v) => !v)}
                title={isStageMode ? 'Switch to studio version' : 'Switch to stage performance'}
              >
                <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-bold pointer-events-none">
                  <span className={`transition-colors z-10 ${isStageMode ? 'text-white' : 'text-gray-400'}`}>stage</span>
                  <span className={`transition-colors z-10 ${!isStageMode ? 'text-white' : 'text-gray-400'}`}>studio</span>
                </div>
                <div
                  className={`absolute top-0 h-full w-1/2 bg-[#3498db] rounded-full transition-transform duration-200 ease-in-out ${
                    isStageMode ? 'left-0' : 'left-1/2'
                  }`}
                />
              </button>
            </div>
            <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
              {countries.map((c) => {
                const info = eurovision2020DataFinal[c];
                const active = c === selectedCountry;
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedCountry(c)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      active ? 'bg-[#34495e] text-white' : 'bg-[#2a3846] hover:bg-[#2f4050] text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image 
                          src={`/flags/${c.replace('&', 'and')}_${info.code}.png`}
                          alt={`${c} flag`}
                          width={24}
                          height={16}
                          className="object-cover rounded"
                        />
                        <div>
                          <div className="font-medium">{c}</div>
                          <div className="text-xs text-gray-300">{info.performer} — {info.song}</div>
                        </div>
                      </div>
                      {active && (
                        <span className="text-xs px-2 py-1 rounded bg-green-700 text-white">Playing</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
