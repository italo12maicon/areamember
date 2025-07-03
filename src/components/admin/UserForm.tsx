import React, { useState } from 'react';
import { X, Save, Lock, Unlock } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { User } from '../../types';

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
  const { addUser, updateUser, courses } = useData();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: user?.password || '',
    unlockedCourses: user?.unlockedCourses || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      updateUser(user.id, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        unlockedCourses: formData.unlockedCourses,
      });
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        isAdmin: false,
        registrationDate: new Date().toISOString(),
        unlockedCourses: formData.unlockedCourses,
      };
      addUser(newUser);
    }
    
    onClose();
  };

  const toggleCourseAccess = (courseId: string) => {
    const isUnlocked = formData.unlockedCourses.includes(courseId);
    if (isUnlocked) {
      setFormData({
        ...formData,
        unlockedCourses: formData.unlockedCourses.filter(id => id !== courseId)
      });
    } else {
      setFormData({
        ...formData,
        unlockedCourses: [...formData.unlockedCourses, courseId]
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {user ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Informações Básicas</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Digite o email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Digite a senha"
                required
              />
            </div>
          </div>

          {/* Course Access */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Acesso aos Cursos</h3>
            
            {courses.length > 0 ? (
              <div className="space-y-3">
                {courses.map((course) => {
                  const isUnlocked = formData.unlockedCourses.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{course.title}</h4>
                        <p className="text-gray-400 text-sm">{course.description}</p>
                        {course.isBlocked && (
                          <span className="inline-flex items-center gap-1 text-yellow-400 text-xs mt-1">
                            <Lock className="w-3 h-3" />
                            Curso bloqueado por padrão
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCourseAccess(course.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isUnlocked
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            <Unlock className="w-4 h-4" />
                            Desbloqueado
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Bloqueado
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                Nenhum curso disponível. Crie cursos primeiro.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Save className="w-5 h-5" />
              {user ? 'Atualizar' : 'Criar'} Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;