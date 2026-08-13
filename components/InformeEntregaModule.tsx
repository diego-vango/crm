'use client';

import React, { useState } from 'react';
import { InformeEntrega, CredentialItem, DeliverableCheck, COMPANY_DATA } from '@/types/crm';
import { calculateWarrantyDates, formatDateCL } from '@/lib/formatters';
import { 
  CheckCircle2, 
  Printer, 
  Plus, 
  Trash2, 
  Key, 
  Globe, 
  Mail, 
  ShieldCheck, 
  ExternalLink, 
  Calendar,
  FileCheck2,
  Lock,
  Share2
} from 'lucide-react';

interface InformeEntregaModuleProps {
  informes: InformeEntrega[];
  setInformes: React.Dispatch<React.SetStateAction<InformeEntrega[]>>;
  activeInforme: InformeEntrega;
  setActiveInforme: React.Dispatch<React.SetStateAction<InformeEntrega>>;
  onSaveInforme: (inf: InformeEntrega) => void;
}

const DEFAULT_DELIVERABLES: DeliverableCheck[] = [
  { id: 'd1', label: 'Certificado de Seguridad SSL HTTPS Activo y Válido', completed: true },
  { id: 'd2', label: 'Diseño 100% Adaptativo Responsivo (Celulares, Tablets y Desktop)', completed: true },
  { id: 'd3', label: 'Botones y Formulario de Contacto Directo a WhatsApp', completed: true },
  { id: 'd4', label: 'Optimización de Velocidad de Carga Ultra-Rápida', completed: true },
  { id: 'd5', label: 'Casillas de Correo Corporativo Pruebas Recibidas y Enviadas', completed: true },
  { id: 'd6', label: 'Indexación Inicial en Google Search Console & Analytics', completed: true },
  { id: 'd7', label: 'Sistema de Respaldos de Seguridad Automáticos', completed: true },
  { id: 'd8', label: 'Capacitación en Video para Administración de Contenidos', completed: true },
];

let credCounter = 0;
function createCredId(): string {
  credCounter += 1;
  return `c-${credCounter}-${Date.now().toString(36)}`;
}

export const InformeEntregaModule: React.FC<InformeEntregaModuleProps> = ({
  informes,
  setInformes,
  activeInforme,
  setActiveInforme,
  onSaveInforme,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Recalculate 90 days warranty
  const handleStartDateChange = (dateStr: string) => {
    const dates = calculateWarrantyDates(dateStr);
    setActiveInforme({
      ...activeInforme,
      warrantyStartDate: dates.warrantyStartDate,
      warrantyEndDate: dates.warrantyEndDate,
      deliveryDate: dates.warrantyStartDate,
    });
  };

  // Credentials management
  const addCredential = () => {
    const newCred: CredentialItem = {
      id: createCredId(),
      title: 'Acceso Administración Web',
      url: `${activeInforme.webUrl || 'https://cliente.cl'}/admin`,
      username: 'admin',
      passHint: 'Enviado por canal seguro WhatsApp/E-mail',
    };
    setActiveInforme({
      ...activeInforme,
      credentials: [...activeInforme.credentials, newCred],
    });
  };

  const removeCredential = (id: string) => {
    setActiveInforme({
      ...activeInforme,
      credentials: activeInforme.credentials.filter(c => c.id !== id),
    });
  };

  const updateCredential = (id: string, field: keyof CredentialItem, val: string) => {
    setActiveInforme({
      ...activeInforme,
      credentials: activeInforme.credentials.map(c => c.id === id ? { ...c, [field]: val } : c),
    });
  };

  // Corporate emails management
  const [newEmailInput, setNewEmailInput] = useState('');
  const addCorporateEmail = () => {
    if (!newEmailInput.trim()) return;
    setActiveInforme({
      ...activeInforme,
      corporateEmails: [...activeInforme.corporateEmails, newEmailInput.trim()],
    });
    setNewEmailInput('');
  };

  const removeCorporateEmail = (emailStr: string) => {
    setActiveInforme({
      ...activeInforme,
      corporateEmails: activeInforme.corporateEmails.filter(e => e !== emailStr),
    });
  };

  // Toggle deliverable check
  const toggleDeliverable = (id: string) => {
    setActiveInforme({
      ...activeInforme,
      deliverablesChecklist: activeInforme.deliverablesChecklist.map(d =>
        d.id === id ? { ...d, completed: !d.completed } : d
      ),
    });
  };

  const handlePrint = () => {
    onSaveInforme(activeInforme);
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT COLUMN: EDIT FORM (no-print) */}
      <div className="no-print lg:col-span-5 space-y-6">
        
        {/* Saved Delivery Reports */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Informes de Entrega Guardados
            </h3>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {informes.length} Registrados
            </span>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {informes.map((inf) => (
              <div
                key={inf.id}
                onClick={() => setActiveInforme(inf)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                  activeInforme.id === inf.id
                    ? 'border-emerald-500 bg-emerald-50/60 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="font-bold text-slate-900 block truncate max-w-[180px]">{inf.companyName}</span>
                  <span className="text-slate-500 text-[11px]">{inf.webUrl}</span>
                </div>
                <div className="text-right text-[10px] font-mono text-emerald-700">
                  Garantía hasta: {formatDateCL(inf.warrantyEndDate)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Configuración de Entrega y Garantía</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Empresa / Proyecto</label>
              <input
                type="text"
                value={activeInforme.companyName}
                onChange={(e) => setActiveInforme({ ...activeInforme, companyName: e.target.value })}
                placeholder="ej: Refugio Noche Andina"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">Cliente Contacto</label>
              <input
                type="text"
                value={activeInforme.clientName}
                onChange={(e) => setActiveInforme({ ...activeInforme, clientName: e.target.value })}
                placeholder="Gonzalo Morales"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">URL Sitio Web Publicado</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={activeInforme.webUrl}
                onChange={(e) => setActiveInforme({ ...activeInforme, webUrl: e.target.value })}
                placeholder="https://nocheandina.cl"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <a
                href={activeInforme.webUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Warranty Date Picker (+90 days) */}
          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Garantía Técnica Legal de 90 Días</span>
              </span>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-950 font-mono px-2 py-0.5 rounded font-bold">
                90 Días Cobertura
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <label className="text-slate-600 block text-[10px] font-medium mb-1">Fecha de Entrega / Inicio</label>
                <input
                  type="date"
                  value={activeInforme.warrantyStartDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full p-1.5 bg-white border border-emerald-300 rounded text-slate-900 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-slate-600 block text-[10px] font-medium mb-1">Término de Garantía (+90 d)</label>
                <input
                  type="date"
                  value={activeInforme.warrantyEndDate}
                  readOnly
                  className="w-full p-1.5 bg-emerald-100 border border-emerald-300 rounded text-slate-900 font-mono font-extrabold cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Delivered Credentials */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Credenciales de Acceso Entregadas</label>
              <button
                onClick={addCredential}
                className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Acceso
              </button>
            </div>

            {activeInforme.credentials.map((cred) => (
              <div key={cred.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={cred.title}
                    onChange={(e) => updateCredential(cred.id, 'title', e.target.value)}
                    placeholder="Título de acceso"
                    className="p-1 bg-white border border-slate-300 rounded font-bold text-slate-900"
                  />
                  <button
                    onClick={() => removeCredential(cred.id)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cred.url}
                    onChange={(e) => updateCredential(cred.id, 'url', e.target.value)}
                    placeholder="URL de Login"
                    className="p-1 bg-white border border-slate-300 rounded font-mono"
                  />
                  <input
                    type="text"
                    value={cred.username}
                    onChange={(e) => updateCredential(cred.id, 'username', e.target.value)}
                    placeholder="Usuario"
                    className="p-1 bg-white border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Corporate Emails List */}
          <div className="space-y-2 pt-2 text-xs">
            <label className="font-bold text-slate-800 block">Correos Corporativos Habilitados</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                placeholder="ej: contacto@empresa.cl"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
              <button
                onClick={addCorporateEmail}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-2 rounded-lg"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeInforme.corporateEmails.map((email, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-mono px-2.5 py-1 rounded-full"
                >
                  <Mail className="w-3 h-3 text-emerald-600" />
                  {email}
                  <button
                    onClick={() => removeCorporateEmail(email)}
                    className="text-slate-400 hover:text-rose-600 ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Technical Deliverables Checklist */}
          <div className="space-y-2 pt-2 text-xs">
            <label className="font-bold text-slate-800 block">Checklist de Entregables Técnicos</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeInforme.deliverablesChecklist.map((del) => (
                <label
                  key={del.id}
                  className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 text-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={del.completed}
                    onChange={() => toggleDeliverable(del.id)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className={del.completed ? 'font-medium' : 'line-through text-slate-400'}>
                    {del.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Print Button */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <button
              onClick={handlePrint}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar Informe de Entrega (PDF)</span>
            </button>

            <button
              onClick={() => onSaveInforme(activeInforme)}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2 rounded-lg text-xs transition"
            >
              Guardar Informe en CRM
            </button>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: OFFICIAL DOCUMENT PREVIEW (Print Target) */}
      <div className="lg:col-span-7">
        
        <div className="print-only-container bg-white text-slate-900 border border-slate-300 shadow-2xl rounded-none p-8 md:p-10 max-w-2xl mx-auto min-h-[842px] relative flex flex-col justify-between font-sans">
          
          {/* Top Emerald Header Line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500"></div>

          <div>
            {/* Header Document Banner */}
            <div className="flex justify-between items-start border-b-2 border-emerald-500 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-500 text-slate-950 font-black px-2 py-0.5 text-xs rounded">
                    PáginasPro.cl
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Vango SpA
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{COMPANY_DATA.direccion}</p>
                <p className="text-[11px] text-slate-600">RUT: <strong className="font-mono text-slate-800">{COMPANY_DATA.rut}</strong></p>
                <p className="text-[11px] text-slate-600">Tel: {COMPANY_DATA.telefono}</p>
              </div>

              <div className="text-right">
                <div className="bg-slate-900 text-white px-3.5 py-2 rounded-lg shadow-sm">
                  <h1 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Informe de Entrega & Garantía
                  </h1>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">
                    Certificado de Cierre
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-mono">
                  Fecha de Entrega: <strong className="text-slate-800">{formatDateCL(activeInforme.deliveryDate)}</strong>
                </p>
              </div>
            </div>

            {/* Project & Client Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Datos del Proyecto Entregado
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Empresa / Cliente:</span>
                  <strong className="text-slate-900 text-sm block">{activeInforme.companyName}</strong>
                  <span className="text-slate-600">{activeInforme.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Sitio Web Publicado Oficial:</span>
                  <a href={activeInforme.webUrl} target="_blank" rel="noreferrer" className="text-emerald-700 font-mono font-bold underline text-sm block">
                    {activeInforme.webUrl}
                  </a>
                </div>
              </div>
            </div>

            {/* Warranty Certificate Highlight Box */}
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-4 mb-6 text-xs print-page-break">
              <div className="flex items-center gap-2 mb-2 text-emerald-900 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>CERTIFICADO DE GARANTÍA TÉCNICA DE 90 DÍAS</span>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed mb-3">
                PáginasPro.cl (Vango SpA) garantiza el correcto funcionamiento del software web, certificado de seguridad SSL y casillas de correo configuradas durante un periodo legal de <strong>90 días corridos</strong> contados desde la fecha de entrega oficial.
              </p>
              <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-emerald-200 font-mono text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Inicio de Cobertura</span>
                  <strong className="text-slate-900">{formatDateCL(activeInforme.warrantyStartDate)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Vencimiento Garantía</span>
                  <strong className="text-emerald-700">{formatDateCL(activeInforme.warrantyEndDate)}</strong>
                </div>
              </div>
            </div>

            {/* Credentials Delivered Table */}
            <div className="mb-6 print-page-break">
              <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                <span>Credenciales y Accesos Entregados</span>
              </h3>

              <table className="w-full text-left text-xs border-collapse border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                    <th className="p-2.5">Acceso</th>
                    <th className="p-2.5">URL de Ingreso</th>
                    <th className="p-2.5">Usuario</th>
                    <th className="p-2.5">Clave / Nota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeInforme.credentials.map((cred) => (
                    <tr key={cred.id}>
                      <td className="p-2.5 font-bold text-slate-800">{cred.title}</td>
                      <td className="p-2.5 font-mono text-emerald-700">{cred.url}</td>
                      <td className="p-2.5 font-mono font-semibold text-slate-900">{cred.username}</td>
                      <td className="p-2.5 text-slate-500 italic text-[11px]">{cred.passHint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Corporate Emails List */}
            {activeInforme.corporateEmails.length > 0 && (
              <div className="mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs print-page-break">
                <h3 className="text-[11px] font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Casillas de Correo Corporativo Operativas</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeInforme.corporateEmails.map((email, idx) => (
                    <span key={idx} className="bg-white border border-slate-300 font-mono text-slate-800 text-xs px-2.5 py-1 rounded-md font-bold">
                      ✓ {email}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Deliverables Matrix Checklist */}
            <div className="mb-6 print-page-break">
              <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Checklist de Entregables Técnicos Verificados</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {activeInforme.deliverablesChecklist.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                    <span className={item.completed ? 'text-emerald-600 font-bold' : 'text-slate-300'}>
                      {item.completed ? '✓' : '✗'}
                    </span>
                    <span className={item.completed ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Signatures */}
          <div className="pt-8 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-end print-page-break">
            <div>
              <p className="font-bold text-slate-800">Entregado por: Diego P. - PáginasPro.cl</p>
              <p>Vango SpA • La Serena, Chile</p>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-400 w-44 mb-1"></div>
              <p className="font-bold text-slate-800">Firma de Recepción Conforme Cliente</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
