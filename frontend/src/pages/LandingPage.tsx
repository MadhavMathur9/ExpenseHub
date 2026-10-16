import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Sparkles,
  RefreshCw,
  Plus,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Tag,
  Home,
  Plane,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { motion, useReducedMotion } from 'framer-motion';
import { formatDate } from '../lib/utils';
import { useCurrency } from '../context/CurrencyContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/ui/ScrollReveal';
import { ShowcaseContainer } from '../components/ui/ShowcaseContainer';

// Accessible 5-color categorical palette
const DONUT_PALETTE = [
  '#1B5E3F', // emerald
  '#334155', // slate
  '#0F766E', // teal
  '#B45309', // ochre
  '#475569', // stone
];

interface SampleTx {
  id: number;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}

const INITIAL_TRANSACTIONS: SampleTx[] = [
  { id: 1, name: 'October payroll', category: 'Salary', date: '2026-10-16', amount: 25000, type: 'INCOME' },
  { id: 2, name: '1 week Japan flights', category: 'Travel', date: '2026-09-20', amount: 10000, type: 'EXPENSE' },
  { id: 3, name: 'Monthly checkup & meds', category: 'Health', date: '2026-10-10', amount: 5000, type: 'EXPENSE' },
  { id: 4, name: 'Dine outs & groceries', category: 'Food', date: '2026-10-06', amount: 3000, type: 'EXPENSE' },
  { id: 5, name: 'Movie tickets & streaming', category: 'Entertainment', date: '2026-10-11', amount: 500, type: 'EXPENSE' },
];

const EXTRA_INCOMES: { name: string; category: string; amount: number }[] = [
  { name: 'Freelance UI design', category: 'Freelance', amount: 2400 },
  { name: 'Consulting retainer', category: 'Consulting', amount: 3500 },
  { name: 'Stock dividend distribution', category: 'Investment', amount: 1200 },
];

const EXTRA_EXPENSES: { name: string; category: string; amount: number }[] = [
  { name: 'Weekly grocery run', category: 'Food', amount: 240 },
  { name: 'Cloud storage subscription', category: 'Entertainment', amount: 45 },
  { name: 'Dental cleaning checkup', category: 'Health', amount: 180 },
  { name: 'Weekend train trip', category: 'Travel', amount: 320 },
];

export function LandingPage() {
  const { formatCurrency } = useCurrency();
  const shouldReduceMotion = useReducedMotion();

  // Sticky navbar subtle elevation on scroll (Mercury style)
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 6);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero interactive state
  const [transactions, setTransactions] = useState<SampleTx[]>(INITIAL_TRANSACTIONS);
  const [activeDonutIdx, setActiveDonutIdx] = useState<number | null>(null);
  const [incomeIdx, setIncomeIdx] = useState(0);
  const [expenseIdx, setExpenseIdx] = useState(0);

  // Financial Overview interactive state (Savings horizon switcher)
  const [overviewPeriod, setOverviewPeriod] = useState<'monthly' | 'quarterly' | 'yearly' | 'total'>('quarterly');

  // Hero calculations
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const netBalance = totalIncome - totalExpense;

  // Donut chart grouping from transactions
  const chartData = useMemo(() => {
    const expenseMap: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type === 'EXPENSE') {
        expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
      }
    }
    const entries = Object.entries(expenseMap);
    entries.sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((acc, curr) => acc + curr[1], 0);

    return entries.map(([name, value], idx) => ({
      name,
      value,
      percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0.0',
      color: DONUT_PALETTE[idx % DONUT_PALETTE.length],
    }));
  }, [transactions]);

  const handleAddIncome = () => {
    const sample = EXTRA_INCOMES[incomeIdx % EXTRA_INCOMES.length];
    setIncomeIdx((prev) => prev + 1);
    const newTx: SampleTx = {
      id: Date.now(),
      name: sample.name,
      category: sample.category,
      date: '2026-10-16',
      amount: sample.amount,
      type: 'INCOME',
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleAddExpense = () => {
    const sample = EXTRA_EXPENSES[expenseIdx % EXTRA_EXPENSES.length];
    setExpenseIdx((prev) => prev + 1);
    const newTx: SampleTx = {
      id: Date.now(),
      name: sample.name,
      category: sample.category,
      date: '2026-10-16',
      amount: sample.amount,
      type: 'EXPENSE',
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#F6F5F2] text-[#22221F] selection:bg-[#EAF3EE] selection:text-[#1B5E3F]">
      {/* ── Top Navigation Bar ── */}
      <header
        className={`sticky top-0 z-40 bg-[#F6F5F2] border-b transition-[box-shadow,border-color] duration-250 ease-out ${
          isScrolled
            ? 'shadow-[0_2px_8px_rgba(30,35,30,0.045)] border-[#DEDDD6]/80'
            : 'shadow-none border-[#DEDDD6]/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#1B5E3F] flex items-center justify-center text-white shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#22221F]">
              ExpenseHub
            </span>
          </Link>

          <nav className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-3.5 py-2 text-sm font-medium text-[#68675F] hover:text-[#22221F] transition-colors rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5E3F]"
            >
              Sign in
            </Link>
            <Link
              to="/login?mode=register"
              className="px-4 py-2 text-sm font-medium text-white bg-[#1B5E3F] hover:bg-[#164F34] transition-colors rounded-lg shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5E3F]"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Section A: Hero ── */}
      {/* 5 cols prose left, 7 cols showcase right */}
      <motion.section
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="py-16 lg:py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left 5 Columns: Copy and CTAs */}
            <div className="lg:col-span-5 space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#22221F] leading-[1.14]">
                Know where your money goes without fighting your tools.
              </h1>

              <p className="text-base sm:text-lg text-[#68675F] leading-relaxed">
                Log income and expenses, filter your ledger, and pace your savings goals with on-demand AI feedback.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link
                  to="/login?mode=register"
                  className="px-6 py-3 rounded-lg bg-[#1B5E3F] hover:bg-[#164F34] text-white text-sm font-medium transition-colors text-center shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5E3F]"
                >
                  Create account
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-lg border border-[#DEDDD6] bg-white hover:bg-[#FAF8F5] text-[#22221F] text-sm font-medium transition-colors text-center shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5E3F]"
                >
                  Sign in
                </Link>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#68675F]">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1A7F4E]" />
                  <span>Real-time calculations</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1A7F4E]" />
                  <span>Excel report export</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1A7F4E]" />
                  <span>No data sharing</span>
                </div>
              </div>
            </div>

            {/* Right 7 Columns: Product Showcase Container */}
            <div className="lg:col-span-7">
              <ShowcaseContainer index={0}>
                <Card className="p-5 sm:p-6 bg-white border border-[#DEDDD6] shadow-xs rounded-xl space-y-5">
                  {/* Header: Net Balance & Quick Sample Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-3">
                    <div>
                      <span className="text-[11px] font-medium text-[#68675F] uppercase tracking-wider block">
                        Total Balance
                      </span>
                      <span className="text-2xl sm:text-3xl font-medium font-mono tabular-nums text-[#22221F]">
                        <AnimatedNumber value={netBalance} format={formatCurrency} />
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleAddIncome}
                        className="px-3 py-1.5 rounded-md bg-[#EAF3EE] hover:bg-[#dcefe5] text-[#1B5E3F] text-xs font-medium transition-colors flex items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1B5E3F]"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add sample income
                      </button>
                      <button
                        type="button"
                        onClick={handleAddExpense}
                        className="px-3 py-1.5 rounded-md bg-[#FAF8F5] hover:bg-[#EDEAE4] text-[#22221F] border border-[#DEDDD6] text-xs font-medium transition-colors flex items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1B5E3F]"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add sample expense
                      </button>
                    </div>
                  </div>

                  {/* Fixed-height container to guarantee CLS = 0.00 when rows are added */}
                  <div className="h-[210px] overflow-y-auto pr-1 border border-[#DEDDD6] rounded-lg bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-[#FAF8F5] z-10 border-b border-[#DEDDD6]">
                        <tr className="text-[#68675F] font-medium">
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 hidden sm:table-cell">Date</th>
                          <th className="py-2.5 px-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DEDDD6]">
                        {transactions.map((tx) => {
                          const isIncome = tx.type === 'INCOME';
                          return (
                            <tr key={tx.id} className="hover:bg-[#FAF8F5] transition-colors">
                              <td className="py-2.5 px-3 font-medium text-[#22221F] truncate max-w-[160px] sm:max-w-none">
                                {tx.name}
                              </td>
                              <td className="py-2.5 px-3">
                                <Badge>{tx.category}</Badge>
                              </td>
                              <td className="py-2.5 px-3 text-[#68675F] font-mono tabular-nums hidden sm:table-cell">
                                {formatDate(tx.date)}
                              </td>
                              <td
                                className={`py-2.5 px-3 text-right font-mono tabular-nums font-medium ${
                                  isIncome ? 'text-[#1A7F4E]' : 'text-[#B91C1C]'
                                }`}
                              >
                                {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Synchronized Recharts Donut Breakdown */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#22221F]">
                        Live Expense Breakdown
                      </span>
                      <span className="text-[11px] text-[#68675F]">
                        Hover chart or legend to highlight
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      {/* Donut Chart with Recharts built-in animation */}
                      <div className="relative h-44 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={48}
                              outerRadius={68}
                              startAngle={90}
                              endAngle={-270}
                              stroke="#FFFFFF"
                              strokeWidth={2}
                              isAnimationActive={!shouldReduceMotion}
                              animationDuration={900}
                              animationEasing="ease-out"
                              animationBegin={150}
                              onMouseEnter={(_, idx) => setActiveDonutIdx(idx)}
                              onMouseLeave={() => setActiveDonutIdx(null)}
                            >
                              {chartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                  opacity={activeDonutIdx === null || activeDonutIdx === index ? 1 : 0.35}
                                  className="transition-opacity duration-150 cursor-pointer"
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>

                        {/* Donut Center Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
                          {activeDonutIdx !== null && chartData[activeDonutIdx] ? (
                            <>
                              <span className="text-sm font-semibold font-mono tabular-nums text-[#22221F]">
                                {formatCurrency(chartData[activeDonutIdx].value)}
                              </span>
                              <span className="text-[10px] font-medium text-[#68675F] truncate max-w-[90px]">
                                {chartData[activeDonutIdx].name} ({chartData[activeDonutIdx].percentage}%)
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm font-semibold font-mono tabular-nums text-[#22221F]">
                                <AnimatedNumber value={totalExpense} format={formatCurrency} />
                              </span>
                              <span className="text-[9px] text-[#68675F] uppercase tracking-wider font-medium">
                                Total spent
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Synchronized Legend with subtle stagger and count-up */}
                      <motion.div
                        initial={shouldReduceMotion ? false : 'hidden'}
                        animate="visible"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.08,
                              delayChildren: 0.2,
                            },
                          },
                        }}
                        className="space-y-1.5 max-h-44 overflow-y-auto pr-1"
                      >
                        {chartData.map((item, idx) => (
                          <motion.div
                            key={item.name}
                            variants={{
                              hidden: { opacity: 0, x: -6 },
                              visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                            }}
                            onMouseEnter={() => setActiveDonutIdx(idx)}
                            onMouseLeave={() => setActiveDonutIdx(null)}
                            className={`flex items-center justify-between p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                              activeDonutIdx === idx ? 'bg-[#FAF8F5]' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-medium text-[#22221F] truncate">{item.name}</span>
                            </div>
                            <div className="flex items-center space-x-2 font-mono tabular-nums text-[11px]">
                              <span className="text-[#68675F]">
                                <AnimatedNumber value={parseFloat(item.percentage)} decimals={1} suffix="%" />
                              </span>
                              <span className="font-medium text-[#22221F]">
                                <AnimatedNumber value={item.value} format={formatCurrency} />
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </ShowcaseContainer>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Section B: Income and Expense Categories (Alternating 1 - Showcase Left, Text Right) ── */}
      {/* 7 cols showcase left, 5 cols prose right */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Showcase Container Left (7 cols) */}
            <ScrollReveal direction="up" delay={0} duration={0.9} yOffset={18} className="lg:col-span-7">
              <ShowcaseContainer index={1}>
                <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Income Buckets */}
                  <StaggerItem>
                    <Card className="p-4 sm:p-5 bg-white border border-[#DEDDD6] rounded-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#1A7F4E]" />
                          <span className="text-xs font-semibold text-[#22221F]">Income Buckets</span>
                        </div>
                        <span className="text-xs text-[#68675F] font-mono">3 categories</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] transition-colors flex items-center justify-between">
                          <span className="flex items-center space-x-1.5">
                            <Tag className="w-3.5 h-3.5 text-[#1A7F4E]" />
                            <span className="font-medium text-[#22221F]">Salary</span>
                          </span>
                          <span className="text-[11px] text-[#68675F]">Primary income</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] transition-colors flex items-center justify-between">
                          <span className="flex items-center space-x-1.5">
                            <Tag className="w-3.5 h-3.5 text-[#1A7F4E]" />
                            <span className="font-medium text-[#22221F]">Freelance</span>
                          </span>
                          <span className="text-[11px] text-[#68675F]">Client contracts</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] transition-colors flex items-center justify-between">
                          <span className="flex items-center space-x-1.5">
                            <Tag className="w-3.5 h-3.5 text-[#1A7F4E]" />
                            <span className="font-medium text-[#22221F]">Investments</span>
                          </span>
                          <span className="text-[11px] text-[#68675F]">Dividends & yield</span>
                        </div>
                      </div>
                    </Card>
                  </StaggerItem>

                  {/* Expense Buckets */}
                  <StaggerItem>
                    <Card className="p-4 sm:p-5 bg-white border border-[#DEDDD6] rounded-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#68675F]" />
                          <span className="text-xs font-semibold text-[#22221F]">Expense Buckets</span>
                        </div>
                        <span className="text-xs text-[#68675F] font-mono">6 categories</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] transition-colors flex items-center justify-between">
                          <span className="flex items-center space-x-1.5">
                            <Tag className="w-3.5 h-3.5 text-[#68675F]" />
                            <span className="font-medium text-[#22221F]">Rent & Utilities</span>
                          </span>
                          <span className="text-[11px] text-[#68675F]">Fixed costs</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] transition-colors flex items-center justify-between">
                          <span className="flex items-center space-x-1.5">
                            <Tag className="w-3.5 h-3.5 text-[#68675F]" />
                            <span className="font-medium text-[#22221F]">Food & Dining</span>
                          </span>
                          <span className="text-[11px] text-[#68675F]">Groceries & meals</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] transition-colors flex items-center justify-between">
                          <span className="flex items-center space-x-1.5">
                            <Tag className="w-3.5 h-3.5 text-[#68675F]" />
                            <span className="font-medium text-[#22221F]">Travel & Transport</span>
                          </span>
                          <span className="text-[11px] text-[#68675F]">Flights & transit</span>
                        </div>
                      </div>
                    </Card>
                  </StaggerItem>
                </StaggerContainer>
              </ShowcaseContainer>
            </ScrollReveal>

            {/* Prose Right (5 cols) */}
            <ScrollReveal direction="up" delay={0.12} duration={0.9} yOffset={18} className="lg:col-span-5 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#22221F] leading-tight">
                Group income and expenses into structured categories
              </h2>
              <p className="text-base text-[#68675F] leading-relaxed">
                Define custom buckets for every income stream and expense type. Track category counts at a glance while built-in safeguards protect linked ledger transactions from accidental deletion.
              </p>
              <div className="pt-2">
                <Link
                  to="/login?mode=register"
                  className="text-sm font-medium text-[#1B5E3F] hover:text-[#164F34] hover:underline inline-flex items-center"
                >
                  Create custom categories <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Section C: Savings Goals (Alternating 2 - Text Left, Showcase Right) ── */}
      {/* 5 cols prose left, 7 cols showcase right */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Prose Left (5 cols) */}
            <ScrollReveal direction="up" delay={0} duration={0.9} yOffset={18} className="lg:col-span-5 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#22221F] leading-tight">
                Set savings targets and calculate your time to goal
              </h2>
              <p className="text-base text-[#68675F] leading-relaxed">
                Establish clear milestones for emergency funds, major purchases, or travel. ExpenseHub measures your recent savings rate to calculate realistic time-to-completion estimates so you know exactly when you will reach each target.
              </p>
              <div className="pt-2">
                <Link
                  to="/login?mode=register"
                  className="text-sm font-medium text-[#1B5E3F] hover:text-[#164F34] hover:underline inline-flex items-center"
                >
                  Track your personal savings targets <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Showcase Container Right (7 cols) */}
            <ScrollReveal direction="up" delay={0.12} duration={0.9} yOffset={18} className="lg:col-span-7">
              <ShowcaseContainer index={2}>
                <Card className="p-3 sm:p-4 bg-white border border-[#DEDDD6] rounded-xl shadow-xs">
                  <StaggerContainer staggerDelay={0.1} className="space-y-1.5 sm:space-y-2">
                    {/* Milestone 1: House down payment */}
                    <StaggerItem>
                      <div className="flex items-center gap-4 px-4 py-3.5 rounded-lg hover:bg-[#FAF8F5]/70 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-[#EAF3EE] flex items-center justify-center text-[#1B5E3F] shrink-0">
                          <Home className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-[#22221F]">House down payment</p>
                          <motion.p
                            initial={shouldReduceMotion ? false : { opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.35, duration: 0.4 }}
                            className="text-[11px] text-[#68675F] mt-0.5"
                          >
                            At current pace: ~14.2 months to go
                          </motion.p>
                          <div className="mt-2 w-full h-1.5 bg-[#EDEAE4] rounded-full overflow-hidden">
                            <motion.div
                              initial={shouldReduceMotion ? false : { width: '0%' }}
                              whileInView={{ width: '45%' }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full bg-[#1B5E3F] rounded-full"
                            />
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono tabular-nums">
                          <p className="text-[13px] font-medium text-[#22221F]">
                            <AnimatedNumber value={45000} format={formatCurrency} /> / {formatCurrency(100000)}
                          </p>
                          <p className="text-[11px] text-[#68675F]">
                            <AnimatedNumber value={45.0} decimals={1} suffix="%" />
                          </p>
                        </div>
                      </div>
                    </StaggerItem>

                    {/* Milestone 2: Emergency reserve (100% funded) */}
                    <StaggerItem>
                      <div className="flex items-center gap-4 px-4 py-3.5 rounded-lg bg-[#FAF8F5]/80">
                        <div className="w-9 h-9 rounded-lg bg-[#EAF3EE] flex items-center justify-center text-[#1A7F4E] shrink-0">
                          <PiggyBank className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-[13px] font-medium text-[#22221F]">Emergency reserve</p>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#EAF3EE] text-[#1A7F4E]">
                              Target reached
                            </span>
                          </div>
                          <motion.p
                            initial={shouldReduceMotion ? false : { opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.35, duration: 0.4 }}
                            className="text-[11px] text-[#1A7F4E] mt-0.5 font-medium flex items-center"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Fully funded target achieved
                          </motion.p>
                          <div className="mt-2 w-full h-1.5 bg-[#EDEAE4] rounded-full overflow-hidden">
                            <motion.div
                              initial={shouldReduceMotion ? false : { width: '0%' }}
                              whileInView={{ width: '100%' }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full bg-[#1A7F4E] rounded-full"
                            />
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono tabular-nums">
                          <p className="text-[13px] font-medium text-[#22221F]">
                            <AnimatedNumber value={15000} format={formatCurrency} /> / {formatCurrency(15000)}
                          </p>
                          <p className="text-[11px] text-[#1A7F4E] font-medium">
                            <AnimatedNumber value={100.0} decimals={1} suffix="%" />
                          </p>
                        </div>
                      </div>
                    </StaggerItem>

                    {/* Milestone 3: Japan vacation fund */}
                    <StaggerItem>
                      <div className="flex items-center gap-4 px-4 py-3.5 rounded-lg hover:bg-[#FAF8F5]/70 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-[#EAF3EE] flex items-center justify-center text-[#1B5E3F] shrink-0">
                          <Plane className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-[#22221F]">Japan vacation fund</p>
                          <motion.p
                            initial={shouldReduceMotion ? false : { opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.35, duration: 0.4 }}
                            className="text-[11px] text-[#68675F] mt-0.5"
                          >
                            At current pace: ~3.1 months to go
                          </motion.p>
                          <div className="mt-2 w-full h-1.5 bg-[#EDEAE4] rounded-full overflow-hidden">
                            <motion.div
                              initial={shouldReduceMotion ? false : { width: '0%' }}
                              whileInView={{ width: '70%' }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full bg-[#1B5E3F] rounded-full"
                            />
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono tabular-nums">
                          <p className="text-[13px] font-medium text-[#22221F]">
                            <AnimatedNumber value={4200} format={formatCurrency} /> / {formatCurrency(6000)}
                          </p>
                          <p className="text-[11px] text-[#68675F]">
                            <AnimatedNumber value={70.0} decimals={1} suffix="%" />
                          </p>
                        </div>
                      </div>
                    </StaggerItem>
                  </StaggerContainer>
                </Card>
              </ShowcaseContainer>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Section D: AI Financial Advisor (Alternating 3 - Showcase Left, Text Right) ── */}
      {/* 7 cols showcase left, 5 cols prose right */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Showcase Container Left (7 cols) */}
            <ScrollReveal direction="up" delay={0} duration={0.9} yOffset={18} className="lg:col-span-7">
              <ShowcaseContainer index={3}>
                <StaggerContainer staggerDelay={0.15} className="space-y-4">
                  {/* Advisor Card 1 */}
                  <StaggerItem>
                    <Card className="p-4 sm:p-5 bg-white border border-[#DEDDD6] rounded-xl shadow-xs transition-shadow hover:shadow-sm">
                      <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="flex items-center justify-between mb-2.5"
                      >
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-[#1B5E3F]" />
                          <span className="text-xs font-semibold text-[#22221F]">AI Financial Advisor</span>
                        </div>
                        <span className="text-[11px] text-[#68675F] flex items-center">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Updated today
                        </span>
                      </motion.div>
                      <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                        className="text-xs text-[#68675F] leading-relaxed"
                      >
                        <ReactMarkdown>
                          {"**Spending Velocity Insight**: Travel and Dining account for 64% of discretionary expenses this quarter. Shifting $350 monthly from dining out into savings accelerates your Japan vacation milestone by 1.2 months."}
                        </ReactMarkdown>
                      </motion.div>
                    </Card>
                  </StaggerItem>

                  {/* Advisor Card 2 */}
                  <StaggerItem>
                    <Card className="p-4 sm:p-5 bg-white border border-[#DEDDD6] rounded-xl shadow-xs transition-shadow hover:shadow-sm">
                      <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                        className="flex items-center justify-between mb-2.5"
                      >
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-[#1B5E3F]" />
                          <span className="text-xs font-semibold text-[#22221F]">AI Goals Advisor</span>
                        </div>
                        <span className="text-[11px] text-[#68675F] flex items-center">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Pacing analysis
                        </span>
                      </motion.div>
                      <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-xs text-[#68675F] leading-relaxed"
                      >
                        <ReactMarkdown>
                          {"**Milestone Feasibility**: Your emergency fund is fully capitalized at 100%. Allocating remaining monthly surplus to the house down payment puts you on track to close 2 months ahead of your target date."}
                        </ReactMarkdown>
                      </motion.div>
                    </Card>
                  </StaggerItem>
                </StaggerContainer>
              </ShowcaseContainer>
            </ScrollReveal>

            {/* Prose Right (5 cols) */}
            <ScrollReveal direction="up" delay={0.12} duration={0.9} yOffset={18} className="lg:col-span-5 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#22221F] leading-tight">
                Receive contextual financial guidance on demand
              </h2>
              <p className="text-base text-[#68675F] leading-relaxed">
                Consult AI advisors tailored to your current ledger. Get spending distribution critiques directly on your dashboard and pacing feedback on your goals without recurring fees or unwanted upsells.
              </p>
              <div className="pt-2">
                <Link
                  to="/login?mode=register"
                  className="text-sm font-medium text-[#1B5E3F] hover:text-[#164F34] hover:underline inline-flex items-center"
                >
                  Get personalized AI pacing advice <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Section E1: Financial Overview & Velocity (Alternating 4 - Text Left, Showcase Right) ── */}
      {/* 5 cols prose left, 7 cols showcase right */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Prose Left (5 cols) */}
            <ScrollReveal direction="up" delay={0} duration={0.9} yOffset={18} className="lg:col-span-5 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#22221F] leading-tight">
                Monitor balance, cash flow, and savings velocity in real time
              </h2>
              <p className="text-base text-[#68675F] leading-relaxed">
                Review your total balance, positive cash inflows, and negative outflows alongside switchable savings velocity metrics. Compare progress across monthly, quarterly, yearly, and total horizons with synchronized category distribution charts.
              </p>
              <div className="pt-2">
                <Link
                  to="/login?mode=register"
                  className="text-sm font-medium text-[#1B5E3F] hover:text-[#164F34] hover:underline inline-flex items-center"
                >
                  Create account to view your dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Showcase Container Right (7 cols) */}
            <ScrollReveal direction="up" delay={0.12} duration={0.9} yOffset={18} className="lg:col-span-7">
              <ShowcaseContainer index={4}>
                <div className="space-y-3.5 sm:space-y-4">
                  <StaggerContainer staggerDelay={0.09} className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <StaggerItem className="h-full">
                      <Card className="p-3 sm:p-3.5 bg-white border border-[#DEDDD6] rounded-xl shadow-xs h-full flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-medium text-[#68675F] block mb-1">Total Balance</span>
                          <span className="text-[15px] sm:text-base lg:text-lg font-medium font-mono tabular-nums text-[#22221F] whitespace-nowrap block">
                            <AnimatedNumber value={31500} format={formatCurrency} />
                          </span>
                        </div>
                        <p className="text-[10px] text-[#68675F] mt-1.5 truncate">
                          All accounts active
                        </p>
                      </Card>
                    </StaggerItem>
                    <StaggerItem className="h-full">
                      <Card className="p-3 sm:p-3.5 bg-white border border-[#DEDDD6] rounded-xl shadow-xs h-full flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-medium text-[#68675F] block mb-1">Total Income</span>
                          <span className="text-[15px] sm:text-base lg:text-lg font-medium font-mono tabular-nums text-[#1A7F4E] whitespace-nowrap block">
                            <AnimatedNumber value={50000} format={(v) => `+${formatCurrency(v)}`} />
                          </span>
                        </div>
                        <p className="text-[10px] text-[#1A7F4E] mt-1.5 truncate">
                          October inflows
                        </p>
                      </Card>
                    </StaggerItem>
                    <StaggerItem className="h-full">
                      <Card className="p-3 sm:p-3.5 bg-white border border-[#DEDDD6] rounded-xl shadow-xs h-full flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-medium text-[#68675F] block mb-1">Total Expense</span>
                          <span className="text-[15px] sm:text-base lg:text-lg font-medium font-mono tabular-nums text-[#B91C1C] whitespace-nowrap block">
                            <AnimatedNumber value={18500} format={(v) => `−${formatCurrency(v)}`} />
                          </span>
                        </div>
                        <p className="text-[10px] text-[#68675F] mt-1.5 truncate">
                          October outflows
                        </p>
                      </Card>
                    </StaggerItem>
                    <StaggerItem className="h-full">
                      <Card className="p-3 sm:p-3.5 bg-white border border-[#DEDDD6] rounded-xl shadow-xs h-full flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-medium text-[#68675F]">Savings</span>
                            <div className="flex items-center space-x-0.5">
                              <button
                                onClick={() => {
                                  const periods = ['monthly', 'quarterly', 'yearly', 'total'] as const;
                                  const idx = periods.indexOf(overviewPeriod);
                                  setOverviewPeriod(periods[(idx - 1 + periods.length) % periods.length]);
                                }}
                                className="hover:text-[#22221F] p-0.5 text-[#68675F] cursor-pointer"
                                aria-label="Previous horizon"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  const periods = ['monthly', 'quarterly', 'yearly', 'total'] as const;
                                  const idx = periods.indexOf(overviewPeriod);
                                  setOverviewPeriod(periods[(idx + 1) % periods.length]);
                                }}
                                className="hover:text-[#22221F] p-0.5 text-[#68675F] cursor-pointer"
                                aria-label="Next horizon"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <span className="text-[15px] sm:text-base lg:text-lg font-medium font-mono tabular-nums text-[#1A7F4E] whitespace-nowrap block">
                            <AnimatedNumber value={6500} format={(v) => `+${formatCurrency(v)}`} />
                          </span>
                        </div>
                        <p className="text-[10px] text-[#1A7F4E] font-medium mt-1.5 capitalize truncate">
                          {overviewPeriod} (+<AnimatedNumber value={18.4} decimals={1} suffix="%" />)
                        </p>
                      </Card>
                    </StaggerItem>
                  </StaggerContainer>

                  <Card className="p-4 bg-white border border-[#DEDDD6] rounded-xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-[#22221F]">Categorized Spending Distribution</h3>
                      <span className="text-[11px] text-[#68675F]">4 Active categories</span>
                    </div>
                    {/* Animated horizontal distribution bar */}
                    <div className="h-2 w-full rounded-full bg-[#EDEAE4] overflow-hidden flex">
                      <motion.div
                        initial={shouldReduceMotion ? false : { width: '0%' }}
                        whileInView={{ width: '54.1%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-[#1B5E3F] h-full"
                        title="Travel 54.1%"
                      />
                      <motion.div
                        initial={shouldReduceMotion ? false : { width: '0%' }}
                        whileInView={{ width: '27.0%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-[#334155] h-full"
                        title="Health 27.0%"
                      />
                      <motion.div
                        initial={shouldReduceMotion ? false : { width: '0%' }}
                        whileInView={{ width: '16.2%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-[#0F766E] h-full"
                        title="Food 16.2%"
                      />
                      <motion.div
                        initial={shouldReduceMotion ? false : { width: '0%' }}
                        whileInView={{ width: '2.7%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-[#B45309] h-full"
                        title="Entertainment 2.7%"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px] font-mono tabular-nums text-[#68675F]">
                      <div>
                        <span className="inline-block w-2 h-2 rounded-full bg-[#1B5E3F] mr-1" />
                        Travel: <AnimatedNumber value={10000} format={formatCurrency} />
                      </div>
                      <div>
                        <span className="inline-block w-2 h-2 rounded-full bg-[#334155] mr-1" />
                        Health: <AnimatedNumber value={5000} format={formatCurrency} />
                      </div>
                      <div>
                        <span className="inline-block w-2 h-2 rounded-full bg-[#0F766E] mr-1" />
                        Food: <AnimatedNumber value={3000} format={formatCurrency} />
                      </div>
                      <div>
                        <span className="inline-block w-2 h-2 rounded-full bg-[#B45309] mr-1" />
                        Entertainment: <AnimatedNumber value={500} format={formatCurrency} />
                      </div>
                    </div>
                  </Card>
                </div>
              </ShowcaseContainer>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Section E2: Transaction Ledger & Audit (Alternating 5 - Showcase Left, Text Right) ── */}
      {/* 7 cols showcase left, 5 cols prose right */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Showcase Container Left (7 cols) */}
            <ScrollReveal direction="up" delay={0} duration={0.9} yOffset={18} className="lg:col-span-7">
              <ShowcaseContainer index={5}>
                <Card className="p-4 sm:p-5 bg-white border border-[#DEDDD6] rounded-xl shadow-xs space-y-3">
                  {/* Filter Toolbar Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value="Japan"
                        className="w-full h-9 rounded-md border border-[#DEDDD6] bg-[#FAF8F5] px-3 pl-8 text-[#22221F]"
                      />
                      <Search className="w-3.5 h-3.5 text-[#68675F] absolute left-2.5 top-2.5" />
                    </div>
                    <div>
                      <input
                        type="text"
                        readOnly
                        value="Expense Only"
                        className="w-full h-9 rounded-md border border-[#DEDDD6] bg-[#FAF8F5] px-3 text-[#22221F]"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        readOnly
                        value="01/09/2026 to 31/10/2026"
                        className="w-full h-9 rounded-md border border-[#DEDDD6] bg-[#FAF8F5] px-3 text-[#22221F] font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#68675F] pt-1">
                    <span>Sorted by date (newest first)</span>
                    <span className="flex items-center text-[#1B5E3F] font-medium">
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Export Excel (.xlsx) ready
                    </span>
                  </div>

                  {/* Filtered Table Preview */}
                  <div className="border border-[#DEDDD6] rounded-md overflow-hidden bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#FAF8F5] text-[#68675F] border-b border-[#DEDDD6]">
                        <tr>
                          <th className="py-2 px-3 font-medium">Description</th>
                          <th className="py-2 px-3 font-medium">Category</th>
                          <th className="py-2 px-3 font-medium">Date</th>
                          <th className="py-2 px-3 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DEDDD6]">
                        <tr className="hover:bg-[#FAF8F5]">
                          <td className="py-2.5 px-3 font-medium text-[#22221F]">1 week Japan flights</td>
                          <td className="py-2.5 px-3"><Badge>Travel</Badge></td>
                          <td className="py-2.5 px-3 font-mono tabular-nums text-[#68675F]">20/09/2026</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#B91C1C]">−{formatCurrency(10000)}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="px-3 py-2 bg-[#FAF8F5] border-t border-[#DEDDD6] text-[11px] text-[#68675F]">
                      Showing 1 to 1 of 1 transaction (filtered from 24 records)
                    </div>
                  </div>
                </Card>
              </ShowcaseContainer>
            </ScrollReveal>

            {/* Prose Right (5 cols) */}
            <ScrollReveal direction="up" delay={0.12} duration={0.9} yOffset={18} className="lg:col-span-5 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#22221F] leading-tight">
                Audit historical transactions with masked filters and instant search
              </h2>
              <p className="text-base text-[#68675F] leading-relaxed">
                Find specific merchant payments or paychecks using instant keyword search and strict dd/mm/yyyy date range inputs. Drill down through month and year calendar grids or export your entire financial history directly to an Excel spreadsheet.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#1B5E3F] hover:text-[#164F34] hover:underline inline-flex items-center"
                >
                  Sign in to manage your transaction ledger <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Section E3: Account Privacy & SSO (Alternating 6 - Text Left, Showcase Right) ── */}
      {/* 5 cols prose left, 7 cols showcase right */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Prose Left (5 cols) */}
            <ScrollReveal direction="up" delay={0} duration={0.9} yOffset={18} className="lg:col-span-5 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#22221F] leading-tight">
                Choose flexible sign in with complete account privacy
              </h2>
              <p className="text-base text-[#68675F] leading-relaxed">
                Access your financial dashboard in seconds using Google or Microsoft single sign on, or create a private email and password account. You retain total ownership of your records, including a permanent two-step account deletion option that purges all personal data upon request.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#1B5E3F] hover:text-[#164F34] hover:underline inline-flex items-center"
                >
                  Explore sign in options <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Showcase Container Right (7 cols) */}
            <ScrollReveal direction="up" delay={0.12} duration={0.9} yOffset={18} className="lg:col-span-7">
              <ShowcaseContainer index={6}>
                <StaggerContainer staggerDelay={0.1} className="space-y-3.5 sm:space-y-4">
                  {/* SSO Preview Card */}
                  <StaggerItem>
                    <Card className="p-4 sm:p-5 bg-white border border-[#DEDDD6] rounded-xl shadow-xs space-y-3">
                      <span className="text-xs font-semibold text-[#22221F] block">Single Sign On Options</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 rounded-lg border border-[#DEDDD6] flex items-center justify-center space-x-2 text-xs font-medium text-[#22221F] bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                          </svg>
                          <span>Google sign in</span>
                        </div>
                        <div className="p-2.5 rounded-lg border border-[#DEDDD6] flex items-center justify-center space-x-2 text-xs font-medium text-[#22221F] bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#f25022" d="M1 1h10v10H1z"/>
                            <path fill="#7fba00" d="M13 1h10v10H13z"/>
                            <path fill="#00a4ef" d="M1 13h10v10H1z"/>
                            <path fill="#ffb900" d="M13 13h10v10H13z"/>
                          </svg>
                          <span>Microsoft sign in</span>
                        </div>
                      </div>
                    </Card>
                  </StaggerItem>

                  {/* Danger Zone Preview Card */}
                  <StaggerItem>
                    <Card className="p-4 sm:p-5 bg-white border border-red-200/80 rounded-xl shadow-xs space-y-2">
                      <div className="flex items-center space-x-2 text-[#B91C1C]">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-semibold">Danger Zone Account Protection</span>
                      </div>
                      <p className="text-[11px] text-[#68675F]">
                        Permanently delete your account and all associated transactions upon request. Requires typing <strong className="text-[#22221F] font-mono">DELETE</strong> to prevent accidental data loss.
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#68675F]">Zero residual retention</span>
                        <span className="text-[11px] font-medium text-[#B91C1C] border border-red-300 px-2 py-0.5 rounded">
                          Type DELETE to confirm
                        </span>
                      </div>
                    </Card>
                  </StaggerItem>
                </StaggerContainer>
              </ShowcaseContainer>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-14 bg-[#F6F5F2] border-t border-[#DEDDD6]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-md bg-[#1B5E3F] flex items-center justify-center text-white shadow-xs">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm text-[#22221F]">ExpenseHub</span>
            </div>

            <div className="flex items-center space-x-6 text-xs text-[#68675F]">
              <Link to="/login" className="hover:text-[#22221F] transition-colors">
                Sign in
              </Link>
              <Link to="/login?mode=register" className="hover:text-[#22221F] transition-colors">
                Create account
              </Link>
            </div>

            <p className="text-xs text-[#68675F]">
              Personal finance tracking and ledger management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
