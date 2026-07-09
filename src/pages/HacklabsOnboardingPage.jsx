import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import HacklabsNavbar from "../components/HacklabsNavbar";
import "./HacklabsOnboardingPage.css";

export default function HacklabsOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [personal, setPersonal] = useState({
    full_name: "",
    mobile_number: "",
    dob: "",
    gender: "Male",
    unique_user_code:
      "HL-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
  });

  const [academic, setAcademic] = useState({
    college_name: "",
    degree: "",
    branch: "",
    year_of_study: "",
    graduation_year: "",
  });

  const [technical, setTechnical] = useState({
    github_link: "",
    linkedin: "",
    portfolio: "",
    resume_link: "",
  });

  useEffect(() => {
    const savedStep = localStorage.getItem("hacklabs_onboarding_step");
    if (savedStep) setStep(parseInt(savedStep, 10));

    const savedPersonal = localStorage.getItem("hacklabs_onboarding_personal");
    if (savedPersonal) setPersonal(JSON.parse(savedPersonal));

    const savedAcademic = localStorage.getItem("hacklabs_onboarding_academic");
    if (savedAcademic) setAcademic(JSON.parse(savedAcademic));

    const savedTechnical = localStorage.getItem("hacklabs_onboarding_technical");
    if (savedTechnical) setTechnical(JSON.parse(savedTechnical));
  }, []);

  useEffect(() => {
    localStorage.setItem("hacklabs_onboarding_step", step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem("hacklabs_onboarding_personal", JSON.stringify(personal));
  }, [personal]);

  useEffect(() => {
    localStorage.setItem("hacklabs_onboarding_academic", JSON.stringify(academic));
  }, [academic]);

  useEffect(() => {
    localStorage.setItem("hacklabs_onboarding_technical", JSON.stringify(technical));
  }, [technical]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/hacklabs/register");
        return;
      }

      const { data: isJudge } = await supabase.rpc("is_hacklabs_judge");
      if (isJudge) {
        navigate("/hacklabs/judge-dashboard");
        return;
      }

      setUser(session.user);
      
      setPersonal((prev) => {
        if (!prev.full_name && session.user.user_metadata?.full_name) {
          return { ...prev, full_name: session.user.user_metadata.full_name };
        }
        return prev;
      });

      const { data } = await supabase
        .from("hacklabs_personal_details")
        .select("auth_id")
        .eq("auth_id", session.user.id)
        .single();
      if (data) {
        navigate("/hacklabs/dashboard");
      }
    });
  }, [navigate]);

  const handleNext = async (e) => {
    e.preventDefault();

    if (step === 1 && !validateStep1()) return;

    if (step === 2 && !validateStep2()) return;

    if (user) {
      const formData = {
        ...personal,
        ...academic,
        ...technical,
        current_step: step + 1
      };
      await supabase
        .from('hacklabs_application_drafts')
        .upsert({
          user_id: user.id,
          form_data: formData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }

    setStep((s) => s + 1);

    window.scrollTo(0, 0);
  };
  const validateStep2 = () => {
    const errors = {};

    if (academic.college_name.length < 3) {
      errors.college_name = "ENTER A VALID INSTITUTION NAME";
    }

    if (!academic.degree) {
      errors.degree = "DEGREE PROGRAM REQUIRED";
    }

    if (!academic.branch) {
      errors.branch = "SPECIALIZATION REQUIRED";
    }

    if (!academic.year_of_study) {
      errors.year_of_study = "SELECT CURRENT YEAR";
    }

    if (!/^[0-9]{4}$/.test(academic.graduation_year)) {
      errors.graduation_year = "INVALID GRADUATION YEAR";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };
  const validateStep3 = () => {
    const errors = {};

    if (!technical.github_link.trim()) {
      errors.github_link = "GITHUB PROFILE REQUIRED";
    } else {
      try {
        new URL(technical.github_link);
      } catch {
        errors.github_link = "VALID GITHUB PROFILE REQUIRED";
      }
    }

    if (technical.linkedin.trim()) {
      try {
        new URL(technical.linkedin);
      } catch {
        errors.linkedin = "INVALID LINKEDIN URL";
      }
    }

    if (technical.portfolio.trim()) {
      try {
        new URL(technical.portfolio);
      } catch {
        errors.portfolio = "INVALID PORTFOLIO URL";
      }
    }

    if (technical.resume_link.trim()) {
      try {
        new URL(technical.resume_link);
      } catch {
        errors.resume_link = "INVALID RESUME URL";
      }
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };
  const handleBack = () => {
    setStep((s) => s - 1);
    window.scrollTo(0, 0);
  };

  const handleSaveData = async (e) => {
    e.preventDefault();
    if (!validateStep3()) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: pErr } = await supabase
        .from("hacklabs_personal_details")
        .upsert({
          auth_id: user.id,
          full_name:
            personal.full_name ||
            user.user_metadata?.full_name ||
            "Unknown Identity",
          email: user.email,
          mobile_number: personal.mobile_number,
          dob: personal.dob,
          gender: personal.gender,
          unique_user_code: personal.unique_user_code,
          profile_photo: null,
        });
      if (pErr) throw pErr;

      const { error: aErr } = await supabase
        .from("hacklabs_academic_info")
        .upsert({
          auth_id: user.id,
          ...academic,
        });
      if (aErr) throw aErr;

      const { error: tErr } = await supabase
        .from("hacklabs_technical_info")
        .upsert({
          auth_id: user.id,
          ...technical,
        });
      if (tErr) throw tErr;

      localStorage.removeItem("hacklabs_onboarding_step");
      localStorage.removeItem("hacklabs_onboarding_personal");
      localStorage.removeItem("hacklabs_onboarding_academic");
      localStorage.removeItem("hacklabs_onboarding_technical");
      
      await supabase.from("hacklabs_application_drafts").delete().eq("user_id", user.id);

      navigate("/hacklabs/id-card");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const validateStep1 = () => {
    const errors = {};

    if (personal.full_name.trim().length < 3) {
      errors.full_name = "IDENTITY NAME MUST CONTAIN 3+ CHARACTERS";
    }

    if (!/^[0-9]{10}$/.test(personal.mobile_number)) {
      errors.mobile_number = "ENTER A VALID 10 DIGIT CONTACT NUMBER";
    }

    const age = new Date().getFullYear() - new Date(personal.dob).getFullYear();

    if (!personal.dob || age < 16) {
      errors.dob = "PARTICIPANT MUST BE AT LEAST 16 YEARS OLD";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };
  return (
    <div className="onboarding-page">
      <HacklabsNavbar />

      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1>Register To Hacklabs</h1>
        </div>

        <div className="progress-bar">
          <div
            className={`progress-step ${step >= 1 ? "completed" : ""} ${step === 1 ? "active" : ""}`}
          >
            1
          </div>
          <div
            className={`progress-step ${step >= 2 ? "completed" : ""} ${step === 2 ? "active" : ""}`}
          >
            2
          </div>
          <div
            className={`progress-step ${step >= 3 ? "completed" : ""} ${step === 3 ? "active" : ""}`}
          >
            3
          </div>
        </div>

        {error && (
          <div className="onboarding-error-box">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleNext} className="step-content">
            <h2>Identity Verification</h2>

            <div className="form-grid">
              {/* Legal Name */}
              <div className="input-group full-width">
                <label>Legal Name</label>

                <input
                  type="text"
                  value={personal.full_name}
                  onChange={(e) =>
                    setPersonal({
                      ...personal,
                      full_name: e.target.value,
                    })
                  }
                  placeholder="John Doe"
                  className={fieldErrors.full_name ? "input-error" : ""}
                />

                {fieldErrors.full_name && (
                  <div className="hacklabs-error">{fieldErrors.full_name}</div>
                )}
              </div>

              {/* Contact Number */}
              <div className="input-group">
                <label>Contact Number</label>

                <input
                  type="text"
                  value={personal.mobile_number}
                  onChange={(e) =>
                    setPersonal({
                      ...personal,
                      mobile_number: e.target.value,
                    })
                  }
                  placeholder="+91 9876543210"
                  className={fieldErrors.mobile_number ? "input-error" : ""}
                />

                {fieldErrors.mobile_number && (
                  <div className="hacklabs-error">
                    {fieldErrors.mobile_number}
                  </div>
                )}
              </div>

              {/* DOB */}
              <div className="input-group">
                <label>Date of Birth</label>

                <input
                  type="date"
                  value={personal.dob}
                  onChange={(e) =>
                    setPersonal({
                      ...personal,
                      dob: e.target.value,
                    })
                  }
                  className={fieldErrors.dob ? "input-error" : ""}
                />

                {fieldErrors.dob && (
                  <div className="hacklabs-error">{fieldErrors.dob}</div>
                )}
              </div>

              {/* Gender */}
              <div className="input-group full-width">
                <label>Gender</label>

                <select
                  value={personal.gender}
                  onChange={(e) =>
                    setPersonal({
                      ...personal,
                      gender: e.target.value,
                    })
                  }
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="btn-group btn-group-right">
              <button type="submit" className="btn-primary">
                Continue
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleNext} className="step-content">
            <h2>Academic Credentials</h2>

            <div className="form-grid">
              {/* College */}
              <div className="input-group full-width">
                <label>College / University Name</label>

                <input
                  type="text"
                  value={academic.college_name}
                  onChange={(e) =>
                    setAcademic({
                      ...academic,
                      college_name: e.target.value,
                    })
                  }
                  placeholder="Institute of Technology"
                  className={fieldErrors.college_name ? "input-error" : ""}
                />

                {fieldErrors.college_name && (
                  <div className="hacklabs-error">
                    {fieldErrors.college_name}
                  </div>
                )}
              </div>

              {/* Degree */}
              <div className="input-group">
                <label>Degree</label>

                <input
                  type="text"
                  value={academic.degree}
                  onChange={(e) =>
                    setAcademic({
                      ...academic,
                      degree: e.target.value,
                    })
                  }
                  placeholder="B.Tech"
                  className={fieldErrors.degree ? "input-error" : ""}
                />

                {fieldErrors.degree && (
                  <div className="hacklabs-error">{fieldErrors.degree}</div>
                )}
              </div>

              {/* Branch */}
              <div className="input-group">
                <label>Branch / Department</label>

                <input
                  type="text"
                  value={academic.branch}
                  onChange={(e) =>
                    setAcademic({
                      ...academic,
                      branch: e.target.value,
                    })
                  }
                  placeholder="Computer Engineering"
                  className={fieldErrors.branch ? "input-error" : ""}
                />

                {fieldErrors.branch && (
                  <div className="hacklabs-error">{fieldErrors.branch}</div>
                )}
              </div>

              {/* Current Year */}
              <div className="input-group">
                <label>Current Year of Study</label>

                <select
                  value={academic.year_of_study}
                  onChange={(e) =>
                    setAcademic({
                      ...academic,
                      year_of_study: e.target.value,
                    })
                  }
                  className={fieldErrors.year_of_study ? "input-error" : ""}
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Passout">Passout</option>
                </select>

                {fieldErrors.year_of_study && (
                  <div className="hacklabs-error">
                    {fieldErrors.year_of_study}
                  </div>
                )}
              </div>

              {/* Graduation Year */}
              <div className="input-group">
                <label>Graduation Year</label>

                <input
                  type="text"
                  value={academic.graduation_year}
                  onChange={(e) =>
                    setAcademic({
                      ...academic,
                      graduation_year: e.target.value,
                    })
                  }
                  placeholder="2028"
                  className={fieldErrors.graduation_year ? "input-error" : ""}
                />

                {fieldErrors.graduation_year && (
                  <div className="hacklabs-error">
                    {fieldErrors.graduation_year}
                  </div>
                )}
              </div>
            </div>

            <div className="btn-group">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleBack}
              >
                Back
              </button>

              <button type="submit" className="btn-primary">
                Continue
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSaveData} className="step-content">
            <h2>Technical Profile</h2>

            <div className="form-grid">
              {/* GitHub */}
              <div className="input-group full-width">
                <label>GitHub Profile Link</label>

                <input
                  type="url"
                  value={technical.github_link}
                  onChange={(e) =>
                    setTechnical({
                      ...technical,
                      github_link: e.target.value,
                    })
                  }
                  placeholder="https://github.com/username"
                  className={fieldErrors.github_link ? "input-error" : ""}
                />

                {fieldErrors.github_link && (
                  <div className="hacklabs-error">
                    {fieldErrors.github_link}
                  </div>
                )}
              </div>

              {/* LinkedIn */}
              <div className="input-group full-width">
                <label>LinkedIn Profile (Optional)</label>

                <input
                  type="url"
                  value={technical.linkedin}
                  onChange={(e) =>
                    setTechnical({
                      ...technical,
                      linkedin: e.target.value,
                    })
                  }
                  placeholder="https://linkedin.com/in/username"
                  className={fieldErrors.linkedin ? "input-error" : ""}
                />

                {fieldErrors.linkedin && (
                  <div className="hacklabs-error">{fieldErrors.linkedin}</div>
                )}
              </div>

              {/* Portfolio */}
              <div className="input-group full-width">
                <label>Portfolio Website (Optional)</label>

                <input
                  type="url"
                  value={technical.portfolio}
                  onChange={(e) =>
                    setTechnical({
                      ...technical,
                      portfolio: e.target.value,
                    })
                  }
                  placeholder="https://yourportfolio.com"
                  className={fieldErrors.portfolio ? "input-error" : ""}
                />

                {fieldErrors.portfolio && (
                  <div className="hacklabs-error">{fieldErrors.portfolio}</div>
                )}
              </div>

              {/* Resume */}
              <div className="input-group full-width">
                <label>Resume Link (Optional)</label>

                <input
                  type="url"
                  value={technical.resume_link}
                  onChange={(e) =>
                    setTechnical({
                      ...technical,
                      resume_link: e.target.value,
                    })
                  }
                  placeholder="Google Drive / Dropbox Resume URL"
                  className={fieldErrors.resume_link ? "input-error" : ""}
                />

                {fieldErrors.resume_link && (
                  <div className="hacklabs-error">
                    {fieldErrors.resume_link}
                  </div>
                )}
              </div>
            </div>

            <div className="btn-group">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleBack}
              >
                Back
              </button>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "FINALIZING..." : "Finalize Registration"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
