import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './App.jsx';
import './styles/brand.css';

// Build-time static generation + client hydration. ViteReactSSG owns the render
// (replacing the old ReactDOM.createRoot call) so the marketing/tool routes are
// pre-rendered to real HTML, then hydrated in the browser. Routing concerns live
// in App.jsx (route data) and Layout.jsx (cross-route wrappers).
export const createRoot = ViteReactSSG({
  routes,
  basename: import.meta.env.BASE_URL,
});
