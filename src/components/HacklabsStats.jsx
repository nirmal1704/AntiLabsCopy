import React, { useEffect, useState } from "react";
import "./HacklabsStats.css";

function Counter({ start, end, suffix = "", prefix = "", duration = 4000 }) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);

      const current = Math.floor(start + (end - start) * progress);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [start, end, duration]);

  return (
    <span>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

const stats = [
  {
    label: "Total Prize Pool",
    render: () => (
      <>
        ₹
        <Counter start={1} end={10} suffix="K+" duration={4000} />
      </>
    ),
  },
  {
    label: "Hacking Window",
    render: () => <Counter start={0} end={48} suffix="H" duration={4000} />,
  },
  {
    label: "Members Per Team",
    render: () => <Counter start={0} end={4} duration={4000} />,
  },
  {
    label: "Registration Fee",
    render: () => (
      <>
        ₹
        <Counter start={1000} end={199} duration={4000} />
      </>
    ),
  },
];

export default function HacklabsStats() {
  return (
    <section className="Stats">
      {stats.map((item, index) => (
        <div className="box" key={index}>
          <div className="Statstitle">{item.render()}</div>
          <div className="Statssubtitle">{item.label}</div>
        </div>
      ))}
    </section>
  );
}
