import React, { useEffect, useState } from "react";
import "./HacklabsDashboard.css";

export default function HacklabsDashboard() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 780);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 780);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const members = [
    { id: 1, type: "add" },
    { id: 2, type: "empty", name: "Mem 1" },
    {
      id: 3,
      type: "filled",
      name: "Mem 2",
      image: "/hacklabspiyush.png",
    },
    { id: 4, type: "add" },
  ];

  const displayMembers = isMobile
    ? [
        ...members.filter((m) => m.type === "filled"),
        ...members.filter((m) => m.type === "empty"),
        ...members.filter((m) => m.type === "add"),
      ]
    : members;

  return (
    <section className="dashboard">
      <h1 className="team-title">Team TeenTitans</h1>

      <div className="members-grid">
        {displayMembers.map((member) => (
          <div key={member.id} className="member-card">
            <div className="member-top">
              {member.type === "add" && <button className="add-btn">+</button>}

              {member.type === "empty" && (
                <div className="placeholder-user">
                  <div className="head"></div>
                  <div className="body"></div>
                </div>
              )}

              {member.type === "filled" && (
                <img
                  src={member.image}
                  alt={member.name}
                  className="member-image"
                />
              )}
            </div>

            <div className="member-bottom">
              <h3>{member.type === "add" ? "Add Mem" : member.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
