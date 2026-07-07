import React from "react";
import "./HacklabsWhatsappBanner.css";

const HacklabsWhatsappBanner = () => {
  return (
    <div className="banner">
      <div className="hacklabs-whatsapp-banner">
        <p className="hacklabs-whatsapp-text">Join Whatsapp Group</p>

        <p className="hacklabs-whatsapp-text">
          To Get Updates{" "}
          <a
            href="https://chat.whatsapp.com/KH2urHU2eh9FQWSf9j3TF5"
            target="_blank"
            rel="noopener noreferrer"
            className="hacklabs-whatsapp-link"
          >
            Click here
          </a>
        </p>
      </div>
    </div>
  );
};

export default HacklabsWhatsappBanner;
