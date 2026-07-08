import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import HacklabsNavbar from "../components/HacklabsNavbar";
import "./HacklabsRegisterPage.css";

export default function HacklabsRegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOtp, setShowOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/hacklabs/coming");
      }
    });
  }, [navigate]);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordValid = formData.password.length >= 6;
  const passwordsMatch = formData.password === formData.confirmPassword;
  const formValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    passwordValid &&
    passwordsMatch;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formValid) {
      setError("Please fill all fields correctly.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data: emailExists, error: rpcError } = await supabase.rpc(
        "check_email_exists",
        { p_email: formData.email },
      );

      if (rpcError) {
        console.warn("RPC error:", rpcError);
      } else if (emailExists) {
        throw new Error("This email address is already registered.");
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.name },
        },
      });

      if (authError) throw authError;

      if (data?.session) {
        navigate("/hacklabs/coming");
      } else {
        setShowOtp(true);
        setResendTimer(60);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otp,
        type: "signup",
      });

      if (verifyError) throw verifyError;

      if (data?.session) {
        navigate("/hacklabs/coming");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: formData.email,
      });

      if (error) throw error;
      setResendTimer(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <HacklabsNavbar />
      <div className="register-container">
        {error && <div className="register-error">{error}</div>}
        <div className="register-layout">
          <div className="register-form-section">
            {!showOtp ? (
              <>
                <h3 className="register-section-title">Establish Identity</h3>
                <form id="register-form" onSubmit={handleRegister} className="register-form">
                  <div className="input-group">
                    <label>FULL NAME</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>EMAIL ADDRESS</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>ENTER PASSWORD</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={formData.password && !passwordValid ? "input-error" : ""}
                    />
                    {formData.password && !passwordValid && (
                      <span className="field-error">Password must be at least 6 characters</span>
                    )}
                  </div>
                  <div className="input-group">
                    <label>CONFIRM PASSWORD</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={formData.confirmPassword && !passwordsMatch ? "input-error" : ""}
                    />
                    {formData.confirmPassword && !passwordsMatch && (
                      <span className="field-error">Passwords do not match</span>
                    )}
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="register-section-title">Verify Comm-Link</h3>
                <p className="register-otp-message">
                  A 6-digit security code has been sent to {formData.email}.
                </p>
                <form id="verify-otp-form" onSubmit={handleVerifyOtp} className="register-form">
                  <div className="input-group">
                    <label>ONE TIME PASSWORD</label>
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="000000"
                      maxLength="6"
                      className="register-otp-input"
                    />
                  </div>
                  <div className="register-resend-wrapper">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || loading}
                      className={`register-resend-btn ${resendTimer > 0 ? "disabled" : "active"}`}
                    >
                      {resendTimer > 0
                        ? `Resend code available in ${resendTimer}s`
                        : "Didn't receive code? Resend OTP"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
          
          <div className="register-info-section">
            <h1 className="register-large-text">Register</h1>
            <button
              type="submit"
              form={!showOtp ? "register-form" : "verify-otp-form"}
              className="register-submit-btn"
              disabled={(!showOtp && !formValid) || loading}
            >
              {loading ? "PROCESSING..." : (!showOtp ? "Create Account" : "Submit OTP")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
