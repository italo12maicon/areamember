import React from 'react';
import { Heart, Play, Star, Calendar, Package, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface FavoritesProps {
  onCourseSelect?: (courseId: string) => void;
  onProductSelect?: (productId: string) => void;
}

const Favorites: React.FC<FavoritesProps> = ({ onCourseSelect, onProductSelect }) => {
  const { user } = useAuth();
  const { courses, products, favorites, removeFavorite } = useData();

  // Get user's favorite courses and products
  const userFavorites = favorites.filter(fav => fav.userId === user?.id);
  const favoriteCourses = courses.filter(course => 
    userFavorites.some(fav => fav.courseId === course.id)
  );
  const favoriteProducts = products.filter(product => 
    userFavorites.some(fav => fav.productId === product.id)
  );

  const handleRemoveFavorite = (courseId?: string, productId?: string) => {
    if (user) {
      removeFavorite(user.id, courseId, productId);
    }
  };

  const handleContentClick = (id: string, isProduct: boolean) => {
    if (isProduct && onProductSelect) {
      onProductSelect(id);
    } else if (!isProduct && onCourseSelect) {
      onCourseSelect(id);
    }
  };

  const getFavoriteDate = (courseId?: string, productId?: string) => {
    const favorite = userFavorites.find(fav => 
      (courseId && fav.courseId === courseId) || (productId && fav.productId === productId)
    );
    return favorite ? new Date(favorite.addedAt).toLocaleDateString() : '';
  };

  const allFavorites = [
    ...favoriteCourses.map(course => ({ ...course, type: 'course' })),
    ...favoriteProducts.map(product => ({ ...product, type: 'product' }))
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Favoritos</h1>
        <p className="text-gray-400">Seus conteúdos favoritos</p>
      </div>

      {allFavorites.length > 0 ? (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{allFavorites.length}</p>
                  <p className="text-gray-400 text-sm">Total Favoritos</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{favoriteCourses.length}</p>
                  <p className="text-gray-400 text-sm">Cursos Favoritos</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{favoriteProducts.length}</p>
                  <p className="text-gray-400 text-sm">Produtos Favoritos</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {allFavorites.reduce((acc, item) => acc + item.lessons.length, 0)}
                  </p>
                  <p className="text-gray-400 text-sm">Aulas Disponíveis</p>
                </div>
              </div>
            </div>
          </div>

          {/* Favorite Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allFavorites.map((item) => {
              const isProduct = item.type === 'product';
              return (
                <div key={`${item.type}-${item.id}`} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all group">
                  <div 
                    className="aspect-video bg-gray-700 relative overflow-hidden cursor-pointer"
                    onClick={() => handleContentClick(item.id, isProduct)}
                  >
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
                    
                    {/* Favorite Badge */}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(isProduct ? undefined : item.id, isProduct ? item.id : undefined);
                        }}
                        className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Heart className="w-4 h-4 text-white" fill="currentColor" />
                      </button>
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
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                      <span>{item.lessons.length} aulas</span>
                      <span>Favoritado em {getFavoriteDate(isProduct ? undefined : item.id, isProduct ? item.id : undefined)}</span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleContentClick(item.id, isProduct)}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${
                          isProduct 
                            ? 'bg-purple-600 hover:bg-purple-700' 
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        Assistir
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(isProduct ? undefined : item.id, isProduct ? item.id : undefined)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum favorito ainda</h3>
          <p className="text-gray-400 mb-4">Adicione conteúdos aos favoritos para vê-los aqui</p>
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Explorar Conteúdos
          </button>
        </div>
      )}

      {/* Quick Actions */}
      {allFavorites.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => {
                const randomItem = allFavorites[Math.floor(Math.random() * allFavorites.length)];
                handleContentClick(randomItem.id, randomItem.type === 'product');
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Assistir Aleatório
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Criar Playlist
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Compartilhar Lista
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;