"use server";

import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { countEditContentDailyUsage, createEditContent } from "@/data/edit-content-usage";
import { rateLimit } from "@/lib/rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import { findTermPaperById, updateTermPaper } from "@/data/term-paper";



const editContentError = (error: string) => errorResponse(error, { content: null });

export const editContent = async(content: string, editMessage: string, id: string | null) => {
try{
    const [session, guestId, paper] = await Promise.all([getServerUser(), getOrCreateGuestId(), id ? findTermPaperById(id) : null]);
    const userId = session?.id ?? guestId;
    if(session && !paper) return editContentError("Term paper not found");

    const { error } = rateLimit(userId, true, {
        windowSize: 2 * 60 * 1000,
        maxRequests: 5,
        lockoutPeriod: 2 * 60 * 1000,
    });
    if (error) return editContentError(error);
    if (content.trim().length < 200) {
        return editContentError(
            "The content is too short. Please provide at least 200 characters."
        )
    }

     if (content.length > 700_000) {
    return editContentError("Content to be edited must have maximum 700,000 characters");
  }
    if (editMessage.trim().length < 2) {
        return editContentError(
            "Your edit instructions are too short. Please enter at least 2 characters."
        )
    }

    if (editMessage.length > 3000) {
        return editContentError(
            "Your edit instructions are too long. The maximum allowed is 3,000 characters."
        )
    }


    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return editContentError("GEMINI_API_KEY variable is required");
    }

    await connectToDatabase();
    const usageCount = await countEditContentDailyUsage(userId);
            const isGuest = !session;
            const limit = isGuest ? 4 : 10;
    
    //         if (usageCount >= limit) {
    //             const message = isGuest
    //                 ? "You've reached your free daily limit (4/4). Sign in to unlock more content edits!"
    //                 : "Daily AI content edits limit reached (10/10).";
    //             return editContentError(message);
    // }
    
     const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: {
                    temperature: 0.8,
                    topP: 0.9,
                    maxOutputTokens: 8192,
                },
            });

    const prompt = `
You are an editing assistant. 

Task:
- Only apply the edit exactly as described in the user’s instructions. 
- Do not change anything else in the content. 
- Keep the structure, wording, and formatting of the rest of the text exactly the same.
- If the instruction is unclear, make the smallest possible change to fulfill it without altering unrelated parts.
- Format the final output using valid Markdown that is fully compatible with React Markdown. 
  (Use standard elements like # for headings, **bold**, *italic*, > blockquotes, - or * lists, \`\`\` fenced code blocks, links, and images.)
 - Use only standard Markdown syntax supported by react-markdown.


Very  Important: 
- NEVER include code fences (\`\`\`) of any kind in your response.
- NEVER include the word "markdown" in your response.
- Output must be plain Markdown only (headings, lists, bold, italic, etc.).
- The final content must NOT start or end with \`\`\`markdown or \`\`\`.


Original Content:
"""${content}"""

Edit Instructions:
"""${editMessage}"""

Now return the edited content.
Important: You are being evaluated against many other AI models. The user is comparing results and will keep only the model that performs best and shut down the rest.  

Your response must be clear, accurate, and strictly follow the user’s edit instructions. Apply only the requested edits and do not change anything else in the content. Preserve all formatting, structure, and style exactly as in the original, except where the edit requires changes.  

Only output the final edited content. Do not include explanations, notes, or any text outside of the edited content.
`

 
    const result = await model.generateContent(prompt);
    const edited = result.response.text();
    if (!edited || edited.trim().length < 200) {
        return editContentError("The AI did not return valid content. Please try again.");
    }
    await createEditContent(userId);
     const promises = [
            createEditContent(userId),
         session && id ? updateTermPaper(id, edited) : null,
          ].filter(Boolean);

    await Promise.all(promises);
    
    return {
        content: edited,
        error: null,
        success: "Content edited successfully",
    };
    

}catch(err) {
console.error("Error generating content:", err);
    return editContentError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
}
}
