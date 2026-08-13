'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  FileText, 
  Filter,
  RefreshCw,
  Save,
  CheckCircle2,
  GripVertical,
  Briefcase
} from 'lucide-react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyAYhe9xRCAh1cEjlWq7fioCmOJfcJqwGrOkZFSTGczZlVBr0vr4eqrUeMGQ2yjq899/exec';

interface PipelineModuleProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  searchTerm: string;
  onConvertLeadToQuote: (lead: Lead) => void;
  onOpenNewLeadModal: (prefillData?: { name?: string; phone?: string }) => void;
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
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSavingDetails, setIsSavingDetails] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Editable Form State in Sidebar
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editService, setEditService] = useState('');
  const [editValue, setEditValue] = useState<number>(0);
  const [editNotes, setEditNotes] = useState('');

  const cleanPhone = (phoneRaw: string) => {
    if (!phoneRaw) return '';
    return String(phoneRaw).replace(/^p:/i, '').trim();
  };

  const parseAmountNumber = (amountRaw: any): number => {
    if (!amountRaw) return 0;
    const cleaned = String(amountRaw).replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  };

  const mapSheetStatusToStage = (rawStatus: string): LeadStage => {
    if (!rawStatus) return 'nuevo';
    const s = String(rawStatus).toLowerCase().trim();
    if (s === 'cliente' || s === 'cerrado' || s === 'ganado' || s === 'converted') return 'cerrado';
    if (s === 'contactado' || s === 'en conversación' || s === 'conversacion') return 'conversacion';
    if (s === 'cotizado') return 'cotizado';
    if (s === 'perdido' || s === 'perdió interés' || s === 'descartado') return 'perdido';
    return 'nuevo';
  };

  const mapStageToSheetStatus = (stage: LeadStage): string => {
    switch (stage) {
      case 'nuevo': return 'Lead';
      case 'conversacion': return 'Contactado';
      case 'cotizado': return 'Cotizado';
      case 'cerrado': return 'Cliente';
      case 'perdido': return 'Perdió Interés';
      default: return 'Contactado';
    }
  };

  useEffect(() => {
    if (selectedLead) {
      setEditName(selectedLead.name);
      setEditPhone(selectedLead.phone);
      setEditService(selectedLead.serviceInterest);
      setEditValue(selectedLead.value);
      setEditNotes(selectedLead.notes || '');
      setSaveSuccess(false);
    }
  }, [selectedLead]);

  // Fetch Leads from Sheets
  const fetchLeadsFromSheets = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const mappedLeads: Lead[] = data.map((item: any) => {
          const rawDate = item['Fecha'] ? String(item['Fecha']).split('T')[0] : new Date().toISOString().split('T')[0];
          const proposedAmount = parseAmountNumber(item['Monto Propuesto']);
          const closedAmount = parseAmountNumber(item['Monto Cerrado ($)']);
          const val = closedAmount > 0 ? closedAmount : proposedAmount;

          return {
            id: String(item['ID Lead'] || `lead_${Math.random()}`),
            name: String(item['Cliente'] || 'Cliente sin nombre').replace(/<test lead.*>/i, 'Cliente Demo Meta'),
            company: String(item['Cliente'] || 'Empresa').replace(/<test lead.*>/i, 'Cliente Demo'),
            email: '',
            phone: cleanPhone(item['Teléfono']),
            serviceInterest: String(item['Plan Solicitado'] || 'Desarrollo Web').replace(/_/g, ' '),
            value: val,
            stage: mapSheetStatusToStage(item['Estado Comercial']),
            origin: 'meta_ads',
            createdAt: rawDate,
            lastActivity: item['Próxima Acción'] ? `Próxima acción: ${item['Próxima Acción']}` : `Registrado el ${rawDate}`,
            notes: item['Notas'] || ''
          };
        });

        setLeads(mappedLeads);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error('Error al cargar datos desde CRM Ventas:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [setLeads]);

  useEffect(() => {
    fetchLeadsFromSheets();
  }, [fetchLeadsFromSheets]);

  // Move Lead Stage (Used by Select and Drag-and-Drop)
  const moveLeadStage = async (leadId: string, newStage: LeadStage) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage, lastActivity: `Estado cambiado a ${newStage.toUpperCase()} hoy` } : l));

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'update_status',
          id: leadId,
          status: mapStageToSheetStatus(newStage)
        })
      });
    } catch (err) {
      console.error('Error actualizando estado en Google Sheets:', err);
    }
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggingLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageKey) {
      setDragOverStage(stageKey);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, newStage: LeadStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggingLeadId;
    if (leadId) {
      moveLeadStage(leadId, newStage);
    }
    setDraggingLeadId(null);
    setDragOverStage(null);
  };

  // Save Lead Details
  const handleSaveLeadDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setIsSavingDetails(true);
    setSaveSuccess(false);

    const updatedLead: Lead = {
      ...selectedLead,
      name: editName.trim(),
      company: editName.trim(),
      phone: editPhone.trim(),
      serviceInterest: editService.trim(),
      value: Number(editValue) || 0,
      notes: editNotes.trim()
    };

    setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l));
    setSelectedLead(updatedLead);

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'update_lead',
          id: selectedLead.id,
          name: editName.trim(),
          phone: editPhone.trim(),
          serviceInterest: editService.trim(),
          value: Number(editValue) || 0,
          notes: editNotes.trim(),
          status: mapStageToSheetStatus(selectedLead.stage)
        })
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error al guardar en Google Sheets:', err);
    } finally {
      setIsSavingDetails(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.serviceInterest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);

    const matchesOrigin = originFilter === 'all' || lead.origin === originFilter;
    return matchesSearch && matchesOrigin;
  });

  const totalLeadsCount = leads.length;
  const closedCount = leads.filter(l => l.stage === 'cerrado').length;
  const conversionRate = totalLeadsCount > 0 ? ((closedCount / totalLeadsCount) * 100).toFixed(1) : '0';
  const pipelineValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const wonValue = leads.filter(l => l.stage === 'cerrado').reduce((sum, l) => sum + (l.value || 0), 0);

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
      
      {/* Top KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leads CRM Ventas</p>
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
            <p className="text-[11px] text-slate-500 mt-1">Cotizaciones acumuladas</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresos Ganados</p>
            <h3 className="text-xl font-extrabold text-emerald-600 mt-1">{formatCLP(wonValue)}</h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">Proyectos cerrados en CRM</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Control Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex items-center gap-3">
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

          <button
            onClick={fetchLeadsFromSheets}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
            title="Sincronizar con CRM Ventas"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar CRM Ventas'}</span>
          </button>

          {lastSyncTime && (
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              Sincr: {lastSyncTime}
            </span>
          )}
        </div>

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
            onClick={() => onOpenNewLeadModal()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Lead</span>
          </button>
        </div>

      </div>

      {/* KANBAN BOARD VIEW WITH DRAG & DROP */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage.key);
            const stageTotal = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);
            const isTargetDropStage = dragOverStage === stage.key;

            return (
              <div
                key={stage.key}
                onDragOver={(e) => handleDragOver(e, stage.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.key)}
                className={`bg-slate-50 border rounded-xl p-3 flex flex-col min-w-[260px] min-h-[500px] transition-all ${
                  isTargetDropStage ? 'border-emerald-500 ring-2 ring-emerald-400/40 bg-emerald-50/20' : 'border-slate-200/80'
                }`}
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
                      {isTargetDropStage ? '👉 Soltar aquí' : 'Sin leads en esta etapa'}
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => setSelectedLead(lead)}
                        className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing group relative ${
                          selectedLead?.id === lead.id ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
                        } ${draggingLeadId === lead.id ? 'opacity-40 border-dashed border-emerald-500' : ''}`}
                      >
                        {/* Drag Grip Handle Visual Indicator */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-300 transition">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          {getOriginBadge(lead.origin)}
                          <span className="text-xs font-black text-slate-900 font-mono">
                            {formatCLP(lead.value)}
                          </span>
                        </div>

                        <h5 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition">
                          {lead.name}
                        </h5>
                        <p className="text-xs text-slate-600 font-medium mb-2">
                          {lead.phone || 'Sin teléfono'}
                        </p>

                        <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2 line-clamp-2 font-medium">
                          {lead.serviceInterest}
                        </div>

                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-slate-500 truncate max-w-[150px]">
                            {lead.lastActivity}
                          </span>
                          <span className="font-mono">{lead.createdAt}</span>
                        </div>

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
                  <th className="p-3">Cliente / Nombre</th>
                  <th className="p-3">Origen</th>
                  <th className="p-3">Plan Solicitado</th>
                  <th className="p-3">Monto Propuesto</th>
                  <th className="p-3">Estado Comercial</th>
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
                        <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                        <div className="text-slate-500">{lead.phone}</div>
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
                          <option value="nuevo">Lead</option>
                          <option value="conversacion">Contactado</option>
                          <option value="cotizado">Cotizado</option>
                          <option value="cerrado">Cliente</option>
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDITABLE LEAD DETAIL SIDEBAR */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex justify-end transition-opacity">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-slate-200">
            <form onSubmit={handleSaveLeadDetails} className="space-y-4">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">Editar Lead / Trato</span>
                  <h3 className="text-xl font-black text-slate-900">{editName || 'Cliente'}</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
                >
                  ✕
                </button>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>¡Cambios guardados correctamente en Google Sheets!</span>
                </div>
              )}

              {/* Botón de Agregar Nuevo Trato para este Cliente */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-xs">¿Nuevo Servicio o Proyecto?</p>
                  <p className="text-[10px] text-slate-500">Crea un segundo trato para {editName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const clientData = { name: editName, phone: editPhone };
                    setSelectedLead(null);
                    onOpenNewLeadModal(clientData);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-xs"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>＋ Nuevo Trato</span>
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Nombre Cliente / Empresa</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Teléfono WhatsApp</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Plan Solicitado / Servicio</label>
                  <input
                    type="text"
                    value={editService}
                    onChange={(e) => setEditService(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Monto Registrado / Cierre ($ CLP)</label>
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-300 text-emerald-900 font-mono font-extrabold text-base rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Notas Comerciales / Historial</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={4}
                    placeholder="Agrega notas de llamadas, acuerdos de precio o fechas..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">ID Único Lead</label>
                  <p className="font-mono text-slate-500 text-[11px]">{selectedLead.id}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <button
                  type="submit"
                  disabled={isSavingDetails}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingDetails ? 'Guardando...' : 'Guardar Cambios en Google Sheets'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onConvertLeadToQuote(selectedLead);
                    setSelectedLead(null);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Generar Presupuesto Oficial PDF</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
