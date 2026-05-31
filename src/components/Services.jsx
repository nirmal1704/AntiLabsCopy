import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Services.css';

const services = [
    {
        tab: 'cybersecurity',
        icon: (
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 2L2 9l14 7 14-7L16 2z" />
                <path d="M2 23l14 7 14-7" />
                <path d="M2 16l14 7 14-7" />
            </svg>
        ),
        title: 'Cybersecurity & Zero Trust',
        desc: 'Harden your perimeter with AI-driven threat detection, SIEM integration, and Zero Trust architecture frameworks.',
    },
    {
        tab: 'cloud',
        icon: (
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="8" width="28" height="18" rx="2" />
                <path d="M8 8V6a2 2 0 012-2h12a2 2 0 012 2v2" />
                <path d="M16 17v4m-4 0h8" />
                <circle cx="16" cy="14" r="2" />
            </svg>
        ),
        title: 'Cloud Infrastructure & DevOps',
        desc: 'Architect scalable AWS, GCP, and Azure environments with full CI/CD pipelines, IaC, and SRE best practices.',
    },
    {
        tab: 'software',
        icon: (
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="7 8 2 12 7 16" />
                <polyline points="25 8 30 12 25 16" />
                <line x1="18" y1="5" x2="14" y2="23" />
            </svg>
        ),
        title: 'Custom Software Development',
        desc: 'From micro-frontends to distributed backends — we ship production software with clean architecture and rigorous testing.',
    },
    {
        tab: 'consulting',
        icon: (
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="16" cy="16" r="14" />
                <path d="M16 8v8l5 3" />
            </svg>
        ),
        title: 'IT Consulting & Strategy',
        desc: 'Board-level technology advisory — digital transformation roadmaps, vendor evaluation, and CTO-as-a-Service engagements.',
    },
    {
        tab: 'managed',
        icon: (
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="28" height="20" rx="2" />
                <path d="M2 10h28" />
                <path d="M8 17h2m4 0h2m4 0h2" />
                <path d="M16 28v-4" />
                <path d="M10 28h12" />
            </svg>
        ),
        title: 'Managed IT Services',
        desc: '24/7 NOC operations, proactive monitoring, end-user support, and guaranteed SLAs across your entire IT estate.',
    },
    {
        tab: 'data',
        icon: (
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 16h6l3-9 4 18 3-9h4" />
                <path d="M2 8h2m24 0h2" />
                <rect x="2" y="4" width="28" height="24" rx="2" />
            </svg>
        ),
        title: 'Data Engineering & Analytics',
        desc: 'Build real-time data pipelines, lakehouse architectures, and ML-ready data platforms that turn raw data into decision intelligence.',
    },
];

function ServiceCard({ s, index }) {
    // Individual observer per card for row-by-row / card-by-card trigger
    const { ref, visible } = useScrollReveal({
        threshold: 0.08,
        rootMargin: '0px 0px -60px 0px'
    });

    // Stagger layout calculation for column delay sequences (left-to-right staggered pop)
    const delay = visible ? `${(index % 3) * 0.12}s` : '0s';

    return (
        <div
            ref={ref}
            className={`glass-card services__card ${visible ? 'services__card--revealed' : 'services__card--hidden'}`}
            style={{ transitionDelay: delay }}
        >
            <div className="services__card-icon">{s.icon}</div>
            <h3 className="services__card-title">{s.title}</h3>
            <p className="services__card-desc">{s.desc}</p>
            <Link
                to={`/services?tab=${s.tab}`}
                className="services__card-link"
            >
                Learn more <span className="services__card-arrow">→</span>
            </Link>
        </div>
    );
}

export default function Services() {
    const { ref: headerRef, visible: headerVisible } = useScrollReveal({ threshold: 0.1 });

    return (
        <section id="services" className="services section-py">
            <div className="services__label">
                <span>OUR SERVICES</span>
            </div>

            <div className="container">
                <div className="services__header" ref={headerRef}>
                    <h2 className={`section-title ${headerVisible ? 'animate-fade-up' : 'reveal-hidden'}`}>
                        Built for Complexity.<br />
                        <span className="gradient-text">Delivered with Precision.</span>
                    </h2>
                    <p 
                        className={`section-sub services__sub ${headerVisible ? 'animate-fade-up' : 'reveal-hidden'}`} 
                        style={{ animationDelay: '0.15s' }}
                    >
                        Every engagement is backed by deep domain expertise, agile execution, and an obsession with measurable outcomes.
                    </p>
                </div>

                <div className="services__grid">
                    {services.map((s, i) => (
                        <ServiceCard key={s.title} s={s} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
