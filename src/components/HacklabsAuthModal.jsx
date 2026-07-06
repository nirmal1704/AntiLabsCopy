import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuthModal } from "../context/AuthModalContext";
import "./HacklabsAuthModal.css";

export default function HacklabsAuthModal() {
  const { isOpen, closeModal } = useAuthModal();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setPassword("");
      setErrors({
        email: "",
        password: "",
      });
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ==========================
  // Validation
  // ==========================

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "EMAIL ADDRESS IS REQUIRED";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = "ENTER A VALID EMAIL ADDRESS";
    }

    if (!password.trim()) {
      newErrors.password = "PASSWORD IS REQUIRED";
    } else if (password.length < 6) {
      newErrors.password = "PASSWORD MUST BE AT LEAST 6 CHARACTERS";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================
  // Login
  // ==========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;

      closeModal();

      navigate("/hacklabs/coming");
    } catch (err) {
      setError(err.message || "LOGIN FAILED");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Register
  // ==========================

  const goToRegister = () => {
    closeModal();
    navigate("/hacklabs/register");
  };

  return (
    <div className="auth-modal-overlay" onClick={closeModal}>
      <div className="auth-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={closeModal}>
          ✕
        </button>

        <div className="auth-modal-header">
          <h2 className="auth-title">LOGIN</h2>

          <p className="auth-subtitle">ACCESS YOUR HACKLABS DASHBOARD</p>
        </div>

        {error && <div className="auth-error">{error.toUpperCase()}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          {/* EMAIL */}

          <div className="input-group">
            <label>EMAIL ADDRESS</label>

            <input
              type="email"
              placeholder="ENTER YOUR EMAIL"
              value={email}
              className={errors.email ? "input-error" : ""}
              onChange={(e) => {
                setEmail(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  email: "",
                }));

                setError("");
              }}
            />

            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          {/* PASSWORD */}

          <div className="input-group">
            <label>PASSWORD</label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              className={errors.password ? "input-error" : ""}
              onChange={(e) => {
                setPassword(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  password: "",
                }));

                setError("");
              }}
            />

            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "AUTHENTICATING..." : "LOGIN"}
          </button>
        </form>

        <div className="auth-footer">
          <p>DON'T HAVE AN ACCOUNT?</p>

          <button
            type="button"
            className="register-link-btn"
            onClick={goToRegister}
          >
            REGISTER NOW
          </button>
        </div>
      </div>
    </div>
  );
}
