'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DelegadoSubmission } from '@/lib/db';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<DelegadoSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<DelegadoSubmission | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchSubmissions();
    // Check auth
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/check');
        if (!res.ok) {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };
    checkAuth();
  }, [router]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      const result = await response.json();
      if (result.success) {
        setSubmissions(result.data);
      } else {
        setError(result.error || 'Error al cargar datos');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (id: number) => {
    setSelectedId(id);
    try {
      const response = await fetch(`/api/submissions/${id}`);
      const result = await response.json();
      if (result.success) {
        setDetailData(result.data);
        setShowDetail(true);
      }
    } catch {
      setError('Error al cargar detalles');
    }
  };

  const handleExport = () => {
    window.open('/api/export', '_blank');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin', { method: 'DELETE' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Asociación de Básquetbol Cochabamba</h1>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                Panel de Administración - Delegados
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Exportar a Excel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Delegados</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{submissions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Clubes Únicos</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {new Set(submissions.map(s => s.club_pertenece)).size}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Cargos Únicos</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {new Set(submissions.map(s => s.cargo)).size}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo en Club</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission, index) => (
                  <tr key={submission.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetail(submission.id)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {submission.nombres} {submission.apellido_paterno} {submission.apellido_materno}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{submission.ci}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{submission.club_pertenece}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{submission.cargo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{submission.tiempo_en_club} años</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{submission.telefono}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(submission.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-900">
                      Ver detalles
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      No hay registros aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {showDetail && detailData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Detalles del Delegado</h2>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Nombre Completo</label>
                <p className="text-gray-900">{detailData.nombres} {detailData.apellido_paterno} {detailData.apellido_materno}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">CI</label>
                  <p className="text-gray-900">{detailData.ci}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">Tiempo en Club</label>
                  <p className="text-gray-900">{detailData.tiempo_en_club} años</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Club</label>
                <p className="text-gray-900">{detailData.club_pertenece}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Cargo</label>
                <p className="text-gray-900">{detailData.cargo}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Teléfono</label>
                <p className="text-gray-900">{detailData.telefono}</p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-xs font-medium text-gray-500 uppercase">Fecha de Registro</label>
                <p className="text-gray-900">{formatDate(detailData.created_at)}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button onClick={() => setShowDetail(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}