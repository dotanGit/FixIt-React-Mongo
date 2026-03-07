import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "REST API Documentation",
      version: "1.0.0",
      description: "API for managing Users, Posts, and Comments with JWT authentication",
      contact: {
        name: "Dotan and Emily",
      },
    },
    servers: [
      {
        url: "https://node06.cs.colman.ac.il",
        description: "Production server (HTTPS)",
      },
      {
        url: "https://localhost:3000",
        description: "Local development server (HTTPS)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", description: "User ID (MongoDB ObjectId)" },
            username: { type: "string", description: "Display name" },
            email: { type: "string", format: "email" },
            avatar: { type: "string", description: "URL of profile picture" },
          },
        },
        UserRequest: {
          type: "object",
          required: ["username", "email", "password"],
          properties: {
            username: { type: "string", example: "john_doe" },
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", example: "password123" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", example: "password123" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string", description: "JWT access token" },
            refreshToken: { type: "string", description: "JWT refresh token" },
          },
        },
        Post: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Post ID (MongoDB ObjectId)" },
            message: { type: "string", description: "Post content" },
            image: { type: "string", description: "Optional image URL" },
            createdBy: {
              type: "object",
              properties: {
                _id: { type: "string" },
                username: { type: "string" },
                email: { type: "string" },
                avatar: { type: "string" },
              },
            },
            likes: {
              type: "array",
              items: { type: "string" },
              description: "Array of user IDs who liked the post",
            },
            commentCount: { type: "integer", description: "Number of comments" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        PostRequest: {
          type: "object",
          required: ["message"],
          properties: {
            message: { type: "string", example: "This is my first post!" },
            image: { type: "string", example: "https://example.com/image.jpg" },
          },
        },
        PaginatedPosts: {
          type: "object",
          properties: {
            posts: {
              type: "array",
              items: { $ref: "#/components/schemas/Post" },
            },
            hasMore: { type: "boolean", description: "Whether more pages exist" },
            page: { type: "integer", description: "Current page number" },
            total: { type: "integer", description: "Total number of posts" },
          },
        },
        Comment: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Comment ID (MongoDB ObjectId)" },
            postId: { type: "string", description: "ID of the post this comment belongs to" },
            message: { type: "string", description: "Comment content" },
            createdBy: {
              type: "object",
              properties: {
                _id: { type: "string" },
                username: { type: "string" },
                email: { type: "string" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CommentRequest: {
          type: "object",
          required: ["message"],
          properties: {
            message: { type: "string", example: "Great post!" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
            },
          },
        },
      },
    },
    security: [],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
