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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [otp, setOtp] = useState("");

  useEffect(() => {
    // If they already have an active session, skip auth and go straight to onboarding
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/hacklabs/onboarding");
      }
    });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.name }
        }
      });

      if (authError) throw authError;

      if (data?.session) {
        // If email confirmation is disabled in Supabase, they login immediately
        navigate("/hacklabs/onboarding");
      } else {
        // Email confirmation required -> Show OTP step
        setShowOtp(true);
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
        type: 'signup'
      });

      if (verifyError) throw verifyError;

      if (data?.session) {
        navigate("/hacklabs/onboarding");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <HacklabsNavbar />
      
      <div className="register-container" style={{ maxWidth: "500px", margin: "4rem auto" }}>
        <h1 className="register-title">SYSTEM.AUTHENTICATION</h1>
        
        {error && <div className="register-error">{error}</div>}

        <div className="register-layout">
          <div className="register-form-section" style={{ width: "100%" }}>
            
            {!showOtp ? (
              <>
                <h3 style={{ marginBottom: "1.5rem", color: "#e2e8f0" }}>Establish Identity</h3>
                <form onSubmit={handleRegister} className="register-form">
                  <div className="input-group">
                    <label>FULL_NAME</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
                  </div>
                  <div className="input-group">
                    <label>EMAIL_ADDRESS</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                  </div>
                  <div className="input-group">
                    <label>SECURE_PASSWORD</label>
                    <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" minLength="6" />
                  </div>

                  <button type="submit" className="register-submit-btn" disabled={loading}>
                    {loading ? "PROCESSING..." : "REQUEST_ACCESS"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: "1.5rem", color: "#e2e8f0" }}>Verify Comm-Link</h3>
                <p style={{ color: "#94a3b8", marginBottom: "2rem", fontSize: "0.95rem" }}>
                  A 6-digit security code has been transmitted to {formData.email}.
                </p>
                <form onSubmit={handleVerifyOtp} className="register-form">
                  <div className="input-group">
                    <label>ONE_TIME_PASSWORD</label>
                    <input 
                      type="text" 
                      required 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)} 
                      placeholder="00000000" 
                      maxLength="8"
                      style={{ letterSpacing: "8px", textAlign: "center", fontSize: "1.5rem" }}
                    />
                  </div>

                  <button type="submit" className="register-submit-btn" disabled={loading}>
                    {loading ? "VERIFYING..." : "CONFIRM_IDENTITY"}
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
