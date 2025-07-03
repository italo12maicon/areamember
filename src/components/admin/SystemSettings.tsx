import React, { useState } from 'react';
import { Save, Smartphone, Mail, Instagram, MessageCircle, Palette, Image, Upload } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const SystemSettings: React.FC = () => {
  const { settings, updateSettings } = useData();
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      updateSettings(formData);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Configurações do Sistema</h2>
        <p className="text-gray-400">Configure as definições gerais da plataforma</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Branding */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Identidade Visual</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome da Plataforma
              </label>
              <input
                type="text"
                value={formData.customizations.logoText}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  customizations: { ...formData.customizations, logoText: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="MemberArea"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Logo da Plataforma (URL)
              </label>
              <input
                type="url"
                value={formData.customizations.logoUrl || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  customizations: { ...formData.customizations, logoUrl: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://exemplo.com/logo.png"
              />
              <p className="text-gray-400 text-sm mt-2">
                URL da imagem do logo (recomendado: 200x50px, formato PNG/SVG)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Favicon (URL)
              </label>
              <input
                type="url"
                value={formData.customizations.faviconUrl || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  customizations: { ...formData.customizations, faviconUrl: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://exemplo.com/favicon.ico"
              />
              <p className="text-gray-400 text-sm mt-2">
                URL do favicon (recomendado: 32x32px, formato ICO/PNG)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cor Primária
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.customizations.primaryColor}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    customizations: { ...formData.customizations, primaryColor: e.target.value }
                  })}
                  className="w-12 h-12 rounded-lg border border-gray-600 bg-gray-700"
                />
                <input
                  type="text"
                  value={formData.customizations.primaryColor}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    customizations: { ...formData.customizations, primaryColor: e.target.value }
                  })}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="#e50914"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cor Secundária
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.customizations.secondaryColor || '#6b7280'}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    customizations: { ...formData.customizations, secondaryColor: e.target.value }
                  })}
                  className="w-12 h-12 rounded-lg border border-gray-600 bg-gray-700"
                />
                <input
                  type="text"
                  value={formData.customizations.secondaryColor || '#6b7280'}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    customizations: { ...formData.customizations, secondaryColor: e.target.value }
                  })}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="#6b7280"
                />
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Settings */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">WhatsApp</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Número do WhatsApp (com código do país)
            </label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ 
                ...formData, 
                whatsappNumber: e.target.value 
              })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="+5511999999999"
            />
            <p className="text-gray-400 text-sm mt-2">
              Este número será usado para recuperação de senhas e suporte
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">Redes Sociais</h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4" />
                Email de Contato
              </label>
              <input
                type="email"
                value={formData.socialLinks.email}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  socialLinks: { ...formData.socialLinks, email: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="contato@exemplo.com"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </label>
              <input
                type="text"
                value={formData.socialLinks.instagram}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="@exemplo"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp (Redes Sociais)
              </label>
              <input
                type="text"
                value={formData.socialLinks.whatsapp}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  socialLinks: { ...formData.socialLinks, whatsapp: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="+5511999999999"
              />
            </div>
          </div>
        </div>

        {/* Help Center Settings */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">Central de Ajuda</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Link para Tutoriais em Vídeo
              </label>
              <input
                type="url"
                value={formData.helpCenter?.tutorialsUrl || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  helpCenter: { ...formData.helpCenter, tutorialsUrl: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://youtube.com/playlist?list=..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Horário de Atendimento
              </label>
              <input
                type="text"
                value={formData.helpCenter?.supportHours || '24/7 disponível'}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  helpCenter: { ...formData.helpCenter, supportHours: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="24/7 disponível"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;