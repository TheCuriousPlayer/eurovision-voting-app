'use client';


import { formatNumber } from '@/utils/formatNumber';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { ResultsData } from '@/types/votes';
import { useDisplayPreferences } from '@/contexts/DisplayPreferencesContext';
import EurovisionNavigation from '@/components/EurovisionNavigation';
import PageReadySignal from '@/components/PageReadySignal';

const eurovision2026GrandFinalSongs: { [key: string]: { code: string; performer: string; song: string; youtubeId: string; color?: string } } = {
  'Albania': { code: 'AL', performer: 'Alis', song: 'Nân', youtubeId: 'b9AdRrA554o' },
// 'Andorra': { code: 'AD', performer: '', song: '', youtubeId: '' },
  'Armenia': { code: 'AM', performer: 'Simón', song: 'Paloma Rumba', youtubeId: '5EXoK-lgocw', color: '#ff2200' },
  'Australia': { code: 'AU', performer: 'Delta Goodrem', song: 'Eclipse', youtubeId: 'EUMCr1pnaMY' },
  'Austria': { code: 'AT', performer: 'Cosmó', song: 'Tanzschein', youtubeId: 'zPGP9ZphxiY' },
  'Azerbaijan': { code: 'AZ', performer: 'Jiva', song: 'Just Go', youtubeId: 'iMDBPe25JhM', color: '#ff2200' },
// 'Belarus': { code: 'BY', performer: '', song: '', youtubeId: '' },
  'Belgium': { code: 'BE', performer: 'Essyla', song: 'Dancing on the Ice', youtubeId: '9sfI4g6DWTU' },
// 'Bosnia & Herzegovina': { code: 'BA', performer: '', song: '', youtubeId: '' },
  'Bulgaria': { code: 'BG', performer: 'Dara', song: 'Bangaranga', youtubeId: '_pkC9J6BPFY' },
  'Croatia': { code: 'HR', performer: 'Lelek', song: 'Andromeda', youtubeId: 'vl7Jqnw10sU' },
  'Czechia': { code: 'CZ', performer: 'Daniel Zizka', song: 'Crossroads', youtubeId: '6ea25aRGpLo' },
  'Denmark': { code: 'DK', performer: 'Søren Torpegaard Lund', song: 'Før vi går hjem', youtubeId: 'xKzEP9dwoss' },
  'Estonia': { code: 'EE', performer: 'Vanilla Ninja', song: 'Too Epic to Be True', youtubeId: 'lOiWuol3t3o', color: '#ff2200' },
  'Finland': { code: 'FI', performer: 'Linda Lampenius & Pete Parkkonen', song: 'Liekinheitin', youtubeId: '9bfwNIYb96Q' },
  'France': { code: 'FR', performer: 'Monroe', song: 'Regarde !', youtubeId: 'ujoCYrvvTYQ' },
  'Georgia': { code: 'GE', performer: 'Bzikebi', song: 'On Replay', youtubeId: 'coh-lygCINY', color: '#ff2200' },
  'Germany': { code: 'DE', performer: 'Sarah Engels', song: 'Fire', youtubeId: 'AzvRc3eH_rA' },
  'Greece': { code: 'GR', performer: 'Akylas', song: 'Ferto', youtubeId: 'NGwNTd_DA9s' },
// 'Hungary': { code: 'HU', performer: '', song: '', youtubeId: '' },
// 'Iceland': { code: 'IS', performer: '', song: '', youtubeId: '' },
// 'Ireland': { code: 'IE', performer: '', song: '', youtubeId: '' },
  'Israel': { code: 'IL', performer: 'Noam Bettan', song: 'Michelle', youtubeId: 'xWCnWSoG8nI' },
  'Italy': { code: 'IT', performer: 'Sal Da Vinci', song: 'Per sempre sì', youtubeId: 'V406FAGkhyQ' },
  'Latvia': { code: 'LV', performer: 'Atvara', song: 'Ēnā', youtubeId: '6C2ivaB5D00', color: '#ff2200' },
  'Lithuania': { code: 'LT', performer: 'Lion Ceccah', song: 'Sólo quiero más', youtubeId: '0H-PXnbhG7A' },
  'Luxembourg': { code: 'LU', performer: 'Eva Marija', song: 'Mother Nature', youtubeId: 'DmVfJSRqgnI', color: '#ff2200' },
  'Malta': { code: 'MT', performer: 'Aidan', song: 'Bella', youtubeId: 'CW6mQLBh6Js' },
  'Moldova': { code: 'MD', performer: 'Satoshi', song: 'Viva, Moldova!', youtubeId: 'SViojHjNSzc' },
// 'Monaco': { code: 'MC', performer: '', song: '', youtubeId: '' },
  'Montenegro': { code: 'ME', performer: 'Tamara Živković', song: 'Nova zora', youtubeId: 'nuvy2d60HbI', color: '#ff2200' },
// 'Netherlands': { code: 'NL', performer: '', song: '', youtubeId: '' },
// 'North Macedonia': { code: 'MK', performer: '', song: '', youtubeId: '' },
  'Norway': { code: 'NO', performer: 'Jonas Lovv', song: 'Ya Ya Ya', youtubeId: 'MasllzWk_bQ' },
  'Poland': { code: 'PL', performer: 'Alicja', song: 'Pray', youtubeId: 'q78cnYIoF9Y' },
  'Portugal': { code: 'PT', performer: 'Bandidos do Cante', song: 'Rosa', youtubeId: 'jyHaE6GqaaQ', color: '#ff2200' },
  'Romania': { code: 'RO', performer: 'Alexandra Căpitănescu', song: 'Choke Me', youtubeId: 'JrSl0sTX5W4' },
// 'Russia': { code: 'RU', performer: '', song: '', youtubeId: '' },
  'San Marino': { code: 'SM', performer: 'Senhit', song: 'Superstar', youtubeId: 'wOQe-fQSFxg', color: '#ff2200' },
  'Serbia': { code: 'RS', performer: 'Lavina', song: 'Kraj mene', youtubeId: 'FJTLKBOOE98' },
// 'Serbia Montenegro': { code: 'RM', performer: '', song: '', youtubeId: '' },
// 'Slovakia': { code: 'SK', performer: '', song: '', youtubeId: '' },
// 'Slovenia': { code: 'SI', performer: '', song: '', youtubeId: '' },
  'Southern Cyprus': { code: 'CY', performer: 'Antigoni', song: 'Jalla', youtubeId: 'TzSs51BiQrE' },
// 'Spain': { code: 'ES', performer: '', song: '', youtubeId: '' },
  'Sweden': { code: 'SE', performer: 'Felicia', song: 'My System', youtubeId: 'ibbfS8iG450' },
  'Switzerland': { code: 'CH', performer: 'Veronica Fusaro', song: 'Alice', youtubeId: 'PfpYGAzW5dM', color: '#ff2200' },
// 'Türkiye': { code: 'TR', performer: '', song: '', youtubeId: '' },
  'Ukraine': { code: 'UA', performer: 'Leléka', song: 'Ridnym', youtubeId: 'SoEXezpblAc' },
  'United Kingdom': { code: 'GB', performer: 'Look Mum No Computer', song: 'Eins, zwei, drei', youtubeId: 'niMKvJ-Itq8' },
// 'Yugoslavia': { code: 'YU', performer: '', song: '', youtubeId: '' }
};

export default function Eurovision2026GrandFinal() {
  // Current time state for testing middleware redirect
  // (Removed unused currentTime state and timer)
  
  const { data: session, status } = useSession();
  const { preferences } = useDisplayPreferences();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(Array(10).fill(''));
  const [showResults, setShowResults] = useState(true); // always on — per-card reveal via isRevealed
  const [showTwelvePointsRanking, setShowTwelvePointsRanking] = useState(false);
  const [revealedResults, setRevealedResults] = useState<Record<string, boolean>>({});
  const [glowingCard, setGlowingCard] = useState<string | null>(null);
  const [fadingCard, setFadingCard] = useState<string | null>(null);
  const glowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastRevealedRef = useRef<string | null>(null);
  const toggleRevealResult = (country: string) => {
    const willReveal = !revealedResults[country];
    if (willReveal) {
      lastRevealedRef.current = country;
      // Clear any existing timers
      if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      setFadingCard(null);
      setGlowingCard(country);
      // After 5s switch to fade-out animation
      glowTimerRef.current = setTimeout(() => {
        setGlowingCard(null);
        setFadingCard(country);
        // After fade-out animation completes (1.5s), clean up
        fadeTimerRef.current = setTimeout(() => setFadingCard(null), 1500);
      }, 5000);
    }
    setRevealedResults((prev) => ({
      ...prev,
      [country]: !prev[country],
    }));
  };
  const isRevealed = (country: string) => !!revealedResults[country];
  const [voteConfig, setVoteConfig] = useState({ 
    status: true, 
    showCountDown: '', 
    mode: 'visible', 
    isGM: false 
  });
  const [autoRefreshTimer, setAutoRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  // Use a ref to hold the live timer so cleanup on unmount always sees the current timer
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  // keep a no-op reference so linters don't complain about unused state variable
  void autoRefreshTimer;
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedCountryName, setSelectedCountryName] = useState<string>('');
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const infoTooltipRef = useRef<HTMLDivElement>(null);
  const [pendingSave, setPendingSave] = useState(false);
  const previousVotesRef = useRef<string[]>([]); // Removed: lastSavedAt
  const hasLoadedVotesFromDB = useRef(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [pendingClearAction, setPendingClearAction] = useState<(() => void) | null>(null);
  const [clearCountdown, setClearCountdown] = useState(7);

  // Points mapping for slots (index 0 -> 12 points, index 1 -> 10 points, ...)
  const POINTS = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];
  // VOTING CLOSED: hardcoded, all users cannot change/swap/remove votes
  const votingClosed = true;
  const firstEmptyIndex = selectedCountries.findIndex((slot) => slot === '');
  const nextAvailablePoints = firstEmptyIndex !== -1 ? POINTS[firstEmptyIndex] : 0;

  const openYouTubeModal = (country: string) => {
    const songData = eurovision2026GrandFinalSongs[country];
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
        console.log(`[Eurovision2026GrandFinal] Fetching config for year: 202600`);
        console.log(`[Eurovision2026GrandFinal] User authentication status: ${status}`);
        console.log(`[Eurovision2026GrandFinal] User email: ${session?.user?.email || 'Not signed in'}`);
        
        // Add a timestamp to prevent caching issues
        const response = await fetch(`/api/config/vote-config?year=202600&t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`[Eurovision2026GrandFinal] Config API response:`, data);
          console.log(`[Eurovision2026GrandFinal] isGM status: ${data.isGM}`);
          console.log(`[Eurovision2026GrandFinal] Mode setting: ${data.mode}`);
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

  // Scroll to newly revealed card after sort re-renders
  useEffect(() => {
    const country = lastRevealedRef.current;
    if (!country || !revealedResults[country]) return;
    const el = cardRefs.current[country];
    if (!el) return;

    const smoothScrollTo = (targetY: number, duration: number) => {
      const startY = window.scrollY;
      const distance = targetY - startY;
      const startTime = performance.now();

      const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        window.scrollTo(0, startY + distance * easeInOutQuad(progress));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    // Defer until after DOM re-sort paint
    const id = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2;
      smoothScrollTo(targetY, 1900);
      lastRevealedRef.current = null;
    }, 100);
    return () => clearTimeout(id);
  }, [revealedResults]);

  // Start auto-refresh if showResults is enabled
  useEffect(() => {
    if (showResults && !loading) {
      startAutoRefresh();
    }

    // Cleanup timer on unmount (always refer to ref.current so we clear the latest timer)
    return () => {
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults, loading]);

  // On mount, try to resend any pending votes from localStorage
  useEffect(() => {
    const pendingKey = 'eurovision2026GrandFinal_pending_votes';

    async function tryResendPending() {
      if (votingClosed) {
        console.log('🔒 Voting closed - skipping pending vote resend');
        return;
      }
      try {
        const raw = window.localStorage.getItem(pendingKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as { votes: string[]; ts: number };
        if (!parsed || !Array.isArray(parsed.votes)) return;

        console.log('Found pending votes in localStorage (2026GrandFinal), attempting resend');
        const resp = await fetch('/api/votes/202600', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ votes: parsed.votes }),
        });

        if (resp.ok) {
          window.localStorage.removeItem(pendingKey);
          setPendingSave(false);
          console.log('Resent pending votes successfully (2026GrandFinal)');
        } else {
          console.warn('Resend of pending votes failed (2026GrandFinal), will keep for later');
          setPendingSave(true);
        }
      } catch {
        console.warn('Error while resending pending votes (2026GrandFinal)');
        setPendingSave(true);
      }
    }

    tryResendPending();

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        tryResendPending();
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    function onBeforeUnload() {
      if (votingClosed) {
        console.log('🔒 Voting closed - skipping sendBeacon');
        return;
      }
      try {
        const raw = window.localStorage.getItem(pendingKey);
        if (!raw) return;
        if (navigator && 'sendBeacon' in navigator) {
          const url = '/api/votes/202600';
          const blob = new Blob([raw], { type: 'application/json' });
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

    if (votingClosed) {
      console.log('🔒 Voting closed - updateResults blocked (no server write)');
      return;
    }

    console.log('Updating results with selectedCountries:', selectedCountries);

    // Start with base points (all countries at 0)
    const allCountries = Object.keys(eurovision2026GrandFinalSongs);
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
      window.localStorage.setItem('eurovision2026GrandFinal_pending_votes', JSON.stringify({ votes: selectedCountries, ts: Date.now() }));
      setPendingSave(true);
    } catch (e) {
      console.warn('Failed to write pending votes to localStorage (2026GrandFinal)', e);
    }

    // Try to send to server (don't block UI). On success clear pending state/localStorage.
    try {
      console.log('Sending votes to API (preserving slot positions):', selectedCountries);
      const response = await fetch('/api/votes/202600', {
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
          window.localStorage.removeItem('eurovision2026GrandFinal_pending_votes');
        } catch (e) {
          console.warn('Failed to remove pending votes from localStorage (2026GrandFinal)', e);
        }
        setPendingSave(false);
      }
    } catch (error) {
      console.warn('Error saving votes to server, will retry later (2026GrandFinal):', error);
      setPendingSave(true);
    }
  };

  const fetchFreshResults = async () => {
    try {
      console.log('Fetching fresh results from simple endpoint...');
      const endpoint = '/api/votes/202600/simple';
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
      // Auto-refresh timer intentionally disabled for now.
      // Re-enable by restoring the timer setup below.
    if (autoRefreshTimerRef.current) {
      clearTimeout(autoRefreshTimerRef.current);
      autoRefreshTimerRef.current = null;
    }

      setAutoRefreshTimer(null);

      /*
      // Start new 60-second timer
      const newTimer = setTimeout(() => {
        fetchFreshResults();
        startAutoRefresh(); // Restart the timer
      }, 60000); // 60 seconds

      // store both in ref and state (state kept for backwards compat / debugging)
      autoRefreshTimerRef.current = newTimer;
      setAutoRefreshTimer(newTimer);
      console.log('Auto-refresh timer started (60 seconds)');
      */
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
    if (votingClosed) {
      console.log('Voting closed - add ignored');
      return;
    }
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
    if (votingClosed) {
      console.log('Voting closed - remove ignored');
      return;
    }
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

  const handleDragEnd = (result: { source: { droppableId: string }; destination: { droppableId: string } | null; draggableId: string }) => {
    if (!result.destination) return;

    if (votingClosed) {
      console.log('Voting closed - drag ignored');
      return;
    }

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
      const endpoint = '/api/votes/202600/simple';
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
        console.log('Results state set with totalVotes:', data.totalVotes);
        
        // Load user's show results preference from localStorage (for both auth and unauth users)
        const savedShowResults = localStorage.getItem('eurovision2026GrandFinal_showResults');
        if (savedShowResults !== null) {
          setShowResults(JSON.parse(savedShowResults));
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
        } else if (!data.userVote) {
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
    if (!newShowResults) {
      setShowTwelvePointsRanking(false);
    }
    localStorage.setItem('eurovision2026GrandFinal_showResults', JSON.stringify(newShowResults));
    
    if (newShowResults) {
      // Start auto-refresh when showing results
      startAutoRefresh();
    } else {
      // Stop auto-refresh when hiding results
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
      setAutoRefreshTimer(null);
      console.log('Auto-refresh timer stopped');
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


  // Get all countries from the eurovision2026GrandFinalSongs mapping
  const allCountries = Object.keys(eurovision2026GrandFinalSongs);
  const twelvePointsAvailable = !!results.detailedResults;

  const getTwelvePointsTotal = (country: string): number => {
    const breakdown = results.detailedResults?.[country];
    if (!breakdown) return 0;
    const parts = breakdown.split(',').map(part => parseInt(part, 10));
    return parts.length > 1 && !Number.isNaN(parts[1]) ? parts[1] : 0;
  };

  // Revealed countries float to top sorted by points desc; unrevealed stay alphabetical at bottom
  const sortedCountries: [string, number][] = (() => {
    const revealed: [string, number][] = [];
    const unrevealed: [string, number][] = [];
    allCountries.forEach(country => {
      if (isRevealed(country)) {
        revealed.push([country, results.countryPoints[country] || 0]);
      } else {
        unrevealed.push([country, 0]);
      }
    });
    revealed.sort(([, a], [, b]) => b - a);
    unrevealed.sort(([a], [b]) => a.localeCompare(b));
    return [...revealed, ...unrevealed];
  })();

  // Keep no-op references so linters don't flag helpers as unused.
  void hasEmptySlots;
  void addCountryToFirstEmptySlot;
  void handleDragEnd;
  void pendingSave;
  void autoRefreshTimer;
  void showResults;
  void showTwelvePointsRanking;

  const revealedCount = sortedCountries.filter(([c]) => isRevealed(c)).length;
  const maxPoints = revealedCount > 0 ? Math.max(sortedCountries[0][1], 1) : 1;

  const getFlagUrl = (country: string) => {
    const code = eurovision2026GrandFinalSongs[country]?.code;
    return `/flags/${country}_${code}.png`;
  };

  const getMedalStyle = (rank: number, hasResults: boolean) => {
    if (!hasResults) return { badge: 'bg-white/10 text-gray-500', border: 'border-white/10', glow: '', bar: 'bg-blue-500' };
    if (rank === 1) return { badge: 'bg-yellow-0 text-yellow-900', border: 'border-yellow-500/60', glow: 'shadow-yellow-500/25', bar: 'bg-yellow-400' };
    if (rank === 2) return { badge: 'bg-gray-0 text-gray-800', border: 'border-gray-300/40', glow: 'shadow-gray-300/15', bar: 'bg-gray-300' };
    if (rank === 3) return { badge: 'bg-amber-0 text-amber-100', border: 'border-amber-600/40', glow: 'shadow-amber-500/15', bar: 'bg-amber-500' };
    if (rank <= 10) return { badge: 'bg-blue-900/60 text-blue-300', border: 'border-blue-500/20', glow: '', bar: 'bg-blue-400' };
    return { badge: 'bg-white/5 text-gray-500', border: 'border-white/8', glow: '', bar: 'bg-slate-500' };
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #05051a 0%, #0c0c2e 35%, #120a35 60%, #07071e 100%)' }}
    >
      <PageReadySignal />
      <style>{`
        @keyframes revealGlow {
          from { box-shadow: 0 0 0 2px rgba(250,204,21,0.6), 0 0 24px 6px rgba(250,204,21,0.35), 0 0 48px 12px rgba(250,204,21,0.15); }
          to   { box-shadow: 0 0 0 2px rgba(250,204,21,0.9), 0 0 36px 12px rgba(250,204,21,0.55), 0 0 72px 20px rgba(250,204,21,0.25); }
        }
        @keyframes fadeOutGlow {
          from { box-shadow: 0 0 0 2px rgba(250,204,21,0.7), 0 0 30px 8px rgba(250,204,21,0.45), 0 0 60px 16px rgba(250,204,21,0.2); border-color: rgba(250,204,21,0.7); }
          to   { box-shadow: 0 0 0 0 transparent; border-color: rgba(255,255,255,0.06); }
        }
        @keyframes skyBlink {
          0%, 100% { opacity: 0.04; }
          40% { opacity: 0.12; }
          70% { opacity: 0.08; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.12; transform: scale(0.95); }
          50% { opacity: 0.9; transform: scale(1.25); }
        }
      `}</style>

      {/* Animated background stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 28% 22%, rgba(168, 212, 255, 0.12), transparent 22%), radial-gradient(circle at 80% 30%, rgba(184, 98, 255, 0.08), transparent 18%)',
            animation: 'skyBlink 18s ease-in-out infinite',
          }}
        />
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.4 + 0.08,
              animation: `twinkle ${Math.random() * 2 + 2}s ease-in-out infinite`,
              animationDelay: Math.random() * 4 + 's',
            }}
          />
        ))}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, #4169E1 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-2/3 left-1/4 w-[400px] h-[300px] rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, #7c3aed 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 pb-20 pt-4">
        <EurovisionNavigation currentPage="2026-preview" />

        {/* Hero Header */}
        <div className="text-center py-10 select-none">
          <div className="text-yellow-400 text-xs tracking-[0.4em] uppercase mb-3 opacity-80">
            Eurovision Song Contest
          </div>
          <h1
            className="text-6xl md:text-8xl font-black text-white mb-1 leading-none"
            style={{ textShadow: '0 0 60px rgba(255,215,0,0.25), 0 0 120px rgba(65,105,225,0.2)' }}
          >
            2026
          </h1>
          <h2
            className="text-2xl md:text-3xl font-bold tracking-[0.2em] mb-5"
            style={{ color: '#FFD700', textShadow: '0 0 30px rgba(255,215,0,0.4)' }}
          >
            GRAND FINAL PREVIEW RESULTS
          </h2>
          <div className="flex items-center justify-center gap-4 text-gray-500 text-xs tracking-widest">
            <span>✦</span>
            <span>Vienna, Austria</span>
            <span>✦</span>
            <span>17 Mayıs 2026</span>
            <span>✦</span>
          </div>
        </div>

        <div className="mx-auto mb-8 w-full max-w-3xl rounded-3xl border border-cyan-500/20 bg-cyan-950/10 p-5 text-left shadow-xl shadow-cyan-500/10 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300 mb-2">
              Yeni Oylama Sistemi Tanıtımı
            </p>
            <p className="text-sm text-gray-300">
              Bu sayfa, yeni YouTube yorumlarıyla oy kaydetme sürecini adım adım gösterir.
            </p>
          </div>
          <a
            href="/eurovisionNewVotingSystem"
            className="inline-flex rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-black transition hover:bg-cyan-400"
          >
            Tanıtımı Gör
          </a>
        </div>

        {/* Control Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={() => {
              const all: Record<string, boolean> = {};
              allCountries.forEach((c) => { all[c] = true; });
              setRevealedResults(all);
            }}
            className="px-4 py-2.5 rounded-full text-sm bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-300"
          >
            ✨ Tümünü Aç
          </button>
          <button
            onClick={() => setRevealedResults({})}
            className="px-4 py-2.5 rounded-full text-sm bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-300"
          >
            🙈 Tümünü Gizle
          </button>
        </div>

        {/* Stats pill */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/15 rounded-full px-6 py-2 text-sm text-gray-400">
            Toplam{' '}
            <span className="text-white font-bold">{formatNumber(results.totalVotes)}</span>{' '}
            oy • Sonuçları görmek için ülke kartlarına tıkla.
          </div>
        </div>

        {/* Country cards */}
        <div className="max-w-2xl mx-auto space-y-2">
          {sortedCountries.map(([country, points], index) => {
            const rank = index + 1;
            const song = eurovision2026GrandFinalSongs[country];
            const flagUrl = getFlagUrl(country);
            const revealed = isRevealed(country);
            const barWidth = revealed && maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;
            const medal = getMedalStyle(rank, revealed);
            const isTop3 = revealed && rank <= 3;

            const isGlowing = glowingCard === country;
            const isFading = fadingCard === country;

            return (
              <div
                key={country}
                ref={(el) => { cardRefs.current[country] = el; }}
                onClick={() => toggleRevealResult(country)}
                className={`flex items-center gap-3 rounded-xl border ${isGlowing ? 'border-yellow-400/80' : isFading ? 'border-yellow-400/80' : medal.border} bg-white/4 backdrop-blur-sm shadow-lg ${medal.glow ? `shadow-lg ${medal.glow}` : ''} overflow-hidden cursor-pointer hover:bg-white/8 active:scale-[0.99] ${isTop3 ? 'p-3.5' : 'p-2.5'} ${!isGlowing && !isFading ? 'transition-all duration-300' : ''}`}
                style={isGlowing ? {
                  boxShadow: '0 0 0 2px rgba(250,204,21,0.6), 0 0 24px 6px rgba(250,204,21,0.35), 0 0 48px 12px rgba(250,204,21,0.15)',
                  animation: 'revealGlow 1s ease-in-out infinite alternate',
                } : isFading ? {
                  animation: 'fadeOutGlow 1.5s ease-out forwards',
                } : isTop3 ? { boxShadow: `0 0 20px ${rank === 1 ? 'rgba(255,215,0,0.12)' : rank === 2 ? 'rgba(200,200,200,0.08)' : 'rgba(205,127,50,0.1)'}` } : undefined}
              >
                {/* Rank badge */}
                <div
                  className={`flex-shrink-0 ${isTop3 ? 'w-11 h-11 text-[50px]' : 'w-9 h-9 text-sm'} flex items-center justify-center rounded-full font-bold ${medal.badge}`}
                >
                  {revealed
                    ? rank === 1 ? '🏆' : rank === 2 ? '💎' : rank === 3 ? '🔥' : rank
                    : index - revealedCount + 1}
                </div>

                {/* Flag */}
                <div className={`flex-shrink-0 overflow-hidden rounded shadow-md ${isTop3 ? 'w-14 h-9' : 'w-12 h-8'}`}>
                  <img
                    src={flagUrl}
                    alt={country}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '0';
                    }}
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-bold leading-tight truncate ${isTop3 ? 'text-base' : 'text-sm'} ${
                      revealed && points > 0 ? 'text-white' : 'text-gray-300'
                    }`}
                    style={song?.color ? { color: song.color } : undefined}
                  >
                    {country}
                  </div>
                  {song && (
                    <div className="text-xs text-gray-500 truncate">
                      {song.performer}
                      {song.song && (
                        <span className="text-gray-600"> · {song.song}</span>
                      )}
                    </div>
                  )}
                  {/* Progress bar */}
                  {revealed && barWidth > 0 && (
                    <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${medal.bar}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Points */}
                <div className="flex-shrink-0 text-right min-w-[80px]">
                  {revealed ? (
                    <div className="space-y-0.5">
                      <div
                        className={`font-black leading-tight ${isTop3 ? 'text-xl' : 'text-lg'} ${
                          points > 0
                            ? rank === 1
                              ? 'text-yellow-400'
                              : rank === 2
                              ? 'text-gray-300'
                              : rank === 3
                              ? 'text-amber-500'
                              : 'text-white'
                            : 'text-gray-600'
                        }`}
                      >
                        {formatNumber(points)} Points
                      </div>
                      {(() => {
                        const denom = (results.totalVotes || 0) * 12;
                        const pct = denom ? (points / denom) * 100 : 0;
                        return <div className="text-xs text-gray-600">{pct.toFixed(2)}% Σ</div>;
                      })()}
                      {(() => {
                        const voteCount = results.countryVoteCounts?.[country] || 0;
                        const totalVoters = results.totalVotes || 0;
                        const userPct = totalVoters ? (voteCount / totalVoters) * 100 : 0;
                        return (
                          <div className="text-xs text-gray-600">
                            {userPct.toFixed(1)}%{' '}
                            <span className="inline-flex items-center justify-center w-3.5 h-3 rounded bg-yellow-500/80 text-[9px] leading-none">👤</span>{' '}
                            {formatNumber(voteCount)}
                          </div>
                        );
                      })()}
                      {twelvePointsAvailable && (
                        <div className="text-xs text-gray-600">
                          {formatNumber(Math.round(getTwelvePointsTotal(country) / 12))} × 12 Points
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-end">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full border border-white/15 text-gray-600 text-base font-bold select-none animate-pulse">
                        ?
                      </div>
                    </div>
                  )}
                </div>

                {/* Play button */}
                {song?.youtubeId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openYouTubeModal(country);
                    }}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-red-600/70 hover:bg-red-500 text-white transition-colors"
                    title={`${country} — ${song.song}`}
                    aria-label={`Play ${country}`}
                  >
                    <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* YouTube Video Modal */}
      {showYouTubeModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/75 backdrop-blur-sm"
          onClick={closeYouTubeModal}
        >
          <div
            className="bg-[#0d0d2e] rounded-2xl p-6 max-w-4xl w-full mx-4 relative border border-white/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeYouTubeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              aria-label="Kapat"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-4 text-white">{selectedCountryName} — Eurovision 2026 Grand Final</h3>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideoId}?hd=1&quality=hd720`}
                title={`${selectedCountryName} Eurovision 2026 Grand Final`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
