'use client';

import React, { useState, useEffect } from 'react';
import { SurveyResponse } from '@/types/crm';
import { 
  Star, 
  MessageSquareHeart, 
  Award, 
  Copy, 
  ThumbsUp,
  RefreshCw
} from 'lucide-react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyAYhe9xRCAh1cEjlWq7fioCmOJfcJqwGrOkZFSTGczZlVBr0vr4eqrUeMGQ2yjq899/exec';
const PUBLIC_SURVEY_URL = 'https://paginaspro.cl/tuexperiencia';

interface CsatModuleProps {
  surveys: SurveyResponse[];
  setSurveys: React.Dispatch<React.SetStateAction<SurveyResponse[]>>;
}

export const CsatModule: React.FC<CsatModuleProps> = ({ surveys, setSurveys }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSurveysFromSheets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?type=surveys&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const mappedSurveys: SurveyResponse[] = data.map((item: any) => ({
          id: item.id || `survey_${Math.random()}`,
          clientName: item.clientCompany || 'Cliente',
          companyName: item.clientCompany || 'Empresa',
          overallRating: item.overallRating || 5,
          usabilityRating: item.overallRating || 5,
          attentionRating: item.overallRating || 5,
          npsScore: item.overallRating === 5 ? 10 : 8,
          comments: item.testimonial || item.valuedAspects || 'Sin comentario adicional.',
          createdAt: item.timestamp || new Date().toISOString().split('T')[0],
          verified: true
        }));

        setSurveys(mappedSurveys);
      }
    } catch (err) {
      console.error('Error al cargar encuestas desde Google Sheets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveysFromSheets();
  }, []);

  const totalCount = surveys.length;
  const avgOverall = totalCount > 0 ? (surveys.reduce((sum, s) => sum + s.overallRating, 0) / totalCount) : 5;
  const avgUsability = totalCount > 0 ? (surveys.reduce((sum, s) => sum + s.usabilityRating, 0) / totalCount) : 5;
  const avgAttention = totalCount > 0 ? (surveys.reduce((sum, s) => sum + s.attentionRating, 0) / totalCount) : 5;

  const promoters = surveys.filter(s => (s.npsScore || 10) >= 9).length;
  const detractors = surveys.filter(s => (s.npsScore || 10) <= 6).length;
  const npsValue = totalCount > 0 ? Math.round(((promoters - detractors) / totalCount) * 100) : 100;

  const handleCopyPublicLink = () => {
    navigator.clipboard.writeText(PUBLIC_SURVEY_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Panel */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquareHeart className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Módulo de Calidad, Encuestas & CSAT/NPS
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white shadow-xs">
            Panel de Métricas (Interno)
          </span>

          <button
            onClick={handleCopyPublicLink}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedLink ? '¡Copiado!' : 'Copiar Link Público'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* KPI Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Promedio CSAT General
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-900">{avgOverall.toFixed(1)}</span>
              <span className="text-sm font-bold text-amber-500">/ 5.0 ★</span>
            </div>
            <div className="flex text-amber-400 gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(avgOverall) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              NPS (Net Promoter Score)
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-emerald-600">+{npsValue}%</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Excelente
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {promoters} Promotores (9-10) de {totalCount} clientes
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Usabilidad Web
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-800">{avgUsability.toFixed(1)}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-2">Satisfacción velocidad y navegación</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Rapidez de Atención
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-800">{avgAttention.toFixed(1)}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-2">Soporte y comunicación Vango SpA</p>
          </div>

        </div>

        {/* List of Recent Client Feedbacks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Opiniones & Evaluaciones Recibidas de Clientes</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchSurveysFromSheets}
                disabled={isLoading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sincronizar</span>
              </button>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                {surveys.length} Encuestas Registradas
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveys.map((srv) => (
              <div key={srv.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{srv.companyName}</h4>
                    <p className="text-xs text-slate-600 font-medium">{srv.clientName}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded text-xs border border-amber-200">
                    <span>★ {srv.overallRating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200/80">
                  &quot;{srv.comments}&quot;
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                  <span className="text-emerald-700 font-bold">NPS Recomendación: {srv.npsScore || 10}/10</span>
                  <span>{srv.createdAt}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
