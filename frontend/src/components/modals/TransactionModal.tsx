import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { api } from '../../api/client';
import type { Category, Transaction } from '../../api/client';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select, Label } from '../ui/Input';
import { DatePicker } from '../ui/DatePicker';

interface TransactionModalProps {
  mode: 'INCOME' | 'EXPENSE' | null;
  initialData?: Transaction | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransactionModal({ mode, initialData, onClose, onSuccess }: TransactionModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [txName, setTxName] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategoryId, setTxCategoryId] = useState('');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(initialData && initialData.id);

  useEffect(() => {
    if (!mode) return;

    if (initialData) {
      setTxName(initialData.name || '');
      setTxAmount(String(initialData.amount || ''));
      setTxCategoryId(String(initialData.categoryId || ''));
      setTxDate(initialData.date || new Date().toISOString().split('T')[0]);
    } else {
      setTxName('');
      setTxAmount('');
      setTxDate(new Date().toISOString().split('T')[0]);
    }

    api.getCategories().then((res) => {
      const cats = res || [];
      setCategories(cats);
      if (!initialData || !initialData.categoryId) {
        const filtered = cats.filter((c) => c.type?.toUpperCase() === mode);
        if (filtered.length > 0) {
          setTxCategoryId(String(filtered[0].id));
        } else {
          setTxCategoryId('');
        }
      }
    }).catch(console.error);
  }, [mode, initialData]);

  if (!mode) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!txCategoryId) {
      alert('Please select a category first.');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        name: txName,
        amount: parseFloat(txAmount),
        categoryId: parseInt(txCategoryId),
        date: txDate,
      };

      if (isEdit && initialData) {
        if (mode === 'INCOME') {
          await api.updateIncome(initialData.id, payload);
        } else {
          await api.updateExpense(initialData.id, payload);
        }
      } else {
        if (mode === 'INCOME') {
          await api.createIncome(payload);
        } else {
          await api.createExpense(payload);
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type?.toUpperCase() === mode);

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-surface shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-semibold text-text-primary text-base">
            {isEdit
              ? mode === 'INCOME'
                ? 'Edit income'
                : 'Edit expense'
              : mode === 'INCOME'
                ? 'Log income'
                : 'Log expense'}
          </h3>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary p-1 cursor-pointer rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="modal-tx-name">Description</Label>
            <Input
              id="modal-tx-name"
              type="text"
              placeholder={mode === 'INCOME' ? 'e.g. Salary, Freelance project' : 'e.g. Rent, Grocery shopping'}
              value={txName}
              onChange={(e) => setTxName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="modal-tx-amount">Amount ($)</Label>
            <Input
              id="modal-tx-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="modal-tx-category">Category</Label>
            <Select
              id="modal-tx-category"
              value={txCategoryId}
              onChange={(value) => setTxCategoryId(value)}
              options={
                filteredCategories.length === 0
                  ? [{ label: '— Create a category first —', value: '' }]
                  : filteredCategories.map((c) => ({ label: c.name, value: c.id.toString() }))
              }
            />
          </div>

          <div>
            <Label htmlFor="modal-tx-date">Date</Label>
            <DatePicker
              id="tx-date"
              value={txDate}
              onChange={(date) => setTxDate(date || new Date().toISOString().split('T')[0])}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update transaction' : 'Save transaction'}
            </Button>
          </div>
        </form>
      </Card>
    </div>,
    document.body
  );
}
