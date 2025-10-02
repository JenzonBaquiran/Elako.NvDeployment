import React, { useState, useEffect } from "react";
import { TextField, Button, IconButton, InputAdornment, Alert, CircularProgress } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "../components/NotificationProvider";
import { useAuth } from "../contexts/AuthContext";
import "../css/Login.css";
import logo from "../logos/Icon on bright with text.png";

function Login() {
  const { showError, showSuccess } = useNotification();
  const { login, isAuthenticated, userType } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || getDefaultRoute(userType);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, userType, navigate, location]);

  const getDefaultRoute = (type) => {
    switch (type) {
      case 'admin':
        return '/admin-user-management';
      case 'msme':
        return '/msme-dashboard';
      case 'customer':
        return '/';
      default:
        return '/';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // First show validating data message
    setValidating(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay for validation
    setValidating(false);

    try {
      // Try admin login first
      let response = await fetch("http://localhost:1337/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      let data = await response.json();

      if (data.success) {
        const loginSuccess = login(data.user, 'admin');
        if (loginSuccess) {
          showSuccess("Welcome back, Admin!", "Login Successful");
          const from = location.state?.from?.pathname || '/admin-user-management';
          navigate(from, { replace: true });
          return;
        }
      }

      // Try customer login
      response = await fetch("http://localhost:1337/api/customers/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      data = await response.json();

      if (data.success) {
        const loginSuccess = login(data.user, 'customer');
        if (loginSuccess) {
          showSuccess("Welcome back! Let's get started.", "Login Successful");
          const from = location.state?.from?.pathname || '/customer-sidebar';
          navigate(from, { replace: true });
          return;
        }
      }

      // Try MSME login
      response = await fetch("http://localhost:1337/api/msme/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      data = await response.json();

      if (data.success) {
        // Check if MSME is approved
        if (data.user.status === "approved") {
          const loginSuccess = login(data.user, 'msme');
          if (loginSuccess) {
            showSuccess("Login successful! Welcome back.", "Welcome");
            const from = location.state?.from?.pathname || '/msme-dashboard';
            navigate(from, { replace: true });
            return;
          }
        } else if (data.user.status === "pending") {
          showError("Your account is pending approval. Please wait for admin approval.", "Account Pending");
        } else if (data.user.status === "rejected") {
          showError("Your account has been rejected. Please contact support.", "Account Rejected");
        }
        return;
      }

      // If all login attempts fail
      showError("Invalid username or password", "Login Failed");

    } catch (error) {
      console.error("Login error:", error);
      showError("Network error. Please try again.", "Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-form">
          <div className="login-form-content">
            <div className="logo-container">
              <img src={logo} alt="Logo" className="brand-logo" />
            </div>
            <p className="text">Digital Marketing Solution For The Micro, Small, and Medium Enterprises MSME's in Nueva Vizcaya</p>
            
            {error && (
              <Alert severity="error" style={{ marginBottom: "16px" }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                variant="outlined"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                className="login-input"
                InputProps={{
                  classes: { notchedOutline: "input-outline" },
                }}
                inputProps={{
                  className: "login-input-inner",
                }}
                required
                disabled={loading}
              />
              <TextField
                variant="outlined"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                className="login-input"
                InputProps={{
                  classes: { notchedOutline: "input-outline" },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  className: "login-input-inner",
                }}
                required
                disabled={loading}
              />
              <div className="login-links">
                <span
                  className="login-link"
                  style={{ 
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1 
                  }}
                  onClick={() => !loading && navigate("/signup")}
                >
                 New here ? Sign Up
                </span>
                <span 
                  className="login-link"
                  style={{ opacity: loading ? 0.5 : 1 }}
                >
                  Forgot Password?
                </span>
              </div>
              <hr style={{ margin: "10px 0" }} />
              
              {/* Loading circle above button */}
              {loading && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  marginBottom: '10px'
                }}>
                  <CircularProgress size={30} style={{ color: '#313131' }} />
                </div>
              )}
              
              <Button 
                type="submit"
                variant="contained" 
                className="login-btn"
                disabled={loading}
              >
                LOGIN
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;