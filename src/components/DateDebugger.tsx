'use client';

import { useState } from 'react';
import { formatEurovisionDate } from '@/utils/dateUtils';
import { VOTE_DATES } from '@/config/eurovisionvariables';

export default function DateDebugger() {
  // Merkezi yapılandırmadan 2022 yılı için tarihi al
  const [dateStr, setDateStr] = useState(VOTE_DATES['2022'] || '00:00 01.01.2026');
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);

  // Set date to X days from now
  const setDateOffset = (days: number) => {
    const now = new Date();
    now.setDate(now.getDate() + days);
    const formattedDate = formatEurovisionDate(now);
    setDateStr(formattedDate);
  };

  // Test the middleware date comparison
  const testDateComparison = async () => {
    try {
      // Parse the date string
      const [timeStr, dateStr] = dateStr.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      const [day, month, yearNum] = dateStr.split('.').map(Number);
      
      // Create target date (month is 0-indexed)
      const targetDate = new Date(yearNum, month - 1, day, hours, minutes);
      const now = new Date();
      
      // Compare dates
      const isBeforeTarget = now.getTime() < targetDate.getTime();
      
      setDebugInfo({
        nowDate: now.toISOString(),
        nowTimestamp: now.getTime(),
        targetDate: targetDate.toISOString(),
        targetTimestamp: targetDate.getTime(),
        isBeforeTarget,
        difference: targetDate.getTime() - now.getTime(),
        differenceDays: (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      });
      
      setCurrentStatus(isBeforeTarget ? 
        'Countdown sayfası gösterilmeli' : 
        'Oylama sayfası gösterilmeli');
    } catch (error) {
      console.error('Date test error:', error);
      setDebugInfo({ error: error.message });
      setCurrentStatus('Hata!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Eurovision Tarih Hata Ayıklama</h1>

      <div className="mb-6">
        <label className="block mb-2">Hedef Tarih (HH:MM GG.AA.YYYY):</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          />
          <button 
            onClick={testDateComparison}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Et
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button 
          onClick={() => setDateOffset(1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Yarın
        </button>
        <button 
          onClick={() => setDateOffset(7)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          1 Hafta Sonra
        </button>
        <button 
          onClick={() => setDateOffset(30)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          1 Ay Sonra
        </button>
        <button 
          onClick={() => setDateOffset(-1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Dün
        </button>
      </div>

      {currentStatus && (
        <div className={`p-4 mb-6 rounded ${
          currentStatus.includes('Hata') 
            ? 'bg-red-100 text-red-800' 
            : currentStatus.includes('Countdown') 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
        }`}>
          <h2 className="text-lg font-semibold">Durum:</h2>
          <p>{currentStatus}</p>
        </div>
      )}

      {debugInfo && (
        <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
          <h2 className="text-lg font-semibold mb-2">Hata Ayıklama Bilgisi:</h2>
          <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}

      <div className="mt-6 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">Middleware için Kopyala:</h2>
        <div className="bg-gray-100 p-3 rounded-lg">
          <code className="text-sm">
            {`'2022': { Status: true, ShowCountDown: '${dateStr}', Mode: 'hide', GMs: 'ozgunciziltepe@gmail.com' },`}
          </code>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(
                `'2022': { Status: true, ShowCountDown: '${dateStr}', Mode: 'hide', GMs: 'ozgunciziltepe@gmail.com' },`
              );
              alert('Kopyalandı!');
            }}
            className="ml-2 px-2 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300"
          >
            Kopyala
          </button>
        </div>
      </div>
    </div>
  );
}
