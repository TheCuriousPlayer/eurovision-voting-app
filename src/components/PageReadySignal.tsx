'use client';

import { useEffect } from 'react';

/**
 * Drop this component inside any page's main return (after all loading guards).
 * When it mounts it dispatches a 'page-ready' event so EurovisionNavigation knows
 * the real content is painted and view-transition enter animations can start.
 */
export default function PageReadySignal() {
  useEffect(() => {
    document.dispatchEvent(new CustomEvent('page-ready'));
  }, []);
  return null;
}
