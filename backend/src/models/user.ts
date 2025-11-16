import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
    auth0Id: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
    },
    addressLine1: {
        type: String,
    },
    city: {
        type: String,
    },
    country:{
        type: String,
    },
    mfaEnabled:{
        type: Boolean,
        default: false,
    },
    isAdmin:{
        type: Boolean,
        default: false,
    },
    isSuperAdmin:{
        type: Boolean,
        default: false,
    },
    isActive:{
        type: Boolean,
        default: true,
    },
    profilePhoto: {
        encryptedData: {
            type: String,
        },
        iv: {
            type: String,
        },
        mimeType: {
            type: String,
        },
        uploadedAt: {
            type: Date,
        },
    },
});

const User = mongoose.model("User", userSchema);
export default User;