import { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown, CreditCard, Hash, DollarSign, TrendingUp } from 'lucide-react';
import { getAllTransactions, type AdminTransaction } from './services/admin.service';
import { toast } from 'react-hot-toast';

type SortField = 'id' | 'walletid' | 'hash' | 'paid';
type SortDirection = 'asc' | 'desc';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchField, setSearchField] = useState<'all' | 'walletid' | 'hash' | 'paid'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load transactions');
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

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((tx) => {
        if (searchField === 'all') {
          return (
            tx.walletid.toLowerCase().includes(query) ||
            tx.hash.toLowerCase().includes(query) ||
            tx.paid.toLowerCase().includes(query)
          );
        } else if (searchField === 'walletid') {
          return tx.walletid.toLowerCase().includes(query);
        } else if (searchField === 'hash') {
          return tx.hash.toLowerCase().includes(query);
        } else if (searchField === 'paid') {
          return tx.paid.toLowerCase().includes(query);
        }
        return true;
      });
    }

    filtered = [...filtered].sort((a, b) => {
      let aVal: number | string = a[sortField];
      let bVal: number | string = b[sortField];

      if (sortField === 'id' || sortField === 'paid') {
        aVal = sortField === 'id' ? aVal : parseFloat(aVal as string || '0');
        bVal = sortField === 'id' ? bVal : parseFloat(bVal as string || '0');
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return filtered;
  }, [transactions, searchQuery, sortField, sortDirection, searchField]);

  const totalTransactions = transactions.length;
  const totalPaid = useMemo(() => transactions.reduce((sum, tx) => sum + parseFloat(tx.paid || '0'), 0), [transactions]);
  const avgPaid = useMemo(() => {
    const sum = transactions.reduce((s, tx) => s + parseFloat(tx.paid || '0'), 0);
    return transactions.length > 0 ? sum / transactions.length : 0;
  }, [transactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500/30 border-t-cyan-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-500/20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-strong rounded-2xl p-6 hover-lift border border-cyan-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium mb-1">Total Transactions</p>
              <p className="text-3xl font-bold text-white">
                {totalTransactions}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="glass-strong rounded-2xl p-6 hover-lift border border-green-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium mb-1">Total Paid</p>
              <p className="text-3xl font-bold text-white">
                {totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="glass-strong rounded-2xl p-6 hover-lift border border-blue-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium mb-1">Average Paid</p>
              <p className="text-3xl font-bold text-white">
                {Math.round(avgPaid).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Transactions Management</h1>
        <p className="text-white">View and manage all transaction records</p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
          <div className="relative glass-strong rounded-2xl p-1">
            <div className="flex items-center">
              <Search className="absolute left-4 text-white w-5 h-5" />
              <input
                type="text"
                placeholder={`Search by ${searchField === 'all' ? 'Wallet ID, Hash, or Paid' : searchField}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-transparent border-0 text-white placeholder-gray-400 focus:outline-none focus:ring-0 text-lg"
              />
            </div>
          </div>
        </div>
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value as typeof searchField)}
          className="px-6 py-4 glass-strong border border-cyan-500/30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-semibold hover-lift"
        >
          <option value="all" className="bg-gray-900">All Fields</option>
          <option value="walletid" className="bg-gray-900">Wallet ID</option>
          <option value="hash" className="bg-gray-900">Hash</option>
          <option value="paid" className="bg-gray-900">Paid</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="glass-strong rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-cyan-600/30 border-b border-cyan-500/30">
                <th className="text-left py-5 px-6">
                  <button
                    onClick={() => handleSort('id')}
                    className="flex items-center space-x-2 text-white hover:text-white transition-colors font-bold"
                  >
                    <span>ID</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-5 px-6">
                  <button
                    onClick={() => handleSort('walletid')}
                    className="flex items-center space-x-2 text-white hover:text-white transition-colors font-bold"
                  >
                    <span>Wallet ID</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-5 px-6">
                  <button
                    onClick={() => handleSort('hash')}
                    className="flex items-center space-x-2 text-white hover:text-white transition-colors font-bold"
                  >
                    <Hash className="w-4 h-4" />
                    <span>Transaction Hash</span>
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
                <th className="text-left py-5 px-6 text-white font-bold">Col1</th>
                <th className="text-left py-5 px-6 text-white font-bold">Col2</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white text-lg">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredAndSortedTransactions.map((tx, index) => (
                  <tr
                    key={tx.id}
                    className={`border-b border-cyan-500/10 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 transition-all ${
                      index % 2 === 0 ? 'bg-white/5' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-bold text-sm">
                        #{tx.id}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-white font-mono text-sm">{tx.walletid}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-white font-mono text-xs break-all">{tx.hash}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-white font-bold text-lg">
                        {parseFloat(tx.paid || '0').toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white text-sm">{tx.col1 || '-'}</td>
                    <td className="py-4 px-6 text-white text-sm">{tx.col2 || '-'}</td>
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
