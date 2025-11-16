import { useCreateMyUser } from "@/api/MyUserApi";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { user, loginWithRedirect } = useAuth0();
  const { createUser } = useCreateMyUser();

  const hasCreatedUser = useRef(false);
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

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

  useEffect(() => {
    // Only create user and navigate if there's no error AND user exists
    if (user?.sub && user?.email && !hasCreatedUser.current && !error) {
      createUser({ auth0Id: user.sub, email: user.email, isAdmin: user.isAdmin });
      hasCreatedUser.current = true;
      navigate("/");
    } else if (!error && !user) {
      // If no error but also no user, still navigate (loading state)
      const timer = setTimeout(() => {
        if (!error) navigate("/");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [createUser, navigate, user, error]);

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
  else if (error === "access_denied" && errorDescription === "email_not_verified") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Email Not Verified</h3>
            <p className="text-sm text-gray-600 mb-4">
              Check your inbox or enter your email address to receive a new verification link.
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

          {status && (
            <div className={`p-3 rounded text-center ${status.startsWith("Success") || status.includes("now verified")
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
