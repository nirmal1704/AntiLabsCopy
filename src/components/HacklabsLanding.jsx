import RobotMascot from "./RobotMascot";
import "./HacklabsLanding.css";
export default function HacklabsLanding({ robotArrived }) {
  return (
    <main className="hacklabs-page">
      <section className="hacklabs-hero">
        {/* LEFT SIDE */}
        <div className="hero-content">
          <div className="hero-badge">Applications Open • June 2026</div>

          <h1>
            Build. Ship.
            <br />
            <span>Hack</span> the future.
          </h1>

          <p>
            48 hours. Limitless ideas. Join 500+ developers, designers and
            makers at the most intense hackathon of the year.
          </p>

          <button className="hero-cta">Submit your space</button>
        </div>

        {/* RIGHT SIDE */}
        <div className="floating-card card-left">
          <div className="card-header">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <code>
            <br />
            I was Supposed to be an Assistant
            <br />
            But they run out of tokens
          </code>
        </div>

        {robotArrived && <RobotMascot className="hero-robot" />}

        <div className="floating-card card-right">
          <div className="card-header">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <code>
            Hello,
            <br />
            Welcome to HackLabs
            <br />
          </code>
        </div>
      </section>
    </main>
  );
}
