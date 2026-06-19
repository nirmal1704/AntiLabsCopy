import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const navItems = [
  { label: "Who we are", route: "/about" },
  { label: "What we do", route: "/services" },
  { label: "Insights", route: "/blogs" },
  { label: "Hacklabs", route: "/hacklabs" },
  { label: "Careers", route: "/careers" },
  { label: "Customer stories", route: "/testimonials" },
];

const Logo = () => (
  <NavLink to="/" className="navbar__logo">
    <img src="/logo.png" alt="AntiLabs" className="navbar__logo-img" />
  </NavLink>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner">
        <Logo />

        <ul
          className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}
        >
          {navItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.route}
                end={item.route === "/"}
                className={({ isActive }) =>
                  `navbar__link${isActive ? " navbar__link--active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
                <i className="bi bi-chevron-right navbar__link-chevron" />
              </NavLink>
            </li>
          ))}
          {menuOpen && (
            <li className="navbar__mobile-actions">
              <NavLink
                to="/contact"
                className="btn btn-secondary navbar__mobile-btn"
                onClick={() => setMenuOpen(false)}
              >
                Contact Us
              </NavLink>
              {user ? (
                <NavLink
                  to="/profile"
                  className="btn btn-primary navbar__mobile-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="bi bi-person-circle" />
                  My Profile
                </NavLink>
              ) : (
                <NavLink
                  to="/login"
                  className="btn btn-primary navbar__mobile-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="bi bi-box-arrow-in-right" />
                  Login
                </NavLink>
              )}
            </li>
          )}
        </ul>

        <div className="navbar__actions">
          <NavLink
            to="/contact"
            className="btn btn-secondary navbar__btn-contact"
          >
            Contact Us
          </NavLink>
          {user ? (
            <NavLink
              to="/profile"
              className="btn btn-primary navbar__btn-cta"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  backgroundColor: "#fff",
                  color: "#0ea5e9",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              Profile
            </NavLink>
          ) : (
            <NavLink to="/login" className="btn btn-primary navbar__btn-cta">
              Login
            </NavLink>
          )}
        </div>

        <button
          className={`navbar__hamburger ${menuOpen ? "navbar__hamburger--open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
