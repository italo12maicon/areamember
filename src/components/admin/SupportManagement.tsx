import React, { useState } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle, User, Calendar, Filter } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { SupportTicket } from '../../types';

const SupportManagement: React.FC = () => {
  const { supportTickets, users, updateSupportTicket } = useData();
  const [filter, setFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const filteredTickets = supportTickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const sortedTickets = filteredTickets.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    const ticket = supportTickets.find(t => t.id === ticketId);
    if (ticket) {
      updateSupportTicket(ticketId, { 
        status, 
        updatedAt: new Date().toISOString() 
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-400 bg-blue-900/20';
      case 'in-progress': return 'text-yellow-400 bg-yellow-900/20';
      case 'resolved': return 'text-green-400 bg-green-900/20';
      case 'closed': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      'general': 'Geral',
      'technical': 'Problema Técnico',
      'course': 'Curso/Conteúdo',
      'account': 'Conta/Login',
      'billing': 'Pagamento',
      'feature': 'Sugestão',
    };
    return categories[category as keyof typeof categories] || category;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gerenciamento de Suporte</h2>
          <p className="text-gray-400">Gerencie as solicitações de suporte dos usuários</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{supportTickets.length}</p>
              <p className="text-gray-400 text-sm">Total de Tickets</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {supportTickets.filter(t => t.status === 'open').length}
              </p>
              <p className="text-gray-400 text-sm">Abertos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {supportTickets.filter(t => t.status === 'in-progress').length}
              </p>
              <p className="text-gray-400 text-sm">Em Andamento</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {supportTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
              </p>
              <p className="text-gray-400 text-sm">Resolvidos</p>
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
            { id: 'all', label: 'Todos' },
            { id: 'open', label: 'Abertos' },
            { id: 'in-progress', label: 'Em Andamento' },
            { id: 'resolved', label: 'Resolvidos' },
            { id: 'closed', label: 'Fechados' },
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

      {/* Tickets List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            Tickets de Suporte ({sortedTickets.length})
          </h3>
        </div>
        
        <div className="p-6">
          {sortedTickets.length > 0 ? (
            <div className="space-y-4">
              {sortedTickets.map((ticket) => {
                const user = users.find(u => u.id === ticket.userId);
                return (
                  <div key={ticket.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-medium">{ticket.subject}</h4>
                          <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            {ticket.status}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority} priority
                          </span>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{ticket.message}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{user?.name || 'Usuário removido'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                          </div>
                          <span>Categoria: {getCategoryLabel(ticket.category)}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          {ticket.status === 'open' && (
                            <button
                              onClick={() => updateTicketStatus(ticket.id, 'in-progress')}
                              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
                            >
                              Iniciar Atendimento
                            </button>
                          )}
                          {ticket.status === 'in-progress' && (
                            <button
                              onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                            >
                              Marcar como Resolvido
                            </button>
                          )}
                          {ticket.status === 'resolved' && (
                            <button
                              onClick={() => updateTicketStatus(ticket.id, 'closed')}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                            >
                              Fechar Ticket
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                          >
                            Ver Detalhes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {filter === 'all' ? 'Nenhum ticket de suporte' : `Nenhum ticket ${filter}`}
              </h3>
              <p className="text-gray-400">
                {filter === 'all' 
                  ? 'Os tickets de suporte aparecerão aqui quando os usuários enviarem solicitações'
                  : 'Tente ajustar os filtros para ver outros tickets'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Detalhes do Ticket</h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => {
                      updateTicketStatus(selectedTicket.id, e.target.value as SupportTicket['status']);
                      setSelectedTicket({ ...selectedTicket, status: e.target.value as SupportTicket['status'] });
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="open">Aberto</option>
                    <option value="in-progress">Em Andamento</option>
                    <option value="resolved">Resolvido</option>
                    <option value="closed">Fechado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Prioridade</label>
                  <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Assunto</label>
                <p className="text-white">{selectedTicket.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Categoria</label>
                <p className="text-white">{getCategoryLabel(selectedTicket.category)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mensagem</label>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-white whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Informações do Usuário</label>
                <div className="bg-gray-700 rounded-lg p-4">
                  {(() => {
                    const user = users.find(u => u.id === selectedTicket.userId);
                    return user ? (
                      <div className="space-y-2 text-sm">
                        <p className="text-white"><span className="text-gray-400">Nome:</span> {user.name}</p>
                        <p className="text-white"><span className="text-gray-400">Email:</span> {user.email}</p>
                        <p className="text-white"><span className="text-gray-400">Data de Registro:</span> {new Date(user.registrationDate).toLocaleDateString()}</p>
                        <p className="text-white"><span className="text-gray-400">Cursos Desbloqueados:</span> {user.unlockedCourses.length}</p>
                      </div>
                    ) : (
                      <p className="text-gray-400">Usuário não encontrado</p>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                <div>
                  <span className="text-gray-300">Criado em:</span><br />
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="text-gray-300">Atualizado em:</span><br />
                  {new Date(selectedTicket.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportManagement;