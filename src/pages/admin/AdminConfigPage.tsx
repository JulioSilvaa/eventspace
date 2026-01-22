import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, DollarSign } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  type: string; // 'SPACE', 'SERVICE'
  allowed_pricing_models?: PricingModel[];
}

interface PricingModel {
  id: string;
  key: string; // 'daily', 'hourly'
  label: string; // 'Por Dia'
  unit?: string; // 'dia'
  description?: string;
}

const AdminConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'pricing'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [pricingModels, setPricingModels] = useState<PricingModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Edit/Create State
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingModel, setEditingModel] = useState<Partial<PricingModel> | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catsRes, modelsRes] = await Promise.all([
        apiClient.get<Category[]>('/api/admin/config/categories'),
        apiClient.get<PricingModel[]>('/api/admin/config/pricing-models')
      ]);

      if (catsRes.data) setCategories(catsRes.data);
      if (modelsRes.data) setPricingModels(modelsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Category Actions ---
  const handleSaveCategory = async () => {
    if (!editingCategory?.name) return toast.error('Nome obrigatório');

    try {
      if (editingCategory.id) {
        await apiClient.put(`/api/admin/config/categories/${editingCategory.id}`, editingCategory);
        toast.success('Categoria atualizada');
      } else {
        await apiClient.post('/api/admin/config/categories', editingCategory);
        toast.success('Categoria criada');
      }
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Tem certeza? Isso pode afetar anúncios existentes.')) return;
    try {
      await apiClient.delete(`/api/admin/config/categories/${id}`);
      toast.success('Categoria removida');
      fetchData();
    } catch (error) {
      toast.error('Erro ao remover categoria');
    }
  };

  // --- Pricing Model Actions ---
  const handleSaveModel = async () => {
    if (!editingModel?.key || !editingModel?.label) return toast.error('Chave e Rótulo obrigatórios');

    try {
      if (editingModel.id) {
        await apiClient.put(`/api/admin/config/pricing-models/${editingModel.id}`, editingModel);
        toast.success('Modelo atualizado');
      } else {
        await apiClient.post('/api/admin/config/pricing-models', editingModel);
        toast.success('Modelo criado');
      }
      setEditingModel(null);
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar modelo');
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm('Tem certeza?')) return;
    try {
      await apiClient.delete(`/api/admin/config/pricing-models/${id}`);
      toast.success('Modelo removido');
      fetchData();
    } catch (error) {
      toast.error('Erro ao remover modelo');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-500 mt-1">Gerencie categorias e modelos de cobrança</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-4 px-4 font-medium transition-colors border-b-2 ${activeTab === 'categories'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Categorias ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`pb-4 px-4 font-medium transition-colors border-b-2 ${activeTab === 'pricing'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Modelos de Preço ({pricingModels.length})
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-700">Lista de Categorias</h3>
            <button
              onClick={() => setEditingCategory({ type: 'SPACE', allowed_pricing_models: [] })}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </button>
          </div>

          {editingCategory && (
            <div className="p-6 bg-blue-50 border-b border-blue-100 animate-in fade-in slide-in-from-top-4">
              <h4 className="font-bold text-blue-900 mb-4">
                {editingCategory.id ? 'Editar Categoria' : 'Nova Categoria'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    value={editingCategory.name || ''}
                    onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: Chácara"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={editingCategory.type || 'SPACE'}
                    onChange={e => setEditingCategory({ ...editingCategory, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="SPACE">Espaço</option>
                    <option value="SERVICE">Serviço</option>
                    <option value="EQUIPMENT">Equipamento</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelos de Preço Permitidos</label>
                <div className="flex flex-wrap gap-2">
                  {pricingModels.map(model => {
                    const isSelected = editingCategory.allowed_pricing_models?.some((m: any) => m.id === model.id);
                    return (
                      <button
                        key={model.id}
                        onClick={() => {
                          const current = editingCategory.allowed_pricing_models || [];
                          const newModels = isSelected
                            ? current.filter((m: any) => m.id !== model.id)
                            : [...current, { id: model.id }]; // minimal object for ID
                          setEditingCategory({ ...editingCategory, allowed_pricing_models: newModels as any });
                        }}
                        className={`px-3 py-1 rounded-full text-xs border ${isSelected
                          ? 'bg-blue-100 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {model.label} ({model.key})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {categories.map(category => (
              <div key={category.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase tracking-wide">{category.type}</span>
                      {category.allowed_pricing_models && category.allowed_pricing_models.length > 0 && (
                        <span className="text-xs text-gray-400">
                          • {category.allowed_pricing_models.length} modelos
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && !isLoading && (
              <div className="p-8 text-center text-gray-500">Nenhuma categoria encontrada.</div>
            )}
          </div>
        </div>
      )}

      {/* Pricing Models Tab */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-700">Modelos de Preço</h3>
            <button
              onClick={() => setEditingModel({})}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Modelo
            </button>
          </div>

          {editingModel && (
            <div className="p-6 bg-green-50 border-b border-green-100 animate-in fade-in slide-in-from-top-4">
              <h4 className="font-bold text-green-900 mb-4">
                {editingModel.id ? 'Editar Modelo' : 'Novo Modelo'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chave (Código)</label>
                  <input
                    value={editingModel.key || ''}
                    onChange={e => setEditingModel({ ...editingModel, key: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                    placeholder="Ex: diaria"
                  />
                  <p className="text-xs text-gray-500 mt-1">Usado internamente (minúsculo, sem espaços)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rótulo (Visual)</label>
                  <input
                    value={editingModel.label || ''}
                    onChange={e => setEditingModel({ ...editingModel, label: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: Por Dia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade (Sfixo)</label>
                  <input
                    value={editingModel.unit || ''}
                    onChange={e => setEditingModel({ ...editingModel, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: dia (aparece como /dia)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input
                    value={editingModel.description || ''}
                    onChange={e => setEditingModel({ ...editingModel, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: Valor cobrado por dia de uso"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingModel(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveModel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {pricingModels.map(model => (
              <div key={model.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{model.label}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{model.key}</code>
                      {model.unit && <span>/ {model.unit}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingModel(model)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteModel(model.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {pricingModels.length === 0 && !isLoading && (
              <div className="p-8 text-center text-gray-500">Nenhum modelo encontrado.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConfigPage;
