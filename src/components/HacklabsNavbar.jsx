import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { FiChevronDown, FiLogOut, FiHome } from "react-icons/fi";
import { FiMenu, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "../context/AuthModalContext";
import { supabase } from "../supabase";
import { motion } from "framer-motion";
import HacklabsAvatar from "./HacklabsAvatar";
import "./HacklabsNavbar.css";

export default function HacklabsNavbar() {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [userName, setUserName] = useState("");
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isJudge, setIsJudge] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkUserStatus(session.user.id);
      } else {
        setIsCheckingProfile(false);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsCheckingProfile(true);
        checkUserStatus(session.user.id);
      } else {
        setUserName("");
        setIsJudge(false);
        setIsCheckingProfile(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserStatus = async (userId) => {
    try {
      const { data: isJudgeUser } = await supabase.rpc("is_hacklabs_judge");
      if (isJudgeUser) {
        setIsJudge(true);
      } else {
        const { data, error } = await supabase
          .from("hacklabs_personal_details")
          .select("full_name, profile_photo")
          .eq("auth_id", userId)
          .single();

        if (!error && data) {
          setUserName(data.full_name);
          if (data.profile_photo) setAvatarConfig(data.profile_photo);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingProfile(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowDropdown(false);
    setMobileMenuOpen(false);
    navigate("/hacklabs");
  };
  const isLoggedIn = session && (isJudge || userName);

  //
  return (
    <nav className="hacklabs-navbar">
      <div className="navbar-left navbar-left-wrapper">
        <img
          src="/Hacklabslogo2.png"
          alt="Hacklabs Logo Symbol"
          onClick={() => navigate("/hacklabs")}
          className="hacklabs-logo-img"
        />
      </div>

      {/* Show hamburger ONLY when logged out */}
      {!isLoggedIn && (
        <div className="mobile-menu-toggle">
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      )}

      <div
        className={`navbar-right ${
          !isLoggedIn ? (mobileMenuOpen ? "open" : "") : "desktop-visible"
        }`}
      >
        {isCheckingProfile ? null : isLoggedIn ? (
          isJudge ? (
            <div className="judge-actions">
              <button
                className="nav-btn judge-view-btn"
                onClick={() => navigate("/hacklabs/judge-dashboard")}
              >
                Admin Panel
              </button>
              {
                <button className="nav-btn logout-btn" onClick={handleLogout}>
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              }
            </div>
          ) : (
            <div className="hacklabs-user-dropdown" ref={dropdownRef}>
              <div
                className="hacklabs-user-badge"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <div
                  className={`user-icon ${avatarConfig ? "has-avatar" : ""}`}
                >
                  {avatarConfig ? (
                    <HacklabsAvatar config={avatarConfig} size={32} />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>

                <span className="user-name">{userName || "USER_UNKNOWN"}</span>

                <FiChevronDown
                  className={`dropdown-arrow ${showDropdown ? "open" : ""}`}
                />
              </div>

              {showDropdown && (
                <motion.div
                  className="profile-dropdown"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/hacklabs/dashboard");
                      setShowDropdown(false);
                    }}
                  >
                    <FiHome />
                    <span>Dashboard</span>
                  </button>

                  <button
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <FiLogOut />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </div>
          )
        ) : (
          <>
            <button
              className="nav-btn"
              onClick={() => {
                navigate("/hacklabs/register");
                setMobileMenuOpen(false);
              }}
            >
              REGISTER
            </button>

            <button
              className="nav-btn"
              onClick={() => {
                openLogin();
                setMobileMenuOpen(false);
              }}
            >
              LOGIN
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
