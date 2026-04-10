import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginStart, loginSuccess, loginFailure, clearError } from "../store/authSlice";
import { validateLoginForm } from "../utils/validation";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateLoginForm(credentials);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    dispatch(loginStart());

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", credentials);
      dispatch(loginSuccess(res.data.user));
      navigate("/home");
    } catch (error) {
      if (error.response) {
        dispatch(loginFailure(error.response.data.error || "Login failed. Try again."));
      } else {
        dispatch(loginFailure("Unable to connect to server. Please try again."));
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-flex">
        <div>
          <h2 className="page-title">Login</h2>
          <p className="page-subtitle">
            Access your dashboard, view users, and manage your profile.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="loader-overlay">
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Logging in...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="username">
            Username
            <span className="required">*</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Enter your username"
            value={credentials.username}
            onChange={handleChange}
            className={`form-input ${errors.username ? "input-error" : ""}`}
            required
            disabled={isLoading}
          />
          {errors.username && <span className="error-text">{errors.username}</span>}
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
            placeholder="Enter your password"
            value={credentials.password}
            onChange={handleChange}
            className={`form-input ${errors.password ? "input-error" : ""}`}
            required
            disabled={isLoading}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      {error && <div className="message error">{error}</div>}

      <p className="page-note">
        Don't have an account? <Link to="/">Register now</Link>
      </p>
    </div>
  );
};

export default LoginPage;
