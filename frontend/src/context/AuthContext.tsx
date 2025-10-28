import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import type { UserProfile } from "../utils/supabaseClient"
import { supabase } from "../utils/supabaseClient"

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, firstName: string, lastName: string, role: string) => Promise<{ error: any }>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile from profiles table
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();
            
            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
            setProfile(null);
        }
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session }}) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
            setLoading(false);
        });

        // List for auth changes (such as login and logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        // Cleaned subscription
        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (
        email: string,
        password: string,
        firstName: string,
        lastName: string,
        role: string
    ) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        firstName,
                        lastName,
                        role
                    }
                }
            });

            return { error };
        } catch (error) {
            return { error };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            return { error }
        } catch (error) {
            return { error }
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    const refreshProfile = async () => {
        if (user?.id) {
            await fetchProfile(user.id);
        }
    };

    const value = {
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};