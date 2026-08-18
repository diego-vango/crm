'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Printer, 
  CheckCircle2, 
  ShieldAlert, 
  Cpu, 
  ShieldCheck, 
  Upload, 
  ImageIcon, 
  Globe, 
  Check, 
  Trash2,
  Save,
  ExternalLink,
  Folder,
  Plus,
  RefreshCw
} from 'lucide-react';
import { formatDateCL } from '@/lib/formatters';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyAYhe9xRCAh1cEjlWq7fioCmOJfcJqwGrOkZFSTGczZlVBr0vr4eqrUeMGQ2yjq899/exec';

interface HitoItem {
  titulo: string;
  descripcion: string;
}

interface TechnicalReportData {
  id?: string;
  clientName: string;
  companyName: string;
  projectName: string;
  deliveryDate: string;
  webUrl: string;
  driveLink?: string;
  rawNotes: string;
  resumenProyecto: string;
  hitosPagina2: HitoItem[];
  hitosPagina3: HitoItem[];
  hitosPagina4: HitoItem[];
  diagnosticoArquitectura: string;
  recomendacionesUso: string[];
  coberturaGarantia: string[];
  exclusionesGarantia: string[];
}

const DEFAULT_REPORT_DATA: TechnicalReportData = {
  id: 'inf-pali-rucci',
  clientName: 'Paula Rucci',
  companyName: 'Prucci Abogada — Abogada de Familia e Infancia',
  projectName: 'Despliegue Web de Alta Velocidad, Sistema de Agendamiento, Correo Corporativo y Formulario',
  deliveryDate: new Date().toISOString().split('T')[0],
  webUrl: 'https://abogadadefamilias.cl',
  driveLink: '',
  rawNotes: 'Despliegue en Cloudflare Pages con React+Vite, gestión DNS en Cloudflare, correo corporativo prucci@abogadadefamilias.cl enrutado a Gmail con SMTP "Enviar como", agendamiento Cal.com con Zoom Workplace Pro integrado y formulario de contacto en vivo.',
  resumenProyecto: 'Se ha completado con éxito el desarrollo, despliegue e integración de la plataforma web corporativa para Prucci Abogada bajo arquitectura Serverless de alta velocidad, garantizando costo mensual de $0 en servidores, agendamiento automatizado de citas y correo profesional unificado.',
  hitosPagina2: [
    {
      titulo: 'Despliegue e Infraestructura Web de Alto Rendimiento (Serverless)',
      descripcion: 'Publicación del proyecto React (Vite) + Tailwind CSS directamente en la red perimetral global de Cloudflare Pages, asegurando tiempos de carga ultrarrápidos, soporte SSL/HTTPS automático y un costo recurrente de infraestructura de $0/mes. Se configuró un flujo de integración continua (CI/CD) con GitHub.'
    },
    {
      titulo: 'Gestión DNS y Configuración de Dominio Corporativo',
      descripcion: 'Configuración y puesta en producción de los registros DNS para abogadadefamilias.cl y www.abogadadefamilias.cl con enrutamiento y aceleración CDN de Cloudflare. Carga y vinculación de archivos gráficos corporativos (favicon.ico, favicon.png, apple-touch-icon.png) para compatibilidad multidispositivo.'
    }
  ],
  hitosPagina3: [
    {
      titulo: 'Configuración de Correo Corporativo ($0/mes) y Formulario en Vivo',
      descripcion: 'Habilitación de la dirección corporativa prucci@abogadadefamilias.cl redirigida automáticamente a la casilla principal de la abogada. Configuración del protocolo SMTP en Gmail para emitir y responder correos firmados desde la misma bandeja de entrada. Integración del formulario de contacto funcional con confirmación en popup.'
    },
    {
      titulo: 'Integración de Agendamiento Online (Cal.com + Zoom Workplace Pro)',
      descripcion: 'Creación del evento paula-rucci/consulta-legal (45 min con buffer de 15 min y preaviso de 12 horas). Vinculación directa con Zoom Pro para generar y enviar salas de videollamada únicas automáticamente tras confirmar la reserva. Módulo incrustado de forma transparente (tema claro) con disponibilidad semanal personalizada.'
    }
  ],
  hitosPagina4: [
    {
      titulo: 'Maquetación Visual y Experiencia de Usuario (UI/UX)',
      descripcion: 'Reproducción fiel del diseño institucional con paleta de colores corporativos (crema #F3EFE9, dorado #F4CE58, blanco y negro elegante). Ajuste del contenedor de la foto principal a proporción 3:4 (aspect-[3/4]) con encuadre superior (object-top), asegurando la visualización impecable sin cortes.'
    },
    {
      titulo: 'Adaptabilidad Móvil y Botones de Acción (CTA)',
      descripcion: 'Parrilla de 12 pastillas de servicios responsiva con patrón alternado (Blanco / Amarillo) en 2 columnas en escritorio y 1 columna en celulares. Enlaces directos a WhatsApp corporativo (+56 9 7925 5441), botón de reserva con desplazamiento suave (#agenda) e integración con Instagram (@prucci.abogada).'
    }
  ],
  diagnosticoArquitectura: 'El sitio web opera bajo una arquitectura moderna Serverless / Headless sobre React (Vite) y desplegado en Cloudflare Pages. Esta configuración proporciona inmunidad frente a ataques de fuerza bruta comunes en gestores de contenido tradicionales (como WordPress), elimina la necesidad de parches de seguridad o mantención de servidores, y asegura la máxima velocidad de respuesta disponible.',
  recomendacionesUso: [
    'Registros DNS en Cloudflare: No eliminar ni editar registros de tipo MX, TXT (Email Routing / SPF) ni CNAME.',
    'Contraseña de Aplicación de Google: No revocar la clave de aplicación de 16 caracteres creada en Google.',
    'Integración Cal.com / Zoom: Evitar desconectar la aplicación de Zoom dentro del panel de Cal.com.'
  ],
  coberturaGarantia: [
    'Disponibilidad y Certificado SSL: Garantía de funcionamiento y carga segura (https://) en abogadadefamilias.cl.',
    'Estabilidad en Envíos y Agendamiento: Soporte técnico ante desajustes en el formulario o en reservas de Cal.com/Zoom.',
    'Despliegues en GitHub: Soporte ante fallas en la compilación de código durante futuras actualizaciones.'
  ],
  exclusionesGarantia: [
    'Modificaciones directas en la zona DNS de Cloudflare o en la cuenta de Cal.com/Zoom realizadas por terceros no autorizados.',
    'Alteraciones en el código fuente del repositorio en GitHub que introduzcan errores sintácticos de desarrollo.'
  ]
};

const IMAGES_PER_PAGE = 4;
const MAX_ANNEX_PAGES = 3;

export const InformeTecnicoA4Module: React.FC = () => {
  const [reportData, setReportData] = useState<TechnicalReportData>(DEFAULT_REPORT_DATA);
  const [userApiKey, setUserApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [savedInformes, setSavedInformes] = useState<TechnicalReportData[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // Cargar Historial de Informes desde Google Sheets
  const fetchInformesFromSheets = useCallback(async () => {
    setIsLoadingSaved(true);
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?type=informes&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const mappedList: TechnicalReportData[] = data.map((item: any) => {
          let parsedData = {};
          try {
            parsedData = typeof item.reportJson === 'string' ? JSON.parse(item.reportJson) : (item.reportJson || {});
          } catch (e) {
            parsedData = {};
          }

          return {
            ...DEFAULT_REPORT_DATA,
            ...parsedData,
            id: item.id || `inf_${Math.random()}`,
            deliveryDate: item.deliveryDate || new Date().toISOString().split('T')[0],
            clientName: item.clientName || 'Cliente',
            companyName: item.companyName || 'Empresa',
            webUrl: item.webUrl || '',
            projectName: item.projectName || 'Desarrollo Web',
            driveLink: item.driveLink || '',
            resumenProyecto: item.resumenProyecto || DEFAULT_REPORT_DATA.resumenProyecto
          };
        });

        setSavedInformes(mappedList);
      }
    } catch (err) {
      console.error('Error al cargar informes guardados:', err);
    } finally {
      setIsLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    fetchInformesFromSheets();
  }, [fetchInformesFromSheets]);

  const handleMultipleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const promises = fileArray.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(newImages => {
      setScreenshots(prev => [...prev, ...newImages].slice(0, IMAGES_PER_PAGE * MAX_ANNEX_PAGES));
    });
  };

  const removeImage = (indexToRemove: number) => {
    setScreenshots(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-technical-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: reportData.clientName,
          companyName: reportData.companyName,
          projectName: reportData.projectName,
          rawNotes: reportData.rawNotes,
          apiKey: userApiKey,
        }),
      });

      if (!res.ok) {
        alert('Ocurrió un error al conectar con Gemini. Revisa la consola.');
        return;
      }

      const aiResult = await res.json();
      setReportData(prev => ({
        ...prev,
        resumenProyecto: aiResult.resumenProyecto || prev.resumenProyecto,
        hitosPagina2: aiResult.hitosPagina2 || prev.hitosPagina2,
        hitosPagina3: aiResult.hitosPagina3 || prev.hitosPagina3,
        hitosPagina4: aiResult.hitosPagina4 || prev.hitosPagina4,
        diagnosticoArquitectura: aiResult.diagnosticoArquitectura || prev.diagnosticoArquitectura,
        recomendacionesUso: aiResult.recomendacionesUso || prev.recomendacionesUso,
        coberturaGarantia: aiResult.coberturaGarantia || prev.coberturaGarantia,
        exclusionesGarantia: aiResult.exclusionesGarantia || prev.exclusionesGarantia,
      }));
    } catch (err) {
      console.error(err);
      alert('Error de conexión.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Guardar Informe en Google Sheets (Historial_Informes)
  const handleSaveInformeToSheets = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const reportId = reportData.id || `inf_${reportData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'save_informe',
          id: reportId,
          deliveryDate: reportData.deliveryDate,
          clientName: reportData.clientName,
          companyName: reportData.companyName,
          webUrl: reportData.webUrl,
          projectName: reportData.projectName,
          driveLink: reportData.driveLink || '',
          resumenProyecto: reportData.resumenProyecto,
          reportData
        }),
      });

      setSaveSuccess(true);
      fetchInformesFromSheets();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error al guardar informe en Google Sheets:', err);
      alert('No se pudo guardar el informe en Google Sheets.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewInforme = () => {
    const newId = `inf_${Date.now()}`;
    setReportData({
      ...DEFAULT_REPORT_DATA,
      id: newId,
      clientName: 'Nombre Cliente',
      companyName: 'Nueva Empresa SpA',
      webUrl: 'https://nuevaempresa.cl',
      projectName: 'Despliegue Web de Alta Velocidad, Correo Corporativo y Formulario',
      deliveryDate: new Date().toISOString().split('T')[0],
      driveLink: '',
    });
    setScreenshots([]);
  };

  // Paginación dinámica real
  const totalAnnexPages = Math.min(Math.ceil(screenshots.length / IMAGES_PER_PAGE), MAX_ANNEX_PAGES);
  const totalPages = 6 + totalAnnexPages;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      
      {/* PANEL IZQUIERDO: CONTROLES, REGISTRO Y DRIVE (no-print) */}
      <div className="no-print lg:col-span-4 space-y-5 text-xs">
        
        {/* INFORMES GUARDADOS EN GOOGLE SHEETS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Folder className="w-4 h-4 text-emerald-600" />
              <span>Informes Guardados ({savedInformes.length})</span>
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={fetchInformesFromSheets}
                disabled={isLoadingSaved}
                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                title="Actualizar lista de informes"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSaved ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleCreateNewInforme}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 text-[10px] cursor-pointer"
              >
                <Plus className="w-3 h-3 text-emerald-600" /> Nuevo
              </button>
            </div>
          </div>

          {savedInformes.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
              Sin informes respaldados en Google Sheets.
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {savedInformes.map((inf) => (
                <div
                  key={inf.id}
                  onClick={() => setReportData(inf)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                    reportData.id === inf.id
                      ? 'border-emerald-500 bg-emerald-50/60 font-bold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate max-w-[190px]">
                    <span className="font-extrabold text-slate-900 block truncate">{inf.companyName}</span>
                    <span className="text-slate-500 text-[10px] block font-mono truncate">{inf.webUrl}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {inf.driveLink && (
                      <a
                        href={inf.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded border border-emerald-300"
                        title="Ver PDF en Google Drive"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <span className="text-[10px] font-mono text-slate-400">{formatDateCL(inf.deliveryDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EDITOR FORMULARIO IA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Redactor de Informe Técnico IA</span>
            </h2>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              PáginasPro.cl
            </span>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Informe e historial guardados en Google Sheets!</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-slate-600 font-bold block mb-1">Cliente / Contacto</label>
              <input
                type="text"
                value={reportData.clientName}
                onChange={e => setReportData({ ...reportData, clientName: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">Empresa / Firma</label>
              <input
                type="text"
                value={reportData.companyName}
                onChange={e => setReportData({ ...reportData, companyName: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">Dominio / URL Publicado</label>
              <input
                type="text"
                value={reportData.webUrl}
                onChange={e => setReportData({ ...reportData, webUrl: e.target.value })}
                placeholder="https://abogadadefamilias.cl"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* LINK DE GOOGLE DRIVE DEL INFORME PDF */}
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 space-y-1">
              <label className="text-emerald-950 font-bold flex items-center gap-1.5 text-xs">
                <Folder className="w-3.5 h-3.5 text-emerald-600" /> Link PDF en Google Drive (Resguardo)
              </label>
              <input
                type="url"
                value={reportData.driveLink || ''}
                onChange={e => setReportData({ ...reportData, driveLink: e.target.value })}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full p-2 bg-white border border-emerald-300 rounded-lg font-mono text-[11px] text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">Título del Proyecto</label>
              <textarea
                value={reportData.projectName}
                onChange={e => setReportData({ ...reportData, projectName: e.target.value })}
                rows={2}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* CARGADOR DE MÚLTIPLES CAPTURAS DE PANTALLA */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-800 font-bold flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" /> Capturas del Sitio ({screenshots.length}/12)
                </label>
                {screenshots.length > 0 && (
                  <button
                    onClick={() => setScreenshots([])}
                    className="text-rose-600 hover:text-rose-800 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Borrar todas
                  </button>
                )}
              </div>
              
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white p-3 rounded-xl flex flex-col items-center justify-center cursor-pointer transition text-center">
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-[11px] font-semibold text-slate-700">
                  Subir Capturas del Sitio (Selección múltiple)
                </span>
                <span className="text-[9px] text-slate-400">Acomoda 4 por página de anexo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleImagesUpload}
                  className="hidden"
                />
              </label>

              {screenshots.length > 0 && (
                <div className="grid grid-cols-4 gap-1.5 pt-2">
                  {screenshots.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-300 bg-slate-900 aspect-video">
                      <img src={img} alt={`Captura ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute inset-0 bg-rose-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Eliminar esta captura"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">Notas Brutas del Trabajo Realizado (para Gemini)</label>
              <textarea
                value={reportData.rawNotes}
                onChange={e => setReportData({ ...reportData, rawNotes: e.target.value })}
                rows={5}
                placeholder="Escribe en puntos simples lo que hiciste..."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Gemini API Key (Opcional si está en Cloudflare)</label>
              <input
                type="password"
                value={userApiKey}
                onChange={e => setUserApiKey(e.target.value)}
                placeholder="Pegar clave si no usas variable de entorno"
                className="w-full p-1.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>{isGenerating ? 'Gemini redactando informe...' : 'Auto-Redactar con Gemini IA'}</span>
          </button>

          <button
            onClick={handleSaveInformeToSheets}
            disabled={isSaving}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-emerald-200" />
            <span>{isSaving ? 'Guardando...' : 'Guardar Informe en CRM / Sheets'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="w-full bg-slate-900 hover:bg-black text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Imprimir Dossier PDF ({totalPages} Págs)</span>
          </button>
        </div>

      </div>

      {/* PANEL DERECHO: VISTA PREVIA DOSSIER A4 */}
      <div className="lg:col-span-8 flex flex-col items-center gap-8">
        
        {/* PÁGINA 1: PORTADA ESTILO PAGINASPRO.CL */}
        <div className="a4-page bg-white text-slate-900 border border-slate-200 shadow-2xl p-12 w-full max-w-[800px] min-h-[1050px] relative flex flex-col justify-between print:border-none print:shadow-none print:break-after-page">
          <div>
            <div className="flex justify-between items-center pb-6 border-b border-slate-200">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Páginas<span className="text-emerald-500">Pro</span>.cl
              </h1>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-700 block">Vango SpA</span>
                <span className="text-[11px] font-mono text-slate-400">diego@paginaspro.cl</span>
              </div>
            </div>

            <div className="mt-16 space-y-4">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold px-3.5 py-1 text-[11px] uppercase tracking-widest rounded-full inline-block">
                • INFORME TÉCNICO DE TRABAJO
              </span>
              <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
                MEMORIA TÉCNICA<br />Y ENTREGABLES OFICIALES
              </h2>
            </div>

            <div className="mt-14 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-7 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block mb-1">Cliente / Contacto:</span>
                  <strong className="text-slate-900 text-base font-extrabold">{reportData.clientName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block mb-1">Empresa / Firma:</span>
                  <strong className="text-slate-900 text-base font-extrabold">{reportData.companyName}</strong>
                </div>
              </div>

              <div className="border-t border-slate-200/60 pt-3">
                <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block mb-1">Proyecto Desarrollado:</span>
                <p className="text-slate-800 font-semibold text-sm leading-snug">{reportData.projectName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-3">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block mb-1">Dominio Oficial:</span>
                  <a href={reportData.webUrl} target="_blank" rel="noreferrer" className="text-emerald-700 font-mono font-bold text-xs underline">
                    {reportData.webUrl}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block mb-1">Fecha de Entrega Oficial:</span>
                  <strong className="text-emerald-700 font-mono text-xs font-extrabold">{formatDateCL(reportData.deliveryDate)}</strong>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800 text-xs leading-relaxed font-medium">
              <span className="text-emerald-400 font-extrabold block mb-1 uppercase tracking-wider text-[10px]">Resumen Ejecutivo</span>
              {reportData.resumenProyecto}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>Pág 1 de {totalPages}</span>
            <span>PáginasPro.cl • Soluciones Digitales</span>
          </div>
        </div>

        {/* PÁGINA 2: HITOS 1 */}
        <div className="a4-page bg-white text-slate-900 border border-slate-200 shadow-2xl p-12 w-full max-w-[800px] min-h-[1050px] relative flex flex-col justify-between print:border-none print:shadow-none print:break-after-page">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-8">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 text-[10px] uppercase tracking-wider rounded-full">
                HITOS DE DESARROLLO — PARTE I
              </span>
              <span className="text-xs font-black text-slate-900">Páginas<span className="text-emerald-500">Pro</span>.cl</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
              Hitos Ejecutados y Soluciones Aplicadas
            </h3>

            <div className="space-y-6">
              {reportData.hitosPagina2.map((hito, idx) => (
                <div key={idx} className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 space-y-2.5">
                  <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{hito.titulo}</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium pl-7 border-l-2 border-emerald-400">
                    {hito.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>Pág 2 de {totalPages}</span>
            <span>PáginasPro.cl • Soluciones Digitales</span>
          </div>
        </div>

        {/* PÁGINA 3: HITOS 2 */}
        <div className="a4-page bg-white text-slate-900 border border-slate-200 shadow-2xl p-12 w-full max-w-[800px] min-h-[1050px] relative flex flex-col justify-between print:border-none print:shadow-none print:break-after-page">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-8">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 text-[10px] uppercase tracking-wider rounded-full">
                HITOS DE DESARROLLO — PARTE II
              </span>
              <span className="text-xs font-black text-slate-900">Páginas<span className="text-emerald-500">Pro</span>.cl</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
              Hitos Ejecutados y Soluciones Aplicadas
            </h3>

            <div className="space-y-6">
              {reportData.hitosPagina3.map((hito, idx) => (
                <div key={idx} className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 space-y-2.5">
                  <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{hito.titulo}</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium pl-7 border-l-2 border-emerald-400">
                    {hito.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>Pág 3 de {totalPages}</span>
            <span>PáginasPro.cl • Soluciones Digitales</span>
          </div>
        </div>

        {/* PÁGINA 4: HITOS 3 */}
        <div className="a4-page bg-white text-slate-900 border border-slate-200 shadow-2xl p-12 w-full max-w-[800px] min-h-[1050px] relative flex flex-col justify-between print:border-none print:shadow-none print:break-after-page">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-8">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 text-[10px] uppercase tracking-wider rounded-full">
                HITOS DE DESARROLLO — PARTE III
              </span>
              <span className="text-xs font-black text-slate-900">Páginas<span className="text-emerald-500">Pro</span>.cl</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
              Hitos Ejecutados y Soluciones Aplicadas
            </h3>

            <div className="space-y-6">
              {reportData.hitosPagina4.map((hito, idx) => (
                <div key={idx} className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 space-y-2.5">
                  <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{hito.titulo}</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium pl-7 border-l-2 border-emerald-400">
                    {hito.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>Pág 4 de {totalPages}</span>
            <span>PáginasPro.cl • Soluciones Digitales</span>
          </div>
        </div>

        {/* PÁGINA 5: DIAGNÓSTICO Y RECOMENDACIONES */}
        <div className="a4-page bg-white text-slate-900 border border-slate-200 shadow-2xl p-12 w-full max-w-[800px] min-h-[1050px] relative flex flex-col justify-between print:border-none print:shadow-none print:break-after-page">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-8">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 text-[10px] uppercase tracking-wider rounded-full">
                ARQUITECTURA Y SEGURIDAD
              </span>
              <span className="text-xs font-black text-slate-900">Páginas<span className="text-emerald-500">Pro</span>.cl</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
              Diagnóstico Técnico y Recomendaciones
            </h3>

            <div className="space-y-6 text-xs">
              <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-3 shadow-md">
                <h4 className="text-emerald-400 font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" /> Arquitectura del Sitio Web
                </h4>
                <p className="leading-relaxed text-slate-300 font-medium">
                  {reportData.diagnosticoArquitectura}
                </p>
              </div>

              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 space-y-3">
                <h4 className="text-amber-900 font-extrabold text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" /> Recomendaciones de Uso (Qué evitar modificar)
                </h4>
                <ul className="space-y-2.5 text-slate-800 font-medium list-disc pl-5">
                  {reportData.recomendacionesUso.map((rec, idx) => (
                    <li key={idx} className="leading-relaxed">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>Pág 5 de {totalPages}</span>
            <span>PáginasPro.cl • Soluciones Digitales</span>
          </div>
        </div>

        {/* PÁGINA 6: GARANTÍA Y COBERTURA */}
        <div className="a4-page bg-white text-slate-900 border border-slate-200 shadow-2xl p-12 w-full max-w-[800px] min-h-[1050px] relative flex flex-col justify-between print:border-none print:shadow-none print:break-after-page">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-8">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 text-[10px] uppercase tracking-wider rounded-full">
                GARANTÍA POST-VENTA (90 DÍAS)
              </span>
              <span className="text-xs font-black text-slate-900">Páginas<span className="text-emerald-500">Pro</span>.cl</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
              Garantía Post-Venta y Estabilidad
            </h3>

            <div className="space-y-6 text-xs">
              <div className="bg-emerald-50/80 border-2 border-emerald-400 rounded-2xl p-6 space-y-3">
                <h4 className="text-emerald-950 font-black text-sm flex items-center gap-2 uppercase tracking-wider">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" /> Cobertura Incluida
                </h4>
                <ul className="space-y-2 text-slate-800 font-semibold list-disc pl-5">
                  {reportData.coberturaGarantia.map((cob, idx) => (
                    <li key={idx} className="leading-relaxed">{cob}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 space-y-3">
                <h4 className="text-rose-700 font-bold text-xs uppercase tracking-wider">
                  Exclusiones de Garantía
                </h4>
                <ul className="space-y-2 text-slate-600 font-medium list-disc pl-5">
                  {reportData.exclusionesGarantia.map((exc, idx) => (
                    <li key={idx} className="leading-relaxed">{exc}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs">
            <div>
              <p className="font-extrabold text-slate-900 text-sm">Entregado por: Diego Valderrama Herrera</p>
              <p className="font-semibold text-slate-600">PáginasPro.cl • Vango SpA</p>
              <p className="text-slate-400 text-[11px]">La Serena, Chile • diego@paginaspro.cl</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full border border-emerald-300 text-[10px]">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Documento Enviado Vía Correo
              </span>
            </div>
          </div>
        </div>

        {/* PÁGINAS DE ANEXOS DE IMÁGENES */}
        {Array.from({ length: totalAnnexPages }).map((_, pageIdx) => {
          const pageImages = screenshots.slice(pageIdx * IMAGES_PER_PAGE, (pageIdx + 1) * IMAGES_PER_PAGE);
          const currentPageNum = 7 + pageIdx;
          const isLastPage = pageIdx === totalAnnexPages - 1;

          return (
            <div 
              key={pageIdx} 
              className={`a4-page bg-white text-slate-900 border border-slate-200 shadow-2xl p-12 w-full max-w-[800px] min-h-[1050px] relative flex flex-col justify-between print:border-none print:shadow-none ${
                !isLastPage ? 'print:break-after-page' : ''
              }`}
            >
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6">
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 text-[10px] uppercase tracking-wider rounded-full">
                    ANEXO VISUAL — MOCKUPS EN VIVO (PARTE {pageIdx + 1})
                  </span>
                  <span className="text-xs font-black text-slate-900">Páginas<span className="text-emerald-500">Pro</span>.cl</span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                  Anexo: Registro Visual del Proyecto
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Muestras de la interfaz responsiva y secciones publicadas en producción.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {pageImages.map((imgSrc, imgIdx) => (
                    <div key={imgIdx} className="border border-slate-300 rounded-2xl overflow-hidden shadow-md bg-slate-950 flex flex-col">
                      <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between border-b border-slate-700 z-10">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 truncate max-w-[140px]">
                          {reportData.webUrl}
                        </span>
                      </div>

                      <div className="relative bg-slate-900 h-[320px] overflow-hidden flex items-center justify-center p-2">
                        <img
                          src={imgSrc}
                          alt="Fondo difuminado"
                          className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-110 pointer-events-none"
                        />
                        <img
                          src={imgSrc}
                          alt={`Captura ${pageIdx * IMAGES_PER_PAGE + imgIdx + 1}`}
                          className="relative z-10 max-w-full max-h-full object-contain rounded-md shadow-lg border border-white/10"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 font-medium">
                <span>Pág {currentPageNum} de {totalPages}</span>
                <span>PáginasPro.cl • Soluciones Digitales</span>
              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
};
