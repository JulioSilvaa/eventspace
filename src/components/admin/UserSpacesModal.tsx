import React, { useEffect, useState } from 'react';
import { X, Loader2, Play, Pause, ExternalLink } from 'lucide-react';
import adminApi from '../../services/adminApi';
import { toast } from 'react-hot-toast'

interface Space {
  id: string;
  title: string;
  status: 'active' | 'inactive';
  category?: { name: string };
  city?: string;
  state?: string;
  created_at: string;
  subscription?: {
    plan: string;
    price: number;
    status: string;
    coupon_code?: string;
    coupon_name?: string;
  };
}

interface UserSpacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export default function UserSpacesModal({ isOpen, onClose, userId, userName }: UserSpacesModalProps) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadSpaces();
    }
  }, [isOpen, userId]);

  const loadSpaces = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get('/admin/ads', {
        params: { ownerId: userId, limit: 100 }
      });
      setSpaces(response.data.data);
    } catch (error) {
      console.error('Error loading user spaces:', error);
      toast.error('Não foi possível carregar os anúncios do usuário');
    } finally {
      setLoading(false);
    }
  };

  const toggleSpaceStatus = async (space: Space) => {
    setActionLoading(space.id);
    const newStatus = space.status === 'active' ? 'inactive' : 'active';
    try {
      await adminApi.patch(`/admin/ads/${space.id}/status`, { status: newStatus });

      setSpaces(prev => prev.map(s =>
        s.id === space.id ? { ...s, status: newStatus } : s
      ));

      toast.success(`Anúncio ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error) {
      console.error('Error updating space status:', error);
      toast.error('Erro ao atualizar status do anúncio');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-850 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-white">Anúncios do Usuário</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-400 text-sm">{userName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : spaces.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>Este usuário não possui anúncios cadastrados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {spaces.map(space => (
                <div key={space.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-white truncate max-w-[250px]" title={space.title}>
                        {space.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${space.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                        {space.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                      {space.subscription && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {space.subscription.plan} (R$ {Number(space.subscription.price).toFixed(2)})
                          </span>
                          {(space.subscription.coupon_code || space.subscription.coupon_name) && (
                            <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs border border-blue-500/20">
                              {space.subscription.coupon_name || space.subscription.coupon_code}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span>{space.category?.name || 'Sem categoria'}</span>
                      {space.city && <span>• {space.city}/{space.state}</span>}
                      <span>• {new Date(space.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleSpaceStatus(space)}
                      disabled={!!actionLoading}
                      className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${space.status === 'active'
                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                        }`}
                    >
                      {actionLoading === space.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : space.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span className="hidden sm:inline">Desativar</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span className="hidden sm:inline">Ativar</span>
                        </>
                      )}
                    </button>
                    {/* Link to view public ad could be added here if needed */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-850 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
