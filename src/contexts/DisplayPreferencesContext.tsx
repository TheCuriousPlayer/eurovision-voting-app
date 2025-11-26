'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

export interface DisplayPreferences {
  showWeightPercentage: boolean; // % Σ (Sigma - weight percentage)
  showVoterPercentage: boolean;  // % 👤 (Person emoji - voter percentage)
}

const DEFAULT_PREFERENCES: DisplayPreferences = {
  showWeightPercentage: false, // Hidden by default
  showVoterPercentage: false,  // Hidden by default
};

const COOKIE_NAME = 'eurovision_display_prefs';
const COOKIE_EXPIRY = 365; // days

interface DisplayPreferencesContextType {
  preferences: DisplayPreferences;
  toggleWeightPercentage: () => void;
  toggleVoterPercentage: () => void;
  isLoaded: boolean;
}

const DisplayPreferencesContext = createContext<DisplayPreferencesContextType | undefined>(undefined);

export function DisplayPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<DisplayPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Mark as mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load preferences from cookie on mount
  useEffect(() => {
    if (!isMounted) return;
    
    const savedPrefs = Cookies.get(COOKIE_NAME);
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferences({
          showWeightPercentage: parsed.showWeightPercentage ?? DEFAULT_PREFERENCES.showWeightPercentage,
          showVoterPercentage: parsed.showVoterPercentage ?? DEFAULT_PREFERENCES.showVoterPercentage,
        });
      } catch (error) {
        console.error('Failed to parse display preferences:', error);
        setPreferences(DEFAULT_PREFERENCES);
      }
    }
    setIsLoaded(true);
  }, [isMounted]);

  // Save preferences to cookie whenever they change
  useEffect(() => {
    if (isLoaded) {
      Cookies.set(COOKIE_NAME, JSON.stringify(preferences), { expires: COOKIE_EXPIRY });
    }
  }, [preferences, isLoaded]);

  const toggleWeightPercentage = () => {
    setPreferences(prev => ({
      ...prev,
      showWeightPercentage: !prev.showWeightPercentage,
    }));
  };

  const toggleVoterPercentage = () => {
    setPreferences(prev => ({
      ...prev,
      showVoterPercentage: !prev.showVoterPercentage,
    }));
  };

  return (
    <DisplayPreferencesContext.Provider
      value={{
        preferences,
        toggleWeightPercentage,
        toggleVoterPercentage,
        isLoaded,
      }}
    >
      {children}
    </DisplayPreferencesContext.Provider>
  );
}

export function useDisplayPreferences() {
  const context = useContext(DisplayPreferencesContext);
  if (context === undefined) {
    throw new Error('useDisplayPreferences must be used within a DisplayPreferencesProvider');
  }
  return context;
}

