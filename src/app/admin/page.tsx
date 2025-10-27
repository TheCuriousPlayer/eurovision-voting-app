'use client';

import { useSession } from 'next-auth/react';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
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
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Eriþim Engellendi</h1>
            <p className="text-gray-600 mb-6">
              Yönetici paneline eriþmek için giriþ yapmanýz gerekmektedir.
            </p>
            <button
              onClick={() => window.location.href = '/api/auth/signin'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Giriþ Yap
            </button>
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
            <h1 className="text-2xl font-bold text-gray-900">Eurovision Yönetici Paneli</h1>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">{session.user?.email}</span>
              <button
                onClick={() => window.location.href = '/api/auth/signout'}
                className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded transition-colors"
              >
                Çýkýþ Yap
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <AdminPanel />
        </div>
      </main>
    </div>
  );
}
