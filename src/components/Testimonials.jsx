import React, { useState, useEffect } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { supabase } from '../supabase';
import './Testimonials.css';

// Accent color palette — cycles through based on index
const ACCENT_COLORS = [
    '#00C8FF',
    '#818CF8',
    '#34D399',
    '#F59E0B',
    '#EF4444',
    '#3B82F6',
    '#A78BFA',
    '#FB923C',
];

/** Derive two-letter initials from a full name */
function getInitials(name = '') {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const QuoteIcon = ({ color }) => (
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
        <path
            d="M0 28V16.8C0 11.2 1.96 6.72 5.88 3.36 9.8 1.12 14.28 0 19.32 0v5.6c-3.36 0-6.16.84-8.4 2.52-2.24 1.68-3.36 4.2-3.36 7.56V17.36H16.24V28H0zm20 0V16.8c0-5.6 1.96-10.08 5.88-13.44C29.8 1.12 34.28 0 39.32 0v5.6c-3.36 0-6.16.84-8.4 2.52-2.24 1.68-3.36 4.2-3.36 7.56V17.36H36.24V28H20z"
            fill={color}
            fillOpacity="0.35"
        />
    </svg>
);

export default function Testimonials() {
    const { ref, visible } = useScrollReveal();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchTestimonials() {
            try {
                const { data, error: sbError } = await supabase
                    .from('testimonials')
                    .select('id, quote, author_name, designation, company_name')
                    .order('created_at', { ascending: true });

                if (sbError) throw sbError;
                setTestimonials(data || []);
            } catch (err) {
                console.error('Failed to load testimonials:', err);
                setError('Could not load testimonials.');
            } finally {
                setLoading(false);
            }
        }

        fetchTestimonials();
    }, []);

    // Enrich each row with derived display fields
    const enriched = testimonials.map((t, idx) => ({
        ...t,
        initials: getInitials(t.author_name),
        color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
    }));

    return (
        <section id="testimonials" className="testimonials section-py">
            <div className="container" ref={ref}>
                <div className={`testimonials__header ${visible ? 'animate-fade-up' : ''}`}>
                    <span className="section-eyebrow">Client Voices</span>
                    <h2 className="section-title">What Our Clients Say</h2>
                </div>

                {loading && (
                    <div className="testimonials__state">
                        <div className="testimonials__spinner" />
                        <p>Loading testimonials…</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="testimonials__state testimonials__state--error">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && enriched.length === 0 && (
                    <div className="testimonials__state">
                        <p>No testimonials yet. Check back soon!</p>
                    </div>
                )}

                {!loading && !error && enriched.length > 0 && (
                    <div className="testimonials__marquee-container">
                        <div className="testimonials__marquee-track">
                            {/* Duplicate for seamless infinite scroll */}
                            {[...enriched, ...enriched].map((t, i) => (
                                <div
                                    key={`${t.id}-${i}`}
                                    className="glass-card testimonials__card"
                                    style={{ '--t-color': t.color }}
                                >
                                    <QuoteIcon color={t.color} />
                                    <p className="testimonials__quote">"{t.quote}"</p>
                                    <div className="testimonials__author">
                                        <div
                                            className="testimonials__avatar"
                                            style={{ borderColor: t.color }}
                                        >
                                            <span style={{ color: t.color }}>{t.initials}</span>
                                        </div>
                                        <div className="testimonials__author-info">
                                            <div className="testimonials__name">{t.author_name}</div>
                                            <div className="testimonials__role">
                                                {t.designation && `${t.designation}`}
                                                {t.designation && t.company_name && ' · '}
                                                {t.company_name && (
                                                    <span className="testimonials__company">
                                                        {t.company_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
