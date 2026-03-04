import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Cost } from '../types';
import Modal from '../components/Modal';
import { Plus, Trash, Check, AlertCircle } from 'lucide-react';

const Costs = () => {
  const { costs, addCost, updateCost, deleteCost, addFinancialRecord } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCost, setNewCost] = useState<Partial<Cost>>({
    description: '',
    category: 'Outros',
    dueDate: 1,
    value: 0,
    status: 'Pendente',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCost(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost: Cost = {
      id: Math.random().toString(36).substr(2, 9),
      ...newCost as Cost
    };
    addCost(cost);
    setIsModalOpen(false);
    setNewCost({ description: '', category: 'Outros', dueDate: 1, value: 0, status: 'Pendente' });
  };

  const handleMarkAsPaid = (cost: Cost) => {
    updateCost(cost.id, { status: 'Pago' });
    addFinancialRecord({
      id: Math.random().toString(36).substr(2, 9),
      type: 'DESPESA',
      description: cost.description,
      value: Number(cost.value),
      date: new Date().toISOString(),
      category: cost.category
    });
  };

  const totalPending = costs.filter(c => c.status === 'Pendente').reduce((acc, curr) => acc + Number(curr.value), 0);
  const totalPaid = costs.filter(c => c.status === 'Pago').reduce((acc, curr) => acc + Number(curr.value), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Custos Fixos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Custo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Pendente</dt>
          <dd className="mt-1 text-3xl font-semibold text-red-600">R$ {totalPending.toFixed(2)}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Pago (Mês)</dt>
          <dd className="mt-1 text-3xl font-semibold text-green-600">R$ {totalPaid.toFixed(2)}</dd>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {costs.map((cost) => (
              <tr key={cost.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cost.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cost.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Dia {cost.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {Number(cost.value).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cost.status === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {cost.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {cost.status === 'Pendente' && (
                    <button onClick={() => handleMarkAsPaid(cost)} className="text-green-600 hover:text-green-900 mr-4" title="Marcar como Pago">
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                  <button onClick={() => deleteCost(cost.id)} className="text-red-600 hover:text-red-900" title="Excluir">
                    <Trash className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Custo Fixo">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <input type="text" name="description" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newCost.description} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoria</label>
            <select name="category" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newCost.category}>
              <option value="Vendas">Vendas</option>
              <option value="Ferramenta">Ferramenta</option>
              <option value="Marketing">Marketing</option>
              <option value="Imposto">Imposto</option>
              <option value="Comissão">Comissão</option>
              <option value="Infraestrutura">Infraestrutura</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Dia de Vencimento</label>
              <input type="number" name="dueDate" min="1" max="31" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newCost.dueDate} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Valor</label>
              <input type="number" name="value" step="0.01" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newCost.value} />
            </div>
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

export default Costs;
