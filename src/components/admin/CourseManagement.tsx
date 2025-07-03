import React, { useState } from 'react';
import { Plus, Edit, Trash2, Lock, Unlock, ExternalLink } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Course, Lesson } from '../../types';
import CourseForm from './CourseForm';

const CourseManagement: React.FC = () => {
  const { courses, deleteCourse } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  const handleDelete = (courseId: string) => {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
      deleteCourse(courseId);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCourse(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gerenciamento de Cursos</h2>
          <p className="text-gray-400">Crie e gerencie os cursos da plataforma</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Curso
        </button>
      </div>

      {/* Course List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <div className="aspect-video bg-gray-700 relative">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">Sem imagem</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {course.isBlocked ? (
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Bloqueado
                  </span>
                ) : (
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    Liberado
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-3">{course.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>{course.lessons.length} aulas</span>
                {course.unlockAfterDays && (
                  <span>Desbloqueio: {course.unlockAfterDays} dias</span>
                )}
              </div>

              {course.isBlocked && course.unblockLink && (
                <div className="flex items-center gap-1 text-blue-400 text-sm mb-3">
                  <ExternalLink className="w-3 h-3" />
                  <span>Link de desbloqueio configurado</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(course)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum curso cadastrado</h3>
          <p className="text-gray-400 mb-4">Comece criando seu primeiro curso</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Criar Primeiro Curso
          </button>
        </div>
      )}

      {/* Course Form Modal */}
      {isFormOpen && (
        <CourseForm
          course={editingCourse}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default CourseManagement;