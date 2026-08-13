export type LeadStage = 'nuevo' | 'conversacion' | 'cotizado' | 'cerrado' | 'perdido';

export type LeadOrigin = 'meta_ads' | 'web_form' | 'whatsapp';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  stage: LeadStage;
  origin: LeadOrigin;
  value: number;
  serviceInterest: string;
  notes: string;
  createdAt: string;
  lastActivity: string;
}

export interface BudgetItem {
  id: string;
  title: string;
  description: string;
  netAmount: number;
}

export interface Presupuesto {
  id: string;
  correlativo: number; // e.g. 228
  clientName: string;
  clientCompany: string;
  clientRut?: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  validityDays: number;
  items: BudgetItem[];
  appliesIva: boolean;
  notes: string;
  totalNet: number;
  ivaAmount: number;
  totalAmount: number;
  anticipo50: number;
  nicChileFee: number; // $9.990
  status: 'borrador' | 'enviado' | 'aceptado' | 'rechazado';
}

export interface CredentialItem {
  id: string;
  title: string;
  url: string;
  username: string;
  passHint: string;
}

export interface DeliverableCheck {
  id: string;
  label: string;
  completed: boolean;
}

export interface InformeEntrega {
  id: string;
  clientName: string;
  companyName: string;
  clientRut?: string;
  webUrl: string;
  deliveryDate: string;
  warrantyStartDate: string;
  warrantyEndDate: string; // +90 days
  credentials: CredentialItem[];
  corporateEmails: string[];
  deliverablesChecklist: DeliverableCheck[];
  notes: string;
}

export interface SurveyResponse {
  id: string;
  clientName: string;
  companyName: string;
  overallRating: number; // 1-5 stars
  usabilityRating: number; // 1-5 stars
  attentionRating: number; // 1-5 stars
  npsScore: number; // 0-10
  comments: string;
  createdAt: string;
  verified: boolean;
}

export interface CompanyInfo {
  razonSocial: string;
  nombreFantasia: string;
  rut: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  direccion: string;
  telefono: string;
  emailContact: string;
  website: string;
}

export const COMPANY_DATA: CompanyInfo = {
  razonSocial: 'Vango SpA',
  nombreFantasia: 'PáginasPro.cl',
  rut: '78.406.599-5',
  banco: 'Scotiabank',
  tipoCuenta: 'Cuenta Corriente',
  numeroCuenta: '993884572',
  direccion: 'Colón 352 Of 318, La Serena',
  telefono: '+56 9 9683 1269',
  emailContact: 'diego@vango.cl / diego@paginaspro.cl',
  website: 'https://paginaspro.cl',
};
