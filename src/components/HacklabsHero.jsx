import "./HacklabsHero.css";

export default function HacklabsHero() {
  return (
    <>
      <section className="hero">
        <div className="hero-left">
          <p className="hero-subtitle">AntiLabs Presents /// HackLabs 2025</p>

          <span className="light">Build.</span>
          <span className="dark">Innovate.</span>
          <span className="light">Get Hired.</span>
        </div>

        <div className="hero-right">
          <div className="ticket-btn-wrapper" onClick={() => {}}>
            <button className="ticket-btn">
              {/* Corner cutters */}
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
