import React, { useState } from 'react';
import { Plus, Edit, Trash2, Image, ExternalLink, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Banner } from '../../types';

const BannerManagement: React.FC = () => {
  const { banners, addBanner, updateBanner, deleteBanner } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBanner) {
      updateBanner(editingBanner.id, formData);
    } else {
      const newBanner: Banner = {
        id: Date.now().toString(),
        title: formData.title,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
        isActive: formData.isActive,
        order: banners.length + 1,
        createdAt: new Date().toISOString(),
      };
      addBanner(newBanner);
    }
    
    setFormData({
      title: '',
      imageUrl: '',
      linkUrl: '',
      isActive: true,
    });
    setEditingBanner(null);
    setIsFormOpen(false);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      isActive: banner.isActive,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (bannerId: string) => {
    if (confirm('Tem certeza que deseja excluir este banner?')) {
      deleteBanner(bannerId);
    }
  };

  const toggleActive = (bannerId: string, isActive: boolean) => {
    updateBanner(bannerId, { isActive: !isActive });
  };

  const moveOrder = (bannerId: string, direction: 'up' | 'down') => {
    const sortedBanners = [...banners].sort((a, b) => a.order - b.order);
    const currentIndex = sortedBanners.findIndex(b => b.id === bannerId);
    
    if (direction === 'up' && currentIndex > 0) {
      const temp = sortedBanners[currentIndex].order;
      updateBanner(sortedBanners[currentIndex].id, { order: sortedBanners[currentIndex - 1].order });
      updateBanner(sortedBanners[currentIndex - 1].id, { order: temp });
    } else if (direction === 'down' && currentIndex < sortedBanners.length - 1) {
      const temp = sortedBanners[currentIndex].order;
      updateBanner(sortedBanners[currentIndex].id, { order: sortedBanners[currentIndex + 1].order });
      updateBanner(sortedBanners[currentIndex + 1].id, { order: temp });
    }
  };

  const activeBanners = banners.filter(b => b.isActive);
  const sortedBanners = [...banners].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gerenciamento de Banners</h2>
          <p className="text-gray-400">Gerencie os banners do carrossel da área de membros (1180x340px)</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          disabled={banners.length >= 5}
        >
          <Plus className="w-5 h-5" />
          Novo Banner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Image className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{banners.length}</p>
              <p className="text-gray-400 text-sm">Total de Banners</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{activeBanners.length}</p>
              <p className="text-gray-400 text-sm">Banners Ativos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <EyeOff className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">{banners.length - activeBanners.length}</p>
              <p className="text-gray-400 text-sm">Banners Inativos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <ExternalLink className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">{5 - banners.length}</p>
              <p className="text-gray-400 text-sm">Slots Disponíveis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Banner List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            Banners Cadastrados ({banners.length}/5)
          </h3>
        </div>
        
        <div className="p-6">
          {sortedBanners.length > 0 ? (
            <div className="space-y-4">
              {sortedBanners.map((banner, index) => (
                <div key={banner.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                      {banner.imageUrl ? (
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium">{banner.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          banner.isActive 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          {banner.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          Ordem: {banner.order}
                        </span>
                      </div>
                      
                      <div className="text-gray-400 text-sm mb-2">
                        <div className="flex items-center gap-1 mb-1">
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate">{banner.linkUrl}</span>
                        </div>
                        <span>Criado em: {new Date(banner.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveOrder(banner.id, 'up')}
                          disabled={index === 0}
                          className="p-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveOrder(banner.id, 'down')}
                          disabled={index === sortedBanners.length - 1}
                          className="p-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => toggleActive(banner.id, banner.isActive)}
                        className={`p-2 rounded transition-colors ${
                          banner.isActive 
                            ? 'bg-yellow-600 hover:bg-yellow-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                      >
                        {banner.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => handleEdit(banner)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum banner cadastrado</h3>
              <p className="text-gray-400 mb-4">Crie banners para o carrossel da área de membros</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Criar Primeiro Banner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Banner Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white">
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título do Banner *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Digite o título do banner"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL da Imagem (1180x340px) *
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="https://exemplo.com/banner.jpg"
                  required
                />
                <p className="text-gray-400 text-sm mt-1">
                  Recomendado: 1180x340 pixels para melhor qualidade
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de Destino *
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="https://exemplo.com/destino"
                  required
                />
                <p className="text-gray-400 text-sm mt-1">
                  Link para onde o usuário será direcionado ao clicar no banner
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                />
                <label htmlFor="isActive" className="text-gray-300">
                  Banner ativo (visível no carrossel)
                </label>
              </div>

              {/* Preview */}
              {formData.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preview
                  </label>
                  <div className="w-full max-w-md mx-auto">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-auto rounded-lg border border-gray-600"
                      style={{ aspectRatio: '1180/340' }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingBanner(null);
                    setFormData({
                      title: '',
                      imageUrl: '',
                      linkUrl: '',
                      isActive: true,
                    });
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingBanner ? 'Atualizar' : 'Criar'} Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;