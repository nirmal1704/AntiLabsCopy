import React, { useState, useEffect } from "react";
import "./HacklabsTimer.css";

const TimerCircle = ({ value, label }) => {
  // Use 60 ticks for all rings to maintain a balanced, unified, and aesthetic look
  const ticks = 60;
  
  // Map the active ticks to the 60-tick circle
  let activeTicks = 0;
  if (label === "Secs") activeTicks = value;
  else if (label === "Mins") activeTicks = value;
  else if (label === "Hours") activeTicks = Math.round((value / 24) * 60);
  else activeTicks = Math.round((value / 30) * 60); // Assuming 30 days max

  return (
    <div className="timer-circle-wrapper">
      <svg viewBox="0 0 100 100" className="timer-svg">
        {Array.from({ length: ticks }).map((_, i) => {
          const isActive = i < activeTicks;
          // Rotate each tick around the center (50, 50)
          // 0 index starts at top (-90 degrees)
          const angle = (i * 360) / ticks - 90; 
          return (
            <rect 
              key={i}
              x="49" y="3" width="1.5" height="6" rx="0.75"
              fill={isActive ? "#ffffff" : "#000000"}
              stroke="#ffffff"
              strokeWidth="0.5"
              transform={`rotate(${angle} 50 50)`}
            />
          )
        })}
      </svg>
      <div className="timer-content">
        <span className="timer-value">{String(value).padStart(2, '0')}</span>
        <span className="timer-label">{label}</span>
      </div>
    </div>
  );
};

export default function HacklabsTimer() {
  const [timeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 59,
    seconds: 44
  });

  useEffect(() => {
    // Timer animation stopped per user request
  }, []);

  return (
    <div className="hacklabs-timer-container">
      <TimerCircle value={timeLeft.days} label="Days" />
      <span className="timer-colon">:</span>
      <TimerCircle value={timeLeft.hours} label="Hours" />
      <span className="timer-colon">:</span>
      <TimerCircle value={timeLeft.minutes} label="Mins" />
      <span className="timer-colon">:</span>
      <TimerCircle value={timeLeft.seconds} label="Secs" />
    </div>
  );
}
