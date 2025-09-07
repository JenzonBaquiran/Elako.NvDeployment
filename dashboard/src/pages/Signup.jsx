import React, { useState } from "react";
import { TextField, Button, IconButton, InputAdornment, MenuItem, Alert, CircularProgress } from "@mui/material";
import { Visibility, VisibilityOff, PersonOutline, Apartment } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "../css/Signup.css";
import logo from "../logos/Icon on dark with text.png";

function Signup() {
  const [activeTab, setActiveTab] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Customer form state
  const [customerData, setCustomerData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    email: "",
    contactNumber: "",
    address: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

  // MSME form state
  const [msmeData, setMsmeData] = useState({
    clientProfilingNumber: "",
    category: "",
    businessName: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

  const handleCustomerChange = (field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const handleMsmeChange = (field, value) => {
    setMsmeData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (customerData.password !== customerData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = customerData;
      const response = await fetch("http://localhost:1337/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Customer registration successful! You can now login.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.error || data.errors?.join(", ") || "Registration failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMsmeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (msmeData.password !== msmeData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = msmeData;
      const response = await fetch("http://localhost:1337/api/msme/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("MSME registration successful! Please wait for admin approval.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.error || data.errors?.join(", ") || "Registration failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-bg">
      <div className="signup-container">
        <div className="signup-form">
          <div className="signup-form-content">
            {/* Tab switcher */}
            <div className="signup-tabs">
              <div className={`signup-tab-col ${activeTab === "customer" ? "active" : ""}`}>
                <IconButton
                  onClick={() => setActiveTab("customer")}
                  className={`signup-tab-btn ${activeTab === "customer" ? "active" : ""}`}
                  disabled={loading}
                >
                  <PersonOutline fontSize="large" />
                </IconButton>
                <span className="signup-tab-label">Customer</span>
              </div>
              <div className={`signup-tab-col ${activeTab === "msme" ? "active" : ""}`}>
                <IconButton
                  onClick={() => setActiveTab("msme")}
                  className={`signup-tab-btn ${activeTab === "msme" ? "active" : ""}`}
                  disabled={loading}
                >
                  <Apartment fontSize="large" />
                </IconButton>
                <span className="signup-tab-label">MSME</span>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <Alert severity="error" style={{ marginBottom: "16px" }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" style={{ marginBottom: "16px" }}>
                {success}
              </Alert>
            )}

            {/* Customer Signup */}
            {activeTab === "customer" && (
              <form className="signup-fields" onSubmit={handleCustomerSubmit}>
                <TextField
                  variant="outlined"
                  placeholder="First Name"
                  value={customerData.firstname}
                  onChange={(e) => handleCustomerChange("firstname", e.target.value)}
                  fullWidth
                  className="signup-input"
                  required
                  disabled={loading}
                />
                <TextField
                  variant="outlined"
                  placeholder="Middle Name (optional)"
                  value={customerData.middlename}
                  onChange={(e) => handleCustomerChange("middlename", e.target.value)}
                  fullWidth
                  className="signup-input"
                  disabled={loading}
                />
                <TextField
                  variant="outlined"
                  placeholder="Last Name"
                  value={customerData.lastname}
                  onChange={(e) => handleCustomerChange("lastname", e.target.value)}
                  fullWidth
                  className="signup-input"
                  required
                  disabled={loading}
                />
                <TextField
                  variant="outlined"
                  placeholder="Email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => handleCustomerChange("email", e.target.value)}
                  fullWidth
                  className="signup-input"
                  required
                  disabled={loading}
                />
                <TextField
                  variant="outlined"
                  placeholder="Contact Number"
                  value={customerData.contactNumber}
                  onChange={(e) => handleCustomerChange("contactNumber", e.target.value)}
                  fullWidth
                  className="signup-input"
                  required
                  disabled={loading}
                />
                <TextField
                  variant="outlined"
                  placeholder="Address"
                  value={customerData.address}
                  onChange={(e) => handleCustomerChange("address", e.target.value)}
                  fullWidth
                  className="signup-input"
                  required
                  disabled={loading}
                />
                <TextField
                  variant="outlined"
                  placeholder="Username"
                  value={customerData.username}
                  onChange={(e) => handleCustomerChange("username", e.target.value)}
                  fullWidth
                  className="signup-input"
                  required
                  disabled={loading}
                />
                <TextField
                  variant="outlined"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={customerData.password}
                  onChange={(e) => handleCustomerChange("password", e.target.value)}
                  fullWidth
                  className="signup-input"
                  required
                  disabled={loading}
                  InputProps={{
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
                />
                <TextField
                  variant="outlined"
                  placeholder="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  value={customerData.confirmPassword}
                  onChange={(e) => handleCustomerChange("confirmPassword", e.target.value)}
                  fullWidth
                  className="signup-input"
                  required
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirm(!showConfirm)}
                          edge="end"
                          disabled={loading}
                        >
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <hr className="signup-divider" />
                <Button 
                  type="submit"
                  variant="contained" 
                  className="signup-btn"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? "SIGNING UP..." : "SIGN UP"}
                </Button>
                <p className="text" style={{ marginTop: "10px" }}>
                  Already have an account?{" "}
                  <a href="/login" className="link">
                    LOGIN
                  </a>
                </p>
              </form>
            )}

            {/* MSME Signup */}
            {activeTab === "msme" && (
              <form className="signup-fields" onSubmit={handleMsmeSubmit}>
                <TextField
                  variant="outlined"
                  placeholder="Client Profiling Number"
                  value={msmeData.clientProfilingNumber}
                  onChange={(e) => handleMsmeChange("clientProfilingNumber", e.target.value)}
                  fullWidth
                  className="signup-input"
                  required
                  disabled={loading}
                />
                <TextField
                  select
                  variant="outlined"
                  label="Category"
                  value={msmeData.category}
                  onChange={(e) => handleMsmeChange("category", e.target.value)}
                  fullWidth
                  className="signup-input"
                  required
                  disabled={loading}
                >
                  <MenuItem value="">Select Category</MenuItem>
                  <MenuItem value="food">Food</MenuItem>
                  <MenuItem value="artisan">Artisan</MenuItem>
                </TextField>
                <TextField
                  variant="outlined"
                  placeholder="Business Name"
                  value={msmeData.businessName}
                  onChange={(e) => handleMsmeChange("businessName", e.target.value)}
                  fullWidth
                  className="signup-input"
                  required
                  disabled={loading}
                />
                <TextField
                  variant="outlined"
                  placeholder="Username"
                  value={msmeData.username}
                  onChange={(e) => handleMsmeChange("username", e.target.value)}
                  fullWidth
                  className="signup-input"
                  required
                  disabled={loading}
                />
                <TextField
                  variant="outlined"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={msmeData.password}
                  onChange={(e) => handleMsmeChange("password", e.target.value)}
                  fullWidth
                  className="signup-input"
                  required
                  disabled={loading}
                  InputProps={{
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
                />
                <TextField
                  variant="outlined"
                  placeholder="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  value={msmeData.confirmPassword}
                  onChange={(e) => handleMsmeChange("confirmPassword", e.target.value)}
                  fullWidth
                  className="signup-input"
                  required
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirm(!showConfirm)}
                          edge="end"
                          disabled={loading}
                        >
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <hr className="signup-divider" />
                <Button 
                  type="submit"
                  variant="contained" 
                  className="signup-btn"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? "SIGNING UP..." : "SIGN UP"}
                </Button>
                <p className="text" style={{ marginTop: "10px" }}>
                  Already have an account?{" "}
                  <a href="/login" className="link">
                    LOGIN
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;