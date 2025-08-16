import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv'; // Using Vercel KV for simplicity

export async function POST(req: NextRequest) {
  try {
    const { presentation } = await req.json();

    if (!presentation) {
      return NextResponse.json({ error: 'Presentation data is required' }, { status: 400 });
    }

    // Generate a unique ID for the presentation
    const id = Math.random().toString(36).substring(2, 15);

    // Store the presentation in Vercel KV
    await kv.set(id, JSON.stringify(presentation), { ex: 60 * 60 * 24 * 7 }); // Expire in 7 days

    return NextResponse.json({ id, message: 'Presentation saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving presentation:', error);
    return NextResponse.json({ error: 'Failed to save presentation' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Presentation ID is required' }, { status: 400 });
    }

    const presentation = await kv.get(id);

    if (!presentation) {
      return NextResponse.json({ error: 'Presentation not found or expired' }, { status: 404 });
    }

    return NextResponse.json({ presentation: JSON.parse(presentation as string) }, { status: 200 });
  } catch (error) {
    console.error('Error loading presentation:', error);
    return NextResponse.json({ error: 'Failed to load presentation' }, { status: 500 });
  }
}
