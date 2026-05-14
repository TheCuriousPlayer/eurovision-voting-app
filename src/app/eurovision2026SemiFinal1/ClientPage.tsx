"use client";

import { useState, useEffect, useRef, CSSProperties, useLayoutEffect } from 'react';

type Song = { code: string; performer: string; song: string; youtubeId: string; result: string };

const eurovision2026SF1Songs: Record<string, Song> = {
  'Moldova': { code: 'MD', performer: 'Satoshi', song: 'Viva, Moldova!', youtubeId: 'SViojHjNSzc', result: 'Qualified' },
  'Sweden': { code: 'SE', performer: 'Felicia', song: 'My System', youtubeId: 'ibbfS8iG450', result: 'Qualified' },
  'Croatia': { code: 'HR', performer: 'Lelek', song: 'Andromeda', youtubeId: 'vl7Jqnw10sU', result: 'Qualified' },
  'Greece': { code: 'GR', performer: 'Akylas', song: 'Ferto', youtubeId: 'NGwNTd_DA9s', result: 'Qualified' },
  'Portugal': { code: 'PT', performer: 'Bandidos do Cante', song: 'Rosa', youtubeId: 'jyHaE6GqaaQ', result: 'Not Qualified' },
  'Georgia': { code: 'GE', performer: 'Bzikebi', song: 'On Replay', youtubeId: 'coh-lygCINY', result: 'Not Qualified' },
  'Finland': { code: 'FI', performer: 'Linda Lampenius & Pete Parkkonen', song: 'Liekinheitin', youtubeId: '9bfwNIYb96Q', result: 'Qualified' },
  'Montenegro': { code: 'ME', performer: 'Tamara Živković', song: 'Nova zora', youtubeId: 'nuvy2d60HbI', result: 'Qualified' },
  'Estonia': { code: 'EE', performer: 'Vanilla Ninja', song: 'Too Epic to Be True', youtubeId: 'lOiWuol3t3o', result: 'Not Qualified' },
  'Israel': { code: 'IL', performer: 'Noam Bettan', song: 'Michelle', youtubeId: 'xWCnWSoG8nI', result: 'Qualified' },
  'Belgium': { code: 'BE', performer: 'Essyla', song: 'Dancing on the Ice', youtubeId: '9sfI4g6DWTU', result: 'Qualified' },
  'Lithuania': { code: 'LT', performer: 'Lion Ceccah', song: 'Sólo quiero más', youtubeId: '0H-PXnbhG7A', result: 'Qualified' },
  'San Marino': { code: 'SM', performer: 'Senhit', song: 'Superstar', youtubeId: 'wOQe-fQSFxg', result: 'Not Qualified' },
  'Poland': { code: 'PL', performer: 'Alicja', song: 'Pray', youtubeId: 'q78cnYIoF9Y', result: 'Not Qualified' },
  'Serbia': { code: 'RS', performer: 'Lavina', song: 'Kraj mene', youtubeId: 'FJTLKBOOE98', result: 'Qualified' }
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
      const raw = localStorage.getItem('eurovision2026SF1.revealedCards');
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
      localStorage.setItem('eurovision2026SF1.revealedCards', JSON.stringify(revealedCards));
    } catch (e) {
      // ignore storage errors
    }
  }, [revealedCards]);

  const SetRevealedCardToggle = (country: string) => {
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
  const entries = Object.entries(eurovision2026SF1Songs);

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

  function ShrinkText({ children, style, minFontPx = 10, layoutDep }: { children: React.ReactNode; style?: CSSProperties; minFontPx?: number; layoutDep?: any }) {
    const ref = useRef<HTMLDivElement | null>(null);
    useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;

      // store initial computed font-size (px) so we can reset before measuring
      if (!el.dataset.initialFontSize) {
        const cs = window.getComputedStyle(el);
        el.dataset.initialFontSize = cs.fontSize || (style && (style as any).fontSize) || '14px';
      }

      const adjust = () => {
        if (!el) return;
        // reset to initial font-size before measuring
        el.style.fontSize = el.dataset.initialFontSize!;
        el.style.whiteSpace = 'nowrap';
        el.style.overflow = 'hidden';

        // measure and decrement font-size until it fits or hits min
        let computed = window.getComputedStyle(el).fontSize || el.dataset.initialFontSize || '14px';
        let font = parseFloat(computed);
        const min = minFontPx;
        let tries = 0;
        const maxTries = 60;
        // guard against zero-width (not yet laid out)
        if (el.clientWidth === 0) return;
        while (el.scrollWidth > el.clientWidth && font > min && tries < maxTries) {
          font = Math.max(font - 1, min);
          el.style.fontSize = font + 'px';
          tries++;
        }
      };

      let rafId: number | null = null;
      const scheduleAdjust = () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          try { adjust(); } catch (e) { /* ignore */ }
          rafId = null;
        });
      };

      // initial adjust after layout
      scheduleAdjust();

      // use ResizeObserver to catch parent/card width changes (works for vertical layout)
      const ro = new ResizeObserver(() => scheduleAdjust());
      ro.observe(el);
      if (el.parentElement) ro.observe(el.parentElement);

      window.addEventListener('resize', scheduleAdjust);

      return () => {
        try { ro.disconnect(); } catch (e) { /* ignore */ }
        window.removeEventListener('resize', scheduleAdjust);
        if (rafId !== null) cancelAnimationFrame(rafId);
      };
    }, [children, layoutDep, style]);

    return (
      <div ref={ref} style={{ display: 'block', width: '100%', minWidth: 0, boxSizing: 'border-box', ...style }}>
        {children}
      </div>
    );
  }

  return (
    <main style={{ padding: 1, maxWidth: 'none', margin: 0, paddingLeft: 0, fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>

      <style>{`
        .sf1-card { box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
        .sf1-card--active { box-shadow: inset 0 8px 24px var(--inner-glow-color), 0 1px 2px rgba(0,0,0,0.04), 0 0 18px var(--outer-glow-color); }
        .sf1-card--active.pulse { animation: sf1-inner-pulse 2000ms ease-in-out infinite; }

        @keyframes sf1-inner-pulse {
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
                const isQualified = /qualified/i.test(s.result) && !/not|non/i.test(s.result);
                const borderColor = isActive ? (isQualified ? '#16a34a' : '#dc2626') : '#e6e6e6';

                // Default (hidden) background — cards start grey for reveal page
                const defaultBg = '#374151';
                // When revealed (isActive) set green or red background depending on result
                const cardBg = isActive ? (isQualified ? '#063f2a' : '#4c0513') : defaultBg;
                // Glow color for box-shadow (used only when active)
                const glowColor = isQualified ? 'rgba(16,185,129,0.22)' : 'rgba(220,38,38,0.22)';
                // Inner glow color (inset) for revealed cards
                const innerGlowColor = isQualified ? 'rgba(16,225,129,0.22)' : 'rgba(220,38,38,0.22)';

                const innerFlexStyle: CSSProperties = layoutMode === 'horizontal'
                  ? { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }
                  : { display: 'flex', gap: 8, alignItems: 'center' };

                // Use the same visible width as vertical mode (210px) so thumbnails match
                const imgContainerStyle: CSSProperties = {
                  width: 210,
                  height: 115,
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: '#111',
                  flex: layoutMode === 'vertical' ? '0 0 210px' : '0 0 auto'
                };

                const imgStyle: CSSProperties = layoutMode === 'horizontal'
                  ? { width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: isActive ? 'none' : 'grayscale(100%)', transition: 'filter 160ms ease' }
                  : { width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: isActive ? 'none' : 'grayscale(100%)', transition: 'filter 160ms ease' };

                const textContainerStyle: CSSProperties = layoutMode === 'horizontal'
                  ? { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', paddingTop: 8, color: '#e5e7eb', minWidth: 0 }
                  : { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, padding: 8, color: '#e5e7eb', minWidth: 0 };

                return (
                  <article
                    key={country}
                    aria-label={`${country} (${s.code})`}
                    onClick={() => SetRevealedCardToggle(country)}
                    className={`sf1-card ${isActive ? 'sf1-card--active pulse' : ''}`}
                    style={{
                      width: cardWidth,
                      boxSizing: 'border-box',
                      border: `2px solid ${borderColor}`,
                      borderRadius: 8,
                      padding: 0,
                      background: cardBg,
                      cursor: 'pointer',
                      transition: 'border-color 160ms ease, background-color 180ms ease, box-shadow 180ms ease',
                      // CSS variables for dynamic colors
                      ['--inner-glow-color']: innerGlowColor,
                      ['--outer-glow-color']: glowColor
                    } as any}
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
                        <ShrinkText layoutDep={layoutMode} style={{ fontSize: '0.95rem', marginBottom: 6, fontWeight: 700, textAlign: 'center' }}>{s.performer}</ShrinkText>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ShrinkText layoutDep={layoutMode} style={{ fontSize: '0.95rem', textAlign: 'center' }}>{s.song}</ShrinkText>
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
          const isQualified = /qualified/i.test(s.result) && !/not|non/i.test(s.result);
          const borderColor = isActive ? (isQualified ? '#16a34a' : '#dc2626') : '#e6e6e6';

          // Default (hidden) background — cards start grey for reveal page
          const defaultBg = '#374151';
          // When revealed (isActive) set green or red background depending on result
          const cardBg = isActive ? (isQualified ? '#063f2a' : '#4c0513') : defaultBg;
          // Glow color for box-shadow (used only when active)
          const glowColor = isQualified ? 'rgba(16,185,129,0.22)' : 'rgba(220,38,38,0.22)';
          // Inner glow color (inset) for revealed cards
          const innerGlowColor = isQualified ? 'rgba(16,225,129,0.22)' : 'rgba(220,38,38,0.22)';

          const innerFlexStyle: CSSProperties = layoutMode === 'horizontal'
            ? { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }
            : { display: 'flex', gap: 8, alignItems: 'center' };

          // Use the same visible width as vertical mode (210px) so thumbnails match
          const imgContainerStyle: CSSProperties = {
            width: 210,
            height: 115,
            borderRadius: 6,
            overflow: 'hidden',
            background: '#111',
            flex: layoutMode === 'vertical' ? '0 0 210px' : '0 0 auto'
          };

          const imgStyle: CSSProperties = layoutMode === 'horizontal'
            ? { width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: isActive ? 'none' : 'grayscale(100%)', transition: 'filter 160ms ease' }
            : { width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: isActive ? 'none' : 'grayscale(100%)', transition: 'filter 160ms ease' };

          const textContainerStyle: CSSProperties = layoutMode === 'horizontal'
            ? { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', paddingTop: 8, color: '#e5e7eb', minWidth: 0 }
            : { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, padding: 8, color: '#e5e7eb', minWidth: 0 };

          return (
            <article
              key={country}
              aria-label={`${country} (${s.code})`}
              onClick={() => SetRevealedCardToggle(country)}
              className={`sf1-card ${isActive ? 'sf1-card--active pulse' : ''}`}
              style={{
                width: cardWidth,
                boxSizing: 'border-box',
                border: `2px solid ${borderColor}`,
                borderRadius: 8,
                padding: 0,
                background: cardBg,
                cursor: 'pointer',
                transition: 'border-color 160ms ease, background-color 180ms ease, box-shadow 180ms ease',
                // CSS variables for dynamic colors
                ['--inner-glow-color']: innerGlowColor,
                ['--outer-glow-color']: glowColor
              } as any}
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
                  <ShrinkText layoutDep={layoutMode} style={{ fontSize: '0.95rem', marginBottom: 6, fontWeight: 700, textAlign: 'center' }}>{s.performer}</ShrinkText>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShrinkText layoutDep={layoutMode} style={{ fontSize: '0.95rem', textAlign: 'center' }}>{s.song}</ShrinkText>
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
