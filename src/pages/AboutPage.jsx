import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useScrollReveal } from '../hooks/useScrollReveal';
import SEO from '../components/SEO';
import aryaImg from '../assets/arya_img.png';
import './AboutPage.css';

/* ── Section component for scroll reveal ───────────────────────── */
function RevealSection({ children, className = '' }) {
    const { ref, visible } = useScrollReveal({ threshold: 0.08 });
    return (
        <div ref={ref} className={`ap__reveal ${visible ? 'ap__reveal--in' : ''} ${className}`}>
            {children}
        </div>
    );
}

const stats = [
    { value: '2+', label: 'Years Building' },
    { value: '150+', label: 'Milestones Shipped' },
    { value: '40+', label: 'Happy Clients' },
    { value: '99%', label: 'Retention Rate' },
];

const manifestoItems = [
    {
        badge: 'Zero Overhead',
        title: 'Direct Builder Access',
        desc: 'Speak directly to the engineers solving your problems. No translation layers, no junior developers hidden behind project managers.'
    },
    {
        badge: '100% Freedom',
        title: 'True Code Ownership',
        desc: 'You own 100% of the repository from day one. No proprietary wrappers, no vendor lock-in, just clean, production-ready code.'
    },
    {
        badge: 'Production-Grade',
        title: 'Binary Quality Standard',
        desc: 'Reliability is not optional. Every system we deploy undergoes rigorous automated testing, performance profiling, and security audits.'
    }
];

const timelineEvents = [
    {
        year: '2024',
        title: 'The Spark',
        desc: 'Arya Sharma establishes AntiLabs out of sheer frustration with bloated agencies. The mission: build an elite tech partnership where senior builders talk directly to clients.'
    },
    {
        year: '2025',
        title: '150+ Milestones Shipped',
        desc: 'AntiLabs scales its operations, shipping critical infrastructure, robust API platforms, and high-conversion web apps for startups and enterprises globally.'
    },
    {
        year: '2026',
        title: 'Setting the Frontier',
        desc: 'Now recognized as a premier engineering partner, AntiLabs continues to push boundaries in performance, security, and developer efficiency, staying at the absolute cutting edge.'
    }
];

const LinkedInIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
);

const GithubIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
    </svg>
);

export default function AboutPage() {
    const hero = useScrollReveal({ threshold: 0.01 });

    const breadcrumbs = [
        { name: "Home", url: "/" },
        { name: "About AntiLabs", url: "/about" }
    ];

    return (
        <>
            <SEO 
                title="About AntiLabs" 
                description="Learn about AntiLabs, a leading technology company specializing in web development, AI solutions, and software engineering. AntiLabs builds digital infrastructure that enterprises trust."
                canonicalUrl="/about"
                breadcrumbs={breadcrumbs}
            />
            <Navbar />
            <main className="ap">

                {/* ── Hero ── */}
                <section className="ap__hero">
                    <div className="ap__hero-bg" />
                    <div
                        ref={hero.ref}
                        className={`ap__hero-content container ${hero.visible ? 'ap__hero-content--in' : ''}`}
                    >
                        <span className="section-eyebrow">The Anti-Agency</span>
                        <h1 className="ap__hero-h1">
                            We Don't Build Software.<br />
                            <span className="gradient-text">We Engineer Advantages.</span>
                        </h1>
                        <p className="ap__hero-sub">
                            AntiLabs is an elite engineering collective founded to dismantle the traditional, bloated outsourcing paradigm. We combine deep technical expertise with direct communication, bringing a founder's sense of ownership to every line of code.
                        </p>
                    </div>
                </section>

                {/* ── Founder Story ── */}
                <section className="ap__founder section-py">
                    <div className="container ap__founder-grid">
                        <RevealSection className="ap__founder-visual">
                            <div className="ap__founder-card-wrap">
                                <div className="ap__founder-image-container">
                                    <img 
                                        src={aryaImg} 
                                        alt="Arya Sharma" 
                                        className="ap__founder-img" 
                                    />
                                    <div className="ap__founder-overlay">
                                        <div className="ap__founder-socials">
                                            <a 
                                                href="https://www.linkedin.com/in/arya-sharma-1963b030a" 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="ap__founder-social-btn"
                                                aria-label="LinkedIn"
                                            >
                                                <LinkedInIcon />
                                            </a>
                                            <a 
                                                href="https://github.com/arya-5990" 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="ap__founder-social-btn"
                                                aria-label="GitHub"
                                            >
                                                <GithubIcon />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="ap__founder-badge">Founder & Principal Engineer</div>
                            </div>
                        </RevealSection>

                        <RevealSection className="ap__founder-text">
                            <span className="section-eyebrow">Founder's Story</span>
                            <h2 className="ap__section-h2">Born from Frustration.<br />Driven by Craft.</h2>
                            <p className="ap__paragraph">
                                AntiLabs was born out of frustration. Over years of building software, our founder, Arya Sharma, observed a repeating, counterproductive pattern in the industry: enterprises paying premium rates for outsourced development, only to receive slow delivery, junior-heavy teams, and fragile codebases hidden behind layers of non-technical project managers.
                            </p>
                            <p className="ap__paragraph">
                                He realized that high-growth startups and mature companies didn't need another generic agency; they needed a high-fidelity partnership. Arya founded AntiLabs on a simple, radical premise: <strong>eliminate the middleman and let senior builders collaborate directly with decision-makers.</strong>
                            </p>
                            <p className="ap__paragraph">
                                By maintaining a highly selective team of elite senior engineers, AntiLabs ensures that every project is built with production-grade architecture, bulletproof security, and absolute performance. No phone game, no bloated processes—just pure engineering talent solving real problems.
                            </p>
                            
                            <blockquote className="ap__founder-quote-box">
                                <p className="ap__founder-quote-text">
                                    "I wanted to build a company where the people writing the code are the ones talking to the clients. When you talk to AntiLabs, you talk to engineers."
                                </p>
                                <cite className="ap__founder-quote-author">— Arya Sharma, Founder</cite>
                            </blockquote>
                        </RevealSection>
                    </div>
                </section>

                {/* ── Stats Strip ── */}
                <section className="ap__stats section-py">
                    <div className="container">
                        <div className="ap__stats-inner glass-card">
                            <div className="ap__stats-grid">
                                {stats.map((stat, i) => (
                                    <RevealSection className="ap__stat-card" key={stat.label}>
                                        <span className="ap__stat-value">{stat.value}</span>
                                        <span className="ap__stat-label">{stat.label}</span>
                                    </RevealSection>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── The Manifesto ── */}
                <section className="ap__manifesto section-py">
                    <div className="container">
                        <RevealSection className="ap__manifesto-header">
                            <span className="section-eyebrow">The Manifesto</span>
                            <h2 className="ap__section-h2">How We Do Things Differently</h2>
                            <p className="ap__section-sub">
                                The traditional outsourcing model is broken. Here is how we reject the status quo:
                            </p>
                        </RevealSection>

                        <div className="ap__manifesto-grid">
                            {manifestoItems.map((item, i) => (
                                <RevealSection key={item.title}>
                                    <div className="ap__manifesto-card glass-card" style={{ animationDelay: `${i * 0.1}s` }}>
                                        <span className="ap__manifesto-badge">{item.badge}</span>
                                        <h3 className="ap__manifesto-title">{item.title}</h3>
                                        <p className="ap__manifesto-desc">{item.desc}</p>
                                    </div>
                                </RevealSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Interactive Timeline ── */}
                <section className="ap__timeline section-py">
                    <div className="container">
                        <RevealSection className="ap__timeline-header">
                            <span className="section-eyebrow">Our Journey</span>
                            <h2 className="ap__section-h2">Key Milestones</h2>
                        </RevealSection>

                        <div className="ap__timeline-container">
                            <div className="ap__timeline-line" />
                            {timelineEvents.map((event, i) => (
                                <RevealSection key={event.year} className={`ap__timeline-item ${i % 2 === 0 ? 'ap__timeline-item--left' : 'ap__timeline-item--right'}`}>
                                    <div className="ap__timeline-marker" />
                                    <div className="ap__timeline-content glass-card">
                                        <span className="ap__timeline-year">{event.year}</span>
                                        <h3 className="ap__timeline-title">{event.title}</h3>
                                        <p className="ap__timeline-desc">{event.desc}</p>
                                    </div>
                                </RevealSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="ap__cta-strip">
                    <div className="container ap__cta-inner">
                        <h2 className="ap__cta-h2">Ready to build something exceptional?</h2>
                        <p className="ap__cta-sub">Work directly with our founder and principal builders to architect your next system.</p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Link to="/contact" className="btn btn-primary btn-lg">Get in Touch →</Link>
                            <Link to="/services" className="btn btn-secondary btn-lg" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>Our Services</Link>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
