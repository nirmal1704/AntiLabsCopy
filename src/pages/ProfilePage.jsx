import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import SEO from '../components/SEO';
import './Auth.css';

export default function ProfilePage() {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [trainings, setTrainings] = useState([]);
    const [loadingTrainings, setLoadingTrainings] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        profession: '',
        residential_address: '',
        age: ''
    });

    // Payment confirmation from Cashfree
    useEffect(() => {
        const checkPayment = async () => {
            const queryParams = new URLSearchParams(window.location.search);
            // Check for tx_id instead of reg_id (new architecture)
            // Fallback to reg_id just in case of any cached redirects
            const txId = queryParams.get('tx_id') || queryParams.get('reg_id');
            const orderId = queryParams.get('order_id');

            if (txId && orderId) {
                const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                try {
                    const verifyRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-cashfree-order`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                        },
                        body: JSON.stringify({ action: 'verify', order_id: orderId, is_dev: isDev })
                    });
                    
                    const orderData = await verifyRes.json();
                    
                    if (orderData.order_status === 'PAID') {
                        // 1. Fetch transaction details to check its current status
                        const { data: txData, error: txError } = await supabase
                            .from('transactions')
                            .select('*')
                            .eq('transaction_id', txId)
                            .single();

                        if (txData && !txError) {
                            // If already processed (e.g. by React StrictMode double-fire), skip to reload
                            if (txData.payment_status === 'paid') {
                                window.location.href = window.location.pathname;
                                return;
                            }

                            // 2. Update transactions table
                            await supabase
                                .from('transactions')
                                .update({ payment_status: 'paid' })
                                .eq('transaction_id', txId);

                            // 3. Assign batch and roll number (which also handles training_registrations insertion)
                            const { data: rollNumber, error: rpcError } = await supabase.rpc('assign_batch_and_roll_number', {
                                p_transaction_id: parseInt(txId)
                            });

                            if (rpcError) {
                                console.error('RPC assign_batch_and_roll_number failed (maybe SQL not run yet?), falling back to legacy insert:', rpcError);
                                // Fallback: Ensure no duplicate in training_registrations
                                const { data: existingReg } = await supabase
                                    .from('training_registrations')
                                    .select('registration_id')
                                    .eq('email', txData.email)
                                    .eq('role_id', txData.role_id)
                                    .maybeSingle();

                                if (!existingReg) {
                                    // Insert into training_registrations
                                    const { transaction_id, ...txDataWithoutId } = txData;
                                    txDataWithoutId.payment_status = 'paid'; // force it to paid
                                    await supabase
                                        .from('training_registrations')
                                        .insert([txDataWithoutId]);
                                }
                            }
                        }

                        setSuccessMsg('Payment Successful! Registration confirmed.');
                    } else {
                        // Mark transaction as failed or cancelled
                        const status = orderData.order_status === 'ACTIVE' ? 'pending' : 'failed';
                        await supabase
                            .from('transactions')
                            .update({ payment_status: status })
                            .eq('transaction_id', txId);
                            
                        setErrorMsg(`Payment was not completed. Status: ${orderData.order_status || 'UNKNOWN'}`);
                    }
                } catch (err) {
                    console.error('Failed to verify payment status', err);
                    setErrorMsg('An error occurred while verifying your payment.');
                }
                // Clean up URL and auto-refresh the page once to fetch the latest data
                window.location.href = window.location.pathname;
            }
        };
        checkPayment();
    }, []);

    // Populate form data once user is available
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                profession: user.profession || '',
                residential_address: user.residential_address || '',
                age: user.age || ''
            });

            const fetchTrainings = async () => {
                try {
                    const { data, error } = await supabase
                        .from('training_registrations')
                        .select('*')
                        .eq('user_id', user.user_id)
                        .eq('payment_status', 'paid');

                    if (!error && data) {
                        setTrainings(data);
                    }
                } catch (err) {
                    console.error("Error fetching trainings", err);
                } finally {
                    setLoadingTrainings(false);
                }
            };
            fetchTrainings();
        }
    }, [user]);

    if (!user) {
        return (
            <div className="profile-page">
                <SEO title="Your Profile" description="Manage your AntiLabs profile." canonicalUrl="/profile" />
                <Navbar />
                <main className="auth-container" style={{ textAlign: 'center' }}>
                    <div className="auth-card">
                        <h2>Unauthorized</h2>
                        <p style={{ marginTop: '8px', color: '#64748b' }}>Please log in to view this page.</p>
                        <button onClick={() => navigate('/login')} className="btn btn-primary auth-btn" style={{ marginTop: '24px' }}>
                            Go to Login
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    name: formData.name,
                    phone_number: formData.phone_number,
                    profession: formData.profession,
                    residential_address: formData.residential_address,
                    age: formData.age ? parseInt(formData.age) : null
                })
                .eq('user_id', user.user_id)
                .select()
                .single();

            if (error) throw error;

            login(data); // update global context and localStorage
            setSuccessMsg('Profile updated successfully!');
            setIsEditing(false);

            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Update error:', err);
            setErrorMsg(err.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    // To handle responsiveness smoothly without extra CSS classes
    const layoutStyle = {
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '32px',
        alignItems: 'flex-start'
    };

    return (
        <div className="auth-page" style={{ backgroundColor: '#f4f7fb' }}>
            <Navbar />
            <main className="auth-container" style={{ padding: '120px 24px 80px', width: '100%' }}>
                <div style={layoutStyle}>

                    {/* LEFT SIDEBAR */}
                    <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: '280px', backgroundColor: '#ffffff', borderRadius: '24px', padding: '40px 24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                            color: '#fff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3.5rem',
                            fontWeight: 'bold',
                            marginBottom: '20px',
                            boxShadow: '0 10px 25px rgba(14, 165, 233, 0.4)',
                            border: '4px solid #f0f9ff'
                        }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '6px', color: '#0f172a', letterSpacing: '-0.02em' }}>{user.name}</h1>
                        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '1rem', fontWeight: '500' }}>{user.profession || 'Member'}</p>

                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0ea5e9'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    Edit Profile
                                </button>
                            ) : (
                                <button onClick={() => {
                                    setIsEditing(false);
                                    setErrorMsg('');
                                    setFormData({
                                        name: user.name || '', email: user.email || '', phone_number: user.phone_number || '', profession: user.profession || '', residential_address: user.residential_address || '', age: user.age || ''
                                    });
                                }} style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    Cancel Editing
                                </button>
                            )}

                            {!loadingTrainings && trainings.length > 0 && (
                                <button onClick={() => navigate('/student-dashboard')} style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#10b981', color: '#ffffff', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)'; }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                                    Student Dashboard
                                </button>
                            )}

                            <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'transparent', color: '#ef4444', fontWeight: '600', border: '1px solid #fecaca', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* RIGHT CONTENT */}
                    <div style={{ flex: '3 1 500px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
                        {/* PERSONAL INFO CARD */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    {isEditing ? 'Update Details' : 'Personal Information'}
                                </h2>
                            </div>

                            {errorMsg && (
                                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontWeight: '500', fontSize: '0.95rem' }}>
                                    {errorMsg}
                                </div>
                            )}
                            {successMsg && (
                                <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontWeight: '500', fontSize: '0.95rem', border: '1px solid #bbf7d0' }}>
                                    {successMsg}
                                </div>
                            )}

                            {!isEditing ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</span>
                                        <span style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: '600' }}>{user.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</span>
                                        <span style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: '600' }}>{user.email}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profession</span>
                                        <span style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: '600' }}>{user.profession || '-'}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</span>
                                        <span style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: '600' }}>{user.phone_number || '-'}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age</span>
                                        <span style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: '600' }}>{user.age || '-'}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Residential Address</span>
                                        <span style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: '600', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{user.residential_address || '-'}</span>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSave} className="auth-form auth-form-grid" style={{ gap: '20px' }}>
                                    <div className="auth-group">
                                        <label>Full Name</label>
                                        <input type="text" name="name" className="auth-input" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="auth-group">
                                        <label>Email Address</label>
                                        <input type="email" name="email" className="auth-input" value={formData.email} onChange={handleChange} disabled style={{ backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }} title="Email address cannot be changed." />
                                    </div>
                                    <div className="auth-group">
                                        <label>Profession</label>
                                        <input type="text" name="profession" className="auth-input" value={formData.profession} onChange={handleChange} required />
                                    </div>
                                    <div className="auth-group">
                                        <label>Phone Number</label>
                                        <input type="tel" name="phone_number" className="auth-input" value={formData.phone_number} onChange={handleChange} disabled style={{ backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }} title="Phone number cannot be changed." />
                                    </div>
                                    <div className="auth-group">
                                        <label>Age</label>
                                        <input type="number" name="age" className="auth-input" value={formData.age} onChange={handleChange} min="1" max="150" />
                                    </div>
                                    <div className="auth-group auth-group--full">
                                        <label>Residential Address</label>
                                        <textarea name="residential_address" className="auth-input" value={formData.residential_address} onChange={handleChange} required style={{ minHeight: '100px' }} />
                                    </div>
                                    <div className="auth-group auth-group--full" style={{ marginTop: '8px' }}>
                                        <button type="submit" className="btn btn-primary auth-btn" disabled={loading} style={{ margin: 0, padding: '14px', borderRadius: '12px' }}>
                                            {loading ? 'Saving Changes...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* ENROLLED PROGRAMS CARD */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                                    My Enrolled Programs
                                </h2>
                            </div>
                            
                            {loadingTrainings ? (
                                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading your programs...</div>
                            ) : trainings.length === 0 ? (
                                <div style={{ padding: '40px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1', textAlign: 'center' }}>
                                    <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '1.05rem' }}>You haven't completed enrollment for any training programs yet.</p>
                                    <button onClick={() => navigate('/careers')} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '1rem', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                        Explore Programs
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {trainings.map((t) => (
                                        <div key={t.registration_id} style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            flexWrap: 'wrap', 
                                            gap: '24px', 
                                            padding: '24px 28px', 
                                            backgroundColor: '#ffffff', 
                                            borderRadius: '16px', 
                                            border: '1px solid #e2e8f0', 
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#0ea5e9' }} />
                                            <div>
                                                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.01em' }}>{t.position}</h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.95rem', color: '#64748b', fontWeight: '500' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M3 21h18M9 8h1m5 0h1M9 12h1m5 0h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" /></svg>
                                                        {t.college_name}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M22 10l-10-5L2 10l10 5 10-5zM6 12.5V17c0 1.1 2.686 2 6 2s6-.9 6-2v-4.5" /></svg>
                                                        {t.degree_pursuing}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                                                        Class of {t.graduation_year}
                                                    </span>
                                                    {t.roll_number && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0ea5e9', fontWeight: 'bold' }}>
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h8"/><path d="M8 11h8"/></svg>
                                                            Roll No: {t.roll_number}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#f0fdf4', color: '#15803d', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #bbf7d0' }}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                                    Payment Confirmed
                                                </span>
                                                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500', marginRight: '4px' }}>
                                                    Paid: <span style={{ color: '#0f172a', fontWeight: '700' }}>₹{parseInt(t.fees_amount).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
