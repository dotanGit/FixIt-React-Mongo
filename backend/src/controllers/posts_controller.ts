import Post from "../models/post_model";
import BaseController from "./baseContorller";
import Comment from "../models/comment_model";
import { AuthRequest } from "../middleware/auth_middleware";
import { Response } from "express";
import { Request } from "express";



class postsController extends BaseController {
    constructor() {
        super(Post);
    }

    // Override getAll to populate user information and include comment count
    async getAll(req: Request, res: Response) {
        try {
            const posts = await this.model.find().populate('createdBy', 'username email avatar');
            
            const postsWithCommentCount = await Promise.all(
                posts.map(async (post: any) => {
                    const commentCount = await Comment.countDocuments({ postId: post._id });
                    return {
                        ...post.toObject(),
                        commentCount
                    };
                })
            );
            
            return res.json(postsWithCommentCount);
        } catch (err) {
            console.error(err);
            return res.status(500).send("Error retrieving posts");
        }
    }

    // Override getById to populate user information
    async getById(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const post = await this.model.findById(id).populate('createdBy', 'username email avatar');
            if (!post) {
                return res.status(404).send("Post not found");
            }
            return res.json(post);
        } catch (err) {
            console.error(err);
            return res.status(500).send("Error retrieving post");
        }
    }

    // Override create method 
    async create(req: AuthRequest, res: Response) {
        if (req.user) {
            req.body.createdBy = req.user._id; 
        }
        return super.create(req, res);
    };

    //OVERRIDE DELETE to ensure only creator can delete and delete associated comments
    async del(req: AuthRequest, res: Response) {
        const id = req.params.id;
        try {
            const post = await this.model.findById(id);
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }
            // Check if the authenticated user is the creator of the post
            if (req.user && post.createdBy.toString() === req.user._id) {
                // Delete all comments associated with this post
                await Comment.deleteMany({ postId: id });
                
                // Delete the post
                super.del(req, res);
                return
            } else {
                res.status(403).send("Forbidden: You are not the creator of this post");
                return;
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error deleting post");
        }
    };


     //override put to prevent changing createdBy and ensure only creator can update
     async update(req: AuthRequest, res: Response) {
        const id = req.params.id;
        try {
            const post = await this.model.findById(id);
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
            return super.update(req, res);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send("Error updating post");
        }
    };

    // Get posts by current user
    async getMyPosts(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).send("Unauthorized");
            }
            
            const posts = await this.model.find({ createdBy: req.user._id }).populate('createdBy', 'username email avatar');
            
            const postsWithCommentCount = await Promise.all(
                posts.map(async (post: any) => {
                    const commentCount = await Comment.countDocuments({ postId: post._id });
                    return {
                        ...post.toObject(),
                        commentCount
                    };
                })
            );
            
            return res.json(postsWithCommentCount);
        } catch (err) {
            console.error(err);
            return res.status(500).send("Error retrieving user posts");
        }
    }

    
};

const postsControllerInstance = new postsController();
export default postsControllerInstance;