import { Request, Response} from "express";
import User from "../models/user";

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

        // Checking in the database whether there are any existing users with the same auth)Id
        const existingUser = await User.findOne({ auth0Id }); 
        
        // If user exists, return auth0Id in-built error message 
        if(existingUser){
            return res.status(200).send();
        }

        // If there is no existing user,
        // create a new user with all the details given in request body
        const newUser = new User(req.body); 
        await newUser.save();

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