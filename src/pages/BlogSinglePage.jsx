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

    useEffect(() => {
        fetchBlogBySlug();
    }, [slug]);

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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
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
            <main className="blog-single">
                <article className="blog-single__container">
                    <header className="blog-single__header">
                        {blog.category && (
                            <span className="blog-single__category">{blog.category}</span>
                        )}
                        <h1 className="blog-single__title">{blog.title}</h1>
                        <div className="blog-single__meta">
                            <div className="blog-single__author">
                                <div className="blog-single__avatar">
                                    {blog.author_name ? blog.author_name.charAt(0) : 'A'}
                                </div>
                                <div className="blog-single__author-info">
                                    <span className="blog-single__author-name">{blog.author_name || 'AntiLabs Team'}</span>
                                </div>
                            </div>
                            <div className="blog-single__date">
                                {formatDate(blog.published_at || blog.created_at)}
                            </div>
                        </div>
                    </header>

                    {blog.featured_image && (
                        <div className="blog-single__image-wrap">
                            <img src={blog.featured_image} alt={blog.title} className="blog-single__image" />
                        </div>
                    )}

                    <div className="blog-single__content">
                        <ReactMarkdown>{blog.content}</ReactMarkdown>
                    </div>
                </article>
            </main>
            <Footer />
        </>
    );
}
