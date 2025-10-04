'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import { ResultsData } from '@/types/votes';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const eurovision2025Songs: { [key: string]: { code: string; performer: string; song: string; youtubeId: string } } = {
'Albania': { code: 'AL', performer: 'Shkodra Elektronike', song: 'Zjerm', youtubeId: 'xfn6ssOf_zU' },
//   'Andorra': { code: 'AD', performer: '', song: '', youtubeId: '' },
'Armenia': { code: 'AM', performer: 'PARG', song: 'SURVIVOR', youtubeId: 'qHkZWLld-pw' },
'Australia': { code: 'AU', performer: 'Go-Jo', song: 'Milkshake Man', youtubeId: 'EJ0RdIU_G8g' },
'Austria': { code: 'AT', performer: 'JJ', song: 'Wasted Love', youtubeId: 'coGaxAWtp58' },
'Azerbaijan': { code: 'AZ', performer: 'Mamagama', song: 'Run With U', youtubeId: 'wk1CUjaRKyo' },
//   'Belarus': { code: 'BY', performer: '', song: '', youtubeId: '' },
'Belgium': { code: 'BE', performer: 'Red Sebastian', song: 'Strobe Lights', youtubeId: 'fl4LaADiLBY' },
//   'Bosnia & Herzegovina': { code: 'BA', performer: '', song: '', youtubeId: '' },
//   'Bulgaria': { code: 'BG', performer: '', song: '', youtubeId: '' },
'Croatia': { code: 'HR', performer: 'Marko Bošnjak', song: 'Poison Cake', youtubeId: 'jzK4D_gfRjQ' },
'Czechia': { code: 'CZ', performer: 'ADONXS', song: 'Kiss Kiss Goodbye', youtubeId: 'hdxna1DC7yo' },
'Denmark': { code: 'DK', performer: 'SABA', song: 'Hallucination', youtubeId: 'B3BdsYDnS8M' },
'Estonia': { code: 'EE', performer: 'Tommy Cash', song: 'Espresso Macchiato', youtubeId: '9b9Z5HSCXOI' },
'Finland': { code: 'FI', performer: 'Erika Vikman', song: 'ICH KOMME', youtubeId: 'V3vbVd1ynnk' },
'France': { code: 'FR', performer: 'Louane', song: 'maman', youtubeId: 'jhqJY0ll1Wo' },
'Georgia': { code: 'GE', performer: 'Mariam Shengelia', song: 'Freedom', youtubeId: 'jphJoo-CNtU' },
'Germany': { code: 'DE', performer: 'Abor & Tynna', song: 'Baller', youtubeId: '3rrWZ6cldsA' },
'Greece': { code: 'GR', performer: 'Klavdia', song: 'Asteromáta', youtubeId: '1qbWRl6h6to' },
//   'Hungary': { code: 'HU', performer: '', song: '', youtubeId: '' },
'Iceland': { code: 'IS', performer: 'VÆB', song: 'Róa', youtubeId: 'c73Lx1QUZZA' },
'Ireland': { code: 'IE', performer: 'EMMY', song: 'Laika Party', youtubeId: '3MB628Kanzo' },
'Israel': { code: 'IL', performer: 'Yuval Raphael', song: 'New Day Will Rise', youtubeId: '_7zHp51j2WM' },
'Italy': { code: 'IT', performer: 'Lucio Corsi', song: 'Volevo Essere Un Duro', youtubeId: 'Vlu5XXDwHos' },
'Latvia': { code: 'LV', performer: 'Tautumeitas', song: 'Bur man laimi', youtubeId: 'nkvcMe3NiQ0' },
'Lithuania': { code: 'LT', performer: 'Katarsis', song: 'Tavo Akys', youtubeId: '3F6bwWGhm_s' },
'Luxembourg': { code: 'LU', performer: 'Laura Thorn', song: 'La Poupée Monte Le Son', youtubeId: 'GT7ZZBCscUg' },
'Malta': { code: 'MT', performer: 'Miriana Conte', song: 'Serving', youtubeId: 'povnGP6k0sI' },
//   'Moldova': { code: 'MD', performer: '', song: '', youtubeId: '' },
//   'Monaco': { code: 'MC', performer: '', song: '', youtubeId: '' },
'Montenegro': { code: 'ME', performer: 'Nina Žižić', song: 'Dobrodošli', youtubeId: 'L9MNHACTvT0' },
'Netherlands': { code: 'NL', performer: 'Claude', song: "C'est La Vie", youtubeId: 'LiTQVJwxvfE' },
//   'North Macedonia': { code: 'MK', performer: '', song: '', youtubeId: '' },
'Norway': { code: 'NO', performer: 'Kyle Alessandro', song: 'Lighter', youtubeId: 'gQOGxx6Fk9k' },
'Poland': { code: 'PL', performer: 'Justyna Steczkowska', song: 'GAJA', youtubeId: 'eg5RtEX1zJ0' },
'Portugal': { code: 'PT', performer: 'NAPA', song: 'Deslocado', youtubeId: 'waInyqBwSo0' },
//   'Romania': { code: 'RO', performer: '', song: '', youtubeId: '' },
//   'Russia': { code: 'RU', performer: '', song: '', youtubeId: '' },
'San Marino': { code: 'SM', performer: 'Gabry Ponte', song: "Tutta L'Italia", youtubeId: 'hq6XIRKmA2A' },
'Serbia': { code: 'RS', performer: 'Princ', song: 'Mila', youtubeId: 'WlCoZ0UOXoY' },
//   'Serbia Montenegro': { code: 'RM', performer: '', song: '', youtubeId: '' },
//   'Slovakia': { code: 'SK', performer: '', song: '', youtubeId: '' },
'Slovenia': { code: 'SI', performer: 'Klemen', song: 'How Much Time Do We Have Left', youtubeId: 'Jbs9WlvIkg0' },
'Southern Cyprus': { code: 'CY', performer: 'Theo Evan', song: 'Shh', youtubeId: 'egPAiAuC57k' },
'Spain': { code: 'ES', performer: 'Melody', song: 'ESA DIVA', youtubeId: 'IEKSa9FVLqA' },
'Sweden': { code: 'SE', performer: 'KAJ', song: 'Bara Bada Bastu', youtubeId: 'WSh7U3m9KgA' },
'Switzerland': { code: 'CH', performer: 'Zoë Më', song: 'Voyage', youtubeId: '5TMc6HzimQo' },
//   'Türkiye': { code: 'TR', performer: '', song: '', youtubeId: '' },
'Ukraine': { code: 'UA', performer: 'Ziferblat', song: 'Bird of Pray', youtubeId: '-DG0l8sSNJM' },
'United Kingdom': { code: 'GB', performer: 'Remember Monday', song: 'What The Hell Just Happened?', youtubeId: 'Ur5qRh0BaHk' },
//   'Yugoslavia': { code: 'YU', performer: '', song: '', youtubeId: '' }
};

export default function Eurovision2025() {
  // Current time state for testing middleware redirect
  // (Removed unused currentTime state and timer)
  
  const { data: session, status } = useSession();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(Array(10).fill(''));
  const [showResults, setShowResults] = useState(false); // Toggle for showing results with points
  const [voteConfig, setVoteConfig] = useState({ 
    status: true, 
    showCountDown: '', 
    mode: 'visible', 
    isGM: false 
  });
  const [autoRefreshTimer, setAutoRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedCountryName, setSelectedCountryName] = useState<string>('');

  // Points mapping for slots (index 0 -> 12 points, index 1 -> 10 points, ...)
  const POINTS = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];
  const firstEmptyIndex = selectedCountries.findIndex((slot) => slot === '');
  const nextAvailablePoints = firstEmptyIndex !== -1 ? POINTS[firstEmptyIndex] : 0;

  const openYouTubeModal = (country: string) => {
    const songData = eurovision2025Songs[country];
    if (songData?.youtubeId) {
      setSelectedVideoId(songData.youtubeId);
      setSelectedCountryName(country);
      setShowYouTubeModal(true);
    }
  };

  const closeYouTubeModal = () => {
    setShowYouTubeModal(false);
    setSelectedVideoId('');
    setSelectedCountryName('');
  };

  useEffect(() => {
    async function fetchConfig() {
      try {
        console.log(`[Eurovision2025] Fetching config for year: 2025`);
        console.log(`[Eurovision2025] User authentication status: ${status}`);
        console.log(`[Eurovision2025] User email: ${session?.user?.email || 'Not signed in'}`);
        
        // Add a timestamp to prevent caching issues
        const response = await fetch(`/api/config/vote-config?year=2025&t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`[Eurovision2025] Config API response:`, data);
          console.log(`[Eurovision2025] isGM status: ${data.isGM}`);
          console.log(`[Eurovision2025] Mode setting: ${data.mode}`);
          setVoteConfig(data);
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
      }
    }
    
    fetchConfig();
  }, [session, status]);

  useEffect(() => {
    // Only fetch results once we know the session status
    if (status !== 'loading') {
      fetchResults();
    }
    // We want this to run when session status changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Update results whenever selectedCountries changes
  useEffect(() => {
    if (results && !loading && selectedCountries.length === 10) {
      console.log('useEffect triggered, calling updateResults');
      updateResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountries]);

  // Start auto-refresh if showResults is enabled
  useEffect(() => {
    if (showResults && !loading) {
      startAutoRefresh();
    }
    
    // Cleanup timer on unmount
    return () => {
      if (autoRefreshTimer) {
        clearTimeout(autoRefreshTimer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults, loading]);

  const updateResults = async () => {
    if (!results) return;

    console.log('Updating results with selectedCountries:', selectedCountries);

    // Start with base points (all countries at 0)
    const allCountries = Object.keys(eurovision2025Songs);
    const basePoints: { [country: string]: number } = {};
    
    // Initialize all countries to 0
    allCountries.forEach(country => {
      basePoints[country] = 0;
    });

    console.log('Starting with zero points for all countries');

    // Add points for each vote from the original data (excluding current user)
    // We'll simulate this by taking total votes - 1 and calculate points
    // For now, let's just use the current logic but ensure no negative points
    
    // Start with current points
    Object.keys(results.countryPoints).forEach(country => {
      basePoints[country] = Math.max(0, results.countryPoints[country] || 0);
    });

    // Remove user's previous vote points if they exist
    if (results.userVote?.votes) {
      results.userVote.votes.forEach((country, index) => {
        const pointsToRemove = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1][index];
        basePoints[country] = Math.max(0, (basePoints[country] || 0) - pointsToRemove);
        console.log(`Removed ${pointsToRemove} points from ${country}, now has ${basePoints[country]}`);
      });
    }

    console.log('Points after removing user votes:', basePoints);

    // Add new vote points based on their actual slot positions
    selectedCountries.forEach((country, slotIndex) => {
      if (country && country.trim() !== '') { // Only process non-empty slots
        const pointsToAdd = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1][slotIndex];
        basePoints[country] = (basePoints[country] || 0) + pointsToAdd;
        console.log(`Added ${pointsToAdd} points to ${country} (slot ${slotIndex + 1}), now has ${basePoints[country]}`);
      } else if (slotIndex < 10) {
        console.log(`Slot ${slotIndex + 1} is empty`);
      }
    });

    console.log('Final points after adding new votes:', basePoints);

    // Create updated user vote with the full 10-element array (including empty slots)
    const updatedUserVote = {
      userId: results.userVote?.userId || 'temp',
      userName: results.userVote?.userName || 'temp',
      userEmail: results.userVote?.userEmail || 'temp',
      votes: selectedCountries, // Send the full array with empty strings
      timestamp: new Date(),
    };

    // Create completely new results object
    const newResults = {
      ...results,
      countryPoints: basePoints,
      userVote: updatedUserVote,
      totalVotes: results.totalVotes
    };

    console.log('New results:', newResults.countryPoints);
    setResults(newResults);

    // Save to database (optional - don't block UI if it fails)
    try {
      // Send the exact selectedCountries array to preserve slot positions
      // This maintains empty strings in their exact positions
      console.log('Sending votes to API (preserving slot positions):', selectedCountries);
      
      const response = await fetch('/api/votes/2025', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          votes: selectedCountries // Send the full array with empty strings in exact positions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.warn('Failed to save votes to server:', response.status, errorData);
      } else {
        console.log('Votes saved successfully');
      }
    } catch (error) {
      console.warn('Error saving votes to server, but continuing with local updates:', error);
    }
  };

  const fetchFreshResults = async () => {
    try {
      console.log('Fetching fresh results from simple endpoint...');
      const endpoint = '/api/votes/2025/simple';
      const cacheBustUrl = `${endpoint}?t=${Date.now()}`;
      console.log('Using simple endpoint:', cacheBustUrl);
      
      const response = await fetch(cacheBustUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        console.log('Fresh results updated from server with totalVotes:', data.totalVotes);
      }
    } catch (error) {
      console.error('Error fetching fresh results:', error);
    }
  };

  const startAutoRefresh = () => {
    // Clear existing timer
    if (autoRefreshTimer) {
      clearTimeout(autoRefreshTimer);
    }
    
    // Start new 30-second timer
    const newTimer = setTimeout(() => {
      fetchFreshResults();
      startAutoRefresh(); // Restart the timer
    }, 30000); // 30 seconds
    
    setAutoRefreshTimer(newTimer);
    console.log('Auto-refresh timer started (30 seconds)');
  };

  const resetAutoRefreshTimer = () => {
    if (showResults) {
      console.log('Vote changed - resetting auto-refresh timer');
      startAutoRefresh();
    }
  };

  // Helper function to check if there are empty slots (uses closure)
  const hasEmptySlots = (): boolean => {
    return selectedCountries.some((country) => country === '');
  };

  // Helper function to add a country to the first empty slot (uses closure)
  const addCountryToFirstEmptySlot = (country: string) => {
    const firstEmptyIndex = selectedCountries.findIndex((slot) => slot === '');
    if (firstEmptyIndex !== -1) {
      const updatedCountries = [...selectedCountries];
      updatedCountries[firstEmptyIndex] = country;
      setSelectedCountries(updatedCountries);
      resetAutoRefreshTimer();
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destinationId = result.destination.droppableId;
    const draggableId = result.draggableId;
    
    // Extract country name from draggableId
    let country: string;
    if (draggableId.startsWith('slot-')) {
      // Extract country from slot draggable ID: "slot-0-CountryName"
      country = draggableId.split('-').slice(2).join('-');
    } else {
      // Regular country draggable from results
      country = draggableId;
    }

    const newSelectedCountries = [...selectedCountries];

    if ((sourceId === 'results' || sourceId === 'results2') && destinationId.startsWith('slot-')) {
      const slotIndex = parseInt(destinationId.split('-')[1]);
      
      // Remove the country from its current position if it exists elsewhere
      const existingIndex = newSelectedCountries.indexOf(country);
      if (existingIndex !== -1) {
        newSelectedCountries[existingIndex] = '';
      }
      
      // Place the country in the new slot
      newSelectedCountries[slotIndex] = country;
    } else if (sourceId.startsWith('slot-') && destinationId.startsWith('slot-')) {
      const sourceIndex = parseInt(sourceId.split('-')[1]);
      const destIndex = parseInt(destinationId.split('-')[1]);
      
      // Swap the countries between slots
      const temp = newSelectedCountries[destIndex];
      newSelectedCountries[destIndex] = newSelectedCountries[sourceIndex];
      newSelectedCountries[sourceIndex] = temp;
    }

    // Update the state - useEffect will handle the results update
    setSelectedCountries(newSelectedCountries);
    
    // Reset auto-refresh timer when vote changes
    resetAutoRefreshTimer();
  };

  const fetchResults = async (retryCount = 0) => {
    try {
      // Wait for session to be loaded before deciding which endpoint to use
      if (status === 'loading') {
        return; // Don't fetch until we know the session status
      }
      
      // Use simple endpoint that returns hardcoded working data
      const endpoint = '/api/votes/2025/simple';
      // Add cache-busting timestamp to force fresh data
      // If we expect auth but don't have userVote yet, add waitForAuth param
      const needsAuth = status === 'authenticated' && session?.user?.email;
      const cacheBustUrl = `${endpoint}?t=${Date.now()}${needsAuth ? '&waitForAuth=true' : ''}`;
      console.log('Fetching from simple endpoint:', cacheBustUrl, `(retry: ${retryCount})`);
      
      const response = await fetch(cacheBustUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched data:', data);
        console.log('Total votes in response:', data.totalVotes);
        console.log('User session email:', session?.user?.email);
        console.log('Data session email:', data.sessionEmail);
        console.log('Has user vote:', !!data.userVote);
        
        // If user is authenticated but we don't have their vote yet, and it's not due to no votes existing
        if (status === 'authenticated' && session?.user?.email && !data.userVote && !data.authPending && retryCount < 3) {
          console.warn(`User authenticated but no vote found, retrying in 1 second... (attempt ${retryCount + 1}/3)`);
          
          // Set results with cumulative data so user sees something while waiting
          setResults(data);
          
          setTimeout(() => {
            fetchResults(retryCount + 1);
          }, 1000);
          return;
        }
        
        // Handle auth pending response (202 status)
        if (data.authPending && retryCount < 5) {
          console.log(`Authentication pending, retrying in 500ms... (attempt ${retryCount + 1}/5)`);
          
          // Set results with cumulative data so user sees something while waiting
          setResults(data);
          
          setTimeout(() => {
            fetchResults(retryCount + 1);
          }, 500);
          return;
        }
        
        // If still getting 0 votes, try a direct API test
        if (data.totalVotes === 0) {
          console.warn('Still receiving 0 votes, testing debug endpoint...');
          try {
            const debugResponse = await fetch(`/api/debug?t=${Date.now()}`, { cache: 'no-store' });
            const debugData = await debugResponse.json();
            console.log('Debug data:', debugData);
            
            // If debug shows votes exist but API returns 0, force a retry in 2 seconds
            if (debugData.focus2025?.votesCount > 0) {
              console.warn('Mismatch detected - retrying in 2 seconds...');
              setTimeout(() => {
                fetchResults();
              }, 2000);
            }
          } catch (debugError) {
            console.warn('Debug endpoint failed:', debugError);
          }
        }
        
        setResults(data);
        console.log('Results state set with totalVotes:', data.totalVotes);
        
        // Load user's show results preference from localStorage (for both auth and unauth users)
        const savedShowResults = localStorage.getItem('eurovision2025_showResults');
        if (savedShowResults !== null) {
          setShowResults(JSON.parse(savedShowResults));
        }
        
        // Only set selectedCountries if user is authenticated and has votes
        if (session && loading && data.userVote?.votes) {
          // Create an array of 10 elements with empty strings
          const newSelectedCountries = Array(10).fill('');
          
          // Fill in the votes at their correct positions
          data.userVote.votes.forEach((country: string, index: number) => {
            newSelectedCountries[index] = country;
          });
          
          setSelectedCountries(newSelectedCountries);
          console.log('User votes loaded into selectedCountries:', newSelectedCountries);
        }
      } else {
        console.error('Error fetching results:', response.status);
        
        // Only show fallback if we're not retrying
        if (retryCount === 0) {
          // Fallback for unauthenticated users or final failure
          setResults({
            countryPoints: {},
            totalVotes: 0,
            // userVote omitted (undefined) for fallback
          });
        }
      }
    } finally {
      // Only set loading to false if we're done with retries
      if (retryCount === 0 || status !== 'authenticated' || !session?.user?.email) {
        setLoading(false);
      }
    }
  };

  const toggleShowResults = () => {
    // If mode is set to 'hide', don't allow showing results unless user is GM
    if (!showResults && voteConfig.mode === 'hide' && !voteConfig.isGM) {
      console.log('Results are hidden by configuration');
      return;
    }
    
    const newShowResults = !showResults;
    setShowResults(newShowResults);
    localStorage.setItem('eurovision2025_showResults', JSON.stringify(newShowResults));
    
    if (newShowResults) {
      // Start auto-refresh when showing results
      startAutoRefresh();
    } else {
      // Stop auto-refresh when hiding results
      if (autoRefreshTimer) {
        clearTimeout(autoRefreshTimer);
        setAutoRefreshTimer(null);
        console.log('Auto-refresh timer stopped');
      }
    }
  };

  if (loading || String(status) === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  }

  // Show loading during authentication if we expect user data but don't have results yet
  // Only show this if we have absolutely no data to display
  if (status === 'authenticated' && !results) {
    return <div className="flex items-center justify-center min-h-screen">Oylar yükleniyor...</div>;
  }

  if (!results) {
    return <div className="flex items-center justify-center min-h-screen">Sonuçlar yüklenirken bir hata oluştu</div>;
  }

  // Sign-in component for unauthenticated users
  const SignInPrompt = () => (
    <div className="bg-[#2c3e50] rounded-lg p-6">
  <h2 className="text-2xl font-bold text-white mb-4">Oylarım</h2>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="bg-[#2a3846] border-2 border-dashed border-[#34495e] rounded-lg p-6 w-full">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">Please sign in to start voting</h3>
            <p className="text-gray-400 mb-6">Google ile giriş yaparak oy verin ve tercihlerinizi kaydedin</p>
            <button
              onClick={() => signIn('google')}
              className="bg-[#4285f4] hover:bg-[#3367d6] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
      
      {/* 
        BUTTON VISIBILITY LOGIC:
        
        Show button ONLY when one of these conditions is true:
        1. User is a GM (admin), OR
        2. Mode is NOT 'hide', OR
        3. Results are ALREADY showing (so user can hide them)
        
        These are the ONLY cases when the button should be visible
      */}
      {(() => {
        // Wait for auth and config before making decisions
        if (status === 'loading') {
          return null; // Don't render while loading
        }
        
        // Debug button visibility decision
        const isGM = voteConfig.isGM === true;
        const isNotHideMode = voteConfig.mode !== 'hide';
        const isShowingResults = showResults === true;
        
        // Button should ONLY be shown if ANY of these conditions are true
        const shouldShowButton = isGM || isNotHideMode || isShowingResults;
        
        console.log(`[Button Visibility] Auth status: ${status}`);
        console.log(`[Button Visibility] Mode:'${voteConfig.mode}', isGM:${voteConfig.isGM}, showResults:${showResults}`);
        console.log(`[Button Visibility] Should show button: ${shouldShowButton}`);
        
        // Only render if we should show the button
        if (!shouldShowButton) {
          return null;
        }
        
        // Render the button
        return (
          <button
            onClick={toggleShowResults}
            className={`mt-4 w-full py-2 px-4 rounded font-medium transition-colors ${
              showResults 
                ? 'bg-[#e74c3c] hover:bg-[#c0392b] text-white' 
                : 'bg-[#3498db] hover:bg-[#2980b9] text-white'
            }`}
          >
            {showResults ? 'Sonuçları Gizle' : 'Sonuçları Göster'}
          </button>
        );
      })()}
    </div>
  );

  // Get all countries from the eurovision2025Songs mapping
  const allCountries = Object.keys(eurovision2025Songs);
  
  // Create array of all countries with their points (including 0 points)
  // Sort alphabetically when results are hidden, by points when shown
  const sortedCountries: [string, number][] = showResults 
    ? allCountries
        .map(country => [country, results.countryPoints[country] || 0] as [string, number])
        .sort(([, pointsA], [, pointsB]) => pointsB - pointsA || 0)
    : allCountries
        .map(country => [country, results.countryPoints[country] || 0] as [string, number])
        .sort(([countryA], [countryB]) => countryA.localeCompare(countryB));

  // If you want to temporarily disable the page, toggle UNDER_CONSTRUCTION at top of file.
  // Keep small no-op references so linters don't flag the helpers as unused.
  void hasEmptySlots;
  void addCountryToFirstEmptySlot;

  // Bakım modu kontrolü artık middleware tarafından yapılıyor.

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Eurovision 2025
        </h1>
        
        {session ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-wrap gap-8">
              {/* Oylarım Section - Show voting if authenticated, sign-in prompt if not */}
              <div className="w-full lg:w-[420px]">
                <div className="bg-[#2c3e50] rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Oylarım</h2>
                  <div className="grid gap-0">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <Droppable 
                        key={`slot-${index}`} 
                        droppableId={`slot-${index}`}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`${
                              snapshot.isDraggingOver ? 'bg-[#243342] border-2 border-dashed border-[#4a5d6e]' : ''
                            } min-h-[60px] rounded w-full max-w-[380px]`}
                          >
                            <div 
                              className={`flex items-center justify-between w-full max-w-full ${
                                selectedCountries[index] ? 'bg-[#34495e]' : 'bg-[#2a3846] border-2 border-dashed border-[#34495e]'
                              } p-3 rounded`}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                                <span className={`font-bold flex-shrink-0 ${selectedCountries[index] ? 'text-white' : 'text-gray-500'}`}>
                                  {index + 1}.
                                </span>
                                {selectedCountries[index] ? (
                                  <Draggable 
                                    key={`${selectedCountries[index]}-${index}`} 
                                    draggableId={`slot-${index}-${selectedCountries[index]}`} 
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`flex items-center gap-2 flex-1 min-w-0 overflow-hidden ${
                                          snapshot.isDragging ? 'opacity-50' : ''
                                        }`}
                                      >
                                        <Image 
                                          src={`/flags/${selectedCountries[index].replace('&', 'and')}_${eurovision2025Songs[selectedCountries[index]]?.code}.png`}
                                          alt={`${selectedCountries[index]} flag`}
                                          width={24}
                                          height={16}
                                          className="object-cover rounded flex-shrink-0"
                                        />
                                        <span className="text-white truncate">{selectedCountries[index]}</span>
                                      </div>
                                    )}
                                  </Draggable>
                                ) : (
                                  <>
                                    <div className="w-6 h-4 bg-[#34495e] rounded opacity-30 flex-shrink-0" />
                                    <span className="text-gray-500 truncate">Sıralama</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className={`font-bold ${selectedCountries[index] ? 'text-white' : 'text-gray-500'}`}>
                                  {[12, 10, 8, 7, 6, 5, 4, 3, 2, 1][index]} points
                                </span>
                                {selectedCountries[index] && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newSelectedCountries = [...selectedCountries];
                                      newSelectedCountries[index] = '';
                                      setSelectedCountries(newSelectedCountries);
                                      resetAutoRefreshTimer(); // Reset timer on remove
                                    }}
                                    className="bg-[#e74c3c] hover:bg-[#c0392b] text-white w-6 h-6 rounded flex items-center justify-center transition-colors"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-gray-400 text-center">
                    Sürükle-bırak veya artı düğmesiyle oy verin. <br /> Sıralamayı sürükle-bırak ile değiştirebilirsiniz. <br /> Oylarınız otomatik olarak kaydedilir. <br /> İstediğiniz zaman oylarınızı değiştirebilirsiniz.
                  </div>
                  {(() => {
                    // Debug button visibility decision
                    const isGM = voteConfig.isGM === true;
                    const isNotHideMode = voteConfig.mode !== 'hide';
                    const isShowingResults = showResults === true;
                    
                    // Button should ONLY be shown if ANY of these conditions are true
                    const shouldShowButton = isGM || isNotHideMode || isShowingResults;
                    
                    // Only render if we should show the button
                    if (!shouldShowButton) {
                      return null;
                    }
                    
                    return (
                      <button
                        onClick={toggleShowResults}
                        className={`mt-4 w-full py-2 px-4 rounded font-medium transition-colors ${
                          showResults 
                            ? 'bg-[#e74c3c] hover:bg-[#c0392b] text-white' 
                            : 'bg-[#3498db] hover:bg-[#2980b9] text-white'
                        }`}
                      >
                        {showResults ? 'Sonuçları Gizle' : 'Sonuçları Göster'}
                      </button>
                    );
                  })()}
                </div>
              </div>

              {/* Sonuçlar Section - Split into 2 columns */}
              <div className="flex-1">
                <div className="bg-[#2c3e50] rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {showResults 
                      ? `Sonuçlar (Toplam Kullanıcı: ${results.totalVotes})` 
                      : 'Ülkeler (Alfabetik)'
                    }
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    {/* First Column - Higher Rankings */}
                    <div className="space-y-2">
                      <Droppable droppableId="results">
                        {(provided) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="space-y-1"
                          >
                            {sortedCountries.slice(0, Math.ceil(sortedCountries.length / 2)).map(([country, points], index) => (
                              <Draggable key={country} draggableId={country} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps} 
                                    className={`flex items-center justify-between ${
                                      showResults && points > 0 ? 'bg-[#34495e]' : 'bg-[#2a3846]'
                                    } p-1 rounded ${
                                      snapshot.isDragging ? 'opacity-50' : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {session && hasEmptySlots() && !selectedCountries.includes(country) ? (
                                        <div className="group inline-block">
                                          <button
                                            className="bg-[#34895e] group-hover:bg-[#2d7a4a] text-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2d7a4a] active:scale-95 transform transition duration-150 ease-in-out"
                                            onClick={() => addCountryToFirstEmptySlot(country)}
                                          >
                                            <span className="inline group-hover:hidden">+</span>
                                            <span className="hidden group-hover:inline">{nextAvailablePoints}</span>
                                            <span className="sr-only">Add {country} ({nextAvailablePoints} points)</span>
                                          </button>
                                        </div>
                                      ) : (
                                        <span className={`text-lg font-bold ${
                                          showResults && points > 0 ? 'text-white' : 'text-gray-400'
                                        }`}>
                                          {index + 1}.
                                        </span>
                                      )}
                                      <div className="flex-shrink-0 flex flex-col items-center">
                                        <Image 
                                          src={`/flags/${country.replace('&', 'and')}_${eurovision2025Songs[country]?.code}.png`}
                                          alt={`${country} flag`}
                                          width={24}
                                          height={16}
                                          className={`object-cover rounded ${
                                            !showResults ? 'opacity-60' : ''
                                          }`}
                                        />
                                        {eurovision2025Songs[country]?.youtubeId && (
                                          <button 
                                            onClick={() => openYouTubeModal(country)}
                                            className="mt-1 text-red-600 hover:text-red-800 transition-colors"
                                            title="Watch Eurovision Performance"
                                          >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M23.498 6.186a2.952 2.952 0 0 0-2.075-2.088C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.423.598A2.952 2.952 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.952 2.952 0 0 0 2.075 2.088C4.495 20.5 12 20.5 12 20.5s7.505 0 9.423-.598a2.952 2.952 0 0 0 2.075-2.088C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                                              <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                      <div className="flex flex-col min-w-0 flex-1">
                                        <span className={showResults && points > 0 ? 'text-white' : 'text-gray-400'}>
                                          {country}
                                        </span>
                                        {eurovision2025Songs[country] && (
                                          <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 truncate">
                                              {eurovision2025Songs[country].performer}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate">
                                              {eurovision2025Songs[country].song}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      {/* moved youtube button under flag above */}
                                      {session && selectedCountries.includes(country) && (
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                          (#{selectedCountries.indexOf(country) + 1})
                                        </span>
                                      )}
                                    </div>
                                    {showResults && (
                                      <span className={`font-bold ml-2 whitespace-nowrap ${
                                        points > 0 ? 'text-white' : 'text-gray-400'
                                      }`}>
                                        <div className="ml-2 whitespace-nowrap text-right">
                                          <div className={`font-bold ${points > 0 ? 'text-white' : 'text-gray-400'}`}>
                                            {points} points
                                          </div>
                                          <div className="text-xs text-gray-400">
                                            {(() => {
                                              const denom = (results?.totalVotes || 0) * 12;
                                              if (!denom) return '0%';
                                              const pct = (points / denom) * 100;
                                              return `${pct.toFixed(2)}%`;
                                            })()}
                                          </div>
                                        </div>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>

                    {/* Second Column - Lower Rankings */}
                    <div className="space-y-2">
                      <Droppable droppableId="results2">
                        {(provided) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="space-y-1"
                          >
                            {sortedCountries.slice(Math.ceil(sortedCountries.length / 2)).map(([country, points], index) => (
                              <Draggable key={country} draggableId={country} index={index + Math.ceil(sortedCountries.length / 2)}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`flex items-center justify-between ${
                                      showResults && points > 0 ? 'bg-[#34495e]' : 'bg-[#2a3846]'
                                    } p-1 rounded ${
                                      snapshot.isDragging ? 'opacity-50' : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {session && hasEmptySlots() && !selectedCountries.includes(country) ? (
                                        <div className="group inline-block">
                                          <button
                                            className="bg-[#34895e] group-hover:bg-[#2d7a4a] text-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2d7a4a] active:scale-95 transform transition duration-150 ease-in-out"
                                            onClick={() => addCountryToFirstEmptySlot(country)}
                                          >
                                            <span className="inline group-hover:hidden">+</span>
                                            <span className="hidden group-hover:inline">{nextAvailablePoints}</span>
                                            <span className="sr-only">Add {country} ({nextAvailablePoints} points)</span>
                                          </button>
                                        </div>
                                      ) : (
                                        <span className={`text-lg font-bold ${
                                          showResults && points > 0 ? 'text-white' : 'text-gray-400'
                                        }`}>
                                          {index + Math.ceil(sortedCountries.length / 2) + 1}.
                                        </span>
                                      )}
                                      <div className="flex-shrink-0 flex flex-col items-center">
                                        <Image 
                                          src={`/flags/${country.replace('&', 'and')}_${eurovision2025Songs[country]?.code}.png`}
                                          alt={`${country} flag`}
                                          width={24}
                                          height={16}
                                          className={`object-cover rounded ${
                                            !showResults ? 'opacity-60' : ''
                                          }`}
                                        />
                                        {eurovision2025Songs[country]?.youtubeId && (
                                          <button 
                                            onClick={() => openYouTubeModal(country)}
                                            className="mt-1 text-red-600 hover:text-red-800 transition-colors"
                                            title="Watch Eurovision Performance"
                                          >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M23.498 6.186a2.952 2.952 0 0 0-2.075-2.088C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.423.598A2.952 2.952 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.952 2.952 0 0 0 2.075 2.088C4.495 20.5 12 20.5 12 20.5s7.505 0 9.423-.598a2.952 2.952 0 0 0 2.075-2.088C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                                              <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                      <div className="flex flex-col min-w-0 flex-1">
                                        <span className={showResults && points > 0 ? 'text-white' : 'text-gray-400'}>
                                          {country}
                                        </span>
                                        {eurovision2025Songs[country] && (
                                          <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 truncate">
                                              {eurovision2025Songs[country].performer}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate">
                                              {eurovision2025Songs[country].song}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {showResults && (
                                      <span className={`font-bold ml-2 whitespace-nowrap ${
                                        points > 0 ? 'text-white' : 'text-gray-400'
                                      }`}>
                                        <div className="ml-2 whitespace-nowrap text-right">
                                          <div className={`font-bold ${points > 0 ? 'text-white' : 'text-gray-400'}`}>
                                            {points} points
                                          </div>
                                          <div className="text-xs text-gray-400">
                                            {(() => {
                                              const denom = (results?.totalVotes || 0) * 12;
                                              if (!denom) return '0%';
                                              const pct = (points / denom) * 100;
                                              return `${pct.toFixed(2)}%`;
                                            })()}
                                          </div>
                                        </div>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DragDropContext>
        ) : (
          <div className="flex flex-wrap gap-8">
            {/* Sign-in prompt for unauthenticated users */}
            <div className="w-full lg:w-[420px]">
              <SignInPrompt />
            </div>

            {/* Results section for unauthenticated users - no drag and drop */}
            <div className="flex-1">
              <div className="bg-[#2c3e50] rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {showResults 
                    ? `Sonuçlar (Toplam Kullanıcı: ${results.totalVotes})` 
                    : 'Ülkeler (Alfabetik)'
                  }
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  {/* First Column - Higher Rankings */}
                  <div className="space-y-1">
                    {sortedCountries.slice(0, Math.ceil(sortedCountries.length / 2)).map(([country, points], index) => (
                      <div
                        key={country}
                        className={`flex items-center justify-between ${
                          showResults && points > 0 ? 'bg-[#34495e]' : 'bg-[#2a3846]'
                        } p-1 rounded`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${
                            showResults && points > 0 ? 'text-white' : 'text-gray-400'
                          }`}>
                            {index + 1}.
                          </span>
                          <div className="flex-shrink-0 flex flex-col items-center">
                            <Image 
                              src={`/flags/${country.replace('&', 'and')}_${eurovision2025Songs[country]?.code}.png`}
                              alt={`${country} flag`}
                              width={24}
                              height={16}
                              className={`object-cover rounded ${
                                !showResults ? 'opacity-60' : ''
                              }`}
                            />
                            {eurovision2025Songs[country]?.youtubeId && (
                              <button 
                                onClick={() => openYouTubeModal(country)}
                                className="mt-1 text-red-600 hover:text-red-800 transition-colors"
                                title="Watch Eurovision Performance"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.498 6.186a2.952 2.952 0 0 0-2.075-2.088C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.423.598A2.952 2.952 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.952 2.952 0 0 0 2.075 2.088C4.495 20.5 12 20.5 12 20.5s7.505 0 9.423-.598a2.952 2.952 0 0 0 2.075-2.088C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                                  <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                              </button>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={showResults && points > 0 ? 'text-white' : 'text-gray-400'}>
                              {country}
                            </span>
                            {eurovision2025Songs[country] && (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400 truncate">
                                  {eurovision2025Songs[country].performer}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                  {eurovision2025Songs[country].song}
                                </span>
                              </div>
                            )}
                          </div>
                          {/* youtube button moved under flag above */}
                        </div>
                        {showResults && (
                          <span className={`font-bold ml-2 whitespace-nowrap ${
                            points > 0 ? 'text-white' : 'text-gray-400'
                          }`}>
                            <div className="ml-2 whitespace-nowrap text-right">
                              <div className={`font-bold ${points > 0 ? 'text-white' : 'text-gray-400'}`}>
                                {points} points
                              </div>
                              <div className="text-xs text-gray-400">
                                {(() => {
                                  const denom = (results?.totalVotes || 0) * 12;
                                  if (!denom) return '0%';
                                  const pct = (points / denom) * 100;
                                  return `${pct.toFixed(2)}%`;
                                })()}
                              </div>
                            </div>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Second Column - Lower Rankings */}
                  <div className="space-y-1">
                    {sortedCountries.slice(Math.ceil(sortedCountries.length / 2)).map(([country, points], index) => (
                      <div
                        key={country}
                        className={`flex items-center justify-between ${
                          showResults && points > 0 ? 'bg-[#34495e]' : 'bg-[#2a3846]'
                        } p-1 rounded`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${
                            showResults && points > 0 ? 'text-white' : 'text-gray-400'
                          }`}>
                            {index + Math.ceil(sortedCountries.length / 2) + 1}.
                          </span>
                          <div className="flex-shrink-0 flex flex-col items-center">
                            <Image 
                              src={`/flags/${country.replace('&', 'and')}_${eurovision2025Songs[country]?.code}.png`}
                              alt={`${country} flag`}
                              width={24}
                              height={16}
                              className={`object-cover rounded ${
                                !showResults ? 'opacity-60' : ''
                              }`}
                            />
                            {eurovision2025Songs[country]?.youtubeId && (
                              <button 
                                onClick={() => openYouTubeModal(country)}
                                className="mt-1 text-red-600 hover:text-red-800 transition-colors"
                                title="Watch Eurovision Performance"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.498 6.186a2.952 2.952 0 0 0-2.075-2.088C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.423.598A2.952 2.952 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.952 2.952 0 0 0 2.075 2.088C4.495 20.5 12 20.5 12 20.5s7.505 0 9.423-.598a2.952 2.952 0 0 0 2.075-2.088C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                                  <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                              </button>
                            )}
                          </div>
                            <div className="flex flex-col min-w-0 flex-1">
                            <span className={showResults && points > 0 ? 'text-white' : 'text-gray-400'}>
                                {country}
                            </span>
                            {eurovision2025Songs[country] && (
                                <div className="flex flex-col">
                                <span className="text-xs text-gray-400 truncate">
                                    {eurovision2025Songs[country].performer}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                    {eurovision2025Songs[country].song}
                                </span>
                                </div>
                            )}
                            </div>
                        </div>
                        {showResults && (
                          <span className={`font-bold ml-2 whitespace-nowrap ${
                            points > 0 ? 'text-white' : 'text-gray-400'
                          }`}>
                            <div className="ml-2 whitespace-nowrap text-right">
                              <div className={`font-bold ${points > 0 ? 'text-white' : 'text-gray-400'}`}>
                                {points} points
                              </div>
                              <div className="text-xs text-gray-400">
                                {(() => {
                                  const denom = (results?.totalVotes || 0) * 12;
                                  if (!denom) return '0%';
                                  const pct = (points / denom) * 100;
                                  return `${pct.toFixed(2)}%`;
                                })()}
                              </div>
                            </div>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* YouTube Video Modal */}
      {showYouTubeModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={closeYouTubeModal}
        >
          <div 
            className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full mx-4 relative border border-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeYouTubeModal}
              className="absolute top-4 right-4 text-gray-300 hover:text-white text-2xl z-10"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4 text-white">{selectedCountryName} - Eurovision 2025</h3>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideoId}?hd=1&quality=hd720`}
                title={`${selectedCountryName} Eurovision 2025 Performance`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
