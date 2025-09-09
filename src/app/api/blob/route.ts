import { del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pathname = searchParams.get('pathname');

    if (!pathname) {
      return NextResponse.json({ error: 'No pathname provided' }, { status: 400 });
    }

    const result = await del(pathname);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting blob:', error);
    return NextResponse.json(
      { error: 'Failed to delete blob' },
      { status: 500 }
    );
  }
}