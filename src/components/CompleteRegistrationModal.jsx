import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import './ApplicationModal.css';

/* ─── Tiny inline SVG icons (no extra dep needed) ─────────── */
const Icon = {
    building: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M3 21h18M9 8h1m5 0h1M9 12h1m5 0h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        </svg>
    ),
    school: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    ),
    calendar: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
    ),
    cap: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M22 10l-10-5L2 10l10 5 10-5zM6 12.5V17c0 1.1 2.686 2 6 2s6-.9 6-2v-4.5" />
        </svg>
    ),
    upload: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    error: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    briefcase: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
            <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
    ),
    arrow: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
    ),
};

/* ─── File Upload Zone component ──────────────────────────── */
function FileZone({ label, hint, accept, maxSizeMB, file, onChange, isUploading }) {
    return (
        <div className="am__file-group">
            <label>{label}</label>
            <div className={`am__file-zone${file ? ' has-file' : ''}${isUploading ? ' is-uploading' : ''}`} style={isUploading ? { opacity: 0.7, pointerEvents: 'none' } : {}}>
                <input
                    type="file"
                    accept={accept}
                    required={!file}
                    onChange={onChange}
                    disabled={isUploading}
                    title=""
                />
                <span className={`am__file-icon${file && !isUploading ? " has-file" : ""}`}>
                    {isUploading ? <span className="am__spinner" style={{ width: '18px', height: '18px', borderTopColor: '#0ea5e9', margin: 0 }} /> : (file ? Icon.check : Icon.upload)}
                </span>
                {isUploading ? (
                    <p className="am__file-zone-text" style={{ color: '#0ea5e9', fontWeight: 600 }}>
                        Uploading file...
                    </p>
                ) : file ? (
                    <>
                        <p className="am__file-zone-text am__file-zone-text--attached">
                            File attached
                        </p>
                        <p className="am__file-name">{file.name}</p>
                    </>
                ) : (
                    <p className="am__file-zone-text">
                        <strong>Click to browse</strong> or drag & drop
                    </p>
                )}
            </div>
            <span className="am__file-hint">{hint} · Max {maxSizeMB}MB · PDF accepted</span>
        </div>
    );
}

/* ─── AutocompleteInput component ─────────────────────────── */
function AutocompleteInput({ name, value, onChange, placeholder, required, suggestions, icon }) {
    const [open, setOpen] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const [activeIdx, setActiveIdx] = useState(-1);
    const wrapRef = useRef(null);

    const handleInput = (e) => {
        onChange(e);
        const q = e.target.value.trim();
        if (q.length < 2) { setOpen(false); return; }
        const matches = suggestions
            .filter(s => s.toLowerCase().includes(q.toLowerCase()))
            .slice(0, 8);
        setFiltered(matches);
        setOpen(matches.length > 0);
        setActiveIdx(-1);
    };

    const pick = (val) => {
        onChange({ target: { name, value: val } });
        setOpen(false);
        setActiveIdx(-1);
    };

    const handleKeyDown = (e) => {
        if (!open) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && activeIdx >= 0) {
            e.preventDefault();
            pick(filtered[activeIdx]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    useEffect(() => {
        const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="am__autocomplete" ref={wrapRef}>
            <div className="am__input-wrap">
                <input
                    type="text"
                    name={name}
                    required={required}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                />
                <span className="am__input-icon">{icon}</span>
            </div>
            {open && (
                <ul className="am__autocomplete-dropdown">
                    {filtered.map((s, i) => (
                        <li
                            key={s}
                            className={`am__autocomplete-item${i === activeIdx ? ' am__autocomplete-item--active' : ''}`}
                            onMouseDown={() => pick(s)}
                        >
                            <span className="am__autocomplete-match">
                                {s.split(new RegExp(`(${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')).map((part, pi) =>
                                    part.toLowerCase() === value.toLowerCase()
                                        ? <mark key={pi}>{part}</mark>
                                        : part
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/* ─── Suggestion data ─────────────────────────────────────── */
const UNIVERSITY_SUGGESTIONS = [
    "Devi Ahilya Vishwavidyalaya (DAVV)",
    "Anna University",
    "Mumbai University",
    "University of Delhi",
    "Jawaharlal Nehru University (JNU)",
    "Osmania University",
    "Bangalore University",
    "Madras University",
    "Calcutta University",
    "Pune University (SPPU)",
    "Gujarat University",
    "Rajasthan University",
    "Lucknow University",
    "Allahabad University",
    "Banaras Hindu University (BHU)",
    "Aligarh Muslim University (AMU)",
    "Jamia Millia Islamia",
    "Hyderabad University",
    "Pondicherry University",
    "Manipal Academy of Higher Education",
    "Amity University",
    "SRM Institute of Science and Technology",
    "VIT University",
    "Lovely Professional University (LPU)",
    "Chandigarh University",
    "KIIT University",
    "Thapar Institute of Engineering and Technology",
    "Symbiosis International University",
    "Christ University",
    "Jain University",
    "Visvesvaraya Technological University (VTU)",
    "Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)",
    "Mahatma Gandhi University",
    "Kerala University",
    "Calicut University",
    "Cochin University of Science and Technology (CUSAT)",
    "APJ Abdul Kalam Technological University (KTU)",
    "Tamil Nadu Dr Ambedkar Law University",
    "Bharathiar University",
    "Alagappa University",
    "Annamalai University",
    "Periyar University",
    "Andhra University",
    "JNTU Hyderabad",
    "JNTU Kakinada",
    "JNTU Anantapur",
    "Osmania University",
    "Sri Venkateswara University",
    "Nagarjuna University",
    "Mysore University",
    "Tumkur University",
    "Kuvempu University",
    "Mangalore University",
    "Gulbarga University",
    "Shivaji University",
    "North Maharashtra University",
    "RTM Nagpur University",
    "SRTM University Nanded",
    "Solapur University",
    "Swami Ramanand Teerth Marathwada University",
    "Dr. Babasaheb Ambedkar Marathwada University",
    "Chhatrapati Shahu Ji Maharaj University (CSJMU)",
    "Dr. Ram Manohar Lohia Avadh University",
    "MG Kashi Vidyapith",
    "Deen Dayal Upadhyaya Gorakhpur University",
    "Panjab University",
    "Kurukshetra University",
    "Maharshi Dayanand University (MDU)",
    "Guru Gobind Singh Indraprastha University (GGSIPU)",
    "Himachal Pradesh University",
    "Himachal Pradesh Technical University (HPTU)",
    "Uttarakhand Technical University (UTU)",
    "Hemwati Nandan Bahuguna Garhwal University",
    "Gauhati University",
    "Dibrugarh University",
    "Tezpur University",
    "Utkal University",
    "Berhampur University",
    "Sambalpur University",
    "Veer Surendra Sai University of Technology (VSSUT)",
    "Ranchi University",
    "Vinoba Bhave University",
    "Nilamber Pitamber University",
    "Patna University",
    "Magadh University",
    "Tilka Manjhi Bhagalpur University"
];

const COLLEGE_SUGGESTIONS = [
    "IIT Bombay",
    "IIT Delhi",
    "IIT Madras",
    "IIT Kanpur",
    "IIT Kharagpur",
    "IIT Roorkee",
    "IIT Guwahati",
    "IIT Hyderabad",
    "IIT Indore",
    "IIT Bhopal (MANIT)",
    "NIT Trichy",
    "NIT Warangal",
    "NIT Surathkal",
    "NIT Calicut",
    "NIT Rourkela",
    "NIT Jaipur",
    "NIT Allahabad",
    "NIT Nagpur (VNIT)",
    "NIT Bhopal (MANIT)",
    "NIT Patna",
    "BITS Pilani",
    "BITS Goa",
    "BITS Hyderabad",
    "IIPS Indore",
    "IIIT Hyderabad",
    "IIIT Bangalore",
    "IIIT Allahabad",
    "IIIT Delhi",
    "IIIT Gwalior",
    "IIIT Pune",
    "Delhi Technological University (DTU)",
    "Netaji Subhas University of Technology (NSUT)",
    "Jadavpur University",
    "Presidency University Kolkata",
    "St. Xavier's College Kolkata",
    "St. Stephen's College Delhi",
    "Miranda House Delhi",
    "Lady Shri Ram College Delhi",
    "Hansraj College Delhi",
    "Ramjas College Delhi",
    "Kirori Mal College Delhi",
    "Hindu College Delhi",
    "SRCC Delhi",
    "IIM Ahmedabad",
    "IIM Bangalore",
    "IIM Calcutta",
    "IIM Lucknow",
    "IIM Indore",
    "XLRI Jamshedpur",
    "SP Jain Institute of Management",
    "NMIMS Mumbai",
    "Symbiosis Institute of Technology",
    "Thapar University",
    "VIT Vellore",
    "SRM Chennai",
    "Manipal Institute of Technology",
    "Amrita School of Engineering",
    "PSG College of Technology",
    "CEG Anna University",
    "KCE Coimbatore",
    "Coimbatore Institute of Technology (CIT)",
    "Kongu Engineering College",
    "Sri Sivasubramaniya Nadar College of Engineering",
    "REC Thiruchirappalli",
    "Sardar Patel College of Engineering",
    "Veermata Jijabai Technological Institute (VJTI)",
    "College of Engineering Pune (COEP)",
    "PICT Pune",
    "MIT Pune",
    "Pune Institute of Computer Technology (PICT)",
    "Cummins College of Engineering Pune",
    "DKTE Ichalkaranji",
    "SGSITS Indore",
    "IET DAVV Indore",
    "Acropolis Institute Indore",
    "Medicaps University",
    "Oriental Institute of Science and Technology Bhopal",
    "Lakshmi Narain College of Technology",
    "Truba Institute",
    "Jabalpur Engineering College",
    "Maulana Azad National Institute of Technology (MANIT)",
    "Model Institute of Engineering Jammu",
    "SSCET Bhilai",
    "GEC Raipur",
    "CSVTU Bhilai",
    "Chandigarh College of Engineering (CCET)",
    "PEC University of Technology",
    "Thapar Institute of Engineering",
    "Lovely Professional University",
    "Guru Nanak Dev Engineering College",
    "MCE Hassan",
    "BMS College of Engineering",
    "RV College of Engineering",
    "PESIT Bangalore",
    "Dayananda Sagar College",
    "JSS Academy of Technical Education",
    "MSRIT Bangalore",
    "SJCE Mysore",
    "NIE Mysore",
    "Ramaiah Institute of Technology"
];

const DEGREE_SUGGESTIONS = [
    "B.Tech",
    "B.E.",
    "B.Sc",
    "B.Sc (CS)",
    "B.Sc (IT)",
    "B.Sc (Math)",
    "B.Sc (Electronics)",
    "B.Com",
    "B.Com (Hons)",
    "B.A",
    "B.A (Hons)",
    "B.B.A",
    "B.C.A",
    "B.Arch",
    "B.Des",
    "B.Pharm",
    "B.Ed",
    "MBBS",
    "B.D.S",
    "M.Tech",
    "M.E.",
    "M.Sc",
    "M.Sc (CS)",
    "M.Sc (IT)",
    "M.Sc (Data Science)",
    "M.Sc (AI)",
    "M.Com",
    "M.A",
    "M.B.A",
    "M.C.A",
    "M.Arch",
    "M.Des",
    "M.Pharm",
    "M.Ed",
    "Ph.D",
    "Diploma (Engineering)",
    "Polytechnic Diploma",
    "Integrated B.Tech + M.Tech",
    "Integrated M.Sc",
    "LL.B",
    "LL.M"
];

const BRANCH_SUGGESTIONS = [
    "Computer Science Engineering (CSE)",
    "Information Technology (IT)",
    "Electronics & Communication Engineering (ECE)",
    "Electrical Engineering (EE)",
    "Electrical & Electronics Engineering (EEE)",
    "Mechanical Engineering (ME)",
    "Civil Engineering (CE)",
    "Chemical Engineering (ChE)",
    "Aerospace Engineering",
    "Aeronautical Engineering",
    "Automobile Engineering",
    "Biotechnology",
    "Biomedical Engineering",
    "Environmental Engineering",
    "Industrial Engineering",
    "Mining Engineering",
    "Metallurgical Engineering",
    "Petroleum Engineering",
    "Production Engineering",
    "Textile Engineering",
    "Agricultural Engineering",
    "Marine Engineering",
    "Instrumentation Engineering",
    "Computer Science & IT (CSIT)",
    "CSE (Artificial Intelligence)",
    "CSE (Machine Learning)",
    "CSE (Data Science)",
    "CSE (Cybersecurity)",
    "CSE (IoT)",
    "CSE (Cloud Computing)",
    "Software Engineering",
    "Mathematics & Computing",
    "Engineering Physics",
    "Computer Applications (BCA/MCA)",
    "Data Science",
    "Artificial Intelligence & Machine Learning (AIML)",
    "Robotics & Automation",
    "Electronics & Instrumentation (EI)",
    "Power Systems Engineering",
    "VLSI Design",
    "Embedded Systems",
    "Structural Engineering",
    "Transportation Engineering",
    "Geotechnical Engineering",
    "Thermal Engineering",
    "Design Engineering",
    "Commerce",
    "Economics",
    "Arts (Humanities)",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Statistics",
    "Microbiology",
    "Biochemistry",
    "Pharmacy",
    "Architecture"
];

export default function CompleteRegistrationModal({ registration, onClose, onSuccess }) {
    const { logout } = useAuth();
    const [formData, setFormData] = useState({
        university_name: registration.university_name || '',
        college_name: registration.college_name || '',
        current_year: registration.current_year || '',
        degree_pursuing: registration.degree_pursuing || '',
        branch: registration.branch || '',
        graduation_year: registration.graduation_year || '',
    });

    const [collegeProof, setCollegeProof] = useState(
        registration.college_proof_url
            ? { name: 'Uploaded College Proof', url: registration.college_proof_url }
            : null
    );
    const [resume, setResume] = useState(
        registration.resume_url
            ? { name: 'Uploaded Resume', url: registration.resume_url }
            : null
    );

    const [uploadingType, setUploadingType] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const errorRef = useRef(null);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Auto-scroll to error message
    useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [error]);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = async (e, setter, maxSizeMB, type) => {
        const file = e.target.files[0];
        if (!file) { setter(null); return; }
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`);
            e.target.value = '';
            setter(null);
            return;
        }
        setError('');
        
        setUploadingType(type);
        try {
            const url = await uploadToCloudinary(file);
            setter({ name: file.name, url });
        } catch (err) {
            setError(err.message || 'Failed to upload file.');
            setter(null);
        } finally {
            setUploadingType(null);
        }
    };

    const uploadToCloudinary = async (file) => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset || cloudName === 'your_cloud_name')
            throw new Error('Cloudinary configuration missing. Check your .env file.');

        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
            method: 'POST', body: data,
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message || 'Failed to upload file to Cloudinary');
        }
        return (await res.json()).secure_url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!collegeProof) { setError('Please upload your college proof document.'); return; }
        if (!resume) { setError('Please upload your resume.'); return; }

        setLoading(true);
        try {
            const proofUrl = collegeProof.url;
            const resumeUrl = resume.url;

            const sanitizeInput = (str) => {
                if (typeof str !== 'string') return str;
                return str.replace(/<[^>]*>?/gm, '').trim();
            };

            const updates = {
                university_name: sanitizeInput(formData.university_name),
                college_name: sanitizeInput(formData.college_name),
                current_year: formData.current_year ? parseInt(formData.current_year, 10) : null,
                degree_pursuing: sanitizeInput(formData.degree_pursuing),
                branch: sanitizeInput(formData.branch),
                graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
                college_proof_url: proofUrl,
                resume_url: resumeUrl
            };

            // 1. Update training registrations
            const { error: dbError } = await supabase
                .from('training_registrations')
                .update(updates)
                .eq('registration_id', registration.registration_id);

            if (dbError) {
                if (
                    dbError.status === 401 ||
                    dbError.code === 'PGRST301' ||
                    dbError.message?.toLowerCase().includes('jwt') ||
                    dbError.message?.toLowerCase().includes('token')
                ) {
                    if (logout) logout();
                    throw new Error('Your session has expired or is invalid. Please sign out and sign in again.');
                }
                throw dbError;
            }

            // 2. Best-effort update transactions table
            if (registration.email && registration.role_id) {
                await supabase
                    .from('transactions')
                    .update(updates)
                    .eq('email', registration.email)
                    .eq('role_id', registration.role_id);
            }

            onSuccess();
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="am__overlay" onClick={onClose}>
            <div className="am__wrapper" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="am__header">
                    <div>
                        <div className="am__header-badge">
                            {Icon.briefcase}&nbsp;Complete Enrollment
                        </div>
                        <h2 className="am__title">Academic & Document Details</h2>
                        <p className="am__subtitle">
                            Program:&nbsp;<strong>{registration.position}</strong>
                        </p>
                    </div>
                    <button className="am__close-btn" onClick={onClose} aria-label="Close">✕</button>
                </div>

                {/* Form */}
                <form id="complete-reg-form" className="am__form" onSubmit={handleSubmit} data-lenis-prevent>

                    {error && (
                        <div ref={errorRef} className="am__error">
                            {Icon.error}&nbsp;{error}
                        </div>
                    )}

                    {/* Academic Info */}
                    <div className="am__section-label">Academic Details</div>

                    <div className="am__row">
                        <div className="am__input-group">
                            <label>University Name</label>
                            <AutocompleteInput
                                name="university_name"
                                value={formData.university_name}
                                onChange={handleChange}
                                placeholder="e.g. DAVV, Anna University"
                                required={false}
                                suggestions={UNIVERSITY_SUGGESTIONS}
                                icon={Icon.building}
                            />
                        </div>
                        <div className="am__input-group">
                            <label>College Name *</label>
                            <AutocompleteInput
                                name="college_name"
                                value={formData.college_name}
                                onChange={handleChange}
                                placeholder="e.g. IIPS, IIT Bombay"
                                required={true}
                                suggestions={COLLEGE_SUGGESTIONS}
                                icon={Icon.school}
                            />
                        </div>
                    </div>

                    <div className="am__row">
                        <div className="am__input-group">
                            <label>Current Year *</label>
                            <div className="am__input-wrap am__select-wrap">
                                <span className="am__input-icon">{Icon.calendar}</span>
                                <select
                                    name="current_year"
                                    required
                                    value={formData.current_year}
                                    onChange={handleChange}
                                    className="am__select"
                                >
                                    <option value="">Select year…</option>
                                    <option value={1}>1st Year</option>
                                    <option value={2}>2nd Year</option>
                                    <option value={3}>3rd Year</option>
                                    <option value={4}>4th Year</option>
                                    <option value={5}>5th Year</option>
                                    <option value={0}>Lateral Entry</option>
                                </select>
                                <span className="am__select-chevron">▾</span>
                            </div>
                        </div>
                        <div className="am__input-group">
                            <label>Degree Pursuing *</label>
                            <AutocompleteInput
                                name="degree_pursuing"
                                value={formData.degree_pursuing}
                                onChange={handleChange}
                                placeholder="e.g. B.Tech, M.Sc"
                                required={true}
                                suggestions={DEGREE_SUGGESTIONS}
                                icon={Icon.cap}
                            />
                        </div>
                        <div className="am__input-group">
                            <label>Branch *</label>
                            <AutocompleteInput
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                placeholder="e.g. CSE, ECE, IT"
                                required={true}
                                suggestions={BRANCH_SUGGESTIONS}
                                icon={Icon.building}
                            />
                        </div>
                        <div className="am__input-group">
                            <label>Graduation Year *</label>
                            <div className="am__input-wrap">
                                <input
                                    type="number" name="graduation_year" required
                                    placeholder="YYYY" min="2024" max="2035"
                                    value={formData.graduation_year} onChange={handleChange}
                                    style={{ paddingLeft: '14px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="am__section-label">Documents</div>

                    <FileZone
                        label="College Proof (ID Card, Fee Receipt, etc.) *"
                        hint="ID Card or Fee Receipt"
                        accept="application/pdf,image/*"
                        maxSizeMB={5}
                        file={collegeProof}
                        onChange={(e) => handleFileChange(e, setCollegeProof, 5, 'proof')}
                        isUploading={uploadingType === 'proof'}
                    />

                    <FileZone
                        label="Resume *"
                        hint="PDF only"
                        accept="application/pdf"
                        maxSizeMB={7}
                        file={resume}
                        onChange={(e) => handleFileChange(e, setResume, 7, 'resume')}
                        isUploading={uploadingType === 'resume'}
                    />

                </form>

                {/* Footer */}
                <div className="am__footer">
                    <div className="am__footer-price-wrap">
                        <span className="am__footer-price-label">Verification Mode</span>
                        <div className="am__footer-price-row" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Self-Service Upload
                        </div>
                    </div>
                    <div className="am__footer-btns">
                        <button
                            type="button"
                            className="am__btn-cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="complete-reg-form"
                            className="am__btn-submit"
                            disabled={loading || uploadingType !== null}
                        >
                            {loading
                                ? <><span className="am__spinner" />Submitting…</>
                                : <>Save Details&nbsp;{Icon.arrow}</>
                            }
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
