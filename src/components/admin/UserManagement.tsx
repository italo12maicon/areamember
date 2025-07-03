import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Mail } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { User } from '../../types';
import UserForm from './UserForm';

const UserManagement: React.FC = () => {
  const { users, deleteUser } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteUser(userId);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const getDaysSinceRegistration = (registrationDate: string) => {
    return Math.floor((Date.now() - new Date(registrationDate).getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gerenciamento de Usuários</h2>
          <p className="text-gray-400">Gerencie os usuários da plataforma</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      {/* User List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">Usuário</th>
                <th className="text-left p-4 text-gray-300 font-medium">Email</th>
                <th className="text-left p-4 text-gray-300 font-medium">Data de Registro</th>
                <th className="text-left p-4 text-gray-300 font-medium">Dias na Plataforma</th>
                <th className="text-left p-4 text-gray-300 font-medium">Cursos Desbloqueados</th>
                <th className="text-right p-4 text-gray-300 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">
                          {user.isAdmin ? 'Administrador' : 'Usuário'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.registrationDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">
                      {getDaysSinceRegistration(user.registrationDate)} dias
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                      {user.unlockedCourses.length}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {!user.isAdmin && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum usuário cadastrado</h3>
          <p className="text-gray-400 mb-4">Comece adicionando o primeiro usuário</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Adicionar Primeiro Usuário
          </button>
        </div>
      )}

      {/* User Form Modal */}
      {isFormOpen && (
        <UserForm
          user={editingUser}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default UserManagement;