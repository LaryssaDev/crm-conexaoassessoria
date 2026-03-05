import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Target, Users, DollarSign } from 'lucide-react';

const Goals = () => {
  const { teams, updateTeam, users } = useData();
  const { user } = useAuth();
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [tempGoal, setTempGoal] = useState<string>('');

  const getTeamMembersCount = (teamId: string) => {
    return users.filter(u => u.teamId === teamId && !u.role.includes('SUPERVISOR')).length;
  };

  const handleEditClick = (team: any) => {
    setEditingTeamId(team.id);
    setTempGoal(team.goal?.toString() || '');
  };

  const handleSaveClick = (teamId: string) => {
    updateTeam(teamId, { goal: Number(tempGoal) });
    setEditingTeamId(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (user?.role === 'ADM') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Metas das Equipes</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membros</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meta Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meta Individual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teams.map(team => {
                const memberCount = getTeamMembersCount(team.id);
                const individualGoal = team.goal ? team.goal / (memberCount || 1) : 0;

                return (
                  <tr key={team.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{memberCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingTeamId === team.id ? (
                        <input
                          type="number"
                          value={tempGoal}
                          onChange={(e) => setTempGoal(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 w-32"
                        />
                      ) : (
                        formatCurrency(team.goal || 0)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(individualGoal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingTeamId === team.id ? (
                        <button onClick={() => handleSaveClick(team.id)} className="text-green-600 hover:text-green-900 mr-4">Salvar</button>
                      ) : (
                        <button onClick={() => handleEditClick(team)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Supervisor View
  if (user?.role === 'SUPERVISOR_COMERCIAL' || user?.role === 'SUPERVISOR_JURIDICO') {
    const myTeam = teams.find(t => t.id === user.teamId);
    if (!myTeam) return <div>Equipe não encontrada.</div>;

    const memberCount = getTeamMembersCount(myTeam.id);
    const individualGoal = myTeam.goal ? myTeam.goal / (memberCount || 1) : 0;

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Meta da Equipe: {myTeam.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Meta Total da Equipe</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(myTeam.goal || 0)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Membros na Equipe</dt>
                    <dd className="text-lg font-medium text-gray-900">{memberCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
           <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Meta Individual (por membro)</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(individualGoal)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Consultant View
  if (user?.role === 'CONSULTOR_COMERCIAL' || user?.role === 'CONSULTOR_JURIDICO') {
    const myTeam = teams.find(t => t.id === user.teamId);
    if (!myTeam) return <div>Equipe não encontrada.</div>;

    const memberCount = getTeamMembersCount(myTeam.id);
    const individualGoal = myTeam.goal ? myTeam.goal / (memberCount || 1) : 0;

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Minha Meta</h1>
        <div className="bg-white overflow-hidden shadow rounded-lg max-w-md">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Meta Individual</dt>
                  <dd className="text-3xl font-bold text-gray-900">{formatCurrency(individualGoal)}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-gray-500">Parte da meta da equipe: {myTeam.name}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>Acesso restrito.</div>;
};

export default Goals;
