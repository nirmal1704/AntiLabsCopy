import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import "./HacklabsWhatsappBanner.css";

const HacklabsWhatsappBanner = () => {
  return (
    <div className="hacklabs-whatsapp-banner">
      <a
        href="https://chat.whatsapp.com/KH2urHU2eh9FQWSf9j3TF5"
        target="_blank"
        rel="noopener noreferrer"
        className="hacklabs-whatsapp-icon"
        aria-label="Join WhatsApp Group"
      >
        <FaWhatsapp />
      </a>

      <div className="hacklabs-whatsapp-content">
        <h2>Join Whatsapp Group</h2>

        <p>
          To Get Updates{" "}
          <a
            href="https://chat.whatsapp.com/KH2urHU2eh9FQWSf9j3TF5"
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here
          </a>
        </p>
      </div>
    </div>
  );
};

export default HacklabsWhatsappBanner;
