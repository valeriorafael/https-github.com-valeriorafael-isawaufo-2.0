
import { GoogleGenAI, Type } from "@google/genai";
import { Sighting, GeminiResponse, GeminiAnalysis } from "./types.ts";

export const analyzeSightingWithAI = async (sighting: Sighting): Promise<GeminiResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze this reported aerial anomaly:
  Title: ${sighting.title}
  Description: ${sighting.description}
  Location: ${sighting.lat}, ${sighting.lng}
  
  Provide a brief scientific evaluation. Is it likely a drone, atmospheric phenomena, or unknown? 
  Keep it in character as a high-clearance military analyst.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            probability: { type: Type.STRING },
            type: { type: Type.STRING }
          },
          required: ["analysis", "probability", "type"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      analysis: String(data.analysis || "No analysis available."),
      probability: String(data.probability || "Unknown"),
      type: String(data.type || "Unclassified")
    };
  } catch (error) {
    console.error("AI Analysis error:", error);
    return {
      analysis: "Unable to process data stream. Possible interference.",
      probability: "Unknown",
      type: "Anomalous"
    };
  }
};

export const analyzeSighting = async (sighting: Sighting): Promise<GeminiAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Perform a high-level forensic analysis of the following anomaly report for credibility and identification:
  Title: ${sighting.title}
  Testimony: ${sighting.description}
  Coordinates: ${sighting.lat}, ${sighting.lng}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            credibility: { type: Type.STRING, description: "Credibility rating of the testimony" },
            explanation: { type: Type.STRING, description: "Detailed scientific explanation" },
            potentialIdentification: { type: Type.STRING, description: "Most likely identification of the anomaly" }
          },
          required: ["credibility", "explanation", "potentialIdentification"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      credibility: String(data.credibility || "UNCONFIRMED"),
      explanation: String(data.explanation || "Data stream interrupted."),
      potentialIdentification: String(data.potentialIdentification || "Unknown")
    };
  } catch (error) {
    console.error("AI Analysis error:", error);
    return {
      credibility: "UNCONFIRMED",
      explanation: "Data stream interrupted by atmospheric interference.",
      potentialIdentification: "Unknown"
    };
  }
};
