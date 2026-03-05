import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { generateContract } from '../utils/pdfGenerator';
import { FileText, Search, Download } from 'lucide-react';

const Contract = () => {
  const { leads } = useData();
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [contractData, setContractData] = useState({
    maritalStatus: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip: '',
    creditor: '',
    value: '',
    installments: '',
    paymentMethod: '',
    date: new Date().toISOString().split('T')[0],
  });

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContractData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (selectedLead) {
      await generateContract(selectedLead, contractData);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Gerar Contrato</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o Cliente</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
            >
              <option value="">Selecione um cliente...</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>{lead.name} - {lead.cpf}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado Civil</label>
                <input type="text" name="maritalStatus" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={contractData.maritalStatus} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número</label>
                <input type="text" name="number" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={contractData.number} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bairro</label>
                <input type="text" name="neighborhood" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={contractData.neighborhood} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cidade</label>
                <input type="text" name="city" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={contractData.city} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado (UF)</label>
                <input type="text" name="state" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={contractData.state} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CEP</label>
                <input type="text" name="zip" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={contractData.zip} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Credor</label>
                <input type="text" name="creditor" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={contractData.creditor} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor do Contrato</label>
                <input type="text" name="value" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={contractData.value} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Parcelas</label>
                <input type="text" name="installments" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={contractData.installments} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
                <input type="text" name="paymentMethod" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={contractData.paymentMethod} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data do Contrato</label>
                <input type="date" name="date" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={contractData.date} />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleGenerate}
                className="flex items-center px-6 py-3 bg-purple-600 border border-transparent rounded-md shadow-sm text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Download className="h-5 w-5 mr-2" />
                Gerar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contract;
