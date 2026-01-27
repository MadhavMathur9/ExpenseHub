import { useEffect, useState, useCallback } from 'react';
import { Plus, Download, Trash2, Pencil, Search, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import type { Transaction, Category, FilterParams } from '../api/client';
import { formatCurrency, formatDate } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Select, Label } from '../components/ui/Input';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { TransactionModal } from '../components/modals/TransactionModal';

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterParams>({
    type: 'ALL',
    startDate: null,
    endDate: null,
    keyword: null,
    sortField: 'date',
    sortOrder: 'desc',
  });

  // Modal State
  const [modalMode, setModalMode] = useState<'INCOME' | 'EXPENSE' | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchFilteredTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.filterTransactions(filters);
      setTransactions(res || []);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchFilteredTransactions();
  }, [fetchFilteredTransactions]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await api.exportExcel();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expensehub_report.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const handleOpenCreate = (mode: 'INCOME' | 'EXPENSE') => {
    setEditingTx(null);
    setModalMode(mode);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setModalMode(tx.type);
  };

  const handleDelete = async (id: number, type: 'INCOME' | 'EXPENSE') => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      if (type === 'INCOME') await api.deleteIncome(id);
      else await api.deleteExpense(id);
      fetchFilteredTransactions();
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction.');
    }
  };

  const getCategoryName = (catId?: number | null, catName?: string) => {
    if (catName && catName !== 'General') return catName;
    if (catId) {
      const match = categories.find((c) => c.id === catId);
      if (match) return match.name;
    }
    return catName || 'General';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Transaction Ledger</h2>
          <p className="text-xs text-text-secondary">View, filter, edit, and manage income and expense records.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export Excel'}
          </Button>
          <Button variant="secondary" onClick={() => handleOpenCreate('INCOME')}>
            <Plus className="w-4 h-4 mr-1.5 text-positive" />
            Income
          </Button>
          <Button onClick={() => handleOpenCreate('EXPENSE')}>
            <Plus className="w-4 h-4 mr-1.5" />
            Expense
          </Button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          {/* Keyword search */}
          <div className="md:col-span-2">
            <Label htmlFor="search-keyword">Search</Label>
            <div className="relative">
              <Input
                id="search-keyword"
                type="text"
                placeholder="Merchant or description..."
                value={filters.keyword || ''}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value || null })}
                className="pl-9"
              />
              <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <Label htmlFor="filter-type">Type</Label>
            <Select
              id="filter-type"
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
              options={[
                { label: 'All Types', value: 'ALL' },
                { label: 'Income Only', value: 'INCOME' },
                { label: 'Expense Only', value: 'EXPENSE' },
              ]}
            />
          </div>

          {/* Category Filter */}
          <div>
            <Label htmlFor="filter-category">Category</Label>
            <Select
              id="filter-category"
              value={filters.categoryId || ''}
              onChange={(value) =>
                setFilters({ ...filters, categoryId: value ? Number(value) : null })
              }
              options={[
                { label: 'All Categories', value: '' },
                ...categories.map((c) => ({ label: c.name, value: c.id.toString() })),
              ]}
            />
          </div>

          {/* Date Range Filter */}
          <div className="md:col-span-2">
            <DateRangeFilter
              startDate={filters.startDate ? new Date(filters.startDate) : null}
              endDate={filters.endDate ? new Date(filters.endDate) : null}
              onStartDateChange={(date) => setFilters({ ...filters, startDate: date ? date.toISOString() : null })}
              onEndDateChange={(date) => setFilters({ ...filters, endDate: date ? date.toISOString() : null })}
            />
          </div>
        </div>

        {/* Sort options & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="text-text-secondary">Sort by:</span>
              <div className="w-32">
                <Select
                  value={filters.sortField}
                  onChange={(value) => setFilters({ ...filters, sortField: value })}
                  options={[
                    { label: 'Date', value: 'date' },
                    { label: 'Amount', value: 'amount' },
                  ]}
                  className="bg-transparent border-none py-1 h-7 text-xs font-medium text-text-primary"
                />
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-text-secondary">Order:</span>
              <div className="w-32">
                <Select
                  value={filters.sortOrder}
                  onChange={(value) => setFilters({ ...filters, sortOrder: value })}
                  options={[
                    { label: 'Newest first', value: 'desc' },
                    { label: 'Oldest first', value: 'asc' },
                  ]}
                  className="bg-transparent border-none py-1 h-7 text-xs font-medium text-text-primary"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              setFilters({
                type: 'ALL',
                categoryId: null,
                startDate: null,
                endDate: null,
                keyword: null,
                sortField: 'date',
                sortOrder: 'desc',
              })
            }
            className="text-text-secondary hover:text-text-primary transition-colors flex items-center cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset filters
          </button>
        </div>
      </Card>

      {/* Ledger Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-strong bg-hover-row/50 text-text-secondary font-medium">
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-tertiary">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-tertiary">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  return (
                    <tr key={tx.id} className="hover:bg-hover-row transition-colors">
                      <td className="py-3.5 px-4 font-medium text-text-primary">{tx.name}</td>
                      <td className="py-3.5 px-4">
                        <Badge>{getCategoryName(tx.categoryId, tx.categoryName)}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary font-mono tabular-nums">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge dotColor={isIncome ? '#1A7F4E' : '#6B6B68'}>{tx.type}</Badge>
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-mono tabular-nums font-medium ${
                          isIncome ? 'text-positive' : 'text-negative'
                        }`}
                      >
                        {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1 text-text-tertiary hover:text-accent rounded transition-colors cursor-pointer"
                            title="Edit transaction"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id, tx.type)}
                            className="p-1 text-text-tertiary hover:text-negative rounded transition-colors cursor-pointer"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Shared Transaction Modal */}
      <TransactionModal
        mode={modalMode}
        initialData={editingTx}
        onClose={() => {
          setModalMode(null);
          setEditingTx(null);
        }}
        onSuccess={fetchFilteredTransactions}
      />
    </div>
  );
}
