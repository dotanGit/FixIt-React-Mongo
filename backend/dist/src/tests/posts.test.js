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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const mongoose_1 = __importDefault(require("mongoose"));
const post_model_1 = __importDefault(require("../models/post_model"));
const user_model_1 = __importDefault(require("../models/user_model"));
let app;
let accessToken;
let secondUserAccessToken;
let postId = "";
const testUser = {
    email: "test@user.com",
    password: "123456",
};
const secondUser = {
    email: "second@user.com",
    password: "123456",
};
const testPost = {
    sender: "123123abcabc",
    message: "Test content",
};
const invalidPost = {
    content: ""
};
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, index_1.default)();
    yield post_model_1.default.deleteMany();
    yield user_model_1.default.deleteMany();
    const registerResponse = yield (0, supertest_1.default)(app)
        .post("/users/register")
        .send(testUser);
    expect(registerResponse.statusCode).toBe(201);
    const loginResponse = yield (0, supertest_1.default)(app)
        .post("/users/login")
        .send({ email: testUser.email, password: testUser.password });
    expect(loginResponse.statusCode).toBe(200);
    accessToken = loginResponse.body.token;
    // Register and login second user
    const registerSecondResponse = yield (0, supertest_1.default)(app)
        .post("/users/register")
        .send(secondUser);
    expect(registerSecondResponse.statusCode).toBe(201);
    const loginSecondResponse = yield (0, supertest_1.default)(app)
        .post("/users/login")
        .send({ email: secondUser.email, password: secondUser.password });
    expect(loginSecondResponse.statusCode).toBe(200);
    secondUserAccessToken = loginSecondResponse.body.token;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
describe("Posts API Test Suite", () => {
    describe("GET /posts", () => {
        test("Should return an empty list of posts initially", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get("/posts");
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(0);
        }));
        test("Should return 500 and an error message if PostModel.find throws an error", () => __awaiter(void 0, void 0, void 0, function* () {
            jest
                .spyOn(post_model_1.default, "find")
                .mockRejectedValueOnce(new Error("Database query error"));
            const response = yield (0, supertest_1.default)(app).get("/posts");
            expect(response.statusCode).toBe(500);
            expect(response.text).toBe("Error retrieving data");
        }));
        test("Should return 400 and an error message if PostModel.find (with sender filter) throws an error", () => __awaiter(void 0, void 0, void 0, function* () {
            jest
                .spyOn(post_model_1.default, "find")
                .mockRejectedValueOnce(new Error("Database query error"));
            const response = yield (0, supertest_1.default)(app)
                .get("/posts")
                .query({ sender: "testSender" });
            expect(response.statusCode).toBe(500);
            expect(response.text).toBe("Error retrieving data");
        }));
    });
    describe("POST /posts", () => {
        test("Should add a new post successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post("/posts")
                .set("authorization", `Bearer ${accessToken}`)
                .send(testPost);
            expect(response.statusCode).toBe(201);
            expect(response.body.sender).toBe(testPost.sender);
            expect(response.body.message).toBe(testPost.message);
            postId = response.body._id;
        }));
        test("Should fail to add an invalid post", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post("/posts")
                .set("authorization", `Bearer ${accessToken}`)
                .send(invalidPost);
            expect(response.statusCode).toBe(400);
            expect(response.text).toBe("Message is required");
        }));
    });
    describe("GET /posts after adding a post", () => {
        test("Should return a list with one post", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get("/posts");
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(1);
        }));
        test("Should get post by sender", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get(`/posts?sender=${testPost.sender}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].sender).toBe(testPost.sender);
        }));
        test("Should get post by ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get(`/posts/${postId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body._id).toBe(postId);
        }));
        test("Should return 400 and an error message if PostModel.findById throws an error", () => __awaiter(void 0, void 0, void 0, function* () {
            jest
                .spyOn(post_model_1.default, "findById")
                .mockRejectedValueOnce(new Error("Database query error"));
            const response = yield (0, supertest_1.default)(app).get("/posts/invalid-id");
            expect(response.statusCode).toBe(500);
            expect(response.text).toBe("Error retrieving data by ID");
        }));
        test("Should fail to get a non-existent post by ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get("/posts/67447b032ce3164be7c4412d");
            expect(response.statusCode).toBe(404);
            expect(response.text).toBe("Data not found");
        }));
    });
    test("Should update a post by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedPost = {
            sender: "Emily",
            message: "This is an updated test post",
        };
        const response = yield (0, supertest_1.default)(app)
            .put(`/posts/${postId}`)
            .set("authorization", `Bearer ${accessToken}`)
            .send(updatedPost);
        expect(response.statusCode).toBe(200);
        expect(response.body.sender).toBe(updatedPost.sender);
        expect(response.body.message).toBe(updatedPost.message);
    }));
    test("Should fail to update a post with invalid ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedPost = {
            sender: "Emily",
            message: "This is an updated test post",
        };
        const invalidPostId = "6777b39a4c79d92f497af3ebasdasdasdsa";
        const response = yield (0, supertest_1.default)(app)
            .put(`/posts/${invalidPostId}`)
            .set("authorization", `Bearer ${accessToken}`)
            .send(updatedPost);
        expect(response.statusCode).not.toBe(200);
    }));
    test("Should fail to update a post created by another user", () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a post with the first user
        const createResponse = yield (0, supertest_1.default)(app)
            .post("/posts")
            .set("authorization", `Bearer ${accessToken}`)
            .send({ sender: "FirstUser", message: "Post by first user" });
        expect(createResponse.statusCode).toBe(201);
        const createdPostId = createResponse.body._id;
        // Try to update it with the second user's token
        const updatedPost = {
            sender: "SecondUser",
            message: "Trying to update",
        };
        const updateResponse = yield (0, supertest_1.default)(app)
            .put(`/posts/${createdPostId}`)
            .set("authorization", `Bearer ${secondUserAccessToken}`)
            .send(updatedPost);
        expect(updateResponse.statusCode).toBe(403);
        expect(updateResponse.text).toBe("Forbidden: You are not the creator of this post");
    }));
    test("Should fail to update a non-existent post", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentId = "67447b032ce3164be7c4412d";
        const response = yield (0, supertest_1.default)(app)
            .put(`/posts/${nonExistentId}`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({ sender: "Test", message: "Trying to update" });
        expect(response.statusCode).toBe(404);
        expect(response.text).toBe("Post not found");
    }));
    test("Should fail to change the creator of a post", () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a post first
        const createResponse = yield (0, supertest_1.default)(app)
            .post("/posts")
            .set("authorization", `Bearer ${accessToken}`)
            .send({ sender: "TestUser", message: "Test post" });
        expect(createResponse.statusCode).toBe(201);
        const createdPostId = createResponse.body._id;
        // Try to update it with a different createdBy
        const updateResponse = yield (0, supertest_1.default)(app)
            .put(`/posts/${createdPostId}`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({ message: "Updated", createdBy: "differentUserId" });
        expect(updateResponse.statusCode).toBe(400);
        expect(updateResponse.text).toBe("Cannot change creator of the post");
    }));
    describe("DELETE /posts/:id", () => {
        test("Should delete a post successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const deleteResponse = yield (0, supertest_1.default)(app)
                .delete(`/posts/${postId}`)
                .set("authorization", `Bearer ${accessToken}`);
            expect(deleteResponse.statusCode).toBe(200);
            const getResponse = yield (0, supertest_1.default)(app).get(`/posts/${postId}`);
            expect(getResponse.statusCode).toBe(404);
        }));
        test("Should fail to delete a post with invalid ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidPostId = "invalidPostId";
            const deleteResponse = yield (0, supertest_1.default)(app)
                .delete(`/posts/${invalidPostId}`)
                .set("authorization", `Bearer ${accessToken}`);
            expect(deleteResponse.statusCode).toBe(500);
            expect(deleteResponse.text).toBe("Error deleting post");
        }));
        test("Should fail to delete a post created by another user", () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a post with the first user
            const createResponse = yield (0, supertest_1.default)(app)
                .post("/posts")
                .set("authorization", `Bearer ${accessToken}`)
                .send({ sender: "FirstUser", message: "Post by first user" });
            expect(createResponse.statusCode).toBe(201);
            const createdPostId = createResponse.body._id;
            // Try to delete it with the second user's token
            const deleteResponse = yield (0, supertest_1.default)(app)
                .delete(`/posts/${createdPostId}`)
                .set("authorization", `Bearer ${secondUserAccessToken}`);
            expect(deleteResponse.statusCode).toBe(403);
            expect(deleteResponse.text).toBe("Forbidden: You are not the creator of this post");
        }));
        test("Should fail to delete a non-existent post", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentId = "67447b032ce3164be7c4412d";
            const deleteResponse = yield (0, supertest_1.default)(app)
                .delete(`/posts/${nonExistentId}`)
                .set("authorization", `Bearer ${accessToken}`);
            expect(deleteResponse.statusCode).toBe(404);
            expect(deleteResponse.text).toBe("Post not found");
        }));
    });
});
//# sourceMappingURL=posts.test.js.map