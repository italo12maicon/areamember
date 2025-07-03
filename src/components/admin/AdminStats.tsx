import React from 'react';
import { Users, BookOpen, Eye, TrendingUp, Package } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const AdminStats: React.FC = () => {
  const { courses, products, users } = useData();

  const stats = [
    {
      title: 'Total de Usuários',
      value: users.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      title: 'Total de Cursos',
      value: courses.length,
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      change: '+8%'
    },
    {
      title: 'Total de Produtos',
      value: products.length,
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      change: '+15%'
    },
    {
      title: 'Itens Bloqueados',
      value: courses.filter(c => c.isBlocked).length + products.filter(p => p.isBlocked).length,
      icon: Eye,
      color: 'from-yellow-500 to-yellow-600',
      change: '0%'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
        <p className="text-gray-400">Visão geral do sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4">Atividade Recente</h3>
        <div className="space-y-4">
          {users.slice(0, 5).map((user, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
              <div className="text-gray-400 text-sm">
                {new Date(user.registrationDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStats;