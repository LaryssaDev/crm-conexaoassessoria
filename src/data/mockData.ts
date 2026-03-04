import { User, Lead, Team, Cost, FinancialRecord } from '../types';

export const USERS: User[] = [
  { id: '1', name: 'Administrador', username: 'adm100', password: '100adm', role: 'ADM' },
  { id: '2', name: 'Supervisor Comercial', username: 'comercialsuper', password: 'comercial01', role: 'SUPERVISOR_COMERCIAL', teamId: 'team1' },
  { id: '3', name: 'Consultor Comercial 1', username: 'consultorcomercial1', password: 'comercialvendas', role: 'CONSULTOR_COMERCIAL', teamId: 'team1' },
  { id: '4', name: 'Supervisor Jurídico', username: 'juridicosuper', password: 'juridico01', role: 'SUPERVISOR_JURIDICO', teamId: 'team2' },
  { id: '5', name: 'Consultor Jurídico 1', username: 'consultorjuridico1', password: 'juridicoprocesso', role: 'CONSULTOR_JURIDICO', teamId: 'team2' },
  { id: '6', name: 'RH', username: 'rh001', password: 'rh001', role: 'RH' },
  { id: '7', name: 'Financeiro', username: 'financeiro001', password: 'financeiro001', role: 'FINANCEIRO' },
];

export const TEAMS: Team[] = [
  { id: 'team1', name: 'Equipe Comercial Alpha', supervisorId: '2' },
  { id: 'team2', name: 'Equipe Jurídica Beta', supervisorId: '4' },
];

export const LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'João Silva',
    cpf: '123.456.789-00',
    address: 'Rua A, 123, Centro, SP',
    phone: '(11) 99999-9999',
    email: 'joao@email.com',
    origin: 'Site',
    contractType: 'Veículo',
    installmentValue: 1500,
    status: 'NOVO',
    createdAt: new Date().toISOString(),
    history: [],
  },
  {
    id: 'l2',
    name: 'Maria Oliveira',
    cpf: '987.654.321-00',
    address: 'Av B, 456, Jardins, SP',
    phone: '(11) 88888-8888',
    email: 'maria@email.com',
    origin: 'Indicação',
    contractType: 'Imóvel',
    installmentValue: 3000,
    status: 'EM_NEGOCIACAO',
    commercialSupervisorId: '2',
    commercialConsultantId: '3',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    history: [
      { 
        id: 'h1', 
        topic: 'Contato Inicial', 
        observation: 'Cliente interessada em redução de juros.', 
        date: new Date(Date.now() - 86400000).toISOString(), 
        userId: '3',
        type: 'CONTATO',
        department: 'COMERCIAL',
        description: 'Cliente interessada em redução de juros.'
      }
    ],
  },
  {
    id: 'l3',
    name: 'Carlos Pereira',
    cpf: '111.222.333-44',
    address: 'Rua C, 789, Vila Madalena, SP',
    phone: '(11) 77777-7777',
    email: 'carlos@email.com',
    origin: 'WhatsApp',
    contractType: 'Pessoal',
    installmentValue: 800,
    status: 'FECHADO',
    commercialSupervisorId: '2',
    commercialConsultantId: '3',
    legalSupervisorId: '4',
    legalConsultantId: '5',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    history: [],
  }
];

export const COSTS: Cost[] = [
  { id: 'c1', description: 'Aluguel Escritório', category: 'Infraestrutura', dueDate: 5, value: 2500, status: 'Pendente' },
  { id: 'c2', description: 'Internet', category: 'Infraestrutura', dueDate: 10, value: 150, status: 'Pago' },
];

export const FINANCIAL_RECORDS: FinancialRecord[] = [
  { id: 'f1', type: 'RECEITA', description: 'Contrato Carlos Pereira', value: 5000, date: new Date(Date.now() - 172800000).toISOString(), leadId: 'l3' },
  { id: 'f2', type: 'DESPESA', description: 'Internet', value: 150, date: new Date().toISOString(), category: 'Infraestrutura' },
];
