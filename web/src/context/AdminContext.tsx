import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { adminApi } from '../api/adminApi';

interface AdminUser {
    id: string;
    username: string;
    email: string;
    role: 'superadmin' | 'admin';
}

interface AdminContextType {
    admin: AdminUser | null;
    isAuthenticated: boolean;
    isSuperadmin: boolean;
    isLoading: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => void;
    refreshAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const storedUser = adminApi.getStoredUser();
            const hasToken = adminApi.isAuthenticated();

            if (hasToken && storedUser) {
                // Verify token is still valid
                try {
                    const { admin: freshAdmin } = await adminApi.getMe();
                    setAdmin(freshAdmin);
                    localStorage.setItem('adminUser', JSON.stringify(freshAdmin));
                } catch {
                    // Token invalid, clear storage
                    adminApi.logout();
                    setAdmin(null);
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (identifier: string, password: string) => {
        const response = await adminApi.login(identifier, password);

        // Store token and user
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminUser', JSON.stringify(response.admin));

        setAdmin(response.admin);
    };

    const logout = () => {
        adminApi.logout();
        setAdmin(null);
        window.location.href = '/admin/login';
    };

    const refreshAdmin = async () => {
        try {
            const { admin: freshAdmin } = await adminApi.getMe();
            setAdmin(freshAdmin);
            localStorage.setItem('adminUser', JSON.stringify(freshAdmin));
        } catch {
            logout();
        }
    };

    const value: AdminContextType = {
        admin,
        isAuthenticated: !!admin,
        isSuperadmin: admin?.role === 'superadmin',
        isLoading,
        login,
        logout,
        refreshAdmin,
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}
