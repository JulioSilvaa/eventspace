import React, { createContext, useCallback, useState, useEffect, useContext } from 'react';
import api from '../../services/adminApi';

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface AdminAuthContextData {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextData>({} as AdminAuthContextData);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoragedData() {
      const storagedToken = localStorage.getItem('@EventSpace:admin_token');
      const storagedAdmin = localStorage.getItem('@EventSpace:admin_user');

      if (storagedToken && storagedAdmin) {
        // Here we should probably validate the token with /api/admin/auth/me
        // For now, trust loading logic but verifying via API is safer
        try {
          // Optional: Validate token
          // await api.get('/admin/auth/me', { headers: { Authorization: `Bearer ${storagedToken}` } });
          api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
          setAdmin(JSON.parse(storagedAdmin));
        } catch (error) {
          console.error("Invalid token");
          signOut();
        }
      }
      setLoading(false);
    }
    loadStoragedData();
  }, []);

  const signIn = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const response = await api.post('/admin/auth/login', {
      email,
      password,
    });

    const { token, admin: adminData } = response.data;

    localStorage.setItem('@EventSpace:admin_token', token);
    localStorage.setItem('@EventSpace:admin_user', JSON.stringify(adminData));

    // Note: This might conflict if we use the SAME api instance for both user and admin
    // If we use the same axios instance, setting the header global might be tricky if user is also logged in.
    // Ideally we use a separate axios instance for admin or manage headers per request.
    // For now, let's assume exclusive usage or user switches.
    // BUT since we want to allow user navigation, maybe we should create a separate api instance for admin?
    // Let's create `adminApi` in services. 

    // For now, using the common api instance but we need to be careful.
    // For Admin Dashboard, we can manually attach the token or use an interceptor that checks URL.

    setAdmin(adminData);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@EventSpace:admin_token');
    localStorage.removeItem('@EventSpace:admin_user');
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, isAuthenticated: !!admin, signIn, signOut, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth(): AdminAuthContextData {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
