import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import './Auth.css';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: '',
        phone: '',
        profession: '',
        address: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    
    // OTP State
    const [showOtpStep, setShowOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [timer, setTimer] = useState(120);
    const errorRef = useRef(null);
    const [txId, setTxId] = useState(null);

    // Auto-scroll to error message
    useEffect(() => {
        if (errorMsg && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [errorMsg]);
    
    const navigate = useNavigate();
    const { user } = useAuth();

    // Redirect to home if already logged in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const txIdParam = queryParams.get('tx_id');
        const emailParam = queryParams.get('email');
        const nameParam = queryParams.get('name');
        const phoneParam = queryParams.get('phone');

        if (txIdParam) {
            setTxId(txIdParam);
            let cleanedPhone = phoneParam ? decodeURIComponent(phoneParam) : '';
            // Strip any +91 or 91 prefix if it exists so the 10-digit number is clean in the input
            let digits = cleanedPhone.replace(/\D/g, '');
            if (digits.length > 10 && digits.startsWith('91')) {
                digits = digits.substring(2);
            } else if (digits.length === 12 && digits.startsWith('91')) {
                digits = digits.substring(2);
            }
            setFormData(prev => ({
                ...prev,
                name: nameParam ? decodeURIComponent(nameParam) : prev.name,
                email: emailParam ? decodeURIComponent(emailParam) : prev.email,
                phone: digits || cleanedPhone || prev.phone
            }));
        }
    }, []);

    useEffect(() => {
        let interval;
        if (showOtpStep && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [showOtpStep, timer]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleResendOtp = async () => {
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: formData.email,
            });
            if (error) throw error;
            setSuccessMsg('Confirmation code resent! Please check your email.');
            setTimer(120); // Reset timer to 2 minutes
        } catch (error) {
            console.error('Error resending OTP:', error);
            setErrorMsg('Failed to resend confirmation code. Please try again later.');
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (formData.password !== formData.confirmPassword) {
            setErrorMsg('Passwords do not match');
            return;
        }

        let digitsOnly = formData.phone.replace(/\D/g, '');
        if (digitsOnly.length > 10 && digitsOnly.startsWith('91')) {
            digitsOnly = digitsOnly.substring(2);
        }
        digitsOnly = digitsOnly.replace(/^0+/, '');
        const formattedPhone = `+91${digitsOnly}`;

        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        phone: formattedPhone,
                        age: parseInt(formData.age) || null,
                        profession: formData.profession,
                        address: formData.address
                    }
                }
            });

            if (error) {
                // Check if it's a unique constraint error for the phone_number
                if (error.message?.includes('phone_number')) {
                    throw new Error('This phone number is already registered. Please log in or use a different number.');
                }
                throw error;
            }

            setSuccessMsg('Registration successful! Please check your email for the 6-digit confirmation code.');
            setShowOtpStep(true);
            setLoading(false);
        } catch (error) {
            console.error('Error during registration:', error);
            setErrorMsg('An error occurred during registration. Please check your details and try again.');
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setVerifyingOtp(true);

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: formData.email,
                token: otp,
                type: 'signup'
            });

            if (error) throw error;

            // Fetch the user's public user_id (integer) from the users table
            let profile = null;
            const { data: fetchedProfile, error: profileError } = await supabase
                .from('users')
                .select('user_id')
                .eq('auth_id', data.user.id)
                .single();

            if (!profileError && fetchedProfile) {
                profile = fetchedProfile;
            } else if (profileError && profileError.code === 'PGRST116') {
                console.warn("Profile not found during OTP verification. Attempting frontend creation.");
                let digitsOnly = formData.phone.replace(/\D/g, '');
                if (digitsOnly.length > 10 && digitsOnly.startsWith('91')) {
                    digitsOnly = digitsOnly.substring(2);
                }
                digitsOnly = digitsOnly.replace(/^0+/, '');
                const formattedPhone = `+91${digitsOnly}`;

                const { data: insertedData, error: insertError } = await supabase
                    .from('users')
                    .insert([{
                        auth_id: data.user.id,
                        name: formData.name,
                        email: formData.email,
                        phone_number: formattedPhone,
                        age: formData.age ? parseInt(formData.age, 10) : null,
                        profession: formData.profession,
                        residential_address: formData.address
                    }])
                    .select('user_id')
                    .single();

                if (!insertError && insertedData) {
                    profile = insertedData;
                } else {
                    console.error("Fallback profile insertion failed:", insertError);
                }
            }

            if (profile) {
                const newUserId = profile.user_id;

                // 1. Active checkout case: Link this specific transaction
                if (txId) {
                    await supabase
                        .from('transactions')
                        .update({ user_id: newUserId })
                        .eq('transaction_id', txId);

                    // Fetch the transaction details to get the role_id
                    const { data: tx } = await supabase
                        .from('transactions')
                        .select('role_id')
                        .eq('transaction_id', txId)
                        .maybeSingle();

                    if (tx) {
                        await supabase
                            .from('training_registrations')
                            .update({ user_id: newUserId })
                            .eq('email', formData.email)
                            .eq('role_id', tx.role_id)
                            .is('user_id', null);
                    }
                }

                // 2. Passive Drop-off handling & active matching fallback:
                // Find all paid transactions with this email where user_id is null and link them
                const { data: paidTxs } = await supabase
                    .from('transactions')
                    .select('transaction_id, role_id')
                    .eq('email', formData.email)
                    .eq('payment_status', 'paid')
                    .is('user_id', null);

                if (paidTxs && paidTxs.length > 0) {
                    for (const tx of paidTxs) {
                        await supabase
                            .from('transactions')
                            .update({ user_id: newUserId })
                            .eq('transaction_id', tx.transaction_id);

                        await supabase
                            .from('training_registrations')
                            .update({ user_id: newUserId })
                            .eq('email', formData.email)
                            .eq('role_id', tx.role_id)
                            .is('user_id', null);
                    }
                }
            }

            setSuccessMsg('Email verified successfully! Taking you to your profile...');
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setErrorMsg('Invalid or expired confirmation code. Please check your email and try again.');
            setVerifyingOtp(false);
        }
    };

    return (
        <div className="auth-page">
            <SEO title="Register" description="Create an AntiLabs account." canonicalUrl="/register" />
            <Navbar />
            <main className="auth-container">
                <div className="auth-card auth-card--register">
                    <div className="auth-header">
                        <h1>Create an Account</h1>
                        <p>Join AntiLabs and get started today</p>
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

                    {!showOtpStep ? (
                        <form className="auth-form auth-form-grid" onSubmit={handleSubmit}>
                            <div className="auth-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className={`auth-input ${txId ? 'auth-input--readonly' : ''}`}
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    readOnly={!!txId}
                                />
                            </div>

                            <div className="auth-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={`auth-input ${txId ? 'auth-input--readonly' : ''}`}
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    readOnly={!!txId}
                                />
                            </div>

                            <div className="auth-group">
                                <label htmlFor="age">Age</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    className="auth-input"
                                    placeholder="25"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    max="120"
                                />
                            </div>

                            <div className="auth-group">
                                <label htmlFor="phone">Phone Number</label>
                                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0 1rem',
                                        backgroundColor: '#f9fafb',
                                        border: '1px solid #e5e7eb',
                                        borderRight: 'none',
                                        borderRadius: '0.5rem 0 0 0.5rem',
                                        color: '#6b7280',
                                        fontWeight: '500'
                                    }}>
                                        +91
                                    </div>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        className={`auth-input ${txId ? 'auth-input--readonly' : ''}`}
                                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                        placeholder="9876543210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        readOnly={!!txId}
                                    />
                                </div>
                            </div>

                            <div className="auth-group auth-group--full">
                                <label htmlFor="profession">Profession</label>
                                <input
                                    type="text"
                                    id="profession"
                                    name="profession"
                                    className="auth-input"
                                    placeholder="Software Engineer / Student / Designer"
                                    value={formData.profession}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="auth-group auth-group--full">
                                <label htmlFor="address">Residential Address</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    className="auth-input"
                                    placeholder="Enter your full residential address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="auth-group">
                                <label htmlFor="password">Password</label>
                                <div className="auth-password-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        className="auth-input"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength="6"
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

                            <div className="auth-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="auth-password-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        className="auth-input"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        minLength="6"
                                    />
                                    <button type="button" className="auth-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? (
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

                            <div className="auth-group auth-group--full">
                                <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                                    {loading ? 'Registering...' : 'Complete Registration'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="auth-form" onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="auth-group" style={{ width: '100%' }}>
                                <label htmlFor="otp" style={{ textAlign: 'center', marginBottom: '15px', display: 'block', color: '#4b5563' }}>
                                    We sent an 8-digit confirmation code to <strong>{formData.email}</strong>
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    className="auth-input"
                                    placeholder="Enter 8-digit code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength="8"
                                    style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', padding: '15px' }}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary auth-btn" disabled={verifyingOtp || otp.length < 8} style={{ marginTop: '20px', width: '100%' }}>
                                {verifyingOtp ? 'Verifying...' : 'Verify Email'}
                            </button>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '15px' }}>
                                <button 
                                    type="button" 
                                    onClick={handleResendOtp}
                                    disabled={timer > 0}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: timer > 0 ? '#9ca3af' : '#6c63ff', 
                                        textDecoration: timer > 0 ? 'none' : 'underline', 
                                        cursor: timer > 0 ? 'not-allowed' : 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    {timer > 0 ? `Resend Code (${formatTime(timer)})` : 'Resend Code'}
                                </button>

                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowOtpStep(false);
                                        setOtp('');
                                        setTimer(120);
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#6b7280', textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                    Back to registration
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="auth-footer">
                        Already have an account? <Link to="/login" className="auth-link">Log in here</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
