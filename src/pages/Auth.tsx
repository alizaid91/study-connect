import { useState, useEffect } from "react";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
} from "react-icons/fi";
import logo from "../assets/logo.png";
import { authService, AuthFormData } from "../services/authService";
import { apiService } from "../services/apiService";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();
  const code = new URLSearchParams(window.location.search).get(
    "educatorInvite"
  );
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verifyingInviteCode, setVerifyingInviteCode] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<{
    loading: boolean;
    available: boolean | null;
    errors: string[];
  }>({
    loading: false,
    available: null,
    errors: [],
  });
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    const hash = location.hash.replace("#", "");

    if (hash === "login") {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }

    if (code) {
      const verifyInvite = async () => {
        try {
          setVerifyingInviteCode(true);
          const res = await apiService.verifyEducatorInvite(code);
          setVerifyingInviteCode(false);
          if (res.valid) {
            setInviteCode(code);
            setVerificationMessage(
              "Invite code verified! Signing up as Educator"
            );
          }
        } catch (error: any) {
          setVerificationMessage(
            error.message || "Failed to verify invite code."
          );
          setVerifyingInviteCode(false);

          setTimeout(() => {
            navigate("/auth#signup");
            setVerificationMessage("");
          }, 4000);
        }
      };
      verifyInvite();
    }
  }, [location.hash, code]);

  const validateUsername = async (username: string) => {
    if (!username.trim()) {
      setUsernameStatus({ loading: false, available: null, errors: [] });
      return;
    }

    setUsernameStatus((prev) => ({ ...prev, loading: true }));

    try {
      const result = await apiService.validateUsername(username);

      if (result.success) {
        setUsernameStatus({
          loading: false,
          available: true,
          errors: [],
        });
      } else {
        setUsernameStatus({
          loading: false,
          available: false,
          errors: result.errors?.map((e) => e.message) || ["Invalid username"],
        });
      }
    } catch (err) {
      setUsernameStatus({
        loading: false,
        available: false,
        errors: ["Failed to validate username"],
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Debounce username validation
    if (name === "username" && !isLogin) {
      if (!value.trim()) {
        setUsernameStatus({ loading: false, available: null, errors: [] });
        debounceTimer && clearTimeout(debounceTimer);
        return;
      }

      const timer = setTimeout(() => {
        validateUsername(value);
      }, 500);

      setDebounceTimer(timer);
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);

  const getUsernameInputClass = () => {
    const baseClass =
      "pl-10 pr-10 block w-full rounded-md border shadow-sm focus:ring-primary-500 transition-all";
    if (!isLogin) {
      if (usernameStatus.loading)
        return `${baseClass} border-blue-300 focus:border-blue-500`;
      if (usernameStatus.available === true)
        return `${baseClass} border-green-300 focus:border-green-500`;
      if (usernameStatus.available === false)
        return `${baseClass} border-red-300 focus:border-red-500`;
    }
    return `${baseClass} border-gray-300 focus:border-primary-500`;
  };

  const getUsernameIcon = () => {
    if (isLogin) return null;
    if (usernameStatus.loading)
      return <FiLoader className="animate-spin text-blue-500" size={16} />;
    if (usernameStatus.available === true)
      return <FiCheckCircle className="text-green-500" size={16} />;
    if (usernameStatus.available === false)
      return <FiAlertCircle className="text-red-500" size={16} />;
    return null;
  };

  const isFormValid = () => {
    if (isLogin) return true;
    return (
      usernameStatus.available === true && usernameStatus.errors.length === 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await authService.signInWithEmail(formData.email, formData.password);
      } else {
        inviteCode
          ? await authService.signUpWithEmail(formData, "educator", inviteCode)
          : await authService.signUpWithEmail(formData, "student");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    setResetLoading(true);
    try {
      await authService.sendPasswordResetEmail(resetEmail);
      setResetSuccess(
        "We've sent you a password reset link. Please check your inbox and spam folder."
      );
    } catch (err: any) {
      setResetError(err.message || "Failed to send password reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="mx-4">
      <div className="flex flex-1 items-center justify-center bg-gray-50 p-4 px-2 lg:p-12">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-6 space-y-6">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="h-12 w-auto" />
          </div>
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 ${
                isLogin
                  ? "border-b-2 border-primary-600 text-primary-600 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`px-4 py-2 ${
                !isLogin
                  ? "border-b-2 border-primary-600 text-primary-600 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-800">
            {isLogin ? "Welcome Back!" : "Create Your Account"}
          </h2>
          {!verificationMessage && verifyingInviteCode && (
            <div className="text-center text-md font-bold text-blue-600 flex items-center justify-center">
              <FiLoader className="animate-spin me-2" />
              Verifying invite code...
            </div>
          )}
          {verificationMessage && !isLogin && (
            <div
              className={`text-center text-md font-bold ${
                verificationMessage.includes("Invalid") ||
                verificationMessage.includes("Failed") ||
                verificationMessage.includes("expired") ||
                verificationMessage.includes("not")
                  ? "text-red-500"
                  : "text-green-600"
              }`}
            >
              {verificationMessage}
            </div>
          )}
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {/* Name Input */}
            {!isLogin && (
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Full Name"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* Email Input */}
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email Address"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {/* Username */}
            {!isLogin && (
              <div className="relative">
                <div className="relative mb-1">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="Username"
                    className={getUsernameInputClass()}
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                  {!isLogin && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getUsernameIcon()}
                    </div>
                  )}
                </div>
                {/* Username validation messages */}
                {!isLogin && usernameStatus.errors.length > 0 && (
                  <div className="space-y-1 pl-1">
                    {usernameStatus.errors.map((error, idx) => (
                      <p
                        key={idx}
                        className="text-xs text-red-500 flex items-center gap-1"
                      >
                        <FiAlertCircle size={12} /> {error}
                      </p>
                    ))}
                  </div>
                )}
                {!isLogin && usernameStatus.available === true && (
                  <p className="text-xs text-green-600 flex items-center gap-1 pl-1">
                    <FiCheckCircle size={12} /> Username is available
                  </p>
                )}
              </div>
            )}

            {/* Password Input */}
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Confirm Password"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            {isLoading ? (
              <button
                disabled
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex items-center w-full justify-center font-medium"
              >
                <svg
                  aria-hidden="true"
                  role="status"
                  className="inline w-4 h-4 me-3 text-white animate-spin"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#E5E7EB"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </svg>
                Loading...
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isLogin && !isFormValid()}
                className="w-full flex justify-center py-2 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLogin ? "Sign In" : "Sign Up"}
              </button>
            )}
          </form>
          {/* Forgot Password link and form (Sign In only) */}
          {isLogin && !showForgotPassword && (
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline focus:outline-none"
                onClick={() => {
                  setShowForgotPassword(true);
                  setResetEmail(formData.email);
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}
          {isLogin && showForgotPassword && (
            <div className="bg-blue-50 p-3 rounded-md mt-2">
              <form onSubmit={handleForgotPassword} className="space-y-2">
                <label
                  htmlFor="resetEmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter your email to reset password
                </label>
                <input
                  id="resetEmail"
                  name="resetEmail"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
                {resetError && (
                  <div className="text-red-500 text-xs">{resetError}</div>
                )}
                {resetSuccess && (
                  <div className="text-green-600 text-xs">{resetSuccess}</div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Email"}
                  </button>
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:underline"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetError("");
                      setResetSuccess("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
