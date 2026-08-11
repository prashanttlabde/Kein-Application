/**
 * Session Recovery Utility
 * 
 * This script provides utilities to fix common authentication issues.
 * Add this to your browser console if you're experiencing auth errors.
 */

// Clear all Supabase session data
export const clearSupabaseSession = () => {
  if (typeof window === 'undefined') {
    console.error('This function can only be run in a browser environment');
    return;
  }

  let clearedCount = 0;

  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-') || key.includes('supabase') || key === 'supabase.auth.token') {
      localStorage.removeItem(key);
      clearedCount++;
      console.log(`✅ Cleared: ${key}`);
    }
  });

  // Clear sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('sb-') || key.includes('supabase')) {
      sessionStorage.removeItem(key);
      clearedCount++;
      console.log(`✅ Cleared: ${key}`);
    }
  });

  console.log(`\n🎉 Successfully cleared ${clearedCount} session items`);
  console.log('💡 Please refresh the page to complete the reset');
  
  return clearedCount;
};

// Expose to window for easy access in console
if (typeof window !== 'undefined') {
  (window as any).clearSupabaseSession = clearSupabaseSession;
  console.log('💡 Session recovery utility loaded. Run clearSupabaseSession() to fix auth issues.');
}
