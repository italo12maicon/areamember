import React from 'react';
import { Play, Lock, Calendar, ExternalLink, Heart } from 'lucide-react';
import { Product, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface ProductCardProps {
  product: Product;
  user: User;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, user, onClick }) => {
  const { favorites, addFavorite, removeFavorite } = useData();
  const isLocked = product.isBlocked && !user.unlockedProducts?.includes(product.id);
  const canUnlockAfterDays = product.unlockAfterDays && !product.manualUnlockOnly;
  
  const daysSinceRegistration = Math.floor(
    (Date.now() - new Date(user.registrationDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const canUnlock = canUnlockAfterDays && daysSinceRegistration >= (product.unlockAfterDays || 0);
  const shouldShowLocked = isLocked && !canUnlock;

  const isFavorited = favorites.some(fav => fav.userId === user.id && fav.productId === product.id);

  const handleCardClick = () => {
    if (shouldShowLocked && product.unblockLink) {
      window.open(product.unblockLink, '_blank');
    } else if (!shouldShowLocked) {
      onClick();
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isFavorited) {
      removeFavorite(user.id, undefined, product.id);
    } else {
      addFavorite(user.id, undefined, product.id);
    }
  };

  const getDaysRemaining = () => {
    if (!canUnlockAfterDays) return null;
    const daysRemaining = (product.unlockAfterDays || 0) - daysSinceRegistration;
    return Math.max(0, daysRemaining);
  };

  return (
    <div className="group relative">
      <div 
        className="relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        onClick={handleCardClick}
      >
        {/* Product Image */}
        <img
          src={product.imageUrl || 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=400&h=711'}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Product Badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
            PRODUTO
          </span>
        </div>
        
        {/* Favorite Button - Only show for unlocked products */}
        {!shouldShowLocked && (
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2 right-2 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all transform hover:scale-110 z-10 ${
              isFavorited 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'bg-black/60 text-gray-300 hover:bg-red-600 hover:text-white backdrop-blur-sm'
            }`}
          >
            <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        )}
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-4">
          <h3 className="text-white text-sm md:text-lg font-bold mb-1 md:mb-2 line-clamp-2">{product.title}</h3>
          <p className="text-gray-300 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2 md:line-clamp-3">{product.description}</p>
          
          {shouldShowLocked ? (
            <div className="flex items-center gap-1 md:gap-2">
              <Lock className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {canUnlockAfterDays ? (
                  <div className="flex items-center gap-1 md:gap-2 text-yellow-400 text-xs md:text-sm">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="truncate">Desbloqueado em {getDaysRemaining()} dias</span>
                  </div>
                ) : (
                  <span className="text-red-400 text-xs md:text-sm">Produto Bloqueado</span>
                )}
                {product.unblockLink && (
                  <div className="flex items-center gap-1 text-blue-400 text-xs mt-1">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">Clique para desbloquear</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 md:gap-2 text-green-400">
              <Play className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium">Acessar Agora</span>
            </div>
          )}
        </div>

        {/* Play Button Overlay */}
        {!shouldShowLocked && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-4 h-4 md:w-6 md:h-6 text-white ml-1" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Lock Overlay */}
        {shouldShowLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center px-2">
              <Lock className="w-8 h-8 md:w-12 md:h-12 text-red-400 mx-auto mb-2" />
              <p className="text-white text-xs md:text-sm font-medium">Produto Bloqueado</p>
              {product.unblockLink && (
                <p className="text-blue-400 text-xs mt-1">Clique para desbloquear</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;