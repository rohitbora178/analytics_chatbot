/**
 * Frontend Input Validation Utilities
 */

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Username validation: 3-20 chars, alphanumeric and underscore only
export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Password validation: min 6 chars, at least 1 uppercase, 1 lowercase, 1 digit
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

// Name validation: 2-50 chars
export const validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

// Mobile validation: 10 digits
export const validateMobile = (mobile) => {
  const mobileRegex = /^\d{10}$/;
  return mobileRegex.test(mobile.replace(/\D/g, ""));
};

// City validation: 2-50 chars
export const validateCity = (city) => {
  return city && city.trim().length >= 2 && city.trim().length <= 50;
};

// Get password strength feedback
export const getPasswordFeedback = (password) => {
  const feedback = [];
  
  if (password.length < 6) feedback.push("At least 6 characters");
  if (!/[a-z]/.test(password)) feedback.push("One lowercase letter");
  if (!/[A-Z]/.test(password)) feedback.push("One uppercase letter");
  if (!/\d/.test(password)) feedback.push("One number");
  
  return feedback.length > 0 ? `Missing: ${feedback.join(", ")}` : "Strong password";
};

// Validate registration form
export const validateRegisterForm = (formData) => {
  const errors = {};

  if (!validateName(formData.name)) {
    errors.name = "Name must be 2-50 characters";
  }

  if (!validateUsername(formData.username)) {
    errors.username = "Username must be 3-20 chars (letters, numbers, underscore only)";
  }

  if (!validateEmail(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!validatePassword(formData.password)) {
    errors.password = "Password: min 6 chars, uppercase, lowercase, and number required";
  }

  if (!validateMobile(formData.mobile)) {
    errors.mobile = "Mobile number must be 10 digits";
  }

  if (!formData.gender || formData.gender === "") {
    errors.gender = "Please select a gender";
  }

  if (!validateCity(formData.city)) {
    errors.city = "City must be 2-50 characters";
  }

  return errors;
};

// Validate login form
export const validateLoginForm = (formData) => {
  const errors = {};

  if (!validateUsername(formData.username)) {
    errors.username = "Username required";
  }

  if (!formData.password || formData.password.length === 0) {
    errors.password = "Password required";
  }

  return errors;
};

// Validate user profile update
export const validateProfileUpdate = (formData) => {
  const errors = {};

  if (formData.name && !validateName(formData.name)) {
    errors.name = "Name must be 2-50 characters";
  }

  if (formData.email && !validateEmail(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (formData.mobile && !validateMobile(formData.mobile)) {
    errors.mobile = "Mobile number must be 10 digits";
  }

  if (formData.city && !validateCity(formData.city)) {
    errors.city = "City must be 2-50 characters";
  }

  return errors;
};
