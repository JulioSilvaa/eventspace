import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { Loader2, Search, CheckCircle, Ban, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface AdOwner {
  name: string;
  email: string;
  phone?: string;
}

interface Ad {
  id: string;
  title: string;
  status: string;
  price: number;
  price_type: string;
  created_at: string;
  owner?: AdOwner;
}

const AdsList: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; adId: string; status: string } | null>(null);
  const limit = 10;
  const navigate = useNavigate();

  const loadAds = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/ads', {
        params: { page, limit, search }
      });
      setAds(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadAds();
  };

  const initStatusUpdate = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setConfirmModal({
      isOpen: true,
      adId: id,
      status: newStatus
    });
  };

  const handleStatusUpdate = async () => {
    if (!confirmModal) return;

    try {
      await adminApi.patch(`/admin/ads/${confirmModal.adId}/status`, { status: confirmModal.status });
      loadAds();
      setConfirmModal(null);
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar status');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-8">
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          onConfirm={handleStatusUpdate}
          title={confirmModal.status === 'active' ? 'Ativar Anúncio' : 'Desativar Anúncio'}
          message={`Tem certeza que deseja ${confirmModal.status === 'active' ? 'ativar' : 'desativar'} este anúncio?`}
          type={confirmModal.status === 'active' ? 'default' : 'warning'}
          confirmText={confirmModal.status === 'active' ? 'Ativar' : 'Desativar'}
        />
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Anúncios</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar anúncios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <button type="submit" className="bg-blue-600 px-4 py-2 rounded-lg text-white font-medium hover:bg-blue-700">Buscar</button>
        </form>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-sm">
              <th className="p-4 font-medium">Título</th>
              <th className="p-4 font-medium">Proprietário</th>
              <th className="p-4 font-medium">Valor</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Data</th>
              <th className="p-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></td></tr>
            ) : ads.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">Nenhum anúncio encontrado</td></tr>
            ) : (
              ads.map(ad => (
                <tr key={ad.id} className="text-slate-300 hover:bg-slate-700/50">
                  <td className="p-4">
                    <p className="text-white font-medium truncate max-w-xs" title={ad.title}>{ad.title}</p>
                  </td>
                  <td className="p-4">
                    {ad.owner ? (
                      <div>
                        <p className="text-white text-sm font-medium">{ad.owner.name}</p>
                        <p className="text-xs text-slate-500">{ad.owner.email}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    R$ {ad.price} <span className="text-xs text-slate-500">/ {ad.price_type === 'weekend' ? 'fim de semana' : 'dia'}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${ad.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                      {ad.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(ad.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`/anuncio/${ad.id}`}
                        target="_blank"
                        className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      {ad.status !== 'active' && (
                        <button
                          onClick={() => initStatusUpdate(ad.id, ad.status)}
                          className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg"
                          title="Ativar"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {ad.status === 'active' && (
                        <button
                          onClick={() => initStatusUpdate(ad.id, ad.status)}
                          className="p-2 hover:bg-yellow-500/10 text-yellow-500 rounded-lg"
                          title="Desativar"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {total > limit && (
          <div className="flex justify-center p-4 gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 rounded border border-slate-600 text-slate-400 disabled:opacity-50 hover:bg-slate-700"
            >
              Anterior
            </button>
            <span className="text-slate-400 py-1">Página {page} de {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 rounded border border-slate-600 text-slate-400 disabled:opacity-50 hover:bg-slate-700"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdsList;
