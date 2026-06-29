import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HacklabsHero from "../components/HacklabsHero";
import HacklabsNavbar from "../components/HacklabsNavbar";
import HacklabsPhases from "../components/HacklabsPhases";
import HacklabsBenefits from "../components/HacklabsBenefits";
import HacklabsJudges from "../components/HacklabsJudges";
import HacklabsPrize from "../components/HacklabsPrize";
import HacklabsStats from "../components/HacklabsStats";
import HacklabsTimer from "../components/HacklabsTimer";
import HacklabsQueryForm from "../components/HacklabsQueryForm";
import HacklabsFAQ from "../components/HacklabsFAQ";
import HacklabsFooter from "../components/HacklabsFooter";
import CinematicTransition from "../components/CinematicTransition";
import "./HacklabsPage.css";

function HacklabsPage() {
  const [isTransitioning, setIsTransitioning] = useState(() => {
    return sessionStorage.getItem("playHacklabsTransition") === "true";
  });

  useEffect(() => {
    if (isTransitioning) {
      sessionStorage.removeItem("playHacklabsTransition");
    }
  }, [isTransitioning]);

  return (
    <>
      <div className="hacklabs-page-wrapper">
        {isTransitioning ? (
          <CinematicTransition onComplete={() => setIsTransitioning(false)} />
        ) : (
          <HacklabsNavbar />
        )}
        <motion.div 
          className="HacklabsLanding"
          initial={{ opacity: 0 }}
          animate={{ opacity: isTransitioning ? 0 : 1 }}
          transition={{ duration: 0.8 }}
        >
          <HacklabsHero />
          <HacklabsStats />
          <HacklabsTimer />
          <HacklabsPhases />
          <HacklabsJudges />
          <HacklabsPrize />
          <HacklabsBenefits />
          <HacklabsQueryForm />
          <HacklabsFAQ />
        </motion.div>
        {!isTransitioning && <HacklabsFooter />}
      </div>
    </>
  );
}

export default HacklabsPage;
