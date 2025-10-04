﻿"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import { VOTE_CONFIG } from '@/config/eurovisionvariables';

type Results = {
  countryPoints: { [country: string]: number };
  totalVotes: number;
};

// Combined per-country data: flag code, performer, song, youtube id and optional snippet times
const eurovision2022Data: { [key: string]: { code: string; performer: string; song: string; youtubeId?: string; times?: { start: number; end: number } } } = {
  'Albania': { code: 'AL', performer: 'Ronela Hajati', song: 'Sekret', youtubeId: '_jWXmo0-ZjI', times: { start: 67, end: 88 } },
  'Armenia': { code: 'AM', performer: 'Rosa Linn', song: 'Snap', youtubeId: 'DAJ6vfmD_ic', times: { start: 103, end: 120 } },
  'Australia': { code: 'AU', performer: 'Sheldon Riley', song: 'Not the Same', youtubeId: 'wosfFz2FJPU', times: { start: 99, end: 116 } },
  'Austria': { code: 'AT', performer: 'LUM!X ft. Pia Maria', song: 'Halo', youtubeId: 'dMgjHYwXSuo', times: { start: 62, end: 71 } },
  'Azerbaijan': { code: 'AZ', performer: 'Nadir Rustamli', song: 'Fade to Black', youtubeId: 'tegPzHEL4ms', times: { start: 134, end: 150 } },
  'Belgium': { code: 'BE', performer: 'Jérémie Makiese', song: 'Miss You', youtubeId: 'sB09advfF6E', times: { start: 129, end: 147 } },
  'Bulgaria': { code: 'BG', performer: 'Intelligent Music Project', song: 'Intention', youtubeId: 'EwZTI5AoTg4', times: { start: 160, end: 167 } },
  'Croatia': { code: 'HR', performer: 'Mia Dimšić', song: 'Guilty Pleasure', youtubeId: '9vBQdtW3mJE', times: { start: 118, end: 131 } },
  'Czechia': { code: 'CZ', performer: 'We Are Domi', song: 'Lights Off', youtubeId: 'EGRzSefqOm0', times: { start: 170, end: 187 } },
  'Denmark': { code: 'DK', performer: 'Reddi', song: 'The Show', youtubeId: 'cVg6MpVR2Pw', times: { start: 171, end: 182 } },
  'Estonia': { code: 'EE', performer: 'Stefan', song: 'Hope', youtubeId: 'GdTpQmMem8U', times: { start: 168, end: 184 } },
  'Finland': { code: 'FI', performer: 'The Rasmus', song: 'Jezebel', youtubeId: 'LSi9nfr65FE', times: { start: 47, end: 62 } },
  'France': { code: 'FR', performer: 'Alvan & Ahez', song: 'Fulenn', youtubeId: 'H1lcGXwOqJI', times: { start: 130, end: 149 } },
  'Georgia': { code: 'GE', performer: 'Circus Mircus', song: 'Lock Me In', youtubeId: 'zXiZAbqETvk', times: { start: 147, end: 156 } },
  'Germany': { code: 'DE', performer: 'Malik Harris', song: 'Rockstars', youtubeId: '2BYIou-oWXA', times: { start: 141, end: 158 } },
  'Greece': { code: 'GR', performer: 'Amanda Georgiadi Tenfjord', song: 'Die Together', youtubeId: 'BWeT0nJpB3Y', times: { start: 153, end: 167 } },
  'Iceland': { code: 'IS', performer: 'Systur', song: 'Með Hækkandi Sól', youtubeId: 'G71c48O3j-s', times: { start: 71, end: 82 } },
  'Ireland': { code: 'IE', performer: 'Brooke', song: "That's Rich", youtubeId: 'Kq2AJrWm04s', times: { start: 164, end: 176 } },
  'Israel': { code: 'IL', performer: 'Michael Ben David', song: 'I.M', youtubeId: 'XgXjPUsjx4Y', times: { start: 62, end: 72 } },
  'Italy': { code: 'IT', performer: 'Mahmood & Blanco', song: 'Brividi', youtubeId: 'blEy4xHuMbY', times: { start: 104, end: 120 } },
  'Latvia': { code: 'LV', performer: 'Citi Zēni', song: 'Eat Your Salad', youtubeId: 'TM0_0WfuxSk', times: { start: 49, end: 62 } },
  'Lithuania': { code: 'LT', performer: 'Monika Liu', song: 'Sentimentai', youtubeId: 'BVqSTVJhD44', times: { start: 146, end: 158 } },
  'Malta': { code: 'MT', performer: 'Emma Muscat', song: 'I Am What I Am', youtubeId: 'DFCFM5qtvms', times: { start: 154, end: 163 } },
  'Moldova': { code: 'MD', performer: 'Zdob și Zdub & Advahov Brothers', song: 'Trenulețul', youtubeId: 'DUqf_zO2QaI', times: { start: 84, end: 99 } },
  'Montenegro': { code: 'ME', performer: 'Vladana', song: 'Breathe', youtubeId: 'L-ViRVRiGl0', times: { start: 174, end: 186 } },
  'Netherlands': { code: 'NL', performer: 'S10', song: 'De Diepte', youtubeId: 'sgOnu7ux2-k', times: { start: 52, end: 64 } },
  'North Macedonia': { code: 'MK', performer: 'Andrea', song: 'Circles', youtubeId: 'zvOihqB4eKk', times: { start: 171, end: 185 } },
  'Norway': { code: 'NO', performer: 'Subwoolfer', song: 'Give That Wolf a Banana', youtubeId: 'adCU2rQyDeY', times: { start: 145, end: 163 } },
  'Poland': { code: 'PL', performer: 'Ochman', song: 'River', youtubeId: 'jRVDZ6446eM', times: { start: 106, end: 122 } },
  'Portugal': { code: 'PT', performer: 'Maro', song: 'Saudade, Saudade', youtubeId: 'mZtbD47u6yI', times: { start: 80, end: 96 } },
  'Romania': { code: 'RO', performer: 'WRS', song: 'Llámame', youtubeId: 'nPpuwy79sHs', times: { start: 166, end: 183 } },
  'San Marino': { code: 'SM', performer: 'Achille Lauro', song: 'Stripper', youtubeId: 'vCmX64N_sXM', times: { start: 66, end: 74 } },
  'Serbia': { code: 'RS', performer: 'Konstrakta', song: 'In Corpore Sano', youtubeId: 'nBtQj1MfNYA', times: { start: 180, end: 191 } },
  'Slovenia': { code: 'SI', performer: 'LPS', song: 'Disko', youtubeId: 'S1tFqoflsT8', times: { start: 90, end: 105 } },
  'Southern Cyprus': { code: 'CY', performer: 'Andromache', song: 'Ela', youtubeId: 'W2IUdTl-gAI', times: { start: 170, end: 182 } },
  'Spain': { code: 'ES', performer: 'Chanel', song: 'SloMo', youtubeId: 'jSQYTt4xg3I', times: { start: 169, end: 191 } },
  'Sweden': { code: 'SE', performer: 'Cornelia Jakobs', song: 'Hold Me Closer', youtubeId: 'i777psA2gP4', times: { start: 100, end: 120 } },
  'Switzerland': { code: 'CH', performer: 'Marius Bear', song: 'Boys Do Cry', youtubeId: 'hq2HCmHv5p4', times: { start: 150, end: 169 } },
  'Ukraine': { code: 'UA', performer: 'Kalush Orchestra', song: 'Stefania', youtubeId: 'F1fl60ypdLs', times: { start: 108, end: 124 } },
  'United Kingdom': { code: 'GB', performer: 'Sam Ryder', song: 'Space Man', youtubeId: 'RZ0hqX_92zI', times: { start: 96, end: 112 } }
};

export default function Eurovision2022RevealPage() {
  // React hooks (always declared in the same order)
  const { data: session, status } = useSession();
  const [results, setResults] = useState<Results | null>(null);
  const [orderedCountries, setOrderedCountries] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedVideoRange, setSelectedVideoRange] = useState<{ start: number; end: number } | null>(null);
  const videoCloseTimer = useRef<number | null>(null);
  
  // Effects (declare immediately so hooks run unconditionally)
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/votes/2022/public');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as Results;
        setResults(data);

        // Sort countries ascending by score (lowest first)
        const entries = Object.entries(data.countryPoints || {});
        entries.sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
        const ordered = entries.map(([country]) => country);
        setOrderedCountries(ordered);
        setVisibleCount(0); // initial state: none visible
      } catch (err) {
        setError((err as Error).message || 'Failed to load results');
      }
    }

    load();
  }, []);

  // Trigger fireworks when the final country (winner) is revealed
  useEffect(() => {
    if (!orderedCountries || orderedCountries.length === 0) return;
    // Trigger when we've revealed all countries (or exceeded) — use >= for safety
    if (visibleCount >= orderedCountries.length && visibleCount > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      if (!ctx) return;

      // Size canvas for high-DPI displays
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = window.innerWidth;
      const cssHeight = window.innerHeight;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      ctx.scale(dpr, dpr);
      let width = cssWidth;
      let height = cssHeight;
      let raf = 0;
      type Particle = {
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        decay: number;
        hue: number;
        alpha: number;
        size: number;
      };
      const particles: Particle[] = [];

      function rand(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      function createBurst() {
        const x = rand(width * 0.2, width * 0.8);
        const y = rand(height * 0.1, height * 0.5);
        const hue = Math.floor(rand(0, 360));
        const count = Math.floor(rand(40, 90));
        for (let i = 0; i < count; i++) {
          const speed = rand(1, 6);
          const angle = rand(0, Math.PI * 2);
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: rand(60, 120),
            decay: rand(0.01, 0.03),
            hue,
            alpha: 1,
            size: rand(2.2, 4.5)
          });
        }
      }

      function onResize() {
        const el = canvasRef.current;
        if (!el) return;
        const dpr = window.devicePixelRatio || 1;
        const cssW = window.innerWidth;
        const cssH = window.innerHeight;
        // set CSS size
        el.style.width = `${cssW}px`;
        el.style.height = `${cssH}px`;
        // set backing store size for HiDPI
        el.width = Math.floor(cssW * dpr);
        el.height = Math.floor(cssH * dpr);
        // reset transform to match dpr (use setTransform to avoid accumulation)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        width = cssW;
        height = cssH;
      }

      window.addEventListener('resize', onResize);

      function render() {
        // Clear canvas each frame to keep background transparent
        ctx.clearRect(0, 0, width, height);

        // use additive blending for brighter fireworks without dark overlay
        ctx.globalCompositeOperation = 'lighter';

        if (Math.random() < 0.08) createBurst();

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.vy += 0.03; // gravity
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1;
          p.alpha -= p.decay;

          if (p.alpha <= 0 || p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${Math.max(0, p.alpha)})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // restore default composite for potential future drawings
        ctx.globalCompositeOperation = 'source-over';

        raf = requestAnimationFrame(render);
      }

      // start
      ctx.clearRect(0, 0, width, height);
      render();

      // stop after 35s
      const stopTimer = setTimeout(() => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        if (ctx) ctx.clearRect(0, 0, width, height);
      }, 35000);

      return () => {
        clearTimeout(stopTimer);
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        if (ctx) ctx.clearRect(0, 0, width, height);
      };
    }
  }, [visibleCount, orderedCountries]);

  // Play a short YouTube clip (open modal) whenever a new country is revealed
  useEffect(() => {
    // Only trigger when visibleCount increments to reveal a new country
    if (!orderedCountries || orderedCountries.length === 0) return;
    if (visibleCount <= 0) return;

    const idx = visibleCount - 1; // newly revealed country index in orderedCountries
    if (idx < 0 || idx >= orderedCountries.length) return;
  const country = orderedCountries[idx];
  const ytId = eurovision2022Data[country]?.youtubeId;
    if (!ytId) return; // no video available

    // Clear previous timer if any
    if (videoCloseTimer.current) {
      window.clearTimeout(videoCloseTimer.current);
      videoCloseTimer.current = null;
    }

    // Determine start/end for this country (fallback to 0..5)
  const times = eurovision2022Data[country]?.times ?? { start: 0, end: 5 };

    // Clear previous timer if any
    if (videoCloseTimer.current) {
      window.clearTimeout(videoCloseTimer.current);
      videoCloseTimer.current = null;
    }

    setSelectedVideoRange(times);
    setSelectedVideoId(ytId);

    // Auto-close after the configured snippet duration (minimum 1s)
    const durationMs = Math.max(1000, (Math.max(times.end, times.start) - times.start) * 1000);
    videoCloseTimer.current = window.setTimeout(() => {
      setSelectedVideoId('');
      setSelectedVideoRange(null);
      videoCloseTimer.current = null;
    }, durationMs);
    // Cleanup if component unmounts before timer
    return () => {
      if (videoCloseTimer.current) {
        window.clearTimeout(videoCloseTimer.current);
        videoCloseTimer.current = null;
      }
    };
  }, [visibleCount, orderedCountries]);

  // Reveal helpers (must be declared unconditionally so hooks order is stable)
  function showNext() {
    setVisibleCount((v) => Math.min(orderedCountries.length, v + 1));
  }

  function resetAll() {
    setVisibleCount(0);
  }

  // Access control helpers (derived from session)
  const userEmail = session?.user?.email ?? '';
  const gmList = VOTE_CONFIG?.['2022']?.GMs
    ? VOTE_CONFIG['2022'].GMs.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
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
            onClick={() => signIn('google', { callbackUrl: `${window.location.origin}/eurovision2022reveal` })}
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
        <div className="flex w-full max-w-6xl mx-auto p-4 h-full relative">
      <style>{`
        @keyframes revealDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Left sidebar with title and controls */}
      {/* fireworks canvas overlay (full viewport) */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 w-full h-full z-50"
      />
      {/* YouTube video modal (moved into sidebar) */}
      <aside className="w-full md:w-72 mr-6 flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-4">Eurovision 2022</h1>

        {error && <div className="text-red-400 mb-3">Error: {error}</div>}

        <div className="flex flex-col gap-3 mb-4">
          <button
            onClick={showNext}
            className="px-4 py-2 bg-[#4a90e2] text-white rounded hover:brightness-110 disabled:opacity-50"
            disabled={!orderedCountries.length || visibleCount >= orderedCountries.length}
          >
            Sıradakini Göster
          </button>
          <button
            onClick={resetAll}
            className="px-4 py-2 bg-[#e74c3c] text-white rounded hover:brightness-110 disabled:opacity-50"
            disabled={visibleCount === 0}
          >
            Reset
          </button>
          {/* YouTube video modal placed under Reset button */}
          {selectedVideoId && (
            <div className="mt-3">
              <div className="bg-transparent rounded-lg shadow-none p-0 relative">
                <iframe
                  width="300"
                  height="175"
                  src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&controls=0${selectedVideoRange ? `&start=${selectedVideoRange.start}&end=${selectedVideoRange.end}` : '&start=0&end=5'}`}
                  title="Eurovision Song Reveal"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="rounded"
                />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content: revealed list */}
      <div className="flex-1 w-full">
        {orderedCountries.length === 0 && !error && <div>Yükleniyor...</div>}

        <ul className="grid grid-cols-1 gap-2">
          {/* Render only the revealed countries, newest revealed on top to push list down */}
          {orderedCountries.slice(0, visibleCount).reverse().map((country) => {
            const score = results?.countryPoints[country] ?? 0;
            const code = eurovision2022Data[country]?.code || 'XX';
            const songInfo = eurovision2022Data[country];
            // Final ranking: 1 = highest points. Since orderedCountries is sorted ascending (lowest first),
            // compute rank as (total - index).
            const rank = orderedCountries.length - orderedCountries.indexOf(country);
            return (
              <li
                key={country}
                className="flex flex-col gap-1 p-2 rounded-lg bg-[#122d4b] text-white shadow-sm"
                style={{
                  animation: 'revealDown 350ms ease',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-200 mr-0">{rank}.</div>
                    <Image
                      src={`/flags/${country.replace('&', 'and')}_${code}.png`}
                      alt={`${country} flag`}
                      width={26}
                      height={18}
                      className="object-cover rounded"
                    />
                    <div className="text-base font-medium">{country}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg">{score} Puan</div>
                  </div>
                </div>

                {songInfo && (
                  <div className="text-xs text-gray-300 pl-10">
                    {songInfo.performer} — <span className="italic">{songInfo.song}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
        </div>
      </div>
    </div>
  );
}
