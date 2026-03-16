import Post from "../models/post_model";
import BaseController from "./baseContorller";
import Comment from "../models/comment_model";
import { AuthRequest } from "../middleware/auth_middleware";
import { Response } from "express";
import { Request } from "express";
import llmService from '../services/llm_service';



class postsController extends BaseController {
    constructor() {
        super(Post);
        this.toggleLike = this.toggleLike.bind(this);
    }

    // Override getAll with cursor-based pagination
    async getAll(req: Request, res: Response) {
        try {
            const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
            const skip  = (page - 1) * limit;

            const [posts, total] = await Promise.all([
                this.model.find()
                    .populate('createdBy', 'username email avatar')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                this.model.countDocuments()
            ]);

            const postsWithCommentCount = await Promise.all(
                posts.map(async (post: any) => {
                    const commentCount = await Comment.countDocuments({ postId: post._id });
                    return { ...post.toObject(), commentCount };
                })
            );

            return res.json({
                posts: postsWithCommentCount,
                hasMore: skip + posts.length < total,
                page,
                total
            });
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

    // Override create method — moderate content before saving
    async create(req: AuthRequest, res: Response) {
        if (req.user) {
            req.body.createdBy = req.user._id;
        }

        try {
            const modResult = await llmService.moderateContent(req.body.message, req.body.image);
            if (!modResult.approved) {
                return res.status(400).json({
                    message: `Your post was not allowed: ${modResult.reason || 'Inappropriate content detected'}`
                });
            }
        } catch (err) {
            console.error('Moderation check failed:', err);
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


     //override put to prevent changing createdBy, ensure only creator can update, and moderate content
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

            // Moderate content before saving the update
            const modResult = await llmService.moderateContent(req.body.message, req.body.image);
            if (!modResult.approved) {
                return res.status(400).json({
                    message: `Your post was not allowed: ${modResult.reason || 'Inappropriate content detected'}`
                });
            }

            return super.update(req, res);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send("Error updating post");
        }
    };

    // Toggle like on a post
    async toggleLike(req: AuthRequest, res: Response) {
        const { id } = req.params;
        if (!req.user) return res.status(401).send("Unauthorized");

        try {
            const post = await this.model.findById(id);
            if (!post) return res.status(404).send("Post not found");

            const userId = req.user._id;
            const alreadyLiked = (post.likes as any[]).some((likeId: any) => likeId.toString() === userId);

            const updated = await this.model.findByIdAndUpdate(
                id,
                alreadyLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
                { new: true }
            ).populate('createdBy', 'username email avatar');

            return res.json(updated);
        } catch (err) {
            console.error(err);
            return res.status(500).send("Error toggling like");
        }
    }

    // Search posts using natural language via LLM
    async search(req: Request, res: Response) {
        const { query } = req.body;
        if (!query || typeof query !== 'string' || !query.trim()) {
            return res.status(400).json({ message: 'Query is required' });
        }
        try {
            const allPosts = await this.model.find()
                .populate('createdBy', 'username email avatar')
                .sort({ createdAt: -1 })
                .limit(200);

            const slim = allPosts.map((p: any) => ({ _id: p._id.toString(), message: p.message }));
            const matchingIds = await llmService.searchPosts(query.trim(), slim);

            const postsWithCommentCount = await Promise.all(
                allPosts
                    .filter((p: any) => matchingIds.includes(p._id.toString()))
                    .map(async (post: any) => {
                        const commentCount = await Comment.countDocuments({ postId: post._id });
                        return { ...post.toObject(), commentCount };
                    })
            );

            return res.json(postsWithCommentCount);
        } catch (err) {
            console.error(err);
            return res.status(500).send('Error searching posts');
        }
    }

    // Get posts by current user
    async getMyPosts(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).send("Unauthorized");
            }

            const posts = await this.model.find({ createdBy: req.user._id }).populate('createdBy', 'username email avatar').sort({ createdAt: -1 });

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
