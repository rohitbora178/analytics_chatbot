import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useDebounce } from "../hooks/useDebounce";

const UsersPage = () => {
  const { isAuthenticated, user: currentUser } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "",
    city: "",
  });
  const navigate = useNavigate();

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchUsers();
  }, [isAuthenticated, navigate]);

  // Fetch users when debounced search changes
  useEffect(() => {
    fetchUsers(debouncedSearch);
  }, [debouncedSearch]);

  const fetchUsers = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const url = query
        ? `http://localhost:5000/api/users?search=${encodeURIComponent(query)}`
        : "http://localhost:5000/api/users";
      const res = await axios.get(url);
      setUsers(res.data);
    } catch (error) {
      setMessage(error.response?.data?.error || "Unable to load users. Try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const handleEdit = useCallback((user) => {
    setSelectedUser(null);
    setEditingId(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      mobile: user.mobile || "",
      gender: user.gender || "",
      city: user.city,
    });
  }, []);

  const handleView = useCallback((user) => {
    setSelectedUser(user);
    setEditingId(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditForm({
      name: "",
      email: "",
      mobile: "",
      gender: "",
      city: "",
    });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    setActionLoading(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/users/${editingId}`, editForm);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingId ? { ...user, ...res.data.user } : user
        )
      );
      setMessage("User updated successfully.");
      setEditingId(null);
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not update user.");
    } finally {
      setActionLoading(false);
    }
  }, [editingId, editForm]);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      setUsers((prev) => prev.filter((item) => item.id !== id));
      setMessage("User deleted successfully.");
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not delete user.");
    } finally {
      setActionLoading(false);
    }
  }, []);

  const clearMessage = useCallback(() => {
    setMessage("");
  }, []);

  // Memoize filtered users to avoid unnecessary recalculations
  const filteredUsers = useMemo(() => users, [users]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;

  // Memoize paginated users
  const paginatedUsers = useMemo(
    () => filteredUsers.slice(startIdx, endIdx),
    [filteredUsers, startIdx, endIdx]
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  return (
    <div className="page-container">
      {actionLoading && (
        <div className="loader-overlay">
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Please wait...</p>
          </div>
        </div>
      )}

      <div className="page-header-flex">
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="page-subtitle">
            Review and manage registered users in one place.
          </p>
        </div>
      </div>

      <div className="search-panel">
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Search by name, username, email or city"
          className="form-input"
        />
      </div>

      {selectedUser && (
        <div className="modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Name:</label>
                <span>{selectedUser.name}</span>
              </div>
              <div className="detail-row">
                <label>Username:</label>
                <span>{selectedUser.username}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <label>Mobile:</label>
                <span>{selectedUser.mobile || "-"}</span>
              </div>
              <div className="detail-row">
                <label>Gender:</label>
                <span>{selectedUser.gender || "-"}</span>
              </div>
              <div className="detail-row">
                <label>City:</label>
                <span>{selectedUser.city}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn secondary" onClick={() => setSelectedUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="message success">
          {message}
          <button onClick={clearMessage} className="message-close">×</button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Gender</th>
                <th>City</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((item) => (
                <tr key={item.id}>
                  {editingId === item.id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="table-input"
                        />
                      </td>
                      <td>{item.username}</td>
                      <td>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className="table-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editForm.mobile}
                          onChange={(e) =>
                            setEditForm({ ...editForm, mobile: e.target.value })
                          }
                          className="table-input"
                        />
                      </td>
                      <td>
                        <select
                          value={editForm.gender}
                          onChange={(e) =>
                            setEditForm({ ...editForm, gender: e.target.value })
                          }
                          className="table-select"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) =>
                            setEditForm({ ...editForm, city: e.target.value })
                          }
                          className="table-input"
                        />
                      </td>
                      <td>
                        <button
                          className="btn small success"
                          onClick={handleSaveEdit}
                        >
                          Save
                        </button>
                        <button
                          className="btn small secondary"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{item.name}</td>
                      <td>{item.username}</td>
                      <td>{item.email}</td>
                      <td>{item.mobile || "-"}</td>
                      <td>{item.gender || "-"}</td>
                      <td>{item.city}</td>
                      <td style={{display:'flex' ,  gap:'0.5rem'}}>
                        <button
                          className="btn btn-outline small"
                          onClick={() => handleView(item)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-outline small"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline small danger"
                          onClick={() => handleDelete(item.id)}
                          disabled={item.id === currentUser.id}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIdx + 1} to {Math.min(endIdx, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="pagination-controls">
              <button
                className="btn small secondary"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${currentPage === pageNum ? "active" : ""}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    {totalPages > 6 && <span className="pagination-ellipsis">...</span>}
                    <button
                      className={`pagination-btn ${currentPage === totalPages ? "active" : ""}`}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                className="btn small secondary"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
