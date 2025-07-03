import React from 'react';
import { Play, Clock, BookOpen, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface ContinueWatchingProps {
  onCourseSelect?: (courseId: string) => void;
  onProductSelect?: (productId: string) => void;
}

const ContinueWatching: React.FC<ContinueWatchingProps> = ({ onCourseSelect, onProductSelect }) => {
  const { user } = useAuth();
  const { courses, products, watchHistory, addToWatchHistory } = useData();

  // Get courses that user has started watching
  const continueWatchingCourses = courses.filter(course => {
    if (!user || course.isBlocked && !user.unlockedCourses.includes(course.id)) return false;
    
    // Check if user has watch history for this course
    const hasHistory = watchHistory.some(history => 
      history.userId === user.id && history.courseId === course.id
    );
    
    return hasHistory;
  });

  // Get products that user has started watching
  const continueWatchingProducts = products.filter(product => {
    if (!user || !user.unlockedProducts || (product.isBlocked && !user.unlockedProducts.includes(product.id))) return false;
    
    // Check if user has watch history for this product
    const hasHistory = watchHistory.some(history => 
      history.userId === user.id && history.productId === product.id
    );
    
    return hasHistory;
  });

  const getLastWatchedLesson = (itemId: string, isProduct: boolean = false) => {
    const history = watchHistory.find(h => 
      h.userId === user?.id && (isProduct ? h.productId === itemId : h.courseId === itemId)
    );
    return history?.lastLessonId || null;
  };

  const getWatchProgress = (itemId: string, isProduct: boolean = false) => {
    const history = watchHistory.find(h => 
      h.userId === user?.id && (isProduct ? h.productId === itemId : h.courseId === itemId)
    );
    const item = isProduct 
      ? products.find(p => p.id === itemId)
      : courses.find(c => c.id === itemId);
    
    if (!history || !item) return 0;
    
    const completedLessons = history.completedLessons?.length || 0;
    const totalLessons = item.lessons.length;
    
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  };

  const formatLastWatched = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Há poucos minutos';
    if (diffInHours < 24) return `Há ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `Há ${diffInDays} dias`;
    
    return date.toLocaleDateString();
  };

  const handleContinueWatching = (item: any, isProduct: boolean = false) => {
    if (isProduct && onProductSelect) {
      onProductSelect(item.id);
    } else if (!isProduct && onCourseSelect) {
      onCourseSelect(item.id);
    }
    
    // Update watch history
    if (user) {
      const existingHistory = watchHistory.find(h => 
        h.userId === user.id && (isProduct ? h.productId === item.id : h.courseId === item.id)
      );
      
      if (existingHistory) {
        addToWatchHistory({
          ...existingHistory,
          lastWatchedAt: new Date().toISOString(),
        });
      }
    }
  };

  const allContinueWatching = [
    ...continueWatchingCourses.map(course => ({ ...course, type: 'course' })),
    ...continueWatchingProducts.map(product => ({ ...product, type: 'product' }))
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Continue Assistindo</h1>
        <p className="text-gray-400">Retome seus conteúdos de onde parou</p>
      </div>

      {allContinueWatching.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allContinueWatching.map((item) => {
            const isProduct = item.type === 'product';
            const progress = getWatchProgress(item.id, isProduct);
            const lastWatchedLessonId = getLastWatchedLesson(item.id, isProduct);
            const lastWatchedLesson = item.lessons.find((l: any) => l.id === lastWatchedLessonId);
            const history = watchHistory.find(h => 
              h.userId === user?.id && (isProduct ? h.productId === item.id : h.courseId === item.id)
            );

            return (
              <div key={`${item.type}-${item.id}`} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all group">
                <div className="aspect-video bg-gray-700 relative overflow-hidden">
                  <img
                    src={item.imageUrl || 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=400&h=300'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                      isProduct ? 'bg-purple-600' : 'bg-blue-600'
                    }`}>
                      {isProduct ? 'PRODUTO' : 'CURSO'}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900/50">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        isProduct ? 'bg-purple-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform ${
                      isProduct ? 'bg-purple-600' : 'bg-red-600'
                    }`}>
                      <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
                  
                  {lastWatchedLesson && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      {isProduct ? <Package className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      <span>Última aula: {lastWatchedLesson.title}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                    <Clock className="w-4 h-4" />
                    <span>{history ? formatLastWatched(history.lastWatchedAt) : 'Nunca assistido'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      {Math.round(progress)}% concluído
                    </div>
                    <button 
                      onClick={() => handleContinueWatching(item, isProduct)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${
                        isProduct 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum conteúdo em andamento</h3>
          <p className="text-gray-400 mb-4">Comece a assistir um curso ou produto para vê-lo aqui</p>
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Explorar Conteúdos
          </button>
        </div>
      )}
    </div>
  );
};

export default ContinueWatching;