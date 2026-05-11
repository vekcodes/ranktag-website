import { Routes, Route } from 'react-router-dom';
import ScrollToHash from './components/ScrollToHash.jsx';
import Home from './pages/Home.jsx';
import Audit from './pages/Audit.jsx';
import TechnicalAudit from './pages/TechnicalAudit.jsx';
import BacklinkChecker from './pages/BacklinkChecker.jsx';
import KeywordDensity from './pages/KeywordDensity.jsx';
import PageSpeed from './pages/PageSpeed.jsx';
import DensityDashboard from './pages/DensityDashboard.jsx';

export default function App() {
  return (
    <>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/technical-audit" element={<TechnicalAudit />} />
        <Route path="/backlink-checker" element={<BacklinkChecker />} />
        <Route path="/keyword-density" element={<KeywordDensity />} />
        <Route path="/density" element={<DensityDashboard />} />
        <Route path="/page-speed" element={<PageSpeed />} />
      </Routes>
    </>
  );
}
