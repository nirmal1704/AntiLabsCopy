import { useState } from "react";
import "./HacklabsNavbar.css";

export default function HacklabsNavbar({ logoArrived }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="hacklabs-navbar">
        <div className="hacklabs-navbar__left">
          <img
            src="/hacklabs.png"
            alt="Hacklabs"
            className={`hacklabs-navbar__logo ${logoArrived ? "show" : ""}`}
          />
        </div>

        <div className="hacklabs-navbar__center">
          <a href="#home">Home</a>
          <a href="#tracks">Tracks</a>
          <a href="#timeline">Timeline</a>
          <a href="#prizes">Prizes</a>
          <a href="#sponsors">Sponsors</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="hacklabs-navbar__right">
          <button className="hacklabs-navbar__login">Log In</button>
          <button className="hacklabs-navbar__register">Register</button>
        </div>

        <button
          className="hacklabs-navbar__menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </nav>

      {menuOpen && (
        <div className="hacklabs-mobile-menu">
          <a href="#home">Home</a>
          <a href="#tracks">Tracks</a>
          <a href="#timeline">Timeline</a>
          <a href="#prizes">Prizes</a>
          <a href="#sponsors">Sponsors</a>
          <a href="#faq">FAQ</a>

          <button className="hacklabs-navbar__login">Log In</button>
          <button className="hacklabs-navbar__register">Register</button>
        </div>
      )}
    </>
  );
}
