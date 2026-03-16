import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export interface ModerationResult {
    approved: boolean;
    reason?: string;
}

// Local profanity list used as fallback when the OpenAI API is unavailable
const PROFANITY_LIST = [
    'fuck', 'fucker', 'fucking', 'motherfucker', 'motherfucking',
    'shit', 'bullshit', 'shitty',
    'bitch', 'bitches',
    'ass', 'asshole', 'arsehole',
    'bastard',
    'cunt',
    'dick', 'dickhead',
    'cock', 'cocksucker',
    'pussy',
    'prick',
    'whore', 'slut',
    'nigger', 'nigga',
    'fag', 'faggot',
    'retard', 'retarded',
    'damn', 'goddamn',
];

class LlmService {

    private getClient(): OpenAI {
        return new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    /** Quick local profanity check — no network call required */
    private localModerate(text: string): ModerationResult {
        const lower = text.toLowerCase();
        const found = PROFANITY_LIST.filter(word =>
            new RegExp(`\\b${word}\\b`, 'i').test(lower)
        );
        if (found.length > 0) {
            return { approved: false, reason: 'Content contains inappropriate language' };
        }
        return { approved: true };
    }

    async moderateContent(text: string, imageUrl?: string): Promise<ModerationResult> {
        // ── TEXT: gpt-4o-mini (cheapest model), fall back to local filter ──
        if (text && text.trim()) {
            if (!process.env.OPENAI_API_KEY) {
                const localResult = this.localModerate(text);
                if (!localResult.approved) return localResult;
            } else {
                try {
                    const completion = await this.getClient().chat.completions.create({
                        model: 'gpt-4o-mini',
                        response_format: { type: 'json_object' },
                        temperature: 0,
                        messages: [
                            {
                                role: 'system',
                                content: `You are a content moderation assistant for a general social platform.
Analyze the text and determine if it is appropriate.
Flag as INAPPROPRIATE if it contains profanity, hate speech, harassment, explicit content, or threats.
Return ONLY valid JSON: {"approved": boolean, "reason": string (only when approved is false)}`
                            },
                            {
                                role: 'user',
                                content: text
                            }
                        ]
                    });

                    const responseText = completion.choices[0]?.message?.content;
                    if (responseText) {
                        const parsed = JSON.parse(responseText);
                        if (parsed.approved === false) {
                            return {
                                approved: false,
                                reason: parsed.reason || 'Inappropriate content detected'
                            };
                        }
                    }
                } catch (err: any) {
                    console.error('Text moderation error, falling back to local filter:', err?.status);
                    const localResult = this.localModerate(text);
                    if (!localResult.approved) return localResult;
                }
            }
        }

        // ── IMAGE: GPT-4o-mini vision (only when an image is present) ──
        if (imageUrl) {
            try {
                const imageContent = this.buildImageContent(imageUrl);
                if (imageContent) {
                    const completion = await this.getClient().chat.completions.create({
                        model: 'gpt-4o-mini',
                        response_format: { type: 'json_object' },
                        temperature: 0.1,
                        messages: [
                            {
                                role: 'system',
                                content: `You are a content moderation assistant.
Look at the provided image and determine if it is appropriate for a general social platform.
Flag as INAPPROPRIATE if it contains explicit sexual content/nudity, graphic violence, or hate symbols.
Return ONLY valid JSON: {"approved": boolean, "reason": string (only when approved is false)}`
                            },
                            {
                                role: 'user' as const,
                                content: [imageContent] as any
                            }
                        ]
                    });

                    const responseText = completion.choices[0]?.message?.content;
                    if (responseText) {
                        const parsed = JSON.parse(responseText);
                        if (parsed.approved === false) {
                            return {
                                approved: false,
                                reason: parsed.reason || 'Inappropriate image content detected'
                            };
                        }
                    }
                }
            } catch (err) {
                console.error('Image moderation error:', err);
            }
        }

        return { approved: true };
    }

    private buildImageContent(imageUrl: string): object | null {
        const match = imageUrl.match(/\/uploads\/([^?#]+)$/);
        if (match) {
            const filePath = path.join(process.cwd(), 'public', 'uploads', match[1]);
            if (fs.existsSync(filePath)) {
                const base64 = fs.readFileSync(filePath).toString('base64');
                const mimeType = this.guessMimeType(imageUrl);
                return {
                    type: 'image_url',
                    image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'low' }
                };
            }
        }
        if (!imageUrl.includes('localhost') && !imageUrl.includes('127.0.0.1')) {
            return { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } };
        }
        return null;
    }

    private guessMimeType(url: string): string {
        const lower = url.toLowerCase();
        if (lower.endsWith('.png'))  return 'image/png';
        if (lower.endsWith('.gif'))  return 'image/gif';
        if (lower.endsWith('.webp')) return 'image/webp';
        return 'image/jpeg';
    }

    async searchPosts(query: string, posts: { _id: string; message: string }[]): Promise<string[]> {
        if (!process.env.OPENAI_API_KEY || posts.length === 0) {
            // Fallback: simple keyword match
            const lower = query.toLowerCase();
            return posts
                .filter(p => p.message.toLowerCase().includes(lower))
                .map(p => p._id);
        }
        try {
            const postList = posts.map(p => `ID:${p._id} | ${p.message}`).join('\n');
            const completion = await this.getClient().chat.completions.create({
                model: 'gpt-4o-mini',
                response_format: { type: 'json_object' },
                temperature: 0,
                messages: [
                    {
                        role: 'system',
                        content: `You are a search assistant. Given a user query and a list of posts (each with ID and text), return the IDs of posts that are relevant to the query.
Return ONLY valid JSON: {"ids": ["id1", "id2", ...]}`
                    },
                    {
                        role: 'user',
                        content: `Query: ${query}\n\nPosts:\n${postList}`
                    }
                ]
            });
            const responseText = completion.choices[0]?.message?.content;
            if (responseText) {
                const parsed = JSON.parse(responseText);
                return Array.isArray(parsed.ids) ? parsed.ids : [];
            }
        } catch (err) {
            console.error('Search error, falling back to keyword match:', err);
            const lower = query.toLowerCase();
            return posts
                .filter(p => p.message.toLowerCase().includes(lower))
                .map(p => p._id);
        }
        return [];
    }
}

export default new LlmService();
