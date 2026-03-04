import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import DashboardCard from '../components/DashboardCard';
import { DollarSign, Users, CheckCircle, XCircle, TrendingUp, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { leads, financialRecords, teams } = useData();

  const stats = useMemo(() => {
    if (!user) return null;

    let filteredLeads = leads;
    let filteredFinancials = financialRecords;

    if (user.role === 'SUPERVISOR_COMERCIAL') {
      filteredLeads = leads.filter(l => l.commercialSupervisorId === user.id);
      // Financials: records where responsible is in my team OR department is COMMERCIAL (if I want to see all dept revenue? No, usually my team)
      // For simplicity, let's filter by department 'COMERCIAL' for now as we don't have full team hierarchy implemented in mock data perfectly.
      // Or better: filter by records where responsibleId is a consultant under this supervisor.
      // Given mock data limitations, let's assume Supervisor sees all COMMERCIAL revenue for now, or we can try to match responsibleId.
      filteredFinancials = financialRecords.filter(f => f.department === 'COMERCIAL');
    } else if (user.role === 'SUPERVISOR_JURIDICO') {
      filteredLeads = leads.filter(l => l.legalSupervisorId === user.id);
      filteredFinancials = financialRecords.filter(f => f.department === 'JURIDICO');
    } else if (user.role === 'CONSULTOR_COMERCIAL') {
      filteredLeads = leads.filter(l => l.commercialConsultantId === user.id);
      filteredFinancials = financialRecords.filter(f => f.responsibleId === user.id);
    } else if (user.role === 'CONSULTOR_JURIDICO') {
      filteredLeads = leads.filter(l => l.legalConsultantId === user.id);
      filteredFinancials = financialRecords.filter(f => f.responsibleId === user.id);
    }

    const totalRevenue = filteredFinancials
      .filter(f => f.type === 'RECEITA')
      .reduce((acc, curr) => acc + curr.value, 0);

    const negotiation = filteredLeads.filter(l => l.status === 'EM_NEGOCIACAO').length;
    const closed = filteredLeads.filter(l => l.status === 'FECHADO').length;
    const lost = filteredLeads.filter(l => l.status === 'PERDIDO').length;
    const total = filteredLeads.length;
    const conversionRate = total > 0 ? ((closed / total) * 100).toFixed(1) : '0';

    // Mock goal
    const goal = 100000;
    const goalPercentage = ((totalRevenue / goal) * 100).toFixed(1);

    return {
      totalRevenue,
      negotiation,
      closed,
      lost,
      conversionRate,
      goalPercentage
    };
  }, [user, leads, financialRecords, teams]);

  const chartData = [
    { name: 'Jan', receita: 4000 },
    { name: 'Fev', receita: 3000 },
    { name: 'Mar', receita: 2000 },
    { name: 'Abr', receita: 2780 },
    { name: 'Mai', receita: 1890 },
    { name: 'Jun', receita: 2390 },
  ];

  if (!stats) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Faturamento Total"
          value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="text-green-600"
        />
        <DashboardCard
          title="Leads em Negociação"
          value={stats.negotiation}
          icon={Users}
          color="text-blue-600"
        />
        <DashboardCard
          title="Leads Fechados"
          value={stats.closed}
          icon={CheckCircle}
          color="text-purple-600"
        />
        <DashboardCard
          title="Leads Perdidos"
          value={stats.lost}
          icon={XCircle}
          color="text-red-600"
        />
        <DashboardCard
          title="Taxa de Conversão"
          value={`${stats.conversionRate}%`}
          icon={TrendingUp}
          color="text-indigo-600"
        />
        <DashboardCard
          title="Meta Mensal"
          value={`${stats.goalPercentage}%`}
          icon={Target}
          color="text-orange-600"
        />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Evolução do Faturamento</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="receita" fill="#8a2695" name="Receita" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
