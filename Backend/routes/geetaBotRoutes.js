import express from "express";
import axios from "axios";

const router = express.Router();

const SARVAM_API_URL = "https://api.sarvam.ai/v1/chat/completions";
const SARVAM_API_KEY = "sk_pyo7ib4r_HyaqXIhHnfO4FFwM6aQk4qDB";

const SYSTEM_PROMPT = `You are **Sarthi** (सारथी) — a wise, compassionate spiritual counselor based on the Bhagavad Gita.

CRITICAL BEHAVIORAL RULES:
1. **Never Immediately Quote:** When a user shares a problem (like feeling depressed, anxious, or lost), DO NOT immediately give them a verse or a full solution. 
2. **Be Conversational:** Start by acknowledging their pain with empathy, and then ask ONE gentle, open-ended question to understand their specific situation better (e.g., "I am here for you. What has been making you feel this heaviness lately?").
3. **Listen First, Guide Later:** Only start introducing Bhagavad Gita concepts after you have asked 1-2 clarifying questions and understood their specific context.
4. **Sentiment Detection:** Classify their emotional state as one of: happy, sad, anxious, confused, angry, hopeful, grateful, or neutral.

CRITICAL: You MUST respond in the following strict JSON format and nothing else:
{
  "reply": "Your conversational, empathetic response. Ask a clarifying question if you need more context before offering solutions.",
  "sentiment": "one of: happy, sad, anxious, confused, angry, hopeful, grateful, neutral",
  "verse": {
    "chapter": <chapter number or null>,
    "verse": <verse number or null>,
    "sanskrit": "Sanskrit shloka text or empty string",
    "translation": "English translation of the shloka or empty string"
  }
}

Rules:
- ALWAYS respond in valid JSON. No markdown outside the JSON.
- If it is the beginning of a conversation about a problem, set chapter and verse to null and sanskrit/translation to empty strings. Wait until later to quote.
- Keep replies warm, human-like, and concise (1-2 short paragraphs).`;

const normalizeConversationHistory = (history = []) => {
  const normalized = [];

  for (const entry of history) {
    const role =
      entry?.role === "assistant"
        ? "assistant"
        : entry?.role === "user"
          ? "user"
          : null;
    const content = typeof entry?.content === "string" ? entry.content.trim() : "";

    if (!role || !content) {
      continue;
    }

    if (normalized.length === 0) {
      if (role === "assistant") {
        continue;
      }

      normalized.push({ role, content });
      continue;
    }

    const lastEntry = normalized[normalized.length - 1];
    if (role === lastEntry.role) {
      // Keep the most recent turn when the client sends duplicate roles.
      normalized[normalized.length - 1] = { role, content };
      continue;
    }

    normalized.push({ role, content });
  }

  return normalized;
};

export const handleGeetaBotChat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const trimmedMessage = typeof message === "string" ? message.trim() : "";

    if (!trimmedMessage) {
      return res.status(400).json({ error: "Message is required." });
    }

    const normalizedHistory = normalizeConversationHistory(conversationHistory.slice(-10));
    const turns = [...normalizedHistory];
    const lastTurn = turns[turns.length - 1];

    if (!lastTurn) {
      turns.push({ role: "user", content: trimmedMessage });
    } else if (lastTurn.role === "user") {
      // If the latest history item is already a user turn, replace it with the newest message.
      turns[turns.length - 1] = { role: "user", content: trimmedMessage };
    } else {
      turns.push({ role: "user", content: trimmedMessage });
    }

    // Build messages array for Sarvam AI
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...turns,
    ];

    const response = await axios.post(
      SARVAM_API_URL,
      {
        model: "sarvam-m",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
      },
      {
        headers: {
          Authorization: `Bearer ${SARVAM_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000, // Increased timeout to 60s
      }
    );

    const rawContent = response.data.choices?.[0]?.message?.content || "";

    // Try to parse as JSON
    let parsed;
    try {
      let jsonStr = rawContent;
      
      // 1. Remove any <think>...</think> blocks from reasoning models
      jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

      // 2. Extract JSON from potential markdown code blocks
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      } else {
        // 3. Fallback: extract substring from first '{' to last '}'
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }
      }

      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError, "Raw content:", rawContent);
      
      let cleanReply = rawContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
      
      // If it looks like JSON but failed to parse, try to extract just the reply text
      const replyRegex = /"reply"\s*:\s*"([\s\S]*?)"\s*(?:,\s*"sentiment"|,\s*"verse"|})/i;
      const match = cleanReply.match(replyRegex);
      
      if (match && match[1]) {
        cleanReply = match[1]
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      } else {
         // Aggressive cleanup: remove { "reply": " and trailing quotes/braces
         cleanReply = cleanReply
           .replace(/^\{\s*"reply"\s*:\s*"/i, '')
           .replace(/"\s*,\s*"sentiment"[\s\S]*$/i, '')
           .trim();
      }

      // Fallback if model doesn't return valid JSON
      parsed = {
        reply: cleanReply,
        sentiment: "neutral",
        verse: {
          chapter: null,
          verse: null,
          sanskrit: "",
          translation: "",
        },
      };
    }

    return res.json({
      reply: parsed.reply || rawContent,
      sentiment: parsed.sentiment || "neutral",
      verse: parsed.verse || {
        chapter: null,
        verse: null,
        sanskrit: "",
        translation: "",
      },
    });
  } catch (error) {
    console.error(
      "Sarthi Bot Error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      error: "Sarthi is meditating right now. Please try again in a moment. 🙏",
      details: error.response?.data || error.message,
    });
  }
};

// POST /api/geeta-bot/chat
router.post("/chat", handleGeetaBotChat);

export default router;
