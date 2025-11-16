import { Request, Response} from "express";
import User from "../models/user";
import SecurityLog from "../models/securityLog";
import AnalyticsEvent from "../models/analyticsEvent";

const getCurrentUser = async (req: Request, res: Response) => {
    try{
        const currentUser = await User.findOne({_id:req.userId});
        if (!currentUser){
            return res.status(404).json({message: "User not found"});
        }
         
      res.json(currentUser);    
    } catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong"});
    }
};

const createCurrentUser = async (req: Request, res: Response) => {

    try {
        // Destructuring auth0Id from request body
        const { auth0Id } = req.body;
        const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || "unknown";
        const userAgent = req.headers['user-agent'] || "unknown";

        // Checking in the database whether there are any existing users with the same auth0Id
        const existingUser = await User.findOne({ auth0Id });

        // If user exists, this is a successful login
        if(existingUser){
            /**
             * SECURITY TRACKING: Log successful login
             * Security Benefit: Track authentication patterns and user activity
             */
            await SecurityLog.create({
                eventType: "successful_login",
                userId: existingUser._id.toString(),
                username: existingUser.email,
                ipAddress,
                userAgent,
                severity: "low",
                details: { auth0Id },
                timestamp: new Date(),
            });

            // Also track in analytics
            await AnalyticsEvent.create({
                eventType: "login",
                userId: existingUser._id.toString(),
                timestamp: new Date(),
                data: { username: existingUser.email },
            });

            return res.status(200).send();
        }

        // If there is no existing user, create a new user (signup)
        const newUser = new User(req.body);
        await newUser.save();

        /**
         * SECURITY TRACKING: Log new user signup
         * Security Benefit: Monitor new account creation for potential abuse
         */
        await SecurityLog.create({
            eventType: "successful_login", // First time login after signup
            userId: newUser._id.toString(),
            username: newUser.email,
            ipAddress,
            userAgent,
            severity: "low",
            details: { auth0Id, newAccount: true },
            timestamp: new Date(),
        });

        // Track signup in analytics
        await AnalyticsEvent.create({
            eventType: "signup",
            userId: newUser._id.toString(),
            timestamp: new Date(),
            data: { username: newUser.email },
        });

        // If successfully created user, then return success respond message
        res.status(201).json(newUser.toObject());
    }
    catch (error) {
        console.log(error);
        res.status(500).json({message: "Error creating user"});
    }
};

/*  */
const updateCurrentUser = async (req: Request, res: Response) => {
    try {
        console.log('hi 0')

        /* Destructuring and taking name, addressLine1, country and city from request body */
        const { name, addressLine1, country, city, mfaEnabled } = req.body;
        /* find user by MongoDB ID  */
        const user = await User.findById(req.userId);

        /* if user not found, return error */
        if(!user){
            return res.status(400).json({message: "User not found"});
        }


        // if user found, add all the details given in the database
        /* user properties */
        user.name = name;
        user.addressLine1 = addressLine1;
        user.city = city;
        user.country = country;
        user.mfaEnabled = mfaEnabled;

        // Save user details in the database
        await user.save();

        // Send response to the client side
        res.send(user);

    } catch (error) {
        console.log(error);
        /* provide a general error message to avoid hacker specifically knowing what causes the error */
        res.status(500).json({message: "Error updating user"})

    }
}

export default {
    getCurrentUser,
    createCurrentUser,
    updateCurrentUser,
};