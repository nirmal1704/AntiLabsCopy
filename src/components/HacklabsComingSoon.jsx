import HacklabsTimer from "./HacklabsTimer.jsx";
import HacklabsNavbar from "./HacklabsNavbar";
import { supabase } from "../supabase";
import React from "react";

function HacklabsComingSoon() {
  return (
    <>
      <HacklabsNavbar />
      <HacklabsTimer Coming="coming" />
    </>
  );
}

export default HacklabsComingSoon;
