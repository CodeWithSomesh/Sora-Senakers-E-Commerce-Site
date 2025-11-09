import { auth } from "express-oauth2-jwt-bearer";
import { Request, Response, NextFunction } from "express" 
import jwt from "jsonwebtoken";
import User from "../models/user";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      auth0Id: string;
    }
  }
}

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
      next();
      /* next() is proceeding to call the NextFunction , which calling the MyUserController*/

    } catch (error) {
      return res.sendStatus(401);
    }
  };