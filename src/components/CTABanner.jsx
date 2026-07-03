import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './CTABanner.css';

// Geometric shape components — navy stroke on light bg
const Hexagon = ({ size, x, y, opacity }) => (
    <svg
        className="cta__shape"
        width={size}
        height={size}
        viewBox="0 0 60 60"
        style={{ left: x, top: y, opacity }}
    >
        <polygon points="30,2 55,16 55,44 30,58 5,44 5,16" fill="none" stroke="rgba(0,99,160,0.6)" strokeWidth="1" />
    </svg>
);

export default function CTABanner() {
    const { ref, visible } = useScrollReveal();

    return (
        <section id="contact" className="cta-banner section-py">
            {/* Background */}
            <div className="cta-banner__bg" />

            {/* Floating shapes */}
            <Hexagon size={80} x="4%" y="10%" opacity={0.12} />
            <Hexagon size={120} x="8%" y="55%" opacity={0.07} />
            <Hexagon size={60} x="88%" y="15%" opacity={0.1} />
            <Hexagon size={100} x="84%" y="60%" opacity={0.08} />
            <Hexagon size={40} x="50%" y="5%" opacity={0.08} />

            {/* Circuit node dots */}
            <div className="cta-banner__dots">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="cta-banner__dot" style={{ animationDelay: `${i * 0.4}s` }} />
                ))}
            </div>

            <div className="container cta-banner__content" ref={ref}>
                <div className={`cta-banner__text ${visible ? 'animate-fade-up' : ''}`}>
                    <span className="section-eyebrow">Start Today</span>
                    <h2 className="cta-banner__title">
                        Ready to Future-Proof<br />
                        <span className="gradient-text">Your IT?</span>
                    </h2>
                    <p className="cta-banner__sub">
                        Join 40+ enterprises who trust AntiLabs to architect, secure, and operate their digital backbone. No long sales cycles — let's talk this week.
                    </p>
                    <div className="cta-banner__ctas">
                        <Link to="/contact" className="btn btn-primary btn-lg">Book a Free Discovery Call</Link>
                        <Link to="/services" className="btn btn-secondary btn-lg">Explore Services</Link>
                    </div>
                    <div className="cta-banner__trust">
                        <div className="cta-banner__trust-item">
                            <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="rgba(0,200,255,0.2)" /><path d="M4 7l2 2 4-4" stroke="#00C8FF" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            No commitment required
                        </div>
                        <div className="cta-banner__trust-item">
                            <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="rgba(0,200,255,0.2)" /><path d="M4 7l2 2 4-4" stroke="#00C8FF" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            Response within 24 hours
                        </div>
                        <div className="cta-banner__trust-item">
                            <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="rgba(0,200,255,0.2)" /><path d="M4 7l2 2 4-4" stroke="#00C8FF" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            NDA available on request
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
