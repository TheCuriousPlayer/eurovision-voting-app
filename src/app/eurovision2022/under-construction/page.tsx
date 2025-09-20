'use client';

import { usePathname } from 'next/navigation';

export default function UnderConstruction() {
  const pathname = usePathname();
  const year = pathname.match(/eurovision(20\d{2})/)?.[1] || '2022';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213e] p-8">
      <div className="bg-[#2c3e50] rounded-lg p-8 max-w-xl text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Eurovision {year} — Under Construction</h1>
        <p className="text-gray-300">This page is temporarily disabled while we make improvements. Please check back soon.</p>
      </div>
    </div>
  );
}
