'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuth, AdminUser } from './adminAuth';

interface AdminAuthState {
    user: AdminUser | null;
    profile: AdminUser | null;
    loading: boolean;
    isAdmin: boolean;
}

export const useAdminAuth = (): AdminAuthState => {
    const router = useRouter();
    const [authState, setAuthState] = useState<AdminAuthState>({
        user: null,
        profile: null,
        loading: true,
        isAdmin: false
    });

    useEffect(() => {
        const checkAdminAuth = async () => {
            try {
                const isAdmin = await adminAuth.isAdmin();

                if (!isAdmin) {
                    router.push('/admin/login');
                    setAuthState({
                        user: null,
                        profile: null,
                        loading: false,
                        isAdmin: false
                    });
                    return;
                }

                const { user, profile } = await adminAuth.getAdminUser();

                if (!user || !profile) {
                    router.push('/admin/login');
                    setAuthState({
                        user: null,
                        profile: null,
                        loading: false,
                        isAdmin: false
                    });
                    return;
                }

                setAuthState({
                    user,
                    profile,
                    loading: false,
                    isAdmin: true
                });
            } catch (error) {
                console.error('Admin auth check failed:', error);
                router.push('/admin/login');
                setAuthState({
                    user: null,
                    profile: null,
                    loading: false,
                    isAdmin: false
                });
            }
        };

        checkAdminAuth();
    }, [router]);

    return authState;
};

// Higher-order component for admin authentication
export const withAdminAuth = <P extends object>(
    WrappedComponent: React.ComponentType<P>
) => {
    const AdminAuthWrapper = (props: P) => {
        const { loading, isAdmin } = useAdminAuth();

        if (loading) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Verifying admin access...</p>
                    </div>
                </div>
            );
        }

        if (!isAdmin) {
            return null; // Router redirect is handled in useAdminAuth
        }

        return <WrappedComponent {...props} />;
    };

    AdminAuthWrapper.displayName = `withAdminAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return AdminAuthWrapper;
};
