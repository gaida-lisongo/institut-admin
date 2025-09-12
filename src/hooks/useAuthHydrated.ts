import { useEffect, useState } from 'react';
import useAuthStore from '@/stores/authStore';

export const useAuthHydrated = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    setIsHydrated(hasHydrated);
  }, [hasHydrated]);

  return isHydrated;
};