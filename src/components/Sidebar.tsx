import React from 'react';
import { 
  Home, 
  BookOpen, 
  Play, 
  Download, 
  Heart, 
  History, 
  Bell, 
  HelpCircle, 
  Info, 
  Settings, 
  Mail, 
  Instagram, 
  MessageCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'courses', label: 'Meus Cursos', icon: BookOpen },
  { id: 'continue', label: 'Continue Assistindo', icon: Play },
  { id: 'resources', label: 'Recursos', icon: Download },
  { id: 'favorites', label: 'Favoritos', icon: Heart },
  { id: 'history', label: 'Histórico', icon: History },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'support', label: 'Suporte', icon: HelpCircle },
  { id: 'help', label: 'Central de Ajuda', icon: Info },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, activeSection, onSectionChange }) => {
  const { logout, user } = useAuth();
  const { settings, notifications } = useData();

  // Get unread notifications count
  const unreadCount = notifications.filter(n => n.userId === user?.id && !n.read).length;

  const handleSocialClick = (type: 'email' | 'instagram' | 'whatsapp') => {
    const { socialLinks } = settings;
    
    switch (type) {
      case 'email':
        window.open(`mailto:${socialLinks.email}`);
        break;
      case 'instagram':
        window.open(`https://instagram.com/${socialLinks.instagram.replace('@', '')}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`);
        break;
    }
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair da área de membros?')) {
      logout();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 z-50 transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? 'w-64' : 'w-16'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 min-h-[80px] flex-shrink-0">
          <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:opacity-100 lg:w-auto'}`}>
            <h2 className="text-xl font-bold text-white whitespace-nowrap">{settings.customizations.logoText}</h2>
            <p className="text-sm text-gray-400 whitespace-nowrap">Olá, {user?.name}</p>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors flex-shrink-0"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Items - Scrollable */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-2 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const showBadge = item.id === 'notifications' && unreadCount > 0;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all transform hover:scale-105 relative
                    ${isActive 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`transition-all duration-300 whitespace-nowrap ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
                    {item.label}
                  </span>
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Social Links */}
          <div className="mt-8 px-3">
            <div className={`border-t border-gray-800 pt-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
              <h3 className="text-sm font-semibold text-gray-400 mb-3 whitespace-nowrap">Redes Sociais</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSocialClick('email')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Email</span>
                </button>
                <button
                  onClick={() => handleSocialClick('instagram')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
                >
                  <Instagram className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Instagram</span>
                </button>
                <button
                  onClick={() => handleSocialClick('whatsapp')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button - Fixed at bottom */}
        <div className="p-3 border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all transform hover:scale-105 group shadow-lg font-bold"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:animate-pulse" />
            <span className={`transition-all duration-300 whitespace-nowrap ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
              Sair da Área
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;