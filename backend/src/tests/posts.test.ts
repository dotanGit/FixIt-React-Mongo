import request from "supertest";
import initApp from "../index";
import mongoose from "mongoose";
import postModel from "../models/post_model";
import userModel from "../models/user_model";
import { Express } from "express";

// Prevent real OpenAI calls during tests
jest.mock('../services/llm_service', () => ({
    __esModule: true,
    default: { moderateContent: jest.fn().mockResolvedValue({ approved: true }) }
}));

let app: Express;
let accessToken: string;
let secondUserAccessToken: string;
let postId: string;

const testUser   = { username: "PostsUser",   email: "posts_user@test.com",   password: "123456" };
const secondUser = { username: "PostsSecond", email: "posts_second@test.com", password: "123456" };

beforeAll(async () => {
    app = await initApp();
    await postModel.deleteMany();
    await userModel.deleteMany();

    await request(app).post("/users/register").send(testUser);
    const login1 = await request(app).post("/users/login").send(testUser);
    accessToken = login1.body.token;

    await request(app).post("/users/register").send(secondUser);
    const login2 = await request(app).post("/users/login").send(secondUser);
    secondUserAccessToken = login2.body.token;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Posts API", () => {

    // ── GET /posts ────────────────────────────────────────────────────
    test("GET /posts returns paginated response when empty", async () => {
        const res = await request(app).get("/posts");
        expect(res.statusCode).toBe(200);
        expect(res.body.posts).toHaveLength(0);
        expect(res.body.hasMore).toBe(false);
        expect(res.body.total).toBe(0);
    });

    // ── POST /posts ───────────────────────────────────────────────────
    test("POST /posts - 401 without auth", async () => {
        const res = await request(app).post("/posts").send({ message: "Hello" });
        expect(res.statusCode).toBe(401);
    });

    test("POST /posts - 400 when message is missing", async () => {
        const res = await request(app)
            .post("/posts")
            .set("authorization", `Bearer ${accessToken}`)
            .send({});
        expect(res.statusCode).toBe(400);
    });

    test("POST /posts - creates post successfully", async () => {
        const res = await request(app)
            .post("/posts")
            .set("authorization", `Bearer ${accessToken}`)
            .send({ message: "Hello world" });
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("Hello world");
        expect(res.body.likes).toEqual([]);
        postId = res.body._id;
    });

    test("GET /posts - returns one post after creation", async () => {
        const res = await request(app).get("/posts");
        expect(res.statusCode).toBe(200);
        expect(res.body.posts).toHaveLength(1);
        expect(res.body.total).toBe(1);
    });

    test("GET /posts - pagination limit is respected", async () => {
        // Create 3 more posts so we have 4 total
        for (let i = 1; i <= 3; i++) {
            await request(app)
                .post("/posts")
                .set("authorization", `Bearer ${accessToken}`)
                .send({ message: `Pagination post ${i}` });
        }
        const page1 = await request(app).get("/posts?page=1&limit=2");
        expect(page1.statusCode).toBe(200);
        expect(page1.body.posts).toHaveLength(2);
        expect(page1.body.hasMore).toBe(true);

        const page2 = await request(app).get("/posts?page=2&limit=2");
        expect(page2.statusCode).toBe(200);
        expect(page2.body.posts).toHaveLength(2);
    });

    // ── GET /posts/:id ────────────────────────────────────────────────
    test("GET /posts/:id - returns post by ID", async () => {
        const res = await request(app).get(`/posts/${postId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(postId);
        expect(res.body.message).toBe("Hello world");
    });

    test("GET /posts/:id - 404 for non-existent post", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app).get(`/posts/${fakeId}`);
        expect(res.statusCode).toBe(404);
    });

    // ── GET /posts/my ─────────────────────────────────────────────────
    test("GET /posts/my - 401 without auth", async () => {
        const res = await request(app).get("/posts/my");
        expect(res.statusCode).toBe(401);
    });

    test("GET /posts/my - returns only the current user's posts", async () => {
        const res = await request(app)
            .get("/posts/my")
            .set("authorization", `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("GET /posts/my - second user sees no posts (created none)", async () => {
        const res = await request(app)
            .get("/posts/my")
            .set("authorization", `Bearer ${secondUserAccessToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(0);
    });

    // ── PUT /posts/:id ────────────────────────────────────────────────
    test("PUT /posts/:id - updates post (owner)", async () => {
        const res = await request(app)
            .put(`/posts/${postId}`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({ message: "Updated message" });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Updated message");
    });

    test("PUT /posts/:id - 403 for non-owner", async () => {
        const res = await request(app)
            .put(`/posts/${postId}`)
            .set("authorization", `Bearer ${secondUserAccessToken}`)
            .send({ message: "Hacked!" });
        expect(res.statusCode).toBe(403);
    });

    test("PUT /posts/:id - 404 for non-existent post", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .put(`/posts/${fakeId}`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({ message: "Trying to update" });
        expect(res.statusCode).toBe(404);
    });

    // ── POST /posts/:id/like ──────────────────────────────────────────
    test("POST /posts/:id/like - 401 without auth", async () => {
        const res = await request(app).post(`/posts/${postId}/like`);
        expect(res.statusCode).toBe(401);
    });

    test("POST /posts/:id/like - likes a post", async () => {
        const res = await request(app)
            .post(`/posts/${postId}/like`)
            .set("authorization", `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.likes).toHaveLength(1);
    });

    test("POST /posts/:id/like - calling again unlikes the post", async () => {
        const res = await request(app)
            .post(`/posts/${postId}/like`)
            .set("authorization", `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.likes).toHaveLength(0);
    });

    // ── DELETE /posts/:id ─────────────────────────────────────────────
    test("DELETE /posts/:id - 403 for non-owner", async () => {
        const res = await request(app)
            .delete(`/posts/${postId}`)
            .set("authorization", `Bearer ${secondUserAccessToken}`);
        expect(res.statusCode).toBe(403);
    });

    test("DELETE /posts/:id - 404 for non-existent post", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .delete(`/posts/${fakeId}`)
            .set("authorization", `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(404);
    });

    test("DELETE /posts/:id - deletes post (owner) and confirms 404 after", async () => {
        const res = await request(app)
            .delete(`/posts/${postId}`)
            .set("authorization", `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(200);

        const check = await request(app).get(`/posts/${postId}`);
        expect(check.statusCode).toBe(404);
    });
});
