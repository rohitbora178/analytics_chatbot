const { readDb, writeDb } = require("../utils/db");
const { validateUpdateUserData, sanitizeString } = require("../utils/validation");

async function getAllUsers(req, res) {
  try {
    const db = await readDb();
    const users = db.users || [];
    const search = req.query.search || "";

    // Return users without password field
    const sanitizedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      mobile: u.mobile,
      gender: u.gender,
      city: u.city,
      createdAt: u.createdAt,
    }));

    if (search && search.trim().length > 0) {
      const normalized = sanitizeString(search).toLowerCase();
      const filtered = sanitizedUsers.filter((user) =>
        user.name.toLowerCase().includes(normalized) ||
        user.username.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized) ||
        user.city.toLowerCase().includes(normalized)
      );
      return res.json(filtered);
    }

    res.json(sanitizedUsers);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Unable to fetch users." });
  }
}

async function getUserById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id) || id < 1) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const db = await readDb();
    const user = (db.users || []).find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Unable to fetch the user." });
  }
}

async function updateUser(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id) || id < 1) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    // Validate input
    const errors = validateUpdateUserData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] });
    }

    const { name, email, mobile, gender, city } = req.body;

    const db = await readDb();
    const userIndex = (db.users || []).findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if email is already taken by another user
    if (email && email !== db.users[userIndex].email) {
      const emailExists = db.users.some(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== id
      );
      if (emailExists) {
        return res.status(409).json({ error: "Email already in use." });
      }
    }

    const updatedUser = {
      ...db.users[userIndex],
      name: name ? sanitizeString(name) : db.users[userIndex].name,
      email: email ? sanitizeString(email).toLowerCase() : db.users[userIndex].email,
      mobile: mobile ? sanitizeString(mobile) : db.users[userIndex].mobile,
      gender: gender ? sanitizeString(gender).toLowerCase() : db.users[userIndex].gender,
      city: city ? sanitizeString(city) : db.users[userIndex].city,
    };

    db.users[userIndex] = updatedUser;
    await writeDb(db);

    // Return without password
    const { password, ...userWithoutPassword } = updatedUser;
    res.json({ message: "Profile updated successfully.", user: userWithoutPassword });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Unable to update user." });
  }
}

async function deleteUser(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id) || id < 1) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const db = await readDb();
    db.users = db.users || [];

    const initialLength = db.users.length;
    db.users = db.users.filter((user) => user.id !== id);

    if (db.users.length === initialLength) {
      return res.status(404).json({ error: "User not found." });
    }

    await writeDb(db);
    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Unable to delete user." });
  }
}

async function getStats(req, res) {
  try {
    const db = await readDb();
    const users = db.users || [];
    const totalUsers = users.length;
    const cities = {};
    const genders = {};

    users.forEach((user) => {
      cities[user.city] = (cities[user.city] || 0) + 1;
      genders[user.gender] = (genders[user.gender] || 0) + 1;
    });

    const recentUsers = users
      .slice()
      .sort((a, b) => b.id - a.id)
      .slice(0, 5)
      .map((user) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        city: user.city,
      }));

    res.json({ totalUsers, cities, genders, recentUsers });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Unable to fetch user stats." });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getStats,
};