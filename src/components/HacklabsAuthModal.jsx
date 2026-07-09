import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuthModal } from "../context/AuthModalContext";
import "./HacklabsAuthModal.css";

export default function HacklabsAuthModal() {
  const { isOpen, closeModal } = useAuthModal();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login", "forgot_password", "reset_password"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    otp: "",
    newPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode("login");
      setEmail("");
      setPassword("");
      setOtp("");
      setNewPassword("");
      setErrors({});
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateLogin = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "EMAIL ADDRESS IS REQUIRED";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) newErrors.email = "ENTER A VALID EMAIL ADDRESS";
    
    if (!password.trim()) newErrors.password = "PASSWORD IS REQUIRED";
    else if (password.length < 6) newErrors.password = "PASSWORD MUST BE AT LEAST 6 CHARACTERS";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateLogin()) return;
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      closeModal();
      navigate("/hacklabs/dashboard");
    } catch (err) {
      setError(err.message || "LOGIN FAILED");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email.trim()) {
      setErrors({ email: "EMAIL ADDRESS IS REQUIRED" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-password-otp", {
        body: { email: email.trim() }
      });
      if (error || data?.error) throw new Error(error?.message || data?.error || "FAILED TO SEND OTP");
      setSuccess(`OTP SENT TO ${email.toUpperCase()}`);
      setMode("reset_password");
    } catch (err) {
      setError(err.message || "FAILED TO SEND OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const newErrors = {};
    if (!otp.trim()) newErrors.otp = "OTP IS REQUIRED";
    if (newPassword.length < 6) newErrors.newPassword = "PASSWORD MUST BE AT LEAST 6 CHARACTERS";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: "recovery",
      });

      if (verifyError || !verifyData.session) {
        throw new Error(verifyError?.message || "INVALID OR EXPIRED OTP");
      }

      // Secure RPC update
      const { error: rpcError } = await supabase.rpc("update_user_password", {
        new_password: newPassword
      });

      if (rpcError) throw rpcError;

      setSuccess("PASSWORD UPDATED SUCCESSFULLY!");
      
      // Auto sign in or redirect
      setTimeout(() => {
        closeModal();
        navigate("/hacklabs/dashboard");
      }, 1500);
      
    } catch (err) {
      setError(err.message || "FAILED TO RESET PASSWORD");
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    closeModal();
    navigate("/hacklabs/register");
  };

  return (
    <div className="auth-modal-overlay" onClick={closeModal}>
      <div className="auth-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={closeModal}>✕</button>
        <div className="auth-modal-header">
          <h2 className="auth-title">
            {mode === "login" && "LOGIN"}
            {mode === "forgot_password" && "FORGOT PASSWORD"}
            {mode === "reset_password" && "RESET PASSWORD"}
          </h2>
          <p className="auth-subtitle">
            {mode === "login" && "ACCESS YOUR HACKLABS DASHBOARD"}
            {mode === "forgot_password" && "ENTER YOUR EMAIL TO RECEIVE AN OTP"}
            {mode === "reset_password" && "ENTER THE OTP AND NEW PASSWORD"}
          </p>
        </div>

        {error && <div className="auth-error">{error.toUpperCase()}</div>}
        {success && <div className="auth-error" style={{ backgroundColor: "#064e3b", color: "#34d399", border: "1px solid #059669", marginTop: "1rem" }}>{success.toUpperCase()}</div>}

        {mode === "login" && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="ENTER YOUR EMAIL"
                value={email}
                className={errors.email ? "input-error" : ""}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                  setError("");
                }}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="input-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label>PASSWORD</label>
                <button 
                  type="button" 
                  onClick={() => setMode("forgot_password")}
                  style={{ background: "none", border: "none", color: "#0ea5e9", fontSize: "0.75rem", cursor: "pointer", fontWeight: "600", padding: 0 }}
                >
                  FORGOT PASSWORD?
                </button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                className={errors.password ? "input-error" : ""}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: "" }));
                  setError("");
                }}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "AUTHENTICATING..." : "LOGIN"}
            </button>
          </form>
        )}

        {mode === "forgot_password" && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="input-group">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="ENTER YOUR EMAIL"
                value={email}
                className={errors.email ? "input-error" : ""}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                  setError("");
                }}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "SENDING OTP..." : "SEND OTP"}
            </button>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button 
                type="button" 
                onClick={() => setMode("login")}
                style={{ background: "none", border: "none", color: "#0ea5e9", fontSize: "0.8rem", cursor: "pointer", fontWeight: "600" }}
              >
                BACK TO LOGIN
              </button>
            </div>
          </form>
        )}

        {mode === "reset_password" && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="input-group">
              <label>8-DIGIT OTP</label>
              <input
                type="text"
                placeholder="00000000"
                maxLength="8"
                value={otp}
                className={errors.otp ? "input-error" : ""}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setErrors((prev) => ({ ...prev, otp: "" }));
                  setError("");
                }}
              />
              {errors.otp && <span className="field-error">{errors.otp}</span>}
            </div>
            <div className="input-group">
              <label>NEW PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                className={errors.newPassword ? "input-error" : ""}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, newPassword: "" }));
                  setError("");
                }}
              />
              {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "UPDATING..." : "UPDATE PASSWORD"}
            </button>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button 
                type="button" 
                onClick={() => setMode("forgot_password")}
                style={{ background: "none", border: "none", color: "#0ea5e9", fontSize: "0.8rem", cursor: "pointer", fontWeight: "600" }}
              >
                RESEND OTP
              </button>
            </div>
          </form>
        )}

        {mode === "login" && (
          <div className="auth-footer">
            <p>DON'T HAVE AN ACCOUNT?</p>
            <button type="button" className="register-link-btn" onClick={goToRegister}>
              REGISTER NOW
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
