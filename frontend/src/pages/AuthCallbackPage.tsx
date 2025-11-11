import { useCreateMyUser } from "@/api/MyUserApi";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const { createUser } = useCreateMyUser();
  const hasCreatedUser = useRef(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyCaptcha = async () => {
    if (!executeRecaptcha || !user?.sub || !user?.email || hasCreatedUser.current) return;

    setIsVerifying(true);
    try {
      const token = await executeRecaptcha("user_login_action");

      await createUser({
        auth0Id: user.sub,
        email: user.email,
        isAdmin: user.isAdmin,
        recaptchaToken: token,
      });

      hasCreatedUser.current = true;
      navigate("/");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    // automatically execute once recaptcha is ready
    handleVerifyCaptcha();
  }, [executeRecaptcha]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      <p className="text-lg font-semibold text-gray-700">
        {isVerifying ? "Verifying your account..." : "Verifying reCAPTCHA..."}
      </p>
    </div>
  );
};

export default AuthCallbackPage;
