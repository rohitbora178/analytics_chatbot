import Chatbot from "../components/Chatbot";
import "../styles/ChatbotPage.css";

export default function ChatbotPage() {
  return (
    <div className="chatbot-page">
      <div className="chatbot-page-container">
        <div className="chatbot-page-header">
          <h1>Analytics Chatbot</h1>
          <p>Ask me anything about your user data!</p>
        </div>
        <Chatbot />
        <div className="chatbot-page-info">
          <h3>💡 What can I help you with?</h3>
          <ul>
            <li>📊 Total users count</li>
            <li>👥 Male/Female user counts</li>
            <li>🏙️ Users from specific cities</li>
            <li>👤 Individual user information (name, email, phone)</li>
            <li>📅 Users who signed up this month</li>
            <li>🗺️ List all cities with users</li>
          </ul>

          <h3>🎯 Example Questions</h3>
          <div className="example-questions">
            <div className="example-card">
              <code>"How many users are male?"</code>
            </div>
            <div className="example-card">
              <code>"How many users are from Pune?"</code>
            </div>
            <div className="example-card">
              <code>"User Rohit"</code>
            </div>
            <div className="example-card">
              <code>"Phone for Rohit"</code>
            </div>
            <div className="example-card">
              <code>"Which cities?"</code>
            </div>
            <div className="example-card">
              <code>"Total users"</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
