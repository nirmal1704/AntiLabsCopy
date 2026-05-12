import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SEO title="Page Not Found" description="The page you are looking for does not exist." />
      <Navbar />
      
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '4rem', margin: '0', color: '#0ea5e9' }}>404</h1>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0f172a' }}>Page Not Found</h2>
        <p style={{ fontSize: '1.125rem', color: '#64748b', maxWidth: '500px', marginBottom: '2rem' }}>
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <Link 
          to="/" 
          style={{
            padding: '12px 24px',
            backgroundColor: '#0ea5e9',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
        >
          Return Home
        </Link>
      </main>
      
      <Footer />
    </div>
  );
}
