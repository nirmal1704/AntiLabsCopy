import React from "react";
import HacklabsHero from "../components/HacklabsHero";
import HacklabsNavbar from "../components/HacklabsNavbar";
import HacklabsPhases from "../components/HacklabsPhases";
import HacklabsBenefits from "../components/HacklabsBenefits";
import HacklabsJudges from "../components/HacklabsJudges";
import HacklabsPrize from "../components/HacklabsPrize";
import HacklabsStats from "../components/HacklabsStats";
import HacklabsTimer from "../components/HacklabsTimer";
import HacklabsFAQ from "../components/HacklabsFAQ";
import HacklabsFooter from "../components/HacklabsFooter";

function HacklabsPage() {
  return (
    <>
      <HacklabsNavbar />
      <div className="HacklabsLanding">
        <HacklabsHero />
        <HacklabsStats />
        <HacklabsTimer />
        <HacklabsPhases />
        <HacklabsJudges />
        <HacklabsPrize />
        <HacklabsBenefits />
        <HacklabsFAQ />
      </div>
      <HacklabsFooter />
    </>
  );
}

export default HacklabsPage;
