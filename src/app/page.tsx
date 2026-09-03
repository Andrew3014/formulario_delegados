'use client';

import { useState } from 'react';
import { DelegadoFormData } from '@/lib/db';
import { onlyLetters, onlyDigits } from '@/lib/validation';

export default function FormPage() {
  const [formData, setFormData] = useState<DelegadoFormData>({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    club_pertenece: '',
    cargo: '',
    tiempo_en_club: '',
    telefono: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateField = (name: keyof DelegadoFormData, value: string | number) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'nombres':
      case 'apellido_paterno':
      case 'apellido_materno':
        if (!value || (value as string).trim().length < 2) {
          newErrors[name] = 'Mínimo 2 caracteres';
        } else if (!onlyLetters(String(value))) {
          newErrors[name] = 'Solo se permiten letras';
        } else {
          delete newErrors[name];
        }
        break;
      case 'ci':
        if (!value || !onlyDigits(String(value))) {
          newErrors[name] = 'Solo números';
        } else if ((value as string).trim().length < 5 || (value as string).trim().length > 12) {
          newErrors[name] = 'CI inválido (5 a 12 dígitos)';
        } else {
          delete newErrors[name];
        }
        break;
      case 'club_pertenece':
        if (!value || (value as string).trim().length < 2) {
          newErrors[name] = 'Club requerido';
        } else {
          delete newErrors[name];
        }
        break;
      case 'cargo':
        if (!value || (value as string).trim().length < 2) {
          newErrors[name] = 'Especifique su cargo';
        } else {
          delete newErrors[name];
        }
        break;
      case 'tiempo_en_club':
        if (!value || (value as string).trim().length < 5) {
          newErrors[name] = 'Describe tu tiempo en el club (mín. 5 caracteres)';
        } else {
          delete newErrors[name];
        }
        break;
      case 'telefono':
        const digits = (value as string).replace(/\D/g, '');
        if (!value || digits.length < 8 || digits.length > 14) {
          newErrors[name] = 'Teléfono: 8-14 dígitos';
        } else {
          delete newErrors[name];
        }
        break;
      default:
        delete newErrors[name];
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    validateField(name as keyof DelegadoFormData, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Final validation
    const newErrors: Record<string, string> = {};
    const requiredFields: (keyof DelegadoFormData)[] = [
      'nombres', 'apellido_paterno', 'apellido_materno', 'ci', 'club_pertenece', 'cargo', 'tiempo_en_club', 'telefono'
    ];
    
    requiredFields.forEach(field => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '') || (typeof value === 'number' && value < 0)) {
        newErrors[field as string] = 'Campo requerido';
      }
    });

    (['nombres', 'apellido_paterno', 'apellido_materno'] as (keyof DelegadoFormData)[]).forEach(field => {
      if (formData[field] && !onlyLetters(String(formData[field]))) {
        newErrors[field as string] = 'Solo se permiten letras';
      }
    });

    if (formData.ci && !onlyDigits(formData.ci)) {
      newErrors.ci = 'Solo se permiten números';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          nombres: '',
          apellido_paterno: '',
          apellido_materno: '',
          ci: '',
          club_pertenece: '',
          cargo: '',
          tiempo_en_club: '',
          telefono: '',
        });
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Error al enviar el formulario');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('Error de conexión. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Asociación de Básquetbol Cochabamba</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Registro de Delegados de Clubes</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6" noValidate>
          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              ✓ Formulario enviado correctamente. Gracias por registrarte.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              ✕ {errorMessage}
            </div>
          )}

          {/* Names Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                maxLength={100}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900 ${
                  errors.nombres ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Juan Carlos"
                required
              />
              {errors.nombres && <p className="mt-1 text-sm text-red-600">{errors.nombres}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno *</label>
              <input
                type="text"
                name="apellido_paterno"
                value={formData.apellido_paterno}
                onChange={handleChange}
                maxLength={100}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900 ${
                  errors.apellido_paterno ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Pérez"
                required
              />
              {errors.apellido_paterno && <p className="mt-1 text-sm text-red-600">{errors.apellido_paterno}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno *</label>
              <input
                type="text"
                name="apellido_materno"
                value={formData.apellido_materno}
                onChange={handleChange}
                maxLength={100}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900 ${
                  errors.apellido_materno ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="García"
                required
              />
              {errors.apellido_materno && <p className="mt-1 text-sm text-red-600">{errors.apellido_materno}</p>}
            </div>
          </div>

          {/* CI, Club, Cargo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° Carnet CI *</label>
              <input
                type="text"
                name="ci"
                value={formData.ci}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={12}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900 ${
                  errors.ci ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1234567"
                required
              />
              {errors.ci && <p className="mt-1 text-sm text-red-600">{errors.ci}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club que Pertenece *</label>
              <input
                type="text"
                name="club_pertenece"
                value={formData.club_pertenece}
                onChange={handleChange}
                maxLength={200}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900 ${
                  errors.club_pertenece ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Club Universitario, Club San Simón"
                required
              />
              {errors.club_pertenece && <p className="mt-1 text-sm text-red-600">{errors.club_pertenece}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo en el Club *</label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                maxLength={100}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900 ${
                  errors.cargo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Presidente, Vicepresidente, Delegado"
                required
              />
              {errors.cargo && <p className="mt-1 text-sm text-red-600">{errors.cargo}</p>}
            </div>
          </div>

          {/* Time in club */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo en el Club *</label>
            <textarea
              name="tiempo_en_club"
              value={formData.tiempo_en_club}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900 ${
                errors.tiempo_en_club ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 5 años como delegado, 2 años en directiva, experiencia en torneos nacionales, etc."
              required
            />
            {errors.tiempo_en_club && <p className="mt-1 text-sm text-red-600">{errors.tiempo_en_club}</p>}
          </div>

          {/* Telefono */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900 ${
                errors.telefono ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 71234567 o 59171234567"
              maxLength={14}
              required
            />
            {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
            <p className="mt-1 text-xs text-gray-500">Solo números, entre 8 y 14 dígitos</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Registro'}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            * Campos obligatorios
          </p>
        </form>
      </div>
    </div>
  );
}