/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
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
  const capstoneErrorRef = useRef(null);

  useEffect(() => {
      if (capstoneError && capstoneErrorRef.current) {
          capstoneErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }, [capstoneError]);

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      window.scrollTo({ top: 0, behavior: 'smooth' });

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
              setCapstoneError('Failed to submit. Please try again later.');
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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#0f172a' }}>Dashboard Locked</h1>
          <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', lineHeight: '1.6' }}>
            Batch starting from 10 June 2026 for everycourse.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
