'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface EurovisionNavigationProps {
  currentYear?: number;
  currentPage?: 'harita' | '2020-final' | '2020-semi-final-b' | '2020-semi-final-a';
}

// Define the complete navigation chain (newest to oldest)
const NAVIGATION_CHAIN = [
  { id: 'harita', path: '/Harita', label: 'Harita', title: 'Oy Haritası' },
  { id: 2026, path: '/eurovision2026', label: '2026', title: 'Eurovision 2026' },
  { id: 2025, path: '/eurovision2025', label: '2025', title: 'Eurovision 2025' },
  { id: 2024, path: '/eurovision2024', label: '2024', title: 'Eurovision 2024' },
  { id: 2023, path: '/eurovision2023', label: '2023', title: 'Eurovision 2023' },
  { id: 2022, path: '/eurovision2022', label: '2022', title: 'Eurovision 2022' },
  { id: 2021, path: '/eurovision2021', label: '2021', title: 'Eurovision 2021' },
  { id: 2020, path: '/eurovision2020', label: '2020', title: 'Eurovision 2020' },
  { id: '2020-final', path: '/eurovision2020/final', label: '2020 Grand Final', title: 'Eurovision 2020 - Grand Final' },
  { id: '2020-semi-final-b', path: '/eurovision2020/semi-final-b', label: '2020 Yarı Final B', title: 'Eurovision 2020 - Yarı Final B' },
  { id: '2020-semi-final-a', path: '/eurovision2020/semi-final-a', label: '2020 Yarı Final A', title: 'Eurovision 2020 - Yarı Final A' },
];

export default function EurovisionNavigation({ currentYear, currentPage }: EurovisionNavigationProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  
  // Find current position in chain
  let currentId: string | number | undefined;
  if (currentPage) {
    currentId = currentPage;
  } else if (currentYear) {
    currentId = currentYear;
  }

  const currentIndex = NAVIGATION_CHAIN.findIndex(item => item.id === currentId);
  
  if (currentIndex === -1) {
    // Page not found in chain
    return null;
  }

  const currentItem = NAVIGATION_CHAIN[currentIndex];
  const newerItem = currentIndex > 0 ? NAVIGATION_CHAIN[currentIndex - 1] : null;
  const olderItem = currentIndex < NAVIGATION_CHAIN.length - 1 ? NAVIGATION_CHAIN[currentIndex + 1] : null;

  const navigateTo = (path: string, navDirection: 'left' | 'right') => {
    setDirection(navDirection);
    setIsNavigating(true);

    // Tag <html> so CSS view-transition rules know which direction to animate
    document.documentElement.setAttribute('data-nav-direction', navDirection);

    // Use View Transitions API if available
    if ('startViewTransition' in document) {
      const transition = (document as any).startViewTransition(async () => {
        router.push(path);
        // Wait for the new page to signal it's fully rendered (PageReadySignal mounts).
        // This prevents the view-transition from capturing a loading spinner.
        await new Promise<void>(resolve => {
          const onReady = () => resolve();
          document.addEventListener('page-ready', onReady, { once: true });
          // Safety timeout: don't freeze the UI forever if a page forgets the signal
          setTimeout(() => {
            document.removeEventListener('page-ready', onReady);
            resolve();
          }, 5000);
        });
      });
      // Clean up attribute after transition finishes
      transition.finished.finally(() => {
        document.documentElement.removeAttribute('data-nav-direction');
        setIsNavigating(false);
        setDirection(null);
      });
    } else {
      // Fallback: small delay for CSS transition, then navigate
      setTimeout(() => {
        router.push(path);
        document.documentElement.removeAttribute('data-nav-direction');
      }, 200);
    }
  };

  return (
    <div className={`flex items-center justify-between w-full max-w-4xl mx-auto mb-8 transition-all duration-300 ${
      isNavigating 
        ? direction === 'left' 
          ? 'opacity-0 -translate-x-10' 
          : 'opacity-0 translate-x-10'
        : 'opacity-100 translate-x-0'
    }`}>
      {/* Left Arrow - Newer Page */}
      <button
        onClick={() => newerItem && navigateTo(newerItem.path, 'left')}
        disabled={!newerItem}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          newerItem
            ? 'bg-[#2c3e50] text-white hover:bg-[#34495e] hover:scale-105'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
        }`}
        title={newerItem?.title || 'En yeni sayfa'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {newerItem && (
          <span className="hidden sm:inline text-sm font-medium">
            {isNavigating && direction === 'left' ? 'Yükleniyor...' : newerItem.label}
          </span>
        )}
      </button>

      {/* Center - Current Page Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-white text-center">
        {currentItem.title}
      </h1>

      {/* Right Arrow - Older Page */}
      <button
        onClick={() => olderItem && navigateTo(olderItem.path, 'right')}
        disabled={!olderItem}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          olderItem
            ? 'bg-[#2c3e50] text-white hover:bg-[#34495e] hover:scale-105'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
        }`}
        title={olderItem?.title || 'En eski sayfa'}
      >
        {olderItem && (
          <span className="hidden sm:inline text-sm font-medium">
            {isNavigating && direction === 'right' ? 'Yükleniyor...' : olderItem.label}
          </span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
