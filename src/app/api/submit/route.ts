import { NextRequest, NextResponse } from 'next/server';
import { submitDelegadoForm, initializeDatabase, DelegadoFormData } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const body: DelegadoFormData = await request.json();
    
    // Validate required fields
    const requiredFields: (keyof DelegadoFormData)[] = [
      'nombres', 'apellido_paterno', 'apellido_materno', 'ci', 'club_pertenece', 'cargo', 'tiempo_en_club'
    ];
    
    for (const field of requiredFields) {
      if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
        return NextResponse.json(
          { success: false, error: `Campo requerido faltante: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Validate tiempo_en_club
    if (typeof body.tiempo_en_club !== 'number' || body.tiempo_en_club < 0) {
      return NextResponse.json(
        { success: false, error: 'Tiempo en el club debe ser un número válido' },
        { status: 400 }
      );
    }
    
    const result = await submitDelegadoForm(body);
    
    return NextResponse.json({
      success: true,
      message: 'Formulario enviado correctamente',
      data: { id: (result as { insertId: number }).insertId }
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}