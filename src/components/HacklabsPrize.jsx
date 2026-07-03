import "./HacklabsPrize.css";

export default function PrizePool() {
  return (
    <section className="prize-section">
      <h1 className="prize-heading">//Prize Pool</h1>

      <div className="prize-container">
        {/* 2nd Prize */}
        <div className="prize-card silver">
          <div className="rank-circle">2</div>

          <h2 className="amount">₹1500</h2>

          <ul>
            <li>Free Domain for 1 Year worth ₹1000</li>
            <li>Fast-Track Internship Opportunity</li>
          </ul>
        </div>

        {/* 1st Prize */}
        <div className="prize-card gold">
          <div className="rank-circle">1</div>

          <h2 className="amount">₹3000</h2>

          <ul>
            <li>Free Domain & Hosting for 1 Year worth ₹3000</li>
            <li>Fast-Track Internship Opportunity</li>
          </ul>
        </div>

        {/* 3rd Prize */}
        <div className="prize-card bronze">
          <div className="rank-circle">3</div>
          <h2 className="amount">₹500</h2>

          <ul className="third-prize-list">
            <li>Fast-Track Internship Interview Opportunity</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
