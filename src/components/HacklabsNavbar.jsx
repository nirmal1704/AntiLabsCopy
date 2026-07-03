import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "../context/AuthModalContext";
import { supabase } from "../supabase";
import HacklabsAvatar from "./HacklabsAvatar";
import "./HacklabsNavbar.css";

export default function HacklabsNavbar() {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  
  const [session, setSession] = useState(null);
  const [userName, setUserName] = useState("");
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isJudge, setIsJudge] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkUserStatus(session.user.id);
      } else {
        setIsCheckingProfile(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      const { data: isJudgeUser } = await supabase.rpc('is_hacklabs_judge');
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

  return (
    <nav className="hacklabs-navbar">
      <div className="navbar-left navbar-left-wrapper">
        <img
          src="/hacklabs-logo.png"
          alt="Hacklabs Logo Symbol"
          onClick={() => navigate("/")}
          className="hacklabs-logo-img"
        />
        <span
          onClick={() => navigate("/hacklabs")}
          className="hacklabs-logo-text"
        >
          Hacklabs
        </span>
      </div>

      <div className="navbar-right">
        {isCheckingProfile ? null : session && (isJudge || userName) ? (
          isJudge ? (
            <button 
              className="nav-btn judge-view-btn" 
              onClick={() => navigate("/hacklabs/judge-dashboard")}
            >
              Judge View
            </button>
          ) : (
            <div className="hacklabs-user-badge" onClick={() => navigate("/hacklabs/dashboard")}>
              <div className={`user-icon ${avatarConfig ? 'has-avatar' : ''}`}>
                {avatarConfig ? (
                  <HacklabsAvatar config={avatarConfig} size={32} />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                )}
              </div>
              <span className="user-name">{userName || "USER_UNKNOWN"}</span>
            </div>
          )
        ) : (
          <>
            <button className="nav-btn" onClick={() => navigate("/hacklabs/register")}>
              Register
            </button>

            <button
              className="nav-btn"
              onClick={openLogin}
            >
              LOGIN
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
