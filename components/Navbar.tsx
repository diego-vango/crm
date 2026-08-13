'use client';

import React, { useState } from 'react';
import { 
  Kanban, 
  FileText, 
  CheckCircle2, 
  MessageSquareHeart, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  Plus, 
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Info
} from 'lucide-react';
import { COMPANY_DATA } from '@/types/crm';

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
  csatAvg
}) => {
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  return (
    <header className="no-print sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-xl">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Domain Tag */}
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

            {/* Company Info Button Toggle */}
            <button
              onClick={() => setShowCompanyInfo(!showCompanyInfo)}
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 rounded-md border border-slate-700 transition"
              title="Ver datos de facturación Vango SpA"
            >
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>Datos Vango SpA</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showCompanyInfo ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Search bar & Quick Actions */}
          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="relative hidden sm:block w-48 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cliente, RUT o lead..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 text-slate-200 placeholder-slate-400 text-xs rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2">
              {activeTab === 'pipeline' && (
                <button
                  onClick={onNewLeadClick}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Lead</span>
                </button>
              )}
              {activeTab === 'presupuestos' && (
                <button
                  onClick={onNewPresupuestoClick}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear PPTO</span>
                </button>
              )}
              {activeTab === 'informes' && (
                <button
                  onClick={onNewInformeClick}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Informe</span>
                </button>
              )}
            </div>

            {/* User Profile Badge */}
            <div className="hidden lg:flex items-center gap-2 border-l border-slate-800 pl-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 flex items-center justify-center text-xs">
                DP
              </div>
              <div className="text-left text-xs">
                <div className="font-semibold text-slate-200">Diego P.</div>
                <div className="text-[10px] text-slate-400">CEO & Operaciones</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Expanded Company Info Panel */}
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

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
          
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
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
