import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import HacklabsNavbar from "../components/HacklabsNavbar";
import AvatarPicker from "../components/AvatarPicker";
import "./HacklabsAvatarPage.css";

export default function HacklabsAvatarPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [initialConfig, setInitialConfig] = useState(null);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/hacklabs/register");
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase
        .from("hacklabs_personal_details")
        .select("profile_photo")
        .eq("auth_id", session.user.id)
        .single();
      
      if (!error && data) {
        setInitialConfig(data.profile_photo);
        setCurrentConfig(data.profile_photo);
      }
      setLoading(false);
    });
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user && currentConfig) {
        await supabase
          .from("hacklabs_personal_details")
          .update({ profile_photo: currentConfig })
          .eq("auth_id", user.id);
      }
      navigate("/hacklabs/dashboard");
    } catch (err) {
      console.error(err);
      navigate("/hacklabs/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="avatar-page">
        <HacklabsNavbar />
        <div className="avatar-page-loading">LOADING ID TERMINAL...</div>
      </div>
    );
  }

  return (
    <div className="avatar-page">
      <HacklabsNavbar />
      <div className="avatar-page-container">
        <div className="avatar-header">
          <h1>HACKER ID</h1>
          <p>Configure your digital presence before entering the dashboard.</p>
        </div>

        <AvatarPicker 
          initialConfig={initialConfig} 
          onChange={setCurrentConfig} 
        />

        <div className="avatar-actions">
          <button className="btn-secondary" onClick={() => navigate("/hacklabs/dashboard")}>
            Skip For Now
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "SAVING..." : "Confirm & Enter"}
          </button>
        </div>
      </div>
    </div>
  );
}
