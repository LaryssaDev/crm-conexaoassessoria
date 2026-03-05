export type Role =
  | 'ADM'
  | 'SUPERVISOR_COMERCIAL'
  | 'CONSULTOR_COMERCIAL'
  | 'SUPERVISOR_JURIDICO'
  | 'CONSULTOR_JURIDICO'
  | 'RH'
  | 'FINANCEIRO';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: Role;
  teamId?: string; // For supervisors and consultants
}

export interface Team {
  id: string;
  name: string;
  supervisorId: string;
  goal?: number;
}

export type LeadStatus = 'NOVO' | 'EM_NEGOCIACAO' | 'FECHADO' | 'PERDIDO';

export interface LeadHistory {
  id: string;
  date: string;
  userId: string;
  
  // New fields for Andamento
  type: 'CONTATO' | 'OBSERVACAO' | 'PAGAMENTO';
  department: 'COMERCIAL' | 'JURIDICO';
  description: string;
  phone?: string;
  
  // Payment specific
  value?: number;
  paymentMethod?: string;
  installments?: number;

  // Legacy fields (kept for backward compatibility with mock data)
  topic?: string;
  observation?: string;
}

export interface Lead {
  id: string;
  name: string;
  cpf: string;
  address: string;
  phone: string;
  email: string;
  origin: string;
  contractType: 'Veículo' | 'Imóvel' | 'Pessoal';
  installmentValue: number;
  status: LeadStatus;
  
  // Assignments
  commercialSupervisorId?: string;
  commercialConsultantId?: string;
  legalSupervisorId?: string;
  legalConsultantId?: string;

  createdAt: string;
  history: LeadHistory[];
  // value removed as per Rule 3
}

export interface Cost {
  id: string;
  description: string;
  category: 'Vendas' | 'Ferramenta' | 'Marketing' | 'Imposto' | 'Comissão' | 'Infraestrutura' | 'Outros';
  dueDate: number; // Day of month
  value: number;
  status: 'Pendente' | 'Pago';
}

export interface FinancialRecord {
  id: string;
  type: 'RECEITA' | 'DESPESA';
  description: string;
  value: number;
  date: string;
  category?: string;
  leadId?: string; // If linked to a lead
  department?: 'COMERCIAL' | 'JURIDICO'; // Rule 1 & 2
  responsibleId?: string; // Rule 1 & 2
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'Reunião' | 'Pagamento' | 'Compromisso';
  userId: string;
}
