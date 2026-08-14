'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { PipelineModule } from '@/components/PipelineModule';
import { PresupuestoModule } from '@/components/PresupuestoModule';
import { InformeEntregaModule } from '@/components/InformeEntregaModule';
import { CsatModule } from '@/components/CsatModule';
import { NewLeadModal } from '@/components/NewLeadModal';
import { 
  Lead, 
  Presupuesto, 
  InformeEntrega, 
  SurveyResponse, 
  COMPANY_DATA,
  BudgetItem
} from '@/types/crm';
import { 
  INITIAL_LEADS, 
  INITIAL_PRESUPUESTOS, 
  INITIAL_INFORMES, 
  INITIAL_SURVEYS 
} from '@/lib/mockData';
import { calculateWarrantyDates } from '@/lib/formatters';
import { Lock, ShieldCheck, KeyRound, LogOut, ArrowRight } from 'lucide-react';

const CRM_ACCESS_PIN = '10224994';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyAYhe9xRCAh1cEjlWq7fioCmOJfcJqwGrOkZFSTGczZlVBr0vr4eqrUeMGQ2yjq899/exec';

const DEFAULT_CONDITIONS = `CONDICIONES COMERCIALES Y GARANTÍA
- Forma de Pago: 50% de anticipo para iniciar los trabajos y respaldos. 50% contra entrega de la plataforma actualizada y probada.
- Plazo de Ejecución: 2 a 4 días hábiles desde la recepción del material completo (textos, logos, fotos) y los accesos solicitados.
- Garantía de Estabilidad (90 Días): PaginasPro.cl incluye una garantía técnica de 3 meses que cubre la estabilidad de la carga web y correcta visualización de los elementos entregados.`;

let pageItemCounter = 0;
function createPageItemId(): string {
  pageItemCounter += 1;
  return `item-${pageItemCounter}-${Date.now().toString(36)}`;
}

let pageInfCounter = 0;
function createPageInfId(): string {
  pageInfCounter += 1;
  return `inf-${pageInfCounter}-${Date.now().toString(36)}`;
}

const parseCLPAmount = (val: any): number => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return Math.round(val);
  let str = String(val).trim();
  str = str.replace(/[\.,]00?$/g, '');
  const cleaned = str.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
};

export default function CrmDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'pipeline' | 'presupuestos' | 'informes' | 'csat'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [prefillLeadData, setPrefillLeadData] = useState<{ name?: string; phone?: string } | undefined>(undefined);

  // Check saved authentication on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem('paginaspro_crm_auth');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
      }
      setIsCheckingAuth(false);
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === CRM_ACCESS_PIN) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('paginaspro_crm_auth', 'true');
      }
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('paginaspro_crm_auth');
      localStorage.removeItem('paginaspro_presupuestos');
    }
    setIsAuthenticated(false);
    setPinInput('');
  };

  // State initialized with real historical data
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>(INITIAL_PRESUPUESTOS);
  const [activePresupuesto, setActivePresupuesto] = useState<Presupuesto>(
    INITIAL_PRESUPUESTOS[0] || {
      id: 'ppto-228',
      correlativo: 228,
      clientName: '',
      clientCompany: '',
      clientEmail: 'diego@paginaspro.cl',
      clientPhone: '',
      date: new Date().toISOString().split('T')[0],
      validityDays: 15,
      items: [
        {
          id: createPageItemId(),
          title: 'Desarrollo Sitio Web Pro + Agenda Digital',
          description: 'Diseño UX/UI responsivo, optimización SEO de velocidad, SSL y agendamiento integrado.',
          netAmount: 70000,
        }
      ],
      appliesIva: true,
      notes: DEFAULT_CONDITIONS,
      totalNet: 70000,
      ivaAmount: 13300,
      totalAmount: 83300,
      anticipo50: 41650,
      nicChileFee: 9990,
      status: 'borrador'
    }
  );

  const [informes, setInformes] = useState<InformeEntrega[]>(INITIAL_INFORMES);
  const [activeInforme, setActiveInforme] = useState<InformeEntrega>(INITIAL_INFORMES[0] || {} as any);
  const [surveys, setSurveys] = useState<SurveyResponse[]>(INITIAL_SURVEYS);

  // Sincronización continua en segundo plano con Google Sheets
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadPresupuestosFromSheet() {
      try {
        const res = await fetch(`${APPS_SCRIPT_URL}?type=presupuestos`);
        const text = await res.text();
        const data = JSON.parse(text);

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
                description: 'Servicio maquetado en Next.js/Tailwind CSS.',
                netAmount: parseCLPAmount(item.montoNeto)
              }];
            }

            const net = parseCLPAmount(item.montoNeto);
            const iva = parseCLPAmount(item.iva) || Math.round(net * 0.19);
            const total = parseCLPAmount(item.montoTotal) || (net + iva);
            const matchCorr = String(item.correlativo || '228').match(/\d+/);
            const numCorr = matchCorr ? parseInt(matchCorr[0], 10) : 228;

            return {
              id: `ppto-${numCorr}`,
              correlativo: item.correlativo || numCorr,
              clientName: item.atencion || item.cliente || '',
              clientCompany: item.cliente || '',
              clientEmail: 'diego@paginaspro.cl',
              clientPhone: String(item.telefono || '').replace(/^p:/i, '').replace('#ERROR!', '').trim(),
              date: String(item.fecha || '').split('T')[0],
              validityDays: 15,
              items: parsedItems,
              appliesIva: iva > 0,
              notes: item.condiciones || DEFAULT_CONDITIONS,
              totalNet: net,
              ivaAmount: iva,
              totalAmount: total,
              anticipo50: Math.round(total / 2),
              nicChileFee: 9990,
              status: 'enviado'
            };
          });

          setPresupuestos(mappedPptos);
        }
      } catch (err) {
        console.error('Sincronización en segundo plano con Sheets finalizada:', err);
      }
    }

    loadPresupuestosFromSheet();
  }, [isAuthenticated]);

  // Convert Lead into Budget Quote
  const handleConvertLeadToQuote = (lead: Lead) => {
    let nextCorrelativo = 228;
    if (presupuestos.length > 0) {
      nextCorrelativo = Math.max(...presupuestos.map(p => Number(String(p.correlativo).match(/\d+/)?.[0] || 0))) + 1;
    }

    const newPpto: Presupuesto = {
      id: `ppto-${nextCorrelativo}`,
      correlativo: nextCorrelativo,
      clientName: lead.name,
      clientCompany: lead.company,
      clientEmail: lead.email || 'diego@paginaspro.cl',
      clientPhone: lead.phone,
      date: new Date().toISOString().split('T')[0],
      validityDays: 15,
      items: [
        {
          id: createPageItemId(),
          title: lead.serviceInterest || 'Desarrollo Sitio Web Pro',
          description: `Desarrollo UX/UI responsivo para ${lead.company}. Incluye optimización SEO de velocidad, SSL y casillas de correo.`,
          netAmount: lead.value || 70000,
        },
      ],
      appliesIva: true,
      notes: DEFAULT_CONDITIONS,
      totalNet: lead.value || 70000,
      ivaAmount: Math.round((lead.value || 70000) * 0.19),
      totalAmount: Math.round((lead.value || 70000) * 1.19),
      anticipo50: Math.round(((lead.value || 70000) * 1.19) / 2),
      nicChileFee: 9990,
      status: 'borrador',
    };

    setPresupuestos([newPpto, ...presupuestos]);
    setActivePresupuesto(newPpto);

    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, stage: 'cotizado', lastActivity: `Cotización N° ${nextCorrelativo} generada` } : l));
    setActiveTab('presupuestos');
  };

  const handleCreateNewPresupuesto = () => {
    let nextCorrelativo = 228;
    if (presupuestos.length > 0) {
      nextCorrelativo = Math.max(...presupuestos.map(p => Number(String(p.correlativo).match(/\d+/)?.[0] || 0))) + 1;
    }

    const newPpto: Presupuesto = {
      id: `ppto-${nextCorrelativo}`,
      correlativo: nextCorrelativo,
      clientName: 'Nombre Cliente',
      clientCompany: 'Nueva Empresa SpA',
      clientEmail: 'diego@paginaspro.cl',
      clientPhone: '+56 9 1234 5678',
      date: new Date().toISOString().split('T')[0],
      validityDays: 15,
      items: [
        {
          id: createPageItemId(),
          title: 'Desarrollo Sitio Web Pro',
          description: 'Diseño UX/UI corporativo en Next.js, optimización SEO local y configuración de correos corporativos.',
          netAmount: 0,
        },
      ],
      appliesIva: true,
      notes: DEFAULT_CONDITIONS,
      totalNet: 0,
      ivaAmount: 0,
      totalAmount: 0,
      anticipo50: 0,
      nicChileFee: 9990,
      status: 'borrador',
    };

    setPresupuestos([newPpto, ...presupuestos]);
    setActivePresupuesto(newPpto);
    setActiveTab('presupuestos');
  };

  const handleSavePresupuesto = (p: Presupuesto) => {
    setPresupuestos(prev => {
      const exists = prev.some(item => item.id === p.id);
      if (exists) {
        return prev.map(item => item.id === p.id ? p : item);
      }
      return [p, ...prev];
    });
  };

  const handleCreateNewInforme = () => {
    const dates = calculateWarrantyDates();
    const newInf: InformeEntrega = {
      id: createPageInfId(),
      clientName: 'Representante Cliente',
      companyName: 'Nueva Empresa SpA',
      webUrl: 'https://nuevaempresa.cl',
      deliveryDate: dates.warrantyStartDate,
      warrantyStartDate: dates.warrantyStartDate,
      warrantyEndDate: dates.warrantyEndDate,
      credentials: [
        {
          id: createPageItemId(),
          title: 'Administrador Panel Web',
          url: 'https://nuevaempresa.cl/admin',
          username: 'admin_empresa',
          passHint: 'Enviada por canal seguro',
        },
      ],
      corporateEmails: ['contacto@nuevaempresa.cl', 'ventas@nuevaempresa.cl'],
      deliverablesChecklist: [
        { id: 'd1', label: 'Certificado de Seguridad SSL HTTPS Activo', completed: true },
        { id: 'd2', label: 'Diseño 100% Responsivo Celulares y Tablets', completed: true },
        { id: 'd3', label: 'Botones WhatsApp y Formularios Probados', completed: true },
        { id: 'd4', label: 'Optimización de Velocidad de Carga', completed: true },
        { id: 'd5', label: 'Casillas de Correo Probadas', completed: true },
      ],
      notes: 'Recepción conforme con 90 días de garantía técnica activa.',
    };

    setInformes([newInf, ...informes]);
    setActiveInforme(newInf);
    setActiveTab('informes');
  };

  const handleSaveInforme = (inf: InformeEntrega) => {
    setInformes(prev => {
      const exists = prev.some(item => item.id === inf.id);
      if (exists) {
        return prev.map(item => item.id === inf.id ? inf : item);
      }
      return [inf, ...prev];
    });
  };

  const csatAvg = surveys.length > 0
    ? surveys.reduce((s, item) => s + item.overallRating, 0) / surveys.length
    : 5;

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans selection:bg-emerald-500 selection:text-slate-950">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-800 border border-slate-700/80 rounded-2xl mb-2 shadow-inner">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Páginas<span className="text-emerald-400">Pro</span>.cl
            </h1>
            <p className="text-xs font-medium text-slate-400">
              Acceso Privado al Panel CRM de Operaciones
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Código de Seguridad PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="••••••••"
                  autoFocus
                  className={`w-full bg-slate-950 border ${
                    pinError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800 focus:border-emerald-500'
                  } text-white font-mono text-center tracking-widest text-lg rounded-xl py-3 px-4 focus:outline-none transition placeholder:text-slate-700`}
                />
                <KeyRound className="w-5 h-5 text-slate-600 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {pinError && (
                <p className="text-rose-400 text-xs font-semibold mt-2 text-center">
                  ⚠️ PIN de acceso incorrecto
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            >
              <span>Ingresar al CRM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Plataforma Encriptada Vango SpA</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 flex flex-col justify-between">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onNewLeadClick={() => {
            setPrefillLeadData(undefined);
            setIsNewLeadModalOpen(true);
          }}
          onNewPresupuestoClick={handleCreateNewPresupuesto}
          onNewInformeClick={handleCreateNewInforme}
          leadsCount={leads.length}
          presupuestosCount={presupuestos.length}
          informesCount={informes.length}
          csatAvg={csatAvg}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'pipeline' && (
            <PipelineModule
              leads={leads}
              setLeads={setLeads}
              searchTerm={searchTerm}
              onConvertLeadToQuote={handleConvertLeadToQuote}
              onOpenNewLeadModal={(data) => {
                setPrefillLeadData(data);
                setIsNewLeadModalOpen(true);
              }}
            />
          )}

          {activeTab === 'presupuestos' && (
            <PresupuestoModule
              presupuestos={presupuestos}
              setPresupuestos={setPresupuestos}
              activePresupuesto={activePresupuesto}
              setActivePresupuesto={setActivePresupuesto}
              onSavePresupuesto={handleSavePresupuesto}
            />
          )}

          {activeTab === 'informes' && (
            <InformeEntregaModule
              informes={informes}
              setInformes={setInformes}
              activeInforme={activeInforme}
              setActiveInforme={setActiveInforme}
              onSaveInforme={handleSaveInforme}
            />
          )}

          {activeTab === 'csat' && (
            <CsatModule
              surveys={surveys}
              setSurveys={setSurveys}
            />
          )}
        </main>
      </div>

      <footer className="no-print bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">Páginas<span className="text-emerald-400">Pro</span>.cl</span>
            <span className="text-slate-500">•</span>
            <span>{COMPANY_DATA.razonSocial} ({COMPANY_DATA.rut})</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px] flex items-center gap-3">
            <span>crm.paginaspro.cl</span>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 font-semibold flex items-center gap-1 transition px-2 py-1 rounded bg-slate-800 hover:bg-slate-800/80"
              title="Cerrar Sesión Privada"
            >
              <LogOut className="w-3 h-3" />
              <span>Salir</span>
            </button>
          </div>
          <div className="text-slate-500 text-[11px]">
            La Serena, Chile • Scotiabank Cta. Cte. N° 993884572
          </div>
        </div>
      </footer>

      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => {
          setIsNewLeadModalOpen(false);
          setPrefillLeadData(undefined);
        }}
        prefillData={prefillLeadData}
        onAddLead={(newLead) => setLeads([newLead, ...leads])}
      />
    </div>
  );
}
