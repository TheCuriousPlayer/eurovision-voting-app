'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useDisplayPreferences } from '@/contexts/DisplayPreferencesContext';

export default function Navigation() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { preferences, toggleWeightPercentage, toggleVoterPercentage } = useDisplayPreferences();
  const settingsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    {
      href: '/eurovision2020/semi-final-a',
      label: 'Yarı Final A Gurubu',
    },
    {
      href: '/eurovision2020/semi-final-b',
      label: 'Yarı Final B Gurubu',
    },
    {
      href: '/eurovision2020/final',
      label: 'Final',
    },
  ];


  return (
    <nav className="bg-[#0f1123] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-white font-bold text-xl flex items-center gap-2"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="sr-only">Home</span>
            </Link>
            <a
              href="https://www.youtube.com/playlist?list=PLvYQzibNzDx01WQHqmrIL-CXvrPHuDl4I"
              className="ml-10 px-3 py-2 bg-[#e53935] hover:bg-[#d32f2f] text-white rounded-md text-sm font-medium transition-colors text-center"
              aria-label="Buğra Şişman - Youtube"
            >
              Buğra Şişman<br />
              YouTube
            </a>
          </div>


          <div className="flex items-center gap-2">
            {/* Eurovision Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-center bg-[#2c3e50] text-white hover:bg-[#34495e] flex items-center gap-2"
              >
                Eurovision 2020
                <svg 
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 rounded-md shadow-lg bg-[#1a1a2e] ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsDropdownOpen(false)}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          pathname === item.href
                            ? 'bg-[#2c3e50] text-white'
                            : 'text-gray-300 hover:bg-[#2c3e50] hover:text-white'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Settings Dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="px-2 py-2 rounded-md text-sm font-medium transition-colors bg-[#2c3e50] text-white hover:bg-[#34495e] flex items-center gap-2"
                title="Ayarlar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-[#1a1a2e] ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4 space-y-3">
                    <h3 className="text-white font-medium text-sm mb-3">Görünüm Tercihleri</h3>
                    
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={preferences.showWeightPercentage}
                        onChange={toggleWeightPercentage}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                      />
                      <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                        <strong>Σ</strong> göster (Potansiyel Max Puan)
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={preferences.showVoterPercentage}
                        onChange={toggleVoterPercentage}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                      />
                        <span className="text-gray-300 text-sm group-hover:text-white transition-colors"><span className="inline-flex items-center justify-center w-4 h-3 rounded-md bg-yellow-500 text-[10px]">👤</span> göster (Oy veren yüzdesi)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

