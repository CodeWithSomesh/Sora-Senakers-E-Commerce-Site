import { useCreateMyUser } from "@/api/MyUserApi";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { trackFailedLogin } from "../services/security.service";
import { toast } from "sonner";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { user, loginWithRedirect } = useAuth0();
  const { createUser } = useCreateMyUser();

  const hasCreatedUser = useRef(false);
  const {executeRecaptcha} = useGoogleReCaptcha();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const [showVerificationFailure, setShowVerificationFailure] = useState(false);

  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const checkEmailVerification = async (userEmail: string) => {
    try {
      const response = await axios.post("http://localhost:7000/api/verification/check", {
        email: userEmail,
      });
      setIsVerified(response.data.verified);
      if (response.data.verified) {
        setStatus("Your email is now verified! Please click 'Try Login Again' to continue.");
      }
    } catch (err) {
      setIsVerified(false);
    }
  };

  const handleResend = async () => {
    if (!email || !email.includes("@")) {
      setStatus("Please enter a valid email address");
      return;
    }

    setStatus("Sending verification email...");
    setResending(true);

    try {
      await axios.post("http://localhost:7000/api/verification/resend", {
        email: email,
      });

      setStatus(`Success! Verification email sent to ${email}`);
      checkEmailVerification(email);
    } catch (err: any) {
      if (err.response?.status === 429) {
        setStatus(err.response.data.error);
      } else if (err.response?.status === 404) {
        setStatus("No account found with that email address");
      } else if (err.response) {
        setStatus(`Failed: ${err.response.data.error || err.response.statusText}`);
      } else if (err.request) {
        setStatus("Failed: No response from server");
      } else {
        setStatus(`Failed: ${err.message}`);
      }
    } finally {
      setResending(false);
    }
  };

  // Detect email verification redirect from Auth0
  useEffect(() => {
    const success = searchParams.get("success");
    const message = searchParams.get("message");
    const code = searchParams.get("code");

    // If user clicked the verification link from the email
    if (success === "true" && code === "success") {
      setShowVerificationSuccess(true);
      setShowVerificationFailure(false);
      setStatus(message || "Your email was verified successfully!");
    } else if (success !== null && (success === "false" || (message && success !== "true"))) {
      // Verification failed - show error screen
      // Check if success param exists and is false, OR if there's a message but success isn't true
      setShowVerificationFailure(true);
      setShowVerificationSuccess(false);
      setStatus(message || "Verification failed. Please try again.");
    }
  }, [searchParams]);

  /**
   * SECURITY TRACKING: Track failed login attempts
   * Automatically logs authentication errors to security dashboard
   */
  useEffect(() => {
    if (error === "access_denied" && errorDescription === "email_not_verified") {
      // Track failed login due to unverified email
      trackFailedLogin(email || "unknown", email, "email_not_verified");
    } else if (error === "access_denied" && errorDescription === "User did not authorize the request") {
      // Track failed login due to user denying authorization
      trackFailedLogin("unknown", "", "User denied authorization");
    } else if (error === "too_many_attempts" || errorDescription?.toLowerCase().includes("blocked") || errorDescription?.toLowerCase().includes("too many attempts")) {
      // Track account blocked due to multiple failed attempts
      const userEmail = new URLSearchParams(window.location.search).get("email") || email || "unknown";
      trackFailedLogin(userEmail, userEmail, "account_locked");
    } else if (error === "unauthorized" || error === "access_denied") {
      // Track failed login due to invalid credentials or blocked account
      const userEmail = new URLSearchParams(window.location.search).get("email") || email || "unknown";
      trackFailedLogin(userEmail, userEmail, errorDescription?.toLowerCase().includes("blocked") ? "account_locked" : "invalid_credentials");
    } else if (error) {
      // Track any other authentication errors
      const userEmail = new URLSearchParams(window.location.search).get("email") || email || "unknown";
      trackFailedLogin(userEmail, userEmail, errorDescription || error);
    }
  }, [error, errorDescription, email]);

  useEffect(() => {
    // Only create user and navigate if there's no error AND user exists
  const handleCreateUser = async () => {
    // Wait for both user and executeRecaptcha to be ready
    if (!user?.sub || !user?.email || hasCreatedUser.current || error || showVerificationSuccess || showVerificationFailure) {
      return;
    }

    // If executeRecaptcha is not ready yet, wait for next render
    if (!executeRecaptcha) {
      console.log("Waiting for reCAPTCHA to initialize...");
      return;
    }

    try {
      console.log("Generating reCAPTCHA token...");
      const token = await executeRecaptcha("user_login_action");
      
      if (!token) {
        throw new Error("Failed to generate reCAPTCHA token");
      }
      
      console.log("reCAPTCHA token generated, creating user...");
      await createUser({
        auth0Id: user.sub,
        email: user.email,
        isAdmin: user.isAdmin,
        recaptchaToken: token,
      });
      
      hasCreatedUser.current = true;
      navigate("/");
    } catch (err) {
      console.error("Failed to create user:", err);
      // Show error to user instead of silently navigating away
      toast.error("Failed to complete registration. Please try again.");
      // Optionally: Don't navigate away so user can retry
      // navigate("/");
    }
  };

  handleCreateUser();
}, [executeRecaptcha, createUser, navigate, user, error, showVerificationSuccess, showVerificationFailure]);

  // Handle timeout navigation for non-user scenarios
  useEffect(() => {
    if (!error && !user && !showVerificationSuccess && !showVerificationFailure) {
      const timer = setTimeout(() => {
        if (!error && !showVerificationSuccess && !showVerificationFailure) navigate("/");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [navigate, error, user, showVerificationSuccess, showVerificationFailure]);

  useEffect(() => {
    if (email && email.includes("@")) {
      const debounceTimer = setTimeout(() => {
        checkEmailVerification(email);
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      setIsVerified(false);
    }
  }, [email]);

  // Email Verification Success Screen
  if (showVerificationSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 space-y-6 text-center">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="w-16 h-16 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">Email Verified!</h3>
            <p className="text-gray-600">
              {status || "Your email has been successfully verified. You can now log in to your account."}
            </p>
          </div>

          <button
            onClick={() => loginWithRedirect()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  if (error === "access_denied" && errorDescription === "User did not authorize the request") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 space-y-4 text-center">
          <h3 className="text-2xl font-bold mb-2">Authorisation Required</h3>
          <p className="text-sm text-gray-600 mb-4">
            Application cannot continue without granting permission.
          </p>

          <button
            onClick={() => loginWithRedirect()}
            style={{ backgroundColor: '#0059d6' }}
            className="w-full px-4 py-2 text-white rounded hover:opacity-90"
          >
            Try Login Again
          </button>
        </div>
      </div>
    );
  }

  if (showVerificationFailure || (error === "access_denied" && errorDescription === "email_not_verified")) {
    const isFailure = showVerificationFailure;
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className={`rounded-full p-3 ${isFailure ? 'bg-red-100' : 'bg-yellow-100'}`}>
              <svg
                className={`w-16 h-16 ${isFailure ? 'text-red-600' : 'text-yellow-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isFailure ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                )}
              </svg>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">
              {isFailure ? 'Verification Failed' : 'Verify Your Email'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {isFailure 
                ? (status || "This verification link has expired or already been used. Enter your email below to receive a new verification link.")
                : "Check your inbox or enter your email address to receive a new verification link."
              }
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={resending}
            />
          </div>

          <button
            onClick={handleResend}
            disabled={resending || !email || isVerified}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? "Sending..." : isVerified ? "Email Already Verified" : "Resend Verification Email"}
          </button>

          <button
            onClick={() => loginWithRedirect()}
            style={{ backgroundColor: '#0059d6' }}
            className="w-full px-4 py-2 text-white rounded hover:opacity-90"
          >
            Try Login Again
          </button>

          {status && (!isFailure || status !== (searchParams.get("message") || "Verification failed. Please try again.")) && (
            <div className={`p-3 rounded text-center ${
              status.startsWith("Success") || status.includes("now verified")
                ? "bg-green-50 border border-green-200 text-green-800"
                : status.includes("wait")
                  ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
                  : status.startsWith("Failed") || status.startsWith("No account")
                    ? "bg-red-50 border border-red-200 text-red-800"
                    : "bg-blue-50 border border-blue-200 text-blue-800"
              }`}>
              <p className="text-sm">{status}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>Loading...</>;

};

export default AuthCallbackPage;
