import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Star } from 'lucide-react';

const Ranking = () => {
  const { leads, users, financialRecords } = useData();
  const { user } = useAuth();

  // Calculate stats per consultant
  const consultantStats = users
    .filter(u => u.role.includes('CONSULTOR'))
    .map(consultant => {
      // Leads assigned to this consultant (for closed count)
      // Note: Closed count might still be relevant based on assignment, or maybe based on who made the sale?
      // The request says "Entra no ranking do consultor comercial/juridico".
      // Usually ranking is based on revenue. Let's keep closed count based on assignment for now, or maybe based on financial records too?
      // "Ranking Comercial: R$ 3.000" implies ranking is primarily revenue.
      // Let's keep closed count as assigned leads that are closed, but revenue strictly from financial records.
      
      const consultantLeads = leads.filter(l => l.commercialConsultantId === consultant.id || l.legalConsultantId === consultant.id);
      const closedLeads = consultantLeads.filter(l => l.status === 'FECHADO');
      
      const revenue = financialRecords
        .filter(f => f.type === 'RECEITA' && f.responsibleId === consultant.id)
        .reduce((acc, curr) => acc + Number(curr.value), 0);
      
      return {
        id: consultant.id,
        name: consultant.name,
        teamId: consultant.teamId,
        closedCount: closedLeads.length,
        revenue,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const top3 = consultantStats.slice(0, 3);
  const rest = consultantStats.slice(3);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Ranking de Vendas</h1>

      {/* Hall of Fame - Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {top3.map((consultant, index) => (
          <div key={consultant.id} className={`bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ${index === 0 ? 'border-4 border-yellow-400' : ''}`}>
            <div className={`h-24 flex items-center justify-center ${index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : 'bg-orange-100'}`}>
              {index === 0 && <Trophy className="h-12 w-12 text-yellow-500" />}
              {index === 1 && <Medal className="h-10 w-10 text-gray-500" />}
              {index === 2 && <Medal className="h-10 w-10 text-orange-500" />}
            </div>
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900">{consultant.name}</h3>
              <p className="text-sm text-gray-500 mb-4">Equipe {consultant.teamId}</p>
              <div className="flex justify-center items-center space-x-2 mb-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-xl font-semibold text-gray-800">{consultant.closedCount} Vendas</span>
              </div>
              <p className="text-2xl font-bold text-green-600">R$ {consultant.revenue.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rest of the leaderboard */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posição</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultor</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rest.map((consultant, index) => (
              <tr key={consultant.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 4}º</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{consultant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{consultant.closedCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">R$ {consultant.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ranking;
