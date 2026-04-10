/**
 * Input Validation Utilities
 */

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 100;
};

// Username validation: 3-20 chars, alphanumeric and underscore only
const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Password validation: min 6 chars, at least 1 uppercase, 1 lowercase, 1 digit
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password) && password.length <= 128;
};

// Name validation: 2-50 chars, letters and common punctuation
const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name);
};

// Mobile validation: 10 digits
const validateMobile = (mobile) => {
  const mobileRegex = /^\d{10}$/;
  return mobileRegex.test(mobile.replace(/\D/g, ""));
};

// Gender validation
const validateGender = (gender) => {
  const validGenders = ["male", "female", "other"];
  return validGenders.includes(String(gender).toLowerCase());
};

// City validation: 2-50 chars
const validateCity = (city) => {
  return typeof city === "string" && city.trim().length >= 2 && city.trim().length <= 50;
};

// String sanitization: trim and remove potentially harmful content
const sanitizeString = (str) => {
  if (typeof str !== "string") return "";
  return str
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .substring(0, 500); // Limit length
};

// Validate registration data
const validateRegisterData = (data) => {
  const errors = [];

  if (!data.name || !validateName(sanitizeString(data.name))) {
    errors.push("Name must be 2-50 characters with letters, hyphens, and apostrophes only.");
  }

  if (!data.username || !validateUsername(sanitizeString(data.username))) {
    errors.push("Username must be 3-20 characters with letters, numbers, and underscores only.");
  }

  if (!data.email || !validateEmail(sanitizeString(data.email))) {
    errors.push("Please provide a valid email address.");
  }

  if (!data.password || !validatePassword(data.password)) {
    errors.push("Password must be at least 6 characters with uppercase, lowercase, and a number.");
  }

  if (!data.mobile || !validateMobile(data.mobile)) {
    errors.push("Mobile number must be 10 digits.");
  }

  if (!data.gender || !validateGender(data.gender)) {
    errors.push("Please select a valid gender.");
  }

  if (!data.city || !validateCity(sanitizeString(data.city))) {
    errors.push("City must be 2-50 characters.");
  }

  return errors;
};

// Validate login data
const validateLoginData = (data) => {
  const errors = [];

  if (!data.username || !validateUsername(sanitizeString(data.username))) {
    errors.push("Invalid username format.");
  }

  if (!data.password || data.password.length === 0) {
    errors.push("Password is required.");
  }

  return errors;
};

// Validate update user data
const validateUpdateUserData = (data) => {
  const errors = [];

  if (data.name !== undefined && data.name !== "" && !validateName(sanitizeString(data.name))) {
    errors.push("Name must be 2-50 characters.");
  }

  if (data.email !== undefined && data.email !== "" && !validateEmail(sanitizeString(data.email))) {
    errors.push("Invalid email format.");
  }

  if (data.mobile !== undefined && data.mobile !== "" && !validateMobile(data.mobile)) {
    errors.push("Mobile number must be 10 digits.");
  }

  if (data.gender !== undefined && data.gender !== "" && !validateGender(data.gender)) {
    errors.push("Invalid gender.");
  }

  if (data.city !== undefined && data.city !== "" && !validateCity(sanitizeString(data.city))) {
    errors.push("City must be 2-50 characters.");
  }

  return errors;
};

// Validate support ticket data
const validateTicketData = (data) => {
  const errors = [];

  if (!data.subject || sanitizeString(data.subject).length < 5 || sanitizeString(data.subject).length > 100) {
    errors.push("Subject must be 5-100 characters.");
  }

  if (!data.description || sanitizeString(data.description).length < 10 || sanitizeString(data.description).length > 2000) {
    errors.push("Description must be 10-2000 characters.");
  }

  if (data.priority && !["low", "medium", "high"].includes(String(data.priority).toLowerCase())) {
    errors.push("Invalid priority level.");
  }

  return errors;
};

module.exports = {
  validateEmail,
  validateUsername,
  validatePassword,
  validateName,
  validateMobile,
  validateGender,
  validateCity,
  sanitizeString,
  validateRegisterData,
  validateLoginData,
  validateUpdateUserData,
  validateTicketData,
};
