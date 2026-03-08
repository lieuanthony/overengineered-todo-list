'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';

interface DatePickerProps {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  inputStyle?: React.CSSProperties;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Set due date',
  inputStyle,
}: DatePickerProps) {
  const theme = useTheme();
  const bg = theme.palette.background.default;
  const paper = theme.palette.background.paper;
  const text = theme.palette.text.primary;
  const muted = theme.palette.text.secondary;
  const border = theme.palette.divider;
  const accent = theme.palette.primary.main;

  const today = new Date();
  const parsed = value ? new Date(value + 'T00:00:00') : null;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleSelect = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const displayValue = parsed
    ? parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1,
  );

  const isSelected = (day: number) =>
    parsed &&
    parsed.getFullYear() === viewYear &&
    parsed.getMonth() === viewMonth &&
    parsed.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  const navBtn = (onClick: () => void, children: React.ReactNode) => (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: muted,
        padding: '4px 8px',
        borderRadius: 6,
        fontFamily: 'inherit',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = text)}
      onMouseLeave={(e) => (e.currentTarget.style.color = muted)}
    >
      {children}
    </button>
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger input */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          ...inputStyle,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          background: bg,
          border: `1px solid ${open ? accent : border}`,
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: 12,
          color: displayValue ? text : muted,
          fontFamily: 'inherit',
          transition: 'border-color 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {displayValue || placeholder}
        {displayValue && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            style={{ marginLeft: 2, color: muted, lineHeight: 1, fontSize: 14, cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = muted)}
          >
            ×
          </span>
        )}
      </button>

      {/* Calendar popover */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            background: paper,
            border: `1px solid ${border}`,
            borderRadius: 12,
            padding: 16,
            width: 240,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          }}
        >
          {/* Month/year nav */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            {navBtn(
              prevMonth,
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>,
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: text, fontFamily: 'inherit' }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            {navBtn(
              nextMonth,
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>,
            )}
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {DAYS.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: 'center',
                  fontSize: 11,
                  color: muted,
                  fontFamily: 'inherit',
                  padding: '2px 0',
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((day, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {day === null ? null : (
                  <button
                    type="button"
                    onClick={() => handleSelect(day)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      border: 'none',
                      fontSize: 12,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      background: isSelected(day) ? accent : 'transparent',
                      color: isSelected(day) ? '#fff' : isToday(day) ? accent : text,
                      fontWeight: isToday(day) ? 600 : 400,
                      outline: isToday(day) && !isSelected(day) ? `1.5px solid ${accent}` : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected(day)) e.currentTarget.style.background = border;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected(day)) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Clear / Today footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 12,
              paddingTop: 10,
              borderTop: `1px solid ${border}`,
            }}
          >
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              style={{
                fontSize: 11,
                color: muted,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = muted)}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth());
              }}
              style={{
                fontSize: 11,
                color: accent,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                padding: 0,
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
