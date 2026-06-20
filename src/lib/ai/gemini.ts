import { GoogleGenerativeAI } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;


export function getGeminiClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to .env.local — see README for setup."
      );
    }
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

export const GEMINI_MODEL = "gemini-3.1-flash-lite";