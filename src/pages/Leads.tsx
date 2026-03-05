import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Lead, LeadStatus, LeadHistory } from '../types';
import Modal from '../components/Modal';
import { Plus, Upload, Search, Filter, History as HistoryIcon, MessageSquare, Trash, Edit } from 'lucide-react';
import * as XLSX from 'xlsx';

const Leads = () => {
  const { leads, addLead, updateLead, deleteLead } = useData();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');

  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    address: '',
    origin: 'Site',
    contractType: 'Veículo',
    installmentValue: 0,
    status: 'NOVO',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewLead(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead);
    setNewLead({
      name: lead.name,
      cpf: lead.cpf,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      origin: lead.origin,
      contractType: lead.contractType,
      installmentValue: lead.installmentValue,
      status: lead.status,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
    setNewLead({
      name: '',
      cpf: '',
      phone: '',
      email: '',
      address: '',
      origin: 'Site',
      contractType: 'Veículo',
      installmentValue: 0,
      status: 'NOVO',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLead) {
      updateLead(editingLead.id, newLead);
    } else {
      const lead: Lead = {
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        history: [],
        commercialConsultantId: user?.role === 'CONSULTOR_COMERCIAL' ? user.id : undefined,
        legalConsultantId: user?.role === 'CONSULTOR_JURIDICO' ? user.id : undefined,
        ...newLead as Lead
      };
      addLead(lead);
    }
    
    handleCloseModal();
  };

  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      deleteLead(leadToDelete.id);
      setIsDeleteModalOpen(false);
      setLeadToDelete(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        console.log('Imported data:', data);
        alert('Importação simulada com sucesso! Verifique o console para os dados.');
      };
      reader.readAsBinaryString(file);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.cpf.includes(searchTerm) ||
                          lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    
    let matchesRole = true;
    if (user?.role.includes('CONSULTOR')) {
      matchesRole = lead.commercialConsultantId === user.id || lead.legalConsultantId === user.id;
    } else if (user?.role.includes('SUPERVISOR')) {
      matchesRole = lead.commercialSupervisorId === user.id || lead.legalSupervisorId === user.id;
    }

    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Gestão de Leads</h1>
        <div className="flex space-x-2">
          <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
            <Upload className="h-5 w-5 mr-2 text-gray-500" />
            Importar Excel
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
          </label>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Buscar por nome, CPF ou email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sm:w-64">
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'ALL')}
          >
            <option value="ALL">Todos os Status</option>
            <option value="NOVO">Novo</option>
            <option value="EM_NEGOCIACAO">Em Negociação</option>
            <option value="FECHADO">Fechado</option>
            <option value="PERDIDO">Perdido</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredLeads.map((lead) => (
            <li key={lead.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-600 truncate">{lead.name}</p>
                  <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${lead.status === 'FECHADO' ? 'bg-green-100 text-green-800' : 
                        lead.status === 'PERDIDO' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {lead.status}
                    </p>
                    <button
                      onClick={() => handleEditClick(lead)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar Lead"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(lead)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir Lead"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500 mr-6">
                      {lead.email}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      {lead.phone}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Criado em <time dateTime={lead.createdAt}>{new Date(lead.createdAt).toLocaleDateString()}</time>
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingLead ? "Editar Lead" : "Novo Lead"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input type="text" name="name" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newLead.name} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">CPF</label>
              <input type="text" name="cpf" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newLead.cpf} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input type="text" name="phone" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newLead.phone} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newLead.email} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Endereço</label>
            <input type="text" name="address" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newLead.address} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Origem</label>
              <select name="origin" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newLead.origin}>
                <option value="Site">Site</option>
                <option value="Anúncio">Anúncio</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Indicação">Indicação</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Contrato</label>
              <select name="contractType" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newLead.contractType}>
                <option value="Veículo">Veículo</option>
                <option value="Imóvel">Imóvel</option>
                <option value="Pessoal">Pessoal</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Valor da Parcela</label>
            <input type="number" name="installmentValue" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newLead.installmentValue} />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Exclusão">
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja excluir o lead <strong>{leadToDelete?.name}</strong>?
            <br />
            Esta ação não pode ser desfeita e todo o histórico será perdido.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Leads;