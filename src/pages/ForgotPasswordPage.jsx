import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import HacklabsNavbar from "../components/HacklabsNavbar";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";
import "./HacklabsRegisterPage.css"; // Use Hacklabs styling instead of generic Auth.css

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();
  const errorRef = useRef(null);

  // Auto-scroll to error message
  useEffect(() => {
    if (errorMsg && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errorMsg]);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate("/hacklabs/dashboard");
    }
  }, [user, navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "send-password-otp",
        {
          body: { email: email.trim() },
        },
      );

      if (error || data?.error) {
        setErrorMsg(
          error?.message ||
            data?.error ||
            "Failed to send OTP. Please try again.",
        );
        setLoading(false);
        return;
      }

      setSuccessMsg(
        "Comm-Link established. An OTP has been sent to your email.",
      );
      setStep(2);
    } catch (err) {
      console.error("Send OTP error:", err);
      setErrorMsg("An error occurred while sending the OTP.");
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = newPassword === confirmPassword;

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      // First, verify the OTP
      const { data: verifyData, error: verifyError } =
        await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: "recovery",
        });

      if (verifyError || !verifyData.session) {
        setErrorMsg(
          verifyError?.message || "Invalid or expired OTP. Please try again.",
        );
        setLoading(false);
        return;
      }

      // If OTP is valid, user is now logged in. We can update their password.
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setErrorMsg(updateError.message || "Failed to update password.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Password updated successfully! Redirecting...");

      // Sign out the user so they can log in with new credentials
      await supabase.auth.signOut();

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Update password error:", err);
      setErrorMsg("An error occurred while updating the password.");
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <SEO
        title="Reset Password"
        description="Reset your HackLabs account password."
        canonicalUrl="/forgot-password"
      />
      <HacklabsNavbar />
      <div className="register-container">
        {errorMsg && (
          <div className="register-error" ref={errorRef}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            className="register-error"
            style={{
              borderColor: "#22c55e",
              color: "#22c55e",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
            }}
          >
            {successMsg}
          </div>
        )}

        <div className="register-layout">
          <div className="register-form-section">
            {step === 1 ? (
              <>
                <h3 className="register-section-title">
                  Initiate Password Reset
                </h3>
                <form
                  id="send-otp-form"
                  className="register-form"
                  onSubmit={handleSendOtp}
                >
                  <div className="input-group">
                    <label>EMAIL ADDRESS</label>
                    <input
                      type="email"
                      id="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="register-resend-wrapper">
                    <button
                      type="button"
                      onClick={() => navigate("/hacklabs")}
                      className="register-resend-btn active"
                      style={{
                        color: "#fff",
                        textDecoration: "underline",
                        fontWeight: "bold",
                      }}
                    >
                      Remembered it? Back to Home
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="register-section-title">
                  Verify & Update Comm-Link
                </h3>
                <form
                  id="reset-pwd-form"
                  className="register-form"
                  onSubmit={handleUpdatePassword}
                >
                  <div className="input-group">
                    <label>8-DIGIT OTP</label>
                    <input
                      type="text"
                      id="otp"
                      placeholder="00000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={8}
                      className="register-otp-input"
                      autoComplete="one-time-code"
                    />
                  </div>

                  <div className="input-group">
                    <label>NEW PASSWORD</label>
                    <input
                      type="password"
                      id="newPassword"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className={
                        newPassword && newPassword.length < 6
                          ? "input-error"
                          : ""
                      }
                    />
                    {newPassword && newPassword.length < 6 && (
                      <span className="field-error">
                        Password must be at least 6 characters
                      </span>
                    )}
                  </div>

                  <div className="input-group">
                    <label>CONFIRM PASSWORD</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={
                        confirmPassword && !passwordsMatch ? "input-error" : ""
                      }
                    />
                    {confirmPassword && !passwordsMatch && (
                      <span className="field-error">
                        Passwords do not match
                      </span>
                    )}
                  </div>
                  <div className="register-resend-wrapper">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setOtp("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="register-resend-btn active"
                      style={{
                        color: "#0ea5e9",
                        textDecoration: "underline",
                        fontWeight: "bold",
                      }}
                    >
                      Didn't receive code? Resend OTP
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          <div className="register-info-section">
            <h1 className="register-large-text">Reset Password</h1>
            <button
              type="submit"
              form={step === 1 ? "send-otp-form" : "reset-pwd-form"}
              className="register-submit-btn"
              disabled={
                loading ||
                (step === 2 && (!passwordsMatch || newPassword.length < 6))
              }
            >
              {loading
                ? "PROCESSING..."
                : step === 1
                  ? "Send OTP"
                  : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
