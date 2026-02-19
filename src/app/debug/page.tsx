'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DateDebugger from '@/components/DateDebugger';

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/auth/is-admin')
        .then(r => r.json())
        .then(data => setIsAdmin(data.isAdmin));
    }
  }, [status]);

  if (status === "loading" || (status === 'authenticated' && isAdmin === null)) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (status === "unauthenticated" || !session) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v1m-3.707 7.297a7 7 0 1 1 9.9-9.9 7 7 0 0 1-9.9 9.9z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Erişim Engellendi</h1>
            <p className="text-gray-600 mb-6">
              Debug sayfasına erişmek için giriş yapmanız gerekmektedir.
            </p>
            <button
              onClick={() => window.location.href = '/api/auth/signin'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Admin kontrolü - /api/auth/is-admin üzerinden kontrol edilir
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v1m-3.707 7.297a7 7 0 1 1 9.9-9.9 7 7 0 0 1-9.9 9.9z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Yetkisiz Erişim</h1>
            <p className="text-gray-600 mb-6">
              Bu sayfaya erişim yetkiniz bulunmamaktadır. Yalnızca sistem yöneticileri bu sayfayı görüntüleyebilir.
            </p>
            <div className="text-sm text-gray-500">
              Giriş yapılan hesap: {session.user?.email}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">Eurovision Debug Paneli</h1>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">{session.user?.email}</span>
              <button
                onClick={() => window.location.href = '/api/auth/signout'}
                className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4">Date Debugger</h2>
            <DateDebugger />
          </div>
          
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Middleware Redirect Test</h2>
            <p className="mb-4">
              This section helps verify if the middleware will correctly redirect Eurovision 2022 voting pages
              to the countdown page based on the current date and target date comparison.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold mb-4">Eurovision 2022 Configuration</h3>
              <div className="font-mono text-sm p-4 bg-gray-800 text-white rounded overflow-x-auto">
                <pre>{`const VotePages_variables = {
  '2022': { 
    Status: true, 
    ShowCountDown: '00:00 27.05.2026', 
    Mode: 'hide', 
    GMs: '' 
  },
  // ...other years
};`}</pre>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded bg-white">
                  <h4 className="font-bold">Current Date:</h4>
                  <div className="font-mono">{new Date().toISOString()}</div>
                </div>
                
                <div className="p-4 border rounded bg-white">
                  <h4 className="font-bold">Target Date:</h4>
                  <div className="font-mono">2026-05-26T21:00:00.000Z (May 27, 2026 00:00)</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 border rounded bg-green-100">
                <h4 className="font-bold text-green-800">Middleware Behavior:</h4>
                <p>Current date is BEFORE target date.</p>
                <p className="mt-2 font-semibold">
                  The middleware should redirect Eurovision 2022 voting pages to the countdown page.
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Test Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/eurovision2022/vote" className="text-blue-600 hover:underline">
                    Test Eurovision 2022 Vote Page
                  </a>
                  <span className="text-sm text-gray-500 ml-2">
                    (Should redirect to countdown page)
                  </span>
                </li>
                <li>
                  <a href="/debug/date-test" className="text-blue-600 hover:underline">
                    Date Test Utility
                  </a>
                  <span className="text-sm text-gray-500 ml-2">
                    (For testing date parsing and comparison)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
