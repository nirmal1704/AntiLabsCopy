import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./HacklabsNavbar.css";

export default function HacklabsNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="hacklabs-navbar">
      <div
        className="navbar-left"
        style={{ display: "flex", alignItems: "center", gap: "12px" }}
      >
        <motion.img
          layoutId="hacklabs-logo-transition"
          src="/hacklabs-logo.png"
          alt="Hacklabs Logo Symbol"
          onClick={() => navigate("/")}
          style={{ height: "32px", cursor: "pointer", mixBlendMode: "screen" }}
        />
        <span
          onClick={() => navigate("/hacklabs")}
          className="hacklabs-logo-text"
        >
          Hacklabs
        </span>
      </div>

      <div className="navbar-right">
        <button className="nav-btn">Register</button>

        <button
          className="nav-btn"
          onClick={() => navigate("/hacklabs/dashboard")}
        >
          LOGIN
        </button>
      </div>
    </nav>
  );
}
