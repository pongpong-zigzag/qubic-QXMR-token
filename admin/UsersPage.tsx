import { useState, useEffect, useMemo } from 'react';
import { Search, Copy, Check, Edit2, Save, X, Trophy, RotateCcw, ArrowUpDown, Users as UsersIcon, DollarSign, TrendingUp, Gamepad2 } from 'lucide-react';
import { getAllUsers, resetAllBalances, updateUser, type AdminUser } from './services/admin.service';
import { toast } from 'react-hot-toast';

type SortField = 'amount' | 'paid' | 'highest' | 'gameleft' | 'walletid';
type SortDirection = 'asc' | 'desc';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('amount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<AdminUser>>({});
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleResetBalances = async () => {
    if (!confirm('Are you sure you want to reset ALL users\' balances to 0? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await resetAllBalances();
      toast.success(result.message);
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset balances');
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user.walletid);
    setEditValues({
      amount: user.amount,
      gameleft: user.gameleft,
      paid: user.paid,
      highest: user.highest,
    });
  };

  const handleSave = async (walletid: string) => {
    try {
      await updateUser(walletid, editValues);
      toast.success('User updated successfully');
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditValues({});
  };

  const copyWalletId = async (walletid: string) => {
    try {
      await navigator.clipboard.writeText(walletid);
      setCopiedWallet(walletid);
      toast.success('Wallet ID copied!');
      setTimeout(() => setCopiedWallet(null), 2000);
    } catch (error) {
      toast.error('Failed to copy wallet ID');
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;

    if (searchQuery.trim()) {
      filtered = filtered.filter((user) =>
        user.walletid.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered = [...filtered].sort((a, b) => {
      let aVal: number | string = a[sortField];
      let bVal: number | string = b[sortField];

      if (sortField === 'amount' || sortField === 'paid' || sortField === 'highest' || sortField === 'gameleft') {
        aVal = parseFloat(aVal || '0');
        bVal = parseFloat(bVal || '0');
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return filtered;
  }, [users, searchQuery, sortField, sortDirection]);

  const leaderboardUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => parseFloat(b.amount || '0') - parseFloat(a.amount || '0'))
      .slice(0, 100);
  }, [users]);

  const totalAmount = useMemo(() => users.reduce((sum, u) => sum + parseFloat(u.amount || '0'), 0), [users]);
  const totalPaid = useMemo(() => users.reduce((sum, u) => sum + parseFloat(u.paid || '0'), 0), [users]);
  const avgHighest = useMemo(() => {
    const sum = users.reduce((s, u) => s + parseFloat(u.highest || '0'), 0);
    return users.length > 0 ? sum / users.length : 0;
  }, [users]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-cyan-500/20"></div>
          </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-strong rounded-2xl p-6 hover-lift border border-blue-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium mb-1">Total Users</p>
              <p className="text-3xl font-bold text-white">{users.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="glass-strong rounded-2xl p-6 hover-lift border border-cyan-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-white">
                {totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="glass-strong rounded-2xl p-6 hover-lift border border-yellow-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium mb-1">Total Paid</p>
              <p className="text-3xl font-bold text-white">
                {totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="glass-strong rounded-2xl p-6 hover-lift border border-green-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium mb-1">Avg Highest</p>
              <p className="text-3xl font-bold text-white">
                {Math.round(avgHighest).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Users Management</h1>
          <p className="text-white">Manage and monitor all user accounts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 text-white rounded-xl hover:from-yellow-600 hover:via-orange-600 hover:to-yellow-600 transition-all shadow-2xl shadow-yellow-500/50 hover-lift flex items-center space-x-2 font-semibold"
          >
            <Trophy className="w-5 h-5" />
            <span>{showLeaderboard ? 'Hide' : 'Show'} Leaderboard</span>
          </button>
          <button
            onClick={handleResetBalances}
            className="px-6 py-3 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white rounded-xl hover:from-red-600 hover:via-orange-600 hover:to-red-600 transition-all shadow-2xl shadow-red-500/50 hover-lift flex items-center space-x-2 font-semibold"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset All Balances</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl"></div>
        <div className="relative glass-strong rounded-2xl p-1">
          <div className="flex items-center">
            <Search className="absolute left-4 text-white w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Wallet ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-transparent border-0 text-white placeholder-gray-400 focus:outline-none focus:ring-0 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="glass-strong rounded-2xl p-6 shadow-2xl border border-yellow-500/30 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Top 100 Leaderboard
              </h2>
            </div>
            <button
              onClick={() => setShowLeaderboard(false)}
              className="p-2 glass rounded-lg text-white hover:text-white hover:bg-red-500/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/30">
                  <th className="text-left py-4 px-4 text-white font-bold">Rank</th>
                  <th className="text-left py-4 px-4 text-white font-bold">Wallet ID</th>
                  <th className="text-right py-4 px-4 text-white font-bold">Amount</th>
                  <th className="text-right py-4 px-4 text-white font-bold">Highest</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardUsers.map((user, index) => (
                  <tr key={user.walletid} className="border-b border-yellow-500/10 hover:bg-yellow-500/10 transition-all">
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-bold text-sm">
                        #{index + 1}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono text-sm">{user.walletid.slice(0, 20)}...</span>
                        <button
                          onClick={() => copyWalletId(user.walletid)}
                          className="p-1.5 glass rounded-lg text-white hover:text-white hover:bg-blue-500/20 transition-all"
                        >
                          {copiedWallet === user.walletid ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-white font-bold text-lg">
                        {parseFloat(user.amount || '0').toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-white">
                      {parseFloat(user.highest || '0').toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-strong rounded-2xl shadow-2xl overflow-hidden border border-blue-500/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600/30 via-cyan-600/30 to-blue-600/30 border-b border-blue-500/30">
                <th className="text-left py-5 px-6">
                  <button
                    onClick={() => handleSort('walletid')}
                    className="flex items-center space-x-2 text-white hover:text-white transition-colors font-bold"
                  >
                    <span>Wallet ID</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-5 px-6">
                  <button
                    onClick={() => handleSort('amount')}
                    className="flex items-center space-x-2 text-white hover:text-white transition-colors font-bold ml-auto"
                  >
                    <span>Amount</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-5 px-6">
                  <button
                    onClick={() => handleSort('paid')}
                    className="flex items-center space-x-2 text-white hover:text-white transition-colors font-bold ml-auto"
                  >
                    <span>Paid</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-5 px-6">
                  <button
                    onClick={() => handleSort('highest')}
                    className="flex items-center space-x-2 text-white hover:text-white transition-colors font-bold ml-auto"
                  >
                    <span>Highest</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-5 px-6">
                  <button
                    onClick={() => handleSort('gameleft')}
                    className="flex items-center space-x-2 text-white hover:text-white transition-colors font-bold ml-auto"
                  >
                    <span>Games Left</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-center py-5 px-6 text-white font-bold">Leaderboard</th>
                <th className="text-left py-5 px-6 text-white font-bold">Last Played</th>
                <th className="text-center py-5 px-6 text-white font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-white text-lg">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredAndSortedUsers.map((user, index) => (
                  <tr
                    key={user.walletid}
                    className={`border-b border-blue-500/10 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 transition-all ${
                      index % 2 === 0 ? 'bg-white/5' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono text-sm">{user.walletid}</span>
                        <button
                          onClick={() => copyWalletId(user.walletid)}
                          className="p-1.5 glass rounded-lg text-white hover:text-white hover:bg-blue-500/20 transition-all"
                          title="Copy Wallet ID"
                        >
                          {copiedWallet === user.walletid ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {editingUser === user.walletid ? (
                        <input
                          type="number"
                          value={editValues.amount || ''}
                          onChange={(e) => setEditValues({ ...editValues, amount: e.target.value })}
                          className="w-28 px-3 py-2 glass border border-cyan-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {parseFloat(user.amount || '0').toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {editingUser === user.walletid ? (
                        <input
                          type="number"
                          value={editValues.paid || ''}
                          onChange={(e) => setEditValues({ ...editValues, paid: e.target.value })}
                          className="w-28 px-3 py-2 glass border border-yellow-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      ) : (
                        <span className="text-white font-semibold">{parseFloat(user.paid || '0').toLocaleString()}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {editingUser === user.walletid ? (
                        <input
                          type="number"
                          value={editValues.highest || ''}
                          onChange={(e) => setEditValues({ ...editValues, highest: e.target.value })}
                          className="w-28 px-3 py-2 glass border border-green-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <span className="text-white font-semibold">{parseFloat(user.highest || '0').toLocaleString()}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {editingUser === user.walletid ? (
                        <input
                          type="number"
                          value={editValues.gameleft || ''}
                          onChange={(e) => setEditValues({ ...editValues, gameleft: e.target.value })}
                          className="w-28 px-3 py-2 glass border border-blue-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-white font-semibold">{user.gameleft}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {user.leaderboard_access === '1' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-white border border-green-500/30">
                          ✓ Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-white border border-gray-500/30">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-white text-sm">
                      {user.lastplayed ? new Date(user.lastplayed).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        {editingUser === user.walletid ? (
                          <>
                            <button
                              onClick={() => handleSave(user.walletid)}
                              className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg text-white hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/50 hover-lift"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg text-white hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/50 hover-lift"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg text-white hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/50 hover-lift"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
