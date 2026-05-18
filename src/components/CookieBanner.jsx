import React, { useState, useEffect } from 'react';
import './CookieBanner.css';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('cookieAccepted');
    if (!hasAccepted) {
      // Delay so it doesn't immediately pop up and block the view
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieAccepted', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieAccepted', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-overlay">
      <div className="cookie-banner glass-card animate-fade-up">
        <div className="cookie-banner-content">
          <h4>We Value Your Privacy</h4>
          <p>
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
          </p>
        </div>
        <div className="cookie-banner-actions">
          <button className="btn btn-secondary cookie-btn-decline" onClick={handleDecline}>Decline</button>
          <button className="btn btn-primary cookie-btn-accept" onClick={handleAccept}>Accept</button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
