import { Request, Response } from "express";
import User from "../models/user";

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

// Deactivate user account
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

// Activate user account
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

export default {
    getAllUsers,
    promoteToAdmin,
    demoteToUser,
    deactivateAccount,
    activateAccount,
};
