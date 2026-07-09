import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabase";
import "./HacklabsQueryForm.css";

export default function HacklabsQueryForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ===========================
  // Validation
  // ===========================

  const validate = () => {
    const newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "NAME IS REQUIRED";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "NAME MUST BE AT LEAST 3 CHARACTERS";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "EMAIL ADDRESS IS REQUIRED";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "ENTER A VALID EMAIL ADDRESS";
    }

    // Subject
    if (!formData.subject.trim()) {
      newErrors.subject = "SUBJECT IS REQUIRED";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "SUBJECT MUST BE AT LEAST 5 CHARACTERS";
    }

    // Description
    if (!formData.description.trim()) {
      newErrors.description = "DESCRIPTION IS REQUIRED";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "DESCRIPTION MUST CONTAIN AT LEAST 20 CHARACTERS";
    }

    setErrors({
      name: newErrors.name || "",
      email: newErrors.email || "",
      subject: newErrors.subject || "",
      description: newErrors.description || "",
    });

    return Object.keys(newErrors).length === 0;
  };

  // ===========================
  // Handle Input
  // ===========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setMessage("");
  };

  // ===========================
  // Submit
  // ===========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!validate()) return;

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.from("hacklabs_queries").insert([
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: `[Hacklabs] ${formData.subject.trim()}`,
          description: formData.description.trim(),
          status: "open",
        },
      ]);

      if (error) throw error;

      setLoading(false);
      setMessage(
        "QUERY SUBMITTED SUCCESSFULLY. OUR TEAM WILL CONTACT YOU SOON.",
      );
      setFormData({ name: "", email: "", subject: "", description: "" });
      setErrors({ name: "", email: "", subject: "", description: "" });

      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error(error);

      setLoading(false);

      setMessage("FAILED TO SUBMIT QUERY. PLEASE TRY AGAIN.");
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
            <h2 className="hacklabs-section-title">
              HAVE A <span className="highlight-text">QUERY?</span>
            </h2>

            <p className="query-subtitle">
              Drop us a message and our support operatives will assist you.
            </p>
          </div>

          <form
            className="hacklabs-query-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="form-group-row">
              {/* Name */}

              <div className="field">
                <label>YOUR NAME</label>

                <input
                  type="text"
                  name="name"
                  placeholder="ENTER YOUR NAME"
                  value={formData.name}
                  onChange={handleChange}
                  className={`hacklabs-input ${
                    errors.name ? "input-error" : ""
                  }`}
                />

                {errors.name && (
                  <span className="field-error">{errors.name}</span>
                )}
              </div>

              {/* Email */}

              <div className="field">
                <label>EMAIL ADDRESS</label>

                <input
                  type="email"
                  name="email"
                  placeholder="ENTER YOUR EMAIL"
                  value={formData.email}
                  onChange={handleChange}
                  className={`hacklabs-input ${
                    errors.email ? "input-error" : ""
                  }`}
                />

                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>
            </div>

            {/* Subject */}

            <div className="field">
              <label>SUBJECT</label>

              <input
                type="text"
                name="subject"
                placeholder="ENTER SUBJECT"
                value={formData.subject}
                onChange={handleChange}
                className={`hacklabs-input ${
                  errors.subject ? "input-error" : ""
                }`}
              />

              {errors.subject && (
                <span className="field-error">{errors.subject}</span>
              )}
            </div>

            {/* Description */}

            <div className="field">
              <label>DESCRIPTION</label>

              <textarea
                rows="6"
                name="description"
                placeholder="DESCRIBE YOUR QUERY..."
                value={formData.description}
                onChange={handleChange}
                className={`hacklabs-textarea ${
                  errors.description ? "input-error" : ""
                }`}
              />

              {errors.description && (
                <span className="field-error">{errors.description}</span>
              )}
            </div>

            <button
              type="submit"
              className="hacklabs-submit-btn"
              disabled={loading}
            >
              {loading ? "TRANSMITTING..." : "SUBMIT QUERY"}
            </button>

            {message && (
              <div
                className={`query-message ${
                  message.includes("FAILED") ? "error" : "success"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
