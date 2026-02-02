"use server";

import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import {
    countEditContentDailyUsage,
    createEditContent
} from "@/data/edit-content-usage";
import { rateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import {
    findTermPaperById,
    updateTermPaper
} from "@/data/term-paper";
import { generateText } from 'ai';
import { openrouter, getModelForFeature } from "@/lib/ai-client";

// Type definitions
interface EditContentResult {
    content: string | null;
    error: string | null;
    success?: string | null;
}

// Constants
const VALIDATION = {
    CONTENT_MIN_LENGTH: 200,
    CONTENT_MAX_LENGTH: 700_000,
    INSTRUCTIONS_MIN_LENGTH: 2,
    INSTRUCTIONS_MAX_LENGTH: 3_000,
    RATE_LIMIT: {
        WINDOW_MS: 2 * 60 * 1000,
        MAX_REQUESTS: 5,
        LOCKOUT_MS: 2 * 60 * 1000,
    },
    DAILY_LIMITS: {
        GUEST: 4,
        USER: 10,
    },
} as const;

const editContentError = (error: string): EditContentResult =>
    errorResponse(error, { content: null });

/**
 * Build surgical edit prompt with strict output requirements
 */
function buildEditPrompt(content: string, editMessage: string): string {
    return `You are a precise content editor. Your task is to edit the content below based on the user's instructions.

CRITICAL OUTPUT RULES - READ CAREFULLY:
1. Output ONLY the edited content
2. Do NOT include any explanations, commentary, or meta-text
3. Do NOT write "Here's the edited version" or similar phrases
4. Do NOT include any text before or after the edited content
5. Apply ONLY the requested edits - change nothing else
6. Keep all formatting, structure, and style exactly the same except where edited
7. If the edit instruction is unclear, make the smallest change possible
8. Start your response directly with the first word of the edited content
9. End your response with the last word of the edited content

FORMATTING:
- Preserve the original Markdown formatting
- Use # for headings, ** for bold, * for italic, - for lists
- NO code fences (\`\`\`)
- NO quotes around the content

USER'S EDIT INSTRUCTIONS:
${editMessage}

ORIGINAL CONTENT TO EDIT:
${content}

Apply the edits and output ONLY the complete edited content. Start now.`;
}

/**
 * Clean AI output by removing any preamble or explanations
 */
function cleanEditedContent(text: string): string {
    let cleaned = text
        .replace(/```markdown/gi, "")
        .replace(/```/g, "")
        .replace(/^["']|["']$/g, "")
        .trim();

    // Remove common AI explanation patterns at the start
    const explanationPatterns = [
        /^(Here's|Here is|I've|I have) (the )?(edited|revised|updated|modified)[\s\S]*?(?=\n\n|#{1,6}\s|\*\*[A-Z])/i,
        /^(Sure|Okay|Alright|Certainly)[\s\S]*?(?=\n\n|#{1,6}\s|\*\*[A-Z])/i,
    ];

    for (const pattern of explanationPatterns) {
        const match = cleaned.match(pattern);
        if (match) {
            cleaned = cleaned.substring(match.index! + match[0].length).trim();
        }
    }

    return cleaned;
}

/**
 * Edit content based on user instructions using AI
 * 
 * @param content - Content to edit (200-700,000 characters)
 * @param editMessage - Edit instructions (2-3,000 characters)
 * @param id - Optional term paper ID for authenticated users
 * @returns Edited content or error
 */
export async function editContent(
    content: string,
    editMessage: string,
    id: string | null
): Promise<EditContentResult> {
    try {
        // Parallel checks: auth, guest ID, and optional paper fetch
        const [session, guestId, paper] = await Promise.all([
            getServerUser(),
            getOrCreateGuestId(),
            id ? findTermPaperById(id) : Promise.resolve(null),
        ]);

        const userId = session?.id ?? guestId;

        // Validate paper exists if ID provided for authenticated user
        if (session && id && !paper) {
            return editContentError("Term paper not found");
        }

        // Rate limiting
        const { error: rateLimitError } = await rateLimit(userId, {
            windowSize: VALIDATION.RATE_LIMIT.WINDOW_MS,
            maxRequests: VALIDATION.RATE_LIMIT.MAX_REQUESTS,
            lockoutPeriod: VALIDATION.RATE_LIMIT.LOCKOUT_MS,
        }, true, "EDIT_CONTENT");

        if (rateLimitError) {
            return editContentError(rateLimitError);
        }

        // Input validation - content
        const trimmedContent = content.trim();

        if (trimmedContent.length < VALIDATION.CONTENT_MIN_LENGTH) {
            return editContentError(
                `The content is too short. Please provide at least ${VALIDATION.CONTENT_MIN_LENGTH} characters.`
            );
        }

        if (content.length > VALIDATION.CONTENT_MAX_LENGTH) {
            return editContentError(
                `Content to be edited must have maximum ${VALIDATION.CONTENT_MAX_LENGTH.toLocaleString()} characters`
            );
        }

        // Input validation - edit instructions
        const trimmedInstructions = editMessage.trim();

        if (trimmedInstructions.length < VALIDATION.INSTRUCTIONS_MIN_LENGTH) {
            return editContentError(
                `Your edit instructions are too short. Please enter at least ${VALIDATION.INSTRUCTIONS_MIN_LENGTH} characters.`
            );
        }

        if (editMessage.length > VALIDATION.INSTRUCTIONS_MAX_LENGTH) {
            return editContentError(
                `Your edit instructions are too long. The maximum allowed is ${VALIDATION.INSTRUCTIONS_MAX_LENGTH.toLocaleString()} characters.`
            );
        }

        // Connect to database
        await connectToDatabase();

        // Check daily usage limit
        const usageCount = await countEditContentDailyUsage(userId);
        const isGuest = !session;
        const limit = isGuest
            ? VALIDATION.DAILY_LIMITS.GUEST
            : VALIDATION.DAILY_LIMITS.USER;

        if (usageCount >= limit) {
            const message = isGuest
                ? `You've reached your free daily limit (${limit}/${limit}). Sign in to unlock more content edits!`
                : `Daily AI content edits limit reached (${limit}/${limit}).`;

            return editContentError(message);
        }

        // Generate edited content using Vercel AI SDK v4
        const { text: editedText } = await generateText({
            model: openrouter(getModelForFeature('EDIT')),
            prompt: buildEditPrompt(content, editMessage),
            temperature: 0.7, // Lower for more consistent edits
            topP: 0.9,
        });

        // Validate AI output
        if (!editedText?.trim()) {
            return editContentError(
                "The AI did not return valid content. Please try again."
            );
        }

        const cleanedContent = cleanEditedContent(editedText);

        // Validate cleaned output meets minimum length
        if (cleanedContent.length < VALIDATION.CONTENT_MIN_LENGTH) {
            return editContentError(
                "The edited content is too short. Please try again with different instructions."
            );
        }

        // Parallel operations: record usage and update paper if applicable
        const promises = [
            createEditContent(userId),
            session && id ? updateTermPaper(id, cleanedContent) : null,
        ].filter(Boolean);

        await Promise.all(promises);

        return {
            content: cleanedContent,
            error: null,
            success: "Content edited successfully",
        };

    } catch (err) {
        console.error("Error editing content:", err);
        return editContentError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}