export const runtime = 'edge';

import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    // Inicialización del cliente de Gemini
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error("Error en API Gemini:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la solicitud." },
      { status: 500 }
    );
  }
}
