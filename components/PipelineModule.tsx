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
  Briefcase,
  Check
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
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  // Formulario Editable Lateral
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editService, setEditService] = useState('');
  const [editValue, setEditValue] = useState<number>(0);
  const [editNotes, setEditNotes] = useState('');

  const cleanText = (val: any, defaultText: string = '') => {
    if (!val || String(val).includes('#REF!') || String(val).toLowerCase() === 'nan') return defaultText;
    return String(val).replace(/<test lead.*>/i, 'Cliente Demo Meta').trim();
  };

  const cleanPhone = (phoneRaw: string) => {
    if (!phoneRaw || String(phoneRaw).includes('#REF!')) return '';
    return String(phoneRaw).replace(/^p:/i, '').trim();
  };

  const cleanPhoneForWa = (phoneRaw: string) => {
    if (!phoneRaw) return '';
    let cleaned = String(phoneRaw).replace(/[^0-9]/g, '');
    if (cleaned.length === 9 && cleaned.startsWith('9')) {
      cleaned = '56' + cleaned;
    }
    return cleaned;
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
      setEditEmail(selectedLead.email || '');
      setEditService(selectedLead.serviceInterest);
      setEditValue(selectedLead.value);
      setEditNotes(selectedLead.notes || '');
      setSaveSuccess(false);
    }
  }, [selectedLead]);

  // Carga de Leads desde Sheets
  const fetchLeadsFromSheets = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

        const mappedLeads: Lead[] = data.map((item: any) => {
          const rawDate = item['Fecha'] ? String(item['Fecha']).split('T')[0] : new Date().toISOString().split('T')[0];
          const proposedAmount = parseAmountNumber(item['Monto Propuesto']);
          const closedAmount = parseAmountNumber(item['Monto Cerrado ($)']);
          const val = closedAmount > 0 ? closedAmount : proposedAmount;

          const clientName = cleanText(item['Cliente'], 'Cliente sin nombre');
          const rawService = cleanText(item['Plan Solicitado'], 'Desarrollo Web Pro');
          const notesText = cleanText(item['Notas'], '');
          const rawEmail = item['email'] || item['Email'] || '';
          const foundEmail = rawEmail || (notesText.match(emailRegex)?.[0]) || '';

          return {
            id: String(item['ID Lead'] || `lead_${Math.random()}`),
            name: clientName,
            company: clientName,
            email: foundEmail,
            phone: cleanPhone(item['Teléfono']),
            serviceInterest: rawService.replace(/_/g, ' '),
            value: val,
            stage: mapSheetStatusToStage(item['Estado Comercial']),
            origin: 'meta_ads',
            createdAt: rawDate,
            lastActivity: item['Próxima Acción'] ? `Próxima acción: ${cleanText(item['Próxima Acción'])}` : `Registrado el ${rawDate}`,
            notes: notesText
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

  // Cambiar etapa del lead
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

  // Handlers para Acciones Directas (WhatsApp y Email)
  const handleWhatsAppClick = (lead: Lead) => {
    const waPhone = cleanPhoneForWa(lead.phone);
    if (!waPhone) {
      alert('Este contacto no posee un número de teléfono válido.');
      return;
    }
    const firstName = lead.name && lead.name !== 'Cliente sin nombre' ? lead.name.split(' ')[0] : '';
    const greeting = firstName ? `Hola ${firstName}` : 'Hola';
    const message = `${greeting}, aquí Diego de PáginasPro. Espero vaya todo bien. Recibí tus datos y me gustaría saber más de lo que necesitas para obtener tu página web.`;
    
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleEmailClick = (lead: Lead) => {
    if (!lead.email) {
      alert('No hay un correo registrado para este contacto.');
      return;
    }

    const firstName = lead.name && lead.name !== 'Cliente sin nombre' ? lead.name.split(' ')[0] : '';
    const greeting = firstName ? `Hola ${firstName}` : 'Hola';
    const subject = 'PáginasPro.cl — Tu página web profesional';
    const body = `${greeting},\n\nEspero te encuentres muy bien. Recibí tus datos a través de nuestro sitio web y me gustaría conversar brevemente para conocer más detalles de lo que necesitas para tu página web.\n\nQuedo muy atento a tus comentarios.\n\nSaludos cordiales,\nDiego Valderrama H.\nPáginasPro.cl`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    navigator.clipboard.writeText(lead.email);
    setCopiedEmailId(lead.id);
    setTimeout(() => setCopiedEmailId(null), 2500);

    window.open(gmailUrl, '_blank');
  };

  // Handlers Drag & Drop
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

  // Guardar Detalles
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
      email: editEmail.trim(),
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
      lead.phone.includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

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
    <div className="space-y-6 font-sans">
      
      {/* Top KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
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

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tasa de Conversión</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{conversionRate}%</h3>
            <p className="text-[11px] text-slate-500 mt-1">Eficiencia comercial en cierres</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor del Pipeline</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">{formatCLP(pipelineValue)}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Cotizaciones acumuladas</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
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

      {/* Toolbar Principal */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
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
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
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
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tablero Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Vista Tabla
            </button>
          </div>

          <button
            onClick={() => onOpenNewLeadModal()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Lead</span>
          </button>

          <button
            onClick={() => onOpenNewLeadModal()}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-xs border border-slate-800 cursor-pointer"
            title="Agregar un nuevo trato o proyecto comercial"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            <span>Agregar Trato</span>
          </button>
        </div>

      </div>

      {/* TABLERO KANBAN CON BOTONES DE ACCIÓN DIRECTA */}
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
                {/* Cabecera de Columna */}
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

                {/* Lista de Tarjetas */}
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
                        className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-grab active:cursor-grabbing group relative ${
                          selectedLead?.id === lead.id ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
                        } ${draggingLeadId === lead.id ? 'opacity-40 border-dashed border-emerald-500' : ''}`}
                      >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-300 transition">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          {getOriginBadge(lead.origin)}
                          <span className="text-xs font-black text-slate-900 font-mono">
                            {formatCLP(lead.value)}
                          </span>
                        </div>

                        <h5 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition leading-snug">
                          {lead.name}
                        </h5>
                        <p className="text-xs text-slate-600 font-medium mb-2 font-mono">
                          {lead.phone || 'Sin teléfono'}
                        </p>

                        <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2 line-clamp-2 font-medium">
                          {lead.serviceInterest}
                        </div>

                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-slate-500 truncate max-w-[140px]">
                            {lead.lastActivity}
                          </span>
                          <span className="font-mono">{lead.createdAt}</span>
                        </div>

                        {/* BOTONES DE ACCIÓN RÁPIDA: WHATSAPP | CORREO | COTIZAR */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                          
                          {/* BOTÓN WHATSAPP */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsAppClick(lead);
                            }}
                            className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[10px] py-1.5 px-2 rounded-lg border border-emerald-200 flex items-center justify-center gap-1 transition cursor-pointer"
                            title="Abrir chat en WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>WhatsApp</span>
                          </button>

                          {/* BOTÓN CORREO */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmailClick(lead);
                            }}
                            className="flex-1 bg-sky-50 hover:bg-sky-100 text-sky-800 font-extrabold text-[10px] py-1.5 px-2 rounded-lg border border-sky-200 flex items-center justify-center gap-1 transition cursor-pointer"
                            title={lead.email ? `Redactar a ${lead.email}` : "Enviar correo"}
                          >
                            {copiedEmailId === lead.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                <span>¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                <span>Correo</span>
                              </>
                            )}
                          </button>

                          {/* BOTÓN COTIZAR */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onConvertLeadToQuote(lead);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[10px] py-1.5 px-2 rounded-lg border border-slate-200 flex items-center justify-center gap-1 transition cursor-pointer"
                            title="Generar Presupuesto PDF"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
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
        /* VISTA TABLA */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 uppercase text-[10px] font-bold tracking-wider">
                  <th className="p-3">Cliente / Nombre</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3">Plan Solicitado</th>
                  <th className="p-3">Monto Propuesto</th>
                  <th className="p-3">Estado Comercial</th>
                  <th className="p-3 text-right">Acciones Directas</th>
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
                        <div className="text-slate-400 text-[10px] font-mono">{lead.createdAt}</div>
                      </td>
                      <td className="p-3 font-mono">
                        <div className="text-slate-800 font-semibold">{lead.phone || 'Sin teléfono'}</div>
                        <div className="text-slate-500 text-[11px]">{lead.email || 'Sin correo'}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-700 max-w-xs">{lead.serviceInterest}</td>
                      <td className="p-3 font-bold font-mono text-slate-900">{formatCLP(lead.value)}</td>
                      <td className="p-3">
                        <select
                          value={lead.stage}
                          onChange={(e) => moveLeadStage(lead.id, e.target.value as LeadStage)}
                          className="text-xs font-semibold bg-slate-100 border border-slate-300 rounded-md px-2 py-1 text-slate-800 cursor-pointer"
                        >
                          <option value="nuevo">Lead</option>
                          <option value="conversacion">Contactado</option>
                          <option value="cotizado">Cotizado</option>
                          <option value="cerrado">Cliente</option>
                          <option value="perdido">Perdió Interés</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleWhatsAppClick(lead)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1 cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => handleEmailClick(lead)}
                            className="bg-sky-50 hover:bg-sky-100 text-sky-800 font-extrabold text-[10px] px-2.5 py-1 rounded-md border border-sky-200 flex items-center gap-1 cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5 text-sky-600" />
                            <span>Correo</span>
                          </button>

                          <button
                            onClick={() => onConvertLeadToQuote(lead)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-2.5 py-1 rounded-md inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Cotizar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PANEL LATERAL EDITABLE */}
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
                  className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1 cursor-pointer"
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-xs cursor-pointer"
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
                  <label className="text-slate-500 font-bold block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="contacto@cliente.cl"
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
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer"
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
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition cursor-pointer"
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
