'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import { eurovision2020DataFinal } from '@/data/eurovision2020';
import { ResultsData } from '@/types/votes';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useDisplayPreferences } from '@/contexts/DisplayPreferencesContext';

const eurovision2020Songs = eurovision2020DataFinal;

export default function Eurovision2020Final() {

  const { data: session, status } = useSession();
  const { preferences } = useDisplayPreferences();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingSave, setPendingSave] = useState(false);
  const pendingKey = 'eurovision2020_final_pending_votes';
  const [selectedCountries, setSelectedCountries] = useState<string[]>(Array(10).fill(''));
  const [showResults, setShowResults] = useState(false); // Toggle for showing results with points
  const [voteConfig, setVoteConfig] = useState({ 
    status: true, 
    showCountDown: '', 
    mode: 'visible', 
    isGM: false 
  });
  const [autoRefreshTimer, setAutoRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedCountryName, setSelectedCountryName] = useState<string>('');
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const infoTooltipRef = useRef<HTMLDivElement>(null);
  const hasLoadedVotesFromDB = useRef(false);
  const previousVotesRef = useRef<string[]>([]);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [pendingClearAction, setPendingClearAction] = useState<(() => void) | null>(null);
  const [clearCountdown, setClearCountdown] = useState(7);
  

  const POINTS = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];
  const firstEmptyIndex = selectedCountries.findIndex((slot) => slot === '');
  const nextAvailablePoints = firstEmptyIndex !== -1 ? POINTS[firstEmptyIndex] : 0;

  

  


  const openYouTubeModal = (country: string) => {
    const songData = eurovision2020Songs[country];
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

  // Fetch vote config
  useEffect(() => {
    async function fetchConfig() {
      try {
        console.log(`[eurovision2020final] Fetching config for year: 202003 Final`);
        console.log(`[eurovision2020final] User authentication status: ${status}`);
        console.log(`[eurovision2020final] User email: ${session?.user?.email || 'Not signed in'}`);
        
        // Add a timestamp to prevent caching issues
        const response = await fetch(`/api/config/vote-config?year=202003&t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`[eurovision2020final] Config API response:`, data);
          console.log(`[eurovision2020final] isGM status: ${data.isGM}`);
          console.log(`[eurovision2020final] Mode setting: ${data.mode}`);
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

  // Countdown effect for clear confirmation
  useEffect(() => {
    if (showClearConfirmation && clearCountdown > 0) {
      const timer = setTimeout(() => {
        setClearCountdown(clearCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showClearConfirmation, clearCountdown]);

  // Update results whenever selectedCountries changes
  useEffect(() => {
    if (results && !loading && selectedCountries.length === 10) {
      // Skip auto-save if this is from loading votes from database
      if (!hasLoadedVotesFromDB.current) {
        console.log('🛑 BLOCKED: Skipping auto-save - votes not yet loaded from database');
        console.log('🛑 Flag status:', hasLoadedVotesFromDB.current);
        console.log('🛑 Selected countries:', selectedCountries);
        return;
      }
      
      // Check if votes actually changed (deep comparison)
      const votesChanged = JSON.stringify(previousVotesRef.current) !== JSON.stringify(selectedCountries);
      if (!votesChanged) {
        console.log('🛑 BLOCKED: Votes unchanged, skipping update');
        console.log('🛑 Previous:', previousVotesRef.current);
        console.log('🛑 Current:', selectedCountries);
        return;
      }
      
      console.log('✅ ALLOWED: useEffect triggered, calling updateResults');
      console.log('✅ Flag status:', hasLoadedVotesFromDB.current);
      console.log('✅ Previous votes:', previousVotesRef.current);
      console.log('✅ New votes:', selectedCountries);
      
      // Update the reference with current votes
      previousVotesRef.current = [...selectedCountries];
      
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
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
      // Silence potential unused-state lint
      void autoRefreshTimer;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults, loading]);

  // On mount, try to resend any pending votes from localStorage
  useEffect(() => {
    const pendingKey = 'eurovision2020_final_pending_votes';

    async function tryResendPending() {
      try {
        const raw = window.localStorage.getItem(pendingKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as { votes: string[]; ts: number };
        if (!parsed || !Array.isArray(parsed.votes)) return;

        console.log('Found pending votes in localStorage, attempting resend');
        const resp = await fetch('/api/votes/202003', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ votes: parsed.votes }),
        });

        if (resp.ok) {
          window.localStorage.removeItem(pendingKey);
          setPendingSave(false);
          console.log('Resent pending votes successfully');
        } else {
          console.warn('Resend of pending votes failed, will keep for later');
          setPendingSave(true);
        }
      } catch {
        console.warn('Error while resending pending votes');
        setPendingSave(true);
      }
    }

    // Try immediately on mount
    tryResendPending();

    // Retry when tab becomes visible again
    function onVisibility() {
      if (document.visibilityState === 'visible') {
        tryResendPending();
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    // On unload, try to send pending using sendBeacon as a last-effort
    function onBeforeUnload() {
      try {
        const raw = window.localStorage.getItem(pendingKey);
        if (!raw) return;
        // Attempt a best-effort send
        if (navigator && 'sendBeacon' in navigator) {
          const url = '/api/votes/202003';
          const blob = new Blob([raw], { type: 'application/json' });
          // best-effort, ignore errors
          navigator.sendBeacon(url, blob);
        }
      } catch {
        // nothing to do - best effort only
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);

  // Close info tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (infoTooltipRef.current && !infoTooltipRef.current.contains(event.target as Node)) {
        setShowInfoTooltip(false);
      }
    }

    if (showInfoTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInfoTooltip]);

  const updateResults = async () => {
    if (!results) return;

    console.log('Updating results with selectedCountries:', selectedCountries);

    // Start with base points (all countries at 0)
    const allCountries = Object.keys(eurovision2020Songs);
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

    // Persist pending vote locally immediately so users leaving the page know it's saved locally
    try {
      window.localStorage.setItem(pendingKey, JSON.stringify({ votes: selectedCountries, ts: Date.now() }));
      setPendingSave(true);
    } catch (e) {
      console.warn('Failed to write pending votes to localStorage', e);
    }

    // Try to send to server (don't block UI). On success clear pending state/localStorage.
    try {
      console.log('Sending votes to API (preserving slot positions):', selectedCountries);
      const response = await fetch('/api/votes/202003', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ votes: selectedCountries }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.warn('Failed to save votes to server:', response.status, errorData);
        // leave pending in localStorage for retry
        setPendingSave(true);
      } else {
        console.log('Votes saved successfully');
        // Clear local pending copy
        try {
          window.localStorage.removeItem(pendingKey);
        } catch (e) {
          console.warn('Failed to remove pending votes from localStorage', e);
        }
        setPendingSave(false);
      }
    } catch (error) {
      console.warn('Error saving votes to server, will retry later:', error);
      setPendingSave(true);
    }
  };

  const fetchFreshResults = async () => {
    try {
      console.log('Fetching fresh results from simple endpoint...');
      const endpoint = '/api/votes/202003/simple';
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
        
        // Handle comma-separated format: "total,12pts,10pts,8pts,..."
        // Extract only the first number (total points) for each country
        if (data.countryPoints) {
          const parsedPoints: { [country: string]: number } = {};
          Object.entries(data.countryPoints).forEach(([country, value]) => {
            if (typeof value === 'string' && value.includes(',')) {
              // Format: "2090,648,430,312,..." - take first number only
              const total = parseInt(value.split(',')[0]);
              parsedPoints[country] = total;
            } else if (typeof value === 'number') {
              parsedPoints[country] = value;
            } else {
              parsedPoints[country] = 0;
            }
          });
          data.countryPoints = parsedPoints;
        }
        
        setResults(data);
        console.log('Fresh results updated from server with totalVotes:', data.totalVotes);
      }
    } catch (error) {
      console.error('Error fetching fresh results:', error);
    }
  };

  const startAutoRefresh = () => {
    // Clear existing timer (use ref as source-of-truth)
    if (autoRefreshTimerRef.current) {
      clearTimeout(autoRefreshTimerRef.current);
      autoRefreshTimerRef.current = null;
    }

    // Start new 60-second timer
    const newTimer = setTimeout(() => {
      fetchFreshResults();
      startAutoRefresh(); // Restart the timer
    }, 60000); // 60 seconds

    // Keep both ref and state in sync (state is kept for debug/visibility only)
    autoRefreshTimerRef.current = newTimer;
    setAutoRefreshTimer(newTimer);
    console.log('Auto-refresh timer started (60 seconds)');
  };

  const resetAutoRefreshTimer = () => {
    if (showResults) {
      console.log('Vote changed - resetting auto-refresh timer');
      startAutoRefresh();
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
      const endpoint = '/api/votes/202003/simple';
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
        
        // Handle comma-separated format: "total,12pts,10pts,8pts,..."
        // Extract only the first number (total points) for each country
        if (data.countryPoints) {
          const parsedPoints: { [country: string]: number } = {};
          Object.entries(data.countryPoints).forEach(([country, value]) => {
            if (typeof value === 'string' && value.includes(',')) {
              // Format: "2090,648,430,312,..." - take first number only
              const total = parseInt(value.split(',')[0]);
              parsedPoints[country] = total;
            } else if (typeof value === 'number') {
              parsedPoints[country] = value;
            } else {
              parsedPoints[country] = 0;
            }
          });
          data.countryPoints = parsedPoints;
        }
        
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
            if (debugData.focus2020?.votesCount > 0) {
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
        const savedShowResults = localStorage.getItem('eurovision2020_final_showResults');
        if (savedShowResults !== null) {
          // Only allow showing results if mode is 'visible' or user is GM
          const shouldShowResults = JSON.parse(savedShowResults);
          
          // Log the decision making process
          console.log(`[eurovision2020final] Saved preference is to ${shouldShowResults ? 'show' : 'hide'} results`);
          console.log(`[eurovision2020final] Current mode: ${voteConfig.mode}, isGM: ${voteConfig.isGM}`);
          
          if (shouldShowResults && voteConfig.mode === 'hide' && !voteConfig.isGM) {
            // Don't show results if mode is hide (unless user is GM)
            // Also clear the localStorage to prevent backdoor access
            setShowResults(false);
            localStorage.removeItem('eurovision2020_final_showResults');
            console.log('[eurovision2020final] Results hidden due to configuration mode: hide, localStorage cleared');
          } else {
            setShowResults(shouldShowResults);
            console.log(`[eurovision2020final] Setting showResults to: ${shouldShowResults}`);
          }
        } else if (voteConfig.mode === 'hide' && !voteConfig.isGM) {
          // If no saved preference exists but mode is hide, ensure results are hidden
          setShowResults(false);
          console.log('[eurovision2020final] No saved preference, mode is hide, results hidden by default');
        }
        
        // Only set selectedCountries if user is authenticated and has votes
        if (session && data.userVote?.votes) {
          // Mark that we've loaded votes from database BEFORE setting state
          // This prevents the useEffect from triggering a save
          hasLoadedVotesFromDB.current = true;
          
          // Create an array of 10 elements with empty strings
          const newSelectedCountries = Array(10).fill('');
          
          // Fill in the votes at their correct positions
          data.userVote.votes.forEach((country: string, index: number) => {
            newSelectedCountries[index] = country;
          });
          
          // Store in previousVotesRef so useEffect knows these are from DB
          previousVotesRef.current = [...newSelectedCountries];
          
          setSelectedCountries(newSelectedCountries);
          console.log('User votes loaded into selectedCountries:', newSelectedCountries);
        } else if (session && !data.userVote) {
          // User is authenticated but has no votes yet - allow saves immediately
          console.log('No existing votes found - user can start voting');
          hasLoadedVotesFromDB.current = true;
          // Set previousVotesRef to empty array
          previousVotesRef.current = Array(10).fill('');
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
    localStorage.setItem('eurovision2020_final_showResults', JSON.stringify(newShowResults));
    
    if (newShowResults) {
      // Start auto-refresh when showing results
      startAutoRefresh();
    } else {
      // Stop auto-refresh when hiding results
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
      if (autoRefreshTimer) {
        setAutoRefreshTimer(null);
      }
      console.log('Auto-refresh timer stopped');
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

  // Helper function to check if removing this country would clear all votes
  const wouldClearAllVotes = (indexToRemove: number): boolean => {
    const remainingVotes = selectedCountries.filter((country, idx) => 
      idx !== indexToRemove && country !== ''
    );
    return remainingVotes.length === 0;
  };

  // Helper function to handle country removal with confirmation
  const handleRemoveCountry = (index: number) => {
    if (wouldClearAllVotes(index)) {
      // Show confirmation dialog
      setPendingClearAction(() => () => {
        const newSelectedCountries = [...selectedCountries];
        newSelectedCountries[index] = '';
        setSelectedCountries(newSelectedCountries);
        resetAutoRefreshTimer();
        setShowClearConfirmation(false);
        setPendingClearAction(null);
        setClearCountdown(7);
      });
      setShowClearConfirmation(true);
      setClearCountdown(7);
    } else {
      // Directly remove if not clearing all votes
      const newSelectedCountries = [...selectedCountries];
      newSelectedCountries[index] = '';
      setSelectedCountries(newSelectedCountries);
      resetAutoRefreshTimer();
    }
  };

  if (loading || status === 'loading') {
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-white mb-0">Oylarım</h2>
          <div className="relative" ref={infoTooltipRef}>
            <button
              onClick={() => setShowInfoTooltip(!showInfoTooltip)}
              className="w-6 h-6 rounded-full bg-red-600 text-white text-base font-bold hover:bg-red-700 transition-colors flex items-center justify-center"
              title="Bilgi"
            >
              i
            </button>
            {showInfoTooltip && (
              <div className="absolute left-0 top-8 z-50 w-80 bg-[#1a2332] border-2 border-red-600 rounded-lg p-4 shadow-xl">
                <button
                  onClick={() => setShowInfoTooltip(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
                <div className="text-sm text-gray-300 space-y-2 pt-2">
                  <p>- &quot;Oylarım&quot; penceresi üzerinde yeşil &quot;Kaydedildi.&quot; yazısını gördüyseniz, oylarınızın kaydedildiğinden %100 emin olabilirsiniz.</p>
                  <p>- Sayfayı yenilediğinizde veya yeniden ziyaret ettiğinizde, mevcut oylarınız sorunsuz bir şekilde &quot;Oylarım&quot; penceresinde görünüyorsa, oylarınızın kaydedildiğinden %100 emin olabilirsiniz.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
        if (String(status) === 'loading') {
          return null; // Don't render while loading
        }
        
        // Debug button visibility decision
        const isGM = voteConfig.isGM === true;
        const isNotHideMode = voteConfig.mode !== 'hide';
        
        // Button should ONLY be shown if user is GM OR mode is not 'hide'
        // Remove the 'isShowingResults' backdoor - don't show button just because results are showing
        const shouldShowButton = isGM || isNotHideMode;
        
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

  // Get all countries from the eurovision2020Songs mapping
  const allCountries = Object.keys(eurovision2020Songs);
  
  // Create array of all countries with their points (including 0 points)
  // Sort alphabetically when results are hidden, by points when shown
  const sortedCountries: [string, number][] = showResults 
    ? allCountries
        .map(country => [country, results.countryPoints[country] || 0] as [string, number])
        .sort(([countryA, pointsA], [countryB, pointsB]) => {
          // First, sort by points (descending)
          if (pointsB !== pointsA) return pointsB - pointsA;
          
          // If points are equal, sort by vote count (descending)
          const voteCountA = results?.countryVoteCounts?.[countryA] || 0;
          const voteCountB = results?.countryVoteCounts?.[countryB] || 0;
          return voteCountB - voteCountA;
        })
    : allCountries
        .map(country => [country, results.countryPoints[country] || 0] as [string, number])
        .sort(([countryA], [countryB]) => countryA.localeCompare(countryB));

  // Bakım modu kontrolü artık middleware tarafından yapılıyor.

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-8">
      <div className="container mx-auto px-4">
        
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Eurovision 2020 Grand Final
        </h1>

        {/* Voting Closed Notice */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-4 mb-6 border-2 border-gray-500 shadow-lg">
          <div className="text-center">
            <h2 className="text-lg md:text-xl font-bold text-white mb-2">
              🔒 Oylama Kapandı / Voting Closed
            </h2>
            <p className="text-gray-300 text-sm">
              Grand final için oylama dönemi sona ermiştir. Oylar artık değiştirilemez ve yeni oy eklenemez. 2020 yılına oy vermek için <a href="/eurovision2020" className="underline text-blue-300 hover:text-blue-500">Eurovision 2020</a> linkine gidin.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              The voting period for grand final has ended. Votes can no longer be modified or added. To vote for the year 2020, visit the <a href="/eurovision2020" className="underline text-blue-300 hover:text-blue-500">Eurovision 2020</a> link.
            </p>
          </div>
        </div>
        
        {session ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-wrap gap-8">
              {/* Oylarım Section - Show voting if authenticated, sign-in prompt if not */}
              <div className="w-full lg:w-[420px]">
                <div className="bg-[#2c3e50] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white mb-0">Oylarım</h2>
                      <div className="relative" ref={infoTooltipRef}>
                        <button
                          onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                          className="w-6 h-6 rounded-full bg-red-600 text-white text-base font-bold hover:bg-red-700 transition-colors flex items-center justify-center"
                          title="Bilgi"
                        >
                          i
                        </button>
                        {showInfoTooltip && (
                          <div className="absolute left-0 top-8 z-50 w-80 bg-[#1a2332] border-2 border-red-600 rounded-lg p-4 shadow-xl">
                            <button
                              onClick={() => setShowInfoTooltip(false)}
                              className="absolute top-2 right-2 text-gray-400 hover:text-white"
                            >
                              ✕
                            </button>
                            <div className="text-sm text-gray-300 space-y-2 pt-2">
                              <p>- &quot;Oylarım&quot; penceresi üzerinde yeşil &quot;Kaydedildi.&quot; yazısını gördüyseniz, oylarınızın kaydedildiğinden %100 emin olabilirsiniz.</p>
                              <p>- Sayfayı yenilediğinizde veya yeniden ziyaret ettiğinizde, mevcut oylarınız sorunsuz bir şekilde &quot;Oylarım&quot; penceresinde görünüyorsa, oylarınızın kaydedildiğinden %100 emin olabilirsiniz.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      {pendingSave ? (
                        <div className="bg-red-600 text-white text-sm px-3 py-1 rounded">Sayfadan ayrılmayın...</div>
                      ) : selectedCountries.some(country => country !== '') ? (
                        <div className="bg-green-700 text-white text-sm px-3 py-1 rounded">Kaydedildi.</div>
                      ) : null}
                    </div>
                  </div>
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
                                          src={`/flags/${selectedCountries[index].replace('&', 'and')}_${eurovision2020Songs[selectedCountries[index]]?.code}.png`}
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
                                      handleRemoveCountry(index);
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
                    
                    // Button should ONLY be shown if user is GM OR mode is not 'hide'
                    // Remove the 'isShowingResults' backdoor - don't show button just because results are showing
                    const shouldShowButton = isGM || isNotHideMode;
                    
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
                {/* Display Preferences */}
                <div className="bg-[#2c3e50] rounded-lg p-6 relative">
                  {/* spoiler overlay removed */}
                  
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {showResults ? (
                      `Sonuçlar (Toplam Kullanıcı: ${results.totalVotes})`
                    ) : (
                      <>
                        <span>Ülkeler (Alfabetik) </span>
                        <span className="text-sm font-normal">
                          | Final Sonuçları için <a href="https://www.youtube.com/@BugraSisman/videos" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">Buğra Şişman YouTube</a> kanalını takip edin.
                        </span>
                      </>
                    )}
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
                                        <div className="flex flex-col items-center min-w-[28px]">
                                          <span className={`text-lg font-bold leading-tight ${
                                            showResults && points > 0 ? 'text-white' : 'text-gray-400'
                                          }`}>
                                            {index + 1}.
                                          </span>
                                          {session && selectedCountries.includes(country) ? (
                                            <span className="text-xs text-gray-400 leading-tight">
                                              #{selectedCountries.indexOf(country) + 1}
                                            </span>
                                          ) : (
                                            <span className="text-xs text-transparent leading-tight">
                                              #0
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      <div className="flex-shrink-0 flex flex-col items-center">
                                        <Image 
                                          src={`/flags/${country.replace('&', 'and')}_${eurovision2020Songs[country]?.code}.png`}
                                          alt={`${country} flag`}
                                          width={24}
                                          height={16}
                                          className={`object-cover rounded ${
                                            !showResults ? 'opacity-60' : ''
                                          }`}
                                        />
                                        {eurovision2020Songs[country]?.youtubeId && (
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
                                        {eurovision2020Songs[country] && (
                                          <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 truncate">
                                              {eurovision2020Songs[country].performer}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate">
                                              {eurovision2020Songs[country].song}
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
                                          {preferences.showWeightPercentage && (

                                            <div className="text-xs text-gray-400">

                                              {(() => {

                                                const denom = (results?.totalVotes || 0) * 12;

                                                if (!denom) return <>0% <strong>Σ</strong></>;

                                                const pct = (points / denom) * 100;

                                                 return <>{pct.toFixed(2)}% <strong>Σ</strong></>;

                                              })()}

                                            </div>

                                          )}
                                          {preferences.showVoterPercentage && results?.countryVoteCounts && results.countryVoteCounts[country] !== undefined && (
                                            <div className="text-xs text-gray-400">
                                              {(() => {
                                                const voteCount = results.countryVoteCounts[country] || 0;
                                                const totalVoters = results.totalVotes || 0;
                                                if (!totalVoters) return (<><span>0%</span> <span className="inline-flex items-center justify-center w-4 h-3 rounded-md bg-yellow-500 text-[10px]">👤</span> <span>0</span></>);
                                                const userPct = (voteCount / totalVoters) * 100;
                                                return (<><span>{userPct.toFixed(1)}%</span> <span className="inline-flex items-center justify-center w-4 h-3 rounded-md bg-yellow-500 text-[10px]">👤</span> <span>{voteCount}</span></>);
                                              })()}
                                            </div>
                                          )}
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
                                        <div className="flex flex-col items-center min-w-[28px]">
                                          <span className={`text-lg font-bold leading-tight ${
                                            showResults && points > 0 ? 'text-white' : 'text-gray-400'
                                          }`}>
                                            {index + Math.ceil(sortedCountries.length / 2) + 1}.
                                          </span>
                                          {session && selectedCountries.includes(country) ? (
                                            <span className="text-xs text-gray-400 leading-tight">
                                              #{selectedCountries.indexOf(country) + 1}
                                            </span>
                                          ) : (
                                            <span className="text-xs text-transparent leading-tight">
                                              #0
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      <div className="flex-shrink-0 flex flex-col items-center">
                                        <Image 
                                          src={`/flags/${country.replace('&', 'and')}_${eurovision2020Songs[country]?.code}.png`}
                                          alt={`${country} flag`}
                                          width={24}
                                          height={16}
                                          className={`object-cover rounded ${
                                            !showResults ? 'opacity-60' : ''
                                          }`}
                                        />
                                        {eurovision2020Songs[country]?.youtubeId && (
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
                                        {eurovision2020Songs[country] && (
                                          <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 truncate">
                                              {eurovision2020Songs[country].performer}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate">
                                              {eurovision2020Songs[country].song}
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
                                          {preferences.showWeightPercentage && (

                                            <div className="text-xs text-gray-400">

                                              {(() => {

                                                const denom = (results?.totalVotes || 0) * 12;

                                                if (!denom) return <>0% <strong>Σ</strong></>;

                                                const pct = (points / denom) * 100;

                                                 return <>{pct.toFixed(2)}% <strong>Σ</strong></>;

                                              })()}

                                            </div>

                                          )}
                                          {preferences.showVoterPercentage && results?.countryVoteCounts && results.countryVoteCounts[country] !== undefined && (
                                            <div className="text-xs text-gray-400">
                                              {(() => {
                                                const voteCount = results.countryVoteCounts[country] || 0;
                                                const totalVoters = results.totalVotes || 0;
                                                if (!totalVoters) return (<><span>0%</span> <span className="inline-flex items-center justify-center w-4 h-3 rounded-md bg-yellow-500 text-[10px]">👤</span> <span>0</span></>);
                                                const userPct = (voteCount / totalVoters) * 100;
                                                return (<><span>{userPct.toFixed(1)}%</span> <span className="inline-flex items-center justify-center w-4 h-3 rounded-md bg-yellow-500 text-[10px]">👤</span> <span>{voteCount}</span></>);
                                              })()}
                                            </div>
                                          )}
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
              <div className="bg-[#2c3e50] rounded-lg p-6 relative">
                  {/* spoiler overlay removed */}
                  
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {showResults ? (
                      `Sonuçlar (Toplam Kullanıcı: ${results.totalVotes})`
                    ) : (
                      <>
                        <span>Ülkeler (Alfabetik) </span>
                        <span className="text-sm font-normal">
                          | Final Sonuçları için <a href="https://www.youtube.com/@BugraSisman/videos" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">Buğra Şişman YouTube</a> kanalını takip edin.
                        </span>
                      </>
                    )}
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
                          <div className="flex-shrink-0 flex flex-col items-center">
                            <Image 
                              src={`/flags/${country.replace('&', 'and')}_${eurovision2020Songs[country]?.code}.png`}
                              alt={`${country} flag`}
                              width={24}
                              height={16}
                              className={`object-cover rounded ${
                                !showResults ? 'opacity-60' : ''
                              }`}
                            />
                            {eurovision2020Songs[country]?.youtubeId && (
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
                            {eurovision2020Songs[country] && (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400 truncate">
                                  {eurovision2020Songs[country].performer}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                  {eurovision2020Songs[country].song}
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
                              {preferences.showWeightPercentage && (

                                <div className="text-xs text-gray-400">

                                  {(() => {

                                    const denom = (results?.totalVotes || 0) * 12;

                                    if (!denom) return <>0% <strong>Σ</strong></>;

                                    const pct = (points / denom) * 100;

                                     return <>{pct.toFixed(2)}% <strong>Σ</strong></>;

                                  })()}

                                </div>

                              )}
                              {preferences.showVoterPercentage && results?.countryVoteCounts && results.countryVoteCounts[country] !== undefined && (
                                <div className="text-xs text-gray-400">
                                  {(() => {
                                    const voteCount = results.countryVoteCounts[country] || 0;
                                    const totalVoters = results.totalVotes || 0;
                                    if (!totalVoters) return (
                                      <>
                                        <span>0%</span> <span className="inline-flex items-center justify-center w-4 h-3 rounded-md bg-yellow-500 text-[10px]">👤</span> <span>0</span>
                                      </>
                                    );
                                    const userPct = (voteCount / totalVoters) * 100;
                                    return (
                                      <>
                                        <span>{userPct.toFixed(1)}%</span> <span className="inline-flex items-center justify-center w-4 h-3 rounded-md bg-yellow-500 text-[10px]">👤</span> <span>{voteCount}</span>
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
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
                          <div className="flex-shrink-0 flex flex-col items-center">
                            <Image 
                              src={`/flags/${country.replace('&', 'and')}_${eurovision2020Songs[country]?.code}.png`}
                              alt={`${country} flag`}
                              width={24}
                              height={16}
                              className={`object-cover rounded ${
                                !showResults ? 'opacity-60' : ''
                              }`}
                            />
                            {eurovision2020Songs[country]?.youtubeId && (
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
                            {eurovision2020Songs[country] && (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400 truncate">
                                  {eurovision2020Songs[country].performer}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                  {eurovision2020Songs[country].song}
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
                              {preferences.showWeightPercentage && (

                                <div className="text-xs text-gray-400">

                                  {(() => {

                                    const denom = (results?.totalVotes || 0) * 12;

                                    if (!denom) return <>0% <strong>Σ</strong></>;

                                    const pct = (points / denom) * 100;

                                     return <>{pct.toFixed(2)}% <strong>Σ</strong></>;

                                  })()}

                                </div>

                              )}
                              {preferences.showVoterPercentage && results?.countryVoteCounts && results.countryVoteCounts[country] !== undefined && (
                                <div className="text-xs text-gray-400">
                                  {(() => {
                                    const voteCount = results.countryVoteCounts[country] || 0;
                                    const totalVoters = results.totalVotes || 0;
                                    if (!totalVoters) return (
                                      <>
                                        <span>0%</span> <span className="inline-flex items-center justify-center w-4 h-3 rounded-md bg-yellow-500 text-[10px]">👤</span> <span>0</span>
                                      </>
                                    );
                                    const userPct = (voteCount / totalVoters) * 100;
                                    return (
                                      <>
                                        <span>{userPct.toFixed(1)}%</span> <span className="inline-flex items-center justify-center w-4 h-3 rounded-md bg-yellow-500 text-[10px]">👤</span> <span>{voteCount}</span>
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
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
            <h3 className="text-xl font-bold mb-4 text-white">{selectedCountryName} - Eurovision 2020</h3>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideoId}?hd=1&quality=hd720`}
                title={`${selectedCountryName} Eurovision 2020 Performance`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Votes Confirmation Modal */}
      {showClearConfirmation && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          onClick={() => {
            setShowClearConfirmation(false);
            setPendingClearAction(null);
          }}
        >
          <div 
            className="bg-[#1a2332] rounded-lg p-6 max-w-md w-full mx-4 relative border-2 border-red-600"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-white">⚠️ Uyarı</h3>
            <p className="text-gray-300 mb-6">
              Veri merkezindeki tüm oyları silmek istediğinizden emin misiniz?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowClearConfirmation(false);
                  setPendingClearAction(null);
                  setClearCountdown(7);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Hayır
              </button>
              <button
                onClick={() => {
                  if (pendingClearAction) {
                    pendingClearAction();
                  }
                }}
                disabled={clearCountdown > 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
              >
                {clearCountdown > 0 ? `Evet (${clearCountdown})` : 'Evet'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


