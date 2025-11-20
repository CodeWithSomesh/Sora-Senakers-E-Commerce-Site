import "dotenv/config";
import { auth } from "express-oauth2-jwt-bearer";
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken";
import User from "../models/user";
import Session from "../models/session";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      auth0Id: string;
    }
  }
}

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: 'RS256'
  });

  /*1. extract the jsonwebtoken from 'Authorization' header */
  export const jwtParse = async(
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.sendStatus(401);
    }

    /* Bearer jlajjbggksbferherkrgns */
    /* code below is wanting to take the id after bearer */
    const token = authorization.split(" ")[1];

    /*2. decode the token to retrieve 'auth0Id' */
    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      const auth0Id = decoded.sub;

      /*3. Search for user in databse using 'auth0Id' */
      const user = await User.findOne({ auth0Id });

      /* If users are not found, an authentication error will display*/
      if (!user) {
        return res.sendStatus(401);
      }

      /* If users are found, it adds the 'auth0Id' and 'userId' to the body request*/
      req.auth0Id = auth0Id as string;
      req.userId = user._id.toString();

      /* Create or update session for this user */
      await createOrUpdateUserSession(
        user._id.toString(),
        token,
        req.ip,
        req.headers['user-agent']
      );

      next();
      /* next() is proceeding to call the NextFunction , which calling the MyUserController*/

    } catch (error) {
      return res.sendStatus(401);
    }
  };

  /**
   * Helper function to create or update a user's session
   */
  async function createOrUpdateUserSession(
    userId: string,
    token: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT);

      // Check if session exists with this token
      let session = await Session.findOne({ token });

      if (session) {
        // Update existing session
        session.lastActivity = now;
        session.expiresAt = expiresAt;
        if (ipAddress) session.ipAddress = ipAddress;
        if (userAgent) session.userAgent = userAgent;
        await session.save();
      } else {
        // Create new session
        await Session.create({
          userId,
          token,
          lastActivity: now,
          expiresAt,
          ipAddress,
          userAgent,
        });
      }
    } catch (error) {
      console.error("Session creation/update error:", error);
      // Don't fail the request if session creation fails
    }
  }