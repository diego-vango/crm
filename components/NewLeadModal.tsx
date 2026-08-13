'use client';

import React, { useState } from 'react';
import { Lead, LeadOrigin, LeadStage } from '@/types/crm';
import { Plus, X, Megaphone, Globe, MessageCircle } from 'lucide-react';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Lead) => void;
}

let leadCounter = 0;
function createLeadId(): string {
  leadCounter += 1;
  return `lead-${leadCounter}-${Date.now().toString(36)}`;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose, onAddLead }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [origin, setOrigin] = useState<LeadOrigin>('meta_ads');
  const [value, setValue] = useState<number>(750000);
  const [serviceInterest, setServiceInterest] = useState('Sitio Web Pro + Dominio .cl');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !name.trim()) {
      alert('Por favor ingresa el nombre de la empresa y la persona de contacto.');
      return;
    }

    const newLead: Lead = {
      id: createLeadId(),
      name: name.trim(),
      company: company.trim(),
      email: email.trim() || 'contacto@empresa.cl',
      phone: phone.trim() || '+56 9 1234 5678',
      stage: 'nuevo',
      origin,
      value: Number(value) || 0,
      serviceInterest: serviceInterest.trim(),
      notes: notes.trim() || 'Ingresado desde el formulario CRM.',
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: 'Ingresado hoy',
    };

    onAddLead(newLead);
    onClose();
    // Reset form
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
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
              <label className="font-bold text-slate-700 block mb-1">Persona de Contacto *</label>
              <input
                type="text"
                required
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
                <option value="meta_ads">Meta Ads (Facebook/Instagram)</option>
                <option value="web_form">Formulario Web paginaspro.cl</option>
                <option value="whatsapp">WhatsApp Directo</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Valor Estimado ($ CLP)</label>
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
              placeholder="ej: Tienda Online con Webpay Plus"
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2 rounded-lg shadow-sm"
            >
              Guardar Lead en Pipeline
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
