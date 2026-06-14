import RobotMascot from "./RobotMascot";
import TimelineSection from "./HacklabsTimeline";
import "./HacklabsLanding.css";

export default function HacklabsLanding({ robotArrived, contentVisible }) {
  const timelineEvents = [
    {
      time: "22:00",
      day: "Day 1",
      title: "Opening Ceremony",
      subtitle: "Kick-off & Vision",
      description:
        "Sponsor shoutouts, rules walkthrough and an energising kick-off.",
    },

    {
      time: "23:00",
      day: "Day 1",
      title: "Team Formation",
      subtitle: "Find your squad",
      description: "Meet hackers, pitch ideas and build your dream team.",
    },

    {
      time: "08:00",
      day: "Day 2",
      title: "Mentor Connect",
      subtitle: "Industry Experts",
      description: "Get guidance from mentors across AI, Web and Product.",
    },

    {
      time: "20:00",
      day: "Day 2",
      title: "Final Submission",
      subtitle: "Ship it",
      description: "Push final code, prepare demos and submit your project.",
    },

    {
      time: "21:00",
      day: "Day 2",
      title: "Judging",
      subtitle: "Project Evaluation",
      description: "Judges evaluate innovation, execution and impact.",
    },

    {
      time: "22:00",
      day: "Day 2",
      title: "Closing Ceremony",
      subtitle: "Awards & Celebration",
      description: "Winners announced and celebration begins.",
    },
  ];
  return (
    <>
      <div
        className={`landing-content ${
          contentVisible ? "landing-content--show" : ""
        }`}
      >
        <main className="hacklabs-page">
          <section className="hacklabs-hero">
            {/* LEFT SIDE */}
            <div className="left">
              <div className="hero-content">
                <div className="hero-badge">• Applications Open </div>

                <h1>
                  Build.
                  <br />
                  <span>Innovate.</span>
                  <br /> Get Hired.
                </h1>

                <p>
                  48 hours. Limitless ideas. Join 500+ developers, designers and
                  makers at the most intense hackathon of the year.
                </p>

                <button className="hero-cta">Join Hacklabs</button>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="right">
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
              <div className="Mascot">
                <RobotMascot
                  className={robotArrived ? "hero-robot arrived" : "hero-robot"}
                />
              </div>
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
            </div>
          </section>
          <section className="hacklabs-stats">
            <div className="stat-card">
              <h3>500+</h3>
              <p>Registered hackers</p>
            </div>

            <div className="stat-card">
              <h3>₹10K+</h3>
              <p>Prize pool</p>
            </div>

            <div className="stat-card">
              <h3>48h</h3>
              <p>Non-stop hacking</p>
            </div>

            <div className="stat-card">
              <h3>20+</h3>
              <p>Industry mentors</p>
            </div>
          </section>
        </main>
      </div>
      <div className="Details">
        <TimelineSection timelineEvents={timelineEvents} />
      </div>
    </>
  );
}
