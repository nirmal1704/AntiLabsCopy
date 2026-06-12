import { useState } from "react";
import HacklabsIntro from "../components/HacklabsIntro";
import "./HacklabsPage.css";
import HacklabsLanding from "../components/HacklabsLanding";
import RobotMascot from "../components/RobotMascot";
import Navbar from "../components/Navbar";
import HacklabsNavbar from "../components/HacklabsNavbar";
export default function HacklabsPage() {
  const [introDone, setIntroDone] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [robotArrived, setRobotArrived] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [showHackNavbar, setShowHackNavbar] = useState(true);
  const [logoFlying, setLogoFlying] = useState(false);
  const [logoArrived, setLogoArrived] = useState(false);
  return (
    <>
      {!introDone ? (
        <>
          {showNavbar && <Navbar />}
          <HacklabsIntro
            onComplete={() => {
              setLogoFlying(true);
              setShowNavbar(false);
              setTransitioning(true);
              setTimeout(() => {
                setShowHackNavbar(true);
              }, 1200);
              setTimeout(() => {
                setIntroDone(true);
              }, 200);
              setTimeout(() => {
                setLogoFlying(false);
                setLogoArrived(true);
              }, 1200);
              setTimeout(() => {
                setTransitioning(false);
                setRobotArrived(true);
              }, 1800);
            }}
          />
        </>
      ) : (
        <>
          {introDone && <HacklabsNavbar logoArrived={logoArrived} />}
          <HacklabsLanding robotArrived={robotArrived} />
        </>
      )}
      {logoFlying && <img src="/hacklabs.png" className="hacklabs-logo-fly" />}
      {transitioning && (
        <div className="robot-transition-inner">
          <RobotMascot mode="victory" />
        </div>
      )}
    </>
  );
}
