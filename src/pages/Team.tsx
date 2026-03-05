import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { User, Role } from '../types';
import Modal from '../components/Modal';
import { Plus, Trash, Edit, Eye, EyeOff } from 'lucide-react';

const Team = () => {
  const { users, addUser, updateUser, deleteUser, teams } = useData();
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<User>>({
    name: '',
    username: '',
    password: '',
    role: 'CONSULTOR_COMERCIAL',
    teamId: '',
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  if (currentUser?.role !== 'ADM') {
    return <div className="text-red-600">Acesso negado. Apenas administradores podem acessar esta página.</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser.id) {
      updateUser(editingUser.id, editingUser);
    } else {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...editingUser as User
      };
      addUser(user);
    }
    setIsModalOpen(false);
    setEditingUser({ name: '', username: '', password: '', role: 'CONSULTOR_COMERCIAL', teamId: '' });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Gestão de Equipe</h1>
        <button
          onClick={() => {
            setEditingUser({ name: '', username: '', password: '', role: 'CONSULTOR_COMERCIAL', teamId: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipe</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Senha</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role.replace('_', ' ')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {teams.find(t => t.id === user.teamId)?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                  <span className="mr-2">
                    {showPassword === user.id ? user.password : '••••••'}
                  </span>
                  <button
                    onClick={() => setShowPassword(showPassword === user.id ? null : user.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword === user.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDeleteClick(user)} className="text-red-600 hover:text-red-900">
                    <Trash className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser.id ? 'Editar Usuário' : 'Novo Usuário'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input type="text" name="name" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={editingUser.name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Login</label>
            <input type="text" name="username" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={editingUser.username} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input type="text" name="password" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={editingUser.password} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cargo</label>
            <select name="role" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={editingUser.role}>
              <option value="ADM">ADM</option>
              <option value="SUPERVISOR_COMERCIAL">Supervisor Comercial</option>
              <option value="CONSULTOR_COMERCIAL">Consultor Comercial</option>
              <option value="SUPERVISOR_JURIDICO">Supervisor Jurídico</option>
              <option value="CONSULTOR_JURIDICO">Consultor Jurídico</option>
              <option value="RH">RH</option>
              <option value="FINANCEIRO">Financeiro</option>
            </select>
          </div>
          {(editingUser.role?.includes('SUPERVISOR') || editingUser.role?.includes('CONSULTOR')) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Equipe</label>
              <select name="teamId" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleInputChange} value={editingUser.teamId || ''}>
                <option value="">Selecione uma equipe...</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-2">Cancelar</button>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">Salvar</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Exclusão">
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Team;
