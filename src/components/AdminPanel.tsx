'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { createFutureDate, createPastDate } from '@/utils/dateUtils';

interface YearConfig {
  Status: boolean;
  ShowCountDown: string;
  Mode: string; // 'visible' | 'hide' | 'gm-only'
  GMs: string;
}

interface ConfigState {
  [key: string]: YearConfig;
}

export default function AdminPanel() {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ConfigState>({
    '2022': { Status: false, ShowCountDown: '', Mode: 'visible', GMs: '' },
    '2023': { Status: false, ShowCountDown: '', Mode: 'visible', GMs: '' },
    '2024': { Status: false, ShowCountDown: '', Mode: 'visible', GMs: '' },
    '2025': { Status: false, ShowCountDown: '', Mode: 'visible', GMs: '' },
    '2026': { Status: false, ShowCountDown: '', Mode: 'hide', GMs: '' }
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedYear, setSelectedYear] = useState('2022');
  
  // Admin kontrolü
  useEffect(() => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }
    fetch('/api/auth/is-admin')
      .then(r => r.json())
      .then(data => setIsAdmin(data.isAdmin))
      .finally(() => setLoading(false));
  }, [session]);
  
  // Yapılandırmaları yükle
  const loadConfig = async () => {
    try {
      setLoading(true);
      
      // Yönetici API'sinden tüm yapılandırmayı al
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setMessage({ text: 'Yapılandırma yüklendi', type: 'success' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Yapılandırma yüklenemedi');
      }
    } catch (error) {
      console.error('Yapılandırma yüklenirken hata:', error);
      setMessage({ text: `Yapılandırma yüklenemedi: ${error}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  // Yapılandırmaları güncelle
  const saveConfig = async () => {
    try {
      setLoading(true);
      
      // Yönetici API'sine güncelleme isteği gönder
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        const result = await response.json();
        setConfig(result.config);
        setMessage({ text: 'Yapılandırma başarıyla kaydedildi', type: 'success' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Yapılandırma kaydedilemedi');
      }
    } catch (error) {
      console.error('Yapılandırma kaydedilirken hata:', error);
      setMessage({ text: `Yapılandırma kaydedilemedi: ${error}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  // Tarih yardımcıları
  const setDateToNow = () => {
    const updatedConfig = { ...config };
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    
    updatedConfig[selectedYear].ShowCountDown = `${hours}:${minutes} ${day}.${month}.${year}`;
    setConfig(updatedConfig);
  };
  
  const setDateToFuture = (days: number) => {
    const updatedConfig = { ...config };
    updatedConfig[selectedYear].ShowCountDown = createFutureDate(days);
    setConfig(updatedConfig);
  };
  
  const setDateToPast = (days: number) => {
    const updatedConfig = { ...config };
    updatedConfig[selectedYear].ShowCountDown = createPastDate(days);
    setConfig(updatedConfig);
  };
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };
  
  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedConfig = { ...config };
    updatedConfig[selectedYear].Mode = e.target.value;
    setConfig(updatedConfig);
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedConfig = { ...config };
    updatedConfig[selectedYear].Status = e.target.checked;
    setConfig(updatedConfig);
  };
  
  const handleCountdownChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedConfig = { ...config };
    updatedConfig[selectedYear].ShowCountDown = e.target.value;
    setConfig(updatedConfig);
  };
  
  const handleGMsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedConfig = { ...config };
    updatedConfig[selectedYear].GMs = e.target.value;
    setConfig(updatedConfig);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <p>Bu sayfaya erişim izniniz yok. Yalnızca yöneticiler yapılandırma sayfasını görebilir.</p>
      </div>
    );
  }
  
  const yearConfig = config[selectedYear];
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Eurovision Yapılandırma Paneli</h1>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      <div className="mb-6">
        <label className="block mb-2 font-medium">Eurovision Yılı:</label>
        <select 
          value={selectedYear}
          onChange={handleYearChange}
          className="w-full px-4 py-2 border rounded-md"
        >
          <option value="2022">Eurovision 2022</option>
          <option value="2023">Eurovision 2023</option>
          <option value="2024">Eurovision 2024</option>
          <option value="2025">Eurovision 2025</option>
          <option value="2026">Eurovision 2026</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Temel Ayarlar</h2>
          
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={yearConfig.Status}
                onChange={handleStatusChange}
                className="w-5 h-5 text-blue-600"
              />
              <span>Geri Sayım Aktif</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              İşaretlendiğinde, oylama sayfasına erişim için geri sayım kullanılır
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Görüntüleme Modu:</label>
            <select 
              value={yearConfig.Mode}
              onChange={handleModeChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="visible">Herkes Görebilir</option>
              <option value="hide">Sonuçlar Gizli (Butona Tıklayarak)</option>
              <option value="gm-only">Sadece GM Görebilir</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Sonuçların nasıl görüntüleneceğini belirler
            </p>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Geri Sayım Ayarları</h2>
          
          <div className="mb-4">
            <label className="block mb-1">Hedef Tarih-Saat:</label>
            <input 
              type="text" 
              placeholder="00:00 27.09.2025"
              value={yearConfig.ShowCountDown}
              onChange={handleCountdownChange}
              className="w-full px-3 py-2 border rounded-md"
            />
            <p className="text-sm text-gray-500 mt-1">
              Format: SS:DD GG.AA.YYYY (örn: 00:00 27.09.2025)
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2 mb-4">
            <button 
              onClick={() => setDateToNow()} 
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              Şimdi
            </button>
            <button 
              onClick={() => setDateToFuture(1)} 
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              1 gün sonra
            </button>
            <button 
              onClick={() => setDateToFuture(7)} 
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              1 hafta sonra
            </button>
            <button 
              onClick={() => setDateToPast(1)} 
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              1 gün önce
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">GM E-posta Adresleri:</label>
            <input 
              type="text" 
              placeholder="ornek@gmail.com,ornek2@gmail.com"
              value={yearConfig.GMs}
              onChange={handleGMsChange}
              className="w-full px-3 py-2 border rounded-md"
            />
            <p className="text-sm text-gray-500 mt-1">
              Virgülle ayırarak birden çok ekleyebilirsiniz
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <button 
          onClick={loadConfig}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Yenile
        </button>
        <button 
          onClick={saveConfig}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Kaydet
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg overflow-x-auto">
        <h3 className="text-md font-semibold mb-2">Güncel Yapılandırma:</h3>
        <pre className="text-xs">{JSON.stringify(config, null, 2)}</pre>
      </div>
    </div>
  );
}
