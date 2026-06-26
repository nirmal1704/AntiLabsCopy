import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import "./HacklabsJudgeDashboard.css";

export default function HacklabsJudgeDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  
  const [showFilters, setShowFilters] = useState(false);
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");

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
    const matchesSearch = (
      (item.full_name && item.full_name.toLowerCase().includes(term)) ||
      (item.unique_user_code && item.unique_user_code.toLowerCase().includes(term)) ||
      (item.team_name && item.team_name.toLowerCase().includes(term)) ||
      (item.unique_team_code && item.unique_team_code.toLowerCase().includes(term))
    );
    const matchesPayment = filterPayment === "all" ? true : (item.payment_status?.toLowerCase() === filterPayment.toLowerCase());
    const matchesTeam = filterTeam === "all" ? true : (filterTeam === "team" ? !!item.team_name : !item.team_name);
    
    return matchesSearch && matchesPayment && matchesTeam;
  });

  const groupedDataMap = new Map();
  filteredData.forEach(item => {
    const isLoneWolf = !item.team_name;
    const groupKey = isLoneWolf ? `lone_${item.auth_id}` : `team_${item.team_name}`;
    
    if (!groupedDataMap.has(groupKey)) {
      groupedDataMap.set(groupKey, {
        id: groupKey,
        isTeam: !isLoneWolf,
        team_name: item.team_name,
        unique_team_code: item.unique_team_code,
        payment_status: item.payment_status,
        participants: []
      });
    }
    groupedDataMap.get(groupKey).participants.push(item);
  });

  const groupedData = Array.from(groupedDataMap.values());

  const isFilterActive = filterPayment !== "all" || filterTeam !== "all";
  const uniqueTeamsCount = new Set(data.map(d => d.team_name).filter(Boolean)).size;

  return (
    <div className="judge-dashboard">
      <div className="judge-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="judge-controls">
        <div className="search-wrapper">
          <button 
            className={`btn-filter ${showFilters ? 'active' : ''} ${isFilterActive && !showFilters ? 'applied' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            {isFilterActive && !showFilters ? "Filter Applied" : "Filter"}
          </button>
          <input 
            type="text" 
            placeholder="Search by Participant Name, Team Name, or Unique Codes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="judge-search"
          />
        </div>
        <div className="stats-group">
          <div className="stats">
            <span>Total Participants: {data.length}</span>
          </div>
          <div className="stats">
            <span>Total Teams: {uniqueTeamsCount}</span>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Payment Status</label>
            <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Team Status</label>
            <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
              <option value="all">All</option>
              <option value="team">In Team</option>
              <option value="lone">Lone Wolf</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="judge-loading">Loading Databanks...</div>
      ) : (
        <>
          <div className="table-header-row">
            <div className="search-results-offcolor">
              {(search !== "" || isFilterActive) && (
                <span className="found-text">Found: {filteredData.length} Participant(s)</span>
              )}
            </div>
          </div>
          <div className="judge-table-container">
            <table className="judge-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Team</th>
                <th>Participants</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.map(group => (
                <React.Fragment key={group.id}>
                  <tr className={expandedId === group.id ? "expanded-row" : ""}>
                    <td className="code-mono">
                      {group.isTeam ? group.unique_team_code : group.participants[0].unique_user_code}
                    </td>
                    <td>
                      {group.isTeam ? (
                        <strong className="team-name-text">{group.team_name}</strong>
                      ) : (
                        <span className="no-team-text">Lone Wolf</span>
                      )}
                    </td>
                    <td>
                      <div className="participants-block">
                        {group.participants.map(p => (
                          <div key={p.auth_id} className="participant-item">
                            <strong>{p.full_name}</strong>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${group.isTeam ? group.payment_status : group.participants[0].payment_status}`}>
                        {(group.isTeam ? group.payment_status : group.participants[0].payment_status)?.toUpperCase() || "-"}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-expand"
                        onClick={() => setExpandedId(expandedId === group.id ? null : group.id)}
                      >
                        {expandedId === group.id ? "Close Details" : "View Specs"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === group.id && (
                    <tr className="details-row">
                      <td colSpan="5">
                        <div className="details-container">
                          {group.participants.map(item => (
                            <div key={item.auth_id} className="participant-details-wrapper">
                              {group.isTeam && <h3 className="participant-header">Specs: {item.full_name}</h3>}
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
                                  <p><strong>Phone:</strong> {item.mobile_number || "N/A"}</p>
                                  <p><strong>DOB:</strong> {item.dob || "N/A"}</p>
                                  <p><strong>Gender:</strong> {item.gender || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  );
}
