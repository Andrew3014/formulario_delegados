import { NextRequest, NextResponse } from 'next/server';
import { getAllDelegados, initializeDatabase, DelegadoSubmission } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  if (request.cookies.get('admin_auth')?.value !== 'true') {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 401 }
    );
  }

  try {
    await initializeDatabase();
    const submissions = await getAllDelegados();
    
    // Transform data for Excel export
    const exportData = (submissions as DelegadoSubmission[]).map((s, index) => ({
      '#': index + 1,
      'Nombres': s.nombres,
      'Apellido Paterno': s.apellido_paterno,
      'Apellido Materno': s.apellido_materno,
      'CI': s.ci,
      'Club': s.club_pertenece,
      'Cargo': s.cargo,
      'Tiempo en el Club (años)': s.tiempo_en_club,
      'Fecha de Registro': new Date(s.created_at).toLocaleDateString('es-BO'),
    }));
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = [
      { wch: 5 },   // #
      { wch: 20 },  // Nombres
      { wch: 20 },  // Apellido Paterno
      { wch: 20 },  // Apellido Materno
      { wch: 15 },  // CI
      { wch: 25 },  // Club
      { wch: 25 },  // Cargo
      { wch: 22 },  // Tiempo en el Club
      { wch: 18 },  // Fecha de Registro
    ];
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Delegados');
    
    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="delegados_basketbol_cochabamba_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar el archivo Excel' },
      { status: 500 }
    );
  }
}