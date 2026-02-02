import { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Sparkles, RefreshCw, Plus, PiggyBank, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import type { DashboardData, SavingsData } from '../api/client';
import { formatCurrency, formatDate } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TransactionModal } from '../components/modals/TransactionModal';

const CHART_PALETTE = [
  '#1A5F3F', // --accent (dominant)
  '#4A7A60', // green-gray step 1
  '#7A9F8A', // green-gray step 2
  '#9C9C98', // --text-tertiary
  '#BDBDBA',
  '#CCCCCC',
];

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savings, setSavings] = useState<SavingsData | null>(null);
  const [savingsPeriod, setSavingsPeriod] = useState<'monthly' | 'quarterly' | 'yearly' | 'total'>('quarterly');
  const [cycleDirection, setCycleDirection] = useState<1 | -1>(1);

  // Modal State
  const [modalMode, setModalMode] = useState<'INCOME' | 'EXPENSE' | null>(null);

  // AI Advisor state
  const [advisorInsights, setAdvisorInsights] = useState<string | null>(null);
  const [loadingAdvisor, setLoadingAdvisor] = useState(false);

  // Hover state for sync between legend & chart segment
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    api.getSavings(savingsPeriod).then(setSavings).catch(() => {});
  }, [savingsPeriod]);

  const cyclePeriod = (dir: 1 | -1) => {
    setCycleDirection(dir);
    const periods = ['monthly', 'quarterly', 'yearly', 'total'] as const;
    const idx = periods.indexOf(savingsPeriod);
    const nextIdx = (idx + dir + periods.length) % periods.length;
    setSavingsPeriod(periods[nextIdx]);
  };

  const fetchAdvisor = async () => {
    try {
      setLoadingAdvisor(true);
      const res = await api.getInsights();
      setAdvisorInsights(res.insights);
    } catch (err: any) {
      setAdvisorInsights(`Could not load insights: ${err.message}`);
    } finally {
      setLoadingAdvisor(false);
    }
  };

  const chartData = useMemo(() => {
    if (!data?.expenseByCategory) return [];
    const entries = Object.entries(data.expenseByCategory);
    // Sort largest to smallest
    entries.sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((acc, curr) => acc + curr[1], 0);

    return entries.map(([name, value], idx) => ({
      name,
      value,
      percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0.0',
      color: CHART_PALETTE[Math.min(idx, CHART_PALETTE.length - 1)],
    }));
  }, [data]);

  const totalSpent = useMemo(() => {
    if (!chartData.length) return 0;
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);


  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-text-secondary text-sm">
        Loading financial overview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-negative text-sm border border-negative/20">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Financial Overview</h2>
          <p className="text-xs text-text-secondary">Track your income, expenses, and budget metrics in real time.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={() => setModalMode('INCOME')}>
            <Plus className="w-4 h-4 mr-1.5 text-positive" />
            Income
          </Button>
          <Button onClick={() => setModalMode('EXPENSE')}>
            <Plus className="w-4 h-4 mr-1.5" />
            Expense
          </Button>
        </div>
      </div>

      {/* 1. Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Balance */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-text-secondary tracking-[0.01em]">
              Total Balance
            </span>
            <div className="w-7 h-7 rounded-md bg-hover-row flex items-center justify-center text-text-secondary">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p
              className={`text-2xl font-medium font-mono tabular-nums ${
                (data?.balance || 0) >= 0 ? 'text-text-primary' : 'text-negative'
              }`}
            >
              {formatCurrency(data?.balance || 0)}
            </p>
          </div>
        </Card>

        {/* Total Income */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-text-secondary tracking-[0.01em]">
              Total Income
            </span>
            <div className="w-7 h-7 rounded-md bg-accent-subtle flex items-center justify-center text-positive">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-medium font-mono tabular-nums text-positive">
              +{formatCurrency(data?.totalIncome || 0)}
            </p>
          </div>
        </Card>

        {/* Total Expense */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-text-secondary tracking-[0.01em]">
              Total Expense
            </span>
            <div className="w-7 h-7 rounded-md bg-red-50 flex items-center justify-center text-negative">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-medium font-mono tabular-nums text-negative">
              −{formatCurrency(data?.totalExpense || 0)}
            </p>
          </div>
        </Card>

        {/* Savings Card */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <span className="text-[12px] font-medium text-text-secondary tracking-[0.01em]">
                Savings
              </span>
              <div className="flex items-center space-x-1 ml-2 text-text-secondary relative overflow-hidden w-24 justify-between">
                <button onClick={() => cyclePeriod(-1)} className="hover:text-text-primary p-0.5 rounded-sm fin-focus transition-colors z-10 bg-surface">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="relative w-16 h-4 flex items-center justify-center">
                  <AnimatePresence mode="popLayout" initial={false} custom={cycleDirection}>
                    <motion.span
                      key={savingsPeriod}
                      custom={cycleDirection}
                      variants={{
                        initial: (d: number) => ({ x: d * 20, opacity: 0 }),
                        animate: { x: 0, opacity: 1 },
                        exit: (d: number) => ({ x: d * -20, opacity: 0 })
                      }}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute text-[11px] w-16 text-center select-none capitalize whitespace-nowrap"
                    >
                      {savingsPeriod === 'monthly' ? 'This Month' : savingsPeriod === 'quarterly' ? 'This Quarter' : savingsPeriod === 'yearly' ? 'This Year' : 'Total'}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <button onClick={() => cyclePeriod(1)} className="hover:text-text-primary p-0.5 rounded-sm fin-focus transition-colors z-10 bg-surface">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="w-7 h-7 rounded-md bg-accent-subtle flex items-center justify-center text-accent">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p
              className={`text-2xl font-medium font-mono tabular-nums ${
                (savings?.savings ?? 0) >= 0 ? 'text-positive' : 'text-negative'
              }`}
            >
              {(savings?.savings ?? 0) >= 0 ? '+' : ''}{formatCurrency(savings?.savings ?? 0)}
            </p>
            {savings?.percentChange != null && (
              <p
                className={`flex items-center gap-1 text-[11px] font-medium font-mono tabular-nums mt-1 ${
                  savings.percentChange >= 0 ? 'text-positive' : 'text-negative'
                }`}
              >
                {savings.percentChange >= 0
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />}
                {savings.percentChange >= 0 ? '+' : ''}{savings.percentChange.toFixed(1)}% vs last {savingsPeriod === 'monthly' ? 'month' : savingsPeriod === 'quarterly' ? 'quarter' : savingsPeriod === 'yearly' ? 'year' : 'period'}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* 2. Main Content Grid (Chart + AI Advisor) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Expense Breakdown */}
        <Card className="lg:col-span-2 flex flex-col">
          <div className="mb-4">
            <h2 className="text-[15px] font-semibold text-text-primary">Expense Breakdown</h2>
            <p className="text-xs text-text-secondary">Categorized spending distribution</p>
          </div>

          {chartData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-text-tertiary">
              <p className="text-xs">No expense data recorded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center flex-1">
              {/* Pie Chart Container */}
              <div className="relative h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      startAngle={90}
                      endAngle={-270}
                      stroke="#FFFFFF"
                      strokeWidth={3}
                      onMouseEnter={(_, idx) => setActiveIndex(idx)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                          className="transition-opacity duration-150 cursor-pointer"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Overlay Text — Dynamic on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                  {activeIndex !== null && chartData[activeIndex] ? (
                    <>
                      <span className="text-base font-semibold font-mono tabular-nums text-text-primary">
                        {formatCurrency(chartData[activeIndex].value)}
                      </span>
                      <span className="text-[11px] font-medium text-text-secondary truncate max-w-[110px]">
                        {chartData[activeIndex].name} ({chartData[activeIndex].percentage}%)
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-base font-semibold font-mono tabular-nums text-text-primary">
                        {formatCurrency(totalSpent)}
                      </span>
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">
                        Total spent
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Synchronized Legend */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {chartData.map((item, idx) => (
                  <div
                    key={item.name}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseLeave={() => setActiveIndex(null)}
                    className={`flex items-center justify-between p-2 rounded-[6px] text-xs transition-colors cursor-pointer ${
                      activeIndex === idx ? 'bg-hover-row' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-text-primary truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0 ml-2 font-mono tabular-nums">
                      <span className="text-text-secondary text-[11px]">{item.percentage}%</span>
                      <span className="font-medium text-text-primary">{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* AI Advisor Panel */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="text-[15px] font-semibold text-text-primary">AI Financial Advisor</h2>
            </div>
            <Button
              variant="secondary"
              onClick={fetchAdvisor}
              disabled={loadingAdvisor}
              className="h-8 px-2.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAdvisor ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="flex-1 text-xs text-text-secondary leading-relaxed overflow-y-auto max-h-80 space-y-3">
            {advisorInsights ? (
              <div className="space-y-2 whitespace-pre-wrap">
                <ReactMarkdown>{advisorInsights}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-text-tertiary space-y-2">
                <Sparkles className="w-6 h-6 opacity-40" />
                <p>Click refresh to generate personalized spending insights.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 3. Recent Transactions Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-semibold text-text-primary">Recent Transactions</h2>
            <p className="text-xs text-text-secondary">Latest financial activities</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-strong text-text-secondary font-medium">
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(!data?.recentTransactions || data.recentTransactions.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-tertiary">
                    No recent transactions found.
                  </td>
                </tr>
              ) : (
                data.recentTransactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  return (
                    <tr key={tx.id} className="hover:bg-hover-row transition-colors">
                      <td className="py-3 px-3 font-medium text-text-primary">
                        {tx.name}
                      </td>
                      <td className="py-3 px-3">
                        <Badge>{tx.categoryName || 'General'}</Badge>
                      </td>
                      <td className="py-3 px-3 text-text-secondary font-mono tabular-nums">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3 px-3">
                        <Badge dotColor={isIncome ? '#1A7F4E' : '#6B6B68'}>
                          {tx.type}
                        </Badge>
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono tabular-nums font-medium ${
                          isIncome ? 'text-positive' : 'text-negative'
                        }`}
                      >
                        {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
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
        onClose={() => setModalMode(null)}
        onSuccess={fetchDashboard}
      />
    </div>
  );
}
