import React, { useState } from 'react';
import { Plus, Trash2, Send, Bell, Users, User, AlertTriangle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Notification } from '../../types';

const NotificationManagement: React.FC = () => {
  const { notifications, users, addNotification, deleteNotification } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    targetType: 'all' as 'all' | 'specific',
    targetUsers: [] as string[],
  });

  // Clean up excessive notifications on component mount
  React.useEffect(() => {
    const notificationCount = notifications.length;
    if (notificationCount > 100) {
      // Keep only the latest 50 notifications
      const latestNotifications = notifications
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50);
      
      localStorage.setItem('notifications', JSON.stringify(latestNotifications));
      window.location.reload(); // Refresh to apply changes
    }
  }, [notifications]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetUserIds = formData.targetType === 'all' 
      ? users.filter(u => !u.isAdmin).map(u => u.id)
      : formData.targetUsers;

    if (targetUserIds.length === 0) {
      alert('Selecione pelo menos um usuário para enviar a notificação.');
      return;
    }

    // Prevent sending too many notifications at once
    if (targetUserIds.length > 50) {
      alert('Limite máximo de 50 usuários por envio. Selecione menos usuários.');
      return;
    }

    const timestamp = Date.now();
    
    targetUserIds.forEach((userId, index) => {
      const notification: Notification = {
        id: `${timestamp}-${userId}-${index}`,
        userId,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        read: false,
        createdAt: new Date(timestamp + index).toISOString(), // Slight offset to prevent duplicates
      };
      
      // Add small delay to prevent overwhelming the system
      setTimeout(() => {
        addNotification(notification);
      }, index * 10);
    });

    setFormData({
      title: '',
      message: '',
      type: 'info',
      targetType: 'all',
      targetUsers: [],
    });
    setIsFormOpen(false);
    
    alert(`Notificação enviada para ${targetUserIds.length} usuário(s) com sucesso!`);
  };

  const handleDelete = (notificationId: string) => {
    if (confirm('Tem certeza que deseja excluir esta notificação?')) {
      deleteNotification(notificationId);
    }
  };

  const handleBulkCleanup = () => {
    if (confirm('Tem certeza que deseja limpar notificações antigas? Isso manterá apenas as 20 mais recentes.')) {
      const latestNotifications = notifications
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20);
      
      localStorage.setItem('notifications', JSON.stringify(latestNotifications));
      window.location.reload();
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400 bg-green-900/20';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20';
      case 'error': return 'text-red-400 bg-red-900/20';
      case 'course': return 'text-blue-400 bg-blue-900/20';
      case 'system': return 'text-purple-400 bg-purple-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'course': return '📚';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  // Get recent notifications (last 50)
  const recentNotifications = notifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gerenciamento de Notificações</h2>
          <p className="text-gray-400">Envie notificações para os usuários da plataforma</p>
        </div>
        <div className="flex gap-2">
          {notifications.length > 50 && (
            <button
              onClick={handleBulkCleanup}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <AlertTriangle className="w-5 h-5" />
              Limpar Antigas
            </button>
          )}
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova Notificação
          </button>
        </div>
      </div>

      {/* Warning for excessive notifications */}
      {notifications.length > 100 && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 text-yellow-300 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">Muitas notificações detectadas!</p>
          </div>
          <p className="text-sm mt-1">
            Você tem {notifications.length} notificações. Recomendamos limpar as antigas para melhor performance.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{notifications.length}</p>
              <p className="text-gray-400 text-sm">Total Enviadas</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {notifications.filter(n => n.read).length}
              </p>
              <p className="text-gray-400 text-sm">Lidas</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {notifications.filter(n => !n.read).length}
              </p>
              <p className="text-gray-400 text-sm">Não Lidas</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {new Set(notifications.map(n => n.userId)).size}
              </p>
              <p className="text-gray-400 text-sm">Usuários Alcançados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            Notificações Recentes ({recentNotifications.length})
          </h3>
        </div>
        
        <div className="p-6">
          {recentNotifications.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentNotifications.map((notification) => {
                const user = users.find(u => u.id === notification.userId);
                return (
                  <div key={notification.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-2xl">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium">{notification.title}</h4>
                            <span className={`px-2 py-1 rounded text-xs ${getTypeColor(notification.type)}`}>
                              {notification.type}
                            </span>
                            {notification.read ? (
                              <span className="text-green-400 text-xs">✓ Lida</span>
                            ) : (
                              <span className="text-yellow-400 text-xs">● Não lida</span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mb-2 line-clamp-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>Para: {user?.name || 'Usuário removido'}</span>
                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma notificação enviada</h3>
              <p className="text-gray-400">Comece enviando sua primeira notificação</p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white">Nova Notificação</h2>
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
                  maxLength={100}
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
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Notification['type'] })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="info">Informação</option>
                    <option value="success">Sucesso</option>
                    <option value="warning">Aviso</option>
                    <option value="error">Erro</option>
                    <option value="course">Curso</option>
                    <option value="system">Sistema</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Destinatários
                  </label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value as 'all' | 'specific' })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">Todos os usuários</option>
                    <option value="specific">Usuários específicos</option>
                  </select>
                </div>
              </div>

              {formData.targetType === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Selecionar Usuários (máximo 50)
                  </label>
                  <div className="max-h-40 overflow-y-auto bg-gray-700 rounded-lg p-3 space-y-2">
                    {users.filter(u => !u.isAdmin).slice(0, 50).map((user) => (
                      <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.targetUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked && formData.targetUsers.length >= 50) {
                              alert('Máximo de 50 usuários permitido');
                              return;
                            }
                            
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                targetUsers: [...formData.targetUsers, user.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                targetUsers: formData.targetUsers.filter(id => id !== user.id)
                              });
                            }
                          }}
                          className="w-4 h-4 text-red-600 bg-gray-600 border-gray-500 rounded focus:ring-red-500"
                        />
                        <span className="text-white text-sm">{user.name} ({user.email})</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs mt-2">
                    {formData.targetUsers.length}/50 usuários selecionados
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Send className="w-5 h-5" />
                  Enviar Notificação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement;