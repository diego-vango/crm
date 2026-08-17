import { NextResponse } from 'next/server';

// Requisito obligatorio para desplegar API Routes de Next.js en Cloudflare Pages
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { clientName, companyName, projectName, rawNotes, apiKey } = await req.json();

    // Prioriza la clave enviada en el body o la variable de entorno GEMINI_API_KEY de Cloudflare
    const keyToUse = apiKey || process.env.GEMINI_API_KEY;

    if (!keyToUse) {
      return NextResponse.json(
        { error: 'No se encontró la API Key de Gemini. Configúrala en Cloudflare o ingrésala en la app.' },
        { status: 400 }
      );
    }

    const systemPrompt = `
      Eres el Ingeniero Lead de Infraestructura y Desarrollo Web de "PáginasPro.cl" (Vango SpA).
      Tu tarea es tomar las notas brutas de un trabajo técnico entregado a un cliente y redactar un INFORME TÉCNICO DE TRABAJO formal, altamente profesional y detallado, dividido en secciones clave.

      Cliente: ${clientName || 'Cliente'}
      Empresa: ${companyName || 'Empresa'}
      Proyecto: ${projectName || 'Desarrollo Web & Infraestructura'}
      Notas del trabajo realizado:
      ${rawNotes || 'Despliegue web en Next.js/Cloudflare Pages, migración DNS, configuración de correos corporativos y optimización SEO.'}

      Debes devolver ÚNICAMENTE un JSON válido (sin bloques de código markdown ni texto adicional) con esta estructura exacta:
      {
        "resumenProyecto": "Un párrafo formal que resume el alcance general del servicio prestado.",
        "hitosPagina2": [
          { "titulo": "Nombre del Hito", "descripcion": "Explicación técnica detallada..." },
          { "titulo": "Nombre del Hito 2", "descripcion": "Explicación técnica..." }
        ],
        "hitosPagina3": [
          { "titulo": "Nombre del Hito 3", "descripcion": "Explicación..." },
          { "titulo": "Nombre del Hito 4", "descripcion": "Explicación..." }
        ],
        "hitosPagina4": [
          { "titulo": "Nombre del Hito 5", "descripcion": "Explicación..." },
          { "titulo": "Nombre del Hito 6", "descripcion": "Explicación..." }
        ],
        "diagnosticoArquitectura": "Explicación detallada sobre la arquitectura Serverless/Next.js/Cloudflare utilizada y sus ventajas de seguridad y $0/mes.",
        "recomendacionesUso": [
          "No modificar registros DNS tipo MX o TXT en Cloudflare.",
          "Mantener los Nameservers apuntando a Cloudflare.",
          "No alterar alias en Google Workspace."
        ],
        "coberturaGarantia": [
          "Disponibilidad y certificado SSL HTTPS activo.",
          "Estabilidad de flujo de correos corporativos.",
          "Soporte ante fallas de compilación en GitHub."
        ],
        "exclusionesGarantia": [
          "Modificaciones directas en zonas DNS por terceros no autorizados.",
          "Alteraciones manuales en el código fuente que generen errores sintácticos."
        ]
      }
    `;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToUse}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json(
        { error: 'Error al consultar a Gemini', details: errText },
        { status: 500 }
      );
    }

    const geminiData = await geminiRes.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    const parsedJson = JSON.parse(responseText);
    return NextResponse.json(parsedJson);

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.toString() },
      { status: 500 }
    );
  }
}
