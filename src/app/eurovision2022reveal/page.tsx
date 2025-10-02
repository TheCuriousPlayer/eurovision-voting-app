"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import { VOTE_CONFIG } from '@/config/eurovisionvariables';

type Results = {
  countryPoints: { [country: string]: number };
  totalVotes: number;
};

// Minimal country -> ISO code map for flags (same as VotingInterface)
const countryToCode: { [key: string]: string } = {
  'Albania': 'AL', 'Armenia': 'AM', 'Australia': 'AU', 'Austria': 'AT', 'Azerbaijan': 'AZ',
  'Belgium': 'BE', 'Bulgaria': 'BG', 'Croatia': 'HR', 'Czechia': 'CZ', 'Denmark': 'DK',
  'Estonia': 'EE', 'Finland': 'FI', 'France': 'FR', 'Georgia': 'GE', 'Germany': 'DE',
  'Greece': 'GR', 'Iceland': 'IS', 'Ireland': 'IE', 'Israel': 'IL', 'Italy': 'IT',
  'Latvia': 'LV', 'Lithuania': 'LT', 'Malta': 'MT', 'Moldova': 'MD', 'Montenegro': 'ME',
  'Netherlands': 'NL', 'North Macedonia': 'MK', 'Norway': 'NO', 'Poland': 'PL', 'Portugal': 'PT',
  'Romania': 'RO', 'San Marino': 'SM', 'Serbia': 'RS', 'Slovenia': 'SI', 'South Cyprus': 'CY',
  'Spain': 'ES', 'Sweden': 'SE', 'Switzerland': 'CH', 'Ukraine': 'UA', 'United Kingdom': 'GB'
};

// Performer/song data for 2022 (used to display below revealed countries)
const eurovision2022Songs: { [key: string]: { performer: string; song: string } } = {
  'Albania': { performer: 'Ronela Hajati', song: 'Sekret' },
  'Armenia': { performer: 'Rosa Linn', song: 'Snap' },
  'Australia': { performer: 'Sheldon Riley', song: 'Not the Same' },
  'Austria': { performer: 'LUM!X ft. Pia Maria', song: 'Halo' },
  'Azerbaijan': { performer: 'Nadir Rustamli', song: 'Fade to Black' },
  'Belgium': { performer: 'Jérémie Makiese', song: 'Miss You' },
  'Bulgaria': { performer: 'Intelligent Music Project', song: 'Intention' },
  'Croatia': { performer: 'Mia Dimšić', song: 'Guilty Pleasure' },
  'Czechia': { performer: 'We Are Domi', song: 'Lights Off' },
  'Denmark': { performer: 'Reddi', song: 'The Show' },
  'Estonia': { performer: 'Stefan', song: 'Hope' },
  'Finland': { performer: 'The Rasmus', song: 'Jezebel' },
  'France': { performer: 'Alvan & Ahez', song: 'Fulenn' },
  'Georgia': { performer: 'Circus Mircus', song: 'Lock Me In' },
  'Germany': { performer: 'Malik Harris', song: 'Rockstars' },
  'Greece': { performer: 'Amanda Georgiadi Tenfjord', song: 'Die Together' },
  'Iceland': { performer: 'Systur', song: 'Með Hækkandi Sól' },
  'Ireland': { performer: 'Brooke', song: "That's Rich" },
  'Israel': { performer: 'Michael Ben David', song: 'I.M' },
  'Italy': { performer: 'Mahmood & Blanco', song: 'Brividi' },
  'Latvia': { performer: 'Citi Zēni', song: 'Eat Your Salad' },
  'Lithuania': { performer: 'Monika Liu', song: 'Sentimentai' },
  'Malta': { performer: 'Emma Muscat', song: 'I Am What I Am' },
  'Moldova': { performer: 'Zdob și Zdub & Advahov Brothers', song: 'Trenulețul' },
  'Montenegro': { performer: 'Vladana', song: 'Breathe' },
  'Netherlands': { performer: 'S10', song: 'De Diepte' },
  'North Macedonia': { performer: 'Andrea', song: 'Circles' },
  'Norway': { performer: 'Subwoolfer', song: 'Give That Wolf a Banana' },
  'Poland': { performer: 'Ochman', song: 'River' },
  'Portugal': { performer: 'Maro', song: 'Saudade, Saudade' },
  'Romania': { performer: 'WRS', song: 'Llámame' },
  'San Marino': { performer: 'Achille Lauro', song: 'Stripper' },
  'Serbia': { performer: 'Konstrakta', song: 'In Corpore Sano' },
  'Slovenia': { performer: 'LPS', song: 'Disko' },
  'South Cyprus': { performer: 'Andromache', song: 'Ela' },
  'Spain': { performer: 'Chanel', song: 'SloMo' },
  'Sweden': { performer: 'Cornelia Jakobs', song: 'Hold Me Closer' },
  'Switzerland': { performer: 'Marius Bear', song: 'Boys Do Cry' },
  'Ukraine': { performer: 'Kalush Orchestra', song: 'Stefania' },
  'United Kingdom': { performer: 'Sam Ryder', song: 'Space Man' }
};

export default function Eurovision2022RevealPage() {
  // React hooks (always declared in the same order)
  const { data: session, status } = useSession();
  const [results, setResults] = useState<Results | null>(null);
  const [orderedCountries, setOrderedCountries] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
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
        </div>
      </aside>

      {/* Main content: revealed list */}
      <div className="flex-1 w-full">
        {orderedCountries.length === 0 && !error && <div>Yükleniyor...</div>}

        <ul className="grid grid-cols-1 gap-2">
          {/* Render only the revealed countries, newest revealed on top to push list down */}
          {orderedCountries.slice(0, visibleCount).reverse().map((country) => {
            const score = results?.countryPoints[country] ?? 0;
            const code = countryToCode[country] || 'XX';
            const songInfo = eurovision2022Songs[country];
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
