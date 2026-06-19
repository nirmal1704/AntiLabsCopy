import "./RobotMascot.css";
export default function RobotMascot({ className = "", mode = "normal" }) {
  return (
    <div className={`robot-mascot ${mode} ${className}`}>
      <div className="robot-shell">
        <div className="left-pins">
          <span />
          <span />
          <span />
        </div>

        <div className="right-pins">
          <span />
        </div>

        <div className="face">
          <div className="eyes">
            <div className="eye left" />
            <div className="eye right" />
          </div>
        </div>

        <div className="feet">
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
