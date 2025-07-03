import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, Play, List, Grid } from 'lucide-react';
import { Product, Lesson, Topic } from '../types';
import TopicPlayer from './TopicPlayer';

interface ProductPlayerProps {
  product: Product;
  onBack: () => void;
}

const ProductPlayer: React.FC<ProductPlayerProps> = ({ product, onBack }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(
    product.topics && product.topics.length > 0 ? null : product.lessons[0]
  );
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [viewMode, setViewMode] = useState<'topics' | 'lessons'>(
    product.topics && product.topics.length > 0 ? 'topics' : 'lessons'
  );

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0&showinfo=0`;
    }
    
    return url;
  };

  const getYouTubeThumbnail = (url: string) => {
    if (!url) return '';
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
    }
    
    return '';
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
  };

  const handleBackFromTopic = () => {
    setSelectedTopic(null);
  };

  // Se um tópico está selecionado, mostrar o TopicPlayer
  if (selectedTopic) {
    return (
      <TopicPlayer
        topic={selectedTopic}
        contentTitle={product.title}
        contentType="product"
        onBack={handleBackFromTopic}
      />
    );
  }

  // Se está no modo tópicos e há tópicos disponíveis
  if (viewMode === 'topics' && product.topics && product.topics.length > 0) {
    const activeTopics = product.topics.filter(topic => topic.isActive).sort((a, b) => a.order - b.order);

    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-xl border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                    PRODUTO
                  </span>
                  <h1 className="text-xl font-bold">{product.title}</h1>
                </div>
                <p className="text-gray-400 text-sm">Selecione um tópico para começar</p>
              </div>
            </div>

            {/* Toggle View Mode */}
            <div className="flex items-center gap-2">
              {product.lessons.length > 0 && (
                <button
                  onClick={() => {
                    setViewMode('lessons');
                    setSelectedLesson(product.lessons[0]);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                  <List className="w-4 h-4" />
                  Ver Aulas Diretas
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all cursor-pointer group"
                onClick={() => handleTopicSelect(topic)}
              >
                <div className="aspect-video bg-gray-700 relative overflow-hidden">
                  <img
                    src={topic.imageUrl || 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=400&h=300'}
                    alt={topic.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{topic.title}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{topic.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{topic.lessons.length} aulas</span>
                    <span className="text-purple-400">Assistir Tópico</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activeTopics.length === 0 && (
            <div className="text-center py-12">
              <Grid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum tópico ativo</h3>
              <p className="text-gray-400">Os tópicos aparecerão aqui quando estiverem disponíveis</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Modo tradicional de aulas
  if (!selectedLesson) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Nenhuma aula disponível</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                  PRODUTO
                </span>
                <h1 className="text-xl font-bold">{product.title}</h1>
              </div>
              <p className="text-gray-400 text-sm">{selectedLesson.title}</p>
            </div>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-2">
            {product.topics && product.topics.length > 0 && (
              <button
                onClick={() => setViewMode('topics')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                <Grid className="w-4 h-4" />
                Ver Tópicos
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Video Player */}
        <div className="flex-1 bg-black">
          {selectedLesson.youtubeUrl ? (
            <iframe
              src={getYouTubeEmbedUrl(selectedLesson.youtubeUrl)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum vídeo configurado</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar with lessons */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold mb-2">Aulas do Produto</h2>
            <p className="text-sm text-gray-400">{product.lessons.length} aulas</p>
          </div>

          <div className="p-4 space-y-3">
            {product.lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedLesson.id === lesson.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                onClick={() => setSelectedLesson(lesson)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2">{lesson.title}</h3>
                    {lesson.description && (
                      <p className="text-xs opacity-75 mt-1 line-clamp-2">{lesson.description}</p>
                    )}
                    
                    {/* Thumbnail personalizada ou do YouTube */}
                    {(lesson.thumbnailUrl || lesson.youtubeUrl) && (
                      <div className="mt-2">
                        <img
                          src={lesson.thumbnailUrl || getYouTubeThumbnail(lesson.youtubeUrl)}
                          alt={lesson.title}
                          className="w-full h-16 object-cover rounded"
                          onError={(e) => {
                            // Se a thumbnail falhar, esconder a imagem
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Description and Links */}
      {(selectedLesson.description || selectedLesson.additionalLink || (selectedLesson.additionalLinks && selectedLesson.additionalLinks.length > 0)) && (
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="max-w-4xl">
            {selectedLesson.description && (
              <>
                <h3 className="text-lg font-semibold mb-2">Sobre esta aula</h3>
                <p className="text-gray-300 mb-4">{selectedLesson.description}</p>
              </>
            )}
            
            {/* Links Adicionais */}
            {((selectedLesson.additionalLinks && selectedLesson.additionalLinks.length > 0) || selectedLesson.additionalLink) && (
              <div className="space-y-3">
                <h4 className="text-md font-semibold text-white">Links Adicionais</h4>
                
                {/* Link único (compatibilidade) */}
                {selectedLesson.additionalLink && (
                  <a
                    href={selectedLesson.additionalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors bg-gray-700 px-3 py-2 rounded-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Link adicional
                  </a>
                )}

                {/* Múltiplos links */}
                {selectedLesson.additionalLinks && selectedLesson.additionalLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedLesson.additionalLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors bg-gray-700 px-3 py-2 rounded-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {link.title || 'Link adicional'}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPlayer;