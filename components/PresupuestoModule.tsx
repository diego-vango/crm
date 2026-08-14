'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Presupuesto, BudgetItem, COMPANY_DATA } from '@/types/crm';
import { formatCLP, calculateBudgetFinancials, formatDateCL } from '@/lib/formatters';
import { 
  Printer, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  Share2, 
  FileText, 
  RefreshCw,
  Save,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyAYhe9xRCAh1cEjlWq7fioCmOJfcJqwGrOkZFSTGczZlVBr0vr4eqrUeMGQ2yjq899/exec';

interface PresupuestoModuleProps {
  presupuestos: Presupuesto[];
  setPresupuestos: React.Dispatch<React.SetStateAction<Presupuesto[]>>;
  activePresupuesto: Presupuesto;
  setActivePresupuesto: React.Dispatch<React.SetStateAction<Presupuesto>>;
  onSavePresupuesto: (p: Presupuesto) => void;
}

const PRESET_SERVICES = [
  {
    title: 'Desarrollo Sitio Web Pro + Dominio .cl',
    description: 'Diseño UX/UI responsivo corporativo en Next.js/Tailwind, optimización SEO de velocidad, SSL y configuración de hosting.',
    netAmount: 650000,
  },
  {
    title: 'Tienda Online Ecommerce + Pasarela Webpay Plus',
    description: 'Catálogo de productos con carro de compras, integración de pagos Webpay Plus / Transbank y panel autoadministrable.',
    netAmount: 950000,
  },
  {
    title: 'Sistema Reserva de Horas Médicas & Agenda',
    description: 'Módulo interactivo de toma de agendamientos con confirmación por correo, calendario por profesional y ficha técnica.',
    netAmount: 450000,
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
  const [formData, setFormData] = useState<Presupuesto>(activePresupuesto);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingHistorial, setIsSyncingHistorial] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (activePresupuesto) {
      setFormData(activePresupuesto);
    }
  }, [activePresupuesto]);

  // Cargar Historial desde Google Sheets
  const fetchPresupuestosFromSheets = useCallback(async () => {
    setIsSyncingHistorial(true);
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?type=presupuestos`);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const mappedPptos: Presupuesto[] = data.map((item: any) => {
          let parsedItems: BudgetItem[] = [];
          try {
            parsedItems = typeof item.itemsJson === 'string' ? JSON.parse(item.itemsJson) : (item.itemsJson || []);
          } catch (e) {
            parsedItems = [];
          }

          if (parsedItems.length === 0) {
            parsedItems = [{
              id: 'item-1',
              title: item.asunto || 'Desarrollo Sitio Web Pro',
              description: 'Servicio maquetado en Next.js/Tailwind CSS con $0/mes de servidor.',
              netAmount: Number(item.montoNeto) || 100000
            }];
          }

          const net = Number(item.montoNeto) || 100000;
          const iva = Number(item.iva) || Math.round(net * 0.19);
          const total = Number(item.montoTotal) || (net + iva);

          return {
            id: `ppto-${item.correlativo}`,
            correlativo: Number(item.correlativo) || 228,
            clientName: item.atencion || item.cliente || 'Cliente',
            clientCompany: item.cliente || 'Empresa',
            clientEmail: 'diego@paginaspro.cl',
            clientPhone: item.telefono || '',
            date: item.fecha || new Date().toISOString().split('T')[0],
            validityDays: 15,
            items: parsedItems,
            appliesIva: iva > 0,
            notes: item.condiciones || '50% de anticipo para iniciar el proyecto. 50% restante contra entrega conforme.',
            totalNet: net,
            ivaAmount: iva,
            totalAmount: total,
            anticipo50: Math.round(total / 2),
            nicChileFee: 9990,
            status: 'enviado'
          };
        });

        setPresupuestos(mappedPptos);
        if (mappedPptos.length > 0) {
          setActivePresupuesto(mappedPptos[0]);
        }
      }
    } catch (err) {
      console.error('Error al cargar presupuestos desde Sheets:', err);
    } finally {
      setIsSyncingHistorial(false);
    }
  }, [setPresupuestos, setActivePresupuesto]);

  useEffect(() => {
    fetchPresupuestosFromSheets();
  }, [fetchPresupuestosFromSheets]);

  // Cálculos Financieros
  const financials = calculateBudgetFinancials(
    formData.items || [],
    formData.appliesIva,
    formData.nicChileFee || 9990
  );

  const handleFieldChange = (field: keyof Presupuesto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof BudgetItem, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, items: updatedItems });
  };

  const handleAddItem = (preset?: { title: string; description: string; netAmount: number }) => {
    const newItem: BudgetItem = preset
      ? { id: createItemId(), ...preset }
      : {
          id: createItemId(),
          title: 'Nuevo Servicio / Módulo',
          description: 'Descripción detallada del alcance del trabajo.',
          netAmount: 100000,
        };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return;
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  // Guardar en Google Sheets
  const handleSaveAndSync = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const updatedPpto: Presupuesto = {
      ...formData,
      totalNet: financials.totalNet,
      ivaAmount: financials.ivaAmount,
      totalAmount: financials.totalAmount,
      anticipo50: financials.anticipo50,
    };

    onSavePresupuesto(updatedPpto);

    try {
      const asuntoText = formData.items.map(i => i.title).join(' + ');
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'save_presupuesto',
          correlativo: formData.correlativo,
          fecha: formData.date,
          cliente: formData.clientCompany || formData.clientName,
          atencion: formData.clientName,
          telefono: formData.clientPhone,
          asunto: asuntoText,
          montoNeto: financials.totalNet,
          iva: financials.ivaAmount,
          montoTotal: financials.totalAmount,
          condiciones: formData.notes,
          items: formData.items
        })
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error guardando presupuesto en Google Sheets:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    handleSaveAndSync();
    window.print();
  };

  const handleCopyShareLink = () => {
    const link = `https://crm.paginaspro.cl/presupuesto/PPTO-${formData.correlativo}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* IZQUIERDA: FORMULARIO Y HISTORIAL */}
      <div className="no-print lg:col-span-5 space-y-5 text-xs">
        
        {/* Historial de Presupuestos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Historial de Presupuestos</h3>
              <p className="text-[10px] text-slate-400">Pestaña Historial_Presupuestos en Sheets</p>
            </div>
            <button
              onClick={fetchPresupuestosFromSheets}
              disabled={isSyncingHistorial}
              className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition"
              title="Actualizar Historial"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingHistorial ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {presupuestos.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setActivePresupuesto(p);
                  setFormData(p);
                }}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                  formData.correlativo === p.correlativo
                    ? 'border-emerald-500 bg-emerald-50/60 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="font-mono font-bold text-slate-900">PPTO N° {p.correlativo}</span>
                  <span className="text-slate-500 block truncate max-w-[180px]">{p.clientCompany || p.clientName}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-700 font-extrabold">{formatCLP(p.totalAmount)}</span>
                  <span className="text-[10px] block text-slate-400">{p.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario Editor */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Generador de Presupuesto</span>
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              N° {formData.correlativo}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Empresa / Razón Social</label>
              <input
                type="text"
                value={formData.clientCompany}
                onChange={(e) => handleFieldChange('clientCompany', e.target.value)}
                placeholder="ej: C.M.H Motors La Serena"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">Atención / Contacto</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => handleFieldChange('clientName', e.target.value)}
                placeholder="ej: Christian Manukian"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.clientPhone}
                onChange={(e) => handleFieldChange('clientPhone', e.target.value)}
                placeholder="+56 9 9683 1269"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">Fecha Emisión</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Plantillas Rápidas */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1">Insertar Plantilla Rápida:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SERVICES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddItem(preset)}
                  className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-700 font-medium px-2 py-1 rounded transition"
                >
                  + {preset.title.split('+')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Ítems */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Servicios Cotizados ({formData.items.length})</label>
              <button
                onClick={() => handleAddItem()}
                className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Ítem
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={item.id || index} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                    placeholder="Título del Servicio"
                    className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  {formData.items.length > 1 && (
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Eliminar Ítem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <textarea
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Descripción detallada del alcance del trabajo..."
                  rows={2}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 focus:outline-none"
                />

                <div className="flex items-center justify-end gap-2 text-xs">
                  <span className="font-medium text-slate-500">Valor Neto ($ CLP):</span>
                  <input
                    type="number"
                    value={item.netAmount}
                    onChange={(e) => handleItemChange(index, 'netAmount', Number(e.target.value))}
                    className="w-32 p-1.5 bg-white border border-slate-300 rounded text-right font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Checkbox IVA */}
          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 space-y-1">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
              <input
                type="checkbox"
                checked={formData.appliesIva}
                onChange={(e) => handleFieldChange('appliesIva', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span>Aplica IVA 19% en la cotización</span>
            </label>
          </div>

          {/* Acciones */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            {saveSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold rounded-lg text-center flex items-center justify-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>¡Presupuesto guardado en Google Sheets!</span>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar PDF Oficial</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSaveAndSync}
                disabled={isSaving}
                className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>

              <button
                onClick={handleCopyShareLink}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition border border-slate-300"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-600" />
                <span>{copiedLink ? '¡Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* DERECHA: DOCUMENTO OFICIAL (FIDELIDAD IMPRESIÓN AL PDF ORIGINAL) */}
      <div className="lg:col-span-7 flex justify-center">
        
        <div className="print-page bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-8 sm:p-12 w-full max-w-[800px] font-sans print:p-0 print:border-none print:shadow-none print:max-w-none">
          
          {/* ENCABEZADO OFICIAL */}
          <div className="flex justify-between items-start pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Páginas<span className="text-emerald-500">Pro</span>.cl
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Página Web / Desarrollo Web</p>
            </div>

            <div className="text-right">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Presupuesto</h2>
              <p className="text-xl font-extrabold text-slate-800 font-mono">N° {formData.correlativo}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Fecha: {formatDateCL(formData.date)}</p>
            </div>
          </div>

          {/* DATOS CLIENTE Y CONTACTO COMERCIAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
            
            <div className="space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cliente / Empresa:</span>
                <p className="font-bold text-slate-900 text-sm">
                  {formData.clientName} {formData.clientCompany ? `| ${formData.clientCompany}` : ''}
                </p>
              </div>
              {formData.clientPhone && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Teléfono:</span>
                  <p className="font-semibold text-slate-700 font-mono">{formData.clientPhone}</p>
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Asunto:</span>
                <p className="font-semibold text-slate-800 leading-tight">
                  {formData.items.map(i => i.title).join(' + ')}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-slate-600 sm:text-right border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-6 pt-3 sm:pt-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Información de contacto:</span>
              <p className="font-semibold text-slate-900">+56 9 9683 1269</p>
              <p>Colón 352 Of 318, La Serena</p>
              <p className="font-semibold text-emerald-600">páginaspro.cl</p>
              <p className="text-slate-500 font-mono">diego@paginaspro.cl</p>
            </div>

          </div>

          {/* ALCANCE DEL SERVICIO */}
          <div className="py-6 space-y-4">
            <div className="border-b-2 border-slate-900 pb-1">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                ALCANCE DEL SERVICIO / SERVICIO OFRECIDO
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              {formData.items.map((item, idx) => (
                <div key={item.id || idx} className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {idx + 1}. {item.title}
                    </h4>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      Valor Neto: {formatCLP(item.netAmount)}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium pl-4 border-l-2 border-slate-200">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* DATOS BANCARIOS Y RESUMEN FINANCIERO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
            
            {/* DATOS BANCARIOS */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">
                Datos Bancarios de Pago
              </span>
              <p className="font-bold text-slate-900">PáginasPro.cl</p>
              <p className="text-slate-600">Vango SpA PáginasPro</p>
              <p className="font-mono font-semibold text-slate-800">RUT: 78.406.599-5</p>
              <p className="text-slate-800">Banco Scotiabank</p>
              <p className="font-mono font-bold text-slate-900">Cuenta N° 993884572</p>
            </div>

            {/* RESUMEN DE TOTALES */}
            <div className="space-y-2">
              <div className="flex justify-between py-1 text-slate-600 font-medium">
                <span>Valor Neto Final:</span>
                <span className="font-mono font-bold text-slate-900">{formatCLP(financials.totalNet)}</span>
              </div>

              {formData.appliesIva && (
                <div className="flex justify-between py-1 text-slate-600 font-medium">
                  <span>IVA (19%):</span>
                  <span className="font-mono font-bold text-slate-900">{formatCLP(financials.ivaAmount)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-t-2 border-slate-900 font-extrabold text-sm text-slate-900">
                <span>VALOR TOTAL:</span>
                <span className="font-mono text-base text-emerald-700">{formatCLP(financials.totalAmount)}</span>
              </div>

              {formData.appliesIva && (
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] space-y-1 mt-2">
                  <div className="flex justify-between text-emerald-900 font-semibold">
                    <span>50% Anticipo para Iniciar:</span>
                    <span className="font-mono font-bold">{formatCLP(financials.anticipo50)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800">
                    <span>Arancel Dominio NIC Chile (.cl):</span>
                    <span className="font-mono font-semibold">$9.990</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* CONDICIONES COMERCIALES Y GARANTÍA */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-[11px] text-slate-600 space-y-2">
            <span className="font-bold uppercase tracking-wider text-slate-900 block text-[10px]">
              CONDICIONES COMERCIALES Y GARANTÍA
            </span>
            <p className="leading-relaxed">
              • <strong>Forma de Pago:</strong> 50% de anticipo + arancel dominio NIC Chile (ref. $9.990) para iniciar los trabajos. 50% restante contra entrega de la plataforma actualizada y probada.
            </p>
            <p className="leading-relaxed">
              • <strong>Plazo de Ejecución:</strong> 3 a 5 días hábiles desde la recepción de contenidos y material a ingresar en el sitio web (textos, logos, fotos, links de video).
            </p>
            <p className="leading-relaxed">
              • <strong>Garantía de Estabilidad (90 Días):</strong> PáginasPro.cl incluye una garantía técnica de 3 meses que cubre la estabilidad de la carga web y correcta visualización de los elementos entregados.
            </p>
          </div>

          {/* PIE DE PÁGINA */}
          <div className="mt-10 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium">
            <span>PáginasPro.cl • Soluciones Digitales en La Serena y Chile</span>
            <span>Aceptación y Conformidad del Cliente</span>
          </div>

        </div>

      </div>

    </div>
  );
};
