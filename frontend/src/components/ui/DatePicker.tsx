import { useState, useRef, useEffect, useCallback } from "react";
import {
  format, parse, isValid, isToday,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isSameDay, addMonths, subMonths, getYear, getMonth,
  setMonth as dfSetMonth, setYear as dfSetYear
} from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DatePickerProps {
  value: string | null | undefined; // "YYYY-MM-DD"
  onChange: (date: string | null) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

type View = "day" | "month" | "year";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MIN_YEAR = 1970;
const MAX_YEAR = 2040;
const YEAR_LIST = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

function isoToLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIso(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function toDisplay(iso: string | null | undefined): string {
  if (!iso) return "";
  try { return format(isoToLocal(iso), "dd/MM/yyyy"); } catch { return ""; }
}

function parseTyped(raw: string): Date | null {
  const s = raw.replace(/[.-]/g, "/");
  for (const f of ["dd/MM/yyyy", "d/M/yyyy", "dd/MM/yy"]) {
    const d = parse(s, f, new Date());
    if (isValid(d) && getYear(d) > 1900) return d;
  }
  return null;
}

function calendarDays(month: Date): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DatePicker({ value, onChange, placeholder = "dd/mm/yyyy", id, className }: DatePickerProps) {
  const [open, setOpen]           = useState(false);
  const [view, setView]           = useState<View>("day");
  const [inputText, setInputText] = useState(toDisplay(value));
  const [navMonth, setNavMonth]   = useState<Date>(value ? isoToLocal(value) : new Date());

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const yearRef      = useRef<HTMLDivElement>(null);

  // Sync display when value changes externally
  useEffect(() => {
    setInputText(toDisplay(value));
    if (value) setNavMonth(isoToLocal(value));
  }, [value]);

  // Scroll selected year into view when year panel opens
  useEffect(() => {
    if (view === "year" && yearRef.current) {
      const cur = yearRef.current.querySelector("[data-selected='true']");
      cur?.scrollIntoView({ block: "center" });
    }
  }, [view]);

  const closePanel = () => { setOpen(false); setView("day"); };

  const commitInput = useCallback((raw: string) => {
    if (!raw.trim()) { onChange(null); return; }
    const d = parseTyped(raw);
    if (d) {
      onChange(toIso(d));
      setInputText(format(d, "dd/MM/yyyy"));
      setNavMonth(d);
    } else {
      setInputText(toDisplay(value)); // revert
    }
  }, [onChange, value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        commitInput(inputText);
        closePanel();
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, inputText, commitInput]);

  // Typed input handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^0-9/]/g, "");
    // Auto-slash: "25" → "25/",  "25/07" → "25/07/"
    if (v.length === 2 && !v.includes("/") && inputText.length === 1) v += "/";
    if (v.length === 5 && v.split("/").length - 1 === 1)               v += "/";
    setInputText(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter")  { commitInput(inputText); closePanel(); }
    if (e.key === "Escape") { setInputText(toDisplay(value)); closePanel(); }
  };

  // Day selection
  const selectDay = (d: Date) => {
    onChange(toIso(d));
    setInputText(format(d, "dd/MM/yyyy"));
    closePanel();
  };

  // Month/year selection
  const selectMonth = (m: number) => { setNavMonth(dfSetMonth(navMonth, m)); setView("day"); };
  const selectYear  = (y: number) => { setNavMonth(dfSetYear(navMonth, y));  setView("day"); };

  const selectedDate = value ? isoToLocal(value) : undefined;
  const days = calendarDays(navMonth);

  return (
    <div ref={containerRef} className={`relative w-full ${className ?? ""}`}>

      {/* ─── Input ─── */}
      <div className={`
        flex items-center h-9 lg:h-10 rounded-xl border bg-surface shadow-sm text-sm
        transition-all duration-150 overflow-hidden
        ${open ? "border-accent ring-2 ring-accent/20" : value ? "border-accent/70" : "border-border"}
        hover:border-accent
      `}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          value={inputText}
          maxLength={10}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={(e) => {
            if (containerRef.current?.contains(e.relatedTarget as Node)) return;
            commitInput(inputText);
          }}
          className="flex-1 h-full px-3 bg-transparent outline-none text-text-primary placeholder:text-text-tertiary"
        />

        {value && (
          <button type="button" tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); onChange(null); setInputText(""); }}
            className="p-1 mr-0.5 text-text-tertiary hover:text-text-primary rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button type="button" tabIndex={-1}
          onMouseDown={(e) => { e.preventDefault(); setOpen(p => !p); if (!open) inputRef.current?.focus(); }}
          className={`h-full px-2.5 border-l border-border transition-colors
            ${open ? "text-accent bg-accent-subtle" : "text-text-secondary hover:text-accent hover:bg-accent-subtle/50"}`}
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {/* ─── Popover ─── */}
      {open && (
        <div
          className="absolute z-50 top-full mt-2 rounded-2xl border border-border bg-surface shadow-2xl shadow-black/10 p-4 w-72"
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => { if (view === "day") setNavMonth(subMonths(navMonth, 1)); }}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-text-secondary hover:bg-hover-row hover:text-text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month button */}
              <button type="button"
                onClick={() => setView(v => v === "month" ? "day" : "month")}
                className={`px-2.5 py-1 rounded-lg text-sm font-semibold transition-colors
                  ${view === "month" ? "bg-accent text-white" : "text-text-primary hover:bg-hover-row"}`}
              >
                {format(navMonth, "MMMM")}
              </button>
              {/* Year button */}
              <button type="button"
                onClick={() => setView(v => v === "year" ? "day" : "year")}
                className={`px-2.5 py-1 rounded-lg text-sm font-semibold transition-colors
                  ${view === "year" ? "bg-accent text-white" : "text-text-primary hover:bg-hover-row"}`}
              >
                {getYear(navMonth)}
              </button>
            </div>

            <button type="button" onClick={() => { if (view === "day") setNavMonth(addMonths(navMonth, 1)); }}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-text-secondary hover:bg-hover-row hover:text-text-primary transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* ── Day grid ── */}
          {view === "day" && (
            <>
              <div className="grid grid-cols-7 mb-1">
                {DAY_HEADERS.map(h => (
                  <div key={h} className="h-8 flex items-center justify-center text-[11px] font-medium text-text-tertiary">{h}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5">
                {days.map((day) => {
                  const outside  = !isSameMonth(day, navMonth);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const today    = isToday(day);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => selectDay(day)}
                      className={`
                        h-8 w-full flex items-center justify-center rounded-lg text-[13px] transition-all duration-100 font-medium
                        ${selected  ? "bg-accent text-white shadow-sm scale-105"
                          : today   ? "border border-accent text-accent hover:bg-accent-subtle"
                          : outside ? "text-text-tertiary/50 hover:text-text-tertiary hover:bg-hover-row"
                                    : "text-text-primary hover:bg-accent-subtle hover:text-accent"}
                      `}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Month grid ── */}
          {view === "month" && (
            <div className="grid grid-cols-3 gap-1.5">
              {MONTH_NAMES.map((name, i) => (
                <button key={name} type="button" onClick={() => selectMonth(i)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors
                    ${getMonth(navMonth) === i
                      ? "bg-accent text-white shadow-sm"
                      : "text-text-secondary hover:bg-accent-subtle hover:text-accent"}`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* ── Year list (scrollable) ── */}
          {view === "year" && (
            <div ref={yearRef} className="h-52 overflow-y-auto overscroll-contain pr-1 scrollbar-thin">
              <div className="grid grid-cols-3 gap-1.5">
                {YEAR_LIST.map((y) => (
                  <button key={y} type="button"
                    data-selected={getYear(navMonth) === y}
                    onClick={() => selectYear(y)}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors
                      ${getYear(navMonth) === y
                        ? "bg-accent text-white shadow-sm"
                        : "text-text-secondary hover:bg-accent-subtle hover:text-accent"}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Today shortcut ── */}
          {view === "day" && (
            <button type="button" onClick={() => selectDay(new Date())}
              className="mt-3 w-full py-1.5 text-xs font-medium text-accent hover:bg-accent-subtle rounded-lg transition-colors border border-border">
              Today
            </button>
          )}
        </div>
      )}
    </div>
  );
}
