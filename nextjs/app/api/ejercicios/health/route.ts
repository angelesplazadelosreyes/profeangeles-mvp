// nextjs/app/api/ejercicios/health/route.ts
import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? '';
const API_KEY  = process.env.API_KEY  ?? '';

export async function GET() {
  try {
    const res = await fetch(new URL('/health', API_URL).toString(), {
      method: 'GET',
      headers: { 'X-API-Key': API_KEY },
    });
    const ok = res.ok;
    return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}