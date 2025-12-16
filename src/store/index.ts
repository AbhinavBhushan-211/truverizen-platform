import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

interface AppState {
  currentApp: string | null;
  setCurrentApp: (appId: string | null) => void;
}

// Check if mobile on initial load
const isMobileDevice = () => {
  return typeof window !== 'undefined' && window.innerWidth < 768;
};

// Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'truverizen-auth',
    }
  )
);

// Sidebar Store
export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: !isMobileDevice(),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

// App Store
export const useAppStore = create<AppState>((set) => ({
  currentApp: null,
  setCurrentApp: (appId) => set({ currentApp: appId }),
}));