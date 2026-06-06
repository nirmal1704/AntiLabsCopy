import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Logo = () => (
    <a href="#home" className="footer__logo">
        {/* Logo on light footer — shows naturally, no blend mode needed */}
        <img
            src="/logo.png"
            alt="AntiLabs"
            className="footer__logo-img"
        />
    </a>
);

const links = {
    services: [
        { name: 'Cybersecurity', href: '/services?tab=cybersecurity' },
        { name: 'Cloud & DevOps', href: '/services?tab=cloud' },
        { name: 'Custom Software', href: '/services?tab=software' },
        { name: 'IT Consulting', href: '/services?tab=consulting' },
        { name: 'Managed Services', href: '/services?tab=managed' },
        { name: 'Data Engineering', href: '/services?tab=data' },
    ],
    company: [
        { name: 'About Us', href: '/about' },
        { name: 'Team', href: '/about#team' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact', href: '/contact' },
        { name: 'Testimonials', href: '/testimonials' },
    ],
    legal: [
        { name: 'Terms & Conditions', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Refund Policy', href: '/refund' },
        { name: 'Employment Policy', href: '/employment' },
    ],
};

const SocialIcon = ({ href, label, children }) => (
    <a href={href} className="footer__social" aria-label={label}>{children}</a>
);

export default function Footer() {
    const year = new Date().getFullYear();

    const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <footer className="footer">
            <div className="footer__main">
                <div className="container footer__grid">
                    {/* Col 1 — Brand */}
                    <div className="footer__col footer__col--brand">
                        <Logo />
                        <p className="footer__tagline">Engineering the digital infrastructure of tomorrow, today.</p>
                        <p className="footer__brand-desc">
                            <Link to="/" style={{ color: 'inherit', fontWeight: 'bold' }}>AntiLabs</Link> is a premium IT services firm specializing in enterprise cybersecurity, cloud architecture, and custom <Link to="/services?tab=software" style={{ color: 'inherit', textDecoration: 'underline' }}>AntiLabs Web Development</Link>. Explore our comprehensive <Link to="/services" style={{ color: 'inherit', textDecoration: 'underline' }}>AntiLabs Services</Link> designed to scale with your ambitions.
                        </p>
                        <div className="footer__socials">
                            <SocialIcon href="https://www.linkedin.com/company/antilabs/" label="LinkedIn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                            </SocialIcon>
                            <SocialIcon href="https://www.instagram.com/antilabs.in?igsh=bzJtaHNlbzQwcW94" label="Instagram">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </SocialIcon>
                            {/* <SocialIcon href="#" label="Twitter/X">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </SocialIcon>
                            <SocialIcon href="#" label="GitHub">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                                </svg>
                            </SocialIcon>
                            <SocialIcon href="#" label="YouTube">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
                                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#111827" />
                                </svg>
                            </SocialIcon> */}
                        </div>
                    </div>

                    {/* Col 2 — Services */}
                    <div className="footer__col">
                        <h4 className="footer__col-title">Services</h4>
                        <ul className="footer__links">
                            {links.services.map(s => (
                                <li key={s.href}>
                                    <Link to={s.href} className="footer__link">{s.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 3 — Company */}
                    <div className="footer__col">
                        <h4 className="footer__col-title">Company</h4>
                        <ul className="footer__links">
                            {links.company.map(l => (
                                <li key={l.href}>
                                    <Link to={l.href} className="footer__link">{l.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 4 — Legal */}
                    <div className="footer__col">
                        <h4 className="footer__col-title">Legal</h4>
                        <ul className="footer__links">
                            {links.legal.map(l => (
                                <li key={l.href}>
                                    <Link to={l.href} className="footer__link">{l.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 5 — Contact */}
                    <div className="footer__col footer__col--contact">
                        <h4 className="footer__col-title">Contact</h4>
                        <div className="footer__contact-list">
                            <div className="footer__contact-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>Rau, Indore</span>
                            </div>
                            <div className="footer__contact-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                                </svg>
                                <span>
                                    <a href="mailto:arya@antilabs.in" className="footer__link" style={{ display: 'inline' }}>arya@antilabs.in</a>
                                </span>
                            </div>
                            <div className="footer__contact-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.85 5c0-1.18.9-2.16 2-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L10.09 10.9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                                </svg>
                                <a href="tel:+917049780160" className="footer__link">+91 7049780160</a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="footer__bottom">
                <div className="container footer__bottom-inner">
                    <span className="footer__copy">© {year} AntiLabs Technologies Pvt. Ltd. All rights reserved.</span>
                    <div className="footer__bottom-links">
                        <Link to="/privacy" className="footer__link footer__link--sm">Privacy Policy</Link>
                        <span className="footer__dot">·</span>
                        <Link to="/terms" className="footer__link footer__link--sm">Terms of Service</Link>
                        <span className="footer__dot">·</span>
                        <Link to="/refund" className="footer__link footer__link--sm">Refund Policy</Link>
                        <span className="footer__dot">·</span>
                        <Link to="/employment" className="footer__link footer__link--sm">Employment Policy</Link>
                    </div>
                    <button className="footer__back-top" onClick={scrollTop} aria-label="Back to top">
                        Back to top ↑
                    </button>
                </div>
            </div>
        </footer>
    );
}
