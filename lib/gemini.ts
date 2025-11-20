import { GoogleGenAI } from "@google/genai";
import { TenderQA } from "../types";
import { getVaultDocuments } from "./db";

const API_KEY = process.env.API_KEY;

export const analyzeTenderWithGemini = async (
  tenderText: string
): Promise<TenderQA[]> => {
  if (!API_KEY) throw new Error("API_KEY is missing.");

  // 1. Fetch Context from Database
  const docs = await getVaultDocuments();

  const policyContext = docs
    .filter(d => d.category === 'POLICY')
    .map(d => `[SOURCE: ${d.name}]\n${d.content}`)
    .join('\n\n');

  const pastBidContext = docs
    .filter(d => d.category === 'PAST_BID')
    .map(d => `[SOURCE: ${d.name}]\n${d.content}`)
    .join('\n\n');

  console.log(`Gemini Brain: Loaded ${docs.length} docs from Vault. Policy Chars: ${policyContext.length}`);

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Truncate tender text if extremely large to avoid context window limits
  const safeTenderText = tenderText.length > 400000 ? tenderText.substring(0, 400000) + "...[TRUNCATED]" : tenderText;

  const systemInstruction = `You are a Bid Writing Engine. Your job is to extract questions from the Tender Text and answer them using the provided Context.

Rules:
1. Use POLICY_CONTEXT for factual compliance (e.g., certifications, security standards).
2. Use PAST_BID_CONTEXT to match tone/style and find similar past answers.
3. Output ONLY a raw JSON array. No markdown, no conversation, no 'thinking'.
4. Structure: [{ "question": "...", "answer": "..." }]
5. If a specific answer isn't found in the context, state 'Requires bespoke input' but try to infer from policies first.
6. You MUST cite which document you used for the answer in brackets at the end, e.g., [Source: GDPR_Policy.pdf].
`;

  const prompt = `
POLICY_CONTEXT:
${policyContext}

PAST_BID_CONTEXT:
${pastBidContext}

TENDER_TEXT:
${safeTenderText}

Task: Extract every question and provide a compliant answer. Return strict JSON.
`;

  try {
    // Using Gemini 2.5 Flash for speed, or 3 Pro if complexity demands it.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json", 
      }
    });

    const rawText = response.text;

    if (!rawText) throw new Error("Empty response from AI");

    // --- THE SANITIZER (CRITICAL) ---
    // Find the first '[' and the last ']' to extract the array
    const firstBracket = rawText.indexOf('[');
    const lastBracket = rawText.lastIndexOf(']');

    if (firstBracket === -1 || lastBracket === -1) {
        console.warn("JSON Brackets not found, attempting raw parse");
        return JSON.parse(rawText) as TenderQA[];
    }

    const cleanJsonString = rawText.substring(firstBracket, lastBracket + 1);
    
    try {
      const parsedData = JSON.parse(cleanJsonString);
      if (!Array.isArray(parsedData)) {
        throw new Error("AI did not return an array");
      }
      return parsedData as TenderQA[];
    } catch (parseError) {
      console.error("JSON Parse Failed on:", cleanJsonString);
      throw new Error("Failed to parse AI response as JSON.");
    }

  } catch (err) {
    console.error("Gemini API Error:", err);
    throw err;
  }
};