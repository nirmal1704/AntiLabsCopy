import React from "react";

export default function HacklabsAvatar({ config, size = 48 }) {
  // Fallback to defaults if no config is provided
  const {
    skin = "#ffdbac",
    hair = "none",
    hairColor = "#2b2b2b",
    eyes = "normal",
    mouth = "smile"
  } = config || {};

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Background / Base Outline */}
      <circle cx="50" cy="50" r="48" fill="#1a1a24" stroke="#0ea5e9" strokeWidth="2" />
      
      {/* Head */}
      <rect x="25" y="25" width="50" height="50" rx="10" fill={skin} />

      {/* Hair Styles */}
      {hair === "short" && (
        <path d="M 25 35 Q 50 15 75 35 L 75 25 Q 50 5 25 25 Z" fill={hairColor} />
      )}
      {hair === "spiky" && (
        <path d="M 25 30 L 35 15 L 45 25 L 55 10 L 65 25 L 75 15 L 75 30 Z" fill={hairColor} />
      )}
      {hair === "long" && (
        <path d="M 25 35 Q 50 10 75 35 L 75 60 L 65 60 L 65 35 Q 50 20 35 35 L 35 60 L 25 60 Z" fill={hairColor} />
      )}

      {/* Eyes */}
      {eyes === "normal" && (
        <>
          <circle cx="40" cy="45" r="4" fill="#000" />
          <circle cx="60" cy="45" r="4" fill="#000" />
        </>
      )}
      {eyes === "shades" && (
        <>
          <rect x="32" y="40" width="16" height="10" rx="2" fill="#111" />
          <rect x="52" y="40" width="16" height="10" rx="2" fill="#111" />
          <line x1="48" y1="45" x2="52" y2="45" stroke="#111" strokeWidth="2" />
        </>
      )}
      {eyes === "cyborg" && (
        <>
          <circle cx="40" cy="45" r="4" fill="#000" />
          <circle cx="60" cy="45" r="5" fill="#f00" stroke="#ff8888" strokeWidth="1" />
        </>
      )}

      {/* Mouth */}
      {mouth === "smile" && (
        <path d="M 40 60 Q 50 70 60 60" fill="transparent" stroke="#000" strokeWidth="3" strokeLinecap="round" />
      )}
      {mouth === "straight" && (
        <line x1="42" y1="62" x2="58" y2="62" stroke="#000" strokeWidth="3" strokeLinecap="round" />
      )}
      {mouth === "sad" && (
        <path d="M 40 65 Q 50 55 60 65" fill="transparent" stroke="#000" strokeWidth="3" strokeLinecap="round" />
      )}
    </svg>
  );
}
