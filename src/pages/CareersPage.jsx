import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useScrollReveal } from '../hooks/useScrollReveal';
import SEO from '../components/SEO';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import ApplicationModal from '../components/ApplicationModal';
import './CareersPage.css';

/* ── Data ──────────────────────────────────── */
const perks = [
    {
        icon: 'bi bi-globe2',
        title: 'Remote-First',
        desc: 'Work from anywhere. We care about output, not office hours.',
    },
    {
        icon: 'bi bi-lightning-charge',
        title: 'Modern Stack',
        desc: 'No legacy nightmares. We pick the right tool for the right job.',
    },
    {
        icon: 'bi bi-person-check',
        title: 'Ownership Culture',
        desc: 'You own your work end-to-end. No handoffs to QA teams or PMs.',
    },
    {
        icon: 'bi bi-graph-up-arrow',
        title: 'Fast Growth',
        desc: 'Early team — your impact is visible and your growth is fast.',
    },
];

/* ── Role Card ─────────────────────────────── */
function RoleCard({ role, onApply }) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`cp__role-card ${open ? 'cp__role-card--open' : ''}`}>
            <div className="cp__role-header" onClick={() => setOpen(!open)}>
                <div className="cp__role-left">
                    <div className="cp__role-title-wrap">
                        <h3 className="cp__role-title">{role.title}</h3>
                        {role.duration && <span className="cp__role-duration">{role.duration}</span>}
                    </div>
                    <div className="cp__role-meta">
                        <span className="cp__role-team">{role.type}</span>
                        {role.work_location && (
                            <>
                                <span className="cp__role-dot">·</span>
                                <span>{role.work_location}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="cp__role-right">
                    {role.compensation && (
                        <div className="cp__role-compensation">
                            {role.compensation}
                        </div>
                    )}
                    <button
                        className="btn btn-primary cp__role-enroll-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onApply(role);
                        }}
                    >
                        Enroll Now
                    </button>
                    <div className="cp__role-chevron">{open ? '−' : '+'}</div>
                </div>
            </div>
            {open && (
                <div className="cp__role-body">
                    <FormattedDescription text={role.description} />
                </div>
            )}
        </div>
    );
}

/* ── Page ──────────────────────────────────── */
function RevealSection({ children, className = '' }) {
    const { ref, visible } = useScrollReveal({ threshold: 0.08 });
    return (
        <div ref={ref} className={`cp__reveal ${visible ? 'cp__reveal--in' : ''} ${className}`}>
            {children}
        </div>
    );
}

/* ── Formatted Description ─────────────────── */
function FormattedDescription({ text }) {
    if (!text) return null;

    // Detect if the text uses inline headers ending in colons
    const headers = [
        "Program Overview",
        "Training Details",
        "What You Will Learn",
        "Selection & Internship Opportunity",
        "Selection Criteria",
        "Certification & Benefits",
        "Additional Information",
        "Responsibilities",
        "Requirements",
        "About the Role",
        "Qualifications",
        "Benefits",
        "Perks",
        "Key Responsibilities",
        "Who You Are"
    ];

    const escapedHeaders = headers.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedHeaders.join('|')}):`, 'gi');

    // Split text based on headers. The split array will have text, header, text, header...
    const parts = text.split(regex);

    // Default rendering with pre-wrap if no headers match
    if (parts.length <= 1) {
        return <div className="cp__role-desc" style={{ whiteSpace: 'pre-wrap' }}>{text}</div>;
    }

    const blocks = [];
    if (parts[0].trim()) {
        blocks.push({ type: 'intro', content: parts[0].trim() });
    }

    for (let i = 1; i < parts.length; i += 2) {
        const header = parts[i];
        const content = parts[i + 1] ? parts[i + 1].trim() : '';
        blocks.push({ type: 'section', header, content });
    }

    return (
        <div className="cp__role-desc-formatted">
            {blocks.map((block, idx) => (
                <div key={idx} className="cp__role-section">
                    {block.type === 'section' && (
                        <h4 className="cp__role-section-h4">{block.header}</h4>
                    )}
                    <div className="cp__role-section-p" style={{ whiteSpace: 'pre-wrap' }}>
                        {block.content}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function CareersPage() {
    const hero = useScrollReveal({ threshold: 0.01 });
    const [openRoles, setOpenRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applyingRole, setApplyingRole] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleApplyClick = (role) => {
        setApplyingRole(role);
    };

    useEffect(() => {
        async function fetchRoles() {
            const { data, error } = await supabase
                .from('Careers')
                .select('*')
                .eq('status', 'Open')
                .order('created_at', { ascending: false });

            if (!error && data) {
                const sortedData = [...data].sort((a, b) => {
                    const valA = a.compensation ? parseInt(a.compensation.replace(/\D/g, ''), 10) || 0 : 0;
                    const valB = b.compensation ? parseInt(b.compensation.replace(/\D/g, ''), 10) || 0 : 0;

                    if (valB !== valA) {
                        return valB - valA;
                    }
                    return new Date(b.created_at) - new Date(a.created_at);
                });
                setOpenRoles(sortedData);
            }
            setLoading(false);
        }
        fetchRoles();
    }, []);

    return (
        <>
            <SEO title="Careers" description="Join AntiLabs and build digital infrastructure that enterprises trust." canonicalUrl="/careers" />
            <Navbar />
            <main className="cp">

                {/* ── Hero ── */}
                <section className="cp__hero">
                    <div className="cp__hero-bg" />
                    <div
                        ref={hero.ref}
                        className={`cp__hero-content container ${hero.visible ? 'cp__hero-content--in' : ''}`}
                    >
                        <span className="section-eyebrow">Careers at AntiLabs</span>
                        <h1 className="cp__hero-h1">
                            Build Things That<br />
                            <span className="gradient-text">Actually Matter.</span>
                        </h1>
                        <p className="cp__hero-sub">
                            We're a small, senior team working on hard problems for ambitious clients.
                            If you're done with bureaucracy and want your work to have real impact — you'll fit right in.
                        </p>
                        <a href="#open-roles" className="btn btn-primary btn-lg">See Open Roles ↓</a>
                    </div>
                </section>

                {/* ── Perks ── */}
                <section className="cp__perks section-py">
                    <div className="container">
                        <RevealSection>
                            <div className="cp__perks-header">
                                <span className="section-eyebrow">Why AntiLabs</span>
                                <h2 className="cp__section-h2">A Place Where Engineers Thrive</h2>
                            </div>
                        </RevealSection>
                        <div className="cp__perks-grid">
                            {perks.map((p, i) => (
                                <RevealSection key={p.title}>
                                    <div className="cp__perk-card glass-card">
                                        <i className={`cp__perk-icon ${p.icon}`}></i>
                                        <h4 className="cp__perk-title">{p.title}</h4>
                                        <p className="cp__perk-desc">{p.desc}</p>
                                    </div>
                                </RevealSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Open Roles ── */}
                <section id="open-roles" className="cp__roles section-py">
                    <div className="container">
                        <RevealSection>
                            <div className="cp__roles-header">
                                <span className="section-eyebrow">Open Positions</span>
                                <h2 className="cp__section-h2">We're Hiring Across {loading ? "..." : openRoles.length} Roles</h2>
                                <p className="cp__roles-sub">
                                    All roles are remote-friendly. We hire for attitude and craft — not just credentials.
                                </p>
                            </div>
                        </RevealSection>
                        <div className="cp__roles-list">
                            {loading ? (
                                <p style={{ textAlign: 'center', padding: '2rem' }}>Loading open positions...</p>
                            ) : openRoles.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '2rem' }}>No open positions at the moment, but feel free to send a general application!</p>
                            ) : (
                                openRoles.map(role => (
                                    <RoleCard key={role.posting_id} role={role} onApply={handleApplyClick} />
                                ))
                            )}
                        </div>
                    </div>
                </section>



                {/* ── Bottom CTA ── */}
                <section className="cp__cta-strip">
                    <div className="container cp__cta-inner">
                        <h2 className="cp__cta-h2">Questions about working at AntiLabs?</h2>
                        <p className="cp__cta-sub">Reach us at <a href="mailto:careers@antilabs.in" className="cp__cta-link">careers@antilabs.in</a> — we reply to every message.</p>
                        <Link to="/about" className="btn btn-primary btn-lg" style={{ background: '#fff', color: 'var(--primary)', borderColor: '#fff' }}>
                            Learn More About Us →
                        </Link>
                    </div>
                </section>

            </main>
            <Footer />

            {applyingRole && (
                <ApplicationModal
                    role={applyingRole}
                    onClose={() => setApplyingRole(null)}
                />
            )}
        </>
    );
}
