import { NextRequest, NextResponse } from 'next/server';
import { submitDelegadoForm, initializeDatabase, DelegadoFormData, findDuplicateDelegado } from '@/lib/db';
import { normalizeFullName, normalizeSentence } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const body: DelegadoFormData = await request.json();
    
    // Validate required fields
    const requiredFields: (keyof DelegadoFormData)[] = [
      'nombres', 'apellido_paterno', 'apellido_materno', 'ci', 'club_pertenece', 'cargo', 'tiempo_en_club', 'telefono'
    ];
    
    for (const field of requiredFields) {
      if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
        return NextResponse.json(
          { success: false, error: `Campo requerido faltante: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Validate names contain only letters
    const nameFields = ['nombres', 'apellido_paterno', 'apellido_materno'] as const;
    for (const field of nameFields) {
      const value = String(body[field] || '').trim();
      if (value.length < 2 || value.length > 100) {
        return NextResponse.json(
          { success: false, error: `${field}: longitud inválida (2 a 100 caracteres)` },
          { status: 400 }
        );
      }
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]+$/.test(value)) {
        return NextResponse.json(
          { success: false, error: `${field}: solo se permiten letras` },
          { status: 400 }
        );
      }
    }
    
    // Validate CI is digits only and reasonable length
    const ci = String(body.ci || '').trim();
    if (!/^\d+$/.test(ci) || ci.length < 5 || ci.length > 12) {
      return NextResponse.json(
        { success: false, error: 'CI debe contener solo números (5 a 12 dígitos)' },
        { status: 400 }
      );
    }

    // Validate telefono: only digits, min 8, max 14
    const telefonoDigits = body.telefono.replace(/\D/g, '');
    if (telefonoDigits.length < 8 || telefonoDigits.length > 14) {
      return NextResponse.json(
        { success: false, error: 'Teléfono debe tener entre 8 y 14 dígitos' },
        { status: 400 }
      );
    }
    
    // Validate club and cargo lengths
    const club = String(body.club_pertenece || '').trim();
    const cargo = String(body.cargo || '').trim();
    if (club.length < 2 || club.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Club: mínimo 2 caracteres' },
        { status: 400 }
      );
    }
    if (cargo.length < 2 || cargo.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Cargo: mínimo 2 caracteres' },
        { status: 400 }
      );
    }
    
    // Validate tiempo_en_club
    const tiempo = Number(body.tiempo_en_club);
    if (!Number.isInteger(tiempo) || tiempo < 0 || tiempo > 100) {
      return NextResponse.json(
        { success: false, error: 'Tiempo en el club inválido (0 a 100 años)' },
        { status: 400 }
      );
    }
    
    const normalizedBody: DelegadoFormData = {
      ...body,
      nombres: normalizeFullName(body.nombres),
      apellido_paterno: normalizeFullName(body.apellido_paterno),
      apellido_materno: normalizeFullName(body.apellido_materno),
      ci,
      club_pertenece: normalizeSentence(club),
      cargo: normalizeSentence(cargo),
      tiempo_en_club: tiempo,
    };
    
    // Reject exact duplicates
    const isDuplicate = await findDuplicateDelegado(normalizedBody);
    if (isDuplicate) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un registro idéntico. Modifica al menos un dato para enviar nuevamente.' },
        { status: 409 }
      );
    }
    
    const result = await submitDelegadoForm(normalizedBody);
    
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