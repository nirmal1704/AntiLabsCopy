import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuthModal } from "../context/AuthModalContext";
import HacklabsNavbar from "../components/HacklabsNavbar";
import HacklabsDashboard from "../components/HacklabsDashboard";
import HacklabsTeamFormation from "../components/HacklabsTeamFormation";
import "./HacklabsPage.css";

function HacklabsDashboardPage() {
  const [participant, setParticipant] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        navigate("/hacklabs");
        openLogin();
        return;
      }

      const { data: isJudge } = await supabase.rpc('is_hacklabs_judge');
      if (isJudge) {
        navigate("/hacklabs/judge-dashboard");
        return;
      }

      const { data: partData, error: partError } = await supabase
        .from("hacklabs_personal_details")
        .select("*")
        .eq("auth_id", session.user.id)
        .single();

      if (partError) {
        console.error("Participant not found, routing to onboarding...", partError);
        navigate("/hacklabs/onboarding");
        return;
      }

      setParticipant(partData);

      if (partData.team_id) {
        const { data: teamData, error: teamError } = await supabase
          .from("hacklabs_teams")
          .select("*")
          .eq("id", partData.team_id)
          .single();

        if (!teamError && teamData) {
          setTeam(teamData);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamUpdated = async (updatedTeam) => {
    if (updatedTeam) {
      setTeam(updatedTeam);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("hacklabs_personal_details")
          .select("*")
          .eq("auth_id", session.user.id)
          .single();
        if (data) setParticipant(data);
      }
    }
  };

  if (loading) {
    return (
      <>
        <HacklabsNavbar />
        <div className="dashboard-loading-screen">
          Loading your Hacklabs Profile...
        </div>
      </>
    );
  }

  return (
    <>
      <HacklabsNavbar />
      
      {!team ? (
        <HacklabsTeamFormation 
          participant={participant} 
          onTeamUpdated={handleTeamUpdated} 
        />
      ) : (
        <HacklabsDashboard 
          team={team} 
          participant={participant} 
          onTeamUpdated={handleTeamUpdated} 
        />
      )}
    </>
  );
}

export default HacklabsDashboardPage;
