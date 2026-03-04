import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { FinancialRecord } from '../types';
import Modal from '../components/Modal';
import { Plus, Trash, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Financial = () => {
  const { financialRecords, addFinancialRecord, deleteFinancialRecord, leads, users } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<FinancialRecord>>({
    description: '',
    type: 'RECEITA',
    value: 0,
    category: '',
    department: undefined,
    responsibleId: undefined,
    leadId: undefined,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leadId = e.target.value;
    const lead = leads.find(l => l.id === leadId);
    
    if (lead) {
      // Default to Commercial if it's the first record (Venda Inicial), else user can change
      // But per rules, we should let user decide or auto-select based on context.
      // Let's just set leadId and let user fill the rest to be flexible but guided.
      setNewRecord(prev => ({
        ...prev,
        leadId,
        description: `Pagamento - ${lead.name}`,
        // We could try to auto-guess department/responsible but it's better to be explicit
      }));
    } else {
      setNewRecord(prev => ({ ...prev, leadId: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: FinancialRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      ...newRecord as FinancialRecord
    };
    addFinancialRecord(record);
    setIsModalOpen(false);
    setNewRecord({ description: '', type: 'RECEITA', value: 0, category: '', department: undefined, responsibleId: undefined, leadId: undefined });
  };

  const consultants = users.filter(u => u.role.includes('CONSULTOR'));

  const totalIncome = financialRecords.filter(r => r.type === 'RECEITA').reduce((acc, curr) => acc + Number(curr.value), 0);
  const totalExpense = financialRecords.filter(r => r.type === 'DESPESA').reduce((acc, curr) => acc + Number(curr.value), 0);
  const balance = totalIncome - totalExpense;

  // Chart Data Preparation
  const chartData = [
    { name: 'Total', Receita: totalIncome, Despesa: totalExpense }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Financeiro</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Lançamento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Receitas</dt>
                <dd className="text-2xl font-semibold text-gray-900">R$ {totalIncome.toFixed(2)}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Despesas</dt>
                <dd className="text-2xl font-semibold text-gray-900">R$ {totalExpense.toFixed(2)}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Saldo</dt>
                <dd className={`text-2xl font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {balance.toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Visão Geral</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Receita" fill="#10B981" />
              <Bar dataKey="Despesa" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Movimentações Recentes</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {financialRecords.slice().reverse().map((record) => (
            <li key={record.id}>
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-gray-900">{record.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString()} - {record.category}
                    {record.department && ` (${record.department})`}
                  </p>
                  {record.responsibleId && (
                    <p className="text-xs text-gray-400">
                      Resp: {users.find(u => u.id === record.responsibleId)?.name}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.type === 'RECEITA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {record.type === 'RECEITA' ? '+' : '-'} R$ {Number(record.value).toFixed(2)}
                  </span>
                  <button onClick={() => deleteFinancialRecord(record.id)} className="ml-4 text-gray-400 hover:text-red-600">
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Lançamento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select name="type" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newRecord.type}>
              <option value="RECEITA">Receita</option>
              <option value="DESPESA">Despesa</option>
            </select>
          </div>

          {newRecord.type === 'RECEITA' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Vincular Lead (Opcional)</label>
              <select name="leadId" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleLeadChange} value={newRecord.leadId || ''}>
                <option value="">Nenhum</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>{lead.name} - {lead.cpf}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <input type="text" name="description" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newRecord.description} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoria</label>
            <select name="category" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newRecord.category}>
              <option value="">Selecione...</option>
              <option value="Venda Inicial">Venda Inicial (Comercial)</option>
              <option value="Complemento Jurídico">Complemento Jurídico</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          {newRecord.type === 'RECEITA' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Departamento</label>
                <select name="department" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newRecord.department || ''}>
                  <option value="">Selecione...</option>
                  <option value="COMERCIAL">Comercial</option>
                  <option value="JURIDICO">Jurídico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Responsável Financeiro</label>
                <select name="responsibleId" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newRecord.responsibleId || ''}>
                  <option value="">Selecione...</option>
                  {consultants.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role.replace('CONSULTOR_', '')})</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Valor</label>
            <input type="number" name="value" step="0.01" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newRecord.value} />
          </div>
          
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-2">Cancelar</button>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Financial;
