import { useState } from "react";
import "../styles/Chatbot.css";

// Prompt Engineering Helper Functions
const normalizeQuery = (query) => {
  return query.trim().toLowerCase();
};

const detectIntent = (query) => {
  const normalized = normalizeQuery(query);

  // Count queries
  if (
    normalized.includes("how many") ||
    normalized.includes("count") ||
    normalized.includes("total") ||
    normalized.includes("number of")
  ) {
    return "count";
  }

  // Lookup queries
  if (
    normalized.includes("user") ||
    normalized.includes("info") ||
    normalized.includes("details") ||
    normalized.includes("find")
  ) {
    return "lookup";
  }

  // List queries
  if (
    normalized.includes("list") ||
    normalized.includes("all") ||
    normalized.includes("which")
  ) {
    return "list";
  }

  // Contact queries
  if (
    normalized.includes("phone") ||
    normalized.includes("mobile") ||
    normalized.includes("email") ||
    normalized.includes("contact")
  ) {
    return "contact";
  }

  return "unclear";
};

const engineerPrompt = (userQuery) => {
  const intent = detectIntent(userQuery);
  const normalized = normalizeQuery(userQuery);

  // If query is just a name or vague, improve it
  if (intent === "lookup") {
    if (!normalized.includes("user") && !normalized.includes("info")) {
      return `User ${userQuery}`;
    }
  }

  if (intent === "contact") {
    if (normalized.includes("phone") || normalized.includes("mobile")) {
      const name = userQuery.replace(/phone|mobile|number|for|of|\?/gi, "").trim();
      if (name && name.length > 2) {
        return `Phone for ${name}`;
      }
    }
    if (normalized.includes("email")) {
      const name = userQuery.replace(/email|for|of|\?/gi, "").trim();
      if (name && name.length > 2) {
        return `Email for ${name}`;
      }
    }
  }

  if (intent === "count") {
    if (normalized.includes("male")) {
      return "How many users are male?";
    }
    if (normalized.includes("female")) {
      return "How many users are female?";
    }
    if (normalized.includes("pune") || normalized.includes("mumbai") || normalized.includes("delhi")) {
      const city = userQuery.match(/\b(pune|mumbai|delhi|bangalore|goa|hyderabad|kolkata|chennai|ahmedabad)\b/i);
      if (city) {
        return `How many users are from ${city[0]}?`;
      }
    }
    if (normalized.includes("total") || normalized.includes("all")) {
      return "Total users";
    }
  }

  if (intent === "list") {
    if (normalized.includes("city") || normalized.includes("location")) {
      return "Which cities?";
    }
  }

  // If still unclear, return original but cleaned
  return userQuery.trim();
};

const isTooVague = (query) => {
  const normalized = normalizeQuery(query);
  return normalized.length < 3 || normalized.split(" ").length < 2;
};

const getSuggestions = (query) => {
  const normalized = normalizeQuery(query);

  if (normalized.includes("user") || normalized.includes("person")) {
    return [
      "Try: User Rohit",
      "Try: Phone for Rohit",
      "Try: Email for Rohit",
    ];
  }

  if (normalized.includes("count") || normalized.includes("how")) {
    return [
      "Try: How many users are male?",
      "Try: How many users are from Pune?",
      "Try: Total users",
    ];
  }

  if (normalized.includes("city") || normalized.includes("location")) {
    return [
      "Try: How many users are from Pune?",
      "Try: Which cities?",
    ];
  }

  return [
    "Try: Total users",
    "Try: How many users are male?",
    "Try: User Rohit",
  ];
};

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your analytics assistant. Ask me questions like: 'How many users are male?' Or: 'User Rohit'",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Check if query is too vague
    if (isTooVague(inputValue)) {
      const suggestions = getSuggestions(inputValue);
      const errorMessage = {
        id: messages.length + 1,
        text: `Your question is too vague. ${suggestions.join(" | ")}`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setInputValue("");
      return;
    }

    // Engineer the prompt
    const engineeredQuery = engineerPrompt(inputValue);

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: engineeredQuery }),
      });

      const data = await response.json();
      const botMessage = {
        id: messages.length + 2,
        text: data.answer || data.error,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: "Error connecting to backend. Make sure the server is running.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>📊 Analytics Chatbot</h2>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-bubble">
              <p>{msg.text}</p>
              <span className="message-time">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="message-bubble">
              <p className="typing">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="chatbot-input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me anything..."
          disabled={loading}
          className="chatbot-input"
        />
        <button type="submit" disabled={loading} className="chatbot-send-btn">
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
