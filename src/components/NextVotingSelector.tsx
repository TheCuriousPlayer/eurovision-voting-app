'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface NextVotingSelectorProps {
  currentYear?: string;
  onYearSelect?: (year: string) => void;
}

// Available years for survey (excluding active competitions)
const AVAILABLE_YEARS = [
  // '2026', '2025', '2024', '2023', '2022', '2021', '2020', // Commented out - active competitions
  '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010',
  '2009', '2008', '2007', '2006', '2005', '2004', '2003', '2002', '2001', '2000',
  '1999', '1998', '1997', '1996', '1995', '1994', '1993', '1992', '1991', '1990',
  '1989', '1988', '1987', '1986', '1985', '1984', '1983', '1982', '1981', '1980',
  '1979', '1978', '1977', '1976', '1975', '1974', '1973', '1972', '1971', '1970',
  '1969', '1968', '1967', '1966', '1965', '1964', '1963', '1962', '1961', '1960',
  '1959', '1958', '1957', '1956'
];

export default function NextVotingSelector({ currentYear = '2026', onYearSelect }: NextVotingSelectorProps) {
  const { data: session } = useSession();
  const [isDropdownExpanded, setIsDropdownExpanded] = useState(false);
  const [isYearSelectorOpen, setIsYearSelectorOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(AVAILABLE_YEARS[0]); // Auto-detect first available year
  const [savedYear, setSavedYear] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasVoted, setHasVoted] = useState(false);

  // Load user's previous survey response
  useEffect(() => {
    if (session?.user) {
      fetch('/api/survey/next-year')
        .then(res => res.json())
        .then(data => {
          if (data.selectedYear) {
            setSelectedYear(data.selectedYear);
            setSavedYear(data.selectedYear);
            setHasVoted(true);
          }
        })
        .catch(error => console.error('Error loading survey response:', error));
    }
  }, [session]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setIsYearSelectorOpen(false);
    if (onYearSelect) {
      onYearSelect(year);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session?.user) {
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/survey/next-year', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedYear: selectedYear
        })
      });

      if (response.ok) {
        setSaveStatus('success');
        setSavedYear(selectedYear);
        setHasVoted(true);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving survey response:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className={`rounded-lg p-3 mb-3 transition-all duration-500 ${
        !hasVoted 
          ? 'bg-[#a0100063] bg-opacity-20 border-1 border-[#ff7363]' 
          : isSaving 
          ? 'bg-[#f39c12] bg-opacity-20 border-1 border-[#f39c12]' 
          : saveStatus === 'success'
          ? 'bg-[#1e3b2a] bg-opacity-10 border-1 border-[#52c27a]'
          : 'bg-[#1e3b2a] bg-opacity-10 border-1 border-[#52c27a]'
      }`}
      onMouseLeave={() => {
        if (savedYear === selectedYear) {
          setIsDropdownExpanded(false);
        }
      }}
    >
      <div 
        className="text-center cursor-pointer"
        onClick={() => setIsDropdownExpanded(!isDropdownExpanded)}
      >
        <h2 className="text-md font-bold text-white mb-0">
          {hasVoted ? `Sonraki yıl seçimin: ${savedYear}` : 'Sonraki yılı sen belirle...'}
        </h2>
        <p className="text-sm text-gray-300 mb-0">
          {hasVoted ? `Your next year selection: ${savedYear}` : 'Define the next year...'}
        </p>
        {isDropdownExpanded && (
          <div className="flex flex-col items-center gap-3 mt-3">
            <div className="relative w-full max-w-md">
              <button
                className="w-full bg-[#34495e] text-white px-6 py-3 rounded-lg font-medium border-2 border-[#4a5d6e] hover:border-[#3498db] focus:outline-none focus:border-[#3498db] transition-colors cursor-pointer flex justify-between items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsYearSelectorOpen(!isYearSelectorOpen);
                }}
              >
                <span>Eurovision {selectedYear}</span>
                <svg className={`w-5 h-5 transition-transform ${isYearSelectorOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isYearSelectorOpen && (
                <div className={`absolute z-50 w-full mt-2 rounded-lg border-2 max-h-64 overflow-y-auto shadow-2xl ${
                  !hasVoted 
                    ? 'bg-[#a0100063] border-[#ff7363]' 
                    : isSaving 
                    ? 'bg-[#f39c12] bg-opacity-20 border-[#f39c12]' 
                    : 'bg-[#1e3b2a] border-[#52c27a]'
                }`}>
                  <div className="grid grid-cols-5 gap-2 p-3">
                    {AVAILABLE_YEARS.map(year => (
                      <button
                        key={year}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleYearChange(year);
                        }}
                        className={`px-3 py-2 rounded-lg font-medium transition-all ${
                          selectedYear === year
                            ? 'bg-[#3498db] text-white scale-105'
                            : 'bg-[#34495e] text-gray-300 hover:bg-[#3498db] hover:text-white hover:scale-105'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              className="bg-[#3498db] hover:bg-[#2980b9] text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={isSaving || !session?.user}
            >
              <div className="text-center">
                <div className="text-sm font-bold leading-tight">
                  {isSaving ? 'Kaydediliyor...' : saveStatus === 'success' ? '✓ Kaydedildi' : hasVoted ? 'Seçimimi Değiştir' : 'Kaydet'}
                </div>
                <div className="text-xs leading-tight">
                  {isSaving ? 'Saving...' : saveStatus === 'success' ? '✓ Saved' : hasVoted ? 'Change Selection' : 'Save'}
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
