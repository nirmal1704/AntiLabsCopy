import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import { useScrollReveal } from '../hooks/useScrollReveal';

const stats = [
    { value: '150+', label: 'Projects' },
    { value: '40+', label: 'Enterprise Clients' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '24/7', label: 'NOC Support' },
];

// Animated SVG circuit grid overlay — light-theme version (dark navy strokes)
const CircuitGrid = () => (
    <svg
        className="hero__circuit"
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
    >
        <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(10,15,44,0.06)" strokeWidth="0.5" />
            </pattern>
            <pattern id="circuit" width="120" height="120" patternUnits="userSpaceOnUse">
                <circle cx="0" cy="0" r="2" fill="rgba(0,153,200,0.15)" />
                <circle cx="120" cy="0" r="2" fill="rgba(0,153,200,0.15)" />
                <circle cx="0" cy="120" r="2" fill="rgba(0,153,200,0.15)" />
                <circle cx="60" cy="60" r="1.5" fill="rgba(0,153,200,0.12)" />
                <path d="M0 0 L30 0 L30 30 M60 60 L90 60 L90 90 L120 90" fill="none" stroke="rgba(10,15,44,0.07)" strokeWidth="0.8" />
                <path d="M120 0 L90 0 L90 30 M0 120 L30 120 L30 90" fill="none" stroke="rgba(10,15,44,0.06)" strokeWidth="0.8" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>
);

export default function Hero() {
    const step1 = useScrollReveal({ threshold: 0.01 }); // eyebrow + h1
    const step2 = useScrollReveal({ threshold: 0.01 }); // sub + CTAs
    const step3 = useScrollReveal({ threshold: 0.01 }); // stats

    return (
        <section id="home" className="hero">
            {/* Light gradient background — no video */}
            <div className="hero__overlay-navy" />
            <CircuitGrid />

            {/* Content */}
            <div className="hero__content container">
                <div className="hero__text">
                    {/* Step 1 — eyebrow + headline */}
                    <div ref={step1.ref} className={`hero__reveal ${step1.visible ? 'hero__reveal--in' : ''}`}>
                        <span className="section-eyebrow hero__eyebrow">Next-Gen IT Solutions</span>
                        <h1 className="hero__h1">
                            AntiLabs - Building the Future<br />
                            <span className="hero__h1--accent">with Technology</span>
                        </h1>
                    </div>

                    {/* Step 2 — subtext + CTAs */}
                    <div ref={step2.ref} className={`hero__reveal hero__reveal--delay1 ${step2.visible ? 'hero__reveal--in' : ''}`}>
                        <p className="hero__sub">
                            Enterprise cybersecurity, cloud architecture, and custom software — built to scale with your ambitions.
                        </p>
                        <div className="hero__ctas">
                            <Link to="/services" className="btn btn-primary btn-lg">
                                Start a Project →
                            </Link>
                            <Link to="/testimonials" className="btn btn-secondary btn-lg">
                                Testimonials
                            </Link>
                        </div>
                    </div>

                    {/* Step 3 — stats */}
                    <div ref={step3.ref} className={`hero__reveal hero__reveal--delay2 ${step3.visible ? 'hero__reveal--in' : ''}`}>
                        <div className="hero__stats">
                            {stats.map((s, i) => (
                                <React.Fragment key={s.label}>
                                    <div className="hero__stat">
                                        <span className="hero__stat-value">{s.value}</span>
                                        <span className="hero__stat-label">{s.label}</span>
                                    </div>
                                    {i < stats.length - 1 && <div className="hero__stat-divider" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="hero__scroll">
                <svg className="hero__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
                <span className="hero__scroll-text">Scroll to explore</span>
            </div>

            {/* Bottom cyan gradient line */}
            <div className="hero__bottom-line" />
        </section>
    );
}
