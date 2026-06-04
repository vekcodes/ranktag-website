import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import ScrollToHash from './components/ScrollToHash.jsx';
import useHubSpotTracking from './hooks/useHubSpotTracking.js';

/**
 * Root layout route. Holds the cross-route concerns that used to live in the
 * old <App> wrapper (scroll-to-hash + HubSpot tracking) and renders the matched
 * child route through <Outlet>. Lives at path "/" so every page nests under it.
 *
 * StrictMode is kept here (it previously wrapped the whole app in main.jsx) so
 * the dev-time double-invoke behaviour is unchanged.
 */
export default function Layout() {
  useHubSpotTracking();
  return (
    <React.StrictMode>
      <ScrollToHash />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </React.StrictMode>
  );
}
