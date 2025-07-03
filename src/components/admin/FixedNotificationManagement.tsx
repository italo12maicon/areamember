import React, { useState } from 'react';
import { Plus, Edit, Trash2, Megaphone, Calendar, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { FixedNotification } from '../../types';

const FixedNotificationManagement: React.FC = () => {
  const { fixedNotifications, addFixedNotification, updateFixedNotification, deleteFixedNotification, getActiveFixedNotifications } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<FixedNotification | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as FixedNotification['type'],
    isActive: true,
    startDate: '',
    endDate: '',
    buttonText: '',
    buttonUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNotification) {
      updateFixedNotification(editingNotification.id, formData);
    } else {
      const newNotification: FixedNotification = {
        id: Date.now().toString(),
        title: formData.title,
        message: formData.message,
        type: formData.type,
        isActive: formData.isActive,
        startDate: formData.startDate,
        endDate: formData.endDate,
        buttonText: formData.buttonText || undefined,
        buttonUrl: formData.buttonUrl || undefined,
        createdAt: new Date().toISOString(),
      };
      addFixedNotification(newNotification);
    }
    
    setFormData({
      title: '',
      message: '',
      type: 'info',
      isActive: true,
      startDate: '',
      endDate: '',
      buttonText: '',
      buttonUrl: '',
    });
    setEditingNotification(null);
    setIsFormOpen(false);
  };

  const handleEdit = (notification: FixedNotification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isActive: notification.isActive,
      startDate: notification.startDate,
      endDate: notification.endDate,
      buttonText: notification.buttonText || '',
      buttonUrl: notification.buttonUrl || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (notificationId: string) => {
    if (confirm('Tem certeza que deseja excluir esta notificação fixa?')) {
      deleteFixedNotification(notificationId);
    }
  };

  const toggleActive = (notificationId: string, isActive: boolean) => {
    updateFixedNotification(notificationId, { isActive: !isActive });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400 bg-green-900/20';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20';
      case 'error': return 'text-red-400 bg-red-900/20';
      case 'promotion': return 'text-purple-400 bg-purple-900/20';
      default: return 'text-blue-400 bg-blue-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'promotion': return '🎉';
      default: return 'ℹ️';
    }
  };

  const isNotificationActive = (notification: FixedNotification) => {
    if (!notification.isActive) return false;
    
    const now = new Date();
    const startDate = new Date(notification.startDate);
    const endDate = new Date(notification.endDate);
    
    return now >= startDate && now <= endDate;
  };

  const activeNotifications = getActiveFixedNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Notificações Fixas</h2>
          <p className="text-gray-400">Gerencie notificações que ficam fixas na área de membros por período determinado</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Notificação Fixa
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{fixedNotifications.length}</p>
              <p className="text-gray-400 text-sm">Total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{activeNotifications.length}</p>
              <p className="text-gray-400 text-sm">Ativas Agora</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {fixedNotifications.filter(n => n.type === 'promotion').length}
              </p>
              <p className="text-gray-400 text-sm">Promoções</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <ExternalLink className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {fixedNotifications.filter(n => n.buttonUrl).length}
              </p>
              <p className="text-gray-400 text-sm">Com Botão</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            Notificações Cadastradas ({fixedNotifications.length})
          </h3>
        </div>
        
        <div className="p-6">
          {fixedNotifications.length > 0 ? (
            <div className="space-y-4">
              {fixedNotifications.map((notification) => (
                <div key={notification.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white font-medium">{notification.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          isNotificationActive(notification) 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          {isNotificationActive(notification) ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{notification.message}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400 mb-3">
                        <div>
                          <span className="text-gray-300">Início:</span><br />
                          {new Date(notification.startDate).toLocaleString()}
                        </div>
                        <div>
                          <span className="text-gray-300">Fim:</span><br />
                          {new Date(notification.endDate).toLocaleString()}
                        </div>
                      </div>
                      
                      {notification.buttonText && notification.buttonUrl && (
                        <div className="flex items-center gap-2 text-sm text-blue-400 mb-3">
                          <ExternalLink className="w-4 h-4" />
                          <span>Botão: "{notification.buttonText}"</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(notification.id, notification.isActive)}
                        className={`p-2 rounded transition-colors ${
                          notification.isActive 
                            ? 'bg-yellow-600 hover:bg-yellow-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                      >
                        {notification.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => handleEdit(notification)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(notification.id)}
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
              <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma notificação fixa</h3>
              <p className="text-gray-400 mb-4">Crie notificações que ficam fixas na área de membros</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Criar Primeira Notificação
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white">
                {editingNotification ? 'Editar Notificação Fixa' : 'Nova Notificação Fixa'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Título da notificação"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mensagem *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 h-24"
                  placeholder="Conteúdo da notificação"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as FixedNotification['type'] })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="info">Informação</option>
                  <option value="success">Sucesso</option>
                  <option value="warning">Aviso</option>
                  <option value="error">Erro</option>
                  <option value="promotion">Promoção</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data/Hora de Início *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data/Hora de Fim *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-700 pt-4">
                <h4 className="text-white font-medium">Botão de Ação (Opcional)</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: Ver Promoção"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL do Botão
                  </label>
                  <input
                    type="url"
                    value={formData.buttonUrl}
                    onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://exemplo.com/promocao"
                  />
                </div>
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
                  Notificação ativa
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingNotification(null);
                    setFormData({
                      title: '',
                      message: '',
                      type: 'info',
                      isActive: true,
                      startDate: '',
                      endDate: '',
                      buttonText: '',
                      buttonUrl: '',
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
                  {editingNotification ? 'Atualizar' : 'Criar'} Notificação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedNotificationManagement;