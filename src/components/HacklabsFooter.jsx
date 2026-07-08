import React from "react";
import "./HacklabsFooter.css";
import { FaLinkedinIn, FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="Hacklabsfooter">
      <div className="footer-container">
        <div className="footer-logo footer-logo-wrapper">
          <img
            src="/Hacklabslogo2.png"
            alt="Hacklabs Logo Symbol"
            className="footer-logo-img"
          />
          {/* <span className="footer-logo-text">
            Hacklabs
          </span> */}
        </div>

        {/* Navigation */}
        <nav className="footer-nav">
          <a href="/">Antilabs</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Event T&amp;Cs</a>
        </nav>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p>© 2026 HackLabs. ALL RIGHTS RESERVED</p>

          <div className="footer-socials">
            <a
              href="https://www.linkedin.com/company/antilabs/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>

            <a
              href="https://www.instagram.com/antilabs.in"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>

            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
