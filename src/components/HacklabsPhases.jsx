import { useState } from "react";
import "./HacklabsPhases.css";

const phaseData = {
  registration: [
    "Register your team (up to 4 members).",
    "Complete the registration process.",
    "Receive event updates and participation details.",
    "Prepare your team for the hackathon day.",
  ],

  development: [
    "Join the official Google Meet session.",
    "Receive the problem statement and event guidelines.",
    "Brainstorm and finalize your solution idea.",
    "Develop your project within the 48-hour challenge period.",
    "Test, debug, and refine your solution.",
  ],

  submission: [
    "Create a project presentation video.",
    "Upload the presentation video to YouTube.",
    "Prepare source code and project documentation.",
    "Submit the source code repository.",
    "Submit documentation and YouTube video URL.",
  ],
};

export default function Phases() {
  const [activePhase, setActivePhase] = useState("registration");

  const phases = [
    { key: "registration", label: "Registration" },
    { key: "development", label: "Development" },
    { key: "submission", label: "Submission" },
  ];

  return (
    <section className="phases-section">
      <h1 className="heading">//Phases of HackLabs</h1>

      <div className="phases-container">
        <div className="left-panel">
          {phases.map((phase) => (
            <div
              key={phase.key}
              className={`phase ${activePhase === phase.key ? "active" : ""}`}
              onClick={() => setActivePhase(phase.key)}
            >
              <span className="dot">•</span>
              {phase.label}
            </div>
          ))}
        </div>

        <div className="right-panel">
          {phaseData[activePhase].map((item, index) => (
            <p key={index}>
              {index + 1}. {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
