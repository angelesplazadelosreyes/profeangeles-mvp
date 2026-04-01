// nextjs/app/api/ejercicios/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? '';
const API_KEY  = process.env.API_KEY  ?? '';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const topic    = searchParams.get('topic')    ?? '';
  const subtopic = searchParams.get('subtopic') ?? '';
  const type     = searchParams.get('type')     ?? '';

  if (!topic || !subtopic || !type) {
    return NextResponse.json(
      { error: 'Faltan parámetros: topic, subtopic, type' },
      { status: 400 }
    );
  }

  const url = new URL('/api/generate-exercise', API_URL);
  url.searchParams.set('topic',    topic);
  url.searchParams.set('subtopic', subtopic);
  url.searchParams.set('type',     type);

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key':    API_KEY,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error upstream (${res.status})` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (err) {
    console.error('[Route] Error al llamar a la API Flask:', err);
    return NextResponse.json(
      { error: 'No se pudo generar el ejercicio' },
      { status: 502 }
    );
  }
}