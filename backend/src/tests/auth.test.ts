import request from "supertest";
import initApp from "../index";
import mongoose from "mongoose";
import { Express } from "express";
import userModel from "../models/user_model";
import postModel from "../models/post_model";

// Prevent real OpenAI calls during tests
jest.mock('../services/llm_service', () => ({
    __esModule: true,
    default: { moderateContent: jest.fn().mockResolvedValue({ approved: true }) }
}));

let app: Express;

type UserInfo = {
    username: string;
    email: string;
    password: string;
    token?: string;
    refreshToken?: string;
};

const userInfo: UserInfo = {
    username: "AuthUser",
    email: "auth_test@test.com",
    password: "123456",
};

beforeAll(async () => {
    app = await initApp();
    await userModel.deleteMany();
    await postModel.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Auth Tests", () => {

    // ── Register ──────────────────────────────────────────────────────
    test("Register - success", async () => {
        const res = await request(app).post("/users/register").send(userInfo);
        expect(res.statusCode).toBe(201);
    });

    test("Register - fails without email", async () => {
        const res = await request(app).post("/users/register").send({ username: "Test", password: "123456" });
        expect(res.statusCode).toBe(400);
    });

    test("Register - fails without password", async () => {
        const res = await request(app).post("/users/register").send({ username: "Test", email: "x@x.com" });
        expect(res.statusCode).toBe(400);
    });

    // ── Login ─────────────────────────────────────────────────────────
    test("Login - success, returns token and refreshToken", async () => {
        const res = await request(app).post("/users/login").send(userInfo);
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
        userInfo.token = res.body.token;
        userInfo.refreshToken = res.body.refreshToken;
    });

    test("Login - fails with wrong password", async () => {
        const res = await request(app)
            .post("/users/login")
            .send({ email: userInfo.email, password: "wrongpassword" });
        expect(res.statusCode).not.toBe(200);
    });

    test("Login - fails with wrong email", async () => {
        const res = await request(app)
            .post("/users/login")
            .send({ email: "wrong@wrong.com", password: userInfo.password });
        expect(res.statusCode).not.toBe(200);
    });

    test("Login - fails without credentials", async () => {
        const res = await request(app).post("/users/login").send({});
        expect(res.statusCode).toBe(400);
    });

    // ── Protected routes ──────────────────────────────────────────────
    test("POST /posts - 401 without token", async () => {
        const res = await request(app).post("/posts").send({ message: "Test" });
        expect(res.statusCode).toBe(401);
    });

    test("POST /posts - 201 with valid token", async () => {
        const res = await request(app)
            .post("/posts")
            .set("authorization", `Bearer ${userInfo.token}`)
            .send({ message: "Test post" });
        expect(res.statusCode).toBe(201);
    });

    test("POST /posts - 401 with invalid token", async () => {
        const res = await request(app)
            .post("/posts")
            .set("authorization", `Bearer invalidtoken123`)
            .send({ message: "Test post" });
        expect(res.statusCode).toBe(401);
    });

    // ── Refresh token ─────────────────────────────────────────────────
    test("Refresh token - returns new token and refreshToken", async () => {
        const res = await request(app)
            .post("/users/refresh-token")
            .send({ refreshToken: userInfo.refreshToken });
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
        userInfo.token = res.body.token;
        userInfo.refreshToken = res.body.refreshToken;
    });

    test("Refresh token - fails with invalid token", async () => {
        const res = await request(app)
            .post("/users/refresh-token")
            .send({ refreshToken: "badtoken" });
        expect(res.statusCode).not.toBe(200);
    });

    test("Refresh token - fails without token", async () => {
        const res = await request(app).post("/users/refresh-token").send({});
        expect(res.statusCode).toBe(400);
    });

    // ── Logout ────────────────────────────────────────────────────────
    test("Logout - invalidates the refresh token", async () => {
        // Fresh login so we have a known good token to log out
        const loginRes = await request(app).post("/users/login").send(userInfo);
        const tokenToInvalidate = loginRes.body.refreshToken;

        const logoutRes = await request(app)
            .post("/users/logout")
            .send({ refreshToken: tokenToInvalidate });
        expect(logoutRes.statusCode).toBe(200);

        // Token should no longer work for refresh
        const refreshRes = await request(app)
            .post("/users/refresh-token")
            .send({ refreshToken: tokenToInvalidate });
        expect(refreshRes.statusCode).not.toBe(200);
    });

    test("Logout - fails without refresh token", async () => {
        const res = await request(app).post("/users/logout").send({});
        expect(res.statusCode).toBe(400);
    });

    // ── User profile ──────────────────────────────────────────────────
    test("GET /users/me - 401 without token", async () => {
        const res = await request(app).get("/users/me");
        expect(res.statusCode).toBe(401);
    });

    test("GET /users/me - returns current user info", async () => {
        const loginRes = await request(app).post("/users/login").send(userInfo);
        const res = await request(app)
            .get("/users/me")
            .set("authorization", `Bearer ${loginRes.body.token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe(userInfo.email);
        expect(res.body.username).toBe(userInfo.username);
    });

    test("PUT /users/me - updates username", async () => {
        const loginRes = await request(app).post("/users/login").send(userInfo);
        const res = await request(app)
            .put("/users/me")
            .set("authorization", `Bearer ${loginRes.body.token}`)
            .send({ username: "UpdatedName" });
        expect(res.statusCode).toBe(200);
    });

    // ── Token expiry (requires TOKEN_EXPIRY=5s in .env.test) ─────────
    jest.setTimeout(12000);
    test("Expired access token is rejected, refresh gives a new working one", async () => {
        const loginRes = await request(app).post("/users/login").send(userInfo);
        expect(loginRes.statusCode).toBe(200);
        userInfo.token = loginRes.body.token;
        userInfo.refreshToken = loginRes.body.refreshToken;

        // Wait for access token to expire
        await new Promise((resolve) => setTimeout(resolve, 6000));

        // Expired token should be rejected
        const rejectedRes = await request(app)
            .post("/posts")
            .set("authorization", `Bearer ${userInfo.token}`)
            .send({ message: "Should fail" });
        expect(rejectedRes.statusCode).not.toBe(201);

        // Refresh to get a new token
        const refreshRes = await request(app)
            .post("/users/refresh-token")
            .send({ refreshToken: userInfo.refreshToken });
        expect(refreshRes.statusCode).toBe(200);
        userInfo.token = refreshRes.body.token;

        // New token should work
        const successRes = await request(app)
            .post("/posts")
            .set("authorization", `Bearer ${userInfo.token}`)
            .send({ message: "Should succeed" });
        expect(successRes.statusCode).toBe(201);
    });
});
