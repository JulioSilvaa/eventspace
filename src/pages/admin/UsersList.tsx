import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { Loader2, Search, Trash2, Ban, CheckCircle, MoreHorizontal, X, ExternalLink } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  region?: string;
  files?: any[];
  spaces?: { id: string; title: string; status: string }[];
  status: string;
  created_at: string;
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const limit = 10;

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/users', {
        params: { page, limit, search }
      });
      setUsers(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleUserStatusUpdate = async (id: string, newStatus: string) => {
    if (!confirm('Tem certeza?')) return;
    try {
      await adminApi.patch(`/admin/users/${id}/status`, { status: newStatus });
      loadUsers();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar status do usuário');
    }
  };

  const handleSpaceStatusUpdate = async (spaceId: string, newStatus: string) => {
    if (!confirm(`Deseja realmente ${newStatus === 'active' ? 'ativar' : 'desativar'} este espaço?`)) return;
    try {
      await adminApi.patch(`/admin/spaces/${spaceId}/status`, { status: newStatus });

      // Update local state for immediate feedback
      if (selectedUser) {
        setSelectedUser({
          ...selectedUser,
          spaces: selectedUser.spaces?.map(s =>
            s.id === spaceId ? { ...s, status: newStatus } : s
          )
        });

        // Also update the main list
        setUsers(users.map(u =>
          u.id === selectedUser.id ? {
            ...u,
            spaces: u.spaces?.map(s => s.id === spaceId ? { ...s, status: newStatus } : s)
          } : u
        ));
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar status do espaço');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar usuários..."
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
              <th className="p-4 font-medium">Usuário</th>
              <th className="p-4 font-medium">Telefone</th>
              <th className="p-4 font-medium">Região</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Data Cadastro</th>
              <th className="p-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">Nenhum usuário encontrado</td></tr>
            ) : (
              users.map(user => (
                <tr
                  key={user.id}
                  className="text-slate-300 hover:bg-slate-700/50 cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="p-4">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </td>
                  <td className="p-4 text-slate-300">
                    {user.phone || '-'}
                  </td>
                  <td className="p-4 text-slate-300">
                    {user.region || '-'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* Actions intentionally kept separated from row click to prevent accidental triggers */}
                      {user.status !== 'active' && (
                        <button
                          onClick={() => handleUserStatusUpdate(user.id, 'active')}
                          className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg"
                          title="Ativar"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {user.status === 'active' && (
                        <button
                          onClick={() => handleUserStatusUpdate(user.id, 'inactive')}
                          className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg"
                          title="Bloquear"
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

      {/* User Spaces Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Espaços de {selectedUser.name}</h2>
                <p className="text-slate-400 text-sm mt-1">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {!selectedUser.spaces || selectedUser.spaces.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>Este usuário não possui espaços cadastrados.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedUser.spaces.map(space => (
                    <div key={space.id} className="bg-slate-700/30 rounded-lg p-4 flex items-center justify-between border border-slate-700/50">
                      <div>
                        <h3 className="text-white font-medium">{space.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded mt-2 inline-block ${space.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-red-500/10 text-red-500'
                          }`}>
                          {space.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {space.status !== 'active' ? (
                          <button
                            onClick={() => handleSpaceStatusUpdate(space.id, 'active')}
                            className="text-sm px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors font-medium border border-emerald-500/20"
                          >
                            Ativar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSpaceStatusUpdate(space.id, 'inactive')}
                            className="text-sm px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors font-medium border border-red-500/20"
                          >
                            Desativar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UsersList;
