'use client';

import React, { useState } from 'react';
import { SurveyResponse } from '@/types/crm';
import { 
  Star, 
  MessageSquareHeart, 
  Award, 
  Users, 
  Send, 
  CheckCircle, 
  Share2, 
  Copy, 
  ExternalLink,
  ThumbsUp,
  Sparkles,
  BarChart2,
  Lock
} from 'lucide-react';

interface CsatModuleProps {
  surveys: SurveyResponse[];
  setSurveys: React.Dispatch<React.SetStateAction<SurveyResponse[]>>;
}

let surveyCounter = 0;
function createSurveyId(): string {
  surveyCounter += 1;
  return `srv-${surveyCounter}-${Date.now().toString(36)}`;
}

export const CsatModule: React.FC<CsatModuleProps> = ({ surveys, setSurveys }) => {
  const [activeSubTab, setActiveSubTab] = useState<'admin' | 'public_portal'>('admin');
  const [copiedLink, setCopiedLink] = useState(false);

  // New Survey Form State for Simulator / Public Portal
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [overallRating, setOverallRating] = useState(5);
  const [usabilityRating, setUsabilityRating] = useState(5);
  const [attentionRating, setAttentionRating] = useState(5);
  const [npsScore, setNpsScore] = useState(10);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Calculate Metrics
  const totalCount = surveys.length;
  const avgOverall = totalCount > 0 ? (surveys.reduce((sum, s) => sum + s.overallRating, 0) / totalCount) : 5;
  const avgUsability = totalCount > 0 ? (surveys.reduce((sum, s) => sum + s.usabilityRating, 0) / totalCount) : 5;
  const avgAttention = totalCount > 0 ? (surveys.reduce((sum, s) => sum + s.attentionRating, 0) / totalCount) : 5;

  // NPS Calculation: Promoters (9-10) - Detractors (0-6)
  const promoters = surveys.filter(s => s.npsScore >= 9).length;
  const detractors = surveys.filter(s => s.npsScore <= 6).length;
  const npsValue = totalCount > 0 ? Math.round(((promoters - detractors) / totalCount) * 100) : 100;

  const handleCopyPublicLink = () => {
    const url = 'https://crm.paginaspro.cl/encuesta-satisfaccion';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNewSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !companyName.trim()) {
      alert('Por favor completa tu nombre y el de tu empresa.');
      return;
    }

    const newEntry: SurveyResponse = {
      id: createSurveyId(),
      clientName,
      companyName,
      overallRating,
      usabilityRating,
      attentionRating,
      npsScore,
      comments: comments || 'Sin comentarios adicionales.',
      createdAt: new Date().toISOString().split('T')[0],
      verified: true,
    };

    setSurveys([newEntry, ...surveys]);
    setSubmitted(true);
  };

  const resetPublicForm = () => {
    setSubmitted(false);
    setClientName('');
    setCompanyName('');
    setOverallRating(5);
    setUsabilityRating(5);
    setAttentionRating(5);
    setNpsScore(10);
    setComments('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Toggle: Admin Panel vs Public Portal Simulator */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquareHeart className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Módulo de Calidad, Encuestas & CSAT/NPS
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('admin')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'admin'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Panel de Métricas (Interno)
          </button>

          <button
            onClick={() => setActiveSubTab('public_portal')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'public_portal'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simular Portal Público Cliente</span>
          </button>

          <button
            onClick={handleCopyPublicLink}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedLink ? '¡Copiado!' : 'Copiar Link Público'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: INTERNAL ADMIN METRICS DASHBOARD */}
      {activeSubTab === 'admin' && (
        <div className="space-y-6">
          
          {/* KPI Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
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

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                NPS (Net Promoter Score)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-emerald-600">+{npsValue}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Excelente
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {promoters} Promotores (9-10) de {totalCount} clientes
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Usabilidad Web
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-slate-800">{avgUsability.toFixed(1)}</span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-2">Satisfacción velocidad y navegación</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
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
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Opiniones & Evaluaciones Recibidas de Clientes</span>
              </h3>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                {surveys.length} Encuestas Registradas
              </span>
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
                    <span className="text-emerald-700 font-bold">NPS Recomendación: {srv.npsScore}/10</span>
                    <span>{srv.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: PUBLIC CLIENT PORTAL SIMULATOR */}
      {activeSubTab === 'public_portal' && (
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header Portal */}
          <div className="bg-slate-900 text-white p-6 text-center relative">
            <div className="inline-flex items-center justify-center p-2 bg-emerald-500 text-slate-950 font-black text-sm rounded-lg mb-2">
              PáginasPro.cl
            </div>
            <h2 className="text-lg font-bold">Encuesta Oficial de Satisfacción del Cliente</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
              Tu opinión nos ayuda a mantener la máxima calidad de servicio en Vango SpA.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900">¡Muchas Gracias por tu Feedback!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Tus respuestas han sido registradas exitosamente en el panel de calidad de PáginasPro.cl.
              </p>
              <button
                onClick={resetPublicForm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
              >
                Enviar otra respuesta de prueba
              </button>
            </div>
          ) : (
            <form onSubmit={handleNewSurveySubmit} className="p-6 space-y-5 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Tu Nombre</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="ej: Carlos Mendoza"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Nombre de tu Empresa</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="ej: C.M.H Motors"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Star Rating 1: Overall */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <label className="font-bold text-slate-800 block">1. ¿Qué tan satisfecho quedaste con el resultado general de la web?</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setOverallRating(star)}
                      className="p-1.5 text-amber-400 hover:scale-110 transition"
                    >
                      <Star className={`w-6 h-6 ${star <= overallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Rating 2: Usability */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <label className="font-bold text-slate-800 block">2. ¿Cómo evalúas la velocidad de carga y diseño visual de la web?</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUsabilityRating(star)}
                      className="p-1.5 text-amber-400 hover:scale-110 transition"
                    >
                      <Star className={`w-6 h-6 ${star <= usabilityRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Rating 3: Attention */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <label className="font-bold text-slate-800 block">3. ¿Cómo evalúas la rapidez de atención y soporte del equipo?</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setAttentionRating(star)}
                      className="p-1.5 text-amber-400 hover:scale-110 transition"
                    >
                      <Star className={`w-6 h-6 ${star <= attentionRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* NPS Score Slider */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">
                    4. ¿Qué tan probable es que recomiendes PáginasPro.cl?
                  </label>
                  <span className="font-mono font-black text-emerald-600 text-sm">
                    {npsScore} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={npsScore}
                  onChange={(e) => setNpsScore(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>0 - Nada probable</span>
                  <span>10 - Muy probable</span>
                </div>
              </div>

              {/* Free Text Comment */}
              <div>
                <label className="text-slate-700 font-bold block mb-1">Comentarios o Testimonio (Opcional)</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Escribe aquí cualquier sugerencia o comentario sobre la experiencia..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Encuesta de Satisfacción</span>
              </button>

            </form>
          )}

        </div>
      )}

    </div>
  );
};
