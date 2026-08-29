import { NextRequest, NextResponse } from 'next/server';
import { getAllDelegados, initializeDatabase, deleteAllDelegados } from '@/lib/db';

function isAuthenticated(request: NextRequest): boolean {
  return request.cookies.get('admin_auth')?.value === 'true';
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 401 }
    );
  }

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

export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 401 }
    );
  }

  try {
    await initializeDatabase();
    await deleteAllDelegados();
    return NextResponse.json({ success: true, message: 'Registros eliminados' });
  } catch (error) {
    console.error('Error clearing submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}