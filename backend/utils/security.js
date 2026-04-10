/**
 * Password Security Utilities (using Node.js crypto module)
 * For production, use bcrypt or argon2
 */

const crypto = require("crypto");

// Simple password hashing with salt
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
};

// Verify password against hash
const verifyPassword = (password, hash) => {
  const [salt, originalHash] = hash.split(":");
  const verify = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return verify === originalHash;
};

module.exports = {
  hashPassword,
  verifyPassword,
};
