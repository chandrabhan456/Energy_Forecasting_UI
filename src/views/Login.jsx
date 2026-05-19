import React, { useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import center from "../assets/Center.png";

export default function Login() {
  const { setlogin, role, setRole } = useStateContext();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("user"); // "user" or "admin"
  const [input, setInput] = useState({ username: "", email: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------- Create Account Modal State ----------
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createInput, setCreateInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // ------------------------------------------------

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
    setError("");
  };

  const handleCreateChange = (e) => {
    setCreateInput({ ...createInput, [e.target.name]: e.target.value });
    setCreateError("");
  };

  // -------- LOGIN HANDLER --------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Different endpoints for user vs admin
    const endpoint =
      activeTab === "user"
        ? "https://your-api.com/api/user/login"
        : "https://your-api.com/api/admin/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: input.username,
          password: input.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      // Save token / role
      localStorage.setItem("login", "true");
      localStorage.setItem("role", activeTab);
      localStorage.setItem("token", data.token || "");

      //setMainPage(true);
      setlogin(true);

      // Navigate based on role
      if (activeTab === "user") {
        navigate("/userprofile");
         setRole(activeTab);
      } else {
        navigate("/admin");
         setRole(activeTab);
      }
    } catch (err) {
      //setError("Network error. Please check your connection.");
      // Save token / role
      localStorage.setItem("login", "true");
      localStorage.setItem("role", activeTab);

  //    setMainPage(true);
      setlogin(true);
     
      // Navigate based on role
      if (activeTab === "user") {
        navigate("/userprofile");
         setRole(activeTab);
      } else {
        navigate("/admin");
         setRole(activeTab);
      }
    } finally {
      setLoading(false);
    }
  };;

  // -------- CREATE ACCOUNT HANDLER (Admin only) --------
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      const response = await fetch(
        "https://your-api.com/api/admin/create-account",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: createInput.username,
            email: createInput.email,
            password: createInput.password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setCreateError(data.message || "Failed to create account.");
        setCreateLoading(false);
        return;
      }

      setCreateSuccess("Account created successfully!");
      setCreateInput({ username: "", email: "", password: "" });
    } catch (error) {
      setCreateError("Network error. Please check your connection.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* ===== LEFT PANEL ===== */}
      <div className="login-left-panel">
        {/* Header */}
        <div className="login-header">
          <h2 className="login-title text-2xl"> TalentScope Platform</h2>
          <p className="login-subtitle">Welcome! Please sign in to continue.</p>
        </div>

        {/* Tab Switcher */}
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === "user" ? "tab-active" : ""}`}
            onClick={() => {
              setActiveTab("user");
              setError("");
              setInput({ username: "", email: "", password: "" });
            }}
          >
            User
          </button>
          <button
            className={`tab-btn ${activeTab === "admin" ? "tab-active" : ""}`}
            onClick={() => {
              setActiveTab("admin");
              setError("");
              setInput({ username: "", email: "", password: "" });
            }}
          >
            Admin
          </button>
        </div>

        {/* Form Title */}
        <h3 className="form-title">
          {activeTab === "user" ? "User Login" : "Admin Login"}
        </h3>

        {/* Error Message */}
        {error && <div className="error-alert">{error}</div>}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form-inner">
          {/* Username */}
          <div className="input-group">
            <label htmlFor="username" className="input-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={input.username}
              placeholder="Enter your username"
              onChange={handleChange}
              className="text-input1"
              required
            />
          </div>

          {/* Password */}
          <div className="input-group" style={{ position: "relative" }}>
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              name="password"
              value={input.password}
              placeholder="Enter your password"
              onChange={handleChange}
              className="text-input1"
              style={{ paddingRight: "40px" }}
              required
            />
            <span onClick={togglePasswordVisibility} className="eye-icon">
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Forgot Password */}
          <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>

          {/* Login Button */}
          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Create Account - shown only for Admin tab */}
        {activeTab === "user" && (
          <div className="create-account-link">
            <button
              className="link-btn"
              onClick={() => {
                setShowCreateModal(true);
                setCreateError("");
                setCreateSuccess("");
              }}
            >
              Create account
            </button>
          </div>
        )}
      </div>
      {/* ===== RIGHT PANEL ===== */}
      <div className="login-right-panel">
        <img
          src={center}
          alt="Energy Forecasting"
          className="right-panel-img"
        />
      </div>

      {/* ===== CREATE ACCOUNT MODAL ===== */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()} // prevent close on inner click
          >
            {/* Modal Header */}
            <div className="modal-header">
              <h3 className="modal-title">Create New Account</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                &times;
              </button>
            </div>

            {/* Success Message */}
            {createSuccess && (
              <div className="success-alert">{createSuccess}</div>
            )}

            {/* Error Message */}
            {createError && <div className="error-alert">{createError}</div>}

            {/* Create Account Form */}
            <form onSubmit={handleCreateAccount} className="modal-form">
              {/* Username */}
              <div className="input-group">
                <label htmlFor="create-username" className="input-label">
                  Username
                </label>
                <input
                  type="text"
                  id="create-username"
                  name="username"
                  value={createInput.username}
                  placeholder="Enter username"
                  onChange={handleCreateChange}
                  className="text-input1"
                  required
                />
              </div>

              {/* Email */}
              <div className="input-group">
                <label htmlFor="create-email" className="input-label">
                  Email
                </label>
                <input
                  type="email"
                  id="create-email"
                  name="email"
                  value={createInput.email}
                  placeholder="Enter email address"
                  onChange={handleCreateChange}
                  className="text-input1"
                  required
                />
              </div>

              {/* Password */}
              <div className="input-group" style={{ position: "relative" }}>
                <label htmlFor="create-password" className="input-label">
                  Password
                </label>
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="create-password"
                  name="password"
                  value={createInput.password}
                  placeholder="Enter password"
                  onChange={handleCreateChange}
                  className="text-input1"
                  style={{ paddingRight: "40px" }}
                  required
                />
                <span onClick={togglePasswordVisibility} className="eye-icon">
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-create"
                  disabled={createLoading}
                >
                  {createLoading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div> // closes login-page-wrapper
  );
}