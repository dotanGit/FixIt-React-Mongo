import request from "supertest";
import initApp from "../index";
import mongoose from "mongoose";
import commentModel from "../models/comment_model";
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
let commentId: string;

const testUser   = { username: "CommentsUser",   email: "comments_user@test.com",   password: "123456" };
const secondUser = { username: "CommentsSecond", email: "comments_second@test.com", password: "123456" };

beforeAll(async () => {
    app = await initApp();
    await commentModel.deleteMany();
    await postModel.deleteMany();
    await userModel.deleteMany();

    await request(app).post("/users/register").send(testUser);
    const login1 = await request(app).post("/users/login").send(testUser);
    accessToken = login1.body.token;

    await request(app).post("/users/register").send(secondUser);
    const login2 = await request(app).post("/users/login").send(secondUser);
    secondUserAccessToken = login2.body.token;

    // Create a post to comment on
    const postRes = await request(app)
        .post("/api/posts")
        .set("authorization", `Bearer ${accessToken}`)
        .send({ message: "Post for comments" });
    postId = postRes.body._id;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Comments API", () => {

    // ── GET /comments ─────────────────────────────────────────────────
    test("GET /comments - empty initially", async () => {
        const res = await request(app).get("/comments");
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(0);
    });

    // ── POST /comments/:postId ────────────────────────────────────────
    test("POST /comments/:postId - 401 without auth", async () => {
        const res = await request(app)
            .post(`/comments/${postId}`)
            .send({ message: "Hello" });
        expect(res.statusCode).toBe(401);
    });

    test("POST /comments/:postId - 400 when message is missing", async () => {
        const res = await request(app)
            .post(`/comments/${postId}`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({});
        expect(res.statusCode).toBe(400);
    });

    test("POST /comments/:postId - creates comment successfully", async () => {
        const res = await request(app)
            .post(`/comments/${postId}`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({ message: "Nice post!" });
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("Nice post!");
        expect(res.body.postId).toBe(postId);
        commentId = res.body._id;
    });

    // ── GET /comments (after adding one) ─────────────────────────────
    test("GET /comments - returns all comments", async () => {
        const res = await request(app).get("/comments");
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    test("GET /comments?postId= - filters comments by post", async () => {
        const res = await request(app).get(`/comments?postId=${postId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].postId).toBe(postId);
    });

    // ── GET /comments/:id ─────────────────────────────────────────────
    test("GET /comments/:id - returns comment by ID", async () => {
        const res = await request(app).get(`/comments/${commentId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(commentId);
        expect(res.body.message).toBe("Nice post!");
    });

    test("GET /comments/:id - 404 for non-existent comment", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app).get(`/comments/${fakeId}`);
        expect(res.statusCode).toBe(404);
    });

    // ── PUT /comments/:id ─────────────────────────────────────────────
    test("PUT /comments/:id - updates comment (owner)", async () => {
        const res = await request(app)
            .put(`/comments/${commentId}`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({ message: "Updated comment" });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Updated comment");
    });

    test("PUT /comments/:id - 400 when message is missing", async () => {
        const res = await request(app)
            .put(`/comments/${commentId}`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({});
        expect(res.statusCode).toBe(400);
    });

    test("PUT /comments/:id - 403 for non-owner", async () => {
        const res = await request(app)
            .put(`/comments/${commentId}`)
            .set("authorization", `Bearer ${secondUserAccessToken}`)
            .send({ message: "Hacked!" });
        expect(res.statusCode).toBe(403);
    });

    test("PUT /comments/:id - 404 for non-existent comment", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .put(`/comments/${fakeId}`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({ message: "Trying to update" });
        expect(res.statusCode).toBe(404);
    });

    // ── DELETE /comments/:id ──────────────────────────────────────────
    test("DELETE /comments/:id - 403 for non-owner", async () => {
        const res = await request(app)
            .delete(`/comments/${commentId}`)
            .set("authorization", `Bearer ${secondUserAccessToken}`);
        expect(res.statusCode).toBe(403);
    });

    test("DELETE /comments/:id - 404 for non-existent comment", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .delete(`/comments/${fakeId}`)
            .set("authorization", `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(404);
    });

    test("DELETE /comments/:id - deletes comment (owner) and confirms 404 after", async () => {
        const res = await request(app)
            .delete(`/comments/${commentId}`)
            .set("authorization", `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(200);

        const check = await request(app).get(`/comments/${commentId}`);
        expect(check.statusCode).toBe(404);
    });
});
