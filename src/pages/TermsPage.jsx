import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './TermsPage.css';

/* ── Policy data ─────────────────────────────────────────── */
const policies = [
    {
        id: 'terms',
        label: 'Terms & Conditions',
        effectiveDate: '15 April 2026',
        eyebrow: 'Legal',
        title: 'Terms & Conditions',
        sections: [
            {
                heading: '1. Services',
                content: (
                    <>
                        <p>AntiLabs provides IT services including cybersecurity, cloud infrastructure, software development, consulting, managed services, data engineering, and training programs.</p>
                        <p>Services may be modified, updated, or adjusted in accordance with the applicable <strong>Term Sheet</strong> or any mutually executed agreement between AntiLabs and the client.</p>
                    </>
                ),
            },
            {
                heading: '2. Acceptance of Terms',
                content: <p>By accessing our services or making a payment, you agree to be bound by these Terms.</p>,
            },
            {
                heading: '3. Payments',
                content: (
                    <ul>
                        <li>All payments must be made in advance unless otherwise agreed in writing.</li>
                        <li>Fees once paid are subject to the Refund &amp; Payment Policy.</li>
                        <li>Pricing and deliverables are defined in the applicable agreement or service scope.</li>
                    </ul>
                ),
            },
            {
                heading: '4. Training & Internship Programs',
                content: (
                    <>
                        <p>By enrolling and completing payment for any Training & Internship Program, you explicitly acknowledge and agree to the following:</p>
                        <ul>
                            <li><strong>Offer Letter Compliance:</strong> You agree to abide by all company rules, code of conduct, and guidelines as specified in your Offer Letter. Violation of any clause may result in immediate termination from the program without a refund.</li>
                            <li><strong>No Guarantee of Employment:</strong> This payment is NOT a guarantee of employment. The fee is solely a Lecturer & Training Program Fee for structured skill development. Internship conversion, if applicable, is merit-based and subject to performance evaluation.</li>
                            <li><strong>Certification:</strong> Your Certificate of Completion will be issued only upon successful completion of the full Training Program and the mandatory Capstone Project, as evaluated by AntiLabs mentors.</li>
                            <li><strong>Program Validity:</strong> Programs have a fixed validity of the duration specified in your Offer Letter from the date of purchase. All course access, resources, mentor support, and platform features will be permanently revoked upon expiry.</li>
                            <li><strong>Failure to Complete:</strong> Failure to complete the program within the validity period will result in the permanent loss of access to all learning resources, recorded sessions, and project submissions. No extensions will be granted unless explicitly approved in writing by AntiLabs.</li>
                            <li><strong>Other Terms:</strong> All other terms, deliverables, timelines, mentorship structure, and program-specific conditions are as detailed in the Offer Letter issued to you upon registration approval.</li>
                        </ul>
                    </>
                ),
            },
            {
                heading: '5. User Obligations',
                content: (
                    <>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Use services for unlawful purposes</li>
                            <li>Attempt unauthorized access to systems</li>
                            <li>Disrupt or misuse services</li>
                        </ul>
                    </>
                ),
            },
            {
                heading: '6. Intellectual Property',
                content: <p>All intellectual property created by AntiLabs remains its property unless otherwise agreed in writing.</p>,
            },
            {
                heading: '7. Limitation of Liability',
                content: (
                    <>
                        <p>AntiLabs shall not be liable for:</p>
                        <ul>
                            <li>Indirect or consequential damages</li>
                            <li>Loss of profits, data, or business opportunities</li>
                        </ul>
                    </>
                ),
            },
            {
                heading: '8. Termination',
                content: (
                    <>
                        <p>We reserve the right to suspend or terminate services in case of:</p>
                        <ul>
                            <li>Breach of Terms</li>
                            <li>Non-payment</li>
                            <li>Misuse of services</li>
                        </ul>
                    </>
                ),
            },
            {
                heading: '9. Governing Law',
                content: <p>These Terms are governed by the laws of India.</p>,
            },
            {
                heading: '10. Contact',
                content: <p>For any queries: <a href="mailto:arya.antilabs@gmail.com">arya.antilabs@gmail.com</a></p>,
            },
        ],
    },
    {
        id: 'privacy',
        label: 'Privacy Policy',
        effectiveDate: '15 April 2026',
        eyebrow: 'Legal',
        title: 'Privacy Policy',
        sections: [
            {
                heading: '1. Information We Collect',
                content: (
                    <>
                        <p>We may collect:</p>
                        <ul>
                            <li>Name, email, phone number</li>
                            <li>Billing and payment details</li>
                            <li>Technical data (IP address, browser type)</li>
                            <li>Usage data</li>
                        </ul>
                    </>
                ),
            },
            {
                heading: '2. Use of Information',
                content: (
                    <>
                        <p>Your information is used to:</p>
                        <ul>
                            <li>Deliver services</li>
                            <li>Process transactions</li>
                            <li>Communicate updates</li>
                            <li>Improve user experience</li>
                            <li>Ensure security and prevent fraud</li>
                        </ul>
                    </>
                ),
            },
            {
                heading: '3. Data Sharing',
                content: (
                    <>
                        <p>We may share information with:</p>
                        <ul>
                            <li>Payment processors and service providers</li>
                            <li>Legal authorities if required by law</li>
                        </ul>
                        <p>We do not sell personal data.</p>
                    </>
                ),
            },
            {
                heading: '4. Data Security',
                content: <p>We implement reasonable security measures to protect your information. However, no system is completely secure.</p>,
            },
            {
                heading: '5. Cookies',
                content: <p>We may use cookies to enhance functionality and analyze usage.</p>,
            },
            {
                heading: '6. User Rights',
                content: (
                    <>
                        <p>You may:</p>
                        <ul>
                            <li>Request access to your data</li>
                            <li>Request correction or deletion</li>
                            <li>Withdraw consent where applicable</li>
                        </ul>
                    </>
                ),
            },
            {
                heading: '7. Data Retention',
                content: <p>We retain data only as necessary for legal and business purposes.</p>,
            },
            {
                heading: '8. Updates',
                content: <p>This policy may be updated periodically.</p>,
            },
            {
                heading: '9. Contact',
                content: <p>For privacy-related concerns: <a href="mailto:arya.antilabs@gmail.com">arya.antilabs@gmail.com</a></p>,
            },
        ],
    },
    {
        id: 'refund',
        label: 'Refund Policy',
        effectiveDate: '15 April 2026',
        eyebrow: 'Legal',
        title: 'Refund & Payment Policy',
        sections: [
            {
                heading: '1. General Refund Policy',
                content: (
                    <>
                        <p>All payments made to AntiLabs are <strong>non-refundable</strong>, except in the following limited circumstances:</p>
                        <ul>
                            <li>Duplicate payments</li>
                            <li>Excess payments made due to technical or processing errors</li>
                        </ul>
                        <p>Such eligible refunds will be processed after verification.</p>
                    </>
                ),
            },
            {
                heading: '2. Training & Internship Programs',
                content: (
                    <>
                        <p>All fees paid for training and internship programs are <strong>non-refundable under any circumstances</strong>, including but not limited to:</p>
                        <ul>
                            <li>Non-participation or discontinuation</li>
                            <li>Dissatisfaction</li>
                            <li>Non-selection for interviews or job opportunities</li>
                        </ul>
                        <p>By enrolling, the user acknowledges that payment is for access to training, resources, and evaluation — no employment is guaranteed.</p>
                    </>
                ),
            },
            {
                heading: '3. Project-Based Services – Payment Structure',
                content: (
                    <>
                        <p><strong>a) Initial Kickstart Payment — 20%</strong></p>
                        <ul>
                            <li>20% of the total project cost is due at confirmation or agreement signing.</li>
                            <li>Work commences only after receipt. This amount is strictly non-refundable.</li>
                        </ul>
                        <p><strong>b) Major Delivery Payment — 50%</strong></p>
                        <ul>
                            <li>50% is due once the project is completed, all changes are implemented, and it's ready for deployment.</li>
                            <li>Deployment is initiated only after this payment.</li>
                        </ul>
                        <p><strong>c) Final Payment — 30%</strong></p>
                        <ul>
                            <li>The remaining 30% is due after deployment to the client's domain or production environment.</li>
                        </ul>
                    </>
                ),
            },
            {
                heading: '4. No Refund on Services',
                content: <p>Once any service, project phase, or resource allocation has begun, no refunds will be provided. Payments are made for time, expertise, and resource commitment — not solely for final outcomes.</p>,
            },
            {
                heading: '5. Chargebacks & Disputes',
                content: (
                    <>
                        <p>Initiating a chargeback without valid reason or prior communication may result in:</p>
                        <ul>
                            <li>Immediate suspension of services</li>
                            <li>Legal action if necessary</li>
                        </ul>
                    </>
                ),
            },
            {
                heading: '6. Processing of Eligible Refunds',
                content: <p>Approved refunds (only for duplicate/excess payments) will be processed within <strong>7–14 business days</strong> via the original payment method.</p>,
            },
            {
                heading: '7. Agreement',
                content: <p>By making a payment, you acknowledge that you have read, understood, and agreed to this Refund &amp; Payment Policy.</p>,
            },
            {
                heading: '8. Contact',
                content: <p>For billing-related queries: <a href="mailto:arya.antilabs@gmail.com">arya.antilabs@gmail.com</a></p>,
            },
        ],
    },
    {
        id: 'employment',
        label: 'Employment Policy',
        effectiveDate: '15 April 2026',
        eyebrow: 'Legal',
        title: 'Employment Policy',
        sections: [
            {
                heading: '1. Applicability',
                content: (
                    <>
                        <p>This policy applies to:</p>
                        <ul>
                            <li>Full-time employees</li>
                            <li>Part-time employees</li>
                            <li>Contractual staff</li>
                            <li>Interns</li>
                            <li>Trainees</li>
                            <li>Consultants working under AntiLabs</li>
                        </ul>
                    </>
                ),
            },
            {
                heading: '2. Offer Letter Governs Employment',
                content: (
                    <>
                        <p>All employment terms including job responsibilities, compensation, working hours, confidentiality, notice period, conduct requirements, performance expectations, and termination conditions shall be clearly stated in the employee's <strong>Offer Letter</strong> or Employment Agreement.</p>
                        <p><strong>All terms and conditions stated in the Offer Letter shall be binding and must be strictly followed throughout the course of employment.</strong></p>
                        <p>Failure to comply may result in disciplinary action, suspension, or termination.</p>
                    </>
                ),
            },
            {
                heading: '3. Code of Conduct',
                content: (
                    <>
                        <p>Employees are expected to:</p>
                        <ul>
                            <li>Maintain professionalism at all times</li>
                            <li>Respect clients, colleagues, and company property</li>
                            <li>Follow lawful instructions from management</li>
                            <li>Avoid conflicts of interest</li>
                            <li>Protect company reputation</li>
                        </ul>
                        <p>The following are prohibited: harassment, discrimination, fraud, misuse of company assets, unauthorized disclosure of information, and unethical behavior.</p>
                    </>
                ),
            },
            {
                heading: '4. Confidentiality',
                content: (
                    <>
                        <p>Employees shall maintain strict confidentiality regarding client information, source code, internal systems, business strategies, financial information, and proprietary documents.</p>
                        <p>Confidentiality obligations continue even after employment ends.</p>
                    </>
                ),
            },
            {
                heading: '5. Attendance & Working Hours',
                content: (
                    <>
                        <p>Employees must:</p>
                        <ul>
                            <li>Report to work on time</li>
                            <li>Maintain regular attendance</li>
                            <li>Inform management in advance of leave</li>
                            <li>Complete assigned responsibilities within deadlines</li>
                        </ul>
                        <p>Repeated absence or lateness may lead to disciplinary action.</p>
                    </>
                ),
            },
            {
                heading: '6. Performance Expectations',
                content: (
                    <>
                        <p>Employees are expected to perform assigned duties competently, meet project deadlines, follow technical standards, cooperate with teams, and maintain quality of work. Performance may be reviewed periodically.</p>
                    </>
                ),
            },
            {
                heading: '7. Intellectual Property',
                content: (
                    <p>Any work created during employment — including code, documentation, designs, systems, and processes — shall remain the sole property of AntiLabs unless otherwise agreed in writing.</p>
                ),
            },
            {
                heading: '8. Use of Company Resources',
                content: (
                    <>
                        <p>Company resources including devices, accounts, servers, tools, and software must be used only for authorized business purposes. Unauthorized use may result in immediate action.</p>
                    </>
                ),
            },
            {
                heading: '9. Disciplinary Action',
                content: (
                    <>
                        <p>Violation of company policies may result in:</p>
                        <ul>
                            <li>Verbal warning</li>
                            <li>Written warning</li>
                            <li>Suspension</li>
                            <li>Termination</li>
                            <li>Legal action where applicable</li>
                        </ul>
                        <p>The severity of action shall depend on the nature of the violation.</p>
                    </>
                ),
            },
            {
                heading: '10. Termination of Employment',
                content: (
                    <>
                        <p>Employment may be terminated:</p>
                        <ul>
                            <li>By employee through written notice</li>
                            <li>By company for policy violation</li>
                            <li>By company for poor performance</li>
                            <li>By company for misconduct</li>
                            <li>As per terms stated in the Offer Letter</li>
                        </ul>
                        <p>Any notice period mentioned in the Offer Letter must be followed.</p>
                    </>
                ),
            },
            {
                heading: '11. Amendments',
                content: (
                    <p>AntiLabs reserves the right to update this Employment Policy as required. Any changes shall be communicated to employees in writing.</p>
                ),
            },
            {
                heading: '12. Acknowledgement',
                content: (
                    <>
                        <p>By accepting employment with AntiLabs, the employee confirms that:</p>
                        <ul>
                            <li>They have read this Employment Policy</li>
                            <li>They understand the company rules</li>
                            <li>They agree to comply with all terms in the Offer Letter</li>
                            <li>They accept that company policies are mandatory and enforceable</li>
                        </ul>
                    </>
                ),
            },
            {
                heading: '13. Contact',
                content: <p>For employment-related queries: <a href="mailto:arya.antilabs@gmail.com">arya.antilabs@gmail.com</a></p>,
            },
        ],
    },
];

/* ── Section component ───────────────────────────────────── */
function PolicySection({ heading, content, index }) {
    return (
        <div className="tp__section">
            <div className="tp__section-num">{String(index + 1).padStart(2, '0')}</div>
            <div className="tp__section-body">
                <h2 className="tp__section-heading">{heading}</h2>
                <div className="tp__section-content">{content}</div>
            </div>
        </div>
    );
}

/* ── Main page ───────────────────────────────────────────── */
export default function TermsPage() {
    const [active, setActive] = useState('terms');
    const policy = policies.find(p => p.id === active);
    const mainRef = useRef(null);

    // scroll content to top when switching tabs
    useEffect(() => {
        if (mainRef.current) mainRef.current.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [active]);

    // read ?tab= param OR path from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        const path = window.location.pathname.replace('/', '');
        const byPath = policies.find(p => p.id === path);
        const byTab = policies.find(p => p.id === tab);
        if (byTab) setActive(byTab.id);
        else if (byPath) setActive(byPath.id);
    }, []);

    return (
        <>
            <SEO title="Legal Policies" description="AntiLabs Terms & Conditions, Privacy Policy, Refund Policy, and Employment Policies." canonicalUrl="/terms" />
            <Navbar />
            <main className="tp" ref={mainRef}>

                {/* ── Hero strip ── */}
                <div className="tp__hero">
                    <div className="tp__hero-bg" />
                    <div className="container tp__hero-inner">
                        <span className="section-eyebrow">AntiLabs</span>
                        <h1 className="tp__hero-h1">Legal &amp; Policies</h1>
                        <p className="tp__hero-sub">
                            Transparent terms for every relationship we build. Last updated April 2026.
                        </p>
                    </div>
                </div>

                {/* ── Layout: sidebar + content ── */}
                <div className="container tp__layout">

                    {/* Sticky sidebar */}
                    <aside className="tp__sidebar">
                        <p className="tp__sidebar-label">Documents</p>
                        <nav className="tp__nav">
                            {policies.map(p => (
                                <button
                                    key={p.id}
                                    className={`tp__nav-item ${active === p.id ? 'tp__nav-item--active' : ''}`}
                                    onClick={() => setActive(p.id)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </nav>
                        <div className="tp__sidebar-contact">
                            <p>Questions?</p>
                            <a href="mailto:arya.antilabs@gmail.com">arya.antilabs@gmail.com</a>
                        </div>
                    </aside>

                    {/* Policy document */}
                    <article className="tp__doc" key={active}>
                        <header className="tp__doc-header">
                            <span className="tp__doc-eyebrow">{policy.eyebrow}</span>
                            <h1 className="tp__doc-title">{policy.title}</h1>
                            <p className="tp__doc-date">Effective date: <strong>{policy.effectiveDate}</strong></p>
                        </header>

                        <div className="tp__sections">
                            {policy.sections.map((s, i) => (
                                <PolicySection key={i} heading={s.heading} content={s.content} index={i} />
                            ))}
                        </div>

                        {/* Mobile policy switcher */}
                        <div className="tp__mobile-nav">
                            {policies.filter(p => p.id !== active).map(p => (
                                <button key={p.id} className="tp__mobile-nav-btn" onClick={() => setActive(p.id)}>
                                    {p.label} →
                                </button>
                            ))}
                        </div>
                    </article>
                </div>

            </main>
            <Footer />
        </>
    );
}
