"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const posts_route_1 = __importDefault(require("./routes/posts_route"));
const user_route_1 = __importDefault(require("./routes/user_route"));
const comments_route_1 = __importDefault(require("./routes/comments_route"));
dotenv_1.default.config({ path: ".env.dev" });
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/posts", posts_route_1.default);
app.use("/users", user_route_1.default);
app.use("/comments", comments_route_1.default);
const initApp = () => {
    const pr = new Promise((resolve, reject) => {
        const dbUrl = process.env.DB_CONNECT;
        if (!dbUrl) {
            reject("DATABASE_URL is not defined");
            return;
        }
        mongoose_1.default
            .connect(dbUrl, {})
            .then(() => {
            resolve(app);
        });
        const db = mongoose_1.default.connection;
        db.on("error", (error) => console.error(error));
        db.once("open", () => console.log("Connected to Database"));
    });
    return pr;
};
exports.default = initApp;
//# sourceMappingURL=index.js.map