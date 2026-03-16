import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export interface ModerationResult {
    approved: boolean;
    reason?: string;
}

export interface ParsedQuery {
    sender?: string;
    keywords?: string[];
    originalQuery: string;
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
        // ── TEXT: local profanity list only (no LLM call) ──
        if (text && text.trim()) {
            const localResult = this.localModerate(text);
            if (!localResult.approved) return localResult;
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

    async parseSearchQuery(query: string): Promise<ParsedQuery> {
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return { originalQuery: query || '' };
        }

        if (!process.env.OPENAI_API_KEY) {
            return this.fallbackParse(query);
        }

        try {
            const completion = await this.getClient().chat.completions.create({
                model: 'gpt-4o-mini',
                response_format: { type: 'json_object' },
                temperature: 0,
                messages: [
                    {
                        role: 'system',
                        content: `You are a query parser for a social platform with posts.
Parse the user's search query and extract structured filters.

Extract:
- keywords: array of relevant content keywords from the query (exclude common words like "posts", "by", "from", "the", "about")
- sender: the username if the query mentions "by [name]" or "from [name]"

Return ONLY valid JSON in this exact format:
{"keywords": ["keyword1", "keyword2"], "sender": "username"}
If no sender is mentioned, omit the "sender" field.
If no keywords found, return empty keywords array.`
                    },
                    {
                        role: 'user',
                        content: query
                    }
                ]
            });

            const responseText = completion.choices[0]?.message?.content;
            if (responseText) {
                const llmParsed = JSON.parse(responseText);
                const result: ParsedQuery = { originalQuery: query };

                if (llmParsed.sender && typeof llmParsed.sender === 'string') {
                    result.sender = llmParsed.sender.trim();
                }
                if (llmParsed.keywords && Array.isArray(llmParsed.keywords)) {
                    result.keywords = llmParsed.keywords
                        .filter((k: any) => typeof k === 'string')
                        .map((k: string) => k.trim())
                        .filter((k: string) => k.length > 0);
                }
                return result;
            }
        } catch (err) {
            console.error('LLM parse error, falling back to simple parsing:', err);
        }

        return this.fallbackParse(query);
    }

    private fallbackParse(query: string): ParsedQuery {
        const result: ParsedQuery = { originalQuery: query };

        // Try to extract sender from "by <name>" or "from <name>"
        const senderMatch = query.match(/(?:by|from)\s+(\w+)/i);
        if (senderMatch) {
            result.sender = senderMatch[1];
        }

        // Extract keywords: split on whitespace, remove short/common words
        const stopWords = ['the', 'and', 'or', 'in', 'from', 'with', 'by', 'posts', 'post', 'about', 'a', 'an'];
        const words = query.toLowerCase().split(/\s+/)
            .filter(w => w.length > 2 && !stopWords.includes(w));

        // Remove the sender word from keywords if present
        if (result.sender) {
            const senderLower = result.sender.toLowerCase();
            result.keywords = words.filter(w => w !== senderLower);
        } else {
            result.keywords = words;
        }

        return result;
    }
}

export default new LlmService();
