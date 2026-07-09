import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { supabase } from '../supabase';
import ReactMarkdown from 'react-markdown';
import './BlogSinglePage.css';

export default function BlogSinglePage() {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const [relatedBlogs, setRelatedBlogs] = useState([]);

    // Contact Form States embedded in the CTA card
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
    });
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);

    useEffect(() => {
        // Scroll to top on slug change so reader starts from the beginning
        window.scrollTo(0, 0);
        fetchBlogBySlug();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    useEffect(() => {
        if (blog) {
            fetchRelatedBlogs(blog.category, blog.slug);
        }
    }, [blog]);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const progress = (window.pageYOffset / totalHeight) * 100;
                setScrollProgress(progress);
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchBlogBySlug = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .eq('slug', slug)
                .single();
                
            if (error) {
                console.error("Error fetching blog:", error);
                setError("Article not found or unavailable.");
                return;
            }
            
            if (data) {
                setBlog(data);
            } else {
                setError("Article not found.");
            }
        } catch (error) {
            console.error("Error in fetchBlogBySlug:", error);
            setError("Something went wrong while loading the article.");
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedBlogs = async (category, currentSlug) => {
        try {
            // First try to fetch published articles in the same category
            const { data, error } = await supabase
                .from('blogs')
                .select('id, title, slug, featured_image, category, author_name, published_at, created_at')
                .eq('status', 'published')
                .eq('category', category)
                .neq('slug', currentSlug)
                .limit(3);
                
            if (error) throw error;
            
            let combined = data || [];
            
            // If we don't have 3 related blogs in the same category, fetch recent published ones as fallback
            if (combined.length < 3) {
                const countNeeded = 3 - combined.length;
                const existingIds = combined.map(b => b.id);
                
                let query = supabase
                    .from('blogs')
                    .select('id, title, slug, featured_image, category, author_name, published_at, created_at')
                    .eq('status', 'published')
                    .neq('slug', currentSlug)
                    .order('published_at', { ascending: false });
                
                if (existingIds.length > 0) {
                    query = query.not('id', 'in', `(${existingIds.join(',')})`);
                }
                
                const { data: fallbackData, error: fallbackError } = await query.limit(countNeeded);
                
                if (!fallbackError && fallbackData) {
                    combined = [...combined, ...fallbackData];
                }
            }
            setRelatedBlogs(combined);
        } catch (err) {
            console.error("Error fetching related blogs:", err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getReadingTime = (content) => {
        if (!content) return 1;
        const words = content.trim().split(/\s+/).length;
        const wpm = 200;
        return Math.ceil(words / wpm);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(err => {
                console.error("Failed to copy url: ", err);
            });
    };

    const handleShareTwitter = () => {
        if (!blog) return;
        const text = `Check out this article: "${blog.title}" by ${blog.author_name || 'AntiLabs'}`;
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    };

    const handleShareLinkedIn = () => {
        if (!blog) return;
        const url = window.location.href;
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    };

    // Form Event Handlers
    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitting(true);
        try {
            const { error } = await supabase
                .from('enquiry')
                .insert([
                    {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        company: formData.company,
                        message: formData.message
                    }
                ]);
            if (error) throw error;
            setFormSubmitted(true);
            setFormData({ name: '', email: '', phone: '', company: '', message: '' });
            setTimeout(() => setFormSubmitted(false), 5000);
        } catch (err) {
            console.error('Error saving enquiry:', err);
            alert('There was an error submitting your form. Please try again.');
        } finally {
            setFormSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="blog-single__loading">
                    <div className="blogs__spinner"></div>
                    <p>Loading article...</p>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !blog) {
        return (
            <>
                <Navbar />
                <div className="blog-single__error">
                    <h2>Oops!</h2>
                    <p>{error || "Article not found."}</p>
                    <Link to="/blogs" className="btn btn-primary">Back to Blogs</Link>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <SEO 
                title={blog.meta_title || blog.title} 
                description={blog.meta_description || blog.short_description} 
                canonicalUrl={`/blogs/${blog.slug}`} 
            />
            <Navbar />
            
            {/* Scroll Reading Progress Bar */}
            <div className="blog-single__progress-bar-container">
                <div 
                    className="blog-single__progress-bar" 
                    style={{ width: `${scrollProgress}%` }}
                ></div>
            </div>

            <main className="blog-single">
                {/* Hero section with background image & overlay text (mirroring the requested GRC reference style) */}
                <section 
                    className={`blog-single__hero ${!blog.featured_image ? 'blog-single__hero--no-image' : ''}`}
                    style={blog.featured_image ? { backgroundImage: `url(${blog.featured_image})` } : {}}
                >
                    <div className="blog-single__hero-overlay"></div>
                    <div className="blog-single__hero-container">
                        <div className="blog-single__breadcrumbs-hero">
                            <span>INSIGHTS</span>
                            <span className="hero-separator">/</span>
                            <span>{blog.category ? blog.category.toUpperCase() : 'BLOGS'}</span>
                        </div>
                        
                        <div className="blog-single__hero-divider-top"></div>
                        
                        <h1 className="blog-single__hero-title">{blog.title}</h1>
                        
                        <div className="blog-single__hero-divider-bottom"></div>

                        <div className="blog-single__author-hero">
                            <div className="blog-single__avatar-hero">
                                {blog.author_name ? blog.author_name.charAt(0) : 'A'}
                            </div>
                            <div className="blog-single__author-info-hero">
                                <span className="blog-single__author-name-hero">{blog.author_name || 'AntiLabs Team'}</span>
                                <span className="blog-single__author-title-hero">Technical Writer, AntiLabs Consulting Practice</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Background decorative elements */}
                <div className="blog-single__bg-glow-1"></div>
                <div className="blog-single__bg-glow-2"></div>

                <div className="blog-single__container">
                    {/* Layout with sticky share and content */}
                    <div className="blog-single__body-layout">
                        {/* Sticky left share sidebar */}
                        <aside className="blog-single__share-sidebar">
                            <div className="blog-single__share-sticky">
                                <span className="blog-single__share-title">SHARE</span>
                                
                                <button onClick={handleShareTwitter} className="blog-single__share-btn" title="Share on Twitter">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                                    </svg>
                                </button>
                                
                                <button onClick={handleShareLinkedIn} className="blog-single__share-btn" title="Share on LinkedIn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                        <rect x="2" y="9" width="4" height="12"></rect>
                                        <circle cx="4" cy="4" r="2"></circle>
                                    </svg>
                                </button>
                                
                                <button onClick={handleCopyLink} className={`blog-single__share-btn ${copied ? 'copied' : ''}`} title="Copy Link">
                                    {copied ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="copied-icon">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                        </svg>
                                    )}
                                    {copied && <span className="blog-single__tooltip">Link Copied!</span>}
                                </button>
                            </div>
                        </aside>

                        {/* Article Text Content */}
                        <div className="blog-single__content-wrap">
                            {/* Meta stat bar directly above content */}
                            <div className="blog-single__content-meta">
                                <div className="blog-single__content-stat">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    <span>{formatDate(blog.published_at || blog.created_at)}</span>
                                </div>
                                <div className="blog-single__content-stat">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    <span>{getReadingTime(blog.content)} min read</span>
                                </div>
                            </div>

                            <div className="blog-single__content">
                                <ReactMarkdown>{blog.content}</ReactMarkdown>
                            </div>
                            
                            {/* Inline social share for mobile viewports */}
                            <div className="blog-single__inline-share">
                                <span className="blog-single__inline-share-label">Share this article:</span>
                                <div className="blog-single__inline-share-buttons">
                                    <button onClick={handleShareTwitter} className="blog-single__inline-share-btn" title="Share on Twitter">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                                        </svg>
                                        <span>Twitter</span>
                                    </button>
                                    <button onClick={handleShareLinkedIn} className="blog-single__inline-share-btn" title="Share on LinkedIn">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                            <rect x="2" y="9" width="4" height="12"></rect>
                                            <circle cx="4" cy="4" r="2"></circle>
                                        </svg>
                                        <span>LinkedIn</span>
                                    </button>
                                    <button onClick={handleCopyLink} className={`blog-single__inline-share-btn ${copied ? 'copied' : ''}`} title="Copy Link">
                                        {copied ? (
                                            <>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                                </svg>
                                                <span>Copy Link</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expanded Full-Width Contact CTA Banner Section (Covering the page horizontally) */}
                <section className="blog-single__cta-section">
                    <div className="blog-single__cta-container-expanded">
                        <div className="blog-single__cta-card-expanded">
                            <div className="blog-single__cta-glow"></div>
                            <div className="blog-single__cta-grid-expanded">
                                {/* Left column: Content */}
                                <div className="blog-single__cta-info-expanded">
                                    <span className="blog-single__cta-eyebrow">Partner with AntiLabs</span>
                                    <h3>Let's Build Something Extraordinary</h3>
                                    <p>
                                        Looking to elevate your security, deploy robust software engineering patterns, or optimize your cloud architecture? Our senior engineering team is ready to turn your complex technical goals into reality.
                                    </p>
                                    <div className="blog-single__cta-bullets">
                                        <div className="blog-single__cta-bullet-item">
                                            <div className="bullet-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                            <span>Senior Engineering Expertise</span>
                                        </div>
                                        <div className="blog-single__cta-bullet-item">
                                            <div className="bullet-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                            <span>Rapid 24-Hour Response</span>
                                        </div>
                                        <div className="blog-single__cta-bullet-item">
                                            <div className="bullet-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                            <span>Custom Scalable Architecture</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right column: Integrated Contact Form */}
                                <div className="blog-single__cta-form-expanded">
                                    {formSubmitted ? (
                                        <div className="blog-single__cta-success">
                                            <div className="success-icon-wrap">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                            <h4>Inquiry Received!</h4>
                                            <p>Thank you for reaching out. A senior engineer from AntiLabs will get in touch with you shortly.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleFormSubmit} className="blog-single__cta-form">
                                            <fieldset disabled={formSubmitting} className="blog-single__cta-fieldset">
                                                <div className="form-group-row">
                                                    <div className="form-group-item">
                                                        <label htmlFor="cta-name">Full Name *</label>
                                                        <input 
                                                            type="text" 
                                                            id="cta-name" 
                                                            name="name" 
                                                            value={formData.name} 
                                                            onChange={handleFormChange} 
                                                            placeholder="John Doe" 
                                                            required 
                                                        />
                                                    </div>
                                                    <div className="form-group-item">
                                                        <label htmlFor="cta-email">Email Address *</label>
                                                        <input 
                                                            type="email" 
                                                            id="cta-email" 
                                                            name="email" 
                                                            value={formData.email} 
                                                            onChange={handleFormChange} 
                                                            placeholder="john@example.com" 
                                                            required 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group-row">
                                                    <div className="form-group-item">
                                                        <label htmlFor="cta-phone">Phone Number</label>
                                                        <input 
                                                            type="tel" 
                                                            id="cta-phone" 
                                                            name="phone" 
                                                            value={formData.phone} 
                                                            onChange={handleFormChange} 
                                                            placeholder="+91 xxxxx-xxxxx" 
                                                        />
                                                    </div>
                                                    <div className="form-group-item">
                                                        <label htmlFor="cta-company">Company</label>
                                                        <input 
                                                            type="text" 
                                                            id="cta-company" 
                                                            name="company" 
                                                            value={formData.company} 
                                                            onChange={handleFormChange} 
                                                            placeholder="Your Company Ltd." 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group-item">
                                                    <label htmlFor="cta-message">Message *</label>
                                                    <textarea 
                                                        id="cta-message" 
                                                        name="message" 
                                                        value={formData.message} 
                                                        onChange={handleFormChange} 
                                                        placeholder="How can we help you?" 
                                                        rows="3" 
                                                        required 
                                                    ></textarea>
                                                </div>
                                                <button type="submit" className="btn btn-primary blog-single__cta-submit-expanded">
                                                    {formSubmitting ? 'Sending...' : 'Send Message'}
                                                </button>
                                            </fieldset>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Articles Recommended Deck */}
                {relatedBlogs.length > 0 && (
                    <section className="blog-single__related">
                        <div className="blog-single__related-container">
                            <h2 className="blog-single__related-title">Recommended Articles</h2>
                            <div className="blog-single__related-grid">
                                {relatedBlogs.map((relatedBlog) => (
                                    <Link to={`/blogs/${relatedBlog.slug}`} key={relatedBlog.id} className="blog-single__related-card">
                                        <div className="blog-single__related-card-img-wrap">
                                            {relatedBlog.featured_image ? (
                                                <img src={relatedBlog.featured_image} alt={relatedBlog.title} className="blog-single__related-card-img" />
                                            ) : (
                                                <div className="blog-single__related-card-img" style={{ background: 'linear-gradient(45deg, #0099C8, #00C8FF)' }}></div>
                                            )}
                                            {relatedBlog.category && (
                                                <span className="blog-single__related-card-category">{relatedBlog.category}</span>
                                            )}
                                        </div>
                                        <div className="blog-single__related-card-content">
                                            <h3 className="blog-single__related-card-title">{relatedBlog.title}</h3>
                                            <div className="blog-single__related-card-meta">
                                                <span className="blog-single__related-card-author">{relatedBlog.author_name || 'AntiLabs'}</span>
                                                <span className="blog-single__related-card-dot">•</span>
                                                <span className="blog-single__related-card-date">{formatDate(relatedBlog.published_at || relatedBlog.created_at)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </>
    );
}
