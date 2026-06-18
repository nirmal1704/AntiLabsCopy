import React from "react";
import { useNavigate } from "react-router-dom";
import "./HacklabsNavbar.css";
import logo from "/Hacklabslogo.png";

export default function HacklabsNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="hacklabs-navbar">
      <div className="navbar-left">
        <img src={logo} alt="Hacklabs Logo" className="navbar-logo" />
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
