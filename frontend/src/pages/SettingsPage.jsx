import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const SettingsPage = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [settings, setSettings] = useState({
    theme: "light",
    notifications: true,
    language: "en",
    emailUpdates: true,
    profileVisibility: "public",
  });
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadSettings = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/settings/${user.id}`);
        setSettings(res.data);
      } catch (error) {
        setMessage("Unable to load settings. Using defaults.");
      }
    };

    if (user) {
      loadSettings();
    }
  }, [isAuthenticated, navigate, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
    setMessage("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await axios.put(
        `http://localhost:5000/api/settings/${user.id}`,
        settings
      );
      setSettings(res.data.settings);
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      theme: "light",
      notifications: true,
      language: "en",
      emailUpdates: true,
      profileVisibility: "public",
    });
    setMessage("Settings reset to defaults.");
  };

  return (
    <div className="page-container">
      <div className="page-header-flex">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">
            Customize your experience and manage your account preferences.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="settings-section">
          <h3>Appearance</h3>
          <div className="setting-item">
            <label className="setting-label">Theme</label>
            <select
              name="theme"
              value={settings.theme}
              onChange={handleChange}
              className="form-select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          <div className="setting-item">
            <label className="setting-label">Language</label>
            <select
              name="language"
              value={settings.language}
              onChange={handleChange}
              className="form-select"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </section>

        <section className="settings-section">
          <h3>Notifications</h3>
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
              />
              Push notifications
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                name="emailUpdates"
                checked={settings.emailUpdates}
                onChange={handleChange}
              />
              Email updates
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h3>Privacy</h3>
          <div className="setting-item">
            <label className="setting-label">Profile visibility</label>
            <select
              name="profileVisibility"
              value={settings.profileVisibility}
              onChange={handleChange}
              className="form-select"
            >
              <option value="public">Public</option>
              <option value="friends">Friends only</option>
              <option value="private">Private</option>
            </select>
          </div>
        </section>

        <section className="settings-section">
          <h3>Account Actions</h3>
          <div className="setting-actions">
            <button className="btn btn-outline" onClick={handleReset}>
              Reset to defaults
            </button>
            <button className="btn" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save settings"}
            </button>
          </div>
          {message && <div className="message success">{message}</div>}
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;