import Comment from "../models/comment_model";
import BaseController from "./baseContorller";
import { AuthRequest } from "../middleware/auth_middleware";
import { Response, Request } from "express";
import llmService from '../services/llm_service';


class commentsController extends BaseController {
    constructor() {
        super(Comment);
    }

    // Override getAll to populate user information
    async getAll(req: Request, res: Response) {
        try {
            const filter: any = {};
            if (req.query.postId) {
                filter.postId = req.query.postId;
            }
            const comments = await this.model.find(filter).populate('createdBy', 'username email avatar');
            return res.json(comments);
        } catch (err) {
            console.error(err);
            return res.status(500).send("Error retrieving comments");
        }
    }

    // Override getById to populate user information
    async getById(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const comment = await this.model.findById(id).populate('createdBy', 'username email avatar');
            if (!comment) {
                return res.status(404).send("Comment not found");
            }
            return res.json(comment);
        } catch (err) {
            console.error(err);
            return res.status(500).send("Error retrieving comment");
        }
    }

    // Override create method — moderate content before saving
    async create(req: AuthRequest, res: Response) {
        if (req.user) {
            req.body.createdBy = req.user._id;
        }
        const commentData = req.body;
        try {
            if (!commentData.message || commentData.message.trim() === "") {
                return res.status(400).send("Message is required");
            }
            if (req.params.id) {
                commentData.postId = req.params.id;
            }

            // Moderate comment text before saving
            const modResult = await llmService.moderateContent(commentData.message);
            if (!modResult.approved) {
                return res.status(400).json({
                    message: `Your comment was not allowed: ${modResult.reason || 'Inappropriate content detected'}`
                });
            }

            const comment = await this.model.create(commentData);
            const populatedComment = await this.model.findById(comment._id).populate('createdBy', 'username email avatar');
            return res.status(201).json(populatedComment);
        } catch (err) {
            console.error(err);
            return res.status(500).send("Error creating comment");
        }
    };

    //OVERRIDE DELETE to ensure only creator can delete
    async del(req: AuthRequest, res: Response) {
        const id = req.params.id;
        try {
            const comment = await this.model.findById(id);
            if (!comment) {
                res.status(404).send("Comment not found");
                return;
            }
            // Check if the authenticated user is the creator of the post
            if (req.user && comment.createdBy.toString() === req.user._id) {
                super.del(req, res);
                return
            } else {
                res.status(403).send("Forbidden: You are not the creator of this comment");
                return;
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error deleting comment");
        }
    };


     //override put to prevent changing createdBy and ensure only creator can update
     async update(req: AuthRequest, res: Response) {
        const id = req.params.id;
        try {
            const comment = await this.model.findById(id);
            if (!comment) {
                return res.status(404).send("Comment not found");
            }
            // Check if the authenticated user is the creator of the comment
            if (req.user && comment.createdBy.toString() !== req.user._id) {
                return res.status(403).send("Forbidden: You are not the creator of this comment");
            }
            // Prevent changing createdBy field
            if (req.body.createdBy && req.body.createdBy !== comment.createdBy.toString()) {
                return res.status(400).send("Cannot change creator of the comment");
            }
            return super.update(req, res);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send("Error updating comment");
        }
    };
    
};

const commentsControllerInstance = new commentsController();
export default commentsControllerInstance;