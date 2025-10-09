import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { setAuthToken } from "../../utils/auth";
import Lottie from "lottie-react";
import loadingAnimation from "../../assets/uploading.json";
import "./login.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL;

const LoginComponent: React.FC = () => {
  const navigate = useNavigate();

  // Common states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [type, setType] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // OTP signup states
  const [tempUser, setTempUser] = useState<{ email: string; username: string; password: string } | null>(null);
  const [otpStep, setOtpStep] = useState(false);
  const [signupOtp, setSignupOtp] = useState("");

  // Forgot Password
  const [forgotStep, setForgotStep] = useState<"none" | "email" | "otp" | "reset">("none");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleOnClick = (mode: "signIn" | "signUp") => {
    if (mode !== type) setType(mode);
    setErrorMessage("");
    setOtpStep(false);
    setTempUser(null);
  };

  // ---------- AUTH SUBMIT ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (type === "signUp" && !otpStep) {
        // Initial signup → send OTP
        const res = await axios.post(
          `${API_URL}/auth/signup`,
          { email, username, password },
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        setTempUser(res.data.temp_user);
        setOtpStep(true);
        // alert(res.data.message);
      } else if (type === "signUp" && otpStep && tempUser) {
        // Verify OTP
        const res = await axios.post(
          `${API_URL}/auth/verify-signup-otp`,
          {
            email: tempUser.email,
            username: tempUser.username,
            password: tempUser.password,
            otp: signupOtp
          },
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        const token = res.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", res.data.user.id);
        setAuthToken(token);
        // alert("Signup successful!");
        navigate("/home");
      } else {
        // Normal sign-in
        const res = await axios.post(
          `${API_URL}/auth/login`,
          { email, password },
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        const token = res.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", res.data.user.id);
        setAuthToken(token);
        navigate("/home");
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- GOOGLE LOGIN ----------
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    try {
      if (!credentialResponse.credential) throw new Error("No credential received");
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Google user:", decoded);

      const res = await axios.post(
        `${API_URL}/auth/google-login`,
        { token: credentialResponse.credential },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      if (res.data.token) {
        setAuthToken(res.data.token);
        navigate("/home");
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      setErrorMessage("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- FORGOT PASSWORD FLOW ----------
  const handleSendOtp = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email: forgotEmail });
      setForgotStep("otp");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || "Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/verify-otp`, { email: forgotEmail, otp });
      setForgotStep("reset");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        email: forgotEmail,
        password: newPassword,
      });
      setForgotStep("none");
      setEmail(forgotEmail);
      setPassword("");
      setErrorMessage("");
      alert("Password reset successful! Please sign in.");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || "Error resetting password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container-wrapper">
      {/* 🔹 Global Loading Overlay */}
      {isLoading && (
        <div className="login-loading-overlay">
          <div className="login-loading-popup">
            <Lottie animationData={loadingAnimation} loop className="login-loading-lottie" />
            <p className="login-loading-text">Please wait...</p>
          </div>
        </div>
      )}

      <div
        className={`login-main-container ${
          type === "signUp" ? "login-container-right-panel-active" : ""
        }`}
      >
        {/* ========== SIGN UP ========== */}
        <div className="login-form-container login-sign-up-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <h1 className="login-heading">Create Account</h1>
            <div className="login-social-container">
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.log("Google Login Failed")}
                />
              </GoogleOAuthProvider>
            </div>
            <span className="login-span">or use your email for registration</span>

            {errorMessage && <p className="login-error-text">{errorMessage}</p>}

            {!otpStep && (
              <>
                <input
                  type="text"
                  placeholder="Username"
                  className="login-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="login-password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                  </button>
                </div>
                <button className="login-button" type="submit" disabled={isLoading}>
                  Sign Up
                </button>
              </>
            )}

            {otpStep && (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="login-input"
                  value={signupOtp}
                  onChange={(e) => setSignupOtp(e.target.value)}
                  required
                />
                <button className="login-button" type="submit" disabled={isLoading}>
                  Verify OTP
                </button>
              </>
            )}
          </form>
        </div>

        {/* ========== SIGN IN ========== */}
        <div className="login-form-container login-sign-in-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <h1 className="login-heading">Sign In</h1>
            <div className="login-social-container">
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.log("Google Login Failed")}
                />
              </GoogleOAuthProvider>
            </div>
            <span className="login-span">or use your account</span>

            {errorMessage && <p className="login-error-text">{errorMessage}</p>}

            <input
              type="email"
              placeholder="Email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="login-password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>

            <button className="login-button" type="submit" disabled={isLoading}>
              Sign In
            </button>

            {/* Forgot Password Flow */}
            <div className="login-forgot-password">
              <a
                href="#"
                className="login-forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  setForgotStep("email");
                }}
              >
                Forgot Password?
              </a>
            </div>

            {forgotStep === "email" && (
              <>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="login-input"
                  required
                />
                <button className="login-button" onClick={handleSendOtp} disabled={isLoading}>
                  Send OTP
                </button>
              </>
            )}

            {forgotStep === "otp" && (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="login-input"
                  required
                />
                <button className="login-button" onClick={handleVerifyOtp} disabled={isLoading}>
                  Verify OTP
                </button>
              </>
            )}

            {forgotStep === "reset" && (
              <>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="login-input"
                  required
                />
                <button className="login-button" onClick={handleResetPassword} disabled={isLoading}>
                  Reset Password
                </button>
              </>
            )}
          </form>
        </div>

        {/* ========== OVERLAY PANELS ========== */}
        <div className="login-overlay-container">
          <div className="login-overlay">
            <div className="login-overlay-panel login-overlay-left">
              <h1 className="login-heading">Welcome Back!</h1>
              <p className="login-paragraph">Login with your personal info</p>
              <button className="login-button ghost" onClick={() => handleOnClick("signIn")}>
                Sign In
              </button>
            </div>
            <div className="login-overlay-panel login-overlay-right">
              <h1 className="login-heading">Hello!</h1>
              <p className="login-paragraph">Start your journey with us</p>
              <button className="login-button ghost" onClick={() => handleOnClick("signUp")}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
