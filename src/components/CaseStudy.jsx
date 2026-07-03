import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './CaseStudy.css';

const metrics = [
    { value: '60%', label: 'Cost Reduction' },
    { value: '3.2×', label: 'Performance Gain' },
    { value: '99.99%', label: 'Availability' },
];

// Mini dashboard mockup
const DashboardMockup = () => (
    <div className="cs__mockup">
        <div className="cs__mockup-bar">
            <span /><span /><span />
            <div className="cs__mockup-title">FinCore Analytics Dashboard</div>
        </div>
        <div className="cs__mockup-body">
            {/* Stats row */}
            <div className="cs__mock-stats">
                {[
                    { label: 'Total Processing', val: '$2.4M', up: true },
                    { label: 'Transactions/sec', val: '14,802', up: true },
                    { label: 'Infra Cost', val: '↓ 60%', up: false },
                    { label: 'Latency P99', val: '12ms', up: true },
                ].map(s => (
                    <div key={s.label} className="cs__mock-stat">
                        <div className={`cs__mock-val ${s.up ? 'cs__mock-val--up' : 'cs__mock-val--down'}`}>{s.val}</div>
                        <div className="cs__mock-lbl">{s.label}</div>
                    </div>
                ))}
            </div>
            {/* Chart placeholder */}
            <div className="cs__mock-chart">
                <div className="cs__mock-chart-label">Infrastructure Cost Over Time</div>
                <svg viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="cs__mock-svg">
                    <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00C8FF" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#00C8FF" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d="M0 70 C40 65, 60 60, 80 55 C100 50, 110 48, 130 42 C150 36, 160 30, 180 20 C200 10, 220 8, 240 10 C260 12, 280 14, 320 16" stroke="#00C8FF" strokeWidth="2" fill="none" />
                    <path d="M0 70 C40 65, 60 60, 80 55 C100 50, 110 48, 130 42 C150 36, 160 30, 180 20 C200 10, 220 8, 240 10 C260 12, 280 14, 320 16 L320 80 L0 80Z" fill="url(#chartGrad)" />
                    {/* Grid lines */}
                    {[20, 40, 60].map(y => (
                        <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    ))}
                </svg>
            </div>
            {/* Table rows */}
            <div className="cs__mock-table">
                {['Kubernetes Cluster', 'RDS Aurora', 'CDN & Edge', 'Monitoring'].map((s, i) => (
                    <div key={s} className="cs__mock-row">
                        <span className="cs__mock-row-name">{s}</span>
                        <div className="cs__mock-row-bar">
                            <div className="cs__mock-row-fill" style={{ width: `${[78, 52, 35, 22][i]}%` }} />
                        </div>
                        <span className="cs__mock-row-pct">{[78, 52, 35, 22][i]}%</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default function CaseStudy() {
    const { ref, visible } = useScrollReveal();

    return (
        <section id="case-studies" className="cs section-py">
            {/* Background image */}
            <div
                className="cs__bg"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80')` }}
            />
            <div className="cs__bg-overlay" />

            <div className="container cs__inner" ref={ref}>
                {/* Left content */}
                <div className={`cs__content ${visible ? 'animate-fade-up' : ''}`}>
                    <div className="tag cs__tag">
                        <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#00C8FF" /></svg>
                        Case Study · Fintech
                    </div>

                    <h2 className="cs__title">
                        How We Reduced Infrastructure Costs by{' '}
                        <span className="gradient-text">60%</span>{' '}
                        for a Fintech Leader
                    </h2>

                    <p className="cs__para">
                        A Series B fintech processing $2.4M daily faced runaway cloud spend and 340ms API latency threatening their SLA. AntiLabs redesigned their entire infrastructure on Kubernetes, introduced intelligent autoscaling, and rebuilt their data pipeline — delivering results in 14 weeks.
                    </p>

                    <div className="cs__metrics">
                        {metrics.map((m, i) => (
                            <div key={m.label} className="cs__metric">
                                <span className="cs__metric-value">{m.value}</span>
                                <span className="cs__metric-label">{m.label}</span>
                            </div>
                        ))}
                    </div>

                    <a href="/contact" className="btn btn-primary cs__cta">
                        Read Full Case Study →
                    </a>
                </div>

                {/* Right mockup */}
                <div className={`cs__right ${visible ? 'animate-fade-up' : ''}`} style={{ animationDelay: '0.2s' }}>
                    <DashboardMockup />
                </div>
            </div>
        </section>
    );
}
