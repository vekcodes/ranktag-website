/**
 * Global UI state (Zustand).
 *
 * Keep this minimal. Server state belongs in TanStack Query, not here.
 */
import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface AppState {
  theme: Theme;
  sidebarOpen: boolean;
  setTheme: (t: Theme) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  sidebarOpen: true,
  setTheme: (t) => set({ theme: t }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
