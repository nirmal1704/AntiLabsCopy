import React, { useState, useEffect } from "react";
import "./HacklabsTimer.css";

const TimerCircle = ({ value, label }) => {
  const ticks = 60;

  let activeTicks = 0;

  if (label === "Secs") activeTicks = value;
  else if (label === "Mins") activeTicks = value;
  else if (label === "Hours") activeTicks = Math.round((value / 24) * 60);
  else activeTicks = Math.round((value / 30) * 60);

  return (
    <>
      <div className="timer-circle-wrapper">
        <svg viewBox="0 0 100 100" className="timer-svg">
          {Array.from({ length: ticks }).map((_, i) => {
            const isActive = i < activeTicks;
            const angle = (i * 360) / ticks - 90;

            return (
              <rect
                key={i}
                x="49"
                y="3"
                width="1.5"
                height="6"
                rx="0.75"
                fill={isActive ? "#ffffff" : "#000000"}
                stroke="#ffffff"
                strokeWidth="0.5"
                transform={`rotate(${angle} 50 50)`}
              />
            );
          })}
        </svg>

        <div className="timer-content">
          <span className="timer-value">{String(value).padStart(2, "0")}</span>
          <span className="timer-label">{label}</span>
        </div>
      </div>
    </>
  );
};
export default function HacklabsTimer() {
  const calculateTimeLeft = () => {
    // 7 August 2026, 12:00 PM IST
    const targetDate = new Date("2026-08-07T12:00:00+05:30");
    const now = new Date();

    const difference = targetDate - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h1 className="timer-heading">// Registration Ends In</h1>
      <div className="hacklabs-timer-container">
        <TimerCircle value={timeLeft.days} label="Days" />
        <span className="timer-colon">:</span>

        <TimerCircle value={timeLeft.hours} label="Hours" />
        <span className="timer-colon">:</span>

        <TimerCircle value={timeLeft.minutes} label="Mins" />
        <span className="timer-colon">:</span>

        <TimerCircle value={timeLeft.seconds} label="Secs" />
      </div>
    </>
  );
}

