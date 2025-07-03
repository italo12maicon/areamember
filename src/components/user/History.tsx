import React, { useState } from 'react';
import { History as HistoryIcon, Play, Calendar, Clock, Search, Filter, Package, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const History: React.FC = () => {
  const { user } = useAuth();
  const { courses, products, watchHistory } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');

  // Get user's watch history
  const userHistory = watchHistory.filter(history => history.userId === user?.id);

  // Filter history based on search and period
  const filteredHistory = userHistory.filter(history => {
    const content = history.courseId 
      ? courses.find(c => c.id === history.courseId)
      : products.find(p => p.id === history.productId);
    
    if (!content) return false;

    // Search filter
    if (searchTerm && !content.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Period filter
    if (filterPeriod !== 'all') {
      const historyDate = new Date(history.lastWatchedAt);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - historyDate.getTime()) / (1000 * 60 * 60 * 24));

      switch (filterPeriod) {
        case 'today':
          if (diffInDays > 0) return false;
          break;
        case 'week':
          if (diffInDays > 7) return false;
          break;
        case 'month':
          if (diffInDays > 30) return false;
          break;
      }
    }

    return true;
  });

  // Sort by most recent
  const sortedHistory = filteredHistory.sort((a, b) => 
    new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Há poucos minutos';
    if (diffInHours < 24) return `Há ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `Há ${diffInDays} dias`;
    
    return date.toLocaleDateString();
  };

  const getWatchProgress = (history: any) => {
    const content = history.courseId 
      ? courses.find(c => c.id === history.courseId)
      : products.find(p => p.id === history.productId);
    
    if (!content) return 0;
    
    const completedLessons = history.completedLessons?.length || 0;
    const totalLessons = content.lessons.length;
    
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  };

  const getTotalWatchTime = () => {
    return userHistory.reduce((total, history) => total + (history.watchTimeMinutes || 0), 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Histórico</h1>
        <p className="text-gray-400">Seu histórico de visualizações e progresso</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{userHistory.length}</p>
              <p className="text-gray-400 text-sm">Conteúdos Assistidos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{Math.floor(getTotalWatchTime() / 60)}h</p>
              <p className="text-gray-400 text-sm">Tempo Total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Play className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {userHistory.reduce((total, h) => total + (h.completedLessons?.length || 0), 0)}
              </p>
              <p className="text-gray-400 text-sm">Aulas Concluídas</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {userHistory.length > 0 ? 
                  Math.floor((Date.now() - new Date(userHistory[0].firstWatchedAt || userHistory[0].lastWatchedAt).getTime()) / (1000 * 60 * 60 * 24))
                  : 0
                }
              </p>
              <p className="text-gray-400 text-sm">Dias de Atividade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar no histórico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Todos os períodos</option>
              <option value="today">Hoje</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mês</option>
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      {sortedHistory.length > 0 ? (
        <div className="space-y-4">
          {sortedHistory.map((history) => {
            const content = history.courseId 
              ? courses.find(c => c.id === history.courseId)
              : products.find(p => p.id === history.productId);
            
            if (!content) return null;

            const isProduct = !!history.productId;
            const progress = getWatchProgress(history);
            const lastLesson = content.lessons.find(l => l.id === history.lastLessonId);

            return (
              <div key={`${history.courseId || history.productId}-${history.lastWatchedAt}`} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img
                      src={content.imageUrl || 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=100&h=100'}
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Type Badge */}
                    <div className="absolute top-1 left-1">
                      <span className={`px-1 py-0.5 rounded text-xs font-medium text-white ${
                        isProduct ? 'bg-purple-600' : 'bg-blue-600'
                      }`}>
                        {isProduct ? 'PRODUTO' : 'CURSO'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isProduct ? <Package className="w-4 h-4 text-purple-400" /> : <BookOpen className="w-4 h-4 text-blue-400" />}
                      <h3 className="text-lg font-bold text-white line-clamp-1">{content.title}</h3>
                    </div>
                    
                    {lastLesson && (
                      <p className="text-gray-400 text-sm mb-2">
                        Última aula: {lastLesson.title}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                      <span>{formatDate(history.lastWatchedAt)}</span>
                      <span>{history.watchTimeMinutes || 0} min assistidos</span>
                      <span>{Math.round(progress)}% concluído</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isProduct ? 'bg-purple-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${
                      isProduct 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}>
                      Continuar
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Detalhes
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
            <HistoryIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || filterPeriod !== 'all' ? 'Nenhum resultado encontrado' : 'Nenhum histórico ainda'}
          </h3>
          <p className="text-gray-400 mb-4">
            {searchTerm || filterPeriod !== 'all' 
              ? 'Tente ajustar os filtros de busca'
              : 'Comece a assistir conteúdos para ver seu histórico aqui'
            }
          </p>
          {!searchTerm && filterPeriod === 'all' && (
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Explorar Conteúdos
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default History;