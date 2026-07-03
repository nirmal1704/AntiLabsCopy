import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Testimonials from '../components/Testimonials';
import { useScrollReveal } from '../hooks/useScrollReveal';
import SEO from '../components/SEO';
import './TestimonialsPage.css';

export default function TestimonialsPage() {
    const hero = useScrollReveal({ threshold: 0.01 });

    return (
        <>
            <SEO title="Testimonials" description="Read what world-class enterprises have to say about partnering with AntiLabs." canonicalUrl="/testimonials" />
            <Navbar />
            <main className="tp">
                <section className="tp__hero">
                    <div className="tp__hero-bg" />
                    <div ref={hero.ref} className={`tp__hero-content container ${hero.visible ? 'tp__hero-content--in' : ''}`}>
                        <span className="section-eyebrow">Client Success</span>
                        <h1 className="tp__hero-h1">Stories of <span className="gradient-text">Transformation</span></h1>
                        <p className="tp__hero-sub">Read what world-class enterprises have to say about partnering with AntiLabs.</p>
                    </div>
                </section>

                {/* The main testimonials component which has the grid */}
                <div style={{ paddingBottom: '100px' }}>
                    <Testimonials />
                </div>
            </main>
            <Footer />
        </>
    );
}
