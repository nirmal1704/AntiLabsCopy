import { useNavigate } from "react-router-dom";
import { useAuthModal } from "../context/AuthModalContext";
import { supabase } from "../supabase";
import "./HacklabsHero.css";

export default function HacklabsHero() {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  const handleJoinClick = async () => {
    // const {
    //   data: { session },
    // } = await supabase.auth.getSession();
    // if (session) {
    //   navigate("/hacklabs/coming");
    // } else {
    //   openLogin();
    // }
    navigate("/hacklabs/coming");
  };

  return (
    <>
      <section className="hero">
        <div className="hero-left">
          <p className="hero-subtitle">AntiLabs Presents /// HackLabs 2026</p>

          <span className="light">Build.</span>
          <span className="dark">Innovate.</span>
          <span className="light">Get Hired.</span>
        </div>
        <div className="hero-right">
          <div className="ticket-btn-wrapper" onClick={handleJoinClick}>
            <button className="ticket-btn">
              <span className="corner top-left"></span>
              <span className="corner top-right"></span>
              <span className="corner bottom-left"></span>
              <span className="corner bottom-right"></span>
              <span className="btn-text">
                Join HackLabs <img src="/arrow.svg" alt="" />{" "}
              </span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
