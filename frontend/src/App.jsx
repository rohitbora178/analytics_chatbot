import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import UsersPage from "./pages/UsersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import HelpPage from "./pages/HelpPage";
import SettingsPage from "./pages/SettingsPage";
import ChatbotPage from "./pages/ChatbotPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { logout } from "./store/authSlice";

const AppContent = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    console.log("Mobile menu closed");
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Only redirect to home if user is on login/register pages
      const currentPath = window.location.pathname;
      if (currentPath === "/" || currentPath === "/login") {
        navigate("/home");
      }
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="app-container">
      <nav className="nav">
        {isAuthenticated && (
          <button 
            className="hamburger-menu"
            onClick={() => mobileMenuOpen ? closeMobileMenu() : setMobileMenuOpen(true)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}
        
        <div className={`nav-drawer-overlay ${mobileMenuOpen && isAuthenticated ? 'open' : ''}`} onClick={closeMobileMenu}></div>
        
        <div className={`nav-links-container ${mobileMenuOpen && isAuthenticated ? 'open' : ''}`} onClick={closeMobileMenu}>
          {!isAuthenticated ? (
            <>
              <Link to="/" className="nav-link" onClick={(e) => { e.stopPropagation(); closeMobileMenu(); }}>
                Register
              </Link>
              <Link to="/login" className="nav-link" onClick={(e) => { e.stopPropagation(); closeMobileMenu(); }}>
                Login
              </Link>
            </>
          ) : (
            <>
              <Link to="/home" className="nav-link" onClick={(e) => { e.stopPropagation(); closeMobileMenu(); }}>
                Dashboard
              </Link>
              <Link to="/profile" className="nav-link" onClick={(e) => { e.stopPropagation(); closeMobileMenu(); }}>
                Profile
              </Link>
              <Link to="/users" className="nav-link" onClick={(e) => { e.stopPropagation(); closeMobileMenu(); }}>
                Users
              </Link>
              <Link to="/analytics" className="nav-link" onClick={(e) => { e.stopPropagation(); closeMobileMenu(); }}>
                Analytics
              </Link>
              <Link to="/chatbot" className="nav-link" onClick={(e) => { e.stopPropagation(); closeMobileMenu(); }}>
                🤖 Chatbot
              </Link>
              <Link to="/settings" className="nav-link" onClick={(e) => { e.stopPropagation(); closeMobileMenu(); }}>
                Settings
              </Link>
              <Link to="/help" className="nav-link" onClick={(e) => { e.stopPropagation(); closeMobileMenu(); }}>
                Help
              </Link>
              <button className="nav-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <ChatbotPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <HelpPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <Router>
      <AppContent />
    </Router>
  </ErrorBoundary>
);

export default App;
