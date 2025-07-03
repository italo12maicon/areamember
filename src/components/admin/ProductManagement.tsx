import React, { useState } from 'react';
import { Plus, Edit, Trash2, Lock, Unlock, ExternalLink } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Product, Lesson } from '../../types';
import ProductForm from './ProductForm';

const ProductManagement: React.FC = () => {
  const { products, deleteProduct } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(productId);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gerenciamento de Produtos</h2>
          <p className="text-gray-400">Crie e gerencie os produtos da plataforma</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <div className="aspect-video bg-gray-700 relative">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">Sem imagem</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {product.isBlocked ? (
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Bloqueado
                  </span>
                ) : (
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    Liberado
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{product.title}</h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-3">{product.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>{product.lessons.length} aulas</span>
                {product.unlockAfterDays && (
                  <span>Desbloqueio: {product.unlockAfterDays} dias</span>
                )}
              </div>

              {product.isBlocked && product.unblockLink && (
                <div className="flex items-center gap-1 text-blue-400 text-sm mb-3">
                  <ExternalLink className="w-3 h-3" />
                  <span>Link de desbloqueio configurado</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum produto cadastrado</h3>
          <p className="text-gray-400 mb-4">Comece criando seu primeiro produto</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Criar Primeiro Produto
          </button>
        </div>
      )}

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default ProductManagement;