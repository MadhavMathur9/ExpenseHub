import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { api } from '../api/client';
import type { Category } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Select, Label } from '../components/ui/Input';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // New category form
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.getCategories();
      setCategories(res || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setSaving(true);
      await api.createCategory({ name: name.trim(), type, icon: '🏷️' });
      setName('');
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure? Deleting this category may affect linked transactions.')) return;
    try {
      await api.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category.');
    }
  };

  const incomeCategories = categories.filter((c) => c.type === 'INCOME');
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Categories Management</h2>
        <p className="text-xs text-text-secondary">Organize transactions into custom income and expense buckets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Category Form Card */}
        <Card className="lg:col-span-1 h-fit">
          <h3 className="font-semibold text-text-primary text-[15px] mb-1">Add new category</h3>
          <p className="text-xs text-text-secondary mb-4">Create a custom label for budget tracking.</p>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <Label htmlFor="cat-name">Category name</Label>
              <Input
                id="cat-name"
                type="text"
                placeholder="e.g. Subscriptions, Consulting"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="cat-type">Category type</Label>
              <Select
                id="cat-type"
                value={type}
                onChange={(value) => setType(value as 'INCOME' | 'EXPENSE')}
                options={[
                  { label: 'Expense Category', value: 'EXPENSE' },
                  { label: 'Income Category', value: 'INCOME' },
                ]}
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              <Plus className="w-4 h-4 mr-1.5" />
              {saving ? 'Creating...' : 'Create category'}
            </Button>
          </form>
        </Card>

        {/* Categories List Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Income Categories */}
          <Card>
            <div className="flex items-center justify-between mb-3 border-b border-border pb-2.5">
              <div className="flex items-center space-x-2">
                <Badge dotColor="#1A7F4E">INCOME</Badge>
                <span className="text-xs text-text-secondary font-medium">({incomeCategories.length})</span>
              </div>
            </div>

            {loading ? (
              <p className="text-xs text-text-tertiary py-4">Loading categories...</p>
            ) : incomeCategories.length === 0 ? (
              <p className="text-xs text-text-tertiary py-4">No income categories defined yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {incomeCategories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-[8px] border border-border bg-surface hover:bg-hover-row transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Tag className="w-3.5 h-3.5 text-positive" />
                      <span className="text-xs font-medium text-text-primary">{c.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1 text-text-tertiary hover:text-negative rounded transition-colors cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Expense Categories */}
          <Card>
            <div className="flex items-center justify-between mb-3 border-b border-border pb-2.5">
              <div className="flex items-center space-x-2">
                <Badge dotColor="#6B6B68">EXPENSE</Badge>
                <span className="text-xs text-text-secondary font-medium">({expenseCategories.length})</span>
              </div>
            </div>

            {loading ? (
              <p className="text-xs text-text-tertiary py-4">Loading categories...</p>
            ) : expenseCategories.length === 0 ? (
              <p className="text-xs text-text-tertiary py-4">No expense categories defined yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {expenseCategories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-[8px] border border-border bg-surface hover:bg-hover-row transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Tag className="w-3.5 h-3.5 text-text-secondary" />
                      <span className="text-xs font-medium text-text-primary">{c.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1 text-text-tertiary hover:text-negative rounded transition-colors cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
