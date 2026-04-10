import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppSelector } from "../store/hooks";

const HelpPage = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("faq");
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [ticketActionMessage, setTicketActionMessage] = useState("");
  const [ticketError, setTicketError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadTickets();
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const loadTickets = async () => {
    setLoadingTickets(true);
    setTicketError("");
    try {
      const res = await axios.get("http://localhost:5000/api/support/tickets", {
        params: { username: user.username },
      });
      setTickets(res.data);
    } catch (error) {
      setTickets([]);
      setTicketError(error.response?.data?.error || "Unable to load support requests.");
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSupportMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/support/tickets", {
        name: user.name,
        email: user.email,
        username: user.username,
        subject: contactForm.subject,
        message: contactForm.message,
      });
      setSupportMessage(res.data.message);
      setSubmitted(true);
      setContactForm({ subject: "", message: "" });
      loadTickets();
    } catch (error) {
      setSupportMessage(error.response?.data?.error || "Failed to submit support request.");
      setSubmitted(false);
    }
  };

  const handleTicketAction = async (ticketId, action) => {
    setTicketActionMessage("");
    try {
      let res;

      if (action === "resolve") {
        res = await axios.post(
          `http://localhost:5000/api/support/tickets/${ticketId}/resolve`,
          { resolution: "User ticket marked as resolved." }
        );
      } else {
        res = await axios.patch(
          `http://localhost:5000/api/support/tickets/${ticketId}/status`,
          { status: action }
        );
      }

      setTicketActionMessage(res.data.message);
      loadTickets();
    } catch (error) {
      setTicketActionMessage(error.response?.data?.error || "Unable to update ticket status.");
    }
  };

  const faqs = [
    {
      question: "How do I update my profile information?",
      answer: "Navigate to the Profile page from the navigation menu. You can edit your name, email, mobile number, gender, and city. Click 'Update Profile' to save changes.",
    },
    {
      question: "How do I view all users?",
      answer: "Go to the Users page from the navigation menu. You'll see a table with all registered users. You can search, edit, or delete users from this page.",
    },
    {
      question: "What information is shown in Analytics?",
      answer: "The Analytics page shows comprehensive statistics including total users, city distribution, gender breakdown, and recent user activity. You can filter data by time periods.",
    },
    {
      question: "How do I change my settings?",
      answer: "Visit the Settings page to customize your experience. You can change themes, notification preferences, language, and privacy settings.",
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take data security seriously. All user data is stored securely and authentication is required for all sensitive operations.",
    },
  ];

  const guides = [
    {
      title: "Getting Started",
      steps: [
        "Register for an account or login if you already have one",
        "Complete your profile information",
        "Explore the dashboard to see an overview",
        "Navigate to different sections using the menu",
      ],
    },
    {
      title: "Managing Users",
      steps: [
        "Go to the Users page to see all registered users",
        "Use the search bar to find specific users",
        "Click the edit button to modify user information",
        "Use the delete button to remove users (with confirmation)",
      ],
    },
    {
      title: "Viewing Analytics",
      steps: [
        "Navigate to the Analytics page",
        "View key metrics and statistics",
        "Use the time range filter to see data for different periods",
        "Explore city distribution and user demographics",
      ],
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Help & Support</h2>
        <p className="page-subtitle">
          Find answers to common questions and get the help you need.
        </p>
      </div>

      <div className="help-tabs">
        <button
          className={`tab-button ${activeTab === "faq" ? "active" : ""}`}
          onClick={() => setActiveTab("faq")}
        >
          FAQ
        </button>
        <button
          className={`tab-button ${activeTab === "guides" ? "active" : ""}`}
          onClick={() => setActiveTab("guides")}
        >
          User Guides
        </button>
        <button
          className={`tab-button ${activeTab === "contact" ? "active" : ""}`}
          onClick={() => setActiveTab("contact")}
        >
          Contact Support
        </button>
      </div>

      <div className="help-content">
        {activeTab === "faq" && (
          <div className="faq-section">
            <h3>Frequently Asked Questions</h3>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h4>{faq.question}</h4>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "guides" && (
          <div className="guides-section">
            <h3>User Guides</h3>
            <div className="guides-grid">
              {guides.map((guide, index) => (
                <div key={index} className="guide-card">
                  <h4>{guide.title}</h4>
                  <ol>
                    {guide.steps.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="contact-section">
            <h3>Contact Support</h3>
            <p>
              Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.
            </p>

            <form onSubmit={handleContactSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, subject: e.target.value })
                  }
                  placeholder="Brief subject"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  rows="6"
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  placeholder="Describe your issue or question in detail..."
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn primary">
                Submit request
              </button>
            </form>

            {supportMessage && (
              <div className={submitted ? "message success" : "message error"}>
                {supportMessage}
              </div>
            )}
            {ticketActionMessage && (
              <div className="message success">
                {ticketActionMessage}
              </div>
            )}
            {ticketError && (
              <div className="message error">
                {ticketError}
              </div>
            )}

            <div className="ticket-list-section">
              <h4>Your support requests</h4>
              {loadingTickets ? (
                <div className="loading">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="loading">No support requests submitted yet.</div>
              ) : (
                <div className="ticket-list">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="ticket-card">
                      <div className="ticket-header">
                        <strong>{ticket.subject}</strong>
                        <span className={`ticket-status ${ticket.status}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p>{ticket.message}</p>
                      {ticket.resolution && (
                        <p className="ticket-resolution">
                          <strong>Resolution:</strong> {ticket.resolution}
                        </p>
                      )}
                      <div className="ticket-meta">
                        <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="ticket-actions">
                        {ticket.status === "open" && (
                          <>
                            <button
                              className="btn secondary"
                              type="button"
                              onClick={() => handleTicketAction(ticket.id, "in-progress")}
                            >
                              Start progress
                            </button>
                            <button
                              className="btn success"
                              type="button"
                              onClick={() => handleTicketAction(ticket.id, "resolve")}
                            >
                              Mark resolved
                            </button>
                          </>
                        )}
                        {ticket.status === "in-progress" && (
                          <button
                            className="btn success"
                            type="button"
                            onClick={() => handleTicketAction(ticket.id, "resolve")}
                          >
                            Mark resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpPage;