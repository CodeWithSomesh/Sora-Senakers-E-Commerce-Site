import express from "express";
const router = express.Router();

// Check if email is verified
router.post("/check", async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Missing email address" });
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

    const userSearchRes = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const users = await userSearchRes.json();

    if (!userSearchRes.ok || !users || users.length === 0) {
      return res.status(404).json({ error: "No account found" });
    }

    const user = users[0];
    res.json({ verified: user.email_verified || false });
    
  } catch (err: any) {
    res.status(500).json({ error: "Failed to check verification status" });
  }
});

router.post("/resend", async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Missing email address" });
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

    const userSearchRes = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const users = await userSearchRes.json();

    if (!userSearchRes.ok || !users || users.length === 0) {
      return res.status(404).json({ error: "No account found with that email address" });
    }

    const user = users[0];
    const userId = user.user_id;
    
    if (user.email_verified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    const lastSent = user.user_metadata?.last_verification_email_sent || 0;
    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    if (lastSent > oneHourAgo) {
      const minutesLeft = Math.ceil((lastSent - oneHourAgo) / (60 * 1000));
      return res.status(429).json({ 
        error: `Please wait ${minutesLeft} more minute(s) before requesting another email` 
      });
    }

    const emailRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/jobs/verification-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!emailRes.ok) {
      return res.status(500).json({ error: "Failed to send verification email" });
    }

    await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_metadata: { last_verification_email_sent: Date.now() }
      }),
    });

    const data = await emailRes.json();
    res.json({ message: "Verification email sent successfully", jobId: data.id });
    
  } catch (err: any) {
    res.status(500).json({ error: "Failed to resend verification email" });
  }
});

export default router;