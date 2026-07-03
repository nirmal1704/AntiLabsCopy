import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import "./HacklabsJudgeDashboard.css";

export default function HacklabsJudgeDashboard() {
  const [data, setData] = useState([]);
  const [draftsData, setDraftsData] = useState([]);
  const [queriesData, setQueriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  
  const [activeTab, setActiveTab] = useState("participants");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch judge data
      const { data: judgeData, error: judgeError } = await supabase.rpc('get_judge_data');
      if (judgeError) throw judgeError;
      setData(judgeData || []);

      // Fetch dropouts (drafts)
      const { data: drafts, error: draftsError } = await supabase
        .from('application_drafts')
        .select('*');
      if (draftsError) throw draftsError;
      setDraftsData(drafts || []);

      // -- MOCK BACKEND: Fetching from localStorage until you add real backend --
      // TODO: Replace with your actual backend fetch logic
      const localQueries = JSON.parse(localStorage.getItem('mockHacklabsQueries') || '[]');
      setQueriesData([
        ...localQueries,
        { id: 'dummy_1', name: 'System User', email: 'system@hacklabs.test', subject: 'System Integration Test', description: 'This is a simulated query placeholder. Real backend is currently detached.', status: 'open', created_at: new Date().toISOString() }
      ]);
      // ------------------------------------------------------------------------

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

  const allLogsMap = new Map();

  draftsData.forEach(draft => {
    let formData = draft.form_data;
    if (typeof formData === 'string') {
      try { formData = JSON.parse(formData); } catch { formData = {}; }
    }
    formData = formData || {};
    
    const key = draft.user_id || `draft_${draft.id}`;
    allLogsMap.set(key, {
      id: `d_${draft.id}`,
      type: 'Draft',
      name: formData.full_name || "N/A",
      email: formData.email || "N/A",
      phone: formData.mobile_number || "N/A",
      status: "DRAFT (Incomplete)",
      updated_at: draft.updated_at ? new Date(draft.updated_at).toLocaleDateString() : "N/A",
      specs: {
        ...formData,
        college_proof_url: draft.college_proof_url,
        resume_link: draft.resume_url,
      }
    });
  });

  data.forEach(item => {
    const key = item.auth_id || `user_${item.unique_user_code}`;
    allLogsMap.set(key, {
      id: `p_${item.auth_id}`,
      type: 'Submitted',
      name: item.full_name || "N/A",
      email: item.email || "N/A",
      phone: item.mobile_number || "N/A",
      status: item.payment_status?.toUpperCase() || "SUBMITTED",
      updated_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A",
      specs: item
    });
  });

  const allLogsData = Array.from(allLogsMap.values());

  const filteredLogs = allLogsData.filter(log => {
    const term = search.toLowerCase();
    return log.name.toLowerCase().includes(term) || log.email.toLowerCase().includes(term);
  });

  // Grouped logic for teams
  const groupedDataMap = new Map();
  filteredData.forEach(item => {
    const isLoneWolf = !item.team_name;
    const groupKey = isLoneWolf ? `team_Lone Wolves` : `team_${item.team_name}`;
    
    if (!groupedDataMap.has(groupKey)) {
      groupedDataMap.set(groupKey, {
        id: groupKey,
        isTeam: true, // we treat lone wolves as a single team
        team_name: isLoneWolf ? "Lone Wolves" : item.team_name,
        unique_team_code: isLoneWolf ? "LONE-WOLF" : item.unique_team_code,
        payment_status: isLoneWolf ? "mixed" : item.payment_status,
        participants: []
      });
    }
    groupedDataMap.get(groupKey).participants.push(item);
  });
  const groupedData = Array.from(groupedDataMap.values());

  const paidTeamsData = groupedData.filter(g => g.payment_status === 'paid' && g.team_name !== 'Lone Wolves');

  const renderSpecs = (item) => (
    <div className="details-grid">
      <div className="details-card">
        <h4>Academic Records</h4>
        <p><strong>College:</strong> {item.college_name || "N/A"}</p>
        <p><strong>Degree:</strong> {item.degree || item.degree_pursuing || "N/A"}</p>
        <p><strong>Branch:</strong> {item.branch || "N/A"}</p>
        <p><strong>Year:</strong> {item.year_of_study || item.current_year || "N/A"} (Grad: {item.graduation_year || "N/A"})</p>
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
  );

  return (
    <div className="judge-dashboard">
      <div className="dashboard-layout">
        <aside className="sidebar">
          <h2>Admin Control</h2>
          <nav className="sidebar-nav">
            <button className={`sidebar-item ${activeTab === 'participants' ? 'active' : ''}`} onClick={() => { setActiveTab('participants'); setExpandedId(null); }}>
              All Participants
            </button>
            <button className={`sidebar-item ${activeTab === 'teams' ? 'active' : ''}`} onClick={() => { setActiveTab('teams'); setExpandedId(null); }}>
              Teams & Leaders
            </button>
            <button className={`sidebar-item ${activeTab === 'paid' ? 'active' : ''}`} onClick={() => { setActiveTab('paid'); setExpandedId(null); }}>
              Paid Teams
            </button>
            <button className={`sidebar-item ${activeTab === 'dropouts' ? 'active' : ''}`} onClick={() => { setActiveTab('dropouts'); setExpandedId(null); }}>
              All Applications Logs
            </button>
            <button className={`sidebar-item ${activeTab === 'queries' ? 'active' : ''}`} onClick={() => { setActiveTab('queries'); setExpandedId(null); }}>
              Support Queries
            </button>
          </nav>
        </aside>

        <main className="main-content">
          <div className="judge-header">
            <h1>{activeTab === 'participants' ? "All Participants" : activeTab === 'teams' ? "Teams & Leaders" : activeTab === 'paid' ? "Paid Teams" : activeTab === 'queries' ? "Support Queries" : "All Applications Logs"}</h1>
          </div>

          <div className="judge-controls">
            <div className="search-wrapper">
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="judge-search"
              />
            </div>
            <div className="stats">
              <span>Total: {activeTab === 'participants' ? filteredData.length : activeTab === 'teams' ? groupedData.length : activeTab === 'paid' ? paidTeamsData.length : activeTab === 'queries' ? queriesData.length : filteredLogs.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="judge-loading">Loading Databanks...</div>
          ) : (
            <div className="judge-table-container">
              <table className="judge-table">
                {activeTab === 'participants' && (
                  <>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Team</th>
                        <th>Payment</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map(item => (
                        <React.Fragment key={`p_${item.auth_id}`}>
                          <tr className={expandedId === `p_${item.auth_id}` ? "expanded-row" : ""}>
                            <td className="code-mono">{item.unique_user_code}</td>
                            <td><strong>{item.full_name}</strong></td>
                            <td><span className={item.team_name ? "team-name-text" : "no-team-text"}>{item.team_name || "Lone Wolf"}</span></td>
                            <td>
                              <span className={`status-badge ${item.payment_status}`}>
                                {item.payment_status?.toUpperCase() || "-"}
                              </span>
                            </td>
                            <td>
                              <button className="btn-expand" onClick={() => setExpandedId(expandedId === `p_${item.auth_id}` ? null : `p_${item.auth_id}`)}>
                                {expandedId === `p_${item.auth_id}` ? "Close" : "Specs"}
                              </button>
                            </td>
                          </tr>
                          {expandedId === `p_${item.auth_id}` && (
                            <tr className="details-row"><td colSpan="5">{renderSpecs(item)}</td></tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </>
                )}

                {(activeTab === 'teams' || activeTab === 'paid') && (
                  <>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Team Name</th>
                        <th>Leader</th>
                        <th>Payment</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeTab === 'teams' ? groupedData : paidTeamsData).map(group => (
                        <React.Fragment key={group.id}>
                          <tr className={expandedId === group.id ? "expanded-row" : ""}>
                            <td className="code-mono">{group.unique_team_code}</td>
                            <td><strong className="team-name-text">{group.team_name}</strong></td>
                            <td>{group.participants[0]?.full_name || "N/A"}</td>
                            <td>
                              <span className={`status-badge ${group.payment_status === 'mixed' ? 'pending' : group.payment_status}`}>
                                {group.payment_status?.toUpperCase() || "-"}
                              </span>
                            </td>
                            <td>
                              <button className="btn-expand" onClick={() => {
                                setExpandedId(expandedId === group.id ? null : group.id);
                                setSelectedMemberId(null);
                              }}>
                                {expandedId === group.id ? "Close" : "Members"}
                              </button>
                            </td>
                          </tr>
                          {expandedId === group.id && (
                            <tr className="details-row">
                              <td colSpan="5">
                                <div className="details-container">
                                  <div className="member-tabs">
                                    {group.participants.map(item => (
                                      <button 
                                        key={`tab_${item.auth_id}`} 
                                        className={`member-tab-btn ${selectedMemberId === item.auth_id ? 'active' : ''}`}
                                        onClick={() => setSelectedMemberId(selectedMemberId === item.auth_id ? null : item.auth_id)}
                                      >
                                        {item.full_name}
                                      </button>
                                    ))}
                                  </div>
                                  
                                  {group.participants.map(item => (
                                    selectedMemberId === item.auth_id && (
                                      <div key={item.auth_id} className="participant-details-wrapper">
                                        {renderSpecs(item)}
                                      </div>
                                    )
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </>
                )}

                {activeTab === 'dropouts' && (
                  <>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map(log => (
                        <React.Fragment key={log.id}>
                          <tr className={expandedId === log.id ? "expanded-row" : ""}>
                            <td><strong>{log.name}</strong></td>
                            <td>{log.email}</td>
                            <td>{log.phone}</td>
                            <td>
                              <span className={`status-badge ${log.status === 'PAID' ? 'paid' : 'pending'}`}>
                                {log.status}
                              </span>
                            </td>
                            <td>
                              <button className="btn-expand" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                                {expandedId === log.id ? "Close" : "Specs"}
                              </button>
                            </td>
                          </tr>
                          {expandedId === log.id && (
                            <tr className="details-row">
                              <td colSpan="5">
                                {renderSpecs(log.specs)}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </>
                )}

                {activeTab === 'queries' && (
                  <>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queriesData.map(query => (
                        <React.Fragment key={`q_${query.id}`}>
                          <tr className={expandedId === `q_${query.id}` ? "expanded-row" : ""}>
                            <td><strong>{query.name}</strong></td>
                            <td>{query.email}</td>
                            <td>{query.subject.replace('[Hacklabs] ', '')}</td>
                            <td>
                              <span className={`status-badge ${query.status === 'open' ? 'pending' : 'paid'}`}>
                                {query.status?.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <button className="btn-expand" onClick={() => setExpandedId(expandedId === `q_${query.id}` ? null : `q_${query.id}`)}>
                                {expandedId === `q_${query.id}` ? "Close" : "Read"}
                              </button>
                            </td>
                          </tr>
                          {expandedId === `q_${query.id}` && (
                            <tr className="details-row">
                              <td colSpan="5">
                                <div className="details-grid">
                                  <div className="details-card" style={{ gridColumn: "1 / -1" }}>
                                    <h4>Query Description</h4>
                                    <p style={{ whiteSpace: 'pre-wrap', color: '#ffffff', lineHeight: 1.6 }}>
                                      {query.description}
                                    </p>
                                    <p style={{ marginTop: '1rem' }}>
                                      <strong>Date:</strong> {new Date(query.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
