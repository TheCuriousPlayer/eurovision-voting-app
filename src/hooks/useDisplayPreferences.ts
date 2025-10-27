import { useState, useEffect } from 'react';
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

export function useDisplayPreferences() {
  const [preferences, setPreferences] = useState<DisplayPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from cookie on mount
  useEffect(() => {
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
  }, []);

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

  return {
    preferences,
    toggleWeightPercentage,
    toggleVoterPercentage,
    isLoaded,
  };
}

