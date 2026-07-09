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
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const orderId = queryParams.get('order_id');
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

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

        if (orderId) {
          setVerifyingPayment(true);
          try {
            const verifyRes = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-cashfree-order`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ action: 'verify', order_id: orderId, is_dev: isDev }),
              }
            );
            const orderData = await verifyRes.json();
            if (orderData.order_status === 'PAID') {
              // Clear parameters from the URL
              window.history.replaceState({}, '', window.location.pathname);
            } else {
              setPaymentError('Payment verification failed or status is pending.');
            }
          } catch (err) {
            console.error('Error verifying Hacklabs payment:', err);
            setPaymentError('Failed to verify payment status.');
          } finally {
            setVerifyingPayment(false);
          }
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

    checkAuthAndFetchData();
  }, [navigate, openLogin]);

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

  if (verifyingPayment) {
    return (
      <>
        <HacklabsNavbar />
        <div className="dashboard-loading-screen" style={{ flexDirection: 'column', gap: '15px' }}>
          <div className="loader" style={{
            width: "40px",
            height: "40px",
            border: "4px solid rgba(255,255,255,0.1)",
            borderTop: "4px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p>Verifying your payment, please don't close this page...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <HacklabsNavbar />
      
      {paymentError && (
        <div className="payment-error-banner" style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '12px 20px',
          margin: '20px auto 0 auto',
          maxWidth: '1200px',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'sans-serif'
        }}>
          <span>⚠️ {paymentError}</span>
          <button onClick={() => setPaymentError(null)} style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '18px'
          }}>✕</button>
        </div>
      )}
      
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
