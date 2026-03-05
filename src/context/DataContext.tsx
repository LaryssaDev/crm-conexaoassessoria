import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Lead, Team, Cost, FinancialRecord, Event } from '../types';
import { USERS, LEADS, TEAMS, COSTS, FINANCIAL_RECORDS, EVENTS } from '../data/mockData';

interface DataContextType {
  users: User[];
  leads: Lead[];
  teams: Team[];
  costs: Cost[];
  financialRecords: FinancialRecord[];
  events: Event[];
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addCost: (cost: Cost) => void;
  updateCost: (id: string, updates: Partial<Cost>) => void;
  deleteCost: (id: string) => void;
  addFinancialRecord: (record: FinancialRecord) => void;
  deleteFinancialRecord: (id: string) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  addEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('conexao_users_v2');
    return stored ? JSON.parse(stored) : USERS;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const stored = localStorage.getItem('conexao_leads');
    return stored ? JSON.parse(stored) : LEADS;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const stored = localStorage.getItem('conexao_teams');
    return stored ? JSON.parse(stored) : TEAMS;
  });

  const [costs, setCosts] = useState<Cost[]>(() => {
    const stored = localStorage.getItem('conexao_costs_v2');
    return stored ? JSON.parse(stored) : COSTS;
  });

  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(() => {
    const stored = localStorage.getItem('conexao_financial_v2');
    return stored ? JSON.parse(stored) : FINANCIAL_RECORDS;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const stored = localStorage.getItem('conexao_events');
    return stored ? JSON.parse(stored) : EVENTS;
  });

  // Persist to localStorage whenever state changes
  useEffect(() => localStorage.setItem('conexao_users_v2', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('conexao_leads', JSON.stringify(leads)), [leads]);
  useEffect(() => localStorage.setItem('conexao_teams', JSON.stringify(teams)), [teams]);
  useEffect(() => localStorage.setItem('conexao_costs_v2', JSON.stringify(costs)), [costs]);
  useEffect(() => localStorage.setItem('conexao_financial_v2', JSON.stringify(financialRecords)), [financialRecords]);
  useEffect(() => localStorage.setItem('conexao_events', JSON.stringify(events)), [events]);

  const addLead = (lead: Lead) => setLeads(prev => [...prev, lead]);
  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };
  const deleteLead = (id: string) => setLeads(prev => prev.filter(l => l.id !== id));

  const addCost = (cost: Cost) => setCosts(prev => [...prev, cost]);
  const updateCost = (id: string, updates: Partial<Cost>) => {
    setCosts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };
  const deleteCost = (id: string) => setCosts(prev => prev.filter(c => c.id !== id));

  const addFinancialRecord = (record: FinancialRecord) => setFinancialRecords(prev => [...prev, record]);
  const deleteFinancialRecord = (id: string) => setFinancialRecords(prev => prev.filter(r => r.id !== id));

  const addUser = (user: User) => setUsers(prev => [...prev, user]);
  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };
  const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

  const addTeam = (team: Team) => setTeams(prev => [...prev, team]);
  const updateTeam = (id: string, updates: Partial<Team>) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addEvent = (event: Event) => setEvents(prev => [...prev, event]);
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  return (
    <DataContext.Provider value={{
      users, leads, teams, costs, financialRecords, events,
      addLead, updateLead, deleteLead,
      addCost, updateCost, deleteCost,
      addFinancialRecord, deleteFinancialRecord,
      addUser, updateUser, deleteUser,
      addTeam, updateTeam,
      addEvent, deleteEvent
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
