import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user_model";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sendError = (code: number, message: string, res: Response) => {
    res.status(code).json({ message });
}

const generateToken = (userId: string): string => {
    const secret = process.env.TOKEN_SECRET || "default_secret";
    //TODO: check if no secret close the server
    const expiresIn = parseInt(process.env.TOKEN_EXPIRATION || "3600");
    const rand = Math.floor(Math.random() * 1000);
    const token = jwt.sign(
        { _id: userId, rand: rand },
        secret,
        { expiresIn: expiresIn }
    );
    return token;
}

const generateRefreshToken = (userId: string): string => {
    const secret = process.env.TOKEN_SECRET || "default_secret";
    const expiresIn = parseInt(process.env.REFRESH_TOKEN_EXPIRATION || "604800"); // 7 days
    const rand = Math.floor(Math.random() * 1000);
    const token = jwt.sign(
        { _id: userId, rand: rand },
        secret,
        { expiresIn: expiresIn }
    );
    return token;
}

const register = async (req: Request, res: Response) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const avatar = req.body.avatar || "https://localhost:3000/uploads/default-avatar.png";
    if (!username || !email || !password) {
        return sendError(400, "Username, email and password are required", res);
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ "username": username, "email": email, "password": hashedPassword, "avatar": avatar });

        const token = generateToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());
        user.refreshTokens = [refreshToken];
        await user.save();
        res.status(201).json({ "token": token, "refreshToken": refreshToken });
    } catch (err) {
        return sendError(500, "Internal server error" + err, res);
    }
}

const login = async (req: Request, res: Response) => {
    // Login logic here
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return sendError(400, "Email and password are required", res);
    }
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return sendError(401, "Invalid email or password 1", res);
        }
        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return sendError(401, "Invalid email or password 2", res);
        }

        const token = generateToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());
        user.refreshTokens.push(refreshToken);
        await user.save();
        res.status(200).json({ "token": token, "refreshToken": refreshToken });

    } catch (err) {
        return sendError(500, "Internal server error" + err, res);
    }
}

const googleLogin = async (req: Request, res: Response) => {
    const { credential } = req.body;
    if (!credential) {
        return sendError(400, "Google credential is required", res);
    }
    try {
        // 1. Verify the ID token with Google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return sendError(401, "Invalid Google token", res);
        }

        const { sub: googleId, email, name, picture } = payload;

        // 2. Find existing user by googleId, or fall back to email (account linking)
        let user = await User.findOne({ googleId });
        if (!user) {
            user = await User.findOne({ email });
        }

        if (user) {
            // 3a. User exists — link googleId if not yet set
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // 3b. New user — create without a password
            user = await User.create({
                username: name || email.split("@")[0],
                email,
                googleId,
                avatar: picture,
            });
        }

        // 4. Issue our own JWT + refreshToken (same as regular login)
        const token = generateToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());
        user.refreshTokens.push(refreshToken);
        await user.save();

        res.status(200).json({ token, refreshToken });
    } catch (err) {
        return sendError(500, "Google login failed: " + err, res);
    }
};

const logOut = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return sendError(400, "Refresh token is required", res);
    }
    try{
        const secret = process.env.TOKEN_SECRET || "default_secret";
        const decoded = jwt.verify(refreshToken, secret) as { _id: string };
        const user = await User.findById({ _id: decoded._id });
        if(!user) {
            return sendError(401, "User not found", res);
        }
        if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
            return sendError(401, "Invalid refresh token", res);
        }
        // Remove the refresh token from the user's list
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();

        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        return sendError(401, "Invalid refresh token" + err, res);
    }
}

const refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return sendError(400, "Refresh token is required", res);
    }
    try {
        const secret = process.env.TOKEN_SECRET || "default_secret";
        const decoded = jwt.verify(refreshToken, secret) as { _id: string };
        const user = await User.findById({ _id: decoded._id });

        if(!user) {
            return sendError(401, "Invalid refresh token", res);
        }
        if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
            return sendError(401, "Invalid refresh token", res);
        }
        const newAccessToken = generateToken(user._id.toString());
        const newRefreshToken = generateRefreshToken(user._id.toString());

        // Remove the old refresh token (the one that was just used)
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);

        // Add the new refresh token
        user.refreshTokens.push(newRefreshToken);

        // Save to database
        await user.save();
        res.status(200).json({ "token": newAccessToken, "refreshToken": newRefreshToken });
    } catch (err) {
        return sendError(401, "Invalid refresh token" + err, res);
    }
}

const getCurrentUser = async (req: any, res: Response) => {
    try {
        if (!req.user) {
            return sendError(401, "Unauthorized", res);
        }
        const user = await User.findById(req.user._id).select('-password -refreshTokens');
        if (!user) {
            return sendError(404, "User not found", res);
        }
        res.status(200).json(user);
    } catch (err) {
        return sendError(500, "Internal server error" + err, res);
    }
}

const updateProfile = async (req: any, res: Response) => {
    try {
        if (!req.user) {
            return sendError(401, "Unauthorized", res);
        }

        const { username, avatar } = req.body;
        const updates: any = {};

        if (username) updates.username = username;
        if (avatar) updates.avatar = avatar;

        if (Object.keys(updates).length === 0) {
            return sendError(400, "No fields to update", res);
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        ).select('-password -refreshTokens');

        if (!user) {
            return sendError(404, "User not found", res);
        }

        res.status(200).json(user);
    } catch (err) {
        return sendError(500, "Internal server error" + err, res);
    }
}

export default {
    register,
    login,
    googleLogin,
    refreshToken,
    logOut,
    getCurrentUser,
    updateProfile
};
