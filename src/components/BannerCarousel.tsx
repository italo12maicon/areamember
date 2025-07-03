import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const BannerCarousel: React.FC = () => {
  const { banners } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get active banners sorted by order
  const activeBanners = banners
    .filter(banner => banner.isActive)
    .sort((a, b) => a.order - b.order);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === activeBanners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [activeBanners.length]);

  // Reset index if it's out of bounds
  useEffect(() => {
    if (currentIndex >= activeBanners.length) {
      setCurrentIndex(0);
    }
  }, [activeBanners.length, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? activeBanners.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === activeBanners.length - 1 ? 0 : currentIndex + 1);
  };

  const handleBannerClick = (banner: any) => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Don't render if no active banners
  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full mb-8">
      <div className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700">
        {/* Banner Container */}
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {activeBanners.map((banner) => (
            <div
              key={banner.id}
              className="w-full flex-shrink-0 cursor-pointer group"
              onClick={() => handleBannerClick(banner)}
            >
              <div className="relative">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ aspectRatio: '1180/340' }}
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-lg">
                    <span className="text-sm font-medium">Clique para acessar</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Only show if more than 1 banner */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots Indicator - Only show if more than 1 banner */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-white scale-110' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Banner Title */}
      {activeBanners[currentIndex] && (
        <div className="mt-2 text-center">
          <p className="text-gray-400 text-sm">{activeBanners[currentIndex].title}</p>
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;