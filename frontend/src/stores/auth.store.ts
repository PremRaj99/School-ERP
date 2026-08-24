import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfileResponse } from '@schoolerp/contracts';
import { authService } from '@/lib/services/auth.service';

/**
 * The real source of truth for "am I logged in" is the httpOnly `access_token`/`refresh_token`
 * cookies — this store can never read them, only infer their state from `GET /user` succeeding or
 * 401ing. The persisted `user` is a cache to avoid a loading flash on every navigation; it's wrong
 * exactly as often as the cookie has expired since the last hydrate, which `hydrate()` (called once
 * at app boot, see `Providers`) and any 401 (see `lib/api.ts`'s interceptor calling `clear()`)
 * correct. Route guards (`components/layout/route-wrappers.tsx`) are what actually enforce
 * anything — this store on its own is not a security boundary (ALIGNMENT_PLAN.md Phase 4, fixing
 * Part 0.5/A1: route wrappers previously did no auth check at all).
 */
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: UserProfileResponse | null;
  status: AuthStatus;
  /** Runs once at app boot (see Providers). Safe to call more than once — no-ops while loading. */
  hydrate: () => Promise<void>;
  setUser: (user: UserProfileResponse) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      status: 'idle',

      hydrate: async () => {
        if (get().status === 'loading') return;
        set({ status: 'loading' });
        try {
          const user = await authService.getUser();
          set({ user, status: 'authenticated' });
        } catch {
          set({ user: null, status: 'unauthenticated' });
        }
      },

      setUser: (user) => set({ user, status: 'authenticated' }),

      clear: () => set({ user: null, status: 'unauthenticated' }),
    }),
    {
      name: 'schoolerp-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

export const roleHomePath = (role: UserProfileResponse['role']): string => {
  switch (role) {
    case 'Admin':
      return '/admin/dashboard';
    case 'Teacher':
      return '/teacher/dashboard';
    case 'Student':
      return '/student/dashboard';
    case 'Finance':
      return '/finance/dashboard';
    default:
      return '/';
  }
};
