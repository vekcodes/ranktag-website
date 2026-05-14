import { useEffect } from 'react';

/**
 * Injects the HubSpot tracking script into <head> if a portal ID is
 * configured at build time. This script is what stitches anonymous
 * tool usage to a contact the moment they submit any form — without
 * it, pre-form sessions stay orphaned in HubSpot.
 *
 * Loads exactly once per page lifetime; safe to call from anywhere.
 */
export default function useHubSpotTracking() {
  useEffect(() => {
    const portalId = import.meta.env.VITE_HUBSPOT_PORTAL_ID;
    if (!portalId) return;
    if (document.getElementById('hs-script-loader')) return;

    // HubSpot serves the tracking script from region-specific CDNs.
    // VITE_HUBSPOT_REGION should be 'na2', 'eu1', etc. Leave empty for na1.
    const region = (import.meta.env.VITE_HUBSPOT_REGION || '').trim();
    const subdomain = region ? `js-${region}` : 'js';

    const s = document.createElement('script');
    s.id = 'hs-script-loader';
    s.async = true;
    s.defer = true;
    s.src = `//${subdomain}.hs-scripts.com/${portalId}.js`;
    document.head.appendChild(s);
  }, []);
}
