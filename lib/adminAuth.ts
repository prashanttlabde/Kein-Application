import { getSupabase } from './supabase'

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  security_key: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export const adminAuth = {
  // Admin sign in with email, password, and security key
  signIn: async (email: string, password: string, securityKey: string) => {
    try {
      // Trim inputs to remove any leading/trailing spaces
      const trimmedEmail = email.trim();
      const trimmedSecurityKey = securityKey.trim();
      
      console.log('Admin auth attempt:', { 
        email: trimmedEmail, 
        securityKey: trimmedSecurityKey,
        securityKeyLength: trimmedSecurityKey.length 
      });
      
      // First, get all admin users and find the matching one
      const supabase = getSupabase();
      const { data: allAdmins, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('is_active', true);

      console.log('All active admins:', allAdmins);
      console.log('Fetch error:', fetchError);

      if (fetchError) {
        throw new Error(`Database error: ${fetchError.message}`);
      }

      // Find matching admin
      const adminUser = allAdmins?.find((admin: AdminUser) => 
        admin.email === trimmedEmail && admin.security_key === trimmedSecurityKey
      );

      console.log('Found matching admin:', adminUser);

      if (!adminUser) {
        console.error('No matching admin found');
        throw new Error('Invalid admin credentials or security key');
      }

      // For now, we'll use a simple password check (in production, use proper hashing)
      const validPasswords = {
        'maheshkumawat0304@gmail.com': 'KeinAdmin2024!'
      };

      console.log('Password check:', { email, providedPassword: password, expectedPassword: validPasswords[email as keyof typeof validPasswords] });

      if (validPasswords[email as keyof typeof validPasswords] !== password) {
        throw new Error('Invalid password');
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id);

      // Store admin session in localStorage for client-side auth
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_session', JSON.stringify({
          id: adminUser.id,
          email: adminUser.email,
          full_name: adminUser.full_name,
          loginTime: new Date().toISOString()
        }));
      }

      return { 
        data: { 
          user: adminUser,
          session: {
            access_token: `admin_${adminUser.id}`,
            user: adminUser
          }
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Admin auth error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Authentication failed') 
      };
    }
  },

  // Check if current user is admin
  isAdmin: async () => {
    try {
      if (typeof window === 'undefined') return false;
      
      const adminSession = localStorage.getItem('admin_session');
      if (!adminSession) return false;

      const session = JSON.parse(adminSession);
      
      // Verify session is still valid (less than 24 hours old)
      const loginTime = new Date(session.loginTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        localStorage.removeItem('admin_session');
        return false;
      }

      // Verify admin still exists and is active
      const supabase = getSupabase();
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('is_active')
        .eq('id', session.id)
        .single();

      return !error && adminUser?.is_active;
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  },

  // Get current admin user
  getAdminUser: async () => {
    try {
      if (typeof window === 'undefined') return { user: null, profile: null };
      
      const adminSession = localStorage.getItem('admin_session');
      if (!adminSession) return { user: null, profile: null };

      const session = JSON.parse(adminSession);
      
      // Verify session is still valid
      const isValid = await adminAuth.isAdmin();
      if (!isValid) {
        return { user: null, profile: null };
      }

      // Get fresh admin data
      const supabase = getSupabase();
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', session.id)
        .single();

      if (error || !adminUser) {
        return { user: null, profile: null };
      }

      return { 
        user: adminUser, 
        profile: adminUser 
      };
    } catch (error) {
      console.error('Get admin user error:', error);
      return { user: null, profile: null };
    }
  },

  // Admin sign out
  signOut: async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_session');
      }
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign out failed') };
    }
  },

  // Get all admin users (for management)
  getAllAdmins: async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, full_name, is_active, last_login, created_at')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update admin status
  updateAdminStatus: async (adminId: string, isActive: boolean) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('admin_users')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', adminId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};
