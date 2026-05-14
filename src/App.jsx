import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ScrollToHash from './components/ScrollToHash.jsx';
import useHubSpotTracking from './hooks/useHubSpotTracking.js';
import Home from './pages/Home.jsx';

const BacklinkChecker = lazy(() => import('./pages/BacklinkChecker.jsx'));
const PageSpeed = lazy(() => import('./pages/PageSpeed.jsx'));
const DensityDashboard = lazy(() => import('./pages/DensityDashboard.jsx'));
const CompetitorAnalysis = lazy(() => import('./pages/CompetitorAnalysis.jsx'));

function ApplyRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/${search}#apply`} replace />;
}

export default function App() {
  useHubSpotTracking();
  return (
    <>
      <ScrollToHash />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/audit" element={<ApplyRedirect />} />
          <Route path="/technical-audit" element={<ApplyRedirect />} />
          <Route path="/backlink-checker" element={<BacklinkChecker />} />
          <Route path="/keyword-density" element={<DensityDashboard />} />
          <Route path="/density" element={<Navigate to="/keyword-density" replace />} />
          <Route path="/competitor" element={<CompetitorAnalysis />} />
          <Route path="/page-speed" element={<PageSpeed />} />
        </Routes>
      </Suspense>
    </>
  );
}
