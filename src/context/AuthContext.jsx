/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the user profile from public.users using the auth.users id
        const fetchProfile = async (session) => {
            if (!session) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('auth_id', session.user.id)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') {
                        console.warn("Profile not found in database. Attempting frontend creation fallback.");
                        
                        // Parse age safely
                        let parsedAge = null;
                        try {
                            if (session.user.user_metadata?.age) {
                                parsedAge = parseInt(session.user.user_metadata.age, 10);
                            }
                        } catch (e) {
                            console.error("Failed to parse age:", e);
                        }

                        const { data: insertedData, error: insertError } = await supabase
                            .from('users')
                            .insert([{
                                auth_id: session.user.id,
                                name: session.user.user_metadata?.name || 'User',
                                email: session.user.email,
                                phone_number: session.user.user_metadata?.phone || null,
                                age: parsedAge,
                                profession: session.user.user_metadata?.profession || null,
                                residential_address: session.user.user_metadata?.address || null
                            }])
                            .select()
                            .single();

                        if (!insertError && insertedData) {
                            setUser(insertedData);
                        } else {
                            console.error("Frontend fallback creation failed:", insertError);
                            console.warn("Signing out ghost session.");
                            await supabase.auth.signOut();
                        }
                    } else {
                        throw error;
                    }
                } else {
                    setUser(data);
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        // Check active session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            fetchProfile(session);
        });

        // Listen for auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            fetchProfile(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // We keep login and logout wrappers for components that still expect them
    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
