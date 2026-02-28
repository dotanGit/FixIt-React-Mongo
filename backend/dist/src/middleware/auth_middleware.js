"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized 1" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized 2" });
    }
    const secret = process.env.TOKEN_SECRET || "default_secret";
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = { _id: decoded._id };
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Unauthorized 3" + err });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth_middleware.js.map