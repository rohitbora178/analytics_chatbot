import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const AnalyticsPage = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadAnalytics();
  }, [isAuthenticated, navigate, timeRange]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, activityRes] = await Promise.all([
        axios.get("http://localhost:5000/api/users/stats"),
        axios.get("http://localhost:5000/api/users"),
        axios.get("http://localhost:5000/api/support/activity"),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setActivity(activityRes.data.slice(0, 5));
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFilteredUsers = useCallback(() => {
    if (timeRange === "all") return users;

    const now = new Date();
    const filterDate = new Date();

    switch (timeRange) {
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return users;
    }

    return users.filter((user) => new Date(user.createdAt || Date.now()) > filterDate);
  }, [timeRange, users]);

  // Memoize filtered users calculation
  const filteredUsers = useMemo(() => getFilteredUsers(), [getFilteredUsers]);

  const genderCount = useMemo(() => {
    return stats ? Object.values(stats.genders).reduce((sum, value) => sum + value, 0) : 0;
  }, [stats]);

  // Memoize processed city data for chart
  const citiesData = useMemo(() => {
    return stats
      ? Object.entries(stats.cities)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
      : [];
  }, [stats]);

  // Memoize recent users
  const recentUsersList = useMemo(() => stats?.recentUsers || [], [stats]);

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
          <h2 className="page-title">Analytics Dashboard</h2>
          <p className="page-subtitle">
            Comprehensive insights into user activity and platform metrics.
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="form-select"
        >
          <option value="all">All time</option>
          <option value="week">Last week</option>
          <option value="month">Last month</option>
          <option value="year">Last year</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : (
        <>
          <div className="analytics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <h3>Total Users</h3>
                <span className="metric-icon">👥</span>
              </div>
              <div className="metric-value">{stats?.totalUsers || 0}</div>
              <div className="metric-change positive">
                +{filteredUsers.length} in selected period
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <h3>Cities Covered</h3>
                <span className="metric-icon">🏙️</span>
              </div>
              <div className="metric-value">
                {stats ? Object.keys(stats.cities).length : 0}
              </div>
              <div className="metric-change">
                {stats ? Object.keys(stats.cities).slice(0, 3).join(", ") : ""}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <h3>Gender Distribution</h3>
                <span className="metric-icon">📊</span>
              </div>
              <div className="metric-value">{genderCount}</div>
              <div className="metric-breakdown">
                {stats &&
                  Object.entries(stats.genders).map(([gender, count]) => (
                    <div key={gender} className="breakdown-item">
                      <span>{gender}</span>
                      <span>{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <h3>Recent Activity</h3>
                <span className="metric-icon">⚡</span>
              </div>
              <div className="metric-value">{stats?.recentUsers?.length || 0}</div>
              <div className="metric-change">New signups</div>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-card">
              <h3>City Distribution</h3>
              <div className="chart-placeholder">
                {stats ? (
                  <div className="city-chart">
                    {citiesData.map(([city, count]) => (
                        <div key={city} className="chart-bar">
                          <div className="bar-label">{city}</div>
                          <div className="bar-container">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${(count / Math.max(...Object.values(stats.cities))) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <div className="bar-value">{count}</div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="loading">No data available</div>
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3>Recent Users</h3>
              <div className="recent-users-list">
                {recentUsersList?.length ? (
                  recentUsersList.map((user) => (
                    <div key={user.id} className="recent-user-item">
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <strong>{user.name}</strong>
                        <p>{user.username}</p>
                      </div>
                      <div className="user-location">{user.city}</div>
                    </div>
                  ))
                ) : (
                  <div className="loading">No recent users</div>
                )}
              </div>
            </div>
          </div>

          <div className="activity-feed-card">
            <h3>Recent System Events</h3>
            {activity.length === 0 ? (
              <div className="loading">No recent activity recorded.</div>
            ) : (
              <div className="activity-feed">
                {activity.map((event) => (
                  <div key={event.id} className="activity-feed-item">
                    <div>
                      <strong>{event.title}</strong>
                      <p>{event.description}</p>
                    </div>
                    <span>{new Date(event.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;