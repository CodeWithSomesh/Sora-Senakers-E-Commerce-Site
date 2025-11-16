import { Request, Response, NextFunction } from "express";
import axios from "axios";

export const verifyRecaptcha = async (req: Request, res: Response, next: NextFunction) => {
    const recaptchaToken = req.body.recaptchaToken;
    if (!recaptchaToken) {
        return res.status(400).json({ message: "Missing reCAPTCHA token" });
    }

    try {
        const token = req.body.recaptchaToken; 
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
        );
        console.log("reCAPTCHA verification result:", response.data);

        const data = response.data;

        if (!data.success) {
            return res.status(403).json({ message: "Failed reCAPTCHA verification" });
        }
        next();
    } catch (error) {
        console.error("reCAPTCHA verification error:", error);
        return res.status(500).json({ message: "reCAPTCHA verification error" });
    }
};
