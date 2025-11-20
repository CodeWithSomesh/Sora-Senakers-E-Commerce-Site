import { Request, Response } from "express";
import User from "../models/user";
import { blockAuth0User, unblockAuth0User } from "../services/auth0Service";

// Get all users (admin only)
const getAllUsers = async (req: Request, res: Response) => {
    try {
        // Check if the requesting user is an admin
        const requestingUser = await User.findById(req.userId);
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }

        // Fetch all users
        const users = await User.find({}).select('-profilePhoto.encryptedData'); // Exclude encrypted photo data for performance

        res.json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error fetching users" });
    }
};

// Promote user to admin
const promoteToAdmin = async (req: Request, res: Response) => {
    try {
        // Check if the requesting user is an admin
        const requestingUser = await User.findById(req.userId);
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }

        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isAdmin) {
            return res.status(400).json({ message: "User is already an admin" });
        }

        user.isAdmin = true;
        await user.save();

        res.json({ message: "User promoted to admin successfully", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error promoting user to admin" });
    }
};

// Demote admin to user
const demoteToUser = async (req: Request, res: Response) => {
    try {
        // Check if the requesting user is an admin
        const requestingUser = await User.findById(req.userId);
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }

        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isAdmin) {
            return res.status(400).json({ message: "User is not an admin" });
        }

        // Prevent self-demotion
        if (user._id.toString() === req.userId) {
            return res.status(400).json({ message: "Cannot demote yourself" });
        }

        // Only super admins can demote other admins
        if (user.isAdmin && !requestingUser.isSuperAdmin) {
            return res.status(403).json({ message: "Only super admins can demote other admins" });
        }

        // Cannot demote super admins
        if (user.isSuperAdmin) {
            return res.status(403).json({ message: "Cannot demote a super admin" });
        }

        user.isAdmin = false;
        await user.save();

        res.json({ message: "Admin demoted to user successfully", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error demoting admin to user" });
    }
};

// Deactivate user account (sets isActive = false)
const deactivateAccount = async (req: Request, res: Response) => {
    try {
        // Check if the requesting user is an admin
        const requestingUser = await User.findById(req.userId);
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }

        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isActive) {
            return res.status(400).json({ message: "User account is already deactivated" });
        }

        // Prevent self-deactivation
        if (user._id.toString() === req.userId) {
            return res.status(400).json({ message: "Cannot deactivate your own account" });
        }

        // Only super admins can deactivate other admins
        if (user.isAdmin && !requestingUser.isSuperAdmin) {
            return res.status(403).json({ message: "Only super admins can deactivate other admins" });
        }

        // Cannot deactivate super admins
        if (user.isSuperAdmin) {
            return res.status(403).json({ message: "Cannot deactivate a super admin" });
        }

        user.isActive = false;
        await user.save();

        res.json({ message: "User account deactivated successfully", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error deactivating user account" });
    }
};

// Activate user account (sets isActive = true)
const activateAccount = async (req: Request, res: Response) => {
    try {
        // Check if the requesting user is an admin
        const requestingUser = await User.findById(req.userId);
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }

        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isActive) {
            return res.status(400).json({ message: "User account is already active" });
        }

        user.isActive = true;
        await user.save();

        res.json({ message: "User account activated successfully", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error activating user account" });
    }
};

// Block user account (sets isBlocked = true)
const blockAccount = async (req: Request, res: Response) => {
    try {
        // Check if the requesting user is an admin
        const requestingUser = await User.findById(req.userId);
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }

        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isBlocked) {
            return res.status(400).json({ message: "User account is already blocked" });
        }

        // Prevent self-blocking
        if (user._id.toString() === req.userId) {
            return res.status(400).json({ message: "Cannot block your own account" });
        }

        // Only super admins can block other admins
        if (user.isAdmin && !requestingUser.isSuperAdmin) {
            return res.status(403).json({ message: "Only super admins can block other admins" });
        }

        // Cannot block super admins
        if (user.isSuperAdmin) {
            return res.status(403).json({ message: "Cannot block a super admin" });
        }

        user.isBlocked = true;
        await user.save();

        // Also block user in Auth0
        try {
            await blockAuth0User(user.auth0Id);
        } catch (auth0Error) {
            console.error("Failed to block user in Auth0:", auth0Error);
            // Continue even if Auth0 block fails - database is source of truth
        }

        res.json({ message: "User account blocked successfully", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error blocking user account" });
    }
};

// Unblock user account (sets isBlocked = false)
const unblockAccount = async (req: Request, res: Response) => {
    try {
        // Check if the requesting user is an admin
        const requestingUser = await User.findById(req.userId);
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }

        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isBlocked) {
            return res.status(400).json({ message: "User account is not blocked" });
        }

        user.isBlocked = false;
        await user.save();

        // Also unblock user in Auth0
        try {
            await unblockAuth0User(user.auth0Id);
        } catch (auth0Error) {
            console.error("Failed to unblock user in Auth0:", auth0Error);
            // Continue even if Auth0 unblock fails - database is source of truth
        }

        res.json({ message: "User account unblocked successfully", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error unblocking user account" });
    }
};

// Check if user is blocked (called by Auth0 Action)
const checkBlockStatus = async (req: Request, res: Response) => {
    try {
        const { auth0Id } = req.query;

        if (!auth0Id) {
            return res.status(400).json({ message: "auth0Id is required" });
        }

        const user = await User.findOne({ auth0Id: auth0Id as string });

        if (!user) {
            // User not found - allow login (they'll be created on callback)
            return res.json({ isBlocked: false });
        }

        // Return true if user is blocked
        return res.json({ isBlocked: user.isBlocked });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error checking block status" });
    }
};

export default {
    getAllUsers,
    promoteToAdmin,
    demoteToUser,
    deactivateAccount,
    activateAccount,
    blockAccount,
    unblockAccount,
    checkBlockStatus,
};
