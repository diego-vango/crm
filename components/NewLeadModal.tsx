'use client';

import React, { useState } from 'react';
import { Lead, LeadOrigin } from '@/types/crm';
import { X } from 'lucide-react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyAYhe9xRCAh1cEjlWq7fioCmOJfcJqwGrOkZFSTGczZlVBr0vr4eqrUeMGQ2yjq899/exec';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Lead) => void;
}

let leadCounter = 0;
function createLeadId(): string {
  leadCounter += 1;
  return `manual_${Date.now()}_${leadCounter}`;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose, onAddLead }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [origin, setOrigin] = useState<LeadOrigin>('web_form');
  const [value, setValue] = useState<number>(100000);
  const [serviceInterest, setServiceInterest] = useState('Plan Despegue (PYMEs y Tiendas)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() && !name.trim()) {
      alert('Por favor ingresa la persona de contacto o el nombre del negocio.');
      return;
    }

    setIsSubmitting(true);
    const newId = createLeadId();
    const clientName = (company.trim() || name.trim());

    const newLead: Lead = {
      id: newId,
      name: clientName,
      company: clientName,
      email: email.trim(),
      phone: phone.trim(),
      stage: 'nuevo',
      origin,
      value: Number(value) || 0,
      serviceInterest: serviceInterest.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: 'Ingresado desde CRM',
    };

    // 1. Update React Local State (Immediate UI feedback)
    onAddLead(newLead);

    // 2. Persist to Google Sheets (CRM Ventas Sheet)
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'create_lead',
          id: newId,
          name: clientName,
          company: clientName,
          phone: phone.trim(),
          serviceInterest: serviceInterest.trim(),
          value: Number(value) || 0,
          notes: notes.trim(),
          status: 'Lead',
          createdAt: new Date().toISOString().split('T')[0]
        })
      });
    } catch (err) {
      console.error('Error al guardar nuevo lead en Google Sheets:', err);
    } finally {
      setIsSubmitting(false);
      onClose();
      // Reset form
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setNotes('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Agregar Nuevo Lead Comercial</h3>
            <p className="text-[11px] text-slate-400">PáginasPro.cl CRM</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nombre Empresa / Negocio *</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="ej: Transportes La Serena"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Persona de Contacto</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: Roberto Silva"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Teléfono WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+56 9 9123 4567"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@empresa.cl"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Origen del Lead</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value as LeadOrigin)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="web_form">Formulario Web paginaspro.cl</option>
                <option value="whatsapp">WhatsApp Directo</option>
                <option value="meta_ads">Meta Ads (Facebook/Instagram)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Monto Cotizado ($ CLP)</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Servicio de Interés</label>
            <input
              type="text"
              value={serviceInterest}
              onChange={(e) => setServiceInterest(e.target.value)}
              placeholder="ej: Plan Despegue (PYMEs y Tiendas)"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Notas Iniciales</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe detalles de la solicitud o reunión..."
              rows={3}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Lead en Google Sheets'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
