import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Calendar, Link, Grid, List, Image } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Product, Lesson, AdditionalLink, Topic } from '../../types';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const { addProduct, updateProduct } = useData();
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    imageUrl: product?.imageUrl || '',
    isBlocked: product?.isBlocked || false,
    unlockAfterDays: product?.unlockAfterDays || '',
    manualUnlockOnly: product?.manualUnlockOnly || false,
    unblockLink: product?.unblockLink || '',
    scheduledUnlockDate: product?.scheduledUnlockDate || '',
  });
  
  const [lessons, setLessons] = useState<Lesson[]>(
    product?.lessons || [{ 
      id: Date.now().toString(), 
      title: '', 
      description: '', 
      youtubeUrl: '', 
      thumbnailUrl: '',
      additionalLink: '',
      additionalLinks: []
    }]
  );

  const [topics, setTopics] = useState<Topic[]>(
    product?.topics || []
  );

  const [activeTab, setActiveTab] = useState<'lessons' | 'topics'>('lessons');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: Product = {
      id: product?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl,
      isBlocked: formData.isBlocked,
      unlockAfterDays: formData.unlockAfterDays ? Number(formData.unlockAfterDays) : undefined,
      manualUnlockOnly: formData.manualUnlockOnly,
      unblockLink: formData.unblockLink,
      scheduledUnlockDate: formData.scheduledUnlockDate || undefined,
      lessons: lessons.filter(lesson => lesson.title.trim() !== ''),
      topics: topics.filter(topic => topic.title.trim() !== ''),
    };

    if (product) {
      updateProduct(product.id, productData);
    } else {
      addProduct(productData);
    }
    
    onClose();
  };

  const addLesson = () => {
    setLessons([...lessons, { 
      id: Date.now().toString(), 
      title: '', 
      description: '', 
      youtubeUrl: '', 
      thumbnailUrl: '',
      additionalLink: '',
      additionalLinks: []
    }]);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const updateLesson = (index: number, field: keyof Lesson, value: string) => {
    setLessons(lessons.map((lesson, i) => 
      i === index ? { ...lesson, [field]: value } : lesson
    ));
  };

  const addTopic = () => {
    setTopics([...topics, {
      id: Date.now().toString(),
      title: '',
      description: '',
      imageUrl: '',
      isActive: true,
      order: topics.length + 1,
      lessons: [{
        id: Date.now().toString() + '-lesson',
        title: '',
        description: '',
        youtubeUrl: '',
        thumbnailUrl: '',
        additionalLink: '',
        additionalLinks: []
      }],
      createdAt: new Date().toISOString()
    }]);
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const updateTopic = (index: number, field: keyof Topic, value: any) => {
    setTopics(topics.map((topic, i) => 
      i === index ? { ...topic, [field]: value } : topic
    ));
  };

  const addTopicLesson = (topicIndex: number) => {
    const newTopics = [...topics];
    newTopics[topicIndex].lessons.push({
      id: Date.now().toString(),
      title: '',
      description: '',
      youtubeUrl: '',
      thumbnailUrl: '',
      additionalLink: '',
      additionalLinks: []
    });
    setTopics(newTopics);
  };

  const removeTopicLesson = (topicIndex: number, lessonIndex: number) => {
    const newTopics = [...topics];
    newTopics[topicIndex].lessons = newTopics[topicIndex].lessons.filter((_, i) => i !== lessonIndex);
    setTopics(newTopics);
  };

  const updateTopicLesson = (topicIndex: number, lessonIndex: number, field: keyof Lesson, value: string) => {
    const newTopics = [...topics];
    newTopics[topicIndex].lessons[lessonIndex] = {
      ...newTopics[topicIndex].lessons[lessonIndex],
      [field]: value
    };
    setTopics(newTopics);
  };

  const addAdditionalLink = (index: number, isTopicLesson: boolean = false, topicIndex?: number) => {
    const newLink: AdditionalLink = {
      id: Date.now().toString(),
      title: '',
      url: ''
    };
    
    if (isTopicLesson && topicIndex !== undefined) {
      const newTopics = [...topics];
      newTopics[topicIndex].lessons[index].additionalLinks = [
        ...(newTopics[topicIndex].lessons[index].additionalLinks || []),
        newLink
      ];
      setTopics(newTopics);
    } else {
      setLessons(lessons.map((lesson, i) => 
        i === index ? { 
          ...lesson, 
          additionalLinks: [...(lesson.additionalLinks || []), newLink]
        } : lesson
      ));
    }
  };

  const removeAdditionalLink = (index: number, linkId: string, isTopicLesson: boolean = false, topicIndex?: number) => {
    if (isTopicLesson && topicIndex !== undefined) {
      const newTopics = [...topics];
      newTopics[topicIndex].lessons[index].additionalLinks = 
        (newTopics[topicIndex].lessons[index].additionalLinks || []).filter(link => link.id !== linkId);
      setTopics(newTopics);
    } else {
      setLessons(lessons.map((lesson, i) => 
        i === index ? { 
          ...lesson, 
          additionalLinks: (lesson.additionalLinks || []).filter(link => link.id !== linkId)
        } : lesson
      ));
    }
  };

  const updateAdditionalLink = (index: number, linkId: string, field: keyof AdditionalLink, value: string, isTopicLesson: boolean = false, topicIndex?: number) => {
    if (isTopicLesson && topicIndex !== undefined) {
      const newTopics = [...topics];
      newTopics[topicIndex].lessons[index].additionalLinks = 
        (newTopics[topicIndex].lessons[index].additionalLinks || []).map(link => 
          link.id === linkId ? { ...link, [field]: value } : link
        );
      setTopics(newTopics);
    } else {
      setLessons(lessons.map((lesson, i) => 
        i === index ? { 
          ...lesson, 
          additionalLinks: (lesson.additionalLinks || []).map(link => 
            link.id === linkId ? { ...link, [field]: value } : link
          )
        } : lesson
      ));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {product ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Informações Básicas</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título do Produto *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Digite o título do produto"
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
                placeholder="Descreva o produto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL da Imagem (1080x1920)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>

          {/* Block Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Configurações de Bloqueio</h3>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isBlocked"
                checked={formData.isBlocked}
                onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
                className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
              />
              <label htmlFor="isBlocked" className="text-gray-300">
                Produto bloqueado
              </label>
            </div>

            {formData.isBlocked && (
              <>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="manualUnlockOnly"
                    checked={formData.manualUnlockOnly}
                    onChange={(e) => setFormData({ ...formData, manualUnlockOnly: e.target.checked })}
                    className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                  />
                  <label htmlFor="manualUnlockOnly" className="text-gray-300">
                    Desbloqueio apenas manual
                  </label>
                </div>

                {!formData.manualUnlockOnly && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Desbloquear após (dias)
                      </label>
                      <input
                        type="number"
                        value={formData.unlockAfterDays}
                        onChange={(e) => setFormData({ ...formData, unlockAfterDays: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Ex: 7"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Data de Desbloqueio (Opcional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduledUnlockDate}
                        onChange={(e) => setFormData({ ...formData, scheduledUnlockDate: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-gray-400 text-xs mt-1">
                        Se definido, o produto será desbloqueado automaticamente nesta data
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link de Desbloqueio
                  </label>
                  <input
                    type="url"
                    value={formData.unblockLink}
                    onChange={(e) => setFormData({ ...formData, unblockLink: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://exemplo.com/desbloquear"
                  />
                </div>
              </>
            )}
          </div>

          {/* Content Tabs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Conteúdo do Produto</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('lessons')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'lessons'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Aulas Diretas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('topics')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'topics'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  Tópicos
                </button>
              </div>
            </div>

            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-semibold text-white">Aulas Diretas</h4>
                  <button
                    type="button"
                    onClick={addLesson}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Aula
                  </button>
                </div>

                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-white font-medium">Aula {index + 1}</h5>
                      {lessons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLesson(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Título da Aula *
                        </label>
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Digite o título da aula"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          URL do YouTube
                        </label>
                        <input
                          type="url"
                          value={lesson.youtubeUrl}
                          onChange={(e) => updateLesson(index, 'youtubeUrl', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        <Image className="w-4 h-4 inline mr-1" />
                        URL da Thumbnail Personalizada (Opcional)
                      </label>
                      <input
                        type="url"
                        value={lesson.thumbnailUrl || ''}
                        onChange={(e) => updateLesson(index, 'thumbnailUrl', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="https://exemplo.com/thumbnail.jpg"
                      />
                      <p className="text-gray-400 text-xs mt-1">
                        Se não fornecida, será usada a thumbnail automática do YouTube
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Descrição da Aula
                      </label>
                      <textarea
                        value={lesson.description}
                        onChange={(e) => updateLesson(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 h-20"
                        placeholder="Descreva o conteúdo da aula"
                      />
                    </div>

                    {/* Links Adicionais */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-300">
                          Links Adicionais
                        </label>
                        <button
                          type="button"
                          onClick={() => addAdditionalLink(index)}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Adicionar Link
                        </button>
                      </div>

                      {/* Múltiplos links */}
                      {(lesson.additionalLinks || []).map((link) => (
                        <div key={link.id} className="bg-gray-600 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-300">Link Adicional</span>
                            <button
                              type="button"
                              onClick={() => removeAdditionalLink(index, link.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-300 mb-1">
                                Título do Link *
                              </label>
                              <input
                                type="text"
                                value={link.title}
                                onChange={(e) => updateAdditionalLink(index, link.id, 'title', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Ex: Material de Apoio"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-300 mb-1">
                                URL do Link *
                              </label>
                              <input
                                type="url"
                                value={link.url}
                                onChange={(e) => updateAdditionalLink(index, link.id, 'url', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="https://exemplo.com/material"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Topics Tab */}
            {activeTab === 'topics' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-semibold text-white">Tópicos do Produto</h4>
                  <button
                    type="button"
                    onClick={addTopic}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Tópico
                  </button>
                </div>

                {topics.map((topic, topicIndex) => (
                  <div key={topic.id} className="bg-gray-700 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-white font-medium">Tópico {topicIndex + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeTopic(topicIndex)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Título do Tópico *
                        </label>
                        <input
                          type="text"
                          value={topic.title}
                          onChange={(e) => updateTopic(topicIndex, 'title', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Digite o título do tópico"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          URL da Imagem do Tópico
                        </label>
                        <input
                          type="url"
                          value={topic.imageUrl}
                          onChange={(e) => updateTopic(topicIndex, 'imageUrl', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="https://exemplo.com/topico.jpg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Descrição do Tópico
                      </label>
                      <textarea
                        value={topic.description}
                        onChange={(e) => updateTopic(topicIndex, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 h-20"
                        placeholder="Descreva o tópico"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`topic-active-${topicIndex}`}
                        checked={topic.isActive}
                        onChange={(e) => updateTopic(topicIndex, 'isActive', e.target.checked)}
                        className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                      />
                      <label htmlFor={`topic-active-${topicIndex}`} className="text-gray-300">
                        Tópico ativo
                      </label>
                    </div>

                    {/* Aulas do Tópico */}
                    <div className="space-y-3 border-t border-gray-600 pt-4">
                      <div className="flex items-center justify-between">
                        <h6 className="text-white font-medium">Aulas do Tópico</h6>
                        <button
                          type="button"
                          onClick={() => addTopicLesson(topicIndex)}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Adicionar Aula
                        </button>
                      </div>

                      {topic.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="bg-gray-600 rounded p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-300">Aula {lessonIndex + 1}</span>
                            {topic.lessons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTopicLesson(topicIndex, lessonIndex)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-300 mb-1">
                                Título da Aula *
                              </label>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => updateTopicLesson(topicIndex, lessonIndex, 'title', e.target.value)}
                                className="w-full px-2 py-1 bg-gray-500 border border-gray-400 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                                placeholder="Título da aula"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-300 mb-1">
                                URL do YouTube
                              </label>
                              <input
                                type="url"
                                value={lesson.youtubeUrl}
                                onChange={(e) => updateTopicLesson(topicIndex, lessonIndex, 'youtubeUrl', e.target.value)}
                                className="w-full px-2 py-1 bg-gray-500 border border-gray-400 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                                placeholder="https://youtube.com/watch?v=..."
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">
                              <Image className="w-3 h-3 inline mr-1" />
                              Thumbnail Personalizada (Opcional)
                            </label>
                            <input
                              type="url"
                              value={lesson.thumbnailUrl || ''}
                              onChange={(e) => updateTopicLesson(topicIndex, lessonIndex, 'thumbnailUrl', e.target.value)}
                              className="w-full px-2 py-1 bg-gray-500 border border-gray-400 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                              placeholder="https://exemplo.com/thumbnail.jpg"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">
                              Descrição
                            </label>
                            <textarea
                              value={lesson.description}
                              onChange={(e) => updateTopicLesson(topicIndex, lessonIndex, 'description', e.target.value)}
                              className="w-full px-2 py-1 bg-gray-500 border border-gray-400 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm h-16"
                              placeholder="Descrição da aula"
                            />
                          </div>

                          {/* Links Adicionais para aulas do tópico */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-gray-300">
                                Links Adicionais
                              </label>
                              <button
                                type="button"
                                onClick={() => addAdditionalLink(lessonIndex, true, topicIndex)}
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-1 py-0.5 rounded text-xs font-medium transition-colors"
                              >
                                <Plus className="w-2 h-2" />
                                Link
                              </button>
                            </div>

                            {(lesson.additionalLinks || []).map((link) => (
                              <div key={link.id} className="bg-gray-500 rounded p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-300">Link</span>
                                  <button
                                    type="button"
                                    onClick={() => removeAdditionalLink(lessonIndex, link.id, true, topicIndex)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                  >
                                    <Trash2 className="w-2 h-2" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                  <input
                                    type="text"
                                    value={link.title}
                                    onChange={(e) => updateAdditionalLink(lessonIndex, link.id, 'title', e.target.value, true, topicIndex)}
                                    className="w-full px-2 py-1 bg-gray-400 border border-gray-300 rounded text-white placeholder-gray-300 focus:outline-none text-xs"
                                    placeholder="Título"
                                  />
                                  <input
                                    type="url"
                                    value={link.url}
                                    onChange={(e) => updateAdditionalLink(lessonIndex, link.id, 'url', e.target.value, true, topicIndex)}
                                    className="w-full px-2 py-1 bg-gray-400 border border-gray-300 rounded text-white placeholder-gray-300 focus:outline-none text-xs"
                                    placeholder="URL"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {topics.length === 0 && (
                  <div className="text-center py-8 bg-gray-700 rounded-lg">
                    <Grid className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 mb-3">Nenhum tópico criado ainda</p>
                    <p className="text-gray-500 text-sm">
                      Tópicos permitem organizar as aulas em seções temáticas
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Save className="w-5 h-5" />
              {product ? 'Atualizar' : 'Criar'} Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;