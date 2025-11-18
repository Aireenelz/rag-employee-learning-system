import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

export interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    role: "partner" | "internal-employee" | "admin";
    department?: string;
    position?: string;
    created_at: string;
    updated_at: string;
}