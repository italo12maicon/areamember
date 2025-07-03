import React, { useState } from 'react';
import { Users, BookOpen, Settings, BarChart3, LogOut, Bell, MessageSquare, Download, Image, Megaphone, Shield, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CourseManagement from './CourseManagement';
import ProductManagement from './ProductManagement';
import UserManagement from './UserManagement';
import SystemSettings from './SystemSettings';
import AdminStats from './AdminStats';
import NotificationManagement from './NotificationManagement';
import SupportManagement from './SupportManagement';
import ResourceManagement from './ResourceManagement';
import BannerManagement from './BannerManagement';
import FixedNotificationManagement from './FixedNotificationManagement';
import SecurityManagement from './SecurityManagement';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const { logout } = useAuth();

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: BarChart3 },
    { id: 'courses', label: 'Cursos', icon: BookOpen },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'fixed-notifications', label: 'Notificações Fixas', icon: Megaphone },
    { id: 'resources', label: 'Recursos', icon: Download },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'support', label: 'Suporte', icon: MessageSquare },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <AdminStats />;
      case 'courses':
        return <CourseManagement />;
      case 'products':
        return <ProductManagement />;
      case 'users':
        return <UserManagement />;
      case 'security':
        return <SecurityManagement />;
      case 'banners':
        return <BannerManagement />;
      case 'fixed-notifications':
        return <FixedNotificationManagement />;
      case 'resources':
        return <ResourceManagement />;
      case 'notifications':
        return <NotificationManagement />;
      case 'support':
        return <SupportManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <AdminStats />;
    }
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair do painel administrativo?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-all transform hover:scale-105 group"
          >
            <LogOut className="w-4 h-4 group-hover:animate-pulse" />
            Sair
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 h-[calc(100vh-80px)]">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto h-[calc(100vh-80px)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;