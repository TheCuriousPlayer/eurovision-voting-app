'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import { ResultsData } from '@/types/votes';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const eurovision2024Songs: { [key: string]: { code: string; performer: string; song: string; youtubeId: string } } = {
  'Albania': { code: 'AL', performer: 'BESA', song: 'TITAN', youtubeId: 'aQG22XJIdWw' },
//   'Andorra': { code: 'AD', performer: '', song: '', youtubeId: '' },
  'Armenia': { code: 'AM', performer: 'LADANIVA', song: 'Jako', youtubeId: 'hAYXDoZzAyE' },
  'Australia': { code: 'AU', performer: 'Electric Fields', song: 'One Milkali (One Blood)', youtubeId: 'Wzpp6996QdI' },
  'Austria': { code: 'AT', performer: 'Kaleen', song: 'We Will Rave', youtubeId: 'VZ6SlZnk_EI' },
  'Azerbaijan': { code: 'AZ', performer: 'FAHREE feat. Ilkin Dovlatov', song: 'Özünlə Apar', youtubeId: 'QhN9r8TH2Hw' },
//   'Belarus': { code: 'BY', performer: '', song: '', youtubeId: '' },
  'Belgium': { code: 'BE', performer: 'Mustii', song: "Before the Party's Over", youtubeId: 'hNIemQwCaM4' },
//   'Bosnia & Herzegovina': { code: 'BA', performer: '', song: '', youtubeId: '' },
//   'Bulgaria': { code: 'BG', performer: '', song: '', youtubeId: '' },
  'Croatia': { code: 'HR', performer: 'Baby Lasagna', song: 'Rim Tim Tagi Dim', youtubeId: 'YIBjarAiAVc' },
  'Cyprus': { code: 'CY', performer: 'Silia Kapsis', song: 'Liar', youtubeId: 'c4wMioZXbMk' },
  'Czechia': { code: 'CZ', performer: 'Aiko', song: 'Pedestal', youtubeId: 'RiItbHRF1BY' },
  'Denmark': { code: 'DK', performer: 'SABA', song: 'SAND', youtubeId: '4f_phiGot7w' },
  'Estonia': { code: 'EE', performer: '5MIINUST x Puuluup', song: '(nendest) narkootikumidest ei tea me (küll) midagi', youtubeId: 'RSMMU2wX0Bk' },
  'Finland': { code: 'FI', performer: 'Windows95man', song: 'No Rules!', youtubeId: '7nidDtyS0Wo' },
  'France': { code: 'FR', performer: 'Slimane', song: 'Mon amour', youtubeId: '-XyLecY2JyE' },
  'Georgia': { code: 'GE', performer: 'Nutsa Buzaladze', song: 'Firefighter', youtubeId: 'He4PGhm7jOw' },
  'Germany': { code: 'DE', performer: 'ISAAK', song: 'Always On The Run', youtubeId: 'kVOHTxFOhak' },
  'Greece': { code: 'GR', performer: 'Marina Satti', song: 'ZARI', youtubeId: 'ENb4LCeq9Lc' },
//   'Hungary': { code: 'HU', performer: '', song: '', youtubeId: '' },
  'Iceland': { code: 'IS', performer: 'Hera Björk', song: 'Scared of Heights', youtubeId: 'VChBgcycVl8' },
  'Ireland': { code: 'IE', performer: 'Bambie Thug', song: 'Doomsday Blue', youtubeId: 'UMq8ofCstMQ' },
  'Israel': { code: 'IL', performer: 'Eden Golan', song: 'Hurricane', youtubeId: 'K60BWlEhtAA' },
  'Italy': { code: 'IT', performer: 'Angelina Mango', song: 'La noia', youtubeId: 'zp1FXHjkjpQ' },
  'Latvia': { code: 'LV', performer: 'Dons', song: 'Hollow', youtubeId: 'kgIwQkMwURY' },
  'Lithuania': { code: 'LT', performer: 'Silvester Belt', song: 'Luktelk', youtubeId: 'N8YuQzJLR_k' },
  'Luxembourg': { code: 'LU', performer: 'TALI', song: 'Fighter', youtubeId: 'TCWH3Nq5y9A' },
  'Malta': { code: 'MT', performer: 'Sarah Bonnici', song: 'Loop', youtubeId: 'uG-JHeia13c' },
  'Moldova': { code: 'MD', performer: 'Natalia Barbu', song: 'In The Middle', youtubeId: 'evIoGkZXj2s' },
//   'Monaco': { code: 'MC', performer: '', song: '', youtubeId: '' },
//   'Montenegro': { code: 'ME', performer: '', song: '', youtubeId: '' },
//   'Morocco': { code: 'MA', performer: '', song: '', youtubeId: '' },
  'Netherlands': { code: 'NL', performer: 'Joost Klein', song: 'Europapa', youtubeId: 'IiHFnmI8pxg' },
//   'North Macedonia': { code: 'MK', performer: '', song: '', youtubeId: '' },
  'Norway': { code: 'NO', performer: 'Gåte', song: 'Ulveham', youtubeId: 'YBbL8ORqNVU' },
  'Poland': { code: 'PL', performer: 'LUNA', song: 'The Tower', youtubeId: 'ESKG8Uo1YaU' },
  'Portugal': { code: 'PT', performer: 'iolanda', song: 'Grito', youtubeId: 'OZn4-H6JvKU' },
//   'Romania': { code: 'RO', performer: '', song: '', youtubeId: '' },
//   'Russia': { code: 'RU', performer: '', song: '', youtubeId: '' },
  'San Marino': { code: 'SM', performer: 'MEGARA', song: '11:11', youtubeId: 'IqyJvkGmAjo' },
  'Serbia': { code: 'RS', performer: 'TEYA DORA', song: 'RAMONDA', youtubeId: '4hUg64uIY_4' },
//   'Serbia Montenegro': { code: 'RM', performer: '', song: '', youtubeId: '' },
//   'Slovakia': { code: 'SK', performer: '', song: '', youtubeId: '' },
  'Slovenia': { code: 'SI', performer: 'Raiven', song: 'Veronika', youtubeId: 'l86DxpRnz5M' },
  'Spain': { code: 'ES', performer: 'Nebulossa', song: 'ZORRA', youtubeId: 'FOMoQoHG5aU' },
  'Sweden': { code: 'SE', performer: 'Marcus & Martinus', song: 'Unforgettable', youtubeId: 'DcZpzObYzxs' },
  'Switzerland': { code: 'CH', performer: 'Nemo', song: 'The Code', youtubeId: 'CO_qJf-nW0k' },
//   'Türkiye': { code: 'TR', performer: '', song: '', youtubeId: '' },
  'Ukraine': { code: 'UA', performer: 'alyona alyona & Jerry Heil', song: 'Teresa & Maria', youtubeId: 'd4N82wPpdg8' },
  'United Kingdom': { code: 'GB', performer: 'Olly Alexander', song: 'Dizzy', youtubeId: 'q0_FdJqyQW0' }
//   'Yugoslavia': { code: 'YU', performer: '', song: '', youtubeId: '' }
};

// Toggle this to true to show an "Under Construction" message for this page only.
// Set to false to enable the normal page. (Easy to remove later.)
const UNDER_CONSTRUCTION = false;

export default function Eurovision2024() {
  const { data: session, status } = useSession();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(Array(10).fill(''));
  const [showResults, setShowResults] = useState(false); // Toggle for showing results with points
  const [autoRefreshTimer, setAutoRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedCountryName, setSelectedCountryName] = useState<string>('');

  const openYouTubeModal = (country: string) => {
    const songData = eurovision2024Songs[country];
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
    const allCountries = Object.keys(eurovision2024Songs);
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
      
      const response = await fetch('/api/votes/2024', {
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
      const endpoint = '/api/votes/2024/simple';
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
      const endpoint = '/api/votes/2024/simple';
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
            if (debugData.focus2024?.votesCount > 0) {
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
        const savedShowResults = localStorage.getItem('eurovision2024_showResults');
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
    const newShowResults = !showResults;
    setShowResults(newShowResults);
    localStorage.setItem('eurovision2024_showResults', JSON.stringify(newShowResults));
    
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

  if (loading || status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading results...</div>;
  }

  // Show loading during authentication if we expect user data but don't have results yet
  // Only show this if we have absolutely no data to display
  if (status === 'authenticated' && !results) {
    return <div className="flex items-center justify-center min-h-screen">Loading your votes...</div>;
  }

  if (!results) {
    return <div className="flex items-center justify-center min-h-screen">Error loading results</div>;
  }

  // Sign-in component for unauthenticated users
  const SignInPrompt = () => (
    <div className="bg-[#2c3e50] rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Your Vote</h2>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="bg-[#2a3846] border-2 border-dashed border-[#34495e] rounded-lg p-6 w-full">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">Please sign in to start voting</h3>
            <p className="text-gray-400 mb-6">Sign in with Google to cast your vote and save your preferences</p>
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
      
      <button
        onClick={toggleShowResults}
        className={`mt-4 w-full py-2 px-4 rounded font-medium transition-colors ${
          showResults 
            ? 'bg-[#e74c3c] hover:bg-[#c0392b] text-white' 
            : 'bg-[#3498db] hover:bg-[#2980b9] text-white'
        }`}
      >
        {showResults ? 'Hide Results' : 'Show Results'}
      </button>
    </div>
  );

  // Get all countries from the eurovision2024Songs mapping
  const allCountries = Object.keys(eurovision2024Songs);
  
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

  if (UNDER_CONSTRUCTION) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213e] p-8">
        <div className="bg-[#2c3e50] rounded-lg p-8 max-w-xl text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Eurovision 2024 — Under Construction</h1>
          <p className="text-gray-300">This page is temporarily disabled while we make improvements. Please check back soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Eurovision 2024 Results
        </h1>
        
        {session ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-wrap gap-8">
              {/* Your Vote Section - Show voting if authenticated, sign-in prompt if not */}
              <div className="w-full lg:w-[420px]">
                <div className="bg-[#2c3e50] rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Your Vote</h2>
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
                                          src={`/flags/${selectedCountries[index].replace('&', 'and')}_${eurovision2024Songs[selectedCountries[index]]?.code}.png`}
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
                                    <span className="text-gray-500 truncate">Drag a country here</span>
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
                    Drag countries from the results list to vote (max 10). Drag countries between slots to reorder.
                  </div>
                  <button
                    onClick={toggleShowResults}
                    className={`mt-4 w-full py-2 px-4 rounded font-medium transition-colors ${
                      showResults 
                        ? 'bg-[#e74c3c] hover:bg-[#c0392b] text-white' 
                        : 'bg-[#3498db] hover:bg-[#2980b9] text-white'
                    }`}
                  >
                    {showResults ? 'Hide Results' : 'Show Results'}
                  </button>
                </div>
              </div>

              {/* Overall Results Section - Split into 2 columns */}
              <div className="flex-1">
                <div className="bg-[#2c3e50] rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {showResults 
                      ? `Overall Results (${results.totalVotes} votes)` 
                      : 'Countries (Alphabetical)'
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
                                        <button
                                          className="bg-[#34895e] text-white px-2 py-1 rounded"
                                          onClick={() => addCountryToFirstEmptySlot(country)}
                                        >
                                          +
                                        </button>
                                      ) : (
                                        <span className={`text-lg font-bold ${
                                          showResults && points > 0 ? 'text-white' : 'text-gray-400'
                                        }`}>
                                          {index + 1}.
                                        </span>
                                      )}
                                      <Image 
                                        src={`/flags/${country.replace('&', 'and')}_${eurovision2024Songs[country]?.code}.png`}
                                        alt={`${country} flag`}
                                        width={24}
                                        height={16}
                                        className={`object-cover rounded ${
                                          !showResults ? 'opacity-60' : ''
                                        }`}
                                      />
                                      <div className="flex flex-col min-w-0 flex-1">
                                        <span className={showResults && points > 0 ? 'text-white' : 'text-gray-400'}>
                                          {country}
                                        </span>
                                        {eurovision2024Songs[country] && (
                                          <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 truncate">
                                              {eurovision2024Songs[country].performer}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate">
                                              {eurovision2024Songs[country].song}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      {eurovision2024Songs[country]?.youtubeId && (
                                        <button 
                                          onClick={() => openYouTubeModal(country)}
                                          className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                                          title="Watch Eurovision Performance"
                                        >
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a2.952 2.952 0 0 0-2.075-2.088C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.423.598A2.952 2.952 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.952 2.952 0 0 0 2.075 2.088C4.495 20.5 12 20.5 12 20.5s7.505 0 9.423-.598a2.952 2.952 0 0 0 2.075-2.088C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                                            <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                          </svg>
                                        </button>
                                      )}
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
                                        {points} points
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
                                        <button
                                          className="bg-[#34895e] text-white px-2 py-1 rounded"
                                          onClick={() => addCountryToFirstEmptySlot(country)}
                                        >
                                          +
                                        </button>
                                      ) : (
                                        <span className={`text-lg font-bold ${
                                          showResults && points > 0 ? 'text-white' : 'text-gray-400'
                                        }`}>
                                          {index + Math.ceil(sortedCountries.length / 2) + 1}.
                                        </span>
                                      )}
                                      <Image 
                                        src={`/flags/${country.replace('&', 'and')}_${eurovision2024Songs[country]?.code}.png`}
                                        alt={`${country} flag`}
                                        width={24}
                                        height={16}
                                        className={`object-cover rounded ${
                                          !showResults ? 'opacity-60' : ''
                                        }`}
                                      />
                                      <div className="flex flex-col min-w-0 flex-1">
                                        <span className={showResults && points > 0 ? 'text-white' : 'text-gray-400'}>
                                          {country}
                                        </span>
                                        {eurovision2024Songs[country] && (
                                          <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 truncate">
                                              {eurovision2024Songs[country].performer}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate">
                                              {eurovision2024Songs[country].song}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      {eurovision2024Songs[country]?.youtubeId && (
                                        <button 
                                          onClick={() => openYouTubeModal(country)}
                                          className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                                          title="Watch Eurovision Performance"
                                        >
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a2.952 2.952 0 0 0-2.075-2.088C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.423.598A2.952 2.952 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.952 2.952 0 0 0 2.075 2.088C4.495 20.5 12 20.5 12 20.5s7.505 0 9.423-.598a2.952 2.952 0 0 0 2.075-2.088C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                                            <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                          </svg>
                                        </button>
                                      )}
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
                                        {points} points
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
                    ? `Overall Results (${results.totalVotes} votes)` 
                    : 'Countries (Alphabetical)'
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
                          <Image 
                            src={`/flags/${country.replace('&', 'and')}_${eurovision2024Songs[country]?.code}.png`}
                            alt={`${country} flag`}
                            width={24}
                            height={16}
                            className={`object-cover rounded ${
                              !showResults ? 'opacity-60' : ''
                            }`}
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={showResults && points > 0 ? 'text-white' : 'text-gray-400'}>
                              {country}
                            </span>
                            {eurovision2024Songs[country] && (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400 truncate">
                                  {eurovision2024Songs[country].performer}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                  {eurovision2024Songs[country].song}
                                </span>
                              </div>
                            )}
                          </div>
                          {eurovision2024Songs[country]?.youtubeId && (
                            <button 
                              onClick={() => openYouTubeModal(country)}
                              className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                              title="Watch Eurovision Performance"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a2.952 2.952 0 0 0-2.075-2.088C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.423.598A2.952 2.952 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.952 2.952 0 0 0 2.075 2.088C4.495 20.5 12 20.5 12 20.5s7.505 0 9.423-.598a2.952 2.952 0 0 0 2.075-2.088C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                                <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            </button>
                          )}
                        </div>
                        {showResults && (
                          <span className={`font-bold ml-2 whitespace-nowrap ${
                            points > 0 ? 'text-white' : 'text-gray-400'
                          }`}>
                            {points} points
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
                          <Image 
                            src={`/flags/${country.replace('&', 'and')}_${eurovision2024Songs[country]?.code}.png`}
                            alt={`${country} flag`}
                            width={24}
                            height={16}
                            className={`object-cover rounded ${
                              !showResults ? 'opacity-60' : ''
                            }`}
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={showResults && points > 0 ? 'text-white' : 'text-gray-400'}>
                              {country}
                            </span>
                            {eurovision2024Songs[country] && (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400 truncate">
                                  {eurovision2024Songs[country].performer}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                  {eurovision2024Songs[country].song}
                                </span>
                              </div>
                            )}
                          </div>
                          {eurovision2024Songs[country]?.youtubeId && (
                            <button 
                              onClick={() => openYouTubeModal(country)}
                              className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                              title="Watch Eurovision Performance"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a2.952 2.952 0 0 0-2.075-2.088C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.423.598A2.952 2.952 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.952 2.952 0 0 0 2.075 2.088C4.495 20.5 12 20.5 12 20.5s7.505 0 9.423-.598a2.952 2.952 0 0 0 2.075-2.088C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                                <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            </button>
                          )}
                        </div>
                        {showResults && (
                          <span className={`font-bold ml-2 whitespace-nowrap ${
                            points > 0 ? 'text-white' : 'text-gray-400'
                          }`}>
                            {points} points
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
            <h3 className="text-xl font-bold mb-4 text-white">{selectedCountryName} - Eurovision 2024</h3>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideoId}?hd=1&quality=hd720`}
                title={`${selectedCountryName} Eurovision 2024 Performance`}
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
