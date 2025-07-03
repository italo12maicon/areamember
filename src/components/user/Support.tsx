import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Send, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const Support: React.FC = () => {
  const { user } = useAuth();
  const { settings, addSupportTicket } = useData();
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { id: 'general', label: 'Geral' },
    { id: 'technical', label: 'Problema Técnico' },
    { id: 'course', label: 'Curso/Conteúdo' },
    { id: 'account', label: 'Conta/Login' },
    { id: 'billing', label: 'Pagamento' },
    { id: 'feature', label: 'Sugestão' },
  ];

  const priorities = [
    { id: 'low', label: 'Baixa', color: 'text-green-400' },
    { id: 'medium', label: 'Média', color: 'text-yellow-400' },
    { id: 'high', label: 'Alta', color: 'text-red-400' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const ticket = {
        id: Date.now().toString(),
        userId: user.id,
        subject: formData.subject,
        category: formData.category,
        priority: formData.priority,
        message: formData.message,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addSupportTicket(ticket);
      setSubmitted(true);
      setFormData({
        subject: '',
        category: 'general',
        priority: 'medium',
        message: '',
      });
    } catch (error) {
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Olá! Preciso de suporte na área de membros.\n\nNome: ${user?.name}\nEmail: ${user?.email}\n\nDescreva seu problema:`
    );
    window.open(`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleEmailContact = () => {
    const subject = encodeURIComponent('Suporte - Área de Membros');
    const body = encodeURIComponent(
      `Nome: ${user?.name}\nEmail: ${user?.email}\n\nDescreva seu problema:\n\n`
    );
    window.open(`mailto:${settings.socialLinks.email}?subject=${subject}&body=${body}`);
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Suporte</h1>
          <p className="text-gray-400">Entre em contato conosco para ajuda</p>
        </div>

        <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Solicitação Enviada!</h2>
          <p className="text-green-300 mb-4">
            Recebemos sua solicitação de suporte e entraremos em contato em breve.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Tempo médio de resposta: 24 horas
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Enviar Nova Solicitação
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Suporte</h1>
        <p className="text-gray-400">Entre em contato conosco para ajuda</p>
      </div>

      {/* Quick Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleWhatsAppContact}
          className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl transition-all transform hover:scale-105"
        >
          <MessageCircle className="w-8 h-8 mx-auto mb-3" />
          <h3 className="font-bold mb-2">WhatsApp</h3>
          <p className="text-sm opacity-90">Resposta rápida</p>
        </button>

        <button
          onClick={handleEmailContact}
          className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl transition-all transform hover:scale-105"
        >
          <Mail className="w-8 h-8 mx-auto mb-3" />
          <h3 className="font-bold mb-2">Email</h3>
          <p className="text-sm opacity-90">Suporte detalhado</p>
        </button>

        <div className="bg-gray-700 text-white p-6 rounded-xl">
          <Clock className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <h3 className="font-bold mb-2">Horário</h3>
          <p className="text-sm text-gray-300">24/7 disponível</p>
        </div>
      </div>

      {/* Support Form */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Formulário de Suporte</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {priorities.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Assunto *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Descreva brevemente o problema"
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
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 h-32"
              placeholder="Descreva detalhadamente o problema ou sua dúvida..."
              required
            />
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Informações da Conta</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <span className="text-gray-400">Nome:</span> {user?.name}
              </div>
              <div>
                <span className="text-gray-400">Email:</span> {user?.email}
              </div>
              <div>
                <span className="text-gray-400">Data de Registro:</span>{' '}
                {new Date(user?.registrationDate || '').toLocaleDateString()}
              </div>
              <div>
                <span className="text-gray-400">Cursos Desbloqueados:</span> {user?.unlockedCourses.length || 0}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
            </button>
          </div>
        </form>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Perguntas Frequentes</h2>
        
        <div className="space-y-4">
          <div className="border-b border-gray-700 pb-4">
            <h3 className="text-white font-medium mb-2">Como recuperar minha senha?</h3>
            <p className="text-gray-400 text-sm">
              Use o botão "Recuperar Senha via WhatsApp" na tela de login ou entre em contato conosco.
            </p>
          </div>
          
          <div className="border-b border-gray-700 pb-4">
            <h3 className="text-white font-medium mb-2">Como desbloquear um curso?</h3>
            <p className="text-gray-400 text-sm">
              Alguns cursos são desbloqueados automaticamente após alguns dias. Outros precisam ser liberados manualmente.
            </p>
          </div>
          
          <div className="border-b border-gray-700 pb-4">
            <h3 className="text-white font-medium mb-2">Problemas para assistir vídeos?</h3>
            <p className="text-gray-400 text-sm">
              Verifique sua conexão com a internet e tente atualizar a página. Se o problema persistir, entre em contato.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-2">Como alterar meus dados?</h3>
            <p className="text-gray-400 text-sm">
              Acesse a seção "Configurações" no menu lateral para alterar seus dados pessoais e senha.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;