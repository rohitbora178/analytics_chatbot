const fs = require("fs").promises;
const path = require("path");

function countByGender(users, gender) {
  return users.filter(
    (user) => user.gender && user.gender.toLowerCase() === gender.toLowerCase(),
  ).length;
}

function countByCity(users, city) {
  return users.filter(
    (user) => user.city && user.city.toLowerCase() === city.toLowerCase(),
  ).length;
}

function countSignupsThisMonth(users) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return users.filter((user) => {
    if (!user.createdAt) return false;
    const created = new Date(user.createdAt);
    return created >= startOfMonth;
  }).length;
}

function findUserByName(users, name) {
  const lowerName = name.toLowerCase();
  return users.find(
    (user) =>
      (user.name && user.name.toLowerCase().includes(lowerName)) ||
      (user.username && user.username.toLowerCase().includes(lowerName)),
  );
}

function formatUserInfo(user) {
  return `Name: ${user.name || "N/A"}, Username: ${user.username || "N/A"}, Email: ${user.email || "N/A"}, Phone: ${user.mobile || "N/A"}, City: ${user.city || "N/A"}, Gender: ${user.gender || "N/A"}`;
}

function getAllCities(users) {
  const cities = new Set();
  users.forEach((user) => {
    if (user.city) cities.add(user.city);
  });
  return Array.from(cities);
}

function parseQuery(query) {
  const normalized = query.trim().toLowerCase();

  if (normalized.includes("male")) {
    return { type: "gender", gender: "male" };
  }

  if (normalized.includes("female")) {
    return { type: "gender", gender: "female" };
  }

  if (normalized.includes("signed up this month") || normalized.includes("joined this month") || normalized.includes("signup this month") || normalized.includes("registered this month")) {
    return { type: "signupThisMonth" };
  }

  if (normalized.includes("which city") || normalized.includes("cities in india") || normalized.includes("all cities")) {
    return { type: "allCities" };
  }

  if (normalized.includes("from ")) {
    const parts = normalized.split("from ");
    if (parts.length > 1) {
      const city = parts[1].replace(/[?\s.!]+$/g, "").trim();
      if (city) {
        return { type: "cityCount", city };
      }
    }
  }

  if (normalized.includes("user ") || normalized.includes("find ") || normalized.includes("info for ") || normalized.includes("details for ")) {
    const nameMatch = normalized.match(/(?:user|find|info for|details for)\s+(.+?)(?:\?|$)/);
    if (nameMatch && nameMatch[1]) {
      return { type: "userLookup", name: nameMatch[1].trim() };
    }
  }

  if (normalized.includes("phone") || normalized.includes("mobile")) {
    const nameMatch = normalized.match(/(?:phone|mobile)(?:\s+(?:for|of))?\s+(.+?)(?:\?|$)/);
    if (nameMatch && nameMatch[1]) {
      return { type: "userPhone", name: nameMatch[1].trim() };
    }
  }

  if (normalized.includes("email")) {
    const nameMatch = normalized.match(/email(?:\s+(?:for|of))?\s+(.+?)(?:\?|$)/);
    if (nameMatch && nameMatch[1]) {
      return { type: "userEmail", name: nameMatch[1].trim() };
    }
  }

  if (normalized.includes("total users") || normalized.includes("users total") || normalized.includes("total number of users") || normalized.includes("how many users are there") || normalized === "how many users") {
    return { type: "total" };
  }

  if (normalized.includes("how many users")) {
    return { type: "total" };
  }

  return { type: "unsupported" };
}

exports.handleChatbotQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const dbPath = path.join(__dirname, "../db.json");
    const data = JSON.parse(await fs.readFile(dbPath, "utf8"));
    const users = Array.isArray(data.users) ? data.users : [];
    const parsed = parseQuery(query);

    let answer;
    switch (parsed.type) {
      case "total":
        answer = `There are ${users.length} total users in the dataset.`;
        break;
      case "gender":
        answer = `There are ${countByGender(users, parsed.gender)} ${parsed.gender} users in the dataset.`;
        break;
      case "signupThisMonth":
        answer = `There are ${countSignupsThisMonth(users)} users who signed up this month.`;
        break;
      case "cityCount":
        const cityCount = countByCity(users, parsed.city);
        answer = `There are ${cityCount} users from ${parsed.city}.`;
        break;
      case "allCities":
        const cities = getAllCities(users);
        answer = `Cities in India with users: ${cities.join(", ")}`;
        break;
      case "userLookup":
        const user = findUserByName(users, parsed.name);
        if (user) {
          answer = `User info: ${formatUserInfo(user)}`;
        } else {
          answer = `No user found with name or username containing "${parsed.name}".`;
        }
        break;
      case "userPhone":
        const userPhone = findUserByName(users, parsed.name);
        if (userPhone) {
          answer = `Phone number for ${userPhone.name}: ${userPhone.mobile || "N/A"}`;
        } else {
          answer = `No user found with name or username containing "${parsed.name}".`;
        }
        break;
      case "userEmail":
        const userEmail = findUserByName(users, parsed.name);
        if (userEmail) {
          answer = `Email for ${userEmail.name}: ${userEmail.email || "N/A"}`;
        } else {
          answer = `No user found with name or username containing "${parsed.name}".`;
        }
        break;
      default:
        return res.status(400).json({
          error: "I can answer questions like: total users, male/female counts, users from [city], which cities, user info for [name], phone for [name], email for [name], or signups this month.",
        });
    }

    res.json({ answer });
  } catch (error) {
    console.error("Chatbot controller error:", error);
    res.status(500).json({ error: "Failed to process query." });
  }
};
