import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { User, Lead } from '../types';
import { Search } from 'lucide-react';

const Attribution = () => {
  const { leads, users, updateLead } = useData();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter users by role
  const commercialSupervisors = users.filter(u => u.role === 'SUPERVISOR_COMERCIAL');
  const commercialConsultants = users.filter(u => u.role === 'CONSULTOR_COMERCIAL');
  const legalSupervisors = users.filter(u => u.role === 'SUPERVISOR_JURIDICO');
  const legalConsultants = users.filter(u => u.role === 'CONSULTOR_JURIDICO');

  const handleAssign = (leadId: string, field: keyof Lead, value: string) => {
    updateLead(leadId, { [field]: value });
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.cpf.includes(searchTerm)
  );

  // Helper to filter consultants by selected supervisor (if we want to enforce team logic)
  // For now, let's allow any assignment as per "todos os clientes ele podem ter um supervisor e consultor de cada departamento"
  // But usually consultants belong to a supervisor's team.
  // Let's keep it flexible but maybe highlight team members?
  // For simplicity in this UI, we just list all available options for the role.

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Atribuição de Leads</h1>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Buscar lead por nome ou CPF"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor Comercial</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultor Comercial</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor Jurídico</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultor Jurídico</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                  <div className="text-sm text-gray-500">{lead.contractType}</div>
                </td>
                
                {/* Commercial Supervisor */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                    value={lead.commercialSupervisorId || ''}
                    onChange={(e) => handleAssign(lead.id, 'commercialSupervisorId', e.target.value)}
                    disabled={currentUser?.role !== 'ADM' && currentUser?.role !== 'SUPERVISOR_COMERCIAL'}
                  >
                    <option value="">Selecione...</option>
                    {commercialSupervisors.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </td>

                {/* Commercial Consultant */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                    value={lead.commercialConsultantId || ''}
                    onChange={(e) => handleAssign(lead.id, 'commercialConsultantId', e.target.value)}
                    disabled={currentUser?.role !== 'ADM' && currentUser?.role !== 'SUPERVISOR_COMERCIAL'}
                  >
                    <option value="">Selecione...</option>
                    {commercialConsultants
                      // Optional: Filter by selected supervisor's team if needed
                      // .filter(c => !lead.commercialSupervisorId || c.teamId === users.find(u => u.id === lead.commercialSupervisorId)?.teamId)
                      .map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </td>

                {/* Legal Supervisor */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                    value={lead.legalSupervisorId || ''}
                    onChange={(e) => handleAssign(lead.id, 'legalSupervisorId', e.target.value)}
                    disabled={currentUser?.role !== 'ADM' && currentUser?.role !== 'SUPERVISOR_JURIDICO'}
                  >
                    <option value="">Selecione...</option>
                    {legalSupervisors.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </td>

                {/* Legal Consultant */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                    value={lead.legalConsultantId || ''}
                    onChange={(e) => handleAssign(lead.id, 'legalConsultantId', e.target.value)}
                    disabled={currentUser?.role !== 'ADM' && currentUser?.role !== 'SUPERVISOR_JURIDICO'}
                  >
                    <option value="">Selecione...</option>
                    {legalConsultants.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attribution;
