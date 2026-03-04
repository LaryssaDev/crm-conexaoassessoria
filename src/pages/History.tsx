import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LeadHistory, Lead } from '../types';
import Modal from '../components/Modal';
import { Plus, Search, Phone, MessageSquare, DollarSign, ArrowLeft, User } from 'lucide-react';

const History = () => {
  const { leads, updateLead, addFinancialRecord, users } = useData();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newRecord, setNewRecord] = useState<Partial<LeadHistory>>({
    type: 'CONTATO',
    department: user?.role.includes('JURIDICO') ? 'JURIDICO' : 'COMERCIAL',
    description: '',
    phone: '',
    value: 0,
    paymentMethod: 'Pix',
    installments: 1,
  });

  const selectedLead = useMemo(() => 
    leads.find(l => l.id === selectedLeadId), 
  [leads, selectedLeadId]);

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads;
    const lowerTerm = searchTerm.toLowerCase();
    return leads.filter(l => 
      l.name.toLowerCase().includes(lowerTerm) ||
      l.cpf.includes(lowerTerm) ||
      l.email.toLowerCase().includes(lowerTerm)
    );
  }, [leads, searchTerm]);

  const clientHistory = useMemo(() => {
    if (!selectedLead) return [];
    return [...selectedLead.history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedLead]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const historyItem: LeadHistory = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      userId: user?.id || '',
      type: newRecord.type as any,
      department: newRecord.department as any,
      description: newRecord.description || '',
      phone: newRecord.phone,
      value: newRecord.type === 'PAGAMENTO' ? Number(newRecord.value) : undefined,
      paymentMethod: newRecord.type === 'PAGAMENTO' ? newRecord.paymentMethod : undefined,
      installments: newRecord.type === 'PAGAMENTO' ? Number(newRecord.installments) : undefined,
      topic: newRecord.type, // Legacy
      observation: newRecord.description, // Legacy
    };

    const updatedHistory = [...selectedLead.history, historyItem];
    updateLead(selectedLead.id, { history: updatedHistory });

    if (newRecord.type === 'PAGAMENTO') {
      addFinancialRecord({
        id: Math.random().toString(36).substr(2, 9),
        type: 'RECEITA',
        description: `Pagamento - ${selectedLead.name} (${newRecord.description})`,
        value: Number(newRecord.value),
        date: new Date().toISOString(),
        category: newRecord.department === 'COMERCIAL' ? 'Venda Inicial' : 'Complemento Jurídico',
        leadId: selectedLead.id,
        department: newRecord.department as any,
        responsibleId: user?.id,
      });
    }

    setIsModalOpen(false);
    setNewRecord({
      type: 'CONTATO',
      department: user?.role.includes('JURIDICO') ? 'JURIDICO' : 'COMERCIAL',
      description: '',
      phone: '',
      value: 0,
      paymentMethod: 'Pix',
      installments: 1,
    });
  };

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Desconhecido';
  };

  const canSelectDepartment = user?.role === 'ADM';

  // View 1: Client Selection List
  if (!selectedLeadId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Andamento do Cliente</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Selecione um Cliente</h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3"
              placeholder="Buscar cliente por nome, CPF ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mt-4 border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <li 
                  key={lead.id} 
                  className="py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer px-2 rounded-md transition-colors"
                  onClick={() => setSelectedLeadId(lead.id)}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-500">{lead.cpf} • {lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${lead.status === 'FECHADO' ? 'bg-green-100 text-green-800' : 
                        lead.status === 'PERDIDO' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {lead.status}
                    </span>
                    <div className="ml-4 text-gray-400">
                      <ArrowLeft className="h-5 w-5 transform rotate-180" />
                    </div>
                  </div>
                </li>
              ))}
              {filteredLeads.length === 0 && (
                <li className="py-8 text-center text-gray-500">
                  Nenhum cliente encontrado.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // View 2: Client History Details
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSelectedLeadId(null)}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{selectedLead?.name}</h1>
            <p className="text-sm text-gray-500">CPF: {selectedLead?.cpf} • Contrato: {selectedLead?.contractType}</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Registro
        </button>
      </div>

      {/* Timeline List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {clientHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum histórico registrado para este cliente.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {clientHistory.map((item) => (
              <li key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {item.type === 'PAGAMENTO' ? (
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    ) : item.type === 'CONTATO' ? (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Phone className="h-6 w-6 text-blue-600" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${item.department === 'COMERCIAL' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                          {item.department}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{item.type}</span>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(item.date).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.description || item.observation}</p>
                    {item.type === 'PAGAMENTO' && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-800 border border-green-100">
                        <p className="font-medium">Valor: R$ {item.value?.toFixed(2)}</p>
                        <p>Forma: {item.paymentMethod} ({item.installments}x)</p>
                      </div>
                    )}
                    {item.phone && (
                      <p className="text-xs text-gray-400 mt-1">Tel: {item.phone}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Registrado por: {getUserName(item.userId)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Novo Registro - ${selectedLead?.name}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client is already selected, so no need to select again */}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Departamento</label>
              <select
                name="department"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={newRecord.department}
                onChange={handleInputChange}
                disabled={!canSelectDepartment}
              >
                <option value="COMERCIAL">Comercial</option>
                <option value="JURIDICO">Jurídico</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Registro</label>
              <select
                name="type"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={newRecord.type}
                onChange={handleInputChange}
              >
                <option value="CONTATO">Contato</option>
                <option value="OBSERVACAO">Observação</option>
                <option value="PAGAMENTO">Pagamento</option>
              </select>
            </div>
          </div>

          {newRecord.type === 'CONTATO' && (
             <div>
              <label className="block text-sm font-medium text-gray-700">Telefone Utilizado</label>
              <input
                type="text"
                name="phone"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={newRecord.phone}
                onChange={handleInputChange}
              />
            </div>
          )}

          {newRecord.type === 'PAGAMENTO' && (
            <div className="bg-green-50 p-4 rounded-md space-y-3 border border-green-200">
              <h4 className="text-sm font-medium text-green-800">Dados do Pagamento</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor Pago (R$)</label>
                <input
                  type="number"
                  name="value"
                  required
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={newRecord.value}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
                  <select
                    name="paymentMethod"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={newRecord.paymentMethod}
                    onChange={handleInputChange}
                  >
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Parcelas</label>
                  <input
                    type="number"
                    name="installments"
                    min="1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={newRecord.installments}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição Detalhada</label>
            <textarea
              name="description"
              required
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={newRecord.description}
              onChange={handleInputChange}
              placeholder="Descreva os detalhes do contato, observação ou pagamento..."
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default History;
