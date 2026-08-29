import { NextRequest, NextResponse } from 'next/server';
import { getDelegadoById, initializeDatabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (request.cookies.get('admin_auth')?.value !== 'true') {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 401 }
    );
  }

  try {
    await initializeDatabase();
    const { id } = await params;
    const submission = await getDelegadoById(parseInt(id));
    
    if (!submission || (submission as unknown[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Registro no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: (submission as unknown[])[0] });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}