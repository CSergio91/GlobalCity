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
  if (host.startsWith('nexus.') || host.startsWith('nexuscrm.')) return 'nexus';

  // Soporte de simulación para entorno local/túnel: ?subdomain=dashapp
  const params = new URLSearchParams(window.location.search);
  const paramSub = params.get('subdomain');
  if (paramSub === 'dashapp' || paramSub === 'dashboard' || paramSub === 'nexus' || paramSub === 'nexuscrm') {
    return paramSub === 'nexuscrm' ? 'nexus' : paramSub;
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
    if (path === '/dashapp' || path.startsWith('/dashapp/')) return '/dashboard';
    if (sub === 'nexus' && path === '/') return '/nexus';
    return path;
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      const sub = detectSubdomain();
      if ((sub === 'dashapp' || sub === 'dashboard') && path === '/') {
        setCurrentPath('/dashboard');
      } else if (path === '/dashapp' || path.startsWith('/dashapp/')) {
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
      const isProduction = host.endsWith('eklipsefunded.com');

      if (isProduction) {
        // Redirigir a nexuscrm.eklipsefunded.com si se navega a /nexus desde landing o dashapp
        const isCrmTarget = to === '/nexus' || to === '/crm' || to === '/nexuscrm' || to.startsWith('/nexus') || to.startsWith('/crm') || to.startsWith('/nexuscrm');
        if (isCrmTarget && !host.startsWith('nexuscrm.') && !host.startsWith('nexus.')) {
          window.location.href = 'https://nexuscrm.eklipsefunded.com/';
          return;
        }

        // Redirigir a dashapp.eklipsefunded.com si se navega a /dashboard desde landing o nexuscrm
        const isDashboardTarget = to === '/dashboard' || to === '/dashapp' || to.startsWith('/dashboard') || to.startsWith('/dashapp');
        if (isDashboardTarget && !host.startsWith('dashapp.') && !host.startsWith('dashboard.')) {
          window.location.href = 'https://dashapp.eklipsefunded.com/';
          return;
        }

        // Redirigir a la landing principal si se navega a / desde un subdominio
        if (to === '/' && (host.startsWith('nexuscrm.') || host.startsWith('nexus.') || host.startsWith('dashapp.') || host.startsWith('dashboard.'))) {
          window.location.href = 'https://eklipsefunded.com/';
          return;
        }
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
