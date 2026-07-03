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
      // 1. Check if team with this name already exists
      const { data: existingTeam, error: checkError } = await supabase
        .from("hacklabs_teams")
        .select("*")
        .eq("name", teamName)
        .maybeSingle();

      if (checkError) throw checkError;

      let teamData;
      if (existingTeam) {
        if (existingTeam.payment_status === "paid") {
          throw new Error("This Team Name is already taken! Please choose another.");
        }
        if (existingTeam.captain_id === participant.auth_id) {
          teamData = existingTeam;
        } else {
          throw new Error("This Team Name is already taken! Please choose another.");
        }
      } else {
        const teamCode = generateTeamCode();
        const { data: newTeam, error: insertError } = await supabase
          .from("hacklabs_teams")
          .insert({
            name: teamName,
            unique_team_code: teamCode,
            captain_id: participant.auth_id,
            payment_status: "pending",
          })
          .select()
          .single();

        if (insertError) {
          if (insertError.code === "23505") {
            throw new Error("This Team Name is already taken! Please choose another.");
          }
          throw insertError;
        }
        teamData = newTeam;
      }

      // 2. Fetch logged-in user email for Cashfree receipt
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email || "";

      // 3. Invoke Supabase edge function to create order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "create-cashfree-order",
        {
          body: {
            team_id: teamData.id,
            customer_name: participant.full_name,
            customer_email: userEmail,
            customer_phone: participant.mobile_number,
          },
        }
      );

      if (orderError || !orderData || !orderData.payment_session_id) {
        throw new Error(orderError?.message || orderData?.error || "Failed to initialize payment gateway.");
      }

      // 4. Dynamically load Cashfree JS SDK
      if (!window.Cashfree) {
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error("Failed to load Cashfree SDK."));
          document.body.appendChild(script);
        });
      }

      const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const cashfree = window.Cashfree({
        mode: isDev ? "sandbox" : "production",
      });

      const checkoutOptions = {
        paymentSessionId: orderData.payment_session_id,
        redirectTarget: "_modal",
      };

      cashfree.checkout(checkoutOptions).then(async (result) => {
        if (result.error) {
          console.error("Payment error", result.error);
          setError("Payment failed or cancelled: " + result.error.message);
          setLoading(false);
        } else if (result.paymentDetails || result.redirect) {
          setLoading(true);
          try {
            // Update team status to paid and store transaction details
            const { error: teamUpdateError } = await supabase
              .from("hacklabs_teams")
              .update({
                payment_status: "paid",
                cashfree_order_id: orderData.order_id,
              })
              .eq("id", teamData.id);
            if (teamUpdateError) throw teamUpdateError;

            // Associate participant with the team
            const { error: partUpdateError } = await supabase
              .from("hacklabs_personal_details")
              .update({ team_id: teamData.id })
              .eq("auth_id", participant.auth_id);
            if (partUpdateError) throw partUpdateError;

            onTeamUpdated({ ...teamData, payment_status: "paid" });
          } catch (updateErr) {
            console.error(updateErr);
            setError("Database update failed after payment: " + updateErr.message);
          } finally {
            setLoading(false);
          }
        }
      });

    } catch (err) {
      setError(err.message);
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
