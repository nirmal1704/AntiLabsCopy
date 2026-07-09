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
    const { ref: heroRef, visible: heroVisible } = useScrollReveal({ threshold: 0.01 });

    const breadcrumbs = [
        { name: "Home", url: "/" },
        { name: "About AntiLabs", url: "/about" }
    ];

    return (
        <>
            <SEO 
                title="About AntiLabs" 
                description="At AntiLabs, we partner with businesses to help them navigate the ever-evolving digital world with confidence. Your Technology. Our Responsibility."
                canonicalUrl="/about"
                breadcrumbs={breadcrumbs}
            />
            <Navbar />
            <main className="ap">

                {/* ── Hero ── */}
                <section className="ap__hero">
                    <div className="ap__hero-bg" />
                    <div
                        ref={heroRef}
                        className={`ap__hero-content container ${heroVisible ? 'ap__hero-content--in' : ''}`}
                    >
                        <span className="section-eyebrow">About AntiLabs</span>
                        <h1 className="ap__hero-h1">
                            Your Technology.<br />
                            <span className="gradient-text">Our Responsibility.</span>
                        </h1>
                        <p className="ap__hero-sub">
                            Technology should do more than exist—it should create opportunities, drive growth, improve efficiency, and help businesses build a stronger future.
                        </p>
                    </div>
                </section>

                {/* ── Intro & Mission Section ── */}
                <section className="ap__intro section-py">
                    <div className="container ap__intro-grid">
                        <RevealSection className="ap__intro-text">
                            <p className="ap__paragraph-large">
                                At AntiLabs, we partner with businesses to help them navigate the ever-evolving digital world with confidence. Unlike traditional agencies that deliver a project and disappear, we remain invested in the long-term success of every client we work with.
                            </p>
                            <p className="ap__paragraph">
                                When you partner with AntiLabs, you gain a technology team that is committed to supporting your business beyond launch day.
                            </p>
                        </RevealSection>
                        <RevealSection className="ap__mission-box-wrap">
                            <div className="ap__mission-box">
                                <span className="ap__mission-title">Our Mission</span>
                                <p className="ap__mission-text">
                                    To empower businesses with reliable, secure, and scalable technology solutions that create measurable business impact.
                                </p>
                            </div>
                        </RevealSection>
                    </div>
                </section>

                {/* ── Why We Started ── */}
                <section className="ap__why-started section-py">
                    <div className="container ap__why-grid">
                        <RevealSection className="ap__why-left">
                            <span className="section-eyebrow">Why We Started</span>
                            <h2 className="ap__section-h2">Filling a Gap in the Market</h2>
                            <p className="ap__paragraph">
                                The digital services industry has become crowded with agencies offering quick solutions and temporary fixes. Businesses are often sold websites, software, or digital products without receiving the support, strategy, and technical expertise required to turn those investments into meaningful results.
                            </p>
                            <p className="ap__paragraph">
                                At the same time, truly reliable technology partners are often priced beyond the reach of many growing businesses. We saw this gap and decided to do things differently.
                            </p>
                            <p className="ap__paragraph">
                                AntiLabs was founded on the belief that businesses deserve more than a service provider. They deserve a long-term technology partner who understands their goals, supports their growth, and remains accountable for the solutions they deliver.
                            </p>
                        </RevealSection>
                        
                        <RevealSection className="ap__why-right">
                            <div className="ap__challenges-card glass-card">
                                <h3 className="ap__challenges-title">Common Industry Challenges</h3>
                                <ul className="ap__challenges-list">
                                    <li>
                                        <span className="ap__challenge-icon">×</span>
                                        <span className="ap__challenge-text">Technology that fails to support business growth</span>
                                    </li>
                                    <li>
                                        <span className="ap__challenge-icon">×</span>
                                        <span className="ap__challenge-text">Limited support after project delivery</span>
                                    </li>
                                    <li>
                                        <span className="ap__challenge-icon">×</span>
                                        <span className="ap__challenge-text">Security vulnerabilities and outdated systems</span>
                                    </li>
                                    <li>
                                        <span className="ap__challenge-icon">×</span>
                                        <span className="ap__challenge-text">Poorly planned digital strategies</span>
                                    </li>
                                    <li>
                                        <span className="ap__challenge-icon">×</span>
                                        <span className="ap__challenge-text">Expensive solutions that are difficult to maintain</span>
                                    </li>
                                </ul>
                            </div>
                        </RevealSection>
                    </div>
                </section>

                {/* ── Our Philosophy & Vision ── */}
                <section className="ap__philosophy-vision section-py">
                    <div className="container ap__pv-grid">
                        <RevealSection className="ap__pv-card glass-card">
                            <span className="ap__pv-label">Our Philosophy</span>
                            <h3 className="ap__pv-h3">Technology is an Evolving Asset</h3>
                            <p className="ap__pv-desc">
                                We believe technology should never be treated as a one-time purchase. A website, application, cloud environment, or digital platform is only valuable when it continuously contributes to business success.
                            </p>
                            <p className="ap__pv-desc">
                                The real value lies in maintaining, improving, securing, and evolving technology as a business grows. This is why we focus on building lasting relationships rather than short-term projects.
                            </p>
                            <p className="ap__pv-desc">
                                Our clients trust us not only to deliver solutions but to provide guidance, support, and strategic direction as their businesses evolve. Because when your business grows, your technology should grow with it.
                            </p>
                        </RevealSection>
                        
                        <RevealSection className="ap__pv-card glass-card">
                            <span className="ap__pv-label">Our Vision</span>
                            <h3 className="ap__pv-h3">Access to Enterprise Expertise</h3>
                            <p className="ap__pv-desc">
                                To build a future where businesses of every size can access enterprise-quality technology expertise, strategic guidance, and long-term support without unnecessary complexity or excessive costs.
                            </p>
                            <p className="ap__pv-desc">
                                We envision a world where technology becomes a catalyst for innovation, opportunity, and sustainable growth.
                            </p>
                        </RevealSection>
                    </div>
                </section>

                {/* ── A Different Kind of Partner ── */}
                <section className="ap__partner-strip section-py">
                    <div className="container">
                        <RevealSection className="ap__partner-header">
                            <span className="section-eyebrow">A New Paradigm</span>
                            <h2 className="ap__partner-h2">A Different Kind of Technology Partner</h2>
                            <p className="ap__partner-subtitle">
                                At AntiLabs, we don't believe in handing over a project and moving on to the next client.
                            </p>
                        </RevealSection>
                        
                        <div className="ap__partner-grid">
                            <RevealSection className="ap__partner-card">
                                <div className="ap__partner-card-num">01</div>
                                <h3 className="ap__partner-card-title">Ownership</h3>
                                <p className="ap__partner-card-desc">We take absolute pride in our craft and treat your digital infrastructure as if it were our own.</p>
                            </RevealSection>
                            
                            <RevealSection className="ap__partner-card">
                                <div className="ap__partner-card-num">02</div>
                                <h3 className="ap__partner-card-title">Accountability</h3>
                                <p className="ap__partner-card-desc">We remain answerable and committed to performance, safety, and reliability long after launch day.</p>
                            </RevealSection>
                            
                            <RevealSection className="ap__partner-card">
                                <div className="ap__partner-card-num">03</div>
                                <h3 className="ap__partner-card-title">Partnership</h3>
                                <p className="ap__partner-card-desc">We believe in building relationships that create long-term value, walking alongside you as you grow.</p>
                            </RevealSection>
                        </div>
                        
                        <RevealSection className="ap__partner-footer-text">
                            <p className="ap__paragraph">
                                Whether you're taking your first step into the digital world or scaling an established organization, our goal is to ensure that technology becomes an asset that drives growth rather than a challenge that slows you down.
                            </p>
                            <p className="ap__paragraph">
                                We work alongside our clients, helping them make smarter technology decisions, reduce risk, improve operational efficiency, and prepare for the future. For us, success is not measured by projects completed—it is measured by businesses empowered.
                            </p>
                        </RevealSection>
                    </div>
                </section>

                {/* ── Meet The Founder ── */}
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
                                <div className="ap__founder-badge">Founder of AntiLabs</div>
                            </div>
                        </RevealSection>

                        <RevealSection className="ap__founder-text">
                            <span className="section-eyebrow">Meet The Founder</span>
                            <h2 className="ap__section-h2">Arya Sharma</h2>
                            
                            <blockquote className="ap__founder-quote-box">
                                <p className="ap__founder-quote-text">
                                    "Technology should be an investment that generates business value—not just a digital presence."
                                </p>
                                <cite className="ap__founder-quote-author">— Arya Sharma, Founder</cite>
                            </blockquote>

                            <p className="ap__paragraph">
                                While working closely with businesses, Arya observed a recurring problem. Many organizations were investing in websites and digital solutions, yet very few were receiving the strategic support and technical partnership necessary to achieve real growth.
                            </p>
                            <p className="ap__paragraph">
                                The focus had shifted toward delivering projects rather than delivering results.
                            </p>
                            <p className="ap__paragraph">
                                This inspired the creation of AntiLabs—a company built around accountability, innovation, affordability, and long-term partnerships. Arya's vision was to create a technology company that businesses could rely on, not just for development, but for guidance, growth, and continuous improvement. Today, that vision continues to shape everything we do.
                            </p>
                        </RevealSection>
                    </div>
                </section>

                {/* ── Looking Ahead ── */}
                <section className="ap__cta-strip">
                    <div className="container ap__cta-inner">
                        <span className="section-eyebrow" style={{ color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>Looking Ahead</span>
                        <h2 className="ap__cta-h2">Ready to work with a partner who cares?</h2>
                        <p className="ap__cta-sub">
                            Technology continues to transform industries, redefine customer expectations, and create new opportunities every day. At AntiLabs, we are committed to helping businesses embrace that future with confidence.
                        </p>
                        <p className="ap__cta-sub">
                            Whether you're building, scaling, modernizing, or innovating, our commitment remains the same: to stand beside your business, solve complex challenges, and help turn technology into a competitive advantage. Because technology is not just what we do. It's our responsibility to help your business succeed through it.
                        </p>
                        
                        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                            <Link to="/contact" className="btn btn-primary btn-lg">Get in Touch →</Link>
                            <div className="ap__cta-tagline">
                                <strong>Your Technology. Our Responsibility.</strong>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
