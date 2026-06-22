import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import HacklabsAvatar from "./HacklabsAvatar";
import "./HacklabsDashboard.css";

export default function HacklabsDashboard({
  team,
  participant,
  onTeamUpdated,
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 780);
  const [members, setMembers] = useState([]);
  const [isFetchingMembers, setIsFetchingMembers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState(null);
  const [requests, setRequests] = useState([]);

  const isCaptain = team?.captain_id === participant?.auth_id;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 780);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchMembers(true);
    fetchRequests();

    const interval = setInterval(() => {
      fetchRequests();
      fetchMembers(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [team]);

  const fetchMembers = async (showLoader = true) => {
    if (!team) return;
    if (showLoader) setIsFetchingMembers(true);
    try {
      const { data, error } = await supabase
        .from("hacklabs_personal_details")
        .select("*")
        .eq("team_id", team.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Error fetching team members:", err);
    } finally {
      if (showLoader) setIsFetchingMembers(false);
    }
  };

  const fetchRequests = async () => {
    if (!team || !isCaptain) return;
    try {
      const { data, error } = await supabase
        .from("hacklabs_invitations")
        .select(
          `
          id, type, status,
          participant:hacklabs_personal_details(auth_id, full_name, unique_user_code)
        `,
        )
        .eq("team_id", team.id)
        .eq("status", "pending")
        .eq("type", "request");

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteCode) return;
    setLoading(true);
    setInviteError(null);

    try {
      const { error: rpcError } = await supabase.rpc("invite_user_by_code", {
        target_user_code: inviteCode,
        source_team_id: team.id,
      });

      if (rpcError) throw rpcError;

      alert("Invite sent successfully!");
      setShowModal(false);
      setInviteCode("");
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (inviteId, participantId) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("accept_hacklabs_invite", {
        invite_id: inviteId,
      });
      if (error) throw error;

      fetchMembers();
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to accept request: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            team_id: team.id,
            customer_name: participant.name,
            customer_email: participant.email,
          },
        },
      );

      if (error) throw error;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: data.amount,
        currency: data.currency,
        name: "AntiLabs",
        description: "HackLabs 2025 Team Registration",
        order_id: data.order_id,
        handler: async function (response) {
          await supabase
            .from("hacklabs_teams")
            .update({
              payment_status: "paid",
              razorpay_payment_id: response.razorpay_payment_id,
            })
            .eq("id", team.id);

          alert("Payment Successful!");
          onTeamUpdated({ ...team, payment_status: "paid" });
        },
        prefill: {
          name: participant.name,
          email: participant.email,
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed or API keys missing.");
    } finally {
      setLoading(false);
    }
  };

  const slots = [
    { id: "slot-0", type: "add" },
    { id: "slot-1", type: "add" },
    { id: "slot-2", type: "add" },
    { id: "slot-3", type: "add" },
  ];

  const order = [1, 2, 0, 3];
  members.forEach((member, i) => {
    if (i < 4) {
      const targetIndex = order[i];
      slots[targetIndex] = {
        id: member.auth_id,
        type: "filled",
        name: member.full_name,
        username: member.unique_user_code,
        avatar_config: member.profile_photo,
        isCaptain: member.auth_id === team.captain_id,
      };
    }
  });

  const displayMembers = isMobile
    ? [
        ...slots.filter((m) => m.type === "filled"),
        ...slots.filter((m) => m.type === "empty"),
        ...slots.filter((m) => m.type === "add"),
      ]
    : slots;

  return (
    <section className="dashboard">
      <h1 className="team-title">{team?.name || "Team Dashboard"}</h1>

      {isCaptain && team?.payment_status === "pending" && (
        <div className="payment-banner">
          <p>Your team registration is pending payment.</p>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="pay-btn"
          >
            Finalize and Pay (₹199)
          </button>
        </div>
      )}

      {team?.payment_status === "paid" && (
        <div className="payment-success-banner">
          <p>✓ Team registration is fully paid and confirmed.</p>
        </div>
      )}

      <div className="members-grid">
        {isFetchingMembers ? (
          <div
            style={{
              padding: "3rem",
              color: "#94a3b8",
              textAlign: "center",
              gridColumn: "1 / -1",
            }}
          >
            Loading team roster...
          </div>
        ) : (
          displayMembers.map((member, idx) => (
            <div
              key={member.id || idx}
              className={`member-card ${member.type === "add" ? "is-add-card" : ""}`}
              onClick={() => {
                if (member.type === "add") {
                  setShowModal(true);
                }
              }}
              style={{ cursor: member.type === "add" ? "pointer" : "default" }}
            >
              <div className="member-top">
                {member.type === "add" && <div className="add-btn">+</div>}

                {member.type === "filled" && (
                  <div className="placeholder-user">
                    {member.avatar_config ? (
                      <HacklabsAvatar config={member.avatar_config} size={80} />
                    ) : (
                      <>
                        <div
                          className="head"
                          style={{
                            background: member.isCaptain ? "#0ea5e9" : "#ccc",
                          }}
                        ></div>
                        <div
                          className="body"
                          style={{
                            borderColor: member.isCaptain ? "#0ea5e9" : "#ccc",
                          }}
                        ></div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="member-bottom">
                <h3>{member.type === "add" ? "Add Member" : member.name}</h3>
                {member.isCaptain && (
                  <span className="captain-badge">Captain</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <div
        className="team-code-box"
        style={{
          marginTop: "2rem",
          background: "#0f172a",
          padding: "1rem 2rem",
          borderRadius: "8px",
          border: "1px dashed #38bdf8",
          marginBottom: "2rem",
          textAlign: "center",
          display: "inline-block",
        }}
      >
        <p
          style={{
            color: "#94a3b8",
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "0.5rem",
          }}
        >
          Share this code to invite members
        </p>
        <span
          style={{
            color: "#38bdf8",
            fontSize: "1.5rem",
            letterSpacing: "4px",
            fontWeight: "bold",
          }}
        >
          {team?.unique_team_code}
        </span>
      </div>

      {showModal && (
        <div className="hacklabs-modal-overlay">
          <div className="hacklabs-modal">
            <h3>Invite Member</h3>
            <p>
              Enter the Unique User Code of your friend to invite them to{" "}
              {team.name}.
            </p>
            {inviteError && <div className="modal-error">{inviteError}</div>}
            <form onSubmit={handleInvite}>
              <input
                type="text"
                placeholder="HL-XXXXXX"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                required
              />
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="invite-btn">
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCaptain && requests.length > 0 && (
        <div
          className="requests-section"
          style={{
            marginTop: "2 rem",
            background: "#151b2b",
            padding: "1.5rem",

            borderRadius: "8px",
          }}
        >
          <h3 style={{ color: "#94a3b8", marginBottom: "1rem" }}>
            Pending Join Requests
          </h3>
          <div
            className="requests-list"
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {requests.map((req) => (
              <div
                key={req.id}
                className="request-card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#0b0f19",
                  padding: "1rem",
                  borderRadius: "6px",
                }}
              >
                <div>
                  <strong>
                    {Array.isArray(req.participant)
                      ? req.participant[0]?.full_name
                      : req.participant?.full_name}
                  </strong>{" "}
                  (@
                  {Array.isArray(req.participant)
                    ? req.participant[0]?.unique_user_code
                    : req.participant?.unique_user_code}
                  ) wants to join your team.
                </div>
                <button
                  onClick={() =>
                    handleAcceptRequest(
                      req.id,
                      Array.isArray(req.participant)
                        ? req.participant[0]?.auth_id
                        : req.participant?.auth_id,
                    )
                  }
                  disabled={loading}
                  style={{
                    background: "#0ea5e9",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
