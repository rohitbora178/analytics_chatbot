import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/authSlice";

const HomePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadStats();
    loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/users/stats");
      setStats(res.data);
    } catch (error) {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActivity = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/support/activity");
      setActivity(res.data.slice(0, 5));
    } catch (error) {
      setActivity([]);
    }
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/login");
  }, [dispatch, navigate]);

  // Memoize processed stats data
  const genderStats = useMemo(() => {
    if (!stats) return "--";
    return Object.entries(stats.genders)
      .map(([gender, count]) => `${gender}: ${count}`)
      .join(" • ");
  }, [stats]);

  // Memoize recent users
  const recentUsers = useMemo(() => stats?.recentUsers || [], [stats]);

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="loading">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-flex">
        <div>
          <h2 className="page-title">Welcome back, {user.name}</h2>
          <p className="page-subtitle">
            Your dashboard gives you live user insights, quick management tools, and a polished admin experience.
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card primary">
          <span className="stat-label">Total users</span>
          <span className="stat-value">{stats?.totalUsers ?? "--"}</span>
        </div>
        <div className="stat-card accent">
          <span className="stat-label">Cities active</span>
          <span className="stat-value">{stats ? Object.keys(stats.cities).length : "--"}</span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-label">Gender mix</span>
          <span className="stat-value">
            {genderStats}
          </span>
        </div>
      </div>

      <div className="home-sections" style={{marginTop:'20px'}}> 
        <section className="overview-card">
          <div className="section-header">
            <h3>Quick actions</h3>
            <p>Manage your account and the user directory instantly.</p>
          </div>
          <div className="summary-actions">
            <button className="btn btn-outline" onClick={() => navigate("/profile")}>Edit profile</button>
            <button className="btn btn-outline" onClick={() => navigate("/users")}>Manage users</button>
            <button className="btn btn-outline" onClick={loadStats}>Refresh stats</button>
          </div>
        </section>

        <section className="recent-card">
          <div className="section-header">
            <h3>Recent signups</h3>
            <p>Latest users added to your platform.</p>
          </div>
          {loading ? (
            <div className="loading">Loading recent users...</div>
          ) : (
            <div className="recent-list">
              {recentUsers && recentUsers.length ? (
                stats.recentUsers.map((item) => (
                  <div key={item.id} className="recent-item">
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.username}</p>
                    </div>
                    <span>{item.city}</span>
                  </div>
                ))
              ) : (
                <div className="loading">No recent users yet.</div>
              )}
            </div>
          )}
        </section>

        <section className="activity-card">
          <div className="section-header">
            <h3>Activity feed</h3>
            <p>See the latest events from the system.</p>
          </div>
          {activity.length === 0 ? (
            <div className="loading">No recent activity available.</div>
          ) : (
            <div className="activity-list">
              {activity.map((event) => (
                <div key={event.id} className="activity-item">
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.description}</p>
                  </div>
                  <span>{new Date(event.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;