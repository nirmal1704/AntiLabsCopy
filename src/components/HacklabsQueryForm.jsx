import React, { useState } from "react";
import { motion } from "framer-motion";
import "./HacklabsQueryForm.css";

export default function HacklabsQueryForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ===============================
  // Validation
  // ===============================
  const validate = () => {
    const newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "ENTER YOUR NAME";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "NAME MUST CONTAIN AT LEAST 3 CHARACTERS";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "ENTER YOUR EMAIL ADDRESS";
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
      newErrors.description = "PLEASE DESCRIBE YOUR QUERY";
    } else if (formData.description.trim().length < 15) {
      newErrors.description = "DESCRIPTION MUST CONTAIN AT LEAST 15 CHARACTERS";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ===============================
  // Handle Change
  // ===============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ===============================
  // Handle Submit
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!validate()) return;

    setLoading(true);

    try {
      const existingQueries = JSON.parse(
        localStorage.getItem("mockHacklabsQueries") || "[]",
      );

      const newQuery = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: `[Hacklabs] ${formData.subject.trim()}`,
        description: formData.description.trim(),
        status: "open",
        created_at: new Date().toISOString(),
      };

      localStorage.setItem(
        "mockHacklabsQueries",
        JSON.stringify([...existingQueries, newQuery]),
      );

      setTimeout(() => {
        setMessage(
          "Query Submitted Successfully. Our Operatives Will Contact You Soon.",
        );

        setFormData({
          name: "",
          email: "",
          subject: "",
          description: "",
        });

        setErrors({});
        setLoading(false);

        setTimeout(() => setMessage(""), 5000);
      }, 1200);
    } catch (error) {
      console.error(error);

      setLoading(false);

      setMessage("Subimission Failed. Please Try Again In A Few Moments.");
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

          <form className="hacklabs-query-form" onSubmit={handleSubmit}>
            <div className="form-group-row">
              {/* Name */}
              <div className="field">
                <label>YOUR NAME</label>

                <input
                  type="text"
                  name="name"
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
                <label>YOUR EMAIL</label>

                <input
                  type="email"
                  name="email"
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
              {loading ? "Submitting..." : "SUBMIT QUERY"}
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
