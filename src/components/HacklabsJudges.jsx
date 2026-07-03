import { useState } from "react";
import "./HacklabsJudges.css";
import aryaImg from "/hacklabsarya.png";
import piyushImg from "/hacklabspiyush.png";
import nirmalImg from "/hacklabsnirmal.png";
import kaushImg from "/hacklabskasuh.png";

export default function HacklabsJudges() {
  const judges = [
    {
      name: "Arya Sharma",
      role: "CEO & Full Stack Developer",
      image: aryaImg,
    },
    {
      name: "Piyush Singh",
      role: "Front-End Devloper",
      image: piyushImg,
    },
    {
      name: "Nirmal Reddy",
      role: "Back-End Devloper",
      image: nirmalImg,
    },
    {
      name: "Kaushtubham Shukla",
      role: "AI Engineer",
      image: kaushImg,
    },
  ];
  const [selectedJudge, setSelectedJudge] = useState(judges[0]);
  return (
    <section className="judges-panel">
      <h1 className="panel-title">//Judges Panel</h1>

      <div className="panel-container">
        <div className="judges-list">
          {judges.map((judge, index) => (
            <div
              key={index}
              className="judge-card"
              onMouseEnter={() => setSelectedJudge(judge)}
            >
              <h2>{judge.name}</h2>
              <p>{judge.role}</p>
            </div>
          ))}
        </div>

        <div className="judge-image-container">
          <img
            src={selectedJudge.image}
            alt={selectedJudge.name}
            className="judge-image"
          />
        </div>
      </div>
      <div className="judges-grid">
        {judges.map((judge, index) => (
          <div key={index} className="judge-grid-card">
            <img
              src={judge.image}
              alt={judge.name}
              className="judge-grid-image"
            />

            <div className="judge-grid-content">
              <h3>{judge.name}</h3>
              <p>{judge.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
