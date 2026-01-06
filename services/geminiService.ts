
import { GoogleGenAI, Type } from "@google/genai";
import { PayrollRecord, AttendanceRecord } from "../types";

// Always initialize GoogleGenAI inside functions right before API calls to ensure current API key usage
export const getPayrollInsights = async (payrollData: PayrollRecord[], attendanceData: AttendanceRecord[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      // Using gemini-3-pro-preview for complex analysis and reasoning tasks
      model: 'gemini-3-pro-preview',
      contents: `Analyze this payroll and attendance data and provide 3 key business insights for HR management. 
      Payroll: ${JSON.stringify(payrollData)}
      Attendance: ${JSON.stringify(attendanceData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              impact: { type: Type.STRING, description: "High, Medium, or Low" }
            },
            required: ["title", "description", "impact"]
          }
        }
      }
    });
    // Access .text property directly as per guidelines
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return [
      { title: "Efficiency Check", description: "Standard analysis unavailable. Please check system logs.", impact: "Medium" }
    ];
  }
};

export const getAISupport = async (query: string, userContext: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User Query: ${query}. Context: ${JSON.stringify(userContext)}. 
      Acting as an HR Assistant for BioPay, answer the query concisely.`,
    });
    // Access .text property directly as per guidelines
    return response.text || "I'm sorry, I couldn't process that request right now.";
  } catch (error) {
    return "The AI assistant is currently unavailable.";
  }
};
