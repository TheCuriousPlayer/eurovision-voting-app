"use client";

import { useState, useEffect, useRef, CSSProperties, useLayoutEffect } from 'react';

type Song = { code: string; performer: string; song: string; youtubeId: string };

const eurovision2026PreviewSongs: { [key: string]: Song } = {
  'Albania': { code: 'AL', performer: 'Alis', song: 'Nân', youtubeId: 'b9AdRrA554o' },
// 'Andorra': { code: 'AD', performer: '', song: '', youtubeId: '' },
  'Armenia': { code: 'AM', performer: 'Simón', song: 'Paloma Rumba', youtubeId: '5EXoK-lgocw' },
  'Australia': { code: 'AU', performer: 'Delta Goodrem', song: 'Eclipse', youtubeId: 'EUMCr1pnaMY' },
  'Austria': { code: 'AT', performer: 'Cosmó', song: 'Tanzschein', youtubeId: 'zPGP9ZphxiY' },
  'Azerbaijan': { code: 'AZ', performer: 'Jiva', song: 'Just Go', youtubeId: 'iMDBPe25JhM' },
// 'Belarus': { code: 'BY', performer: '', song: '', youtubeId: '' },
  'Belgium': { code: 'BE', performer: 'Essyla', song: 'Dancing on the Ice', youtubeId: '9sfI4g6DWTU' },
// 'Bosnia & Herzegovina': { code: 'BA', performer: '', song: '', youtubeId: '' },
  'Bulgaria': { code: 'BG', performer: 'Dara', song: 'Bangaranga', youtubeId: '_pkC9J6BPFY' },
  'Croatia': { code: 'HR', performer: 'Lelek', song: 'Andromeda', youtubeId: 'vl7Jqnw10sU' },
  'Czechia': { code: 'CZ', performer: 'Daniel Zizka', song: 'Crossroads', youtubeId: '6ea25aRGpLo' },
  'Denmark': { code: 'DK', performer: 'Søren Torpegaard Lund', song: 'Før vi går hjem', youtubeId: 'xKzEP9dwoss' },
  'Estonia': { code: 'EE', performer: 'Vanilla Ninja', song: 'Too Epic to Be True', youtubeId: 'lOiWuol3t3o' },
  'Finland': { code: 'FI', performer: 'Linda Lampenius & Pete Parkkonen', song: 'Liekinheitin', youtubeId: '9bfwNIYb96Q' },
  'France': { code: 'FR', performer: 'Monroe', song: 'Regarde !', youtubeId: 'ujoCYrvvTYQ' },
  'Georgia': { code: 'GE', performer: 'Bzikebi', song: 'On Replay', youtubeId: 'coh-lygCINY' },
  'Germany': { code: 'DE', performer: 'Sarah Engels', song: 'Fire', youtubeId: 'AzvRc3eH_rA' },
  'Greece': { code: 'GR', performer: 'Akylas', song: 'Ferto', youtubeId: 'NGwNTd_DA9s' },
// 'Hungary': { code: 'HU', performer: '', song: '', youtubeId: '' },
// 'Iceland': { code: 'IS', performer: '', song: '', youtubeId: '' },
// 'Ireland': { code: 'IE', performer: '', song: '', youtubeId: '' },
  'Israel': { code: 'IL', performer: 'Noam Bettan', song: 'Michelle', youtubeId: 'xWCnWSoG8nI' },
  'Italy': { code: 'IT', performer: 'Sal Da Vinci', song: 'Per sempre sì', youtubeId: 'V406FAGkhyQ' },
  'Latvia': { code: 'LV', performer: 'Atvara', song: 'Ēnā', youtubeId: '6C2ivaB5D00' },
  'Lithuania': { code: 'LT', performer: 'Lion Ceccah', song: 'Sólo quiero más', youtubeId: '0H-PXnbhG7A' },
  'Luxembourg': { code: 'LU', performer: 'Eva Marija', song: 'Mother Nature', youtubeId: 'DmVfJSRqgnI' },
  'Malta': { code: 'MT', performer: 'Aidan', song: 'Bella', youtubeId: 'CW6mQLBh6Js' },
  'Moldova': { code: 'MD', performer: 'Satoshi', song: 'Viva, Moldova!', youtubeId: 'SViojHjNSzc' },
// 'Monaco': { code: 'MC', performer: '', song: '', youtubeId: '' },
  'Montenegro': { code: 'ME', performer: 'Tamara Živković', song: 'Nova zora', youtubeId: 'nuvy2d60HbI' },
// 'Netherlands': { code: 'NL', performer: '', song: '', youtubeId: '' },
// 'North Macedonia': { code: 'MK', performer: '', song: '', youtubeId: '' },
  'Norway': { code: 'NO', performer: 'Jonas Lovv', song: 'Ya Ya Ya', youtubeId: 'MasllzWk_bQ' },
  'Poland': { code: 'PL', performer: 'Alicja', song: 'Pray', youtubeId: 'q78cnYIoF9Y' },
  'Portugal': { code: 'PT', performer: 'Bandidos do Cante', song: 'Rosa', youtubeId: 'jyHaE6GqaaQ' },
  'Romania': { code: 'RO', performer: 'Alexandra Căpitănescu', song: 'Choke Me', youtubeId: 'JrSl0sTX5W4' },
// 'Russia': { code: 'RU', performer: '', song: '', youtubeId: '' },
  'San Marino': { code: 'SM', performer: 'Senhit', song: 'Superstar', youtubeId: 'wOQe-fQSFxg' },
  'Serbia': { code: 'RS', performer: 'Lavina', song: 'Kraj mene', youtubeId: 'FJTLKBOOE98' },
// 'Serbia Montenegro': { code: 'RM', performer: '', song: '', youtubeId: '' },
// 'Slovakia': { code: 'SK', performer: '', song: '', youtubeId: '' },
// 'Slovenia': { code: 'SI', performer: '', song: '', youtubeId: '' },
  'Southern Cyprus': { code: 'CY', performer: 'Antigoni', song: 'Jalla', youtubeId: 'TzSs51BiQrE' },
// 'Spain': { code: 'ES', performer: '', song: '', youtubeId: '' },
  'Sweden': { code: 'SE', performer: 'Felicia', song: 'My System', youtubeId: 'ibbfS8iG450' },
  'Switzerland': { code: 'CH', performer: 'Veronica Fusaro', song: 'Alice', youtubeId: 'PfpYGAzW5dM' },
// 'Türkiye': { code: 'TR', performer: '', song: '', youtubeId: '' },
  'Ukraine': { code: 'UA', performer: 'Leléka', song: 'Ridnym', youtubeId: 'SoEXezpblAc' },
  'United Kingdom': { code: 'GB', performer: 'Look Mum No Computer', song: 'Eins, zwei, drei', youtubeId: 'niMKvJ-Itq8' },
// 'Yugoslavia': { code: 'YU', performer: '', song: '', youtubeId: '' }
};

export default function ClientPage() {
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});
  const _mounted = useRef(false);

  // Load persisted revealedCards from localStorage on client mount
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem('eurovision2026GrandFinal.revealedCards');
      if (raw) {
        setRevealedCards(JSON.parse(raw));
      }
    } catch (e) {
      // ignore parse/storage errors
    } finally {
      _mounted.current = true;
    }
  }, []);

  // Persist revealedCards after mount when they change
  useEffect(() => {
    try {
      if (!_mounted.current) return;
      localStorage.setItem('eurovision2026GrandFinal.revealedCards', JSON.stringify(revealedCards));
    } catch (e) {
      // ignore storage errors
    }
  }, [revealedCards]);

  const setRevealedCardToggle = (country: string) => {
    setRevealedCards((prev) => ({ ...prev, [country]: !prev[country] }));
  };

  const [layoutMode, setLayoutMode] = useState<'vertical' | 'horizontal'>('horizontal');
  const [islandRect, setIslandRect] = useState({ x: 50, y: 50, w: 1120, h: 630 });
  const dragStateRef = useRef<{
    mode: 'move' | 'resize';
    startX: number;
    startY: number;
    startRect: { x: number; y: number; w: number; h: number };
  } | null>(null);

  const containerStyle: CSSProperties = layoutMode === 'vertical'
    ? { display: 'flex', flexDirection: 'column', gap: 5 }
    : { display: 'flex', flexDirection: 'row', gap: 5, flexWrap: 'wrap', alignItems: 'flex-start' };
  const cardWidth = layoutMode === 'vertical' ? 490 : 214;
  const cardImageFlex = layoutMode === 'vertical' ? '0 0 210px' : '0 0 auto';
  const entries = Object.entries(eurovision2026PreviewSongs);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState) return;

      const dx = event.clientX - dragState.startX;
      const dy = event.clientY - dragState.startY;

      if (dragState.mode === 'move') {
        setIslandRect({
          x: Math.max(0, dragState.startRect.x + dx),
          y: Math.max(0, dragState.startRect.y + dy),
          w: dragState.startRect.w,
          h: dragState.startRect.h
        });
        return;
      }

      setIslandRect({
        x: dragState.startRect.x,
        y: dragState.startRect.y,
        w: Math.max(300, dragState.startRect.w + dx),
        h: Math.max(200, dragState.startRect.h + dy)
      });
    };

    const onMouseUp = () => {
      if (!dragStateRef.current) return;
      dragStateRef.current = null;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const startIslandMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragStateRef.current = {
      mode: 'move',
      startX: event.clientX,
      startY: event.clientY,
      startRect: islandRect
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'move';
  };

  const startIslandResize = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    dragStateRef.current = {
      mode: 'resize',
      startX: event.clientX,
      startY: event.clientY,
      startRect: islandRect
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'nwse-resize';
  };

  function ShrinkText({ children, style, minFontPx = 10, layoutDep }: { children: React.ReactNode; style?: CSSProperties; minFontPx?: number; layoutDep?: unknown }) {
    const ref = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;

      // Store initial computed font-size (px) so we can reset before measuring
      if (!el.dataset.initialFontSize) {
        const cs = window.getComputedStyle(el);
        el.dataset.initialFontSize = cs.fontSize || (style && (style as CSSProperties).fontSize?.toString()) || '14px';
      }

      const adjust = () => {
        if (!el) return;
        el.style.fontSize = el.dataset.initialFontSize || '14px';
        el.style.whiteSpace = 'nowrap';
        el.style.overflow = 'hidden';

        let computed = window.getComputedStyle(el).fontSize || el.dataset.initialFontSize || '14px';
        let font = parseFloat(computed);
        const min = minFontPx;
        let tries = 0;
        const maxTries = 60;

        if (el.clientWidth === 0) return;

        while (el.scrollWidth > el.clientWidth && font > min && tries < maxTries) {
          font = Math.max(font - 1, min);
          el.style.fontSize = `${font}px`;
          tries += 1;
        }
      };

      let rafId: number | null = null;
      const scheduleAdjust = () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          try {
            adjust();
          } catch {
            // Ignore measurement errors.
          }
          rafId = null;
        });
      };

      scheduleAdjust();

      const ro = new ResizeObserver(() => scheduleAdjust());
      ro.observe(el);
      if (el.parentElement) ro.observe(el.parentElement);

      window.addEventListener('resize', scheduleAdjust);

      return () => {
        try {
          ro.disconnect();
        } catch {
          // Ignore cleanup errors.
        }
        window.removeEventListener('resize', scheduleAdjust);
        if (rafId !== null) cancelAnimationFrame(rafId);
      };
    }, [children, layoutDep, style, minFontPx]);

    return (
      <div ref={ref} style={{ display: 'block', width: '100%', minWidth: 0, boxSizing: 'border-box', ...style }}>
        {children}
      </div>
    );
  }

  return (
    <main style={{ padding: 1, maxWidth: 'none', margin: 0, paddingLeft: 0, fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>
      <style>{`
        .gf-card { box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
        .gf-card--active { box-shadow: inset 0 8px 24px var(--inner-glow-color), 0 1px 2px rgba(0,0,0,0.04), 0 0 18px var(--outer-glow-color); }
        .gf-card--active.pulse { animation: gf-inner-pulse 2000ms ease-in-out infinite; }

        @keyframes gf-inner-pulse {
          0% { box-shadow: inset 0 6px 18px var(--inner-glow-color), 0 1px 2px rgba(0,0,0,0.04), 0 0 12px var(--outer-glow-color); }
          50% { box-shadow: inset 0 12px 30px var(--inner-glow-color), 0 1px 2px rgba(0,0,0,0.04), 0 0 26px var(--outer-glow-color); }
          100% { box-shadow: inset 0 6px 18px var(--inner-glow-color), 0 1px 2px rgba(0,0,0,0.04), 0 0 12px var(--outer-glow-color); }
        }
      `}</style>

      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 1 }}>
          <div style={{ color: '#e5e7eb', marginRight: 8 }}></div>
          <div role="tablist" aria-label="Layout toggle" style={{ display: 'inline-flex', gap: 8 }}>
            <button
              onClick={() => setLayoutMode('vertical')}
              aria-pressed={layoutMode === 'vertical'}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: layoutMode === 'vertical' ? '2px solid #60a5fa' : '2px solid transparent',
                background: layoutMode === 'vertical' ? '#0ea5a5' : 'transparent',
                color: layoutMode === 'vertical' ? '#fff' : '#e5e7eb',
                cursor: 'pointer'
              }}
            >
              Vertical
            </button>
            <button
              onClick={() => setLayoutMode('horizontal')}
              aria-pressed={layoutMode === 'horizontal'}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: layoutMode === 'horizontal' ? '2px solid #60a5fa' : '2px solid transparent',
                background: layoutMode === 'horizontal' ? '#0ea5a5' : 'transparent',
                color: layoutMode === 'horizontal' ? '#fff' : '#e5e7eb',
                cursor: 'pointer'
              }}
            >
              Horizontal
            </button>
          </div>
        </div>

        {layoutMode === 'horizontal' ? (
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: Math.max(720, islandRect.y + islandRect.h + 24),
              border: '1px dashed #374151',
              borderRadius: 8
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: islandRect.x,
                top: islandRect.y,
                width: islandRect.w,
                height: islandRect.h,
                padding: 6,
                overflow: 'auto',
                border: '1px solid #4b5563',
                borderRadius: 8,
                background: 'rgba(17,24,39,0.65)',
                backdropFilter: 'blur(2px)'
              }}
            >
              <div
                onMouseDown={startIslandMove}
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  margin: '-6px -6px 8px',
                  padding: '6px 10px',
                  fontSize: 12,
                  color: '#cbd5e1',
                  cursor: 'move',
                  background: 'rgba(15,23,42,0.85)',
                  borderBottom: '1px solid #475569'
                }}
              >
                Island x:{Math.round(islandRect.x)} y:{Math.round(islandRect.y)} w:{Math.round(islandRect.w)} h:{Math.round(islandRect.h)}
              </div>

              <div style={containerStyle}>
                {entries.map(([country, s]) => {
                  const isActive = !!revealedCards[country];
                  const borderColor = isActive ? '#2563eb' : '#e6e6e6';
                  const defaultBg = '#374151';
                  const cardBg = isActive ? '#0b2f54' : defaultBg;
                  const glowColor = 'rgba(37,99,235,0.22)';
                  const innerGlowColor = 'rgba(59,130,246,0.22)';

                  const innerFlexStyle: CSSProperties = layoutMode === 'horizontal'
                    ? { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }
                    : { display: 'flex', gap: 8, alignItems: 'center' };

                  const imgContainerStyle: CSSProperties = {
                    width: 210,
                    height: 115,
                    borderRadius: 6,
                    overflow: 'hidden',
                    background: '#111',
                    flex: cardImageFlex
                  };

                  const imgStyle: CSSProperties = {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    filter: isActive ? 'none' : 'grayscale(100%)',
                    transition: 'filter 160ms ease'
                  };

                  const textContainerStyle: CSSProperties = layoutMode === 'horizontal'
                    ? { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', paddingTop: 8, color: '#e5e7eb', minWidth: 0 }
                    : { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, padding: 8, color: '#e5e7eb', minWidth: 0 };

                  return (
                    <article
                      key={country}
                      aria-label={`${country} (${s.code})`}
                      onClick={() => setRevealedCardToggle(country)}
                      className={`gf-card ${isActive ? 'gf-card--active pulse' : ''}`}
                      style={{
                        width: cardWidth,
                        boxSizing: 'border-box',
                        border: `2px solid ${borderColor}`,
                        borderRadius: 8,
                        padding: 0,
                        background: cardBg,
                        cursor: 'pointer',
                        transition: 'border-color 160ms ease, background-color 180ms ease, box-shadow 180ms ease',
                        ['--inner-glow-color']: innerGlowColor,
                        ['--outer-glow-color']: glowColor
                      } as CSSProperties}
                    >
                      <div style={innerFlexStyle}>
                        <div style={imgContainerStyle}>
                          <img
                            src={`https://img.youtube.com/vi/${s.youtubeId}/hqdefault.jpg`}
                            alt={`${country} thumbnail`}
                            style={imgStyle}
                          />
                        </div>

                        <div style={textContainerStyle}>
                          <ShrinkText layoutDep={layoutMode} style={{ fontSize: '0.95rem', marginBottom: 6, fontWeight: 700, textAlign: 'center' }}>
                            {s.performer}
                          </ShrinkText>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ShrinkText layoutDep={layoutMode} style={{ fontSize: '0.95rem', textAlign: 'center' }}>
                              {s.song}
                            </ShrinkText>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div
                onMouseDown={startIslandResize}
                aria-label="Resize island"
                style={{
                  position: 'absolute',
                  right: 4,
                  bottom: 4,
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  cursor: 'nwse-resize',
                  background: 'linear-gradient(135deg, transparent 0%, transparent 40%, #94a3b8 40%, #94a3b8 60%, transparent 60%)'
                }}
              />
            </div>
          </div>
        ) : (
          <div style={containerStyle}>
            {entries.map(([country, s]) => {
              const isActive = !!revealedCards[country];
              const borderColor = isActive ? '#2563eb' : '#e6e6e6';
              const defaultBg = '#374151';
              const cardBg = isActive ? '#0b2f54' : defaultBg;
              const glowColor = 'rgba(37,99,235,0.22)';
              const innerGlowColor = 'rgba(59,130,246,0.22)';

              const innerFlexStyle: CSSProperties = { display: 'flex', gap: 8, alignItems: 'center' };

              const imgContainerStyle: CSSProperties = {
                width: 210,
                height: 115,
                borderRadius: 6,
                overflow: 'hidden',
                background: '#111',
                flex: cardImageFlex
              };

              const imgStyle: CSSProperties = {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                filter: isActive ? 'none' : 'grayscale(100%)',
                transition: 'filter 160ms ease'
              };

              const textContainerStyle: CSSProperties = { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, padding: 8, color: '#e5e7eb', minWidth: 0 };

              return (
                <article
                  key={country}
                  aria-label={`${country} (${s.code})`}
                  onClick={() => setRevealedCardToggle(country)}
                  className={`gf-card ${isActive ? 'gf-card--active pulse' : ''}`}
                  style={{
                    width: cardWidth,
                    boxSizing: 'border-box',
                    border: `2px solid ${borderColor}`,
                    borderRadius: 8,
                    padding: 0,
                    background: cardBg,
                    cursor: 'pointer',
                    transition: 'border-color 160ms ease, background-color 180ms ease, box-shadow 180ms ease',
                    ['--inner-glow-color']: innerGlowColor,
                    ['--outer-glow-color']: glowColor
                  } as CSSProperties}
                >
                  <div style={innerFlexStyle}>
                    <div style={imgContainerStyle}>
                      <img
                        src={`https://img.youtube.com/vi/${s.youtubeId}/hqdefault.jpg`}
                        alt={`${country} thumbnail`}
                        style={imgStyle}
                      />
                    </div>

                    <div style={textContainerStyle}>
                      <ShrinkText layoutDep={layoutMode} style={{ fontSize: '0.95rem', marginBottom: 6, fontWeight: 700, textAlign: 'center' }}>
                        {s.performer}
                      </ShrinkText>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShrinkText layoutDep={layoutMode} style={{ fontSize: '0.95rem', textAlign: 'center' }}>
                          {s.song}
                        </ShrinkText>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {showYouTubeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowYouTubeModal(false)}>
          <div style={{ width: '90%', maxWidth: 900, position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowYouTubeModal(false)}
              aria-label="Close video"
              style={{ position: 'absolute', right: -12, top: -12, background: '#fff', borderRadius: 999, border: 'none', width: 36, height: 36, cursor: 'pointer', fontSize: 16 }}
            >
              ✕
            </button>

            <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative' }}>
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
                title={selectedCountryName || 'YouTube video'}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '0', borderRadius: 8 }}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
