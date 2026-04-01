// nextjs/app/api/guias/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? '';
const API_KEY  = process.env.API_KEY  ?? '';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Body inválido — se esperaba JSON' },
      { status: 400 }
    );
  }

  const { count, skills } = body as { count?: number; skills?: string[] };

  if (!count || !Array.isArray(skills) || skills.length === 0) {
    return NextResponse.json(
      { error: 'Faltan parámetros: count (number) y skills (string[])' },
      { status: 400 }
    );
  }

  const url = new URL('/api/generate-guide-pdf', API_URL);

  try {
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key':    API_KEY,
      },
      body: JSON.stringify({ count, skills }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error upstream (${res.status})` },
        { status: 502 }
      );
    }

    // Flask devuelve un PDF binario — lo pasamos como blob
    const pdfBuffer = await res.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': 'attachment; filename="guia-funcion-cuadratica.pdf"',
      },
    });
  } catch (err) {
    console.error('[Route /api/guias] Error al llamar a Flask:', err);
    return NextResponse.json(
      { error: 'No se pudo generar la guía' },
      { status: 502 }
    );
  }
}
