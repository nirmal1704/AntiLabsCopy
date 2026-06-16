import { useState, useRef } from "react";
import "./HacklabsTimeline.css";

export default function TimelineSection({ timelineEvents }) {
  const [active, setActive] = useState(0);

  const current = timelineEvents[active];
  const touchStartX = useRef(0);

  const nextSlide = () => {
    setActive((prev) => (prev + 1) % timelineEvents.length);
  };

  const prevSlide = () => {
    setActive(
      (prev) => (prev - 1 + timelineEvents.length) % timelineEvents.length,
    );
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;

    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) < 50) return;

    if (diff > 0) {
      nextSlide(); // swipe left
    } else {
      prevSlide(); // swipe right
    }
  };

  return (
    <section className="timeline-section">
      <span className="timeline-label">// EVENT SCHEDULE</span>

      <h2>Timeline</h2>

      <p>Every moment counts. Your 48-hour journey, one slide at a time.</p>

      <div
        className="timeline-card"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="timeline-left">
          <div>
            <span className="timeline-meta">• {current.day}</span>
            <span className="Timelinetitle">{current.title}</span>
            <span className="Timelinesubtitle">{current.subtitle}</span>
            <p>{current.description}</p>
          </div>
        </div>

        <div className="timeline-big-time">
          {current.time_hour}
          <span>:</span>
          {current.time_minutes}
        </div>
        <button className="timeline-calendar-btn">
          <span className="calendar-icon">
            {/* Outline */}
            <svg
              className="calendar-outline"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7" />
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
            </svg>

            {/* Filled */}
            <svg
              className="calendar-filled"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4z" />
              <path d="M16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M8.5 8.5V10H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V11H6a.5.5 0 0 1 0-1h1.5V8.5a.5.5 0 0 1 1 0" />
            </svg>
          </span>
          Add to Calendar
        </button>
      </div>

      <div className="timeline-controls">
        <button onClick={prevSlide}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-arrow-left"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
            />
          </svg>
        </button>

        <div className="timeline-dots">
          {timelineEvents.map((_, i) => (
            <span key={i} className={i === active ? "active" : ""} />
          ))}
        </div>

        <button onClick={nextSlide}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-arrow-right"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
