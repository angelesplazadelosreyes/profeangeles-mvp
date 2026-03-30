// nextjs/app/api/ejercicios/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchExercise, ExerciseParams } from '@/lib/api.client';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const topic    = searchParams.get('topic')    ?? '';
  const subtopic = searchParams.get('subtopic') ?? '';
  const type     = searchParams.get('type')     ?? '';

  // Validación básica — los tres parámetros son obligatorios
  if (!topic || !subtopic || !type) {
    return NextResponse.json(
      { error: 'Faltan parámetros: topic, subtopic, type' },
      { status: 400 }
    );
  }

  try {
    const params: ExerciseParams = { topic, subtopic, type };
    const data = await fetchExercise(params);
    return NextResponse.json(data);
  } catch (err) {
    console.error('[Route] Error al llamar a la API Flask:', err);
    return NextResponse.json(
      { error: 'No se pudo generar el ejercicio' },
      { status: 502 }
    );
  }
}