import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useScrollReveal } from '../hooks/useScrollReveal';
import SEO from '../components/SEO';
import './ServicesPage.css';

/* ─── Data ─────────────────────────────────────────────── */
const services = [
    {
        id: 'cybersecurity',
        icon: (
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M24 4L6 12v14c0 10 8 18 18 22 10-4 18-12 18-22V12L24 4z" />
                <path d="M16 24l6 6 10-12" />
            </svg>
        ),
        tag: 'Security',
        title: 'Cybersecurity & Zero Trust',
        tagline: 'Defend what matters. Eliminate implicit trust.',
        desc: 'Modern threats don\'t stop at the perimeter — so neither do we. Our cybersecurity practice delivers layered, AI-assisted defences built around the Zero Trust principle: never trust, always verify.',
        features: [
            'Zero Trust Network Architecture (ZTNA) design & implementation',
            'AI-driven threat detection & SIEM/SOAR integration',
            'Penetration testing & red team exercises',
            'Identity & Access Management (IAM / PAM)',
            'Cloud security posture management (CSPM)',
            'Incident response retainer & forensics',
            'Compliance readiness: ISO 27001, SOC 2, GDPR, HIPAA',
        ],
        process: ['Discovery & threat modelling', 'Architecture design', 'Implementation & hardening', 'Continuous monitoring'],
        color: '#0099C8',
    },
    {
        id: 'cloud',
        icon: (
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M36 20a10 10 0 10-19.6 2.8A8 8 0 1014 36h22a8 8 0 000-16z" />
            </svg>
        ),
        tag: 'Infrastructure',
        title: 'Cloud Infrastructure & DevOps',
        tagline: 'Scale confidently. Ship faster. Sleep better.',
        desc: 'We architect cloud environments that are resilient, cost-efficient, and developer-friendly — on AWS, GCP, or Azure — backed by automation-first DevOps pipelines and Site Reliability Engineering principles.',
        features: [
            'Multi-cloud & hybrid cloud architecture',
            'Infrastructure as Code (Terraform, Pulumi, CDK)',
            'CI/CD pipeline design & optimisation (GitHub Actions, GitLab CI, ArgoCD)',
            'Kubernetes orchestration & Helm chart management',
            'FinOps: cloud cost optimisation & governance',
            'Observability stack: Prometheus, Grafana, OpenTelemetry',
            'Disaster recovery & business continuity planning',
        ],
        process: ['Cloud readiness assessment', 'Architecture blueprint', 'Migration & modernisation', 'Ongoing optimisation'],
        color: '#00C8A0',
    },
    {
        id: 'software',
        icon: (
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="12 14 4 24 12 34" />
                <polyline points="36 14 44 24 36 34" />
                <line x1="28" y1="8" x2="20" y2="40" />
            </svg>
        ),
        tag: 'Development',
        title: 'Custom Software Development',
        tagline: 'From idea to production — with clean code at every layer.',
        desc: 'We build full-stack web and mobile applications, internal tools, and distributed systems engineered for maintainability and scale. No boilerplate factories — just thoughtful, tested software.',
        features: [
            'MERN / MEAN stack web applications',
            'React, Next.js, Vue.js — modern SPA & SSR frontends',
            'Node.js, Python (Django/FastAPI), Go backends',
            'REST & GraphQL API design',
            'Mobile apps: React Native & Flutter',
            'Micro-service & event-driven architectures (Kafka, RabbitMQ)',
            'Automated testing: unit, integration, E2E (Playwright, Cypress)',
        ],
        process: ['Requirements & UX discovery', 'Iterative sprints', 'QA & staging reviews', 'Production deployment & handoff'],
        color: '#7B61FF',
    },
    {
        id: 'consulting',
        icon: (
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="24" cy="24" r="20" />
                <path d="M24 14v10l7 4" />
            </svg>
        ),
        tag: 'Strategy',
        title: 'IT Consulting & Strategy',
        tagline: 'Board-level technology clarity. Execution-ready roadmaps.',
        desc: 'Technology decisions made today will define your competitive position for years. Our advisory team brings cross-industry depth to help leadership make confident, well-informed technology bets.',
        features: [
            'Digital transformation roadmaps',
            'CTO-as-a-Service & fractional CTO engagements',
            'Technology due diligence for M&A and investments',
            'Vendor evaluation & contract negotiation',
            'Enterprise architecture review & modernisation planning',
            'OKR-aligned technology strategy workshops',
            'Build vs. buy vs. partner analysis',
        ],
        process: ['Stakeholder interviews', 'Current-state assessment', 'Roadmap development', 'Governance & review cadence'],
        color: '#FF7B4F',
    },
    {
        id: 'managed',
        icon: (
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="8" width="40" height="28" rx="3" />
                <path d="M4 16h40" />
                <path d="M16 40h16" />
                <circle cx="24" cy="28" r="4" />
            </svg>
        ),
        tag: 'Operations',
        title: 'Managed IT Services',
        tagline: '24/7 NOC. Proactive monitoring. Guaranteed SLAs.',
        desc: 'Outsource operational complexity to a team that treats your infrastructure like their own. We provide round-the-clock monitoring, rapid incident response, and continuous improvement across your entire IT estate.',
        features: [
            '24/7 Network Operations Centre (NOC) monitoring',
            'Proactive alerting & automated remediation',
            'End-user IT support (L1 / L2 / L3)',
            'Patch management & vulnerability lifecycle',
            'Server, network, and endpoint management',
            'Monthly reporting & SLA dashboards',
            'Backup verification & recovery testing',
        ],
        process: ['IT estate audit', 'Onboarding & tooling setup', 'Steady-state operations', 'Quarterly business reviews'],
        color: '#F5A623',
    },
    {
        id: 'data',
        icon: (
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="24" cy="14" rx="16" ry="6" />
                <path d="M8 14v8c0 3.3 7.2 6 16 6s16-2.7 16-6v-8" />
                <path d="M8 22v8c0 3.3 7.2 6 16 6s16-2.7 16-6v-8" />
            </svg>
        ),
        tag: 'Analytics',
        title: 'Data Engineering & Analytics',
        tagline: 'Raw data → decision intelligence. At scale.',
        desc: 'We design and build reliable data infrastructure — from real-time ingestion pipelines to ML-ready feature stores — so your analysts and data scientists can focus on insights, not plumbing.',
        features: [
            'Data lake & lakehouse architecture (Delta Lake, Iceberg)',
            'Real-time streaming pipelines (Kafka, Flink, Spark Streaming)',
            'ETL / ELT pipeline development (dbt, Airflow, Prefect)',
            'Data warehouse design (BigQuery, Redshift, Snowflake)',
            'ML feature engineering & model serving infrastructure',
            'BI & visualisation: Metabase, Looker, Power BI',
            'Data governance, lineage & quality frameworks',
        ],
        process: ['Data audit & gap analysis', 'Platform design', 'Pipeline build & testing', 'Operationalisation & training'],
        color: '#E040FB',
    },
];

/* ─── Sub-components ────────────────────────────────────── */
function ServiceCard({ service, active, onClick }) {
    return (
        <button
            className={`sp__tab ${active ? 'sp__tab--active' : ''}`}
            onClick={onClick}
            style={{ '--tab-color': service.color }}
        >
            <span className="sp__tab-icon">{service.icon}</span>
            <span className="sp__tab-title">{service.title}</span>
        </button>
    );
}

function ServiceDetail({ service }) {
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        // Trigger on next frame so the CSS transition actually plays
        const id = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);

    return (
        <div className={`sp__detail ${visible ? 'sp__detail--in' : ''}`} style={{ '--tab-color': service.color }}>
            <div className="sp__detail-left">
                <span className="sp__detail-tag">{service.tag}</span>
                <h2 className="sp__detail-title">{service.title}</h2>
                <p className="sp__detail-tagline">{service.tagline}</p>
                <p className="sp__detail-desc">{service.desc}</p>

                <div className="sp__process">
                    <span className="sp__process-label">Our process</span>
                    <div className="sp__process-steps">
                        {service.process.map((step, i) => (
                            <div className="sp__process-step" key={step}>
                                <div className="sp__process-num">{i + 1}</div>
                                <span>{step}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Link to="/contact" className="btn btn-primary sp__cta">
                    Start this engagement →
                </Link>
            </div>

            <div className="sp__detail-right">
                <div className="sp__features-card">
                    <span className="sp__features-label">What's included</span>
                    <ul className="sp__features-list">
                        {service.features.map(f => (
                            <li className="sp__feature" key={f}>
                                <svg className="sp__feature-check" viewBox="0 0 20 20" fill="none">
                                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

/* ─── Page ──────────────────────────────────────────────── */
export default function ServicesPage() {
    const [searchParams] = useSearchParams();

    // Find the index of the tab requested via ?tab=<id>, default to 0
    const getInitialTab = () => {
        const tabId = searchParams.get('tab');
        if (!tabId) return 0;
        const idx = services.findIndex(s => s.id === tabId);
        return idx >= 0 ? idx : 0;
    };

    const [active, setActive] = useState(getInitialTab);
    const heroReveal = useScrollReveal({ threshold: 0.01 });

    // Also react if the URL param changes (e.g. browser back/forward)
    useEffect(() => {
        setActive(getInitialTab());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    return (
        <>
            <SEO title="Services" description="Explore our enterprise-grade IT services including Cybersecurity, Cloud Infrastructure, and Custom Software Development." canonicalUrl="/services" />
            <Navbar />
            <main className="sp">

                {/* Hero banner */}
                <section className="sp__hero">
                    <div className="sp__hero-bg" />
                    <div
                        ref={heroReveal.ref}
                        className={`sp__hero-content container ${heroReveal.visible ? 'sp__hero-content--in' : ''}`}
                    >
                        <span className="section-eyebrow">What We Do</span>
                        <h1 className="sp__hero-h1">
                            Enterprise-Grade Services.<br />
                            <span className="gradient-text">Built for Every Scale.</span>
                        </h1>
                        <p className="sp__hero-sub">
                            Six specialised practices. One accountable partner. Whether you're securing a Fortune 500 environment
                            or shipping your first SaaS product — we have the expertise and the team.
                        </p>
                    </div>
                </section>

                {/* Tabs + Detail */}
                <section className="sp__body container">
                    {/* Sidebar tabs */}
                    <nav className="sp__tabs">
                        {services.map((s, i) => (
                            <ServiceCard
                                key={s.id}
                                service={s}
                                active={i === active}
                                onClick={() => setActive(i)}
                            />
                        ))}
                    </nav>

                    {/* Detail panel */}
                    <div className="sp__panel">
                        <ServiceDetail key={services[active].id} service={services[active]} />
                    </div>
                </section>

                {/* Bottom CTA strip */}
                <section className="sp__cta-strip">
                    <div className="container sp__cta-inner">
                        <h2 className="sp__cta-h2">Not sure which service fits your needs?</h2>
                        <p className="sp__cta-sub">Book a free 30-minute discovery call — we'll map the right engagement model for your goals.</p>
                        <Link to="/contact" className="btn btn-primary btn-lg">Schedule a Free Consultation →</Link>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
