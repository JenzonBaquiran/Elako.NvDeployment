import React, { useState } from "react";
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Paper,
  Divider,
  InputAdornment,
  IconButton
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/NotificationProvider";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import "../css/Login.css";
import logo from "../logos/Icon on bright with text.png";

function ForgotPassword() {
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email input, 2: OTP verification, 3: New password
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    userType: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Start countdown timer for OTP resend
  const startTimer = () => {
    setCanResend(false);
    setOtpTimer(60);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Password strength validation function
  const isPasswordStrong = (password) => {
    if (!password || password.length < 8) return false;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Require at least 3 out of 4 criteria for strong password
    const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    return criteriaCount >= 3;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      showError("Please enter your email address", "Email Required");
      return;
    }

    if (!validateEmail(formData.email)) {
      showError("Please enter a valid email address", "Invalid Email");
      return;
    }

    if (!formData.userType) {
      showError("Please select your account type", "Account Type Required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:1337/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          userType: formData.userType
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess("OTP sent to your email address", "Check Your Email");
        setStep(2);
        startTimer();
      } else {
        showError(data.error || "Failed to send OTP", "Error");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      showError("Network error. Please try again.", "Connection Error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.otp.trim()) {
      showError("Please enter the OTP", "OTP Required");
      return;
    }

    if (formData.otp.length !== 6) {
      showError("OTP must be 6 digits", "Invalid OTP");
      return;
    }

    if (!formData.newPassword.trim()) {
      showError("Please enter a new password", "Password Required");
      return;
    }

    if (!isPasswordStrong(formData.newPassword)) {
      showError(
        "Password is too weak. Please create a stronger password with at least 8 characters including at least 3 of the following: uppercase letters, lowercase letters, numbers, and special characters.",
        "Weak Password"
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showError("Passwords do not match", "Password Mismatch");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:1337/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          userType: formData.userType,
          otp: formData.otp,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess("Password reset successfully! You can now login with your new password.", "Success");
        navigate("/login");
      } else {
        showError(data.error || "Failed to reset password", "Error");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      showError("Network error. Please try again.", "Connection Error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:1337/api/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          userType: formData.userType
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess("New OTP sent to your email", "OTP Resent");
        startTimer();
      } else {
        showError(data.error || "Failed to resend OTP", "Error");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      showError("Network error. Please try again.", "Connection Error");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleSendOTP}>
      <Typography variant="h5" gutterBottom align="center" style={{ marginBottom: "20px", color: "#333", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
        Forgot Password
      </Typography>
      <Typography variant="body2" align="center" style={{ marginBottom: "30px", color: "#666", fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
        Enter your email address and account type to receive an OTP for password reset
      </Typography>

      <TextField
        variant="outlined"
        placeholder="Enter your email address"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
        fullWidth
        className="login-input"
        required
        disabled={loading}
        style={{ marginBottom: "20px" }}
      />

      <FormControl fullWidth className="login-input" style={{ marginBottom: "30px" }}>
        <InputLabel>Account Type</InputLabel>
        <Select
          value={formData.userType}
          onChange={(e) => handleInputChange("userType", e.target.value)}
          required
          disabled={loading}
        >
          <MenuItem value="customer">Customer</MenuItem>
          <MenuItem value="msme">MSME Business</MenuItem>
        </Select>
      </FormControl>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px" }}>
        <Button
          onClick={() => navigate("/login")}
          style={{ 
            textTransform: "none",
            color: "#666",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 500,
            padding: "8px 0",
            minWidth: "auto",
            fontSize: "14px"
          }}
        >
          Back to Login
        </Button>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <CircularProgress size={30} style={{ color: '#313131' }} />
        </div>
      )}

      <Button 
        type="submit"
        variant="contained" 
        className="login-btn"
        disabled={loading}
        style={{ 
          marginBottom: "20px",
          display: "block",
          margin: "20px auto"
        }}
      >
        SEND OTP
      </Button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleVerifyOTP}>
      <Typography variant="h5" gutterBottom align="center" style={{ marginBottom: "20px", color: "#333", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
        Verify OTP & Reset Password
      </Typography>
      <Typography variant="body2" align="center" style={{ marginBottom: "20px", color: "#666", fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
        Enter the 6-digit OTP sent to {formData.email}
      </Typography>

      <TextField
        variant="outlined"
        placeholder="Enter 6-digit OTP"
        value={formData.otp}
        onChange={(e) => handleInputChange("otp", e.target.value.replace(/\D/g, '').slice(0, 6))}
        fullWidth
        className="login-input"
        required
        disabled={loading}
        style={{ marginBottom: "20px", textAlign: "center" }}
        inputProps={{
          style: { textAlign: "center", fontSize: "18px", letterSpacing: "4px" }
        }}
      />

      <Divider style={{ margin: "20px 0" }}>
        <Typography variant="caption" color="textSecondary" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>
          Enter New Password
        </Typography>
      </Divider>

      <TextField
        variant="outlined"
        placeholder="New Password"
        type={showNewPassword ? "text" : "password"}
        value={formData.newPassword}
        onChange={(e) => handleInputChange("newPassword", e.target.value)}
        fullWidth
        className="login-input"
        required
        disabled={loading}
        style={{ marginBottom: "20px" }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowNewPassword(!showNewPassword)}
                edge="end"
                disabled={loading}
              >
                {showNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <PasswordStrengthIndicator password={formData.newPassword} />

      <TextField
        variant="outlined"
        placeholder="Confirm New Password"
        type={showConfirmPassword ? "text" : "password"}
        value={formData.confirmPassword}
        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
        fullWidth
        className="login-input"
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
                disabled={loading}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        disabled={loading}
        style={{ marginBottom: "20px" }}
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginBottom: "20px" }}>
        <Button
          variant="text"
          onClick={handleResendOTP}
          disabled={!canResend || loading}
          style={{ 
            color: canResend ? "#4CAF50" : "#999",
            textTransform: "none",
            fontSize: "12px",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 500
          }}
        >
          {canResend ? "Resend OTP" : `Resend in ${otpTimer}s`}
        </Button>
        <Typography variant="caption" color="textSecondary" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
          OTP expires in 10 minutes
        </Typography>
      </Box>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <CircularProgress size={30} style={{ color: '#313131' }} />
        </div>
      )}

      <Button 
        type="submit"
        variant="contained" 
        className="login-btn"
        disabled={loading}
        fullWidth
      >
        Reset Password
      </Button>
    </form>
  );

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-form">
          <div className="login-form-content">
            <div className="logo-container">
              <img 
                src={logo} 
                alt="Logo" 
                className="brand-logo" 
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
              />
            </div>

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;