import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.NUMBER,
      description: "Overall facial skin condition severity rating from 0 (clear skin) to 100 (severe acne).",
    },
    summary: {
      type: Type.STRING,
      description: "A concise review summarizing the face's overall acne condition.",
    },
    lesions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          location: { type: Type.STRING, description: "Approximate location (e.g., Forehead, center)" },
          type: { type: Type.STRING, description: "Type of acne (e.g., Pustule, Blackhead, Cyst)" },
          severity: { type: Type.NUMBER, description: "Severity rating 0-100 for this specific lesion" },
          suggestion: { type: Type.STRING, description: "Treatment suggestion" },
          box_2d: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "Bounding box [ymin, xmin, ymax, xmax] on a 0-1000 scale.",
          },
        },
        required: ["location", "type", "severity", "suggestion"],
      },
    },
  },
  required: ["overallScore", "summary", "lesions"],
};

export const analyzeSkinImage = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Analyze this facial image for acne. 
            1. Detect all visible acne lesions.
            2. For each lesion, identify its type, severity (0-100), treatment suggestion, and location.
            3. Provide a bounding box [ymin, xmin, ymax, xmax] (0-1000 scale) for each lesion if possible.
            4. Provide an overall severity score (0-100) and a summary.
            Return the result in JSON format matching the schema.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4, // Lower temperature for more analytical/consistent results
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text received from Gemini.");

    const data = JSON.parse(text);
    
    // Add IDs to lesions for React keys
    if (data.lesions) {
      data.lesions = data.lesions.map((l: any, idx: number) => ({
        ...l,
        id: `lesion-${idx}-${Date.now()}`
      }));
    }

    return data as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = error => reject(error);
  });
};