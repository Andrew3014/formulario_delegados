import { NextRequest, NextResponse } from 'next/server';
import { getAllDelegados, initializeDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const submissions = await getAllDelegados();
    return NextResponse.json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}