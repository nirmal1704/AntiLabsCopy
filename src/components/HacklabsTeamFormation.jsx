import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import "./HacklabsTeamFormation.css";

export default function HacklabsTeamFormation({ participant, onTeamUpdated }) {
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invites, setInvites] = useState([]);
  const [view, setView] = useState("home");

  // home
  // create
  // join

  useEffect(() => {
    fetchInvites();

    const interval = setInterval(() => {
      fetchInvites();
      checkTeamStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [participant]);

  const checkTeamStatus = async () => {
    if (!participant) return;
    try {
      const { data, error } = await supabase
        .from("hacklabs_personal_details")
        .select("team_id")
        .eq("auth_id", participant.auth_id)
        .single();
        
      if (!error && data && data.team_id && !participant.team_id) {
        const { data: teamData } = await supabase
          .from("hacklabs_teams")
          .select("*")
          .eq("id", data.team_id)
          .single();
        if (teamData) {
          onTeamUpdated(teamData);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvites = async () => {
    if (!participant) return;
    try {
      const { data, error } = await supabase
        .from("hacklabs_invitations")
        .select(
          `
          id, type, status,
          team:hacklabs_teams(name, unique_team_code)
        `,
        )
        .eq("participant_auth_id", participant.auth_id)
        .eq("status", "pending")
        .eq("type", "invite");

      if (error) throw error;
      setInvites(data || []);
    } catch (err) {
      console.error("Error fetching invites:", err);
    }
  };

  const generateTeamCode = () => {
    return (
      "HL-TEAM-" + Math.random().toString(36).substring(2, 8).toUpperCase()
    );
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName) return;
    setLoading(true);
    setError(null);
    try {
      const teamCode = generateTeamCode();
      const { data: teamData, error: teamError } = await supabase
        .from("hacklabs_teams")
        .insert({
          name: teamName,
          unique_team_code: teamCode,
          captain_id: participant.auth_id,
        })
        .select()
        .single();

      if (teamError) {
        if (teamError.code === "23505")
          throw new Error(
            "This Team Name is already taken! Please choose another.",
          );
        throw teamError;
      }

      const { error: partError } = await supabase
        .from("hacklabs_personal_details")
        .update({ team_id: teamData.id })
        .eq("auth_id", participant.auth_id);

      if (partError) throw partError;

      onTeamUpdated(teamData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (e) => {
    e.preventDefault();
    if (!joinCode) return;
    setLoading(true);
    setError(null);
    try {
      const { data: teamData, error: teamError } = await supabase
        .from("hacklabs_teams")
        .select("id")
        .eq("unique_team_code", joinCode)
        .single();

      if (teamError || !teamData)
        throw new Error("Team not found. Please check the code.");

      const { error: inviteError } = await supabase
        .from("hacklabs_invitations")
        .insert({
          team_id: teamData.id,
          participant_auth_id: participant.auth_id,
          type: "request",
          status: "pending",
        });

      if (inviteError) throw inviteError;

      alert("Request sent successfully! Wait for the captain to accept.");
      setJoinCode("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId, teamNameCode) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("accept_hacklabs_invite", {
        invite_id: inviteId,
      });
      if (error) throw error;

      const { data: fullTeam, error: teamError } = await supabase
        .from("hacklabs_teams")
        .select("*")
        .eq("unique_team_code", teamNameCode.unique_team_code)
        .single();
        
      if (teamError) throw teamError;

      onTeamUpdated(fullTeam);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="team-formation-container">
      {error && <div className="formation-error">{error}</div>}

      {view === "home" && (
        <div className="team-home">
          <h1>Team</h1>

          <button className="primary-btn" onClick={() => setView("create")}>
            Create Team
          </button>

          <button className="secondary-btn" onClick={() => setView("join")}>
            Join Team
          </button>

          {invites.length > 0 && (
            <div className="invites-section">
              <h2>Pending Invites</h2>

              {invites.map((inv) => (
                <div key={inv.id} className="invite-card">
                  <span>{inv.team?.name}</span>

                  <button onClick={() => handleAcceptInvite(inv.id, inv.team)}>
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "create" && (
        <div className="team-screen">
          <h1>Create Team</h1>

          <form className="team-form" onSubmit={handleCreateTeam}>
            <label>Enter Team Name :</label>

            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />

            <div className="form-actions">
              <button type="submit">
                {loading ? "Creating..." : "Create"}
              </button>

              <button
                type="button"
                className="back-btn"
                onClick={() => setView("home")}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      )}

      {view === "join" && (
        <div className="team-screen">
          <h1>Join Team</h1>

          <form className="join-form" onSubmit={handleJoinRequest}>
            <label>Enter Team ID:</label>

            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              required
            />

            <button type="submit">{loading ? "..." : "Join"}</button>
          </form>

          <h2 className="details-heading">Team Details :-</h2>

          <div className="team-members">
            <div className="member-row">Captain</div>
            <div className="member-row">Empty Slot</div>
            <div className="member-row">Empty Slot</div>
            <div className="member-row">Empty Slot</div>
          </div>

          <button
            className="back-btn bottom-back"
            onClick={() => setView("home")}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
