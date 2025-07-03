import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const FixedNotificationBanner: React.FC = () => {
  const { getActiveFixedNotifications } = useData();
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  const activeNotifications = getActiveFixedNotifications().filter(
    notification => !dismissedNotifications.includes(notification.id)
  );

  const dismissNotification = (notificationId: string) => {
    setDismissedNotifications(prev => [...prev, notificationId]);
  };

  const handleButtonClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-600 border-green-500';
      case 'warning': return 'bg-yellow-600 border-yellow-500';
      case 'error': return 'bg-red-600 border-red-500';
      case 'promotion': return 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500';
      default: return 'bg-blue-600 border-blue-500';
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

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {activeNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`relative rounded-xl border p-4 ${getTypeColor(notification.type)} text-white shadow-lg`}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0">
              {getTypeIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1">{notification.title}</h3>
              <p className="text-white/90 text-sm leading-relaxed">{notification.message}</p>
              
              {notification.buttonText && notification.buttonUrl && (
                <button
                  onClick={() => handleButtonClick(notification.buttonUrl!)}
                  className="inline-flex items-center gap-2 mt-3 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4" />
                  {notification.buttonText}
                </button>
              )}
            </div>
            
            <button
              onClick={() => dismissNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FixedNotificationBanner;