"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user_model"));
const post_model_1 = __importDefault(require("../models/post_model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, index_1.default)();
    yield user_model_1.default.deleteMany();
    yield post_model_1.default.deleteMany();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
const userInfo = {
    email: "emily@gmail.com",
    password: "123456",
    _id: "123123abcabc"
};
describe("Auth Tests", () => {
    test("Auth Registration", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/register").send(userInfo);
        expect(response.statusCode).toBe(201);
    }));
    test("Auth Registration fail", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app).post("/users/register").send(userInfo);
        const response = yield (0, supertest_1.default)(app).post("/users/register").send(userInfo);
        expect(response.statusCode).not.toBe(200);
        console.log("ressssss::::::", response.statusCode);
    }));
    test("Auth Registration fail with exists email", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/register").send(userInfo);
        expect(response.statusCode).not.toBe(200);
    }));
    test("Auth Registration fail without password", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/register").send({ email: "test@test.com" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Email and password are required");
    }));
    test("Auth Registration fail without email", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/register").send({ password: "123456" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Email and password are required");
    }));
    test("Auth Registration fail without email and password", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/register").send({});
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Email and password are required");
    }));
    test("Auth Registration database error", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/register").send({ email: "test50@test.com", password: "123456" });
        expect(response.statusCode).toBe(201);
    }));
    test("Auth Login", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/login").send(userInfo);
        console.log(response.body);
        expect(response.statusCode).toBe(200);
        const accessToken = response.body.token;
        const refreshToken = response.body.refreshToken;
        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();
        userInfo.accessToken = accessToken;
        userInfo.refreshToken = refreshToken;
    }));
    test("Auth Login fail with correct password and false email", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/users/login")
            .send({ email: userInfo.email + "1", password: userInfo.password });
        expect(response.statusCode).not.toBe(200);
    }));
    test("Auth Login fail with correct email and false password", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/users/login")
            .send({ email: userInfo.email, password: userInfo.password + "1" });
        expect(response.statusCode).not.toBe(200);
    }));
    test("Auth Login fail without email", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/login").send({ password: "123456" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Email and password are required");
    }));
    test("Auth Login fail without password", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/login").send({ email: "test@test.com" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Email and password are required");
    }));
    test("Auth Login fail without email and password", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/login").send({});
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Email and password are required");
    }));
    test("Make sure two access tokens are notr the same", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/login").send({
            email: userInfo.email,
            password: userInfo.password,
        });
        expect(response.body.accessToken).not.toEqual(userInfo.accessToken);
    }));
    test("Get protected API", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/posts").send({
            sender: "invalid owner",
            message: "My First post",
        });
        expect(response.statusCode).not.toBe(201);
        const response2 = yield (0, supertest_1.default)(app)
            .post("/posts")
            .set({
            authorization: "Bearer " + userInfo.accessToken,
        })
            .send({
            sender: "invalid owner",
            message: "My First post",
        });
        expect(response2.statusCode).toBe(201);
    }));
    test("Get protected API invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/users/posts")
            .set({
            authorization: "jwt " + userInfo.accessToken + "1",
        })
            .send({
            sender: userInfo._id,
            message: "This is my first post",
        });
        expect(response.statusCode).not.toBe(201);
    }));
    test("Get protected API with Bearer but empty token after split - line 13", () => __awaiter(void 0, void 0, void 0, function* () {
        // Test the middleware directly to bypass HTTP header normalization
        const { authenticate } = yield Promise.resolve().then(() => __importStar(require("../middleware/auth_middleware")));
        const req = {
            headers: {
                authorization: "Bearer " // One space, no token after
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        authenticate(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized 2" });
        expect(next).not.toHaveBeenCalled();
    }));
    test("Refresh Token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/refresh-token").send({
            refreshToken: userInfo.refreshToken,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        userInfo.accessToken = response.body.token;
        userInfo.refreshToken = response.body.refreshToken;
    }));
    test("Logout - invalidate refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        // First login to get a fresh token
        const loginResponse = yield (0, supertest_1.default)(app).post("/users/login").send({
            email: userInfo.email,
            password: userInfo.password,
        });
        const logoutToken = loginResponse.body.refreshToken;
        const response = yield (0, supertest_1.default)(app).post("/users/logout").send({
            refreshToken: logoutToken,
        });
        expect(response.statusCode).toBe(200);
        const response2 = yield (0, supertest_1.default)(app).post("/users/refresh-token").send({
            refreshToken: logoutToken,
        });
        expect(response2.statusCode).not.toBe(200);
    }));
    test("Logout fail without refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/logout").send({});
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Refresh token is required");
    }));
    test("Logout fail with empty refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/logout").send({ refreshToken: "" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Refresh token is required");
    }));
    test("Logout fail with non-existent user", () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a valid token for a user that doesn't exist in the database
        const fakeUserId = new mongoose_1.default.Types.ObjectId().toString();
        const fakeToken = jsonwebtoken_1.default.sign({ _id: fakeUserId }, process.env.TOKEN_SECRET || "default_secret", { expiresIn: "7d" });
        const response = yield (0, supertest_1.default)(app).post("/users/logout").send({ refreshToken: fakeToken });
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("User not found");
    }));
    test("Logout fail with token not in user's refreshTokens", () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser = { email: "logouttest@test.com", password: "123456" };
        yield (0, supertest_1.default)(app).post("/users/register").send(newUser);
        const loginResponse = yield (0, supertest_1.default)(app).post("/users/login").send(newUser);
        const validToken = loginResponse.body.refreshToken;
        yield (0, supertest_1.default)(app).post("/users/logout").send({ refreshToken: validToken });
        const response = yield (0, supertest_1.default)(app).post("/users/logout").send({ refreshToken: validToken });
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid refresh token");
    }));
    test("Missing TOKEN_SECRET in logout", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalSecret = process.env.TOKEN_SECRET;
        delete process.env.TOKEN_SECRET;
        const response = yield (0, supertest_1.default)(app).post("/users/logout").send(userInfo);
        expect(response.statusCode).not.toBe(200);
        process.env.TOKEN_SECRET = originalSecret;
    }));
    test("Invalid refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/users/refresh-token")
            .send({ refreshToken: "invalidToken" });
        expect(response.statusCode).not.toBe(200);
    }));
    test("Refresh: Missing refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/refresh-token").send({});
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Refresh token is required");
    }));
    test("Refresh: Empty refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/refresh-token").send({ refreshToken: "" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Refresh token is required");
    }));
    test("Refresh token with non-existent user", () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a valid token for a user that doesn't exist in the database
        const fakeUserId = new mongoose_1.default.Types.ObjectId().toString();
        const fakeToken = jsonwebtoken_1.default.sign({ _id: fakeUserId }, process.env.TOKEN_SECRET || "default_secret", { expiresIn: "7d" });
        const response = yield (0, supertest_1.default)(app).post("/users/refresh-token").send({ refreshToken: fakeToken });
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid refresh token");
    }));
    test("Missing TOKEN_SECRET in refresh", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalSecret = process.env.TOKEN_SECRET;
        delete process.env.TOKEN_SECRET;
        const response = yield (0, supertest_1.default)(app)
            .post("/users/refresh-token")
            .send({ refreshToken: userInfo.refreshToken });
        expect(response.statusCode).not.toBe(200);
        process.env.TOKEN_SECRET = originalSecret;
    }));
    jest.setTimeout(10000);
    test("timeout on refresh access token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/users/login").send({
            email: userInfo.email,
            password: userInfo.password,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        userInfo.accessToken = response.body.token;
        userInfo.refreshToken = response.body.refreshToken;
        yield new Promise((resolve) => setTimeout(resolve, 6000));
        const response2 = yield (0, supertest_1.default)(app)
            .post("/posts")
            .set({
            authorization: "Bearer " + userInfo.accessToken,
        })
            .send({
            sender: "Emily",
            message: "My First post",
        });
        expect(response2.statusCode).not.toBe(201);
        const response3 = yield (0, supertest_1.default)(app).post("/users/refresh-token").send({
            refreshToken: userInfo.refreshToken,
        });
        expect(response3.statusCode).toBe(200);
        userInfo.accessToken = response3.body.token;
        userInfo.refreshToken = response3.body.refreshToken;
        const response4 = yield (0, supertest_1.default)(app)
            .post("/posts")
            .set({
            authorization: "Bearer " + userInfo.accessToken,
        })
            .send({
            sender: "Dotan",
            message: "My First post",
        });
        expect(response4.statusCode).toBe(201);
    }));
});
//# sourceMappingURL=auth.test.js.map