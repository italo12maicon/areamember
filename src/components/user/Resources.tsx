import React from 'react';
import { Download, FileText, Link, Image, Video, Package, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const Resources: React.FC = () => {
  const { user } = useAuth();
  const { courses, products, resources } = useData();

  // Get available courses for the user
  const availableCourses = courses.filter(course => {
    if (!user || (course.isBlocked && !user.unlockedCourses.includes(course.id))) return false;
    return true;
  });

  // Get available products for the user
  const availableProducts = products.filter(product => {
    if (!user || !user.unlockedProducts || (product.isBlocked && !user.unlockedProducts.includes(product.id))) return false;
    return true;
  });

  // Get resources for available courses and products
  const availableResources = resources.filter(resource => 
    (resource.courseId && availableCourses.some(course => course.id === resource.courseId)) ||
    (resource.productId && availableProducts.some(product => product.id === resource.productId))
  );

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'video':
        return Video;
      case 'image':
        return Image;
      case 'link':
        return Link;
      default:
        return Download;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'PDF';
      case 'video':
        return 'Vídeo';
      case 'image':
        return 'Imagem';
      case 'link':
        return 'Link';
      default:
        return 'Arquivo';
    }
  };

  const handleDownload = (resource: any) => {
    if (resource.type === 'link') {
      window.open(resource.url, '_blank');
    } else {
      // For actual files, trigger download
      const link = document.createElement('a');
      link.href = resource.url;
      link.download = resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const allAvailableContent = [
    ...availableCourses.map(course => ({ ...course, type: 'course' })),
    ...availableProducts.map(product => ({ ...product, type: 'product' }))
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Recursos</h1>
        <p className="text-gray-400">Materiais complementares e downloads dos seus conteúdos</p>
      </div>

      {availableResources.length > 0 ? (
        <div className="space-y-8">
          {allAvailableContent.map((content) => {
            const isProduct = content.type === 'product';
            const contentResources = availableResources.filter(r => 
              isProduct ? r.productId === content.id : r.courseId === content.id
            );
            
            if (contentResources.length === 0) return null;

            return (
              <div key={`${content.type}-${content.id}`} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={content.imageUrl || 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=100&h=100'}
                    alt={content.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {isProduct ? <Package className="w-5 h-5 text-purple-400" /> : <BookOpen className="w-5 h-5 text-blue-400" />}
                      <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                        isProduct ? 'bg-purple-600' : 'bg-blue-600'
                      }`}>
                        {isProduct ? 'PRODUTO' : 'CURSO'}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{content.title}</h2>
                    <p className="text-gray-400">{contentResources.length} recursos disponíveis</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contentResources.map((resource) => {
                    const Icon = getResourceIcon(resource.type);
                    
                    return (
                      <div
                        key={resource.id}
                        className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                        onClick={() => handleDownload(resource)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isProduct ? 'bg-purple-600' : 'bg-red-600'
                          }`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium mb-1 line-clamp-2">{resource.title}</h3>
                            <p className="text-gray-400 text-sm mb-2 line-clamp-2">{resource.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 bg-gray-600 px-2 py-1 rounded">
                                {getResourceTypeLabel(resource.type)}
                              </span>
                              <Download className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum recurso disponível</h3>
          <p className="text-gray-400 mb-4">Os recursos dos conteúdos aparecerão aqui quando disponíveis</p>
        </div>
      )}

      {/* Quick Access Section */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <FileText className="w-6 h-6 text-blue-400" />
            <div className="text-left">
              <p className="text-white font-medium">PDFs</p>
              <p className="text-gray-400 text-sm">Documentos e apostilas</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <Video className="w-6 h-6 text-green-400" />
            <div className="text-left">
              <p className="text-white font-medium">Vídeos</p>
              <p className="text-gray-400 text-sm">Conteúdo extra</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <Link className="w-6 h-6 text-purple-400" />
            <div className="text-left">
              <p className="text-white font-medium">Links</p>
              <p className="text-gray-400 text-sm">Recursos externos</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resources;