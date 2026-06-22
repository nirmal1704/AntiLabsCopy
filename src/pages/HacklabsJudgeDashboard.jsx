import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import "./HacklabsJudgeDashboard.css";

export default function HacklabsJudgeDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: judgeData, error } = await supabase.rpc('get_judge_data');
      
      if (error) throw error;
      setData(judgeData || []);
    } catch (err) {
      console.error("Failed to fetch judge view:", err);
      alert("Error fetching data. Check permissions or network.");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    const term = search.toLowerCase();
    return (
      (item.full_name && item.full_name.toLowerCase().includes(term)) ||
      (item.unique_user_code && item.unique_user_code.toLowerCase().includes(term)) ||
      (item.team_name && item.team_name.toLowerCase().includes(term)) ||
      (item.unique_team_code && item.unique_team_code.toLowerCase().includes(term))
    );
  });

  return (
    <div className="judge-dashboard">
      <div className="judge-header">
        <h1>SYS.ADMIN // JUDGE_DASHBOARD</h1>
        <p>Global view of all Hacklabs entities. Unrestricted access granted.</p>
      </div>

      <div className="judge-controls">
        <input 
          type="text" 
          placeholder="Search by Participant Name, Team Name, or Unique Codes..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="judge-search"
        />
        <div className="stats">
          <span>Total Participants: {data.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="judge-loading">Loading Databanks...</div>
      ) : (
        <div className="judge-table-container">
          <table className="judge-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Participant</th>
                <th>Team</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <React.Fragment key={item.auth_id}>
                  <tr className={expandedId === item.auth_id ? "expanded-row" : ""}>
                    <td style={{ fontFamily: "monospace", color: "#38bdf8" }}>{item.unique_user_code}</td>
                    <td>
                      <strong>{item.full_name}</strong>
                      <br/>
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{item.mobile_number}</span>
                    </td>
                    <td>
                      {item.team_name ? (
                        <>
                          <span style={{ color: "#e2e8f0" }}>{item.team_name}</span>
                          <br/>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "monospace" }}>{item.unique_team_code}</span>
                        </>
                      ) : (
                        <span style={{ color: "#ef4444" }}>No Team</span>
                      )}
                    </td>
                    <td>
                      {item.team_name ? (
                        <span className={`status-badge ${item.payment_status}`}>
                          {item.payment_status?.toUpperCase()}
                        </span>
                      ) : "-"}
                    </td>
                    <td>
                      <button 
                        className="btn-expand"
                        onClick={() => setExpandedId(expandedId === item.auth_id ? null : item.auth_id)}
                      >
                        {expandedId === item.auth_id ? "Close Details" : "View Specs"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === item.auth_id && (
                    <tr className="details-row">
                      <td colSpan="5">
                        <div className="details-grid">
                          <div className="details-card">
                            <h4>Academic Records</h4>
                            <p><strong>College:</strong> {item.college_name || "N/A"}</p>
                            <p><strong>Degree:</strong> {item.degree || "N/A"}</p>
                            <p><strong>Branch:</strong> {item.branch || "N/A"}</p>
                            <p><strong>Year:</strong> {item.year_of_study || "N/A"} (Grad: {item.graduation_year || "N/A"})</p>
                          </div>
                          <div className="details-card">
                            <h4>Technical Specs</h4>
                            <p><strong>GitHub:</strong> {item.github_link ? <a href={item.github_link} target="_blank" rel="noreferrer">{item.github_link}</a> : "N/A"}</p>
                            <p><strong>LinkedIn:</strong> {item.linkedin ? <a href={item.linkedin} target="_blank" rel="noreferrer">{item.linkedin}</a> : "N/A"}</p>
                            <p><strong>Portfolio:</strong> {item.portfolio ? <a href={item.portfolio} target="_blank" rel="noreferrer">{item.portfolio}</a> : "N/A"}</p>
                            <p><strong>Resume:</strong> {item.resume_link ? <a href={item.resume_link} target="_blank" rel="noreferrer">View File</a> : "N/A"}</p>
                          </div>
                          <div className="details-card">
                            <h4>Personal Bio</h4>
                            <p><strong>DOB:</strong> {item.dob || "N/A"}</p>
                            <p><strong>Gender:</strong> {item.gender || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
