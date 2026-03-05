import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Attribution from './pages/Attribution';
import Funnel from './pages/Funnel';
import Ranking from './pages/Ranking';
import Agenda from './pages/Agenda';
import Team from './pages/Team';
import Contract from './pages/Contract';
import Costs from './pages/Costs';
import Financial from './pages/Financial';
import History from './pages/History';
import Goals from './pages/Goals';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/history" element={<History />} />
                <Route path="/attribution" element={<Attribution />} />
                <Route path="/funnel" element={<Funnel />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/team" element={<Team />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/contract" element={<Contract />} />
                <Route path="/costs" element={<Costs />} />
                <Route path="/financial" element={<Financial />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
