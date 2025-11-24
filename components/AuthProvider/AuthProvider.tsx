'use client';

import { getMe, checkSession } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

type Props = { children: React.ReactNode };

export default function AuthProvider({ children }: Props) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    (state) => state.clearIsAuthenticated
  );
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          clearIsAuthenticated();
          return;
        }

        let user = await getMe();
        if (!user) {
          const refreshed = await checkSession();
          if (refreshed) user = await getMe();
        }

        if (user) setUser(user);
        else clearIsAuthenticated();
      } catch {
        clearIsAuthenticated();
        toast.error('Помилка при завантаженні даних користувача.');
      }
    };

    fetchUser();
  }, [setUser, clearIsAuthenticated]);

  return children;
}
