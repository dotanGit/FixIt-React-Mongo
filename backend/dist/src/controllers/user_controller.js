"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../models/user_model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendError = (code, message, res) => {
    res.status(code).json({ message });
};
const generateToken = (userId) => {
    const secret = process.env.TOKEN_SECRET || "default_secret";
    //TODO: check if no secret close the server
    const expiresIn = parseInt(process.env.TOKEN_EXPIRATION || "3600");
    const rand = Math.floor(Math.random() * 1000);
    const token = jsonwebtoken_1.default.sign({ _id: userId, rand: rand }, secret, { expiresIn: expiresIn });
    return token;
};
const generateRefreshToken = (userId) => {
    const secret = process.env.TOKEN_SECRET || "default_secret";
    const expiresIn = parseInt(process.env.REFRESH_TOKEN_EXPIRATION || "604800"); // 7 days
    const rand = Math.floor(Math.random() * 1000);
    const token = jsonwebtoken_1.default.sign({ _id: userId, rand: rand }, secret, { expiresIn: expiresIn });
    return token;
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return sendError(400, "Email and password are required", res);
    }
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        const user = yield user_model_1.default.create({ "email": email, "password": hashedPassword });
        const token = generateToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());
        user.refreshTokens = [refreshToken];
        yield user.save();
        res.status(201).json({ "token": token, "refreshToken": refreshToken });
    }
    catch (err) {
        return sendError(500, "Internal server error" + err, res);
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Login logic here
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return sendError(400, "Email and password are required", res);
    }
    try {
        const user = yield user_model_1.default.findOne({ email: email });
        if (!user) {
            return sendError(401, "Invalid email or password 1", res);
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return sendError(401, "Invalid email or password 2", res);
        }
        const token = generateToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());
        user.refreshTokens.push(refreshToken);
        yield user.save();
        res.status(200).json({ "token": token, "refreshToken": refreshToken });
    }
    catch (err) {
        return sendError(500, "Internal server error" + err, res);
    }
});
const logOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return sendError(400, "Refresh token is required", res);
    }
    try {
        const secret = process.env.TOKEN_SECRET || "default_secret";
        const decoded = jsonwebtoken_1.default.verify(refreshToken, secret);
        const user = yield user_model_1.default.findById({ _id: decoded._id });
        if (!user) {
            return sendError(401, "User not found", res);
        }
        if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
            return sendError(401, "Invalid refresh token", res);
        }
        // Remove the refresh token from the user's list
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        yield user.save();
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (err) {
        return sendError(401, "Invalid refresh token" + err, res);
    }
});
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return sendError(400, "Refresh token is required", res);
    }
    try {
        const secret = process.env.TOKEN_SECRET || "default_secret";
        const decoded = jsonwebtoken_1.default.verify(refreshToken, secret);
        const user = yield user_model_1.default.findById({ _id: decoded._id });
        if (!user) {
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
        yield user.save();
        res.status(200).json({ "token": newAccessToken, "refreshToken": newRefreshToken });
    }
    catch (err) {
        return sendError(500, "Internal server error" + err, res);
    }
});
exports.default = {
    register,
    login,
    refreshToken,
    logOut
};
//# sourceMappingURL=user_controller.js.map