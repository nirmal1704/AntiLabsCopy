import React, { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import "./HacklabsFAQ.css";

const faqData = [
  {
    question: "Who can participate?",
    answer:
      "Students, developers, designers, and tech enthusiasts are welcome to join HackLabs 2026.",
  },
  {
    question: "What is the registration fee?",
    answer: "The registration fee is ₹199 per team.",
  },
  {
    question: "How many members can a team have?",
    answer: "Each team can have up to 4 members.",
  },
  {
    question: "How does the hackathon work?",
    answer:
      "Join the official Google Meet, receive the problem statement, build your solution within 48 hours, and submit your project.",
  },
  {
    question: "What do I need to submit?",
    answer:
      "You must submit your source code, documentation, and a YouTube demo video of your project.",
  },
  {
    question: "What can I win?",
    answer:
      "Participants can compete for a ₹10,000+ prize pool, internship opportunities, domains, hosting, and exclusive perks.",
  },
  {
    question: "Will I receive a certificate?",
    answer:
      "Yes, all eligible participants will receive a participation certificate.",
  },
  {
    question: "Do I need prior hackathon experience?",
    answer:
      "No. Beginners are encouraged to participate, learn, and build alongside experienced developers.",
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
