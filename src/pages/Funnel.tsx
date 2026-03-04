import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Lead, LeadStatus } from '../types';

const Funnel = () => {
  const { leads, updateLead, addFinancialRecord, financialRecords } = useData();
  const { user } = useAuth();

  const columns: LeadStatus[] = ['NOVO', 'EM_NEGOCIACAO', 'FECHADO', 'PERDIDO'];

  const handleStatusChange = (lead: Lead, newStatus: LeadStatus) => {
    updateLead(lead.id, { status: newStatus });
  };

  const filteredLeads = leads.filter(lead => {
    if (user?.role === 'ADM') return true;
    if (user?.role === 'SUPERVISOR_COMERCIAL') return lead.commercialSupervisorId === user.id;
    if (user?.role === 'SUPERVISOR_JURIDICO') return lead.legalSupervisorId === user.id;
    if (user?.role === 'CONSULTOR_COMERCIAL') return lead.commercialConsultantId === user.id;
    if (user?.role === 'CONSULTOR_JURIDICO') return lead.legalConsultantId === user.id;
    return false;
  });

  const getLeadsByStatus = (status: LeadStatus) => filteredLeads.filter(l => l.status === status);

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      <h1 className="text-2xl font-semibold text-gray-900">Funil de Vendas</h1>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full space-x-4 min-w-max pb-4">
          {columns.map(status => (
            <div key={status} className="w-80 flex flex-col bg-gray-100 rounded-lg shadow-sm">
              <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">{status.replace('_', ' ')}</h3>
                <span className="bg-gray-200 text-gray-600 py-1 px-2 rounded-full text-xs font-semibold">
                  {getLeadsByStatus(status).length}
                </span>
              </div>
              <div className="flex-1 p-2 overflow-y-auto space-y-3">
                {getLeadsByStatus(status).map(lead => (
                  <div key={lead.id} className="bg-white p-3 rounded shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-gray-900">{lead.name}</h4>
                      <span className="text-xs text-gray-500">{lead.contractType}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{lead.email}</p>
                    <p className="text-xs text-gray-500 mt-1">R$ {lead.installmentValue}</p>
                    
                    <div className="mt-3">
                      <select
                        className="block w-full pl-3 pr-10 py-1 text-xs border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md"
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                      >
                        <option value="NOVO">Novo</option>
                        <option value="EM_NEGOCIACAO">Em Negociação</option>
                        <option value="FECHADO">Fechado</option>
                        <option value="PERDIDO">Perdido</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Funnel;
