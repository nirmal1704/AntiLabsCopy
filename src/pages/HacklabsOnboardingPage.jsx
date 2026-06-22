import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import HacklabsNavbar from "../components/HacklabsNavbar";
import HacklabsAvatar from "../components/HacklabsAvatar";
import "./HacklabsOnboardingPage.css";

const SKIN_COLORS = ["#ffdbac", "#f1c27d", "#e0ac69", "#8d5524", "#3d2210"];
const HAIR_STYLES = ["none", "short", "spiky", "long"];
const HAIR_COLORS = ["#2b2b2b", "#a52a2a", "#f0e68c", "#0ea5e9", "#ff00ff"];
const EYE_STYLES = ["normal", "shades", "cyborg"];
const MOUTH_STYLES = ["smile", "straight", "sad"];
export default function HacklabsOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [personal, setPersonal] = useState({
    full_name: "",
    mobile_number: "",
    dob: "",
    gender: "Male",
    unique_user_code: "HL-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    avatar: { skin: "#ffdbac", hair: "short", hairColor: "#2b2b2b", eyes: "shades", mouth: "smile" }
  });

  const [academic, setAcademic] = useState({
    college_name: "",
    degree: "",
    branch: "",
    year_of_study: "",
    graduation_year: ""
  });

  const [technical, setTechnical] = useState({
    github_link: "",
    linkedin: "",
    portfolio: "",
    resume_link: ""
  });

  const [teamForm, setTeamForm] = useState({
    name: "",
    joinCode: ""
  });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/hacklabs/register");
        return;
      }
      
      const { data: isJudge } = await supabase.rpc('is_hacklabs_judge');
      if (isJudge) {
        navigate("/hacklabs/judge-dashboard");
        return;
      }
      
      setUser(session.user);
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

  const handleNext = (e) => {
    e.preventDefault();
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setStep(s => s - 1);
    window.scrollTo(0, 0);
  };

  const handleSaveData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: pErr } = await supabase.from("hacklabs_personal_details").upsert({
        auth_id: user.id,
        full_name: personal.full_name || user.user_metadata?.full_name || "Unknown Identity",
        mobile_number: personal.mobile_number,
        dob: personal.dob,
        gender: personal.gender,
        unique_user_code: personal.unique_user_code,
        profile_photo: personal.avatar
      });
      if(pErr) throw pErr;

      const { error: aErr } = await supabase.from("hacklabs_academic_info").upsert({
        auth_id: user.id,
        ...academic
      });
      if(aErr) throw aErr;

      const { error: tErr } = await supabase.from("hacklabs_technical_info").upsert({
        auth_id: user.id,
        ...technical
      });
      if(tErr) throw tErr;

      navigate("/hacklabs/dashboard");
    } catch(err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="onboarding-page">
      <HacklabsNavbar />
      
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1>Initialization Protocol</h1>
        </div>

        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? 'completed' : ''} ${step === 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-step ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`}>2</div>
          <div className={`progress-step ${step >= 3 ? 'completed' : ''} ${step === 3 ? 'active' : ''}`}>3</div>
        </div>

        {error && <div style={{ background: "#7f1d1d", color: "#fca5a5", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>{error}</div>}

        {step === 1 && (
          <form onSubmit={handleNext} className="step-content">
            <h2>Personal Details</h2>
            
            <div className="avatar-builder-mini">
              <div className="avatar-preview">
                <HacklabsAvatar config={personal.avatar} size={120} />
              </div>
              <div className="avatar-controls-grid">
                <div className="input-group">
                  <label>Skin Tone</label>
                  <select value={personal.avatar.skin} onChange={(e) => setPersonal({...personal, avatar: {...personal.avatar, skin: e.target.value}})}>
                    {SKIN_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Hair Style</label>
                  <select value={personal.avatar.hair} onChange={(e) => setPersonal({...personal, avatar: {...personal.avatar, hair: e.target.value}})}>
                    {HAIR_STYLES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Hair Color</label>
                  <select value={personal.avatar.hairColor} onChange={(e) => setPersonal({...personal, avatar: {...personal.avatar, hairColor: e.target.value}})}>
                    {HAIR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Eyewear</label>
                  <select value={personal.avatar.eyes} onChange={(e) => setPersonal({...personal, avatar: {...personal.avatar, eyes: e.target.value}})}>
                    {EYE_STYLES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="input-group full-width">
                <label>Full Name</label>
                <input type="text" required value={personal.full_name} onChange={(e) => setPersonal({...personal, full_name: e.target.value})} placeholder="John Doe" />
              </div>
              <div className="input-group">
                <label>Mobile Number</label>
                <input type="text" required value={personal.mobile_number} onChange={(e) => setPersonal({...personal, mobile_number: e.target.value})} placeholder="+91 9999999999" />
              </div>
              <div className="input-group">
                <label>Date of Birth</label>
                <input type="date" required value={personal.dob} onChange={(e) => setPersonal({...personal, dob: e.target.value})} />
              </div>
              <div className="input-group full-width">
                <label>Gender</label>
                <select value={personal.gender} onChange={(e) => setPersonal({...personal, gender: e.target.value})}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="btn-group" style={{ justifyContent: "flex-end" }}>
              <button type="submit" className="btn-primary">Next Phase</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleNext} className="step-content">
            <h2>Academic Records</h2>
            <div className="form-grid">
              <div className="input-group full-width">
                <label>College / University Name</label>
                <input type="text" required value={academic.college_name} onChange={(e) => setAcademic({...academic, college_name: e.target.value})} placeholder="Institute of Technology" />
              </div>
              <div className="input-group">
                <label>Degree</label>
                <input type="text" required value={academic.degree} onChange={(e) => setAcademic({...academic, degree: e.target.value})} placeholder="B.Tech" />
              </div>
              <div className="input-group">
                <label>Branch / Department</label>
                <input type="text" required value={academic.branch} onChange={(e) => setAcademic({...academic, branch: e.target.value})} placeholder="Computer Science" />
              </div>
              <div className="input-group">
                <label>Current Year of Study</label>
                <select value={academic.year_of_study} onChange={(e) => setAcademic({...academic, year_of_study: e.target.value})}>
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Passout">Passout</option>
                </select>
              </div>
              <div className="input-group">
                <label>Graduation Year</label>
                <input type="text" required value={academic.graduation_year} onChange={(e) => setAcademic({...academic, graduation_year: e.target.value})} placeholder="2026" />
              </div>
            </div>
            
            <div className="btn-group">
              <button type="button" className="btn-secondary" onClick={handleBack}>Back</button>
              <button type="submit" className="btn-primary">Next Phase</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSaveData} className="step-content">
            <h2>Technical Specs</h2>
            <div className="form-grid">
              <div className="input-group full-width">
                <label>GitHub Profile Link</label>
                <input type="url" required value={technical.github_link} onChange={(e) => setTechnical({...technical, github_link: e.target.value})} placeholder="https://github.com/username" />
              </div>
              <div className="input-group full-width">
                <label>LinkedIn Profile (Optional)</label>
                <input type="url" value={technical.linkedin} onChange={(e) => setTechnical({...technical, linkedin: e.target.value})} placeholder="https://linkedin.com/in/username" />
              </div>
              <div className="input-group full-width">
                <label>Portfolio Link (Optional)</label>
                <input type="url" value={technical.portfolio} onChange={(e) => setTechnical({...technical, portfolio: e.target.value})} placeholder="https://mywebsite.com" />
              </div>
              <div className="input-group full-width">
                <label>Resume Link (Optional)</label>
                <input type="url" value={technical.resume_link} onChange={(e) => setTechnical({...technical, resume_link: e.target.value})} placeholder="Google Drive link to PDF" />
              </div>
            </div>
            
            <div className="btn-group">
              <button type="button" className="btn-secondary" onClick={handleBack}>Back</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "SAVING DATABANKS..." : "COMMIT TO DATABASE"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
