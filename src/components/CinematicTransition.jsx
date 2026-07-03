import React, { useEffect, useRef, useState } from "react";
import "./CinematicTransition.css";

export default function CinematicTransition({ onComplete }) {
  const canvasRef = useRef(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const handleSkip = () => {
      onComplete();
    };

    window.addEventListener("keydown", handleSkip);
    window.addEventListener("click", handleSkip);
    window.addEventListener("wheel", handleSkip);
    window.addEventListener("touchmove", handleSkip);
    window.addEventListener("touchstart", handleSkip);

    return () => {
      window.removeEventListener("keydown", handleSkip);
      window.removeEventListener("click", handleSkip);
      window.removeEventListener("wheel", handleSkip);
      window.removeEventListener("touchmove", handleSkip);
      window.removeEventListener("touchstart", handleSkip);
    };
  }, [onComplete]);

  useEffect(() => {
    const tvOverlay = document.getElementById("tv-shutdown-overlay");
    if (tvOverlay) {
      tvOverlay.remove();
    }
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100);
    const t2 = setTimeout(() => setStage(2), 2100);
    const t3 = setTimeout(() => setStage(3), 2700);
    const t4 = setTimeout(() => setStage(4), 4700);
    const t5 = setTimeout(() => setStage(5), 5300);
    const t6 = setTimeout(() => setStage(6), 7300);
    const t7 = setTimeout(() => setStage(7), 7900);
    const t8 = setTimeout(() => onComplete(), 9400);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6);
      clearTimeout(t7); clearTimeout(t8);
    };
  }, [onComplete]);

  useEffect(() => {
    if (stage === 0 || stage === 7) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const words = ["", "Build.", "", "Innovate.", "", "Get Hired.", "", ""];
    const text = words[stage];
    
    if (!text) {
      ctx.clearRect(0, 0, width, height);
      return;
    }
    
    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const octx = offscreen.getContext("2d");

    const isMobile = width < 768;
    let fontSize = isMobile ? Math.min(width * 0.22, 120) : Math.min(width * 0.15, 180);
    if (isMobile && text === "Get Hired.") {
      fontSize = fontSize * 0.8;
    }

    octx.font = `bold ${fontSize}px sans-serif`;
    octx.fillStyle = "white";
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillText(text, width / 2, height / 2);

    const imgData = octx.getImageData(0, 0, width, height).data;
    const particles = [];
    const step = isMobile ? 5 : 9;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const alpha = imgData[(y * width + x) * 4 + 3];
        if (alpha > 128) {
          const isDead = Math.random() < 0.05;
          particles.push({
            x,
            y,
            baseAlpha: isDead ? 0.25 : Math.random() * 0.3 + 0.7,
            flickerSpeed: isDead ? 0 : Math.random() * 0.05 + 0.02,
            offset: Math.random() * Math.PI * 2,
            isDead
          });
        }
      }
    }

    let animationId;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "white";
      time += 1;

      particles.forEach(p => {
        let currentAlpha = p.baseAlpha;
        if (!p.isDead) {
          const flicker = 0.4 + 0.6 * ((Math.sin(time * p.flickerSpeed + p.offset) + 1) / 2);
          currentAlpha = p.baseAlpha * flicker;
        }
        
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, step / 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [stage]);

  return (
    <div className="cinematic-overlay">
      <canvas ref={canvasRef} className="cinematic-canvas" />

      {stage === 7 && (
        <div className="cinematic-logo-wrapper">
          <motion.img
            layoutId="hacklabs-logo-transition"
            src="/hacklabs-logo.png"
            alt="Hacklabs Logo Symbol"
            className="cinematic-logo"
            style={{ mixBlendMode: "screen" }}
          />
        </div>
      )}
    </div>
  );
}
