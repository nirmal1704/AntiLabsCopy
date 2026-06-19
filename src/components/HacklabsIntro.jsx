import { useEffect } from "react";
import "./HacklabsIntro.css";

export default function HacklabsIntro({ onComplete }) {
  useEffect(() => {
    const robot = document.querySelector(".robot");
    const logo = document.querySelector(".logo-wrapper");
    const antiLabs = document.querySelector(".antilabs");
    const hackLabs = document.querySelector(".hacklabs");
    const attackArm = document.querySelector(".attack-arm");
    const targetText = document.querySelector(".target-text");
    const chargeText = document.querySelector(".charge-text");
    const impactFlash = document.querySelector(".impact-flash");
    const logoFlash = document.querySelector(".logo-flash");
    const scene = document.querySelector(".scene");

    const timers = [];

    timers.push(
      setTimeout(() => {
        logo.classList.add("move-target");
      }, 3000),
    );

    timers.push(
      setTimeout(() => {
        logo.classList.remove("move-target");

        logo.style.left = "75%";
        logo.style.top = "55%";
        logo.style.transform = "translate(-50%, -50%)";
      }, 4000),
    );

    timers.push(
      setTimeout(() => {
        antiLabs.classList.add("scan-active");
        robot.classList.add("scan");
      }, 4000),
    );

    timers.push(
      setTimeout(() => {
        antiLabs.classList.remove("scan-active");
        robot.classList.remove("scan");
      }, 5200),
    );

    timers.push(
      setTimeout(() => {
        robot.classList.add("locked");
      }, 4500),
    );

    timers.push(
      setTimeout(() => {
        robot.classList.add("attack");
      }, 6500),
    );

    timers.push(
      setTimeout(() => {
        logo.classList.add("strike");
      }, 7000),
    );

    timers.push(
      setTimeout(() => {
        impactFlash.classList.add("flash");
        scene.classList.add("shake");
      }, 7550),
    );

    timers.push(
      setTimeout(() => {
        logoFlash.classList.add("hit");
      }, 7800),
    );

    timers.push(
      setTimeout(() => {
        antiLabs.classList.add("destroy");
        targetText.classList.add("fade");
        chargeText.classList.add("fade");
      }, 7800),
    );

    timers.push(
      setTimeout(() => {
        document.body.classList.add("dark-mode");
        robot.classList.add("dark");
      }, 7800),
    );

    timers.push(
      setTimeout(() => {
        hackLabs.classList.add("show");
      }, 8300),
    );

    timers.push(
      setTimeout(() => {
        attackArm.classList.add("retract");
      }, 8400),
    );

    timers.push(
      setTimeout(() => {
        robot.classList.remove("attack");
      }, 8500),
    );

    timers.push(
      setTimeout(() => {
        logo.classList.remove("strike");
        logo.classList.add("return-center");
      }, 8200),
    );

    timers.push(
      setTimeout(() => {
        robot.classList.remove("locked");
        robot.classList.add("victory");
        robot.classList.add("success");
      }, 9000),
    );

    timers.push(
      setTimeout(() => {
        onComplete?.();
      }, 15000),
    );

    return () => {
      timers.forEach(clearTimeout);
      document.body.classList.remove("dark-mode");
    };
  }, [onComplete]);

  return (
    <div className="scene">
      <div className="bg-glow"></div>

      <div className="logo-wrapper">
        <div className="logo-content">
          <img
            src="/logo.png"
            className="antilabs"
            id="antilabsLogo"
            alt="AntiLabs"
          />

          <img src="/hacklabs.png" className="hacklabs" alt="Hacklabs" />
        </div>
      </div>

      <div className="logo-flash"></div>

      <div className="robot">
        <div className="robot-shell">
          <div className="left-pins">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="right-pins">
            <span></span>
          </div>

          <div className="face">
            <div className="eyes">
              <div className="eye left"></div>
              <div className="eye right"></div>
            </div>
          </div>

          <div className="feet">
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="attack-arm">
          <div className="arm-segment segment-1"></div>

          <div className="arm-segment segment-2"></div>

          <div className="hammer">
            <div className="hammer-handle"></div>

            <div className="hammer-head"></div>
          </div>
        </div>
      </div>

      <div className="scan-line"></div>

      <div className="target-text">TARGET IDENTIFIED</div>

      <div className="charge-text">POWERING WEAPON...</div>

      <div className="impact-flash"></div>
    </div>
  );
}
