import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { Calendar as CalendarIcon, Clock, Plus, Trash, Users, DollarSign } from 'lucide-react';
import { Event } from '../types';

const Agenda = () => {
  const { user } = useAuth();
  const { events, addEvent, deleteEvent } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: '',
    time: '',
    type: 'Reunião',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.id || '',
      title: newEvent.title || '',
      date: newEvent.date || '',
      time: newEvent.time || '',
      type: (newEvent.type as 'Reunião' | 'Pagamento' | 'Compromisso') || 'Reunião',
    };
    addEvent(event);
    setIsModalOpen(false);
    setNewEvent({ title: '', date: '', time: '', type: 'Reunião' });
  };

  const myEvents = events.filter(e => e.userId === user?.id).sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Minha Agenda</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Compromisso
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {myEvents.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">Nenhum compromisso agendado.</li>
          ) : (
            myEvents.map((event) => (
              <li key={event.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                      event.type === 'Reunião' ? 'bg-blue-100 text-blue-600' :
                      event.type === 'Pagamento' ? 'bg-green-100 text-green-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {event.type === 'Reunião' && <Users className="h-5 w-5" />}
                      {event.type === 'Pagamento' && <DollarSign className="h-5 w-5" />}
                      {event.type === 'Compromisso' && <CalendarIcon className="h-5 w-5" />}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-gray-900">{event.title}</h4>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>{new Date(event.date).toLocaleDateString()}</p>
                        <Clock className="flex-shrink-0 mx-1.5 h-4 w-4 text-gray-400" />
                        <p>{event.time}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      event.type === 'Reunião' ? 'bg-blue-100 text-blue-800' :
                      event.type === 'Pagamento' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.type}
                    </span>
                    <button onClick={() => deleteEvent(event.id)} className="ml-4 text-gray-400 hover:text-red-600">
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Compromisso">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Título</label>
            <input type="text" name="title" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newEvent.title} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data</label>
              <input type="date" name="date" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newEvent.date} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hora</label>
              <input type="time" name="time" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newEvent.time} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select name="type" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={newEvent.type}>
              <option value="Reunião">Reunião</option>
              <option value="Pagamento">Pagamento</option>
              <option value="Compromisso">Compromisso</option>
            </select>
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

export default Agenda;
