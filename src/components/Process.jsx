import React, { useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Process.css';

const steps = [
    {
        num: '01',
        title: 'Discovery & Audit',
        desc: 'We deep-dive into your existing infrastructure, interview stakeholders, and map technical debt. You get a comprehensive findings report within the first two weeks.',
    },
    {
        num: '02',
        title: 'Architecture Design',
        desc: 'Our architects draft a solution blueprint — system diagrams, tech stack selection, cost modeling, and a risk-mitigation matrix — all reviewed with your team before one line of code is written.',
    },
    {
        num: '03',
        title: 'Development Sprint',
        desc: 'Agile 2-week sprints with daily standups, a shared project board, and bi-weekly demos. You\'re always in the loop, never surprised.',
    },
    {
        num: '04',
        title: 'QA & Security Testing',
        desc: 'Dedicated QA engineers run integration, load, and penetration testing. We won\'t ship anything we wouldn\'t run our own business on.',
    },
    {
        num: '05',
        title: 'Deployment & Monitoring',
        desc: 'Blue-green deployments, automated rollbacks, full observability stack (metrics, logging, tracing), and a 90-day post-launch hypercare window.',
    },
];

export default function Process() {
    const [active, setActive] = useState(0);
    const { ref, visible } = useScrollReveal();

    return (
        <section id="process" className="process section-py">
            <div className="container" ref={ref}>
                <div className={`process__header ${visible ? 'animate-fade-up' : ''}`}>
                    <span className="section-eyebrow">How We Work</span>
                    <h2 className="section-title process__title">
                        From Brief to Launch —<br />
                        <span className="gradient-text">Our Process.</span>
                    </h2>
                </div>

                {/* Timeline */}
                <div className={`process__timeline ${visible ? 'animate-fade-up' : ''}`} style={{ animationDelay: '0.2s' }}>
                    {steps.map((step, i) => (
                        <div
                            key={step.num}
                            className={`process__node ${active === i ? 'process__node--active' : ''}`}
                            onClick={() => setActive(i)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && setActive(i)}
                        >
                            <div className="process__node-dot">
                                <span>{step.num}</span>
                            </div>
                            <div className="process__node-line" />
                        </div>
                    ))}
                </div>

                {/* Active step detail */}
                <div className={`process__detail ${visible ? 'animate-fade-up' : ''}`} style={{ animationDelay: '0.35s' }}>
                    {steps.map((step, i) => (
                        <div
                            key={step.num}
                            className={`process__card ${active === i ? 'process__card--active' : ''}`}
                        >
                            <div className="process__card-num">{step.num}</div>
                            <h3 className="process__card-title">{step.title}</h3>
                            <p className="process__card-desc">{step.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Step tabs (compact labels below dots) */}
                <div className="process__labels">
                    {steps.map((step, i) => (
                        <div
                            key={step.num}
                            className={`process__label ${active === i ? 'process__label--active' : ''}`}
                            onClick={() => setActive(i)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && setActive(i)}
                        >
                            {step.title}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
