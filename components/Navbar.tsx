'use client';

import React, { useState } from 'react';
import { 
  Kanban, 
  FileText, 
  CheckCircle2, 
  MessageSquareHeart, 
  Search, 
  Globe, 
  Plus, 
  ChevronDown,
  Info,
  X
} from 'lucide-react';
import { COMPANY_DATA, Lead, Presupuesto, SurveyResponse } from '@/types/crm';
import { formatCLP } from '@/lib/formatters';

interface NavbarProps {
  activeTab: 'pipeline' | 'presupuestos' | 'informes' | 'csat';
  setActiveTab: (tab: 'pipeline' | 'presupuestos' | 'informes' | 'csat') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onNewLeadClick: () => void;
  onNewPresupuestoClick: () => void;
  onNewInformeClick: () => void;
  leadsCount: number;
  presupuestosCount: number;
  informesCount: number;
  csatAvg: number;
  leads?: Lead[];
  presupuestos?: Presupuesto[];
  surveys?: SurveyResponse[];
  onSelectPresupuesto?: (ppto: Presupuesto) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  onNewLeadClick,
  onNewPresupuestoClick,
  onNewInformeClick,
  leadsCount,
  presupuestosCount,
  informesCount,
  csatAvg,
  leads = [],
  presupuestos = [],
  surveys = [],
  onSelectPresupuesto
}) => {
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const cleanTerm = searchTerm.trim().toLowerCase();
  const isSearching = cleanTerm.length >= 2;

  const matchedLeads = isSearching
    ? leads.filter(l => 
        (l.name && l.name.toLowerCase().includes(cleanTerm)) || 
        (l.company && l.company.toLowerCase().includes(cleanTerm)) ||
        (l.phone && l.phone.includes(cleanTerm)) ||
        (l.serviceInterest && l.serviceInterest.toLowerCase().includes(cleanTerm))
      ).slice(0, 4)
    : [];

  const matchedPresupuestos = isSearching
    ? presupuestos.filter(p => 
        (p.clientName && p.clientName.toLowerCase().includes(cleanTerm)) || 
        (p.clientCompany && p.clientCompany.toLowerCase().includes(cleanTerm)) ||
        String(p.correlativo).includes(cleanTerm) ||
        (p.items && p.items.some(i => i.title.toLowerCase().includes(cleanTerm)))
      ).slice(0, 4)
    : [];

  const matchedSurveys = isSearching
    ? surveys.filter(s => {
        const company = s.companyName || (s as any).clientCompany || s.clientName || '';
        const client = s.clientName || '';
        const comment = s.comments || (s as any).testimonial || '';
        return (
          company.toLowerCase().includes(cleanTerm) || 
          client.toLowerCase().includes(cleanTerm) ||
          comment.toLowerCase().includes(cleanTerm)
        );
      }).slice(0, 3)
    : [];

  const hasResults = matchedLeads.length > 0 || matchedPresupuestos.length > 0 || matchedSurveys.length > 0;

  return (
    <header className="no-print sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-xl font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('pipeline')}>
              <div className="bg-emerald-500 text-slate-950 font-black p-2 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Globe className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white">
                    Páginas<span className="text-emerald-400">Pro</span><span className="text-xs font-normal text-slate-400">.cl</span>
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    Vango SpA
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="font-mono text-emerald-400">crm.paginaspro.cl</span>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    En línea
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCompanyInfo(!showCompanyInfo)}
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 rounded-md border border-slate-700 transition cursor-pointer"
              title="Ver datos de facturación Vango SpA"
            >
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>Datos Vango SpA</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showCompanyInfo ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative hidden sm:block w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Buscar cliente, trato, PPTO o reseña..."
                className="w-full pl-9 pr-8 py-1.5 bg-slate-800 text-slate-100 placeholder-slate-400 text-xs rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 transition font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {showSearchDropdown && isSearching && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 text-xs max-h-96 overflow-y-auto">
                  {!hasResults ? (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      No se encontraron resultados para &quot;{searchTerm}&quot;
                    </div>
                  ) : (
                    <div className="p-2 space-y-3">
                      {matchedLeads.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 block mb-1">
                            Tratos & Pipeline ({matchedLeads.length})
                          </span>
                          <div className="space-y-1">
                            {matchedLeads.map(l => (
                              <div
                                key={l.id}
                                onClick={() => {
                                  setActiveTab('pipeline');
                                  setShowSearchDropdown(false);
                                }}
                                className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer flex items-center justify-between transition"
                              >
                                <div>
                                  <div className="font-bold text-white text-xs">{l.name}</div>
                                  <div className="text-[10px] text-slate-400">{l.serviceInterest}</div>
                                </div>
                                <span className="font-mono text-emerald-400 font-bold text-[11px]">
                                  {formatCLP(l.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {matchedPresupuestos.length > 0 && (
                        <div className="border-t border-slate-800 pt-2">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-2 block mb-1">
                            Presupuestos PDF ({matchedPresupuestos.length})
                          </span>
                          <div className="space-y-1">
                            {matchedPresupuestos.map(p => (
                              <div
                                key={p.id}
                                onClick={() => {
                                  if (onSelectPresupuesto) onSelectPresupuesto(p);
                                  setActiveTab('presupuestos');
                                  setShowSearchDropdown(false);
                                }}
                                className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer flex items-center justify-between transition"
                              >
                                <div>
                                  <div className="font-bold text-white text-xs">PPTO N° {p.correlativo} — {p.clientName}</div>
                                  <div className="text-[10px] text-slate-400">{p.clientCompany}</div>
                                </div>
                                <span className="font-mono text-indigo-300 font-bold text-[11px]">
                                  {formatCLP(p.totalAmount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {matchedSurveys.length > 0 && (
                        <div className="border-t border-slate-800 pt-2">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-2 block mb-1">
                            Encuestas CSAT ({matchedSurveys.length})
                          </span>
                          <div className="space-y-1">
                            {matchedSurveys.map(s => {
                              const company = s.companyName || (s as any).clientCompany || s.clientName || 'Empresa';
                              const comment = s.comments || (s as any).testimonial || '';
                              return (
                                <div
                                  key={s.id}
                                  onClick={() => {
                                    setActiveTab('csat');
                                    setShowSearchDropdown(false);
                                  }}
                                  className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer flex items-center justify-between transition"
                                >
                                  <div>
                                    <div className="font-bold text-white text-xs">{company}</div>
                                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">&quot;{comment}&quot;</div>
                                  </div>
                                  <div className="flex text-amber-400 text-[10px]">
                                    ★ {s.overallRating}.0
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'pipeline' && (
                <button
                  onClick={onNewLeadClick}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Lead</span>
                </button>
              )}
              {activeTab === 'presupuestos' && (
                <button
                  onClick={onNewPresupuestoClick}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear PPTO</span>
                </button>
              )}
              {activeTab === 'informes' && (
                <button
                  onClick={onNewInformeClick}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Informe</span>
                </button>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-2.5 border-l border-slate-800 pl-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/40 flex items-center justify-center text-xs">
                DV
              </div>
              <div className="text-left text-xs">
                <div className="font-bold text-slate-100">Diego Valderrama</div>
                <div className="text-[10px] text-slate-400 font-medium">CEO & Operaciones</div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {showCompanyInfo && (
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 text-xs text-slate-300 transition-all">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Razón Social</span>
              <span className="text-emerald-400 font-semibold">{COMPANY_DATA.razonSocial}</span> ({COMPANY_DATA.nombreFantasia})
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">RUT Empresa</span>
              <span className="font-mono text-white">{COMPANY_DATA.rut}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Cuenta Bancaria Oficial</span>
              <span className="text-white font-medium">{COMPANY_DATA.banco}</span> | {COMPANY_DATA.tipoCuenta} N° <span className="font-mono text-emerald-300">{COMPANY_DATA.numeroCuenta}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Contacto & Casa Matriz</span>
              <span className="text-white">{COMPANY_DATA.telefono}</span> | <span className="text-slate-400">{COMPANY_DATA.direccion}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto py-1.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Kanban className="w-4 h-4 text-emerald-400" />
            <span>Pipeline de Leads</span>
            <span className="ml-1 bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
              {leadsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('presupuestos')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'presupuestos'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Generador de Presupuestos (PDF)</span>
            <span className="ml-1 bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
              {presupuestosCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('informes')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'informes'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Informes de Entrega & Garantía</span>
            <span className="ml-1 bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
              {informesCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('csat')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'csat'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MessageSquareHeart className="w-4 h-4 text-emerald-400" />
            <span>Encuestas CSAT / NPS</span>
            <span className="ml-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
              ★ {csatAvg.toFixed(1)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
