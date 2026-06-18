import React from "react";
import "./HacklabsNavbar.css";
import logo from "/Hacklabslogo.png"; // update path

export default function HacklabsNavbar() {
  return (
    <nav className="hacklabs-navbar">
      <div className="navbar-left">
        <img src={logo} alt="Hacklabs Logo" className="navbar-logo" />
      </div>

      <div className="navbar-right">
        <button className="nav-btn">Register</button>
        <button className="nav-btn">LOGIN</button>
      </div>
    </nav>
  );
}
