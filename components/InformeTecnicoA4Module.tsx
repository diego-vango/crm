'use client';

import React, { useState } from 'react';
import { Sparkles, Printer, FileText, CheckCircle2, ShieldAlert, Cpu, Server, Mail, ShieldCheck } from 'lucide-react';
import { formatDateCL } from '@/lib/formatters';

interface HitoItem {
  titulo: string;
  descripcion: string;
}

interface TechnicalReportData {
  clientName: string;
  companyName: string;
  projectName: string;
  deliveryDate: string;
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
  clientName: 'Nicolás Álvarez',
  companyName: 'Base Norte SpA',
  projectName: 'Despliegue Web de Alta Velocidad, Migración DNS, Configuración de Google Workspace y Mapeo de Alias Corporativos.',
  deliveryDate: new Date().toISOString().split('T')[0],
  rawNotes: 'Despliegue en Cloudflare Pages con Next.js, traspaso de DNS desde Hostingplus, migración limpia de MX a Google Workspace con SPF/DMARC y mapeo de alias.',
  resumenProyecto: 'Se ha completado con éxito la migración e integración de la infraestructura web de Base Norte SpA bajo arquitectura Serverless de alta velocidad, garantizando costo mensual de $0 en servidores y continuidad del servicio de correos.',
  hitosPagina2: [
    {
      titulo: 'Despliegue e Infraestructura Web de Alto Rendimiento (Serverless)',
      descripcion: 'Publicación del proyecto Next.js en Cloudflare Pages con tiempos de carga sub-segundo, SSL automático ($0/mes) e Integración Continua (CI/CD) con GitHub.'
    },
    {
      titulo: 'Migración de Gestión DNS y Dominio Corporativo',
      descripcion: 'Traspaso autoritativo de DNS desde Hostingplus / NIC.cl hacia Cloudflare DNS. Configuración de basenorte.cl y www.basenorte.cl.'
    }
  ],
  hitosPagina3: [
    {
      titulo: 'Resguardo de Correo Corporativo (Google Workspace)',
      descripcion: 'Migración limpia de registros MX apuntando a smtp.google.com, asegurando cero interrupción de correos.'
    },
    {
      titulo: 'Implementación de Protocolos Anti-Spam (SPF y DMARC)',
      descripcion: 'Integración de registros SPF y DMARC para otorgar máxima reputación al dominio y evitar bandejas de correo no deseado.'
    }
  ],
  hitosPagina4: [
    {
      titulo: 'Configuración Avanzada de Alias y Envíos Unificados',
      descripcion: 'Mapeo de direcciones alternativas (nicolas.alvarez@, daniela.pinto@) hacia la casilla matriz contacto@basenorte.cl.'
    },
    {
      titulo: 'Flujo "Enviar como" en Gmail y Respuesta Automática',
      descripcion: 'Habilitación de firmas e identidades independientes desde la misma bandeja de entrada unificada.'
    }
  ],
  diagnosticoArquitectura: 'El sitio opera bajo arquitectura Headless / Serverless desplegada sobre Next.js y Cloudflare Pages. Otorga inmunidad frente a ataques de fuerza bruta tradicionales de CMS (WordPress), elimina parches manuales y mantiene máxima velocidad de carga.',
  recomendacionesUso: [
    'Registros DNS en Cloudflare: No eliminar ni editar registros de tipo MX, TXT (SPF/DMARC) ni CNAME.',
    'Servidores de Nombre (Nameservers): Mantener asignados en NIC.cl los servidores de Cloudflare.',
    'Consola Google Workspace: No eliminar casillas creadas ni la cuenta matriz.'
  ],
  coberturaGarantia: [
    'Disponibilidad y SSL: Funcionamiento y carga segura (HTTPS) en el dominio principal.',
    'Estabilidad del Flujo de Correo: Soporte ante desajustes en alias o entregas de Google Workspace.',
    'Despliegues en GitHub: Soporte ante fallas de compilación en despliegues derivados del código entregado.'
  ],
  exclusionesGarantia: [
    'Modificaciones directas en la zona DNS de Cloudflare o Google Workspace efectuadas por terceros.',
    'Alteraciones en el código fuente del repositorio que introduzcan errores sintácticos de desarrollo.'
  ]
};

export const InformeTecnicoA4Module: React.FC = () => {
  const [reportData, setReportData] = useState<TechnicalReportData>(DEFAULT_REPORT_DATA);
  const [userApiKey, setUserApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      
      {/* PANEL IZQUIERDO: CONTROLES E IA (no-print) */}
      <div className="no-print lg:col-span-4 space-y-5 text-xs">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Redactor de Informe Técnico IA</span>
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-500 font-bold block mb-1">Cliente / Atención</label>
              <input
                type="text"
                value={reportData.clientName}
                onChange={e => setReportData({ ...reportData, clientName: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="text-slate-500 font-bold block mb-1">Empresa</label>
              <input
                type="text"
                value={reportData.companyName}
                onChange={e => setReportData({ ...reportData, companyName: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="text-slate-500 font-bold block mb-1">Título del Proyecto</label>
              <textarea
                value={reportData.projectName}
                onChange={e => setReportData({ ...reportData, projectName: e.target.value })}
                rows={2}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="text-slate-500 font-bold block mb-1">Notas Brutas del Trabajo Realizado (para Gemini)</label>
              <textarea
                value={reportData.rawNotes}
                onChange={e => setReportData({ ...reportData, rawNotes: e.target.value })}
                rows={5}
                placeholder="Escribe en puntos simples lo que hiciste..."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
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
            onClick={() => window.print()}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Imprimir Dossier PDF (6 Págs)</span>
          </button>
        </div>

      </div>

      {/* PANEL DERECHO: VISTA PREVIA DOSSIER 6 PÁGINAS A4 */}
      <div className="lg:col-span-8 flex flex-col items-center gap-8">
        
        {/* PÁGINA 1: PORTADA */}
        <div className="a4-page bg-white text-slate-900 border border-slate-300 shadow-2xl p-12 w-full max-w-[800px] min-h-[1050px] relative flex flex-col justify-between print:border-none print:shadow-none print:break-after-page">
          <div>
            <div className="flex justify-between items-center pb-8 border-b-2 border-emerald-500">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Páginas<span className="text-emerald-500">Pro</span>.cl
              </h1>
              <span className="text-xs font-bold text-slate-400 font-mono">diego@paginaspro.cl</span>
            </div>

            <div className="mt-20 space-y-4">
              <span className="bg-slate-900 text-emerald-400 font-bold px-3 py-1 text-xs uppercase tracking-widest rounded-md inline-block">
                INFORME TÉCNICO DE TRABAJO
              </span>
              <h2 className="text-4xl font-black text-slate-950 leading-tight">
                MEMORIA TÉCNICA Y ENTREGABLES
              </h2>
            </div>

            <div className="mt-16 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Cliente:</span>
                <strong className="text-slate-900 text-base">{reportData.clientName}</strong>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Empresa:</span>
                <strong className="text-slate-900 text-base">{reportData.companyName}</strong>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Proyecto:</span>
                <p className="text-slate-800 font-semibold text-sm leading-snug">{reportData.projectName}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Fecha de Entrega:</span>
                <strong className="text-emerald-700 font-mono text-sm">{formatDateCL(reportData.deliveryDate)}</strong>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
            <span>Pág 1 de 6</span>
            <span>PáginasPro.cl</span>
          </div>
        </div>

        {/* PÁGINA 2: HITOS 1 */}
        <div className="a4-page bg-white text-slate-900 border border-slate-300 shadow-2xl p-12 w-full max-w-[800px] min-h-[1050px] relative flex flex-col justify-between print:border-none print:shadow-none print:break-after-page">
          <div>
            <h3 className="text-xl font-black text-slate-900 pb-3 border-b-2 border-emerald-500 mb-8">
              Hitos Ejecutados y Soluciones Aplicadas (Parte I)
            </h3>

            <div className="space-y-6">
              {reportData.hitosPagina2.map((hito, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{hito.titulo}</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium pl-6 border-l-2 border-emerald-300">
                    {hito.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
            <span>Pág 2 de 6</span>
            <span>PáginasPro.cl</span>
          </div>
        </div>

        {/* PÁGINA 3: HITOS 2 */}
        <div className="a4-page bg-white text-slate-900 border border-slate-300 shadow-2xl p-12 w-full max-w-[800px] min-h-[1050px] relative flex flex-col justify-between print:border-none print:shadow-none print:break-after-page">
          <div>
            <h3 className="text-xl font-black text-slate-900 pb-3 border-b-2 border-emerald-500 mb-8">
              Hitos Ejecutados y Soluciones Aplicadas (Parte II)
            </h3>

            <div className="space-y-6">
              {reportData.hitosPagina3.map((hito, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{hito.titulo}</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium pl-6 border-l-2 border-emerald-300">
                    {hito.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
            <span>Pág 3 de 6</span>
            <span>PáginasPro.cl</span>
          </div>
        </div>

        {/* PÁGINA 4: HITOS 3 */}
        <div className="a4-page bg-white text-slate-900 border border-slate-300 shadow-2xl p-12 w-full max-w-[800px] min-h-[1050px] relative flex flex-col justify-between print:border-none print:shadow-none print:break-after-page">
          <div>
            <h3 className="text-xl font-black text-slate-900 pb-3 border-b-2 border-emerald-500 mb-8">
              Hitos Ejecutados y Soluciones Aplicadas (Parte III)
            </h3>

            <div className="space-y-6">
              {reportData.hitosPagina4.map((hito, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{hito.titulo}</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium pl-6 border-l-2 border-emerald-300">
                    {hito.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
            <span>Pág 4 de 6</span>
            <span>PáginasPro.cl</span>
          </div>
        </div>

        {/* PÁGINA 5: DIAGNÓSTICO Y RECOMENDACIONES */}
        <div className="a4-page bg-white text-slate-900 border border-slate-300 shadow-2xl p-12 w-full max-w-[800px] min-h-[1050px] relative flex flex-col justify-between print:border-none print:shadow-none print:break-after-page">
          <div>
            <h3 className="text-xl font-black text-slate-900 pb-3 border-b-2 border-emerald-500 mb-8">
              Diagnóstico Técnico y Recomendaciones
            </h3>

            <div className="space-y-6 text-xs">
              <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-2 shadow-md">
                <h4 className="text-emerald-400 font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> Arquitectura del Sitio
                </h4>
                <p className="leading-relaxed text-slate-300 font-medium">
                  {reportData.diagnosticoArquitectura}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
                <h4 className="text-amber-900 font-extrabold text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" /> Recomendaciones de Uso (Qué evitar modificar)
                </h4>
                <ul className="space-y-2 text-slate-800 font-medium list-disc pl-5">
                  {reportData.recomendacionesUso.map((rec, idx) => (
                    <li key={idx} className="leading-relaxed">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
            <span>Pág 5 de 6</span>
            <span>PáginasPro.cl</span>
          </div>
        </div>

        {/* PÁGINA 6: GARANTÍA Y FIRMAS */}
        <div className="a4-page bg-white text-slate-900 border border-slate-300 shadow-2xl p-12 w-full max-w-[800px] min-h-[1050px] relative flex flex-col justify-between print:border-none print:shadow-none">
          <div>
            <h3 className="text-xl font-black text-slate-900 pb-3 border-b-2 border-emerald-500 mb-8">
              Garantía Post-Venta y Estabilidad (90 días)
            </h3>

            <div className="space-y-6 text-xs">
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-6 space-y-3">
                <h4 className="text-emerald-950 font-black text-sm flex items-center gap-2 uppercase tracking-wider">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> Cobertura Incluida
                </h4>
                <ul className="space-y-2 text-slate-800 font-semibold list-disc pl-5">
                  {reportData.coberturaGarantia.map((cob, idx) => (
                    <li key={idx} className="leading-relaxed">{cob}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider text-rose-700">
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

          <div className="pt-12 border-t border-slate-200 flex justify-between items-end text-xs">
            <div>
              <p className="font-bold text-slate-900">Entregado por: Diego P. - PáginasPro.cl</p>
              <p className="text-slate-500 text-[10px]">Vango SpA • La Serena, Chile</p>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-400 w-48 mb-1"></div>
              <p className="font-bold text-slate-900">Firma de Recepción Conforme Cliente</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
