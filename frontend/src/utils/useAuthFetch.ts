import { supabase } from "./supabaseClient";

/**
 * Custom hook for making API requests that require authentication
 * Automatically includes the JWT token to every request (in the Authorization header)
 */

export const useAuthFetch = () => {
    const authFetch = async (url: string, options: RequestInit = {}) => {
        try {
            // Get the current session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error("No active sesssion. Please log in.");
            }

            // Add Authorization header with the JWT (Bearer token)
            const headers = {
                ...options.headers,
                "Authorization": `Bearer ${session.access_token}`
            };

            // Make the actual fetch request using the fetch options the user passed and the new auth headers with JWT Bearer token
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Handle 401 Unauthorized (token expired or invalid)
            if (response.status === 401) {
                // Try to refresh the session
                const { data: { session: newSession } } = await supabase.auth.refreshSession();

                if (newSession) {
                    // Retry the request with the new token
                    headers["Authorization"] = `Bearer ${newSession.access_token}`;
                    return await fetch(url, {
                        ...options,
                        headers
                    });
                } else {
                    throw new Error("Session expired. Please log in again.");
                }
            }

            return response;
        } catch (error) {
            console.error("Auth fetch error:", error);
            throw error;
        }
    };

    return { authFetch };
};