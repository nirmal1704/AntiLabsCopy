import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const navigate = useNavigate();
    const { user } = useAuth();
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

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);

            if (error) {
                setErrorMsg(error.message || 'Failed to send OTP. Please try again.');
                setLoading(false);
                return;
            }

            setSuccessMsg('An OTP has been sent to your email.');
            setStep(2);
        } catch (err) {
            console.error('Send OTP error:', err);
            setErrorMsg('An error occurred while sending the OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        if (newPassword.length < 6) {
            setErrorMsg('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        try {
            // First, verify the OTP
            const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'recovery'
            });

            if (verifyError || !verifyData.session) {
                setErrorMsg(verifyError?.message || 'Invalid or expired OTP. Please try again.');
                setLoading(false);
                return;
            }

            // If OTP is valid, user is now logged in. We can update their password.
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) {
                setErrorMsg(updateError.message || 'Failed to update password.');
                setLoading(false);
                return;
            }

            setSuccessMsg('Password updated successfully! Redirecting...');
            
            // Sign out the user so they can log in with new credentials, or just let them stay logged in
            await supabase.auth.signOut();

            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (err) {
            console.error('Update password error:', err);
            setErrorMsg('An error occurred while updating the password.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <SEO title="Forgot Password" description="Reset your AntiLabs account password." canonicalUrl="/forgot-password" />
            <Navbar />
            <main className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Reset Password</h1>
                        <p>{step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP and your new password'}</p>
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

                    {step === 1 ? (
                        <form className="auth-form" onSubmit={handleSendOtp}>
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

                            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form className="auth-form" onSubmit={handleUpdatePassword}>
                            <div className="auth-group">
                                <label htmlFor="otp">8-Digit OTP</label>
                                <input
                                    type="text"
                                    id="otp"
                                    className="auth-input"
                                    placeholder="Enter OTP from email"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength={8}
                                />
                            </div>

                            <div className="auth-group">
                                <label htmlFor="newPassword">New Password</label>
                                <div className="auth-password-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="newPassword"
                                        className="auth-input"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
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
                                {loading ? 'Updating Password...' : 'Update Password'}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => { setStep(1); setOtp(''); setNewPassword(''); }}
                                    style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontWeight: '500', textDecoration: 'underline' }}
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="auth-footer">
                        Remember your password? <Link to="/login" className="auth-link">Sign In</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
