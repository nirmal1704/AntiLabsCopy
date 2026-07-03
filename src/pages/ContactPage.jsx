import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { supabase } from '../supabase';
import './ContactPage.css';

function RevealSection({ children, className = '' }) {
    const { ref, visible } = useScrollReveal({ threshold: 0.08 });
    return (
        <div ref={ref} className={`cp__reveal ${visible ? 'cp__reveal--in' : ''} ${className}`}>
            {children}
        </div>
    );
}

export default function ContactPage() {
    const { ref: heroRef, visible: heroVisible } = useScrollReveal({ threshold: 0.01 });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('enquiry')
                .insert([
                    {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        company: formData.company,
                        message: formData.message
                    }
                ]);

            if (error) throw error;

            console.log('Form Data Submitted to Supabase');
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 5000);
            setFormData({ name: '', email: '', phone: '', company: '', message: '' });
        } catch (error) {
            console.error('Error saving enquiry:', error);
            alert('There was an error submitting your form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <SEO title="Contact Us" description="Get in touch with AntiLabs to discuss your project, request a consultation, or explore our services." canonicalUrl="/contact" />
            <Navbar />
            <main className="cp">
                {/* ── Hero ── */}
                <section className="cp__hero">
                    <div className="cp__hero-bg" />
                    <div
                        ref={heroRef}
                        className={`cp__hero-content container ${heroVisible ? 'cp__hero-content--in' : ''}`}
                    >
                        <span className="section-eyebrow">Get in Touch</span>
                        <h1 className="cp__hero-h1">
                            Let's Build Something<br />
                            <span className="gradient-text">Extraordinary</span>
                        </h1>
                        <p className="cp__hero-sub">
                            Ready to level up your digital infrastructure? Fill out the form below
                            and our senior engineering team will be in touch within 24 hours.
                        </p>
                    </div>
                </section>

                {/* ── Form Section ── */}
                <section className="cp__form-section section-py">
                    <div className="container cp__form-grid">
                        <RevealSection className="cp__form-info">
                            <span className="section-eyebrow">Contact Info</span>
                            <h2 className="cp__section-h2">We are here to help.</h2>
                            <p className="cp__info-desc">
                                Whether you're a startup looking to scale or an enterprise modernizing mission-critical systems, AntiLabs brings the expertise you need.
                            </p>
                            <div className="cp__info-cards">
                                <div className="cp__info-card glass-card">
                                    <div className="cp__info-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="cp__info-label">Email Us</h4>
                                        <a href="mailto:contact@antilabs.in" className="cp__info-link">contact@antilabs.in</a>
                                    </div>
                                </div>

                            </div>
                        </RevealSection>

                        <RevealSection className="cp__form-container glass-card">
                            {submitted ? (
                                <div className="cp__success-message">
                                    <div className="cp__success-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </div>
                                    <h3>Message Received!</h3>
                                    <p>Thank you for reaching out. Our team will get back to you shortly.</p>
                                </div>
                            ) : (
                                <form className="cp__form" onSubmit={handleSubmit}>
                                    <fieldset disabled={isSubmitting} style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div className="cp__form-row">
                                            <div className="cp__form-group">
                                                <label htmlFor="name">Full Name *</label>
                                                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
                                            </div>
                                            <div className="cp__form-group">
                                                <label htmlFor="email">Email Address *</label>
                                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
                                            </div>
                                        </div>
                                        <div className="cp__form-row">
                                            <div className="cp__form-group">
                                                <label htmlFor="phone">Phone Number</label>
                                                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 xxxxx-xxxxx" />
                                            </div>
                                            <div className="cp__form-group">
                                                <label htmlFor="company">Company</label>
                                                <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Your Company Ltd." />
                                            </div>
                                        </div>
                                        <div className="cp__form-group">
                                            <label htmlFor="message">Message *</label>
                                            <textarea id="message" name="message" value={formData.message} onChange={handleChange} required placeholder="How can we help you?" rows="5"></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-primary cp__submit-btn">
                                            {isSubmitting ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </fieldset>
                                </form>
                            )}
                        </RevealSection>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
