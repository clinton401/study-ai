"use server";
import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { countAiGenerateContentDailyUsage, createAiGenerateContentUsage } from "@/data/ai-generate-content-usage";
import { rateLimit } from "@/lib/rate-limit";
import axios, { AxiosError } from "axios";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";

type ContentType = 'essay' | 'letter';
type Tone = 'formal' | 'academic' | 'casual' | 'friendly';
type Length = 'short' | 'medium' | 'long';

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
        };
    }>;
}

const generateContentError = (error: string) => errorResponse(error, { content: null });

export const generateContent = async (topic: string, contentType: string, tone: string, length: string) => {
    try {
        const session = await getServerUser();
        if (!session) {
            return generateContentError(ERROR_MESSAGES.UNAUTHORIZED);
        }

        const { error } = rateLimit(session.id, true, {
            windowSize: 2 * 60 * 1000,
            maxRequests: 3,
            lockoutPeriod: 2 * 60 * 1000,
        });
        if (error) {
            return generateContentError(error);
        }
        if (
            !contentType ||
            !tone ||
            !length ||
            !topic.trim()
          )return generateContentError("Make sure all fields a filled.")
        if (topic.trim().length < 2) {
            return generateContentError("Please enter more topic to generate (at least 2 characters).");
        }

        if (topic.length > 3000) return generateContentError("Topic to be generated must have maximum 3,000 characters");
        
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            return generateContentError("GEMINI_API_KEY variable is required");
        }
        
        await connectToDatabase();

        const usageCount = await countAiGenerateContentDailyUsage(session.id);
        if (usageCount >= 10) {
            return generateContentError("Daily AI content generation limit reached (10/10)");
        }

        const wordCounts: Record<Length, string> = {
            short: "500-750",
            medium: "750-1200",
            long: "1200-2000"
        };

        const contentTypeInstructions: Record<ContentType, { structure: string; approach: string }> = {
            essay: {
                structure: "Follow a clear introduction, body paragraphs, and conclusion structure while maintaining natural flow",
                approach: "Present arguments and analysis in a thoughtful, well-reasoned manner"
            },
            letter: {
                structure: "Include appropriate greeting, body, and closing sections typical of letter format",
                approach: "Write as if addressing a real person, with appropriate personal connection"
            }
        };

        const toneInstructions: Record<Tone, { language: string; voice: string }> = {
            formal: {
                language: "Use professional vocabulary and complete sentences, but avoid overly stiff or robotic phrasing",
                voice: "Maintain dignity and respect while showing human thoughtfulness"
            },
            academic: {
                language: "Use scholarly language with proper citations style, but include personal insights and natural academic voice",
                voice: "Write as a knowledgeable student or researcher with genuine curiosity and engagement"
            },
            casual: {
                language: "Use everyday language, contractions, and relaxed phrasing while staying coherent",
                voice: "Write as if talking to a friend, with natural conversational flow"
            },
            friendly: {
                language: "Use warm, approachable language with positive tone and inclusive phrasing",
                voice: "Write with genuine warmth and personal connection to the reader"
            }
        };

        const response = await axios.post<GeminiResponse>(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: `Create a ${wordCounts[length as Length]}-word ${tone} ${contentType} on "${topic}" that reads as if written by a thoughtful human.
        
Content Type: ${contentType.toUpperCase()}
${contentTypeInstructions[contentType as ContentType]?.structure || ''}
${contentTypeInstructions[contentType as ContentType]?.approach || ''}

Tone: ${tone.toUpperCase()}
${toneInstructions[tone as Tone]?.language || ''}
${toneInstructions[tone as Tone]?.voice || ''}

Humanization Requirements:
- Natural, varied sentence structures (mix short, medium, and long sentences)
- Include personal insights, examples, or relatable references appropriate for ${tone} tone
- Use transitions that feel conversational yet suit the ${tone} style
- Balance ${tone} language with human authenticity
- Add subtle imperfections that feel natural (not perfect AI writing)
- Vary paragraph lengths organically
- ${tone === 'casual' || tone === 'friendly' ? 'Include occasional rhetorical questions or direct address to reader' : 'Maintain appropriate formality while showing human perspective'}
- Show genuine voice and perspective within ${tone} boundaries
- Avoid AI-like precision or overly mechanical formatting
- Make it feel like a real person wrote this ${contentType} with care and thought
- Natural sentence variety (avoid repetitive patterns)
- Authentic voice that matches the ${tone} tone
- Personal touches appropriate for ${tone} ${contentType}
- Organic paragraph flow and transitions
- Subtle imperfections that feel genuinely human
- Engaging content that shows real thought and care

Write only the ${contentType} content - no introductory text, explanations, or meta-commentary.

${contentType === 'letter' ? 'Include appropriate letter formatting (greeting, body, closing).' : ''}

Topic: ${topic}`
                    }]
                }]
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000
            }
        );

        const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!result) return generateContentError("Failed to generate content");
        
        await createAiGenerateContentUsage(session.id);
        return { content: result, error: null };

    } catch (err) {
        if (axios.isAxiosError(err)) {
            const axiosError = err as AxiosError;
            console.error("Axios error status:", axiosError.response?.status);
            console.error("Axios error data:", axiosError.response?.data);
        } else {
            console.error("Unknown error:", err);
        }

        return generateContentError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}