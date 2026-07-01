import React, { useState, useEffect, useCallback, useRef } from "react";
import HacklabsAvatar from "./HacklabsAvatar";
import { AVATAR_OPTIONS, migrateLegacyAvatar } from "../utils/avatarUtils";
import "./AvatarPicker.css";

export default function AvatarPicker({ initialConfig, onChange }) {
  const [config, setConfig] = useState(() => {
    return migrateLegacyAvatar(initialConfig) || {
      chassis: "bot",
      topAccessory: "none",
      visor: "dot",
      expression: "smile",
      badge: "none",
    };
  });

  const [animatingLayer, setAnimatingLayer] = useState(null);

  // Inform parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(config);
    }
  }, [config, onChange]);

  const cycleTrait = useCallback((trait, direction) => {
    setConfig((prev) => {
      const options = AVATAR_OPTIONS[trait];
      const currentIndex = options.indexOf(prev[trait]);
      let newIndex = currentIndex + direction;
      
      if (newIndex < 0) newIndex = options.length - 1;
      if (newIndex >= options.length) newIndex = 0;

      setAnimatingLayer(trait);
      setTimeout(() => setAnimatingLayer(null), 200);

      return {
        ...prev,
        [trait]: options[newIndex]
      };
    });
  }, []);

  const randomizeAll = () => {
    const traits = Object.keys(AVATAR_OPTIONS);
    
    traits.forEach((trait, i) => {
      setTimeout(() => {
        setConfig((prev) => {
          const options = AVATAR_OPTIONS[trait];
          const randomOption = options[Math.floor(Math.random() * options.length)];
          
          setAnimatingLayer(trait);
          setTimeout(() => setAnimatingLayer(null), 200);

          return {
            ...prev,
            [trait]: randomOption
          };
        });
      }, i * 50); // Staggered
    });
  };

  const handleKeyDown = (e, trait) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      cycleTrait(trait, -1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      cycleTrait(trait, 1);
    }
  };


  const traitsConfig = [
    { key: "chassis", label: "CHASSIS" },
    { key: "topAccessory", label: "TOP MOD" },
    { key: "visor", label: "VISOR" },
    { key: "expression", label: "EXPRESSION" },
    { key: "badge", label: "BADGE" },
  ];

  return (
    <div className="avatar-picker-module">
      <div className="avatar-card-wrapper avatar-card-glow">
        <button 
          className="randomize-btn" 
          onClick={randomizeAll}
          aria-label="Randomize Avatar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <circle cx="15.5" cy="15.5" r="1.5"></circle>
            <circle cx="15.5" cy="8.5" r="1.5"></circle>
            <circle cx="8.5" cy="15.5" r="1.5"></circle>
            <circle cx="12" cy="12" r="1.5"></circle>
          </svg>
        </button>

        <div className="avatar-display">
          <HacklabsAvatar config={config} size={160} className={`avatar-svg ${animatingLayer ? 'animating' : ''}`} />
        </div>
      </div>

      <div className="trait-controls">
        {traitsConfig.map((t) => (
          <div 
            className="trait-row" 
            key={t.key}
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, t.key)}
            aria-label={`${t.label}, currently ${config[t.key]}`}
          >
            <span className="trait-label">{t.label}</span>
            <div className="trait-selector">
              <button 
                className="arrow-btn arrow-btn-white" 
                onClick={() => cycleTrait(t.key, -1)}
                aria-label={`Previous ${t.label}`}
              >
                ‹
              </button>
              
              <div className="trait-value">
                <span>{config[t.key]}</span>
              </div>

              <button 
                className="arrow-btn arrow-btn-white" 
                onClick={() => cycleTrait(t.key, 1)}
                aria-label={`Next ${t.label}`}
              >
                ›
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
