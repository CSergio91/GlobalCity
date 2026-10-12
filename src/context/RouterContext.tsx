import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppSubdomain = 'dashapp' | 'dashboard' | 'nexus' | null;

interface RouterContextType {
  currentPath: string;
  subdomain: AppSubdomain;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function detectSubdomain(): AppSubdomain {
  if (typeof window === 'undefined') return null;
  const host = window.location.hostname.toLowerCase();
  if (host.startsWith('dashapp.')) return 'dashapp';
  if (host.startsWith('dashboard.')) return 'dashboard';
  if (host.startsWith('nexus.')) return 'nexus';

  // Soporte de simulación para entorno local/túnel: ?subdomain=dashapp
  const params = new URLSearchParams(window.location.search);
  const paramSub = params.get('subdomain');
  if (paramSub === 'dashapp' || paramSub === 'dashboard' || paramSub === 'nexus') {
    return paramSub;
  }
  return null;
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subdomain, setSubdomain] = useState<AppSubdomain>(() => detectSubdomain());

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    const path = window.location.pathname || '/';
    const sub = detectSubdomain();
    if ((sub === 'dashapp' || sub === 'dashboard') && path === '/') return '/dashboard';
    if (sub === 'nexus' && path === '/') return '/nexus';
    return path;
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      const sub = detectSubdomain();
      if ((sub === 'dashapp' || sub === 'dashboard') && path === '/') {
        setCurrentPath('/dashboard');
      } else if (sub === 'nexus' && path === '/') {
        setCurrentPath('/nexus');
      } else {
        setCurrentPath(path);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      const isProductionMainDomain = host === 'eklipsefunded.com' || host === 'www.eklipsefunded.com';

      if (isProductionMainDomain && (to === '/dashboard' || to === '/login')) {
        const targetPath = to === '/dashboard' ? '/' : '/login';
        window.location.href = `https://dashapp.eklipsefunded.com${targetPath}`;
        return;
      }
    }

    if (to !== currentPath) {
      window.history.pushState({}, '', to);
      setCurrentPath(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <RouterContext.Provider value={{ currentPath, subdomain, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useAppRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useAppRouter must be used within a RouterProvider');
  }
  return context;
};
