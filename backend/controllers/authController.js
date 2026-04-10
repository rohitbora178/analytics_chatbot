const { readDb, writeDb } = require("../utils/db");
const { hashPassword, verifyPassword } = require("../utils/security");
const { validateRegisterData, validateLoginData, sanitizeString } = require("../utils/validation");

async function register(req, res) {
  try {
    // Validate input
    const errors = validateRegisterData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] });
    }

    const { name, username, email, password, mobile, gender, city } = req.body;

    const db = await readDb();
    db.users = db.users || [];

    // Check if user already exists
    const userExists = db.users.some(
      (user) => user.email.toLowerCase() === email.toLowerCase() || 
                 user.username.toLowerCase() === username.toLowerCase()
    );

    if (userExists) {
      return res.status(409).json({ error: "Email or username already registered." });
    }

    const maxId = db.users.length > 0 ? Math.max(...db.users.map((u) => u.id || 0)) : 0;

    // Hash password
    const hashedPassword = hashPassword(password);

    const newUser = {
      id: maxId + 1,
      name: sanitizeString(name),
      username: sanitizeString(username),
      email: sanitizeString(email).toLowerCase(),
      password: hashedPassword,
      mobile: sanitizeString(mobile),
      gender: sanitizeString(gender).toLowerCase(),
      city: sanitizeString(city),
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    await writeDb(db);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        mobile: newUser.mobile,
        gender: newUser.gender,
        city: newUser.city,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Unable to register user." });
  }
}

async function login(req, res) {
  try {
    // Validate input
    const errors = validateLoginData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] });
    }

    const { username, password } = req.body;

    const db = await readDb();
    const user = (db.users || []).find((u) => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Verify password - handle both hashed and plain text passwords for backward compatibility
    let isValidPassword = false;
    
    if (user.password.includes(":")) {
      // Password is hashed (new format: salt:hash)
      isValidPassword = verifyPassword(password, user.password);
    } else {
      // Password is plain text (old format for existing db.json data)
      isValidPassword = password === user.password;
    }

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender,
        city: user.city,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Unable to log in." });
  }
}

module.exports = {
  register,
  login,
};
