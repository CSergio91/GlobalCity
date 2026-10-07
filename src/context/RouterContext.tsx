import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  currentPath: string;
  subdomain: 'dashboard' | 'nexus' | null;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subdomain, setSubdomain] = useState<'dashboard' | 'nexus' | null>(() => {
    if (typeof window === 'undefined') return null;
    const host = window.location.hostname.toLowerCase();
    if (host.startsWith('dashboard.')) return 'dashboard';
    if (host.startsWith('nexus.')) return 'nexus';
    return null;
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    const path = window.location.pathname || '/';
    // If on a subdomain root, map to the corresponding path
    const host = window.location.hostname.toLowerCase();
    if (host.startsWith('dashboard.') && path === '/') return '/dashboard';
    if (host.startsWith('nexus.') && path === '/') return '/nexus';
    return path;
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      const host = window.location.hostname.toLowerCase();
      if (host.startsWith('dashboard.') && path === '/') {
        setCurrentPath('/dashboard');
      } else if (host.startsWith('nexus.') && path === '/') {
        setCurrentPath('/nexus');
      } else {
        setCurrentPath(path);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
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
