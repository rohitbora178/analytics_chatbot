import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginSuccess } from "../store/authSlice";

const ProfilePage = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    city: "",
    gender: "",
  });
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user) {
      setProfile({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        city: user.city,
        gender: user.gender,
      });
    }
  }, [isAuthenticated, navigate, user]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/${user.id}`,
        profile
      );

      dispatch(loginSuccess(res.data.user));
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(
        error.response?.data?.error || "Unable to update profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-flex">
        <div>
          <h2 className="page-title">My Profile</h2>
          <p className="page-subtitle">
            Manage your account information and keep your profile up to date.
          </p>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={profile.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mobile">
              Phone number
            </label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              value={profile.mobile}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="city">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={profile.city}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn" disabled={isSaving}>
          {isSaving ? "Saving profile..." : "Save changes"}
        </button>
      </form>

      {message && <div className="message success">{message}</div>}
    </div>
  );
};

export default ProfilePage;
