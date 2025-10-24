import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface PatientAuthContextType {
  user: User | null;
  patientId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

export const PatientAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        // Defer fetching patient data to avoid race conditions
        if (session?.user) {
          setTimeout(async () => {
            if (!mounted) return;
            
            const { data, error } = await supabase
              .from('patient_portal_users')
              .select('patient_id')
              .eq('id', session.user.id)
              .maybeSingle();
            
            if (mounted) {
              if (error) {
                console.error('Error fetching patient_id:', error);
              }
              setPatientId(data?.patient_id || null);
              setLoading(false);
            }
          }, 0);
        } else {
          if (mounted) {
            setPatientId(null);
            setLoading(false);
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        supabase
          .from('patient_portal_users')
          .select('patient_id')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data, error }) => {
            if (mounted) {
              if (error) {
                console.error('Error fetching patient_id:', error);
              }
              setPatientId(data?.patient_id || null);
              setLoading(false);
            }
          });
      } else {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Rely on patient_portal_users as the source of truth for portal access
      // (role assignment is optional and should not block patient login)

      // Fetch patient_id
      const { data: portalUser, error: portalError } = await supabase
        .from('patient_portal_users')
        .select('patient_id, is_active')
        .eq('id', data.user.id)
        .maybeSingle();

      if (portalError || !portalUser) {
        await supabase.auth.signOut();
        return { error: new Error('Portal account not found. Please contact reception to activate your account.') };
      }

      if (!portalUser.is_active) {
        await supabase.auth.signOut();
        return { error: new Error('Your portal account is inactive. Please contact reception.') };
      }

      // Update last login
      await supabase
        .from('patient_portal_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log('Patient logout error (session may already be expired):', error);
    } finally {
      // Always clear local state even if API call fails
      setUser(null);
      setSession(null);
      setPatientId(null);
    }
  };

  return (
    <PatientAuthContext.Provider value={{ user, patientId, loading, signIn, signOut }}>
      {children}
    </PatientAuthContext.Provider>
  );
};

export const usePatientAuth = () => {
  const context = useContext(PatientAuthContext);
  if (context === undefined) {
    throw new Error('usePatientAuth must be used within PatientAuthProvider');
  }
  return context;
};
