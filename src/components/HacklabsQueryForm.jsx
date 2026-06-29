import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase';
import './HacklabsQueryForm.css';

export default function HacklabsQueryForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const { error } = await supabase.from('hacklabs_queries').insert([{
        name: formData.name,
        email: formData.email,
        subject: `[Hacklabs] ${formData.subject}`,
        description: formData.description,
        status: 'open'
      }]);

      if (error) throw error;

      setMessage('Query submitted successfully! Our team will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', description: '' });
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error(error);
      setMessage('Failed to submit query. Please try again.');
      setLoading(false);
    }
  };

  return (
    <section className="hacklabs-query-section" id="queries">
      <div className="hacklabs-container">
        <motion.div 
          className="query-wrapper"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="query-header">
            <h2 className="hacklabs-section-title">HAVE A <span className="highlight-text">QUERY?</span></h2>
            <p className="query-subtitle">Drop us a message and our support operatives will assist you.</p>
          </div>
          
          <form className="hacklabs-query-form" onSubmit={handleSubmit}>
            <div className="form-group-row">
              <input 
                type="text" 
                name="name" 
                placeholder="YOUR NAME" 
                required 
                value={formData.name} 
                onChange={handleChange} 
                className="hacklabs-input"
              />
              <input 
                type="email" 
                name="email" 
                placeholder="YOUR EMAIL" 
                required 
                value={formData.email} 
                onChange={handleChange} 
                className="hacklabs-input"
              />
            </div>
            <input 
              type="text" 
              name="subject" 
              placeholder="SUBJECT" 
              required 
              value={formData.subject} 
              onChange={handleChange} 
              className="hacklabs-input"
            />
            <textarea 
              name="description" 
              placeholder="DESCRIBE YOUR QUERY..." 
              required 
              rows="5"
              value={formData.description} 
              onChange={handleChange} 
              className="hacklabs-textarea"
            ></textarea>
            
            <button type="submit" className="hacklabs-submit-btn" disabled={loading}>
              {loading ? 'TRANSMITTING...' : 'SUBMIT QUERY'}
            </button>
            
            {message && (
              <div className={`query-message ${message.includes('Failed') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
