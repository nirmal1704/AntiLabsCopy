import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState({ loading: false, tech: null, acad: null });
  const navigate = useNavigate();

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
        .eq("status", "pending");

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const copyTeamCode = () => {
    navigator.clipboard.writeText(team?.unique_team_code || "");
    alert("Team Code copied to clipboard!");
    setShowModal(false);
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

  const handleMemberClick = async (member) => {
    if (member.type === "add") {
      setShowModal(true);
    } else if (member.type === "filled") {
      setSelectedMember(member);
      setSelectedMemberDetails({ loading: true, tech: null, acad: null });
      
      const [{ data: tech }, { data: acad }] = await Promise.all([
        supabase.from("hacklabs_technical_info").select("*").eq("auth_id", member.id).single(),
        supabase.from("hacklabs_academic_info").select("*").eq("auth_id", member.id).single()
      ]);
      
      setSelectedMemberDetails({ loading: false, tech, acad });
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email || "";

      const { data, error } = await supabase.functions.invoke(
        "create-hacklabs-order",
        {
          body: {
            team_id: team.id,
            customer_name: participant.full_name,
            customer_email: userEmail,
            customer_phone: participant.mobile_number,
            is_dev: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
          },
        },
      );

      if (error) throw error;

      if (!window.Cashfree) {
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        await new Promise((resolve) => {
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const cashfree = window.Cashfree({
        mode: isDev ? "sandbox" : "production",
      });

      const checkoutOptions = {
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal",
      };

      cashfree.checkout(checkoutOptions).then(async (result) => {
        if(result.error){
          console.error("Payment error", result.error);
          alert("Payment failed: " + result.error.message);
        } else if(result.paymentDetails || result.redirect){
          await supabase
            .from("hacklabs_teams")
            .update({
              payment_status: "paid",
              cashfree_order_id: data.order_id,
            })
            .eq("id", team.id);

          alert("Payment Successful!");
          onTeamUpdated({ ...team, payment_status: "paid" });
        }
      });
    } catch (err) {
      console.error(err);
      alert("Payment failed. Please try again.");
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
          
          <div className="fee-breakdown">
            <h4>Payment Summary</h4>
            <div className="fee-row">
              <span>Registration Fee:</span>
              <span>₹199.00</span>
            </div>
            <div className="fee-row-sub">
              <span>Platform Fee (2%):</span>
              <span>₹3.98</span>
            </div>
            <div className="fee-row-sub">
              <span>GST on Fee (18%):</span>
              <span>₹0.72</span>
            </div>
            <hr className="fee-divider" />
            <div className="fee-total">
              <span>Total Payable:</span>
              <span>₹203.70</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="pay-btn"
          >
            Finalize and Pay (₹203.70)
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
          <div className="team-roster-loading">
            Loading team roster...
          </div>
        ) : (
          displayMembers.map((member, idx) => (
            <div
              key={member.id || idx}
              className={`member-card pointer-cursor ${member.type === "add" ? "is-add-card" : ""}`}
              onClick={() => handleMemberClick(member)}
            >
              <div className="member-top">
                {member.type === "add" && <div className="add-btn">+</div>}

                {member.type === "filled" && (
                  <div className="placeholder-user">
                    {member.avatar_config ? (
                      <HacklabsAvatar config={member.avatar_config} size={80} />
                    ) : (
                      <div className="empty-avatar">
                        ?
                      </div>
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
      <div className="team-code-box-wrapper">
        <p className="team-code-label">
          Share this code to invite members
        </p>
        <span className="team-code-value">
          {team?.unique_team_code}
        </span>
      </div>

      {showModal && (
        <div className="hacklabs-modal-overlay">
          <div className="hacklabs-modal">
            <h3>Invite Members</h3>
            <p>
              Share this code with your friends. They can enter it on the Team Formation page to send a join request.
            </p>
            <div className="team-code-display" style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', fontSize: '1.5rem', fontWeight: 'bold', margin: '20px 0', letterSpacing: '2px', textAlign: 'center', userSelect: 'all' }}>
              {team?.unique_team_code}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                Close
              </button>
              <button type="button" onClick={copyTeamCode} className="invite-btn">
                Copy Code
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMember && (
        <div className="hacklabs-modal-overlay" onClick={(e) => { if (e.target.className === 'hacklabs-modal-overlay') setSelectedMember(null); }}>
          <div className="hacklabs-member-modal">
            <button className="close-modal-btn" onClick={() => setSelectedMember(null)}>✕</button>
            
            <div className="member-modal-header">
              <div className="member-modal-avatar">
                {selectedMember.avatar_config ? (
                  <HacklabsAvatar config={selectedMember.avatar_config} size={100} />
                ) : (
                  <div className={`no-avatar-placeholder ${selectedMember.isCaptain ? 'no-avatar-captain' : 'no-avatar-member'}`} />
                )}
              </div>
              <div className="member-modal-title">
                <h2>{selectedMember.name}</h2>
                <p>@{selectedMember.username}</p>
                {selectedMember.isCaptain && <span className="captain-badge">Captain</span>}
              </div>
            </div>

            <div className="member-modal-body">
              {selectedMemberDetails.loading ? (
                <div className="loading-text">Decrypting Data...</div>
              ) : (
                <div className="member-details-grid">
                  <div className="detail-section">
                    <h4>ACADEMIC PROFILE</h4>
                    <p><strong>College:</strong> {selectedMemberDetails.acad?.college_name || "N/A"}</p>
                    <p><strong>Branch:</strong> {selectedMemberDetails.acad?.branch || "N/A"}</p>
                    <p><strong>Year:</strong> {selectedMemberDetails.acad?.year_of_study || "N/A"}</p>
                  </div>
                  
                  <div className="detail-section">
                    <h4>TECH STACK</h4>
                    {selectedMemberDetails.tech?.github_link && (
                      <p><strong>GitHub:</strong> <a href={selectedMemberDetails.tech.github_link} target="_blank" rel="noreferrer">View Profile</a></p>
                    )}
                    {selectedMemberDetails.tech?.linkedin && (
                      <p><strong>LinkedIn:</strong> <a href={selectedMemberDetails.tech.linkedin} target="_blank" rel="noreferrer">View Profile</a></p>
                    )}
                    {selectedMemberDetails.tech?.portfolio && (
                      <p><strong>Portfolio:</strong> <a href={selectedMemberDetails.tech.portfolio} target="_blank" rel="noreferrer">View Portfolio</a></p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {!selectedMember.avatar_config && selectedMember.id === participant?.auth_id && (
              <div className="member-modal-footer">
                <p>You haven't configured your Hacker ID yet.</p>
                <button className="create-avatar-btn" onClick={() => navigate("/hacklabs/id-card")}>
                  Create Hacker ID
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isCaptain && requests.length > 0 && (
        <div className="requests-section">
          <h3 className="requests-section-title">
            Pending Join Requests & Invites
          </h3>
          <div className="requests-list">
            {requests.map((req) => {
              const pName = Array.isArray(req.participant)
                ? req.participant[0]?.full_name
                : req.participant?.full_name;
              const pCode = Array.isArray(req.participant)
                ? req.participant[0]?.unique_user_code
                : req.participant?.unique_user_code;
              const pId = Array.isArray(req.participant)
                ? req.participant[0]?.auth_id
                : req.participant?.auth_id;

              return (
                <div key={req.id} className="request-card">
                  <div>
                    {req.type === "invite" ? (
                      <>
                        You invited <strong>{pName}</strong> (@{pCode}) to join.
                      </>
                    ) : (
                      <>
                        <strong>{pName}</strong> (@{pCode}) wants to join your team.
                      </>
                    )}
                  </div>
                  {req.type === "invite" ? (
                    <span className="pending-reply-badge">
                      Pending Reply
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcceptRequest(req.id, pId)}
                      disabled={loading}
                      className="accept-btn"
                    >
                      Accept
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
