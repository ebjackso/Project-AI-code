import axios from "axios";

export async function moderateReport(text: string): Promise<{
  approved: boolean;
  reason?: string;
  confidence?: number;
}> {
  try {
    // Use OpenAI moderation API
    const response = await axios.post(
      "https://api.openai.com/v1/moderations",
      {
        input: text,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.results[0];

    // Check if content was flagged
    if (result.flagged) {
      const categories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category);

      return {
        approved: false,
        reason: `Content flagged for: ${categories.join(", ")}`,
        confidence: Math.max(...Object.values(result.category_scores as Record<string, number>)),
      };
    }

    return {
      approved: true,
      confidence: 0,
    };
  } catch (error) {
    console.error("Moderation check failed:", error);

    // Fallback: Simple regex-based moderation
    return simplerModeration(text);
  }
}

// Fallback moderation using simple patterns
function simplerModeration(text: string): {
  approved: boolean;
  reason?: string;
} {
  // Basic checks for obviously problematic content
  const flaggedPatterns = [
    /violence|kill|harm|attack/i,
    /spam|scam|fraud|phishing/i,
    /hate|slur|racist|discriminat/i,
  ];

  for (const pattern of flaggedPatterns) {
    if (pattern.test(text)) {
      return {
        approved: false,
        reason: "Content violates community guidelines",
      };
    }
  }

  // Check for minimum content
  if (text.trim().length < 10) {
    return {
      approved: false,
      reason: "Report must be at least 10 characters",
    };
  }

  return { approved: true };
}

// Real-time content safety monitoring
export async function analyzeContentSafety(text: string): Promise<{
  safe: boolean;
  scores: Record<string, number>;
}> {
  try {
    // Use OpenAI's moderation scores
    const response = await axios.post(
      "https://api.openai.com/v1/moderations",
      {
        input: text,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const result = response.data.results[0];

    return {
      safe: !result.flagged,
      scores: result.category_scores,
    };
  } catch (error) {
    console.error("Content safety analysis failed:", error);
    return {
      safe: true,
      scores: {},
    };
  }
}
