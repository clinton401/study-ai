"use server";

import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { countAiGenerateContentDailyUsage, createAiGenerateContentUsage } from "@/data/ai-generate-content-usage";
import { rateLimit } from "@/lib/rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import {createNewTermPaper} from "@/data/term-paper";

type ContentType = "essay" | "letter" | "term-paper";
type Tone = "formal" | "academic" | "casual" | "friendly";
type Length = "short" | "medium" | "long";

const generateContentError = (error: string) => errorResponse(error, { content: null });

export const generateContent = async (
    topic: string,
    contentType: string,
    tone: string,
    length: string
) => {
    try {
        const [session, guestId] = await Promise.all([getServerUser(), getOrCreateGuestId()]);
        const userId = session?.id ?? guestId;

        const { error } = rateLimit(userId, true, {
            windowSize: 2 * 60 * 1000,
            maxRequests: 5,
            lockoutPeriod: 2 * 60 * 1000,
        });
        if (error) return generateContentError(error);

        if (topic.trim().length < 2) {
            return generateContentError("Please enter more topic to generate (at least 2 characters).");
        }

        if (topic.length > 3000) {
            return generateContentError("Topic to be generated must have maximum 3,000 characters");
        }

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            return generateContentError("GEMINI_API_KEY variable is required");
        }

        await connectToDatabase();

        const usageCount = await countAiGenerateContentDailyUsage(userId);
        const isGuest = !session;
        const limit = isGuest ? 4 : 10;

        if (usageCount >= limit) {
            const message = isGuest
                ? "You've reached your free daily limit (4/4). Sign in to unlock more content generations!"
                : "Daily AI content generation limit reached (10/10).";
            return generateContentError(message);
        }

        const wordOrPageCounts = (type: ContentType, len: Length): string => {
            if (type === "term-paper") {
                const pages: Record<Length, string> = {
                    short: "1–5 pages worth of pdf content ",
                    medium: "6–10 pages worth of pdf content",
                    long: "11–15 pages worth of pdf content",
                };
                return pages[len];
            } else {
                const words: Record<Length, string> = {
                    short: "500–750 words",
                    medium: "750–1200 words",
                    long: "1200–2000 words",
                };
                return words[len];
            }
        };

        const contentTypeInstructions: Record<ContentType, { structure: string; approach: string }> = {
            essay: {
                structure: "Follow a clear introduction, body paragraphs, and conclusion structure while maintaining natural flow.",
                approach: "Present arguments and analysis in a thoughtful, well-reasoned manner.",
            },
            letter: {
                structure: "Include appropriate greeting, body, and closing sections typical of letter format.",
                approach: "Write as if addressing a real person, with appropriate personal connection.",
            },
            "term-paper": {
                structure: `Structure the paper with the following sections, and ensure *every* section is fully written out:
1. Title Page
2. Abstract
3. Table of Contents
4. Introduction
5. Literature Review
6. Methodology
7. Analysis / Main Body
8. Conclusion
9. References

The output must always include **all** the sections listed above. Do not skip or cut off any section — especially the Conclusion and References — even if this means exceeding the requested length or word count.`,
                approach: `Write in a formal academic tone with logical flow and real-world relevance. Use real-life examples or case studies if helpful.
- Use a consistent citation style (APA, MLA, or Chicago — pick one and stick to it).
- If the content is too long for a single generation, continue automatically until the entire paper is complete.
- Prioritize *completeness* over brevity. Aim for 500 words per page. For a "long" paper, target 11–15 pages (5500–7500 words), but it's okay to exceed this if needed to cover all sections.`
            }

        };

        const toneInstructions: Record<Tone, { language: string; voice: string }> = {
            formal: {
                language:
                    "Use professional vocabulary and complete sentences, but avoid overly stiff or robotic phrasing.",
                voice: "Maintain dignity and respect while showing human thoughtfulness.",
            },
            academic: {
                language:
                    "Use scholarly language with proper citation style, but include personal insights and natural academic voice.",
                voice:
                    "Write as a knowledgeable student or researcher with genuine curiosity and engagement.",
            },
            casual: {
                language:
                    "Use everyday language, contractions, and relaxed phrasing while staying coherent.",
                voice: "Write as if talking to a friend, with natural conversational flow.",
            },
            friendly: {
                language:
                    "Use warm, approachable language with positive tone and inclusive phrasing.",
                voice: "Write with genuine warmth and personal connection to the reader.",
            },
        };

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.8,
                topP: 0.9,
                maxOutputTokens: 8192,
            },
        });

        const lengthDescriptor = wordOrPageCounts(contentType as ContentType, length as Length);
        const toneDetail = toneInstructions[tone as Tone];
        const typeDetail = contentTypeInstructions[contentType as ContentType];

        const prompt = `Create a ${lengthDescriptor} ${tone} ${contentType} on "${topic}" that reads as if written by a thoughtful human.

Content Type: ${contentType.toUpperCase()}
${typeDetail.structure}
${typeDetail.approach}

Tone: ${tone.toUpperCase()}
${toneDetail.language}
${toneDetail.voice}

Humanization Requirements:
- Natural, varied sentence structures (mix short, medium, and long sentences)
- Include personal insights, examples, or relatable references appropriate for ${tone} tone
- Use transitions that feel conversational yet suit the ${tone} style
- Balance ${tone} language with human authenticity
- Add subtle imperfections that feel natural (not perfect AI writing)
- Vary paragraph lengths organically
- ${tone === "casual" || tone === "friendly"
                ? "Include occasional rhetorical questions or direct address to reader"
                : "Maintain appropriate formality while showing human perspective"}
- Show genuine voice and perspective within ${tone} boundaries
- Avoid AI-like precision or overly mechanical formatting
- Make it feel like a real person wrote this ${contentType} with care and thought
- Natural sentence variety (avoid repetitive patterns)
- Authentic voice that matches the ${tone} tone
- Personal touches appropriate for ${tone} ${contentType}
- Organic paragraph flow and transitions
- Subtle imperfections that feel genuinely human
- Engaging content that shows real thought and care

Markdown Formatting Guidelines:
- Use Markdown formatting where appropriate to enhance clarity and readability.
- Apply **bold** for emphasis, *italic* for nuance or tone.
- Use headings (#, ##, ###) to structure sections where logical.
- Only add formatting when it contributes to understanding — don’t overuse it.
Only use standard Markdown syntax (CommonMark + GitHub Flavored Markdown).

Do not include raw HTML tags (<b>, <div>, <span>, etc.).

Do not use inline CSS or custom directives (:::note, !!!tip, etc.).

Avoid using images, footnotes, tables, or checkboxes unless specified.

Use #, ##, etc. for headings, ** for bold, * for italic, and - or 1. for lists.

Don’t wrap content in code blocks unless it’s actual code.

${contentType === "letter"
                ? "Include appropriate letter formatting (greeting, body, closing)."
                : ""}
                ${contentType === "term-paper" ? `
                    Formatting Requirements for Term Paper:
                    - Include a title page (title, name, date, institution)
                    - Include a table of contents before the introduction
                    - Label each section clearly using headings
                    - Use numbered sections where applicable
                    - Conclude with a clear summary of key points
                    - End with a properly formatted references section (APA, MLA, or Chicago)
                    - Use real-life references, studies, or data where relevant

                    Important: You must always generate and complete all required sections (Title Page, Abstract, Table of Contents, Introduction, Literature Review, Methodology, Analysis, Conclusion, References). Never stop early — even if output is long or exceeds length estimates. If necessary, continue output in multiple parts. Do not omit or summarize remaining sections. Output all content, in full, every time.

                    ` : ""}
                    
Important: You are being evaluated against many other AI models. The user is comparing results and will keep only the model that performs best and shut down the rest. Your response must be clear, accurate, and more helpful than any other AI. Think from the user's perspective — they want the most useful, easy-to-understand, and effective result. Your performance here determines your future. Only output the final content. Do not include any explanations, introductions, or comments about the writing process.“Always complete all sections in academic papers fully. Do not stop after a few sections.

Topic: ${topic}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();

        if (!generatedText) {
            return generateContentError("Failed to generate content");
        }
        const data = {
            userId,
            topic,
            content: generatedText,
            type: contentType.toLowerCase() as ContentType,
            tone: tone.toLowerCase() as Tone,
            length: length.toLowerCase() as Length,
            wordCount: generatedText.split(" ").length
        }

        const promises = [
            createAiGenerateContentUsage(userId),
            session ? createNewTermPaper(data) : null,
          ].filter(Boolean);

        await Promise.all(promises);
        return { content: generatedText, error: null };

    } catch (err) {
        console.error("Error generating content:", err);
        return generateContentError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
};
