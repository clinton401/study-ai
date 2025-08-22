import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages } from "ai";
import { type NextRequest } from "next/server";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limit";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";

export const maxDuration = 60;





export async function POST(req: NextRequest) {
    try {
        const [session, guestId] = await Promise.all([getServerUser(), getOrCreateGuestId()]);
        
          const userId = session?.id ?? guestId;
        
          const { error } = rateLimit(userId, true, {
            windowSize: 1 * 60 * 1000,
            maxRequests: 10,
            lockoutPeriod: 1 * 60 * 1000,
          });
        if (error) {
            return Response.json(
                { error: "Rate limit exceeded. Please try again in a minute." },
                { status: 429 }
            );
        }

        const { messages, context } = await req.json();

        if (!messages || messages.length === 0) {
            return Response.json(
                { error: "No messages provided" },
                { status: 400 }
            );
        }

        if (!context || context.trim().length === 0) {
            return Response.json(
                { error: "No context provided" },
                { status: 400 }
            );
        }
        const MAX_MESSAGES = 40;
const MAX_CHARS_PER_MESSAGE = 1000;

const latestMessage = messages[messages.length - 1]?.content ?? "";

    if (latestMessage.length > MAX_CHARS_PER_MESSAGE) {
      return Response.json(
        { error: "Message too long. Try shortening it to 1000 characters or less." },
        { status: 400 }
      );
    }
if (messages.length > MAX_MESSAGES) {
  return Response.json({
    error: "You’ve reached the chat limit. Please refresh to start a new conversation."
  }, { status: 400 });
}


        const maxContextLength = 750000; 
        const truncatedContext = context.length > maxContextLength
            ? context.substring(0, maxContextLength) + "...[truncated]"
            : context;
        const result =  streamText({
            model: google("models/gemini-1.5-flash"), 
            messages: convertToModelMessages(messages),
            system: `You are an assistant that only answers questions using the given context below. 
If the answer isn't in the context, reply with "The information is not available in the provided content."
Be concise and helpful in your responses.
Rules for responses:
- Keep answers brief and direct
- Maximum 50 words unless the question requires more detail
- No unnecessary explanations or background information
- Get straight to the point
Context:
${truncatedContext}`,
            temperature: 0.1,
        });

        // console.log('streamText completed, returning response');

        return result.toTextStreamResponse();
    } catch (err) {
        console.error("Chat error:", err);

        if (err instanceof Error) {
            if (err.message.includes('quota')) {
                return Response.json({
                        error: "API quota exceeded. Please try again later."
                }, { status: 429, });
            }

            if (err.message.includes('invalid')) {
                return Response.json({
                    error: "Invalid request. Please check your input."
            }, { status: 400, });
           
            }
        }
        return Response.json({
            error: "An error occurred while processing your request."
        }, { status: 500, });
   
    }
}