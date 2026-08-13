'use client';

import React, { useState } from 'react';
import { Lead, LeadStage, LeadOrigin } from '@/types/crm';
import { formatCLP } from '@/lib/formatters';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Plus, 
  Phone, 
  Mail, 
  MessageCircle, 
  Globe, 
  Megaphone, 
  ArrowRight, 
  FileText, 
  Trash2, 
  MoreVertical, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface PipelineModuleProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  searchTerm: string;
  onConvertLeadToQuote: (lead: Lead) => void;
  onOpenNewLeadModal: () => void;
}

const STAGES: { key: LeadStage; label: string; color: string; border: string; bg: string }[] = [
  { key: 'nuevo', label: 'Nuevo Lead', color: 'text-sky-600', border: 'border-sky-300', bg: 'bg-sky-50' },
  { key: 'conversacion', label: 'En Conversación', color: 'text-amber-600', border: 'border-amber-300', bg: 'bg-amber-50' },
  { key: 'cotizado', label: 'Cotizado', color: 'text-indigo-600', border: 'border-indigo-300', bg: 'bg-indigo-50' },
  { key: 'cerrado', label: 'Cerrado / Ganado', color: 'text-emerald-700', border: 'border-emerald-400', bg: 'bg-emerald-50' },
  { key: 'perdido', label: 'Perdió Interés', color: 'text-slate-500', border: 'border-slate-300', bg: 'bg-slate-100' },
];

export const PipelineModule: React.FC<PipelineModuleProps> = ({
  leads,
  setLeads,
  searchTerm,
  onConvertLeadToQuote,
  onOpenNewLeadModal
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filter leads based on search term & origin
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.serviceInterest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);

    const matchesOrigin = originFilter === 'all' || lead.origin === originFilter;

    return matchesSearch && matchesOrigin;
  });

  // Calculate KPIs
  const totalLeadsCount = leads.length;
  const closedCount = leads.filter(l => l.stage === 'cerrado').length;
  const conversionRate = totalLeadsCount > 0 ? ((closedCount / totalLeadsCount) * 100).toFixed(1) : '0';
  const pipelineValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const wonValue = leads.filter(l => l.stage === 'cerrado').reduce((sum, l) => sum + (l.value || 0), 0);

  // Move lead stage
  const moveLeadStage = (leadId: string, newStage: LeadStage) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage, lastActivity: `Cambiado a ${newStage.toUpperCase()} hoy` } : l));
  };

  // Delete lead
  const deleteLead = (leadId: string) => {
    if (confirm('¿Estás seguro de eliminar este lead del pipeline?')) {
      setLeads(prev => prev.filter(l => l.id !== leadId));
      if (selectedLead?.id === leadId) setSelectedLead(null);
    }
  };

  const getOriginBadge = (origin: LeadOrigin) => {
    switch (origin) {
      case 'meta_ads':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 font-medium text-[10px] px-2 py-0.5 rounded-full border border-blue-200">
            <Megaphone className="w-3 h-3 text-blue-600" /> Meta Ads
          </span>
        );
      case 'web_form':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 font-medium text-[10px] px-2 py-0.5 rounded-full border border-purple-200">
            <Globe className="w-3 h-3 text-purple-600" /> Formulario Web
          </span>
        );
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-medium text-[10px] px-2 py-0.5 rounded-full border border-emerald-200">
            <MessageCircle className="w-3 h-3 text-emerald-600" /> WhatsApp Directo
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leads del Mes</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalLeadsCount}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {closedCount} ganados de {totalLeadsCount} en total
            </p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Users className="w-6 h-6 text-slate-700" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tasa de Conversión</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{conversionRate}%</h3>
            <p className="text-[11px] text-slate-500 mt-1">Eficiencia comercial en cierres</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor del Pipeline</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">{formatCLP(pipelineValue)}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Oportunidades activas acumuladas</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresos Ganados</p>
            <h3 className="text-xl font-extrabold text-emerald-600 mt-1">{formatCLP(wonValue)}</h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">Proyectos cerrados con anticipo</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Control Bar: View Mode + Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Origin Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Origen:</span>
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos los orígenes</option>
            <option value="meta_ads">Meta Ads (Facebook/IG)</option>
            <option value="web_form">Formulario Web</option>
            <option value="whatsapp">WhatsApp Directo</option>
          </select>
        </div>

        {/* Right: View Toggle & Action */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tablero Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Vista Tabla
            </button>
          </div>

          <button
            onClick={onOpenNewLeadModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Lead</span>
          </button>
        </div>

      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage.key);
            const stageTotal = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);

            return (
              <div
                key={stage.key}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col min-w-[260px] min-h-[500px]"
              >
                {/* Column Header */}
                <div className={`p-2.5 rounded-lg border ${stage.border} ${stage.bg} mb-3 flex items-center justify-between`}>
                  <div>
                    <h4 className={`text-xs font-bold ${stage.color}`}>{stage.label}</h4>
                    <span className="text-[10px] text-slate-500 font-mono font-medium">
                      {formatCLP(stageTotal)}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.bg} ${stage.color} border ${stage.border}`}>
                    {stageLeads.length}
                  </span>
                </div>

                {/* Lead Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[11px] text-slate-400 text-center px-4">
                      Sin leads en esta etapa
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group relative ${
                          selectedLead?.id === lead.id ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
                        }`}
                      >
                        {/* Top Lead Badges */}
                        <div className="flex items-center justify-between mb-2">
                          {getOriginBadge(lead.origin)}
                          <span className="text-xs font-black text-slate-900 font-mono">
                            {formatCLP(lead.value)}
                          </span>
                        </div>

                        {/* Company & Client Name */}
                        <h5 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition">
                          {lead.company}
                        </h5>
                        <p className="text-xs text-slate-600 font-medium mb-2">
                          {lead.name}
                        </p>

                        {/* Service Description */}
                        <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2 line-clamp-2">
                          {lead.serviceInterest}
                        </div>

                        {/* Contacts & Activity */}
                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1 text-slate-500 truncate max-w-[150px]">
                            <Phone className="w-3 h-3 text-slate-400" /> {lead.phone}
                          </span>
                          <span className="font-mono">{lead.createdAt}</span>
                        </div>

                        {/* Quick Stage Transition Dropdown */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          <select
                            value={lead.stage}
                            onChange={(e) => {
                              e.stopPropagation();
                              moveLeadStage(lead.id, e.target.value as LeadStage);
                            }}
                            className="text-[10px] font-semibold bg-slate-100 border border-slate-200 rounded px-1.5 py-1 text-slate-700 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="nuevo">1. Nuevo Lead</option>
                            <option value="conversacion">2. En Conversación</option>
                            <option value="cotizado">3. Cotizado</option>
                            <option value="cerrado">4. Cerrado / Ganado</option>
                            <option value="perdido">5. Perdió Interés</option>
                          </select>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onConvertLeadToQuote(lead);
                            }}
                            className="text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-2 py-1 rounded border border-emerald-200 flex items-center gap-1"
                            title="Generar Presupuesto PDF"
                          >
                            <FileText className="w-3 h-3 text-emerald-600" />
                            <span>Cotizar</span>
                          </button>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 uppercase text-[10px] font-bold tracking-wider">
                  <th className="p-3">Empresa & Cliente</th>
                  <th className="p-3">Origen</th>
                  <th className="p-3">Interés de Servicio</th>
                  <th className="p-3">Monto Est.</th>
                  <th className="p-3">Estado actual</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      No se encontraron leads con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 text-sm">{lead.company}</div>
                        <div className="text-slate-500">{lead.name} • {lead.phone}</div>
                      </td>
                      <td className="p-3">{getOriginBadge(lead.origin)}</td>
                      <td className="p-3 font-medium text-slate-700 max-w-xs">{lead.serviceInterest}</td>
                      <td className="p-3 font-bold font-mono text-slate-900">{formatCLP(lead.value)}</td>
                      <td className="p-3">
                        <select
                          value={lead.stage}
                          onChange={(e) => moveLeadStage(lead.id, e.target.value as LeadStage)}
                          className="text-xs font-semibold bg-slate-100 border border-slate-300 rounded-md px-2 py-1 text-slate-800"
                        >
                          <option value="nuevo">Nuevo Lead</option>
                          <option value="conversacion">En Conversación</option>
                          <option value="cotizado">Cotizado</option>
                          <option value="cerrado">Cerrado / Ganado</option>
                          <option value="perdido">Perdió Interés</option>
                        </select>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => onConvertLeadToQuote(lead)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-2.5 py-1 rounded-md inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Crear PPTO</span>
                        </button>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                          title="Eliminar Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEAD DETAIL MODAL SIDEBAR */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex justify-end transition-opacity">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-slate-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">Detalle de Lead</span>
                  <h3 className="text-xl font-black text-slate-900">{selectedLead.company}</h3>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Cliente / Contacto</label>
                  <p className="font-bold text-slate-800 text-sm">{selectedLead.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Teléfono</span>
                    <a href={`tel:${selectedLead.phone}`} className="font-semibold text-emerald-600 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {selectedLead.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email</span>
                    <a href={`mailto:${selectedLead.email}`} className="font-semibold text-slate-800 truncate block">
                      {selectedLead.email}
                    </a>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Origen del Lead</label>
                  {getOriginBadge(selectedLead.origin)}
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Valor Estimado del Proyecto</label>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {formatCLP(selectedLead.value)}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Servicio de Interés</label>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-800 border border-slate-200 font-medium">
                    {selectedLead.serviceInterest}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Notas Comerciales</label>
                  <textarea
                    value={selectedLead.notes}
                    onChange={(e) => {
                      const updatedNotes = e.target.value;
                      setSelectedLead({ ...selectedLead, notes: updatedNotes });
                      setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, notes: updatedNotes } : l));
                    }}
                    rows={4}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                onClick={() => {
                  onConvertLeadToQuote(selectedLead);
                  setSelectedLead(null);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <FileText className="w-4 h-4" />
                <span>Generar Presupuesto Oficial PDF</span>
              </button>

              <button
                onClick={() => deleteLead(selectedLead.id)}
                className="w-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Lead</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
