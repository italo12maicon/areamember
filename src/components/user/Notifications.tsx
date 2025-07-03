import React, { useState } from 'react';
import { Bell, Check, Trash2, Settings, Filter, BellRing } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const { notifications, markNotificationAsRead, deleteNotification, markAllAsRead } = useData();
  const [filter, setFilter] = useState('all');

  // Get user's notifications
  const userNotifications = notifications.filter(notification => notification.userId === user?.id);

  // Filter notifications
  const filteredNotifications = userNotifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      case 'system':
        return notification.type === 'system';
      case 'course':
        return notification.type === 'course';
      case 'success':
        return notification.type === 'success';
      default:
        return true;
    }
  });

  // Sort by most recent
  const sortedNotifications = filteredNotifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'course':
        return '📚';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-900/20';
      case 'warning':
        return 'border-yellow-500 bg-yellow-900/20';
      case 'error':
        return 'border-red-500 bg-red-900/20';
      case 'course':
        return 'border-blue-500 bg-blue-900/20';
      case 'system':
        return 'border-purple-500 bg-purple-900/20';
      default:
        return 'border-gray-500 bg-gray-900/20';
    }
  };

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

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = () => {
    if (user) {
      markAllAsRead(user.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notificações</h1>
          <p className="text-gray-400">
            {unreadCount > 0 ? `${unreadCount} notificações não lidas` : 'Todas as notificações foram lidas'}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Check className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{userNotifications.length}</p>
              <p className="text-gray-400 text-sm">Total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <BellRing className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-white">{unreadCount}</p>
              <p className="text-gray-400 text-sm">Não Lidas</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Check className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{userNotifications.length - unreadCount}</p>
              <p className="text-gray-400 text-sm">Lidas</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {userNotifications.filter(n => n.type === 'system').length}
              </p>
              <p className="text-gray-400 text-sm">Sistema</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-white font-medium">Filtros:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'unread', label: 'Não lidas' },
            { id: 'read', label: 'Lidas' },
            { id: 'system', label: 'Sistema' },
            { id: 'course', label: 'Cursos' },
            { id: 'success', label: 'Sucesso' },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {sortedNotifications.length > 0 ? (
        <div className="space-y-3">
          {sortedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl border transition-all ${
                notification.read 
                  ? 'bg-gray-800 border-gray-700' 
                  : `${getNotificationColor(notification.type)} border-l-4`
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-bold ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  
                  <p className={`text-sm mt-1 ${notification.read ? 'text-gray-400' : 'text-gray-300'}`}>
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        Marcar como lida
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {filter === 'all' ? 'Nenhuma notificação' : `Nenhuma notificação ${filter === 'unread' ? 'não lida' : filter}`}
          </h3>
          <p className="text-gray-400">
            {filter === 'all' 
              ? 'Você receberá notificações sobre cursos e atualizações aqui'
              : 'Tente ajustar os filtros para ver outras notificações'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;