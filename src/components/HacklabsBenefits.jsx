import React from "react";
import { FaGears, FaBriefcase, FaUsers } from "react-icons/fa6";
import { FaRegIdCard } from "react-icons/fa";
import "./HacklabsBenefits.css";

const benefits = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 22h5a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.3" />
        <path d="M14 2v5a1 1 0 0 0 1 1h5" />
        <path d="m7.69 16.479 1.29 4.88a.5.5 0 0 1-.698.591l-1.843-.849a1 1 0 0 0-.879.001l-1.846.85a.5.5 0 0 1-.692-.593l1.29-4.88" />
        <circle cx="6" cy="14" r="3" />
      </svg>
    ),
    text: "Participation Certificate",
  },
  {
    icon: <FaGears />,
    text: (
      <>
        AntiLabs Training Programs for{" "}
        <span className="price-wrapper">
          <span className="old-price">₹3000</span>
          <span className="new-price">₹1</span>
        </span>
      </>
    ),
  },
  {
    icon: <FaBriefcase />,
    text: "Internship Opportunities",
  },
  {
    icon: <FaUsers />,
    text: "Community Access & Networking",
  },
  {
    icon: <FaRegIdCard />,
    text: "Portfolio Enhancement",
  },
];

export default function Benefits() {
  return (
    <section className="benefits-section">
      <h1 className="benefits-heading">
        // Every Participant walks away with more.
      </h1>

      <div className="benefits-table">
        {benefits.map((benefit, index) => (
          <div className="benefit-row" key={index}>
            <div className="icon-cell">{benefit.icon}</div>

            <div className="text-cell">{benefit.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
