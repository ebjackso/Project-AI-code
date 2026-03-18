import axios from "axios";
import { Summary, Report } from "../types";

const AI_PROVIDER = process.env.AI_PROVIDER || "openai";

export async function generateSummary(
  reports: any[],
  latitude: number,
  longitude: number,
  radiusKm: number
): Promise<Summary> {
  const prompt = buildPrompt(reports);

  let summary: Summary;

  try {
    if (AI_PROVIDER === "openai") {
      summary = await generateSummaryOpenAI(prompt, reports, latitude, longitude, radiusKm);
    } else if (AI_PROVIDER === "grok") {
      summary = await generateSummaryGrok(prompt, reports, latitude, longitude, radiusKm);
    } else if (AI_PROVIDER === "claude") {
      summary = await generateSummaryClaude(prompt, reports, latitude, longitude, radiusKm);
    } else {
      throw new Error(`Unknown AI provider: ${AI_PROVIDER}`);
    }

    return summary;
  } catch (error) {
    console.error("AI summarization failed:", error);

    // Fallback: Create a basic summary from reports
    return createFallbackSummary(reports, latitude, longitude, radiusKm);
  }
}

// OpenAI GPT-4o
async function generateSummaryOpenAI(
  prompt: string,
  reports: any[],
  latitude: number,
  longitude: number,
  radiusKm: number
): Promise<Summary> {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a local community intelligence AI. Generate concise, helpful summaries of community reports.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const content = response.data.choices[0].message.content;
  return parseSummaryResponse(content, reports, latitude, longitude, radiusKm);
}

// Grok API
async function generateSummaryGrok(
  prompt: string,
  reports: any[],
  latitude: number,
  longitude: number,
  radiusKm: number
): Promise<Summary> {
  const response = await axios.post(
    "https://api.x.ai/v1/chat/completions",
    {
      model: "grok-beta",
      messages: [
        {
          role: "system",
          content: "You are a local community intelligence AI. Generate concise summaries.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const content = response.data.choices[0].message.content;
  return parseSummaryResponse(content, reports, latitude, longitude, radiusKm);
}

// Claude
async function generateSummaryClaude(
  prompt: string,
  reports: any[],
  latitude: number,
  longitude: number,
  radiusKm: number
): Promise<Summary> {
  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    },
    {
      headers: {
        "x-api-key": process.env.CLAUDE_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  const content = response.data.content[0].text;
  return parseSummaryResponse(content, reports, latitude, longitude, radiusKm);
}

// Parse AI response into structured summary
function parseSummaryResponse(
  content: string,
  reports: any[],
  latitude: number,
  longitude: number,
  radiusKm: number
): Summary {
  const lines = content.split("\n").filter((line) => line.trim());

  // Extract headline (first line)
  const headline = lines[0] || "Local Update";

  // Extract bullets (lines starting with - or •)
  const bullets = lines
    .slice(1)
    .filter((line) => line.match(/^[-•*]/))
    .map((line) => {
      const text = line.replace(/^[-•*]\s*/, "").split("(")[0].trim();
      const reportCount = Math.ceil(reports.length / (lines.length - 1));
      return {
        text,
        reportCount,
        relatedReportIds: reports.slice(0, reportCount).map((r) => r.id),
      };
    });

  return {
    id: `${latitude}_${longitude}_${radiusKm}`,
    location: { latitude, longitude },
    radius: radiusKm,
    headline,
    bullets: bullets.length > 0 ? bullets : createDefaultBullets(reports),
    reportCount: reports.length,
    generatedAt: Date.now(),
    lastUpdatedAt: Date.now(),
    timeRange: "24h",
  };
}

// Build prompt for AI
function buildPrompt(reports: any[]): string {
  const reportTexts = reports
    .map((r) => `- ${r.category || "Other"} (${r.text})`)
    .join("\n");

  return `Analyze these ${reports.length} community reports and generate a concise summary:

${reportTexts}

Provide:
1. A one-sentence headline summarizing the overall situation
2. 3-6 bullet points of key events/trends
3. Mention approximate counts of similar reports

Keep language clear, helpful, and objective.`;
}

// Create fallback summary if AI fails
function createFallbackSummary(
  reports: any[],
  latitude: number,
  longitude: number,
  radiusKm: number
): Summary {
  const grouped = groupByCategory(reports);

  const bullets = Object.entries(grouped)
    .map(([category, items]) => ({
      text: `${category}: ${items.length} report${items.length !== 1 ? "s" : ""}`,
      reportCount: items.length,
      category,
      relatedReportIds: items.map((r: any) => r.id),
    }))
    .slice(0, 6);

  return {
    id: `${latitude}_${longitude}_${radiusKm}`,
    location: { latitude, longitude },
    radius: radiusKm,
    headline: `${reports.length} reports in this area`,
    bullets,
    reportCount: reports.length,
    generatedAt: Date.now(),
    lastUpdatedAt: Date.now(),
    timeRange: "24h",
  };
}

// Create default bullets from reports
function createDefaultBullets(reports: any[]) {
  const grouped = groupByCategory(reports);
  return Object.entries(grouped)
    .map(([category, items]: [string, any[]]) => ({
      text: `${items.length} ${category} report${items.length !== 1 ? "s" : ""}`,
      reportCount: items.length,
      relatedReportIds: items.map((r) => r.id),
    }))
    .slice(0, 6);
}

// Group reports by category
function groupByCategory(reports: any[]): Record<string, any[]> {
  return reports.reduce((acc, report) => {
    const category = report.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(report);
    return acc;
  }, {});
}
