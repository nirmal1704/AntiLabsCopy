import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import SEO from '../components/SEO';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesProgress, setCoursesProgress] = useState({});

  const getExpirationDate = (createdAt, durationText) => {
    if (!durationText) return "Lifetime Access";
    const date = new Date(createdAt);
    const text = durationText.toLowerCase();
    
    const numMatch = text.match(/\d+/);
    if (!numMatch) return `Duration: ${durationText}`;
    const num = parseInt(numMatch[0]);
    
    if (text.includes('month')) {
        date.setMonth(date.getMonth() + num);
    } else if (text.includes('week')) {
        date.setDate(date.getDate() + (num * 7));
    } else if (text.includes('day')) {
        date.setDate(date.getDate() + num);
    } else if (text.includes('year')) {
        date.setFullYear(date.getFullYear() + num);
    }
    
    return `Expires on ${date.toLocaleDateString('en-GB')}`;
  };

  // Player state
  const [activeCourse, setActiveCourse] = useState(null); // The training_registration object
  const [sections, setSections] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [capstoneProjects, setCapstoneProjects] = useState([]);
  
  const [progress, setProgress] = useState([]); // Array of lecture_ids completed
  const [quizSubmissions, setQuizSubmissions] = useState([]); // Array of passed quiz_ids
  const [capstoneSubmission, setCapstoneSubmission] = useState(null);

  const [activeItem, setActiveItem] = useState(null); // { type: 'lecture' | 'quiz' | 'capstone', data: object }
  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  // Custom Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Quiz State
  const [currentQuizAnswers, setCurrentQuizAnswers] = useState({}); // { qIndex: selectedOption }
  const [quizResult, setQuizResult] = useState(null); // { score, total, passed, percentage }

  // Capstone Form State
  const [capstoneGithub, setCapstoneGithub] = useState('');
  const [capstoneDeployed, setCapstoneDeployed] = useState('');
  const [capstoneAck, setCapstoneAck] = useState(false);
  const [submittingCapstone, setSubmittingCapstone] = useState(false);
  const [capstoneError, setCapstoneError] = useState(null);

  const videoRef = useRef(null);

  // 1. Fetch Enrolled Courses on Mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('training_registrations')
          .select(`
            *,
            Careers (
              title,
              duration
            )
          `)
          .eq('user_id', user.user_id)
          .eq('payment_status', 'paid');

        if (error) throw error;
        const courses = data || [];
        setEnrolledCourses(courses);

        if (courses.length > 0) {
           const careerIds = courses.map(c => c.role_id);
           
           const { data: allSecs } = await supabase.from('sections').select('section_id, career_id').in('career_id', careerIds);
           const secIds = (allSecs || []).map(s => s.section_id);
           
           const { data: allLecs } = await supabase.from('lectures').select('lecture_id, section_id').in('section_id', secIds);
           const { data: allQuizzes } = await supabase.from('quizzes').select('quiz_id, section_id').in('section_id', secIds);
           const { data: allCapstones } = await supabase.from('capstone_projects').select('project_id, career_id').in('career_id', careerIds);
           
           const { data: prog } = await supabase.from('user_progress').select('lecture_id').eq('user_id', user.user_id);
           const { data: qSubs } = await supabase.from('quiz_submissions').select('quiz_id, passed').eq('user_id', user.user_id);
           const { data: cpSubs } = await supabase.from('capstone_project_submissions').select('project_id').eq('user_id', user.user_id);
           
           const progressMap = {};
           courses.forEach(course => {
               const cSecs = (allSecs || []).filter(s => s.career_id === course.role_id);
               const cSecIds = cSecs.map(s => s.section_id);
               
               const cLecs = (allLecs || []).filter(l => cSecIds.includes(l.section_id));
               const cQuizzes = (allQuizzes || []).filter(q => cSecIds.includes(q.section_id));
               const cCapstones = (allCapstones || []).filter(c => c.career_id === course.role_id);
               
               const totalItems = cLecs.length + cQuizzes.length + cCapstones.length;
               
               let completed = 0;
               cLecs.forEach(l => { if ((prog || []).some(p => p.lecture_id === l.lecture_id)) completed++; });
               cQuizzes.forEach(q => { if ((qSubs || []).some(qs => qs.quiz_id === q.quiz_id && qs.passed)) completed++; });
               cCapstones.forEach(cp => { if ((cpSubs || []).some(cps => cps.project_id === cp.project_id)) completed++; });
               
               progressMap[course.registration_id] = totalItems === 0 ? 0 : Math.round((completed / totalItems) * 100);
           });
           setCoursesProgress(progressMap);
        }
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [user, navigate]);

  // 2. Fetch Course Data when a course is selected
  useEffect(() => {
    if (!activeCourse) return;

    const fetchCurriculum = async () => {
      setLoadingPlayer(true);
      try {
        // Fetch Sections
        const { data: secs, error: secErr } = await supabase
          .from('sections')
          .select('*')
          .eq('career_id', activeCourse.role_id)
          .order('position', { ascending: true });

        if (secErr) throw secErr;
        setSections(secs || []);

        // Initialize expanded state (all expanded by default)
        const expState = {};
        (secs || []).forEach(s => expState[s.section_id] = true);
        setExpandedSections(expState);

        if (secs && secs.length > 0) {
          const sectionIds = secs.map(s => s.section_id);
          
          // Fetch Lectures
          const { data: lecs, error: lecErr } = await supabase
            .from('lectures')
            .select('*')
            .in('section_id', sectionIds)
            .order('lecture_number', { ascending: true });

          if (lecErr) throw lecErr;
          setLectures(lecs || []);

          // Fetch Quizzes
          const { data: qzs, error: qzErr } = await supabase
            .from('quizzes')
            .select('*')
            .in('section_id', sectionIds)
            .order('quiz_id', { ascending: true });

          if (qzErr && qzErr.code !== '42P01') console.error('Quizzes fetch error:', qzErr);
          setQuizzes(qzs || []);

          // Fetch Capstone Projects
          const { data: cps, error: cpErr } = await supabase
            .from('capstone_projects')
            .select('*')
            .eq('career_id', activeCourse.role_id);
          
          if (cpErr) console.error('Capstone fetch error:', cpErr);
          setCapstoneProjects(cps || []);

          // Fetch Progress (Lectures)
          const { data: prog, error: progErr } = await supabase
            .from('user_progress')
            .select('lecture_id')
            .eq('user_id', user.user_id);

          if (progErr && progErr.code !== '42P01') console.error('Progress fetch error:', progErr);
          
          const completedIds = (prog || []).map(p => p.lecture_id);
          setProgress(completedIds);

          // Fetch Quiz Submissions
          const { data: qSubs, error: qsErr } = await supabase
             .from('quiz_submissions')
             .select('quiz_id, passed')
             .eq('user_id', user.user_id);

          if (qsErr && qsErr.code !== '42P01') console.error('Quiz submissions fetch error:', qsErr);
          setQuizSubmissions(qSubs || []);

          // Fetch Capstone Submissions
          const { data: cpSubs, error: cpsErr } = await supabase
            .from('capstone_project_submissions')
            .select('*')
            .eq('user_id', user.user_id)
            .eq('career_id', activeCourse.role_id)
            .maybeSingle();

          if (cpsErr && cpsErr.code !== '42P01') console.error('Capstone submission fetch error:', cpsErr);
          setCapstoneSubmission(cpSubs || null);
        }
      } catch (err) {
        console.error('Error loading curriculum:', err);
      } finally {
        setLoadingPlayer(false);
      }
    };

    fetchCurriculum();
  }, [activeCourse, user]);

  // Derive flat ordered items (lectures + quizzes + capstones)
  const orderedItems = useMemo(() => {
    const items = [];
    sections.forEach(sec => {
      const secLectures = lectures.filter(l => l.section_id === sec.section_id);
      secLectures.forEach(l => items.push({ type: 'lecture', id: l.lecture_id, data: l }));

      const secQuizzes = quizzes.filter(q => q.section_id === sec.section_id);
      secQuizzes.forEach(q => items.push({ type: 'quiz', id: q.quiz_id, data: q }));
    });
    
    // Add capstone projects at the very end
    capstoneProjects.forEach(cp => {
       items.push({ type: 'capstone', id: cp.project_id, data: cp });
    });

    return items;
  }, [sections, lectures, quizzes, capstoneProjects]);

  // Helper to check if an item is completed
  const isItemCompleted = (item) => {
    if (!item) return false;
    if (item.type === 'lecture') {
      return progress.includes(item.id);
    } else if (item.type === 'quiz') {
      return quizSubmissions.some(s => s.quiz_id === item.id && s.passed);
    } else if (item.type === 'capstone') {
      return !!capstoneSubmission;
    }
    return false;
  };

  // Helper to check if an item is unlocked
  const isItemUnlocked = (item) => {
    if (!item) return false;
    const index = orderedItems.findIndex(i => i.type === item.type && i.id === item.id);
    if (index === 0) return true; // First item is always unlocked
    
    // Unlocked if the previous item in the sequence is completed
    const prevItem = orderedItems[index - 1];
    return isItemCompleted(prevItem);
  };

  // Auto-select first available or next uncompleted item
  useEffect(() => {
    if (activeCourse && !loadingPlayer && orderedItems.length > 0 && !activeItem) {
      // Find the first uncompleted item
      const firstUncompleted = orderedItems.find(i => !isItemCompleted(i));
      if (firstUncompleted && isItemUnlocked(firstUncompleted)) {
        setActiveItem(firstUncompleted);
      } else {
        // If all completed, or locked, select the first one
        setActiveItem(orderedItems[0]);
      }
    }
  }, [activeCourse, loadingPlayer, orderedItems, progress, quizSubmissions, capstoneSubmission, activeItem]);

  // Reset quiz/form state when switching items
  useEffect(() => {
      setCurrentQuizAnswers({});
      setQuizResult(null);
      setCapstoneError(null);
  }, [activeItem]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleItemClick = (item) => {
    if (isItemUnlocked(item)) {
      setActiveItem(item);
      setIsPlaying(false);
      setPlaybackRate(1);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const markLectureComplete = async () => {
    if (!activeItem || activeItem.type !== 'lecture') return;

    try {
      // Optimistic update
      setProgress(prev => [...prev, activeItem.id]);

      const { error } = await supabase
        .from('user_progress')
        .insert([{
          user_id: user.user_id,
          lecture_id: activeItem.id
        }]);
      
      // If table missing error, just keep optimistic state
      if (error && error.code !== '42P01') throw error;

      // Auto-advance to next video/quiz if available
      const index = orderedItems.findIndex(i => i.type === activeItem.type && i.id === activeItem.id);
      if (index >= 0 && index < orderedItems.length - 1) {
        setActiveItem(orderedItems[index + 1]);
      }

    } catch (err) {
      console.error('Error marking complete:', err);
      // Revert optimistic update on failure
      setProgress(prev => prev.filter(id => id !== activeItem.id));
    }
  };

  const handleQuizSubmit = async () => {
      if (!activeItem || activeItem.type !== 'quiz') return;
      const quiz = activeItem.data;
      
      let score = 0;
      quiz.questions.forEach((q, index) => {
          if (currentQuizAnswers[index] === q.correctOption) {
              score++;
          }
      });

      const totalQuestions = quiz.questions.length;
      const percentage = (score / totalQuestions) * 100;
      const passed = percentage >= 80;

      const resultData = {
          score,
          total: totalQuestions,
          percentage: parseFloat(percentage.toFixed(2)),
          passed
      };

      setQuizResult(resultData);

      try {
          // Submit to DB
          const { error } = await supabase.from('quiz_submissions').insert([{
              user_id: user.user_id,
              quiz_id: quiz.quiz_id,
              section_id: quiz.section_id,
              score,
              total_questions: totalQuestions,
              percentage: percentage,
              answers: currentQuizAnswers
          }]);

          if (error && error.code !== '42P01') {
              console.error("Error submitting quiz:", error);
          } else {
               // Update local state if passed
              if (passed) {
                  setQuizSubmissions(prev => {
                      // Avoid duplicates
                      if (!prev.some(s => s.quiz_id === quiz.quiz_id && s.passed)) {
                          return [...prev, { quiz_id: quiz.quiz_id, passed: true }];
                      }
                      return prev;
                  });
              }
          }
      } catch (err) {
          console.error("Quiz submission exception:", err);
      }
  };

  const handleCapstoneSubmit = async () => {
      if (!activeItem || activeItem.type !== 'capstone') return;
      setCapstoneError(null);
      
      if (!capstoneGithub || !capstoneDeployed || !capstoneAck) {
          setCapstoneError('Please fill out all fields and acknowledge the statement.');
          return;
      }

      setSubmittingCapstone(true);
      try {
          const { error } = await supabase.from('capstone_project_submissions').insert([{
              user_id: user.user_id,
              project_id: activeItem.id,
              career_id: activeCourse.role_id,
              student_name: user.name,
              student_email: user.email,
              github_url: capstoneGithub,
              deployed_url: capstoneDeployed,
              acknowledgement: capstoneAck,
              status: 'Pending Review'
          }]);
          
          if (error) {
              console.error('Error submitting capstone:', error);
              setCapstoneError('Failed to submit: ' + error.message);
          } else {
              setCapstoneSubmission({ status: 'Pending Review' });
          }
      } catch(err) {
          console.error(err);
          setCapstoneError('An unexpected error occurred. Please try again.');
      } finally {
          setSubmittingCapstone(false);
      }
  };

  const calculateOverallProgress = () => {
    if (orderedItems.length === 0) return 0;
    const completedCount = orderedItems.filter(i => isItemCompleted(i)).length;
    return Math.round((completedCount / orderedItems.length) * 100);
  };

  const completedItemCount = orderedItems.filter(i => isItemCompleted(i)).length;

  if (!user) return null;

  return (
    <div className="sd-page">
      <SEO title="Student Dashboard" description="Access your AntiLabs student dashboard." canonicalUrl="/student-dashboard" />
      <Navbar />
      
      <main className="dashboard-main">
        {!activeCourse ? (
          // COURSES GRID VIEW
          <>
            <div className="dashboard-header">
              <h1>Welcome back, {user.name.split(' ')[0]}!</h1>
              <p>Continue your learning journey.</p>
            </div>

            {loadingCourses ? (
              <div>Loading your courses...</div>
            ) : enrolledCourses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '24px' }}>
                <h3 style={{ marginBottom: '16px', color: '#64748b' }}>No active courses found.</h3>
                <button onClick={() => navigate('/careers')} className="btn btn-primary">Browse Careers</button>
              </div>
            ) : (
              <div className="courses-grid">
                {enrolledCourses.map(course => {
                  const pct = coursesProgress[course.registration_id] || 0;
                  return (
                  <div key={course.registration_id} className="course-card" onClick={() => setActiveCourse(course)}>
                    <div className="course-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                    </div>
                    <h3>{course.Careers?.title || course.position || 'Training Program'}</h3>
                    <p style={{ marginBottom: '8px', color: '#64748b' }}>Enrolled on {new Date(course.created_at).toLocaleDateString('en-GB')}</p>
                    <p style={{ color: '#0ea5e9', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px', flex: 1 }}>
                        {getExpirationDate(course.created_at, course.Careers?.duration)}
                    </p>
                    
                    <div className="course-progress">
                      <div className="course-progress-bar">
                        <div className="course-progress-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="course-progress-text">
                        <span>{pct}% Completed</span>
                        <span style={{ color: '#0ea5e9' }}>Go to Course &rarr;</span>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </>
        ) : (
          // PLAYER VIEW
          <div className="player-container">
            {/* Sidebar */}
            <div className="curriculum-sidebar">
              <div className="sidebar-header">
                <button className="back-btn" onClick={() => { setActiveCourse(null); setActiveItem(null); }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  Back to Dashboard
                </button>
                <h2>{activeCourse.Careers?.title || activeCourse.position}</h2>
                <div className="overall-progress">
                  <div className="course-progress-bar">
                    <div className="course-progress-fill" style={{ width: `${calculateOverallProgress()}%` }}></div>
                  </div>
                  <div className="course-progress-text">
                    <span>{calculateOverallProgress()}% Complete</span>
                    <span>{completedItemCount}/{orderedItems.length} Items</span>
                  </div>
                </div>
              </div>

              <div className="sections-list">
                {loadingPlayer ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Loading curriculum...</div>
                ) : sections.map(section => {
                  const sectionLectures = lectures.filter(l => l.section_id === section.section_id);
                  const sectionQuizzes = quizzes.filter(q => q.section_id === section.section_id);
                  const isExpanded = expandedSections[section.section_id];

                  return (
                    <div key={section.section_id} className="section-item">
                      <div className="section-header" onClick={() => toggleSection(section.section_id)}>
                        <span className="section-title">Section {section.position}: {section.title}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                      
                      {isExpanded && (
                        <div className="lectures-list">
                          {sectionLectures.map(lecture => {
                            const itemObj = { type: 'lecture', id: lecture.lecture_id, data: lecture };
                            const isCompleted = isItemCompleted(itemObj);
                            const isActive = activeItem?.type === 'lecture' && activeItem?.id === lecture.lecture_id;
                            const isUnlocked = isItemUnlocked(itemObj);

                            return (
                              <div 
                                key={`lec-${lecture.lecture_id}`} 
                                className={`lecture-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`}
                                onClick={() => handleItemClick(itemObj)}
                              >
                                <div className="lecture-icon">
                                  {isCompleted ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                  ) : !isUnlocked ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                  ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                  )}
                                </div>
                                <span className="lecture-title">{lecture.lecture_number}. {lecture.title}</span>
                              </div>
                            );
                          })}

                          {sectionQuizzes.map(quiz => {
                             const itemObj = { type: 'quiz', id: quiz.quiz_id, data: quiz };
                             const isCompleted = isItemCompleted(itemObj);
                             const isActive = activeItem?.type === 'quiz' && activeItem?.id === quiz.quiz_id;
                             const isUnlocked = isItemUnlocked(itemObj);

                             return (
                               <div 
                                 key={`quiz-${quiz.quiz_id}`}
                                 className={`quiz-sidebar-item ${isActive ? 'active' : ''} ${isCompleted ? 'passed' : ''} ${!isUnlocked ? 'locked' : ''}`}
                                 onClick={() => handleItemClick(itemObj)}
                               >
                                  <div className="lecture-icon">
                                     {isCompleted ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                      ) : !isUnlocked ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                      ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                                      )}
                                  </div>
                                  <span className="quiz-sidebar-label">{quiz.title}</span>
                               </div>
                             );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {capstoneProjects.length > 0 && !loadingPlayer && (
                   <div className="section-item" style={{ marginTop: '24px' }}>
                      <div className="section-header" style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                         <span className="section-title" style={{ color: '#0ea5e9' }}>Final Step: Capstone</span>
                      </div>
                      <div className="lectures-list">
                         {capstoneProjects.map(cp => {
                             const itemObj = { type: 'capstone', id: cp.project_id, data: cp };
                             const isCompleted = isItemCompleted(itemObj);
                             const isActive = activeItem?.type === 'capstone' && activeItem?.id === cp.project_id;
                             const isUnlocked = isItemUnlocked(itemObj);
                             return (
                                 <div 
                                   key={`cap-${cp.project_id}`}
                                   className={`quiz-sidebar-item ${isActive ? 'active' : ''} ${isCompleted ? 'passed' : ''} ${!isUnlocked ? 'locked' : ''}`}
                                   onClick={() => handleItemClick(itemObj)}
                                 >
                                    <div className="lecture-icon">
                                        {isCompleted ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                        ) : !isUnlocked ? (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                        ) : (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                        )}
                                    </div>
                                    <span className="quiz-sidebar-label">{cp.title}</span>
                                 </div>
                             );
                         })}
                      </div>
                   </div>
                )}
              </div>
            </div>

            {/* Content Area */}
            {activeItem?.type === 'lecture' ? (
              <div className="video-area">
                <div className="video-wrapper">
                  {/* Assuming video_url is a direct video link or YouTube embed. */}
                  {activeItem.data.video_url.includes('youtube') || activeItem.data.video_url.includes('youtu.be') ? (
                      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <iframe 
                        className="video-player"
                        src={activeItem.data.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') + "?controls=0&disablekb=1&modestbranding=1&rel=0"}
                        title={activeItem.data.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        ></iframe>
                      </div>
                  ) : (
                    <div className="custom-video-container">
                      <video 
                        ref={videoRef}
                        className="video-player" 
                        src={activeItem.data.video_url}
                        onEnded={() => {
                          setIsPlaying(false);
                          markLectureComplete();
                        }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onClick={togglePlay}
                        controlsList="nodownload nofullscreen noremoteplayback"
                        disablePictureInPicture
                        style={{ cursor: 'pointer' }}
                      >
                        Your browser does not support the video tag.
                      </video>
                      <div className="custom-controls">
                        <button onClick={togglePlay} className="control-btn play-btn" title={isPlaying ? "Pause" : "Play"}>
                          {isPlaying ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                          )}
                        </button>
                        <div style={{ flex: 1 }}></div>
                        <button onClick={handleSpeedChange} className="control-btn speed-btn" title="Playback Speed">
                          {playbackRate}x
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="video-info">
                  <div className="video-title-row">
                    <div>
                      <h2 style={{ marginBottom: '8px' }}>{activeItem.data.title}</h2>
                      <p style={{ color: '#64748b' }}>Lecture {activeItem.data.lecture_number}</p>
                    </div>
                    
                    {isItemCompleted(activeItem) ? (
                      <div className="completed-badge">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        Completed
                      </div>
                    ) : (
                      <button 
                        className="complete-btn" 
                        onClick={markLectureComplete}
                      >
                        Mark as Completed
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : activeItem?.type === 'quiz' ? (
               <div className="quiz-area">
                  <div className="quiz-header">
                     <h2>{activeItem.data.title}</h2>
                     <p>Answer all questions correctly to proceed. (Minimum 80% passing score)</p>
                     
                     {isItemCompleted(activeItem) && (
                         <div className="quiz-pass-notice">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                             You have already passed this quiz.
                         </div>
                     )}
                  </div>

                  {quizResult ? (
                      <div className="quiz-result animate-fade-in">
                          <div className={`quiz-result-icon ${quizResult.passed ? 'pass' : 'fail'}`}>
                              {quizResult.passed ? (
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                              ) : (
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              )}
                          </div>
                          <h2>{quizResult.passed ? 'Congratulations! You Passed!' : 'Quiz Failed'}</h2>
                          <div className="score-text">You scored {quizResult.score} out of {quizResult.total}</div>
                          <div className={`score-pct ${quizResult.passed ? 'pass' : 'fail'}`}>{quizResult.percentage}%</div>
                          
                          {!quizResult.passed && (
                              <p style={{ color: '#64748b', maxWidth: 400 }}>You need at least 80% to pass this quiz and unlock the next section. Review the material and try again.</p>
                          )}

                          <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                              <button className="retry-btn" onClick={() => {
                                  setQuizResult(null);
                                  setCurrentQuizAnswers({});
                              }}>
                                  Retake Quiz
                              </button>
                              
                              {quizResult.passed && (
                                  <button className="continue-btn" onClick={() => {
                                      // Auto-advance
                                      const index = orderedItems.findIndex(i => i.type === 'quiz' && i.id === activeItem.id);
                                      if (index >= 0 && index < orderedItems.length - 1) {
                                          setActiveItem(orderedItems[index + 1]);
                                      }
                                  }}>
                                      Continue to Next Section &rarr;
                                  </button>
                              )}
                          </div>
                      </div>
                  ) : (
                      <>
                          <div className="quiz-body">
                             {activeItem.data.questions.map((q, index) => (
                                 <div key={index} className="quiz-question-card">
                                     <div className="q-number">Question {index + 1} of {activeItem.data.questions.length}</div>
                                     <div className="q-text">{q.question}</div>
                                     <div className="quiz-options">
                                         {q.options.map((opt, optIndex) => {
                                             // Option values from admin are usually 1, 2, 3, 4
                                             const optionValue = optIndex + 1;
                                             const isSelected = currentQuizAnswers[index] === optionValue;
                                             
                                             return (
                                                 <button 
                                                     key={optIndex}
                                                     className={`quiz-option ${isSelected ? 'selected' : ''}`}
                                                     onClick={() => setCurrentQuizAnswers({...currentQuizAnswers, [index]: optionValue})}
                                                 >
                                                     <div style={{ 
                                                         width: 20, height: 20, borderRadius: '50%', border: isSelected ? '5px solid #3b82f6' : '2px solid #cbd5e1', flexShrink: 0 
                                                     }}></div>
                                                     {opt}
                                                 </button>
                                             );
                                         })}
                                     </div>
                                 </div>
                             ))}
                          </div>
                          <div className="quiz-footer">
                              <button 
                                  className="quiz-submit-btn" 
                                  onClick={handleQuizSubmit}
                                  disabled={Object.keys(currentQuizAnswers).length < activeItem.data.questions.length}
                              >
                                  Submit Answers
                              </button>
                          </div>
                      </>
                  )}
               </div>
            ) : activeItem?.type === 'capstone' ? (
                <div className="capstone-area">
                    <div className="capstone-header">
                        <h2>{activeItem.data.title}</h2>
                        <p>{activeItem.data.description}</p>
                    </div>
                    
                    <div className="capstone-body">
                        {capstoneSubmission ? (
                            <div className={`capstone-status-card ${capstoneSubmission.status === 'Approved' ? 'Approved' : capstoneSubmission.status === 'Needs Changes' ? 'Changes' : 'Pending'}`}>
                                <h3>{capstoneSubmission.status === 'Approved' ? 'Project Approved!' : capstoneSubmission.status === 'Needs Changes' ? 'Needs Changes' : 'Submission Under Review'}</h3>
                                {capstoneSubmission.status === 'Approved' ? (
                                    <>
                                        <p style={{ marginBottom: '12px' }}>Congratulations! You have successfully completed this program.</p>
                                        <p style={{ color: '#166534', fontWeight: 500 }}>Our team will reach out to you shortly for your interview and other details. Your certificate and letter of recommendation will be processed shortly.</p>
                                    </>
                                ) : capstoneSubmission.status === 'Needs Changes' ? (
                                    <p>Your mentor has requested some changes. Please check your emails or reach out to support.</p>
                                ) : (
                                    <p>Your capstone project is currently being reviewed by our engineers. You will be notified once the review is complete.</p>
                                )}
                            </div>
                        ) : (
                            <div className="capstone-form animate-fade-in">
                                {capstoneError && (
                                    <div style={{
                                        background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                                        padding: '12px 16px', borderRadius: '8px', marginBottom: '24px',
                                        fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px'
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                        {capstoneError}
                                    </div>
                                )}
                                <div className="capstone-form-group">
                                    <label className="capstone-form-label">Student Name</label>
                                    <input className="capstone-form-input" type="text" value={user.name} readOnly />
                                </div>
                                <div className="capstone-form-group">
                                    <label className="capstone-form-label">Student Email</label>
                                    <input className="capstone-form-input" type="email" value={user.email} readOnly />
                                </div>
                                <div className="capstone-form-group">
                                    <label className="capstone-form-label">GitHub Repository URL <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input className="capstone-form-input" type="url" placeholder="https://github.com/yourusername/repo" value={capstoneGithub} onChange={e => setCapstoneGithub(e.target.value)} required />
                                </div>
                                <div className="capstone-form-group">
                                    <label className="capstone-form-label">Deployed Application URL <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input className="capstone-form-input" type="url" placeholder="https://your-app.vercel.app" value={capstoneDeployed} onChange={e => setCapstoneDeployed(e.target.value)} required />
                                </div>
                                
                                <div className="capstone-checkbox-group">
                                    <input type="checkbox" id="ack" checked={capstoneAck} onChange={e => setCapstoneAck(e.target.checked)} />
                                    <label htmlFor="ack">
                                        I acknowledge that I have built this capstone project on my own, without copying from external sources or other students. I fully understand the codebase and its functionality, and I am prepared to explain or defend my work during the final review or interview phase.
                                    </label>
                                </div>

                                <div style={{ marginTop: '32px', textAlign: 'right' }}>
                                    <button 
                                        className="quiz-submit-btn" 
                                        onClick={handleCapstoneSubmit}
                                        disabled={!capstoneGithub || !capstoneDeployed || !capstoneAck || submittingCapstone}
                                    >
                                        {submittingCapstone ? 'Submitting...' : 'Submit Capstone Project'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flex: 1, color: '#94a3b8' }}>
                Select a video or quiz to start learning
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
