import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, Play, List } from 'lucide-react';
import { Topic, Lesson } from '../types';

interface TopicPlayerProps {
  topic: Topic;
  contentTitle: string;
  contentType: 'course' | 'product';
  onBack: () => void;
}

const TopicPlayer: React.FC<TopicPlayerProps> = ({ topic, contentTitle, contentType, onBack }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(topic.lessons[0]);

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

  if (!selectedLesson) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Nenhuma aula disponível neste tópico</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-gray-800 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                contentType === 'product' ? 'bg-purple-600' : 'bg-blue-600'
              }`}>
                {contentType === 'product' ? 'PRODUTO' : 'CURSO'}
              </span>
              <span className="text-gray-400">•</span>
              <h1 className="text-xl font-bold">{contentTitle}</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <List className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Tópico: {topic.title}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400 text-sm">{selectedLesson.title}</span>
            </div>
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
            <h2 className="text-lg font-semibold mb-2">{topic.title}</h2>
            <p className="text-sm text-gray-400 mb-2">{topic.description}</p>
            <p className="text-sm text-gray-400">{topic.lessons.length} aulas</p>
          </div>

          <div className="p-4 space-y-3">
            {topic.lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedLesson.id === lesson.id
                    ? contentType === 'product' ? 'bg-purple-600 text-white' : 'bg-red-600 text-white'
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

export default TopicPlayer;