import React, { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import "./HacklabsFAQ.css";

const faqData = [
  {
    question: "What is Ship?",
    answer:
      "Ship is a hackathon focused on building innovative products, collaborating with developers, and shipping ideas quickly.",
  },
  {
    question: "Will this be live-streamed?",
    answer:
      "Yes. Keynotes, opening ceremonies, and selected demos will be streamed online.",
  },
  {
    question: "What is Ship?",
    answer:
      "Ship is a hackathon focused on building innovative products, collaborating with developers, and shipping ideas quickly.",
  },
  {
    question: "Will this be live-streamed?",
    answer:
      "Yes. Keynotes, opening ceremonies, and selected demos will be streamed online.",
  },
  {
    question: "What is Ship?",
    answer:
      "Ship is a hackathon focused on building innovative products, collaborating with developers, and shipping ideas quickly.",
  },
  {
    question: "Will this be live-streamed?",
    answer:
      "Yes. Keynotes, opening ceremonies, and selected demos will be streamed online.",
  },
  {
    question: "What is Ship?",
    answer:
      "Ship is a hackathon focused on building innovative products, collaborating with developers, and shipping ideas quickly.",
  },
  {
    question: "Will this be live-streamed?",
    answer:
      "Yes. Keynotes, opening ceremonies, and selected demos will be streamed online.",
  },
  {
    question: "Will this be live-streamed?",
    answer:
      "Yes. Keynotes, opening ceremonies, and selected demos will be streamed online.",
  },
  {
    question: "Will this be live-streamed?",
    answer:
      "Yes. Keynotes, opening ceremonies, and selected demos will be streamed online.",
  },
  {
    question: "When will the full agenda be announced?",
    answer: "The complete schedule will be released closer to the event date.",
  },
  {
    question: "Can I participate as a sponsor of the event?",
    answer: "Absolutely. Reach out through our sponsorship page to learn more.",
  },
  {
    question: "Dietary Restrictions & Food Allergies",
    answer:
      "We'll provide options for various dietary requirements. Participants can specify restrictions during registration.",
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-wrapper">
        {/* Left Side */}
        <div className="faq-left">
          <h1>FAQ</h1>
        </div>

        {/* Right Side */}
        <div className="faq-right">
          {faqData.map((item, index) => (
            <div key={index} className="faq-item">
              <button className="faq-question" onClick={() => toggleFAQ(index)}>
                <span>{item.question}</span>

                {activeIndex === index ? (
                  <FiMinus className="faq-icon" />
                ) : (
                  <FiPlus className="faq-icon" />
                )}
              </button>

              <div
                className={`faq-answer ${
                  activeIndex === index ? "active" : ""
                }`}
              >
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
