import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import {
  Target, Plus, X, Home, Laptop, Car, Plane, GraduationCap,
  Gift, PiggyBank, Heart, Briefcase, Flag, Pencil, Trash2,
  TrendingUp, TrendingDown, Sparkles, RefreshCw,
} from 'lucide-react';
import { api } from '../api/client';
import type { Milestone, MilestonePayload } from '../api/client';
import { formatCurrency } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';

// ─── Icon picker config ───────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  home: Home,
  laptop: Laptop,
  car: Car,
  plane: Plane,
  'graduation-cap': GraduationCap,
  gift: Gift,
  'piggy-bank': PiggyBank,
  heart: Heart,
  briefcase: Briefcase,
  target: Target,
};

type Period = 'monthly' | 'quarterly' | 'yearly' | 'total';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
  { key: 'total', label: 'Total' },
];

function MilestoneIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || Flag;
  return <Icon className={className || 'w-4 h-4'} />;
}

// ─── Goal Modal ───────────────────────────────────────────────────────────────
interface GoalModalProps {
  initial?: Milestone | null;
  onClose: () => void;
  onSuccess: () => void;
}

function GoalModal({ initial, onClose, onSuccess }: GoalModalProps) {
  const isEdit = Boolean(initial);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? 'target');
  const [targetAmount, setTargetAmount] = useState(initial?.targetAmount ? String(initial.targetAmount) : '');
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) {
      setError('Title and target amount are required.');
      return;
    }
    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    const payload: MilestonePayload = {
      title: title.trim(),
      icon,
      targetAmount: amount,
      targetDate: targetDate || undefined,
    };
    try {
      setLoading(true);
      setError(null);
      if (isEdit && initial) {
        await api.updateMilestone(initial.id, payload);
      } else {
        await api.createMilestone(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save goal.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Modal */}
      <div className="relative bg-surface rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-text-primary">
            {isEdit ? 'Edit goal' : 'Add goal'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-hover-row transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="goal-title">Title</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. House down payment"
            />
          </div>

          {/* Icon picker */}
          <div>
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {Object.entries(ICON_MAP).map(([key, Ic]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  className={`w-9 h-9 flex items-center justify-center rounded-[8px] border transition-colors ${
                    icon === key
                      ? 'border-accent bg-accent-subtle text-accent'
                      : 'border-border text-text-secondary hover:text-text-primary hover:bg-hover-row'
                  }`}
                  title={key}
                >
                  <Ic className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Target amount */}
          <div>
            <Label htmlFor="goal-amount">Target amount</Label>
            <Input
              id="goal-amount"
              type="number"
              min="1"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="200000"
            />
          </div>

          {/* Target date (optional) */}
          <div>
            <Label htmlFor="goal-date">Target date <span className="text-text-tertiary font-normal">(optional)</span></Label>
            <DatePicker
              id="goal-date"
              value={targetDate}
              onChange={(date) => setTargetDate(date || '')}
            />
          </div>

          {error && (
            <p className="text-[12px] text-negative">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Add goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ─── Main Goals Page ──────────────────────────────────────────────────────────
export function GoalsPage() {
  const [period, setPeriod] = useState<Period>('quarterly');
  const [savings, setSavings] = useState<{
    savings: number;
    percentChange?: number;
  } | null>(null);
  const [savingsLoading, setSavingsLoading] = useState(true);

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(true);

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Milestone | null>(null);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchSavings = useCallback(async (p: Period) => {
    try {
      setSavingsLoading(true);
      const res = await api.getSavings(p);
      setSavings({ savings: res.savings, percentChange: res.percentChange });
    } catch {
      setSavings(null);
    } finally {
      setSavingsLoading(false);
    }
  }, []);

  const fetchMilestones = useCallback(async () => {
    try {
      setMilestonesLoading(true);
      const res = await api.getMilestones();
      setMilestones(res || []);
    } catch {
      setMilestones([]);
    } finally {
      setMilestonesLoading(false);
    }
  }, []);

  const fetchAiInsight = useCallback(async () => {
    try {
      setLoadingAi(true);
      const res = await api.getGoalsInsights();
      if (res?.insights?.trim()) setAiInsight(res.insights.trim());
    } catch {
      // silently omit
    } finally {
      setLoadingAi(false);
    }
  }, []);

  useEffect(() => {
    fetchSavings(period);
  }, [period, fetchSavings]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const handleDelete = async (id: number) => {
    try {
      await api.deleteMilestone(id);
      fetchMilestones();
    } catch (err: any) {
      alert(err.message || 'Failed to delete goal.');
    } finally {
      setDeletingId(null);
    }
  };


  const formatPercent = (val: number) =>
    `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Goals</h2>
        <p className="text-xs text-text-secondary">
          Track your savings and set milestones toward your financial targets.
        </p>
      </div>

      {/* ── Period control ── */}
      <div className="flex items-center gap-1 bg-hover-row rounded-[8px] p-1 w-fit">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-3.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors ${
              period === key
                ? 'bg-surface text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Savings summary ── */}
      <div>
        {savingsLoading ? (
          <p className="text-[13px] text-text-secondary">Loading savings…</p>
        ) : savings === null ? (
          <p className="text-[13px] text-text-secondary">Could not load savings data.</p>
        ) : (
          <div>
            <p className="text-[12px] font-medium text-text-secondary tracking-[0.01em] mb-1">
              {period === 'monthly' && 'Savings this month'}
              {period === 'quarterly' && 'Savings this quarter'}
              {period === 'yearly' && 'Savings this year'}
              {period === 'total' && 'Total savings'}
            </p>
            <div className="flex items-baseline gap-3">
              <span
                className={`text-[32px] font-medium font-mono tabular-nums ${
                  savings.savings >= 0 ? 'text-positive' : 'text-negative'
                }`}
              >
                {savings.savings >= 0 ? '+' : ''}{formatCurrency(savings.savings)}
              </span>
              {savings.percentChange != null && period !== 'total' && (
                <span
                  className={`flex items-center gap-1 text-[12px] font-medium font-mono tabular-nums ${
                    savings.percentChange >= 0 ? 'text-positive' : 'text-negative'
                  }`}
                >
                  {savings.percentChange >= 0
                    ? <TrendingUp className="w-3.5 h-3.5" />
                    : <TrendingDown className="w-3.5 h-3.5" />}
                  {formatPercent(savings.percentChange)} vs last period
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── AI Goals Advisor Card ── */}
      <Card className="flex flex-col border border-accent/20 bg-accent-subtle/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="text-[15px] font-semibold text-text-primary">AI Goals Advisor</h3>
          </div>
          <Button
            variant="secondary"
            onClick={fetchAiInsight}
            disabled={loadingAi}
            className="h-8 px-2.5 text-xs bg-surface"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingAi ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap text-center">
          {loadingAi ? (
            <div className="flex items-center justify-center space-x-2 py-3 text-text-tertiary">
              <Sparkles className="w-4 h-4 animate-spin text-accent" />
              <span>Consulting AI Financial Advisor for goal pacing analysis…</span>
            </div>
          ) : aiInsight ? (
            <div className="space-y-2 leading-relaxed text-left inline-block max-w-full">
              <ReactMarkdown>{aiInsight}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2 py-3 text-text-tertiary">
              <Sparkles className="w-4 h-4 opacity-50" />
              <span>Click "Refresh" to generate AI pacing feedback for your active milestones.</span>
            </div>
          )}
        </div>
      </Card>

      {/* ── Milestone list ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-semibold text-text-primary">Milestones</h3>
          {milestones.length > 0 && (
            <Button
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
              id="add-goal-btn"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add goal
            </Button>
          )}
        </div>

        {milestonesLoading ? (
          <p className="text-[13px] text-text-secondary py-6">Loading milestones…</p>
        ) : milestones.length === 0 ? (
          <Card className="py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-hover-row flex items-center justify-center text-text-tertiary">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-text-primary">No goals yet</p>
                <p className="text-[12px] text-text-secondary mt-0.5">
                  Set your first savings target to start tracking progress.
                </p>
              </div>
              <Button
                onClick={() => { setEditTarget(null); setModalOpen(true); }}
                className="mt-1"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add goal
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="divide-y divide-border !p-0">
            {milestones.map((m) => {
              const pct = Math.min(100, m.percentComplete);
              const remaining = m.monthsRemainingAtCurrentPace;
              const isDeleting = deletingId === m.id;

              return (
                <div
                  key={m.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-hover-row transition-colors group"
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-[8px] bg-accent-subtle flex items-center justify-center text-accent shrink-0">
                    <MilestoneIcon name={m.icon} className="w-4 h-4" />
                  </div>

                  {/* Title + progress bar */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-text-primary truncate">
                      {m.title}
                    </p>
                    {remaining !== undefined && remaining !== null && (
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        At current pace: ~{remaining.toFixed(1)} months to go
                      </p>
                    )}
                    {/* Progress bar */}
                    <div className="mt-2 w-full h-1.5 bg-hover-row rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Amount + percentage */}
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-[13px] font-medium font-mono tabular-nums text-text-primary">
                      {formatCurrency(m.currentAmount)}
                      <span className="text-text-tertiary"> / {formatCurrency(m.targetAmount)}</span>
                    </p>
                    <p
                      className={`text-[12px] font-medium font-mono tabular-nums mt-0.5 ${
                        pct >= 100 ? 'text-positive' : 'text-text-secondary'
                      }`}
                    >
                      {pct.toFixed(1)}%
                    </p>
                  </div>

                  {/* Row actions — visible on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                      onClick={() => { setEditTarget(m); setModalOpen(true); }}
                      className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-hover-row transition-colors"
                      title="Edit goal"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {isDeleting ? (
                      <div className="flex items-center gap-1 text-[11px]">
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="px-2 py-1 rounded-md text-negative hover:bg-red-50 text-[11px] font-medium transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-2 py-1 rounded-md text-text-secondary hover:bg-hover-row text-[11px] font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(m.id)}
                        className="p-1.5 rounded-md text-text-secondary hover:text-negative hover:bg-red-50 transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {modalOpen && (
        <GoalModal
          initial={editTarget}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSuccess={fetchMilestones}
        />
      )}
    </div>
  );
}
