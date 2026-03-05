import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import DashboardCard from '../components/DashboardCard';
import { DollarSign, Users, CheckCircle, XCircle, TrendingUp, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { leads, financialRecords, teams, users } = useData();

  const { stats, chartData } = useMemo(() => {
    if (!user) return { stats: null, chartData: [] };

    let filteredLeads = leads;
    let filteredFinancials = financialRecords;

    if (user.role === 'SUPERVISOR_COMERCIAL') {
      filteredLeads = leads.filter(l => l.commercialSupervisorId === user.id);
      
      // Filter financials by team members
      const teamMemberIds = users.filter(u => u.teamId === user.teamId).map(u => u.id);
      filteredFinancials = financialRecords.filter(f => 
        f.responsibleId && teamMemberIds.includes(f.responsibleId)
      );

    } else if (user.role === 'SUPERVISOR_JURIDICO') {
      filteredLeads = leads.filter(l => l.legalSupervisorId === user.id);
      
      // Filter financials by team members
      const teamMemberIds = users.filter(u => u.teamId === user.teamId).map(u => u.id);
      filteredFinancials = financialRecords.filter(f => 
        f.responsibleId && teamMemberIds.includes(f.responsibleId)
      );

    } else if (user.role === 'CONSULTOR_COMERCIAL') {
      filteredLeads = leads.filter(l => l.commercialConsultantId === user.id);
      filteredFinancials = financialRecords.filter(f => f.responsibleId === user.id);
    } else if (user.role === 'CONSULTOR_JURIDICO') {
      filteredLeads = leads.filter(l => l.legalConsultantId === user.id);
      filteredFinancials = financialRecords.filter(f => f.responsibleId === user.id);
    }

    // Stats Calculation
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

    const statsData = {
      totalRevenue,
      negotiation,
      closed,
      lost,
      conversionRate,
      goalPercentage
    };

    // Chart Data Calculation
    const monthlyData: { [key: string]: number } = {};

    filteredFinancials.forEach(record => {
      if (record.type === 'RECEITA') {
        const date = new Date(record.date);
        // Use YYYY-MM as key for sorting
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = (monthlyData[key] || 0) + record.value;
      }
    });

    // If no data, provide at least current month with 0
    if (Object.keys(monthlyData).length === 0) {
      const now = new Date();
      const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = 0;
    }

    const chartData = Object.entries(monthlyData)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        // Create date object correctly (month is 0-indexed in Date constructor)
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
        const monthName = dateObj.toLocaleString('pt-BR', { month: 'short' });
        return {
          name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          receita: value,
        };
      });

    return { stats: statsData, chartData };
  }, [user, leads, financialRecords, teams]);

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
              <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
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
