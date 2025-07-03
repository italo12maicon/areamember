import React, { useState } from 'react';
import { Plus, Trash2, Download, FileText, Video, Image, Link, Save } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Resource } from '../../types';

const ResourceManagement: React.FC = () => {
  const { resources, courses, addResource, deleteResource } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    type: 'pdf' as Resource['type'],
    url: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const resource: Resource = {
      id: Date.now().toString(),
      courseId: formData.courseId,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      url: formData.url,
      createdAt: new Date().toISOString(),
    };

    addResource(resource);
    setFormData({
      courseId: '',
      title: '',
      description: '',
      type: 'pdf',
      url: '',
    });
    setIsFormOpen(false);
  };

  const handleDelete = (resourceId: string) => {
    if (confirm('Tem certeza que deseja excluir este recurso?')) {
      deleteResource(resourceId);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'video': return Video;
      case 'image': return Image;
      case 'link': return Link;
      default: return Download;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf': return 'PDF';
      case 'video': return 'Vídeo';
      case 'image': return 'Imagem';
      case 'link': return 'Link';
      default: return 'Arquivo';
    }
  };

  const getResourcesByType = (type: string) => {
    return resources.filter(r => r.type === type);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gerenciamento de Recursos</h2>
          <p className="text-gray-400">Gerencie materiais complementares dos cursos</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Recurso
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{getResourcesByType('pdf').length}</p>
              <p className="text-gray-400 text-sm">PDFs</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Video className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{getResourcesByType('video').length}</p>
              <p className="text-gray-400 text-sm">Vídeos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Image className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">{getResourcesByType('image').length}</p>
              <p className="text-gray-400 text-sm">Imagens</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Link className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">{getResourcesByType('link').length}</p>
              <p className="text-gray-400 text-sm">Links</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resources by Course */}
      {courses.length > 0 ? (
        <div className="space-y-6">
          {courses.map((course) => {
            const courseResources = resources.filter(r => r.courseId === course.id);
            
            return (
              <div key={course.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={course.imageUrl || 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=100&h=100'}
                    alt={course.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white">{course.title}</h3>
                    <p className="text-gray-400">{courseResources.length} recursos</p>
                  </div>
                </div>

                {courseResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courseResources.map((resource) => {
                      const Icon = getResourceIcon(resource.type);
                      
                      return (
                        <div key={resource.id} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium mb-1 line-clamp-2">{resource.title}</h4>
                              <p className="text-gray-400 text-sm mb-2 line-clamp-2">{resource.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 bg-gray-600 px-2 py-1 rounded">
                                  {getResourceTypeLabel(resource.type)}
                                </span>
                                <button
                                  onClick={() => handleDelete(resource.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="mt-2">
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-xs break-all"
                                >
                                  {resource.url}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Download className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Nenhum recurso adicionado para este curso</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum curso disponível</h3>
          <p className="text-gray-400">Crie cursos primeiro para adicionar recursos</p>
        </div>
      )}

      {/* Resource Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white">Novo Recurso</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Curso *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Selecione um curso</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nome do recurso"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 h-24"
                  placeholder="Descrição do recurso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Resource['type'] })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Vídeo</option>
                  <option value="image">Imagem</option>
                  <option value="link">Link</option>
                  <option value="file">Arquivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="https://exemplo.com/arquivo.pdf"
                  required
                />
                <p className="text-gray-400 text-sm mt-1">
                  {formData.type === 'link' 
                    ? 'URL do site ou página'
                    : 'URL direta para o arquivo (Google Drive, Dropbox, etc.)'
                  }
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Salvar Recurso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagement;