import React from "react";
import { migrateLegacyAvatar } from "../utils/avatarUtils";

export default function HacklabsAvatar({ config, size = 160, className = "" }) {
  const safeConfig = migrateLegacyAvatar(config) || {
    chassis: "square",
    topAccessory: "none",
    visor: "dots",
    expression: "line",
    badge: "none",
  };

  const {
    chassis,
    topAccessory,
    visor,
    expression,
    badge,
  } = safeConfig;

  const strokeColor = "#ffffff";

  const renderBadge = () => {
    switch (badge) {
      case "bolt":
        return <path d="M125 115 L135 95 L130 110 L145 110 L130 130 L135 115 Z" fill={strokeColor} filter="url(#glow)" />;
      case "bracket":
        return <text x="135" y="125" fill={strokeColor} fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="monospace" filter="url(#glow)">{'<>'}</text>;
      case "coffee":
        return (
          <g transform="translate(125, 105)">
            <rect x="0" y="8" width="12" height="10" rx="2" fill="none" stroke={strokeColor} strokeWidth="2" />
            <path d="M12 10 C16 10 16 16 12 16" fill="none" stroke={strokeColor} strokeWidth="2" />
            <path d="M4 5 Q6 0 4 -3 M8 5 Q10 0 8 -3" fill="none" stroke={strokeColor} strokeWidth="2" strokeDasharray="2 2" />
            <circle cx="6" cy="13" r="1.5" fill={strokeColor} filter="url(#glow)" />
          </g>
        );
      case "trophy":
        return (
          <g transform="translate(125, 105)">
            <path d="M0 0 L16 0 L12 12 L4 12 Z" fill="none" stroke={strokeColor} strokeWidth="2" />
            <rect x="6" y="12" width="4" height="6" fill={strokeColor} />
            <rect x="2" y="18" width="12" height="3" rx="1" fill={strokeColor} />
            <circle cx="8" cy="5" r="2" fill={strokeColor} filter="url(#glow)" />
          </g>
        );
      default:
        return null;
    }
  };

  const renderNodes = (points) => {
    return points.map((p, i) => (
      <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={strokeColor} filter="url(#glow)" />
    ));
  };

  const renderChassis = () => {
    switch (chassis) {
      case "circle":
        return (
          <>
            <circle cx="80" cy="80" r="45" fill="none" stroke={strokeColor} strokeWidth="2" strokeDasharray="8 4" />
            {renderNodes([[80,35], [80,125], [35,80], [125,80]])}
          </>
        );
      case "triangle":
        return (
          <>
            <polygon points="80,30 130,110 30,110" fill="none" stroke={strokeColor} strokeWidth="2" strokeDasharray="10 4" />
            {renderNodes([[80,30], [130,110], [30,110]])}
          </>
        );
      case "square":
      default:
        return (
          <>
            <rect x="40" y="40" width="80" height="80" rx="8" fill="none" stroke={strokeColor} strokeWidth="2" strokeDasharray="6 4" />
            {renderNodes([[40,40], [120,40], [40,120], [120,120], [80,40], [80,120]])}
          </>
        );
    }
  };

  const renderTopAccessory = () => {
    switch (topAccessory) {
      case "ring":
        return (
          <>
            <ellipse cx="80" cy="15" rx="30" ry="6" fill="none" stroke={strokeColor} strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="80" cy="15" r="2" fill={strokeColor} filter="url(#glow)" />
          </>
        );
      case "spire":
        return (
          <>
            <line x1="80" y1="35" x2="80" y2="5" stroke={strokeColor} strokeWidth="2" strokeDasharray="2 2" />
            {renderNodes([[80,5]])}
          </>
        );
      case "crest":
        return (
          <>
            <path d="M50 30 L80 10 L110 30" fill="none" stroke={strokeColor} strokeWidth="2" />
            {renderNodes([[80,10]])}
          </>
        );
      case "nodes":
        return (
          <>
            {renderNodes([[60,20], [80,10], [100,20]])}
            <path d="M60 20 Q80 30 100 20" fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" />
          </>
        );
      default:
        return null;
    }
  };

  const renderVisor = () => {
    switch (visor) {
      case "slit":
        return (
          <>
            <line x1="50" y1="70" x2="110" y2="70" stroke={strokeColor} strokeWidth="3" />
            <circle cx="80" cy="70" r="3" fill={strokeColor} filter="url(#glow)" />
          </>
        );
      case "binary":
        return (
          <>
            <line x1="60" y1="65" x2="60" y2="75" stroke={strokeColor} strokeWidth="2" />
            <circle cx="68" cy="70" r="3" fill="none" stroke={strokeColor} strokeWidth="2" />
            <line x1="92" y1="65" x2="92" y2="75" stroke={strokeColor} strokeWidth="2" />
            <circle cx="100" cy="70" r="3" fill="none" stroke={strokeColor} strokeWidth="2" />
            <circle cx="68" cy="70" r="1.5" fill={strokeColor} filter="url(#glow)" />
            <circle cx="100" cy="70" r="1.5" fill={strokeColor} filter="url(#glow)" />
          </>
        );
      case "waves":
        return (
          <>
            <path d="M55 70 Q65 60 75 70 T95 70 T105 70" fill="none" stroke={strokeColor} strokeWidth="2" />
            <circle cx="55" cy="70" r="2" fill={strokeColor} filter="url(#glow)" />
            <circle cx="105" cy="70" r="2" fill={strokeColor} filter="url(#glow)" />
          </>
        );
      case "crosshair":
        return (
          <>
            <path d="M60 70 L70 70 M65 65 L65 75 M90 70 L100 70 M95 65 L95 75" stroke={strokeColor} strokeWidth="2" />
            <circle cx="65" cy="70" r="1.5" fill={strokeColor} filter="url(#glow)" />
            <circle cx="95" cy="70" r="1.5" fill={strokeColor} filter="url(#glow)" />
          </>
        );
      case "dots":
      default:
        return (
          <>
            <circle cx="65" cy="70" r="5" fill="none" stroke={strokeColor} strokeWidth="2" />
            <circle cx="95" cy="70" r="5" fill="none" stroke={strokeColor} strokeWidth="2" />
            <circle cx="65" cy="70" r="2" fill={strokeColor} filter="url(#glow)" />
            <circle cx="95" cy="70" r="2" fill={strokeColor} filter="url(#glow)" />
          </>
        );
    }
  };

  const renderExpression = () => {
    switch (expression) {
      case "arc":
        return (
          <>
            <path d="M65 95 Q80 105 95 95" fill="none" stroke={strokeColor} strokeWidth="2" />
            <circle cx="80" cy="100" r="2" fill={strokeColor} filter="url(#glow)" />
          </>
        );
      case "zigzag":
        return (
          <>
            <path d="M65 95 L75 102 L85 88 L95 95" fill="none" stroke={strokeColor} strokeWidth="2" />
            <circle cx="65" cy="95" r="2" fill={strokeColor} filter="url(#glow)" />
            <circle cx="95" cy="95" r="2" fill={strokeColor} filter="url(#glow)" />
          </>
        );
      case "block":
        return (
          <>
            <rect x="70" y="93" width="20" height="6" rx="2" fill="none" stroke={strokeColor} strokeWidth="2" />
            <line x1="75" y1="93" x2="75" y2="99" stroke={strokeColor} strokeWidth="1" />
            <line x1="80" y1="93" x2="80" y2="99" stroke={strokeColor} strokeWidth="1" />
            <line x1="85" y1="93" x2="85" y2="99" stroke={strokeColor} strokeWidth="1" />
          </>
        );
      case "line":
      default:
        return (
          <>
            <line x1="65" y1="95" x2="95" y2="95" stroke={strokeColor} strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="80" cy="95" r="2" fill={strokeColor} filter="url(#glow)" />
          </>
        );
    }
  };

  return (
    <svg 
      className={`hacklabs-avatar-svg ${className}`} 
      width={size} 
      height={size} 
      viewBox="0 0 160 160" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {renderChassis()}
      {renderTopAccessory()}
      {renderVisor()}
      {renderExpression()}
      {renderBadge()}
    </svg>
  );
}
