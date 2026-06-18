import React from "react";
import "./HacklabsFooter.css";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import { IoChatbubbleOutline } from "react-icons/io5";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <img src="/Hacklabslogo.png" alt="Your Logo" />
        </div>

        {/* Navigation */}
        <nav className="footer-nav">
          <a href="/enterprise">Enterprise</a>
          <a href="/demo">Get a Demo</a>
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/event-terms">Event T&amp;Cs</a>
        </nav>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p>© 2026 HackLabs. ALL RIGHTS RESERVED</p>

          <div className="footer-socials">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FaGithub />
            </a>

            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
            >
              <FaXTwitter />
            </a>

            <a href="/contact" aria-label="Contact">
              <IoChatbubbleOutline />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
