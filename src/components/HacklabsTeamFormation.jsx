import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import "./HacklabsTeamFormation.css";

export default function HacklabsTeamFormation({ participant, onTeamUpdated }) {
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [searchedTeam, setSearchedTeam] = useState(null);
  const [fetchingTeam, setFetchingTeam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({
    teamName: "",
    joinCode: "",
  });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participant]);
  const validateCreateTeam = () => {
    const newErrors = {};

    if (!teamName.trim()) {
      newErrors.teamName = "TEAM NAME IS REQUIRED";
    } else if (teamName.trim().length < 3) {
      newErrors.teamName = "TEAM NAME MUST CONTAIN AT LEAST 3 CHARACTERS";
    } else if (teamName.trim().length > 30) {
      newErrors.teamName = "TEAM NAME CANNOT EXCEED 30 CHARACTERS";
    } else if (!/^[A-Za-z0-9 ]+$/.test(teamName.trim())) {
      newErrors.teamName = "ONLY LETTERS, NUMBERS AND SPACES ARE ALLOWED";
    }

    setErrors((prev) => ({
      ...prev,
      teamName: newErrors.teamName || "",
    }));

    return Object.keys(newErrors).length === 0;
  };

  const validateJoinCode = () => {
    const newErrors = {};

    if (!joinCode.trim()) {
      newErrors.joinCode = "TEAM CODE IS REQUIRED";
    } else if (!/^HL-TEAM-[A-Z0-9]{6}$/.test(joinCode.trim())) {
      newErrors.joinCode = "ENTER A VALID TEAM CODE";
    }

    setErrors((prev) => ({
      ...prev,
      joinCode: newErrors.joinCode || "",
    }));

    return Object.keys(newErrors).length === 0;
  };
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
    setError(null);

    if (!validateCreateTeam()) return;
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
          throw new Error(
            "This Team Name is already taken! Please choose another.",
          );
        }
        if (existingTeam.captain_id === participant.auth_id) {
          teamData = existingTeam;
        } else {
          throw new Error(
            "This Team Name is already taken! Please choose another.",
          );
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
            throw new Error(
              "This Team Name is already taken! Please choose another.",
            );
          }
          throw insertError;
        }
        teamData = newTeam;
      }

      // 2. Fetch logged-in user email for Cashfree receipt
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userEmail = session?.user?.email || "";

      // 3. Invoke Supabase edge function to create order
      const { data: orderData, error: orderError } =
        await supabase.functions.invoke("create-cashfree-order", {
          body: {
            team_id: teamData.id,
            customer_name: participant.full_name,
            customer_email: userEmail,
            customer_phone: participant.mobile_number,
            return_url: `${window.location.origin}/hacklabs/dashboard`,
            is_dev: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
          },
        });

      // Extract real error message from edge function response
      if (orderError) {
        let errMsg = "Failed to connect to payment gateway.";
        try {
          const errData = await orderError.context?.json?.();
          if (errData?.error) errMsg = errData.error;
        } catch (_) {
          errMsg = orderError.message || errMsg;
        }
        throw new Error(errMsg);
      }

      if (!orderData || !orderData.payment_session_id) {
        throw new Error(orderData?.error || "Payment gateway did not return a session.");
      }

      // ── MOCK MODE: Cashfree keys not yet configured ──
      if (orderData.mock) {
        setLoading(true);
        try {
          const { error: teamUpdateError } = await supabase
            .from("hacklabs_teams")
            .update({
              payment_status: "paid",
              cashfree_order_id: orderData.order_id,
            })
            .eq("id", teamData.id);
          if (teamUpdateError) throw teamUpdateError;

          const { error: partUpdateError } = await supabase
            .from("hacklabs_personal_details")
            .update({ team_id: teamData.id })
            .eq("auth_id", participant.auth_id);
          if (partUpdateError) throw partUpdateError;

          onTeamUpdated({ ...teamData, payment_status: "paid" });
        } catch (updateErr) {
          setError("Database update failed: " + updateErr.message);
        } finally {
          setLoading(false);
        }
        return;
      }

      // 4. Dynamically load Cashfree JS SDK
      if (!window.Cashfree) {
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () =>
            reject(new Error("Failed to load Cashfree SDK."));
          document.body.appendChild(script);
        });
      }

      const isDev =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
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
            setError(
              "Database update failed after payment: " + updateErr.message,
            );
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

    setError(null);

    if (!validateJoinCode()) return;

    setFetchingTeam(true);

    try {
      const { data: teamData, error: teamError } = await supabase.rpc(
        "preview_team_by_code",
        { p_team_code: joinCode.trim() }
      ).single();

      if (teamError || !teamData) {
        throw new Error("Team not found. Please check the code.");
      }

      setSearchedTeam({
        ...teamData,
        captain_name: teamData.captain_name,
        member_names: teamData.member_names || [],
      });
    } catch (err) {
      setSearchedTeam(null);
      setError(err.message);
    } finally {
      setFetchingTeam(false);
    }
  };

  const handleSendJoinRequest = async () => {
    if (!searchedTeam) return;
    setLoading(true);
    setError(null);
    try {
      const { error: inviteError } = await supabase
        .from("hacklabs_invitations")
        .insert({
          team_id: searchedTeam.id,
          participant_auth_id: participant.auth_id,
          type: "request",
          status: "pending",
        });

      if (inviteError) {
        if (inviteError.code === "23505") throw new Error("You have already sent a request to this team.");
        throw inviteError;
      }

      alert("Request sent successfully! Wait for the captain to accept.");
      setSearchedTeam(null);
      setJoinCode("");
      setView("home");
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
      {error && <div className="formation-error">{error.toUpperCase()}</div>}
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

            <div className="field">
              <input
                type="text"
                value={teamName}
                className={errors.teamName ? "input-error" : ""}
                onChange={(e) => {
                  setTeamName(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    teamName: "",
                  }));

                  setError(null);
                }}
              />

              {errors.teamName && (
                <span className="field-error">{errors.teamName}</span>
              )}
            </div>

            <div className="fee-explanation">
              <p>Team Registration requires a one-time fee of ₹199.</p>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {loading ? "Processing..." : "Pay ₹199 & Create Team"}
              </button>

              <button
                type="button"
                className="back-btn secondary-btn"
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

            <div className="field">
              <input
                type="text"
                value={joinCode}
                className={errors.joinCode ? "input-error" : ""}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());

                  setErrors((prev) => ({
                    ...prev,
                    joinCode: "",
                  }));

                  setError(null);
                }}
              />

              {errors.joinCode && (
                <span className="field-error">{errors.joinCode}</span>
              )}
            </div>

            <button type="submit">{loading ? "..." : "Join"}</button>
          </form>

          {fetchingTeam && (
            <div className="team-loading">
              <p>Fetching team details...</p>
            </div>
          )}

          {searchedTeam && (
            <>
              <h2 className="details-heading">Team Details :-</h2>

              <div className="team-members">
                <div className="member-row">
                  <strong>Team Name :</strong> {searchedTeam.name}
                </div>

                <div className="member-row">
                  <strong>Team Code :</strong> {searchedTeam.unique_team_code}
                </div>

                <div className="member-row">
                  <strong>Captain :</strong>{" "}
                  {searchedTeam.captain_name || "Hidden (Privacy settings)"}
                </div>

                {searchedTeam.member_names?.map((memberName, idx) => (
                  <div key={idx} className="member-row">
                    <strong>Member {idx + 1} :</strong> {memberName}
                  </div>
                ))}

                {Array.from({ length: 3 - (searchedTeam.member_names?.length || 0) }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="member-row">Empty Slot</div>
                ))}
              </div>

              <button
                className="primary-btn"
                onClick={handleSendJoinRequest}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Join Request"}
              </button>
            </>
          )}

          <button
            className="back-btn bottom-back secondary-btn"
            onClick={() => setView("home")}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
