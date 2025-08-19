﻿'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white">Eurovision Song Contest Türkiye</h1>
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
                  <p>Welcome, {session.user?.name}!</p>
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
            {Array.from({ length: 27 }, (_, i) => 2026 - i).map(year => (
              <div key={year} className="group">
                <Link 
                  href={`/eurovision${year}`}
                  className={`
                    block relative overflow-hidden rounded-xl p-6 
                    ${year === 2023 ? 'bg-gradient-to-r from-[#2ecc71] to-[#16a085]' : 'bg-[#2c3e50]'}
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
                  
                  <div className="text-gray-300 text-sm">
                    {year >= 2024 ? (
                      <span>Coming Soon</span>
                    ) : year === 2023 ? (
                      <span>Latest Contest</span>
                    ) : (
                      <span>View Results</span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Eurovision Song Contest Türkiye</h1>
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
          <p className="text-gray-300 text-lg">Sign in with Google to start voting and save your preferences</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 27 }, (_, i) => 2026 - i).map(year => (
            <div key={year} className="group">
              <Link 
                href={`/eurovision${year}`}
                className={`
                  block relative overflow-hidden rounded-xl p-6 
                  ${year === 2023 ? 'bg-gradient-to-r from-[#2ecc71] to-[#16a085]' : 'bg-[#2c3e50]'}
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
                
                <div className="text-gray-300 text-sm">
                  {year >= 2024 ? (
                    <span>Coming Soon</span>
                  ) : year === 2023 ? (
                    <span>Latest Contest</span>
                  ) : (
                    <span>View Results</span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
