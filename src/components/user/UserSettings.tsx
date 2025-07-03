import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, User, Lock, Bell, Palette } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const UserSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { updateUser: updateUserInData, addNotification } = useData();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    fontSize: 'normal',
    notifications: {
      newCourses: true,
      courseUnlocked: true,
      systemUpdates: true,
      emailMarketing: false,
    }
  });

  // Load preferences from localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      setPreferences(parsed);
      
      // Apply theme immediately
      applyTheme(parsed.theme);
      applyFontSize(parsed.fontSize);
    }
  }, []);

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
      // Apply light theme styles
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--bg-tertiary', '#e2e8f0');
      root.style.setProperty('--text-primary', '#1a202c');
      root.style.setProperty('--text-secondary', '#4a5568');
      root.style.setProperty('--text-tertiary', '#718096');
      root.style.setProperty('--border-color', '#e2e8f0');
    } else {
      root.classList.remove('light-theme');
      // Reset to dark theme
      root.style.setProperty('--bg-primary', '#111827');
      root.style.setProperty('--bg-secondary', '#1f2937');
      root.style.setProperty('--bg-tertiary', '#374151');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#d1d5db');
      root.style.setProperty('--text-tertiary', '#9ca3af');
      root.style.setProperty('--border-color', '#374151');
    }
  };

  const applyFontSize = (fontSize: string) => {
    const root = document.documentElement;
    switch (fontSize) {
      case 'small':
        root.style.setProperty('--font-size-base', '14px');
        root.style.setProperty('--font-size-lg', '16px');
        root.style.setProperty('--font-size-xl', '18px');
        break;
      case 'large':
        root.style.setProperty('--font-size-base', '18px');
        root.style.setProperty('--font-size-lg', '20px');
        root.style.setProperty('--font-size-xl', '24px');
        break;
      default: // normal
        root.style.setProperty('--font-size-base', '16px');
        root.style.setProperty('--font-size-lg', '18px');
        root.style.setProperty('--font-size-xl', '20px');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);

    try {
      // Validate current password if changing password
      if (formData.newPassword) {
        if (formData.currentPassword !== user.password) {
          alert('Senha atual incorreta');
          setIsSaving(false);
          return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
          alert('Nova senha e confirmação não coincidem');
          setIsSaving(false);
          return;
        }

        if (formData.newPassword.length < 6) {
          alert('Nova senha deve ter pelo menos 6 caracteres');
          setIsSaving(false);
          return;
        }
      }

      // Update user data
      const updates: any = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.newPassword) {
        updates.password = formData.newPassword;
      }

      updateUserInData(user.id, updates);
      
      // Add notification
      addNotification({
        id: Date.now().toString(),
        userId: user.id,
        title: 'Configurações Atualizadas',
        message: formData.newPassword 
          ? 'Seu perfil e senha foram atualizados com sucesso!'
          : 'Seu perfil foi atualizado com sucesso!',
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      });

      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save preferences to localStorage
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    // Apply theme and font size immediately
    applyTheme(preferences.theme);
    applyFontSize(preferences.fontSize);
    
    // Add notification
    if (user) {
      addNotification({
        id: Date.now().toString(),
        userId: user.id,
        title: 'Aparência Atualizada',
        message: `Tema ${preferences.theme === 'light' ? 'claro' : 'escuro'} e fonte ${preferences.fontSize} aplicados com sucesso!`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    
    alert('Preferências salvas com sucesso!');
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Lock },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'appearance', label: 'Aparência', icon: Palette },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Digite seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Digite seu email"
              />
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Informações da Conta</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Data de Registro: {new Date(user?.registrationDate || '').toLocaleDateString()}</p>
                <p>Cursos Desbloqueados: {user?.unlockedCourses.length || 0}</p>
                <p>Dias na Plataforma: {Math.floor((Date.now() - new Date(user?.registrationDate || '').getTime()) / (1000 * 60 * 60 * 24))}</p>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha Atual
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 pr-12"
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 pr-12"
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 pr-12"
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-700/50 text-yellow-300 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Dicas de Segurança:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Use pelo menos 8 caracteres</li>
                <li>Combine letras maiúsculas e minúsculas</li>
                <li>Inclua números e símbolos</li>
                <li>Não use informações pessoais</li>
              </ul>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <form onSubmit={handlePreferencesSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Novos Cursos</h4>
                  <p className="text-gray-400 text-sm">Receber notificações sobre novos cursos</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications.newCourses}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    notifications: { ...preferences.notifications, newCourses: e.target.checked }
                  })}
                  className="w-4 h-4 text-red-600 bg-gray-600 border-gray-500 rounded focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Cursos Desbloqueados</h4>
                  <p className="text-gray-400 text-sm">Notificar quando cursos forem desbloqueados</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications.courseUnlocked}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    notifications: { ...preferences.notifications, courseUnlocked: e.target.checked }
                  })}
                  className="w-4 h-4 text-red-600 bg-gray-600 border-gray-500 rounded focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Atualizações do Sistema</h4>
                  <p className="text-gray-400 text-sm">Receber notificações sobre atualizações</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications.systemUpdates}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    notifications: { ...preferences.notifications, systemUpdates: e.target.checked }
                  })}
                  className="w-4 h-4 text-red-600 bg-gray-600 border-gray-500 rounded focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Email Marketing</h4>
                  <p className="text-gray-400 text-sm">Receber emails promocionais</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications.emailMarketing}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    notifications: { ...preferences.notifications, emailMarketing: e.target.checked }
                  })}
                  className="w-4 h-4 text-red-600 bg-gray-600 border-gray-500 rounded focus:ring-red-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Save className="w-5 h-5" />
                Salvar Preferências
              </button>
            </div>
          </form>
        );

      case 'appearance':
        return (
          <form onSubmit={handlePreferencesSubmit} className="space-y-6">
            <div>
              <h4 className="text-white font-medium mb-4">Tema</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={preferences.theme === 'dark'}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                    className="w-4 h-4 text-red-600 bg-gray-600 border-gray-500 focus:ring-red-500"
                  />
                  <label className="text-white">Escuro (Padrão)</label>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={preferences.theme === 'light'}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                    className="w-4 h-4 text-red-600 bg-gray-600 border-gray-500 focus:ring-red-500"
                  />
                  <label className="text-white">Claro</label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4">Tamanho da Fonte</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                  <input
                    type="radio"
                    name="fontSize"
                    value="small"
                    checked={preferences.fontSize === 'small'}
                    onChange={(e) => setPreferences({ ...preferences, fontSize: e.target.value })}
                    className="w-4 h-4 text-red-600 bg-gray-600 border-gray-500 focus:ring-red-500"
                  />
                  <label className="text-white text-sm">Pequeno</label>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                  <input
                    type="radio"
                    name="fontSize"
                    value="normal"
                    checked={preferences.fontSize === 'normal'}
                    onChange={(e) => setPreferences({ ...preferences, fontSize: e.target.value })}
                    className="w-4 h-4 text-red-600 bg-gray-600 border-gray-500 focus:ring-red-500"
                  />
                  <label className="text-white">Normal</label>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                  <input
                    type="radio"
                    name="fontSize"
                    value="large"
                    checked={preferences.fontSize === 'large'}
                    onChange={(e) => setPreferences({ ...preferences, fontSize: e.target.value })}
                    className="w-4 h-4 text-red-600 bg-gray-600 border-gray-500 focus:ring-red-500"
                  />
                  <label className="text-white text-lg">Grande</label>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-700/50 text-blue-300 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium mb-1">💡 Dica:</p>
              <p>As alterações de aparência são aplicadas imediatamente ao salvar e ficam salvas para suas próximas visitas.</p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Save className="w-5 h-5" />
                Salvar Aparência
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-gray-400">Gerencie suas preferências e configurações da conta</p>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {(activeTab === 'profile' || activeTab === 'security') ? (
            <form onSubmit={handleSubmit}>
              {renderTabContent()}
              <div className="flex justify-end pt-6 border-t border-gray-700 mt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;