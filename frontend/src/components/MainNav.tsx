import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "./ui/button";
import UsernameMenu from "./UsernameMenu";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useState } from "react";

const MainNav = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!executeRecaptcha) {
      alert("reCAPTCHA not yet available");
      return;
    }

    setLoading(true);

    try {
      const token = await executeRecaptcha("login");

      console.log("reCAPTCHA token:", token);

      await loginWithRedirect();
    } catch (error) {
      console.error("reCAPTCHA error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="flex flex-col space-y-2 items-center">
      {isAuthenticated ? (
        <UsernameMenu />
      ) : (
        <Button
          variant="ghost"
          disabled={loading}
          className="font-bold font-inter hover:text-violet3 bg-violet2 text-white py-5 hover:bg-black"
          onClick={handleLogin}
        >
          {loading ? "Verifying..." : "Login"}
        </Button>
      )}
    </span>
  );
};

export default MainNav;