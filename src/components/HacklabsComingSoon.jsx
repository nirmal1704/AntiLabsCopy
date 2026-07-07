import HacklabsTimer from "./HacklabsTimer.jsx";
import HacklabsNavbar from "./HacklabsNavbar";
import HacklabsFooter from "./HacklabsFooter";
import HacklabsWhatsappBanner from "./HacklabsWhatsappBanner";

import { supabase } from "../supabase";
import React from "react";

function HacklabsComingSoon() {
  return (
    <>
      <HacklabsNavbar />
      <HacklabsTimer Coming="coming" />
      <HacklabsWhatsappBanner />
      <HacklabsFooter />
    </>
  );
}

export default HacklabsComingSoon;
