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
const post_model_1 = __importDefault(require("../models/post_model"));
const baseContorller_1 = __importDefault(require("./baseContorller"));
class postsController extends baseContorller_1.default {
    constructor() {
        super(post_model_1.default);
    }
    // Override create method 
    create(req, res) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (req.user) {
                req.body.createdBy = req.user._id;
            }
            return _super.create.call(this, req, res);
        });
    }
    ;
    //OVERRIDE DELETE to ensure only creator can delete
    del(req, res) {
        const _super = Object.create(null, {
            del: { get: () => super.del }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const post = yield this.model.findById(id);
                if (!post) {
                    res.status(404).send("Post not found");
                    return;
                }
                // Check if the authenticated user is the creator of the post
                if (req.user && post.createdBy.toString() === req.user._id) {
                    _super.del.call(this, req, res);
                    return;
                }
                else {
                    res.status(403).send("Forbidden: You are not the creator of this post");
                    return;
                }
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error deleting post");
            }
        });
    }
    ;
    //override put to prevent changing createdBy and ensure only creator can update
    update(req, res) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const post = yield this.model.findById(id);
                if (!post) {
                    return res.status(404).send("Post not found");
                }
                // Check if the authenticated user is the creator of the post
                if (req.user && post.createdBy.toString() !== req.user._id) {
                    return res.status(403).send("Forbidden: You are not the creator of this post");
                }
                // Prevent changing createdBy field
                if (req.body.createdBy && req.body.createdBy !== post.createdBy.toString()) {
                    return res.status(400).send("Cannot change creator of the post");
                }
                return _super.update.call(this, req, res);
            }
            catch (err) {
                console.error(err);
                return res.status(500).send("Error updating post");
            }
        });
    }
    ;
}
;
const postsControllerInstance = new postsController();
exports.default = postsControllerInstance;
//# sourceMappingURL=posts_controller.js.map