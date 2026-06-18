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
            <li>Free Domain for 1 Year</li>
            <li>Fast-Track Internship Opportunity</li>
          </ul>
        </div>

        {/* 1st Prize */}
        <div className="prize-card gold">
          <div className="rank-circle">1</div>

          <h2 className="amount">₹3000</h2>

          <ul>
            <li>Free Domain & Hosting for 1 Year</li>
            <li>Fast-Track Internship Opportunity</li>
          </ul>
        </div>

        {/* 3rd Prize */}
        <div className="prize-card bronze">
          <div className="rank-circle">3</div>

          <ul className="third-prize-list">
            <li>Paid Internship Interview Opportunity</li>
            <li>Priority Consideration for AntiLabs Programs</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
