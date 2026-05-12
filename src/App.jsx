import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ScrollToHash from './components/ScrollToHash.jsx';
import Home from './pages/Home.jsx';
import BacklinkChecker from './pages/BacklinkChecker.jsx';
import PageSpeed from './pages/PageSpeed.jsx';
import DensityDashboard from './pages/DensityDashboard.jsx';
import CompetitorAnalysis from './pages/CompetitorAnalysis.jsx';

/**
 * Permanent redirect that preserves the query string and forces the
 * destination hash — used to retire the old /audit and /technical-audit
 * pages while still landing users on the founder review section.
 */
function ApplyRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/${search}#apply`} replace />;
}

export default function App() {
  return (
    <>
      <ScrollToHash />
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
    </>
  );
}
