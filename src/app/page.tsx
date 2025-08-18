'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const headerSection = (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-4xl font-bold text-white">Eurovision Fan Votes</h1>
      <div className="flex items-center gap-4">
        {session ? (
          <>
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
          </>
        ) : (
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            Login with Google
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-4">
      <div className="container mx-auto px-4">
        {headerSection}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }, (_, i) => 2026 - i).map(year => (
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
                  {year >= 2025 ? (
                    <span>Coming Soon</span>
                  ) : year === 2024 ? (
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

        {!session && (
          <div className="text-center mt-12">
            <p className="text-gray-300 text-lg mb-4">
              Sign in to vote and see your personal results
            </p>
            <p className="text-gray-400 text-sm">
              You can browse public results without signing in
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
