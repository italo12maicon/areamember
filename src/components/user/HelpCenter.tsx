import React, { useState } from 'react';
import { Search, Book, Video, Settings, User, HelpCircle, ChevronDown, ChevronRight, MessageCircle, Play } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const HelpCenter: React.FC = () => {
  const { settings } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [expandedItems, setExpandedItems] = useState<string[]>(['getting-started-1']);

  const categories = [
    {
      id: 'getting-started',
      title: 'Primeiros Passos',
      icon: Book,
      items: [
        {
          id: 'getting-started-1',
          question: 'Como começar a usar a plataforma?',
          answer: 'Após fazer login, você verá sua área de membros com todos os cursos disponíveis. Clique em qualquer curso para começar a assistir as aulas.'
        },
        {
          id: 'getting-started-2',
          question: 'Como navegar pelo menu?',
          answer: 'Use o menu lateral para acessar diferentes seções como Meus Cursos, Favoritos, Histórico e Configurações. O menu pode ser expandido ou recolhido clicando no ícone de menu.'
        },
        {
          id: 'getting-started-3',
          question: 'O que são cursos bloqueados?',
          answer: 'Alguns cursos podem estar bloqueados e serão liberados automaticamente após alguns dias ou manualmente pelo administrador. Você verá um ícone de cadeado nesses cursos.'
        }
      ]
    },
    {
      id: 'courses',
      title: 'Cursos e Aulas',
      icon: Video,
      items: [
        {
          id: 'courses-1',
          question: 'Como assistir uma aula?',
          answer: 'Clique no curso desejado e depois selecione a aula na lista lateral. O vídeo será carregado automaticamente no player principal.'
        },
        {
          id: 'courses-2',
          question: 'Como favoritar um curso?',
          answer: 'Clique no ícone de coração no curso para adicioná-lo aos seus favoritos. Você pode acessar todos os favoritos na seção "Favoritos" do menu.'
        },
        {
          id: 'courses-3',
          question: 'Como continuar de onde parei?',
          answer: 'A seção "Continue Assistindo" mostra todos os cursos que você começou a assistir, permitindo retomar de onde parou.'
        },
        {
          id: 'courses-4',
          question: 'Como baixar recursos dos cursos?',
          answer: 'Acesse a seção "Recursos" no menu para encontrar materiais complementares como PDFs, links e outros arquivos dos seus cursos.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Conta e Perfil',
      icon: User,
      items: [
        {
          id: 'account-1',
          question: 'Como alterar minha senha?',
          answer: 'Vá em Configurações > Segurança e preencha os campos de senha atual e nova senha. Clique em "Salvar Alterações" para confirmar.'
        },
        {
          id: 'account-2',
          question: 'Como atualizar meus dados pessoais?',
          answer: 'Acesse Configurações > Perfil para alterar seu nome e email. As alterações são salvas automaticamente.'
        },
        {
          id: 'account-3',
          question: 'Como gerenciar notificações?',
          answer: 'Em Configurações > Notificações você pode escolher quais tipos de notificações deseja receber.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Problemas Técnicos',
      icon: Settings,
      items: [
        {
          id: 'technical-1',
          question: 'O vídeo não carrega ou trava',
          answer: 'Verifique sua conexão com a internet, atualize a página e tente novamente. Se o problema persistir, entre em contato com o suporte.'
        },
        {
          id: 'technical-2',
          question: 'Não consigo fazer login',
          answer: 'Verifique se seu email e senha estão corretos. Use o botão "Recuperar Senha via WhatsApp" se necessário.'
        },
        {
          id: 'technical-3',
          question: 'A página não carrega corretamente',
          answer: 'Tente limpar o cache do navegador, desabilitar extensões ou usar outro navegador. Recomendamos Chrome, Firefox ou Safari atualizados.'
        }
      ]
    }
  ];

  const allItems = categories.flatMap(category => 
    category.items.map(item => ({ ...item, categoryTitle: category.title }))
  );

  const filteredItems = searchTerm 
    ? allItems.filter(item => 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : categories.find(cat => cat.id === activeCategory)?.items || [];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleDirectSupport = () => {
    const message = encodeURIComponent('Olá! Preciso de suporte direto da área de membros.');
    window.open(`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleVideoTutorials = () => {
    if (settings.helpCenter?.tutorialsUrl) {
      window.open(settings.helpCenter.tutorialsUrl, '_blank');
    } else {
      alert('Link para tutoriais não configurado. Entre em contato com o suporte.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Central de Ajuda</h1>
        <p className="text-gray-400">Encontre respostas para suas dúvidas</p>
      </div>

      {/* Search */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar na central de ajuda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        {!searchTerm && (
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 sticky top-6">
              <h2 className="text-lg font-bold text-white mb-4">Categorias</h2>
              <nav className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeCategory === category.id
                          ? 'bg-red-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{category.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={searchTerm ? 'lg:col-span-4' : 'lg:col-span-3'}>
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {searchTerm ? `Resultados para "${searchTerm}"` : categories.find(cat => cat.id === activeCategory)?.title}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {filteredItems.length} {filteredItems.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            </div>

            <div className="p-6">
              {filteredItems.length > 0 ? (
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="border border-gray-700 rounded-lg">
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700 transition-colors rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{item.question}</h3>
                          {searchTerm && (
                            <p className="text-gray-400 text-sm mt-1">
                              Categoria: {item.categoryTitle}
                            </p>
                          )}
                        </div>
                        {expandedItems.includes(item.id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      
                      {expandedItems.includes(item.id) && (
                        <div className="px-4 pb-4">
                          <div className="bg-gray-700 rounded-lg p-4">
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma pergunta disponível'}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {searchTerm 
                      ? 'Tente usar termos diferentes ou entre em contato com o suporte'
                      : 'Esta categoria ainda não possui perguntas frequentes'
                    }
                  </p>
                  <button 
                    onClick={handleDirectSupport}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Entrar em Contato
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Help */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Precisa de mais ajuda?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Suporte Direto</h3>
            <p className="text-gray-400 text-sm mb-3">
              Entre em contato conosco para ajuda personalizada
            </p>
            <button 
              onClick={handleDirectSupport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Abrir Suporte
            </button>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Tutoriais em Vídeo</h3>
            <p className="text-gray-400 text-sm mb-3">
              Assista tutoriais sobre como usar a plataforma
            </p>
            <button 
              onClick={handleVideoTutorials}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Ver Tutoriais
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;