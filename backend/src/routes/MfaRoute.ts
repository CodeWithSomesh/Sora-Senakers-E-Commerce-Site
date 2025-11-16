import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

router.post("/enable", jwtCheck, jwtParse, async (req, res) => {
  const { userId } = req.body;
  
  // Ensure user can only modify their own MFA settings
  if (userId !== req.userId) {
    return res.status(403).json({ error: "Unauthorized: Cannot modify another user's MFA settings" });
  }

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_M2M_CLIENT_ID || 
      !process.env.AUTH0_M2M_CLIENT_SECRET || !process.env.AUTH0_MANAGEMENT_API_AUDIENCE) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const tokenRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.AUTH0_M2M_CLIENT_ID,
        client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
        audience: process.env.AUTH0_MANAGEMENT_API_AUDIENCE,
        grant_type: "client_credentials",
      }),
    });

    if (!tokenRes.ok) {
      return res.status(500).json({ error: "Failed to authenticate with Auth0" });
    }

    const { access_token } = await tokenRes.json();

    const updateRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_metadata: { mfa_enabled: true }
      }),
    });

    if (!updateRes.ok) {
      const errorData = await updateRes.json();
      return res.status(500).json({ error: "Failed to enable MFA", details: errorData });
    }

    res.json({ success: true, message: "MFA enabled successfully" });
    
  } catch (err: any) {
    res.status(500).json({ error: "Failed to enable MFA", message: err.message });
  }
});

router.post("/disable", jwtCheck, jwtParse, async (req, res) => {
  const { userId } = req.body;
  
  // Ensure user can only modify their own MFA settings
  if (userId !== req.userId) {
    return res.status(403).json({ error: "Unauthorized: Cannot modify another user's MFA settings" });
  }

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_M2M_CLIENT_ID || 
      !process.env.AUTH0_M2M_CLIENT_SECRET || !process.env.AUTH0_MANAGEMENT_API_AUDIENCE) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const tokenRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.AUTH0_M2M_CLIENT_ID,
        client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
        audience: process.env.AUTH0_MANAGEMENT_API_AUDIENCE,
        grant_type: "client_credentials",
      }),
    });

    if (!tokenRes.ok) {
      return res.status(500).json({ error: "Failed to authenticate with Auth0" });
    }

    const { access_token } = await tokenRes.json();

    const updateRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_metadata: { mfa_enabled: false }
      }),
    });

    if (!updateRes.ok) {
      const errorData = await updateRes.json();
      return res.status(500).json({ error: "Failed to disable MFA", details: errorData });
    }

    res.json({ success: true, message: "MFA disabled successfully" });
    
  } catch (err: any) {
    res.status(500).json({ error: "Failed to disable MFA", message: err.message });
  }
});

export default router;