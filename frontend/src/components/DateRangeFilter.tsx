import * as React from "react";
import { format, isValid, getDaysInMonth } from "date-fns";
import { CalendarIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/shadcn-ui/popover";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const START_YEAR = 1936;
const END_YEAR   = 2136;

// Popover width — every view is locked to this
const PICKER_WIDTH = 252; // px

type View = "days" | "months" | "years";

// ─── Digit-by-digit validation ────────────────────────────────────────────────

/**
 * Validate each new digit against positional rules.
 * Returns the updated digit string if valid, or the old string to reject the digit.
 */
function filterNextDigit(prev: string, next: string): string {
  const newDigits = next.replace(/\D/g, "").slice(0, 8);
  if (newDigits.length <= prev.replace(/\D/g, "").length && newDigits.length < prev.replace(/\D/g, "").length) {
    // Deletion — always allow
    return newDigits;
  }

  const d = newDigits;
  const pos = d.length; // 1-indexed position being validated

  // Position 1 — day tens: 0-3
  if (pos >= 1) {
    const dt = parseInt(d[0], 10);
    if (dt > 3) return prev.replace(/\D/g, ""); // reject
  }
  // Position 2 — day units: depends on tens
  if (pos >= 2) {
    const dt = parseInt(d[0], 10);
    const du = parseInt(d[1], 10);
    if (dt === 0 && du === 0) return prev.replace(/\D/g, ""); // day 00 invalid
    if (dt === 3 && du > 1)   return prev.replace(/\D/g, ""); // day 32+ invalid
  }
  // Position 3 — month tens: 0-1
  if (pos >= 3) {
    const mt = parseInt(d[2], 10);
    if (mt > 1) return prev.replace(/\D/g, ""); // reject
  }
  // Position 4 — month units
  if (pos >= 4) {
    const mt = parseInt(d[2], 10);
    const mu = parseInt(d[3], 10);
    if (mt === 0 && mu === 0) return prev.replace(/\D/g, ""); // month 00 invalid
    if (mt === 1 && mu > 2)   return prev.replace(/\D/g, ""); // month 13+ invalid
  }

  return d;
}

/** Build dd/MM/yyyy mask from raw digit string */
function maskDigits(digits: string): string {
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Fully validate 8 digits into a real Date, checking calendar day count */
function validateDate(digits: string): Date | null {
  if (digits.length < 8) return null;
  const day   = parseInt(digits.slice(0, 2), 10);
  const month = parseInt(digits.slice(2, 4), 10) - 1; // 0-indexed
  const year  = parseInt(digits.slice(4, 8), 10);

  if (year < START_YEAR || year > END_YEAR) return null;

  const d = new Date(year, month, day);
  if (
    isValid(d) &&
    d.getDate()     === day &&
    d.getMonth()    === month &&
    d.getFullYear() === year &&
    day <= getDaysInMonth(new Date(year, month))
  ) {
    return d;
  }
  return null;
}

// ─── DateInputField ───────────────────────────────────────────────────────────

interface DateInputProps {
  id: string;
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date | null;
}

function DateInputField({ id, label, value, onChange, minDate }: DateInputProps) {
  const [open, setOpen]      = React.useState(false);
  const [rawDigits, setRaw]  = React.useState(value ? format(value, "ddMMyyyy") : "");
  const [navMonth, setNav]   = React.useState<Date>(value ?? new Date());
  const [view, setView]      = React.useState<View>("days");

  // Derived display value
  const inputText = maskDigits(rawDigits);

  // Is the current raw input an illegal / incomplete date?
  const isError = rawDigits.length === 8 && validateDate(rawDigits) === null;

  // Sync when value changes externally (e.g. "Reset filters")
  React.useEffect(() => {
    setRaw(value ? format(value, "ddMMyyyy") : "");
    if (value) setNav(value);
  }, [value]);

  // Reset to day view when popover closes
  React.useEffect(() => {
    if (!open) setView("days");
  }, [open]);

  // ── Typing ────────────────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDigits = e.target.value.replace(/\D/g, "").slice(0, 8);
    const validated   = filterNextDigit(maskDigits(rawDigits), maskDigits(inputDigits));
    setRaw(validated);

    const parsed = validateDate(validated);
    if (parsed) {
      onChange(parsed);
      setNav(parsed);
    } else if (validated.length === 0) {
      onChange(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Strip trailing auto-slash on backspace
    if (e.key === "Backspace" && (rawDigits.length === 3 || rawDigits.length === 5)) {
      e.preventDefault();
      const shorter = rawDigits.slice(0, -1);
      setRaw(shorter);
      if (shorter.length === 0) onChange(null);
    }
  };

  // ── Calendar ──────────────────────────────────────────────────────────────

  const handleCalendarSelect = (date: Date | undefined) => {
    const d = date ?? null;
    onChange(d);
    setRaw(d ? format(d, "ddMMyyyy") : "");
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRaw("");
    onChange(null);
  };

  // ── Custom Header (consistent width = PICKER_WIDTH) ───────────────────────

  const year  = navMonth.getFullYear();
  const month = navMonth.getMonth();

  const pickerStyle: React.CSSProperties = { width: PICKER_WIDTH };

  const Header = () => {
    // Shared back-button
    const BackBtn = ({ to }: { to: View }) => (
      <button
        onClick={() => setView(to)}
        className="flex items-center gap-1 text-xs font-medium text-[#6B6B68] hover:text-[#1A5F3F] transition-colors px-2 py-1 rounded-md hover:bg-[#EAF3EE]"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Back
      </button>
    );

    if (view === "months") {
      return (
        <div style={pickerStyle} className="p-3 box-border font-sans">
          <div className="flex items-center justify-between mb-3">
            <BackBtn to="days" />
            <span className="text-sm font-semibold text-[#0A0A0A]">{year}</span>
            <div style={{ width: 52 }} />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTH_SHORT.map((m, i) => (
              <button
                key={m}
                onClick={() => { setNav(new Date(year, i, 1)); setView("days"); }}
                className={cn(
                  "h-9 rounded-lg text-sm font-medium transition-all",
                  i === month
                    ? "bg-[#1A5F3F] text-white shadow-sm"
                    : "text-[#0A0A0A] hover:bg-[#EAF3EE] hover:text-[#1A5F3F]"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (view === "years") {
      const years = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);
      return (
        <div style={pickerStyle} className="p-3 box-border font-sans">
          <div className="flex items-center justify-between mb-3">
            <BackBtn to="days" />
            <span className="text-sm font-semibold text-[#0A0A0A]">Select Year</span>
            <div style={{ width: 52 }} />
          </div>
          {/* Fixed-height scrollable grid */}
          <div className="grid grid-cols-4 gap-1 h-48 overflow-y-auto pr-0.5">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => { setNav(new Date(y, month, 1)); setView("days"); }}
                className={cn(
                  "h-9 rounded-lg text-sm font-medium transition-all",
                  y === year
                    ? "bg-[#1A5F3F] text-white shadow-sm"
                    : "text-[#0A0A0A] hover:bg-[#EAF3EE] hover:text-[#1A5F3F]"
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // "days" nav bar
    return (
      <div
        style={pickerStyle}
        className="flex items-center justify-between px-3 pt-3 pb-0 box-border font-sans"
      >
        <button
          onClick={() => setNav(new Date(year, month - 1, 1))}
          className="h-7 w-7 flex items-center justify-center rounded-md text-[#6B6B68] hover:bg-[#F5F5F4] hover:text-[#0A0A0A] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView("months")}
            className="text-sm font-semibold text-[#0A0A0A] hover:text-[#1A5F3F] px-2 py-0.5 rounded-md hover:bg-[#EAF3EE] transition-colors"
          >
            {format(navMonth, "MMMM")}
          </button>
          <button
            onClick={() => setView("years")}
            className="text-sm font-semibold text-[#0A0A0A] hover:text-[#1A5F3F] px-2 py-0.5 rounded-md hover:bg-[#EAF3EE] transition-colors"
          >
            {year}
          </button>
        </div>
        <button
          onClick={() => setNav(new Date(year, month + 1, 1))}
          className="h-7 w-7 flex items-center justify-center rounded-md text-[#6B6B68] hover:bg-[#F5F5F4] hover:text-[#0A0A0A] transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">
      {/* Match site Label component exactly: text-[12px] font-medium text-text-secondary tracking-[0.01em] mb-1.5 */}
      <label htmlFor={id} className="text-[12px] font-medium text-text-secondary tracking-[0.01em] mb-1.5 block">
        {label}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative">
            <input
              id={id}
              type="text"
              inputMode="numeric"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="dd/mm/yyyy"
              className={cn(
                "h-9 lg:h-10 w-full rounded-[6px] border bg-surface px-3 py-2 pr-16 text-sm text-text-primary",
                "placeholder:text-text-tertiary transition-colors duration-150",
                "focus:outline-none focus:ring-2",
                isError
                  ? "border-red-400 focus:border-red-500 focus:ring-red-400/20"
                  : "border-[#EAEAE8] hover:border-[#DCDCD9] focus:border-[#1A5F3F] focus:ring-[#1A5F3F]/20"
              )}
            />
            {isError && (
              <span className="absolute -bottom-4 left-0 text-[10px] text-red-500 font-medium">
                Invalid date
              </span>
            )}

            {/* Clear */}
            {rawDigits.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                tabIndex={-1}
                aria-label="Clear date"
                className="absolute right-8 top-1/2 -translate-y-1/2 text-[#9C9C98] hover:text-[#6B6B68] transition-colors cursor-pointer focus:outline-none"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Calendar toggle */}
            <button
              type="button"
              tabIndex={-1}
              aria-label="Open date picker"
              onClick={() => setOpen((o) => !o)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9C9C98] hover:text-[#1A5F3F] transition-colors cursor-pointer focus:outline-none"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </div>
        </PopoverAnchor>

        <PopoverContent
          style={{ width: PICKER_WIDTH }}
          className="p-0 shadow-xl border border-[#EAEAE8] rounded-xl overflow-hidden"
          align="start"
          sideOffset={8}
          avoidCollisions
          collisionPadding={16}
        >
          <Header />

          {view === "days" && (
            <DayPicker
              mode="single"
              selected={value ?? undefined}
              onSelect={handleCalendarSelect}
              month={navMonth}
              onMonthChange={setNav}
              disabled={[
                ...(minDate ? [{ before: minDate }] : []),
                { before: new Date(START_YEAR, 0, 1) },
                { after: new Date(END_YEAR, 11, 31) },
              ]}
              showOutsideDays
              style={{ width: PICKER_WIDTH, fontFamily: "Inter, system-ui, sans-serif" }}
              className="p-3 pt-2"
              classNames={{
                month_caption: "hidden",
                nav:           "hidden",
                month_grid:    "w-full border-collapse",
                weekdays:      "flex",
                weekday:       "flex-1 text-center text-[11px] font-semibold text-[#9C9C98] pb-1 select-none",
                week:          "flex mt-0.5",
                day:           "flex-1 flex items-center justify-center p-0",
                day_button:    cn(
                  "h-8 w-8 rounded-md text-sm font-normal text-[#0A0A0A] transition-colors",
                  "hover:bg-[#EAF3EE] hover:text-[#1A5F3F]",
                  "focus:outline-none focus:ring-2 focus:ring-[#1A5F3F]/30"
                ),
                selected: "bg-[#1A5F3F]! text-white! rounded-md font-semibold",
                today:    "border border-[#1A5F3F] text-[#1A5F3F] rounded-md font-semibold",
                outside:  "opacity-30",
                disabled: "opacity-25 cursor-not-allowed pointer-events-none",
              }}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─── Public DateRangeFilter ───────────────────────────────────────────────────

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <div className="flex-1 min-w-0">
        <DateInputField
          id="filter-start-date"
          label="Start Date"
          value={startDate}
          onChange={onStartDateChange}
        />
      </div>
      <div className="flex-1 min-w-0">
        <DateInputField
          id="filter-end-date"
          label="End Date"
          value={endDate}
          onChange={onEndDateChange}
          minDate={startDate}
        />
      </div>
    </div>
  );
}
