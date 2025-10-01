import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { setAuthToken } from "../../utils/auth";
import "./login.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL;

const LoginComponent: React.FC = () => {
  const navigate = useNavigate();

  // General login/sign-up states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password states
  const [forgotStep, setForgotStep] = useState<"none" | "email" | "otp" | "reset">("none");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleOnClick = (text: "signIn" | "signUp") => {
    if (text !== type) setType(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = type === "signUp" ? `${API_URL}/auth/signup` : `${API_URL}/auth/login`;
      const payload = type === "signUp" ? { email, password, username: email.split("@")[0] } : { email, password };
      const res = await axios.post(url, payload, { headers: { "Content-Type": "application/json" }, withCredentials: true });
      
      const token = res.data.token;

      if (!token) {
        throw new Error("No token received from server");
      }

      // Validate token format
      if (typeof token !== 'string' || token.trim() === '') {
        throw new Error("Invalid token format received");
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      setAuthToken(token);
      navigate("/home");
    } catch (error: any) {
      alert(error.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
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
      if (axios.isAxiosError(error)) alert(error.response?.data?.error || "Google login failed");
      else alert("An unexpected error occurred");
    }
  };

  // --- Forgot Password Handlers ---
  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email: forgotEmail });
      alert("OTP sent to your email!");
      setForgotStep("otp");
    } catch (err: any) {
      alert(err.response?.data?.error || "Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/verify-otp`, { email: forgotEmail, otp });
      alert("OTP verified!");
      setForgotStep("reset");
    } catch (err: any) {
      alert(err.response?.data?.error || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email: forgotEmail, password: newPassword });
      alert("Password reset successful!");
      setForgotStep("none");
      setEmail(forgotEmail);
      setPassword("");
    } catch (err: any) {
      alert(err.response?.data?.error || "Error resetting password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container-wrapper">
      <div className={`login-main-container ${type === "signUp" ? "login-container-right-panel-active" : ""}`}>
        
        {/* Sign Up */}
        <div className="login-form-container login-sign-up-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <h1 className="login-heading">Create Account</h1>
            <div className="login-social-container">
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log("Google Login Failed")} />
              </GoogleOAuthProvider>
            </div>
            <span className="login-span">or use your email for registration</span>
            <input type="email" placeholder="Email" className="login-input" value={email} onChange={e => setEmail(e.target.value)} required />
            <div className="login-password-field">
              <input type={showPassword ? "text" : "password"} placeholder="Password" className="login-input" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="login-password-toggle" onClick={togglePasswordVisibility} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>
            <button className="login-button" type="submit" disabled={isLoading}>{isLoading ? "Please wait..." : "Sign Up"}</button>
          </form>
        </div>

        {/* Sign In */}
        <div className="login-form-container login-sign-in-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <h1 className="login-heading">Sign In</h1>
            <div className="login-social-container">
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log("Google Login Failed")} />
              </GoogleOAuthProvider>
            </div>
            <span className="login-span">or use your account</span>
            <input type="email" placeholder="Email" className="login-input" value={email} onChange={e => setEmail(e.target.value)} required />
            <div className="login-password-field">
              <input type={showPassword ? "text" : "password"} placeholder="Password" className="login-input" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="login-password-toggle" onClick={togglePasswordVisibility} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>
            <button className="login-button" type="submit" disabled={isLoading}>{isLoading ? "Please wait..." : "Sign In"}</button>

            {/* Forgot Password */}
            <div className="login-forgot-password">
              <a href="#" className="login-forgot-link" onClick={e => { e.preventDefault(); setForgotStep("email"); }}>
                Forgot Password?
              </a>
            </div>

            {forgotStep === "email" && (
              <>
                <input type="email" placeholder="Enter your email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="login-input" required />
                <button className="login-button" onClick={handleSendOtp} disabled={isLoading}>{isLoading ? "Sending..." : "Send OTP"}</button>
              </>
            )}
            {forgotStep === "otp" && (
              <>
                <input type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} className="login-input" required />
                <button className="login-button" onClick={handleVerifyOtp} disabled={isLoading}>{isLoading ? "Verifying..." : "Verify OTP"}</button>
              </>
            )}
            {forgotStep === "reset" && (
              <>
                <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="login-input" required />
                <button className="login-button" onClick={handleResetPassword} disabled={isLoading}>{isLoading ? "Resetting..." : "Reset Password"}</button>
              </>
            )}
          </form>
        </div>

        {/* Overlay Panels */}
        <div className="login-overlay-container">
          <div className="login-overlay">
            <div className="login-overlay-panel login-overlay-left">
              <h1 className="login-heading">Welcome Back!</h1>
              <p className="login-paragraph">login with your personal info</p>
              <button className="login-button ghost" onClick={() => handleOnClick("signIn")}>Sign In</button>
            </div>
            <div className="login-overlay-panel login-overlay-right">
              <h1 className="login-heading">Hello!</h1>
              <p className="login-paragraph">start journey with us</p>
              <button className="login-button ghost" onClick={() => handleOnClick("signUp")}>Sign Up</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginComponent;
