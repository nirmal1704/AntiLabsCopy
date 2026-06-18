import React, { useEffect, useState, useRef } from "react";
import "./HacklabsStats.css";

function Counter({
  start,
  end,
  suffix = "",
  prefix = "",
  duration = 4000,
  startAnimation,
}) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!startAnimation) return;

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
  }, [startAnimation, start, end, duration]);

  return (
    <span>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

export default function HacklabsStats() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // run only once
        }
      },
      {
        threshold: 1, // 100% visible
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      label: "Total Prize Pool",
      render: () => (
        <>
          ₹
          <Counter
            start={1}
            end={10}
            suffix="K+"
            duration={4000}
            startAnimation={visible}
          />
        </>
      ),
    },
    {
      label: "Hacking Window",
      render: () => (
        <Counter
          start={0}
          end={48}
          suffix="H"
          duration={4000}
          startAnimation={visible}
        />
      ),
    },
    {
      label: "Members Per Team",
      render: () => (
        <Counter start={0} end={4} duration={4000} startAnimation={visible} />
      ),
    },
    {
      label: "Registration Fee",
      render: () => (
        <>
          ₹
          <Counter
            start={1000}
            end={199}
            duration={4000}
            startAnimation={visible}
          />
        </>
      ),
    },
  ];

  return (
    <section className="Stats" ref={sectionRef}>
      {stats.map((item, index) => (
        <div className="box" key={index}>
          <div className="Statstitle">{item.render()}</div>
          <div className="Statssubtitle">{item.label}</div>
        </div>
      ))}
    </section>
  );
}
