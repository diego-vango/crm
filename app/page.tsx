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
  COMPANY_DATA 
} from '@/types/crm';
import { 
  INITIAL_LEADS, 
  INITIAL_PRESUPUESTOS, 
  INITIAL_INFORMES, 
  INITIAL_SURVEYS 
} from '@/lib/mockData';
import { calculateWarrantyDates } from '@/lib/formatters';

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

export default function CrmDashboardPage() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'presupuestos' | 'informes' | 'csat'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  // State with LocalStorage Persistence
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('paginaspro_leads');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_LEADS;
  });

  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('paginaspro_presupuestos');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_PRESUPUESTOS;
  });

  const [activePresupuesto, setActivePresupuesto] = useState<Presupuesto>(
    INITIAL_PRESUPUESTOS[0]
  );

  const [informes, setInformes] = useState<InformeEntrega[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('paginaspro_informes');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_INFORMES;
  });

  const [activeInforme, setActiveInforme] = useState<InformeEntrega>(
    INITIAL_INFORMES[0]
  );

  const [surveys, setSurveys] = useState<SurveyResponse[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('paginaspro_surveys');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_SURVEYS;
  });

  // Save to LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('paginaspro_leads', JSON.stringify(leads));
    }
  }, [leads]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('paginaspro_presupuestos', JSON.stringify(presupuestos));
    }
  }, [presupuestos]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('paginaspro_informes', JSON.stringify(informes));
    }
  }, [informes]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('paginaspro_surveys', JSON.stringify(surveys));
    }
  }, [surveys]);

  // Convert Lead directly into a Budget Quote and switch tab
  const handleConvertLeadToQuote = (lead: Lead) => {
    const nextCorrelativo = Math.max(...presupuestos.map(p => p.correlativo || 200), 228) + 1;

    const newPpto: Presupuesto = {
      id: `ppto-${nextCorrelativo}`,
      correlativo: nextCorrelativo,
      clientName: lead.name,
      clientCompany: lead.company,
      clientEmail: lead.email,
      clientPhone: lead.phone,
      date: new Date().toISOString().split('T')[0],
      validityDays: 15,
      items: [
        {
          id: createPageItemId(),
          title: lead.serviceInterest || 'Desarrollo Sitio Web Pro',
          description: `Desarrollo UX/UI responsivo en Next.js/Tailwind CSS para ${lead.company}. Incluye optimización SEO de velocidad, SSL y casillas de correo.`,
          netAmount: lead.value || 750000,
        },
      ],
      appliesIva: true,
      notes: '50% de anticipo para iniciar el proyecto y 50% restante contra entrega conforme del sitio web publicado en dominio definitivo.',
      totalNet: lead.value || 750000,
      ivaAmount: Math.round((lead.value || 750000) * 0.19),
      totalAmount: Math.round((lead.value || 750000) * 1.19),
      anticipo50: Math.round(((lead.value || 750000) * 1.19) / 2),
      nicChileFee: 9990,
      status: 'borrador',
    };

    setPresupuestos([newPpto, ...presupuestos]);
    setActivePresupuesto(newPpto);

    // Update lead stage to 'cotizado'
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, stage: 'cotizado', lastActivity: `Cotización N° ${nextCorrelativo} generada` } : l));

    // Switch tab to Presupuestos
    setActiveTab('presupuestos');
  };

  // Add new Presupuesto
  const handleCreateNewPresupuesto = () => {
    const nextCorrelativo = Math.max(...presupuestos.map(p => p.correlativo || 200), 228) + 1;
    const newPpto: Presupuesto = {
      id: `ppto-${nextCorrelativo}`,
      correlativo: nextCorrelativo,
      clientName: 'Nombre Cliente',
      clientCompany: 'Nueva Empresa SpA',
      clientEmail: 'contacto@cliente.cl',
      clientPhone: '+56 9 1234 5678',
      date: new Date().toISOString().split('T')[0],
      validityDays: 15,
      items: [
        {
          id: createPageItemId(),
          title: 'Desarrollo Sitio Web Pro + Dominio .cl',
          description: 'Diseño UX/UI corporativo en Next.js, optimización SEO local y configuración de correos corporativos.',
          netAmount: 650000,
        },
      ],
      appliesIva: true,
      notes: '50% de anticipo para iniciar el proyecto y 50% contra entrega conforme.',
      totalNet: 650000,
      ivaAmount: 123500,
      totalAmount: 773500,
      anticipo50: 386750,
      nicChileFee: 9990,
      status: 'borrador',
    };

    setPresupuestos([newPpto, ...presupuestos]);
    setActivePresupuesto(newPpto);
    setActiveTab('presupuestos');
  };

  // Save budget changes
  const handleSavePresupuesto = (p: Presupuesto) => {
    setPresupuestos(prev => {
      const exists = prev.some(item => item.id === p.id);
      if (exists) {
        return prev.map(item => item.id === p.id ? p : item);
      }
      return [p, ...prev];
    });
  };

  // Create new Informe de Entrega
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

  // CSAT Average
  const csatAvg = surveys.length > 0
    ? surveys.reduce((s, item) => s + item.overallRating, 0) / surveys.length
    : 5;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 flex flex-col justify-between">
      
      <div>
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onNewLeadClick={() => setIsNewLeadModalOpen(true)}
          onNewPresupuestoClick={handleCreateNewPresupuesto}
          onNewInformeClick={handleCreateNewInforme}
          leadsCount={leads.length}
          presupuestosCount={presupuestos.length}
          informesCount={informes.length}
          csatAvg={csatAvg}
        />

        {/* Main Content Workspace */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {activeTab === 'pipeline' && (
            <PipelineModule
              leads={leads}
              setLeads={setLeads}
              searchTerm={searchTerm}
              onConvertLeadToQuote={handleConvertLeadToQuote}
              onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
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

      {/* Footer (Hidden on print) */}
      <footer className="no-print bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">Páginas<span className="text-emerald-400">Pro</span>.cl</span>
            <span className="text-slate-500">•</span>
            <span>{COMPANY_DATA.razonSocial} ({COMPANY_DATA.rut})</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Dashboard CRM Operaciones Unificado • <span className="text-emerald-400">crm.paginaspro.cl</span>
          </div>
          <div className="text-slate-500 text-[11px]">
            La Serena, Chile • Scotiabank Cta. Cte. N° 993884572
          </div>
        </div>
      </footer>

      {/* Add Lead Modal */}
      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onAddLead={(newLead) => setLeads([newLead, ...leads])}
      />

    </div>
  );
}
