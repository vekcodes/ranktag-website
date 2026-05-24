import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ScrollToHash from './components/ScrollToHash.jsx';
import useHubSpotTracking from './hooks/useHubSpotTracking.js';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';

const BacklinkChecker = lazy(() => import('./pages/BacklinkChecker.jsx'));
const PageSpeed = lazy(() => import('./pages/PageSpeed.jsx'));
const DensityDashboard = lazy(() => import('./pages/DensityDashboard.jsx'));
const CompetitorAnalysis = lazy(() => import('./pages/CompetitorAnalysis.jsx'));
const AdminApp = lazy(() => import('./pages/admin/AdminApp.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const BlogPost = lazy(() => import('./pages/BlogPost.jsx'));

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
          <Route path="/domain-authority-checker" element={<BacklinkChecker />} />
          <Route path="/keyword-density-checker" element={<DensityDashboard />} />
          <Route path="/competitor-analysis" element={<CompetitorAnalysis />} />
          <Route path="/page-speed-checker" element={<PageSpeed />} />
          {/* Legacy slug redirects — kept for SEO; server-side 301s also live in vercel.json */}
          <Route path="/backlink-checker" element={<Navigate to="/domain-authority-checker" replace />} />
          <Route path="/keyword-density" element={<Navigate to="/keyword-density-checker" replace />} />
          <Route path="/density" element={<Navigate to="/keyword-density-checker" replace />} />
          <Route path="/competitor" element={<Navigate to="/competitor-analysis" replace />} />
          <Route path="/page-speed" element={<Navigate to="/page-speed-checker" replace />} />
          <Route path="/admin" element={<AdminApp />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
