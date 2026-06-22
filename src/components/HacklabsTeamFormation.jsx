import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import "./HacklabsTeamFormation.css";

export default function HacklabsTeamFormation({ participant, onTeamUpdated }) {
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    fetchInvites();
    
    const interval = setInterval(() => {
      fetchInvites();
    }, 5000);
    return () => clearInterval(interval);
  }, [participant]);

  const fetchInvites = async () => {
    if (!participant) return;
    try {
      const { data, error } = await supabase
        .from("hacklabs_invitations")
        .select(`
          id, type, status,
          team:hacklabs_teams(name, unique_team_code)
        `)
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
    return "HL-TEAM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
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
        if (teamError.code === '23505') throw new Error("This Team Name is already taken! Please choose another.");
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

      if (teamError || !teamData) throw new Error("Team not found. Please check the code.");

      const { error: inviteError } = await supabase
        .from("hacklabs_invitations")
        .insert({
          team_id: teamData.id,
          participant_auth_id: participant.auth_id,
          type: "request",
          status: "pending"
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

  const handleAcceptInvite = async (inviteId, team) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('accept_hacklabs_invite', { invite_id: inviteId });
      if (error) throw error;

      onTeamUpdated(team);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-formation-container">
      <div className="participant-info">
        <h3>Your Unique User Code</h3>
        <div className="code-box">{participant?.unique_user_code}</div>
        <p className="code-hint">Share this code with a team captain to get invited!</p>
      </div>

      {error && <div className="formation-error">{error}</div>}

      <div className="formation-actions">
        <div className="formation-card">
          <h3>Create a Team</h3>
          <form onSubmit={handleCreateTeam}>
            <input 
              type="text" 
              placeholder="Enter Team Name" 
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              Create Team as Captain
            </button>
          </form>
        </div>

        <div className="formation-divider">OR</div>

        <div className="formation-card">
          <h3>Join a Team</h3>
          <form onSubmit={handleJoinRequest}>
            <input 
              type="text" 
              placeholder="Enter Unique Team Code" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              required
            />
            <button type="submit" disabled={loading} className="outline-btn">
              Send Join Request
            </button>
          </form>
        </div>
      </div>

      {invites.length > 0 && (
        <div className="invites-section">
          <h3>Pending Invites</h3>
          <div className="invites-list">
            {invites.map((inv) => (
              <div key={inv.id} className="invite-card">
                <div>
                  <strong>{inv.team?.name}</strong> invited you to join.
                </div>
                <button 
                  onClick={() => handleAcceptInvite(inv.id, inv.team)}
                  disabled={loading}
                >
                  Accept Invite
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
