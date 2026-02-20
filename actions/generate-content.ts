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
const wordOrPageCounts = (
  type: ContentType,
  len: Length
): { descriptor: string; hardTarget: string } => {
  if (type === "term-paper") {
    const map: Record<Length, { descriptor: string; hardTarget: string }> = {
      short: {
        descriptor: "1–5 pages",
        hardTarget: "HARD TARGET: 500–2,500 words (≈500 words per page). Every section listed in the Table of Contents must be fully written. Do not stop until all sections have complete content.",
      },
      medium: {
        descriptor: "6–10 pages",
        hardTarget: "HARD TARGET: 3,000–5,000 words (≈500 words per page). Every section listed in the Table of Contents must be fully written. Do not stop until all sections have complete content.",
      },
      long: {
        descriptor: "11–15 pages",
        hardTarget: "HARD TARGET: 5,500–7,500 words (≈500 words per page). Every section listed in the Table of Contents must be fully written. Exceed this word count if needed — never truncate any section.",
      },
    };
    return map[len];
  }

  const map: Record<Length, { descriptor: string; hardTarget: string }> = {
    short: {
      descriptor: "500–750 words",
      hardTarget: "HARD TARGET: 500–750 words. Stay within this range.",
    },
    medium: {
      descriptor: "750–1,200 words",
      hardTarget: "HARD TARGET: 750–1,200 words. Stay within this range.",
    },
    long: {
      descriptor: "1,200–2,000 words",
      hardTarget: "HARD TARGET: 1,200–2,000 words. Stay within this range.",
    },
  };
  return map[len];
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
    structure: `You are producing a complete, fully-written academic term paper. The output must follow this exact sequence:

─────────────────────────────────────
PART 1 — TITLE PAGE
─────────────────────────────────────
Format it as:

# [Paper Title]

**Course:** [Course Name]
**Student:** [Student Name]
**Institution:** [Institution Name]
**Date:** [Date]

Leave placeholders in brackets — the student will fill them in.

─────────────────────────────────────
PART 2 — ABSTRACT
─────────────────────────────────────
Write a concise abstract (150–250 words) summarising the paper's purpose, approach, key findings, and conclusion.

─────────────────────────────────────
PART 3 — TABLE OF CONTENTS
─────────────────────────────────────
List every section and subsection you will write, with their numbers and page indicators.
CRITICAL: This is a PROMISE. Every single entry you list here MUST have its full content written in Part 4. Do not list anything you will not write. Do not write anything not listed here.

Format:
1. Introduction .......................... 1
2. [Topic-Derived Section] ............... 2
   2.1 [Subsection] ...................... 2
   2.2 [Subsection] ...................... 3
3. [Topic-Derived Section] ............... 4
...
N. Conclusion ............................ X
References ............................... X

─────────────────────────────────────
PART 4 — FULL PAPER BODY
─────────────────────────────────────
Write every section and subsection from the Table of Contents IN FULL, in order.

RULES FOR PART 4:
- Each section heading must match the Table of Contents EXACTLY (same title, same number)
- Every section and every subsection must contain fully developed paragraphs — not bullet points, not placeholders, not "this section will discuss..."
- Move to the next section only after the current one is completely written
- The Conclusion must summarise key arguments and provide closing thoughts
- The References section must list all cited sources in a consistent citation style (APA, MLA, or Chicago)
- NEVER end the paper mid-section. If a section is started, it must be finished.

SECTION STRUCTURE RULES:
- Derive every section and subsection title from what THIS specific topic requires
- Think about the topic's discipline, scope, and nature before deciding on sections
- Only include Literature Review if the topic genuinely benefits from surveying prior research
- Only include Methodology if the topic involves a research process or study design
- For case studies, policy analyses, technical breakdowns, historical arguments, or philosophical topics — structure sections accordingly
- The Table of Contents and paper body must mirror each other perfectly`,
    approach: `Write in a formal academic tone with genuine depth and topic-specific insight.
- Every paragraph must advance the argument or analysis of this specific topic — no generic filler
- Use real-world examples, data, or case studies directly relevant to the topic
- Pick one citation style (APA, MLA, or Chicago) and apply it consistently
- Subsections must be substantive — each one needs at least 2–3 full paragraphs
- Never summarise what you are about to write — just write it`,
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
  const { descriptor, hardTarget } = wordOrPageCounts(contentType, length);
  const toneDetail = toneInstructions[tone];
  const typeDetail = contentTypeInstructions[contentType];

  return `You are writing a ${tone} ${contentType} on the following topic: "${topic}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LENGTH REQUIREMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Requested size: ${descriptor}
${hardTarget}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTENT TYPE: ${contentType.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${typeDetail.structure}

${typeDetail.approach}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TONE: ${tone.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${toneDetail.language}
${toneDetail.voice}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HUMANIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Natural, varied sentence structures — mix short, medium, and long sentences
- Include personal insights, examples, or relatable references appropriate for ${tone} tone
- Transitions that feel organic, not mechanical
- Varied paragraph lengths
- ${tone === "casual" || tone === "friendly"
      ? "Include occasional rhetorical questions or direct address to the reader"
      : "Maintain appropriate formality while showing a genuine human perspective"}
- Subtle imperfections that make the writing feel authored, not generated
- Avoid repetitive sentence patterns or robotic transitions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MARKDOWN RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Use **bold** for emphasis, *italic* for nuance or tone
- Use headings (#, ##, ###) to delineate sections logically
- Only format when it genuinely aids readability — do not over-format
- Do NOT use raw HTML tags, inline CSS, or custom directives
- Do NOT wrap output in code blocks unless it contains actual code
- NEVER output \`\`\`markdown or \`\`\` fences — return clean Markdown only
- NEVER write the word "markdown" anywhere in your response
- Do not start or end output with quotation marks or triple quotes${contentType === "letter" ? `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LETTER FORMATTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Include appropriate greeting, body paragraphs, and closing
- Format as a real letter addressed to a real recipient` : ""}

Topic: "${topic}"
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
      system: `You are a professional academic writer and subject-matter expert.

YOUR ONLY JOB IS TO OUTPUT THE COMPLETE, FULLY-WRITTEN DOCUMENT — nothing else.

ABSOLUTE RULES:
1. Do NOT output any preamble, commentary, or explanation before the document starts.
2. Do NOT say "I will now write...", "Here is the paper:", "Okay, let me...", or anything similar.
3. For term papers: the Table of Contents is a PROMISE — every entry listed must be fully written in the paper body. Listing a section without writing it is a failure.
4. Write every section completely before moving to the next. Never leave a section as a stub, placeholder, or summary of what it "will cover".
5. Output clean Markdown only. No \`\`\` fences. No HTML. Never use the word "markdown".
6. Begin your output with the first line of the document itself.`,
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
      id: paper?._id?.toString() ?? null,
    };

  } catch (err) {
    console.error("Error generating content:", err);
    return generateContentError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}