"use server";

import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { 
  countAiGenerateContentDailyUsage, 
  createAiGenerateContentUsage 
} from "@/data/ai-generate-content-usage";
import { rateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import { createNewTermPaper } from "@/data/term-paper";
import { generateText } from 'ai';
import { openrouter, getModelForFeature } from "@/lib/ai-client";

// Type definitions
type ContentType = "essay" | "letter" | "term-paper";
type Tone = "formal" | "academic" | "casual" | "friendly";
type Length = "short" | "medium" | "long";

interface GenerateContentResult {
  content: string | null;
  id: string | null;
  error: string | null;
}

// Constants
const VALIDATION = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 3_000,
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

const generateContentError = (error: string): GenerateContentResult => 
  errorResponse(error, { content: null, id: null });

/**
 * Get word/page count instructions based on content type and length
 */
const wordOrPageCounts = (type: ContentType, len: Length): string => {
  if (type === "term-paper") {
    const pages: Record<Length, string> = {
      short: "1–5 pages worth of content",
      medium: "6–10 pages worth of content",
      long: "11–15 pages worth of content",
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

/**
 * Content type-specific instructions
 */
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
- Prioritize *completeness* over brevity. Aim for 500 words per page. For a "long" paper, target 11–15 pages (5500–7500 words), but it's okay to exceed this if needed to cover all sections.`,
  },
};

/**
 * Tone-specific instructions
 */
const toneInstructions: Record<Tone, { language: string; voice: string }> = {
  formal: {
    language: "Use professional vocabulary and complete sentences, but avoid overly stiff or robotic phrasing.",
    voice: "Maintain dignity and respect while showing human thoughtfulness.",
  },
  academic: {
    language: "Use scholarly language with proper citation style, but include personal insights and natural academic voice.",
    voice: "Write as a knowledgeable student or researcher with genuine curiosity and engagement.",
  },
  casual: {
    language: "Use everyday language, contractions, and relaxed phrasing while staying coherent.",
    voice: "Write as if talking to a friend, with natural conversational flow.",
  },
  friendly: {
    language: "Use warm, approachable language with positive tone and inclusive phrasing.",
    voice: "Write with genuine warmth and personal connection to the reader.",
  },
};

/**
 * Build comprehensive content generation prompt
 */
function buildContentPrompt(
  topic: string,
  contentType: ContentType,
  tone: Tone,
  length: Length
): string {
  const lengthDescriptor = wordOrPageCounts(contentType, length);
  const toneDetail = toneInstructions[tone];
  const typeDetail = contentTypeInstructions[contentType];

  return `Create a ${lengthDescriptor} ${tone} ${contentType} on "${topic}" that reads as if written by a thoughtful human.

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
- Only add formatting when it contributes to understanding — don't overuse it.
- Do not include any surrounding quotes, triple quotes ("""), or extra delimiters at the beginning or end of the output. Return only the content itself.
- Only use standard Markdown syntax (CommonMark + GitHub Flavored Markdown).
- Do not include raw HTML tags (<b>, <div>, <span>, etc.).
- Do not use inline CSS or custom directives (:::note, !!!tip, etc.).
- Avoid using images, footnotes, tables, or checkboxes unless specified.
- Use #, ##, etc. for headings, ** for bold, * for italic, and - or 1. for lists.
- Don't wrap content in code blocks unless it's actual code.

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

Very Important: 
- NEVER include code fences (\`\`\`) of any kind in your response.
- NEVER include the word "markdown" in your response.
- Output must be plain Markdown only (headings, lists, bold, italic, etc.).
- The final content must NOT start or end with \`\`\`markdown or \`\`\`.

Topic: ${topic}
`;
}

/**
 * Clean AI output by removing markdown artifacts
 */
function cleanGeneratedContent(text: string): string {
  return text
    .replace(/```markdown/gi, "")
    .replace(/```/g, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

/**
 * Generate content based on topic, type, tone, and length using AI
 * 
 * @param topic - Topic to write about (2-3,000 characters)
 * @param contentType - Type of content (essay, letter, term-paper)
 * @param tone - Writing tone (formal, academic, casual, friendly)
 * @param length - Content length (short, medium, long)
 * @returns Generated content and optional paper ID
 */
export async function generateContent(
  topic: string,
  contentType: string,
  tone: string,
  length: string
): Promise<GenerateContentResult> {
  try {
    // Parallel auth checks
    const [session, guestId] = await Promise.all([
      getServerUser(),
      getOrCreateGuestId(),
    ]);

    const userId = session?.id ?? guestId;

    // Rate limiting
    const { error: rateLimitError } = await rateLimit(userId, {
      windowSize: VALIDATION.RATE_LIMIT.WINDOW_MS,
      maxRequests: VALIDATION.RATE_LIMIT.MAX_REQUESTS,
      lockoutPeriod: VALIDATION.RATE_LIMIT.LOCKOUT_MS,
    }, true, "CONTENT_GEN");

    if (rateLimitError) {
      return generateContentError(rateLimitError);
    }

    // Input validation
    const trimmedTopic = topic.trim();

    if (trimmedTopic.length < VALIDATION.MIN_LENGTH) {
      return generateContentError(
        `Please enter more topic to generate (at least ${VALIDATION.MIN_LENGTH} characters).`
      );
    }

    if (topic.length > VALIDATION.MAX_LENGTH) {
      return generateContentError(
        `Topic to be generated must have maximum ${VALIDATION.MAX_LENGTH.toLocaleString()} characters`
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check daily usage limit
    const usageCount = await countAiGenerateContentDailyUsage(userId);
    const isGuest = !session;
    const limit = isGuest
      ? VALIDATION.DAILY_LIMITS.GUEST
      : VALIDATION.DAILY_LIMITS.USER;

    if (usageCount >= limit) {
      const message = isGuest
        ? `You've reached your free daily limit (${limit}/${limit}). Sign in to unlock more content generations!`
        : `Daily AI content generation limit reached (${limit}/${limit}).`;

      return generateContentError(message);
    }

    // Generate content using Vercel AI SDK v4
    const { text: generatedText } = await generateText({
      model: openrouter(getModelForFeature('CONTENT')),
        system: `You are a professional academic writer. 
           STRICT RULE: Do not include any introductory remarks, "Chain of Thought", internal monologue, or meta-commentary about how you will write the paper. 
           DO NOT say things like "Okay, I will start by..." or "First, I'll...".
           Output ONLY the final content in Markdown format. 
           Start immediately with the Title Page or the content requested.`,
      prompt: buildContentPrompt(
        topic,
        contentType as ContentType,
        tone as Tone,
        length as Length
      ),
      temperature: 0.8,
      topP: 0.9,
    });

    // Validate AI output
    if (!generatedText?.trim()) {
      return generateContentError("Failed to generate content");
    }

    const cleanedContent = cleanGeneratedContent(generatedText);

    // Prepare data for storage
    const contentData = {
      userId,
      topic,
      content: cleanedContent,
      type: contentType.toLowerCase() as ContentType,
      tone: tone.toLowerCase() as Tone,
      length: length.toLowerCase() as Length,
      wordCount: cleanedContent.split(" ").length,
    };

    // Parallel operations: record usage and save paper
    const promises = [
      createAiGenerateContentUsage(userId),
      session ? createNewTermPaper(contentData) : null,
    ].filter(Boolean);

    const [, paper] = await Promise.all(promises);

    return { 
      content: cleanedContent, 
      error: null, 
      id: paper?._id?.toString() ?? null 
    };

  } catch (err) {
    console.error("Error generating content:", err);
    return generateContentError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}