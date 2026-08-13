import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, type } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not configured." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction = "Eres un asistente de operaciones para la agencia de desarrollo web 'PáginasPro.cl' (Vango SpA) en Chile. Responde en español profesional de negocios chileno con tono amable y conciso.";

    if (type === 'quote_items') {
      systemInstruction += " Genera propuestas de ítems de presupuesto técnico (Título, Descripción detallada en 2 líneas y Valor Neto estimado en Pesos Chilenos CLP) en formato JSON estructurado.";
    } else if (type === 'delivery_notes') {
      systemInstruction += " Genera notas profesionales de cierre de proyecto e informe de entrega destacando la garantía técnica de 90 días.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in Gemini API route:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate AI content" },
      { status: 500 }
    );
  }
}
