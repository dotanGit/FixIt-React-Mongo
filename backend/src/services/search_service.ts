import Post from "../models/post_model";
import Comment from "../models/comment_model";
import User from "../models/user_model";
import { ParsedQuery } from "./llm_service";

class SearchService {

    async searchPosts(parsedQuery: ParsedQuery): Promise<any[]> {
        try {
            const mongoQuery = await this.buildMongoQuery(parsedQuery);

            const posts = await Post.find(mongoQuery)
                .populate('createdBy', 'username email avatar')
                .sort({ createdAt: -1 });

            const postsWithCommentCount = await Promise.all(
                posts.map(async (post: any) => {
                    const commentCount = await Comment.countDocuments({ postId: post._id });
                    return { ...post.toObject(), commentCount };
                })
            );

            return postsWithCommentCount;
        } catch (error) {
            console.error('Search service error:', error);
            throw new Error('Search operation failed');
        }
    }

    private async buildMongoQuery(parsed: ParsedQuery): Promise<any> {
        if (!parsed || Object.keys(parsed).length <= 1) {
            // Only has originalQuery, no useful filters extracted
            return {};
        }

        const filters: any[] = [];

        // Filter by sender (username) — find matching user IDs first
        if (parsed.sender && parsed.sender.trim() !== '') {
            const senderRegex = this.escapeRegex(parsed.sender.trim());
            const matchingUsers = await User.find({
                username: { $regex: new RegExp(senderRegex, 'i') }
            }).select('_id');

            if (matchingUsers.length > 0) {
                filters.push({
                    createdBy: { $in: matchingUsers.map(u => u._id) }
                });
            } else {
                // No users match this sender — return impossible query so no results come back
                return { _id: null };
            }
        }

        // Filter by keywords in the message field
        if (parsed.keywords && parsed.keywords.length > 0) {
            // Filter out empty and too-short keywords (less than 2 chars)
            const validKeywords = parsed.keywords.filter(k => k.trim().length >= 2);

            if (validKeywords.length === 1) {
                // Use word boundary \b so "fix" matches "fix" or "fixed" but not "prefix"
                const keywordRegex = this.escapeRegex(validKeywords[0]);
                filters.push({
                    message: { $regex: new RegExp(`\\b${keywordRegex}`, 'i') }
                });
            } else if (validKeywords.length > 1) {
                const keywordFilters = validKeywords.map(keyword => ({
                    message: { $regex: new RegExp(`\\b${this.escapeRegex(keyword)}`, 'i') }
                }));
                filters.push({ $or: keywordFilters });
            }
        }

        if (filters.length === 0) {
            // No valid filters built — return impossible query so nothing matches
            return { _id: null };
        } else if (filters.length === 1) {
            return filters[0];
        } else {
            return { $and: filters };
        }
    }

    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

export default new SearchService();
