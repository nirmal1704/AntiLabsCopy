import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuthModal } from "../context/AuthModalContext";
import "./HacklabsAuthModal.css";

export default function HacklabsAuthModal() {
  const { isOpen, closeModal } = useAuthModal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setEmail("");
      setPassword("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      
      closeModal();
      navigate("/hacklabs/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/hacklabs/dashboard`
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  const goToRegister = () => {
    closeModal();
    navigate("/hacklabs/register");
  };

  return (
    <div className="auth-modal-overlay" onClick={closeModal}>
      <div className="auth-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Corner Cutters */}
        <span className="auth-corner top-left"></span>
        <span className="auth-corner top-right"></span>
        <span className="auth-corner bottom-left"></span>
        <span className="auth-corner bottom-right"></span>

        <button className="close-btn" onClick={closeModal}>✕</button>

        <div className="auth-modal-header">
          <h2 className="auth-title">SYSTEM.LOGIN</h2>
        </div>

        {error && <div className="auth-error">Error: {error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label>EMAIL_ADDRESS</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="INPUT_EMAIL"
            />
          </div>
          <div className="input-group">
            <label>SECURE_PASSWORD</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "AUTHENTICATING..." : "AUTHENTICATE"}
          </button>
        </form>

        <div className="auth-divider"><span>OR_CONNECT_VIA</span></div>

        <button className="google-btn" onClick={handleGoogleLogin} type="button">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          GOOGLE_OAUTH
        </button>

        <div className="auth-footer">
          <p>Don't have an account?</p>
          <button className="register-link-btn" onClick={goToRegister}>
            REGISTER_NEW_USER
          </button>
        </div>
      </div>
    </div>
  );
}
