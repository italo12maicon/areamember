import React, { useState } from 'react';
import { Shield, Users, Activity, AlertTriangle, Eye, Ban, Unlock, Trash2, MapPin, Monitor, Clock, Filter, Search } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatIPAddress, getSecurityRiskLevel } from '../../utils/security';

const SecurityManagement: React.FC = () => {
  const { users, userSessions, securityLogs, blockUser, unblockUser, terminateUserSession, terminateAllUserSessions, getUserSessions, getActiveUserSessions, getSecurityLogs } = useData();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [logFilter, setLogFilter] = useState('all');
  const [blockReason, setBlockReason] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState<string>('');

  const nonAdminUsers = users.filter(u => !u.isAdmin);
  const activeSessions = userSessions.filter(s => s.isActive);
  const blockedUsers = users.filter(u => u.isBlocked);
  const recentLogs = securityLogs.slice(-50).reverse();

  // Filtrar logs
  const filteredLogs = recentLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm) ||
      users.find(u => u.id === log.userId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = logFilter === 'all' || log.action === logFilter || log.severity === logFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleBlockUser = (userId: string) => {
    setUserToBlock(userId);
    setShowBlockModal(true);
  };

  const confirmBlockUser = () => {
    if (userToBlock && blockReason.trim() && currentUser) {
      blockUser(userToBlock, blockReason.trim(), currentUser.id);
      setShowBlockModal(false);
      setUserToBlock('');
      setBlockReason('');
    }
  };

  const handleUnblockUser = (userId: string) => {
    if (currentUser && confirm('Tem certeza que deseja desbloquear este usuário?')) {
      unblockUser(userId, currentUser.id);
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    if (currentUser && confirm('Tem certeza que deseja terminar esta sessão?')) {
      terminateUserSession(sessionId, currentUser.id);
    }
  };

  const handleTerminateAllSessions = (userId: string) => {
    if (currentUser && confirm('Tem certeza que deseja terminar TODAS as sessões deste usuário?')) {
      terminateAllUserSessions(userId, currentUser.id);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return '🔓';
      case 'logout': return '🔒';
      case 'blocked': return '🚫';
      case 'unblocked': return '✅';
      case 'multiple_ips': return '⚠️';
      case 'suspicious_activity': return '🔍';
      default: return '📝';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Shield },
    { id: 'sessions', label: 'Sessões Ativas', icon: Activity },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'logs', label: 'Logs de Segurança', icon: AlertTriangle },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{nonAdminUsers.length}</p>
              <p className="text-gray-400 text-sm">Usuários Totais</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{activeSessions.length}</p>
              <p className="text-gray-400 text-sm">Sessões Ativas</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Ban className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-white">{blockedUsers.length}</p>
              <p className="text-gray-400 text-sm">Usuários Bloqueados</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {securityLogs.filter(log => log.severity === 'high' || log.severity === 'critical').length}
              </p>
              <p className="text-gray-400 text-sm">Alertas de Segurança</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usuários com Múltiplas Sessões */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Usuários com Múltiplas Sessões</h3>
        <div className="space-y-3">
          {nonAdminUsers.map(user => {
            const userActiveSessions = getActiveUserSessions(user.id);
            const uniqueIPs = new Set(userActiveSessions.map(s => s.ipAddress));
            const riskLevel = getSecurityRiskLevel(userSessions, user.id);
            
            if (userActiveSessions.length <= 1) return null;
            
            return (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-white font-bold">{userActiveSessions.length}</p>
                    <p className="text-gray-400 text-xs">Sessões</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">{uniqueIPs.size}</p>
                    <p className="text-gray-400 text-xs">IPs</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(riskLevel)}`}>
                    {riskLevel.toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleTerminateAllSessions(user.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                  >
                    Terminar Todas
                  </button>
                </div>
              </div>
            );
          }).filter(Boolean)}
          
          {nonAdminUsers.filter(user => getActiveUserSessions(user.id).length > 1).length === 0 && (
            <p className="text-gray-400 text-center py-4">Nenhum usuário com múltiplas sessões ativas</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Sessões Ativas ({activeSessions.length})</h3>
        </div>
        
        <div className="p-6">
          {activeSessions.length > 0 ? (
            <div className="space-y-4">
              {activeSessions.map(session => {
                const user = users.find(u => u.id === session.userId);
                const sessionDuration = Math.floor((Date.now() - new Date(session.loginTime).getTime()) / (1000 * 60));
                
                return (
                  <div key={session.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user?.name}</p>
                          <p className="text-gray-400 text-sm">{user?.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-gray-300">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{formatIPAddress(session.ipAddress)}</span>
                          </div>
                          <p className="text-gray-400 text-xs">{session.location}</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-gray-300">
                            <Monitor className="w-4 h-4" />
                            <span className="text-sm">{session.device}</span>
                          </div>
                          <p className="text-gray-400 text-xs">{session.browser}</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-gray-300">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{formatDuration(sessionDuration)}</span>
                          </div>
                          <p className="text-gray-400 text-xs">
                            {new Date(session.loginTime).toLocaleTimeString()}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleTerminateSession(session.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        >
                          Terminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Nenhuma sessão ativa</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Gerenciamento de Usuários</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {nonAdminUsers.map(user => {
              const userActiveSessions = getActiveUserSessions(user.id);
              const userAllSessions = getUserSessions(user.id);
              const uniqueIPs = new Set(userActiveSessions.map(s => s.ipAddress));
              const riskLevel = getSecurityRiskLevel(userSessions, user.id);
              
              return (
                <div key={user.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{user.name}</p>
                          {user.isBlocked && (
                            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">
                              BLOQUEADO
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(riskLevel)}`}>
                            {riskLevel.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        {user.isBlocked && user.blockedReason && (
                          <p className="text-red-400 text-xs mt-1">Motivo: {user.blockedReason}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-white font-bold">{userActiveSessions.length}</p>
                        <p className="text-gray-400 text-xs">Sessões Ativas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold">{uniqueIPs.size}</p>
                        <p className="text-gray-400 text-xs">IPs Únicos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold">{userAllSessions.length}</p>
                        <p className="text-gray-400 text-xs">Total Sessões</p>
                      </div>
                      
                      <div className="flex gap-2">
                        {userActiveSessions.length > 0 && (
                          <button
                            onClick={() => handleTerminateAllSessions(user.id)}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                          >
                            Terminar Sessões
                          </button>
                        )}
                        
                        {user.isBlocked ? (
                          <button
                            onClick={() => handleUnblockUser(user.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlockUser(user.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Mostrar IPs das sessões ativas */}
                  {userActiveSessions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-gray-400 text-xs mb-2">IPs Ativos:</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(uniqueIPs).map(ip => (
                          <span key={ip} className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                            {formatIPAddress(ip)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Todos</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="blocked">Bloqueado</option>
              <option value="multiple_ips">Múltiplos IPs</option>
              <option value="critical">Crítico</option>
              <option value="high">Alto</option>
              <option value="medium">Médio</option>
              <option value="low">Baixo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            Logs de Segurança ({filteredLogs.length})
          </h3>
        </div>
        
        <div className="p-6">
          {filteredLogs.length > 0 ? (
            <div className="space-y-3">
              {filteredLogs.map(log => {
                const user = users.find(u => u.id === log.userId);
                
                return (
                  <div key={log.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {getActionIcon(log.action)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">
                            {user?.name || 'Usuário removido'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(log.severity)}`}>
                            {log.severity.toUpperCase()}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-2">{log.details}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>IP: {formatIPAddress(log.ipAddress)}</span>
                          <span>Ação: {log.action}</span>
                          {log.adminId && (
                            <span>Admin: {users.find(u => u.id === log.adminId)?.name || 'Admin'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              {searchTerm || logFilter !== 'all' 
                ? 'Nenhum log encontrado com os filtros aplicados'
                : 'Nenhum log de segurança disponível'
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Segurança e Monitoramento</h2>
        <p className="text-gray-400">Monitore sessões de usuários e gerencie a segurança da plataforma</p>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
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

        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'sessions' && renderSessions()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'logs' && renderLogs()}
        </div>
      </div>

      {/* Modal de Bloqueio */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Bloquear Usuário</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Motivo do Bloqueio *
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 h-24"
                  placeholder="Descreva o motivo do bloqueio..."
                  required
                />
              </div>
              
              <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg text-sm">
                <p className="font-medium mb-1">⚠️ Atenção:</p>
                <p>Esta ação irá bloquear o usuário e terminar todas as suas sessões ativas.</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setUserToBlock('');
                  setBlockReason('');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmBlockUser}
                disabled={!blockReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Bloquear Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityManagement;