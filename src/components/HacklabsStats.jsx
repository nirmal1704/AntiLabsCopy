import React from "react";
import "./HacklabsStats.css";

const stats = [
  { value: "₹10K+", label: "Total Prize Pool" },
  { value: "48H", label: "Hacking Window" },
  { value: "4", label: "Members Per Team" },
  { value: "₹199", label: "Registration Fee" },
];

export default function HacklabsStats() {
  return (
    <div className="Stats">
      {stats.map((item, index) => (
        <div className="box" key={index}>
          <div className="Statstitle">{item.value}</div>
          <div className="Statssubtitle">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
