import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { supabase } from '../supabase';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './BlogsPage.css';

function BlogCard({ blog, formatDate, index }) {
    const { ref, visible } = useScrollReveal({ threshold: 0.05, rootMargin: '0px 0px -50px 0px' });
    const delay = visible ? `${(index % 3) * 0.12}s` : '0s';

    return (
        <Link 
            ref={ref}
            to={`/blogs/${blog.slug}`} 
            className={`blog__card ${visible ? 'animate-reveal' : 'reveal-hidden'}`}
            style={{ transitionDelay: delay }}
        >
            <div className="blog__card-img-wrap">
                {blog.featured_image ? (
                    <img src={blog.featured_image} alt={blog.title} className="blog__card-img" />
                ) : (
                    <div className="blog__card-img" style={{ background: 'linear-gradient(45deg, #0ea5e9, #7b61ff)' }}></div>
                )}
                {blog.category && (
                    <span className="blog__card-category">{blog.category}</span>
                )}
            </div>
            <div className="blog__card-content">
                <h2 className="blog__card-title">{blog.title}</h2>
                <p className="blog__card-desc">{blog.short_description || "No description provided."}</p>
                <div className="blog__card-meta">
                    <div className="blog__card-author">
                        <div className="blog__card-avatar">
                            {blog.author_name ? blog.author_name.charAt(0) : 'A'}
                        </div>
                        <span>{blog.author_name || 'AntiLabs Team'}</span>
                    </div>
                    <div className="blog__card-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {formatDate(blog.published_at || blog.created_at)}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState(['All']);
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .eq('status', 'published')
                .order('published_at', { ascending: false });
                
            if (error) {
                console.error("Error fetching blogs:", error);
                return;
            }
            
            if (data) {
                setBlogs(data);
                
                // Extract unique categories
                const uniqueCategories = ['All'];
                data.forEach(blog => {
                    if (blog.category && !uniqueCategories.includes(blog.category)) {
                        uniqueCategories.push(blog.category);
                    }
                });
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error("Error in fetchBlogs:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const filteredBlogs = activeCategory === 'All' 
        ? blogs 
        : blogs.filter(blog => blog.category === activeCategory);

    return (
        <>
            <SEO title="Our Blog" description="Insights, news, and thoughts from the AntiLabs team." canonicalUrl="/blogs" />
            <Navbar />
            <main className="blogs-page">
                <section className="blogs__hero">
                    <div className="blogs__hero-bg"></div>
                    <div className="blogs__hero-content">
                        <span className="blogs__hero-eyebrow">Our Insights</span>
                        <h1 className="blogs__hero-h1">Stories, Ideas & Updates</h1>
                        <p className="blogs__hero-sub">
                            Dive into our latest articles covering cybersecurity, software engineering, cloud architecture, and the future of technology.
                        </p>
                    </div>
                </section>

                <div className="blogs__container">
                    {loading ? (
                        <div className="blogs__loading">
                            <div className="blogs__spinner"></div>
                            <p>Loading the latest insights...</p>
                        </div>
                    ) : (
                        <>
                            {categories.length > 1 && (
                                <div className="blogs__filters">
                                    {categories.map(category => (
                                        <button 
                                            key={category}
                                            className={`blogs__filter-btn ${activeCategory === category ? 'active' : ''}`}
                                            onClick={() => setActiveCategory(category)}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {filteredBlogs.length > 0 ? (
                                <div className="blogs__grid">
                                    {filteredBlogs.map((blog, index) => (
                                        <BlogCard 
                                            key={blog.id} 
                                            blog={blog} 
                                            formatDate={formatDate} 
                                            index={index} 
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="blogs__empty">
                                    <h3>No articles found</h3>
                                    <p>We couldn't find any published articles in this category at the moment. Check back soon for updates!</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
