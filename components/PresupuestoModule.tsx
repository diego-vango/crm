'use client';

import React, { useState } from 'react';
import { Presupuesto, BudgetItem, COMPANY_DATA } from '@/types/crm';
import { formatCLP, calculateBudgetFinancials, formatDateCL } from '@/lib/formatters';
import { 
  Printer, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  Download, 
  Share2, 
  Copy, 
  Building2, 
  FileText, 
  DollarSign, 
  ShieldCheck, 
  CreditCard,
  ChevronRight,
  Info
} from 'lucide-react';

interface PresupuestoModuleProps {
  presupuestos: Presupuesto[];
  setPresupuestos: React.Dispatch<React.SetStateAction<Presupuesto[]>>;
  activePresupuesto: Presupuesto;
  setActivePresupuesto: React.Dispatch<React.SetStateAction<Presupuesto>>;
  onSavePresupuesto: (p: Presupuesto) => void;
}

const PRESET_SERVICES = [
  {
    title: 'Desarrollo Sitio Web Pro + Dominio .cl Gratis',
    description: 'Diseño UX/UI responsivo corporativo en Next.js/Tailwind, optimización SEO de velocidad, SSL y configuración de hosting.',
    netAmount: 650000,
  },
  {
    title: 'Tienda Online Ecommerce + Pasarela Webpay Plus',
    description: 'Catálogo de productos con carro de compras, integración de pagos Webpay Plus / Transbank, cálculo de envíos y panel autoadministrable.',
    netAmount: 950000,
  },
  {
    title: 'Sistema Reserva de Horas Médicas & Calendario',
    description: 'Módulo interactivo de toma de horas con confirmación por correo, agenda por profesional y ficha técnica de paciente.',
    netAmount: 450000,
  },
  {
    title: 'Posicionamiento SEO Local + Ficha Google Maps',
    description: 'Optimización en motores de búsqueda para keywords clave en La Serena/Coquimbo y Chile, alta en Google Business Profile.',
    netAmount: 250000,
  },
];

let itemIdCounter = 0;
function createItemId(): string {
  itemIdCounter += 1;
  return `item-${itemIdCounter}-${Date.now().toString(36)}`;
}

export const PresupuestoModule: React.FC<PresupuestoModuleProps> = ({
  presupuestos,
  setPresupuestos,
  activePresupuesto,
  setActivePresupuesto,
  onSavePresupuesto,
}) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiBox, setShowAiBox] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Recalculate financials dynamically on form changes
  const financials = calculateBudgetFinancials(
    activePresupuesto.items,
    activePresupuesto.appliesIva,
    activePresupuesto.nicChileFee || 9990
  );

  // Update item
  const updateItem = (index: number, field: keyof BudgetItem, value: any) => {
    const newItems = [...activePresupuesto.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setActivePresupuesto({ ...activePresupuesto, items: newItems });
  };

  // Add item
  const addItem = (preset?: { title: string; description: string; netAmount: number }) => {
    const uniqueId = createItemId();
    const newItem: BudgetItem = preset
      ? { id: uniqueId, ...preset }
      : { id: uniqueId, title: '', description: '', netAmount: 0 };

    setActivePresupuesto({
      ...activePresupuesto,
      items: [...activePresupuesto.items, newItem],
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    if (activePresupuesto.items.length <= 1) {
      alert('El presupuesto debe contener al menos 1 ítem.');
      return;
    }
    const newItems = activePresupuesto.items.filter((_, i) => i !== index);
    setActivePresupuesto({ ...activePresupuesto, items: newItems });
  };

  // Trigger browser print for PDF export
  const handlePrint = () => {
    onSavePresupuesto({
      ...activePresupuesto,
      totalNet: financials.totalNet,
      ivaAmount: financials.ivaAmount,
      totalAmount: financials.totalAmount,
      anticipo50: financials.anticipo50,
    });
    window.print();
  };

  // Copy share link
  const handleCopyShareLink = () => {
    const link = `https://crm.paginaspro.cl/presupuesto/PPTO-${activePresupuesto.correlativo}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // AI Assist feature using Gemini API
  const handleGenerateAiProposal = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Crea un detalle de ítem de cotización comercial para PáginasPro.cl con este requerimiento de cliente: "${aiPrompt}". Incluye un título claro y una descripción técnica profesional de 2 líneas.`,
          type: 'quote_items',
        }),
      });

      const data = await res.json();
      if (data.text) {
        // Append generated text as new item
        addItem({
          title: `Desarrollo Especializado - ${activePresupuesto.clientCompany || 'Cliente'}`,
          description: data.text.trim(),
          netAmount: 500000,
        });
        setAiPrompt('');
        setShowAiBox(false);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo generar la propuesta con IA en este momento.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT COLUMN: FAST EDITOR FORM (no-print) */}
      <div className="no-print lg:col-span-5 space-y-6">
        
        {/* Presupuestos Saved Selector */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Historial de Cotizaciones
            </h3>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {presupuestos.length} Guardados
            </span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {presupuestos.map((p) => (
              <div
                key={p.id}
                onClick={() => setActivePresupuesto(p)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                  activePresupuesto.id === p.id
                    ? 'border-emerald-500 bg-emerald-50/60 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="font-mono font-bold text-slate-900">PPTO N° {p.correlativo}</span>
                  <span className="text-slate-500 block truncate max-w-[180px]">{p.clientCompany} ({p.clientName})</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-700 font-extrabold">{formatCLP(p.totalAmount || p.totalNet)}</span>
                  <span className="text-[10px] block text-slate-400">{p.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Form Fields */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Generador de Presupuesto</span>
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              N° {activePresupuesto.correlativo}
            </span>
          </div>

          {/* Client Details Inputs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Empresa / Razón Social</label>
              <input
                type="text"
                value={activePresupuesto.clientCompany}
                onChange={(e) => setActivePresupuesto({ ...activePresupuesto, clientCompany: e.target.value })}
                placeholder="ej: Altavita Salud SpA"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">RUT Cliente (Opcional)</label>
              <input
                type="text"
                value={activePresupuesto.clientRut || ''}
                onChange={(e) => setActivePresupuesto({ ...activePresupuesto, clientRut: e.target.value })}
                placeholder="77.291.803-K"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Nombre de Contacto</label>
              <input
                type="text"
                value={activePresupuesto.clientName}
                onChange={(e) => setActivePresupuesto({ ...activePresupuesto, clientName: e.target.value })}
                placeholder="Dra. María José Altamirano"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">Teléfono</label>
              <input
                type="text"
                value={activePresupuesto.clientPhone}
                onChange={(e) => setActivePresupuesto({ ...activePresupuesto, clientPhone: e.target.value })}
                placeholder="+56 9 5543 2198"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Fecha Emisión</label>
              <input
                type="date"
                value={activePresupuesto.date}
                onChange={(e) => setActivePresupuesto({ ...activePresupuesto, date: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">Validez (Días)</label>
              <input
                type="number"
                value={activePresupuesto.validityDays}
                onChange={(e) => setActivePresupuesto({ ...activePresupuesto, validityDays: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Preset Services Shortcuts */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1">Insertar Plantilla de Servicio Rápida:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SERVICES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addItem(preset)}
                  className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-700 font-medium px-2 py-1 rounded transition"
                >
                  + {preset.title.split('+')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* AI Generator Box Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowAiBox(!showAiBox)}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Generar propuesta redactada con IA (Gemini)</span>
            </button>

            {showAiBox && (
              <div className="mt-2.5 p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe brevemente lo que necesita el cliente (ej: Sitio web para clínica dental con mapa e integración de reservaciones)..."
                  rows={2}
                  className="w-full p-2 text-xs bg-white border border-emerald-300 rounded-md focus:outline-none"
                />
                <button
                  onClick={handleGenerateAiProposal}
                  disabled={aiLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 rounded-md flex items-center justify-center gap-1 transition"
                >
                  {aiLoading ? 'Generando con IA...' : 'Crear Ítem Técnico con Gemini'}
                </button>
              </div>
            )}
          </div>

          {/* Service Items List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Ítems de Servicios ({activePresupuesto.items.length})</label>
              <button
                onClick={() => addItem()}
                className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar ítem
              </button>
            </div>

            {activePresupuesto.items.map((item, index) => (
              <div key={item.id || index} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative group">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                    placeholder="Título del Servicio"
                    className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => removeItem(index)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Eliminar Ítem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Descripción detallada de lo que incluye el servicio..."
                  rows={2}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 focus:outline-none"
                />

                <div className="flex items-center justify-end gap-2 text-xs">
                  <span className="font-medium text-slate-500">Valor Neto ($ CLP):</span>
                  <input
                    type="number"
                    value={item.netAmount}
                    onChange={(e) => updateItem(index, 'netAmount', Number(e.target.value))}
                    className="w-32 p-1.5 bg-white border border-slate-300 rounded text-right font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Tax Checkbox & NIC Fee */}
          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
              <input
                type="checkbox"
                checked={activePresupuesto.appliesIva}
                onChange={(e) => setActivePresupuesto({ ...activePresupuesto, appliesIva: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span>¿Aplica IVA 19% en la cotización?</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Al activar IVA, se desglosa el 19% legal para facturación electrónica en Chile.
            </p>
          </div>

          {/* Save & Print Action Buttons */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <button
              onClick={handlePrint}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Descargar / Imprimir Presupuesto Oficial (PDF)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSavePresupuesto({
                  ...activePresupuesto,
                  totalNet: financials.totalNet,
                  ivaAmount: financials.ivaAmount,
                  totalAmount: financials.totalAmount,
                  anticipo50: financials.anticipo50,
                })}
                className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>

              <button
                onClick={handleCopyShareLink}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition border border-slate-300"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-600" />
                <span>{copiedLink ? '¡Link Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: LIVE PREVIEW OF THE OFFICIAL SHEET (Print Target) */}
      <div className="lg:col-span-7">
        
        {/* Printable Paper Document Sheet */}
        <div className="print-only-container bg-white text-slate-900 border border-slate-300 shadow-2xl rounded-none p-8 md:p-10 max-w-2xl mx-auto min-h-[842px] relative flex flex-col justify-between font-sans">
          
          {/* Top Decorative Geometric Banner (PáginasPro Emerald Triangle Accent) */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-slate-900"></div>

          <div>
            {/* Header section with brand and document metadata */}
            <div className="flex justify-between items-start border-b-2 border-emerald-500 pb-6 mb-6">
              
              {/* Brand Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-emerald-500 text-slate-950 font-black px-2 py-1 text-sm rounded">
                    PáginasPro.cl
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Vango SpA
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{COMPANY_DATA.direccion}</p>
                <p className="text-xs text-slate-600">RUT: <span className="font-mono font-bold text-slate-800">{COMPANY_DATA.rut}</span></p>
                <p className="text-xs text-slate-600">Teléfono: {COMPANY_DATA.telefono}</p>
                <p className="text-xs text-slate-600">Email: {COMPANY_DATA.emailContact}</p>
              </div>

              {/* Document Title & Number Box */}
              <div className="text-right">
                <div className="bg-slate-900 text-white px-4 py-2 rounded-lg shadow-sm">
                  <h1 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Presupuesto Oficial
                  </h1>
                  <div className="text-xl font-black font-mono mt-0.5 text-white">
                    N° {activePresupuesto.correlativo}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 space-y-0.5 font-mono">
                  <div>Fecha: <strong className="text-slate-800">{formatDateCL(activePresupuesto.date)}</strong></div>
                  <div>Validez: <strong className="text-slate-800">{activePresupuesto.validityDays} días corridos</strong></div>
                </div>
              </div>

            </div>

            {/* Client Information Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Cliente / Receptor del Presupuesto
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Empresa / Razón Social:</span>
                  <strong className="text-slate-900 text-sm block">{activePresupuesto.clientCompany || 'Cliente Sin Nombre'}</strong>
                  {activePresupuesto.clientRut && (
                    <span className="text-slate-500 text-[11px] font-mono">RUT: {activePresupuesto.clientRut}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block">Atención:</span>
                  <strong className="text-slate-800 block">{activePresupuesto.clientName || 'Representante'}</strong>
                  <span className="text-slate-500 text-[11px]">{activePresupuesto.clientPhone}</span>
                </div>
              </div>
            </div>

            {/* Items Breakdown Table */}
            <div className="mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
                    <th className="p-3 rounded-tl-lg">Ítem / Descripción del Servicio</th>
                    <th className="p-3 text-right rounded-tr-lg">Valor Neto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                  {activePresupuesto.items.map((item, idx) => (
                    <tr key={item.id || idx} className="print-page-break">
                      <td className="p-3.5 align-top">
                        <div className="font-extrabold text-slate-900 text-sm mb-1">{item.title || 'Servicio Desarrollo Web'}</div>
                        <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">{item.description}</p>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 text-sm align-top whitespace-nowrap">
                        {formatCLP(item.netAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Totals & 50% Advance Payment Box */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8 print-page-break">
              
              {/* Payment Conditions & NIC Info */}
              <div className="sm:w-1/2 space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider text-emerald-700">
                  Condiciones Comerciales
                </div>
                <p className="text-[11px] leading-normal bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {activePresupuesto.notes || '50% de anticipo para iniciar desarrollo y 50% restante contra entrega conforme del sitio web publicado en dominio definitivo.'}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Incluye 90 días de garantía técnica y soporte posventa.</span>
                </div>
              </div>

              {/* Financial Calculation Box */}
              <div className="sm:w-1/2 bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Neto:</span>
                  <span className="font-mono font-semibold">{formatCLP(financials.totalNet)}</span>
                </div>

                {activePresupuesto.appliesIva ? (
                  <div className="flex justify-between text-slate-600">
                    <span>IVA (19%):</span>
                    <span className="font-mono font-semibold">{formatCLP(financials.ivaAmount)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-slate-400 italic text-[11px]">
                    <span>IVA 19%:</span>
                    <span>No Aplica</span>
                  </div>
                )}

                <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-300">
                  <span>TOTAL COTIZADO:</span>
                  <span className="font-mono text-emerald-700">{formatCLP(financials.totalAmount)}</span>
                </div>

                {/* Breakdown of 50% Advance & NIC Chile Fee */}
                <div className="mt-3 pt-2 border-t-2 border-emerald-500 space-y-1.5">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>50% Anticipo para Iniciar:</span>
                    <span className="font-mono font-bold text-slate-900">{formatCLP(financials.anticipo50)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>Arancel NIC Chile (.cl):</span>
                    <span className="font-mono text-slate-800">$ 9.990</span>
                  </div>
                  <div className="bg-emerald-100/80 p-2 rounded-lg border border-emerald-300 flex justify-between font-extrabold text-slate-900 text-sm mt-1">
                    <span className="text-emerald-950">TOTAL A PAGAR AL INICIO:</span>
                    <span className="font-mono text-emerald-900">{formatCLP(financials.totalPayToStart)}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Scotiabank Official Bank Payment Details */}
            <div className="bg-slate-900 text-white rounded-xl p-4 mb-6 print-page-break">
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-800">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Datos de Transferencia Bancaria Directa
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Titular:</span>
                  <strong className="text-white block">{COMPANY_DATA.razonSocial}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">RUT Empresa:</span>
                  <strong className="text-emerald-300 font-mono block">{COMPANY_DATA.rut}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Banco / Cuenta:</span>
                  <strong className="text-white block">{COMPANY_DATA.banco} | Cta. Cte. N° {COMPANY_DATA.numeroCuenta}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Enviar Comprobante:</span>
                  <strong className="text-slate-300 block text-[11px] font-mono">diego@vango.cl</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Signature & Terms Area */}
          <div className="pt-6 border-t border-slate-200 mt-auto text-[10px] text-slate-500 flex justify-between items-end print-page-break">
            <div>
              <p className="font-semibold text-slate-700">PáginasPro.cl • Vango SpA</p>
              <p>Desarrollo Web & Soluciones Digitales en La Serena y todo Chile.</p>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-400 w-40 mb-1"></div>
              <p className="font-semibold text-slate-700">Aceptación y Firma de Conforme Cliente</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
