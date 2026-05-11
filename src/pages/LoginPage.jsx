import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import './Auth.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const errorRef = useRef(null);

    // Auto-scroll to error message
    useEffect(() => {
        if (errorMsg && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [errorMsg]);

    // Redirect to home if already logged in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error || !data.user) {
                setErrorMsg('Invalid email or password. Please try again.');
                setLoading(false);
                return;
            }

            // Note: AuthContext handles fetching the user profile from public.users
            // and sets the state automatically when auth state changes.
            // We just need to show success and redirect.
            
            // Login successful
            login({}); // Fallback logic (AuthContext manages actual user state)
            setSuccessMsg(`Welcome back, ${data.user.user_metadata?.name || 'User'}!`);
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            console.error('Login error:', err);
            setErrorMsg('An error occurred during sign in.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <SEO title="Sign In" description="Sign in to your AntiLabs account." canonicalUrl="/login" />
            <Navbar />
            <main className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to your AntiLabs account</p>
                    </div>

                    {errorMsg && (
                        <div ref={errorRef} style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: '500', fontSize: '0.95rem' }}>
                            {errorMsg}
                        </div>
                    )}

                    {successMsg && (
                        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: '500', fontSize: '0.95rem', border: '1px solid #bbf7d0' }}>
                            {successMsg}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                className="auth-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="auth-group">
                            <label htmlFor="password">Password</label>
                            <div className="auth-password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="auth-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an account? <Link to="/register" className="auth-link">Create one now</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
