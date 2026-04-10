import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { validateRegisterForm, getPasswordFeedback } from "../utils/validation";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    mobile: "",
    gender: "",
    city: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    
    // Show password feedback
    if (name === "password") {
      setPasswordFeedback(getPasswordFeedback(value));
    }
    
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateRegisterForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage("Please fix the errors below");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      setMessage(res.data.message + ". Redirecting to login...");
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        mobile: "",
        gender: "",
        city: "",
      });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.error || "Registration failed. Try again.");
      } else {
        setMessage("Unable to connect to server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-flex">
        <div>
          <h2 className="page-title">Register</h2>
          <p className="page-subtitle">
            Create your account to access the dashboard and user management features.
          </p>
        </div>
      </div>

      {loading && (
        <div className="loader-overlay">
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Creating your account...</p>
          </div>
        </div>
      )}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full name
              <span className="required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? "input-error" : ""}`}
              placeholder="John Doe"
              required
              disabled={loading}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
              <span className="required">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? "input-error" : ""}`}
              placeholder="john_doe123"
              required
              disabled={loading}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
              <span className="required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? "input-error" : ""}`}
              placeholder="john@example.com"
              required
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
              <span className="required">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? "input-error" : ""}`}
              placeholder="Min 6 chars, Upper, Lower, Number"
              required
              disabled={loading}
            />
            {passwordFeedback && (
              <span className={`feedback-text ${formData.password.length > 0 && passwordFeedback === "Strong password" ? "success" : "warning"}`}>
                {passwordFeedback}
              </span>
            )}
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="mobile">
              Mobile
              <span className="required">*</span>
            </label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              className={`form-input ${errors.mobile ? "input-error" : ""}`}
              placeholder="10-digit number"
              required
              disabled={loading}
            />
            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="gender">
              Gender
              <span className="required">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`form-select ${errors.gender ? "input-error" : ""}`}
              required
              disabled={loading}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <span className="error-text">{errors.gender}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="city">
              City
              <span className="required">*</span>
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              className={`form-input ${errors.city ? "input-error" : ""}`}
              placeholder="Your city"
              required
              disabled={loading}
            />
            {errors.city && <span className="error-text">{errors.city}</span>}
          </div>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {message && (
        <div className={`message ${message.includes("failed") || message.includes("error") || message.includes("Unable") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      <p className="page-note">
        Already registered? <Link to="/login">Log in here</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
