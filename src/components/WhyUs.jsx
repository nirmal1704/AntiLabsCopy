import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './WhyUs.css';

const differentiators = [
    {
        title: 'Enterprise-Grade Security First',
        desc: 'Every solution is architected with ISO 27001-compliant security controls baked in from day one, not bolted on.',
    },
    {
        title: 'Dedicated Delivery Teams',
        desc: 'You get a named team of engineers, architects, and a PM — not rotating contractors or black-box offshore shops.',
    },
    {
        title: 'Outcome-Based Engagements',
        desc: 'We define measurable KPIs upfront and are accountable to them. Your success is literally our contract.',
    },
    {
        title: 'Technology-Agnostic Advice',
        desc: 'No vendor kickbacks, no platform favoritism. We recommend what\'s genuinely best for your use case.',
    },
    {
        title: '24/7 NOC & Escalation Path',
        desc: 'Round-the-clock network operations, a direct hotline to senior engineers, and a 15-minute response SLA.',
    },
];

const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="9" fill="rgba(0,200,255,0.12)" />
        <path d="M5 9.5l2.5 2.5 5.5-5.5" stroke="#00C8FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Isometric server illustration using SVG — light-theme version
const ServerIllustration = () => (
    <div className="why__illustration">
        <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="why__iso-svg">
            {/* Base platform */}
            <g opacity="0.9">
                <ellipse cx="240" cy="360" rx="160" ry="30" fill="rgba(0,153,200,0.06)" stroke="rgba(0,153,200,0.2)" strokeWidth="1" />
            </g>

            {/* Server unit 1 */}
            <g transform="translate(130, 180)">
                <path d="M60 0 L160 0 L220 30 L120 30 Z" fill="rgba(240,244,255,0.95)" stroke="rgba(0,153,200,0.3)" strokeWidth="1" />
                <path d="M160 0 L220 30 L220 80 L160 50 Z" fill="rgba(224,232,255,0.95)" stroke="rgba(0,153,200,0.2)" strokeWidth="1" />
                <path d="M60 0 L120 30 L120 80 L60 50 Z" fill="rgba(232,238,255,0.95)" stroke="rgba(0,153,200,0.25)" strokeWidth="1" />
                <circle cx="75" cy="22" r="3" fill="#0099C8" opacity="0.9" />
                <circle cx="85" cy="22" r="3" fill="#34D399" opacity="0.9" />
                <circle cx="95" cy="22" r="3" fill="#34D399" opacity="0.9" />
                <rect x="65" y="33" width="40" height="3" rx="1.5" fill="rgba(0,153,200,0.25)" />
                <rect x="65" y="39" width="30" height="3" rx="1.5" fill="rgba(0,153,200,0.15)" />
            </g>

            {/* Server unit 2 */}
            <g transform="translate(130, 240)">
                <path d="M60 0 L160 0 L220 30 L120 30 Z" fill="rgba(240,244,255,0.95)" stroke="rgba(0,153,200,0.25)" strokeWidth="1" />
                <path d="M160 0 L220 30 L220 80 L160 50 Z" fill="rgba(224,232,255,0.95)" stroke="rgba(0,153,200,0.18)" strokeWidth="1" />
                <path d="M60 0 L120 30 L120 80 L60 50 Z" fill="rgba(232,238,255,0.95)" stroke="rgba(0,153,200,0.2)" strokeWidth="1" />
                <circle cx="75" cy="22" r="3" fill="#34D399" opacity="0.9" />
                <circle cx="85" cy="22" r="3" fill="#34D399" opacity="0.9" />
                <circle cx="95" cy="22" r="3" fill="#FBBF24" opacity="0.9" />
                <rect x="65" y="33" width="50" height="3" rx="1.5" fill="rgba(0,153,200,0.2)" />
                <rect x="65" y="39" width="35" height="3" rx="1.5" fill="rgba(0,153,200,0.12)" />
            </g>

            {/* Server unit 3 — smaller, top-right */}
            <g transform="translate(230, 130)">
                <path d="M40 0 L120 0 L160 22 L80 22 Z" fill="rgba(240,244,255,0.95)" stroke="rgba(0,153,200,0.35)" strokeWidth="1" />
                <path d="M120 0 L160 22 L160 60 L120 38 Z" fill="rgba(224,232,255,0.95)" stroke="rgba(0,153,200,0.22)" strokeWidth="1" />
                <path d="M40 0 L80 22 L80 60 L40 38 Z" fill="rgba(232,238,255,0.95)" stroke="rgba(0,153,200,0.25)" strokeWidth="1" />
                <circle cx="52" cy="15" r="2.5" fill="#0099C8" opacity="0.8" />
                <circle cx="60" cy="15" r="2.5" fill="#34D399" opacity="0.8" />
            </g>

            {/* Connection lines */}
            <path d="M310 142 Q360 180 350 240" stroke="rgba(0,153,200,0.3)" strokeWidth="1" strokeDasharray="4,4" />
            <path d="M350 240 Q380 280 360 310" stroke="rgba(0,153,200,0.2)" strokeWidth="1" strokeDasharray="4,4" />

            {/* Floating badges — white cards with dark navy text */}
            <g transform="translate(340, 100)">
                <rect x="0" y="0" width="110" height="32" rx="6" fill="#FFFFFF" stroke="rgba(0,153,200,0.4)" strokeWidth="1" filter="drop-shadow(0 2px 8px rgba(10,15,44,0.1))" />
                <circle cx="16" cy="16" r="5" fill="rgba(0,153,200,0.12)" stroke="#0099C8" strokeWidth="1" />
                <path d="M13 16l2 2 3.5-3.5" stroke="#0099C8" strokeWidth="1.2" strokeLinecap="round" />
                <text x="28" y="20" fontFamily="Space Grotesk, sans-serif" fontSize="10" fontWeight="600" fill="#0A0F2C">99.9% Uptime</text>
            </g>

            <g transform="translate(50, 140)" className="animate-float">
                <rect x="0" y="0" width="120" height="36" rx="6" fill="#FFFFFF" stroke="rgba(52,211,153,0.5)" strokeWidth="1" filter="drop-shadow(0 2px 8px rgba(10,15,44,0.1))" />
                <circle cx="16" cy="18" r="5" fill="rgba(52,211,153,0.15)" stroke="#34D399" strokeWidth="1" />
                <text x="28" y="16" fontFamily="Space Grotesk, sans-serif" fontSize="10" fontWeight="600" fill="#0A0F2C">ISO 27001</text>
                <text x="28" y="28" fontFamily="Space Grotesk, sans-serif" fontSize="9" fill="#3D4A6B">Certified</text>
            </g>

            <g transform="translate(310, 300)">
                <rect x="0" y="0" width="108" height="32" rx="6" fill="#FFFFFF" stroke="rgba(251,191,36,0.5)" strokeWidth="1" filter="drop-shadow(0 2px 8px rgba(10,15,44,0.1))" />
                <circle cx="16" cy="16" r="5" fill="rgba(251,191,36,0.15)" stroke="#FBBF24" strokeWidth="1" />
                <text x="28" y="20" fontFamily="Space Grotesk, sans-serif" fontSize="10" fontWeight="600" fill="#0A0F2C">SOC 2 Type II</text>
            </g>
        </svg>
    </div>
);

export default function WhyUs() {
    const { ref, visible } = useScrollReveal();

    return (
        <section id="about" className="why">
            <div className="why__inner" ref={ref}>
                {/* Left — navy */}
                <div className="why__left">
                    <div className="container-half">
                        <span className="section-eyebrow">Why AntiLabs</span>
                        <h2 className={`section-title why__title ${visible ? 'animate-fade-up' : ''}`}>
                            Why teams choose<br />
                            <span className="gradient-text">AntiLabs</span>
                        </h2>
                        <p className={`section-sub ${visible ? 'animate-fade-up' : ''}`} style={{ animationDelay: '0.1s' }}>
                            We're not an IT agency. We're an engineering partner that embeds into your business, understands your constraints, and ships infrastructure that outlasts the engagement.
                        </p>
                        <div className="why__list">
                            {differentiators.map((d, i) => (
                                <div
                                    key={d.title}
                                    className={`why__item ${visible ? 'animate-fade-up' : ''}`}
                                    style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                                >
                                    <div className="why__check"><CheckIcon /></div>
                                    <div>
                                        <div className="why__item-title">{d.title}</div>
                                        <div className="why__item-desc">{d.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right — charcoal */}
                <div className="why__right">
                    <ServerIllustration />
                </div>
            </div>
        </section>
    );
}
