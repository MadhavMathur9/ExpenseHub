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
  const s = raw.replace(/[.\-]/g, "/");
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
  }, [open, inputText]);

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
        flex items-center h-9 lg:h-10 rounded-xl border bg-white shadow-sm text-sm
        transition-all duration-150 overflow-hidden
        ${open ? "border-emerald-500 ring-2 ring-emerald-500/20" : value ? "border-emerald-400/70" : "border-gray-200"}
        hover:border-emerald-400
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
          className="flex-1 h-full px-3 bg-transparent outline-none text-gray-800 placeholder-gray-400"
        />

        {value && (
          <button type="button" tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); onChange(null); setInputText(""); }}
            className="p-1 mr-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button type="button" tabIndex={-1}
          onMouseDown={(e) => { e.preventDefault(); setOpen(p => !p); if (!open) inputRef.current?.focus(); }}
          className={`h-full px-2.5 border-l border-gray-100 transition-colors
            ${open ? "text-emerald-600 bg-emerald-50/70" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/50"}`}
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {/* ─── Popover ─── */}
      {open && (
        <div
          className="absolute z-50 top-full mt-2 rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-black/10 p-4 w-72"
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => { if (view === "day") setNavMonth(subMonths(navMonth, 1)); }}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month button */}
              <button type="button"
                onClick={() => setView(v => v === "month" ? "day" : "month")}
                className={`px-2.5 py-1 rounded-lg text-sm font-semibold transition-colors
                  ${view === "month" ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
              >
                {format(navMonth, "MMMM")}
              </button>
              {/* Year button */}
              <button type="button"
                onClick={() => setView(v => v === "year" ? "day" : "year")}
                className={`px-2.5 py-1 rounded-lg text-sm font-semibold transition-colors
                  ${view === "year" ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
              >
                {getYear(navMonth)}
              </button>
            </div>

            <button type="button" onClick={() => { if (view === "day") setNavMonth(addMonths(navMonth, 1)); }}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* ── Day grid ── */}
          {view === "day" && (
            <>
              <div className="grid grid-cols-7 mb-1">
                {DAY_HEADERS.map(h => (
                  <div key={h} className="h-8 flex items-center justify-center text-[11px] font-medium text-gray-400">{h}</div>
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
                        ${selected  ? "bg-emerald-600 text-white shadow-sm scale-105"
                          : today   ? "border border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                          : outside ? "text-gray-300 hover:text-gray-400 hover:bg-gray-50"
                                    : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-800"}
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
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-800"}`}
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
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-800"}`}
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
              className="mt-3 w-full py-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100">
              Today
            </button>
          )}
        </div>
      )}
    </div>
  );
}
